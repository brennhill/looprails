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

// key -> card. head = 1-2 headline lines; size = headline font px; badge = big glyph (optional)
const CARDS = {
  home: { eyebrow: "AI LOOPS ON RAILS", head: ["Build AI loops", "you can ship."], size: 60, sub: "Fast to build, safe to run. With a human where it counts.", method: true, accent: TEAL },
  playbook: { eyebrow: "THE PLAYBOOK · FOR PRACTITIONERS", head: ["The hands-on field guide"], size: 66, sub: "Grade each AI action, guard it, design the review, prove it works.", method: true, accent: TEAL },
  framework: { eyebrow: "THE FRAMEWORK · SECTIONS 0-10", head: ["The full method"], size: 70, sub: "Consequence × controllability, grades, the autonomy ladder, validation.", method: true, accent: TEAL },
  codex: { eyebrow: "THE CODEX · THE EVIDENCE", head: ["366 annotated sources"], size: 66, sub: "Aviation, medicine, finance, AI safety, HCI, every claim, traced.", method: false, accent: TEAL, badge: "366", badgeSize: 92 },
  cheatsheet: { eyebrow: "ONE-PAGE CHEAT SHEET", head: ["The whole method,", "on one page."], size: 58, sub: "Print it for your wall or your team channel.", method: true, accent: TEAL },
  "guide-g0": { eyebrow: "CONSEQUENCE GRADE", head: ["Trivial actions"], size: 66, sub: "Why a human in the loop is the wrong default here.", accent: G0, badge: "G0" },
  "guide-g1": { eyebrow: "CONSEQUENCE GRADE", head: ["Low-consequence", "actions"], size: 60, sub: "Act, then notify, reversibility beats a confirmation prompt.", accent: G1, badge: "G1" },
  "guide-g2": { eyebrow: "CONSEQUENCE GRADE", head: ["High-consequence", "actions"], size: 60, sub: "When review actually pays off, and how to make it catch mistakes.", accent: G2, badge: "G2" },
  "guide-g3": { eyebrow: "CONSEQUENCE GRADE", head: ["Critical actions"], size: 66, sub: "When review becomes a rubber stamp, what to prevent instead.", accent: G3, badge: "G3" },
  "rail-reversible": { eyebrow: "RAIL · THE FOUR PROPERTIES", head: ["Reversible"], size: 74, sub: "Make actions undoable or contained, so stop-and-ask stays rare.", accent: TEAL, badge: "R" },
  "rail-authorized": { eyebrow: "RAIL · THE FOUR PROPERTIES", head: ["Authorized"], size: 74, sub: "Least privilege, and maker-checker for high-stakes actions.", accent: TEAL, badge: "A" },
  "rail-interruptible": { eyebrow: "RAIL · THE FOUR PROPERTIES", head: ["Interruptible"], size: 70, sub: "Kill switches and blame-free stops so anyone can halt an agent.", accent: TEAL, badge: "I" },
  "rail-logged": { eyebrow: "RAIL · THE FOUR PROPERTIES", head: ["Logged"], size: 74, sub: "Identity, sub-agent provenance, tamper-evident proof of oversight.", accent: TEAL, badge: "L" },
  "article-what-is-human-in-the-loop": { eyebrow: "LOOPRAILS · ARTICLE", head: ["What is", "human-in-the-loop?"], size: 60, sub: "A practical guide to HITL for AI agents.", method: false, accent: TEAL },
  "article-hitl-ai-safety": { eyebrow: "LOOPRAILS · ARTICLE", head: ["Does human-in-the-loop", "improve AI safety?"], size: 52, sub: "What the evidence actually says.", method: false, accent: TEAL },
  "article-in-the-loop-vs-on-the-loop": { eyebrow: "LOOPRAILS · ARTICLE", head: ["In-the-loop vs", "on-the-loop"], size: 58, sub: "…and out-of-the-loop, explained.", method: false, accent: TEAL },
  "article-ai-agent-approval": { eyebrow: "LOOPRAILS · ARTICLE", head: ["When should an agent", "ask for approval?"], size: 50, sub: "Build gates that aren't rubber stamps.", method: false, accent: TEAL },
  "article-lethal-trifecta": { eyebrow: "LOOPRAILS · ARTICLE", head: ["The lethal trifecta"], size: 64, sub: "How AI agents leak data, and how to stop it.", method: false, accent: G3 },
  "article-ai-agent-guardrails": { eyebrow: "LOOPRAILS · ARTICLE", head: ["AI agent guardrails"], size: 62, sub: "A practical checklist.", method: false, accent: TEAL },
  "article-ai-agent-autonomy-levels": { eyebrow: "LOOPRAILS · ARTICLE", head: ["AI agent", "autonomy levels"], size: 58, sub: "The L0-L6 ladder, and how to choose.", method: false, accent: TEAL },
  "article-prompt-injection-prevention": { eyebrow: "LOOPRAILS · ARTICLE", head: ["Prompt injection", "prevention"], size: 58, sub: "Defense in depth for AI agents.", method: false, accent: G3 },
  "article-maker-checker-ai": { eyebrow: "LOOPRAILS · ARTICLE", head: ["Maker-checker", "for AI agents"], size: 58, sub: "Four-eyes for irreversible actions.", method: false, accent: TEAL },
  "article-automation-bias": { eyebrow: "LOOPRAILS · ARTICLE", head: ["Automation bias"], size: 64, sub: "Why people rubber-stamp AI.", method: false, accent: G2 },
  "article-ai-kill-switch": { eyebrow: "LOOPRAILS · ARTICLE", head: ["The AI kill switch"], size: 64, sub: "Stop everything, fast and blame-free.", method: false, accent: G3 },
  "article-llm-agent-skills-credential-leak": { eyebrow: "LOOPRAILS · STUDY", head: ["How agent skills", "leak credentials"], size: 54, sub: "A 2026 study of 17,022 skills.", method: false, accent: G3 },
  "article-ai-agent-sandboxing": { eyebrow: "LOOPRAILS · ARTICLE", head: ["AI agent", "sandboxing"], size: 58, sub: "Contain the blast radius.", method: false, accent: TEAL },
  "article-least-privilege-ai-agents": { eyebrow: "LOOPRAILS · ARTICLE", head: ["Least privilege", "for AI agents"], size: 56, sub: "Grant only what the task needs.", method: false, accent: TEAL },
  "article-circuit-breaker-ai-agents": { eyebrow: "LOOPRAILS · ARTICLE", head: ["The circuit breaker", "pattern for AI"], size: 52, sub: "Auto-pause before damage cascades.", method: false, accent: G2 },
  "article-what-is-agentic-ai": { eyebrow: "LOOPRAILS · ARTICLE", head: ["What is", "agentic AI?"], size: 62, sub: "And why oversight has to change.", method: false, accent: TEAL },
  "article-hitl-coding-agents": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "coding agents"], size: 56, sub: "Reads → merges → shell, graded.", method: false, accent: TEAL },
  "article-hitl-customer-support": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "customer support"], size: 54, sub: "Refunds, replies, escalation.", method: false, accent: TEAL },
  "article-hitl-financial-transactions": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "AI payments"], size: 56, sub: "Two-party approval for moving money.", method: false, accent: G3 },
  "article-hitl-database-operations": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "database ops"], size: 56, sub: "Read-only by default; dry-run prod.", method: false, accent: G2 },
  "article-hitl-email-agents": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "AI email"], size: 58, sub: "Undo-send, previews, rate caps.", method: false, accent: TEAL },
  "article-hitl-deployments": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "deployments"], size: 56, sub: "Canary + auto-rollback over approval.", method: false, accent: G2 },
  "article-hitl-content-moderation": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for content", "moderation"], size: 52, sub: "Route by confidence; appeals.", method: false, accent: TEAL },
  "article-hitl-machine-learning": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "machine learning"], size: 54, sub: "Labeling, active learning, RLHF.", method: false, accent: TEAL },
  "article-hitl-healthcare": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for AI in", "healthcare"], size: 54, sub: "Keep the clinician in command.", method: false, accent: G2 },
  "article-hitl-legal-contracts": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "legal & contracts"], size: 54, sub: "Verify citations; attorney signs off.", method: false, accent: TEAL },
  "article-hitl-hiring": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "AI hiring"], size: 58, sub: "A human owns the decision.", method: false, accent: TEAL },
  "article-hitl-browser-agents": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for browser", "& computer use"], size: 50, sub: "Sandbox the open web.", method: false, accent: G3 },
  "article-hitl-voice-agents": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for", "AI voice agents"], size: 54, sub: "Limit, confirm, hand off.", method: false, accent: TEAL },
  "article-hitl-multi-agent-systems": { eyebrow: "LOOPRAILS · USE CASE", head: ["HITL for multi-", "agent systems"], size: 52, sub: "Scope sub-agents; one kill switch.", method: false, accent: G2 },
  "article-loop-engineering": { eyebrow: "LOOPRAILS · LOOP ENGINEERING", head: ["What is", "loop engineering?"], size: 56, sub: "From prompts to loops.", method: false, accent: TEAL },
  "article-build-agent-loop": { eyebrow: "LOOPRAILS · LOOP ENGINEERING", head: ["Build your first", "agent loop"], size: 54, sub: "Scaffolding plus guardrails.", method: false, accent: TEAL },
  "article-loop-patterns": { eyebrow: "LOOPRAILS · LOOP ENGINEERING", head: ["Loop patterns"], size: 62, sub: "For engineering and data science.", method: false, accent: TEAL },
  "article-evaluation-driven-development": { eyebrow: "LOOPRAILS · LOOP ENGINEERING", head: ["Evaluation-driven", "development"], size: 52, sub: "The verifier is the point.", method: false, accent: TEAL },
  "article-loop-engineering-oversight": { eyebrow: "LOOPRAILS · LOOP ENGINEERING", head: ["Keep a loop", "on the rails"], size: 56, sub: "Grade it, cap it, stop it.", method: false, accent: G2 },
  "article-loop-engineering-doctrine": { eyebrow: "LOOPRAILS · THE DOCTRINE", head: ["The LoopRails", "Doctrine"], size: 62, sub: "Ten principles for loops you can ship.", method: true, accent: TEAL },
  "article-lora-vs-fine-tuning-vs-pre-training": { eyebrow: "LOOPRAILS · BUILD A LOOP", head: ["LoRA, fine-tuning,", "or pre-training?"], size: 50, sub: "When each one makes sense.", method: false, accent: TEAL },
  "article-adapting-models-you-dont-control": { eyebrow: "LOOPRAILS · BUILD A LOOP", head: ["Models you", "don't control"], size: 56, sub: "What you can and can't change.", method: false, accent: TEAL },
  kit: { eyebrow: "THE KIT · TAKE IT WITH YOU", head: ["The LoopRails Kit"], size: 60, sub: "Templates you fill in before a loop runs.", method: true, accent: TEAL },
  "article-context-engineering-agent-loops": { eyebrow: "LOOPRAILS · BUILD A LOOP", head: ["Context", "engineering"], size: 60, sub: "Keep the loop effective across many turns.", method: false, accent: TEAL },
  "article-loop-health-monitoring": { eyebrow: "LOOPRAILS · RUN & OBSERVE", head: ["Loop health"], size: 64, sub: "What to monitor in a running loop.", method: false, accent: G2 },
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
