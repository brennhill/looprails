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

// email capture (ConvertKit / Kit) shown near the foot of every generated page
const NEWSLETTER = `<section style="border-top:1px solid var(--line);background:var(--bg-2);padding:30px 22px;text-align:center"><div style="max-width:560px;margin:0 auto"><div style="font-weight:700;font-size:1.1rem;color:var(--ink);margin-bottom:4px">Get new LoopRails essays by email</div><p style="color:var(--ink-2);font-size:.92rem;margin:0 0 14px">Loop engineering, verifiers, and human oversight. No spam, unsubscribe anytime.</p><script async data-uid="26a80d8704" src="https://aiacceleration.kit.com/26a80d8704/index.js"></script></div></section>`;

const TODAY = new Date().toISOString().slice(0, 10);

// key -> source md, output html, nav label, SEO title, per-page description
const DOCS = {
  playbook:           { md: "playbook.md",            out: "playbook.html",            label: "Playbook",      nav: true,
    title: "Human-in-the-Loop Playbook for AI Agents · LoopRails",
    desc: "The LoopRails practitioner field guide: grade each AI agent action, guard it, design the review moment, and prove the human-in-the-loop oversight actually catches mistakes." },
  framework:          { md: "framework.md",           out: "framework.html",           label: "Framework",     nav: true,
    title: "Human-in-the-Loop Framework for AI Agents · LoopRails",
    desc: "The full LoopRails framework: the consequence-vs-controllability model, grades G0-G3, the autonomy ladder, the anatomy of an oversight moment, and how to validate human-in-the-loop oversight of AI agents." },
  kit:                { md: "kit.md",                 out: "kit.html",                 label: "Kit",           nav: true,
    title: "The LoopRails Kit: Templates for Building Safe Agent Loops · LoopRails",
    desc: "Copy-paste artifacts for building agent loops: a done-condition spec, a Loop Card, a guardrails checklist, and a model-adaptation worksheet. Fill them in before you let a loop run." },
  cookbook:           { md: "cookbook.md",            out: "cookbook.html",            label: "Cookbook",      nav: true,
    title: "The LoopRails Cookbook: Agent & RAG Design Patterns with Failure Modes · LoopRails",
    desc: "A plain-English recipe book for building AI agent loops: agent design patterns, RAG patterns, and the common failure modes of each, with how to get around them. What it is, when to use it, how it fails, how to fix it." },
  codex:              { md: "codex.md",               out: "codex.html",               label: "Codex",         nav: true,
    title: "Human-in-the-Loop & AI Safety Research Codex (366 Sources) · LoopRails",
    desc: "366 annotated sources on human-in-the-loop oversight and AI safety, aviation, medicine, finance, AI safety, and HCI. The evidence base behind LoopRails." },
  "codex-loops":      { md: "codex-loops.md",         out: "codex-loops.html",         label: "Loop Engineering Codex",
    title: "The Loop Engineering Codex: Failure Recovery & Multi-Agent Research · LoopRails",
    desc: "An annotated, sourced evidence base for building and operating AI agent loops: durable execution, retries, idempotency, rollback, checkpoint and resume, and multi-agent coordination, from distributed systems and recent LLM-agent research." },
  "guide-g0":         { md: "guide-g0.md",            out: "guide-g0.html",            label: "G0 · Trivial",
    title: "G0 Trivial AI Actions: When Human-in-the-Loop Is Overkill · LoopRails",
    desc: "G0 (trivial) AI agent actions: why putting a human in the loop is the wrong default here, and how to let low-stakes actions run safely and logged." },
  "guide-g1":         { md: "guide-g1.md",            out: "guide-g1.html",            label: "G1 · Low",
    title: "G1 Low-Risk AI Actions: Act, Notify, Undo · LoopRails",
    desc: "G1 (low-consequence) AI actions: act-then-notify with easy undo, why reversibility beats a confirmation prompt, and how to design it." },
  "guide-g2":         { md: "guide-g2.md",            out: "guide-g2.html",            label: "G2 · High",
    title: "G2 High-Risk AI Actions: When Human Review Works · LoopRails",
    desc: "G2 (high-consequence) AI actions: when human review actually pays off, and how to design the review so it catches mistakes instead of rubber-stamping." },
  "guide-g3":         { md: "guide-g3.md",            out: "guide-g3.html",            label: "G3 · Critical",
    title: "G3 Critical AI Actions: Beyond the Rubber Stamp · LoopRails",
    desc: "G3 (critical) AI actions: irreversible, high-blast-radius operations, why review degrades into a rubber stamp, and what to prevent-by-design instead." },
  "rail-reversible":  { md: "rail-reversible.md",     out: "rail-reversible.html",     label: "Reversible",
    title: "Reversible AI Agent Actions (the R in RAIL) · LoopRails",
    desc: "Reversible, the R in RAIL: make AI agent actions undoable or contained so you rarely need a stop-and-ask gate." },
  "rail-authorized":  { md: "rail-authorized.md",     out: "rail-authorized.html",     label: "Authorized",
    title: "Least-Privilege & Maker-Checker for AI Agents (RAIL) · LoopRails",
    desc: "Authorized, the A in RAIL: least-privilege permissions and maker-checker separation for AI agent actions." },
  "rail-interruptible":{ md: "rail-interruptible.md", out: "rail-interruptible.html",  label: "Interruptible",
    title: "Kill Switches & Interruptible AI Agents (RAIL) · LoopRails",
    desc: "Interruptible, the I in RAIL: kill switches, monitors, and blame-free stops so anyone can halt an AI agent in time." },
  "rail-logged":      { md: "rail-logged.md",         out: "rail-logged.html",         label: "Logged",
    title: "AI Agent Logging, Identity & Provenance (RAIL) · LoopRails",
    desc: "Logged, the L in RAIL: identity providers, sub-agent provenance, and tamper-evident records that let you prove oversight works." },
};

