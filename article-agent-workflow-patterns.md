# Agent Workflow Patterns

A workflow follows developer-defined control flow. An agent chooses some steps at runtime. Use predictable workflows when they meet the need; flexibility adds uncertainty and operational cost.

[Anthropic’s design guidance](https://www.anthropic.com/engineering/building-effective-agents) describes five useful workflow patterns. Choose them by the failure they address.

| Pattern | Use when | Failure to watch | Control |
|---|---|---|---|
| Prompt chaining | A task has clear sequential stages | An early error contaminates later steps | Validate each intermediate artifact |
| Routing | Inputs need different specialist paths | Wrong classification sends work to the wrong tool | Evaluate routing, including unknown cases |
| Parallelization | Work divides into independent parts | Duplicate work or conflicting outputs | Assign ownership and reconcile evidence |
| Orchestrator–workers | Subtasks emerge during work | Poor delegation or incomplete handoffs | Use explicit task contracts and budgets |
| Evaluator–optimizer | Feedback can improve an artifact | Endless revision or grader gaming | Cap attempts and protect independent checks |

## Start with a baseline

Try a single call or deterministic pipeline first. Record where it fails. Add a pattern only if representative cases show better useful outcomes at an acceptable latency and cost.

## Make boundaries explicit

Use structured outputs where downstream code needs reliable fields. Validate schemas and meaningful constraints; valid JSON can still contain a wrong amount or unauthorized destination.

Persist stage results and avoid replaying committed effects after a crash. Keep execution permissions separate from the model deciding which stage comes next.

## Test each transition

Include missing inputs, malformed outputs, routing uncertainty, unavailable workers and cancellation. Evaluate the final artifact and state, not only each component in isolation.

Use [autonomous-agent patterns](article-autonomous-agent-patterns.html) when fixed control flow is insufficient, and the [evals guide](evals.html) to compare designs.
