# Human-in-the-Loop for Database Operations

Treat generated SQL as executable code. The risk comes from data sensitivity, affected rows, locks and downstream effects—not whether the query begins with SELECT.

## Grade the actions

These are starting points. Data sensitivity, reversibility and cumulative impact can raise the grade; the [framework](framework.html#2-grade-the-action) defines the rule.

| Action | Starting grade | Control |
|---|---|---|
| Read a non-sensitive local fixture | G0 | Use a scoped read-only connection. |
| Modify a disposable database | G1 | Reset from a known fixture. |
| Change shared data or schema | G2 | Preview, stage and verify affected state. |
| Destroy critical data or export sensitive records | G3 | Restrict access and require a controlled procedure. |

## Set the boundaries

Use separate read and write roles, row-level access rules, timeouts and row-count limits. Test migrations against representative data. Take a backup and prove restoration works before depending on it.

## Make review useful

Show the actual SQL, target environment, expected rows and lock implications. EXPLAIN describes a plan; it does not prove that an update is semantically correct or reveal every trigger and external effect.

## Test the workflow

Test missing WHERE clauses, wrong tenants, long-running reads and a lost response after commit. Reconcile uncertain transaction outcomes before retrying; a second execution may duplicate effects.

The [recovery references](codex-loops.html#ref-FR-9) explain idempotent APIs and retries. Apply those principles at the database and service boundaries, not only inside the agent prompt.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
