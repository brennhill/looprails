# Practical Loop Patterns

Choose a loop by its completion check and recovery path. The pattern is useful when those are clearer than “keep improving.”

| Task | Done-condition | Check | Failure to prevent |
|---|---|---|---|
| Fix tests | Required behavior passes without weakened tests | Trusted suite and diff review | Deleting assertions to gain a pass |
| Refactor | Behavior preserved and agreed structure improved | Regression tests and artifact review | Untested behavior changes |
| Clean data | Defined schema and quality constraints met | Assertions and sampled source comparisons | Silently dropping difficult rows |
| Run experiments | Protocol completed within budget | Versioned data, settings and results | Leakage or cherry-picking |
| Research | Claims supported by relevant sources | Citation and evidence review | Plausible but unsupported synthesis |
| Plan in simulation | Candidate meets modeled constraints | Simulation plus real-world validation | Trusting a wrong prediction |

## A common controller

Propose a bounded change, execute in an appropriate environment and check the result. Continue only when feedback supports another attempt. Stop on completion, unsafe behavior, budget exhaustion or lack of useful progress.

Record the initial state, completed steps and unresolved outcomes. A retry after a network timeout needs reconciliation before another effectful call.

## Keep the check honest

Protect evaluation data and critical rules from the agent optimizing against them. Use held-out examples and inspect failure slices. Subjective quality needs calibrated reviewers; executable checks need coverage analysis.

## Match autonomy to consequences

A reversible local artifact can permit more exploration. External disclosure, production changes or payments need stronger authority and execution limits. A successful verifier does not grant permission for an unrelated action.

The [reliability and agent references](codex-loops.html) provide the underlying patterns. Use the [done-condition template](kit.html), [verification guide](article-verification-functions.html) and [recovery guide](article-failure-recovery-agent-loops.html) to make a specific loop operational.
