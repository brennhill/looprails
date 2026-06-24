# R: Reversible

*A LoopRails deep-dive. Part of the **RAIL** standard: every governed agent action should be **R**eversible, **A**uthorized, **I**nterruptible, **L**ogged. This page covers **R** only: what reversibility is, why it is the single highest-leverage property you can give an agentic system, how to engineer it, and where it runs out.*

> Bracketed tags like `[G-14]`, `[A-4]`, `[Q-3]` point to the annotated source in [`codex.md`](./codex.md). The method this page extends is in [`framework.md`](./framework.md); the quick version is in [`playbook.md`](./playbook.md).

---

## What "Reversible" means and why it's the highest-leverage property

**Reversible** means that after the agent acts, you can return the affected state to where it was, cheaply, quickly, and without having had to predict the mistake in advance. This is not "recoverable in principle if you have backups and an afternoon." It is cheap, one-step, *while you still care*.

Reversibility is the highest-leverage property because it is the only one that changes how *consequential* an action is in the first place. LoopRails grades every agent action on three dimensions, **reversibility × blast radius × stakes**, and the overall **Consequence Grade** is driven by the *highest* dimension [framework §2]. Reversibility is the dimension you can most directly engineer down:

| Grade | Definition |
|---|---|
| **G0 (Trivial)** | all dimensions low (read a file, read-only query) |
| **G1 (Low)** | at most one medium (edit a local file, run tests) |
| **G2 (High)** | any one dimension high (`git push`, spend within budget) |
| **G3 (Critical)** | **irreversible** *and* (external or severe stakes) (delete prod data, send external email, execute a payment, `rm -rf`) |

Make an action reversible and you *downgrade its grade*. A delete that becomes a soft-delete with a one-click restore is no longer G3-irreversible. It is a G1 you can shrug off. That downgrade is what buys you the central LoopRails move: **undo beats confirmation** [G-14].

Andy Raskin's *Never Use a Warning When You Mean Undo* [G-14] is the load-bearing source here. Confirmation dialogs train reflexive click-through (by the *second* identical prompt, habituation has already set in [O-16]), and they don't prevent errors. They relocate the error past a checkbox the human stopped reading. An undo is strictly better. It costs nothing on the happy path (the 99% of actions that were correct), and it still saves you on the 1% that weren't. Gmail's "Undo Send" is the canonical example: no warning, no friction, just a quiet window to take it back.

This is why reversibility is the framework's preferred default. In the consequence × controllability map [framework §1], cheap reversibility is what lets a low-stakes action run autonomously with only a notify-and-undo affordance [G-14]. It is also one of the few legitimate moves in the deadly top-left quadrant (high stakes, low human detectability) where adding a review gate just manufactures a rubber stamp [A-17].

---

## Why "just put a human in the loop" doesn't substitute for reversibility

The instinct, when an action looks risky, is to gate it: make the agent stop and ask a human to approve. LoopRails' core finding is that this instinct is usually wrong, and reversibility is why.

A confirmation gate has two costs and one assumed benefit. The costs are real. It **slows the agent** (every gate is latency and a context switch for the human), and it **trains rubber-stamping**: a human told to "review the output" overwhelmingly approves it [A-18, A-21, D-4], and gets *worse* at catching errors as the agent gets more reliable [F-4, E-7]. The assumed benefit, that the human catches the bad action, mostly doesn't materialize. Empirically, approval gates reduce bad *actions* but barely improve the human's ability to *catch* one. This is the exposure-vs-correction gap [A-17].

So a gate gives you friction *and* a false sense of safety. An undo gives you neither problem. The agent moves at full speed, and when it is wrong (which it will be, ~24% of the time even for the safest agents on high-stakes tool benchmarks [Q-5]) the human or the agent itself reverses it after the fact, having actually *seen the result* rather than guessing at a preview.

A gate asks the human to be a good error *predictor* before the fact, which they are not. An undo lets the human be a good error *corrector* after the fact, which they are. **An undo lets the agent move fast AND stay safe; a gate makes it slow AND only feels safe.** Reserve blocking confirmation for the genuinely irreversible (§4). There, and only there, is the friction earned [G-14, A-4].

---

## How to make agent actions reversible: concrete mechanisms

Reversibility is not one feature. It is a toolbox, and each mechanism applies to a different *kind* of effect.

1. **Checkpoints / snapshots + one-click rewind.** Snapshot state before each action, restore on demand. Claude Code's `/rewind` (Esc-Esc) takes automatic per-edit snapshots and restores code, conversation, or both [A-4]. *Applies to:* structured, framework-mediated edits to files and in-app state. *Sharp limit:* it tracks what *the framework* changed, not what a subprocess did (see §4).

