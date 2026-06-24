# Designing for a G3 (Critical) Action

> A LoopRails in-depth guide. Companion to the [framework](./framework.md) and the
> [codex](./codex.md). Bracketed tags like `[A-17]` point to the annotated evidence in the codex.

## TL;DR: what makes an action G3

A **G3 (critical)** action is one that is **irreversible AND (external or severe)**. Concretely:
delete prod data, deploy to prod, execute a payment, post publicly, send an external email, or run
`rm -rf`. In the framework's grading scheme, consequence is driven by the *highest* of three
dimensions (reversibility, blast radius, and stakes). A single action that is irreversible *and*
reaches third parties (external) *or* carries severe stakes (safety, legal, security, finance,
reputation) is critical regardless of how the others score.

One trap dominates: **grade by *real* reversibility, not by whether your tool has an "undo" button.**
Checkpoint/undo typically covers an agent's structured edits but not shell side-effects (`rm`, `mv`,
network calls), so a Bash `rm -rf` is G3 even if your editor has rewind [A-4].

The headline guidance for G3: **prevent, don't merely review.** A confirmation gate at this grade is
usually a rubber stamp and a scapegoat rather than a safeguard. Everything below explains why, and what to
build instead.

## Is a human in the loop the answer here? Almost never on its own.

The intuitive design, "it's critical, so make a human approve it," is at G3 usually the *wrong*
primary safeguard. Two well-evidenced facts make a lone human approver close to worthless as the
main line of defense.

**1. The recognition bottleneck.** Approval gates reliably reduce the *occurrence* of bad actions but
barely improve the human's ability to *catch* one once it surfaces. The cleanest evidence is a
within-subjects study of computer-use-agent oversight strategies: plan-approval cut problematic-action
occurrence to 60-74% (from ~88-90%), yet **intervention success, actually catching a problem once it
appeared, stayed at just 9-26% across every strategy tested** [A-17]. The failure mode was not
inattention. It was *rationalization and normalization*. A confident, fluent, wrong agent gets its
action approved because the human talks themselves into it.

**2. Automation bias.** People use a reliable-but-imperfect aid as a *heuristic shortcut for vigilant
processing*. They commit "commission errors," following the automated directive even when reliable
contradictory information is in front of them [F-9]. Experimentally, participants *with* an aid
performed *worse* than those without it [F-9]. Bias gets *worse* as the agent gets more reliable.
This is the empirical floor under every "a human will catch the model's mistakes" claim.

**3. The moral crumple zone.** A human placed in the loop without authority, awareness, ability, and
time becomes a *moral crumple zone*: a liability sponge who absorbs blame for failures they could
not have prevented, protecting the system and its makers rather than improving outcomes [D-16]. An
"approver" who clicks Yes on a one-line "Execute payment of $40,000?" prompt with no way to verify it
is nominally responsible and actually powerless. That is theater, and worse than theater, because it
manufactures the *appearance* of control while removing the pressure to build the real thing.

So for a G3 action, treat "there is a human in the loop" as the *last* layer rather than the first, and
only if that human meets the four A's below. The design question is not "who approves?" but "how do
we make the worst case impossible, contained, or recoverable *before* anyone is asked to approve?"

## How to design it properly: prevention-first, defense in depth

The mistake-proofing hierarchy from manufacturing ranks controls bluntly:
**elimination/prevention > detection/warning > reliance on human vigilance** (the weakest) [N-17 lineage].
G3 design should lean on the top of that hierarchy. Layer the following; none is sufficient alone.

**1. Contain it by moving the safety boundary off the per-action prompt.** Run high-autonomy work in a
sandbox with no production network, **scoped and expiring credentials**, and **blast-radius caps**
(max spend, max deletions, max recipients) plus rate throttles [A-23, O-3]. *Why:* this makes the
worst case *contained rather than reviewed*, the single highest-leverage and most underused control.
Pre-action admission control beats post-hoc review because a fast autonomous actor outruns a human
and the logs [O-2]. Grant privilege **just-in-time**, never standing (a permit-to-work: scoped,
time-boxed, named approver, explicit hand-back to a safe state) [N-13].

**2. Make it reversible wherever at all possible, so it stops being G3.** Reversibility *beats*
confirmation: confirmation dialogs habituate users into reflexive click-through and don't prevent
errors; undo is the superior safety net. Engineer reversibility in: deploy to **staging** first;
prefer **soft-delete** over hard delete; use **delayed execution** with a cancel window. *Why:* a
reversible action drops a grade, and a delay buys the one thing review modes need and rarely have,
which is *time to intervene before harm lands*. The Knight Capital deploy cost ~$440M in 45 minutes because a
fast autonomous actor had no kill switch and no staged rollout [O-4].

