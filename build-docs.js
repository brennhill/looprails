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

// email capture (ConvertKit / Kit), shown near the foot of every generated page.
// Reframed around the Kit (the concrete lead magnet) instead of a vague newsletter.
const NEWSLETTER = `<section style="border-top:1px solid var(--line);background:var(--bg-2);padding:36px 22px;text-align:center"><div style="max-width:600px;margin:0 auto"><div style="font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--rail-2);margin-bottom:8px">Free download · the LoopRails Kit</div><div style="font-weight:800;font-size:1.28rem;color:var(--ink);margin-bottom:6px;letter-spacing:-.01em">Get five project templates</div><p style="color:var(--ink-2);font-size:.95rem;margin:0 0 8px">Plan your loop with five templates and a one-page checklist. Get them by email, plus new essays on agent loops.</p><p style="color:var(--muted);font-size:.85rem;margin:0 0 16px">Done-Condition Spec · Loop Card · Guardrails Checklist · Model Adaptation Worksheet · Loop Health Signals</p><script async data-uid="26a80d8704" src="https://aiacceleration.kit.com/26a80d8704/index.js"></script><p style="color:var(--muted);font-size:.8rem;margin:14px 0 0">No spam. Unsubscribe anytime.</p></div></section>`;

// Strong capture at the top of the Kit page (the highest-intent page). It carries the
// page's only embed; the foot NEWSLETTER is suppressed on kit to avoid a duplicate form.
const KIT_CAPTURE = `<div style="border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:22px 24px;margin:22px 0 6px;text-align:center"><div style="font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--rail-2);margin-bottom:8px">Free &middot; keep the whole Kit</div><div style="font-weight:800;font-size:1.2rem;color:var(--ink);margin-bottom:6px">Get all five templates as one fill-in pack</div><p style="color:var(--ink-2);font-size:.95rem;margin:0 auto 14px;max-width:54ch">Read the templates below, or get the pack and one-page checklist by email. New essays follow.</p><script async data-uid="26a80d8704" src="https://aiacceleration.kit.com/26a80d8704/index.js"></script></div>`;

// Advance when content is reviewed, not merely when the site is rebuilt.
const CONTENT_REVIEW_DATE = "2026-10-01";
const TODAY = CONTENT_REVIEW_DATE;

// key -> source md, output html, nav label, SEO title, per-page description
const DOCS = {
  playbook:           { md: "playbook.md",            out: "playbook.html",            label: "Playbook",      nav: true,
    title: "Human-in-the-Loop Playbook for AI Agents · LoopRails",
    desc: "A quick checklist for grading agent actions, enforcing limits, designing useful review and testing the workflow." },
  framework:          { md: "framework.md",           out: "framework.html",           label: "Framework",     nav: true,
    title: "Human-in-the-Loop Framework for AI Agents · LoopRails",
    desc: "The LoopRails method, exact grading rules, review design, operational controls and limitations." },
  kit:                { md: "kit.md",                 out: "kit.html",                 label: "Kit",           nav: true,
    title: "The LoopRails Kit: Templates for Building Safe Agent Loops · LoopRails",
    desc: "Five templates for goals, action authority, execution controls, model adaptation and loop health." },
  cookbook:           { md: "cookbook.md",            out: "cookbook.html",            label: "Cookbook",      nav: true,
    title: "The LoopRails Cookbook: Agent & RAG Design Patterns with Failure Modes · LoopRails",
    desc: "Practical patterns for agent control flow, recovery and retrieval, with their limits and checks." },
  evals:              { md: "evals.md",               out: "evals.html",               label: "Evals",         nav: true,
    title: "How to Build Evals for AI Agent Loops · LoopRails",
    desc: "Build agent evals from real failures: cases, calibrated graders, controlled comparisons and release evidence." },
  codex:              { md: "codex.md",               out: "codex.html",               label: "Codex",         nav: true,
    title: "Human-in-the-Loop & AI Safety Research Codex (Annotated Sources) · LoopRails",
    desc: "Annotated research on agent oversight and human factors, with current-evidence notes and verification caveats." },
  "codex-loops":      { md: "codex-loops.md",         out: "codex-loops.html",         label: "Loop Engineering Codex",
    title: "The Loop Engineering Codex: Failure Recovery & Multi-Agent Research · LoopRails",
    desc: "Research on recovery, coordination, retrieval and verification, with current evidence and historical results." },
  "guide-g0":         { md: "guide-g0.md",            out: "guide-g0.html",            label: "G0 · Trivial",
    title: "G0 Trivial AI Actions: When Human-in-the-Loop Is Overkill · LoopRails",
    desc: "G0 actions have trivial, contained effects. Check scope and data sensitivity before allowing bounded autonomy." },
  "guide-g1":         { md: "guide-g1.md",            out: "guide-g1.html",            label: "G1 · Low",
    title: "G1 Low-Risk AI Actions: Act, Notify, Undo · LoopRails",
    desc: "G1 actions have limited consequences. Use scoped authority, suitable records and tested recovery." },
  "guide-g2":         { md: "guide-g2.md",            out: "guide-g2.html",            label: "G2 · High",
    title: "G2 High-Risk AI Actions: When Human Review Works · LoopRails",
    desc: "G2 actions need stronger evidence and appropriate authorization before consequential commitment." },
  "guide-g3":         { md: "guide-g3.md",            out: "guide-g3.html",            label: "G3 · Critical",
    title: "G3 Critical AI Actions: Beyond the Rubber Stamp · LoopRails",
    desc: "G3 actions combine irreversibility with external or severe consequences. Use prevention and explicit authority." },
  "rail-reversible":  { md: "rail-reversible.md",     out: "rail-reversible.html",     label: "Reversible",
    title: "Reversible AI Agent Actions (the R in RAIL) · LoopRails",
    desc: "Test recovery and containment, and document irreversible external effects." },
  "rail-authorized":  { md: "rail-authorized.md",     out: "rail-authorized.html",     label: "Authorized",
    title: "Least-Privilege & Maker-Checker for AI Agents (RAIL) · LoopRails",
    desc: "Enforce identity, delegated scope and exact action approval at execution." },
  "rail-interruptible":{ md: "rail-interruptible.md", out: "rail-interruptible.html",  label: "Interruptible",
    title: "Kill Switches & Interruptible AI Agents (RAIL) · LoopRails",
    desc: "Stop new work, cancel supported operations and reconcile effects already committed." },
  "rail-logged":      { md: "rail-logged.md",         out: "rail-logged.html",         label: "Logged",
    title: "AI Agent Logging, Identity & Provenance (RAIL) · LoopRails",
    desc: "Keep privacy-safe evidence of agent decisions, actions, authority and outcomes." },
};

