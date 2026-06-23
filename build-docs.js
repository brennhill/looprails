#!/usr/bin/env node
/* LoopRails static-docs build.
 * Renders each markdown doc into a crawlable, no-JS-required HTML page with
 * per-page <title>/description/OG, a server-rendered table of contents,
 * heading anchors, and (for the codex) [ref] anchors so citations are linkable.
 * Re-run after editing any .md:  node build-docs.js
 */
const fs = require("fs");
const path = require("path");
const { parse } = require("./vendor/marked.min.js");

const SITE = "https://looprails.dev";
const BEACON = `<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "43e10ad738e241ab93d08ec0cee965e6"}'></script><!-- End Cloudflare Web Analytics -->`;

// key -> source md, output html, nav label, per-page description
const DOCS = {
  playbook:           { md: "playbook.md",            out: "playbook.html",            label: "Playbook",      nav: true,
    desc: "The LoopRails practitioner field guide: grade each AI agent action, guard it, design the review moment, and prove the oversight actually catches mistakes." },
  framework:          { md: "framework.md",           out: "framework.html",           label: "Framework",     nav: true,
    desc: "The full LoopRails framework: the consequence-vs-controllability model, grades G0–G3, the autonomy ladder, the anatomy of an oversight moment, and how to validate it." },
  codex:              { md: "codex.md",               out: "codex.html",               label: "Codex",         nav: true,
    desc: "366 annotated sources on human oversight of automation and AI — aviation, medicine, finance, AI safety, and HCI. The evidence base behind LoopRails." },
  "guide-g0":         { md: "guide-g0.md",            out: "guide-g0.html",            label: "G0 · Trivial",
    desc: "G0 (trivial) AI agent actions: why putting a human in the loop is the wrong default here, and how to let low-stakes actions run safely and logged." },
  "guide-g1":         { md: "guide-g1.md",            out: "guide-g1.html",            label: "G1 · Low",
    desc: "G1 (low-consequence) AI actions: act-then-notify with easy undo — why reversibility beats a confirmation prompt, and how to design it." },
  "guide-g2":         { md: "guide-g2.md",            out: "guide-g2.html",            label: "G2 · High",
    desc: "G2 (high-consequence) AI actions: when human review actually pays off, and how to design the review so it catches mistakes instead of rubber-stamping." },
  "guide-g3":         { md: "guide-g3.md",            out: "guide-g3.html",            label: "G3 · Critical",
    desc: "G3 (critical) AI actions: irreversible, high-blast-radius operations — why review degrades into a rubber stamp, and what to prevent-by-design instead." },
  "rail-reversible":  { md: "rail-reversible.md",     out: "rail-reversible.html",     label: "Reversible",
    desc: "Reversible — the R in RAIL: make AI agent actions undoable or contained so you rarely need a stop-and-ask gate." },
  "rail-authorized":  { md: "rail-authorized.md",     out: "rail-authorized.html",     label: "Authorized",
    desc: "Authorized — the A in RAIL: least-privilege permissions and maker-checker separation for AI agent actions." },
  "rail-interruptible":{ md: "rail-interruptible.md", out: "rail-interruptible.html",  label: "Interruptible",
    desc: "Interruptible — the I in RAIL: kill switches, monitors, and blame-free stops so anyone can halt an AI agent in time." },
  "rail-logged":      { md: "rail-logged.md",         out: "rail-logged.html",         label: "Logged",
    desc: "Logged — the L in RAIL: identity providers, sub-agent provenance, and tamper-evident records that let you prove oversight works." },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stripTags = (s) => s.replace(/<[^>]+>/g, "");
const slug = (s) => stripTags(s).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);

