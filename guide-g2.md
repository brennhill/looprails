# Designing for a G2 (high) action

> Part of the LoopRails guides. Grounded in [`framework.md`](./framework.md) (§1 the
> Consequence×Controllability model, §5 the loop episode, §3 the grade→mode mapping) and
> [`codex.md`](./codex.md) (bracket tags like `[A-17]` point to the source there).

## TL;DR: what makes an action G2

A **G2 (high) action** is one where exactly one consequence dimension scores *high*, or two
score *medium*. LoopRails grades every agent action on three axes (**reversibility × blast radius
× stakes**), and the *highest* axis sets the grade. A `git push` lands at G2 because it touches shared
state and is hard to reverse. An internal Slack message is G2 because the blast radius is
your team. Spending $40 inside a $200 budget is G2 because real money moves. None of these is
catastrophic. Catastrophic would be G3 (irreversible *and* external-or-severe, like deploying to prod or
paying a vendor). None of them is free either.

The default LoopRails mode for G2 is **L3 to L4**: confirm-before with a real preview, or
plan-approve for multi-step work. A default is not an answer, though. The right design for a G2 action
depends entirely on whether a human can actually catch the mistake in time, and working that out is what
this page is for.

> One caveat up front: grade by *real* reversibility, not by whether your tool has an
> "undo" button. Checkpoint/undo usually covers an agent's structured edits but **not** shell side
> effects. A Bash command that deletes files is G2 or G3 even if your editor can rewind, which is the
> shell-boundary trap `[A-4]`.

## Is a human in the loop the answer here? Depends, and that dependence is the whole point.

LoopRails refuses the binary question "should there be a human in the loop?" and replaces it with
two independent axes (`framework.md` §1):

- **Consequence** is how much oversight is *warranted* (reversibility × blast radius × stakes). For
  a G2 action this is, by definition, meaningful.
- **Controllability** is how much oversight can actually be *effective*. Can a person **detect** the
  problem from what's surfaced and **correct** it **in time**?

For a G2 action the consequence axis is fixed at "high enough to care." Controllability
is the swing variable, and it decides everything.

**If controllability is HIGH, meaning a human can realistically catch the mistake in time, then a human
gate genuinely works. Invest in it.** Take a `git push` where the developer reads a clear, focused diff,
sees the failing test, and rejects: that is real oversight. Detectability is high, since a diff is
verifiable, and there is time to act before harm lands. Build the gate, and build it well.

**If controllability is LOW, where the human *cannot* reliably detect or correct in time, then a review
step is not safety.** It is a rubber stamp and a scapegoat. Two forces guarantee this:

- **The recognition bottleneck `[A-17]`.** In a within-subjects study (n=48) of oversight
  strategies for computer-use agents, plan-approval cut problematic-action *occurrence* from ~88-90%
  down to 60-74%. But once a problem actually surfaced, **intervention success stayed at 9-26%
  across every strategy**. Adding a gate reduced bad *actions* yet barely improved the human's
  ability to *catch* one. The failure was not inattention. It was rationalization and normalization:
  people talked themselves into the agent's answer. Call it the **exposure-vs-correction gap**.
- **Automation bias.** Even motivated experts default to shallow review under productivity pressure
  `[A-20]`. Professional developers, asked how they oversee coding agents, rely on informal
  heuristics rather than systematic verification. A human told to "review the output" rubber-stamps it.

A human placed in a low-controllability loop without the real ability to intervene becomes a
**moral crumple zone**: a liability sponge who absorbs blame for a system they could never actually
control. The takeover-time literature is blunt about the "time" half. Drivers in automated cars need
seconds-to-tens-of-seconds to re-engage `[H-19]`, and disengaged supervisors hit the
out-of-the-loop performance problem `[E-13]`. With no time to intervene, the gate is theater.

So the rule for G2 is straightforward: where review works, design the review (next section); where it
doesn't, prevent rather than review (the section after).

## How to design the review when review works

