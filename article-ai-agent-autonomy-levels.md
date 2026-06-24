# AI Agent Autonomy Levels: From Logged to Locked Down

**AI agent autonomy levels** describe how much an agent is allowed to do on its own before a human is involved, ranging from acting silently with no record, through acting and notifying you afterward, up to asking permission for every step, and finally handing the decision off entirely. They are a control dial rather than a single switch. Most teams set one level for the whole agent, which is the mistake. Set the autonomy level *per action*, based on how bad the action could be and whether a human could actually catch a mistake in time. This article documents the LoopRails autonomy ladder, seven rungs from L0 to L6, and shows how to pick the right rung for each thing your agent can do.

The ladder is part of LoopRails, a free, practitioner framework for human-in-the-loop oversight of AI agents. Its method is **Grade · Guard · Show · Prove** (see the [framework](framework.html)): grade each action by its consequences, guard it with controls matched to that grade, show the human the real action and its effects, and prove the oversight actually catches mistakes before you trust it.

## The LoopRails autonomy ladder: L0 to L6

Each rung trades autonomy for control. Lower rungs are fast and cheap and assume the action is safe or recoverable. Higher rungs are slower and more expensive and assume the action could hurt. Here is the full ladder.

| Level | Name | What happens |
|---|---|---|
| **L0** | Autonomous, silent | The agent acts; nothing is surfaced to anyone. |
| **L1** | Autonomous, logged | The agent acts; the action is recorded for audit. |
| **L2** | Notify-after | The agent acts, actively surfaces what it did, and offers a cheap undo. |
| **L3** | Confirm-before | The agent proposes ONE action and blocks for approve / edit / reject / respond. |
| **L4** | Plan-approve | The agent proposes a multi-step plan; a human approves before execution, with checkpoints between steps. |
| **L5** | Co-execute (forcing) | The human pre-commits or decides key steps BEFORE seeing the agent's answer, a forcing function against automation bias. |
| **L6** | Escalate / forbid | The agent must hand off to a human, or must not act at all. |

A few distinctions are where people get the ladder wrong.

**L0 versus L1 is invisible versus auditable.** L0 leaves no trace; use it only for actions so trivial a record would be noise. L1 is the floor for almost everything else, because [logging](rail-logged.html) is what makes every other control verifiable after the fact. If you cannot tell what the agent did, you cannot tell whether any oversight worked.

**L2 carries its safety in the undo, not the notification.** Notify-after is only safe when the action is genuinely reversible. The point is to give the human a cheap, fast path to roll back, not to inform them so they can panic. No undo, no L2.

**L3 and L4 are both "ask first," at different grains.** L3 gates a single action. L4 gates a *plan* and checkpoints between steps, so the human is not blindsided by what comes three actions later. L4 fits work that is multi-step and consequential as a whole, even when each step looks benign alone.

**L5 is the rung most people skip, and the one that fights automation bias.** Automation bias is the well-documented tendency to over-trust a system's suggestion and approve it without real scrutiny. The higher you climb, the worse it gets, because every prior correct action teaches the human the next one is fine too. L5's answer is a forcing function: make the human commit to a decision *before* they see the agent's recommendation, so they cannot simply defer to it.

**L6 is the right answer when a human cannot catch the mistake in time.** Some actions are irreversible and severe enough that no in-flight review would help. For those, the agent escalates to a human decision-owner or is forbidden from acting outright.

## Choosing an autonomy level by grade

You cannot pick a rung until you know what the action is worth. LoopRails grades every action an agent can take on three axes (**reversibility × blast radius × stakes**) and the *highest* axis sets the grade. That produces four grades, and each grade maps to a band on the autonomy ladder.

| Grade | What it means | Autonomy band |
|---|---|---|
| **G0 (trivial)** | Fully reversible, contained, near-zero stakes | L0 to L1 |
| **G1 (low)** | Reversible with some effort, limited blast radius | L1 to L2 |
| **G2 (high)** | Hard to reverse, shared blast radius, real money/trust | L3 to L4 |
| **G3 (critical)** | Irreversible and external or severe | L4 to L5, plus prevention; L6 when a human can't catch it in time |

The grade-to-level mapping is the spine of the whole framework, so here it is with concrete examples.

**G0 to L0/L1.** A read-only query, listing files, reformatting a comment. These are reads and trivial, fully recoverable edits. Run them and log them, no prompt at all. Asking for approval here just trains people to click "yes" without looking, which poisons their judgment on the prompts that actually matter. See the [G0 guide](guide-g0.html).

**G1 to L1/L2.** Renaming a local variable across a file, opening a draft PR, adding a label to an issue, a small refund inside a generous cap. The agent acts, then surfaces what it did with a one-click undo. The safety comes from the undo, not the prompt. See the [G1 guide](guide-g1.html).

**G2 to L3/L4.** This is where confirm-before earns its keep. A `git push` to a shared branch, merging to `main`, emailing a customer, deploying to staging: these are hard to reverse and have a shared blast radius, but a human shown the real change can realistically catch a mistake. A single push is an L3 confirm-before-acting prompt. A multi-step migration or a release sequence is an L4 plan-approve, because the human needs to see the whole arc and have checkpoints between steps. See the [G2 guide](guide-g2.html).

