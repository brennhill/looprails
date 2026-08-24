# How to Build Evals for AI Agent Loops

An agent loop generates, checks, and decides what to do next. The quality of that loop is bounded by the quality of its check. If the check rewards polish, the loop learns polish. If it checks the real outcome, the loop can improve the real outcome. Evals are how you discover, encode, and keep testing that difference.

This guide is about **product-specific evals**: tests of the AI system you are actually shipping, on the work your users actually ask it to do. It is not a leaderboard for comparing foundation models in isolation. It turns the principle in [evaluation-driven development](article-evaluation-driven-development.html) into a practical method.

The short version is one loop inside another:

> **Agent loop:** attempt → verify → retry or finish<br>
> **Eval loop:** observe → name failures → encode checks → calibrate → compare → learn

The inner agent loop makes the work. The outer eval loop improves both the worker and the verifier. A good eval suite is not a score you set up once. It is a living description of what your product is for, how it fails, and what evidence earns a release.

## First, know which kind of check you mean

Several different controls get called an “eval.” Keep them separate because they run at different times and answer different questions.

| Mechanism | When it runs | Question it answers | Example |
|---|---|---|---|
| **Eval** | Before release or on a schedule | Is this version better and reliable enough to ship? | Run 200 support scenarios against two prompt versions |
| **Verifier** | Inside the agent loop | Did this attempt complete the task? | Tests pass; reservation exists; claims have citations |
| **Guardrail** | At runtime, before or during an action | Is this action allowed? | Block a transfer above the agent's limit |
| **Monitor** | In production | Is the live system healthy or drifting? | Error rate, cost, latency, escalation rate |
| **Product metric** | In production or an experiment | Did users or the business get value? | Resolution rate, accepted edits, retained users |

The same check can appear in more than one place. A test suite can grade an offline eval and verify each attempt in a coding loop. A policy check can be both a grader and a runtime guardrail. The distinction is its job: **measurement tells you what happened; enforcement decides what is allowed.** Do not assume a high offline score is a runtime safety boundary.

## The eval-building loop

### 1. Start with the decision, not the metric

Write down what this eval will decide. “Measure quality” is too vague. Useful objectives name a decision and the population it applies to:

- choose between prompt A and prompt B for English-language billing questions;
- decide whether a new model can replace the current model without raising critical failures;
- prevent regressions in refund handling while improving first-contact resolution;
- decide whether an agent is reliable enough to run without per-step approval for a defined class of actions.

Then define the **unit of evaluation**. It might be one response, one tool call, a whole conversation, an end-to-end task, or the final state of an environment. For agents, a single response is usually too small. The task may look successful in prose while the real outcome is wrong: “Your flight is booked” is not proof that a reservation exists. Anthropic's agent-eval guidance separates the full transcript from the outcome for exactly this reason ([Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).

Finally, write the release rule before seeing the new result. For example:

> Ship only if no critical safety case regresses, the lower confidence bound on task success is at least 85%, no priority slice drops by more than 2 percentage points, and median cost per successful task stays below $0.12.

That rule prevents a team from moving the goalposts after it sees a flattering aggregate score.

### 2. Inspect real work before writing a rubric

Start with error analysis: read complete traces and note what failed, why it mattered, and what evidence would distinguish a good run from a bad one. Do not begin by asking an LLM to invent a universal “helpfulness, relevance, coherence” rubric.

Hamel Husain's AI Product Engineering notes make this the central lesson: rubrics written before looking at failures spend labeling effort on criteria that may never matter ([Automating Error Analysis](https://hamel.dev/notes/llm/ai-product-engineering/evals-error-analysis.html)). In one production case, two annotators agreed less often than chance; revising the rubric with pedagogical experts was necessary before the labels became usable ([Putting Evals Into Production](https://hamel.dev/notes/llm/ai-product-engineering/evals-production.html)). Shankar and colleagues call the underlying dynamic **criteria drift**: people need criteria to grade outputs, but seeing outputs is how they discover and refine those criteria ([Who Validates the Validators?](https://arxiv.org/abs/2404.12272)).

A practical review pass looks like this:

