#!/usr/bin/env node
/* Generate per-page Open Graph share cards (1200x630) that match the brand.
 * Writes og-<key>.svg + og-<key>.png for each page. Re-run after changing copy:
 *   node build-og.js     (requires rsvg-convert on PATH)
 */
const fs = require("fs");
const { execSync } = require("child_process");

const FONT = "Inter, Arial, Helvetica, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// accent palettes that read on the dark slate background
const TEAL = { line: "#5fd0d8", fill: "#13929e", text: "#5fd0d8" };
const G0 = { line: "#3ddc97", fill: "#3ddc97", text: "#3ddc97" };
const G1 = { line: "#2bb673", fill: "#2bb673", text: "#2bb673" };
const G2 = { line: "#f0a830", fill: "#f0a830", text: "#f0a830" };
const G3 = { line: "#ff5d77", fill: "#ff5d77", text: "#ff5d77" };

// key -> card. head = 1–2 headline lines; size = headline font px; badge = big glyph (optional)
const CARDS = {
  home: { eyebrow: "CALIBRATED OVERSIGHT FOR AI AGENTS", head: ["Decide how much human oversight", "each AI action needs."], size: 54, sub: "", method: true, accent: TEAL },
  playbook: { eyebrow: "THE PLAYBOOK · FOR PRACTITIONERS", head: ["The hands-on field guide"], size: 66, sub: "Grade each AI action, guard it, design the review, prove it works.", method: true, accent: TEAL },
  framework: { eyebrow: "THE FRAMEWORK · SECTIONS 0–10", head: ["The full method"], size: 70, sub: "Consequence × controllability, grades, the autonomy ladder, validation.", method: true, accent: TEAL },
  codex: { eyebrow: "THE CODEX · THE EVIDENCE", head: ["366 annotated sources"], size: 66, sub: "Aviation, medicine, finance, AI safety, HCI — every claim, traced.", method: false, accent: TEAL, badge: "366", badgeSize: 92 },
  cheatsheet: { eyebrow: "ONE-PAGE CHEAT SHEET", head: ["The whole method,", "on one page."], size: 58, sub: "Print it for your wall or your team channel.", method: true, accent: TEAL },
  "guide-g0": { eyebrow: "CONSEQUENCE GRADE", head: ["Trivial actions"], size: 66, sub: "Why a human in the loop is the wrong default here.", accent: G0, badge: "G0" },
  "guide-g1": { eyebrow: "CONSEQUENCE GRADE", head: ["Low-consequence", "actions"], size: 60, sub: "Act, then notify — reversibility beats a confirmation prompt.", accent: G1, badge: "G1" },
  "guide-g2": { eyebrow: "CONSEQUENCE GRADE", head: ["High-consequence", "actions"], size: 60, sub: "When review actually pays off — and how to make it catch mistakes.", accent: G2, badge: "G2" },
  "guide-g3": { eyebrow: "CONSEQUENCE GRADE", head: ["Critical actions"], size: 66, sub: "When review becomes a rubber stamp — what to prevent instead.", accent: G3, badge: "G3" },
  "rail-reversible": { eyebrow: "RAIL · THE FOUR PROPERTIES", head: ["Reversible"], size: 74, sub: "Make actions undoable or contained, so stop-and-ask stays rare.", accent: TEAL, badge: "R" },
  "rail-authorized": { eyebrow: "RAIL · THE FOUR PROPERTIES", head: ["Authorized"], size: 74, sub: "Least privilege, and maker-checker for high-stakes actions.", accent: TEAL, badge: "A" },
  "rail-interruptible": { eyebrow: "RAIL · THE FOUR PROPERTIES", head: ["Interruptible"], size: 70, sub: "Kill switches and blame-free stops so anyone can halt an agent.", accent: TEAL, badge: "I" },
  "rail-logged": { eyebrow: "RAIL · THE FOUR PROPERTIES", head: ["Logged"], size: 74, sub: "Identity, sub-agent provenance, tamper-evident proof of oversight.", accent: TEAL, badge: "L" },
  "article-what-is-human-in-the-loop": { eyebrow: "LOOPRAILS · ARTICLE", head: ["What is", "human-in-the-loop?"], size: 60, sub: "A practical guide to HITL for AI agents.", method: false, accent: TEAL },
  "article-hitl-ai-safety": { eyebrow: "LOOPRAILS · ARTICLE", head: ["Does human-in-the-loop", "improve AI safety?"], size: 52, sub: "What the evidence actually says.", method: false, accent: TEAL },
  "article-in-the-loop-vs-on-the-loop": { eyebrow: "LOOPRAILS · ARTICLE", head: ["In-the-loop vs", "on-the-loop"], size: 58, sub: "…and out-of-the-loop, explained.", method: false, accent: TEAL },
  "article-ai-agent-approval": { eyebrow: "LOOPRAILS · ARTICLE", head: ["When should an agent", "ask for approval?"], size: 50, sub: "Build gates that aren't rubber stamps.", method: false, accent: TEAL },
  "article-lethal-trifecta": { eyebrow: "LOOPRAILS · ARTICLE", head: ["The lethal trifecta"], size: 64, sub: "How AI agents leak data — and how to stop it.", method: false, accent: G3 },
  "article-ai-agent-guardrails": { eyebrow: "LOOPRAILS · ARTICLE", head: ["AI agent guardrails"], size: 62, sub: "A practical checklist.", method: false, accent: TEAL },
  "article-ai-agent-autonomy-levels": { eyebrow: "LOOPRAILS · ARTICLE", head: ["AI agent", "autonomy levels"], size: 58, sub: "The L0–L6 ladder, and how to choose.", method: false, accent: TEAL },
  "article-prompt-injection-prevention": { eyebrow: "LOOPRAILS · ARTICLE", head: ["Prompt injection", "prevention"], size: 58, sub: "Defense in depth for AI agents.", method: false, accent: G3 },
  "article-maker-checker-ai": { eyebrow: "LOOPRAILS · ARTICLE", head: ["Maker-checker", "for AI agents"], size: 58, sub: "Four-eyes for irreversible actions.", method: false, accent: TEAL },
  "article-automation-bias": { eyebrow: "LOOPRAILS · ARTICLE", head: ["Automation bias"], size: 64, sub: "Why people rubber-stamp AI.", method: false, accent: G2 },
  "article-ai-kill-switch": { eyebrow: "LOOPRAILS · ARTICLE", head: ["The AI kill switch"], size: 64, sub: "Stop everything — fast and blame-free.", method: false, accent: G3 },
};

