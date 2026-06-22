# LOOP — Calibrated Oversight for Agentic AI
## The framework (reference edition) · method: **Grade · Guard · Show · Prove**

> The full method and reasoning. For the quick do-this version see the
> [`playbook.md`](./playbook.md); for the evidence behind every claim see [`codex.md`](./codex.md).
> Bracketed tags like `[A-17]`, `[F-7]`, `[E-13]` point to the annotated source in the codex.
> Where the codex asks *what is known*, this document asks *what to do about it*.
>
> **The four moves** map onto the sections below — **Grade** the action (§2) · **Guard** it
> (§3 mode + §4 control surfaces) · **Show** the human (§5 loop episode) · **Prove** it works
> (§6 defend + §7 validate). The reframe (§0) and core model (§1) come first.
>
> **Audience:** anyone designing, building, or reviewing an agentic LLM system (coding agents,
> copilots, computer-use agents, autonomous assistants) who has to decide where, how, and how much
> a human should be kept in control.

---

## 0. The reframe

Most HITL design starts from the wrong question: *"Should there be a human in the loop?"* The
codex shows that question is nearly meaningless, because two facts make a naive "yes" worthless:

1. **Humans are unreliable detectors of automation error.** Automation bias and complacency are
   structural, attentional, and *training-resistant*; they afflict experts; and they get *worse*
   as the agent gets more reliable [F-7, F-4, E-7, D-18]. Empirically, adding approval gates
   reduces bad *actions* but barely improves the human's ability to *catch* one — the
   exposure-vs-correction gap [A-17]. A human told to "review the output" will rubber-stamp it
   [A-18, A-21, D-4].
2. **Nominal oversight is not meaningful control.** A human placed in the loop without authority,
   awareness, ability, and time becomes a *moral crumple zone* [F-19, D-16] — a liability sponge
   that legitimizes a flawed system without improving it [D-14, D-15].

So the framework replaces the binary question with four better ones, asked **per action**, not
per system:

- **For which actions** does a human need to be involved? (§2 — grade by consequence)
- **In what role and at what level** of control? (§3 — match an oversight mode)
- **With what machinery** to make that control real and to blunt the predictable failure modes?
  (§4 control surfaces, §6 defenses)
- **When we bring the human in, what must that oversight *moment* contain** to actually work?
  (§5 — design the loop episode)
- **How do we know the oversight actually works** rather than merely existing? (§7 — validate)

### The goal, stated precisely

> **Meaningful human control over agent behavior, with reliance calibrated to the agent's true
> reliability, at a cost (friction, attention, latency) proportionate to the consequences.**

"Calibrated" [F-1] and "proportionate" are the load-bearing words. Maximal oversight is as wrong
as none: it manufactures alert fatigue [H-10], deskills the overseer [E-22], and trains
rubber-stamping [A-17]. The art is *allocation* of a scarce, leaky resource.

### The four A's of meaningful control

