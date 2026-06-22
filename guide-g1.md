# Designing for a G1 (Low) Action

*A LoopRails in-depth guide · companion to [`framework.md`](./framework.md), [`playbook.md`](./playbook.md), and [`codex.md`](./codex.md)*

---

## 1. TL;DR — what makes an action G1

**The short version:** For a G1 action, do **not** stop the agent to ask permission. Let it
act, tell the human what it did, and make the undo cheap. Reversibility — not confirmation — is
the safety net. A blocking approval gate here buys you almost nothing and trains the human to
rubber-stamp, which costs you later when the stakes are real.

A **G1 (low) action** is reversible but slightly more than trivial. In LoopRails'
consequence grading, every action is scored on three dimensions — *reversibility × blast radius ×
stakes* — and the **highest** dimension sets the grade. G1 means **at most one medium dimension,
and none high** (framework §2):

- **Reversibility:** one-click undo / checkpointed.
- **Blast radius:** self / local workspace.
- **Stakes:** trivial to minor.

Canonical examples: **editing a local file, installing a dev dependency, running tests.** Contrast
with G0 (purely trivial — read a file, run a read-only query) and G2 (something *high* on one
axis — `git push`, sending an internal message, spending within a budget).

> **The grading trap that turns a G1 into a G3.** Grade by *actual* reversibility, not by whether
> your framework has a "rewind" button. Checkpoint/undo typically covers an agent's *structured*
> edits but **not** shell side-effects. A Bash `rm`, `mv`, or `cp` is G2–G3 even if your editor has
> undo, because the destructive operation sits outside the recovery net [A-4]. "Edit a local file"
> is G1; "let the agent run arbitrary Bash that touches files" is not.

---

## 2. Is a human in the loop the answer here?

For a G1 action, a **blocking approval gate is the wrong answer.** The right answer is
**act, notify, allow undo.**

This sounds counterintuitive — surely *more* human oversight is *safer*? The codex says no, for two
reasons that compound.

**First, confirmation gates don't make humans good at catching errors.** This is the single
strongest empirical finding in the evidence base. Plan-approval gates cut bad *actions*
substantially (attack occurrence dropped from ~90% to 60–74%) yet the human's **intervention
success rate stayed at 9–26%** across every strategy tested — the failure is rationalization and
normalization, a *recognition bottleneck*, not inattention [A-8, A-17]. A gate changes whether the
action pauses; it does not change whether the human can tell right from wrong. At G1, where the
action is low-stakes and reversible anyway, you are paying the full cost of a gate to catch
errors the human can't catch and that wouldn't hurt much if they slipped through.

**Second, gates at G1 actively *damage* your oversight everywhere else.** A flood of low-value
prompts is how oversight dies. Habituation to a repeated prompt sets in neurologically by the
*second* identical repetition [O-16]; clinicians override **49–96%** of drug-safety alerts under
exactly this kind of barrage [H-10]. False-alarm-prone signals are uniquely corrosive — they damage
*both* compliance and reliance, so a human trained to click through your dependency-install prompts
will also click through the `git push` prompt that mattered [F-17]. Every G1 gate you add spends
down the attention budget you need for G2/G3.

**Why reversibility beats confirmation (undo > warnings).** This is a 20-year-old, well-settled
HCI result. A warning asks the user to predict a consequence *before* acting and trains reflexive
click-through; **undo lets them act and recover, which is both lower-friction and more reliable**
[G-14]. Nielsen's "user control and freedom" heuristic frames undo as the *emergency exit* every
interface needs [G-13], and Tognazzini's "protect users' work" / "explorable interfaces"
principles say the same: keep operations reversible, never a dead end [G-15]. Modern agents
implement this directly as checkpointing/rewind [A-4]. The framework states the rule plainly:

> "Prefer reversibility over confirmation. Undo beats warnings — confirmations habituate users into
> clicking through. Make agent actions reversible by default; reserve confirmation gates for
> genuinely irreversible, high-stakes operations." [G-14, G-13, G-15]

A G1 action is, by definition, reversible. That is precisely the condition under which undo is
available and confirmation is wasteful.

