# Build Evals for Agent Loops

An eval supports a decision: whether a change improves useful behavior enough to ship. Start with representative work, explicit outcomes and checks you can inspect.

## Separate the checks

| Check | Decision |
|---|---|
| In-run verifier | Is this artifact ready, or should this run continue? |
| Offline eval | How does a system perform across defined cases? |
| Release gate | Does the evidence meet the deployment criteria? |
| Production monitoring | Is real behavior drifting or causing harm? |

A strong local verifier does not establish product-wide reliability. A good offline score does not authorize an unsafe action.

## 1. Name the decision

Choose one product behavior and the consequence of failure. Define the baseline, acceptable trade-offs, prohibited effects and owner. Do this before choosing a metric.

Inspect real traces, artifacts and final state. Ask qualified reviewers for pass, fail or cannot tell, with evidence. Group repeated failures into a small taxonomy. Count frequency and consequence separately.

## 2. Turn failures into cases

Each case needs a goal, starting state, input, allowed variation, success criteria and unacceptable effects. A reviewer should be able to explain a verdict from the evidence.

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

Use production failures, routine traffic, expert scenarios and adversarial variants. Synthetic cases can fill combinations, but validate their realism. Include “should not act,” unavailable tools, missing evidence and escalation cases.

Keep three suites:

| Suite | Purpose |
|---|---|
| Capability | Explore difficult, useful behavior with room to improve |
| Regression | Protect previously solved cases and confirmed failures |
| Held-out audit | Detect overfitting and gaming on unseen variants |

A small initial set can reveal obvious failures. It cannot establish a rare critical-failure rate merely because no failure appeared.

## 3. Choose complementary graders

Use direct state checks, trusted tests and assertions where the claim is executable. Use source comparisons for factual support and calibrated rubrics for subjective quality. Check the strongest available evidence for the particular claim; no grader is universally strongest.

For an agent, evaluate:

- **Outcome:** requested state achieved and invariants preserved.
- **Trajectory:** permitted actions, reasonable cost and no hidden harmful effects.
- **Interaction:** useful clarification, accurate status and effective handoff.

A correct final sentence can conceal an unauthorized or incomplete action. Preserve tool calls, results and final environment state, with secrets redacted.

## 4. Calibrate subjective judgments

Have qualified reviewers label a representative sample. Resolve ambiguous criteria, inspect disagreements and allow UNKNOWN. Agreement alone is insufficient if reviewers share a blind spot.

A narrow factual-support rubric might be:

```
PASS: Each externally verifiable claim is supported by the supplied evidence.
FAIL: A claim is unsupported, contradicted or stronger than its source.
UNKNOWN: The evidence is insufficient to decide.
Ignore answer length and style. Return the verdict and supporting evidence.
```

Test known-good and known-bad cases, minimal pairs, long wrong answers, swapped comparison order and prompt injection in the graded artifact. Hide model identity where practical. Measure false passes and false fails by relevant slice, not only overall agreement.

Version the rubric, judge model and settings. Recheck against fresh human labels when tasks or models change.

## 5. Reproduce the environment

Record model, prompt, tools, retrieval corpus, harness, environment, resource limits and grader versions. Reset state between trials. Validate a reference solution to ensure the harness can recognize success.

[Anthropic’s infrastructure-noise analysis](https://www.anthropic.com/engineering/infrastructure-noise) shows why resource settings can affect measured coding-agent results. Treat them as experimental inputs.

Use repeated trials when consistency matters. Distinguish first-attempt success, at-least-one success across several attempts and success on every attempt. With independent identical trials and a 75% per-trial success probability, three consecutive successes have probability 0.75³, about 42%. Real trials may be correlated; report that assumption.

## 6. Compare changes as experiments

Evaluate baseline and candidate on the same cases and inspect paired differences. Report case and trial counts, uncertainty, critical failures, important slices, cost and latency per useful outcome.

Related cases are not independent. Use the task, user or source-document cluster when estimating uncertainty if several cases share it. The [statistical-evaluation research](https://www.anthropic.com/research/statistical-approach-to-model-evals) explains why naive error bars can mislead.

Do not hide severe failures behind an average. Define acceptable thresholds and minimum evidence before reviewing results. Investigate regressions in high-consequence slices even when the overall score improves.

## 7. Protect the evaluation

Keep held-out cases and critical grading rules outside the optimizing agent’s control. Check for changes to tests, expected state and measurement setup. Inspect successful traces for shortcuts.

Try to pass without accomplishing the task, then repair the loophole while confirming legitimate solutions still pass. Separate feedback used for optimization from independent release evidence where practical. Refresh leaked or saturated cases.

## 8. Close the production loop

| Cadence | Use |
|---|---|
| Local or PR | Fast assertions and a small regression set |
| Nightly or merge | Broader cases and repeated stochastic trials |
| Pre-release | Held-out audit, adversarial tests and targeted review |
| Production | Privacy-safe sampling, monitors and user outcomes |

Randomly sample routine traffic as well as complaints. Oversample changed and high-consequence slices, while keeping sampling weights clear. Turn confirmed important failures into regression cases and revisit the taxonomy.

Assign owners for alerts, stopping and rollback. Logging an incident afterward is not an execution cap.

## Start this week

Choose one release decision. Inspect a few dozen representative traces, encode the most useful cases, calibrate a small grader and compare one change with the baseline. Keep the traces and verdict evidence reviewable.

Before release, confirm that the dataset includes abstention and escalation, the graders have known failure modes, the environment is recorded, critical failures are visible and production monitoring has an owner.

[Current agent-evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) provides a broader implementation roadmap. The [research codex](codex-loops.html#ref-VER-1) covers verification and gaming. Use the [Kit](kit.html) to record the run’s contract and controls.