// long-form SEO articles, generated with Article schema and listed on articles.html
const ARTICLES = {
  "article-what-is-human-in-the-loop": { md: "article-what-is-human-in-the-loop.md", out: "article-what-is-human-in-the-loop.html",
    label: "What Is Human-in-the-Loop (HITL) in AI?",
    title: "What Is Human-in-the-Loop (HITL) in AI? A Guide · LoopRails",
    desc: "Human-in-the-loop (HITL) means a person reviews or can intervene in an AI system's actions. A practical guide to HITL for AI agents, what it is, when it works, and when to prevent instead." },
  "article-hitl-ai-safety": { md: "article-hitl-ai-safety.md", out: "article-hitl-ai-safety.html",
    label: "Does Human-in-the-Loop Improve AI Safety?",
    title: "Does Human-in-the-Loop Improve AI Safety? · LoopRails",
    desc: "Does keeping a human in the loop actually make AI agents safer? The evidence, when HITL helps, when it's false safety, and what real AI agent safety looks like." },
  "article-in-the-loop-vs-on-the-loop": { md: "article-in-the-loop-vs-on-the-loop.md", out: "article-in-the-loop-vs-on-the-loop.html",
    label: "In-the-Loop vs On-the-Loop vs Out-of-the-Loop",
    title: "Human-in-the-Loop vs On-the-Loop vs Out-of-the-Loop · LoopRails",
    desc: "Human-in-the-loop, human-on-the-loop, and out-of-the-loop explained: definitions, tradeoffs, the sudden-handoff problem, and how to choose oversight for AI agents." },
  "article-ai-agent-approval": { md: "article-ai-agent-approval.md", out: "article-ai-agent-approval.html",
    label: "When Should an AI Agent Ask for Approval?",
    title: "When Should an AI Agent Ask for Human Approval? · LoopRails",
    desc: "When AI agents should ask for human approval, and how to build approval gates that catch mistakes instead of becoming rubber stamps. Graded examples G0-G3." },
  "article-lethal-trifecta": { md: "article-lethal-trifecta.md", out: "article-lethal-trifecta.html",
    label: "The Lethal Trifecta: How AI Agents Leak Data",
    title: "The Lethal Trifecta: How AI Agents Leak Data · LoopRails",
    desc: "The lethal trifecta, private data + untrusted content + an exfiltration channel, lets prompt injection steal data from AI agents. How it works and how to stop it." },
  "article-ai-agent-guardrails": { md: "article-ai-agent-guardrails.md", out: "article-ai-agent-guardrails.html",
    label: "AI Agent Guardrails: A Practical Checklist",
    title: "AI Agent Guardrails: A Practical Checklist · LoopRails",
    desc: "A practical AI agent guardrails checklist: sandboxing, least privilege, blast-radius caps, kill switches, circuit breakers, logging, and maker-checker, matched to risk." },
  "article-ai-agent-autonomy-levels": { md: "article-ai-agent-autonomy-levels.md", out: "article-ai-agent-autonomy-levels.html",
    label: "AI Agent Autonomy Levels (L0-L6)",
    title: "AI Agent Autonomy Levels: From Logged to Locked Down · LoopRails",
    desc: "AI agent autonomy levels explained: the L0-L6 ladder from silent autonomy to escalate-or-forbid, and how to pick the right level for each action by risk." },
  "article-prompt-injection-prevention": { md: "article-prompt-injection-prevention.md", out: "article-prompt-injection-prevention.html",
    label: "Prompt Injection Prevention",
    title: "Prompt Injection Prevention: A Defense-in-Depth Guide · LoopRails",
    desc: "How to prevent prompt injection in AI agents: why filtering fails, and a defense-in-depth approach, least privilege, runtime shields, sandboxing, and removing a lethal-trifecta leg." },
  "article-maker-checker-ai": { md: "article-maker-checker-ai.md", out: "article-maker-checker-ai.html",
    label: "Maker-Checker (Four-Eyes) for AI Agents",
    title: "Maker-Checker (Four-Eyes) for AI Agents · LoopRails",
    desc: "Maker-checker and the four-eyes principle for AI agents: why the proposer shouldn't be the approver, which actions need it, and how to implement it without rubber-stamping." },
  "article-automation-bias": { md: "article-automation-bias.md", out: "article-automation-bias.html",
    label: "Automation Bias: Why People Rubber-Stamp AI",
    title: "Automation Bias: Why People Rubber-Stamp AI · LoopRails",
    desc: "Automation bias is why human-in-the-loop oversight of AI fails: people over-trust the system and approve without scrutiny. The evidence, and how to design against it." },
  "article-ai-kill-switch": { md: "article-ai-kill-switch.md", out: "article-ai-kill-switch.html",
    label: "How to Build an AI Kill Switch",
    title: "How to Build an AI Kill Switch · LoopRails",
    desc: "What an AI kill switch is, why every agent needs one, and how to design one that stops everything in flight, fast, reachable by anyone, and blame-free." },
  "article-llm-agent-skills-credential-leak": { md: "article-llm-agent-skills-credential-leak.md", out: "article-llm-agent-skills-credential-leak.html",
    label: "Study: How AI Agent Skills Leak Credentials",
    title: "Study: How AI Agent \"Skills\" Leak Your Credentials · LoopRails",
    desc: "A 2026 study analyzed 17,022 AI agent skills and found rampant credential leaks, mostly via debug logging, during routine use. What it found and how to prevent it." },
  "article-llm-compiler-loop-optimization": { md: "article-llm-compiler-loop-optimization.md", out: "article-llm-compiler-loop-optimization.html",
    label: "Study: A Compiler as the Verifier",
    title: "Study: LLM-Guided Loop Optimization with Compiler Feedback (ComPilot) · LoopRails",
    desc: "A 2025 study (ComPilot) put an off-the-shelf LLM in a loop with a compiler that checked legality and measured speedup, and the model refined: 2.66x single-run, 3.54x best-of-5, no fine-tuning. A measured proof of loop plus an independent verifier." },
  "article-agentic-loops-in-the-wild": { md: "article-agentic-loops-in-the-wild.md", out: "article-agentic-loops-in-the-wild.html",
    label: "Agentic Loops in the Wild: Wins, Failures, Cost",
    title: "Agentic Loops in the Wild: What Works, What Fails, and What It Costs · LoopRails",
    desc: "Real agentic-loop results woven together: DeepSeek-R1, AlphaCodium, o3 on ARC-AGI, SWE-agent, and the failures (reward hacking, the AI Scientist, GAIA, WebArena). The wins share an ungameable verifier and pay for compute; the failures lack one." },
  "article-ai-agent-sandboxing": { md: "article-ai-agent-sandboxing.md", out: "article-ai-agent-sandboxing.html",
    label: "AI Agent Sandboxing",
    title: "AI Agent Sandboxing: Contain the Blast Radius · LoopRails",
    desc: "What AI agent sandboxing is and why it beats per-action approval prompts: no-network containers, scoped credentials, resource caps, and disposable environments." },
  "article-least-privilege-ai-agents": { md: "article-least-privilege-ai-agents.md", out: "article-least-privilege-ai-agents.html",
    label: "Least Privilege for AI Agents",
    title: "Least Privilege for AI Agents: Grant Only What the Task Needs · LoopRails",
    desc: "Least privilege for AI agents: give an agent only the tools, data, and credentials it needs, and why removing a capability beats forbidding its use." },
  "article-circuit-breaker-ai-agents": { md: "article-circuit-breaker-ai-agents.md", out: "article-circuit-breaker-ai-agents.html",
    label: "The Circuit Breaker Pattern for AI Agents",
    title: "The Circuit Breaker Pattern for AI Agents · LoopRails",
    desc: "A circuit breaker auto-pauses an AI agent when error rate, spend, or volume crosses a threshold, and requires human re-authorization to resume. How to build one." },
  "article-what-is-agentic-ai": { md: "article-what-is-agentic-ai.md", out: "article-what-is-agentic-ai.html",
    label: "What Is Agentic AI?",
    title: "What Is Agentic AI? And Why Oversight Has to Change · LoopRails",
    desc: "Agentic AI explained: how AI agents plan and take actions with tools, what makes them powerful and risky, and why overseeing them means governing actions, not outputs." },
  "article-hitl-coding-agents": { md: "article-hitl-coding-agents.md", out: "article-hitl-coding-agents.html",
    label: "Human-in-the-Loop for AI Coding Agents",
    title: "How to Build a Good Human-in-the-Loop for AI Coding Agents · LoopRails",
    desc: "How to build human-in-the-loop oversight for AI coding agents: grade reads, edits, commits, merges, and shell actions G0-G3, and match the right control to each." },
  "article-hitl-customer-support": { md: "article-hitl-customer-support.md", out: "article-hitl-customer-support.html",
    label: "Human-in-the-Loop for AI Customer Support",
    title: "How to Build a Good Human-in-the-Loop for AI Customer Support · LoopRails",
    desc: "How to build human-in-the-loop oversight for AI customer support agents: value-conditional approval for refunds, review for outbound replies, and escalation done right." },
  "article-hitl-financial-transactions": { md: "article-hitl-financial-transactions.md", out: "article-hitl-financial-transactions.html",
    label: "Human-in-the-Loop for AI Financial Transactions",
    title: "How to Build a Good Human-in-the-Loop for AI Financial Transactions · LoopRails",
    desc: "How to build human-in-the-loop oversight for AI agents that move money: maker-checker, value thresholds, circuit breakers, and kill switches for irreversible payments." },
  "article-hitl-database-operations": { md: "article-hitl-database-operations.md", out: "article-hitl-database-operations.html",
    label: "Human-in-the-Loop for AI Database Operations",
    title: "How to Build a Good Human-in-the-Loop for AI Database Operations · LoopRails",
    desc: "How to build human-in-the-loop oversight for AI agents that run SQL: read-only by default, dry-runs, least privilege, backups, and maker-checker for prod schema changes." },
  "article-hitl-email-agents": { md: "article-hitl-email-agents.md", out: "article-hitl-email-agents.html",
    label: "Human-in-the-Loop for AI Email & Messaging",
    title: "How to Build a Good Human-in-the-Loop for AI Email & Outbound Messaging · LoopRails",
    desc: "How to build human-in-the-loop oversight for AI agents that send email and messages: undo-send windows, previews, rate caps, and approval for external or bulk sends." },
  "article-hitl-deployments": { md: "article-hitl-deployments.md", out: "article-hitl-deployments.html",
    label: "Human-in-the-Loop for AI Deployments",
    title: "How to Build a Good Human-in-the-Loop for AI-Driven Deployments · LoopRails",
    desc: "How to build human-in-the-loop oversight for AI-driven deployments: canary plus automatic rollback, circuit breakers, and a kill switch instead of a rubber-stamp approval." },
  "article-hitl-content-moderation": { md: "article-hitl-content-moderation.md", out: "article-hitl-content-moderation.html",
    label: "Human-in-the-Loop for AI Content Moderation",
    title: "How to Build a Good Human-in-the-Loop for AI Content Moderation · LoopRails",
    desc: "How to build human-in-the-loop oversight for AI content moderation: confidence-based routing, reversible removals, appeals as escalation, and avoiding reviewer fatigue." },
  "article-hitl-machine-learning": { md: "article-hitl-machine-learning.md", out: "article-hitl-machine-learning.html",
    label: "Human-in-the-Loop for Machine Learning",
    title: "Human-in-the-Loop for Machine Learning (Labeling & Active Learning) · LoopRails",
    desc: "Human-in-the-loop machine learning explained: labeling, active learning, low-confidence review, and RLHF, how to route human effort by uncertainty and keep label quality high." },
  "article-hitl-healthcare": { md: "article-hitl-healthcare.md", out: "article-hitl-healthcare.html",
    label: "Human-in-the-Loop for AI in Healthcare",
    title: "How to Build a Good Human-in-the-Loop for AI in Healthcare · LoopRails",
    desc: "How to design human-in-the-loop oversight for clinical AI: keep a licensed clinician in command, fight alert fatigue, and reserve autonomy for low-stakes actions." },
  "article-hitl-legal-contracts": { md: "article-hitl-legal-contracts.md", out: "article-hitl-legal-contracts.html",
    label: "Human-in-the-Loop for AI Legal Work",
    title: "How to Build a Good Human-in-the-Loop for AI Legal & Contract Work · LoopRails",
    desc: "How to design human-in-the-loop oversight for AI legal and contract work: verify citations, attorney sign-off, maker-checker for execution, and treating documents as untrusted." },
  "article-hitl-hiring": { md: "article-hitl-hiring.md", out: "article-hitl-hiring.html",
    label: "Human-in-the-Loop for AI Hiring",
    title: "How to Build a Good Human-in-the-Loop for AI Hiring & Recruiting · LoopRails",
    desc: "How to design human-in-the-loop oversight for AI hiring: keep a human deciding advance/reject, audit for bias, and never auto-reject candidates at scale." },
  "article-hitl-browser-agents": { md: "article-hitl-browser-agents.md", out: "article-hitl-browser-agents.html",
    label: "Human-in-the-Loop for Browser & Computer-Use Agents",
    title: "How to Build a Good Human-in-the-Loop for Browser & Computer-Use Agents · LoopRails",
    desc: "How to design human-in-the-loop oversight for browser and computer-use agents: sandboxing, breaking the lethal trifecta, spend caps, and prompt-injection defense." },
  "article-hitl-voice-agents": { md: "article-hitl-voice-agents.md", out: "article-hitl-voice-agents.html",
    label: "Human-in-the-Loop for AI Voice Agents",
    title: "How to Build a Good Human-in-the-Loop for AI Voice Agents · LoopRails",
    desc: "How to design human-in-the-loop oversight for real-time AI voice agents: limit capabilities, verbal confirmation, and warm handoff to a human for high-stakes calls." },
  "article-hitl-multi-agent-systems": { md: "article-hitl-multi-agent-systems.md", out: "article-hitl-multi-agent-systems.html",
    label: "Human-in-the-Loop for Multi-Agent Systems",
    title: "How to Build a Good Human-in-the-Loop for Multi-Agent Systems · LoopRails",
    desc: "How to design human-in-the-loop oversight for multi-agent systems: least privilege per sub-agent, provenance logging, one kill switch, and clear human accountability." },
  "article-loop-engineering-doctrine": { md: "article-loop-engineering-doctrine.md", out: "article-loop-engineering-doctrine.html",
    label: "The LoopRails Doctrine",
    title: "The LoopRails Doctrine: Principles of Loop Engineering · LoopRails",
    desc: "Ten principles for building agent loops that are fast to build and safe to run: a checkable done-condition, an independent verifier, caps, memory in a file, maker-checker, action grading, and guardrails on by default." },
  "article-loop-engineering": { md: "article-loop-engineering.md", out: "article-loop-engineering.html",
    label: "What Is Loop Engineering?",
    title: "What Is Loop Engineering? From Prompts to Loops · LoopRails",
    desc: "Loop engineering means building a system that prompts an AI agent, checks its output, and decides the next step until a goal is met. The prompts-to-loops ladder, and why the verifier is the hard part." },
  "article-build-agent-loop": { md: "article-build-agent-loop.md", out: "article-build-agent-loop.html",
    label: "How to Build Your First Agent Loop",
    title: "How to Build Your First Agent Loop · LoopRails",
    desc: "A practical guide to building your first AI agent loop: goal and done-conditions, the verifier, memory in a file, writer and reviewer subagents, and guardrails on by default." },
  "article-loop-patterns": { md: "article-loop-patterns.md", out: "article-loop-patterns.html",
    label: "Loop Patterns for Engineering & Data Science",
    title: "Loop Patterns for Engineering and Data Science · LoopRails",
    desc: "Reusable agent-loop recipes for software and data science: test-fixing, refactor, dependency-upgrade, data-cleaning, and experiment loops, each with a goal, a done-condition, and a verifier." },
  "article-evaluation-driven-development": { md: "article-evaluation-driven-development.md", out: "article-evaluation-driven-development.html",
    label: "Evaluation-Driven Development",
    title: "Evaluation-Driven Development: The Verifier Is the Point · LoopRails",
    desc: "In an autonomous loop, an automated check, not your gut, decides whether each change improved things. How evaluation-driven development works and how to build a verifier you can trust." },
  "article-loop-engineering-oversight": { md: "article-loop-engineering-oversight.md", out: "article-loop-engineering-oversight.html",
    label: "Oversight for Autonomous Loops",
    title: "How to Keep an Autonomous Loop on the Rails · LoopRails",
    desc: "Loop engineering moves oversight from per-step prompts to the goal, the verifier, and a few human checkpoints. How to grade a loop's actions, cap its blast radius, and stop it when it runs away." },
  "article-context-engineering-agent-loops": { md: "article-context-engineering-agent-loops.md", out: "article-context-engineering-agent-loops.html",
    label: "Context Engineering for Agent Loops",
    title: "Context Engineering for Agent Loops: Keep the Loop Effective · LoopRails",
    desc: "Context engineering means deciding what goes into the model's window each turn: the goal, the done-condition, and what to keep, drop, summarize, and retrieve. How to keep an agent loop effective across many turns instead of drifting." },
  "article-loop-health-monitoring": { md: "article-loop-health-monitoring.md", out: "article-loop-health-monitoring.html",
    label: "Loop Health: What to Monitor in a Running Loop",
    title: "Loop Health: What to Monitor in a Running Agent Loop · LoopRails",
    desc: "Which signals tell you an agent loop is working, stuck, or burning money: turns, spend per successful outcome, the verifier-score trend, the no-progress streak, and the thresholds that feed the circuit breaker and kill switch." },
  "article-world-models-agent-loops": { md: "article-world-models-agent-loops.md", out: "article-world-models-agent-loops.html",
    label: "World Models for Agent Loops",
    title: "World Models for Agent Loops: Simulate Before You Act · LoopRails",
    desc: "A world model predicts what an action will do before the loop runs it. How to use simulation as a consequence preview, a planning aid, and an offline eval, and why a prediction is a claim to verify, not proof." },
  "article-failure-recovery-agent-loops": { md: "article-failure-recovery-agent-loops.md", out: "article-failure-recovery-agent-loops.html",
    label: "Failure Recovery for Agent Loops",
    title: "Failure Recovery for Agent Loops: Retries, Rollback, Resuming a Crashed Run · LoopRails",
    desc: "How to make an agent loop survive its own failures: durable checkpoints and resume, idempotent retries with backoff, a circuit breaker, verifier-gated retries, and saga-style rollback for irreversible actions." },
  "article-multi-agent-loops": { md: "article-multi-agent-loops.md", out: "article-multi-agent-loops.html",
    label: "Multi-Agent Loops: When More Agents Help",
    title: "Multi-Agent Loops: When More Agents Help, and How They Break · LoopRails",
    desc: "When splitting a loop across multiple agents helps and when it just adds failure surface: the patterns that work, the MAST failure taxonomy, the reviewer-agent trap, and the oversight each sub-agent needs." },
  "article-mcp-skill-overload": { md: "article-mcp-skill-overload.md", out: "article-mcp-skill-overload.html",
    label: "MCP and Skill Overload",
    title: "MCP and Skill Overload: How the Number of Tools Affects Accuracy · LoopRails",
    desc: "Every tool, MCP server, and skill you connect spends context and lowers tool-selection accuracy. What the research says about too many tools, how it cuts your useful turns, and how to keep the toolset lean." },
  "article-agent-workflow-patterns": { md: "article-agent-workflow-patterns.md", out: "article-agent-workflow-patterns.html",
    label: "Agent Workflow Patterns",
    title: "Agent Workflow Patterns: Chaining, Routing, Orchestration · LoopRails",
    desc: "A plain-English recipe book of agent workflow patterns: prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer, with the failure modes of each and how to fix them." },
  "article-autonomous-agent-patterns": { md: "article-autonomous-agent-patterns.md", out: "article-autonomous-agent-patterns.html",
    label: "Autonomous Agent Patterns",
    title: "Autonomous Agent Patterns: ReAct, Reflection, Tools, Memory · LoopRails",
    desc: "A plain-English recipe book of autonomous agent patterns: ReAct, reflection, plan-and-execute, tool use, memory, and single vs multi-agent, with the failure modes of each and how to fix them." },
  "article-rag-retrieval-patterns": { md: "article-rag-retrieval-patterns.md", out: "article-rag-retrieval-patterns.html",
    label: "RAG Retrieval Patterns",
    title: "RAG Retrieval Patterns: Chunking, Hybrid Search, Reranking · LoopRails",
    desc: "A plain-English recipe book for RAG retrieval: chunking, embeddings and vector search, hybrid search, reranking, query transformation, and metadata filtering, with the failure modes of each and how to fix them." },
  "article-advanced-agentic-rag": { md: "article-advanced-agentic-rag.md", out: "article-advanced-agentic-rag.html",
    label: "Advanced and Agentic RAG",
    title: "Advanced and Agentic RAG: Contextual, Corrective, Self-RAG, GraphRAG · LoopRails",
    desc: "A plain-English recipe book for advanced RAG: contextual retrieval, agentic RAG, corrective RAG, self-RAG, GraphRAG, and how to evaluate a RAG system, with the failure modes of each and how to fix them." },
  "article-lora-vs-fine-tuning-vs-pre-training": { md: "article-lora-vs-fine-tuning-vs-pre-training.md", out: "article-lora-vs-fine-tuning-vs-pre-training.html",
    label: "LoRA vs Fine-Tuning vs Pre-Training",
    title: "LoRA vs Fine-Tuning vs Pre-Training: When Each Makes Sense · LoopRails",
    desc: "What LoRA, full fine-tuning, and pre-training each change in a model, what they cost, and when to reach for each when adapting a model for an agent loop. Plus why retrieval often beats fine-tuning." },
  "article-adapting-models-you-dont-control": { md: "article-adapting-models-you-dont-control.md", out: "article-adapting-models-you-dont-control.html",
    label: "What You Can & Can't Do With Models You Don't Control",
    title: "What You Can and Can't Do With Models You Don't Control · LoopRails",
    desc: "Closed API models (Claude, GPT, Gemini) versus open-weight models (Llama, Mistral, Gemma): what each lets you change, what it takes off the table, and how that choice shapes the loop you build." },
};