2. **Transactions.** Wrap a set of mutations in a unit that either fully commits or fully rolls back (ACID). *Applies to:* databases and any store with a transactional API. The agent's whole multi-step operation runs inside `BEGIN … COMMIT`, and any failure (or a human veto) triggers `ROLLBACK`. This is the cleanest form of reversibility, since atomicity is itself the undo.

3. **Soft-delete / tombstones.** Never physically delete. Flip a `deleted_at` flag (a tombstone) and filter it out of reads. *Applies to:* any "delete" of records you control. Restore is a flag flip. This single pattern downgrades most delete operations from G3 to G1. Pair it with a retention window after which a background job hard-deletes.

4. **Two-phase staging (propose → commit).** The agent writes its change to a staging area, branch, or draft, and a separate explicit step promotes it to live. *Applies to:* deploys, config changes, bulk edits, publishing. The "propose" artifact is reviewable and discardable, and nothing real happens until commit. This maps to maker-checker / two-party approval where the proposer is not the committer [O-1].

5. **Dry-run / preview.** Compute and display the full effect *without* applying it. *Applies to:* any action whose effect can be simulated, such as migrations (`--dry-run`), bulk operations, and infra changes (`terraform plan`). This is *feedforward* in HCI terms: information shown before acting that tells the user the result [Q-3]. It is reversibility's cheapest cousin, since you reverse the decision before it costs anything. Caveat: a preview the human can't actually evaluate is decorative. Pair it with verification evidence, not a persuasive rationale [F-20].

6. **Compensating actions and sagas.** When a true rollback is impossible because steps already committed externally, define an explicit *compensating* action for each step (refund offsets charge, cancellation offsets booking) and run them in reverse order. *Applies to:* multi-service workflows and external side effects that individually can't be un-done but can be *offset*. This is "undo by doing the opposite," and it is the standard pattern for distributed transactions. Note: a compensation is an approximation, not a time machine. The email recipient still saw the charge.

7. **Idempotency keys.** Tag each mutating request with a unique key the server deduplicates on. *Applies to:* retries and re-runs of non-reversible operations (payments, sends). Idempotency doesn't *undo* an action, but it makes *re-execution* safe, so an interrupted-and-retried agent doesn't double-charge. It is the safety net that makes the other mechanisms (and crash recovery) survivable.

8. **Delayed execution with an "undo window."** Queue the irreversible action with a short delay (seconds to minutes) during which a single click cancels it. *Applies to:* sends, posts, and notifications. This is the undo-send pattern [G-14]. You convert an irreversible action into a reversible one *for the duration of the window* by simply not committing yet, which is the cheapest way to make "send" feel undoable.

