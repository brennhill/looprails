# I is for Interruptible — Stopping an Agent Should Be Cheap, Fast, and Blame-Free

> Part of the **RAIL** series. Every governed agent action should stay on the rail:
> **R**eversible · **A**uthorized · **I**nterruptible · **L**ogged. This page goes deep on **I**.
> For the whole method see [`framework.md`](./framework.md); for the do-this version see
> [`playbook.md`](./playbook.md); for the evidence, [`codex.md`](./codex.md) (bracket tags below
> point there).

---

## What "Interruptible" means

An agent is **interruptible** when anyone with a stake in what it's doing can stop it — quickly,
cheaply, and without having to justify themselves first. "Anyone" is literal: a teammate watching
over a shoulder, an automated monitor that trips on an anomaly, or the end user who realizes
mid-run "that's not what I meant." Each of them needs a low-friction, blameless authority to halt
the agent before it does the next thing.

Two properties make this real:

1. **A blameless, universal stop.** Stopping costs nothing socially. Nobody has to be *sure* the
   agent is wrong to pause it; "I'm not comfortable, hold on" is a complete and acceptable reason.
   Toyota built this into the factory floor as the *andon cord* — a literal cord any worker can pull
   to stop the production line the instant they see a defect, and they are *rewarded* for pulling it,
   not punished [N-4]. The cord works because pulling it is cheap and carries no blame; a stop
   mechanism that makes the stopper look foolish or costs them an argument will not get pulled when
   it matters.

2. **One kill switch that halts everything at once.** Beyond the per-action pause, there is a single
   decisive control that stops *all* in-flight work without anyone first having to diagnose what went
   wrong. Finance calls this the kill switch: a risk admin can immediately block all new orders and
   cancel working orders, no root-cause analysis required — stop first, investigate later [O-7].

Interruptibility is the **Authority** leg of meaningful control made concrete. Without it, a human
"in the loop" is a moral crumple zone: positioned to be blamed but unable to actually stop the thing
[framework §0].

---

## Why interruptibility is a real engineering property, not a promise

It is tempting to treat "you can always stop it" as self-evidently true — there's a Ctrl-C, there's
a stop button, the agent is *told* to obey interruptions. That confidence is misplaced for one hard,
empirical reason:

**Today's models are weak at honoring mid-task interruption, cancellation, and re-planning.** This
is not a UI gap; it is a model capability gap. The InterruptBench benchmark tested six frontier LLMs
on long-horizon web tasks across three interruption types — *adding* a goal, *revising* the current
goal, and *retracting* it entirely — and found that even the best models struggle to adapt and
recover when the user changes their mind mid-flight [A-19]. Field evidence agrees: coding agents
degrade sharply on iterative problem-solving and mid-task scope changes [A-16], and the dominant
real-world failure mode is the agent continuing on its own trajectory while the developer pushes back
[A-18].

So a "steer it mid-run" affordance that *routes the new instruction back into the same model* is not
a reliable stop. The model may acknowledge the interruption, then keep doing roughly what it was
doing. Interruptibility therefore has to be **engineered around the model, not delegated to it.** The
guaranteed stops live *outside* the agent's reasoning — in the orchestrator, the process supervisor,
the credential broker, the network. The model's cooperation is a convenience on the happy path, not
the safety mechanism. Treat steerability as a capability you must *test* per model, and never build a
high-consequence stop on the assumption that the agent will gracefully comply when told [framework
§4 surface 3].

---

## How to implement it properly — concrete mechanisms

Interruptibility is a layered stack, from polite to brutal. Build all the layers; rely on the lower,
model-independent ones for anything consequential.

### Cooperative cancellation (graceful stop)

The agent stops itself at a safe seam. Mechanisms:

- **Cancellation tokens.** Every step checks a shared token before it acts. On cancel, the loop exits
  at the *next* checkpoint rather than mid-write, leaving state consistent. This is the pattern the
  major SDKs expose: a run pauses, surfaces an interruption, and resumes from saved state once
  resolved [A-7, A-8].
- **Checkpointing between steps.** Snapshot durable state at each step boundary so a stop never lands
  in the middle of a half-finished mutation. Approve / edit / reject / respond on the next step is
  built on a checkpointer — HITL *requires* durable persistence underneath [A-8].
- **Pausable / resumable runs.** A paused run holds its full context durably and resumes minutes or
  hours later — across processes and machine restarts — when a human (or webhook, or queue) responds
  [A-10]. This makes "pause and come back" a normal state, not a crash.

Graceful stop is the right default for low- and medium-grade work: it preserves a clean,
resumable state. Its limit is *latency* — it only stops at the next seam, which is too slow when the
next action is the dangerous one.

### Preemptive / hard stop