const ALL = { ...DOCS, ...ARTICLES };

const ARTICLE_PUB = "2026-06-23";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const humanDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
// inject an author byline directly under the article's <h1>
function injectByline(html, dateISO) {
  const byline = `<p class="byline">By <a href="https://www.linkedin.com/in/brennhill/" rel="author">Brenn Hill</a> · <time datetime="${dateISO}">${humanDate(dateISO)}</time></p>`;
  return html.replace(/<\/h1>/, (m) => m + "\n" + byline);
}

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
  for (let i = 1; i < all.length && pick.length < 5; i++) pick.push(all[(idx + i) % all.length]);
  const items = pick.map(k => `<li><a href="${ARTICLES[k].out}">${esc(ARTICLES[k].label)}</a></li>`).join("");
  return `<aside class="related"><h2>Related reading</h2><ul>${items}</ul><p class="related-all"><a href="articles.html">All articles →</a> · <a href="https://braceframework.org" title="Security for autonomous AI agents">Securing the agent itself? See BRACE ↗</a></p></aside>`;
}

// Cross-link security-relevant articles to BRACE (which secures the agent itself).
const BRACE_SECURE = {
  "article-rag-retrieval-patterns": `Retrieved documents are untrusted input. A poisoned, stale, or attacker-controlled page in your index can carry a prompt injection straight into the model, and the index itself is an attack surface worth its own integrity checks. Securing the agent that reads them is a separate job: see the <a href="article-lethal-trifecta.html">lethal trifecta</a> and the <a href="https://braceframework.org">BRACE Framework</a>, which treats all external input as untrusted.`,
  "article-advanced-agentic-rag": `Agentic RAG fetches from the open web and chooses its own queries, so it pulls untrusted content into the loop on purpose. Pair it with <a href="article-prompt-injection-prevention.html">prompt-injection defense</a> and the <a href="https://braceframework.org">BRACE Framework</a>, which treats retrieved and tool data as untrusted and contains the blast radius.`,
  "article-autonomous-agent-patterns": `Tool use is where an agent reaches real systems, so it needs least privilege, capability-scoped tokens, and a sandbox, not trust. See <a href="article-least-privilege-ai-agents.html">least privilege for AI agents</a> and the <a href="https://braceframework.org">BRACE Framework</a> (capability-scoped access, a hardened harness, a tested kill switch).`,
  "article-agent-workflow-patterns": `Even a fixed workflow calls tools and models that touch real systems. Scope what each step can do and contain failures with the <a href="https://braceframework.org">BRACE Framework</a>, the security counterpart that secures the agent's configuration and infrastructure.`,
  "article-multi-agent-loops": `Every sub-agent is a new identity and a new attack surface, and one agent's output is untrusted input to the next. Give each least privilege, isolate them, and keep sub-agent provenance: see <a href="article-hitl-multi-agent-systems.html">oversight for multi-agent systems</a> and the <a href="https://braceframework.org">BRACE Framework</a>.`,
  "article-failure-recovery-agent-loops": `Recovery leans on the audit log and checkpoints, so their integrity matters: a tampered log or a non-idempotent replay is its own risk. The <a href="https://braceframework.org">BRACE Framework</a> covers the audit trail and a kill switch that leaves a safe state.`,
  "article-mcp-skill-overload": `Every MCP server and skill you connect is third-party code and a new attack surface, and a connected tool can carry an injection or leak a secret. Vet and scope what you connect: see <a href="article-llm-agent-skills-credential-leak.html">how agent skills leak credentials</a> and the <a href="https://braceframework.org">BRACE Framework</a> (capability-scoped access, a hardened harness).`,
};
function securingNote(key) {
  if (!BRACE_SECURE[key]) return "";
  return `<aside class="securing"><h2>Securing it</h2><p>${BRACE_SECURE[key]}</p></aside>`;
}

