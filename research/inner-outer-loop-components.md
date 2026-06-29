# Research: Components of Inner and Outer Agent Loops (and the Seam)

Verified research behind the LoopRails "two loops" model. Three focused web-research
passes, every source fetched and read directly (anti-fabrication: nothing here is from
memory or a search snippet alone unless flagged). Compiled 2026-06-29. Confidence flags
are preserved per component.

Model: an agent system runs as an **inner loop** (the agent acts, a verifier checks, a
controller decides retry/stop/select, fast and unattended) wrapped by an **outer loop**
(humans observe the output and sharpen the verifier and the goal, slow and deliberate).
The **seam** is the set of artifacts the outer loop produces and the inner loop consumes:
the verifier, the eval set, and the telemetry.

Note: the heavy deep-research harness failed on an API/infra problem mid-run, so this used
three focused general-purpose research agents instead.

---

## 1. Inner loop components (the automated cycle)

Source anchors (all fetched):
- ReAct, Yao et al. (2022) <https://arxiv.org/abs/2210.03629>
- Reflexion, Shinn et al. (2023) <https://arxiv.org/abs/2303.11366>
- Anthropic, "Building Effective Agents" <https://www.anthropic.com/research/building-effective-agents>
- Snell, Lee, Xu, Kumar (2024), test-time compute <https://arxiv.org/abs/2408.03314>
- Cobbe et al. (2021), verifiers / GSM8K <https://arxiv.org/abs/2110.14168>
- CoALA, Sumers, Yao, Narasimhan, Griffiths (2023) <https://arxiv.org/abs/2309.02427>
- 12-Factor Agents, Dex Horthy / HumanLayer <https://github.com/humanlayer/12-factor-agents>
- Anthropic, "Effective context engineering for AI agents" (Sep 2025) <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
- Inngest, "Durable Execution" (vendor blog, Feb 2026) <https://www.inngest.com/blog/durable-execution-key-to-harnessing-ai-agents>

