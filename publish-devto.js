#!/usr/bin/env node
/* Publish LoopRails articles to dev.to (Forem API), canonical-pointing back to
 * looprails.dev so Google credits the original and dev.to is pure distribution.
 *
 * Setup once:  dev.to → Settings → Extensions → "DEV Community API Keys" → Generate
 * Then:        export DEVTO_API_KEY=xxxxxxxx
 *
 * Usage:
 *   node publish-devto.js --dry                 # convert + preview, no network, writes devto-preview/
 *   node publish-devto.js                       # publish the cornerstone set as DRAFTS
 *   node publish-devto.js --publish             # cornerstone set, LIVE
 *   node publish-devto.js --all                 # all articles, as drafts
 *   node publish-devto.js --all --publish       # all articles, LIVE
 *   node publish-devto.js article-lethal-trifecta article-ai-kill-switch   # specific keys
 *
 * Re-running updates the existing dev.to post (tracked in devto-state.json) instead
 * of creating a duplicate — so edit a .md, re-run, and the dev.to copy updates too.
 */
const fs = require("fs");
const path = require("path");

const SITE = "https://looprails.dev";
const API = "https://dev.to/api/articles";
const KEY = process.env.DEVTO_API_KEY;
const STATE_FILE = path.join(__dirname, "devto-state.json");
const PREVIEW_DIR = path.join(__dirname, "devto-preview");

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const PUBLISH = args.includes("--publish");
const ALL = args.includes("--all");
const explicitKeys = args.filter(a => a.startsWith("article-")).map(a => a.replace(/\.(md|html)$/, ""));

// strongest top-of-funnel pieces to seed dev.to with first (avoids a 30-post dump
// on a fresh account, which reads as spam and trips rate limits)
const CORNERSTONE = [
  "article-what-is-human-in-the-loop",
  "article-what-is-agentic-ai",
  "article-hitl-ai-safety",
  "article-ai-agent-approval",
  "article-lethal-trifecta",
  "article-hitl-coding-agents",
];

// dev.to allows up to 4 tags, lowercase alphanumeric only
const DEFAULT_TAGS = ["ai", "machinelearning", "llm", "programming"];
const TAG_OVERRIDES = {
  "article-lethal-trifecta": ["ai", "security", "llm", "programming"],
  "article-prompt-injection-prevention": ["ai", "security", "llm", "programming"],
  "article-llm-agent-skills-credential-leak": ["ai", "security", "llm", "programming"],
  "article-ai-agent-sandboxing": ["ai", "security", "llm", "devops"],
  "article-least-privilege-ai-agents": ["ai", "security", "llm", "programming"],
  "article-hitl-deployments": ["ai", "devops", "llm", "programming"],
  "article-hitl-database-operations": ["ai", "database", "llm", "programming"],
  "article-hitl-machine-learning": ["ai", "machinelearning", "datascience", "llm"],
};

const allArticleKeys = fs.readdirSync(__dirname)
  .filter(f => /^article-.*\.md$/.test(f))
  .map(f => f.replace(/\.md$/, ""))
  .sort();

let keys;
if (explicitKeys.length) keys = explicitKeys;
else if (ALL) keys = allArticleKeys;
else keys = CORNERSTONE;
keys = keys.filter(k => { const ok = allArticleKeys.includes(k); if (!ok) console.warn("skip (no .md):", k); return ok; });

const loadState = () => { try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch { return {}; } };
const saveState = (s) => fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2) + "\n");

// turn a LoopRails article .md into a dev.to-ready body
function convert(key) {
  const raw = fs.readFileSync(path.join(__dirname, key + ".md"), "utf8");
  const canonical = `${SITE}/${key}.html`;
  const cover = `${SITE}/og-${key}.png`;

  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : key;

  // strip the leading H1 (dev.to renders the title separately)
  let body = raw.replace(/^#\s+.+\n+/, "");

  // rewrite relative .html links to absolute looprails.dev URLs
  body = body.replace(/\]\((?!https?:|#|mailto:)([^)\s]+\.html[^)\s]*)\)/g, `](${SITE}/$1)`);

  // description = first real paragraph, de-marked, ~155 chars
  const firstPara = (body.split(/\n\s*\n/).find(b => b.trim() && !b.trim().startsWith("#")) || "").trim();
  let desc = firstPara.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`>#]/g, "").replace(/\s+/g, " ").trim();
  if (desc.length > 155) desc = desc.slice(0, 152).replace(/\s+\S*$/, "") + "…";

  // canonical back-link footer for readers (canonical_url already handles SEO)
  body += `\n\n---\n\n*Originally published at [${canonical.replace(/^https?:\/\//, "")}](${canonical}). ` +
    `[LoopRails](${SITE}) is a free, sourced framework for designing human-in-the-loop oversight of AI agents.*\n`;

  return { title, body_markdown: body, canonical_url: canonical, main_image: cover,
    description: desc, tags: TAG_OVERRIDES[key] || DEFAULT_TAGS };
}

async function send(method, url, payload) {
  const res = await fetch(url, {
    method,
    headers: { "api-key": KEY, "Content-Type": "application/json", "Accept": "application/vnd.forem.api-v1+json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, ok: res.ok, json };
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log(`${DRY ? "DRY-RUN" : PUBLISH ? "PUBLISH (LIVE)" : "PUBLISH (DRAFT)"} · ${keys.length} article(s)`);

  if (DRY) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
    for (const key of keys) {
      const a = convert(key);
      fs.writeFileSync(path.join(PREVIEW_DIR, key + ".md"), a.body_markdown);
      console.log(`  ✓ ${key}\n      title: ${a.title}\n      tags:  ${a.tags.join(", ")}\n      canon: ${a.canonical_url}\n      desc:  ${a.description}`);
    }
    console.log(`\nPreviews written to devto-preview/ — open them to review, then re-run without --dry.`);
    return;
  }

  if (!KEY) { console.error("ERROR: set DEVTO_API_KEY (dev.to → Settings → Extensions → API Keys)."); process.exit(1); }

  const state = loadState();
  for (const key of keys) {
    const a = convert(key);
    const payload = { article: { ...a, published: PUBLISH, series: "Human-in-the-Loop for AI Agents" } };
    const existing = state[key];
    let r;
    if (existing && existing.id) {
      r = await send("PUT", `${API}/${existing.id}`, payload);
      console.log(`  ${r.ok ? "↻ updated" : "✗ FAILED"} ${key} (${r.status})${r.ok ? " " + r.json.url : " " + JSON.stringify(r.json).slice(0, 200)}`);
    } else {
      r = await send("POST", API, payload);
      if (r.ok) { state[key] = { id: r.json.id, url: r.json.url }; saveState(state); }
      console.log(`  ${r.ok ? "＋ created" : "✗ FAILED"} ${key} (${r.status})${r.ok ? " " + r.json.url : " " + JSON.stringify(r.json).slice(0, 200)}`);
    }
    if (r.status === 429) { console.log("    rate-limited; waiting 35s…"); await sleep(35000); }
    await sleep(3000); // be polite to the API
  }
  console.log("\nDone. State saved to devto-state.json (re-runs update instead of duplicating).");
  if (!PUBLISH) console.log("These are DRAFTS — review on dev.to, then re-run with --publish to go live.");
}

main().catch(e => { console.error(e); process.exit(1); });