function svg(c) {
  const a = c.accent;
  const twoLine = c.head.length > 1;
  const headStartY = twoLine ? 296 : 326;
  const headLines = c.head.map((t, i) =>
    `<text x="80" y="${headStartY + i * (c.size + 8)}" font-family="${FONT}" font-weight="bold" font-size="${c.size}" fill="#ffffff" letter-spacing="-1">${esc(t)}</text>`
  ).join("\n  ");
  const subY = (twoLine ? headStartY + 2 * (c.size + 8) : headStartY) + 50;
  const subEl = c.sub ? `<text x="82" y="${subY}" font-family="${FONT}" font-size="28" fill="#b9cdd2">${esc(c.sub)}</text>` : "";
  const methodEl = c.method ? `<text x="82" y="466" font-family="${FONT}" font-weight="bold" font-size="28" letter-spacing="1" fill="${a.text}">Grade · Guard · Show · Prove</text>` : "";

  let badgeEl = "";
  if (c.badge) {
    const bx = 858, by = 156, bw = 252, bh = 252, cx = bx + bw / 2, cy = by + bh / 2;
    const bs = c.badgeSize || 130;
    badgeEl = `
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="30" fill="${a.fill}" fill-opacity="0.13" stroke="${a.line}" stroke-width="3"/>
  <text x="${cx}" y="${cy + bs * 0.35}" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="${bs}" fill="${a.text}" letter-spacing="-2">${esc(c.badge)}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1620"/><stop offset="1" stop-color="#16242e"/></linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.0" r="0.85"><stop offset="0" stop-color="${a.fill}" stop-opacity="0.26"/><stop offset="1" stop-color="${a.fill}" stop-opacity="0"/></radialGradient>
    <pattern id="ties" width="74" height="40" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="40" fill="#22333d"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="80" y="66" width="64" height="64" rx="15" fill="#0e7c86"/>
  <g stroke="#ffffff" stroke-width="5" stroke-linecap="round">
    <line x1="99" y1="80" x2="99" y2="116"/><line x1="125" y1="80" x2="125" y2="116"/>
    <line x1="90" y1="90" x2="134" y2="90"/><line x1="90" y1="106" x2="134" y2="106"/>
  </g>
  <text x="164" y="117" font-family="${FONT}" font-weight="bold" font-size="46" fill="#ffffff" letter-spacing="-1">LoopRails</text>
  <text x="82" y="212" font-family="${FONT}" font-weight="bold" font-size="22" letter-spacing="4" fill="${a.text}">${esc(c.eyebrow)}</text>
  ${headLines}
  ${subEl}
  ${methodEl}${badgeEl}
  <g>
    <rect x="80" y="512" width="1040" height="40" fill="url(#ties)"/>
    <rect x="80" y="512" width="1040" height="4" rx="2" fill="#2c4855"/>
    <rect x="80" y="548" width="1040" height="4" rx="2" fill="#2c4855"/>
    <rect x="300" y="514" width="64" height="34" rx="9" fill="#13929e"/>
    <circle cx="332" cy="531" r="5" fill="#bff3f6"/>
    <rect x="1096" y="504" width="9" height="56" rx="3" fill="#f0b429"/>
  </g>
  <text x="80" y="600" font-family="${FONT}" font-size="24" fill="#8aa6ad">looprails.dev</text>
  <text x="1120" y="600" text-anchor="end" font-family="${FONT}" font-size="24" fill="#8aa6ad">by Brenn Hill</text>
</svg>
`;
}

let made = [];
for (const [key, card] of Object.entries(CARDS)) {
  const base = key === "home" ? "og" : "og-" + key;
  fs.writeFileSync(base + ".svg", svg(card));
  execSync(`rsvg-convert "${base}.svg" -o "${base}.png"`);
  made.push(base + ".png");
}
console.log("Generated " + made.length + " OG cards:\n  " + made.join("\n  "));
