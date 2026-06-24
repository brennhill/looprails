# LoopRails: A Practitioner's Playbook for Human-in-the-Loop Agentic AI

> **Keep your AI agents on the rails.** Calibrated oversight in four moves,
> **Grade · Guard · Show · Prove**, that keep every action on the **RAIL**:
> **R**eversible · **A**uthorized · **I**nterruptible · **L**ogged.
>
> The quick, do-this tier. For the full reasoning see [`framework.md`](./framework.md). For the
> evidence behind every claim see [`codex.md`](./codex.md). Bracket tags like `[A-17]` point to a
> source there.

---

## The 30-second version

1. **Don't ask "is there a human in the loop?"** Ask it **per action**.
2. **Grade** each action by **blast radius × reversibility × stakes** → G0 to G3.
3. **Guard** by grade: let trivial stuff run; gate the consequential; **where a human can't reliably catch the error, *prevent* instead of review** (sandbox, make reversible, or forbid).
4. **Show** the human a well-built moment when you do pull them in: *what's being asked, what happens if they approve, how it got here, and what to check*, without drowning them.
5. **Prove** it works: measure whether humans actually *catch* errors, and red-team the oversight, not just the agent.

> **The one rule that matters most:** a confirmation prompt does **not** make a human a good error-catcher. Gates cut *bad actions* but barely improve *catching* them [A-17]. When stakes are high and the human can't realistically catch the mistake in time, **prevention beats review every time.**

---

## Move 1: GRADE (what's it worth?)

Score every action the agent can take on three axes; the **highest** axis sets the grade.

| | Low (0) | Medium (1) | High (2) |
|---|---|---|---|
| **Reversibility** | one-click undo | recoverable with effort | irreversible (sent/paid/deleted/published) |
| **Blast radius** | self / local | shared / team | external / third parties / public |
| **Stakes** | trivial | money/time/minor harm | safety, legal, security, finance, reputation |

| Grade | Means | Examples |
|---|---|---|
| **G0** trivial | all low | read a file, read-only query |
| **G1** low | ≤1 medium | edit local file, run tests |
| **G2** high | any one high | `git push`, send internal msg, spend in budget |
| **G3** critical | irreversible **and** (external or severe) | delete prod data, deploy, pay, post publicly, `rm -rf` |

> ⚠️ **Grade by *real* reversibility, not by whether you have an "undo" button.** A Bash `rm` is G3 even if your editor has rewind. Checkpoint/undo doesn't cover shell side-effects [A-4].

---

## Move 2: GUARD (how much control, and what kind?)

**Pick a mode on the autonomy ladder, by grade:**

| Grade | Default mode | |
|---|---|---|
| **G0** | **L0 to L1** run silently / log | spending attention here just breeds fatigue |
| **G1** | **L1 to L2** act + notify, cheap undo | undo beats confirmation [G-14] |
| **G2** | **L3 to L4** confirm-before / plan-approve, with a preview | |
| **G3** | **L4 to L5 + prevention**, or **L6** (escalate/forbid) if a human can't catch it | review alone is a trap here |

`L0 silent · L1 logged · L2 notify-after · L3 confirm-before · L4 plan-approve · L5 co-execute · L6 escalate/forbid`