**G3 to L4/L5, prevention, or L6.** Deleting production data, a wire transfer, a mass email to every customer, force-pushing over a shared branch. Here the default is *not* a single approval click, because a single click is not enough oversight for an irreversible, severe action. Prefer prevention by design: cap the blast radius, force reversibility, sandbox the dangerous version so it cannot execute. Where a human must stay in the decision and *can* still catch the mistake, use L5 co-execute so they commit before seeing the agent's answer. And where the human genuinely cannot catch the mistake in the available window (the diff is too large to read, the consequence is invisible until later, there is no time to react), drop to L6: escalate to a human decision-owner or forbid the action. See the [G3 guide](guide-g3.html).

That last branch is the heart of LoopRails. The core question is never "should a human review this?" It is **"can a human realistically catch this mistake in time?"** If the honest answer is no, a confirm-before prompt is a delay with a signature on it, not oversight. Prevent the outcome or escalate instead of gating.

The evidence backs this up. Research on AI coding agents (see the [LoopRails codex](codex.html)) found that requiring plan-approval before action cut attack occurrence from roughly 90% down to 60 to 74%, a real but partial dent. Yet once a problem surfaced in front of a human, intervention success stayed at only 9 to 26% across every oversight strategy tested. Climbing the ladder to L4 reduced bad *actions*; it did not make humans reliable *detectors* of those actions. That gap is exactly why high grades need prevention and forcing functions instead of one more approval prompt.

Grade your own actions with the [interactive grader](index.html#grader) or the one-page [cheatsheet](cheatsheet.html), and the right rung tends to fall out.

## Autonomy should change over time and within a session

A fixed autonomy level per action is the starting point, not the destination. Two things should move it.

**Autonomy should ratchet up as trust is earned, with emphasis on earned.** A new agent, a new tool, or a new task type should start lower on the ladder. As you accumulate logged evidence that it behaves correctly on a class of actions, you can promote that class up a rung. This only works if you actually have the evidence, which is why [logging](rail-logged.html) at L1 is the floor: promotion should be driven by a trail you can audit, not by a vague sense that "it's been fine so far." Promote a class, not a single instance, and promote on data.

**Autonomy should ratchet down within a session when the situation gets riskier.** Context changes the grade. The same `git push` is G2 on a feature branch and effectively G3 the night before a major release with a change freeze in effect. An agent that has started behaving oddly, retrying in a loop, touching files outside its task, escalating its own permissions, should be pulled down the ladder, not left at its promoted level. Session state matters: an action that was L2 at the start can warrant L4 once the blast radius has grown.

**Beware the slow drift to the bottom of the ladder.** The most common real failure is everything quietly sliding toward L0/L1, not picking the wrong rung once, all because the agent is reliable and the prompts feel like friction. That is how human-on-the-loop monitoring decays into out-of-the-loop disengagement (see [human-in-the-loop vs on-the-loop](article-in-the-loop-vs-on-the-loop.html)). The defense is to make demotion automatic on risk signals rather than relying on a human to notice and intervene.

Whatever rung an action sits on, it should satisfy **RAIL**: the action is **R**eversible where possible, the actor is **A**uthorized for it, the operation is **[I](rail-interruptible.html)nterruptible** so anyone can stop the agent quickly and blamelessly, and the decision is **[L](rail-logged.html)ogged**. Interruptibility is what makes the lower, autonomous rungs safe at all. If you cannot stop the agent cheaply, "the human can intervene" is a claim you cannot cash.

## Key takeaways

- **AI agent autonomy levels** run L0 (autonomous, silent) to L1 (logged) to L2 (notify-after with undo) to L3 (confirm-before) to L4 (plan-approve) to L5 (co-execute, forcing) to L6 (escalate / forbid).
- Set the level **per action, not per agent.** Grade each action by reversibility × blast radius × stakes, then map: G0 to L0/L1, G1 to L1/L2, G2 to L3/L4, G3 to L4/L5 plus prevention, and L6 when a human can't catch the mistake in time.
- Reads and trivial edits sit at **L1 to L2**; a `git push` is typically **L3**; prod-touching and irreversible actions are **L4/L6** with prevention.
- **L5 exists to fight automation bias:** make the human commit before seeing the agent's answer. Higher autonomy needs forcing functions, not just more prompts.
- Autonomy should **ratchet up on earned, logged trust and ratchet down on risk signals.** Guard against the slow drift to the bottom of the ladder.
- The test for every rung is the same: **can a human realistically catch this mistake in time?** If not, prevent or escalate rather than gate.

## Where to go next

Stop guessing which rung an action needs and grade it. Run your real actions through the [LoopRails grader](index.html#grader) to get a G0 to G3 grade and matched controls, then read the full method in the [framework](framework.html) and put it into practice with the [playbook](playbook.html). For more on the decision behind the ladder, see [when an AI agent should ask for approval](article-ai-agent-approval.html) and [whether human-in-the-loop actually improves AI safety](article-hitl-ai-safety.html). Keep your agents on the rails, at the lowest rung the action's consequences will actually allow.