1. Sample real traces broadly across users, tasks, outcomes, and time.
2. Show the reviewer all context needed to judge: request, retrieved material, tool calls, state changes, output, and user feedback.
3. Ask for a simple overall judgment first: pass, fail, or cannot tell.
4. Require a short critique that points to evidence in the trace.
5. Group repeated critiques into a failure taxonomy.
6. Count frequency and consequence separately. A rare irreversible error can matter more than a frequent cosmetic one.
7. Revisit earlier traces whenever a new failure mode is discovered.

AI can reduce the mechanical work by clustering traces, finding similar cases, and proposing a taxonomy. Keep the domain expert in charge of what counts as failure. A 2026 comparison on 100 production traces found that the best automated analysis recovered 87.2% of human-labeled failures and found additional issues, but every system missed failures that required product context or taste ([Do Automated Evals Work?](https://parlance-labs.com/blog/posts/auto-evals/)). Use AI to accelerate inspection, not to outsource the definition of good.

### 3. Turn failures into a task dataset

An eval case is a small contract. It should contain enough information that two qualified reviewers can reach the same verdict for the same reason.

```yaml
id: refund_duplicate_charge_014
goal: Resolve a verified duplicate charge without refunding a valid charge
setup:
  customer_id: c_1842
  account_state: fixtures/refund_duplicate_charge_014.json
input:
  - user: "I was charged twice for order 7391. Please fix it."
success:
  must:
    - authenticate the customer before changing billing state
    - create exactly one refund for the duplicate transaction
    - leave the valid transaction unchanged
    - tell the customer the refund amount and expected timing
  must_not:
    - expose internal account data
    - promise a refund before the payment system confirms it
allowed_variation:
  - wording and tool-call order may differ
critical_failure:
  - refunds the valid transaction
  - refunds without authentication
graders:
  - final_database_state
  - policy_assertions
  - communication_rubric
tags: [billing, refund, duplicate-charge, high-consequence]
provenance: production_failure_2026_07_18
```

Build the dataset from several sources:

- **Production traces and support tickets** give you the real distribution and real failures.
- **Manual smoke tests** capture what the team already checks before every release.
- **Domain experts** supply important cases that have not appeared yet.
- **Synthetic cases** fill deliberate combinations of feature, scenario, persona, language, and risk. They are especially useful before launch, but validate that they resemble work the product will actually see.
- **Adversarial cases** try to trigger policy violations, grader loopholes, prompt injection, false tool success, and plausible-but-wrong answers.

Cover both sides of every behavior. If you only test when an agent should search, optimization produces an agent that always searches. Pair “should act” cases with “should abstain,” “should escalate” with “should not escalate,” and “relevant tool exists” with “no provided tool applies.” Anthropic recommends balanced problem sets because one-sided evals create one-sided optimization ([agent eval roadmap](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). The CheckList methodology makes the same idea systematic by crossing capabilities with test types; in its study, practitioners using the matrix wrote twice as many tests and found almost three times as many bugs ([Ribeiro et al., ACL 2020](https://aclanthology.org/2020.acl-main.442/)).

Keep three suites with different jobs:

| Suite | What belongs in it | Expected pass rate | Use |
|---|---|---:|---|
| **Capability** | Difficult, unsolved, high-value tasks | Low enough to leave room to improve | Hill-climb product capability |
| **Regression** | Previously solved tasks and confirmed production bugs | Near 100% | Block backsliding in CI |
| **Held-out audit** | Hidden and adversarial variants not used for tuning | Unknown | Detect overfitting and gaming |

When a capability becomes reliable, graduate its cases into regression. Keep some cases hidden from the team or agent that optimizes against them. Public development cases teach; held-out cases tell you whether the lesson generalized.

### 4. Choose the strongest grader available

Do not start with an LLM judge because the output contains language. Start with the closest thing to ground truth and move down the ladder only where necessary.

| Grader | Best for | Strength | Main failure |
|---|---|---|---|
| **Executable oracle** | Code, calculations, schemas, database or simulator state | Objective, reproducible, hard to persuade | The test can be incomplete or reachable by the agent |
| **Reference or evidence check** | Factual answers, extraction, retrieval, citations | Grounds the score outside the generator | References may be incomplete; semantic variants are brittle |
| **Rule or heuristic** | Format, policy, tool names, limits, latency, cost | Fast and cheap | Easy to overfit; can reward the surface |
| **LLM judge** | Tone, completeness, instruction following, open-ended quality | Flexible and scalable | Biased, non-deterministic, and itself needs evaluation |
| **Human expert** | Ambiguous, novel, high-stakes, taste-dependent work | Closest to actual requirements | Slow, costly, and not automatically consistent |
| **User outcome / A/B test** | Whether the product creates value | Measures the real-world goal | Slow and noisy; users see failures before you learn |

Use a **grader stack**, not one magic metric. A research agent might need exact-match on short factual answers, claim-to-source groundedness, coverage of required facts, source quality, and cost. A support agent might need a final-state database check, hard policy assertions, an interaction-quality judge, and a human audit sample. Official OpenAI evaluation guidance likewise recommends task-specific tests, production-shaped data, continuous evaluation, and human calibration rather than generic metrics alone ([Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)).

Two rules keep the stack honest:

1. **Hard requirements do not get averaged away.** If the agent leaked private data, a warm tone cannot compensate. Define must-pass gates for critical criteria, then score quality among the safe runs.
2. **Grade outcomes before paths.** Check the state the agent produced. Grade a particular tool or step only when that step is itself a requirement. Otherwise you will reject valid strategies the designer did not anticipate.

The [verification-functions guide](article-verification-functions.html) covers the full strength spectrum. Its core result is simple: route every criterion with a deterministic check to that check, and reserve model judgment for the genuinely subjective remainder.

### 5. Calibrate every subjective grader

An LLM judge is a model in production, not ground truth. The foundational MT-Bench work found that a strong judge could exceed 80% agreement with human preferences, but also documented position, verbosity, self-enhancement, and reasoning biases ([Zheng et al., NeurIPS 2023](https://arxiv.org/abs/2306.05685)). G-Eval improved correspondence with human ratings by using explicit criteria and structured scoring, while also observing a bias toward LLM-generated text ([Liu et al., EMNLP 2023](https://arxiv.org/abs/2303.16634)). “Good enough to scale” therefore means calibrated on your data, not trusted in general.

Build a human gold set:

1. Have the principal domain expert label representative passes, failures, borderline cases, and adversarial examples.
2. For consequential work, have a second expert independently label a subset.
3. Reconcile disagreements by fixing the task, the rubric, or the definition of good. Do not automatically majority-vote real ambiguity out of existence.
4. Run the candidate grader blind against the gold set.
5. Inspect a confusion matrix by failure mode and user slice, not just total agreement.
6. Choose thresholds from the cost of errors. A safety gate usually values low false-pass rate; a discovery filter may value recall.
7. Recalibrate when the judge model, prompt, product, task distribution, or policy changes.

A useful judge prompt isolates one criterion and asks for evidence:

```text
You are grading one criterion only: factual support.

PASS: Every externally verifiable claim in the answer is supported by the
provided sources, and the cited source entails the claim.
FAIL: At least one claim is unsupported, contradicted, or stronger than its source.
UNKNOWN: The supplied trace does not contain enough information to decide.

Ignore writing style and answer length. Do not reward extra detail.
Return JSON with: verdict, unsupported_claims, evidence.
```

Prefer binary labels or pairwise comparisons for a concrete criterion over an unexplained 1–10 “quality” score. When comparing A and B, swap their order and treat inconsistent judgments as uncertainty. Blind model identity. Give the judge a reference or source material when available. Allow `UNKNOWN`; forcing a verdict manufactures confidence. If one rubric contains five dimensions, run five isolated judgments so one attractive quality does not bleed into the rest.

Test the grader itself with:

- known-good and known-bad examples;
- minimal pairs where only the target property changes;
- long but wrong versus short but correct answers;
- swapped answer order;
- output from the judge's own model family and other families;
- prompt-injection text inside the artifact being graded;
- cases with missing context where the correct answer is `UNKNOWN`;
- legitimate alternative solutions the first reference did not anticipate.

Track precision, recall, false-pass rate, false-fail rate, and per-class coverage. Agreement is useful but not sufficient: two reviewers can consistently share the same blind spot. The goal is not to make a judge imitate labels at any cost; it is to know where its decisions are safe to rely on and where a person still needs to look.

### 6. Evaluate the whole agent, not only its final sentence

Agents add three sources of difficulty: they act over many turns, change an environment, and vary from run to run. Your harness should reproduce the production system closely enough that the result means something.

For every trial, capture:

- the task and initial environment;
- model, prompt, tool, retrieval, and harness versions;
- the complete trace: messages, tool calls, results, handoffs, and guardrails;
- the final environment state and user-facing output;
- grader results with evidence;
- turns, tokens, latency, cost, retries, and errors.

Run trials from clean, isolated state. Shared files, caches, database rows, network flakiness, and resource exhaustion create correlated results and can let one trial leak answers into another. Provide a reference solution that passes every grader; it proves both that the task is solvable and that the harness can recognize success.

Evaluate at three layers:

1. **Outcome:** Was the requested state achieved, and were invariants preserved?
2. **Trajectory:** Did the agent use prohibited actions, loop, ignore contradictory evidence, or take an unreasonable cost to succeed?
3. **Interaction:** Did it clarify when needed, keep the user informed, hand off correctly, and communicate uncertainty?

Outcome is primary. Trajectory and interaction explain why apparently equal outcomes differ in safety, efficiency, and user experience. OpenAI's current agent guidance begins with complete traces to discover workflow failures, then moves to repeatable datasets once “good” is understood ([Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals)).

Because the agent is stochastic, run more than one trial when reliability matters. Report the metric that matches the product:

- **pass@1**: chance the first attempt succeeds;
- **pass@k**: chance at least one of *k* attempts succeeds, useful when trying several candidates is allowed;
- **pass^k**: chance all *k* attempts succeed, useful when users expect consistent behavior every time.

An agent that succeeds 75% of the time has only about a 42% chance of succeeding three times in a row. A best-of-many demo and a dependable product are different claims.

### 7. Compare changes as experiments

Do not read two aggregate scores and declare the larger one the winner. Use the same cases for both variants and analyze the **paired difference** case by case. Run enough trials to separate a real improvement from sampling noise.

At minimum, report:

- number of cases and trials;
- score and 95% confidence interval;
- paired change from the current production baseline;
- results by important task, risk, language, customer, and difficulty slices;
- critical-failure count;
- cost and latency per successful task, not only per attempt;
- grader version and human-calibration results.

Related cases are not independent. Ten questions about the same document carry less information than ten questions about different documents. Cluster uncertainty at the task, conversation, customer, or source-document level when cases share that unit. Anthropic's statistical work found clustered standard errors more than three times as large as naive ones on some popular evals, and recommends confidence intervals, repeated samples, paired analysis, and power calculations ([Adding Error Bars to Evals](https://www.anthropic.com/research/statistical-approach-to-model-evals)).

Avoid hiding tradeoffs in one weighted average. Show the quality frontier: accuracy, critical errors, latency, and cost. Then encode the business decision explicitly. “Quality improves by 1.8 points” is incomplete if cost doubles or the improvement comes from one easy slice while a high-consequence slice regresses.

### 8. Put evals into the delivery loop

Use different suite sizes at different speeds:

| Cadence | Suite | Purpose |
|---|---|---|
| **Local / pull request** | Fast deterministic checks plus a small regression smoke set | Catch obvious failures in minutes |
| **Merge / nightly** | Full regression and capability suites, repeated stochastic trials | Compare quality, reliability, cost, and latency |
| **Pre-release** | Held-out audit, red team, and targeted human review | Check generalization and high-consequence failures |
| **Production** | Sampled trace review, monitors, feedback, and controlled A/B tests | Find drift and failures the suite did not imagine |

Store the result as a versioned artifact. You should be able to answer exactly which agent, dataset, environment, grader, and judge produced a release decision. A dashboard without inspectable cases is not enough; keep the traces and the grader evidence so a person can explain every important movement.

Production closes the loop:

1. Log complete, privacy-safe traces and outcomes.
2. Randomly sample routine traffic so the team sees ordinary behavior, not only complaints.
3. Oversample high-risk, low-confidence, novel, and changed slices for faster discovery.
4. Review samples with domain experts.
5. Turn every confirmed important failure into a regression case.
6. Update the taxonomy and rebalance the dataset as traffic changes.
7. Periodically audit automated graders against fresh human labels.

Automated evals, production monitoring, A/B tests, user feedback, and human review are complementary layers. No one layer establishes the whole truth. An offline suite lets you iterate before users are exposed; production tells you where the offline model of the world was incomplete.

## Design the product to create checkable evidence

Sometimes “this is hard to eval” means the product returns an artifact that is also hard for a user to trust. A data agent that emits only a number makes the user redo the analysis. A medical agent that emits a fifty-page report makes a doctor re-read the chart. The better product exposes provenance, assumptions, contradictions, intermediate calculations, and smaller units that can be accepted or rejected.

That design work improves both human oversight and automated evals. A cited claim can be checked for entailment. A diff against a trusted plan can be reviewed change by change. A database state can be compared to an expected state. Hamel's examples make this connection explicit: design the product for verification before trying to build a clever grader ([“It's Hard to Eval” Is a Product Smell](https://aieng.community/blog/eval-smell)).

Ask four questions:

1. What does an expert actually inspect before trusting this result?
2. What trusted artifact can the result be compared against?
3. What evidence, provenance, or intermediate state can the system preserve?
4. Can a large opaque output become smaller checkable claims, edits, or actions?

This is where eval design and LoopRails' **Show** move meet. Evidence that helps a grader also helps a person make a real decision instead of rubber-stamping a persuasive answer.

## Harden the eval against gaming

The agent, prompt optimizer, or training process will search for the cheapest path through whatever you measure. Treat the grader as attack surface.

- Keep a held-out set the optimizer never sees.
- Separate the signal used to improve the system from the final audit where practical.
- Prevent the evaluated agent from editing tests, expected state, judge prompts, or logs.
- Check invariants outside the agent's writable environment.
- Add canary cases and verify that they fail when the grader is deliberately broken.
- Ask an adversarial solver to pass without accomplishing the task; patch each loophole and confirm legitimate solutions still pass.
- Refresh tasks when the suite saturates or leaks into prompts and training data.
- Read successful traces. A passing score can hide a loophole, brittle shortcut, or unfair task.
- Measure false passes directly. Soundness matters more than accepting every creative good answer when the action is high consequence.

This is Goodhart's law in operational form. Optimizing a proxy too hard eventually degrades the real goal; reward-model overoptimization has been measured directly ([VER-7](codex-loops.html#ref-VER-7)). Recent adversarial work found 16% of tasks across five agent benchmarks hackable from the description alone, then used hacker–fixer loops to drive held-out exploit success to zero on one benchmark ([VER-9](codex-loops.html#ref-VER-9)). Your eval needs its own red team.

## A minimum viable eval you can build this week

Do not wait for a perfect platform or hundreds of cases. Start with 20–50 tasks; that range is enough to catch large early changes, according to Anthropic's agent-eval roadmap. A spreadsheet, a script, and a trace viewer are sufficient.

### Day 1: define and inspect

- Name one release decision.
- Collect 30 representative traces or manual scenarios.
- Have the product owner and a domain expert review them.
- Write critiques and a first failure taxonomy.

### Day 2: encode

- Turn the most consequential and frequent failures into cases.
- Add paired positive and negative cases.
- Write deterministic outcome checks first.
- Add one narrow judge only for the subjective criterion that remains.

### Day 3: calibrate

- Label a gold sample independently.
- Test the graders on known passes, failures, and minimal pairs.
- Inspect false passes and false failures.
- Fix ambiguous tasks and rubrics.

### Day 4: compare

- Run the current system and one proposed change on identical cases.
- Repeat stochastic tasks.
- Review paired differences and critical failures.
- Record quality, cost, and latency.

### Day 5: operate

- Put the regression smoke set in CI.
- Schedule the larger suite.
- Add trace and grader versioning.
- Assign one owner for suite health.
- Set a weekly production-trace review.

The first suite will be incomplete. That is expected. Its job is to replace “this feels better” with a repeatable learning loop, then become more faithful every time reality surprises you.

## The eval review checklist

Before trusting a suite, ask:

### Objective and cases

- Does the eval drive a named product or release decision?
- Is the unit a response, trajectory, outcome, or complete task—and is that the right unit?
- Did the criteria come from real traces and domain experts?
- Does the dataset resemble production and include edge, adversarial, and should-not-act cases?
- Are capability, regression, and held-out audit cases separate?
- Can a reference solution pass every task?

### Graders

- Is each criterion using the strongest available grader?
- Are hard safety and correctness requirements must-pass gates?
- Does the suite grade end state before prescribing a path?
- Are LLM judges narrow, structured, evidence-seeking, and allowed to abstain?
- Were subjective graders calibrated against fresh expert labels?
- Do you know their false-pass rate by important failure mode?

### Experiment

- Are variants run on the same cases and comparable environments?
- Are stochastic tasks repeated?
- Are uncertainty, paired changes, and important slices reported?
- Are cost and latency reported per successful outcome?
- Is the release rule written before the result is inspected?

### Operations

- Are dataset, prompt, model, harness, environment, and grader versions recorded?
- Can someone inspect the trace and evidence behind a score?
- Do confirmed production failures become regression cases?
- Is the suite checked for saturation, contamination, drift, and grader gaming?
- Is a named team responsible for maintaining it?

## Research behind this guide

This synthesis starts with Hamel Husain's [AI Product Engineering notes](https://hamel.dev/notes/llm/ai-product-engineering/index.html), especially the sessions on [error analysis](https://hamel.dev/notes/llm/ai-product-engineering/evals-error-analysis.html), [production evals](https://hamel.dev/notes/llm/ai-product-engineering/evals-production.html), [data-agent benchmarks](https://hamel.dev/notes/llm/ai-product-engineering/evals-data-agents.html), and [search-agent evaluation](https://hamel.dev/notes/llm/ai-product-engineering/context-search-agents.html). The wider evidence base includes:

- **Product workflow and error analysis:** Husain's [Field Guide to Rapidly Improving AI Products](https://hamel.dev/blog/posts/field-guide/), Husain and Shankar's [LLM Evals FAQ](https://hamel.dev/blog/posts/evals-faq/), and Saha and Husain's production comparison, [Do Automated Evals Work?](https://parlance-labs.com/blog/posts/auto-evals/).
- **Criteria drift and validator alignment:** Shankar et al., [Who Validates the Validators?](https://arxiv.org/abs/2404.12272), which treats evaluator design as an iterative human–AI alignment problem.
- **Agent evaluation:** Anthropic's [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) and OpenAI's official [agent workflow evaluation guide](https://developers.openai.com/api/docs/guides/agent-evals).
- **Behavioral coverage:** Ribeiro et al., [CheckList](https://aclanthology.org/2020.acl-main.442/), and Liang et al., [HELM](https://arxiv.org/abs/2211.09110), which argue for evaluation across capabilities, scenarios, metrics, and perturbations rather than one accuracy number.
- **Model judges:** Zheng et al., [MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685); Liu et al., [G-Eval](https://arxiv.org/abs/2303.16634); and the position-bias study by Shi et al., [Judging the Judges](https://arxiv.org/abs/2406.07791).
- **Measurement under noise:** Anthropic's [Adding Error Bars to Evals](https://www.anthropic.com/research/statistical-approach-to-model-evals), covering confidence intervals, clustering, repeated samples, paired differences, and power.
- **Benchmark limits:** Anthropic's [Challenges in evaluating AI systems](https://www.anthropic.com/research/evaluating-ai-systems), including contamination and sensitivity to seemingly minor formatting changes.
- **Verifier strength and gaming:** Part 7 of the [Loop Engineering Codex](codex-loops.html#part-7-verification-functions-and-the-spec), with the primary research on executable oracles, process and outcome verification, reward hacking, verifier ensembles, hidden checks, and adversarial hardening.

The sources converge on the same design: look at real behavior, let domain experts define failure, encode the strongest check each criterion permits, validate every proxy against human and real-world outcomes, report uncertainty, and keep learning from production. That is not evaluation after the loop. It is how a good loop becomes good.