When you cannot wait for a safe seam, you stop the agent from the *outside*, accepting that you may
leave state messy:

- **Kill the process.** Terminate the agent's execution. Cooperation not required.
- **Revoke the credentials.** Invalidate the scoped, short-lived tokens the agent acts through so its
  *next* tool call fails even if the process is still alive. This is lockout/tagout from industrial
  safety: positively de-energize the system's ability to act, don't merely ask it to stop [N-17].
- **Cut the network.** Drop the agent into a no-egress state so it can compute but cannot *touch*
  anything external. If high-autonomy work already runs in a no-network, scoped-credential sandbox,
  the hard stop is mostly already armed [framework §4 surface 5].

Hard stop is your guarantee. Because it lives outside the model, it holds even when the model ignores
the polite cancel and even under prompt injection.

### The kill switch

A kill switch is the *single decisive control* that does the hard stop across the board: stop all
agents, cancel all in-flight work, revoke all live credentials — invoked **without needing to
diagnose** what went wrong. The design rules borrowed from finance [O-7]:

- **Usable mid-panic.** One command, no parameters to reason about, no "are you sure this is really
  the problem?" gate. You pull it *because* you don't yet know what's wrong.
- **Cancels working actions, not just new ones.** Blocking new tool calls while letting in-flight
  ones complete is a half-stop; the canonical algorithmic kill switch cancels the orders already
  resting.
- **Both manual and automatic.** A human can pull it; a limit breach can also pull it (see circuit
  breakers).

The cautionary tale is **Knight Capital**: dormant code reactivated on one server fired ~4 million
unintended orders in ~45 minutes, ~$440M in losses, with **no kill switch** to halt the runaway
[O-4]. The absence of a single decisive stop turned a small config error into an extinction event.

### Circuit breakers (automatic halt)

A circuit breaker auto-halts the agent when a threshold trips, then **requires explicit
re-authorization to resume**. Markets use exactly this: threshold-triggered automatic halts that
inject a cool-down so humans can reassess before trading restarts [O-6]. For agents, wire breakers to:

- **error rate** — repeated tool failures or retries (a stuck loop);
- **spend** — cumulative cost or per-window burn exceeding a cap;
- **anomaly / volume** — action rate or output volume outside the learned band;
- **blast-radius accumulation** — many small actions composing into a large effect.

The breaker's value is that it stops *before* a human notices, and the mandatory re-authorization
makes resuming a deliberate human re-entry point rather than a silent restart [O-6]. This mirrors the
factory *jidoka* primitive: full speed on the happy path, automatic hard stop on anomaly, escalate to
a human [N-4].

### Graceful vs. hard stop — choosing

| | Graceful (cooperative) | Hard (preemptive) |
|---|---|---|
| **Stops at** | next safe checkpoint | immediately |
| **State left** | clean, resumable | possibly inconsistent |
| **Depends on the model?** | yes (weak point [A-19]) | no |
| **Use for** | routine pause/redirect, low–medium grade | high grade, runaway, injection, panic |

Offer graceful as the default; keep hard always armed underneath. Never let "graceful" be the *only*
option for a consequential action — that re-introduces the model dependency you were trying to escape.

### The handoff problem

An interruption that hands control back to a person is itself a failure point, because the person
being handed to is, by construction, *out of the loop*. Pulling a human off the task degrades their
**comprehension** — not just their data — and that comprehension is what they need to take over;
out-of-the-loop performance is measurably worse under full automation than under intermediate
automation that kept them engaged [E-13]. A sudden dump on a disengaged human is the classic
failure: Air France 447's startled, out-of-the-loop crew got an abrupt handoff at the worst possible
moment and stalled a working aircraft into the ocean [H-7].

So engineer the handoff:

- **Early and gradual.** Hand back *before* the cliff, not at it; step authority down in stages.
  The crisis is exactly when a firehose hurts most — prioritize and interpret *for* the human, don't
  dump everything [H-7].
- **Context-rich.** Carry the provenance: what the agent saw, what it tried, *why* it stopped or
  escalated — situation awareness, not a log dump [framework §5; E-13].
- **Budget the re-engagement latency.** Takeover is not instantaneous. Driving-automation studies put
  human takeover at ~1.5–3.5 seconds, longer under secondary-task load, and longer still to rebuild
  the *competence* to act well [H-19]. For time-critical failures, the human fallback may simply not
  arrive in time — so don't architect safety around a handoff that can't re-engage fast enough [H-19].

### Multi-agent / fleet halt

With a fleet, "stop it" must mean **stop them all** — including subagents that inherited authority —
in one action. A per-agent stop that leaves siblings running is not a halt. Two hard limits shape
fleet interruptibility:

