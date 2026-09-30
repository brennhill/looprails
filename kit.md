# The LoopRails Kit

Five templates to plan an agent loop, set its limits and track its results. Copy them into your project and name an owner. The [framework](framework.html) defines the grades; the [starter](https://github.com/brennhill/looprails/tree/main/starter) provides a small runnable example.

## 1. The Done-Condition Spec

Separate the desired result from the evidence used to check it. The agent’s claim is not enough.

```
Loop name and owner:
Goal:
Permitted scope:
Done when:
Verified by (tests, state checks, calibrated review):
Check coverage and known blind spots:
Definitely not done if:
Maximum turns / time / spend:
On timeout or unsafe behavior:
```

For a test-fixing loop, require the trusted suite to pass in a clean environment and inspect any test changes. Unchanged test count alone cannot detect weakened assertions.

## 2. The Loop Card

Record one card per loop. Update it when capabilities, environment, checks or limits change.

```
Loop name and accountable owner:
Purpose and intended users:
Inputs and data sensitivity:
Outputs and destinations:
Actions with consequence grades (G0–G3):
Limits on combined effects:
Who may authorize each action, and when approval is required:
Completion checks and their coverage:
Environment, filesystem and network restrictions:
What credentials allow and when they expire:
Maximum turns / time / spend:
What the stop reaches and how long it takes:
Recovery path and irreversible effects:
State, evidence and audit records with sensitive data protected:
Known failure modes:
Last reviewed, by whom, and system versions:
```

A read can expose data, and tests can execute code. Grade actual effects using [the rule](framework.html#2-grade-the-action), not fixed labels for commands. A code merge may be G2; an irreversible critical deployment may be G3.

## 3. The Guardrails Checklist

Check these controls before giving the agent access.

- [ ] Goal, permitted actions and completion checks are explicit.
- [ ] Trusted checks and held-out cases are protected from the optimizing agent.
- [ ] Filesystem, network and credentials match the task’s authority.
- [ ] Isolation is an execution boundary; a worktree alone is not a sandbox.
- [ ] Turn, time, spend and limits on combined effects run before actions.
- [ ] Consequential actions have appropriate authorization and evidence a reviewer can inspect.
- [ ] Approval is bound to exact targets, arguments and artifact versions.
- [ ] Cancellation reaches workers, queues and checkpoint resume.
- [ ] Recovery is tested; irreversible and uncertain effects are documented.
- [ ] Secrets are redacted before logs and tool output reach model context.
- [ ] Restart reconciles uncertain external effects before retrying.
- [ ] Alerts and escalations have an owner and safe fallback.

A second model reviewer is useful only within its evaluated coverage. It does not supply independent authority or guaranteed correctness.

## 4. The Model Adaptation Worksheet

Identify the failure before choosing a remedy. LoRA is a fine-tuning method; hosted APIs may offer managed fine-tuning without exposing weights.

```
Observed failure and representative cases:
Current model, provider, version and settings:
Baseline quality / critical errors / latency / cost:
Hypothesis:
Candidate change:
  instructions / retrieval / tools / harness
  managed fine-tuning / adapter / full tuning / continued pretraining
Weight access, license and provider support:
Training-data origin and permissions:
Held-out evaluation and regression slices:
Deployment and maintenance costs:
Result against baseline:
Rollback and revalidation plan:
```

Use [model adaptation](article-lora-vs-fine-tuning-vs-pre-training.html) and [weight-access trade-offs](article-adapting-models-you-dont-control.html) for the decision. Adaptation does not replace execution controls.

## 5. The Loop Health Signals

Set thresholds and owners before running. A score trend helps only if the score is meaningful; some tasks make progress before the final score changes.

```
Signal / source / threshold / response / owner:
Turns and elapsed time:
Spend and cost per useful outcome:
Verified progress and repeated-action count:
Tool failures and retry count:
Affected records and external-action total:
Context usage and compaction:
Approvals, false blocks and missed hazards:
Stop reason and cancellation latency:
Final outcome: complete / incomplete / unsafe / uncertain
```

Test thresholds with forced failures and measure false alarms. Distinguish completed actions from submitted requests whose outcome is unknown. See [loop health](article-loop-health-monitoring.html) and [evals](evals.html).
