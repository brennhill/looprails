# Codex: Human-in-the-Loop Design for Agentic AI

> A living research reference assembled to ground the design of human-in-the-loop (HITL)
> behavior for agentic LLM systems (coding agents, copilots, autonomous assistants).
> It captures (1) what is known to work, (2) what people tried that failed, and
> (3) the deeper ergonomics / human-factors / HCI traditions we can draw on.
>
> **Scope decision (2026-06-22):** center of gravity is *agentic LLM tools*: approvals,
> interrupts, plan/preview, oversight of autonomous action, with classical automation,
> human-factors, and HCI literature treated as transferable foundations. The codex is
> meant to serve *both* as a cited research synthesis and as the substrate for an
> actionable design framework (proposed separately).

---

## How to read this codex

- **Part I** covers HITL specifically for AI/ML and agentic systems, plus governance mandates.
- **Part II** covers the foundational ergonomics, human-factors, automation, and HCI literature.
- **Part III** covers the theory of delegation, organization, and resilience (the principal-agent
  problem, management/military delegation doctrine, resilience engineering/HRO, and human-agent teaming).
- **Part IV** mines other industries for concrete, battle-tested oversight *mechanisms*
  (manufacturing & process safety; finance & security).
- **Part V** turns to the human side and the *design of a single loop episode* (the cognition of
  advice & decision fatigue; the anatomy of an oversight moment; sociotechnical context & workflow precedents).
- Each thematic section opens with **Highlights** (the load-bearing takeaways) followed by an
  **Annotated bibliography**.

### Citation conventions

References are recorded in an academic, lightly-numbered style, grouped by theme:

> **[§-n] Author(s) (Year).** *Title*. Venue / Publisher. URL or DOI.
> Annotation: core contribution; what worked / what failed; relevance to agentic-LLM HITL.

Empirical findings are distinguished from opinion/position pieces. Documented failures and
anti-patterns are recorded alongside successes by design: knowing what *didn't* work is half
the point of this codex.

---

# Part I: Human-in-the-Loop for AI

_(Annotated bibliography + highlights assembled below.)_

## I.A: Agentic LLM HITL patterns (industry & framework practice)

_How current agentic systems actually implement oversight. Tags: **[VENDOR]** primary docs · **[PRACTITIONER]** essay/postmortem · **[EMPIRICAL]** study._

### Highlights

- **Default to "ask," make "act" an explicit, graduated opt-in.** Every mature system (Claude Code, Copilot, Cursor, Operator) gates writes/side-effects by default and exposes a deliberate ladder to autonomy (`acceptEdits` → `bypassPermissions`; `/yolo`; auto-approve toggles). Trust is loosened *over time / within a session*, not granted up front [A-2, A-5, A-13].
- **The converged HITL primitive is interrupt → {approve / edit / reject / respond} → resume, built on durable state.** LangGraph, OpenAI Agents SDK, Google ADK, CrewAI, and Vercel all implement this; the non-negotiable substrate is a checkpointer/persistence layer: HITL and pause/resume are the same feature [A-8, A-7, A-10, A-11, A-12].
- **Approval gates reduce bad *actions* but do NOT make humans good at *catching* them.** Strongest empirical result here: plan-approval cut attack occurrence to 60-74% (from ~90%) yet intervention success stayed **9-26%** across all strategies: failure is rationalization/normalization (a "recognition bottleneck"), not inattention [A-17].
- **ANTI-PATTERN: rubber-stamping / automation bias.** Even motivated expert developers default to heuristic, shallow review under productivity pressure; "safety contingent on developer oversight" does not scale and externalizes correction cost onto the human [A-18, A-21].
- **ANTI-PATTERN: string-matching command denylists / client-side approvals as a security boundary.** Cursor's denylist was bypassed ≥4 ways (base64, subshells, generated scripts, quoting); Vercel documents that `needsApproval` is a UX affordance, forgeable via replayed history unless cryptographically bound. Pattern-matching guardrails are not sandboxes [A-14, A-12].
- **Sandbox the environment instead of gating every action.** Practitioner consensus for high-autonomy work: no-network containers, disposable cloud machines, scoped test/staging credentials, budget caps: move the safety boundary off the per-action prompt [A-23, A-3, A-1].
- **The "lethal trifecta" decides when an agent must NOT run unsupervised [A-23]:** private-data access + untrusted-content exposure + external-communication ≈ guaranteed exfiltration via prompt injection. Removing any one leg (read-only, no network) is the cheapest guardrail.
- **Undo/rollback has a hard boundary at the shell [A-4].** Claude Code checkpoints structured edits but cannot undo Bash side-effects (`rm`/`mv`/`cp`): the most destructive ops sit outside the recovery net.
- **Models are genuinely weak at mid-task steering, cancellation, and re-planning [A-19, A-16].** "Steerable"/"interruptible" are model-capability claims, not just UI claims.
- **Risk-tier tools to decide *what* to gate [A-6, A-12, A-5].** read-vs-write, reversibility, permissions, financial impact → low/med/high → auto-run the trivial, gate the consequential (e.g., value-conditional approval >$1000).
- **Escalation-to-human as a first-class control, plus AI-supervising-AI for scale [A-15, A-6, A-10].** Treat the human as the escalation tier with a generated handoff summary: "human-on-the-loop," not per-turn "in-the-loop."
- **Plan-then-confirm and disambiguate-before-acting is what expert users actually want [A-20, A-22].** Preview/diff-before-apply (plan mode) and clarifying questions before execution recur as the highest-trust pattern.
- **Permission-rule precedence and inheritance are subtle and load-bearing [A-2].** Order matters (hooks → deny → ask → mode → allow → callback); allow-lists don't constrain bypass mode; subagents silently inherit a parent's bypass/acceptEdits: misconfiguration quietly grants more autonomy than intended.

### Annotated bibliography

**[A-1] Anthropic (2024). [PRACTITIONER]** *Building Effective Agents.* Anthropic Engineering. https://www.anthropic.com/engineering/building-effective-agents
Distinguishes workflows from agents; minimal agent = "model + tools + system prompt in a loop." Frames HITL: pause at checkpoints/blockers, human-set stopping conditions (max-iteration caps). *Worked:* agent-computer-interface (ACI) design, "poka-yoke" tools, sandboxed testing, read-only as a cheap guardrail. *Limit:* autonomy → higher cost + compounding errors; HITL/read-only also cap scaling. *Relevance:* canonical statement of the autonomy-vs-control tradeoff and "pause at checkpoints."

**[A-2] Anthropic (2026). [VENDOR]** *Configure Permissions (Claude Agent SDK).* https://code.claude.com/docs/en/agent-sdk/permissions
Most precise published permission spec: six-step pipeline **Hooks → Deny → Ask → Mode → Allow → `canUseTool`**, modes `default/acceptEdits/dontAsk/bypassPermissions/plan/auto`. *Worked:* deny/ask override even `bypassPermissions`; dynamic mode escalation mid-session. *Pitfalls (documented):* `allowed_tools` does NOT constrain `bypassPermissions`; subagents inherit bypass/acceptEdits and can't be re-tightened. *Relevance:* reference implementation of allow/deny/ask precedence: ordering and bare-name vs scoped rules change the safety semantics.

**[A-3] Anthropic (2026). [PRACTITIONER]** *How We Built Claude Code Auto Mode: A Safer Way to Skip Permissions.* https://www.anthropic.com/engineering/claude-code-auto-mode
Two-layer classifier defense (input prompt-injection probe + output transcript classifier with fast single-token filter escalating to chain-of-thought). *Worked:* blocks "overeager behavior," "credential exploration," "scope escalation." *Limit:* **17% false-negative** on real overeager actions; classifier deliberately blinded to assistant reasoning/tool outputs (prevents "talking it into" approval but sacrifices provenance). *Relevance:* rare quantified data on automated gates substituting for the human, and an admission they don't fully replace one.

**[A-4] Anthropic (2025). [VENDOR]** *Checkpointing (Claude Code): /rewind.* https://code.claude.com/docs/en/checkpointing
Automatic per-edit snapshots; `/rewind` (Esc-Esc) restores code+conversation / conversation-only / code-only. *Worked:* transparent undo enables ambitious tasks; decoupling code-state from chat-state. *Critical limit:* does NOT track files changed by Bash (`rm`,`mv`,`cp`): the most destructive ops are outside the undo boundary. *Relevance:* rollback pattern + its sharp boundary (undo covers structured edits, not shell side-effects).

**[A-5] OpenAI (2025). [VENDOR + safety]** *Introducing Operator* & *Operator System Card.* https://openai.com/index/introducing-operator/ · https://openai.com/index/operator-system-card/
Computer-use agent, three-layer oversight: autonomous by default; **user-confirmation gates** before side-effecting actions (Purchase/Send/Delete); **Takeover Mode** blacks out model vision on password/CC fields; refuses high-stakes categories. *Limit:* oversight concentrated at agent-chosen moments: missed risk depends on the agent's own risk detection. *Relevance:* reference design for "act autonomously, ask only at consequential moments" + sensitive-field takeover.

**[A-6] OpenAI (2025). [PRACTITIONER]** *A Practical Guide to Building Agents.* (PDF) https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
Risk-rate every tool (read-vs-write, reversibility, permissions, financial impact) to drive pause/escalation; "human intervention" as graceful control-transfer; matters most early to surface edge cases; layered guardrails (input → tool → HITL). *Limit:* prescriptive, not evaluated. *Relevance:* the canonical "risk-tier your tools, gate the high-risk" rubric.

**[A-7] OpenAI Agents SDK (2026). [VENDOR]** *Guardrails and Human Review.* https://developers.openai.com/api/docs/guides/agents/guardrails-approvals
Tools set `needsApproval`; runs pause and surface `interruptions`; host calls `approve()`/reject and resumes from saved state. Input/output/tool guardrails with a defined firing order (tool-input guardrails run *after* approval by default; a flag inverts this). *Relevance:* the interrupt-inspect-resolve-resume loop as a first-class SDK primitive.

**[A-8] LangChain/LangGraph (2026). [VENDOR]** *Human-in-the-Loop.* https://docs.langchain.com/oss/python/langchain/human-in-the-loop
Most-copied HITL abstraction: `interrupt()` pauses a graph node and returns a payload; four decision types **approve / edit / reject / respond**; resume via `Command(resume=...)`. Requires a checkpointer (HITL built on durable persistence). *Worked:* `when` predicates gate only risky calls; structured rejection feedback. *Limit:* heavy arg edits can trigger re-evaluation/re-runs; decision ordering must match action ordering. *Relevance:* the de-facto approve/edit/reject/respond vocabulary others mirror.

**[A-9] Microsoft AutoGen (2025). [VENDOR]** *Human-in-the-Loop / UserProxyAgent.* https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.html
Models the human as an agent (`UserProxyAgent`) with a pluggable `input_func` (console/websocket/Slack); legacy `human_input_mode`: **NEVER / TERMINATE / ALWAYS**. *Relevance:* HITL as a *participant* in a multi-agent conversation rather than an interrupt on one loop; NEVER/TERMINATE/ALWAYS is an early autonomy slider.

**[A-10] Google ADK (2026). [VENDOR]** *Action Confirmations & Long-Running Function Tools.* https://google.github.io/adk-docs/tools-custom/confirmation/ · https://developers.googleblog.com/build-long-running-ai-agents-that-pause-resume-and-never-lose-context-with-adk/
Tool Confirmation (≥1.14): any tool pauses for yes/no or structured confirmation via a `FunctionResponse`; `LongRunningFunctionTool` returns `pending` and resumes on external human/webhook/queue response: pause/resume surviving across processes and time. *Relevance:* best-articulated pattern for *durable, asynchronous* approval (human may respond hours later).

**[A-11] CrewAI (2026). [VENDOR]** *Human Feedback in Flows / human_input.* https://docs.crewai.com/en/learn/human-feedback-in-flows
Two tiers: task-level `human_input=True`; `@human_feedback` decorator (≥1.8) pauses a Flow, presents output, routes by outcome, loops until approved/rejected (typically via webhooks). *Relevance:* HITL as a review/approve loop at task/workflow boundaries with branching on the verdict.

**[A-12] Vercel AI SDK (2026). [VENDOR]** *Tool Execution Approval: needsApproval (AI SDK 6).* https://vercel.com/blog/ai-sdk-6 · https://ai-sdk.dev/cookbook/next/human-in-the-loop
Single-flag HITL: `needsApproval: true` inserts a gate before `execute`; function form enables conditional gating (e.g., payments >$1000); durable workflows can suspend for days. *Critical security caveat (documented):* by default the approval is a UX affordance, NOT a server-side boundary: forgeable via replayed message history; use `experimental_toolApprovalSecret` to bind it. *Relevance:* cleanest "conditional approval by input value" + explicit warning that a gate isn't a security control unless bound server-side.

**[A-13] GitHub / VS Code (2025-2026). [VENDOR]** *Copilot Agent Mode & Copilot CLI Autopilot ("/yolo").* https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode · https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot
Terminal commands require approval by default; autonomy opt-in via `chat.tools.autoApprove` / `terminal.autoApprove`, JetBrains "global auto approve," CLI `/allow-all` (alias `/yolo`). *Worked:* safe defaults + graduated path. *Risk:* JetBrains global auto-approve overrides per-category settings incl. destructive ops. *Relevance:* a mainstream IDE's "ask-by-default, opt into act" surface and its blunt-override risk.

**[A-14] Cursor docs + Claburn, T. / The Register (2025). [VENDOR + EMPIRICAL security]** *Cursor Agent YOLO Mode, Allowlist/Denylist, and its Bypass.* https://forum.cursor.com/t/how-to-enable-actual-yolo-auto-run-mode/67491 · https://www.theregister.com/2025/07/21/cursor_ai_safeguards_easily_bypassed/
YOLO mode auto-runs with `command_allowlist`/`command_denylist` + file-deletion protection. Backslash Security found ≥4 denylist bypasses (base64-pipe, `bash -c` subshell, generated-script exec, quote variations), with malice arriving via poisoned rules.mdc / README / fetched content; denylist reportedly deprecated. *Failed:* pattern-matching denylists trivially evaded. *Relevance:* the cautionary case that string-matching command guardrails are not a sandbox.

**[A-15] Sierra (2025). [PRACTITIONER]** *Confidence in Every Conversation* & *Enterprise-Grade Agents.* https://sierra.ai/blog/confidence-in-every-conversation · https://sierra.ai/blog/enterprise-grade-agents
Production CX stack: per-agent **Supervisors** ("a Jiminy Cricket") observe in parallel and shift observe→intercept (correct/redirect/escalate in real time); always-on **Monitors** score coherence/grounding/sentiment at scale; deterministic guardrails the agent "cannot cross"; escalation produces an AI summary for handoff. *Relevance:* a "human-on-the-loop + AI-supervising-AI" stack where the human is the escalation tier, not the per-turn approver.

**[A-16] Cognition (2025). [PRACTITIONER]** *Devin's 2025 Performance Review: Learnings From 18 Months of Agents at Work.* https://cognition.com/blog/devin-annual-performance-review-2025
Merge rate rose to 67% (from 34%); excels at clear-spec, verifiable, 4-8h tasks parallelizable as a fleet; async "first-pass" with humans reviewing only the final result. *Failed/anti-patterns:* iterative problem-solving + mid-task scope changes degrade performance; ambiguous/visual work needs explicit specs; bottleneck shifts from writing to reviewing. *Relevance:* evidence that async/end-of-task review beats turn-by-turn for some workloads, but interruptibility/steering remains weak.

**[A-17] Chen et al. (2026). [EMPIRICAL, within-subjects n=48]** *Comparing Human Oversight Strategies for Computer-Use Agents.* arXiv:2604.04918.
Four strategies (Risk-Gated, per-step Action Confirmation, Supervisory Co-Execution/plan-approval, Structurally Enriched) vs. embedded privacy-leak, prompt-injection, dark-pattern attacks. *Worked:* plan-based cut problematic-action *occurrence* (60-74% vs 88-90%); Structurally Enriched best on trust/usability in high-consequence tasks. *Key failure:* the **exposure-vs-correction gap:** no strategy improved *intervention success* once a problem surfaced (9-26%); failure was rationalization/normalization (a "recognition bottleneck"); task consequence mattered more than strategy. *Relevance:* hard evidence that approval gates reduce bad actions but don't make humans good at catching them.

**[A-18] Tang, N., et al. (2026). [EMPIRICAL, 20,574 sessions / 1,639 repos]** *How Coding Agents Fail Their Users: …Developer-Agent Misalignment in 20,574 Real-World Sessions.* arXiv:2605.29442.
Seven symptoms led by Developer-Constraint-Violation (38%), Misread-Intent (27%), Inaccurate-Self-Reporting (23%), Self-Initiated-Overreach (10%). *Key HITL finding:* 91% of visible resolutions required explicit developer pushback: "safety contingent on developer oversight," which doesn't scale. *Anti-patterns:* interaction-level symptoms persist even as code-level errors decline; CLI agents damage external state more than IDE; misalignment recurs across adjacent sessions (+54%). *Relevance:* largest real-world evidence that current agents externalize correction cost onto the human.

**[A-19] Zou, H. P., et al. (2026). [EMPIRICAL, benchmark]** *When Users Change Their Mind: Evaluating Interruptible Agents in Long-Horizon Web Navigation.* arXiv:2604.00892.
**InterruptBench** (from WebArena-Lite) tests Addition / Revision / Retraction interruptions across six LLMs, measuring adaptation + recovery efficiency. *Finding:* even frontier LLMs struggle with mid-task steering, cancellation, and re-planning: an unsolved capability. *Relevance:* interrupt/pause/steer is not just a UI affordance: the models themselves are weak at honoring mid-flight intent changes.

**[A-20] Huang, R., et al. (2025). [EMPIRICAL, qualitative]** *Professional Software Developers Don't Vibe, They Control: AI Agent Use for Coding in 2025.* arXiv:2512.14012.
Professionals maintain agency via upfront planning, staged approval checkpoints before integration, and mid-execution interruption, contra "vibe coding." Implications: prioritize control over autonomy: explicit approval workflows, interruptibility at logical checkpoints, transparent reasoning, developer-directed planning. *Relevance:* empirically grounds "plan-then-confirm + interruptible checkpoints" as what expert users want.

**[A-21] Dhanorkar, S., Passi, S., & Vorvoreanu, M. (2026). [EMPIRICAL, interviews n=17]** *Human Oversight of Agentic Systems in Practice…* arXiv:2606.05391.
Documents the gap between intended and actual oversight: developers rely on informal heuristics rather than systematic verification; automation bias + productivity pressure produce rubber-stamping. Frames the "agentic oversight problem": governance intent vs. real practice. *Relevance:* complements A-17: even motivated experts default to shallow review, so HITL must counter automation bias, not assume diligence.

**[A-22] D'Oro, P., et al. / Meta FAIR (2025). [position/framework]** *ADEPTS: A Capability Framework for Human-Centered Agent Design.* arXiv:2507.15885.
Six user-facing capabilities: **A**ctuation, **D**isambiguation, **E**valuation, **P**ersonalization, **T**ransparency, **S**afety, as the minimal vocabulary for understandable, controllable, trustworthy agents. Disambiguation (clarify before acting) + Transparency/Evaluation map onto plan-confirm and preview-before-apply. *Relevance:* a unifying taxonomy situating approval gates, steering, and escalation in one human-centered model.

**[A-23] Willison, S. (2025). [PRACTITIONER]** *Designing Agentic Loops* & *The Lethal Trifecta for AI Agents.* https://simonwillison.net/2025/Sep/30/designing-agentic-loops/ · https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
Argues YOLO/auto-approve drives the best results but only behind environmental controls: Docker w/ no network, disposable cloud machines, scoped test/staging credentials, hard budget caps: move the boundary from per-action approval to the sandbox. The **"lethal trifecta"**: private-data access + untrusted-content exposure + external communication = near-guaranteed exfiltration via injection. *Relevance:* the most-cited articulation of "sandbox so you can skip the human gate," plus a heuristic for when an agent must NOT run unsupervised.

## I.B: Human-in-the-loop machine learning (active/interactive learning, annotation, RLHF)

_The older ML tradition that "human-in-the-loop" originally named. Tags: **[E]** empirical · **[O]** opinion/survey · **[E/O]** evidence-backed survey._

### Highlights

- **Confidence-gated human queries (uncertainty sampling, [B-1, B-2]) can cut labeling 10-500×, but the gains are fragile.** In real projects, utility-per-cost querying often fails to beat random sampling, and the "most informative" items are also the hardest and most disagreement-prone for humans [B-3]. *Lesson:* confidence-gated escalation is powerful but must account for human cost and difficulty, not just model uncertainty.
- **Passive "label what the model asks" loops miss rare-but-critical cases [B-4].** A model "cannot be uncertain about a class it has never seen": argues for human *initiative* (search/seeding), not only human *response*.
- **Rich human feedback is double-edged.** Users gladly critique model reasoning [B-5, B-6] and explanation-mediated correction ~2× efficiency [B-7], yet naive incorporation of human corrections can *degrade* accuracy [B-6].
- **Aggregation beats individual labels, up to a point [B-9, B-10].** A few cheap labels can match experts, but redundancy is wasted when labelers are good and assumes a single correct answer exists.
- **Disagreement is often signal, not noise [B-13].** For subjective tasks there may be no single ground truth; majority-vote gold distorts data and eval. *Implication:* RLHF preference disagreement is partly irreducible.
- **Agreement metrics measure consistency, not correctness [B-11].** High κ/α can encode shared bias.
- **Crowdsourcing pathologies recur: spam, gaming, low effort, fatigue, demographic/task-design bias [B-12].**
- **Programmatic / expert-in-the-loop supervision scales human effort [B-14, B-15].** Snorkel: ~2.8× faster, ~45% better than hand labeling: the conceptual bridge to LLM-assisted labeling.
- **Preference-based RLHF is the scalable HITL primitive [B-16]:** humans compare, a reward model learns, the policy optimizes: feedback on <1% of interactions. Made oversight of deep RL and then LLMs affordable [B-17, B-18, B-19].
- **Reward hacking / over-optimization is the signature failure mode [B-17, B-22].** Optimizing too hard against an imperfect learned reward makes true human-judged quality go *down* (Goodhart); mitigations: KL penalties, early stopping, reward-model ensembles.
- **The human-feedback pool is a narrow, contestable foundation [B-18, B-21].** InstructGPT's "good" was set by a small labeler group (~72-77% agreement); annotator bias/error/non-representativeness are partly *fundamental* limits.
- **RLAIF / Constitutional AI [B-20] shifts humans from labelers to rule-authors**, scaling oversight but inheriting the base model's blind spots. Trajectory: *human-in-the-loop → human-defining-the-rules, AI-in-the-loop.*

### Annotated bibliography

**[B-1] Settles, B. (2009). [E/O]** *Active Learning Literature Survey.* CS Tech Report 1648, Univ. Wisconsin-Madison. https://burrsettles.com/pub/settles.activelearning.pdf
Canonical AL survey: three query scenarios (membership synthesis, stream-, pool-based) and strategy families (uncertainty sampling, query-by-committee, expected model change/error reduction, density weighting). *Worked:* up to ~90% fewer labels in favorable apps. *Limits:* gains are model-/task-dependent and don't transfer cleanly. *Relevance:* root of "ask the human only where the model is uncertain": informs confidence-gated handoff.

**[B-2] Lewis, D. D., & Gale, W. A. (1994). [E]** *A Sequential Algorithm for Training Text Classifiers.* SIGIR '94, 3-12. arXiv:cmp-lg/9407020.
Coined **uncertainty sampling**. *Worked:* up to 500× reduction in labeled data on newswire categorization. *Limits:* single-classifier uncertainty is myopic, biased toward the current (possibly wrong) boundary; can underperform random sampling under misspecification. *Relevance:* the original confidence-triggered human-query primitive.

**[B-3] Settles, B. (2011). [E/O]** *From Theories to Queries: Active Learning in Practice.* JMLR W&CP 16, 1-18. https://proceedings.mlr.press/v16/settles11a.html
Reality check on theory-vs-deployment. *Failed/sobering:* real annotation cost is per-instance variable, so utility-maximizing queries did NOT beat random sampling on several NLP tasks even after cost modeling; "informative" items are hardest for humans too, hurting label quality/morale. *Relevance:* the items a model most wants adjudicated are often the items humans find hardest, raises cost and disagreement.

**[B-4] Attenberg, J., & Provost, F. (2010). [E]** *Why Label When You Can Search?* KDD '10. (pagination UNVERIFIED; authorship/argument confirmed)
Under extreme class imbalance, AL can exhaust budget without surfacing a rare positive ("cannot be uncertain about a class it has never seen"). *Worked:* proposes *guided learning*, humans search for rare positives. *Relevance:* passive label-what-the-model-asks loops miss rare-but-critical cases; argues for human initiative.

