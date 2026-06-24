# Designing for a G0 (Trivial) Action

> Part of the LoopRails guide series. For the full method see [`framework.md`](./framework.md);
> for the field-guide version see [`playbook.md`](./playbook.md); for the evidence behind every
> claim see [`codex.md`](./codex.md). Bracket tags like `[A-17]` point to the annotated source.

## TL;DR: what a G0 action is

**A G0 action runs autonomously and gets logged. Don't gate it. Gating it is the wrong move and
actively makes your system worse.**

G0 is the lowest consequence grade in LoopRails. You earn it by passing a three-part test on the
action's *consequence*, **reversibility × blast radius × stakes**, where every dimension scores
low:

| Dimension | What "low" means for G0 |
|---|---|
| **Reversibility** | Nothing is changed, or any change is one-click undone / checkpointed [A-4]. |
| **Blast radius** | Effect stays in *your* local workspace, not shared state, not third parties, not the public. |
| **Stakes** | Trivial. No money, safety, legal, security, or reputational exposure. |

The grade is set by the *highest* dimension, so a single dimension creeping up disqualifies it.
Canonical G0 examples: reading a file, running a read-only query, drafting text locally. (Jargon:
*blast radius* = how far the effect reaches if it goes wrong; *reversibility* = how cheaply you
can undo it.)

## Is a human in the loop the answer here?

No. This is the section that matters most, because the instinct to "just add a confirmation to be
safe" is exactly backwards for G0.

**A human adds essentially nothing at G0.** There is nothing to catch. The action is reversible,
local, and trivial, so the worst case is already contained. The evidence is worse than neutral: a
human placed in front of a low-stakes prompt is *not* a good detector even when it counts. Approval
gates cut the *occurrence* of bad actions but barely improve a human's ability to *catch* one. Call
it the "recognition bottleneck." Plan-approval drove attack occurrence down to 60-74% from ~90%,
yet intervention success stayed at **9-26%** across every strategy tried [A-17]. Even motivated
expert developers default to shallow, heuristic review under productivity pressure and
rubber-stamp [A-18, A-21]. If a human can't reliably catch a *real* error, asking them to
"approve" a file read is pure ceremony. It manufactures accountability without producing
control [C-21].

**Prompting at G0 manufactures alert fatigue, and that erodes the alerts that do matter.** This is
the real harm, and we can put numbers on it. Clinicians override **49-96%** of drug-safety alerts,
driven by poor signal-to-noise [H-10]. Indiscriminate flagging trains people to dismiss
*everything*, including the rare valid signal. The aviation and process-control discipline is
blunt: an alarm must demand a *specific* operator response, and the interruptive rate must be
capped (EEMUA targets roughly ≤10 alarms per 10 minutes per operator) [H-21]. False-alarm-prone
systems are corrosive in a way most teams underestimate. They damage both *compliance* (acting on
alarms) and *reliance* (trusting silence), driving the "cry wolf" desensitization that makes people
override even critical alerts [F-17]. Every G0 prompt you add is a false alarm in disguise. It
spends a slice of a scarce, finite attention budget on something with no consequence, and it
teaches the human to click through the next prompt reflexively, including the G3 one where catching
the error was the whole point.

So the framework's default mapping puts G0 at **L0 to L1** (autonomous, silent or logged):
"spending attention here is waste; it manufactures alert fatigue" [H-21, F-17]. The right posture
is **management by exception**: handle the routine autonomously and surface only deviations [K-1].
Pairing human review with AI is not free benefit either. Human-AI teams often *underperform* the
better of human-or-AI alone, especially in decision tasks [C-19]. At G0, the human is the weaker,
costlier party. Leave them out.

## How to design it properly

**Run autonomously; log, don't prompt.** G0 actions execute without a gate. The control surface is
a passive log, not a dialog. Borrow the staged-automation view: automate perception and analysis
(read, query, retrieve) freely, and reserve gates for the *act* stage where over-trust and lost
authority bite. A G0 action barely touches the act stage at all [E-6].

**Budget interruptions as a scarce resource.** Treat your interruptive capacity like a quota you
can overspend. The G0 contribution to that quota should be zero blocking prompts. Most signals stay
passive and logged; reserve blocking interventions for high-severity, high-precision cases [H-21,
F-17]. This is the principal-agent bargain: oversight is *costly monitoring*, so monitor the
exceptions, not everything [K-1].

**What to record.** Keep a queryable, append-only trace so post-hoc audit and accountability are
possible without a live human in the loop:

- the action taken, with timestamp and the tool/capability used;
- inputs/parameters (e.g., which file, which query) and the result or a digest of it;
- the *cumulative* tally per session: counts and rates of G0 actions, so composition is visible;
- enough provenance that, *if* an action later escalates, you can answer "how did this get here?"
  [C-20].

**Keep G0 truly G0; watch for hidden blast radius and mis-grading.** The danger is an action that
*looks* trivial but composes into something bigger. Guard against it:

- **The shell-boundary trap [A-4].** Checkpoint/undo typically covers an agent's *structured*
  edits but **not** shell side effects. A "read" that is actually a Bash command with side effects,
  or a "query" that hits a write endpoint, is not G0. Grade by *actual* reversibility, not by
  whether your framework has a rewind button.