function styleBlock() {
  return `<style>
:root{
  --ink:#0d1117;--ink-2:#33404d;--muted:#5b6b7a;--line:#e3e6ea;
  --bg:#fff;--bg-2:#f6f8f9;--rail:#0e7c86;--rail-2:#0b5e66;--rail-tint:#e3f3f4;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --sans:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.6}
a{color:var(--rail);text-decoration:none}a:hover{text-decoration:underline}
.topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:16px;padding:11px 20px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:9px;font-weight:800;letter-spacing:-.02em;color:var(--ink)}
.brand:hover{text-decoration:none}
.docpick{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
.docpick a{font-size:.88rem;font-weight:600;color:var(--ink-2);padding:6px 12px;border-radius:8px;border:1px solid transparent}
.docpick a.on{background:var(--rail);color:#fff}
.docpick a:hover{text-decoration:none;border-color:var(--line)}
.layout{display:grid;grid-template-columns:270px 1fr;gap:0;max-width:1280px;margin:0 auto}
@media(max-width:920px){.layout{grid-template-columns:1fr}.toc{display:none}}
.toc{position:sticky;top:53px;align-self:start;height:calc(100vh - 53px);overflow:auto;padding:24px 14px 60px 22px;border-right:1px solid var(--line)}
.toc .tt{font-family:var(--mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
.toc a{display:block;font-size:.85rem;color:var(--ink-2);padding:3px 0;border-left:2px solid transparent;padding-left:10px;margin-left:-2px}
.toc a:hover{color:var(--rail);text-decoration:none}
.toc a.h3{padding-left:22px;font-size:.8rem;color:var(--muted)}
.toc a.active{color:var(--rail);border-left-color:var(--rail);font-weight:600}
.content{padding:34px 40px 120px;min-width:0;max-width:860px}
@media(max-width:640px){.content{padding:24px 20px 90px}}
.md h1{font-size:2rem;letter-spacing:-.02em;margin:.2em 0 .5em;line-height:1.15}
.md h2{font-size:1.5rem;letter-spacing:-.01em;margin:1.7em 0 .5em;padding-top:.4em;border-top:1px solid var(--line)}
.md h3{font-size:1.16rem;margin:1.4em 0 .4em}
.md h4{font-size:1rem;margin:1.2em 0 .3em;color:var(--ink-2)}
.md p{margin:0 0 1em}
.md ul,.md ol{padding-left:1.3em;margin:0 0 1em}
.md li{margin:.25em 0}
.md blockquote{margin:1em 0;padding:.6em 1em;border-left:3px solid var(--rail);background:var(--rail-tint);border-radius:0 8px 8px 0;color:var(--ink-2)}
.md blockquote p{margin:.3em 0}
.md code{font-family:var(--mono);font-size:.86em;background:var(--bg-2);padding:2px 6px;border-radius:5px;border:1px solid var(--line)}
.md pre{background:#0c1620;color:#dfeef0;padding:16px;border-radius:10px;overflow:auto;font-size:.82rem;line-height:1.45}
.md pre code{background:none;border:none;padding:0;color:inherit}
.md a{font-weight:500}
.md hr{border:none;border-top:1px solid var(--line);margin:2em 0}
.md table{border-collapse:collapse;width:100%;margin:0 0 1.3em;font-size:.9rem;display:block;overflow-x:auto}
.md th,.md td{border:1px solid var(--line);padding:8px 11px;text-align:left;vertical-align:top}
.md th{background:var(--bg-2);font-weight:700}
.md tr:nth-child(even) td{background:#fafbfc}
.md img{max-width:100%}
.md strong{font-weight:700}
.md strong[id]{scroll-margin-top:64px}
.md strong[id]:target{background:#fff3bf;border-radius:4px;padding:1px 4px;box-shadow:0 0 0 4px #fff3bf}
.md h1[id],.md h2[id],.md h3[id]{scroll-margin-top:64px}
.gh-link{display:inline-block;margin:8px 0 24px;font-size:.85rem;font-family:var(--mono)}
.crumb{font-size:.85rem;color:var(--muted);margin:0 0 4px}
footer{border-top:1px solid var(--line);padding:22px;color:var(--muted);font-size:.85rem;display:flex;gap:16px;flex-wrap:wrap;justify-content:space-between;max-width:1280px;margin:0 auto}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>`;
}

const BRAND_SVG = `<svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0e7c86"/><g stroke="#fff" stroke-width="2.4" stroke-linecap="round"><line x1="9" y1="6" x2="9" y2="26"/><line x1="23" y1="6" x2="23" y2="26"/><line x1="6" y1="12" x2="26" y2="12"/><line x1="6" y1="20" x2="26" y2="20"/></g></svg>`;

