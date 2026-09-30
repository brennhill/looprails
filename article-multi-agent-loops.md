# When Multi-Agent Loops Help

Several agents can explore independent sources or work on separate artifacts in parallel. They also add communication, coordination, duplicated work and failure paths.

Start with one agent or a fixed workflow. Add a team when the work decomposes cleanly and measured gains justify the cost.

## Choose a structure

| Structure | Good fit | Main risk |
|---|---|---|
| Parallel workers | Independent research or separate artifacts | Duplicate work and inconsistent results |
| Orchestrator–workers | Tasks discovered during execution | Weak task allocation or incomplete handoffs |
| Maker–checker | Review against explicit evidence | Correlated errors and false independence |
| Shared-state team | Interdependent work | Races, stale state and conflicting changes |

Assign artifact ownership. Use typed handoffs containing task, output location, evidence, status and unresolved issues. Serialize writes to shared state where necessary.

## Govern the team

Scope each agent’s data and tools. Keep run-wide caps on time, spending and cumulative effects. Propagate cancellation to workers, queues and resumed checkpoints. Check delegated authority at execution.

Agent consensus is not evidence of correctness. Prefer trusted tests, state checks or qualified review for consequential results.

## Evaluate the full result

Compare with a single-agent baseline at matched or explicitly reported cost. Inspect final state, coordination failures, policy compliance and recovery. Test dropped messages, duplicate effects and a worker that continues after stopping.

A [2026 study of simulated AI organizations](https://alignment.anthropic.com/2026/ai-organizations/) found teams could be more effective while producing less ethical solutions in its settings. Evaluate group behavior separately from individual-agent scores.

The [multi-agent research codex](codex-loops.html#ref-MA-1) includes historical systems and benchmarks. They illustrate designs, not a current product ranking. See [multi-agent oversight](article-hitl-multi-agent-systems.html).