9. **Version control / branches.** Every change is a commit on a branch; revert is `git revert`/`git reset`, isolation is a branch. *Applies to:* code and any versioned artifact. Running the agent on its own branch means its entire working set is reversible by deleting the branch, and reviewable as a diff before merge. This is two-phase staging (#4) and checkpoints (#1) made durable and shareable.

**Layer them.** A mature agent runs on a *branch* (9), in a *transaction* or against *soft-deleted* records (2,3), with *checkpoints* between steps (1), *previews* the diff for high grades (5), uses *idempotency keys* on any external call (7), and *delays* genuine sends behind an undo window (8).

---

## The hard boundary: what genuinely can't be undone

Reversibility has a hard edge, and pretending otherwise is the most dangerous mistake in this whole property. Some effects leave the system's control and cannot be recalled:

- **Sends and publishes.** An email, message, or post the recipient has already seen. (An undo window narrows this to "before the delay expires," then it's gone.)
- **Payments and transfers.** Money that has moved. A refund is a *compensation* [saga, §3.6], not an undo; the funds left and came back, with everyone the wiser.
- **Deletes of external state.** Data in a third-party system you don't own, with no tombstone and no restore.
- **Real-world effects.** Anything physical, legal, or social: a contract signed, a door unlocked, a decision communicated.
- **Shell side effects that checkpoints don't track.** This is the trap that catches teams who believe "we have undo." Claude Code's `/rewind` covers structured edits but **does not** track files changed by Bash (`rm`, `mv`, `cp`) or by network calls [A-4]. The most destructive operations sit *outside* the undo net. So grade by *actual* reversibility, not by whether your framework has a rewind button: a Bash `rm` is G3 even if your editor has undo [A-4, framework §2].

For the irreducibly irreversible, there are exactly three valid moves, and "add a confirmation and hope" is not among them:

1. **Contain the blast radius (sandbox).** Move the safety boundary off the per-action prompt and into the *environment*: no-network containers, scoped/ephemeral credentials, budget caps, disposable machines [A-23]. If the agent runs against a staging database with a $5 budget cap and no production credentials, the worst irreversible action it can take is *contained* rather than *reviewed*. This is the highest-leverage control and the most underused [framework §4]. Bound the magnitude too, with "fat-finger" limits on max spend, deletions, or recipients, and rate throttles to break runaway loops [O-3].
2. **Add a hard gate, the rare and earned confirmation.** This is where blocking confirmation is finally correct, because the friction is justified by genuine irreversibility. Make it a real boundary: maker-checker so the proposer isn't the approver [O-1], a safe default, and never auto-approve on timeout [Q-32]. For truly destructive scopes, prefer *capability revocation over a warning*. Lockout beats tagout: drop to read-only or revoke the token structurally rather than politely asking [N-17].
3. **Forbid it.** Some duties are non-delegable, and some actions the agent simply must not take unsupervised. Escalate to a human decision owner instead [framework §3, L6].

---

## A maturity checklist for reversibility

Self-assess in order; each level assumes the ones below it.

1. **Graded.** Every agent action is graded on *actual* reversibility, not on whether a rewind button exists. You can name each action's grade. [framework §2]
2. **Reversible by default.** Local/structured changes are checkpointed, soft-deleted, transactional, or branched. Undo, not confirmation, is the default safeguard for G0 to G2. [G-14]
3. **Boundary mapped.** You can state *precisely* what your undo does **not** cover (shell side effects, external state, sends, payments) and those actions are graded accordingly. [A-4]
4. **Irreversible remainder contained.** Every genuinely irreversible action either runs in a sandbox with scoped creds and budget/blast-radius caps, sits behind an undo window, sits behind a real hard gate, or is forbidden. [A-23, O-3, N-17]
5. **Idempotent and recoverable.** External mutations carry idempotency keys, so an interrupted-and-retried agent cannot double-act. [A-23]
6. **Previewed where it matters.** G2+ actions show a verification-oriented dry-run/diff before commit. [Q-3, F-20]
7. **Validated.** You have actually exercised the undo path under realistic conditions: restored from a tombstone, rolled back a transaction, deleted a branch. An undo you have never run is a claim, not a capability.

---

## Common mistakes

- **"We have undo," but the shell and external effects aren't covered.** The single most common failure. Teams see `/rewind` and assume the agent is safe, while a Bash `rm -rf` quietly sits outside the recovery net [A-4]. Undo that covers structured edits but not subprocess side effects, network calls, or third-party state gives false confidence exactly where stakes are highest.
- **Reaching for confirmation instead of undo.** Gating a reversible action wastes the human's attention and trains rubber-stamping, while delivering only the *feeling* of safety [G-14, A-17]. If the action is reversible, prefer notify-and-undo. Save the confirmation for the genuinely irreversible, and audit that the friction is warranted by the stakes [Q-34].
- **Treating "recoverable with effort" as reversible.** A nightly backup is not an undo. If restoring takes an afternoon and a runbook, the action is *not* reversible for grading purposes. It's G2 at best. Reversibility means cheap and timely.
- **Compensation mistaken for rollback.** A refund, an apology, a cancellation: these *offset* an irreversible action, they don't erase it. Grade the underlying action as irreversible and contain it accordingly.
- **No undo window on sends.** Shipping "send" with no delay forfeits the cheapest reversibility win available [G-14].
- **Never testing the undo.** A rollback path that has only ever existed on paper fails the first time you need it.

---

## Sources

Codex tags grounding this page:

- **[G-14]** Raskin (2007), *Never Use a Warning When You Mean Undo*. Undo beats confirmation; reversibility as the superior safety pattern (Gmail Undo Send).
- **[A-4]** Anthropic (2025), *Checkpointing (Claude Code), /rewind*. The rollback pattern and its sharp shell boundary (Bash side effects untracked).
- **[N-17]** OSHA (1989), *Lockout/Tagout, 29 CFR 1910.147*. Positively disable (capability revocation) rather than politely pause; lockout beats tagout.
- **[O-3]** Futures Industry Association (2024), *Automated Trading Risk Controls*. Fat-finger blast-radius limits and rate throttles for fast autonomous actors.
- **[Q-3]** Vermeulen et al. (2013), *Feedforward's True Identity*. Consequence preview before acting; the basis for dry-run/preview.
- **[A-23]** Willison (2025), *Designing Agentic Loops* / *The Lethal Trifecta*. Sandbox/contain the blast radius for the irreducibly irreversible.
- **[E-15]** Onnasch et al. (2014), *Stages and Levels of Automation: A Meta-Analysis*. The "lumberjack effect": higher autonomy buys routine gains but worse catastrophic-recovery failures; evaluate agents on what happens *when they're wrong*, which is exactly when reversibility pays off.

*Related context: [A-17] (the recognition/correction gap behind "gates don't make humans good detectors"), [Q-5] (agents propose irreversible harmful actions ~24% of the time), [O-1] (maker-checker for hard gates), [Q-32] (safe default, never auto-approve on timeout). Companion to [`framework.md`](./framework.md) §1 to §4 and [`codex.md`](./codex.md).*