**3. Add a verified runtime shield that can veto even under prompt injection.** You cannot formally
verify an LLM, but you can verify a *small guard*. The Simplex / runtime-assurance pattern pairs the
complex unverifiable agent with a simple, formally verified safe controller that intercepts each
action and overrides only those that would breach a hard constraint ("never delete prod," "never
send funds > $X"), enforced regardless of what the LLM "decides," **including under prompt injection**
[O-17, O-18]. *Why:* the confused-deputy problem *is* prompt injection. An agent with ambient
authority is weaponized when untrusted content shares the inference pathway with legitimate
instructions. A soft human gate can be talked around; a verified shield cannot.

**4. Require two-party approval (maker-checker), proposer ≠ approver.** For irreversible actions,
require two independent authorizers; the party that *proposed* the action must not be the party that
*approves* it (segregation of duties / four-eyes) [O-1, N-15]. **Independence is everything.** An
agent re-reading its own work just confirms its own bias; a genuinely independent second check
(different model, prompt, and context, or a different human) catches materially more errors but only
as a *backstop*, never the primary control [N-15]. *Why:* it breaks the single-point rationalization
that the recognition bottleneck exploits.

**5. Keep a break-glass path for genuine emergencies.** Default to zero standing privilege; sensitive
scopes are elevated just-in-time behind approval and revoked after. Emergency elevation ("break
glass") must be possible, but **auditable, alarmed, and reviewed after the fact** [O-14]. *Why:* if
the only options are "blocked forever" or "always open," people prop the door open. A loud, logged
emergency path keeps the safe default safe.

**6. Escalate or forbid when a human can't be a real safeguard.** When controllability is low (the
human can't detect right from wrong from what's shown, or there's no time to intervene), do *not*
fall back to L3/L4 review. Escalate to a decision owner with full provenance, or forbid the action
outright (L6) [framework §3]. *Why:* review you know the human can't do well is a rubber stamp by
construction.

> **The mature G3 stack:** sandbox + scoped/expiring credentials + blast-radius caps, then make it
> reversible (staging / soft-delete / delay), then verified runtime shield, then maker-checker (proposer ≠
> approver), then break-glass for emergencies, then escalate/forbid when the human can't really catch it.

## The four A's gate

If, after all the prevention above, you *keep* a human in the loop on a G3 action, that human must
have all four of the following, or the oversight is theater. (Synthesized from tracking + tracing
[C-20, D-13], Billings' "informed, involved, in command," and the requirement for "authority and
competence to change the decision.")

- **Authority:** the human can actually stop, change, or reverse the action. *Absent → moral crumple
  zone* [D-16].
- **Awareness:** the human comprehends what the agent is doing and why: real situation awareness, not
  a log dump. *Absent → automation surprise.*
- **Ability (and time):** the competence *and the time budget* to evaluate before it's too late.
  *Absent → out-of-the-loop failure.*
- **Accountability:** responsibility is traceable to an informed human, not diffused [C-20]; felt
  accountability also reduces automation bias. *Absent → responsibility gap.*

Fail any one and you have a name for the failure, not a safeguard.

## Worked examples

**Delete prod data.** *Prevent first:* the agent runs with credentials that have no `DELETE`/`DROP`
on prod; deletes are implemented as **soft-delete** with a retention window, so the action is
recoverable and no longer truly G3. A verified shield blocks any hard-delete on a prod resource
outright [O-18]. *If a real purge is needed:* maker-checker, where the agent proposes and an independent human
approves, behind a just-in-time, time-boxed grant [O-1, N-13]; blast-radius cap on row/object count
[O-3]. Never rely on the agent confirming its own destructive SQL.

**Execute a payment.** *Prevent first:* hard per-transaction and per-window caps enforced by the
shield, not by a prompt the agent can rationalize past ("never send funds > $X") [O-18, O-3]. Payments
execute on a **delay** with a cancel window (reversibility). For anything above a low threshold:
maker-checker with proposer ≠ approver [O-1]. The confused-deputy risk is acute, since an injected
instruction in an invoice or email could direct the funds, so the shield enforces the cap regardless
of instruction source [O-11/O-12 lineage].

**Deploy to prod.** *Prevent first:* deploy to **staging** with smoke tests; promote to prod via a
**staged/canary rollout** behind a feature flag, with an automatic kill switch on error-rate or
cost-burn thresholds (circuit breaker) [O-4, O-6/O-7 lineage]. A short pre-deploy gate covers only the
*killer items* (feature flags verified, dead code checked, rollback tested), kept concise because bloated
gates induce rubber-stamping [N-11]. Knight Capital is the cautionary tale: never deploy a fast
autonomous actor without a staged rollout and an emergency stop [O-4].

## Anti-patterns

- **The rubber stamp.** A bare "Approve / Reject" on an action the human can't actually verify. The
  recognition bottleneck guarantees ~9-26% catch rate [A-17]; you've built a scapegoat, not a control.
- **The YOLO cliff.** A single global autonomy switch flipped to "act on everything" with no sandbox,
  no caps, no shield. The maturity-0 failure: one config error in a fast actor and there's no kill
  switch [O-4]. Prevention and containment are not optional at G3.
- **Gameable engagement checks.** Mandatory-but-ritual gates, the kind that get clicked through
  reflexively. A *mandated* surgical checklist with thin engagement delivered **zero benefit** in a
  101-hospital study [N-12]; habituation to a repeated warning sets in neurologically by the *second*
  exposure [O-16]. A gate is only as good as the attention it commands. Don't measure "a human
  approved"; measure whether they *catch* planted errors [A-17].

## Sources

Codex tags used in this guide:

- **A-17:** exposure-vs-correction gap / recognition bottleneck; gates reduce bad actions but
  intervention success stays 9-26%.
- **F-9:** automation bias; commission errors; aided users can do worse than unaided.
- **D-16:** the moral crumple zone (human as liability sponge without real control).
- **C-20, D-13:** meaningful human control as tracking + tracing; basis for the four A's and
  Accountability.
- **A-23:** sandbox + scoped/ephemeral credentials + budget caps; the lethal trifecta.
- **O-1, N-15:** two-party approval / maker-checker / two-person rule; proposer ≠ approver.
- **N-17:** lockout-tagout: positively disable, don't politely pause (capability revocation).
- **O-17, O-18:** Simplex / runtime shield: a verified monitor that vetoes the agent, even under
  injection.
- **O-4:** Knight Capital: no kill switch on a fast autonomous actor, ~$440M in 45 minutes.
