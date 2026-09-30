# What to Monitor in an Agent Loop

Monitor progress, effects and resource use. A loop can spend more while accomplishing less, or produce a good-looking answer after changing the wrong state.

| Signal | What it can reveal | Response |
|---|---|---|
| Turns, elapsed time and spend | Runaway or unexpectedly expensive work | Enforce caps |
| Tool failures and repeated calls | Dependency failure or a stuck strategy | Back off, stop or escalate |
| Artifact or verifier changes | Progress, regression or check gaming | Inspect evidence |
| Affected records and external actions | Growing cumulative consequences | Apply aggregate limits |
| Context usage and compaction | Lost constraints or excessive overhead | Restore relevant state |
| Stop latency and orphaned work | Incomplete cancellation | Repair execution controls |

## Use trustworthy progress signals

A model’s confidence or fluent status report is weak evidence. Prefer changes in tested state, completed artifacts and verified milestones. If quality is subjective, calibrate the grader and inspect disagreements.

“No score improvement” can justify a bounded stop, but it is not a universal diagnosis. The task may require intermediate work that does not immediately change the score.

## Put limits before effects

Budget checks belong before execution, including planned expensive calls. A dashboard that reports yesterday’s overspend is not a cap. Share limits across child agents and retries.

## Preserve useful records

Log action identity, target, outcome, evidence and remaining budget. Redact secrets and control retention. Distinguish completed, canceled and uncertain external effects.

Test alerts against realistic failures and measure their false-positive rate. Assign an owner and a safe fallback when nobody responds.

The [durable-execution references](codex-loops.html#ref-FR-1) cover operational state; the [evals guide](evals.html) covers performance monitoring. Use the [health-signals template](kit.html#5-the-loop-health-signals) to record thresholds.
