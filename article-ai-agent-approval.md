# When Should an AI Agent Ask for Human Approval?

An AI agent should ask for human approval when a human can realistically catch the mistake in time *and* the action is consequential enough to be worth the interruption. That is the whole test. The common question — "should a human review this?" — is the wrong one, because a human placed in front of an action they cannot actually evaluate or stop will approve it anyway. If a person cannot detect the error from what is shown, or cannot intervene before the harm lands, then an AI agent approval prompt is not oversight. It is a rubber stamp, and you should prevent the bad outcome by design instead of asking for a click. So the real question behind "when should an AI agent ask for approval" is narrower and more useful: *can this human catch this mistake in this window?*

This article gives you a concrete way to answer that for every action your agent can take. It uses LoopRails, a free, practitioner-focused framework for human-in-the-loop oversight, whose method is **Grade · Guard · Show · Prove** (see the [framework](framework.html)).

## Grade the action first: reversibility × blast radius × stakes

You cannot decide whether an AI agent should ask for approval until you know what the action is worth. LoopRails grades every action an agent can take on three axes, and the *highest* axis sets the grade:

- **Reversibility** — can you undo it, and how fast?
- **Blast radius** — how many people, systems, or records does it touch?
- **Stakes** — how much money, trust, or safety is on the line?

That produces four grades, each with a default response:

- **G0 (trivial).** Fully reversible, contained, near-zero stakes. *Run and log* — no prompt at all. Example: reformatting a comment, running a read-only query, listing files. Asking for approval here just trains people to click without looking.
- **G1 (low).** Reversible with a little effort, limited blast radius. *Act, then notify, with one-click undo.* Example: opening a draft PR, renaming a local variable across a file, adding a label to an issue. The safety comes from the undo, not the prompt — see the [G1 guide](guide-g1.html).
- **G2 (high).** Hard to reverse, shared blast radius, or real money/trust in play, but not catastrophic. *Preview and approve before acting.* Example: emailing a customer, merging to `main`, deploying to staging, spending $40 inside a $200 budget. This is where well-built approval gates earn their keep — see the [G2 guide](guide-g2.html).
- **G3 (critical).** Irreversible and external or severe. *Prevent by design, or stop and ask with maker-checker, or refuse and escalate.* Example: deleting production data, a wire transfer, force-pushing over a shared branch, sending a mass email to every customer. A single approval click is not enough here — see the [G3 guide](guide-g3.html).

Grading is the part most teams skip, and it is why their prompts are either everywhere (fatigue) or nowhere (incidents). Run a few of your agent's actions through the three axes and the answer to "should this ask?" falls out. Grade your own with the [interactive grader](index.html#grader) or the one-page [cheat sheet](cheatsheet.html).

## Why most AI agent approval prompts fail

Here is the uncomfortable part. Grading tells you which actions *warrant* oversight. It does not tell you whether the oversight will *work*. Those are two different axes, and conflating them is the most common mistake in AI agent approval design.

Two failure modes are well documented.

**The recognition bottleneck.** Research on AI coding agents (see the LoopRails [codex](codex.html)) found that requiring the agent to get its plan approved before acting cut the rate of problematic actions from around 90% down to 60–74%. That sounds like a win, and partly it is — the gate reduced bad *actions*. But once a problem actually surfaced in front of a human, intervention success stayed at only 9–26% across every oversight strategy tested. The human saw the problem and approved it anyway. The failure was not inattention; it was rationalization — people talked themselves into the agent's answer.

**Automation bias.** People over-trust system suggestions and approve without scrutiny, especially under time pressure. A reviewer asked to "check the output" defaults to a shallow heuristic glance, not systematic verification. The more reliable the agent has been, the worse this gets, because every prior correct action teaches the human that the next one is fine too.

Put those together and you get the rule that drives everything else: **adding an approval prompt does not make a human a good detector of the agent's errors.** If the human cannot realistically catch the mistake — because the diff is too large to read, the consequence is invisible until later, or there is no time to react — then the prompt is theater. Worse, it makes the human a *moral crumple zone*: the person who absorbs the blame for a system they could never actually control.

## How to build approval gates that aren't rubber stamps

If you have graded an action G2 (and some G3) and decided a human genuinely *can* catch the error, build the gate so the human actually succeeds. Approval gates that work share a few concrete properties.

**Show a real diff, not a summary.** The single biggest predictor of whether a human catches an error is whether they are shown something verifiable. A summary ("I updated the auth config") is unverifiable and invites a rubber stamp. The actual change is checkable:

```diff
- ALLOWED_ORIGINS = ["https://app.example.com"]
+ ALLOWED_ORIGINS = ["*"]
```

Anyone reading that diff can see the agent just opened CORS to the entire internet. The summary hid it; the diff exposes it. The same applies outside code: show the exact recipient list before sending, the exact rows a `DELETE` will hit (run it as a `SELECT` first), the exact dollar amount and payee. Preview the *consequence*, not a description of it.