function injectHeadingIds(html) {
  const seen = {};
  return html.replace(/<(h[123])>([\s\S]*?)<\/\1>/g, (m, tag, inner) => {
    let id = slug(inner) || "section";
    if (seen[id]) { seen[id]++; id = id + "-" + seen[id]; } else { seen[id] = 1; }
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
}

// add id="ref-X-n" to each bibliography entry start ( <strong>[A-12] ... )
function injectRefAnchors(html) {
  return html.replace(/<strong>\[([A-Za-z]+-\d+)\]/g, (m, tag) => `<strong id="ref-${tag}">[${tag}]`);
}

function buildTOC(html) {
  const heads = [];
  const re = /<(h[23]) id="([^"]+)">([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = re.exec(html))) {
    const label = stripTags(m[3]).replace(/^[0-9.IVX]+\s*[—.]?\s*/, "").trim();
    heads.push({ tag: m[1], id: m[2], label });
  }
  if (!heads.length) return "";
  return heads.map(h => `<a href="#${h.id}" class="${h.tag === "h3" ? "h3" : ""}" data-id="${h.id}">${esc(h.label)}</a>`).join("");
}

function navHTML(currentKey) {
  return Object.entries(DOCS).filter(([, d]) => d.nav)
    .map(([k, d]) => `<a href="${d.out}" class="${k === currentKey ? "on" : ""}">${d.label}</a>`).join("");
}

function page(key, d, contentHTML, toc) {
  const title = `${stripTags(d.label).replace(/ ·.*/, "")} — LoopRails`;
  const url = `${SITE}/${d.out}`;
  const ogimg = `${SITE}/og-${key}.png`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(d.desc)}">
<meta name="author" content="Brenn Hill">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(d.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogimg}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(d.desc)}">
<meta name="twitter:image" content="${ogimg}">
<link rel="icon" href="favicon.ico?v=2" sizes="32x32">
<link rel="icon" href="favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png?v=2">
<link rel="manifest" href="site.webmanifest">
<meta name="theme-color" content="#0e7c86">
${styleBlock()}
</head>
<body>
<div class="topbar">
  <a class="brand" href="index.html">${BRAND_SVG} LoopRails</a>
  <nav class="docpick">${navHTML(key)}</nav>
</div>
<div class="layout">
  <aside class="toc"><div class="tt">On this page</div><div id="toc">${toc}</div></aside>
  <main class="content">
    <div class="crumb"><a href="index.html">LoopRails</a> · ${esc(stripTags(d.label))}</div>
    <div id="md" class="md">
      <a class="gh-link" href="https://github.com/brennhill/looprails/blob/main/${d.md}">View ${d.md} on GitHub ↗</a>
      ${contentHTML}
    </div>
  </main>
</div>
<footer>
  <span>© 2026 <a href="https://www.linkedin.com/in/brennhill/">Brenn Hill</a> · all rights reserved</span>
  <span><a href="index.html">Home</a> · <a href="https://github.com/brennhill/looprails">GitHub</a> · <a href="https://www.linkedin.com/in/brennhill/">LinkedIn</a></span>
</footer>
<script>
(function(){
  var heads=[].slice.call(document.querySelectorAll("#md h2[id],#md h3[id]"));
  var links=[].slice.call(document.querySelectorAll("#toc a"));
  if(!heads.length||!links.length) return;
  var spy=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){links.forEach(function(a){a.classList.toggle("active",a.getAttribute("data-id")===e.target.id);});}
  });},{rootMargin:"-60px 0px -75% 0px"});
  heads.forEach(function(h){spy.observe(h);});
})();
</script>
${BEACON}
</body>
</html>
`;
}

let built = [];
for (const [key, d] of Object.entries(DOCS)) {
  const src = fs.readFileSync(path.join(__dirname, d.md), "utf8");
  let html = parse(src, { gfm: true, breaks: false });
  html = injectHeadingIds(html);
  if (key === "codex") html = injectRefAnchors(html);
  const toc = buildTOC(html);
  fs.writeFileSync(path.join(__dirname, d.out), page(key, d, html, toc));
  built.push(d.out);
}

// sitemap + robots
const urls = ["", "cheatsheet.html", ...Object.values(DOCS).map(d => d.out)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}/${u}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(__dirname, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log("Built " + built.length + " doc pages:\n  " + built.join("\n  "));
console.log("Wrote sitemap.xml + robots.txt");
