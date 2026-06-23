# How to Build a Good Human-in-the-Loop for AI Database Operations

A good human in the loop for AI database operations does not put a person in front of every query to approve it. It asks one question first: can a human realistically catch this mistake in time? For most database work the honest answer is no. Generated SQL looks correct at a glance, a bad `DELETE` runs in milliseconds, and a tired reviewer rubber-stamps the tenth migration of the day. So the right design prevents the dangerous outcome instead of reviewing it. You grade each kind of database action by how reversible it is, how wide its blast radius reaches, and how high the stakes are; then you match controls to the grade. A read-only role, scoped credentials granted just in time, a forced dry-run that shows the affected-row count, and verified backups do more to keep your data safe than any approval prompt. This article shows how to build that loop for an AI SQL agent.

The scenario is now common. You have given an agent the ability to query and modify a database: an analytics assistant that writes SQL from natural language, a support bot that updates records, a coding agent that runs migrations. The agent is useful precisely because it acts. The problem is that a database is one of the least forgiving surfaces an agent can touch, and "let a human approve the SQL" is the control everyone reaches for and the one that fails most quietly.

This article shows how to grade database actions, match controls to each grade, and why prevention beats review for an AI SQL agent.

## Grade the actions, not the agent

The unit of risk is the action, not the agent. The same agent issuing a `SELECT` against a read replica and a `DROP TABLE` against production are two completely different risk profiles, and they need different controls. Grade each class of database operation by reversibility, blast radius, and stakes. LoopRails uses four grades, G0 through G3; you can run a specific action through the [LoopRails grader](index.html#grader) to place it.

| Database action | Typical grade | Why |
|---|---|---|
| `SELECT` / read on a read replica | G0–G1 | No state change, small blast radius, fully reversible |
| `INSERT` / `UPDATE` with a `WHERE` on non-critical tables | G2 | Changes state but is scoped and recoverable from backup |
| `DELETE`, or `UPDATE` without a `WHERE` | G2–G3 | Can hit every row; recoverable only if backups exist |
| `DROP` / `TRUNCATE` / `ALTER` / schema migration | G3 | Structural, often irreversible, wide blast radius |
| Any of the above on **prod** vs **staging** | shift up | Same query, higher stakes and blast radius |

Two things drive the grade more than the verb itself. The first is the missing `WHERE`: an `UPDATE accounts SET status = 'closed'` with no predicate is a different animal from the same statement scoped to one row. The second is the target environment. Running exploratory queries against staging or a copy is low-grade by construction; the identical statement against production carries every customer's data with it. When you grade, grade the action *and* where it lands. This is the [G2](guide-g2.html) and [G3](guide-g3.html) boundary in practice: G2 is recoverable with effort, G3 is the action you cannot take back.

## Match the controls to the grade

Once an action is graded, the controls follow. The goal is not to make a human approve more; it is to make the dangerous version of the action impossible or trivially reversible. These are the LoopRails patterns applied to a database.

**Read-only role by default (Capability Lock).** The agent connects through a database role that can `SELECT` and nothing else. This is the single highest-leverage control. It is not a rule the agent is asked to follow; it is a permission the agent does not have. A read-only role makes every G2 and G3 write physically impossible in the default session, which is exactly what [least privilege for AI agents](article-least-privilege-ai-agents.html) buys you.

**Separate, scoped prod credentials granted just in time.** When a write genuinely is needed, do not hand the agent a standing write account. Issue a separate credential, scoped to the specific tables and operations the task requires, valid only for that task, and revoked after. Prod credentials are never the agent's resting state. This keeps the [Authorized rail](rail-authorized.html) honest: the agent holds exactly the authority the action needs and no more.

**Dry-run and show the affected-row count before executing.** For any write, run the statement in a transaction or against the query planner first and surface what it *would* touch: "this `DELETE` will affect 48,219 rows." A human cannot read SQL and predict its blast radius, but a human can notice that a one-customer cleanup is about to delete forty-eight thousand rows. Showing the count is the "Show" in Grade · Guard · Show · Prove, and it turns a blind approval into a real decision.

**Require `WHERE` and cap rows.** Enforce, at the execution layer, that `UPDATE` and `DELETE` statements carry a `WHERE` clause, and impose a row-count cap above which the statement refuses to run without explicit elevation. This is the Blast-Radius Cap pattern: even a wrong query can only reach so far.

**Transactions and verified backups for reversibility.** Wrap writes in transactions so they can be rolled back, and ensure backups exist and have been test-restored before any G2+ work. Reversibility is what lets you downgrade the stakes of a mistake; an action you can undo is one a human does not have to catch in time. This is the [Reversible rail](rail-reversible.html).

**Maker-checker for prod DDL and migrations.** Schema changes are G3 and frequently irreversible. For these, the party that proposes the change is not the party that authorizes it. The agent drafts the migration; a human with separate prod credentials reviews the diff, the rollback plan, and the affected objects, then applies it. This is the one place a human approval genuinely belongs, because the action is rare, high-stakes, and reviewed with real context.

**Run exploratory work against staging or a copy (Sandbox-First).** Default the agent's environment to staging, a read replica, or a restored copy. Most agent database work is exploration and proposal, none of which need production, so a wrong query hits a throwaway, not your customers. See [AI agent sandboxing](article-ai-agent-sandboxing.html) for the general pattern.

## Prevent, don't review

Here is the callout worth stopping on. A human eyeballing generated SQL will not reliably catch a bad `DELETE`. The statement is syntactically clean, the table name is right, and the only flaw is a `WHERE` clause that is too broad or absent entirely. Nothing about reading the text tells you it will hit every row instead of one. By the time the result comes back, the rows are gone.

So do not build your loop around approval. Build it around prevention. Constrain the privileges so the destructive version cannot run in the default session, force a dry-run that shows the affected-row count, require a `WHERE`, and keep verified backups. Then the worst outcome is bounded by controls rather than by someone's attention. The core LoopRails test applies directly: if a person cannot realistically catch the mistake in time, prevent it, do not rubber-stamp it.

## Common mistakes in AI SQL agent safety

These are the failure modes that show up again and again when teams wire an agent to a database.

**Giving the agent a superuser or admin account.** This is the most common and most damaging. An admin connection means the agent can drop tables, alter schemas, and read every record, and so can anyone who manages to steer the agent through a prompt injection. The fix is structural: connect through the narrowest role the task needs, and treat agent database access as something you grant, not something the agent has by default.

**Trusting an SQL denylist.** Blocking strings like `DROP TABLE` or `DELETE` and treating that as a boundary is Denylist Theater. Pattern-matching on SQL is bypassable: comments split a keyword (`DR/**/OP`), case and whitespace vary, alternate syntax reaches the same effect, and dynamic SQL assembles the forbidden statement at runtime. A denylist enumerates the dangerous queries you thought of; the agent needs only one you missed. Removing the capability — a read-only role — is strictly stronger than forbidding a query, because there is nothing to phrase around. The principle of least authority limits damage in a way a blocklist cannot.

**No backups and no dry-run.** If you cannot show what a write will affect before it runs, and cannot restore after it runs, every write is a leap of faith. Verify backups by restoring them, and make dry-run the default path to execution.

## Key takeaways

- Start from the core question: can a human realistically catch this database mistake in time? For generated SQL, usually not — so prevent the bad outcome instead of approving the query.
- Grade actions by reversibility, blast radius, and stakes. Reads are G0–G1; scoped writes are G2; unscoped `DELETE`/`UPDATE` and all DDL trend G3; running against prod shifts the grade up.
- A read-only role by default is the highest-leverage control. It is a capability the agent lacks, not a rule it is asked to follow.
- Grant separate, scoped prod credentials just in time, force a dry-run with an affected-row count, require `WHERE`, cap rows, wrap writes in transactions, and keep verified backups.
- Reserve human approval for what it is good at: maker-checker review of rare, high-stakes prod schema changes, with full context and a rollback plan.
- A human will not catch a bad `DELETE` by reading SQL, and an SQL denylist is bypassable. Constrain privileges and force dry-runs instead of trusting a review.

## Get started

Building a human in the loop for AI database operations is one application of a general method. Start with the [LoopRails framework](framework.html) to grade your agent's database actions, then use the [playbook](playbook.html) to put read-only roles, dry-runs, and just-in-time credentials around them. If you have five minutes, the [cheatsheet](cheatsheet.html) is the fastest way in.

LoopRails is free and built for practitioners. Grade · Guard · Show · Prove.
