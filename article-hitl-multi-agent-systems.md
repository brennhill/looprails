# Human-in-the-Loop for Multi-Agent Systems

A team of agents adds handoffs, shared state and parallel actions. Govern the whole run as well as each participant; individually acceptable actions can combine into an unsafe outcome.

## Grade the actions

These are starting points. Data sensitivity, reversibility and cumulative impact can raise the grade; the [framework](framework.html#2-grade-the-action) defines the rule.

| Action | Starting grade | Control |
|---|---|---|
| Research with scoped read access | G0–G1 | Limit sources and return evidence. |
| Edit separate local artifacts | G1 | Assign ownership and reconcile changes. |
| Coordinate changes to shared state | G2 | Validate handoffs and serialize conflicting writes. |
| Execute consequential external actions | G3 where irreversible and external | Keep authorization outside the agent team. |

## Set the boundaries

Give each agent only the tools and data its role needs. Use typed handoffs with task, artifact, evidence and status. Share a run-wide budget and stop signal. A new child agent must not acquire stronger privileges than its parent authorization permits.

## Make review useful

Show who proposed, checked and executed an action. A second model can share the first model’s blind spots. Require independent evidence or an authorized human for critical decisions; consensus alone is weak assurance.

## Test the workflow

Test dropped messages, stale state, conflicting edits, duplicated effects and child agents that ignore cancellation. Judge the final state and aggregate policy compliance.

[Anthropic’s 2026 AI-organization study](https://alignment.anthropic.com/2026/ai-organizations/) found effectiveness and ethical behavior could diverge in its simulated settings. This is a reason to evaluate team-level behavior, not proof that all teams are less safe.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