// long-form SEO articles, generated with Article schema and listed on articles.html
const ARTICLES = {
  "article-what-is-human-in-the-loop": { md: "article-what-is-human-in-the-loop.md", out: "article-what-is-human-in-the-loop.html",
    label: "What Is Human-in-the-Loop (HITL) in AI?",
    title: "What Is Human-in-the-Loop (HITL) in AI? A Guide · LoopRails",
    desc: "Human-in-the-loop (HITL) means a person helps make or review an AI system’s decisions." },
  "article-hitl-ai-safety": { md: "article-hitl-ai-safety.md", out: "article-hitl-ai-safety.html",
    label: "Does Human-in-the-Loop Improve AI Safety?",
    title: "Does Human-in-the-Loop Improve AI Safety? · LoopRails",
    desc: "Human review can improve safety when reviewers know what to check, have the evidence and can act in time." },
  "article-in-the-loop-vs-on-the-loop": { md: "article-in-the-loop-vs-on-the-loop.md", out: "article-in-the-loop-vs-on-the-loop.html",
    label: "In-the-Loop vs On-the-Loop vs Out-of-the-Loop",
    title: "Human-in-the-Loop vs On-the-Loop vs Out-of-the-Loop · LoopRails",
    desc: "These terms describe when a person can step in." },
  "article-ai-agent-approval": { md: "article-ai-agent-approval.md", out: "article-ai-agent-approval.html",
    label: "When Should an AI Agent Ask for Approval?",
    title: "When Should an AI Agent Ask for Human Approval? · LoopRails",
    desc: "Ask for approval when an action needs permission or a reviewer can catch a costly mistake." },
  "article-lethal-trifecta": { md: "article-lethal-trifecta.md", out: "article-lethal-trifecta.html",
    label: "The Lethal Trifecta: How AI Agents Leak Data",
    title: "The Lethal Trifecta: How AI Agents Leak Data · LoopRails",
    desc: "Private data, untrusted content and a way to send data out create a dangerous combination." },
  "article-ai-agent-guardrails": { md: "article-ai-agent-guardrails.md", out: "article-ai-agent-guardrails.html",
    label: "AI Agent Guardrails: A Practical Checklist",
    title: "AI Agent Guardrails: A Practical Checklist · LoopRails",
    desc: "Guardrails check an agent’s decisions and limit what its tools can do." },
  "article-ai-agent-autonomy-levels": { md: "article-ai-agent-autonomy-levels.md", out: "article-ai-agent-autonomy-levels.html",
    label: "AI Agent Autonomy Levels (L0-L6)",
    title: "AI Agent Autonomy Levels: From Logged to Locked Down · LoopRails",
    desc: "Autonomy defines what an agent may do without asking." },
  "article-prompt-injection-prevention": { md: "article-prompt-injection-prevention.md", out: "article-prompt-injection-prevention.html",
    label: "Prompt Injection Prevention",
    title: "Prompt Injection Prevention: A Defense-in-Depth Guide · LoopRails",
    desc: "Prompt injection hides malicious instructions in material an agent reads: pages, emails, documents, code or tool results." },
  "article-maker-checker-ai": { md: "article-maker-checker-ai.md", out: "article-maker-checker-ai.html",
    label: "Maker-Checker (Four-Eyes) for AI Agents",
    title: "Maker-Checker (Four-Eyes) for AI Agents · LoopRails",
    desc: "In maker–checker review, one party proposes an action and another authorizes it." },
  "article-automation-bias": { md: "article-automation-bias.md", out: "article-automation-bias.html",
    label: "Automation Bias: Why People Rubber-Stamp AI",
    title: "Automation Bias: Why People Rubber-Stamp AI · LoopRails",
    desc: "Automation bias means relying too much on automated advice." },
  "article-ai-kill-switch": { md: "article-ai-kill-switch.md", out: "article-ai-kill-switch.html",
    label: "How to Build an AI Kill Switch",
    title: "How to Build an AI Kill Switch · LoopRails",
    desc: "A kill switch blocks new work and tries to stop work already running." },
  "article-llm-agent-skills-credential-leak": { md: "article-llm-agent-skills-credential-leak.md", out: "article-llm-agent-skills-credential-leak.html",
    label: "Study: How AI Agent Skills Leak Credentials",
    title: "Study: How AI Agent \"Skills\" Leak Your Credentials · LoopRails",
    desc: "A 2026 study sampled 17,022 skills from SkillsMP and identified 520 affected skills containing 1,708 security issues." },
  "article-llm-compiler-loop-optimization": { md: "article-llm-compiler-loop-optimization.md", out: "article-llm-compiler-loop-optimization.html",
    label: "Study: A Compiler as the Verifier",
    title: "Study: LLM-Guided Loop Optimization with Compiler Feedback (ComPilot) · LoopRails",
    desc: "ComPilot uses a language model to propose loop transformations, then receives compiler legality checks and measured performance as feedback." },
  "article-agentic-loops-in-the-wild": { md: "article-agentic-loops-in-the-wild.md", out: "article-agentic-loops-in-the-wild.html",
    label: "Agentic Loops in the Wild: Wins, Failures, Cost",
    title: "Agentic Loops in the Wild: What Works, What Fails, and What It Costs · LoopRails",
    desc: "An agent’s reported success depends on its task, tools, checks and budget." },
  "article-ai-agent-sandboxing": { md: "article-ai-agent-sandboxing.md", out: "article-ai-agent-sandboxing.html",
    label: "AI Agent Sandboxing",
    title: "AI Agent Sandboxing: Contain the Blast Radius · LoopRails",
    desc: "A sandbox limits where an agent can act: the files it can access, programs it can run, services it can reach and resources it can use." },
  "article-least-privilege-ai-agents": { md: "article-least-privilege-ai-agents.md", out: "article-least-privilege-ai-agents.html",
    label: "Least Privilege for AI Agents",
    title: "Least Privilege for AI Agents: Grant Only What the Task Needs · LoopRails",
    desc: "Give an agent the access its task needs, for only as long as it needs it." },
  "article-circuit-breaker-ai-agents": { md: "article-circuit-breaker-ai-agents.md", out: "article-circuit-breaker-ai-agents.html",
    label: "The Circuit Breaker Pattern for AI Agents",
    title: "The Circuit Breaker Pattern for AI Agents · LoopRails",
    desc: "A circuit breaker blocks new work when a limit is reached." },
  "article-what-is-agentic-ai": { md: "article-what-is-agentic-ai.md", out: "article-what-is-agentic-ai.html",
    label: "What Is Agentic AI?",
    title: "What Is Agentic AI? And Why Oversight Has to Change · LoopRails",
    desc: "An AI agent uses a model to choose actions toward a goal." },
  "article-hitl-coding-agents": { md: "article-hitl-coding-agents.md", out: "article-hitl-coding-agents.html",
    label: "Human-in-the-Loop for AI Coding Agents",
    title: "How to Build a Good Human-in-the-Loop for AI Coding Agents · LoopRails",
    desc: "Give a coding agent a restricted workspace to explore and edit." },
  "article-hitl-customer-support": { md: "article-hitl-customer-support.md", out: "article-hitl-customer-support.html",
    label: "Human-in-the-Loop for AI Customer Support",
    title: "How to Build a Good Human-in-the-Loop for AI Customer Support · LoopRails",
    desc: "Let a support agent answer questions within its approved scope." },
  "article-hitl-financial-transactions": { md: "article-hitl-financial-transactions.md", out: "article-hitl-financial-transactions.html",
    label: "Human-in-the-Loop for AI Financial Transactions",
    title: "How to Build a Good Human-in-the-Loop for AI Financial Transactions · LoopRails",
    desc: "Check who can authorize a payment, where it will go and how much the agent can spend before moving funds." },
  "article-hitl-database-operations": { md: "article-hitl-database-operations.md", out: "article-hitl-database-operations.html",
    label: "Human-in-the-Loop for AI Database Operations",
    title: "How to Build a Good Human-in-the-Loop for AI Database Operations · LoopRails",
    desc: "Treat generated SQL as executable code." },
  "article-hitl-email-agents": { md: "article-hitl-email-agents.md", out: "article-hitl-email-agents.html",
    label: "Human-in-the-Loop for AI Email & Messaging",
    title: "How to Build a Good Human-in-the-Loop for AI Email & Outbound Messaging · LoopRails",
    desc: "Keep drafting separate from sending." },
  "article-hitl-deployments": { md: "article-hitl-deployments.md", out: "article-hitl-deployments.html",
    label: "Human-in-the-Loop for AI Deployments",
    title: "How to Build a Good Human-in-the-Loop for AI-Driven Deployments · LoopRails",
    desc: "Approval decides whether a release goes ahead." },
  "article-hitl-content-moderation": { md: "article-hitl-content-moderation.md", out: "article-hitl-content-moderation.html",
    label: "Human-in-the-Loop for AI Content Moderation",
    title: "How to Build a Good Human-in-the-Loop for AI Content Moderation · LoopRails",
    desc: "Automate routine moderation where the policy is clear and the cost of mistakes is understood." },
  "article-hitl-machine-learning": { md: "article-hitl-machine-learning.md", out: "article-hitl-machine-learning.html",
    label: "Human-in-the-Loop for Machine Learning",
    title: "Human-in-the-Loop for Machine Learning (Labeling & Active Learning) · LoopRails",
    desc: "People help train models by labeling examples, choosing useful training cases and rating outputs." },
  "article-hitl-healthcare": { md: "article-hitl-healthcare.md", out: "article-hitl-healthcare.html",
    label: "Human-in-the-Loop for AI in Healthcare",
    title: "How to Build a Good Human-in-the-Loop for AI in Healthcare · LoopRails",
    desc: "Assess clinical actions by their effect on patients." },
  "article-hitl-legal-contracts": { md: "article-hitl-legal-contracts.md", out: "article-hitl-legal-contracts.html",
    label: "Human-in-the-Loop for AI Legal Work",
    title: "How to Build a Good Human-in-the-Loop for AI Legal & Contract Work · LoopRails",
    desc: "AI can extract clauses and draft changes." },
  "article-hitl-hiring": { md: "article-hitl-hiring.md", out: "article-hitl-hiring.html",
    label: "Human-in-the-Loop for AI Hiring",
    title: "How to Build a Good Human-in-the-Loop for AI Hiring & Recruiting · LoopRails",
    desc: "Use AI to organize hiring evidence." },
  "article-hitl-browser-agents": { md: "article-hitl-browser-agents.md", out: "article-hitl-browser-agents.html",
    label: "Human-in-the-Loop for Browser & Computer-Use Agents",
    title: "How to Build a Good Human-in-the-Loop for Browser & Computer-Use Agents · LoopRails",
    desc: "Reading a page, filling a form and submitting a purchase need different controls." },
  "article-hitl-voice-agents": { md: "article-hitl-voice-agents.md", out: "article-hitl-voice-agents.html",
    label: "Human-in-the-Loop for AI Voice Agents",
    title: "How to Build a Good Human-in-the-Loop for AI Voice Agents · LoopRails",
    desc: "Voice-agent controls need to work during a live conversation." },
  "article-hitl-multi-agent-systems": { md: "article-hitl-multi-agent-systems.md", out: "article-hitl-multi-agent-systems.html",
    label: "Human-in-the-Loop for Multi-Agent Systems",
    title: "How to Build a Good Human-in-the-Loop for Multi-Agent Systems · LoopRails",
    desc: "A team of agents shares work, state and handoffs." },
  "article-loop-engineering-doctrine": { md: "article-loop-engineering-doctrine.md", out: "article-loop-engineering-doctrine.html",
    label: "The LoopRails Doctrine",
    title: "The LoopRails Doctrine: Principles of Loop Engineering · LoopRails",
    desc: "Build a loop that checks whether the work is useful." },
  "article-loop-engineering": { md: "article-loop-engineering.md", out: "article-loop-engineering.html",
    label: "What Is Loop Engineering?",
    title: "What Is Loop Engineering? From Prompts to Loops · LoopRails",
    desc: "Loop engineering designs how an AI agent acts, checks its work and chooses what to do next." },
  "article-build-agent-loop": { md: "article-build-agent-loop.md", out: "article-build-agent-loop.html",
    label: "How to Build Your First Agent Loop",
    title: "How to Build Your First Agent Loop · LoopRails",
    desc: "Start with one task, clear limits and a completion check the agent cannot bypass." },
  "article-loop-patterns": { md: "article-loop-patterns.md", out: "article-loop-patterns.html",
    label: "Loop Patterns for Engineering & Data Science",
    title: "Loop Patterns for Engineering and Data Science · LoopRails",
    desc: "Choose a loop with a clear completion check and recovery plan." },
  "article-evaluation-driven-development": { md: "article-evaluation-driven-development.md", out: "article-evaluation-driven-development.html",
    label: "Evaluation-Driven Development",
    title: "Evaluation-Driven Development: The Verifier Is the Point · LoopRails",
    desc: "Build the checks as you build the agent." },
  "article-verification-functions": { md: "article-verification-functions.md", out: "article-verification-functions.html",
    label: "What Makes a Verifier Work",
    title: "Verification Functions for AI Agent Loops: What Actually Works · LoopRails",
    desc: "A verifier checks a claim about an artifact or state." },
  "article-two-loops": { md: "article-two-loops.md", out: "article-two-loops.html",
    label: "The Two Loops: Intent Clarity & the Delivery Gap",
    title: "The Two Loops: Intent Clarity and the Delivery Gap · LoopRails",
    desc: "An agent loop tries to produce work that passes a check." },
  "article-loop-engineering-oversight": { md: "article-loop-engineering-oversight.md", out: "article-loop-engineering-oversight.html",
    label: "Oversight for Autonomous Loops",
    title: "How to Keep an Autonomous Loop on the Rails · LoopRails",
    desc: "Check both the result and the route taken to produce it." },
  "article-context-engineering-agent-loops": { md: "article-context-engineering-agent-loops.md", out: "article-context-engineering-agent-loops.html",
    label: "Context Engineering for Agent Loops",
    title: "Context Engineering for Agent Loops: Keep the Loop Effective · LoopRails",
    desc: "Context engineering chooses what the model sees on each turn: its goal, limits, current state, tools, evidence and recent results." },
  "article-loop-health-monitoring": { md: "article-loop-health-monitoring.md", out: "article-loop-health-monitoring.html",
    label: "Loop Health: What to Monitor in a Running Loop",
    title: "Loop Health: What to Monitor in a Running Agent Loop · LoopRails",
    desc: "Watch progress, costs and changes to the world outside the agent." },
  "article-world-models-agent-loops": { md: "article-world-models-agent-loops.md", out: "article-world-models-agent-loops.html",
    label: "World Models for Agent Loops",
    title: "World Models for Agent Loops: Simulate Before You Act · LoopRails",
    desc: "A world model predicts what may happen after an action." },
  "article-failure-recovery-agent-loops": { md: "article-failure-recovery-agent-loops.md", out: "article-failure-recovery-agent-loops.html",
    label: "Failure Recovery for Agent Loops",
    title: "Failure Recovery for Agent Loops: Retries, Rollback, Resuming a Crashed Run · LoopRails",
    desc: "Check what happened before retrying." },
  "article-multi-agent-loops": { md: "article-multi-agent-loops.md", out: "article-multi-agent-loops.html",
    label: "Multi-Agent Loops: When More Agents Help",
    title: "Multi-Agent Loops: When More Agents Help, and How They Break · LoopRails",
    desc: "Several agents can research separate sources or work on different files at once." },
  "article-mcp-skill-overload": { md: "article-mcp-skill-overload.md", out: "article-mcp-skill-overload.html",
    label: "MCP and Skill Overload",
    title: "MCP and Skill Overload: How the Number of Tools Affects Accuracy · LoopRails",
    desc: "Tools and skills give agents more ways to act." },
  "article-agent-workflow-patterns": { md: "article-agent-workflow-patterns.md", out: "article-agent-workflow-patterns.html",
    label: "Agent Workflow Patterns",
    title: "Agent Workflow Patterns: Chaining, Routing, Orchestration · LoopRails",
    desc: "Use a workflow when you know the steps in advance." },
  "article-autonomous-agent-patterns": { md: "article-autonomous-agent-patterns.md", out: "article-autonomous-agent-patterns.html",
    label: "Autonomous Agent Patterns",
    title: "Autonomous Agent Patterns: ReAct, Reflection, Tools, Memory · LoopRails",
    desc: "An autonomous agent checks the current state, chooses an action, uses a tool and examines the result." },
  "article-rag-retrieval-patterns": { md: "article-rag-retrieval-patterns.md", out: "article-rag-retrieval-patterns.html",
    label: "RAG Retrieval Patterns",
    title: "RAG Retrieval Patterns: Chunking, Hybrid Search, Reranking · LoopRails",
    desc: "Retrieval-augmented generation (RAG) gives a model external evidence before it answers." },
  "article-advanced-agentic-rag": { md: "article-advanced-agentic-rag.md", out: "article-advanced-agentic-rag.html",
    label: "Advanced and Agentic RAG",
    title: "Advanced and Agentic RAG: Contextual, Corrective, Self-RAG, GraphRAG · LoopRails",
    desc: "Add retrieval steps when a simpler search misses evidence you need." },
  "article-lora-vs-fine-tuning-vs-pre-training": { md: "article-lora-vs-fine-tuning-vs-pre-training.md", out: "article-lora-vs-fine-tuning-vs-pre-training.html",
    label: "LoRA vs Fine-Tuning vs Pre-Training",
    title: "LoRA vs Fine-Tuning vs Pre-Training: When Each Makes Sense · LoopRails",
    desc: "Model adaptation changes a model’s learned behavior." },
  "article-adapting-models-you-dont-control": { md: "article-adapting-models-you-dont-control.md", out: "article-adapting-models-you-dont-control.html",
    label: "What You Can & Can't Do With Models You Don't Control",
    title: "What You Can and Can't Do With Models You Don't Control · LoopRails",
    desc: "How you access a model determines what you can change." },
};

