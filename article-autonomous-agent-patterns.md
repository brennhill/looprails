# Autonomous Agent Patterns

An autonomous agent checks the current state, chooses an action, uses a tool and examines the result. Give it clear limits and a way to tell when the task is complete.

## Common patterns

| Pattern | What it adds | Main limitation |
|---|---|---|
| ReAct | Alternates reasoning, actions and observations | Weak observations can reinforce a wrong path |
| Reflection | Critiques and revises a result | Self-critique without new evidence may not improve it |
| Plan and execute | Separates a proposed route from execution | Plans go stale as the environment changes |
| Tool use | Connects model decisions to external capabilities | Valid calls can still be wrong or unauthorized |
| Memory | Persists relevant facts and operational state | Stale or poisoned memory can mislead later turns |
| Multi-agent collaboration | Divides work and adds perspectives | Coordination costs and correlated errors |

The [agent-pattern references](codex-loops.html#ref-AP-1) describe these designs and their research context. None guarantees better results on every task.

## Use evidence for correction

Feed back concrete tool results, trusted tests or state checks. Do not ask the agent to keep reflecting until it sounds confident. If progress stalls or evidence is insufficient, stop within budget and escalate.

## Enforce authority outside the loop

Validate targets and arguments before execution. Restrict data, filesystem access, network destinations and credentials. Untrusted documents cannot authorize a new task.

Persist completed and uncertain effects so retries do not duplicate them. Propagate cancellation to all workers and scheduled steps.

## Compare before adding complexity

Use a fixed [workflow](article-agent-workflow-patterns.html) as the baseline where possible. Report task outcomes, critical failures, latency and cost across repeated trials. More planning or agents should solve an observed problem rather than become the default architecture.

Start with [build your first loop](article-build-agent-loop.html) and the [Loop Card](kit.html).