**Use maker-checker for irreversible actions.** For anything at the top of G2 or into G3, the proposer must not be the approver. An agent re-reading its own plan just confirms its own bias, and so does the developer who has been pairing with it for an hour and has already bought into its framing. A second, *independent* party — a different human, or at minimum a human who has not been in the loop on this task — approves. Independence is the entire value. This is the four-eyes principle that finance and aviation have used for decades, applied to agent actions.

**Set value-conditional thresholds.** You do not need to gate every instance of an action class the same way. A common and effective real pattern is value-conditional approval: require a human only above a meaningful threshold. A refund under $50 acts and notifies (G1); a refund over $5,000 requires a second approver (G3). A budget charge inside the cap runs; the over-budget tail escalates. This concentrates scarce human attention where it changes the outcome and keeps the small stuff out of the human's way, so the prompts that *do* fire still get read.

**Bind the approval to the server.** An approval that lives only on the client is forgeable. If "approved: true" is just a field in the message history the agent replays, an attacker — or a confused retry loop — can fake or replay it. The approval must be cryptographically bound to the server so it cannot be forged or replayed: the server issues a signed, single-use token tied to the specific action, and refuses to execute without it. A gate that is not server-bound is a UX affordance, not a security control.

**Prefer prevention over gating wherever you can.** The best approval gate is often the one you did not need, because you made the action safe instead. If you can make a G2 action one-click reversible — push to a feature branch behind a PR instead of straight to `main` — it drops to G1 and the approval question dissolves. Reversibility ([rail-reversible](rail-reversible.html)) is a first-class safety move, not a fallback.

Every real gate should also satisfy RAIL — the action is **R**eversible where possible, the actor is **A**uthorized for it ([rail-authorized](rail-authorized.html)), the operation is **I**nterruptible, and the decision is **L**ogged. If you cannot check those four, you do not have a gate; you have a hope.

## What NOT to do

**Denylist theater.** Maintaining a blocklist of "dangerous" commands and treating it as security is one of the most common mistakes. A blocklist of command strings is trivially bypassed — via base64 encoding, subshells, quoting tricks, or having the agent generate and run a script that the denylist never sees. Pattern-matching the agent's commands is not a sandbox. If you need to contain what an agent can do, contain the *environment* (no network, scoped credentials, ephemeral machines), not the command string.

**Forgeable client-side approvals.** As above: if the approval is not bound to the server, it is decorative. Assume the message history can be edited or replayed and design so that an unbound "yes" buys the attacker nothing.

**The rubber stamp itself.** Watch your own metrics. If your approval rate is uniformly near 100%, your gate is not catching anything — it is laundering responsibility. Measure *intervention success* (how often a human actually changes the outcome), not approval volume. A gate that never rejects is not oversight.

## When to prevent instead of asking for approval

This is the move that separates real oversight from theater. When an action is high-consequence but the human *cannot* realistically catch the error — too much to review, no time to react, or the failure is invisible until after it lands — do not ask for approval. Prevent the bad outcome instead:

- **Shrink the consequence.** Make it reversible or cap its blast radius (max spend, max recipients, max rows) so the worst case is survivable.
- **Sandbox it.** Move the safety boundary off the per-action prompt and into the environment.
- **Force a real decision.** Where you must keep a human, make them engage *before* seeing the agent's recommendation, so they cannot just defer to it.
- **Refuse and escalate.** If none of that is possible, the agent should not take the action — hand it to a human decision-owner with a context-rich summary.

A force-push over a shared branch should not be a G2 confirm-before-acting prompt; the human cannot un-destroy the history they just approved. It is a G3: prevent by design, or maker-checker, or refuse. The test is always the same — *can a human catch this in time?* If the honest answer is no, an approval prompt is the wrong tool.

## Key takeaways

- The right question is not "should a human review this?" but **"can a human realistically catch this mistake in time?"** If not, prevent — do not gate.
- **Grade every action** on reversibility × blast radius × stakes into G0–G3, and match the response: run+log (G0), act-then-notify with undo (G1), preview+approve (G2), prevent/maker-checker/refuse (G3).
- Approval gates reduce bad *actions* but barely improve a human's ability to *catch* them — automation bias and the recognition bottleneck are real and well documented.
- Build gates that work: **real diffs, maker-checker for irreversible actions, value-conditional thresholds, server-bound approvals, and prevention over gating.**
- Avoid **denylist theater** and **forgeable client-side approvals** — neither is a security boundary.
- Measure intervention success, not approval rate. A gate that never rejects is a rubber stamp.

## Where to go next

Grade your agent's actions with the [interactive grader](index.html#grader), then turn each grade into a concrete oversight design with the [playbook](playbook.html). For the full method and the evidence behind every claim, read the [framework](framework.html) and the [codex](codex.html).