Every oversight point should be tested against four conditions (synthesized from tracking+tracing
[C-20, D-13], Billings' "informed, involved, in command" [E-21], and WP29's "authority and
competence to change the decision" [D-4]). If any is absent, the oversight is theater:

| | The four A's | Failure if absent |
|---|---|---|
| **Authority** | The human can actually stop, change, or reverse the action. | Crumple zone [D-16] |
| **Awareness** | The human comprehends what the agent is doing and why — situation awareness, not a log dump [E-12, G-17]. | Automation surprise [H-5] |
| **Ability** | The human has the competence and the *time* to evaluate before it's too late [H-19, E-22]. | Out-of-the-loop failure [E-13] |
| **Accountability** | Responsibility is traceable to an informed human, not diffused [C-20]. Felt accountability also reduces bias [F-11]. | Responsibility gap [D-15] |

---

## 1. The core model: Consequence × Controllability

Two independent axes decide the oversight strategy for any agent action.

- **Consequence** — how much oversight is *warranted*. A function of **reversibility × blast
  radius × stakes** (§2).
- **Controllability** — how much oversight can actually be *effective*. Can a human **detect** the
  problem from what's surfaced, and **correct** it **in time**? Driven by detectability, the time
  budget, human competence (deskilling [E-22]), model steerability [A-19], and reviewer span [H-22].

The crucial insight — and the thing most real systems get wrong — lives in the interaction of the
two axes:

```
                 high │  REVIEW IS A TRAP                 GENUINE OVERSIGHT
                      │  (high stakes, but humans         (high stakes, and humans
                      │   can't catch errors here)         can catch/correct in time)
        C             │  → PREVENT, don't review:          → invest in real review:
        o             │    constrain scope, sandbox,         plan-approve, co-execute,
        n             │    make reversible, pre-commit,      forcing functions, strong
        s             │    or forbid. Reviewing is           awareness displays.
        e             │    rubber-stamping. [A-17,F-7]       [F-21, A-20, E-13]
        q  ───────────┼─────────────────────────────────────────────────────────
        u             │  LET IT RUN                        LIGHT TOUCH
        e             │  (low stakes, low control)         (low stakes, easy to catch)
        n        low  │  → autonomous + logged;            → autonomous + notify/undo;
        c             │    don't spend attention here.       cheap reversibility is enough.
        e             │    [budget interruptions, H-21]      [G-14]
                      └─────────────────────────────────────────────────────────
                          low                Controllability               high
```

**The top-left quadrant is the one that kills you.** When consequences are high but the human
*cannot* reliably detect or correct the error in time, adding a confirmation gate does not produce
safety — it produces a rubber stamp and a scapegoat. The recognition bottleneck [A-17] and
automation bias [F-9, D-18] guarantee it. The only valid moves there are **prevention** strategies
that don't depend on the human being a good detector:

- **shrink consequence** → make the action reversible/undoable [G-14, A-4], or narrow its blast radius;
- **raise controllability** → improve detectability (verification-oriented evidence, not persuasion [F-20]), buy time (stage the action), or force engagement (decide-before-seeing [F-21]);
- **remove the action** → constrain scope, sandbox so the worst case is contained [A-23], or forbid it and escalate.

Everything in §2–§7 is machinery for moving actions out of the top-left quadrant.

---

## 2. Step one — GRADE the action by consequence

You cannot allocate oversight until you know what each agent action is *worth*. Grade every
capability the agent has (every tool, every action class) on three dimensions:

| Dimension | Low (0) | Medium (1) | High (2) |
|---|---|---|---|
| **Reversibility** | One-click undo / checkpointed [A-4] | Recoverable with effort | Irreversible (sent, paid, deleted, published, executed) |
| **Blast radius** | Self / local workspace | Shared / team state | External / third parties / public |
| **Stakes** | Trivial | Meaningful (money, time, minor harm) | Severe (safety, legal, security, finance, reputation) |

**Consequence Grade** = driven by the **highest** dimension (a single irreversible-external action
is critical no matter how the others score):

| Grade | Definition | Examples |
|---|---|---|
| **G0 — Trivial** | all dimensions low | read a file, run a read-only query, draft text locally |
| **G1 — Low** | at most one medium, none high | edit a local file, install a dev dependency, run tests |
| **G2 — High** | any one dimension high, or ≥two medium | `git push`, modify shared infra, send an internal message, spend within a budget |
| **G3 — Critical** | irreversible **and** (external **or** severe stakes) | delete prod data, deploy to prod, send external email, execute a payment, run `rm -rf`, post publicly, take a legally significant decision [D-2] |

> **The shell boundary trap [A-4].** Checkpoint/undo typically covers an agent's *structured*
> edits but **not** shell side effects (`rm`, `mv`, `cp`, network calls). Grade by *actual*
> reversibility, not by whether your framework has a "rewind" button — a Bash command that deletes
> files is G2–G3 even if your editor has undo.

---

## 3. Step two — MATCH an oversight mode

Oversight has two dials, not one (from Sheridan's levels [E-4] and Parasuraman's stages [E-6],
made concrete with modern permission practice [A-2, A-5]):

**The stage dial** — *which* part of the agent's processing is overseen. Automate the early stages
freely; gate the late ones, where over-trust and lost authority bite hardest [E-6]:

> acquire information → analyze → **recommend/decide** → **act**

**The level dial** — *how much* the human is in control at the gated stage:

| Level | Mode | What happens | Human role |
|---|---|---|---|
| **L0** | Autonomous, silent | Agent acts; nothing surfaced | none |
| **L1** | Autonomous, logged | Agent acts; recorded for audit | post-hoc audit |
| **L2** | Notify-after | Agent acts; actively surfaces it; cheap undo | react / undo [G-14] |
| **L3** | Confirm-before | Agent proposes one action; blocks for approve / **edit** / reject / respond [A-8] | gatekeeper |
| **L4** | Plan-approve | Agent proposes a multi-step plan; human approves before execution; checkpoints between steps [A-20] | planner / approver |
| **L5** | Co-execute (forcing) | Human pre-commits or decides key steps *before* seeing the agent's answer [F-21] | co-driver |
| **L6** | Escalate / forbid | Agent must hand to a human or must not act [A-15, D-12] | decision owner |

### Default mapping (grade → mode)

| Grade | Default level for the **act** stage | Rationale |
|---|---|---|
| **G0** | L0–L1 | Spending attention here is waste; it manufactures alert fatigue [H-21, F-17] |
| **G1** | L1–L2 | Reversibility + notification is sufficient; undo beats confirmation [G-14] |
| **G2** | L3–L4 | Block for approval; show a preview/diff; plan-approve multi-step work |
| **G3** | L4–L5 **plus prevention** — and **L6 if controllability is low** | Review alone is a trap at this grade [A-17]; see §1 top-left quadrant |

This is the default. The **controllability overlay** then adjusts it:

- **Low detectability** (the human can't tell right from wrong from what's shown) → *don't* rely on
  L3/L4 review; move to prevention (§1) or invest in verification-oriented evidence [F-20].
- **Low time budget** (no time to intervene before harm) → review modes are useless [H-19]; make
  the action reversible or stage it so there *is* time.
- **Low model steerability** (the agent can't actually be interrupted/corrected mid-task [A-19]) →
  prefer plan-approve *before* execution (L4) over mid-flight steering you can't trust.
- **High reviewer load / fan-out** (one human, many agents [H-22]) → you cannot put every action at
  L3; reserve human attention for G2–G3 and pool oversight.

### Make it dynamic, not static

A fixed autonomy setting is wrong; the right level changes with context [E-14, A-2]. Escalate the
level automatically on:

- **uncertainty** — the agent's own confidence is low, or it's outside its tested domain [A-6, F-1];
- **novelty / drift** — an action unlike what was approved before, or scope creep [A-18];
- **trifecta exposure** — the action newly combines private data + untrusted input + external comms
  [A-23] (see §6);
- **accumulated blast radius** — many small G1 actions composing into a G2 effect.

And always make **stepping *down*** to a lower level easy and visible — the "children of the magenta
line" failure is riding maximum autonomy into a corner with no graceful way back to manual [H-6].

### Brief by intent, not by steps

The military/management answer to delegation transfers directly. Use **commander's intent +
mission orders** — state the purpose, desired end-state, and hard constraints; specify *results to
attain, not how* [K-7] — and run **management by exception**: handle the routine autonomously,
escalate only deviations [K-1], bounded by a small set of pre-authorized "rules of engagement"
[K-12]. This is the principal–agent bargain made concrete [J-2]: oversight is *costly monitoring*,
so monitor the exceptions, not everything — and remember that some duties are simply *non-delegable*
and must keep a human decision-maker as a matter of law [J-15].

---

## 4. Step three — INSTRUMENT the control surfaces

Seven concrete mechanisms implement the modes above. Each has a right time and a documented pitfall.

1. **Permissioning / gating** — allow/deny/ask rules, risk-tiered tools [A-2, A-6].
   *Use for:* enforcing the grade→mode mapping. *Pitfall:* precedence and inheritance are
   load-bearing and subtle (allow-lists don't constrain bypass mode; subagents inherit autonomy)
   [A-2]; **string-matching denylists and client-side approvals are not security boundaries** —
   they're bypassable/forgeable [A-14, A-12]. Gate for *UX*; sandbox for *security*.

2. **Preview / diff / dry-run** — show the concrete effect before committing [A-20, A-22].
   *Use for:* G2 actions where the human *can* read the diff. *Pitfall:* a preview the human can't
   actually evaluate is decorative; pair with verification evidence, not just a rationale [F-20].

3. **Interrupt / steer / cancel** — pause, redirect, retract mid-run [A-8, A-19].
   *Use for:* long-horizon tasks. *Pitfall:* models are genuinely weak at honoring mid-task
   changes [A-19] — treat steerability as a capability you must test, not assume; prefer
   plan-approval when it's poor.

4. **Checkpoint / undo / rollback** — snapshot state; one-click revert [A-4].
   *Use for:* making actions reversible so they drop a grade and you can prefer undo over
   confirmation [G-14]. *Pitfall:* the shell boundary [A-4] — know exactly what is *not* covered.

5. **Sandbox / environment control** — no-network containers, scoped/ephemeral credentials, budget
   caps, disposable machines [A-23, A-1]. *Use for:* moving the safety boundary off the per-action
   prompt so high-autonomy work is *contained* rather than *reviewed*. *Pitfall:* none major — this
   is the highest-leverage control; underused.

6. **Escalation / handoff** — transfer control to a human with a generated context summary [A-15,
   A-6, A-10]. *Use for:* G3 actions, low-confidence cases, and async approval that may take hours
   [A-10]. *Pitfall:* the handoff itself is a failure point — make it anticipatory and context-rich,
   not a panic dump [H-7]; budget for re-engagement latency [H-19].

7. **Monitoring (incl. AI-supervising-AI)** — parallel supervisors and always-on monitors that can
   observe→intercept→escalate [A-15], plus AI-control protocols that route scarce human review to
   flagged actions [C-22]. *Use for:* scaling oversight past human span [H-22]. *Pitfall:* it
   relocates trust into the supervising AI's blind spots [B-20, C-8]; classifiers have real
   false-negative rates [A-3]. Defense in depth, not a silver bullet.

> **Layer them.** No surface is sufficient alone. The mature stack is: *sandbox the environment
> (5) → gate by grade (1) → preview/plan high grades (2,4) → keep interrupt + undo available
> (3,4) → monitor for drift (7) → escalate the critical (6).*

**These surfaces are not new — other industries hardened them first (Part IV of the codex).**
Jidoka's stop-on-anomaly and the **andon cord** [N-1, N-4] are escalation + a universal, blameless
interrupt; finance's **circuit breakers and kill switches** [O-6, O-7] are automatic-halt +
emergency-stop; **four-eyes / maker-checker** and the **two-person rule** [O-1, N-15] are two-party
approval for high grades (the proposer must not be the approver); **poka-yoke**, **lockout-tagout**,
and **least-privilege / capabilities** [N-6, N-17, O-10, O-11] are capability-removal — make bad
actions *impossible*, not merely discouraged (a denylist the agent can evade is policy, not a
boundary [A-14]); **permit-to-work** [N-13] is scoped, time-boxed, named privilege elevation; and
**runtime shields / the Simplex architecture** [O-17, O-18] are the verified monitor that vetoes the
agent even under prompt injection (the confused-deputy problem [O-11, O-12]). Borrow their hard-won
detail; don't reinvent it.

---

## 5. Step four — DESIGN THE LOOP EPISODE (the anatomy of a single oversight moment)

Steps §2–§4 decide *which* actions get a human and at *what mode*. This step designs the **moment
itself** — and it is where most real oversight quietly fails. The recognition bottleneck [A-17]
means putting a human in the loop does *not* make them a good detector; the episode has to be
engineered to give them clarity, context, detection affordances, and a respected attention budget,
or it collapses into a rubber stamp.

This is exactly the move in the one prior HITL framework, Cranor (2008) [O-9]: *keep humans out of
the loop wherever you can safely automate; where you must keep them, engineer the interaction so
they can actually succeed.* Her six failure points for a human in a security loop — **delivery,
attention, comprehension, application, motivation, capability** — are the same ones that sink an
agent approval prompt: the prompt is buried, attention has glazed over, the human can't tell what
the agent will actually do, they're asked to vet something they can't verify, or approval fatigue
has set in. A modern loop episode is Cranor's framework extended from a one-shot warning to an
ongoing supervisory relationship.

### The anatomy of a well-designed loop episode

Ordered. Each element supplies something that is *usually missing* from an oversight moment — the
four most-missed are flagged.

0. **Decide whether to interrupt at all (attention budget).** ⚠️*anti-fatigue* — An interruption is
   never free: it raises stress and error even when output survives [Q-23, Q-24], and habituation
   sets in by the *second* identical prompt [O-16]. Defer non-urgent asks to a task breakpoint
   [Q-28], batch them, and cap the interruptive rate; every blocking prompt must demand a *specific*
   response or it's noise [H-21]. Over-prompting is the dominant real-world way oversight dies —
   clinicians override 49–96% of alerts [H-10].

1. **State the request clearly.** ⚠️*clarity-of-request* — Exactly what is being asked: scoped,
   unambiguous, in the user's terms, with what the agent can and can't do made explicit [Q-1, G-7].
   Narrow the Gulf of Execution [G-11].

2. **Show the consequences *before* the human acts (feedforward).** ⚠️*clarity-of-consequence (your
   top missing piece)* — Preview the concrete effect of each option: what approving *does*,
   downstream side effects, and crucially **whether it is reversible** [Q-3, Q-4]. Agents
   demonstrably propose irreversible, harmful actions ([Q-5]: even the safest agent fails ~24% on a
   high-stakes tool benchmark), so consequence + reversibility preview is necessary, not decorative.

3. **Surface calibrated uncertainty.** Show the agent's confidence — calibrated and carefully framed,
   since raw numbers are misread [Q-20, Q-21]; low confidence is itself an escalation trigger.

4. **Give the provenance — "how did this even get to me?"** ⚠️*context (your second missing piece)* —
   The upstream trail that restores the overseer's situation awareness: what the agent perceived,
   what it considered and rejected, *why it escalated*, and the steps/tool-calls that led here
   [Q-7, Q-9, Q-12]. Structure it (data lineage vs. interaction history vs. rationale), ideally as a
   queryable provenance record [Q-11, Q-13]. Without it the decision-point human is out-of-the-loop
   and cannot competently intervene [Q-10, E-13].

5. **Build in error-detection affordances — support *checking*, not *trusting*.** ⚠️*detection* —
   Contrastive "why / why-not" explanations [Q-16] and diffs framed for verification; surface
   disagreement, counter-evidence, and the agent's own doubts. Beware the trap: explanations framed
   to *persuade* increase acceptance regardless of correctness [F-20, Q-20] — design them to help the
   human find the error, not to sell the answer. Use progressive disclosure (summary first, full
   plan one click away) [Q-22].

6. **Add proportionate friction — a microboundary, not sludge.** A beat of forced reflection
   (decide-before-seeing / cognitive forcing) *only* before consequential, irreversible actions
   [Q-19, Q-35]; audit that the friction is warranted by the stakes [Q-34]. Indiscriminate friction
   is sludge and breeds approval fatigue [Q-33].

7. **Use bias-safe choice architecture — and no dark patterns.** An approval prompt *is* choice
   architecture; there is no neutral UI [Q-31]. Make the safe/reversible option the default, and
   **never auto-approve on timeout** [Q-32]. Explicitly exclude the dark-pattern repertoire: no
   confirmshaming the "reject," no false urgency, no obstructing the path to deny/undo [Q-36, Q-39].

8. **Preserve accountability after the act.** Keep the human the accountable initiator (internal
   locus of control [Q-4]) and log the decision into the provenance record for audit [Q-11, C-20].

> **The compression.** If you do only four things, do the four usually missing: (1) show
> **consequences + reversibility** before acting; (2) show the **provenance** that answers "how did
> this get to me"; (3) give **detection affordances** (why/why-not + uncertainty, framed to *check*
> not to *sell*); (4) **respect the attention budget** — interrupt rarely, at breakpoints, with high
> precision. The first two are clarity, the third is detection, the fourth is anti-fatigue.

---

## 6. Step five — DEFEND against the predictable failure modes

These failures are *predictable*, so design against each one explicitly rather than hoping.

| Failure mode | Codex source | Concrete defenses |
|---|---|---|
| **Automation bias / rubber-stamping** — humans accept agent output uncritically | [F-9, A-17, A-21, D-18] | Don't rely on passive review for high grades; use **cognitive forcing functions** (decide before seeing the answer) [F-21]; show *verifiable evidence*, not persuasive rationale [F-20]; assign felt accountability [F-11]; let users *experience* the agent being wrong during onboarding [F-12] |
| **Alert fatigue** — too many low-value prompts → users dismiss all, including valid ones | [H-10, F-17, H-21] | **Budget interruptions**: every blocking prompt must demand a *specific* response [H-21]; cap the interruptive rate; most signals passive/logged; minimize false alarms (they corrode trust globally [F-17]); never fix fatigue by muting the noisiest category [H-11] |
| **Complacency from reliability** — better agent → less monitoring | [F-4, E-18, E-7] | Treat capability and complacency as rising together; keep humans actively engaged at decision points, not passive monitors [E-13]; vary/expose the agent's failure cases |
| **Deskilling** — overseer loses the expertise to oversee | [E-22, H-9] | Build in deliberate human-only practice; rotate humans through manual work; recognize a reviewer who never does the task can't review the agent |
| **Out-of-the-loop / bad handoff** — disengaged human can't take over in time | [E-13, H-7, H-19] | Anticipatory, gradual, context-rich handoffs; keep the human "warm" where takeover must be fast; don't architect safety around a fallback that can't re-engage in time |
| **Moral crumple zone** — human positioned to absorb blame without control | [F-19, D-16, D-15] | Apply the four A's (§0); if you can't give real authority+awareness+ability, *don't claim oversight* — change the design |
| **Lethal trifecta** — private data + untrusted content + external comms = exfiltration | [A-23] | Detect the combination and escalate/forbid; break a leg (read-only, no network, no untrusted input) before running unsupervised |
| **Mode confusion** — human's model of agent state diverges from reality | [H-5, E-10, G-17] | Make current mode/authority and intent continuously visible; no silent mode transitions (e.g., suggest→act); intelligibility as a safety property |
| **False-security gates** — approval/denylist mistaken for a security control | [A-14, A-12] | Bind approvals server-side; enforce real boundaries in the sandbox, not in pattern matching |

---

## 7. Step six — VALIDATE that oversight is effective

The codex's sharpest governance finding: oversight is routinely *required* and routinely
*ineffective*, and almost no one measures the difference [D-14, D-17]. Green's reform is the right
default posture: **treat "there is a human in the loop" as a claim to be demonstrated with
evidence, not a checkbox** [D-14].

Measure oversight as a system you can be wrong about:

- **Intervention success rate** — when the agent is wrong, how often does the human actually catch
  *and correct* it? (Not approval rate — *correctness* of approvals.) This is the metric [A-17]
  shows is usually terrible; if you measure nothing else, measure this.
- **Override rate + override correctness** — are humans overriding, and are their overrides right?
  Uniform high approval = rubber-stamping; biased overrides = a new bias source [D-24].
- **Time-to-detect vs. time-to-harm** — is there actually time to intervene before consequence
  lands [H-19]?
- **False-alarm / interruption rate** — is the signal economy healthy, or are you breeding fatigue
  [F-17, H-10]?
- **Calibration** — does human reliance track the agent's actual reliability across contexts [F-1]?

**Red-team the oversight, not just the agent.** Plant errors and adversarial actions and see if the
human (or the monitoring AI) catches them [A-17, C-22]. An oversight design that has never been
tested against a wrong agent is unvalidated.

---

## 8. The design procedure (putting it together)

For each agent, run the loop. It is iterative — new capabilities re-enter at step 1.

```
1. MAP      List every action the agent can take (every tool, side effect, shell command).
2. GRADE    Score each by reversibility × blast radius × stakes → G0–G3.            (§2)
3. MATCH    Assign a default oversight mode per grade; apply the controllability     (§3)
            overlay; define dynamic escalation triggers.
4. INSTRUMENT  Choose control surfaces to implement the modes; layer them.          (§4)
5. EPISODE  For each human touchpoint, design the oversight moment: clarity,         (§5)
            consequences+reversibility, provenance, detection affordances, attention budget.
6. DEFEND   For each relevant failure mode, add its specific defense.               (§6)
7. VALIDATE Instrument the effectiveness metrics; red-team the oversight; iterate.  (§7)
```

### Designer checklist

- [ ] Every action is graded; nothing defaults to L0 by accident.
- [ ] No G3 action depends on passive human review as its only safeguard. (top-left quadrant, §1)
- [ ] Reversibility is the default; blocking confirmation is reserved for the genuinely irreversible. [G-14]
- [ ] You know precisely what your undo does **not** cover. [A-4]
- [ ] High-autonomy work runs in a sandbox with scoped credentials and budget caps. [A-23]
- [ ] The lethal trifecta is detected and gated. [A-23]
- [ ] Interruptions are budgeted; every blocking prompt demands a specific action. [H-21]
- [ ] Each oversight point passes the four A's (Authority, Awareness, Ability, Accountability). [§0]
- [ ] Awareness is comprehension (L2/L3 SA), not a log dump. [E-12]
- [ ] Handoffs are anticipatory and context-rich; re-engagement latency is budgeted. [H-19]
- [ ] Autonomy is dynamic (escalates on uncertainty/novelty/drift) and stepping *down* is easy. [E-14, H-6]
- [ ] Intervention-success rate is measured and red-teamed — not just "a human approves." [A-17, D-14]
- [ ] Every oversight moment shows the request **and its consequences + reversibility** before the human acts. [Q-3, Q-4]
- [ ] Every escalation answers "**how did this get to me?**" with provenance, not just the final ask. [Q-7, Q-11, E-12]
- [ ] Detection affordances are **verification-oriented** (why/why-not, diffs, surfaced uncertainty), not persuasive rationale. [Q-16, Q-20, F-20]
- [ ] The approval UI is bias-safe: safe default, no auto-approve-on-timeout, no dark patterns. [Q-31, Q-32, Q-36]
- [ ] Interrupts are deferred to breakpoints and batched; high precision so they aren't tuned out. [Q-28, O-16]

### Maturity model

| Level | State |
|---|---|
| **0 — Binary** | One global autonomy switch (ask-everything or YOLO). Alert fatigue or unmonitored risk. |
| **1 — Graded** | Actions risk-tiered; gates match consequence. [A-6] |
| **2 — Reversible & sandboxed** | Undo-by-default + environment containment; gates reserved for the irreversible. [A-4, A-23] |
| **3 — Calibrated & dynamic** | Oversight level adapts to uncertainty/novelty; loop episodes are designed (clarity, consequences, provenance, detection); verification-oriented awareness; failure-mode defenses in place. |
| **4 — Validated** | Oversight effectiveness is measured, red-teamed, and demonstrated — meaningful control proven, not assumed. [D-14] |

---

## 9. Worked examples

### 9a. Coding agent (Claude Code–style)

- **Map/Grade:** read file (G0) · edit local file (G1, reversible via checkpoint) · run tests (G1)
  · `git push` (G2 — shared, hard to reverse) · `rm -rf` / DB migration on prod (G3 — irreversible,
  severe).
- **Match:** reads/edits autonomous+logged with undo (L1–L2); `git push` confirm-before with diff
  (L3); prod-touching commands plan-approve + escalate (L4/L6). Auto-escalate when an edit touches
  files outside the approved scope [A-18].
- **Instrument:** run in a sandbox/branch with no prod credentials [A-23]; checkpoint every edit but
  **flag that Bash deletions aren't covered** [A-4]; preview diffs for G2.
- **Episode:** the `git push` / prod prompt shows the diff and what it affects, whether it's
  reversible, *why* the agent wants to push now (provenance), surfaces test results as detection
  evidence, defaults to the safe option, and is batched so the dev isn't prompted per-file
  [Q-2, Q-3, Q-4, Q-7, H-21].
- **Defend:** combat rubber-stamping of large diffs with focused, reviewable chunks + tests as
  verification evidence [F-20]; budget confirmations so the human doesn't reflexively approve [H-21].
- **Validate:** track how often human review catches a real bug vs. merge rate [A-16]; red-team with
  planted regressions.

### 9b. Computer-use / web agent

- **Map/Grade:** read page (G0) · fill form (G1) · purchase / send / delete (G3) · enter
  credentials (G3 + privacy).
- **Match:** browse autonomously (L1); **confirm-before on every side-effecting action** (Purchase /
  Send / Delete) [A-5]; credentials via human takeover with the model's vision blanked [A-5].
- **Instrument:** the lethal trifecta is the live risk (private session + untrusted web content +
  ability to transact) [A-23] — detect and gate. Escalate, don't review, when controllability is
  low (the agent can rationalize a wrong action and the user won't catch it [A-17]).
- **Validate:** measure intervention success against embedded dark-pattern / injection attacks [A-17].

### 9c. Customer-support agent (high fan-out)

- **Map/Grade:** answer question (G1) · issue refund within policy (G2) · refund outside policy /
  account closure (G3).
- **Match:** answer autonomously with deterministic guardrails it "cannot cross" (e.g., a 30-day
  window) [A-15]; in-policy refunds L1–L2; out-of-policy escalate to a human with an AI-generated
  summary [A-15, A-6].
- **Instrument:** human is the *escalation tier*, not the per-turn approver (span limits [H-22]);
  AI **supervisors** observe→intercept in parallel; **monitors** score grounding/sentiment at scale
  [A-15].
- **Defend:** the supervising AI has blind spots [B-20] — keep human review on the escalated tail
  and audit a sample of the autonomous body.

---

## 10. Limits, tensions, and honest caveats

This framework *manages* the hard tensions named in the codex synthesis; it does not dissolve them.

- **Autonomy vs. oversight capability** — every increment of useful autonomy degrades the human's
  takeover ability [E-13]. The framework's answer is *per-action* allocation and dynamic escalation,
  not a global setting — but the trade-off is real and permanent [E-15].
- **Friction vs. usability** — the interventions that most reduce over-reliance are the ones users
  most dislike [F-21, A-17]. Spend friction where stakes justify it; expect resistance.
- **Explanation vs. over-trust** — intelligibility is necessary for oversight yet explanations
  increase uncritical acceptance [F-20, G-17]. Prefer *verification-oriented* evidence over
  *persuasion-oriented* rationale; this is easier to state than to design.
- **Scaling oversight vs. preserving the human** — AI-assisted oversight is the only way to scale,
  but each step removes a little of the human it's meant to empower [B-20, C-19]. Track where
  genuine human judgment still lives.
- **Compliance vs. safety** — designing for the regulatory checkbox can actively produce a crumple
  zone [D-14, D-16]. Validate effectiveness (§7); don't confuse "compliant" with "controlled."
- **The model is part of the design** — interruptibility and mid-task correction are unsolved model
  capabilities [A-19]. Some patterns in this framework degrade when steerability is poor; design
  within the model's actual limits, and re-grade as models improve.

> **One-line summary.** Don't ask whether a human is in the loop. Grade each action by consequence,
> match a proportionate oversight mode, prevent (don't merely review) where humans can't catch
> errors, design the oversight *moment* so the human has clarity, context, and detection
> affordances, defend against the predictable failure modes, and *prove* the oversight works.

---

## Foundations

This framework rests on the 17 research clusters in [`codex.md`](./codex.md). Beyond the original
human-factors / HCI / AI-safety base (Parts I–II), it now draws on:

- **The economics & law of delegation** (Part III.J/K) — principal–agent theory and agency costs
  reframe oversight as *costly monitoring* [J-2]; residual control rights [J-8] ground "the human
  keeps the override"; non-delegable duties [J-15] set hard limits on automation; **commander's
  intent** and **management by exception** [K-7, K-1] supply the brief-by-intent posture in §3.
- **Resilience engineering & HRO** (III.L) — tight coupling / latent failure / drift / normalization
  of deviance [L-10, L-12, L-15, L-16] and **deference to expertise** [L-7] underwrite the
  decouple-and-monitor stance and the warning that oversight standards erode silently.
- **Joint cognitive systems / human-autonomy teaming** (III.M) — Observability, Predictability,
  Directability [M-1, M-5] and common ground [M-14] are the teaming requirements behind §4/§5.
- **Cross-industry mechanisms** (Part IV.N/O) — Jidoka/andon, poka-yoke, checklists, permit-to-work,
  the two-person rule, four-eyes, circuit breakers, kill switches, least-privilege, runtime shields
  — and **Cranor's prior HITL framework** [O-9], the direct precedent generalized by §5.
- **The cognition of advice & the loop episode** (Part V.P/Q/R) — advice-taking and anchoring
  [P-2, P-9], decision fatigue *with its replication caveats* [P-13, P-16], interruption science,
  provenance, and choice architecture — the evidence base for §5.

---

*Companion to [`codex.md`](./codex.md) (the research foundation). Assembled 2026-06-22; expanded with
Parts III–V and the loop-episode section after the initial draft.*
