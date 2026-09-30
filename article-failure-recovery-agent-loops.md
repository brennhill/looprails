# Recovery for Agent Loops

Before retrying, determine whether the previous action failed, succeeded or has an unknown outcome. A lost response after a successful payment is different from a request that never reached the service.

## Persist steps and effects

Record inputs, action identity, results and checkpoints. On restart, resume from known state rather than repeating the whole run. Record nondeterministic model calls and tool effects so replay does not execute them again.

[Durable-execution systems](codex-loops.html#ref-FR-1) provide this machinery, but you still need to design the external effects.

## Make retries safe

Use idempotency keys bound to the intended operation where the service supports them. For unknown outcomes, query the service’s authoritative state before retrying. Local deduplication alone cannot guarantee exactly-once effects across a network failure.

Retry transient faults with bounded attempts, backoff and jitter. Do not retry authorization failures or unsafe actions through another route. Preserve a run-wide budget.

## Separate correction from repetition

If the artifact is wrong, another attempt needs useful feedback from a trusted check. Asking the model to reconsider without new evidence can repeat or worsen the error. Validate the proposed correction before executing it.

## Plan compensation

Transactions can roll back supported changes. Sagas use compensating actions for distributed work, but compensation is not always a true undo. You cannot remove every delivered message or reverse every downstream consequence.

Quarantine runs that repeatedly fail. Preserve evidence for a human to inspect, and define who can resume them.

## Test recovery paths

Crash before execution, after commitment and before recording the result. Test duplicate requests, unavailable dependencies and cancellation during resume. Verify the resulting state, not only that the workflow restarted.

See [idempotent API guidance](codex-loops.html#ref-FR-9), [circuit breakers](article-circuit-breaker-ai-agents.html) and [Reversible](rail-reversible.html).