1. **Generator / agent (model + reasoning).** The LLM that proposes the next reasoning
   step and action each iteration; reasoning traces let it plan and handle exceptions while
   acting. Source: ReAct; Anthropic "Building Effective Agents" (agents are "LLMs using tools
   based on environmental feedback in a loop"). VERIFIED.
2. **Prompt / context-window management (context engineering).** Curate the minimal,
   well-structured token set per turn; context is a finite "attention budget" subject to
   "context rot." Source: Anthropic "Effective context engineering"; 12-Factor, Factor 3
   "Own your context window." VERIFIED.
3. **Action space and tools.** The internal/external actions the agent can emit; tool calls
   are structured outputs that interface with environments and memory. Source: CoALA
   (internal vs external actions); Anthropic Agent-Computer Interface; 12-Factor, Factor 4
   "Tools are just structured outputs." VERIFIED.
4. **Capability scoping / bounding the action space.** Constrain what tools can do
   (sandboxing, minimal unambiguous tool sets) so the loop cannot compound errors or take
   unsafe actions. Source: Anthropic "Building Effective Agents" (guardrails, sandboxed
   testing, "potential for compounding errors"); Anthropic context engineering (avoid
   "bloated tool sets"). VERIFIED.
5. **Verifier / check inside the loop.** An explicit checker that scores or judges a
   candidate, separate from the generator, so progress is grounded not self-asserted. Source:
   Cobbe et al. 2021 (trained verifier ranks candidates); Snell 2024 (process-based verifier
   reward models); Reflexion ("Evaluator"); Anthropic (evaluator-optimizer pattern). VERIFIED.
6. **Act-observe grounding step (environment feedback).** After each action, pull ground
   truth from the environment (tool results, code execution) before the next decision.
   Source: Anthropic ("crucial for agents to gain 'ground truth' from the environment at each
   step"); ReAct (actions interface with external sources to reduce hallucination). VERIFIED.
7. **Control / decision policy: stop conditions and control flow.** The deterministic logic
   that decides retry / stop / continue, including hard stop conditions. Source: Anthropic
   ("stopping conditions (such as a maximum number of iterations)"); 12-Factor, Factor 8 "Own
   your control flow"; CoALA (generalized decision procedure). VERIFIED.
8. **Retry via reflection (self-correction).** On failure, generate a verbal self-reflection,
   store it in episodic memory, and retry. Source: Reflexion (reports 91% pass@1 on HumanEval
   per the abstract, vs prior SOTA 80%). VERIFIED.
9. **Selection among candidates (best-of-N, verifier-gated selection).** Sample multiple
   candidates and select the verifier's top-ranked one instead of trusting a single greedy
   generation. Source: Cobbe et al. 2021; Snell 2024 (best-of-N and beam-search variants,
   compute-optimal ">4x" more efficient than a best-of-N baseline). VERIFIED.
10. **Test-time compute allocation (compute-optimal).** Spend more inference compute on
    harder prompts; under FLOPs-matched comparison this can outperform a much larger model.
    Source: Snell et al. 2024 ("test-time compute can be used to outperform a 14x larger
    model"). VERIFIED.
11. **Working memory / execution state.** Short-term task state passed between steps; ideally
    the agent is a stateless reducer over an explicit state object. Source: CoALA (working vs
    long-term memory); 12-Factor, Factor 5 "Unify execution and business state" and Factor 12
    "Make your agent a stateless reducer." VERIFIED.
12. **Long-term / file-based memory and note-taking.** Persist knowledge outside the context
    window (notes, files, retrievable IDs), loaded just-in-time. Source: CoALA (long-term
    memory module); Anthropic context engineering (note-taking "persisted to memory outside
    the context window" + just-in-time retrieval). VERIFIED.
13. **Checkpoints / durable state / pause-resume.** Save complete state at meaningful steps
    so the loop can pause, resume, and replay from the last checkpoint. Source: 12-Factor,
    Factor 6 "Launch/Pause/Resume with simple APIs"; Inngest ("persist state at defined
    checkpoints and resume from those checkpoints after any failure"). VERIFIED.
14. **Recovery: retries with backoff, idempotency.** Handle transient failures with backoff
    while guaranteeing exactly-once side effects; compact errors back into context. Source:
    Inngest ("automatic retries" with "configurable backoff," each step "executes exactly
    once"); 12-Factor, Factor 9 "Compact Errors into Context Window." PARTIAL: retries/backoff
    and idempotency are directly verified; the term "rollback" is NOT in the sources (the
    verified mechanism is exactly-once/idempotency), and the strongest source here (Inngest)
    is a vendor blog.
15. **Escalate / human-in-the-loop.** When confidence or capability runs out, hand off to a
    human as an explicit action. Source: 12-Factor, Factor 7 "Contact humans with tool
    calls"; Anthropic ("meaningful human oversight"). VERIFIED.

**What distinguishes a good inner loop from a naive while-loop:**
- It closes on ground truth, not self-confidence (verifier + environment-feedback step;
  verifier-gated selection beats raw sampling: Cobbe 2021, Snell 2024).
- It decides and budgets compute rather than iterating until a flag flips (stop conditions,
  owned control flow, retry-with-reflection, selection, compute-optimal allocation).
- It treats state, memory, and recovery as first-class (context curation, memory outside the
  window, checkpoints, idempotent retries, escalation), so it survives failures and long
  horizons.

---

## 2. Outer loop components (the human refinement cycle)

Source anchors (all fetched):
- Braintrust, "What is LLM evaluation?" <https://www.braintrust.dev/articles/llm-evaluation-guide>
- Xia et al., "Evaluation-Driven Development and Operations of LLM Agents" <https://arxiv.org/pdf/2411.13768>
- Hamel Husain, "A Field Guide to Rapidly Improving AI Products" <https://hamel.dev/blog/posts/field-guide/>
- Hamel Husain, "Your AI Product Needs Evals" <https://hamel.dev/blog/posts/evals/>
- Hamel Husain, "Creating a LLM-as-a-Judge That Drives Business Results" <https://hamel.dev/blog/posts/llm-judge/>
- Shankar et al., "Who Validates the Validators?" (EvalGen, UIST 2024) <https://arxiv.org/abs/2404.12272>
- Andrew Ng, IEEE Spectrum (data-centric AI) <https://spectrum.ieee.org/andrew-ng-data-centric-ai>
- Agent Patterns, "Human-in-the-Loop Architecture" <https://www.agentpatterns.tech/en/architecture/human-in-the-loop-architecture>

1. **Production observation and online evaluation.** Sample live traffic and score it
   asynchronously, so real-world behavior is measured. Source: Braintrust (online eval =
   "scoring runs asynchronously on sampled requests"); EDD paper (online eval + runtime
   monitoring). VERIFIED.
2. **Error analysis (look at your data).** Manually read traces, annotate failures with
   open-ended notes, let categories emerge bottom-up. Source: Husain Field Guide ("the single
   most valuable activity in AI development"; the Nurture Boss case found date-handling failing
   66% of the time). VERIFIED.
3. **Annotation tooling / data viewer.** A custom interface that removes all friction from
   looking at data. Source: Husain ("You must remove all friction from the process of looking
   at data"; a custom data viewer is "the most important investment any AI team can make").
   VERIFIED.
4. **Review/triage queue and escalation (human-in-the-loop).** Route risky or low-confidence
   actions into an approval queue with full context. Source: Agent Patterns "Human-in-the-Loop
   Architecture" (approval gate, escalation ladder, confidence-based routing, audit trail);
   EDD paper (HITL review "at critical junctures"). PARTIAL: concept verified in the EDD
   paper; the escalation taxonomy is from a practitioner site, not peer-reviewed.
5. **Criteria/rubric definition and criteria-drift management.** Define "good" as binary
   pass/fail rubrics, and manage that grading outputs is what reveals the criteria. Source:
   Shankar et al. (names "criteria drift": "users need criteria to grade outputs, but grading
   outputs helps users define criteria"); Husain llm-judge (binary pass/fail over "uncalibrated
   scales like 1-5"). VERIFIED.
6. **Eval set / golden dataset that grows from failures.** Every observed production failure
   becomes a permanent dataset entry. Source: Braintrust ("A query that exposes a failure mode
   in production should be added to the golden set immediately"). VERIFIED.
7. **LLM-as-judge calibration against human labels.** Align the automated judge to a principal
   domain expert's labels and track agreement over time. Source: Husain llm-judge (align with a
   "principal domain expert," reaching ">90% agreement" after three iterations); Shankar et al.
   EvalGen. VERIFIED.
8. **The data flywheel (feedback into few-shot, fine-tuning, better data).** Turn findings and
   critiques into improved data, examples, or fine-tuning sets. Source: Andrew Ng / IEEE
   Spectrum (after error analysis, "more productive to hold the neural network architecture
   fixed, and instead find ways to improve the data"); Husain (critiques "detailed enough so
   that you can use it in a few-shot prompt"). VERIFIED.
9. **Online vs offline evaluation split.** Validate against curated datasets before deployment
   (offline), then score sampled live traffic after (online). Source: Braintrust; EDD paper.
   VERIFIED.
10. **Regression testing in CI.** Rerun the golden set on every change and block merges that
    drop quality below thresholds. Source: Braintrust ("Pull requests that would reduce quality
    below thresholds fail automatically"). VERIFIED.
11. **Drift detection.** Compare current eval scores against historical baselines to catch
    silent degradation, including upstream model drift with no code change. Source: Braintrust;
    EDD paper. VERIFIED.
12. **Ownership, cadence, and accountability.** Assign data review and standard-setting to a
    domain expert (a single principal sets the bar); repeat periodically or on material change.
    Source: Husain Field Guide (empower domain experts); llm-judge ("principal domain expert,"
    process "repeats periodically"). PARTIAL: expert ownership verified; explicit cadence is
    thinly supported.
13. **Experiment-based roadmap / capability refinement (intent clarity).** Refine the goal
    itself by treating direction as experiments and capability funnels. Source: Husain Field
    Guide ("experiment-based roadmaps," "capability funnels"). VERIFIED.

**What distinguishes a good outer loop:**
- It starts from real data, bottom-up (read production traces, let failure categories emerge;
  friction-free annotation makes it scale).
- It closes the loop permanently (every failure becomes a golden case and a regression test;
  critiques become few-shot or fine-tuning data).
- It keeps its automated graders honest (calibrate LLM-as-judge against a named expert, treat
  criteria drift as expected because criteria are discovered by grading, not specified upfront).

---

## 3. The seam and the platform (cross-cutting, shared)

The conceptual seam, owned by the outer loop and consumed by the inner loop: the **verifier**,
the **eval/golden set**, and the **telemetry**. The platform both loops run on:

Source anchors (all fetched from official docs/repos):
- NVIDIA NeMo Guardrails <https://github.com/NVIDIA-NeMo/Guardrails>
- Guardrails AI <https://guardrailsai.com/docs/concepts/validators>
- Meta Llama Guard 4 <https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Guard4/12B/MODEL_CARD.md>
- OpenTelemetry GenAI observability <https://opentelemetry.io/blog/2026/genai-observability/>
- OpenInference (Arize) <https://github.com/Arize-ai/openinference>
- Langfuse data model <https://langfuse.com/docs/observability/data-model>
- LangSmith observability <https://docs.langchain.com/langsmith/observability>
- Arize Phoenix tracing <https://arize.com/docs/phoenix/tracing/llm-traces>
- Temporal durable execution <https://docs.temporal.io/evaluate/understanding-temporal>
- LangGraph persistence <https://docs.langchain.com/oss/python/langgraph/persistence>
- Resilience4j circuit breaker <https://resilience4j.readme.io/docs/circuitbreaker>
- E2B sandboxes <https://github.com/e2b-dev/E2B>
- OWASP Top 10 for LLM Applications <https://owasp.org/www-project-top-10-for-large-language-model-applications/>
- Evidently <https://github.com/evidentlyai/evidently>

1. **NeMo Guardrails (NVIDIA).** Programmable input / output / dialog / retrieval / execution
   rails that reject or alter content into or out of an LLM app; plus self-check moderation,
   fact-checking, jailbreak/injection detection. VERIFIED.
2. **Guardrails AI.** Composable validators combined into Input and Output Guards; each
   returns PassResult/FailResult with an on_fail policy. The Hub hosts PII (Presidio),
   toxic-language, valid-JSON, regex validators. VERIFIED.
3. **Meta Llama Guard 4.** A 12B multimodal safety classifier that labels prompts and
   responses safe/unsafe against the MLCommons hazard taxonomy (14 categories, S1-S14).
   VERIFIED.
4. **OpenTelemetry GenAI semantic conventions.** A vendor-neutral standard for LLM/agent
   telemetry as spans and metrics (gen_ai.request.model, gen_ai.usage.input_tokens/output_tokens,
   finish_reasons; agent>chat>tool span hierarchy; operation.duration and token.usage metrics).
   VERIFIED (the conventions are still experimental/Development status, so attribute names may
   change).
5. **OpenInference (Arize).** An OpenTelemetry-complementary convention plus instrumentation
   for tracing AI apps (LLM calls, retrievals, tool use) across OpenAI, Anthropic, Claude Agent
   SDK, LangChain, LlamaIndex, CrewAI; works with any OTel backend. VERIFIED.
6. **Agent tracing/eval platforms (Langfuse, LangSmith, Arize Phoenix).** Trace/span backends
   that capture each run end to end (prompts, tool calls, latency, token cost, errors, feedback)
   and run evals. Langfuse: traces/observations/sessions, built on OpenTelemetry. LangSmith:
   trace-to-production metrics, dashboards, feedback annotation. Phoenix: retrieval/embedding/LLM
   spans with relevance scores, OTLP, open-source, runs locally. VERIFIED.
7. **Temporal (durable execution).** Runs long workflows to completion across crashes by
   replaying an event history; on worker crash it replays to recreate state and "resumes
   progress from the point of failure as if the failure never occurred." VERIFIED.
8. **LangGraph checkpointers / persistence.** Snapshots graph state at each step for pause,
   human-in-the-loop, time-travel, and fault tolerance; PostgresSaver for production. Caveat:
   checkpointing alone is not full distributed durable execution (no built-in lock/lease
   coordination). VERIFIED.
9. **Resilience4j Circuit Breaker.** A finite state machine (CLOSED, OPEN, HALF_OPEN, plus
   METRICS_ONLY/DISABLED/FORCED_OPEN) that trips OPEN when the failure rate crosses a threshold
   and rejects calls until it probes for recovery. The canonical circuit-breaker implementation.
   VERIFIED.
10. **E2B (sandboxing).** Runs AI-generated code in isolated, ephemeral cloud sandboxes (a
    fast, secure Linux VM per agent) so tool execution cannot touch the host. Apache-2.0.
    VERIFIED.
11. **OWASP Top 10 for LLM Applications - Excessive Agency.** The security baseline for bounding
    an agent: minimal tool scope, minimal permissions, and human approval/confirmation before
    high-impact actions. VERIFIED (the literal item number varies by version: LLM08 in v1.1,
    renumbered LLM06 in some 2025 sources; "kill switch" is our framing of OWASP's human-approval
    control, not an OWASP quote).
12. **Evidently (drift detection and monitoring).** Open-source library to evaluate, test, and
    monitor ML/LLM systems: 100+ metrics, 20+ statistical/distance tests for distribution shift,
    a Data Drift preset, LLM-judge evals, a monitoring UI. Apache-2.0. VERIFIED.

**The cross-cutting scaffolding a good loop needs:**
- Bound the agent at both edges (guardrails in/out, a safety classifier, least-privilege tools,
  human approval for high-impact actions, executed in isolation).
- Make every run observable on one shared standard (OTel GenAI / OpenInference span+metric shape,
  stored by Langfuse / LangSmith / Phoenix), so both the verifier and the humans have ground truth.
- Engineer for failure and recovery as first-class (durable execution, checkpoint/resume, circuit
  breakers, continuous drift/eval monitoring).

---

## 4. Synthesis (the decided takeaways)

- The components split into **inner (engineering), outer (process), and a shared seam.** The
  seam is real: the eval/golden set is written by the outer loop and run by the inner loop; the
  verifier is calibrated by the outer loop and gated by the inner loop.
- **You can buy almost the entire inner loop and the platform. You cannot buy the outer loop.**
  Generators, tracing, guardrails, sandboxes, and checkpointers are off the shelf. Error
  analysis, criteria definition, judge calibration, and golden-set curation are irreducibly
  yours, done by a domain expert. Spend scarce human time on the outer loop and buy the rest.
- **"Spec accretes from failures" has an academic name: criteria drift** (Shankar et al.). You
  cannot specify the criteria up front; grading outputs is what reveals them. This confirms the
  two-loops thesis.

Priority for building:
- Day one (minimum viable loop): done-condition, a verifier, caps/stop conditions, a sandbox, a
  kill switch, trace logging.
- As you scale the inner loop: selection (best-of-N), reflection-retry, file memory,
  checkpoint/resume, a circuit breaker. Mostly off the shelf.
- The thing teams skip and should not: the outer loop. The one habit to build first is error
  analysis with a friction-free data viewer, owned by a domain expert.

## 5. Honest flags

- OpenTelemetry GenAI conventions are experimental; attribute names may change.
- OWASP "Excessive Agency" is LLM08 in v1.1 and LLM06 in the 2025 list.
- The durable-execution/idempotency component leans partly on a vendor blog (Inngest);
  "rollback" specifically is our framing, not in those sources.
- The HITL escalation taxonomy (outer-loop component 4) is from a practitioner site, not
  peer-reviewed work.
- Outer-loop cadence/accountability (component 12) is the thinnest-sourced element.

Everything else is anchored in a source fetched and read directly.