const ALL = { ...DOCS, ...ARTICLES };
const SECTION_ALIASES = require("./content-section-aliases.json");

const ARTICLE_PUB = "2026-06-23";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const humanDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
// inject an author byline directly under the article's <h1>
function injectByline(html, dateISO) {
  const byline = `<p class="byline">By <a href="https://www.linkedin.com/in/brennhill/" rel="author">Brenn Hill</a> · <time datetime="${dateISO}">${humanDate(dateISO)}</time> · Updated <time datetime="${CONTENT_REVIEW_DATE}">${humanDate(CONTENT_REVIEW_DATE)}</time></p>`;
  return html.replace(/<\/h1>/, (m) => m + "\n" + byline);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stripTags = (s) => s.replace(/<[^>]+>/g, "");
const slug = (s) => stripTags(s).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
// Clean URLs: files stay named *.html, but Cloudflare Pages serves them extension-less
// (/kit from kit.html). So all internal links + metadata drop the .html.
const cleanHref = (f) => (f === "index.html" ? "" : f.replace(/\.html$/, ""));
// Strip .html from local <a href="..."> (not external https links, not code text, not .md).
const stripHtmlHrefs = (html) => html.replace(/href="([^"#:]+)\.html(#[^"]*)?"/g, (m, p, h) => `href="${p === "index" ? "/" : p}${h || ""}"`);

function styleBlock() {
  return `<style>
/* The surrounding section supplies the signup copy. Keep the form concise. */
.formkit-form .formkit-column:first-child{display:none!important}
.formkit-form .formkit-column{width:100%!important;flex-basis:100%!important}
.formkit-form .formkit-guarantee{display:none!important}

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
.section-alias{display:block;height:0;scroll-margin-top:64px}
.gh-link{display:inline-block;margin:8px 0 24px;font-size:.85rem;font-family:var(--mono)}
.crumb{font-size:.85rem;color:var(--muted);margin:0 0 4px}
.byline{font-size:.92rem;color:var(--muted);margin:-.2em 0 1.6em}
.byline a{font-weight:600;color:var(--ink-2)}
.related{margin:8px 0 0;border-top:1px solid var(--line);padding-top:22px}
.related h2{font-size:1.15rem;margin:0 0 12px;border:none;padding:0}
.related ul{list-style:none;padding:0;margin:0;display:grid;gap:9px}
.related li a{font-weight:600;font-size:1rem}
.related .related-all{margin:14px 0 0;font-size:.9rem}
.securing{margin:24px 0 0;border:1px solid var(--line);border-left:3px solid var(--rail);background:var(--rail-tint);border-radius:0 10px 10px 0;padding:14px 18px}
.securing h2{font-size:1.05rem;margin:0 0 6px;border:none;padding:0}
.securing p{margin:0;font-size:.95rem;color:var(--ink-2)}
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
  // curated lifecycle nav: principles -> how-to -> model -> tools -> evidence -> library
  const items = [
    ["article-loop-engineering-doctrine", "article-loop-engineering-doctrine.html", "Doctrine"],
    ["playbook", "playbook.html", "Playbook"],
    ["framework", "framework.html", "Framework"],
    ["kit", "kit.html", "Kit"],
    ["cookbook", "cookbook.html", "Cookbook"],
    ["evals", "evals.html", "Evals"],
    ["codex", "codex.html", "Codex"],
    ["__articles", "articles.html", "Articles"],
  ];
  return items.map(([k, href, label]) => `<a href="${href}" class="${k === currentKey ? "on" : ""}">${label}</a>`).join("");
}

// "Related reading", link each article to up to 5 others (rotated so link equity spreads)
function relatedReading(currentKey) {
  const all = Object.keys(ARTICLES);
  const idx = all.indexOf(currentKey);
  const pick = [];
  for (let i = 1; i < all.length && pick.length < 3; i++) pick.push(all[(idx + i) % all.length]);
  const items = pick.map(k => `<li><a href="${ARTICLES[k].out}">${esc(ARTICLES[k].label)}</a></li>`).join("");
  return `<aside class="related"><h2>Related reading</h2><ul>${items}</ul><p class="related-all"><a href="articles.html">All articles →</a> · <a href="https://braceframework.org" title="Security for autonomous AI agents">Securing the agent itself? See BRACE ↗</a></p></aside>`;
}

// Cross-link security-relevant articles to BRACE (which secures the agent itself).
const BRACE_SECURE = {
  "article-rag-retrieval-patterns": `For security controls, see the <a href="https://braceframework.org">BRACE Framework</a>.`,
  "article-advanced-agentic-rag": `For security controls, see the <a href="https://braceframework.org">BRACE Framework</a>.`,
  "article-autonomous-agent-patterns": `For security controls, see the <a href="https://braceframework.org">BRACE Framework</a>.`,
  "article-agent-workflow-patterns": `For security controls, see the <a href="https://braceframework.org">BRACE Framework</a>.`,
  "article-multi-agent-loops": `For security controls, see the <a href="https://braceframework.org">BRACE Framework</a>.`,
  "article-failure-recovery-agent-loops": `For security controls, see the <a href="https://braceframework.org">BRACE Framework</a>.`,
  "article-mcp-skill-overload": `For security controls, see the <a href="https://braceframework.org">BRACE Framework</a>.`,
};
function securingNote(key) {
  if (!BRACE_SECURE[key]) return "";
  return `<aside class="securing"><h2>Securing it</h2><p>${BRACE_SECURE[key]}</p></aside>`;
}

function page(key, d, contentHTML, toc) {
  const title = d.title || `${stripTags(d.label).replace(/ ·.*/, "")} · LoopRails`;
  const url = `${SITE}/${cleanHref(d.out)}`;
  const ogimg = `${SITE}/og-${key}.png`;
  const isArticle = key.startsWith("article-");
  // Removed headings retain zero-height bookmark targets at the start of the document.
  const currentIds = new Set([...contentHTML.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const aliases = (SECTION_ALIASES[key] || []).filter(id => !currentIds.has(id))
    .map(id => `<span class="section-alias" id="${esc(id)}" aria-hidden="true"></span>`).join("");
  let body = aliases + contentHTML;
  if (isArticle) {
    body = injectByline(body, ARTICLE_PUB);
    // Keep one download invitation at the foot; the article opens with its content.
  } else if (key === "kit") {
    body = body.replace(/<\/p>/, (m) => `${m}\n${KIT_CAPTURE}`); // after the intro paragraph
  }
  const relatedBlock = isArticle ? relatedReading(key) : "";
  const braceBlock = isArticle ? securingNote(key) : "";
  const crumbHTML = isArticle
    ? `<a href="index.html">LoopRails</a> · <a href="articles.html">Articles</a> · ${esc(stripTags(d.label))}`
    : `<a href="index.html">LoopRails</a> · ${esc(stripTags(d.label))}`;
  const breadcrumb = isArticle
    ? [["LoopRails", SITE + "/"], ["Articles", SITE + "/articles"], [stripTags(d.label), url]]
    : [["LoopRails", SITE + "/"], [stripTags(d.label), url]];
  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": isArticle ? "Article" : "TechArticle", "headline": stripTags(d.label), "name": title,
        "description": d.desc, "inLanguage": "en-US", "url": url, "mainEntityOfPage": url, "image": ogimg,
        "datePublished": isArticle ? ARTICLE_PUB : "2026-06-22", "dateModified": TODAY,
        "author": { "@type": "Person", "name": "Brenn Hill", "url": "https://www.linkedin.com/in/brennhill/" },
        "publisher": { "@type": "Person", "name": "Brenn Hill" },
        "isPartOf": { "@type": "WebSite", "name": "LoopRails", "url": SITE + "/" } },
      { "@type": "BreadcrumbList", "itemListElement": breadcrumb.map((b, i) => ({ "@type": "ListItem", "position": i + 1, "name": b[0], "item": b[1] })) }
    ]
  });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(d.desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
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
<link rel="alternate" type="application/rss+xml" title="LoopRails articles" href="${SITE}/feed.xml">
<meta name="theme-color" content="#0e7c86">
<script type="application/ld+json">${jsonld}</script>
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
    <div class="crumb">${crumbHTML}</div>
    <div id="md" class="md">
      <a class="gh-link" href="https://github.com/brennhill/looprails/blob/main/${d.md}">View ${d.md} on GitHub ↗</a>
      ${body}
    </div>
    ${braceBlock}
    ${relatedBlock}
  </main>
</div>
${key === "kit" ? "" : NEWSLETTER}
<footer>
  <span>© 2026 <a href="https://www.linkedin.com/in/brennhill/">Brenn Hill</a> · all rights reserved</span>
  <span><a href="index.html">Home</a> · <a href="https://braceframework.org" title="Security for autonomous AI agents">BRACE Framework ↗</a> · <a href="https://github.com/brennhill/looprails">GitHub</a> · <a href="https://www.linkedin.com/in/brennhill/">LinkedIn</a></span>
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

// RSS 2.0 feed of all articles, newest-listed first. pubDate staggered by list
// order so readers get a stable ordering even though articles share a publish date.
function rfc822(dateStr, offsetMin) {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setMinutes(d.getMinutes() - offsetMin);
  return d.toUTCString();
}

function rssFeed() {
  const items = Object.values(ARTICLES);
  const lastBuild = new Date().toUTCString();
  const entries = items.map((a, i) => {
    const link = `${SITE}/${cleanHref(a.out)}`;
    return `    <item>
      <title>${esc(a.label)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(a.desc)}</description>
      <pubDate>${rfc822("2026-06-23", i)}</pubDate>
    </item>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LoopRails, Human-in-the-Loop &amp; AI Agent Safety</title>
    <link>${SITE}/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Practical, sourced writing on human-in-the-loop oversight of AI agents, when review helps, when it's a rubber stamp, and how to design oversight that actually catches mistakes.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${entries}
  </channel>
</rss>
`;
}

function articlesIndexPage() {
  const url = `${SITE}/articles`;
  const title = "Articles on Human-in-the-Loop & AI Agent Safety · LoopRails";
  const desc = "Practical articles on human-in-the-loop oversight and AI agent safety: HITL explained, when agents should ask for approval, the lethal trifecta, AI agent guardrails, and more.";
  const items = Object.values(ARTICLES);
  const CATS = [
    ["The LoopRails Doctrine", ["article-loop-engineering-doctrine"]],
    ["Build a loop", ["article-loop-engineering", "article-build-agent-loop", "article-context-engineering-agent-loops", "article-mcp-skill-overload", "article-loop-patterns", "article-evaluation-driven-development", "article-verification-functions", "article-two-loops", "article-world-models-agent-loops", "article-multi-agent-loops"]],
    ["Agent design patterns", ["article-agent-workflow-patterns", "article-autonomous-agent-patterns"]],
    ["RAG patterns", ["article-rag-retrieval-patterns", "article-advanced-agentic-rag"]],
    ["Choosing & adapting models", ["article-lora-vs-fine-tuning-vs-pre-training", "article-adapting-models-you-dont-control"]],
    ["Run & observe loops", ["article-loop-engineering-oversight", "article-loop-health-monitoring", "article-failure-recovery-agent-loops"]],
    ["Start here & concepts", ["article-what-is-agentic-ai", "article-what-is-human-in-the-loop", "article-hitl-ai-safety", "article-in-the-loop-vs-on-the-loop", "article-ai-agent-autonomy-levels", "article-automation-bias"]],
    ["Patterns & controls", ["article-ai-agent-approval", "article-ai-agent-guardrails", "article-lethal-trifecta", "article-prompt-injection-prevention", "article-maker-checker-ai", "article-ai-kill-switch", "article-circuit-breaker-ai-agents", "article-ai-agent-sandboxing", "article-least-privilege-ai-agents"]],
    ["Use cases, human-in-the-loop for…", ["article-hitl-coding-agents", "article-hitl-customer-support", "article-hitl-financial-transactions", "article-hitl-database-operations", "article-hitl-email-agents", "article-hitl-deployments", "article-hitl-content-moderation", "article-hitl-machine-learning", "article-hitl-healthcare", "article-hitl-legal-contracts", "article-hitl-hiring", "article-hitl-browser-agents", "article-hitl-voice-agents", "article-hitl-multi-agent-systems"]],
    ["Studies", ["article-agentic-loops-in-the-wild", "article-llm-compiler-loop-optimization", "article-llm-agent-skills-credential-leak"]],
  ];
  const card = a => `
      <a class="acard" href="${a.out}">
        <h3>${esc(a.label)}</h3>
        <p>${esc(a.desc)}</p>
        <span class="go">Read →</span>
      </a>`;
  const placed = new Set();
  let sections = CATS.map(([name, keys]) => {
    const present = keys.filter(k => ARTICLES[k]);
    present.forEach(k => placed.add(k));
    if (!present.length) return "";
    return `  <h2 class="cathead">${esc(name)} <span class="catcount">${present.length}</span></h2>\n  <div class="alist">${present.map(k => card(ARTICLES[k])).join("")}\n  </div>`;
  }).filter(Boolean).join("\n");
  const leftover = Object.keys(ARTICLES).filter(k => !placed.has(k));
  if (leftover.length) sections += `\n  <h2 class="cathead">More</h2>\n  <div class="alist">${leftover.map(k => card(ARTICLES[k])).join("")}\n  </div>`;
  const itemList = JSON.stringify({
    "@context": "https://schema.org", "@type": "ItemList",
    "itemListElement": items.map((a, i) => ({ "@type": "ListItem", "position": i + 1, "url": `${SITE}/${cleanHref(a.out)}`, "name": a.label }))
  });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="author" content="Brenn Hill">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/og.png">
<link rel="icon" href="favicon.ico?v=2" sizes="32x32">
<link rel="icon" href="favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png?v=2">
<link rel="manifest" href="site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="LoopRails articles" href="${SITE}/feed.xml">
<meta name="theme-color" content="#0e7c86">
<script type="application/ld+json">${itemList}</script>
${styleBlock()}
<style>
.alist{max-width:820px;margin:0 auto;padding:8px 0 40px}
.acard{display:block;border:1px solid var(--line);border-radius:14px;padding:20px 22px;margin:0 0 14px;background:#fff;transition:.15s}
.acard:hover{transform:translateY(-2px);box-shadow:0 16px 36px -22px rgba(13,17,23,.35);text-decoration:none}
.acard h3{font-size:1.12rem;margin:0 0 6px;border:none;padding:0;color:var(--ink);font-weight:700}
.acard p{margin:0 0 8px;color:var(--ink-2);font-size:.95rem}
.acard .go{color:var(--rail);font-weight:650;font-size:.9rem}
.cathead{max-width:820px;margin:34px auto 12px;font-family:var(--mono);font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--rail-2);border-top:1px solid var(--line);padding-top:20px}
.cathead .catcount{color:var(--muted);font-weight:400}
.intro{max-width:820px;margin:0 auto;padding:8px 0 4px;color:var(--ink-2)}
.intro h1{font-size:1.9rem;letter-spacing:-.02em;margin:0 0 .3em;color:var(--ink)}
</style>
</head>
<body>
<div class="topbar">
  <a class="brand" href="index.html">${BRAND_SVG} LoopRails</a>
  <nav class="docpick">${navHTML("__articles")}</nav>
</div>
<main class="content" style="max-width:900px;margin:0 auto">
  <div class="crumb"><a href="index.html">LoopRails</a> · Articles</div>
  <div class="intro">
    <h1>Articles: human-in-the-loop &amp; AI agent safety</h1>
    <p>Short guides to agent decisions, execution controls and evidence. <a href="feed.xml">Subscribe via RSS ↗</a></p>
  </div>
${sections}
</main>
${NEWSLETTER}
<footer>
  <span>© 2026 <a href="https://www.linkedin.com/in/brennhill/">Brenn Hill</a> · all rights reserved</span>
  <span><a href="index.html">Home</a> · <a href="playbook.html">Playbook</a> · <a href="https://braceframework.org" title="Security for autonomous AI agents">BRACE Framework ↗</a> · <a href="https://github.com/brennhill/looprails">GitHub</a></span>
</footer>
${BEACON}
</body>
</html>
`;
}

let built = [];
for (const [key, d] of Object.entries(ALL)) {
  const src = fs.readFileSync(path.join(__dirname, d.md), "utf8");
  let html = parse(src, { gfm: true, breaks: false });
  html = injectHeadingIds(html);
  if (key === "codex" || key === "codex-loops") html = injectRefAnchors(html);
  const toc = buildTOC(html);
  fs.writeFileSync(path.join(__dirname, d.out), stripHtmlHrefs(page(key, d, html, toc)).replace(/[ \t]+$/gm, ""));
  built.push(d.out);
}

fs.writeFileSync(path.join(__dirname, "articles.html"), stripHtmlHrefs(articlesIndexPage()));
built.push("articles.html");

fs.writeFileSync(path.join(__dirname, "feed.xml"), rssFeed());
built.push("feed.xml");

// sitemap + robots
const urls = ["", "articles", "cheatsheet", ...Object.values(ALL).map(d => cleanHref(d.out))];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}/${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(__dirname, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log("Built " + built.length + " doc pages:\n  " + built.join("\n  "));
console.log("Wrote sitemap.xml + robots.txt");