This is the high-controllability path. The human *can* catch the error, so spend the friction
well. Use autonomy **L3 (confirm-before)** for a single action or **L4 (plan-approve)** for
multi-step work, and engineer the **loop episode**, the single oversight moment, so the human
actually succeeds (`framework.md` §5). Putting a human in the loop does not by itself make them a good
detector. The episode has to be built to give them one.

A well-designed G2 episode contains, in order:

1. **State the request clearly.** Exactly what is being asked, in the user's terms, with what the
   agent can and can't do made explicit.
2. **Show the consequences *before* the human acts (feedforward `[Q-3]`).** Preview the concrete
   effect of approving, the downstream side effects, and **crucially whether it is reversible**.
   "What happens if I approve" is a named HCI principle, not decoration.
3. **Surface calibrated uncertainty.** Show the agent's confidence, calibrated and carefully
   framed, since raw numbers are misread. Uncertainty is a stronger detection signal than a
   rationale `[Q-20]`, and low confidence is itself an escalation trigger.
4. **Give the provenance, the "how did this even get to me?"** The upstream trail that restores
   situation awareness: what the agent perceived, what it considered and rejected, *why* it is
   asking now, and the tool-calls that led here. Without it the human is out-of-the-loop `[E-13]`
   and cannot competently intervene.
5. **Build detection affordances that support *checking*, not *trusting*.** Contrastive **why / why-not**
   explanations `[Q-16]` and diffs framed for verification; surface disagreement, counter-evidence,
   and the agent's own doubts.
6. **Add proportionate friction, a microboundary rather than sludge,** *only* before the consequential
   beat, never indiscriminately.
7. **Bias-safe choice architecture.** The safe/reversible option is the default; **never
   auto-approve on timeout**; no dark patterns.
8. **Preserve accountability after the act.** Keep the human the accountable initiator and log the
   decision.

Three concrete tools carry most of the weight for G2:

- **Preview / diff / dry-run.** Show the concrete effect before committing. This is the workhorse
  for G2, but *only when the human can actually read the result*. A diff nobody can evaluate is decorative.
- **Plan-then-go (L4).** Approve a plan *before* execution, with checkpoints between steps. This is
  what expert developers actually do: upfront planning plus staged approval checkpoints `[A-20]`. You
  need it when the model can't be steered reliably mid-task.
- **Maker-checker (proposer ≠ approver).** For the upper edge of G2, borrow the four-eyes principle
  `[O-1]` and the two-person concept `[N-15]`, where a second, *independent* party approves. Independence
  is the whole value. An agent re-reading its own work just confirms its own bias.

## How to prevent when review won't work

When controllability is low, where the human can't tell right from wrong from what's shown, or there's no
time to intervene, adding a confirmation gate produces a rubber stamp rather than safety. The valid moves
are prevention strategies that **don't depend on the human being a good detector** (`framework.md`
§1):

- **Shrink the consequence by making it reversible.** Undo beats confirmation `[G-14]`. If you can make
  the action one-click-reversible (push to a branch instead of `main`; a refund that can be clawed
  back), it drops a grade and the whole problem dissolves. Treat reversibility as a first-class safety
  affordance, not an afterthought.
- **Shrink the blast radius.** Cap the magnitude of any single action (max spend, max recipients,
  max files) and rate-throttle. A budget *cap* enforced in code beats a human eyeballing each charge.
- **Sandbox.** Move the safety boundary off the per-action prompt and into the environment:
  no-network containers, scoped/ephemeral credentials, budget caps `[A-23]`. Now the worst case is
  *contained* rather than *reviewed*, which is the highest-leverage and most under-used control.
- **Force a real decision (cognitive forcing).** Where you must keep a human, make them engage
  *before* seeing the agent's answer. Cognitive forcing functions measurably reduce over-reliance
  `[F-21]`. Users dislike the friction that helps most, so reserve it for the irreversible beat.
- **Escalate or forbid (L6).** Hand off to a human decision-owner with a context-rich summary, or
  don't let the agent take the action at all.

Build detection evidence to *verify*, never to persuade. Explanations framed to sell the answer
**increase acceptance regardless of correctness** `[F-20]`, deepening over-reliance. Show
verifiable evidence (test results, the actual diff, the actual recipient list) rather than a confident
rationale.

