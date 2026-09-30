# Circuit Breakers for AI Agents

A circuit breaker stops new work when a measured condition crosses a threshold. It protects the system while a dependency fails, a budget is exhausted or the agent repeats an unproductive action.

## Choose actionable signals

Useful triggers include repeated tool failures, elapsed time, spending, duplicate actions, policy violations and excessive affected records. Aggregate limits across the whole run, including child agents.

A flat verifier score can justify stopping, but only if the score is trustworthy. A self-reported confidence drop is not a reliable safety detector by itself.

## Use explicit states

| State | Behavior |
|---|---|
| Closed | Work proceeds within limits |
| Open | New work is blocked; preserve evidence and notify the owner |
| Half-open | A bounded probe tests whether the condition has recovered |

Traditional availability breakers can retry automatically after cooldown. Safety or authorization failures often need explicit reauthorization. Do not assume every breaker should self-reset—or that every transient failure requires a human.

## Enforce at execution

Put the check before the effectful tool call, outside the model. Fail closed when a required safety checker cannot run. A stop should reach workers, queues and scheduled retries. Already committed external effects need reconciliation or compensation.

Avoid a threshold that trips only after the permitted loss has already occurred. Combine per-action and cumulative caps. Measure false alarms as well as missed hazards.

## Test it

Simulate dependency failure, a lost response after success, many small payments and runaway retries. Verify that half-open probes cannot exceed the intended budget or replay a non-idempotent action.

The [reliability references](codex-loops.html#ref-FR-13) explain the circuit-breaker pattern. Use a [kill switch](article-ai-kill-switch.html) for deliberate operator intervention and [recovery discipline](article-failure-recovery-agent-loops.html) before resuming.
