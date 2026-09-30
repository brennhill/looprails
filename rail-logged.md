# L: Logged

Keep enough evidence to reconstruct a consequential action: what was proposed, who authorized it, what executed and what state resulted. Logging supports investigation; it does not prevent an unsafe action by itself.

## Record the decision and effect

For each consequential action, retain an action and run ID, person or service that started the request, agent or worker identity, target, permitted scope, relevant arguments, approval decision, tool outcome and recovery status.

Record evidence locations and system versions rather than duplicating every sensitive payload. Distinguish completed, canceled and uncertain outcomes. A tool’s “success” message may need verification against the actual service state.

## Protect the record

Redact secrets before tool output enters logs or model context. Scope access, define retention and deletion rules, and preserve tamper evidence where the consequences justify it. Agent-generated text alone is weak evidence if the agent can rewrite it.

Use executor or service records for effectful calls. Tie child-agent actions to the originating task and delegation chain. A new worker ID should not erase responsibility or scope.

## Log without leaking

A [2026 study of agent skills](https://arxiv.org/abs/2604.03070v2) identifies debug output fed into model context as a credential-exposure path. Inspect both normal and failure output with mock secrets. Restricting network access does not prevent disclosure in an allowed final answer or retained log.

## Use the evidence

Audit missed hazards, false blocks, approval drift, stop latency and repeated failures. Sample routine traffic as well as incidents. Turn confirmed failures into regression cases and refresh subjective graders against qualified labels.

Test whether an investigator can distinguish an authorized action from a stale approval, a duplicate execution and a forged result. See [evals](evals.html), [Authorized](rail-authorized.html) and the [Loop Card](kit.html).