## Worked example: `git push`

`git push` is the canonical G2 action: shared blast radius, hard to reverse, meaningful (not
severe) stakes.

**Is review the answer?** Usually yes, because controllability is high. A diff is verifiable, tests give
external evidence, and there is time to reject before downstream consumers pull. So design the
review:

- **Mode:** L3 confirm-before, with the diff shown; L4 plan-approve if the push is part of a larger
  multi-commit workflow `[A-20]`.
- **Episode:** show the diff and exactly which branch/remote it affects; state whether it's
  reversible (a force-push to a shared branch is *not*, which re-grades toward G3); surface test
  results as detection evidence `[F-20]`; explain *why now* (provenance); default to the safe option;
  and **batch** so the developer isn't prompted per-file (respect the attention budget).
- **Prevent where review weakens:** if the diff is enormous, the human will rubber-stamp it, because
  the recognition bottleneck bites `[A-17]`. So shrink the consequence: push to a feature branch behind a
  PR (reversible, no direct effect on `main`), split into focused reviewable chunks, and let CI be
  the verification layer. A force-push to `main` should not be a G2 confirm-before at all. It's a
  G3 prevent-and-escalate.

The same logic applies to a **budgeted spend**: an individual charge inside the budget is G2 and
reviewable when the human can see what's being bought and why. But if charges arrive faster than a
human can evaluate, *prevent* instead. Enforce the budget cap and per-transaction limit in code,
and escalate only the over-budget tail.

## Anti-patterns

- **The rubber stamp.** A gate clicked through without comprehension. Gating reduces bad actions but
  does **not** make humans catch them `[A-17]`; uniform high approval is the signature. Antidote:
  forcing functions, verification-oriented evidence, and *measuring* intervention-success rate, not
  approval rate.
- **Explanations that persuade instead of helping verification.** A polished rationale that sells
  the agent's answer raises acceptance whether the answer is right or wrong `[F-20]`. Design the
  explanation to help the human *find the error* with contrastive why/why-not `[Q-16]`, surfaced
  uncertainty `[Q-20]`, and the actual diff, not to win the argument.
- **The phantom gate / moral crumple zone.** A mandated review on a low-controllability action: the
  human can't realistically catch the mistake but takes the blame. If you can't give real authority,
  awareness, ability, and time, *don't claim oversight*. Prevent instead.
- **Friction as sludge.** Indiscriminate confirmations breed approval fatigue and habituation, and
  users tune out by the second identical prompt. Add friction only at the consequential, irreversible
  beat.

## Sources

Codex tags used on this page:

- `[A-17]`: Chen et al. (2026), oversight strategies for computer-use agents: the
  exposure-vs-correction gap and the recognition bottleneck (intervention success 9-26%).
- `[A-20]`: Huang et al. (2025), professional developers control via upfront planning + staged
  approval checkpoints + mid-execution interruption.
- `[F-20]`: Bansal et al. (2021), explanations increase acceptance regardless of correctness;
  prefer verification-oriented evidence over persuasion.
- `[F-21]`: Buçinca et al. (2021), cognitive forcing functions reduce over-reliance (and users
  dislike the friction that helps most).
- `[E-13]`: Endsley & Kiris (1995), the out-of-the-loop performance problem.
- `[H-19]`: Zhang et al. (2019), take-over time meta-analysis (the "time to intervene" evidence).
- `[Q-3]`: Vermeulen et al. (2013), feedforward, a consequence preview in an approval gate.
- `[Q-16]`: Lim et al. (2009), why / why-not explanations improve intelligibility (detection).
- `[Q-20]`: Zhang et al. (2020), confidence/uncertainty as a detection signal; raw numbers misread.
- `[O-1]`: Segregation of duties / four-eyes (maker-checker): proposer ≠ approver.
- `[N-15]`: USAF two-person concept: two independent authorizers for high-grade actions.

Also referenced: `[A-4]` shell-boundary trap, `[A-23]` sandboxing / lethal trifecta, `[G-14]` undo
beats confirmation.