---

## 3. How to design it properly

**Autonomy level: L1–L2 (act, then notify).** LoopRails separates two dials — *which* stage of the
agent's processing is gated (acquire → analyze → decide → **act**) and *how much* the human is in
control at that stage [E-6]. For G1 the default mapping is **L1–L2** on the *act* stage
(framework §3):

- **L1 — Autonomous, logged:** agent acts; recorded for audit; human role is post-hoc.
- **L2 — Notify-after:** agent acts; actively surfaces what it did; cheap undo; human reacts/undoes.

No L3 (confirm-before). The agent is never blocked waiting for a "yes."

**Checkpoint/undo is the safety net — not a gate.** The control surface that makes L2 safe is
*checkpoint / undo / rollback*: snapshot state, one-click revert [A-4]. This is what lets you drop
the action a grade and prefer undo over confirmation [G-14]. Make it the *default*: every edit is
checkpointed automatically, so reversal is always one keystroke away.

**Know the hard boundary of undo.** This is the part teams skip. Checkpoint/undo covers the agent's
*structured* edits but **does not cover shell side-effects** — `rm`, `mv`, `cp`, network calls,
and anything that mutated state outside the editor's snapshot [A-4]. You must know *precisely* what
your undo does not cover, because anything outside it is not actually a G1: a Bash deletion is
G2–G3 no matter how good your rewind button is. So:

- Auto-checkpoint structured edits → genuinely G1 → L1/L2.
- Route shell side-effects through a different, higher gate (or sandbox them, §below).
- Never let the existence of a "rewind" button silently re-grade an irreversible action.

**What to surface in the notification.** L2 is "notify-after," but a notification that's just a log
dump leaves the human out-of-the-loop — awareness is *comprehension*, not perception [E-6, E-12].
Even after the fact, the notification should carry the lightweight version of the loop episode:

- **What changed + that it's reversible** — the concrete effect and a one-click undo affordance
  (consequence + reversibility, the feedforward principle, here as feedback) [Q-3, Q-4].
- **Provenance, briefly** — why the agent did this, so a human scanning the change can reconstruct
  "how did this get here?" without spelunking [Q-7].
- **Detection affordance** — a diff framed to help the human *check*, not a rationale framed to
  *sell* the change (persuasive explanations increase blind acceptance) [F-20].

The accountable human stays the initiator, and the action is logged for audit [G-6, C-20].

**Keep interruptions within budget.** The whole point of L1–L2 is to *not* spend attention here.
Treat interruptions as a scarce budget [H-21]: most G1 signals should be **passive/logged**, and
anything that does surface should be **batched** and deferred to a natural task breakpoint rather
than firing mid-flow [Q-28]. EEMUA's discipline transfers directly — every interruptive alert must
demand a *specific* response, and the interruptive rate must be capped; everything else is a passive
log [H-21]. Do **not** notify per-file; aggregate. (And note the model-capability caveat: agents are
weak at honoring mid-task steering [A-19], which is another reason to prefer act+undo over
interrupt-and-confirm at this grade.)

---

## 4. Worked example: a coding agent editing local files

A Claude Code–style coding agent is asked to refactor a module across several files.

- **Grade.** Reading files is G0; **editing a local file is G1** (reversible via checkpoint, local
  blast radius); **running tests is G1**. (`git push` would be G2 — shared, hard to reverse — and
  `rm -rf` G3; those get gates and escalation, not this treatment.)
- **Match.** Edits and test runs are **autonomous + logged with undo (L1–L2)**. The agent does not
  ask before each edit. It *does* auto-escalate if an edit reaches outside the approved scope (e.g.,
  files the task never mentioned) [A-18] — dynamic, not static, autonomy.
- **Instrument.** Run on a branch with no prod credentials [A-23]; **checkpoint every edit**, and
  **explicitly flag that Bash deletions are not covered** by rewind [A-4]. The undo is one keystroke
  (`/rewind`).