function page(key, d, contentHTML, toc) {
  const title = d.title || `${stripTags(d.label).replace(/ ·.*/, "")} · LoopRails`;
  const url = `${SITE}/${d.out}`;
  const ogimg = `${SITE}/og-${key}.png`;
  const isArticle = key.startsWith("article-");
  if (isArticle) contentHTML = injectByline(contentHTML, ARTICLE_PUB);
  const relatedBlock = isArticle ? relatedReading(key) : "";
  const braceBlock = isArticle ? securingNote(key) : "";
  const crumbHTML = isArticle
    ? `<a href="index.html">LoopRails</a> · <a href="articles.html">Articles</a> · ${esc(stripTags(d.label))}`
    : `<a href="index.html">LoopRails</a> · ${esc(stripTags(d.label))}`;
  const breadcrumb = isArticle
    ? [["LoopRails", SITE + "/"], ["Articles", SITE + "/articles.html"], [stripTags(d.label), url]]
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
      ${contentHTML}
    </div>
    ${braceBlock}
    ${relatedBlock}
  </main>
</div>
${NEWSLETTER}
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
    const link = `${SITE}/${a.out}`;
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
  const url = `${SITE}/articles.html`;
  const title = "Articles on Human-in-the-Loop & AI Agent Safety · LoopRails";
  const desc = "Practical articles on human-in-the-loop oversight and AI agent safety: HITL explained, when agents should ask for approval, the lethal trifecta, AI agent guardrails, and more.";
  const items = Object.values(ARTICLES);
  const CATS = [
    ["The LoopRails Doctrine", ["article-loop-engineering-doctrine"]],
    ["Build a loop", ["article-loop-engineering", "article-build-agent-loop", "article-context-engineering-agent-loops", "article-mcp-skill-overload", "article-loop-patterns", "article-evaluation-driven-development", "article-world-models-agent-loops", "article-multi-agent-loops"]],
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
    "itemListElement": items.map((a, i) => ({ "@type": "ListItem", "position": i + 1, "url": `${SITE}/${a.out}`, "name": a.label }))
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
    <p>Practical, sourced writing on how to oversee AI agents, when a human in the loop helps, when it's just a rubber stamp, and how to design oversight that actually catches mistakes. <a href="feed.xml">Subscribe via RSS ↗</a></p>
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
  fs.writeFileSync(path.join(__dirname, d.out), page(key, d, html, toc));
  built.push(d.out);
}

fs.writeFileSync(path.join(__dirname, "articles.html"), articlesIndexPage());
built.push("articles.html");

fs.writeFileSync(path.join(__dirname, "feed.xml"), rssFeed());
built.push("feed.xml");

// sitemap + robots
const urls = ["", "articles.html", "cheatsheet.html", ...Object.values(ALL).map(d => d.out)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}/${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(__dirname, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log("Built " + built.length + " doc pages:\n  " + built.join("\n  "));
console.log("Wrote sitemap.xml + robots.txt");
