# Human-in-the-Loop for Deployments

A release approval chooses whether to deploy. Canary checks, rollout limits and rollback determine what happens if that choice is wrong.

## Grade the actions

These are starting points. Data sensitivity, reversibility and cumulative impact can raise the grade; the [framework](framework.html#2-grade-the-action) defines the rule.

| Action | Starting grade | Control |
|---|---|---|
| Build and test in isolation | G0–G1 | Keep secrets and production access separate. |
| Deploy to a disposable preview | G1 | Limit access and resources. |
| Change a shared service | G2 | Stage the rollout and review evidence. |
| Run an irreversible production migration | G3 | Use a rehearsed, separately authorized procedure. |

## Set the boundaries

Use gradual rollout, health checks and automatic stop thresholds. Protect release credentials and require the approved artifact to match the deployed artifact. Code rollback may not reverse a data migration or an external action.

## Make review useful

Show the diff, artifact identity, test results, migration plan and recovery limits. Set an owner and a decision deadline. A large unreadable diff needs smaller releases or better evidence.

## Test the workflow

Inject a failing health check, partial rollout and non-reversible migration. Verify that rollback uses a known working artifact and that dependent jobs stop. Measure how much traffic can be affected before detection.

[Infrastructure-noise research](https://www.anthropic.com/engineering/infrastructure-noise) shows why environment settings belong in agent evaluations. Pin and record the environment used to produce release evidence.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