- **System-level breakers, not just per-agent ones.** The Flash Crash showed individually "correct"
  fast algorithms producing systemic collapse through interaction [O-5]. The kill switch and circuit
  breaker must operate at the fleet level.
- **A ceiling on supervisory span.** One operator caps at roughly a handful of *actively* supervised
  agents (up to ~12 in pure monitoring), and performance decays sharply once utilization passes ~70%
  [H-22]. You cannot interrupt what you weren't watching, so the number of agents one human oversees
  is bounded by their capacity to notice trouble in time. Scaling agent count without scaling or
  pooling oversight guarantees unmonitored failures [H-22].

---

## A maturity checklist for interruptibility

- [ ] Anyone — teammate, automated monitor, end user — can stop the agent, and stopping is cheap and
      **blameless** (the andon-cord property [N-4]).
- [ ] A **single kill switch** stops everything and cancels in-flight work, usable **without first
      diagnosing** the problem [O-7].
- [ ] The kill switch and hard stops live **outside the model** (process kill, credential revocation,
      network cut) and survive an uncooperative or injected agent [A-19, N-17].
- [ ] Cooperative cancellation exists: cancellation tokens, **checkpoints between steps**, durable
      pause/resume [A-7, A-8, A-10].
- [ ] **Circuit breakers** auto-halt on error rate / spend / anomaly / accumulated blast radius and
      require **re-authorization to resume** [O-6].
- [ ] In-flight work is *cancelled*, not merely blocked-going-forward [O-7].
- [ ] Fleet halt stops **all** agents and inherited subagents at once; breakers exist at the **system**
      level, not only per-agent [O-5].
- [ ] Handoffs are **anticipatory, gradual, and context-rich**; re-engagement latency is **budgeted**,
      and no time-critical safety relies on a handoff that can't arrive in time [H-7, H-19, E-13].
- [ ] The number of concurrent agents is capped to a supervisable span [H-22].
- [ ] Model steerability is **tested**, not assumed; consequential stops never depend on it [A-19].

---

## Common mistakes

- **No kill switch (the Knight Capital runaway).** Trusting that "we can always pull the plug" without
  building the plug. Knight had a fast autonomous actor and no decisive stop; ~4M bad orders and
  ~$440M in 45 minutes was the result [O-4]. If you cannot name the one command that stops everything
  *right now*, you do not have a kill switch.

- **Gameable "are you still there?" engagement checks.** Token engagement nags — a hands-on-wheel ping,
  a periodic "click to continue" — feel like oversight but verify nothing. Tesla's gore-point fatality
  involved a driver playing a game past a non-effective engagement-monitoring design [H-18], and the
  Uber/Tempe fatality involved a safety driver on her phone behind a system reliable enough to induce
  disengagement but not to trust [framework §6]. An interruption check that a disengaged human can
  satisfy without re-engaging is theater. Verify *meaningful* engagement, or budget for the fact that
  the human is out of the loop.

- **Assuming the model will just stop when told.** The most seductive mistake: wiring "interrupt" to a
  message back into the same model and calling it done. The benchmark says frontier models are weak at
  honoring mid-task changes [A-19], the field data says agents keep going until the human forcibly
  pushes back [A-18], and a polite cancel is worthless under prompt injection. Build the guaranteed
  stop outside the model; let the model's cooperation be a bonus, never the mechanism.

---

## Sources

Codex tags cited on this page: **[A-8]** approve/edit/reject/respond on a durable checkpointer ·
**[A-19]** InterruptBench — models weak at mid-task interruption/cancellation/re-planning ·
**[N-4]** the andon cord (universal, blameless line-stop authority) · **[O-6]** circuit breakers
(threshold-triggered auto-halt + re-authorization to resume) · **[O-7]** kill switches (decisive
manual + automatic stop; cancel working actions) · **[H-7]** Air France 447 (startle + sudden handoff
to an unprepared human) · **[H-19]** take-over time meta-analysis (re-engagement latency budget) ·
**[E-13]** out-of-the-loop problem (handoff degrades comprehension, not just data) · **[H-22]**
supervisory-span ceiling (how many agents one human can watch).

Supporting tags referenced in passing: **[A-7]** SDK interrupt-inspect-resolve-resume ·
**[A-10]** durable asynchronous pause/resume · **[A-16]** agents degrade on mid-task scope change ·
**[A-18]** agents continue until the human pushes back · **[H-18]** gamed driver-engagement
monitoring · **[N-17]** lockout/tagout (positively disable the ability to act) · **[O-4]** Knight
Capital (no kill switch) · **[O-5]** Flash Crash (system-level emergent failure).

---

*LoopRails · RAIL series · I — Interruptible. See also: R (Reversible), A (Authorized), L (Logged).*