**Then escalate dynamically** on: low agent confidence · novelty/scope-drift · **lethal-trifecta exposure** · accumulated blast radius. And make **stepping *down* to manual easy** (don't get locked into max autonomy).

**The pattern deck. Reach for these. Most are borrowed from industries that hardened them:**

| Pattern | Do this | Why / src |
|---|---|---|
| 🏰 **Sandbox-First** | contain blast radius in the *environment* (no-net container, scoped creds, budget cap) before trusting the agent | the highest-payoff control [A-23] |
| 💥 **Blast-Radius Cap** | limit any single action's magnitude (max spend/deletes/recipients) + rate-throttle | stops runaways [O-3] |
| 🔒 **Capability Lock** | make the bad action *impossible*, not discouraged (least-privilege, read-only, type/schema constraints) | poka-yoke > policy [N-6, O-10] |
| 🛡️ **Runtime Shield** | a *verified* monitor that vetoes the agent even under prompt injection | [O-17, O-18] |
| 🪢 **Andon Cord** | anyone (human, monitor, user) can halt the agent, cheaply and blamelessly | [N-4] |
| 🛑 **Kill Switch** | one command stops all + revokes in-flight, usable without diagnosing | [O-7] |
| ⚡ **Circuit Breaker** | auto-halt on threshold breach (error rate, cost, anomaly); re-auth to resume | [O-6] |
| 👥 **Maker-Checker** | proposer ≠ approver; two independent parties for irreversible actions | [O-1, N-15] |
| 🚨 **Break-Glass** | no standing privilege; elevate just-in-time, logged loudly, reviewed after | [O-14] |
| ↩️ **Checkpoint & Rewind** | reversible by default; undo beats confirmation (mind the shell boundary) | [A-4, G-14] |
| 📝 **Plan-Then-Go** | approve a plan *before* execution when the model can't be steered mid-task | [A-20, A-19] |
| 🎯 **Brief-by-Intent** | give purpose + end-state + hard limits, not step-by-step; pre-authorize the routine | [K-7, K-12] |

---

## Move 3: SHOW (design the oversight moment)

When you *do* bring a human in, the moment usually fails for lack of four things. Build them in.

**The four things usually missing:**
1. 🔭 **Consequences + reversibility, up front.** What approving *does*, side effects, and whether it can be undone, *before* they click (feedforward) [Q-3, Q-4].
2. 🧭 **Provenance: "how did this get to me?"** What the agent saw, considered, rejected, and *why it escalated*. Without it the human is out-of-the-loop and can't really judge [Q-7, Q-10].
3. 🔍 **Detection affordances.** Contrastive *why / why-not*, diffs, surfaced **uncertainty**, framed to help them *check* rather than *sell* the answer (persuasive rationale increases blind acceptance) [Q-16, Q-20, F-20].
4. ⏳ **An attention budget.** Interrupt rarely, at task breakpoints, batched, high-precision. Over-prompting gets tuned out by the *second* identical prompt [Q-28, O-16]. Low-precision alerting is how oversight dies (clinicians override 49% to 96% of alerts) [H-10].

**Full anatomy of a good loop episode (ordered):** ① decide whether to interrupt at all → ② state the request clearly → ③ show consequences + reversibility → ④ surface calibrated confidence → ⑤ give the provenance trail → ⑥ provide detection affordances → ⑦ add proportionate friction (a *microboundary*, not sludge) → ⑧ bias-safe choice architecture (safe default, **no auto-approve-on-timeout**, no dark patterns) → ⑨ log the decision for accountability.

> 🎛️ **Safe Default + Microboundary:** the default option is always the safe/reversible one, and for irreversible actions add one beat of forced reflection (e.g., decide-before-seeing). Add it *only* there, or it becomes sludge [Q-19, Q-32, Q-35].

---

## Move 4: PROVE (does the oversight actually work?)

Treat "a human reviews it" as a **claim to validate, not a checkbox** [D-14].

- **Intervention-success rate.** When the agent is wrong, how often does the human actually *catch and fix* it? (Not approval rate.) If you measure one thing, measure this [A-17].
- **Override rate + correctness.** Uniform approval means rubber-stamping; lopsided overrides mean a new bias [D-24].
- **Time-to-detect vs. time-to-harm.** Is there even time to intervene? [H-19]
- **Interrupt / false-alarm rate.** Is the signal economy healthy, or breeding fatigue? [F-17]
- **Red-team the oversight.** Plant errors and attacks; see if the human (or monitor AI) catches them. Untested oversight is unvalidated.

---

## The four A's: the meaningful-control test

Every oversight point must pass all four, or it's theater [C-20, D-4, E-21]:

| **Authority** | the human can actually stop/change/reverse it |
| **Awareness** | they comprehend what's happening (not a log dump) |
| **Ability** | they have the competence *and the time* to judge it |
| **Accountability** | responsibility traces to an informed human |

Fail Authority → **moral crumple zone**. Fail Awareness → **automation surprise**. Fail Ability → **out-of-the-loop**. Fail Accountability → **responsibility gap**.

---

## The anti-pattern deck: name them, kill them

| Anti-pattern | What it is | Antidote |
|---|---|---|
| 🟥 **The Rubber Stamp** | gates clicked through; gating ≠ catching [A-17] | forcing functions; verify-don't-trust evidence |
| 🟥 **Moral Crumple Zone** | human blamed without real control [D-16] | the four A's, or drop the pretense |
| 🟥 **The YOLO Cliff** | global auto-approve with no containment [A-13] | Sandbox-First |
| 🟥 **Alert-Fatigue Spiral** | too many low-value prompts → all ignored [H-10] | attention budget; high precision |
| 🟥 **Confirmation Reflex** | warnings instead of undo; habituation [G-14, O-16] | Checkpoint & Rewind |
| 🟥 **Lethal Trifecta** | private data + untrusted input + external comms = exfiltration [A-23] | break a leg (read-only / no net) |
| 🟥 **Magenta-Line Lock-In** | riding max autonomy, no easy step-down [H-6] | make stepping down easy |
| 🟥 **Denylist Theater** | string-match denylists / client approvals as "security" [A-14] | Capability Lock; server-side enforce |
| 🟥 **Phantom Oversight** | mandated review that's illusory in practice [D-14] | PROVE it works |
| 🟥 **The Firehose** | dumping everything on the human at overload [H-20] | prioritize/aggregate; circuit-break |

---

## Maturity ladder: where are you?

| 0 **Binary** | one global switch (ask-everything or YOLO): fatigue or blind risk |
| 1 **Graded** | actions risk-tiered; gates match consequence |
| 2 **Reversible & sandboxed** | undo-by-default + environment containment |
| 3 **Calibrated & dynamic** | autonomy adapts; loop episodes designed (clarity/provenance/detection) |
| 4 **Validated** | oversight effectiveness measured, red-teamed, proven |

---

## The standup smell-test (ask these in any agent review)

- What's the **blast radius** of the worst single action? Is it **reversible**?
- For G3 actions, are we **preventing or just reviewing**? (If reviewing, can the human really catch it?)
- Is high-autonomy work in a **sandbox**? Is the **lethal trifecta** possible?
- When we ask the human, do we **show consequences + provenance**, or just "Approve?"
- Are we **measuring catch-rate**, or assuming the human catches things?
- What's our **kill switch**, and who can pull the **andon cord**?

---

## Recipes (condensed)

**Coding agent.** Reads/edits run+log with undo (L1 to L2); `git push` → confirm + diff (L3); prod ops → plan-approve + escalate (L4/L6). Sandbox/branch, no prod creds. SHOW: diff + what's affected + reversibility + why-now. PROVE: catch-rate vs. merge rate, planted-regression red-team.

**Computer-use / web agent.** Browse autonomously (L1); **confirm every side-effect** (purchase/send/delete, L3); credentials via human takeover with vision blanked. The lethal trifecta is live → detect & gate; **escalate, don't review**, when the human can't catch it.

**Support agent (high fan-out).** Answer with deterministic guardrails it can't cross; in-policy refunds L1 to L2; out-of-policy → escalate to human with a summary. The human is the **escalation tier**, not the per-turn approver (span limits [H-22]). AI monitors watch the autonomous body; humans review the escalated tail.

---

## How the three docs fit

| [`playbook.md`](./playbook.md) | **this**, the do-this field guide | practitioners |
| [`framework.md`](./framework.md) | the full LoopRails method + reasoning | designers/leads |
| [`codex.md`](./codex.md) | 366-source research base | the evidence / skeptics |

*LoopRails · Grade · Guard · Show · Prove · 2026-06-22.*
