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
 *   node publish-devto.js --schedule                 # #1 live now, rest every 4 days (dev.to native scheduling)
 *   node publish-devto.js --all --schedule --every 4 # full drip: one article every 4 days
 *   node publish-devto.js --schedule --start 2026-07-01 --every 7  # custom start/cadence
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
const SCHEDULE = args.includes("--schedule");
const SCHEDULE_FIRST = args.includes("--schedule-first"); // don't publish item 0 immediately
const REST = args.includes("--rest"); // every non-cornerstone article (the long tail), alphabetical
const flagVal = (name, def) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const EVERY = parseInt(flagVal("--every", "4"), 10);
const START = flagVal("--start", new Date().toISOString().slice(0, 10));
const POST_HOUR = "T12:00:00Z"; // 12:00 UTC = 2pm Berlin (CEST, UTC+2)

// schedule slot for the i-th article: i=0 publishes now (null) unless --schedule-first, else START + i*EVERY days
function slotISO(i) {
  if (i === 0 && !SCHEDULE_FIRST) return null;
  const d = new Date(START + POST_HOUR);
  d.setUTCDate(d.getUTCDate() + i * EVERY);
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}
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
else if (REST) keys = allArticleKeys.filter(k => !CORNERSTONE.includes(k)); // long tail, alphabetical
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

// YAML-quote a scalar (Forem parses frontmatter as YAML; bare timestamps and
// colon-bearing titles must be quoted or it throws)
const yq = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';

// wrap the converted article in a dev.to frontmatter top block. Scheduling lives
// here: published: true + a future (quoted) published_at — dev.to publishes it then.
function withFrontmatter(a, { published, publishedAt }) {
  const fm = [`title: ${yq(a.title)}`, `published: ${published ? "true" : "false"}`];
  if (publishedAt) fm.push(`published_at: ${yq(publishedAt)}`);
  fm.push(`tags: ${a.tags.join(", ")}`);
  fm.push(`canonical_url: ${a.canonical_url}`);
  fm.push(`cover_image: ${a.main_image}`);
  fm.push(`description: ${yq(a.description)}`);
  fm.push(`series: ${yq("Human-in-the-Loop for AI Agents")}`);
  return `---\n${fm.join("\n")}\n---\n\n${a.body_markdown}`;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function send(method, url, payload) {
  for (let attempt = 0; attempt < 8; attempt++) {
    let res, text;
    try {
      res = await fetch(url, {
        method,
        headers: { "api-key": KEY, "Content-Type": "application/json", "Accept": "application/vnd.forem.api-v1+json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(60000),
      });
      text = await res.text();
    } catch (e) { console.log(`    network error (${e.cause?.code || e.name}); retry in 10s (attempt ${attempt + 1})`); await sleep(10000); continue; }
    if (res.status === 429) { console.log(`    429; waiting 30s (attempt ${attempt + 1})`); await sleep(30000); continue; }
    let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return { status: res.status, ok: res.ok, json };
  }
  return { status: 0, ok: false, json: { error: "failed after retries" } };
}

async function main() {
  console.log(`${DRY ? "DRY-RUN" : PUBLISH ? "PUBLISH (LIVE)" : "PUBLISH (DRAFT)"} · ${keys.length} article(s)`);

  if (DRY) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const a = convert(key);
      const slot = SCHEDULE ? slotISO(i) : undefined;
      const md = withFrontmatter(a, { published: SCHEDULE || PUBLISH, publishedAt: slot });
      fs.writeFileSync(path.join(PREVIEW_DIR, key + ".md"), md);
      console.log(`  ✓ ${key}\n      title: ${a.title}\n      tags:  ${a.tags.join(", ")}\n      when:  ${slot || (SCHEDULE ? "LIVE now" : PUBLISH ? "LIVE now" : "draft")}`);
    }
    console.log(`\nPreviews (with frontmatter) written to devto-preview/ — open them to review, then re-run without --dry.`);
    return;
  }

  if (!KEY) { console.error("ERROR: set DEVTO_API_KEY (dev.to → Settings → Extensions → API Keys)."); process.exit(1); }

  if (SCHEDULE) console.log(`  cadence: ${SCHEDULE_FIRST ? "first" : "#1"} ${SCHEDULE_FIRST ? "at " + START : "now"}, then every ${EVERY} day(s) at ${POST_HOUR.slice(1)} (2pm Berlin)`);
  const state = loadState();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const a = convert(key);
    let published, publishedAt, when;
    if (SCHEDULE) {
      published = true;
      const slot = slotISO(i);
      publishedAt = slot || undefined;
      when = slot ? "→ " + slot : "→ LIVE now";
    } else {
      published = PUBLISH;
      when = PUBLISH ? "→ LIVE now" : "draft";
    }
    // scheduling + all metadata live in the frontmatter top block
    const payload = { article: { body_markdown: withFrontmatter(a, { published, publishedAt }) } };
    const existing = state[key];
    let r;
    if (existing && existing.id) {
      r = await send("PUT", `${API}/${existing.id}`, payload);
      console.log(`  ${r.ok ? "↻ updated" : "✗ FAILED"} ${key} ${when} (${r.status})${r.ok ? " " + r.json.url : " " + JSON.stringify(r.json).slice(0, 200)}`);
    } else {
      r = await send("POST", API, payload);
      if (r.ok) { state[key] = { id: r.json.id, url: r.json.url }; saveState(state); }
      console.log(`  ${r.ok ? "＋ created" : "✗ FAILED"} ${key} ${when} (${r.status})${r.ok ? " " + r.json.url : " " + JSON.stringify(r.json).slice(0, 200)}`);
    }
    if (r.status === 429) { console.log("    rate-limited; waiting 35s…"); await sleep(35000); }
    await sleep(3000); // be polite to the API
  }
  console.log("\nDone. State saved to devto-state.json (re-runs update instead of duplicating).");
  if (SCHEDULE) console.log("Scheduled posts are server-side on dev.to — nothing needs to keep running locally.");
  else if (!PUBLISH) console.log("These are DRAFTS — review on dev.to, then re-run with --publish to go live.");
}

main().catch(e => { console.error(e); process.exit(1); });