**[B-5] Amershi, S., Cakmak, M., Knox, W. B., & Kulesza, T. (2014). [O]** *Power to the People: The Role of Humans in Interactive Machine Learning.* AI Magazine 35(4), 105-120. DOI: 10.1609/aimag.v35i4.2513.
Defining articulation of IML as rapid, focused, incremental human-model cycles studied *user-centered*. *Limit (authors'):* users behave unexpectedly, give inconsistent/strategic feedback, hold divergent mental models. *Relevance:* HITL is an interaction-design problem, not only an ML problem.

**[B-6] Stumpf, S., et al. (2009). [E]** *Interacting Meaningfully with Machine Learning Systems: Three Experiments.* IJHCS 67(8), 639-662. DOI: 10.1016/j.ijhcs.2009.03.004.
Whether end users can give richer-than-binary feedback. *Worked:* users meaningfully critique reasoning. *Failed/mixed:* some user-suggested changes *degraded* accuracy; naive incorporation is risky. *Relevance:* NL correction of agents is double-edged: well-meant edits can harm.

**[B-7] Kulesza, T., Burnett, M., Wong, W.-K., & Stumpf, S. (2015). [E]** *Principles of Explanatory Debugging to Personalize Interactive Machine Learning.* IUI '15. DOI: 10.1145/2678025.2701399.
Closed explanation loop: system explains, user corrects via the explanation. *Worked:* +~52% understanding; up to ~2× more efficient fixes. *Limit:* depends on faithful, intelligible explanations and a steerable model. *Relevance:* template for explanation-mediated correction of agents.

**[B-8] Monarch, R. (Munro) (2021). [O]** *Human-in-the-Loop Machine Learning: Active Learning and Annotation for Human-Centered AI.* Manning. ISBN 9781617296741.
Standard practitioner text unifying AL, annotation, and interface design: sampling for review, annotation QC, interface design, combining transfer/self-supervision with review. *Limit:* prescriptive/experiential, not controlled study. *Relevance:* the closest "playbook" for the whole human-feedback pipeline an agent needs.

**[B-9] Snow, R., O'Connor, B., Jurafsky, D., & Ng, A. Y. (2008). [E]** *Cheap and Fast: But Is It Good? Evaluating Non-Expert Annotations for Natural Language Tasks.* EMNLP 2008, 254-263. https://aclanthology.org/D08-1027/
MTurk for NLP across five tasks. *Worked:* aggregating ~4 cheap labels matched expert gold; quantified and corrected per-annotator bias. *Limit:* holds for objective tasks; relies on redundancy + a gold standard. *Relevance:* ancestor of multi-annotator preference collection in RLHF.

**[B-10] Sheng, V. S., Provost, F., & Ipeirotis, P. G. (2008). [E]** *Get Another Label? Improving Data Quality and Data Mining Using Multiple, Noisy Labelers.* KDD '08, 614-622. DOI: 10.1145/1401890.1401965.
Repeated labeling + quality-aware aggregation improves data and model quality, even when labels aren't cheap. *Nuance:* "not always": wasteful when labelers are good/noise is low. *Relevance:* the cost/quality calculus for how many humans per agent decision/comparison.

**[B-11] Artstein, R., & Poesio, M. (2008). [E/O]** *Inter-Coder Agreement for Computational Linguistics.* Computational Linguistics 34(4), 555-596. https://aclanthology.org/J08-4004/
Reference survey of agreement metrics (κ, π, Fleiss, Krippendorff's α). *Limit:* agreement is a proxy: high agreement can encode shared bias; low can reflect genuine ambiguity. *Relevance:* the measurement toolkit for diagnosing disagreement in any feedback dataset.

**[B-12] Vaughan, J. W. (2018). [O]** *Making Better Use of the Crowd.* JMLR 18(193), 1-46. https://jmlr.org/papers/v18/17-234.html
Survey of crowdsourcing for ML (data generation, eval/debugging, hybrid systems, behavioral experiments). *Catalogs failure modes:* spam/gaming, low effort, fatigue, demographic/task-design bias. *Relevance:* the pathologies that re-emerge when humans supply agent feedback at scale.

**[B-13] Plank, B. (2022). [O]** *The "Problem" of Human Label Variation: On Ground Truth in Data, Modeling and Evaluation.* EMNLP 2022, 10671-10682. https://aclanthology.org/2022.emnlp-main.731/
Argues annotator disagreement is often *signal* (genuine subjectivity/ambiguity); aggregating to one ground truth discards information. *Relevance:* explains why RLHF preference disagreement is partly irreducible: no single correct answer to optimize toward.

**[B-14] Ratner, A., De Sa, C., Wu, S., Selsam, D., & Ré, C. (2016). [E]** *Data Programming: Creating Large Training Sets, Quickly.* NeurIPS 2016. arXiv:1605.07723.
Users write noisy labeling functions whose accuracies/correlations are estimated *without ground truth* to produce probabilistic labels. *Limit:* bounded by coverage; correlated/systematically-wrong functions mislead. *Relevance:* theory behind programmatic/AI-assisted supervision.

**[B-15] Ratner, A., Bach, S. H., et al. (2017/2020). [E]** *Snorkel: Rapid Training Data Creation with Weak Supervision.* PVLDB 11(3), 269-282 (ext. VLDB Journal 2020, DOI 10.1007/s00778-019-00552-1). https://www.vldb.org/pvldb/vol11/p269-ratner.pdf
Operationalized data programming. *Worked:* experts built models **2.8× faster**, ~**45.5%** better than 7h hand labeling; industrial scale. *Limit:* needs expert-authored functions; weak labels remain noisier. *Relevance:* expert-in-the-loop programmatic supervision can substitute for much manual annotation.

**[B-16] Christiano, P., Leike, J., Brown, T. B., Martic, M., Legg, S., & Amodei, D. (2017). [E]** *Deep Reinforcement Learning from Human Preferences.* NeurIPS 2017. arXiv:1706.03741.
Learn a reward model from pairwise preferences over short trajectory segments, optimize policy against it. *Worked:* solved Atari/locomotion with feedback on **<1%** of interactions. *Limit:* learned reward is a gameable proxy. *Relevance:* the direct technical ancestor of LLM RLHF.

**[B-17] Stiennon, N., Ouyang, L., et al. (2020). [E]** *Learning to Summarize from Human Feedback.* NeurIPS 2020. arXiv:2009.01325.
Preference RLHF for summarization at LM scale. *Worked:* preferred over SFT and even human references; generalized. *Failed/observed:* explicit **reward-model over-optimization:** high proxy score, worse to humans. *Relevance:* first LLM-scale demo of both the power and the reward-hacking failure mode.

**[B-18] Ouyang, L., Wu, J., et al. (2022). [E]** *Training Language Models to Follow Instructions with Human Feedback (InstructGPT).* NeurIPS 2022. arXiv:2203.02155.
The three-stage RLHF recipe (SFT → reward model → PPO). *Worked:* 1.3B InstructGPT preferred over 175B GPT-3; more truthful/less toxic. *Failed/acknowledged:* "alignment tax," residual harms, and a **small, demographically narrow labeler pool** (≈72-77% agreement) defining "good." *Relevance:* production template for LLM HITL + its core labeler-pool caveat.

**[B-19] Bai, Y., Jones, A., et al. (2022). [E]** *Training a Helpful and Harmless Assistant with RLHF.* arXiv:2204.05862.
Large-scale HH-RLHF with iterated weekly preference collection. *Worked:* an "alignment bonus" across evals; helpful-but-non-evasive via data mixing. *Observed:* near-linear reward vs √(KL) drift; purely-helpful models far easier to red-team (helpful/harmless tension). *Relevance:* iterated feedback at scale and the trade-off agents must navigate.

**[B-20] Bai, Y., Kadavath, S., et al. (2022). [E]** *Constitutional AI: Harmlessness from AI Feedback (RLAIF).* arXiv:2212.08073.
Replaces most human harmlessness labels with AI feedback guided by a written constitution (self-critique + RLAIF). *Worked:* harmless-but-non-evasive with far fewer human labels; auditable principles. *Limits:* only as good as the constitution + model judgment; inherits base-model blind spots; shifts (not removes) oversight burden. *Relevance:* the pivot to *human-defining-the-rules, AI-in-the-loop.*

**[B-21] Casper, S., Davies, X., et al. (2023). [O]** *Open Problems and Fundamental Limitations of RLHF.* TMLR. arXiv:2307.15217.
Definitive taxonomy by stage: (1) **feedback:** biased/erring/adversarial/lazy annotators, foolable, disagreeing, narrow population; (2) **reward model:** misspecification, hacking, scalar can't capture diverse values; (3) **optimization:** over-optimization, distribution shift, mode collapse. Separates *tractable* from *fundamental* limits. *Relevance:* the single best checklist of HITL failure modes.

**[B-22] Gao, L., Schulman, J., & Hilton, J. (2023). [E]** *Scaling Laws for Reward Model Overoptimization.* ICML 2023. arXiv:2210.10760.
Quantifies Goodhart: as policy optimizes a proxy reward, gold reward rises then **falls**, in clean functional forms scaling with RM size/data. *Relevance:* hard grounding for **reward hacking:** more optimization eventually *hurts*; bound it (KL penalties, early stopping).

## I.C: Scalable oversight & AI-safety HITL

_Keeping humans meaningfully in control of increasingly capable AI._

### Highlights

- **Scalable oversight is the load-bearing assumption of HITL.** As agents exceed humans on the relevant skills, direct human evaluation breaks down [C-1, C-3, C-9]; every technique here *amplifies* a limited human rather than relying on raw human judgment.
- **"AI helps the human evaluate" is the central design pattern.** Recursive reward modeling, iterated amplification, decomposition, and debate all bootstrap oversight via (more-trusted) AI assisting the overseer [C-3, C-5, C-6, C-7]. Book summarization [C-7] is the clearest proof it works on a real task.
- **Debate works, but less than the hype, and only in the right conditions.** Persuasive-debater results encourage [C-10]; the broadest benchmark finds gains modest, task-dependent, and shrinking as the human's own information grows [C-11]. Debate assumes a competent, unbiased judge: its key vulnerability.
- **Constitutional AI/RLAIF reduce the oversight *burden* partly by removing the *human* [C-8].** Substituting an AI judge scales but relocates risk into the constitution's quality and the AI evaluator's blind spots.
- **Weak-to-strong generalization makes superhuman oversight studiable today, and shows naive supervision is insufficient [C-12].** Strong students beat weak teachers but recover only part of the gap; combining with debate helps [C-13].
- **FAILURE MODE: over-reliance / rubber-stamping is the default.** Automation bias yields omission + commission errors [C-14]; complacency afflicts experts and resists practice [C-15]; people over-trust advice *because* it's labeled algorithmic [C-16].
- **FAILURE MODE: explanations cause over-trust, not better oversight [C-17, C-18].** Transparency aimed at empowering the overseer can instead disarm them.
- **What actually curbs rubber-stamping: friction [C-18].** Cognitive forcing functions (commit-before-seeing-AI, mandatory deliberation) measurably reduce over-reliance, but they're slower, unpopular, and help analytical users most.
- **FAILURE MODE: adding a human can make the team worse [C-19].** Meta-analytically, human-AI combinations often underperform the better of human-or-AI alone, especially in decision tasks and when the AI is stronger.
- **FAILURE MODE: illusory oversight / accountability laundering [C-21].** Mandating an overseer who cannot in practice oversee legitimizes flawed systems and creates a moral crumple zone.
- **Meaningful control demands tracking + tracing, not a button [C-2, C-20].** The system must respond to relevant human reasons and outcomes must trace to an informed, responsible human: a far higher bar than a veto checkbox.
- **Assume the model may be adversarial: monitor, don't just align [C-22].** AI-control protocols stay safe against intentional subversion by routing scarce human/trusted-model review to flagged actions: the most operationally concrete HITL strategy here.

### Annotated bibliography

**[C-1] Amodei, D., Olah, C., Steinhardt, J., Christiano, P., Schulman, J., & Mané, D. (2016). [position]** *Concrete Problems in AI Safety.* arXiv:1606.06565.
Names "scalable oversight" as one of five concrete problems: training/evaluating when the true objective is too expensive/rare to evaluate, so cheap proxies invite reward hacking. *Worked:* a shared, tractable vocabulary. *Limit:* an agenda, not a solution. *Relevance:* canonical origin of the framing all agentic-HITL design inherits.

**[C-2] Russell, S. (2019). [position, book]** *Human Compatible: Artificial Intelligence and the Problem of Control.* Viking/Penguin.
Argues the "standard model" (optimize a fixed objective) is unsafe; proposes assistance games / CIRL where the AI is uncertain about preferences and treats human behavior (incl. shutdown) as evidence → corrigibility. *Limit:* largely theoretical, hard to scale. *Relevance:* meaningful control requires the agent to *want* to defer, not just be monitored.

**[C-3] Leike, J., Krueger, D., Everitt, T., Martic, M., Maini, V., & Legg, S. (2018). [position]** *Scalable Agent Alignment via Reward Modeling: A Research Direction.* arXiv:1811.07871.
Recursive reward modeling: learn reward from feedback, then use aligned agents to help users evaluate harder tasks. *Worked:* articulated the recursive-oversight scaffold. *Limit:* identifies but doesn't solve reward gaming/feedback quality. *Relevance:* blueprint for HITL where AI assists the evaluator.

**[C-4] / see B-16. Christiano et al. (2017).** *Deep RL from Human Preferences.* (cross-listed in I.B), empirical root of preference-based HITL.

**[C-5] Irving, G., Christiano, P., & Amodei, D. (2018). [position + toy exp.]** *AI Safety via Debate.* arXiv:1805.00899.
Two agents argue; a human judges who was more truthful. Bet: refuting a lie is easier than constructing one, so a limited human can supervise superhuman play (PSPACE vs NP analogy). *Worked:* concept + MNIST demo. *Limit:* assumes a competent, unbiased judge; vulnerable to persuasive-but-wrong and "obfuscated" arguments. *Relevance:* core AI-vs-AI mechanism to amplify a human overseer.

**[C-6] Christiano, P., Shlegeris, B., & Amodei, D. (2018). [E, algorithmic]** *Supervising Strong Learners by Amplifying Weak Experts (Iterated Amplification).* arXiv:1810.08575.
Build a training signal for hard problems by decomposing into subproblems a weak agent + human can solve, then distill. *Worked:* learned complex behaviors via decomposition. *Limit:* clean algorithmic domains; relies on clean decomposition. *Relevance:* the decomposition primitive behind "AI helps the human evaluate."

**[C-7] Wu, J., Ouyang, L., et al. (2021). [E]** *Recursively Summarizing Books with Human Feedback.* arXiv:2109.10862.
First real-world recursive decomposition + RLHF: labelers evaluate a whole book via summaries-of-summaries. *Worked:* humans supervised a task larger than any could check, with traceability to source. *Limit:* below human quality; decomposition loses cross-section coherence. *Relevance:* proof decomposition makes superhuman-scale tasks human-supervisable.

**[C-8] / see B-20. Bai et al. (2022).** *Constitutional AI.* (cross-listed in I.B), scales oversight by substituting AI feedback for human feedback; relocates risk to the constitution and the AI judge's blind spots.

**[C-9] Bowman, S. R., Hyun, J., Perez, E., Chen, E., et al. (2022). [E + method]** *Measuring Progress on Scalable Oversight for Large Language Models.* arXiv:2211.03540.
Proposes the **"sandwiching"** paradigm: tasks where specialists succeed but non-experts and current models fail: to test whether non-expert + model reaches expert level. *Worked:* early proof-of-concept beat both human-alone and model-alone on QA. *Limit:* narrow QA; no adversarial/deceptive models yet. *Relevance:* the empirical program for measuring whether HITL closes the human-AI gap.

**[C-10] Khan, A., Hughes, J., et al. (2024). [E]** *Debating with More Persuasive LLMs Leads to More Truthful Answers.* ICML 2024 (Best Paper). arXiv:2402.06782.
On info-asymmetric reading comprehension, non-expert judges chose more truthfully under **debate** (76%/88% LLM/human) than naive baselines (48%/60%); optimizing debaters for *persuasiveness* increased judge accuracy. *Limit:* one task type; persuasiveness/truth may diverge elsewhere. *Relevance:* leading empirical support that debate can amplify a weaker overseer.

**[C-11] Kenton, Z., Siegel, N. Y., et al. (2024). [E]** *On Scalable Oversight with Weak LLMs Judging Strong LLMs.* NeurIPS 2024. arXiv:2407.04622.
Compares debate, "consultancy," and direct QA across many task types. Debate beats consultancy; stronger debaters help, but **modestly**, and the advantage shrinks when the judge has its own information. *Failure:* debate gains smaller than hyped and concentrated in extractive info-asymmetry. *Relevance:* tempers expectations: protocol choice matters; benefits are task-contingent.

**[C-12] Burns, C., Izmailov, P., Kirchner, J. H., et al. (2023). [E]** *Weak-to-Strong Generalization.* arXiv:2312.09390.
Fine-tune strong models on weak-model labels; strong students *exceed* weak supervisors, and an auxiliary-confidence loss recovers much of the NLP-task gap. *Worked:* studiable today; strong models don't merely imitate weak errors. *Failed/limit:* recovers only a fraction, uneven across tasks (reward modeling/chess); RLHF likely scales poorly without more work. *Relevance:* reframes oversight as a generalization problem; naive label-transfer insufficient.

**[C-13] Lang, H., Huang, F., & Li, Y. (2025). [E]** *Debate Helps Weak-to-Strong Generalization.* AAAI 2025. arXiv:2501.13124.
Uses debate to help a weak model extract trustworthy info from an untrustworthy strong model, then as supervision. *Worked:* combining oversight + generalization beats either alone. *Limit:* dataset-specific; long contexts disrupt debate. *Relevance:* the two strategies are complementary.

**[C-14] / see F-9. Skitka, Mosier & Burdick (1999).** *Does Automation Bias Decision-Making?* (cross-listed in II.F), original evidence base for rubber-stamping (omission/commission errors).

**[C-15] / see F-7. Parasuraman & Manzey (2010).** *Complacency and Bias…* (cross-listed in II.F), expertise and "just train people" are weak defenses against rubber-stamping.

**[C-16] Logg, J. M., Minson, J. A., & Moore, D. A. (2019). [E]** *Algorithm Appreciation: People Prefer Algorithmic to Human Judgment.* OBHDP 151, 90-103. DOI: 10.1016/j.obhdp.2018.12.005.
Counter to "algorithm aversion": laypeople weight advice *more* when told it's algorithmic, but appreciation wanes vs. one's own judgment and among experts. *Relevance:* the disposition to over-trust labeled-AI advice is a baseline risk agentic HITL must counteract.

**[C-17] / see F-20. Bansal et al. (2021).** *Does the Whole Exceed Its Parts?* (cross-listed in II.F), explanations increase acceptance regardless of correctness.

**[C-18] / see F-21. Buçinca, Malaya & Gajos (2021).** *To Trust or to Think.* (cross-listed in II.F), cognitive forcing functions reduce over-reliance; friction is unpopular but works.

**[C-19] Vaccaro, M., Almaatouq, A., & Malone, T. (2024). [E, meta-analysis]** *When Combinations of Humans and AI Are Useful.* Nature Human Behaviour 8, 2293-2303. DOI: 10.1038/s41562-024-02024-1.
106 studies / 370 effect sizes: on average human-AI teams performed **worse than the better of human-alone or AI-alone**. Gains in content creation; losses in decision tasks; combination helped when the human was the stronger party, hurt when the AI was. *Relevance:* strongest caution that HITL is not automatically beneficial.

**[C-20] Santoni de Sio, F., & van den Hoven, J. (2018). [position, philosophy]** *Meaningful Human Control over Autonomous Systems.* Frontiers in Robotics and AI 5:15. DOI: 10.3389/frobt.2018.00015.
Two conditions: **tracking** (system responds to relevant human moral reasons + environment) and **tracing** (outcomes trace to a human who understood the system and their role). Addresses the responsibility gap. *Relevance:* control means more than pressing a button: reason-responsiveness + traceable accountability.

**[C-21] Green, B. (2022). [position + evidence]** *The Flaws of Policies Requiring Human Oversight of Government Algorithms.* Computer Law & Security Review 45, 105681. arXiv:2109.05067.
Oversight mandates assume people *can* oversee algorithms; evidence shows they often can't (automation bias), so policies *legitimize* flawed systems while creating a façade of accountability (rubber-stamp / moral crumple zone). *Relevance:* keystone "oversight is often illusory" argument: nominal HITL can launder responsibility without delivering control.

**[C-22] Greenblatt, R., Shlegeris, B., Sachan, K., & Roger, F. (2023/2024). [E + method]** *AI Control: Improving Safety Despite Intentional Subversion.* ICML 2024 (oral). arXiv:2312.06942.
Design + red-team protocols that stay safe even if a powerful *untrusted* model actively subverts oversight, using a weaker *trusted* model + scarce trusted human labor. On backdoored-code, "trusted editing" and "untrusted monitoring" sharply improve the safety-usefulness frontier. *Limit:* constrained coding setting; assumes a genuinely trusted weaker model + effective red-teaming. *Relevance:* shifts oversight from "make it aligned" to "stay safe assuming it isn't": allocate scarce human review where monitoring flags risk.

## I.D: Governance, standards & "human oversight" mandates

_What regulators/standards require, and scholarship on whether mandated oversight actually works. Tags: **[LEGAL/STANDARD]** · **[CRITIQUE]** · **[EMPIRICAL]**._

### Highlights

- **The law now demands oversight; the evidence says humans can't reliably deliver it.** EU AI Act Art. 14 [D-1] and GDPR Art. 22 [D-2] mandate human oversight/intervention, while 25+ years of empirics [D-18, D-19, D-20] show people systematically over-rely on automation and miss its errors, *especially* under load and high autonomy (the agentic regime).
- **Regulators named the failure mode, then arguably legislated into it.** WP29/EDPB [D-4] explicitly bars **rubber-stamping** and requires reviewers with "authority and competence to change the decision," yet Art. 14's de-biasing strategy is largely to require *awareness* of automation bias, which [D-17] argues won't actually de-bias anyone.
- **"Add a human" is a legitimacy device, not a control [D-14].** Oversight requirements often *launder* faulty algorithms with false confidence while diffusing accountability; agencies are rarely required to *prove* oversight works. Green's fix: shift the burden to demonstrate effectiveness, is the most actionable governance reform here.
- **The human is frequently positioned to absorb blame, not exercise control.** Elish's **"moral crumple zone"** [D-16] and the **"MABA-MABA trap"** [D-15] warn that inserting a human creates *new* failure modes (scapegoating, deskilling, diffused responsibility) rather than curing algorithmic ones.
- **Override authority can introduce bias, not remove it [D-24].** Judges' discretionary overrides of a risk tool produced *racial disparities*: human discretion is not a neutral corrective.
- **Opacity structurally defeats oversight [D-25, D-22].** Black-box scores can't be meaningfully scrutinized by nominally-responsible humans: directly implicating agents whose reasoning is hard to inspect in real time.
- **Accountability sinks are not hypothetical.** The Dutch benefits scandal [D-21] (toppled a government) and Australian Robodebt [D-23] (unlawful, ~470k wrongful debts) are large-scale demonstrations of automated decisions running with ineffective/complicit oversight: caught by courts/commissions, not the systems' own HITL.
- **Standards give vocabulary and scaffolding but stop short of teeth.** NIST AI RMF + GenAI Profile [D-5, D-6] name overreliance/automation bias and tie oversight intensity to autonomy; ISO/IEC 42001 & 23894 [D-7, D-8] give certifiable governance, but all are voluntary, outcome-based, and leave "does this human actually control anything?" to the deployer.
- **Oversight language is engineered to be slippery.** DoD 3000.09 [D-11] chose "appropriate levels of human judgment" over "meaningful human control"; OECD/UNESCO/ICRC [D-9, D-10, D-12] endorse retained control but are non-binding (ICRC's *predictability + timely intervention/deactivation* is the most operational).
- **There is a usable design target [D-13]:** **tracking + tracing** reframes control as reason-responsiveness plus traceable human accountability: a better spec than "a person can press stop."
- **Net takeaway:** treat human oversight as a **claim to be empirically validated, not a checkbox**. Effective oversight needs (a) a genuinely empowered reviewer with authority *and* competence to override, (b) inspectable agent reasoning, (c) intensity scaled to autonomy/stakes, (d) defenses against automation bias/deskilling, and (e) accountability that doesn't collapse onto a lone crumple-zone human.

### Annotated bibliography: Part A: what regulators & standards require

**[D-1] European Parliament & Council (2024). [LEGAL/STANDARD]** *Regulation (EU) 2024/1689 (AI Act), Article 14 "Human oversight."* OJ L, 12 Jul 2024. https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng
High-risk AI must be "effectively overseen by natural persons." Art. 14(4): overseers must understand capacities/limits, "remain aware of … over-relying on the output (automation bias)," correctly interpret, "disregard, override or reverse," and interrupt via a "stop button"; biometric ID needs two-person verification. *Worked:* most concrete oversight mandate in law; first to name automation bias. *Gap:* high-risk only; relies on deployer-assigned competence; untested (most provisions apply from 2 Aug 2026). *Relevance:* the closest statutory spec for agentic HITL: intervention authority, override, kill-switch as design requirements.

**[D-2] European Parliament & Council (2016). [LEGAL/STANDARD]** *Regulation (EU) 2016/679 (GDPR), Article 22.* OJ L 119. https://gdpr-info.eu/art-22-gdpr/
Right not to be subject to decisions "based solely on automated processing" with "legal …or similarly significant" effects; where permitted, "at least the right to obtain human intervention," to express a view, and to contest. *Gap:* triggers only on "solely" automated + "significant"; "human intervention" undefined: the loophole nominal review exploits. *Relevance:* the original legal demand for a human checkpoint over automated decisions.

**[D-3] CJEU (2023). [LEGAL/STANDARD]** *OQ v Land Hessen ("SCHUFA Scoring"), Case C-634/21.* CELEX 62021CJ0634. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A62021CJ0634 (verbatim text UNVERIFIED by direct fetch; holding corroborated)
Held an automated probability score is itself an "automated individual decision" when a third party "draws strongly" on it. *Worked:* closes the loophole where upstream profiling escaped oversight as "preparatory." *Relevance:* in agent pipelines an upstream model's score/recommendation can be the legally decisive act: oversight must attach there.

**[D-4] Article 29 WP / EDPB (2017, rev. 2018). [LEGAL/STANDARD]** *Guidelines on Automated individual decision-making and Profiling (WP251rev.01).* https://ec.europa.eu/newsroom/article29/items/612053
Human involvement must be **meaningful**, by "someone who has the authority and competence to change the decision"; expressly warns **rubber-stamping** does not exempt the controller. *Worked:* source of the "meaningful human review" standard. *Gap:* soft law. *Relevance:* the canonical statement that token HITL is non-compliant.

**[D-5] NIST (2023). [LEGAL/STANDARD]** *AI Risk Management Framework (AI RMF 1.0), NIST AI 100-1.* DOI: 10.6028/NIST.AI.100-1.
GOVERN/MAP/MEASURE/MANAGE; oversight lives in the **"Human-AI Configuration"** category naming overreliance, automation bias, algorithmic aversion, anthropomorphizing. *Worked:* granular, widely adopted; Playbook scales oversight to risk. *Gap:* voluntary, outcome-based. *Relevance:* design vocabulary (human-AI teaming, overreliance) + a lifecycle hook for oversight controls.

**[D-6] NIST (2024). [LEGAL/STANDARD]** *AI RMF: Generative AI Profile, NIST AI 600-1.* DOI: 10.6028/NIST.AI.600-1.
Extends the RMF to GenAI across twelve risk categories incl. Human-AI Configuration; oversight **calibrated to risk**, and notes autonomous real-world action needs mechanisms beyond static inference. *Relevance:* the most agent-relevant U.S. guidance: explicitly ties oversight intensity to autonomy.

**[D-7] ISO/IEC (2023). [LEGAL/STANDARD]** *ISO/IEC 42001:2023, AI Management System.* https://www.iso.org/standard/42001 (ISO 403 to fetcher; content cross-confirmed)
First **certifiable** AI management-system standard (PDCA): policies, accountability, roles, risk assessment, controls. *Gap:* governs process, not technical oversight controls. *Relevance:* the org-level accountability layer for deploying agents responsibly.

**[D-8] ISO/IEC (2023). [LEGAL/STANDARD]** *ISO/IEC 23894:2023, AI Risk Management Guidance.* https://www.iso.org/standard/77304.html (ISO 403; cross-confirmed)
AI-specific risk-management guidance aligned to ISO 31000, complementary to 42001. *Gap:* guidance only; oversight is one risk-treatment option. *Relevance:* the risk-treatment basis under which oversight controls get identified. (Adjacent: ISO/IEC TR 24028:2020 trustworthiness/controllability.)

**[D-9] OECD (2019, rev. 2024). [LEGAL/STANDARD]** *Recommendation of the Council on AI (OECD/LEGAL/0449).* https://oecd.ai/en/ai-principles
First intergovernmental AI standard; values incl. human rights/autonomy/agency and (strengthened 2024) capacity for human determination/oversight appropriate to context. *Gap:* soft law. *Relevance:* the principle-level anchor for "human agency" over autonomous systems.

**[D-10] UNESCO (2021). [LEGAL/STANDARD]** *Recommendation on the Ethics of AI.* https://www.unesco.org/en/artificial-intelligence/recommendation-ethics
First global AI-ethics instrument (all 193 members); dedicated "Human oversight and determination" principle: AI must not displace ultimate human responsibility; life-and-death decisions not ceded to AI. *Gap:* non-binding. *Relevance:* the global norm that ultimate accountability stays human.

**[D-11] U.S. DoD (2023). [LEGAL/STANDARD]** *DoD Directive 3000.09, "Autonomy in Weapon Systems."* https://www.esd.whs.mil/portals/54/documents/dd/issuances/dodd/300009p.pdf (403; cross-verified)
Requires "appropriate levels of human judgment over the use of force": deliberately *not* "meaningful human control," i.e., context-dependent. *Critique:* flexibility leaves the required level ambiguous (HRW). *Relevance:* the policy slipperiness of oversight language: "appropriate" can mean anything.

**[D-12] ICRC (2021). [LEGAL/STANDARD]** *ICRC Position on Autonomous Weapon Systems.* https://www.icrc.org/en/document/icrc-position-autonomous-weapon-systems
Calls for binding rules: prohibit unpredictable systems + those targeting humans; regulate the rest via limits on target type, duration, geography, and human-machine interaction ensuring **effective supervision and timely intervention/deactivation**. *Relevance:* maps to agent guardrails: bound the action space, ensure timely interruption.

**[D-13] Santoni de Sio, F. & van den Hoven, J. (2018). [SCHOLARLY]** *Meaningful Human Control over Autonomous Systems.* Frontiers in Robotics and AI 5:15. DOI: 10.3389/frobt.2018.00015. (also at [C-20])
**Tracking** (responds to relevant human moral reasons/circumstances) + **tracing** (behavior traceable to a human who understands its capabilities/stakes); closes the responsibility gap. *Relevance:* a rigorous design target: control is reason-responsiveness + traceable accountability, not a button.

### Annotated bibliography: Part B: critiques (oversight as rubber stamp / accountability sink)

**[D-14] Green, B. (2022). [CRITIQUE]** *The Flaws of Policies Requiring Human Oversight of Government Algorithms.* Computer Law & Security Review 45:105681. DOI: 10.1016/j.clsr.2022.105681 (OA arXiv:2109.05067). (also at [C-21])
Surveys 41 policies; two flawed assumptions (people *can* oversee; requirements don't themselves harm). *Failed:* oversight **legitimizes** faulty algorithms, gives false security, diffuses accountability. *Fix:* flip the burden: agencies must demonstrate with evidence that oversight works before adoption. *Relevance:* "add a human" is not a control unless proven effective.

**[D-15] Crootof, R., Kaminski, M. E. & Price, W. N. II (2023). [CRITIQUE]** *Humans in the Loop.* Vanderbilt Law Review 76(2):429. https://scholarship.law.vanderbilt.edu/vlr/vol76/iss2/2/
HITL is invoked as a regulatory reflex. Names the **"MABA-MABA trap"**: inserting a human to patch algorithmic flaws ignores that hybrid systems generate *new* problems (automation bias, deskilling, diffused responsibility). *Fix:* a taxonomy of distinct human roles requiring tailored interventions. *Relevance:* a framework for *what kind* of human role an agent actually needs vs. a decorative one.

**[D-16] Elish, M. C. (2019). [CRITIQUE]** *Moral Crumple Zones: Cautionary Tales in Human-Robot Interaction.* ESTS 5:40-60. DOI: 10.17351/ests2019.260. (also at [F-19])
The **"moral crumple zone"**: a human in a highly automated system becomes the liability sponge, absorbing blame for failures they couldn't prevent, protecting the system and its makers. *Relevance:* an agent "approver" may be set up to take the fall, not to control outcomes.

**[D-17] Laux, J. & Ruschemeier, H. (2025). [CRITIQUE]** *Automation Bias in the AI Act: On the Legal Implications of Attempting to De-Bias Human Oversight of AI.* European Journal of Risk Regulation 16:1519-1534. arXiv:2502.10036.
Ties the automation-bias literature to Art. 14, which obliges enabling overseers' *awareness* of bias; argues awareness alone is unlikely to de-bias, given how robust the bias is. *Relevance:* the bridge between the law [D-1] and the empirics [D-18/19]: the AI Act may have encoded an unproven assumption.

### Annotated bibliography: Part C: empirical evidence that oversight fails in practice

**[D-18] Skitka, L. J., Mosier, K. L. & Burdick, M. (1999). [EMPIRICAL]** *Does automation bias decision-making?* IJHCS 51(5):991-1006. DOI: 10.1006/ijhc.1999.0252. (also at [F-9])
Participants *with* a reliable-but-imperfect aid performed *worse* than those without: omission + commission errors. *Relevance:* the empirical floor under every "a human will catch the model's mistakes" claim.

**[D-19] Skitka, L. J., Mosier, K. L. & Burdick, M. (2000). [EMPIRICAL]** *Accountability and automation bias.* IJHCS 52(4):701-717. DOI: 10.1006/ijhc.1999.0349. (also at [F-11])
Making people accountable for accuracy **reduced but did not eliminate** automation bias. *Relevance:* even accountability pressure (the AI Act/GDPR strategy) leaves a substantial residue.

**[D-20] Parasuraman, R. & Manzey, D. H. (2010). [review of EMPIRICAL]** *Complacency and Bias in Human Use of Automation.* Human Factors 52(3):381-410. DOI: 10.1177/0018720810376055. (also at [F-7])
Complacency/bias both stem from attentional allocation; under load, operators under-monitor and miss failures. *Relevance:* explains *why* oversight degrades precisely when most needed: high workload, high autonomy.

**[D-21] Amnesty International (2021). [EMPIRICAL]** *Xenophobic Machines: …the Dutch Childcare Benefits Scandal* (EUR 35/4686/2021). https://www.amnesty.org/en/documents/eur35/4686/2021/en/
A self-learning risk model flagged tens of thousands of mostly low-income/immigrant families as fraudsters (nationality as a risk factor); §7.5 documents failed human/institutional oversight; scandal toppled the cabinet (Jan 2021). *Relevance:* canonical case of automated decisions with nominal-but-ineffective human review.

**[D-22] District Court of The Hague (2020). [EMPIRICAL/legal]** *NJCM c.s. v. The State of the Netherlands ("SyRI"), C-09-550982, 5 Feb 2020.* (UN: https://www.ohchr.org/en/press-releases/2020/02/landmark-ruling-dutch-court-stops-government-attempts-spy-poor-un-expert)
Struck down SyRI welfare-fraud risk-profiling as violating ECHR Art. 8: no transparency, verifiability, or safeguards. *Relevance:* oversight gaps in automated scoring caught by courts, not the system's own HITL.

**[D-23] Royal Commission into the Robodebt Scheme (2023). [EMPIRICAL]** *Report of the Royal Commission into the Robodebt Scheme.* Commonwealth of Australia. https://robodebt.royalcommission.gov.au/publications/report (gov.au timed out; findings corroborated)
Automated income-averaging unlawfully generated ~470,000 welfare debts, reversing the burden of proof; "a crude and cruel mechanism, neither fair nor legal"; ~A$1.2bn settlement; 57 recommendations. *Relevance:* what happens when an automated pipeline runs with oversight that is captured/complicit rather than corrective.

**[D-24] Stevenson, M. T. (2018). [EMPIRICAL]** *Assessing Risk Assessment in Action.* Minnesota Law Review 103:303-384. https://scholarship.law.umn.edu/mlr/58/
Kentucky pretrial risk assessment (>1M cases): judges overrode recommendations unevenly (adherence higher in predominantly white rural counties), producing racial disparities. *Relevance:* human override is not automatically a safeguard: it can introduce its own bias.

**[D-25] Angwin, J., Larson, J., Mattu, S. & Kirchner, L. (2016). [EMPIRICAL]** *Machine Bias.* ProPublica. https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing
~7,000 COMPAS scores: Black defendants ~2× as likely to be falsely flagged high-risk; ~61% accurate; proprietary black-box scores not effectively scrutinized by relying judges. *Relevance:* opacity defeats oversight: agents whose reasoning humans can't inspect can't be meaningfully overseen. (Northpointe disputed the methodology: the calibration-vs-error-rate fairness debate.)

---

# Part II: Ergonomics, Usability & Human-Factors Foundations

## II.E: Automation theory & human-factors foundations

_The classical foundations agentic AI should inherit._

### Highlights

- **The fundamental irony (Bainbridge, [E-7]) applies verbatim.** Automating the routine work an agent does well *increases* the difficulty and stakes of the human's leftover job: monitoring for rare failures and recovering from them. Designing for the happy path while ignoring the human's degraded oversight role is the original sin.
- **Reliability is double-edged [E-17, E-18].** The more dependable an agent, the *less* the human monitors it, so the rare confident error slips through. Better models make complacency easier; pair reliability with deliberate engagement.
- **The out-of-the-loop problem is the central HITL hazard [E-13].** Full autonomy maximizes the takeover penalty; intermediate levels that keep the human in the active decision loop preserve takeover ability. Prefer "human *in* the loop" to "human *on* the loop" for high-consequence actions.
- **Autonomy is a dial, not a switch, and there are several dials [E-4, E-6].** Decide *which stage* (acquire → analyze → decide → act) and *what level* (suggest → act-with-approval → act-then-notify → act-silently) independently. Automating the *decision/action* stage is where over-trust and lost authority bite hardest; automate perception/analysis more freely than action.
- **Measure the failure case, not the happy path: the "lumberjack effect" [E-15].** Higher autonomy buys small routine gains but, past a threshold, catastrophic recovery failures. Evaluate agents on what happens *when they're wrong*.
- **Calibrated trust is the goal; both over- and under-trust fail [E-16, E-19].** Misuse (blind acceptance), disuse (alarm fatigue), abuse (automating because you can). Communicate capability, process, purpose, and uncertainty so reliance tracks competence.
- **Automation bias replaces judgment, not just effort [E-20].** Confident recommendations induce omission + commission errors. Preserve independent verification, especially for irreversible/commission-type actions.
- **Opacity breeds dangerous mismatches [E-10].** Mode confusion / automation surprise come from divergence between the human's model and reality. Make the agent predictable, its state visible, its actions explainable.
- **Situation awareness, not activity logs, is what overseers need [E-12].** Effective intervention requires comprehension (L2) and projection (L3), not just perception (L1). Feed understanding and what-happens-next, not a stream of tool calls.
- **Skill atrophy is selective and quiet [E-22].** Routine skills survive disuse; the higher-order *judgment* skills needed for non-routine takeover decay unless the human stays engaged. Keep humans reasoning, not rubber-stamping.
- **Beware "clumsy" agents [E-11].** Agents that demand fiddly setup or grab attention at the busiest moments redistribute workload badly. Design the *interaction* and its timing, not just the capability.
- **Aim for complementarity; keep the human informed and in command [E-3, E-21].** Reject leftover-allocation thinking for human-centered, congruent design. After ~45 years [E-7→E-9] the ironies remain unsolved: engineer around them; don't expect capability gains to dissolve them.

### Annotated bibliography

**[E-1] Fitts, P. M. (Ed.) (1951).** *Human Engineering for an Effective Air-Navigation and Traffic-Control System.* National Research Council. (Origin of the "Fitts list" / HABA-MABA.) https://apps.dtic.mil/sti/citations/AD0759066
Foundational function-allocation document: 11 statements of where "men are better at" (judgment, improvisation, pattern-in-noise) vs. "machines are better at" (speed, power, routine repetition, computation). *Trap:* framed allocation as static, comparative, leftover-to-the-human. *Relevance:* the original "agent does X, human does Y" template, and a caution that naive HABA-MABA produces the dangerous supervisory residue.

**[E-2] de Winter, J. C. F., & Dodou, D. (2014).** *Why the Fitts list has persisted throughout the history of function allocation.* Cognition, Technology & Work 16(1), 1-11. DOI: 10.1007/s10111-011-0188-1.
Explains the list's 60-year survival (plausibility, simplicity, generalizability) and notes Fitts already foreshadowed the ironies of automation. *Relevance:* crude "let the LLM handle X" heuristics will persist; use them as a first cut, not a finished allocation.

**[E-3] Hollnagel, E., & Bye, A. (2000).** *Principles for modelling function allocation.* IJHCS 52(2), 253-265. DOI: 10.1006/ijhc.1999.0288.
Critiques the Fitts paradigm as "elementaristic"; argues the goal is *function congruence/complementarity* over time, not parceling tasks to whoever is "better." *Relevance:* design human + agent as a coupled, complementary system, not a set of handed-off tasks.

**[E-4] Sheridan, T. B., & Verplank, W. L. (1978).** *Human and Computer Control of Undersea Teleoperators.* MIT Man-Machine Systems Lab. https://apps.dtic.mil/sti/citations/ADA057655
Introduced the original **10-point Levels of Automation** scale (from "no assistance" → "executes a suggestion if the human approves" → "acts autonomously and ignores the human"). *Relevance:* the direct ancestor of "autonomy sliders" / permission levels.

**[E-5] Sheridan, T. B. (1992).** *Telerobotics, Automation, and Human Supervisory Control.* MIT Press. ISBN 0-262-19316-7.
Book-length statement of *supervisory control*: the human as higher-level planner/monitor/intervener, not moment-to-moment controller. *Lesson:* automating the inner loop promotes the human to a *different and harder* job (the seed of the out-of-the-loop problem). *Relevance:* agentic use *is* supervisory control by definition.

**[E-6] Parasuraman, R., Sheridan, T. B., & Wickens, C. D. (2000).** *A Model for Types and Levels of Human Interaction with Automation.* IEEE SMC-A 30(3), 286-297. DOI: 10.1109/3468.844354.
Most-cited modern framework: four *stages* (information acquisition → analysis → decision/action selection → action implementation), each automatable to a different *level*, with evaluative criteria. *Relevance:* ready-made taxonomy for agent pipelines (retrieve → analyze → propose → execute); automating the *decision/action* stage is riskiest.

**[E-7] Bainbridge, L. (1983).** *Ironies of Automation.* Automatica 19(6), 775-779. DOI: 10.1016/0005-1098(83)90046-8.
THE canonical paper. Automating "because the human is unreliable" leaves the human the un-automatable tasks plus monitoring + emergency takeover, for which disuse has destroyed skill and SA, and emergencies are the hardest cases. *Relevance:* the single most important paper for agentic HITL: routine delegation silently degrades the human's ability to catch the agent's rare, high-consequence failures.

**[E-8] Baxter, G., Rooksby, J., Wang, Y., & Khajeh-Hosseini, A. (2012).** *The ironies of automation … still going strong at 30?* ECCE '12, 65-71. DOI: 10.1145/2448136.2448149.
30-year retrospective across aviation, trading, cloud: original ironies intact, plus *new* ironies (cheap compute encouraging less-dependable, procedure-bypassing systems). *Relevance:* making agents more capable/reliable doesn't dissolve the oversight problem; it sharpens it.

**[E-9] Strauch, B. (2018).** *Ironies of Automation: Still Unresolved After All These Years.* IEEE THMS 48(5), 419-433. DOI: 10.1109/THMS.2017.2732506.
Concludes the ironies remain valid and *unresolved* (mode confusion, skill atrophy, accidents) because designs keep automating without addressing the human's changed role. *Relevance:* agentic AI inherits an unsolved problem: engineer around the ironies; don't expect better models to outgrow them.

**[E-10] Baxter, G., Besnard, D., & Riley, D. (2007).** *Cognitive mismatches in the cockpit: Will they ever be a thing of the past?* Applied Ergonomics 38(4), 417-423. DOI: 10.1016/j.apergo.2007.01.005.
"Cognitive mismatch": operator's model of the automation diverges from reality (mode confusion, automation surprise), a recurring, structural error in opaque systems. *Relevance:* if the human's model of the agent's goals/state diverges, oversight fails; argues for transparency, mode visibility, intent communication.

**[E-11] Wiener, E. L., & Curry, R. E. (1980).** *Flight-deck automation: promises and problems.* Ergonomics 23(10), 995-1011. DOI: 10.1080/00140138008924809.
Founding aviation-automation paper: automation improves performance yet adds new failure modes (setup errors, ignored alarms, proficiency loss). Source of "clumsy automation": helps in low-workload phases, adds workload when already busy. *Relevance:* foreshadows clumsy agent UX; design the interaction and timing.

**[E-12] Endsley, M. R. (1995).** *Toward a Theory of Situation Awareness in Dynamic Systems.* Human Factors 37(1), 32-64. DOI: 10.1518/001872095779049543.
Canonical 3-level SA model: L1 perception, L2 comprehension, L3 projection; attention/working memory are limiting. *Relevance:* an overseer needs comprehension + projection of the agent's situation, not just a log of actions (which gives L1 only).

**[E-13] Endsley, M. R., & Kiris, E. O. (1995).** *The Out-of-the-Loop Performance Problem and Level of Control in Automation.* Human Factors 37(2), 381-394. DOI: 10.1518/001872095779064555.
Empirically establishes OOTL: operators resume manual control slower/worse after failure; the decrement was *significantly worse under full than intermediate automation*. *Relevance:* the empirical case for "human *in* the loop" over "on the loop" for high-stakes actions.

**[E-14] Kaber, D. B., & Endsley, M. R. (2004).** *The effects of level of automation and adaptive automation on human performance, SA and workload…* Theoretical Issues in Ergonomics Science 5(2), 113-153. DOI: 10.1080/1463922021000054335.
Intermediate LOAs aid SA; adaptive automation aids workload; effects differ and aren't additive. *Relevance:* supports adjustable/adaptive autonomy: let agent authority rise/fall with context, criticality, and human workload.

**[E-15] Onnasch, L., Wickens, C. D., Li, H., & Manzey, D. (2014).** *Human Performance Consequences of Stages and Levels of Automation: An Integrated Meta-Analysis.* Human Factors 56(3), 476-488. DOI: 10.1177/0018720813501549.
Meta-analysis: higher degree of automation improves routine performance/lowers workload *while it works* but sharply worsens performance + SA *when it fails*, the **"lumberjack effect"** (beyond a critical DOA, failure-mode performance collapses). *Relevance:* quantitative argument against maximal autonomy in high-consequence domains.

**[E-16] / see F-2. Parasuraman & Riley (1997).** *Use, Misuse, Disuse, Abuse.* (cross-listed in II.F): the core framework for calibrated reliance.

**[E-17] / see F-7. Parasuraman & Manzey (2010).** *Complacency and Bias…* (cross-listed in II.F): over-reliance is attentional, not a discipline problem.

**[E-18] / see F-4. Parasuraman, Molloy & Singh (1993).** *Performance Consequences of Automation-Induced "Complacency."* (cross-listed in II.F): the more reliable the automation, the worse humans catch its lapses.

**[E-19] / see F-1. Lee & See (2004).** *Trust in Automation.* (cross-listed in II.F): blueprint for agent transparency and confidence communication.

**[E-20] / see F-10. Mosier, Skitka, Heers & Burdick (1998).** *Automation Bias in High-Tech Cockpits.* (cross-listed in II.F): automated advice can *replace* independent judgment, including when wrong.

**[E-21] Billings, C. E. (1997).** *Aviation Automation: The Search for a Human-Centered Approach.* Lawrence Erlbaum. ISBN 0-8058-2127-9.
Defining articulation of *human-centered automation*: keep the human informed, involved, and in command; automation must be predictable, comprehensible, accountable. *Relevance:* the philosophical north star for agentic HITL: agents keep the human in command and never quietly assume authority.

**[E-22] Casner, S. M., Geven, R. W., Recker, M. P., & Schooler, J. W. (2014).** *The Retention of Manual Flying Skills in the Automated Cockpit.* Human Factors 56(8), 1506-1516. DOI: 10.1177/0018720814535628.
Manual *control/scanning* skills were retained; the *cognitive* skills of manual flying (planning, judgment) degraded unless pilots stayed actively engaged. *Relevance:* humans who let agents do the cognitive work lose the expertise to evaluate them: keep humans reasoning, not rubber-stamping.

## II.F: Trust, complacency, automation bias & failure modes

_Markings: **[E]** empirical · **[T]** theoretical/review · **[E/T]** mixed._

### Highlights

- **Appropriate reliance, not maximum trust, is the goal.** [F-1] Target *calibrated* trust matching real capability; both **over-trust → misuse** and **under-trust → disuse** are failures. Make the agent's competence, process, and purpose legible so reliance tracks reliability.
- **Four pathologies as a diagnostic checklist.** [F-2] **Misuse** (over-reliance), **disuse** (neglect, usually from false-alarm fatigue), and **abuse** (deploying autonomy without regard for human consequences) map cleanly onto agentic-LLM risks, and *abuse* locates much fault in design/deployment, not the operator.
- **Automation bias = heuristic deference.** [F-9, F-10] Users substitute "the system says so" for vigilant processing, producing **omission errors** (missing what the agent didn't flag) and **commission errors** (following the agent against contradictory evidence). Afflicts experts and crews alike, incl. false-memory ("phantom memory") that the agent was correct.
- **Complacency is structural, attention-driven, and training-resistant.** [F-4, F-5, F-7] Reliable automation under multi-task load erodes monitoring (decrement in ~20 min); appears in experts; and **instruction/training does not reliably fix it**. "Tell users to stay vigilant" is not a mitigation.
- **The automation conundrum / out-of-the-loop problem.** [F-8] The more autonomous and reliable the agent, the lower the human's situation awareness and the weaker their ability to take over when it finally fails, exactly when takeover matters most.
- **Mode confusion & automation surprise.** [F-14, F-15] "What is it doing? Why? What next?" arises from poor **observability** + mental-model gaps; "strong, silent, clumsy" automation yields slow **"going sour" accidents.** Agents that silently switch tools/strategies/modes are surprise generators.
- **There is a reliability floor (~70%).** [F-16] Below ~70% diagnostic reliability an advisory agent can be **net-negative** vs. no automation. Know the task's floor before deploying autonomy.
- **False alarms are uniquely corrosive.** [F-17, F-18] False-alarm-prone systems damage *both* compliance and reliance and drive **alert fatigue** ("cry wolf"): desensitization that leads users to override even critical alerts. Alert precision and volume are safety parameters.
- **Trust has three layers; design for each.** [F-3] **Dispositional** (who the user is), **situational** (context/workload/task), **learned** (onboarding + dynamic in-session updating).
- **Explanations can backfire.** [F-20] Rationales (and by extension chain-of-thought) tend to **increase acceptance regardless of correctness**, deepening over-reliance. Explanations must support *verification*, not just persuade.
- **Structural friction beats exhortation.** [F-12, F-21] **Cognitive forcing functions** (decide before seeing the AI's answer; deliberate friction) and **experiencing the agent fail during onboarding** measurably reduce over-reliance, but users dislike the friction that helps most.
- **Accountability is an evidence-based debiasing lever, but token HITL is a trap.** [F-11] Felt accountability for decision *accuracy* reduces automation-bias errors; yet [F-19] **"moral crumple zones"** warn that a human nominally in the loop *without real authority/awareness* is just a scapegoat.

### Annotated bibliography

**[F-1] Lee, J. D., & See, K. A. (2004). [T/E]** *Trust in Automation: Designing for Appropriate Reliance.* Human Factors, 46(1), 50-80. DOI: 10.1518/hfes.46.1.50_30392.
Field-defining synthesis. Because people respond to technology *socially*, **trust mediates reliance**; the goal is **appropriate trust calibrated to actual capability**, not maximum trust. Names **over-trust → misuse** and **distrust → disuse**, and the trust dimensions **performance / process / purpose** (does it work / how / why built). *Relevance:* master template for agentic HITL: make competence, reasoning, and intent legible so reliance tracks reliability.

**[F-2] Parasuraman, R., & Riley, V. (1997). [T]** *Humans and Automation: Use, Misuse, Disuse, Abuse.* Human Factors, 39(2), 230-253. DOI: 10.1518/001872097778543886.
Taxonomy paper. **Use / misuse** (over-reliance → monitoring failures) / **disuse** (neglect, often from false-alarm-prone alerts) / **abuse** (deploying automation without regard for human consequences). Shifts blame upstream: many "operator errors" are seeded by **abuse at design/management level**. *Relevance:* diagnostic vocabulary: over-acceptance (misuse), alarm-fatigue dismissal (disuse), reckless autonomy (abuse) are all live in LLM agents.

**[F-3] Hoff, K. A., & Bashir, M. (2015). [E/T]** *Trust in Automation: Integrating Empirical Evidence on Factors That Influence Trust.* Human Factors, 57(3), 407-434. DOI: 10.1177/0018720814547570.
Systematic review consolidating trust antecedents into a **three-layer model**: **dispositional** (traits, culture, age), **situational** (context, workload, task, system), **learned** (initial + dynamic, updating with experience). *Relevance:* trust is not one knob: onboarding shapes initial learned trust; in-session behavior drives dynamic recalibration.

**[F-4] Parasuraman, R., Molloy, R., & Singh, I. L. (1993). [E]** *Performance Consequences of Automation-Induced "Complacency".* Int. J. Aviation Psychology, 3(1), 1-23. DOI: 10.1207/s15327108ijap0301_1.
First empirical demonstration of automation complacency. Failure detection was far worse under **constant-reliability** than **variable-reliability** automation, emerging after ~20 min: **steady, reliable automation breeds the worst monitoring**. *Relevance:* the more dependable the agent seems, the more the human stops checking.

**[F-5] Molloy, R., & Parasuraman, R. (1996). [E]** *Monitoring an Automated System for a Single Failure: Vigilance and Task Complexity Effects.* Human Factors, 38(2), 311-322. DOI: 10.1177/001872089606380211.
**Vigilance decrement** in monitoring highly-but-imperfectly-reliable automation: detection of a single critical failure degrades over time and under load. *Relevance:* agents right 99% of the time make the human worst-positioned to catch the 1%: argues for forcing functions, not "keep an eye on it."

**[F-6] Singh, I. L., Molloy, R., & Parasuraman, R. (1993). [E]** *Automation-Induced "Complacency": Development of the Complacency-Potential Rating Scale.* Int. J. Aviation Psychology, 3(2), 111-122. DOI: 10.1207/s15327108ijap0302_2.
A 20-item instrument; establishes complacency potential as a measurable **individual difference**, not just a situational state. *Relevance:* some users are far more disposed to over-rely: suggests per-user calibration / adaptive friction.

**[F-7] Parasuraman, R., & Manzey, D. H. (2010). [E/T]** *Complacency and Bias in Human Use of Automation: An Attentional Integration.* Human Factors, 52(3), 381-410. DOI: 10.1177/0018720810376055.
Landmark review: **complacency and automation bias overlap, rooted in attention allocation**. Complacency emerges chiefly under **multiple-task load**; both appear in **experts**; neither is reliably eliminated by training. *Relevance:* strongest warning that "we'll train users to stay alert" is insufficient: structural design changes required.

**[F-8] Endsley, M. R. (2017). [T]** *From Here to Autonomy: Lessons Learned From Human-Automation Research.* Human Factors, 59(1), 5-27. DOI: 10.1177/0018720816681350.
Articulates the **"automation conundrum"**: more autonomy/reliability → lower operator SA → less able to intervene at failure (the **out-of-the-loop problem**). Proposes a Human-Autonomy System Oversight model; argues for SA-supportive design and granularity of control. *Relevance:* pushing LLM autonomy up degrades the takeover capability you depend on for safety.

**[F-9] Skitka, L. J., Mosier, K. L., & Burdick, M. (1999). [E]** *Does Automation Bias Decision-Making?* Int. J. Human-Computer Studies, 51(5), 991-1006. DOI: 10.1006/ijhc.1999.0252.
Defining automation-bias experiment. Distinguishes **omission** (missing an event the aid didn't flag) from **commission** (following an automated directive *despite* contradictory reliable info). Bias = using the aid as a **heuristic shortcut for vigilant processing**. *Relevance:* canonical frame for LLM over-acceptance.

**[F-10] Mosier, K. L., Skitka, L. J., Heers, S., & Burdick, M. (1998). [E]** *Automation Bias: Decision Making and Performance in High-Tech Cockpits.* Int. J. Aviation Psychology, 8(1), 47-63. DOI: 10.1207/s15327108ijap0801_3.
Automation bias in **professional glass-cockpit pilots**, incl. the **"phantom memory"** effect (recalling automation behaved correctly when it failed). Display enhancements/verification training reduced but didn't eliminate it. *Relevance:* expertise and team review do not inoculate against deferring to a confident machine.

**[F-11] Skitka, L. J., Mosier, K., & Burdick, M. D. (2000). [E]** *Accountability and Automation Bias.* Int. J. Human-Computer Studies, 52(4), 701-717. DOI: 10.1006/ijhc.1999.0349.
Making operators **accountable for decision accuracy** (vs. mere performance) significantly reduced both omission and commission errors. *Relevance:* assigning the human felt responsibility for an agent's outputs, not nominal "in-the-loop" status, is an evidence-based debiasing lever.

**[F-12] Bahner, J. E., Hüper, A.-D., & Manzey, D. (2008). [E]** *Misuse of Automated Decision Aids: Complacency, Automation Bias and the Impact of Training Experience.* Int. J. Human-Computer Studies, 66(9), 688-699. DOI: 10.1016/j.ijhcs.2008.06.001.
Operationalizes complacency as **insufficient verification behavior**. Found under-verification; commission errors linked to high complacency; and **exposing operators to rare automation failures during training reduced complacency**. *Relevance:* letting users *experience* the agent being wrong recalibrates verification: an onboarding pattern.

**[F-13] Goddard, K., Roudsari, A., & Wyatt, J. C. (2012). [E/T]** *Automation Bias: A Systematic Review of Frequency, Effect Mediators, and Mitigators.* JAMIA, 19(1), 121-127. DOI: 10.1136/amiajnl-2011-000089.
Healthcare review confirming automation bias is **common and consequential in clinical decision support**; identifies mediators (task difficulty, trust, confidence, workload) and candidate mitigators. *Relevance:* closest analog to LLM decision copilots: good aids still induce harmful deference; mitigation must be engineered.

**[F-14] Sarter, N. B., Woods, D. D., & Billings, C. E. (1997). [T]** *Automation Surprises.* In Salvendy (Ed.), Handbook of Human Factors and Ergonomics (2nd ed., pp. 1926-1943). Wiley. (book chapter, no DOI)
Coins **"automation surprise"** ("What is it doing? Why? What next?"), rooted in **mode confusion / loss of mode awareness** + **low system observability**, esp. in non-normal, time-critical situations. *Relevance:* an agent silently switching strategies/tools/modes is a textbook surprise generator: expose state and intent.

**[F-15] Sarter, N. B., & Woods, D. D. (1995). [E/T]** *How in the World Did We Ever Get into That Mode? Mode Error and Awareness in Supervisory Control.* Human Factors, 37(1), 5-19. DOI: 10.1518/001872095779049516. (related: "Learning from Automation Surprises and 'Going Sour' Accidents," 1997)
Characterizes **"strong, silent, clumsy"** automation (highly capable but poor at communicating) producing **"going sour" accidents** where a small undetected mismatch compounds. Frames **observability and directability** as the missing properties. *Relevance:* warns against powerful-but-opaque executor agents on long-horizon tasks.

**[F-16] Wickens, C. D., & Dixon, S. R. (2007). [E/T]** *The Benefits of Imperfect Diagnostic Automation: A Synthesis of the Literature.* Theoretical Issues in Ergonomics Science, 8(3), 201-212. DOI: 10.1080/14639220500370105.
Meta-synthesis establishing the **~0.70 reliability crossover**: below ~70% reliability, diagnostic automation tends to be **worse than none**. *Relevance:* a quantitative gut-check: a moderately-accurate autonomous advisor can be net-negative.

**[F-17] Dixon, S. R., Wickens, C. D., & McCarley, J. S. (2007). [E]** *On the Independence of Compliance and Reliance: Are Automation False Alarms Worse Than Misses?* Human Factors, 49(4), 564-572. DOI: 10.1518/001872007X215656.
Dissociates **compliance** (acting on alarms) from **reliance** (trusting silence). **False-alarm-prone** automation harms *both*; miss-prone harms only reliance: **false alarms are especially corrosive**. *Relevance:* tune agentic alert/intervention thresholds toward avoiding false alarms.

**[F-18] Cvach, M. (2012). [E/T]** *Monitor Alarm Fatigue: An Integrative Review.* Biomedical Instrumentation & Technology, 46(4), 268-277. DOI: 10.2345/0899-8205-46.4.268. (see also AHRQ PSNet *Alert Fatigue* primer; Ancker et al. 2017, BMC Med Inform Decis Mak 17:36, DOI 10.1186/s12911-017-0430-8)
Defines **alert fatigue**: under a barrage of mostly-false alerts, operators **desensitize and override/ignore** them, incl. critical ones: the **"cry wolf" effect** (the clinical manifestation of *disuse*). *Relevance:* over-alerting trains users to dismiss the agent's warnings wholesale; alert volume/precision are safety parameters.

**[F-19] Elish, M. C. (2019). [T]** *Moral Crumple Zones: Cautionary Tales in Human-Robot Interaction.* Engaging Science, Technology, and Society (ESTS), 5, 40-60. DOI: 10.17351/ests2019.260.
Introduces the **"moral crumple zone"**: responsibility for failures collapses onto the **nearest human operator**, who has limited actual control, protecting the system at the human's expense. *Relevance:* structural critique of token HITL: a human nominally in the loop without real authority/awareness is a scapegoat, not a safeguard.

**[F-20] Bansal, G., Wu, T., Zhou, J., Fok, R., Nushi, B., Kamar, E., Ribeiro, M. T., & Weld, D. S. (2021). [E]** *Does the Whole Exceed Its Parts? The Effect of AI Explanations on Complementary Team Performance.* CHI 2021. DOI: 10.1145/3411764.3445717 (arXiv:2006.14779).
Explanations **increase acceptance of the AI's recommendation regardless of correctness**, boosting *agreement* but not complementary accuracy. *Relevance:* adding rationales/chain-of-thought may *increase* automation bias; explanations must enable verification, not persuasion.

**[F-21] Buçinca, Z., Malaya, M. B., & Gajos, K. Z. (2021). [E]** *To Trust or to Think: Cognitive Forcing Functions Can Reduce Overreliance on AI in AI-Assisted Decision-Making.* Proc. ACM HCI, 5(CSCW1), Art. 188. DOI: 10.1145/3449287 (arXiv:2102.09692).
People rarely engage System-2 per recommendation, so explanations alone don't fix over-reliance. **Cognitive forcing functions** (decide before seeing the AI's answer; add friction) measurably reduced over-reliance, though users disliked the interventions that helped most. *Relevance:* the most actionable modern HITL pattern: structural friction beats exhortation, with a usability trade-off to manage.

## II.G: HCI foundations: mixed-initiative, human-centered AI, interaction design

### Highlights

- **Initiative is negotiated, not fixed [G-1, G-2].** Decide *per action* whether the agent proposes or acts, driven by **uncertainty about the user's goal × expected cost/benefit of acting**. Act autonomously only when expected utility is clearly positive; otherwise ask, suggest, or defer.
- **Pursue high automation AND high human control simultaneously [G-4].** Reject the false tradeoff (Shneiderman's 2-D HCAI). Target the RST quadrant: an agent that does a lot while the human stays in command. Watch both failure modes: over-automation (lost oversight) and over-control (no leverage).
- **Continuous intelligibility prevents handoff disasters [G-12, G-17].** The danger isn't "too much automation," it's *silent* automation with poor feedback. Keep the human informed throughout (what the agent knows, how it knows it, what it's doing) so takeover at the competence boundary is safe.
- **Close both gulfs [G-11].** Make available actions discoverable (Gulf of Execution) and state/reasoning/effects legible (Gulf of Evaluation). Supervision is impossible without both.
- **Prefer reversibility over confirmation [G-13, G-14, G-15].** Undo beats warnings: confirmations habituate users into clicking through. Make agent actions reversible by default; reserve confirmation gates for genuinely irreversible, high-stakes operations. Always provide a cheap "emergency exit."
- **Design the four phases explicitly [G-7, G-8].** *Initially:* disclose what the agent can do and how well. *During:* time interventions to context, show relevant info, respect norms. *When wrong:* efficient invocation, dismissal, **correction**; scope/hedge when in doubt; explain *why it did that*. *Over time:* learn cautiously, provide **global controls** + change notifications.
- **Calibrate trust to true reliability [G-9, G-10].** Set accurate mental models; never overpromise. Label when AI is acting; make suggestions trivially easy to review, override, or modify.
- **Design for graceful failure [G-9, G-12, G-13].** Assume the agent will be wrong. Build plain-language recovery, constructive remedies, safe fallbacks, not dead ends or silent failure.
- **Augment, don't replace [G-3, G-5, G-10].** Frame the agent as a **supertool / tele-operated device / active appliance** that amplifies a human, not a human-substitute. Keeps responsibility and mastery with the person.
- **Progressive disclosure reconciles simplicity with power [G-16].** Default to a simple, trustworthy interaction; tuck autonomy levels, tool permissions, and reasoning traces one layer down for power users.
- **Protect the human's work and acknowledge latency [G-15].** For long-running tasks: immediate acknowledgment, autosave/preserve in-progress state, keep operations explorable/reversible.
- **Enforce accountability for consequential acts [G-6, G-17].** Surface inferences and keep an identifiable human answerable, backed by layered guardrails (reliable engineering practice → org safety culture → external oversight).

### Annotated bibliography

**[G-1] Horvitz, E. (1999).** *Principles of Mixed-Initiative User Interfaces.* CHI '99, 159-166. DOI: 10.1145/302979.303030.
Canonical: couple automation and direct manipulation so human and machine negotiate who acts when. ~12 factors incl. **uncertainty about the user's goal**, **expected cost/benefit of autonomous action** (act only when expected utility is positive), dialog to resolve uncertainty, **efficient invocation/termination**, graceful degradation/direct invocation, scoping precision to uncertainty, and **memory of recent interactions**. Demonstrated in LookOut. *Counters:* the all-or-nothing automation trap. *Relevance:* the rulebook for *initiative handoff*: when an agent should propose vs. act, computed from confidence × stakes.

**[G-2] Allen, J., Guinn, C. I., & Horvitz, E. (1999).** *Mixed-Initiative Interaction.* IEEE Intelligent Systems 14(5), 14-23 (Trends & Controversies). https://erichorvitz.com/mixedinit.htm (exact pagination UNVERIFIED)
Frames mixed-initiative as flexible, shifting negotiation of control. *Counters:* rigid task allocation breaks when competence varies by situation. *Relevance:* motivates dynamic, per-turn control allocation rather than a static autonomy setting.

**[G-3] Shneiderman, B., & Maes, P. (1997).** *Direct Manipulation vs. Interface Agents.* Interactions 4(6), 42-61. https://www.cs.umd.edu/users/ben/papers/Shn-Maes-v4n6-1997.pdf
The landmark debate. Shneiderman: direct manipulation (visible objects, reversible actions, predictability, user control); warns agents erode mastery/responsibility. Maes: complex task spaces need agents to delegate to, which earn trust gradually. *Both surface:* over-reaching agents destroy predictability/accountability; pure manual control doesn't scale. *Relevance:* the original framing of the delegation-vs-control tension agentic HITL must resolve.

**[G-4] Shneiderman, B. (2020).** *Human-Centered Artificial Intelligence: Reliable, Safe & Trustworthy.* IJHCI 36(6), 495-504. DOI: 10.1080/10447318.2020.1741118 (arXiv:2002.04087).
The **2-D HCAI framework**: independent axes of *human control* and *computer automation*; target the upper-right (high automation AND high control) → Reliable, Safe & Trustworthy. Names failure quadrants (excessive automation → lost oversight; excessive control → tedium). *Relevance:* the master mental model: keep the human "in command, not in the loop of everything."

**[G-5] Shneiderman, B. (2020).** *Human-Centered Artificial Intelligence: Three Fresh Ideas.* AIS THCI 12(3), 109-124. https://aisel.aisnet.org/thci/vol12/iss3/1/
Adds design metaphors (**supertools, tele-operated devices, active appliances**) and a governance roadmap. *Flags:* treating autonomy as the goal rather than amplified, controllable human performance. *Relevance:* concrete UX archetypes for how much an agent acts vs. amplifies.

**[G-6] Shneiderman, B. (2022).** *Human-Centered AI.* Oxford University Press. ISBN 9780192845290.
Book-length synthesis; adds a multi-layer governance model: **reliable** (team/SE practice), **safe** (org safety culture), **trustworthy** (independent oversight + regulation). *Relevance:* maps the layered guardrails production agentic deployments need around the HITL UX.

**[G-7] Amershi, S., Weld, D., Vorvoreanu, M., et al. (2019).** *Guidelines for Human-AI Interaction.* CHI '19, Paper 3. DOI: 10.1145/3290605.3300233.
**18 validated guidelines** by phase. *Initially:* (1) make clear what the system can do; (2) how well. *During:* (3) time services to context; (4) show contextual info; (5) match social norms; (6) mitigate bias. *When wrong:* (7) efficient invocation; (8) efficient dismissal; (9) efficient correction; (10) scope when in doubt; (11) make clear *why*. *Over time:* (12) remember recent interactions; (13) learn from behavior; (14) update cautiously; (15) encourage granular feedback; (16) convey consequences; (17) **global controls**; (18) notify about changes. *Relevance:* the single most directly applicable guideline set for agentic HITL.

**[G-8] Microsoft Research (2021-2023).** *HAX Toolkit (Guidelines, Design Library, Patterns, Playbook, Workbook).* https://www.microsoft.com/en-us/haxtoolkit/
Operationalizes the 18 guidelines into a searchable pattern library, failure-scenario playbook, and prioritization workbook. *Relevance:* a ready-made pattern catalog for building HITL affordances (surface confidence, support correction).

**[G-9] Google PAIR (2019, updated for generative AI).** *People + AI Guidebook.* https://pair.withgoogle.com/guidebook-v2/
Six chapters / patterns: User Needs + Success, Data + Evaluation, **Mental Models**, **Explainability + Trust**, **Feedback + Control**, **Errors + Graceful Failure**. Core: calibrate trust to reliability; set accurate mental models; design for graceful failure. *Relevance:* supplies HITL design moves: feedback+control loops, explainability, graceful failure for generative agents.

**[G-10] Apple (2024-2025).** *Human Interface Guidelines: Machine Learning & Generative AI.* https://developer.apple.com/design/human-interface-guidelines/machine-learning · /generative-ai
AI should augment, not replace; indicate when AI is involved; make suggestions easy to **review, override, modify**; preserve agency; responsible-AI guidance (bias, safety, provenance). *Relevance:* consumer-grade norms for labeling AI actions and keeping overrides cheap: table stakes for agentic UX.

**[G-11] Norman, D. A. (2013, rev.; orig. 1988).** *The Design of Everyday Things.* Basic Books.
Establishes **affordances/signifiers, mapping, constraints, conceptual models, feedback**; and the **Gulf of Execution** (intention → available action) and **Gulf of Evaluation** (system state → user understanding). *Relevance:* an agent must close both gulfs: discoverable actions + legible state/reasoning/effects.

**[G-12] Norman, D. A. (1990).** *The 'Problem' with Automation: Inappropriate Feedback and Interaction, Not 'Over-Automation'.* Phil. Trans. R. Soc. Lond. B 327(1241), 585-593. DOI: 10.1098/rstb.1990.0101.
Automation failures stem from **inadequate feedback/interaction**, not too much automation; "intermediate intelligence" automation drops the human into a crisis with no SA (out-of-the-loop). *Relevance:* the foundational argument for *continuous intelligibility*: keep the human informed so boundary handoff is safe.

**[G-13] Nielsen, J. (1994/2020).** *10 Usability Heuristics for User Interface Design.* NN/g. https://www.nngroup.com/articles/ten-usability-heuristics/
Four are critical to HITL: **#1 Visibility of system status**; **#3 User control and freedom** (emergency exits, undo/redo); **#5 Error prevention** (confirm before commitment); **#9 Recognize, diagnose, recover from errors**. *Relevance:* a compact checklist mapping one-to-one onto supervising an agent.

**[G-14] Raskin, A. (2007).** *Never Use a Warning When You Mean Undo.* A List Apart. https://alistapart.com/article/neveruseawarning/
Confirmation warnings train reflexive click-through and don't prevent errors; reversibility (undo) is the superior pattern (e.g., Gmail "Undo Send"). *Relevance:* prefer reversible, undoable agent operations over confirmation gates; reserve confirmation for genuinely irreversible/high-stakes steps.

**[G-15] Tognazzini, B. (2014, rev.).** *First Principles of Interaction Design.* askTog. https://asktog.com/atc/principles-of-interaction-design/
**Protect Users' Work** (never lose work; autosave, easy undo) and **Latency Reduction** (acknowledge within ~50 ms; hide latency); **explorable** interfaces (reversible, no dead ends). *Relevance:* for long-running agent tasks: immediate acknowledgment, protect in-progress work, keep operations explorable.

**[G-16] Nielsen, J. (2006).** *Progressive Disclosure.* NN/g. https://www.nngroup.com/articles/progressive-disclosure/
Defer advanced/rare features to secondary views; show the most important first → better learnability, efficiency, error rate. *Relevance:* surface a simple default interaction while keeping deep controls (autonomy levels, permissions, reasoning traces) one layer down: "high control AND high automation" without clutter.

**[G-17] Bellotti, V., & Edwards, K. (2001).** *Intelligibility and Accountability: Human Considerations in Context-Aware Systems.* Human-Computer Interaction 16(2-4), 193-212. DOI: 10.1207/S15327051HCI16234_05.
Systems can't simply act on users' behalf because social context is unsensable. Two imperatives: **Intelligibility** (represent what it knows, how, and what it's doing) and **Accountability** (enforce user accountability rather than acting opaquely). *Relevance:* the conceptual root of "explainable, controllable agents": expose inferences; keep a human accountable for consequential acts.

## II.H: Adjacent safety-critical domains (aviation, medical, AVs, control rooms)

_Tags: **[INCIDENT]** accident investigation · **[STUDY]** empirical/review · **[STANDARD]** standard/guidance._

### Highlights

- **The handoff problem is the central HITL failure mode.** AF447, Asiana 214, Uber Tempe, the Tesla crashes, and the L3 takeover meta-analysis converge: abruptly handing control to a disengaged human at the worst moment fails. Re-engagement takes **1.5-3.5+ s** (competence longer), grows with disengagement, and often arrives too late. Design handoffs *anticipatory, gradual, context-rich*, and accept that for time-critical failures the human fallback may not be viable.
- **The "last line of defense" / human-safety-driver fallacy.** A human kept nominally responsible but operationally idle is the *least* reliable safeguard because reliable automation induces disengagement [H-16, H-17, H-18]. Oversight requires *active, verified engagement*; gameable engagement checks provide the illusion, not the substance.
- **Alert fatigue is quantified and severe.** Clinicians override **49-96%** of drug-safety alerts [H-10]; TMI dumped **100+** unprioritized alarms in minutes [H-20]. Indiscriminate flagging trains humans to dismiss *everything*, including the rare valid signal. Reserve interruptive/blocking interventions for high-severity cases; make the rest passive. EEMUA: every alarm must demand a *defined response*; cap the interruptive rate [H-21].
- **You can't safely fix alert fatigue by muting the noisiest signals [H-11].** Rare-but-critical cases hide in high-override categories. Reduce volume by per-case risk stratification/tiering, not blanket suppression.
- **Skill decay is real and measured [H-9, H-1].** Heavy automation erodes the underlying skill (errors in ~60% of studied cases). A human who never performs the task can't meaningfully review an agent that does: build in deliberate manual practice.
- **Out-of-the-loop = lost comprehension, not just lost data [H-3].** Showing logs/raw output isn't enough; the human needs to retain comprehension of what the agent is doing and *why*. Intermediate automation preserves takeover ability better than full autonomy with a passive monitor.
- **Over-trust and under-trust are one calibration problem [H-2].** Even experts are biased by confident-but-wrong AI recommendations [H-13]. Calibrate trust to *actual* reliability; surface confidence/uncertainty honestly.
- **Mode confusion is first-class for agents with multiple states/permissions [H-5].** Users must always know what the agent is doing and under what authority *right now*. Silent transitions (suggest→act; a guardrail silently disabled) are the cockpit mode errors behind Asiana 214 [H-8].
- **Select the appropriate level of automation, and make stepping *down* easy [H-6].** "Children of the magenta line": the failure is uncritically riding maximum automation into task saturation.
- **There is a hard ceiling on supervisory span [H-22].** One operator caps at a handful of actively-supervised agents; performance collapses past ~70% utilization. Scaling agent count without scaling/pooling oversight guarantees unmonitored failures.
- **Crisis is exactly when the firehose hurts most [H-20, H-7].** At overload, prioritize, aggregate, and interpret *for* the human, don't dump everything.
- **Validate the human-system combination, with realistic misuse [H-14, H-16].** Safety is a property of the whole socio-technical system; test against real, over-trusting users, and don't let an org offload safety responsibility onto a single monitor.

### Annotated bibliography

**[H-1] Bainbridge, L. (1983). [STUDY]** *Ironies of Automation.* Automatica 19(6), 775-779. (full entry at [E-7])
The automation paradox: the more you automate, the more critical/demanding the residual human role. *Transferable lesson:* leaving the human "only the exceptions" is self-defeating: the exceptions are the hard cases; keep the human meaningfully in the loop *during* normal operation.

**[H-2] Parasuraman, R., & Riley, V. (1997). [STUDY]** *Humans and Automation: Use, Misuse, Disuse, Abuse.* Human Factors 39(2), 230-253. (full entry at [F-2])
*Transferable lesson:* over- and under-trust are two failure modes of the *same* calibration problem; too many low-value flags train the human to ignore valid ones. Calibration is a design responsibility, not the user's fault.

**[H-3] Endsley, M. R., & Kiris, E. O. (1995). [STUDY]** *The Out-of-the-Loop Performance Problem and Level of Control in Automation.* Human Factors 37(2), 381-394. DOI: 10.1518/001872095779064555.
Higher automation degrades *comprehension* (L2 SA) even when data monitoring (L1) is intact, slowing recovery; OOTL decrement worse under full than intermediate automation. *Transferable lesson:* keep the human in the decision loop; display raw data is not enough: humans need comprehension, not just awareness.

**[H-4] Endsley, M. R. (2017). [STUDY]** *From Here to Autonomy: Lessons Learned From Human-Automation Research.* Human Factors 59(1), 5-27. DOI: 10.1177/0018720816681350.
The "automation conundrum": rising autonomy/reliability → falling SA → less able to take over at the rare failure. *Transferable lesson:* reliability is not a substitute for transparency; an opaque-but-reliable agent makes rare failures *more* likely to slip past the human.

**[H-5] Sarter, N. B., & Woods, D. D. (1995). [STUDY]** *"How in the World Did We Ever Get into That Mode?" Mode Error and Awareness in Supervisory Control.* Human Factors 37(1), 5-19. DOI: 10.1518/001872095779049516.
Glass-cockpit mode confusion → "automation surprises." *Transferable lesson:* the canonical risk for any agent with multiple states/permissions/tool-policies: users must always be able to answer "what is the agent doing and under what authority?" Invisible mode changes (suggest→act) are direct analogues.

**[H-6] Vanderburgh, W., "Children of the Magenta Line," American Airlines (1997). [STUDY / training]** AA Flight Academy lecture. Analysis: https://airfactsjournal.com/2020/09/stepping-down-in-automation-the-real-lesson-for-children-of-the-magenta-line/ · 99% Invisible: https://99percentinvisible.org/episode/children-of-the-magenta-automation-paradox-pt-1/
~68% of AA incidents involved automation mismanagement; pilots failed to *step down* to lower automation when needed, losing SA and saturating. *Transferable lesson:* make it easy and natural to drop to lower-autonomy/manual mode under uncertainty, rather than defaulting users into maximum automation.

**[H-7] BEA (2012). [INCIDENT]** *Final Report: Air France Flight 447 (A330-203, F-GZCP), 1 June 2009.* Bureau d'Enquêtes et d'Analyses. https://bea.aero/en/investigation-reports/notified-events/detail/ (AF447) · HF analysis: https://humanfactors101.com/incidents/air-france-flight-447/
Iced pitot tubes → airspeed loss → autopilot disconnect → startled, out-of-the-loop crew with atrophied high-altitude handling held nose-up and stalled into the ocean; 228 died. *Transferable lesson:* the textbook *startle + sudden handoff to an unprepared human*. Handoffs must be anticipatory, gradual, and context-rich, not a panic dump.

**[H-8] NTSB (2014). [INCIDENT]** *Asiana Airlines Flight 214, B777-200ER, San Francisco, 6 July 2013.* NTSB/AAR-14/01. https://www.ntsb.gov/investigations/AccidentReports/Reports/AAR1401.pdf
Over-reliance on automation not fully understood; an inappropriate autopilot mode (FLCH) left the autothrottle no longer protecting airspeed; faulty mental model → landed short into the seawall. *Transferable lesson:* never let the human assume a guardrail is on when a mode choice silently disabled it; make active safety protections and their gaps explicit.

**[H-9] PARC/CAST Flight Deck Automation WG (2013). [STANDARD]** *Operational Use of Flight Path Management Systems.* FAA. https://www.faa.gov/sites/faa.gov/files/aircraft/air_cert/design_approvals/human_factors/OUFPMS_Report.pdf (host 403 to fetcher; corroborated via SKYbrary)
29 findings/18 recommendations: documented manual-flying **skill decay**, automation dependency, knowledge gaps, complacency; manual handling errors in ~60% of cases → FAA SAFO 13002/17007 urging hand-flying. *Transferable lesson:* heavy automation erodes skill; oversight needs deliberate "manual practice": a human who never does the task can't review the agent.

**[H-10] van der Sijs, H., Aarts, J., Vulto, A., & Berg, M. (2006). [STUDY]** *Overriding of Drug Safety Alerts in Computerized Physician Order Entry.* JAMIA 13(2), 138-147. https://pmc.ncbi.nlm.nih.gov/articles/PMC1447540/
Clinicians override drug-safety alerts in **49-96%** of cases, driven by poor signal-to-noise. *Transferable lesson:* the empirical heart of alert fatigue: indiscriminate flagging makes humans override ~everything, including the rare valid alert. Specificity/prioritization are safety-critical.

**[H-11] van der Sijs, H., et al. [STUDY]** *Turning off frequently overridden drug alerts: limited opportunities for doing it safely.* JAMIA. https://pmc.ncbi.nlm.nih.gov/articles/PMC2585537/ (exact PMC ID UNVERIFIED; widely cited)
Simply suppressing the most-overridden alerts is unsafe: a minority remain clinically critical. *Transferable lesson:* don't reduce agent alert volume by blanket-muting noisy categories; rare-but-fatal cases hide in the noise: use per-case risk stratification.

**[H-12] Page, N., Baysari, M. T., & Westbrook, J. I. (2019). [STUDY]** *Medication safety alert fatigue may be reduced via interaction design and clinical role tailoring: a systematic review.* JAMIA 26(10), 1141-1149. https://academic.oup.com/jamia/article/26/10/1141/5519579
Alert fatigue reduced by tiering interruptive vs. passive alerts and tailoring to role/context. *Transferable lesson:* the fix is *design*, not more alerts: reserve interruptive/blocking for high-severity; make most signals passive; route the right alert to the right human (maps to notify vs. require-approval vs. block).

**[H-13] Dratsch, T., et al. (2023). [STUDY]** *Automation Bias in Mammography: The Impact of AI BI-RADS Suggestions on Reader Performance.* Radiology 307(4). https://pubs.rsna.org/doi/full/10.1148/radiol.222176
Radiologists at all experience levels were swayed by AI suggestions; *incorrect* AI advice degraded accuracy even among experts. *Transferable lesson:* expertise doesn't immunize against automation bias: "a human reviews it" is not a reliable safeguard when the human anchors on the agent's output.

**[H-14] U.S. FDA (2016). [STANDARD]** *Applying Human Factors and Usability Engineering to Medical Devices.* FDA. https://www.fda.gov/media/80481/download
Manufacturers must validate safety in the hands of *real, fallible* users under realistic conditions, incl. use errors. *Transferable lesson:* demonstrate safety for the *human-system combination* incl. misuse and over-trust, not just nominal performance.

**[H-15] SAE International (2021). [STANDARD]** *J3016: Taxonomy and Definitions for Driving Automation Systems* (rev. 202104). https://www.sae.org/standards/content/j3016_202104/
Levels 0-5; the critical L2→L3 boundary: at L3 the system does the entire dynamic driving task but the human must be a fallback when prompted. *Transferable lesson:* the most dangerous region is the ambiguous middle: "the agent mostly does it, but you're responsible if it fails." Clear, communicated authority (who's responsible *right now*) matters more than raw capability.

**[H-16] NTSB (2019). [INCIDENT]** *Collision Between Developmental ADS Vehicle and Pedestrian, Tempe, AZ, 18 Mar 2018.* NTSB/HAR-19/03. https://www.ntsb.gov/investigations/AccidentReports/Reports/HAR1903.pdf
First pedestrian fatality by a self-driving car: misclassification + "action suppression" delayed braking; the safety driver was on her phone; NTSB cited deficient safety culture and unmanaged automation complacency. *Transferable lesson:* the "human safety driver as last line of defense" is a fallacy when the system is reliable enough to induce disengagement but not enough to trust.

**[H-17] NTSB (2017). [INCIDENT]** *Tesla Autopilot, Williston, FL, 7 May 2016.* NTSB/HAR-17/02. https://www.ntsb.gov/investigations/AccidentReports/Reports/HAR1702.pdf
Probable cause included driver inattention from over-reliance, *enabled by a design that permitted prolonged disengagement* and use outside intended conditions. *Transferable lesson:* if an agent *allows* the human to check out, they will: over-reliance is a predictable product of permissive design; constrain use to the operational design domain.

**[H-18] NTSB (2020). [INCIDENT]** *Tesla Autopilot, Mountain View, CA, 23 Mar 2018.* NTSB/HAR-20/01. https://www.ntsb.gov/investigations/AccidentReports/Reports/HAR2001.pdf
Autopilot steered into a gore-point barrier; driver playing a game; NTSB found no *effective* driver-engagement monitoring and inadequate alert timing. *Transferable lesson:* token engagement checks (trivially gamed hands-on-wheel nags) aren't oversight: verify *meaningful* engagement.

**[H-19] Zhang, B., de Winter, J., Varotto, S., Happee, R., & Martens, M. (2019). [STUDY, meta-analysis]** *Determinants of take-over time from automated driving: A meta-analysis of 129 studies.* Transportation Research Part F 64, 285-307. https://www.sciencedirect.com/science/article/pii/S1369847818307249
Takeover time typically **~1.5-3.5 s**, worsened by non-driving tasks, shortened by urgent/multimodal warnings; quality degrades with secondary-task load. *Transferable lesson:* handoff isn't instantaneous: budget for re-engagement latency; for time-critical failures the human-fallback model may simply not work.

**[H-20] President's Commission (Kemeny) (1979). [INCIDENT]** *Report on the Accident at Three Mile Island.* U.S. GPO. https://www.threemileisland.org/downloads/188.pdf
**100+ alarms** with no prioritization/suppression, poorly arranged indicators, contradictory feedback → wrong operator actions; absent the HF failures it would have been minor. *Transferable lesson:* the original alarm-flood disaster: dumping everything at once *disables* oversight. Prioritize, aggregate, and interpret *for* the human at the moment of overload.

**[H-21] EEMUA (2013). [STANDARD]** *Publication 191: Alarm Systems: A Guide to Design, Management and Procurement* (3rd ed.). https://www.eemua.org/Products/Publications/Print/EEMUA-Publication-191.aspx (paywalled; existence verified)
Defines an alarm as something requiring a *specific operator response*; target ≤~10 alarms / 10 min / operator; alarm rationalization to delete/downgrade nuisance alarms. *Transferable lesson:* a quantified discipline for keeping oversight signals within human capacity: every agent "flag" should demand a defined action; cap the interruptive rate; everything else is a passive log.

**[H-22] Cummings, M. L., Bruni, S., Mercier, S., & Mitchell, P. J. (2007). [STUDY]** *Automation Architecture for Single Operator, Multiple UAV Command and Control.* The International C2 Journal 1(2), 1-24. http://www.dodccrp.org/files/IC2J_v1n2_01_Cummings.pdf
Span of control rises with autonomy (~4-5 active, up to ~12 supervisory), but operator **utilization above ~70%** triggers sharp performance decay; high autonomy/rapid re-planning erodes SA and breeds complacency. *Transferable lesson:* a hard ceiling on how many agents one person can meaningfully supervise: scaling agent count without scaling/pooling oversight is a predictable path to unmonitored failures.

---

# Part III: Delegation, Organization & Resilience

_The theory of delegating to, organizing around, and staying safe with an autonomous agent, the
formal backbone the first two parts lacked._

## III.J: Delegation: economics & law

_A human delegating to an LLM agent **is** a principal-agent relationship; a century of economics and
agency law already maps its failure modes and the price of oversight. Tags: theoretical / legal-doctrine / AI-application._

### Highlights

- **A human delegating to an LLM agent is, formally, a principal-agent relationship [J-1, J-2].** The failure taxonomy (divergent objectives, hidden action, hidden type, costly observation) is already mapped; HITL is the *monitoring* term in a century-old equation.
- **Oversight is costly monitoring, and total agency cost can never hit zero [J-2].** Jensen-Meckling's *monitoring + bonding + residual loss* reframes HITL as *minimizing total cost*, not maximizing control: human review = monitoring; guardrails/evals = bonding; tolerated errors = residual loss.
- **"Management by exception" is the optimal response to monitoring cost [J-7].** Because informative signals have decreasing marginal value, review only the diagnostic exceptions: the economic justification for selective, risk-triggered HITL over uniform review.
- **Observability of the agent's *process* is provably valuable: log the trace [J-7].** Holmström's informativeness principle: any signal informative about the agent's *action* strictly lowers agency cost. Traces/tool-call logs/chain-of-thought are exactly those signals.
- **Measuring one thing distorts the rest: Goodhart has an economic theorem [J-10].** The multitask result: strong incentives on a measurable sub-goal degrade unmeasured ones → low-powered incentives + task/job-design limits. Over-tuning to one eval is structurally wrong; reward-hacking is predicted.
- **You can't specify everything, so the real choice is who holds residual control [J-8, J-9].** Incomplete-contracts theory: power lives in the override / final-decision right for unforeseen states. HITL *is* the assignment of residual control rights; selective intervention (halt, revoke access, substitute) is the operative form of control.
- **Behavior-based vs. outcome-based oversight is a contractible choice [J-5].** When behavior is observable/cheap to monitor, supervise the *process*; else contract on *outcomes* and bear the risk. Tells you whether HITL inspects steps or only final outputs.
- **Trust starts before runtime: agent/model selection is an adverse-selection problem [J-6].** Evals/reputation/screening are the "lemons" remedy; monitoring after delegation does not substitute for screening what you delegate to.
- **Authority must be scoped, and an agent can bind you beyond its scope [J-13].** Actual vs. *apparent* authority; ratification. Permission scoping is the technical twin of scope-of-authority; accepting an out-of-scope action ratifies it.
- **The principal is generally liable for the agent's in-scope acts [J-14, J-19].** Respondeat superior routes responsibility to the operator; narrowing scope is both a safety control and the primary liability lever. Since the agent has no intent, the law puts the human principal on the hook.
- **Some duties are non-delegable: the law itself can mandate a human in the loop [J-15, J-16].** Outsourcing a task doesn't outsource accountability; fiduciary *loyalty* + *care* supply the normative target for "alignment."
- **The AI-specific literature already translates all of this [J-17, J-18, J-19].**

### Annotated bibliography

**[J-1] Ross, S. A. (1973). [theoretical]** *The Economic Theory of Agency: The Principal's Problem.* American Economic Review 63(2), 134-139. JSTOR 1817064.
Annotation: Founding statement of the *economic* agency problem: the principal chooses an incentive schedule when the agent's interests/information/risk-preferences diverge. Even a perfect contract requires *paying* to realign the agent. *Relevance:* the LLM operator is Ross's principal; "prompt + reward" is the fee schedule; misalignment is structural.

**[J-2] Jensen, M. C., & Meckling, W. H. (1976). [theoretical]** *Theory of the Firm: Managerial Behavior, Agency Costs and Ownership Structure.* J. Financial Economics 3(4), 305-360. DOI: 10.1016/0304-405X(76)90026-X.
Annotation: Introduces **agency cost** = monitoring + bonding + residual loss; total cost is irreducible to zero. *Relevance:* the single most transferable frame: human review = monitoring, guardrails/evals = bonding, accepted errors = residual loss.

**[J-3] Stiglitz, J. E. (1974). [theoretical]** *Incentives and Risk Sharing in Sharecropping.* Review of Economic Studies 41(2), 219-255. DOI: 10.2307/2296714.
Annotation: Models the incentive-vs-risk-sharing trade-off; the optimum depends on output-signal noise. *Relevance:* high-stakes/noisy agent outputs warrant more direct control; low-stakes/clean ones warrant autonomy.

**[J-4] Grossman, S. J., & Hart, O. D. (1983). [theoretical]** *An Analysis of the Principal-Agent Problem.* Econometrica 51(1), 7-45. DOI: 10.2307/1912246.
Annotation: Rigorous formalization of hidden action; the cost of inducing a desired action rises as the effort→output link weakens. *Relevance:* hard-to-verify agent tasks (research, open-ended reasoning) are the expensive ones to oversee.

**[J-5] Eisenhardt, K. M. (1989). [review]** *Agency Theory: An Assessment and Review.* Academy of Management Review 14(1), 57-74. DOI: 10.5465/amr.1989.4279003.
Annotation: Distills the design choice between **behavior-based** (monitor the process) and **outcome-based** (pay for results) contracts, governed by uncertainty, goal conflict, programmability, measurability. *Relevance:* a ready-made rule for whether HITL inspects the trace or only the output.

**[J-6] Akerlof, G. A. (1970). [theoretical]** *The Market for "Lemons": Quality Uncertainty and the Market Mechanism.* QJE 84(3), 488-500. DOI: 10.2307/1879431.
Annotation: Seminal **adverse selection** (hidden *type*): unobservable quality drives good types out. *Relevance:* model/agent *selection* is a pre-delegation problem distinct from runtime monitoring; screening/evals/reputation are the remedy.

**[J-7] Holmström, B. (1979). [theoretical]** *Moral Hazard and Observability.* Bell J. Economics 10(1), 74-91. DOI: 10.2307/3003320.
Annotation: The **informativeness principle**: any signal informative about the agent's *action* should enter the contract and strictly reduces agency cost. *Relevance:* the theoretical license for trace/tool-call/CoT logging: process observability is the cheapest lever for trust.

**[J-8] Grossman, S. J., & Hart, O. D. (1986). [theoretical]** *The Costs and Benefits of Ownership: A Theory of Vertical and Lateral Integration.* JPE 94(4), 691-719. DOI: 10.1086/261404.
Annotation: Founds **incomplete-contracts / residual control rights**: what matters is who decides in unforeseen contingencies. *Relevance:* the formal basis for "human retains the override": HITL assigns residual control rights.

**[J-9] Hart, O., & Moore, J. (1990). [theoretical]** *Property Rights and the Nature of the Firm.* JPE 98(6), 1119-1158. DOI: 10.1086/261729.
Annotation: Control is exercised through *selective intervention* (the ability to halt/withdraw access), not an exhaustive rulebook. *Relevance:* grounds kill-switches, scoped credentials, and selective task-revocation as the real instruments of control.

**[J-10] Holmström, B., & Milgrom, P. (1991). [theoretical]** *Multitask Principal-Agent Analyses.* J. Law, Economics & Organization 7 (special issue), 24-52. DOI: 10.1093/jleo/7.special_issue.24.
Annotation: The **multitask** result: strong incentives on the measurable task distort effort away from unmeasured ones → low-powered incentives + job-design limits. A formal cousin of Goodhart. *Relevance:* explains reward-hacking/spec-gaming as structural; bound the *task*, don't just sharpen the metric.

**[J-11] Royal Swedish Academy of Sciences (2016). [review]** *Oliver Hart and Bengt Holmström: Contract Theory* (2016 Prize background). NobelPrize.org.
Annotation: Authoritative synthesis tying moral hazard, informativeness, performance-measure distortion, and residual control into one toolkit for "designing policies and institutions." *Relevance:* a vetted one-stop overview of the delegation-contracting toolkit for agent governance.

**[J-12] Williamson, O. E. (1985). [theoretical]** *The Economic Institutions of Capitalism.* Free Press. ISBN 9780029348215.
Annotation: Transaction-cost economics: under bounded rationality + opportunism + asset specificity, craft *governance structures* matched to the hazard profile. *Relevance:* vocabulary for matching oversight intensity to risk.

**[J-13] American Law Institute (2006). [legal-doctrine]** *Restatement (Third) of Agency.* ALI.
Annotation: Distinguishes **actual** vs. **apparent** authority and **ratification**: a principal can be bound by acts it never authorized (if it created the appearance) and can ratify after the fact. *Relevance:* an agent acting beyond scope may still bind its operator; accepting an out-of-scope action ratifies it. Scope limits = permission scoping.

**[J-14] Cornell LII, Wex. [legal-doctrine]** *Respondeat Superior / Vicarious Liability.* law.cornell.edu/wex/respondeat_superior.
Annotation: Principal is liable for an agent's wrongful acts within the scope of agency. *Relevance:* liability flows to the operator for in-scope acts; narrowing scope is the principal's main liability lever.

**[J-15] Cornell LII, Wex (+ Restatement (Third) §7.06). [legal-doctrine]** *Non-Delegable Duty.* law.cornell.edu/wex/vicarious_liability. (treated within vicarious-liability material)
Annotation: Some duties cannot be offloaded; the principal stays liable regardless of who performs the act. *Relevance:* a hard legal limit on automation: certain decisions are non-delegable to an AI, mandating a human in the loop.

**[J-16] Cornell LII, Wex (+ Restatement (Third) §§8.01-8.08). [legal-doctrine]** *Fiduciary Relationship.* law.cornell.edu/wex/fiduciary_relationship.
Annotation: Agency is inherently fiduciary: duties of **loyalty** (act solely in the principal's interest) and **care** (competence/diligence). *Relevance:* the normative target for "alignment" in law: an aligned agent discharges loyalty + care.

**[J-17] Kolt, N. (2025). [legal/AI-application]** *Governing AI Agents.* Notre Dame Law Review (forthcoming). arXiv:2501.07913.
Annotation: Imports both economic principal-agent theory and common-law agency to AI; names information asymmetry, discretionary authority, and loyalty as the recurring agency problems, proposing inclusivity/visibility/liability infrastructure. *Relevance:* a roadmap translating [J-1]-[J-16] into agent governance (visibility = monitoring; liability = who answers).

**[J-18] Gabison, G. A., & Xian, R. P. (2025). [theoretical/AI-application]** *Inherent and Emergent Liability Issues in LLM-Based Agentic Systems: A Principal-Agent Perspective.* arXiv:2504.03255.
Annotation: Applies principal-agent theory to liability; interpretability/eval/detection are the technical substitutes for the monitoring the theory demands. *Relevance:* operationalizes the informativeness principle as concrete agent-observability mechanisms.

**[J-19] Ayres, I., & Balkin, J. M. (2024). [legal/AI-application]** *The Law of AI is the Law of Risky Agents Without Intentions.* University of Chicago Law Review Online.
Annotation: Since AI agents lack intent, *ascribe* intent (foreseeable consequences) and impose *objective* reasonableness on the humans/orgs who deploy them. *Relevance:* resolves the "agent can't form intent" objection by routing accountability to the human principal: a legal warrant for oversight obligations.

## III.K: Delegation: doctrine & management

_How organizations and militaries delegate by intent and boundaries rather than step-by-step control._

### Highlights

- **Specify intent + boundaries, not steps**, the most cross-validated lesson [K-7, K-8, K-6, K-19, K-20]: brief with *purpose + desired end-state + constraints*, then delegate method. Mission orders state "results to attain, not how."
- **Management by exception is the default oversight posture [K-1]:** handle the routine autonomously, escalate only deviations. Tune **active** (tight tripwires) vs **passive** (intervene on failure) by risk tier [K-2], with measured cost trade-offs [K-3]; avoid drifting into laissez-faire.
- **Pre-authorize action limits in advance [K-12, K-13].** Rules of engagement are decisions made *before* the moment; encode an agent's always-allowed set and prohibitions as a structured, condition-keyed, machine-checkable policy.
- **Bound to enable, not just to restrict [K-14].** Over-tight/ambiguous boundaries degrade initiative and tempo; clear boundaries are a force enabler.
- **Span-of-control ceilings cap multi-agent oversight [K-4, K-5]:** coordination load grows geometrically (~5-6 interdependent subordinates). Cap concurrent agents per supervisor or decouple them (loose coupling + homogeneity) to widen the safe span.
- **Autonomy is a dial, not a switch [K-15]**: assign each action class a Level of Automation; **adjustable autonomy** [K-17, K-18] makes the dial runtime-tunable via policy.
- **Make agents directable, observable, predictable (OPD) [K-16]:** team effectiveness comes from supporting *interdependence*, not maximizing independence.
- **Escalation should be a cost-aware policy [K-18]:** "act vs. hand back to the human" weighs expected cost of a wrong autonomous act against the cost/delay of interrupting: the formal trigger logic behind management-by-exception.
- **Pair autonomy with shared context [K-10]:** "empowered execution without shared consciousness is dangerous." Grant autonomy only alongside rich briefing.
- **Orientation beats raw speed [K-11]:** Boyd's OODA: invest in the agent's context/tools/memory (Orient) before letting it run faster loops; humans add most value in framing.
- **Govern with policy, not micromanagement [K-17]:** runtime-adjustable authorizations + obligations as the control surface, "highest useful autonomy at acceptable trust."
- **Honor intent over literal instruction [K-9]:** the "duty to deviate" (an agent should optimize for *stated intent* when literal instructions conflict) but only when observability/directability let the human catch misjudgments.

### Annotated bibliography

**[K-1] Taylor, F. W. (1903/1911). [conceptual]** *Shop Management; The Principles of Scientific Management.* Harper.
Annotation: Credited with the first articulation of *management by exception*: delegate the routine, reserve attention for deviations. *Relevance:* the foundational oversight posture, "handle the routine; surface only the exceptions"; define the expected envelope so the agent can self-identify exceptions.

**[K-2] (Management-literature synthesis). [conceptual]** *Management by Exception.* en.wikipedia.org/wiki/Management_by_exception.
Annotation: **Active** MBE (monitor + intervene pre-crisis) vs **passive** MBE (intervene after breach). *Relevance:* choose the MBE mode by risk tier: active for high-stakes/irreversible agent actions, passive for low-stakes/reversible.

**[K-3] Bass, B. M. & Avolio, B. J. (1990s-2000s); Judge & Piccolo (2004). [empirical]** *Full Range Leadership Model / MLQ.* (meta-analysis J. Applied Psychology).
Annotation: Formalizes MBE-active, MBE-passive, and laissez-faire (over-delegation) as measurable, outcome-linked dimensions. *Relevance:* "how actively do we watch the agent" is a tunable parameter on a real cost gradient; don't drift into laissez-faire.

**[K-4] Graicunas, V. A. (1933). [conceptual]** *Relationship in Organization* (in Gulick & Urwick, eds.).
Annotation: Subordinate relationships grow *geometrically* as subordinates grow arithmetically → a reasonable span of ~5-6. *Relevance:* interdependence (not headcount) caps how many agents one supervisor can oversee.

**[K-5] Urwick, L. F. (1956); Davis, R. C. (1951). [conceptual]** *The Manager's Span of Control* (HBR); span ranges in classical management.
Annotation: Span for interlocking work ~5-6, but widens greatly for routine/non-interdependent work. *Relevance:* widen agent-oversight spans by reducing interdependence + judgment load; reserve narrow spans for novel, interdependent work.

**[K-6] Drucker, P. F. (1954/1973). [conceptual]** *The Practice of Management; Management: Tasks, Responsibilities, Practices.* Harper & Row.
Annotation: Originated **Management by Objectives** (joint goal-setting, then self-direction) + decentralization. *Relevance:* brief an agent on measurable end-states, then let it choose method, "specify what, not how."

**[K-7] U.S. Army (2019). [doctrine]** *ADP 6-0: Mission Command.* HQ Dept. of the Army.
Annotation: Mission command = empower subordinate decision-making + decentralized execution; principles incl. **commander's intent** (purpose + desired end-state, act "without further orders") and **mission orders** (results, not how). *Relevance:* the gold-standard template for briefing an agent: purpose, end-state, constraints, then delegate; expects the plan to break and the agent to improvise toward intent.

**[K-8] Widder, W. (2002). [doctrine/conceptual]** *Auftragstaktik and Innere Führung: Trademarks of German Leadership.* Military Review. (PDF 403; lineage corroborated; exact page quotes UNVERIFIED)
Annotation: Traces *Auftragstaktik* to Prussian reforms after 1806 (Scharnhorst, Moltke; formalized in the 1888 manual). *Relevance:* historical evidence that intent-driven decentralized execution beats tight central control under uncertainty and fast tempo, given trained, trusted subordinates + shared doctrine.

**[K-9] (Corroborating sources). [conceptual/doctrine]** *The Origins of Auftragstaktik.* Australian Army Research Centre; USNI Proceedings (2025).
Annotation: Commanders state *what* and *why*; subordinates decide *how*, with a *duty to deviate* from orders when the situation demands it to achieve intent. *Relevance:* an agent should optimize for stated intent over literal instruction when they conflict.

**[K-10] McChrystal, S. et al. (2015). [practitioner]** *Team of Teams.* Portfolio/Penguin.
Annotation: **Shared consciousness** (radical transparency) + **empowered execution** (authority to the edge); "empowered execution without shared consciousness is dangerous." *Relevance:* safe agent autonomy requires rich context, not just permissions; informs briefing/context design.

**[K-11] Boyd, J. R. (1976-1996). [conceptual]** *A Discourse on Winning and Losing* (OODA).
Annotation: Observe-Orient-Decide-Act; **Orientation** is pivotal (a well-oriented slow loop beats a fast poorly-oriented one); enables late commitment via feedback. *Relevance:* agent value = loop speed × orientation quality; fund orientation (context/tools/memory) before speed; humans add most value in Orient.

**[K-12] CJCS (2005). [doctrine]** *CJCSI 3121.01B: Standing Rules of Engagement / Standing Rules for the Use of Force.*
Annotation: Standing (pre-issued) authorization + inherent right of self-defense: certain actions pre-authorized so the unit acts immediately without asking up the chain. *Relevance:* the canonical pre-authorization model: define in advance the agent's always-allowed set and prohibitions.

**[K-13] NATO. [doctrine]** *NATO Rules of Engagement (MC 362-1); AJP-3.*
Annotation: ROE define "the circumstances, conditions, degree, and manner" force may be used: structured authorizations + prohibitions tied to conditions. *Relevance:* express agent boundaries as a machine-checkable "authorize/prohibit by condition" policy.

**[K-14] Lieber Institute, West Point (2021). [conceptual/legal]** *Rules of Engagement in Large-Scale Combat Operations: Force Enabler or Much Ado About Nothing?*
Annotation: Well-crafted ROE are a *force enabler*; overly restrictive/ambiguous ROE degrade tempo and initiative. *Relevance:* over-constraining agents hurts as much as under-constraining; design boundaries that *enable* confident action.

**[K-15] Sheridan, T. B. & Verplank, W. (1978); Sheridan (2000s). [conceptual/empirical]** *Levels of Automation; Human Supervisory Control.* (cross-ref [E-4])
Annotation: The 10-level LOA scale; supervisory control = set goals/constraints, intervene by exception. *Relevance:* the canonical taxonomy for where on the autonomy spectrum each agent action should sit.

**[K-16] Johnson, M., Bradshaw, J. M., Feltovich, P. J., et al. (2014). [conceptual/empirical]** *Coactive Design: Designing Support for Interdependence in Joint Activity.* J. Human-Robot Interaction 3(1). (cross-ref [M] cluster)
Annotation: Effectiveness comes from supporting *interdependence* via **Observability, Predictability, Directability (OPD)**. *Relevance:* a supervisable agent exposes state, is predictable, and can be redirected mid-task: "directable autonomy" as the goal.

**[K-17] Bradshaw, J. M. et al. [conceptual]** *Toward Trustworthy Adjustable Autonomy in KAoS.* IHMC.
Annotation: Policy-governed autonomy: machine-readable authorizations + obligations, imposed/modified at runtime, "highest useful autonomy at acceptable trust." *Relevance:* the AI analogue of ROE: runtime-adjustable policy as the control surface.

**[K-18] Scerri, P., Pynadath, D. V. & Tambe, M. (2002). [empirical/conceptual]** *Towards Adjustable Autonomy for the Real World.* JAIR 17.
Annotation: Formalizes *transfer-of-control strategies* to minimize miscoordination cost; "when to hand control back to a human" is the central problem. *Relevance:* a principled, cost-aware basis for the escalation trigger behind management-by-exception.

**[K-19] Sull, D. & Eisenhardt, K. M. (2015/2001). [conceptual/empirical]** *Simple Rules; Strategy as Simple Rules* (HBR).
Annotation: Firms in fast/complex markets govern with a handful of simple rules (boundary/how-to/priority) rather than detailed plans. *Relevance:* bound an agent with a small set of clear rules, not an exhaustive procedure: scales to novel situations, stays fast and aligned.

**[K-20] (Practitioner adaptations). [practitioner]** *Commander's Intent in management practice.* Thinkers50; DBM.
Annotation: Documents the civilian crossover: a concise purpose + end-state lets decentralized teams improvise while aligned. *Relevance:* intent-based bounding is a general, business-tested technique: lowers the bar to adopt it for agent briefing.

## III.L: Resilience engineering, HRO & accident theory

_Agentic systems are tightly-coupled, complex socio-technical systems; this is the discipline that studies how such systems fail and stay safe._

### Highlights

- **Tight coupling + interactive complexity = the danger zone (Perrow, [L-10]).** Multi-agent pipelines with chained tool calls and little slack sit in the "normal accident" regime. The structural fix is to **decouple**: human checkpoints, reversibility, rate limits, circuit breakers, so failures can't propagate faster than humans can intervene.
- **Latent failures live at the blunt end (Reason, [L-12, L-13]; Leveson, [L-14]).** An agent's bad output is the *active* failure; the leverage is in latent conditions (prompt/tool design, eval coverage, permission scopes, gate placement). HITL is defense-in-depth, not catching every error.
- **Drift and migration are silent and continuous (Rasmussen, [L-15]; Dekker, [L-17]).** Efficiency/effort pressure pushes systems toward the safety boundary via locally reasonable decisions. "Reduce human friction / the agent is good enough now" is textbook migration: counter with explicit, monitored counter-gradients.
- **Normalization of deviance erodes HITL standards one success at a time (Vaughan, [L-16]).** Each un-reviewed action that "gets away with it" raises tolerance for un-reviewed actions. Track the *trend* in oversight bypasses, not just incidents.
- **Deference to expertise is the keystone HITL principle (Weick & Sutcliffe, [L-7]; Rochlin et al., [L-9]).** Authority should migrate in real time to whoever has the relevant situational knowledge (human or specialized checker) independent of the default automation hierarchy.
- **Design for things going right: Safety-II (Hollnagel, [L-1, L-2]).** Instrument the system's successful and recovered trajectories and near-misses, not only post-incident forensics. The human is a source of resilience, not an error term to design out.
- **The four cornerstones map onto an oversight architecture (Hollnagel et al., [L-5]):** respond + monitor = runtime guardrails + anomaly detection; anticipate = red-teaming/evals; learn = incident review feeding updates. All four are necessary.
- **Robustness ≠ graceful extensibility (Woods, [L-6]).** Handling anticipated faults ≠ handling surprise; LLM agents fail suddenly past their competence envelope. Humans supply graceful extensibility for novel situations.
- **Redundancy can backfire (Sagan, [L-11]).** Stacking automated checkers adds interactions, diffuses responsibility, and manufactures false confidence; an incident-free record may be luck.
- **Optimizations are the seed of failure: ETTO (Hollnagel, [L-3]).** Every speed/cost optimization (skipped checks, cached judgments, fewer gates) is an efficiency-for-thoroughness trade: make it explicit and monitored.
- **Treat safety as control; keep the controller's model accurate (Leveson STAMP, [L-14]).** The human is a controller whose authority and situational awareness must stay adequate; STPA can derive *where* a human gate is needed.
- **"Human error" is a symptom, not a verdict (Dekker, [L-18]); beware the ironies of automation (Hollnagel & Woods, [L-19]).** Don't design HITL as a blame-sink; if the agent escalates only the hardest cases, the human gets the toughest decisions with the least context.

### Annotated bibliography

**[L-1] Hollnagel, E., Woods, D. D., & Leveson, N. (eds.) (2006). [book/theory]** *Resilience Engineering: Concepts and Precepts.* Ashgate. ISBN 9780754646419.
Annotation: Founding text: safety is the *presence of adaptive capacity*, and failure is the flip side of the adaptations that normally produce success. *Relevance:* design agents for adaptive capacity; oversight should preserve and exercise human adaptive capacity, not assume a static failure list.

**[L-2] Hollnagel, E. (2013). [white paper/theory]** *From Safety-I to Safety-II: A White Paper.* EUROCONTROL. (PDF wouldn't render; authorship/publication corroborated)
Annotation: **Safety-I** (prevent things going wrong) vs **Safety-II** (study why things usually go right; amplify the variability that absorbs disturbances). *Relevance:* instrument routine/near-miss/recovered runs; the human is a source of resilience.

**[L-3] Hollnagel, E. (2009). [book/theory]** *The ETTO Principle: Efficiency-Thoroughness Trade-Off.* Ashgate. ISBN 9780754676782.
Annotation: People trade thoroughness for efficiency to fit time/resources; the same shortcuts occasionally produce failure. *Relevance:* every "speed up the loop / reduce friction" decision is an ETTO move: make it explicit and monitored.

**[L-4] Hollnagel, E. (2012). [book/method]** *FRAM: The Functional Resonance Analysis Method.* Ashgate. ISBN 9781409445517.
Annotation: Models how normal variability in coupled functions can "resonate" into disproportionate outcomes. *Relevance:* failures in coupled agent steps are emergent; map where one agent's "good enough" output becomes another's unreliable input and place humans at high-resonance couplings.

**[L-5] Hollnagel, E., Pariès, J., Woods, D. D., & Wreathall, J. (eds.) (2011). [book/theory+method]** *Resilience Engineering in Practice.* Ashgate.
Annotation: The four cornerstones: **respond, monitor, anticipate, learn**, all necessary. *Relevance:* maps directly to oversight architecture (guardrails = respond/monitor; red-teaming = anticipate; incident review = learn).

**[L-6] Woods, D. D. (2015). [peer-reviewed/theory]** *Four Concepts for Resilience…* Reliability Engineering & System Safety 141, 5-9. DOI: 10.1016/j.ress.2015.03.018.
Annotation: Distinguishes rebound, robustness, **graceful extensibility** (stretching beyond design boundaries before becoming brittle), sustained adaptability. *Relevance:* LLM agents are brittle at distribution edges; humans supply graceful extensibility for surprise.

**[L-7] Weick, K. E., & Sutcliffe, K. M. (2015; orig. 2001). [book/theory+empirical]** *Managing the Unexpected.* Jossey-Bass. ISBN 9781118862414.
Annotation: Five principles of mindful organizing: preoccupation with failure, reluctance to simplify, sensitivity to operations, commitment to resilience, **deference to expertise**. *Relevance:* the cluster's keystone: control should pass to whoever has the local knowledge; don't trust a single aggregate confidence score.

**[L-8] LaPorte, T. R., & Consolini, P. M. (1991). [peer-reviewed/theory+empirical]** *Working in Practice But Not in Theory: …High-Reliability Organizations.* J. Public Admin. Research & Theory 1(1), 19-48. JSTOR 1181764.
Annotation: HROs achieve near-failure-free operation via redundancy, decentralized real-time authority, safety culture, continuous learning. *Relevance:* reliable high-stakes agent deployment needs deliberate organizational scaffolding, not just a better model.

**[L-9] Rochlin, G. I., La Porte, T. R., & Roberts, K. H. (1987). [peer-reviewed/empirical]** *The Self-Designing High-Reliability Organization: Aircraft Carrier Flight Operations at Sea.* Naval War College Review 40(4), 76-92.
Annotation: Reliability under tight coupling comes from dense communication + authority that flexes to whoever sees the hazard first. *Relevance:* a model for human-agent teaming where intervention authority moves fluidly to the best-informed actor.

**[L-10] Perrow, C. (1984/1999). [book/theory]** *Normal Accidents: Living with High-Risk Technologies.* Basic Books / Princeton UP.
Annotation: **Interactive complexity + tight coupling** make serious accidents inevitable ("normal"); adding safety features can add interactions and worsen things. *Relevance:* multi-agent pipelines are exactly this regime: deliberately insert slack (checkpoints, rate limits, reversibility) to decouple.

**[L-11] Sagan, S. D. (1993). [book/empirical+theory]** *The Limits of Safety.* Princeton UP.
Annotation: The definitive NAT-vs-HRO test (nuclear C2 near-misses): redundancy added complexity and new failure modes; "good luck" mattered more than "good design." *Relevance:* more automated checkers can create new interaction failures and false confidence; an incident-free record ≠ a safe system.

**[L-12] Reason, J. (1990). [book/theory]** *Human Error.* Cambridge UP. ISBN 9780521314190.
Annotation: **Active** vs **latent** failures; the **Swiss-cheese** model (defenses with holes that occasionally align). *Relevance:* the leverage is in latent conditions (prompt design, eval gaps, permissions, gate placement), not the proximate error.

**[L-13] Reason, J. (2000). [peer-reviewed/theory]** *Human Error: Models and Management.* BMJ 320(7237), 768-770. DOI: 10.1136/bmj.320.7237.768.
Annotation: The **person** vs **system** approach: build defenses, accept fallibility, target conditions. *Relevance:* the accessible single-paper cite for "don't just blame the human reviewer or the model: fix the system of defenses."

**[L-14] Leveson, N. G. (2011). [book/theory+method]** *Engineering a Safer World: Systems Thinking Applied to Safety.* MIT Press (open access).
Annotation: **STAMP**: accidents = inadequate enforcement of safety constraints by the control structure; controllers need accurate process models. Includes STPA/CAST. *Relevance:* arguably the best-fit model for HITL: the human is a controller whose authority + SA must stay adequate; STPA derives where/why a gate is needed.

**[L-15] Rasmussen, J. (1997). [peer-reviewed/theory]** *Risk Management in a Dynamic Society: A Modelling Problem.* Safety Science 27(2-3), 183-213. DOI: 10.1016/S0925-7535(97)00052-0.
Annotation: Work practices **migrate** toward the boundary of acceptable performance under efficiency/effort gradients until they cross it. *Relevance:* pressure to reduce oversight is textbook migration; build explicit counter-gradients (mandatory gates, drift monitors).

**[L-16] Vaughan, D. (1996). [book/empirical]** *The Challenger Launch Decision.* University of Chicago Press.
Annotation: Coins **normalization of deviance**: locally reasonable decisions incrementally redefine unsafe conditions as acceptable. *Relevance:* each successful un-reviewed action ratchets up tolerance for un-reviewed actions: guard against slow erosion of HITL standards.

**[L-17] Dekker, S. (2011). [book/theory]** *Drift into Failure.* Ashgate/Routledge. ISBN 9781409422211.
Annotation: Failure is *emergent*: accumulated locally rational adaptations ("drift"), not a broken part. *Relevance:* agent-system failures are often emergent drift across prompts/tools/policies: monitor the slope of the whole system, not just discrete defects.

**[L-18] Dekker, S. (2014; orig. 2002). [book/practitioner theory]** *The Field Guide to Understanding 'Human Error'.* Ashgate/Routledge. ISBN 9781472439055.
Annotation: **Old View** (bad apples) vs **New View** (error is a symptom of deeper systemic trouble; people are a resource). *Relevance:* don't design HITL as a blame-sink; understand and support the human's local rationality: same New View for agent failures.

**[L-19] Hollnagel, E., & Woods, D. D. (2005). [book/theory]** *Joint Cognitive Systems: Foundations of Cognitive Systems Engineering.* CRC/Taylor & Francis. (cross-ref [M] cluster)
Annotation: Analyze human + automation as a single joint cognitive system; warns of the ironies of automation (automation handles easy cases, dumps degraded hard cases on the de-skilled human). *Relevance:* if the agent escalates only hard/ambiguous cases, the human faces the hardest with the least context: design the joint system so the human stays competent.

## III.M: Joint cognitive systems & human-autonomy teaming

_The unit of design is the **joint human-machine system**, not the agent in isolation. An effective agent is a **team player**: observable, predictable, directable, sharing common ground._

### Highlights

- **Observability, Predictability, Directability (OPD) are the three core design requirements [M-1, M-5]**, and they are **bidirectional** (the human must also be observable/predictable/directable to the agent).
- **Coordination is never free and never goes to zero [M-7, M-15].** The "fully autonomous" agent is a myth; automating a task *relocates* coordination work (often dumping it on the human at the worst moment). Design the coordination; don't pretend it away.
- **"Teammate" beats both "tool" and "fully autonomous" [M-1, M-7, M-9].** A tool loads all coordination on the human; "full autonomy" fails at the boundaries. The teammate stance is the sweet spot.
- **Interdependence, not autonomy, is the right organizing principle [M-5, M-6, M-8].** Map where human and agent depend on each other (Interdependence Analysis), then design to support it. "More autonomy" is the wrong goal.
- **Plans are resources for action, not controllers of it (Suchman, [M-4]).** A rigid plan-executor breaks in open environments; design for situated re-grounding and graceful breakdown-and-repair.
- **Common ground is a maintained state, not a one-time briefing [M-2, M-14].** It decays; breakdowns are normal; the design question is whether *repair* is cheap (least collaborative effort). Explains why LLM context/memory drift causes coordination failures.
- **Team cognition lives in the interaction [M-11, M-12]:** shared understanding and team SA are built by anticipatory information-*pushing* and closed-loop comms. Agents that only answer when queried produce weak team SA.
- **Individual task competence ≠ teaming competence [M-11].** Synthetic teammates can do the job yet fail as team members for lack of proactive, bidirectional coordination.
- **Design for calibrated trust, not maximal trust [M-16].**
- **Continual feedback preserves the human's situation awareness [M-15, M-17].** Silent automation pulls the human out of the loop, destroying oversight.
- **The authority gradient must run both ways (CRM, [M-19]).** Humans need a low-friction path to challenge/override; a good agent should flag when it thinks the human is wrong. Closed-loop confirmation is a portable pattern.
- **Evaluate the joint system, not the agent in isolation [M-3].** The metric is combined human+agent performance and the quality of the coupling, not the agent's solo benchmark.

### Annotated bibliography

**[M-1] Klein, G., Woods, D. D., Bradshaw, J. M., Hoffman, R. R., & Feltovich, P. J. (2004). [seminal]** *Ten Challenges for Making Automation a "Team Player" in Joint Human-Agent Activity.* IEEE Intelligent Systems 19(6), 91-95. DOI: 10.1109/MIS.2004.74.
Annotation: The canonical paper: a team-player agent must enter a **Basic Compact** (commit to coordinate and repair), maintain **common ground**, be **interpredictable**, **directable**, and make status/intentions **observable**. *Relevance:* the most directly portable design checklist for an LLM agent inside a human's workflow.

**[M-2] Klein, G., Feltovich, P. J., Bradshaw, J. M., & Woods, D. D. (2005). [seminal]** *Common Ground and Coordination in Joint Activity.* In Rouse & Boff (eds.), *Organizational Simulation*, 139-184. Wiley.
Annotation: Book-length parent of [M-1]: joint activity rests on interpredictability → common ground that must be continually established, monitored, and **repaired**. *Relevance:* frames LLM context/memory drift as a grounding problem; the remedy is continuous grounding, not one-shot prompting.

**[M-3] Hollnagel, E., & Woods, D. D. (2005). [seminal]** *Joint Cognitive Systems: Foundations of Cognitive Systems Engineering.* CRC/Taylor & Francis. ISBN 0-8493-2821-7. (cross-ref [L-19])
Annotation: Reframes the object of study from "human + machine as two boxes" to a single **joint cognitive system** whose competence emerges from the coupling. *Relevance:* evaluate combined human+agent performance, not the agent's solo benchmark.

**[M-4] Suchman, L. A. (1987). [seminal]** *Plans and Situated Actions: The Problem of Human-Machine Communication.* Cambridge UP.
Annotation: The foundational critique of plan-based AI: **plans are resources for action, not controllers of it**; action is situated and improvised. *Relevance:* treat generated plans as revisable resources; keep a human for situated judgment; expect and handle breakdowns.

**[M-5] Johnson, M., Bradshaw, J. M., Feltovich, P. J., et al. (2014). [seminal+empirical]** *Coactive Design: Designing Support for Interdependence in Joint Activity.* J. Human-Robot Interaction 3(1), 43-69. DOI: 10.5898/JHRI.3.1.Johnson. (cross-ref [K-16])
Annotation: **Interdependence must shape autonomy**: identify task interdependencies (Interdependence Analysis), then support them via **OPD** for *both* parties; critiques "levels of autonomy" as ignoring the contingent nature of activity. *Relevance:* the most actionable design method here: map dependencies, then build the observability/redirection affordances they require.

**[M-6] Johnson, M., et al. (2011). [seminal]** *The Fundamental Principle of Coactive Design: Interdependence Must Shape Autonomy.* COIN VI (LNCS 6541), 172-191. DOI: 10.1007/978-3-642-21268-0_10.
Annotation: Earlier statement of the coactive principle: autonomy should serve interdependence, not be an end in itself. *Relevance:* reframes the race toward more capable joint systems, not more independent agents.

**[M-7] Bradshaw, J. M., Hoffman, R. R., Johnson, M., & Woods, D. D. (2013). [argumentative]** *The Seven Deadly Myths of "Autonomous Systems."* IEEE Intelligent Systems 28(3), 54-61.
Annotation: Demolishes the myths that autonomy is one-dimensional, an independent property of the machine, or ever "full." Core: **autonomy is relational; coordination work never disappears, it relocates.** *Relevance:* a direct rebuttal to "fully autonomous agent" hype: HITL is structural, not a temporary crutch.

**[M-8] Johnson, M., Bradshaw, J. M., & Feltovich, P. J. (2018). [methodological]** *Tomorrow's Human-Machine Design Tools: From Levels of Automation to Interdependencies.* J. Cognitive Engineering and Decision Making 12(1), 77-82.
Annotation: Argues for retiring "levels of automation" in favor of analyzing/designing for **interdependencies**. *Relevance:* points to the tooling agent teams actually need (interdependence maps), beyond an autonomy dial.

**[M-9] Lyons, J. B., Sycara, K., Lewis, M., & Capiola, A. (2021). [review]** *Human-Autonomy Teaming: Definitions, Debates, and Directions.* Frontiers in Psychology 12:589585. DOI: 10.3389/fpsyg.2021.589585.
Annotation: What makes a machine a *teammate*: agency, communication, **intent sharing**, **shared mental models**, task interdependence; teaming is partly perceptual/social. *Relevance:* clarifies which design moves (intent signaling, shared models) drive perceived teammate-ness.

**[M-10] O'Neill, T., McNeese, N., Barron, A., & Schelble, B. (2022). [empirical review]** *Human-Autonomy Teaming: A Review and Analysis of the Empirical Literature.* Human Factors 64(5), 904-938. DOI: 10.1177/0018720820960865.
Annotation: Aggregates HAT evidence on composition, training, trust, communication, SA, performance. *Relevance:* outcomes hinge on designable/measurable factors (comms patterns, calibrated trust, shared SA), not raw capability.

**[M-11] McNeese, N. J., Demir, M., Cooke, N. J., & Myers, C. (2018). [empirical]** *Teaming With a Synthetic Teammate.* Human Factors 60(2), 262-273. DOI: 10.1177/0018720817743223.
Annotation: Teams with a synthetic teammate struggled most with **team-level coordination/communication** even when individually competent. *Relevance:* concrete warning: LLM agents may execute well yet fail at the proactive, bidirectional comms teaming requires.

**[M-12] Demir, M., McNeese, N. J., & Cooke, N. J. (2017). [empirical]** *Team Situation Awareness Within the Context of Human-Autonomy Teaming.* Cognitive Systems Research 46, 3-12. DOI: 10.1016/j.cogsys.2016.11.003.
Annotation: Team SA is built by anticipatory information-**pushing**; HAT teams push/pull less than all-human teams. *Relevance:* agents should anticipate and volunteer relevant context, not merely answer when queried.

**[M-13] Cooke, N. J., et al. (likely 2013). [theory: UNVERIFIED citation]** *Interactive Team Cognition.* (likely Cognitive Science; exact volume/pages not directly fetched.)
Annotation: Team cognition is an *activity* observable in interaction, not a static shared property in members' heads. *Relevance:* instrument the human-agent interaction stream as the locus of "shared understanding." (Concept attested via [M-11], [M-12].)

**[M-14] Clark, H. H., & Brennan, S. E. (1991). [seminal]** *Grounding in Communication.* In *Perspectives on Socially Shared Cognition*, 127-149. APA.
Annotation: Defines **common ground** and **grounding**; participants minimize *combined* effort (least collaborative effort), and the medium's grounding cost shapes how they do it. *Relevance:* informs how agents should confirm understanding, ask clarifying questions, and repair efficiently.

**[M-15] Norman, D. A. (1990). [seminal]** *The 'Problem' with Automation…* Phil. Trans. R. Soc. B 327(1241), 585-593. (cross-ref [G-12])
Annotation: Automation's failure mode is **inadequate feedback/interaction**, not over-automation. *Relevance:* continual feedback (observability) is the cure for opaque agents that act without surfacing what they do.

**[M-16] Lee, J. D., & See, K. A. (2004). [seminal review]** *Trust in Automation: Designing for Appropriate Reliance.* Human Factors 46(1), 50-80. (cross-ref [F-1])
Annotation: Calibrated trust = appropriate reliance, avoiding disuse and misuse. *Relevance:* design for trust calibration, not maximization.

**[M-17] Endsley, M. R. (1995). [seminal]** *Toward a Theory of Situation Awareness in Dynamic Systems.* Human Factors 37(1), 32-64. (cross-ref [E-12])
Annotation: The 3-level SA model; automation can pull humans out of the loop. *Relevance:* observability must preserve the human's ability to project what the agent will do next.

**[M-18] Parasuraman, R., Sheridan, T. B., & Wickens, C. D. (2000). [seminal]** *A Model for Types and Levels of Human Interaction with Automation.* IEEE SMC-A 30(3), 286-297. (cross-ref [E-6])
Annotation: The four-stage function-allocation view, useful but, per [M-7]/[M-8], insufficient alone for genuine joint activity. *Relevance:* a still-useful map for partitioning an agent pipeline (retrieve/analyze/decide/act) and placing HITL checkpoints, provided you also design the coordination.

**[M-19] Helmreich, R. L., Merritt, A. C., & Wilhelm, J. A. (1999). [seminal/historical]** *The Evolution of Crew Resource Management Training in Commercial Aviation.* Int. J. Aviation Psychology 9(1), 19-32.
Annotation: CRM (post-Tenerife) institutionalizes **closed-loop communication**, assertiveness/"speaking up," cross-checking, and flattened authority gradients. *Relevance:* the human-agent authority gradient runs both ways: humans must be able to challenge/override; agents should flag suspected human error; closed-loop confirmation maps to action acknowledgement.

**[M-20] (2025). [bridging: verify before formal use]** *Joint Activity Design Heuristics for Enhancing Human-AI Teaming.* arXiv:2512.08036.
Annotation: Translates Klein/Woods joint-activity theory + coactive design into concrete heuristics for AI (joint sensemaking, predictable behavior, clear mode/transition signaling, local+global explanations). *Relevance:* evidence the tradition is being actively ported to modern AI.

---

# Part IV: Cross-Industry Oversight Mechanisms

_Concrete, battle-tested mechanisms for overseeing autonomous action, mined from industries that have done it for decades._

## IV.N: Manufacturing & process-safety mechanisms

_Concrete, deployed, regulated controls with decades of operational evidence. Tags: [STANDARD] / [STUDY] / [PRACTITIONER]._

### Highlights

- **Stop-and-escalate on anomaly is the master primitive (Jidoka) [N-1, N-2, N-3].** Run autonomously on the happy path; the instant the agent detects it's outside its competence/confidence envelope, *halt itself and surface to a human* rather than ship a defect downstream. Detect-and-stop is enough; don't trust the agent to autonomously self-recover.
- **Build quality in; don't inspect it in (Jidoka + Deming) [N-2, N-9].** You cannot review-your-way to a safe agent; oversight works best when execution trips the alarm at the moment of anomaly, not via end-of-line audit.
- **Make bad actions impossible, not merely discouraged (Poka-yoke) [N-6, N-7].** Prefer capability removal (least-privilege, sandbox, read-only, schema/type constraints) over denylists. A guardrail the agent *can* circumvent is policy; a poka-yoke removes the capability.
- **Use the mistake-proofing hierarchy to rank guardrails [N-7]:** prevention (impossible) > detection/warning (flagged instantly) > human vigilance (weakest). Never rely on "the human will watch carefully" as the primary defense.
- **Universal, cheap, blameless interrupt authority (Andon) [N-4, N-5].** Every party (supervising human, monitor agent, guardrail, end user) must have a low-friction, always-available halt. If interrupting is costly or punished, it won't be used.
- **Separate signal-and-summon from hard-stop (Andon) [N-5]:** an ambient "andon board" of agent status for awareness, *plus* a true blocking interrupt for hazards.
- **Intervene on calibrated signal, not every wobble (SPC) [N-8].** Define human entry via metrics against *calibrated control limits* balancing over-reaction to noise vs. missing a real fault.
- **Over-intervention is its own failure mode, tampering (Deming) [N-9].** Correcting on every fluctuation degrades the system and burns the human's attention.
- **Gate the killer items at phase boundaries; keep gates short (Checklists) [N-10, N-11].** Structured pre-action verification at high-consequence transitions reduces harm, but only if brief (≈5-9 items). Bloated gates induce rubber-stamping.
- **A gate is only as good as the attention it commands [N-12].** The Ontario study: a *mandated* checklist with weak engagement delivered zero benefit, the manufacturing/clinical proof of the codex's central finding.
- **Scoped, expiring, named authorization for privileged actions (Permit-to-work) [N-13, N-14].** Replace standing "the agent can do dangerous thing X" with narrow, time-boxed grants tied to a named approver, plus an explicit "hand-back" to a safe state.
- **Two truly-independent authorizers for irreversible actions [N-15, N-16].** Separation of duties; the proposer must not be the approver. Independence is everything: an agent re-reading its own work just confirms its bias; a double check is a backstop, never the primary control.
- **Positively disable, don't politely pause (Lockout-tagout) [N-17].** Revoke tokens / kill the session / drop to read-only as a *structural* lock held by the person doing the work: capability revocation (lockout) beats a warning (tagout), codified into U.S. law.

### Annotated bibliography

**[N-1] Ohno, T. (1988). [practitioner]** *Toyota Production System: Beyond Large-Scale Production.* Productivity Press (orig. Japanese 1978).
Defines **jidoka** (autonomation): a machine detects an abnormality, **stops itself, and signals a human**, so a defect is never passed downstream and one operator can supervise many machines. Traces to Sakichi Toyoda's 1924 auto-stopping loom. *Relevance:* the stop-and-escalate-on-anomaly primitive: full speed on the happy path, hard stop on anomaly.

**[N-2] Toyota Motor Corporation. [practitioner/primary]** *Toyota Production System: Jidoka.* global.toyota. (403 to fetcher; corroborated via [N-1], [N-3], treated VERIFIED)
"Automation with a human touch": machines stop on a problem, making it immediately visible and **building quality in rather than inspecting it in**. *Relevance:* oversight is most effective when the agent's own execution trips the alarm, not when a human audits a finished batch.

**[N-3] *Autonomation.* (encyclopedic synthesis of TPS literature). [reference]** en.wikipedia.org/wiki/Autonomation.
The four-step jidoka cycle: **detect → stop → fix the immediate condition → investigate root cause + install a countermeasure**; Shingo's "detect-and-stop is ~90% of the benefit; self-repair is over-engineering." *Relevance:* a ready-made incident protocol for agents; argues against trusting an agent to autonomously recover from its own anomalies.

**[N-4] Liker, J. K. (2004). [practitioner]** *The Toyota Way.* McGraw-Hill (Principle 5: stop to fix problems).
The **andon** system: any worker has the authority and obligation to pull a cord that signals a problem and, if unresolved, stops the line, and is *rewarded*, not punished, for it. *Relevance:* a universal interrupt: every stakeholder needs a low-friction, blameless authority to halt the agent mid-run.

**[N-5] *Andon (manufacturing).* (TPS/lean synthesis). [reference]** en.wikipedia.org/wiki/Andon_(manufacturing).
Andon is the *signaling* element of jidoka (visual/audible alert, manual OR automatic), distinguishing fixed-position stop (window to fix) from immediate stop. *Relevance:* provide both *signal-and-summon* (ambient status board) and *hard interrupt*; humans AND automated monitors can raise the alarm.

**[N-6] Shingo, S. (1986). [practitioner]** *Zero Quality Control: Source Inspection and the Poka-Yoke System.* Productivity Press (orig. 1985).
**Poka-yoke** (mistake-proofing): source inspection + devices that physically *prevent* a mistake or make it instantly obvious; 100%-prevention-at-source supplants statistical sampling. *Relevance:* make bad agent actions structurally impossible (scoped credentials, schema/constrained decoding, dry-run preview): poka-yoke > policy.

**[N-7] Project Production Systems Lab (P2SL), UC Berkeley. [reference]** *Mistakeproofing.* p2sl.berkeley.edu/mistakeproofing/.
The hierarchy: **elimination/prevention > detection/warning > reliance on human vigilance** (weakest). *Relevance:* a direct ranking for agent guardrails: prefer capability removal over runtime detection over "ask the human to watch carefully."

**[N-8] Shewhart, W. A. (1931). [practitioner/foundational]** *Economic Control of Quality of Manufactured Product.* Van Nostrand.
Invents the **control chart** + chance (common) vs assignable (special) cause; ±3σ limits balance over-reacting to noise vs. missing a real signal. *Relevance:* the foundational answer to *when should a human intervene?*: on a calibrated control-limit breach, not on every output and not never.

**[N-9] Deming, W. E. (1986). [practitioner/foundational]** *Out of the Crisis.* MIT Press.
Warns of **tampering** (over-reacting to common-cause noise makes a stable system worse) and "cease dependence on inspection." *Relevance:* over-intervention is a failure mode; you cannot inspect quality into an agent, engineer it in. Support for calibrated, not maximal, oversight.

**[N-10] Haynes, A. B., et al. (2009). [study]** *A Surgical Safety Checklist to Reduce Morbidity and Mortality in a Global Population.* NEJM 360(5), 491-499. PMID 19144931.
WHO 19-item checklist at three junctures (Sign In / Time Out / Sign Out) across 8 hospitals: **death 1.5%→0.8%, complications 11.0%→7.0%**. *Relevance:* the empirical case for structured pre-action verification at high-consequence transitions (a "time out" before deploy/delete/send/pay), placed at *phase boundaries*, not everywhere.

**[N-11] Gawande, A. (2009). [practitioner]** *The Checklist Manifesto.* Metropolitan Books.
READ-DO vs DO-CONFIRM checklists; states the limits: short (≈5-9 items), one page, killer items only; bloated checklists fail. *Relevance:* concise pre-flight gates for agents, with the discipline of brevity (a gate crammed with low-value confirmations induces rubber-stamping).

**[N-12] Urbach, D. R., et al. (2014). [study: counter-evidence]** *Introduction of Surgical Safety Checklists in Ontario, Canada.* NEJM 370, 1029-1038.
Across 101 hospitals, a *mandated* rollout found **no significant reduction**, executed as box-ticking with thin engagement. *Relevance:* the most important caution here: a gate is only as good as the attention it commands; mandated, ritualized confirmation = theater. Manufacturing/clinical proof of the codex's central HITL finding.

**[N-13] HSE, UK (2005). [standard]** *Guidance on Permit-to-Work Systems (HSG250).* HSE Books.
A **permit-to-work** is a formal, documented, time-boxed authorization before high-hazard non-routine work, tied to a named authorizer with a formal *hand-back*. *Relevance:* the template for scoped, expiring, explicitly-authorized privilege elevation, safer than blanket `bypassPermissions`; hand-back = confirm the agent returned to a safe state.

**[N-14] HSE. [standard]** *Permit to Work Systems (COMAH technical measures).* hse.gov.uk/comah/sragtech/techmeaspermit.htm.
Reinforces PTW essentials and notes maintenance-related work (non-routine) is a leading source of major accidents. *Relevance:* an agent's off-script, "maintenance-mode" excursions deserve the *most* stringent authorization, not the least.

**[N-15] U.S. Air Force (2020). [standard]** *AFI 91-104, Nuclear Surety: the Two-Person Concept.* (AFI is primary; edition lightly UNVERIFIED)
**Two-person rule / TPI**: critical actions require two independently authorized people; no-lone zones, split keys. *Relevance:* for the highest-consequence irreversible agent actions, require two independent authorizers (human + independent checker); the proposer should not be the approver (separation of duties).

**[N-16] ISMP. [standard/practitioner]** *Independent Double Checks: Worth the Effort if Used Judiciously and Properly.* ISMP/ECRI.
An independent double check catches ~33% more errors *if* genuinely independent, but ISMP warns against overuse and against it as a sole control (false assurance). *Relevance:* double-checking agent output works only when reserved for high-consequence actions and the second check is *truly independent* (different model/prompt/context, not the agent re-reading itself); it's a backstop, not the primary control.

**[N-17] OSHA (1989). [standard]** *The Control of Hazardous Energy (Lockout/Tagout), 29 CFR 1910.147.*
Before servicing, every hazardous energy source must be **positively isolated and locked** de-energized, keyed to the worker, so it *cannot* be re-energized while they're exposed; lockout (physical) preferred over tagout (a warning tag). ~120 fatalities / 50,000 injuries prevented yearly. *Relevance:* before humans/processes touch a system an agent controls (or before maintaining the agent), *positively disable* its ability to act (kill session, revoke tokens, read-only) as a structural lock: capability revocation (lockout) > warning (tagout), codified in law.

## IV.O: Finance & security mechanisms (incl. runtime assurance)

_Two domains with mature controls over fast autonomous action: markets (where algorithms already outpace humans) and security (which formalized scoped authority and the human's role). Includes Cranor (2008), a direct prior HITL framework._

### Highlights

- **Pre-action admission control beats post-hoc review [O-2, O-3].** Gate every action against scoped limits *before* execution at machine speed; humans and after-the-fact logs can't keep up with an autonomous actor.
- **Two-party approval for high-grade actions (maker-checker) [O-1, O-10].** The proposer must not be the approver; split planning/approval/execution across principals.
- **Circuit breakers (auto-halt on threshold) + kill switches (decisive manual stop) [O-6, O-7].** Auto-pause and require re-authorization when guard bands trip; provide a one-command panic stop usable without diagnosing root cause.
- **Bound blast radius ("fat-finger" limits) and action rate (throttles) [O-3].** Cap per-action magnitude (max spend/deletions/recipients) and per-window action rate to break runaway loops.
- **Knight Capital is the canonical agentic cautionary tale [O-4]:** a tiny config/dead-code error in a fast autonomous actor cost ~$440M in 45 minutes with no kill switch. Verify feature flags/dead code before deploy; stage rollouts; never deploy without an emergency stop.
- **Least privilege + capabilities + zero-trust = scoped, per-request agent permissions [O-10, O-11, O-13].** Grant only what the task needs, deny by default, mediate *every* action, re-authorize each step in context.
- **The confused deputy IS prompt injection [O-11, O-12].** An agent with ambient authority is weaponized by untrusted content flowing through the same channel as legitimate instructions. Defense = scoped request-bound capabilities + runtime mediation for irreversible actions *regardless of instruction source* + sub-agents not inheriting orchestrator authority.
- **No standing privilege; elevate just-in-time, break glass loudly [O-14].** Sensitive scopes granted time-boxed behind approval and revoked; emergency elevation is auditable, alarmed, post-hoc reviewed.
- **Runtime shields/Simplex = a verified monitor that vetoes the agent [O-17, O-18, O-19].** You can't formally verify an LLM, but you can verify a small guard; let the agent act inside a verified envelope and override on breach: a guarantee that holds even under injection, complementing the soft human gate.
- **Human gates are a design variable, and they fatigue [O-15, O-16].** Many users click through badly-designed warnings; habituation sets in neurologically by the *second* repetition. Minimize interrupts (auto-handle low-risk), and make the rest salient/distinct (polymorphic) to fight rubber-stamping.
- **Beware emergent multi-agent failure and mis-specified objectives [O-5].** The Flash Crash: individually "correct" fast algorithms (one optimizing *volume only*) produced systemic collapse. Constrain objectives explicitly; add *system-level* circuit breakers, not just per-agent ones.
- **Cranor (2008) is the direct precedent for a modern agentic HITL framework [O-9]:** keep the human out of the loop where you can safely automate; where a human must stay, engineer the interaction (delivery, comprehension, capability, motivation) so they can actually succeed.

### Annotated bibliography

**[O-1] COSO / internal-control literature. [standard]** *Segregation of Duties & the Four-Eyes (Maker-Checker) Principle.*
No single party initiates, approves, records, and verifies the same activity; a second authorized party approves high-risk actions. Weakness: rubber-stamping and collusion. *Relevance:* two-party approval gating for high-grade/irreversible agent actions; an agent that drafts an action shouldn't also approve/execute it.

**[O-2] U.S. SEC (2010). [standard/rule]** *Rule 15c3-5: Market Access Rule.* 17 CFR 240.15c3-5.
Requires automated **pre-trade** controls that *prevent entry* of orders exceeding thresholds or appearing erroneous, order-by-order, at machine speed. *Relevance:* pre-action admission control: screen every proposed agent action against scoped limits before execution; whoever grants tool access owns the guardrails.

**[O-3] Futures Industry Association (2024). [standard]** *Best Practices for Automated Trading Risk Controls and System Safeguards.*
Catalogs **max order-size ("fat-finger") limits, price collars, message/execution throttles, cancel-on-disconnect**: defense in depth at participant/broker/exchange levels. *Relevance:* template for bounding per-action magnitude, throttling action rate to stop runaway loops, sanity-checking outputs, and a one-command cancel-all.

**[O-4] U.S. SEC (2013). [incident+enforcement]** *In re Knight Capital Americas LLC.* (Aug 1, 2012 incident; $12M settlement.)
Dormant legacy code left active on one server sent **~4M unintended orders in ~45 min**, ~$440M loss, no kill switch. *Relevance:* the textbook case for kill switches, blast-radius limits, staged rollout, and pre-deploy verification of dead code/feature flags on fast autonomous actors.

**[O-5] U.S. SEC/CFTC (2010). [incident/investigation]** *Findings Regarding the Market Events of May 6, 2010 (Flash Crash).*
A large automated sell program targeting *volume only, not price/time* triggered a ~$1T transient collapse amplified by interacting HFTs. *Relevance:* warning about multi-agent emergent failure and mis-specified objectives; constrain objective functions and add system-level circuit breakers.

**[O-6] U.S. SEC. [standard/rule]** *Rule 80B (market-wide circuit breakers) & Limit Up-Limit Down.*
Threshold-triggered automatic trading halts (7%/13%/20%) injecting a cool-down so humans reassess. *Relevance:* auto-halt on anomaly/threshold (error rate, cost burn, output volume) + require human re-authorization to resume: a deliberate HITL re-entry point.

**[O-7] CME Group / SEC concept release. [standard/tool]** *Kill Switches for Algorithmic Trading.*
A risk admin can immediately block all new orders and cancel working orders (CME blocks in <1s); regulators push for automatic limit-breach shut-offs. *Relevance:* the emergency stop/panic button for an agent fleet: both manual and automatic (limit-breach) variants needed; stop first, investigate later.

**[O-8] U.S. SEC (2014). [standard/rule]** *Regulation Systems Compliance and Integrity (Reg SCI).* 17 CFR Part 242.
Treats the automated *system itself* as a regulated risk surface: capacity/stress testing, dev-and-test methodology, resilience, and mandatory detection/corrective-action/notification for "SCI events." *Relevance:* governance template for agent reliability + incident response: HITL is institutional (process + reporting), not only the in-the-moment click.

**[O-9] Cranor, L. F. (2008). [study/framework: KEY PRECEDENT]** *A Framework for Reasoning about the Human in the Loop.* USENIX UPSEC '08.
A structured HITL framework: *try to keep humans out of the loop where feasible; where necessary, engineer the system to support them.* Adapts the C-HIP model into communication / impediments / human receiver / behavior, with six receiver attributes (delivery, processing/attention, comprehension, application, intentions/motivation, capabilities). *Relevance:* the closest pre-LLM analog: a modern agentic HITL framework is Cranor's framework generalized from a one-shot warning to continuous oversight of a fast, capable, potentially-hijackable autonomous actor; its six attributes map onto why agent approval gates fail.

**[O-10] Saltzer, J. H. & Schroeder, M. D. (1975). [study/foundational]** *The Protection of Information in Computer Systems.* Proc. IEEE 63(9), 1278-1308.
**Least privilege, fail-safe defaults (default deny), complete mediation, economy of mechanism, separation of privilege.** *Relevance:* the charter for scoped agent permissions: minimal scopes, deny-by-default, mediate every action, keep the guard simple, require two conditions for high-risk actions.

**[O-11] Hardy, N. (1988). [study/foundational]** *The Confused Deputy.* ACM SIGOPS OSR 22(4), 36-38.
A privileged program is tricked by a less-privileged caller into misusing its *ambient* authority; the fix is **capability-based security** (authority travels bound to the request). *Relevance:* the structural template for the prompt-injection problem: pass scoped, request-bound capabilities so injected instructions can't reach beyond the legitimate task.

**[O-12] Cloud Security Alliance (2024/2025). [study/analysis]** *Confused Deputy Attacks on Autonomous AI Agents (Prompt Injection).*
Makes the Hardy→LLM mapping explicit: because operator instructions and untrusted retrieved content share one inference pathway, an attacker who can write to an inbox/issue executes with the operator's authority. Mitigations: least-privilege scoped credentials, runtime admission control for irreversible actions regardless of source, sub-agents not auto-inheriting authority. *Relevance:* the direct modern statement of this cluster's thesis.

**[O-13] NIST (2020). [standard]** *Zero Trust Architecture.* SP 800-207.
No implicit trust by location/prior auth; **per-request, per-session** decisions on identity/posture/context, least privilege granted dynamically, continuously re-verified. *Relevance:* treat each agent action as an untrusted request authorized in context: a policy engine evaluates every tool call; a hijacked/drifting agent is re-checked at every step.

**[O-14] CyberArk/BeyondTrust et al. [standard/practice]** *Break-Glass, Just-in-Time Access, Zero Standing Privilege.*
JIT grants elevated privilege only at need, time-boxed, behind approval (zero standing privilege); break-glass is auditable, alarmed, post-hoc reviewed emergency elevation. *Relevance:* agents run low-privilege by default; sensitive scopes granted JIT and revoked; break-glass for genuine emergencies, loudly logged.

**[O-15] Akhawe, D. & Felt, A. P. (2013). [study]** *Alice in Warningland: A Large-Scale Field Study of Browser Security Warning Effectiveness.* USENIX Security '13.
Across >25M impressions, clickthrough (ignore) rates varied widely (up to ~70% for Chrome SSL); warnings aren't uniformly futile; **design materially changes compliance**. *Relevance:* the human gate's effectiveness is a design variable: gating everything trains bypass; reserve and design interrupts for what matters.

**[O-16] Anderson, B. B., Vance, A., Kirwan, C. B., et al. (2015/2018). [study]** *How Polymorphic Warnings Reduce Habituation in the Brain* (CHI '15); *Tuning Out Security Warnings* (MIS Quarterly 2018).
fMRI/eye-tracking/field evidence of a sharp drop in visual processing by the **second** exposure to a repeated warning; **polymorphic** (varying) warnings resist habituation. *Relevance:* over-prompting the supervisor is neurologically tuned out: minimize gates, and make high-stakes prompts salient/distinct.

**[O-17] Sha, L. (2001). [study/architecture]** *Using Simplicity to Control Complexity (the Simplex Architecture).* IEEE Software 18(4), 20-28.
Pairs a complex unverifiable controller with a **simple, formally verified safe controller** + monitor that switches control when the state nears the safety boundary. *Relevance:* the reference pattern for runtime assurance: let the LLM act freely inside a verified envelope; a simple trusted monitor takes over on breach.

**[O-18] Alshiekh, M., Bloem, R., Ehlers, R., Könighofer, B., Niekum, S., & Topcu, U. (2018). [study]** *Safe Reinforcement Learning via Shielding.* AAAI-18.
A correct-by-construction **shield** from a formal safety spec intercepts each action and overrides only those that would violate safety (preemptive or post-posed). *Relevance:* a verified shield that vetoes the agent: encode hard constraints (never delete prod, never send funds >X) enforced regardless of what the LLM "decides," including under injection.

**[O-19] Mehmood, U., et al. (2021). [study: extends O-17; author list lightly UNVERIFIED]** *The Black-Box Simplex Architecture for Runtime Assurance of Autonomous CPS.* NASA Formal Methods / arXiv:2102.12981.
Extends Simplex to opaque/neural controllers and even black-box safe controllers via a switching monitor. *Relevance:* confirms the runtime-assurance pattern survives when both actor and parts of the guard are opaque: wrap an LLM agent in a switching monitor with a "safe mode" (halt + escalate) on predicted breach.

---

# Part V: The Human and the Loop Episode

_The human side, and the design of a single oversight moment._

## V.P: Cognition of advice, judgment & decision fatigue

_The human-cognition side of HITL: how people receive advice, decide under pressure, and whether decisions degrade with fatigue. Contested results flagged explicitly._

### Highlights

- **Two opposite failure modes coexist.** Classic advice research shows **egocentric discounting** (humans *under*-weight good advice [P-2, P-3]) while the AI-advice literature shows both **algorithm appreciation** (over-crediting an "AI" label, [P-20]) and **algorithm aversion** (over-abandoning after one visible error, [P-21]). HITL must calibrate against *both* under- and over-reliance.
- **Anchoring on the agent's suggestion is the central, most robust risk [P-9].** A suggested answer pulls the human's judgment toward it with insufficient adjustment, even when wrong; confirmation bias [P-11] then steers the evidence search toward confirming it.
- **"Decide first, then reveal" is evidence-backed [P-4].** Independent pre-advice judgment yields better, less-deferential decisions than seeing the suggestion first.
- **The most corrective advice is the most likely to be rejected (distance effect) [P-3].** Humans discount advice that diverges sharply from their prior, exactly the contrarian agent suggestions that may be most valuable; experts discount most.
- **Trust is fragile and asymmetric [P-2, P-21].** Reputation forms fast and is lost more easily than gained; people drop algorithms faster than humans after identical errors. Error transparency, recovery, and letting users adjust outputs keep reliance from collapsing.
- **Reliance is contaminated by irrelevant factors:** incidental mood [P-5] and the cost/effort of obtaining advice [P-6] move advice-weighting independently of quality.
- **Expertise changes everything; both human and AI intuition have boundary conditions [P-7, P-8].** Experts pattern-match (RPD); intuition is trustworthy only in regular environments with good feedback, a two-condition test for whom to weight.
- **Review quality is bounded by working memory [P-17].** Dense, poorly-presented agent output produces poor oversight regardless of intent; favor concise rationales, diffs, confidence cues.
- **Decision fatigue should constrain HITL only weakly and provisionally.** The mechanism (**ego depletion**) **failed a 23-lab preregistered replication** (d≈0.04, [P-13], undercutting [P-12]); the iconic parole "hungry judge" study [P-14] is contested by an ordering confound [P-15] and a time-allocation artifact [P-16]. Treat "limit decisions per human" as a *testable heuristic*, not a law.
- **Choice overload is similarly over-claimed:** the jam study [P-18] is famous but a 50-study meta-analysis found a mean effect near zero [P-19]. Don't assume "fewer AI options = better."
- **The dual-process frame is sound but cite per-study carefully [P-9, P-10]:** System 1/2 and core biases hold, but some studies popularized in *Thinking, Fast and Slow* (priming) didn't replicate.
- **Net stance:** build for *calibrated* reliance: force a provisional human judgment before revealing AI output (anti-anchoring), surface reasoning (counter discounting + confirmation bias), make errors/confidence transparent (manage fragile trust), minimize reviewer load, and treat fatigue/overload limits as hypotheses, not settled science.

### Annotated bibliography

**[P-1] Bonaccio, S., & Dalal, R. S. (2006). [review]** *Advice taking and decision-making: An integrative literature review…* OBHDP 101(2), 127-151. DOI: 10.1016/j.obhdp.2006.07.001.
The canonical synthesis around the **Judge-Advisor System (JAS)**: advice generally improves accuracy but is systematically *under-weighted*; design factors (pre-advice decision, #advisors, cost, solicited?) change utilization. *Relevance:* an agent is structurally an "advisor" in a JAS, the master frame for predicting (under-)weighting of its output.

**[P-2] Yaniv, I., & Kleinberger, E. (2000). [empirical]** *Advice taking in decision making: Egocentric discounting and reputation formation.* OBHDP 83(2), 260-281. DOI: 10.1006/obhd.2000.2909.
**Egocentric discounting** (~70/30 toward self) because judges have privileged access to their own reasons; reputation forms fast and is lost more easily than gained. *Relevance:* default human behavior *under*-uses good agent advice; a single visible error collapses trust disproportionately.

**[P-3] Yaniv, I. (2004). [empirical]** *Receiving other people's advice: Influence and benefit.* OBHDP 93(1), 1-13. DOI: 10.1016/j.obhdp.2003.08.002.
The **distance effect**: advice is discounted more the further from the judge's prior; knowledgeable judges discount more. *Relevance:* contrarian agent suggestions are ignored precisely when most corrective; experts discount agent advice most.

**[P-4] Sniezek, J. A., & Buckley, T. (1995). [empirical]** *Cueing and cognitive conflict in Judge-Advisor decision making.* OBHDP 62(2), 159-174. DOI: 10.1006/obhd.1995.1040.
Judges who formed an independent tentative choice *before* advice performed best; "dependent" judges worst. *Relevance:* "decide first, then reveal the AI suggestion" is an evidence-backed anti-anchoring workflow.

**[P-5] Gino, F., & Schweitzer, M. E. (2008). [empirical]** *Blinded by anger or feeling the love: How emotions influence advice taking.* J. Applied Psychology 93(5), 1165-1173. DOI: 10.1037/0021-9010.93.5.1165.
*Incidental* gratitude raises advice uptake; anger lowers it. *Relevance:* reliance on an agent is partly a function of mood at the moment, not just agent quality.

**[P-6] Gino, F. (2008). [empirical]** *Do we listen to advice just because we paid for it?* OBHDP 107(2), 234-245. DOI: 10.1016/j.obhdp.2008.03.001.
People weight advice more when they paid for it, quality held constant (sunk-cost flavored). *Relevance:* the cost/effort of obtaining an agent's output can inflate reliance independent of accuracy.

**[P-7] Klein, G. (1998). [theory+field]** *Sources of Power: How People Make Decisions.* MIT Press. ISBN 9780262611466.
The **Recognition-Primed Decision** model: experts under time pressure recognize a situation and retrieve a workable action, mentally simulating it, rather than comparing options. *Relevance:* an AI suggestion that interrupts a fast expert recognition may be resisted; the same suggestion may anchor a pattern-less novice. Design for who's in the loop.

**[P-8] Kahneman, D., & Klein, G. (2009). [theory; adversarial collaboration]** *Conditions for intuitive expertise: A failure to disagree.* American Psychologist 64(6), 515-526. DOI: 10.1037/a0016755.
Intuitive expertise is trustworthy only when (a) the environment has valid cues and (b) there was practice with rapid, unambiguous feedback. *Relevance:* a calibration test for both human and model: neither should be trusted where cue validity is low or feedback poor.

**[P-9] Tversky, A., & Kahneman, D. (1974). [empirical/theory]** *Judgment under uncertainty: Heuristics and biases.* Science 185(4157), 1124-1131. DOI: 10.1126/science.185.4157.1124.
Representativeness, availability, and **anchoring-and-adjustment** (estimates pulled toward an initial anchor, even arbitrary). *Relevance:* an agent's suggested answer is an anchor; humans under-adjust away from it even when wrong, the mechanistic core of "anchoring on an AI suggestion."

**[P-10] Kahneman, D. (2011). [theory/synthesis]** *Thinking, Fast and Slow.* FSG. ISBN 9780374275631.
**System 1** (fast, intuitive, bias-prone) vs **System 2** (slow, effortful). Reviewing an agent's output is a System-2 task humans skip, defaulting to System-1 acceptance. *Caveat:* some studies in the book (priming) did not replicate; use as framework, verify per claim. *Relevance:* without a forcing function, humans rubber-stamp plausible-looking output.

**[P-11] Nickerson, R. S. (1998). [review]** *Confirmation bias: A ubiquitous phenomenon in many guises.* Review of General Psychology 2(2), 175-220. DOI: 10.1037/1089-2680.2.2.175.
People seek/interpret/remember evidence favoring a belief in hand. *Relevance:* once an agent proposes an answer, the human looks for confirming rather than disconfirming evidence, degrading the very "review" HITL relies on.

**[P-12] Baumeister, R. F., Bratslavsky, E., Muraven, M., & Tice, D. M. (1998). [empirical: CONTESTED]** *Ego depletion: Is the active self a limited resource?* JPSP 74(5), 1252-1265. DOI: 10.1037/0022-3514.74.5.1252.
Proposed self-control draws on a single depletable resource (radish-vs-chocolate). *Robustness: seriously contested, see [P-13].* *Relevance:* do not justify "limit decisions per human" purely on ego depletion; the foundation is weak.

**[P-13] Hagger, M. S., Chatzisarantis, N. L. D., et al. (2016). [registered replication: NULL]** *A multilab preregistered replication of the ego-depletion effect.* Perspectives on Psychological Science 11(4), 546-573. DOI: 10.1177/1745691616652873.
23 labs, N=2,141; pooled effect essentially null (d≈0.04). *Relevance:* the high-quality robustness evidence, and it's negative: be skeptical of designs premised on a simple depletion mechanism.

**[P-14] Danziger, S., Levav, J., & Avnaim-Pesso, L. (2011). [empirical: CONTESTED]** *Extraneous factors in judicial decisions.* PNAS 108(17), 6889-6892. DOI: 10.1073/pnas.1018033108.
~1,112 parole rulings: favorable rulings fell from ~65% to near 0% before breaks, resetting after, the "hungry judge" result. *Robustness: contested ([P-15], [P-16]).* *Relevance:* the strongest *narrative* for limiting decision load: cite *with* its critiques.

**[P-15] Weinshall-Margel, K., & Shapard, J. (2011). [critique]** *Overlooked factors in the analysis of parole decisions.* PNAS 108(42), E833. DOI: 10.1073/pnas.1110910108.
Case ordering is not random (unrepresented prisoners, who win less, tend to be last); composition, not fatigue, could drive the decline. *Relevance:* rule out ordering/selection confounds before attributing degraded review to fatigue.

**[P-16] Glöckner, A. (2016). [critique/simulation]** *The irrational hungry judge effect revisited…* Judgment and Decision Making 11(6), 601-610. DOI: 10.1017/S1930297500004873.
Simulations show the decline can be largely a statistical artifact of favorable rulings taking longer + avoiding long cases before breaks. *Relevance:* "decision fatigue" effects in field data may be inflated by data-censoring artifacts, a plausible-but-unproven design heuristic.

**[P-17] Sweller, J. (1988). [theory+empirical]** *Cognitive load during problem solving: Effects on learning.* Cognitive Science 12(2), 257-285. DOI: 10.1207/s15516709cog1202_4.
Working memory is capacity-limited; high *extraneous* load degrades performance. *Relevance:* a human reviewing dense, poorly-presented agent output under load reviews it badly; surface concise rationales, diffs, confidence cues.

**[P-18] Iyengar, S. S., & Lepper, M. R. (2000). [empirical: CONTESTED]** *When choice is demotivating…* JPSP 79(6), 995-1006. DOI: 10.1037/0022-3514.79.6.995.
The "jam study": 24 options → far less purchase than 6. *Robustness: contested ([P-19]).* *Relevance:* offering too many agent-generated options *might* reduce decision quality, but not reliably established.

**[P-19] Scheibehenne, B., Greifeneder, R., & Todd, P. M. (2010). [meta-analysis]** *Can there ever be too many options?* J. Consumer Research 37(3), 409-425. DOI: 10.1086/651235.
50 experiments, N≈5,036: mean choice-overload effect ≈ zero, no reliable moderators. *Relevance:* "fewer options is better" is not a dependable law; tune empirically per task.

**[P-20] Logg, J. M., Minson, J. A., & Moore, D. A. (2019). [empirical]** *Algorithm appreciation: People prefer algorithmic to human judgment.* OBHDP 151, 90-103. DOI: 10.1016/j.obhdp.2018.12.005. (cross-ref [C-16])
People weight identical advice *more* when told it's algorithmic, but appreciation shrinks vs. their own judgment and among experts. *Relevance:* the "AI" label itself shifts reliance upward (partly flipping egocentric discounting); pairs with automation-bias concerns.

**[P-21] Dietvorst, B. J., Simmons, J. P., & Massey, C. (2015). [empirical]** *Algorithm aversion: People erroneously avoid algorithms after seeing them err.* JEP: General 144(1), 114-126. DOI: 10.1037/xge0000033.
After seeing an algorithm err, people abandon it faster than a human making the same error, even when it's superior; letting people slightly adjust it restores use (2018 follow-up). *Relevance:* trust in an agent is fragile/asymmetric; error transparency and user adjustment control keep reliance calibrated rather than collapsing.

## V.Q: The anatomy of the loop episode + choice architecture

_The design of a **single oversight moment**: what it must contain to be effective. Organized around five necessary aspects + the choice-architecture layer that frames them. This cluster directly answers "what are the necessary aspects of the loop itself?"_

### Highlights

- **Interrupting the human is never free [Q-23, Q-24].** Even when output quality holds, interruptions raise stress, error, and anxiety; *timing* (defer to a task breakpoint) matters as much as content [Q-28]. Treat each oversight prompt as a priced action against an attention budget [Q-25, Q-26, Q-29].
- **Low-precision alerting destroys oversight [Q-30].** Humans reflexively dismiss *all* alerts (including critical ones) when precision is low. HITL prompts must be high-precision and role-targeted. The dominant real-world failure mode of "human in the loop."
- **Humans systematically under-scrutinize confident automation [Q-17, Q-18].** A reviewer in the loop does not reliably catch errors by default; detection must be engineered.
- **Detection-useful explanations are contrastive and demand-driven [Q-15, Q-16].** "Why / why-not" help most, and demand spikes when the system looks wrong; generic "show your work" framed to persuade can *increase* over-reliance.
- **Uncertainty is a stronger detection signal than explanation [Q-20, Q-21],** but only if calibrated and carefully framed; raw confidence is easily misread. Low confidence is a natural escalation trigger.
- **Friction can backfire (sludge) or help (microboundaries / cognitive forcing) [Q-19, Q-33, Q-35].** Indiscriminate friction causes approval fatigue; targeted friction before irreversible actions reduces rubber-stamping. Audit friction against the stakes it gates [Q-34].
- **The default dominates the decision [Q-31, Q-32].** The safe/reversible option (never auto-approve-on-timeout) must be the default in any approval gate.
- **Consequence preview is feedforward [Q-2, Q-3].** "What happens if I approve" is a named HCI principle (feedforward across the Gulf of Execution); reversibility/undo is a first-class safety affordance [Q-4]. Agents demonstrably propose irreversible harmful actions [Q-5], so pre-execution preview is necessary.
- **The decision-point human is "out of the loop" [Q-10].** Being pulled in only at the moment of decision degrades situation awareness; the provenance/context trail restores SA [Q-9] and lets them reconstruct the situation (sensemaking) [Q-7, Q-8].
- **Provenance should be structured, not narrative [Q-12].** Separate data lineage from interaction history and decision rationale; PROV gives a ready schema (entities/activities/agents) for an auditable trail [Q-11, Q-13].
- **An approval prompt IS choice architecture; there is no neutral UI [Q-31].** The same levers (defaults, friction, framing) are weaponized as dark patterns; the dark-patterns corpus is a precise anti-pattern checklist (no confirmshaming "reject," false urgency, obstruction of deny/undo) [Q-36, Q-37, Q-38, Q-39].
- **Communicate stakes trustworthily, not persuasively [Q-6]:** the oversight moment's goal is genuine understanding, the inverse of manipulation.

### THE ANATOMY OF A WELL-DESIGNED LOOP EPISODE

_An ordered checklist of the elements a single oversight moment should contain (each tagged with supporting sources). This is the actionable core of the cluster._

0. **Decide whether to interrupt at all (attention gate).** Estimate the expected cost of interrupting *this* human *now*; defer non-urgent asks to a task breakpoint; batch; budget alert volume; keep precision high. → [Q-23, Q-24, Q-25, Q-26, Q-27, Q-28, Q-29, Q-30]
1. **State the request clearly (decision legibility).** What exactly is being asked: scoped, unambiguous, in the human's frame. → [Q-1, Q-2, Q-14]
2. **Show the consequences before acting (feedforward).** Preview the concrete effects of each option, including downstream side effects. → [Q-2, Q-3, Q-6]
3. **Make reversibility explicit.** State whether it's undoable; provide the undo; flag clearly when it's *not* (irreversible → stronger gate). → [Q-4, Q-5]
4. **Surface uncertainty / confidence: calibrated and well-framed.** Low confidence as an escalation/scrutiny trigger; frame numbers so they aren't misread. → [Q-6, Q-20, Q-21]
5. **Provide the provenance trail: "how did this get to me?"** The upstream context that restores SA: what the agent perceived, inferred, considered, why it escalated, the steps that led here, structured (lineage vs. interaction history vs. rationale), ideally a queryable provenance graph. Counters the out-of-the-loop problem. → [Q-7, Q-8, Q-9, Q-10, Q-11, Q-12, Q-13]
6. **Build in error-detection affordances (support checking, not trusting).** Contrastive "why/why-not" + diffs framed for verification; surface disagreement, counter-evidence, the agent's own doubts; progressive disclosure (summary first, full plan one click away). Counteract automation bias deliberately. → [Q-14, Q-15, Q-16, Q-17, Q-18, Q-20, Q-22]
7. **Add proportionate friction: a microboundary, not sludge.** A beat of reflection (decide-first / cognitive forcing) *only* before consequential, irreversible actions; audit that the friction is warranted by the stakes. → [Q-19, Q-33, Q-34, Q-35]
8. **Use bias-safe choice architecture: no dark patterns.** Safe/reversible option as default (never auto-approve-on-timeout); no manipulative framing: no confirmshaming the reject, false urgency/scarcity, obstruction of deny/undo, or preselected high-consequence approvals. → [Q-31, Q-32, Q-36, Q-37, Q-38, Q-39]
9. **Preserve accountability after the act.** Keep the human the accountable initiator (internal locus of control); log the decision into the provenance record. → [Q-4, Q-11, Q-13, Q-14]

### Annotated bibliography

_Tags: [empirical] / [design-guidance] / [theory]. Aspect tags: request / consequence / provenance / detection / attention / choice-arch._

**[Q-1] Amershi, S., Weld, D., Vorvoreanu, M., et al. (2019). [design-guidance, validated]** *Guidelines for Human-AI Interaction.* CHI '19. DOI: 10.1145/3290605.3300233. (cross-ref [G-7])
18 validated guidelines incl. the request-clarity primitives G1 (what the system can do), G11 (why it did what it did), G6 (scope when in doubt). *Aspect:* request, detection.

**[Q-2] Norman, D. A. (2013). [theory]** *The Design of Everyday Things (rev. ed.).* Basic Books. (cross-ref [G-11])
**Gulf of Execution** (intention → action) and **Gulf of Evaluation** (state → understanding). *Aspect:* request, consequence; legibility + visible effects narrow both gulfs around the approve/reject moment.

**[Q-3] Vermeulen, J., Luyten, K., van den Hoven, E., & Coninx, K. (2013). [theory+design-guidance]** *Crossing the Bridge over Norman's Gulf of Execution: Revealing Feedforward's True Identity.* CHI '13, 1931-1940. DOI: 10.1145/2470654.2466255.
Establishes **feedforward**: information shown *before* an action telling the user its result. *Aspect:* consequence; a consequence preview in an approval gate *is* feedforward.

**[Q-4] Shneiderman, B., Plaisant, C., et al. (2016). [design-guidance]** *Designing the User Interface (6th ed.): Eight Golden Rules.* Pearson.
"Permit easy reversal of actions" (undo as core safety affordance) and "support internal locus of control." *Aspect:* consequence, choice-arch; reversibility + keeping the human the initiator.

**[Q-5] Ruan, Y., Dong, H., Wang, A., et al. (2024). [empirical]** *Identifying the Risks of LM Agents with an LM-Emulated Sandbox (ToolEmu).* ICLR 2024; arXiv:2309.15817.
An emulated sandbox stress-tests agents across 36 high-stakes toolkits; even the safest agent fails ~23.9% of the time, often with irreversible actions. *Aspect:* consequence, detection; empirical proof that pre-execution preview and gates are necessary.

**[Q-6] Spiegelhalter, D. (2017). [design-guidance]** *Risk and Uncertainty Communication.* Annual Review of Statistics and Its Application 4, 31-60. DOI: 10.1146/annurev-statistics-010814-020148.
Evidence-based principles for communicating risk/uncertainty honestly (frequencies, graphics, second-order uncertainty): *trustworthy* over persuasive. *Aspect:* consequence, choice-arch.

**[Q-7] Pirolli, P., & Card, S. (2005). [theory]** *The Sensemaking Process and Leverage Points for Analyst Technology…* Proc. Int'l Conf. on Intelligence Analysis. (no DOI; pagination approx.)
The canonical **sensemaking loop** (foraging + sensemaking; shoebox → evidence → schema → hypothesis). *Aspect:* provenance; a blueprint for the "how did this get to me" trail.

**[Q-8] Klein, G., Moon, B., & Hoffman, R. R. (2006). [theory]** *Making Sense of Sensemaking 2: A Macrocognitive Model.* IEEE Intelligent Systems 21(5), 88-92. DOI: 10.1109/MIS.2006.100.
The **data-frame theory**: data fit a frame while the frame determines relevant data, in a reciprocal cycle. *Aspect:* provenance, detection; an escalation is a "broken frame" moment; surface data *and* frame so the human can re-anchor.

**[Q-9] Endsley, M. R. (1995). [theory]** *Toward a Theory of Situation Awareness in Dynamic Systems.* Human Factors 37(1), 32-64. (cross-ref [E-12])
SA: perception/comprehension/projection. *Aspect:* provenance; the handoff display must restore the overseer to L1-L3 SA before they decide.

**[Q-10] Endsley, M. R., & Kiris, E. O. (1995). [empirical]** *The Out-of-the-Loop Performance Problem and Level of Control in Automation.* Human Factors 37(2), 381-394. (cross-ref [E-13], [H-3])
Full automation leaves operators out-of-the-loop with degraded SA/slower takeover. *Aspect:* provenance, attention; the escalation trail is the mechanism to re-establish SA enough to intervene.

**[Q-11] Moreau, L., Groth, P., Miles, S., et al. (2008). [theory+design-guidance]** *The Provenance of Electronic Data.* CACM 51(4), 52-58. DOI: 10.1145/1330311.1330323.
Documented data history confers authority/interpretability; agenda for provenance-aware applications. *Aspect:* provenance; the conceptual foundation for an interrogable audit trail.

**[Q-12] Ragan, E. D., Endert, A., Sanyal, J., & Chen, J. (2016). [design-guidance]** *Characterizing Provenance in Visualization and Data Analysis…* IEEE TVCG 22(1), 31-40. DOI: 10.1109/TVCG.2015.2467551.
Organizes provenance by *type* (data, visualization, interaction, insight, rationale) and *purpose*. *Aspect:* provenance, detection; a design checklist distinguishing data lineage from the agent's interaction history and rationale.

**[Q-13] Moreau, L., & Groth, P. (2013). [design-guidance+theory]** *Provenance: An Introduction to PROV.* Morgan & Claypool. (Anchor: W3C PROV-DM Recommendation.)
The **W3C PROV** standard: Entities/Activities/Agents + relations forming queryable provenance graphs. *Aspect:* provenance; a ready schema to model an agent's decision trail.

**[Q-14] Bellotti, V., & Edwards, W. K. (2001). [theory]** *Intelligibility and Accountability: Human Considerations in Context-Aware Systems.* HCI 16(2-4), 193-212. (cross-ref [G-17])
Systems acting on inferred context must be **intelligible** + keep users **accountable**. *Aspect:* detection, request; expose reasoning + proposed action so a human can detect and contest before commit.

**[Q-15] Lim, B. Y., & Dey, A. K. (2009). [empirical]** *Assessing Demand for Intelligibility in Context-Aware Applications.* UbiComp '09, 195-204. DOI: 10.1145/1620545.1620576.
Demand for explanations (esp. why / why-not) spikes when the system behaves unexpectedly or fails. *Aspect:* detection; which explanation types matter at error moments.

**[Q-16] Lim, B. Y., Dey, A. K., & Avrahami, D. (2009). [empirical]** *Why and Why Not Explanations Improve the Intelligibility of Context-Aware Intelligent Systems.* CHI '09, 2119-2128. DOI: 10.1145/1518701.1519023.
**Why** and **Why-Not** (contrastive) explanations significantly improved understanding and appropriate trust; "what-if/how-to" less. *Aspect:* detection; build "why did the agent do X / why not Y" affordances for verification.

**[Q-17] Parasuraman, R., & Riley, V. (1997). [theory]** *Humans and Automation: Use, Misuse, Disuse, Abuse.* Human Factors 39(2), 230-253. (cross-ref [F-2])
Misuse/disuse/abuse + complacency with imperfectly-reliable automation. *Aspect:* detection, attention; why humans miss agent errors; design for calibrated reliance.

**[Q-18] Skitka, L. J., Mosier, K. L., & Burdick, M. (1999). [empirical]** *Does Automation Bias Decision-Making?* IJHCS 51(5), 991-1006. (cross-ref [F-9])
Omission + commission automation-bias errors with a reliable-but-imperfect aid. *Aspect:* detection; the central risk detection affordances must counteract.

**[Q-19] Buçinca, Z., Malaya, M. B., & Gajos, K. Z. (2021). [empirical+design-guidance]** *To Trust or to Think: Cognitive Forcing Functions…* PACMHCI 5(CSCW1), Art. 188. (cross-ref [F-21], [C-18])
Cognitive forcing (delay the answer; decide first) reduced over-reliance vs. plain XAI, at some satisfaction cost. *Aspect:* detection, choice-arch; concrete friction patterns that force verification.

**[Q-20] Zhang, Y., Liao, Q. V., & Bellamy, R. K. E. (2020). [empirical]** *Effect of Confidence and Explanation on Accuracy and Trust Calibration in AI-Assisted Decision Making.* FAT* '20, 295-305. DOI: 10.1145/3351095.3372852.
**Confidence scores** helped calibrate trust; local explanations did *not* reliably help and sometimes increased over-reliance. *Aspect:* detection, consequence; uncertainty is a stronger detection signal than explanation.

**[Q-21] Prabhudesai, S., Yang, L., Asthana, S., et al. (2023). [empirical]** *Understanding Uncertainty: How Lay Decision-makers Perceive and Interpret Uncertainty in Human-AI Decision Making.* IUI '23, 379-396. DOI: 10.1145/3581641.3584033.
Communicated uncertainty slows users to reason analytically, but is easily *misperceived* without careful framing. *Aspect:* detection, consequence; confidence must be legible *and* calibrated; supports low-confidence escalation.

**[Q-22] Nielsen, J. (2006). [design-guidance: practitioner, not peer-reviewed]** *Progressive Disclosure.* NN/g. (cross-ref [G-16])
Essential info first, advanced detail deferred but recoverable. *Aspect:* detection, attention; layered preview/diff "show details" affordances.

**[Q-23] Mark, G., Gudith, D., & Klocke, U. (2008). [empirical]** *The Cost of Interrupted Work: More Speed and Stress.* CHI '08, 107-110. DOI: 10.1145/1357054.1357072.
Interrupted tasks finish faster but at higher stress/frustration/effort; relatedness didn't reduce disruption. *Aspect:* attention; interrupting the overseer is costly by default.

**[Q-24] Bailey, B. P., & Konstan, J. A. (2006). [empirical]** *On the Need for Attention-Aware Systems…* Computers in Human Behavior 22(4), 685-708. DOI: 10.1016/j.chb.2005.12.009.
Interrupting *during* a task (vs. at a boundary) cost 3-27% more time, ~2× errors, more annoyance; deferring a few seconds to a natural pause mitigated it. *Aspect:* attention; timing matters as much as the request.

**[Q-25] Horvitz, E., & Apacible, J. (2003). [theory+empirical]** *Learning and Reasoning about Interruption.* ICMI '03, 20-27. DOI: 10.1145/958432.958440.
Models to infer the **expected cost of interrupting** from sensed streams. *Aspect:* attention; interruption as an expected-cost quantity an agent can reason over.

**[Q-26] Horvitz, E., Koch, P., & Apacible, J. (2004). [empirical+design-guidance]** *BusyBody: Creating and Fielding Personalized Models of the Cost of Interruption.* CSCW '04, 507-510. DOI: 10.1145/1031607.1031690.
Learns *personalized* decision-theoretic interruptibility models and mediates notifications at run-time. *Aspect:* attention; an agent can learn each overseer's interruption tolerance.

**[Q-27] Fogarty, J., Hudson, S. E., Atkeson, C. G., et al. (2005). [empirical]** *Predicting Human Interruptibility with Sensors.* ACM TOCHI 12(1), 119-146. DOI: 10.1145/1057237.1057243.
Cheap sensors estimate interruptibility as accurately as human observers. *Aspect:* attention; lightweight signals suffice for good timing.

**[Q-28] Iqbal, S. T., & Bailey, B. P. (2008). [design-guidance+empirical]** *Effects of Intelligent Notification Management on Users and Their Tasks.* CHI '08, 93-102. DOI: 10.1145/1357054.1357070.
Deferring notifications to task breakpoints reduced frustration and reaction time vs. immediate delivery. *Aspect:* attention; bundle/defer non-urgent agent notifications to natural boundaries.

**[Q-29] Pielot, M., Church, K., & de Oliveira, R. (2014). [empirical]** *An In-Situ Study of Mobile Phone Notifications.* MobileHCI '14, 233-242. DOI: 10.1145/2628363.2628364.
~63.5 notifications/day; higher *volume* associated with more negative emotion. *Aspect:* attention; over-notifying degrades well-being; budget and aggregate prompts.

**[Q-30] Hussain, M. I., Reynolds, T. L., & Zheng, K. (2019). [empirical+design-guidance]** *Medication Safety Alert Fatigue May Be Reduced via Interaction Design and Clinical Role Tailoring: A Systematic Review.* JAMIA 26(10), 1141-1149. DOI: 10.1093/jamia/ocz095. (cross-ref [H-12])
Clinicians override most alerts (incl. critical) due to low specificity; design + role-tailoring mitigate. *Aspect:* attention, detection; the canonical over-burdening failure; HITL alerts must be high-precision and role-targeted.

**[Q-31] Thaler, R. H., & Sunstein, C. R. (2008). [theory]** *Nudge.* Yale University Press. ISBN 978-0300122237.
**Choice architecture**: no choice is presented neutrally. *Aspect:* choice-arch; an approval prompt *is* choice architecture; framing/ordering/default must be designed intentionally.

**[Q-32] Johnson, E. J., & Goldstein, D. G. (2003). [empirical]** *Do Defaults Save Lives?* Science 302(5649), 1338-1339. DOI: 10.1126/science.1091721.
The **default effect**: opt-out organ donation ~90%+ vs ~15% opt-in. *Aspect:* choice-arch; the default dominates; the safe/reversible action must be default, never auto-approve-on-timeout.

**[Q-33] Sunstein, C. R. (2019). [theory]** *Sludge and Ordeals.* Duke Law Journal 68(8), 1843-1883.
**Sludge** (harmful friction) vs justified "ordeals." *Aspect:* choice-arch, attention; oversight friction can force beneficial reflection or become harmful approval-fatigue sludge.

**[Q-34] Sunstein, C. R. (2020). [design-guidance]** *Sludge Audits.* Behavioural Public Policy 6(4), 654-673. DOI: 10.1017/bpp.2019.32.
A methodology to measure/justify frictional burdens. *Aspect:* choice-arch, attention; audit how much friction each approval step adds vs. the stakes it gates.

**[Q-35] Cox, A. L., Gould, S. J. J., Cecchinato, M. E., et al. (2016). [design-guidance]** *Design Frictions for Mindful Interactions: The Case for Microboundaries.* CHI EA '16, 1389-1397. DOI: 10.1145/2851581.2892410.
Deliberate **microboundaries** prompt reflection before consequential actions without removing autonomy. *Aspect:* choice-arch, detection; friction done right: a beat of reflection before irreversible agent actions.

**[Q-36] Mathur, A., Acar, G., Friedman, M. J., et al. (2019). [empirical]** *Dark Patterns at Scale: Findings from a Crawl of 11K Shopping Websites.* PACMHCI 3(CSCW), Art. 81. DOI: 10.1145/3359183.
1,818 dark-pattern instances across 15 types/7 categories (sneaking, urgency, misdirection, scarcity, obstruction, forced action). *Aspect:* choice-arch; a catalogue of tactics an approval prompt must NOT use.

**[Q-37] Gray, C. M., Kou, Y., Battles, B., et al. (2018). [design-guidance]** *The Dark (Patterns) Side of UX Design.* CHI '18, Paper 534. DOI: 10.1145/3173574.3174108.
Five strategies: nagging, obstruction, sneaking, interface interference, forced action; designers drift into manipulation serving the deploying party. *Aspect:* choice-arch; an anti-pattern checklist for oversight UX.

**[Q-38] Gray, C. M., Santos, C., & Bielova, N. (2023). [theory]** *Towards a Preliminary Ontology of Dark Patterns Knowledge.* CHI EA '23, Art. 286. DOI: 10.1145/3544549.3585676.
Harmonizes a three-level ontology of dark patterns for enforcement (EU DSA, FTC). *Aspect:* choice-arch; a vocabulary for naming and prohibiting specific manipulative moves in approval UIs.

**[Q-39] Brignull, H. (2023). [design-guidance]** *Deceptive Patterns: Exposing the Tricks Tech Companies Use to Control You.* Testimonium Ltd. ISBN 978-1739454401.
The canonical practitioner book by the coiner of "dark patterns." *Aspect:* choice-arch; the authoritative reference for ensuring agent consent/approval prompts inform rather than steer.

## V.R: Sociotechnical context & HITL workflow precedents

_How automation reshapes skill, work, and agency, and mature human+AI *workflow* precedents from other fields. Tags: [BOOK]/[EMPIRICAL]/[STANDARD]/[THEORY]/[REVIEW]._

### Highlights

- **Informate, don't just automate (Zuboff, [R-1]).** Agents should surface reasoning, evidence, and intermediate state to grow human understanding, not silently execute and hide the process. The root choice that determines whether HITL builds or erodes competence.
- **Deskilling is the central failure mode HITL must prevent (Braverman [R-3], Bainbridge [R-6]).** Separating "conception" (judgment) from "execution" turns humans into rubber-stamps; "the human will catch it" fails once the human is deskilled into a passive monitor.
- **Scaffolding + fading is the deskilling antidote and the template for *progressive autonomy* [R-9, R-10, R-8].** Calibrate support to the learner's zone, then *fade* it as competence grows, "without creating dependence." Cognitive apprenticeship's modeling→coaching→scaffolding→fading→exploration is a staircase for graduating autonomy and tapering oversight.
- **Augment, don't replace (Autor [R-4], Brynjolfsson [R-5]).** Allocate by comparative advantage at the *task* level; the "Turing Trap" warns mimic-and-replace AI is the costly default to resist.
- **Quality-estimation gating (MT QE [R-13], ISO 18587 [R-11]):** the agent emits a calibrated confidence/quality score; auto-proceed on high confidence, escalate low. A mature, operational confidence-routing mechanism.
- **Risk-tiered review intensity (PE levels [R-12]):** match human effort to content risk/value: full review for high-stakes, light/sampled for low-stakes.
- **Escalation tiers + queue routing (Gillespie [R-15]):** automated first-pass → front-line human → escalate hard/ambiguous cases up. Pair with transparency.
- **Audit sampling of autonomous output (Grossman & Cormack [R-16]):** statistically sample and validate agent decisions against an expert/control set to certify quality; combine with active-learning loops.
- **Second-reader / redundancy pattern (radiology CAD [R-17, R-18]):** run the agent as an independent parallel checker flagging candidates for adjudication, but tune flag volume, or it adds false positives and burden.
- **Reviewer wellbeing is a first-class constraint (Roberts [R-14]).** High-volume HITL review harms reviewers; pacing/rotation/support must be designed in. The "human trains and backstops AI" loop is real and persistent.
- **Joint optimization, not technical optimization (Trist & Bamforth [R-7]).** HITL is a *sociotechnical system* design problem; a technically superior agent that wrecks human roles is a net failure.
- **Plans are situated, build for in-flight repair (Suchman [R-2]).** Favor continuous, cheap human repair over one-shot up-front approval; agency is reconfigured, not cleanly handed off.

### Annotated bibliography

**[R-1] Zuboff, S. (1988). [book]** *In the Age of the Smart Machine: The Future of Work and Power.* Basic Books.
Coins **informate vs. automate**: IT both substitutes for labor *and* renders work processes visible/knowable; firms reflexively chose control over learning. *Relevance:* the foundational design principle: agents should *informate* (surface reasoning/evidence/state) so human competence grows rather than atrophies.

**[R-2] Suchman, L. A. (1987/2007). [book]** *Plans and Situated Actions / Human-Machine Reconfigurations.* Cambridge UP. (cross-ref [M-4])
Human action is **situated** (improvised against contingencies); plans are resources, not determinants; agency is reconfigured, not transferred. *Relevance:* favor cheap, continuous in-flight repair over one-shot approval; the labor/agency angle on automation.

**[R-3] Braverman, H. (1974). [book]** *Labor and Monopoly Capital: The Degradation of Work in the Twentieth Century.* Monthly Review Press.
Origin of the **deskilling thesis**: Taylorism separates *conception from execution*, concentrating knowledge in management. *Relevance:* names the risk that "human-in-the-loop" becomes "human-as-rubber-stamp" deskilling; keep conception with the human or jointly held.

**[R-4] Autor, D. H. (2015). [empirical/review]** *Why Are There Still So Many Jobs? The History and Future of Workplace Automation.* J. Economic Perspectives 29(3), 3-30. DOI: 10.1257/jep.29.3.3.
Automation substitutes for *routine/codifiable* tasks but *complements* human judgment (the Polanyi paradox bounds what's automatable). *Relevance:* decompose the workflow into tasks and route by comparative advantage; the loop is a task-allocation boundary.

**[R-5] Brynjolfsson, E. (2022). [theory/essay]** *The Turing Trap: The Promise & Peril of Human-Like Artificial Intelligence.* Daedalus 151(2), 272-287. arXiv:2201.04200.
Chasing *human-like* (substitutive) AI over-incentivizes replacement; *augmentation* generates more value and keeps humans leveraged. *Relevance:* build to augment; HITL is the mechanism by which augmentation (and accountability) is operationalized.

**[R-6] Bainbridge, L. (1983). [theory/essay]** *Ironies of Automation.* Automatica 19(6), 775-779. (cross-ref [E-7], [H-1])
Automating the routine leaves humans the residual hardest tasks while their skills decay from disuse; monitoring is a task humans do poorly. *Relevance:* the deskilling-by-automation trap; HITL must keep humans actively practicing, not passively monitoring.

**[R-7] Trist, E. L., & Bamforth, K. W. (1951). [empirical]** *Some Social and Psychological Consequences of the Longwall Method of Coal-Getting.* Human Relations 4(1), 3-38. DOI: 10.1177/001872675100400101.
Founding **sociotechnical systems** study: a technically "efficient" mechanization wrecked the social work system; performance requires **joint optimization** of social + technical. *Relevance:* HITL is a system design problem; don't optimize the agent in isolation.

**[R-8] Vygotsky, L. S. (1978). [book]** *Mind in Society.* Harvard UP.
The **Zone of Proximal Development**: the gap between unaided and guided performance, where learning happens via assisted performance. *Relevance:* a model for *calibrating* how much an agent should help: target the human's zone; as competence grows, assistance recedes.

**[R-9] Wood, D., Bruner, J. S., & Ross, G. (1976). [empirical]** *The Role of Tutoring in Problem Solving.* J. Child Psychology and Psychiatry 17(2), 89-100. DOI: 10.1111/j.1469-7610.1976.tb00381.x.
Coins **scaffolding** (six tutoring functions); effective scaffolding is *contingent* and meant to be **faded**, not to create dependence. *Relevance:* a blueprint for progressive autonomy: the agent scaffolds the human (and vice versa), and the scaffolding fades; fading is the explicit deskilling antidote.

**[R-10] Collins, A., Brown, J. S., & Newman, S. E. (1989). [book chapter/theory]** *Cognitive Apprenticeship: Teaching the Crafts of Reading, Writing, and Mathematics.* In Resnick (ed.), *Knowing, Learning, and Instruction*, 453-494. Erlbaum.
The staircase: **modeling → coaching → scaffolding → articulation → reflection → fading → exploration**; experts make tacit reasoning visible, then transfer responsibility. *Relevance:* the canonical model for graduating an agent's autonomy and tapering oversight while preserving competence.

**[R-11] ISO 18587:2017. [standard]** *Translation services: Post-editing of machine translation output: Requirements.* ISO.
Defines the **post-editing** process and full vs. light PE (tiered quality targets). *Relevance:* a standardized template for the human-corrects-machine-output loop with quality targets tied to use case; review need not be uniform.

**[R-12] Nunziatini, M., & Marg, L. (2020). [empirical/industry]** *Machine Translation Post-Editing Levels: Breaking Away from the Tradition…* EAMT 2020, 309-318.
Proposes **graduated PE levels tailored by content type and end use** (effort matched to value/risk). *Relevance:* tier human review intensity by content risk: direct precedent for risk-tiered HITL.

**[R-13] Specia, L., Scarton, C., & Paetzold, G. H. (2018). [book/survey]** *Quality Estimation for Machine Translation.* Morgan & Claypool. DOI: 10.2200/S00854ED1V01Y201805HLT039 (verify at press).
**MT Quality Estimation** predicts quality *without a reference* to gate/route segments (auto-publish high-confidence; send low-confidence to humans). *Relevance:* the cleanest precedent for **confidence-based gating**: agents should produce calibrated confidence and route by it.

**[R-14] Roberts, S. T. (2019). [book/ethnography]** *Behind the Screen: Content Moderation in the Shadows of Social Media.* Yale UP.
Ethnography of commercial content moderation: a hidden workforce that enforces policy, *trains AI*, and screens what machines can't, at severe psychological cost. *Relevance:* reviewer wellbeing is a first-class design constraint; the human-trains-and-backstops-AI loop is real and persistent.

**[R-15] Gillespie, T. (2018). [book]** *Custodians of the Internet…* Yale UP.
Moderation is constitutional to platforms: rule-making → automated detection → **human review queues, escalation tiers** → deliberate opacity. *Relevance:* the canonical scaled architecture: tier the loop by difficulty/risk; make the process transparent and accountable, not masked.

**[R-16] Grossman, M. R., & Cormack, G. V. (2011). [empirical]** *Technology-Assisted Review in E-Discovery Can Be More Effective and More Efficient Than Exhaustive Manual Review.* Richmond J. Law & Technology 17(3), Art. 5.
TAR/predictive coding (classifier trained on expert coding) beats exhaustive manual review; CAL keeps a human in a tight train-review-retrain loop with **statistical sampling/validation**. *Relevance:* the best precedent for **audit sampling** of autonomous output + active-learning loops.

**[R-17] Gilbert, F. J., et al. (2008). [empirical]** *Single Reading with Computer-Aided Detection for Screening Mammography.* NEJM 359(16), 1675-1684. DOI: 10.1056/NEJMoa0803545.
Single radiologist + CAD ("second reader") approximated double reading. *Relevance:* the **second-reader / redundancy** pattern: the agent runs as an independent parallel checker flagging candidates for human adjudication.

**[R-18] Azavedo, E., et al. (2012). [review]** *Is single reading with CAD as good as double reading in mammography screening? A systematic review.* BMC Medical Imaging 12:22. DOI: 10.1186/1471-2342-12-22. (lead-author attribution to confirm)
Single+CAD broadly comparable on detection, but CAD increases reading time and recall (false positives); benefit depends on prompt integration. *Relevance:* the cost side of the second-reader pattern: tune the agent's flag threshold to the human's attention budget, or it degrades the workflow.

---

## Cross-cutting synthesis

The first eight clusters (Parts I-II) were assembled independently, yet they converge on a small set
of findings that recur in 1970s aviation, 2000s clinical informatics, 2020s welfare-algorithm
scandals, and 2026 coding-agent studies alike. (Parts III-V, added in a second round, overwhelmingly
*reinforce* these from economics, law, safety science, manufacturing, finance, and education; see
"What Parts III-V add" below.) That convergence is the strongest signal in the codex:
these are not domain quirks but structural properties of putting a human in charge of an
autonomous system. The recurring themes below are the load-bearing inputs to the framework.

### The ten recurring findings (each triangulated across ≥3 clusters)

1. **The reliability paradox: competence breeds complacency.** The more reliable the
   automation, the *less* the human monitors it, so the rare error is the one most likely to
   slip through. Stated by Bainbridge [E-7], measured by Parasuraman/Molloy/Singh [F-4, E-18],
   reaffirmed across autonomy levels [E-15, H-4], visible in AV crashes [H-16, H-17, H-18], and
   reproduced in coding agents where "safety contingent on developer oversight" decays under
   productivity pressure [A-18, A-21]. *Design consequence:* never treat a more capable agent as
   a reason for *less* oversight machinery; capability and complacency rise together.

2. **The exposure-vs-correction gap (the recognition bottleneck).** Oversight mechanisms reliably
   reduce the *occurrence* of bad actions but barely improve the human's ability to *catch* one
   once it surfaces. The cleanest evidence is [A-17] (plan-approval cut bad-action occurrence to
   60-74% but intervention success stayed 9-26%); the mechanism is automation bias / commission
   errors [F-9, F-10, D-18] and the failure is *rationalization*, not inattention. *Design
   consequence:* gating *what the agent does* is easier and more effective than improving *what
   the human notices*; invest accordingly, and don't assume a gate makes the human a good detector.

3. **Nominal oversight ≠ meaningful control.** A human placed in the loop without authority,
   competence, awareness, or time becomes a *moral crumple zone* [F-19, D-16] / rubber stamp
   [D-4, D-14] / MABA-MABA trap [D-15], absorbing blame while protecting the system. The
   constructive target is *meaningful human control* = **tracking + tracing** [C-20, D-13] and
   Billings' "informed, involved, in command" [E-21]. *Design consequence:* every oversight
   point must give the human real authority and the context to use it, or it is theater.

4. **Reversibility beats confirmation.** Confirmation dialogs habituate users into reflexive
   click-through and don't prevent errors; undo is the superior safety net [G-14, G-13, G-15].
   Modern agents implement this as checkpointing/rewind [A-4], but it has a hard boundary at the
   shell (Bash side-effects aren't tracked [A-4]) and false-alarm-prone confirmations actively
   corrode trust [F-17]. *Design consequence:* make agent actions reversible by default; reserve
   blocking confirmation for the genuinely irreversible, and know precisely what you cannot undo.

5. **The out-of-the-loop / handoff problem.** Pulling the human out of the loop degrades the
   *comprehension* (not just the data) needed to take over [E-12, E-13, H-3], and abrupt handoff
   to a disengaged human at the worst moment fails: re-engagement takes 1.5-3.5+ s and longer for
   competence [H-19], as AF447 [H-7] and AV takeover studies show. Today's models are *themselves*
   weak at mid-task steering/cancellation [A-19, A-16]. *Design consequence:* handoffs must be
   anticipatory, gradual, and context-rich; for time-critical failures the human fallback may not
   be viable, so don't architect safety around it.

6. **Autonomy is a multi-dimensional dial, not a switch.** Decide *which stage* (acquire →
   analyze → decide → act) and *what level* (suggest → act-with-approval → act-then-notify →
   act-silently) independently [E-4, E-6]; automate perception/analysis more freely than
   *action*, where over-trust and lost authority bite hardest. Mature agents implement this as
   permission modes + risk-tiering [A-2, A-5, A-6, A-13], and governance says oversight intensity
   should scale to autonomy/stakes [D-6]. *Design consequence:* gate by reversibility × blast
   radius × stakes, not uniformly; make stepping *down* to lower autonomy easy [H-6].

7. **Trust must be calibrated, and explanations can decalibrate it.** Both over-trust (misuse)
   and under-trust (disuse) are failures [F-1, F-2, E-16]; the disposition to over-trust
   *labeled-AI* advice is a baseline risk [C-16]. Critically, explanations/rationales tend to
   *increase acceptance regardless of correctness* [F-20, C-17]; transparency aimed at
   empowering the overseer can instead disarm them. *Design consequence:* surface capability,
   uncertainty, and *verifiable* evidence (not just persuasive rationale); design explanations to
   support checking, not agreeing.

8. **The signal economy: every interruption is a tax, and false alarms are the worst tax.**
   False-alarm-prone systems corrode both compliance and reliance [F-17] and drive alert fatigue:
   clinicians override 49-96% of alerts [H-10], TMI flooded operators with 100+ alarms [H-20].
   The portable discipline: an alarm must demand a *specific* response, and the interruptive rate
   must be capped [H-21]; you cannot fix fatigue by muting the noisiest category [H-11]. *Design
   consequence:* treat interruptions as a scarce budget; most signals should be passive/logged,
   reserving blocking interventions for high-severity, high-precision cases.

9. **Deskilling erodes the very expertise oversight depends on.** Heavy automation atrophies
   skill (especially higher-order judgment [E-22, H-9, E-7]) and the human-feedback literature
   shows you need competent humans to evaluate at all [B-1, B-8]. A reviewer who never does the
   task cannot meaningfully review the agent. *Design consequence:* build in deliberate
   human-only practice / engagement, or accept that the oversight claim hollows out over time.

10. **Structural friction beats exhortation; sandboxes beat per-action gates.** Telling people to
    "stay vigilant" does not work [F-7, E-17]; *cognitive forcing functions* (decide before
    seeing the AI's answer; mandatory deliberation) measurably reduce over-reliance [F-21, C-18]
    though users dislike them. At the system level, the practitioner consensus is to move the
    safety boundary into the *environment* (sandboxes, no-network containers, scoped credentials,
    budget caps [A-23, A-1]) and to recognize the *lethal trifecta* (private data + untrusted
    content + external comms) as the condition under which an agent must not run unsupervised
    [A-23]. *Design consequence:* prefer architectural and forcing-function controls over
    asking the human to be more careful.

### The hard tensions the framework must resolve (not eliminate)

- **Autonomy vs. oversight capability.** Every increment of autonomy that makes the agent more
  useful also degrades the human's situation awareness and takeover ability [E-13, H-4]. There is
  no setting that maximizes both; the framework must choose *per action class*, not globally:
  Shneiderman's 2-D HCAI insists the two are independent axes and the goal is high-high [G-4],
  but the empirics [E-15] show that is hard-won, not free.
- **Friction vs. usability.** The interventions that most reduce over-reliance are the ones users
  most dislike [F-21, C-18, A-17]; the interventions users love (one-click approve, YOLO mode)
  are the ones that produce rubber-stamping. The framework must spend friction deliberately where
  stakes justify it, not uniformly.
- **Explanation vs. over-trust.** Users need intelligibility to oversee [G-17, G-11], yet
  explanations increase uncritical acceptance [F-20]. The resolution is *verification-oriented*
  transparency (evidence the human can independently check) over *persuasion-oriented* rationale.
- **Scaling oversight vs. preserving the human.** AI-assisted oversight (debate, amplification,
  RLAIF, AI supervisors) is the only way to oversee superhuman-scale work [C-3→C-13, A-15, B-20],
  but each step that lets AI help the human evaluate also *removes* the human a little, relocating
  risk into the assisting AI's blind spots [B-20, C-8]. Net team performance can even go *down*
  [C-19]. The framework must track where genuine human judgment still lives.
- **Mandated vs. effective oversight.** Law and standards increasingly *require* oversight
  [D-1, D-2, D-5] while the evidence says humans routinely can't deliver it [D-14, D-17→D-25].
  Compliance and safety are not the same goal; designing for the checkbox can actively produce a
  crumple zone. The framework should treat oversight as a claim to be *validated*, per Green [D-14].

### Seed design principles for the framework (provisional)

These fall out of the findings above and will be developed into the actionable framework:

1. **Gate by consequence, not uniformly:** reversibility × blast-radius × stakes determines
   whether an action is auto-run, notify-after, approve-before, or forbidden [A-6, E-6, D-6].
2. **Default to reversible; confirm only the irreversible:** checkpoint/undo as the primary net;
   blocking confirmation as the rare exception [G-14, A-4].
3. **Make state, intent, and evidence legible, for verification, not persuasion** [G-17, F-20].
4. **Budget interruptions; make every alert demand a defined action** [H-21, F-17].
5. **Engineer the environment, not just the dialog:** sandbox, scope credentials, break the
   lethal trifecta; forcing functions over exhortation [A-23, F-21].
6. **Design the handoff, not just the autonomy:** anticipatory, gradual, context-rich; assume
   re-engagement latency; keep the human warm where takeover must be fast [H-19, E-13].
7. **Keep the human competent:** deliberate engagement/practice to resist deskilling and
   complacency [E-22, F-7].
8. **Give oversight real teeth:** authority + competence + time + traceability, or don't claim it
   [D-4, C-20]; and *validate* that it actually works [D-14, A-17].
9. **Scale span deliberately:** there is a hard ceiling on how many agents one human can oversee
   [H-22]; plan oversight capacity as a finite, budgeted resource.
10. **Treat the model's steerability as a constraint, not a given:** interruptibility and
    mid-task correction are unsolved model capabilities [A-19], so design within their limits.

### What Parts III-V add (delegation, mechanisms, the episode)

The nine second-round clusters largely *reinforce* the ten findings above, itself strong
corroboration, since they come from economics, law, safety science, manufacturing, finance, and
education rather than AI. The genuinely new contributions:

11. **Oversight is costly monitoring, so monitor the exceptions (principal-agent theory).** A human
    delegating to an agent is a textbook principal-agent relationship [J-1, J-2]; agency cost
    (monitoring + bonding + residual loss) never reaches zero, so the goal is *minimizing total
    cost*, not maximizing control. "Management by exception" [K-1] and the informativeness principle
    [J-7] agree: log the trace, review the deviations, accept a residual loss.

12. **The real lever is residual control rights, not an exhaustive rulebook (incomplete contracts).**
    You can't specify correct behavior for every state [J-8, J-9]; control *is* holding the override
    / selective-intervention right (halt, revoke, substitute) for the unforeseen, and some duties
    are *non-delegable* by law [J-15], a hard floor under "a human must decide."

13. **Brief by intent, not by steps (mission command).** Commander's intent + mission orders
    ("results, not how") [K-7] and a small set of pre-authorized rules of engagement [K-12]
    out-perform micromanagement under uncertainty, and autonomy must be paired with shared context
    [K-10].

14. **Decouple tightly-coupled agent pipelines (normal accident theory).** Interactive complexity +
    tight coupling make accidents "normal" [L-10]; the structural fix is to *insert slack*: human
    checkpoints, reversibility, rate limits, circuit breakers [O-6, O-7]. Redundancy can *backfire*
    [L-11]; more checkers ≠ more safety.

15. **Watch for drift and normalization of deviance.** Oversight standards erode silently as "we got
    away with it" repeats [L-15, L-16]; track the *trend* in oversight bypasses, not just incidents.
    Deference to expertise [L-7] says authority should migrate to whoever has the local knowledge.

16. **Capability-removal beats policy: cross-domain consensus.** Poka-yoke's hierarchy (prevention >
    detection > vigilance) [N-7], lockout > tagout [N-17], and least-privilege / capabilities
    [O-10, O-11] all say what the agentic-security literature does: make bad actions *impossible*,
    don't merely discourage them; a bypassable denylist is not a boundary [A-14]. The confused-deputy
    problem *is* prompt injection [O-11, O-12].

17. **Two-party approval and verified shields are mature, portable gates.** Four-eyes / maker-checker
    and the two-person rule [O-1, N-15] (proposer ≠ approver), and runtime shields / Simplex
    [O-17, O-18] (a verified monitor that vetoes the agent, even under injection), are battle-tested
    machinery, and Cranor (2008) [O-9] is a *direct prior HITL framework* this codex generalizes.

18. **The loop episode is a designable unit (and usually under-designed).** A single oversight moment
    must supply request clarity, **consequence + reversibility preview** (feedforward [Q-3]),
    **provenance** ("how did this get to me" [Q-7, Q-11]), **detection affordances** (why/why-not +
    calibrated uncertainty, framed to *check* not *sell* [Q-16, Q-20, F-20]), and **a respected
    attention budget**, with bias-safe choice architecture and no dark patterns [Q-31, Q-36].
    Cross-domain evidence converges that *gates only work when meaningfully attended* (Ontario
    checklist [N-12], ISMP double-checks [N-16], alert fatigue [H-10, Q-30]). See the full anatomy in §V.Q.

19. **Under-reliance is a failure mode too, and decision-fatigue evidence is shaky.** Classic advice
    research shows humans *under*-weight good advice (egocentric discounting [P-2]) even as
    automation-bias research shows over-reliance, so calibration must guard both directions
    [P-20, P-21]. And "limit decisions per human" rests on contested ground: ego depletion failed a
    23-lab replication [P-13] and the "hungry judge" effect is disputed [P-15, P-16]. Treat it as a
    testable heuristic, not a law.

20. **Informate, don't just automate; fade scaffolding to fight deskilling.** Agents should surface
    reasoning/evidence to grow human understanding [R-1], and scaffolding-with-fading [R-9, R-10] is
    a concrete model for *progressive autonomy* that preserves the competence oversight depends on.
    Mature workflow precedents (quality-estimation gating [R-13], escalation tiers [R-15], audit
    sampling [R-16]) are ready patterns to borrow.

## Open questions & gaps

- **Closing the recognition bottleneck.** [A-17] shows gates don't help humans *catch* errors.
  What actually improves *detection* (vs. prevention)? Forcing functions [F-21] help reliance but
  detection-specific interventions for agentic settings are largely unstudied.
- **Calibrated transparency.** We know explanations can increase over-trust [F-20]; we lack tested
  patterns for *verification-oriented* disclosure that raises detection without raising blind
  acceptance, especially for long chain-of-thought / multi-step agent traces.
- **Oversight of agent fleets / multi-agent systems.** Supervisory-span limits are documented for
  UAVs [H-22]; the analog for one human overseeing many concurrent LLM agents (and agents
  overseeing agents [A-15, C-22]) is barely measured.
- **Validated oversight metrics.** Green [D-14] demands evidence that oversight works, but there is
  no standard instrument for measuring *effective* (vs. nominal) human control of an agent. What
  would a "meaningful control" conformance test look like?
- **Reversibility at the shell / real world.** Checkpointing covers structured edits but not Bash
  side-effects [A-4], and many agent actions (sends, payments, deletes) are irreversible by
  nature. How much of an agent's action space can be made *genuinely* undoable, and how should the
  irreducibly-irreversible remainder be governed?
- **Deskilling under pervasive agent use.** The aviation evidence [E-22, H-9] predicts judgment
  decay; the longitudinal effect on developers/knowledge workers using agents daily is unmeasured.
- **Model steerability as the bottleneck.** [A-19] shows interruption/cancellation/re-planning are
  weak model capabilities. How much HITL design is currently limited by the *model* rather than
  the *interface*, and which patterns degrade gracefully when steerability is poor?
- **Trust dynamics over long horizons.** Most trust studies are short-session [F-3]; how reliance
  calibrates (or miscalibrates) over months of living with an agent (incl. recovery after a
  visible failure) is open.
- **Cross-cultural / individual variation.** Complacency potential is an individual difference
  [F-6] and trust has dispositional/cultural layers [F-3]; per-user adaptive friction is proposed
  but untested in agentic tools.
- **Measuring meaningful control.** [C-20, D-13] define control as *tracking + tracing*, but no
  operational test exists for whether an agent's behavior actually tracks the human's reasons and
  traces to an informed human, the conformance test governance [D-14] implicitly demands.
- **The loop-episode evidence gap.** The anatomy in §V.Q is assembled from adjacent fields (security
  warnings, clinical alerts, sensemaking, provenance, choice architecture); few components are tested
  *in agentic-LLM settings*, especially provenance displays and consequence-feedforward for
  multi-step agent plans, and which detection affordances actually raise catch-rate [A-17].
- **Capability-removal vs. usefulness.** Poka-yoke / least-privilege say "make it impossible" [N-7,
  O-10], but over-constraining throttles useful autonomy [K-14]; the trade-off curve for agents is
  uncharted.
- **Does AI-assisted oversight net help?** Human-AI teams often underperform the better of either
  alone [C-19]; whether AI supervisors / debate / runtime shields actually raise *effective* human
  oversight of agents (vs. relocating risk into the assisting system [B-20, C-8]) is largely untested
  in real agentic settings.

---

## Status & provenance

- **Assembled:** 2026-06-22, in **two rounds** of parallel research agents: 8 clusters for
  Parts I-II, then 9 for Parts III-V (**17 clusters, ~366 reference entries**). Each agent was
  instructed to retrieve real sources, distinguish empirical from opinion, record successes *and*
  documented failures, and flag any unverified citation.
- **Verification posture:** the large majority of entries were confirmed against publisher pages,
  DOIs, arXiv IDs, or authoritative indexes. Items the agents could not machine-verify (paywalls/
  403s, JS-rendered legal pages) or flagged for a pinpoint check are marked **UNVERIFIED** or
  "cross-confirmed via secondary sources" inline, incl. [A-2]/[C-2] notes, [B-4], [D-3], [D-7],
  [D-8], [D-11], [D-23], [G-2], [H-9], [H-11], [H-15], [H-21], [K-8], [M-13], [M-20], [O-19], [Q-7],
  [Q-13], [R-13], [R-18]. Spot-check before reusing any citation in a published artifact.
- **Known cross-listings (same source, multiple sections):** Lee & See [F-1≈E-19]; Parasuraman &
  Riley [F-2≈E-16≈H-2]; Parasuraman & Manzey [F-7≈E-17≈C-15≈D-20]; Parasuraman/Molloy/Singh
  [F-4≈E-18]; Mosier et al. [F-10≈E-20]; Skitka et al. 1999 [F-9≈C-14≈D-18] & 2000 [F-11≈D-19];
  Bansal et al. [F-20≈C-17]; Buçinca et al. [F-21≈C-18]; Endsley & Kiris [E-13≈H-3]; Endsley 2017
  [E-?≈H-4]; Sarter & Woods [E-?≈H-5]; Bainbridge [E-7≈H-1]; Christiano et al. 2017 [B-16≈C-4];
  Constitutional AI [B-20≈C-8]; Santoni de Sio & van den Hoven [C-20≈D-13]; Green [C-21≈D-14];
  Elish [F-19≈D-16]. **Second-round additions:** Coactive Design [K-16≈M-5]; Joint Cognitive Systems
  [L-19≈M-3]; Norman 1990 [G-12≈M-15]; Endsley SA [E-12≈M-17≈Q-9]; Endsley & Kiris [E-13≈H-3≈Q-10];
  Parasuraman/Sheridan/Wickens [E-6≈M-18]; Logg et al. [C-16≈P-20]; Bellotti & Edwards [G-17≈Q-14];
  Nielsen progressive disclosure [G-16≈Q-22]; alert fatigue [H-12≈Q-30]; and several trust/bias
  results re-cited in V.Q (Parasuraman & Riley [F-2≈Q-17], Skitka 1999 [F-9≈Q-18], Bansal [F-20≈Q-20
  context], Buçinca [F-21≈Q-19]). These overlaps are themselves a finding: the same handful of
  results anchor trust, automation theory, scalable oversight, governance, teaming, and the loop
  episode, and the new delegation/mechanism clusters (J/K/N/O) corroborate them from outside AI.