- **Episode (the after-the-fact notification).** When the refactor lands, the agent surfaces: a
  **diff** of what changed, the **test results** as verification evidence, a one-line **why**
  (provenance), and a **one-click rewind**. It is **batched** — one summary at the task breakpoint,
  not a prompt per file [Q-28, H-21].
- **Defend.** Because nothing blocked, there's no gate to rubber-stamp; the human reviews a
  focused diff *with passing tests as evidence*, which supports checking rather than trusting [F-20].
- **Validate.** Track how often human review of these diffs catches a real bug versus merge rate
  [A-16], and red-team with planted regressions [A-17].

The human never approved an edit. They got a clean, reviewable summary and a rewind button — and
their attention is still fresh for the `git push`.

---

## 5. Anti-patterns

🟥 **The Confirmation Reflex** — putting a blocking "Approve this edit?" prompt on a reversible,
local action. It feels responsible; it's the opposite. Gates barely improve catching [A-17], and the
habituation they breed gets you tuned out by the second prompt [O-16], spending the attention budget
you need for real decisions. **Antidote:** Checkpoint & Rewind — act, notify, undo [G-14, A-4].

🟥 **Warnings instead of undo** — surfacing a scary "are you sure?" *warning* in place of a cheap
revert. The 20-year-old result stands: warnings train click-through and don't prevent errors; undo
is the superior pattern [G-14, G-13]. **Antidote:** make the action reversible by default; reserve
confirmation for the genuinely irreversible.

🟥 **The "rewind button" re-grade** — assuming undo exists, so treating shell side-effects as G1.
A Bash `rm` is not covered by checkpointing and is not reversible [A-4]. **Antidote:** grade by real
reversibility; gate or sandbox shell side-effects separately.

🟥 **The per-file firehose** — notifying on every individual edit instead of batching at a
breakpoint. This recreates alert fatigue under a friendly name [H-21, Q-28]. **Antidote:** batch;
make most signals passive; cap the interruptive rate.

---

## 6. Sources (codex tags used)

- **[G-14]** Raskin, *Never Use a Warning When You Mean Undo* — undo beats confirmation; warnings
  train click-through. The core "reversibility > confirmation" claim.
- **[G-13]** Nielsen, *10 Usability Heuristics* — user control/freedom; undo as the emergency exit.
- **[G-15]** Tognazzini, *First Principles of Interaction Design* — protect users' work; explorable,
  reversible interfaces.
- **[A-4]** Anthropic, *Checkpointing (Claude Code) — /rewind* — per-edit snapshots and the **hard
  shell boundary**: Bash `rm`/`mv`/`cp` side-effects are not undoable.
- **[A-8]** LangGraph, *Human-in-the-Loop* — the interrupt → approve/edit/reject/respond primitive;
  evidence that gates cut bad actions but not error-catching.
- **[A-17]** Empirical HITL study — the **recognition bottleneck**: gates cut bad actions (~90%→60–74%)
  but intervention success stays 9–26%.
- **[F-17]** Dixon et al. — false alarms are uniquely corrosive to both compliance and reliance.
- **[H-21]** EEMUA Publication 191 — interruptions are a budget; every alert must demand a specific
  response; cap the interruptive rate.
- **[H-10]** Alert-fatigue evidence — clinicians override 49–96% of alerts.
- **[O-16]** Anderson et al. — warning habituation sets in by the *second* repetition.
- **[E-6]** Parasuraman, Sheridan & Wickens — stages × levels of automation; gate the *act* stage,
  automate earlier stages freely.
- **[Q-3, Q-4]** Vermeulen et al.; Shneiderman et al. — consequence/feedforward preview and undo as
  first-class safety affordances.
- **[Q-28]** Iqbal & Bailey — defer/batch interruptions to task breakpoints.
- **[F-20]** Bansal et al. — explanations framed to persuade increase blind acceptance; design for
  *verification*, not selling.
- Supporting: **[E-12]** awareness as comprehension; **[A-18]** escalate on scope drift; **[A-19]**
  models are weak at mid-task steering; **[A-23]** sandbox the environment; **[A-16]** measure
  catch-rate; **[C-20], [G-6]** accountability/logging.