- **The lethal trifecta [A-23].** A read becomes dangerous the moment it combines private-data
  access plus untrusted content plus an external-communication path. That combination is
  near-guaranteed exfiltration via prompt injection. Reading a file is G0; reading a file *and*
  then being able to send it externally is not. Detect the combination and escalate or forbid.
- **Accumulated blast radius.** Many small G0 reads can compose into a G2-scale effect (e.g.,
  scraping an entire private codebase). Escalate the level automatically when accumulated reach
  crosses a threshold. That is the same dynamic trigger the framework applies to scope creep.

If any of these fires, the action was never G0. Re-grade it. Don't paper over it with a prompt the
human will rubber-stamp anyway.

## Worked example: a coding agent reading files and running read-only queries

A Claude Code-style agent exploring a repo before making changes:

- **Map / Grade.** `read file`, `grep`/search, `git log`, `git diff` (no write), a `SELECT`
  against a read replica are all G0: nothing changed, local workspace only, trivial stakes.
- **Match the mode.** L0 to L1: the agent reads and queries freely and silently; each action lands
  in the run log. No confirmation dialog, ever. (Contrast: an *edit* to a local file is G1, which
  is act plus notify with cheap undo; `git push` is G2, which is confirm-before with a diff. G0
  sits below all of that.) [E-6, K-1]
- **Instrument.** Run in a sandbox/branch with **no prod credentials**, so even a mis-graded read
  can't reach anything that matters [A-23]. The log records every file touched and every query
  run, with a running count.
- **Keep it G0.** Two tripwires: (1) the read replica is genuinely read-only at the *database*
  level, not just by the agent's intent, since a "read-only query" that can mutate is mis-graded
  [A-4]; (2) if the agent gains the ability to send what it reads anywhere external, the trifecta
  fires and the action class is re-graded and gated [A-23].
- **What you get.** The agent does the high-volume, low-stakes work: exploring, grokking,
  drafting, with zero interruptions, and your human's attention is preserved intact for the
  `git push` and the prod migration, where catching a mistake is real and possible.

## Anti-patterns

**Over-gating trivial actions, leading to alert fatigue.** Putting a "Allow read of `config.json`?"
prompt in front of a G0 read is the single most common way oversight dies in practice. It's the
**Alert-Fatigue Spiral**: too many low-value prompts, so the human dismisses all of them, including
the valid ones [H-10, F-17]. You cannot fix this later by muting the noisiest category, because
rare-but-critical cases hide in high-override buckets. The only safe fix is to not over-alert in the
first place, by tiering [H-10/H-11]. Symptom to watch for: a global "ask everything" switch
(maturity level 0, "Binary"). The cure is grading, so trivial work just runs.

**Phantom oversight.** Mandating a review step that is illusory in practice, where the human
"approves" G0 actions they can't and needn't evaluate, legitimizes the system with a façade of
accountability while delivering no control [C-21]. At G0 this is pure theater: there is no error to
catch and no authority that's meaningfully exercised. It also quietly creates a **moral crumple
zone** if anything ever does go wrong, because a human's name is on an approval they never truly
made. The antidote is honesty: if oversight here can't pass the four A's (Authority, Awareness,
Ability, Accountability), don't claim it. Change the design and log instead.

**The Confirmation Reflex.** Reaching for a warning prompt where cheap reversibility would do.
Habituation sets in by the *second* identical prompt; undo beats confirmation. For G0 there isn't
even anything to undo, so the only correct amount of confirmation is none.

## Sources

- **[H-10]** van der Sijs et al. (2006), *Overriding of Drug Safety Alerts in CPOE*: clinicians
  override 49-96% of alerts; the empirical heart of alert fatigue.
- **[F-17]** Dixon, Wickens & McCarley (2007), *On the Independence of Compliance and Reliance*:
  false alarms uniquely corrosive; alert volume/precision are safety parameters.
- **[H-21]** EEMUA Publication 191: every alarm must demand a defined response; cap the
  interruptive rate; everything else is a passive log.
- **[E-6]** Parasuraman, Sheridan & Wickens (2000), *Types and Levels of Human Interaction with
  Automation*: automate perception/analysis freely; gate the act stage.
- **[A-2]** Anthropic (2026), *Configure Permissions (Claude Agent SDK)*: risk-tier tools;
  auto-run the trivial, gate the consequential.
- **[K-1]** Taylor (1903/1911), *Scientific Management*: management by exception, handle the
  routine autonomously, surface only deviations.
- **[C-19]** Vaccaro, Almaatouq & Malone (2024), *When Combinations of Humans and AI Are Useful*:
  human-AI teams often underperform the better of either alone.

*Also drawn on:* [A-17] recognition bottleneck (gates cut occurrence, not catching); [A-18, A-21]
rubber-stamping under pressure; [A-4] the shell-boundary / undo trap; [A-23] the lethal trifecta;
[C-21] illusory oversight / moral crumple zone.

*LoopRails guide, G0 (Trivial). Companion to [`framework.md`](./framework.md), 2026-06-22.*
