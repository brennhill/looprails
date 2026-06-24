# The Circuit Breaker Pattern for AI Agents

A **circuit breaker for AI agents** is an automatic control that pauses an agent the moment a measured condition crosses a threshold (too many errors, too much spend, too many actions, too many retries) and then refuses to resume until a human re-authorizes it. It does not wait for a person to notice trouble and react. The threshold is always watching, even at 3 a.m. when no one is. When the breaker trips, the agent stops doing damage on its own, and restarting becomes a deliberate human decision rather than an automatic retry. That single property, firing by itself and resuming only on a human's say-so, is what separates a circuit breaker from every other stop.

This article covers what the circuit breaker pattern is, why agents need automatic thresholds instead of attentive humans, what to trip on, how resume semantics work, how the **AI agent circuit breaker** differs from a kill switch and a rate limit, and how it fits the LoopRails method (**Grade · Guard · Show · Prove**) described in [the framework](framework.html). It ends with a checklist.

## What the circuit breaker pattern is

The circuit breaker is an old idea borrowed three times over. It starts in **electrical engineering**: a breaker trips and cuts the circuit when current exceeds a safe level, which keeps a wire from overheating. The defining move is that it acts on a measured threshold, automatically, with no person in the path.

**Software reliability** borrowed the name directly. A service-to-service circuit breaker watches the failure rate of calls to a dependency; when failures cross a threshold, it "opens" and stops sending traffic, so a struggling downstream service is not buried under retries and a single failure does not cascade across the system.

**Financial markets** use the same logic under a different name: trading halts. When prices move too far, too fast, exchanges automatically pause trading to break the feedback loop. The common thread across all three is a loop that can run away faster than a person can intervene, so the brake is automatic and resuming is governed.

For an agent, the meaning is direct. An **AI agent circuit breaker** watches signals that indicate the agent is going wrong, and when one crosses a line, it halts the agent and holds it stopped until a human re-authorizes. The agent's own runaway loops (tool call, result, new tool call) are exactly the kind of fast feedback the pattern was built to contain.

## Why agents need automatic thresholds

The honest version of the core LoopRails question is uncomfortable: **can a human realistically catch this mistake in time?** For a fast, autonomous agent, the answer is usually no, which is precisely why an automatic threshold beats an attentive human.

**Humans miss fast cascades.** When an agent goes wrong, it often goes wrong quickly: a bad tool result feeds the next call, the error compounds in seconds. Knight Capital is the cautionary tale from the same family. In 2012, malfunctioning trading software kept firing orders with no effective automatic stop, and the firm lost roughly $440 million in about 45 minutes. No human reaction time closes that gap. Only a threshold that trips on its own does.

**Humans also miss slow cascades, and alarm floods.** Not every runaway is fast. Some are a slow drip: a small overspend per action, a climbing error rate, a retry loop that quietly burns budget for hours. A person watching a dashboard habituates to a slow trend and stops seeing it. And when many signals fire at once, the real problem hides in the noise. At Three Mile Island, more than 100 alarms went off within minutes, obscuring the actual fault. That is the case *for* automatic thresholds: a counter does not habituate or lose the signal in a flood.

**The alternative is the YOLO Cliff.** The [YOLO Cliff](framework.html) is the anti-pattern where an agent runs with full autonomy and nothing contains a cascading mistake. It looks fine right up until it doesn't, and then there is no brake. A circuit breaker is the most basic thing standing between your agent and that edge. When you cannot catch the mistake in time, you contain the outcome automatically.

## What to trip on

A circuit breaker is only as good as the signals it watches. Pick conditions that indicate "something is going wrong," set them server-side (not in the prompt, where the agent can ignore them), and wire each to a hard auto-stop.

- **Error / failure rate.** The classic trip. If the share of failed actions, tool calls, or rejected outputs crosses a threshold over a window, open the breaker. A rising failure rate is the earliest sign an agent has lost the plot.
- **Spend.** Track cost (API spend, tokens, real money the agent moves) against a budget. Trip when it crosses, and trip *harder* when the *rate* of spend spikes, which catches a runaway before it drains the budget.
- **Action volume.** Count consequential actions per unit time. An agent that suddenly sends 200 messages or opens 50 tickets is doing something a healthy agent doesn't. Volume is often the first quantitative tell of a loop.
- **Repeated retries.** A tight retry loop (the same action failing and being re-attempted) is a runaway in miniature. Trip on N retries of the same operation before the loop becomes the whole workload.
- **Anomaly signals.** Anything that deviates from the agent's normal envelope: unusual targets, off-hours bursts, actions outside the expected category, accumulated blast radius across many small steps. Softer, but they catch failures the hard counters miss.

The rule across all five: trip on a *measured* condition, not a vibe. "We'd notice" is not a threshold. A counter is.

## Half-open and resume semantics

The whole point of the pattern is governed resumption, so the state machine matters. Borrowed from software reliability, an **AI agent circuit breaker** moves through three states:

- **Closed (normal).** Actions flow. Counters watch the trip conditions in the background.
- **Open (tripped).** A threshold crossed. The agent is halted and consequential actions are blocked. The breaker stays open. It does **not** quietly retry on a timer.
- **Half-open (probing).** A limited, supervised trial: a small number of actions are allowed through so a human can see whether the problem is resolved before fully reopening.

The non-negotiable rule for agents: **resuming requires human re-authorization.** A software breaker may auto-close after a cooldown because the only cost of a wrong guess is a few more failed calls. An agent acting in the real world is different, because resuming into an unresolved problem can be irreversible. So an open breaker does not auto-close on a timeout; "resume" is a deliberate, logged human decision. The half-open state is a tool for *that human* to confirm the fix under a cap, not a license for the system to reopen itself.

This is why the trip and the resume must both be **Logged**: a record of what crossed the threshold, what was in flight when it opened, and who re-authorized it and why.

## Circuit breaker vs kill switch vs rate limit

These three get conflated constantly. They are complementary, and a mature agent uses all three. The difference is the trigger and the job.

**Circuit Breaker: automatic, threshold-triggered, requires re-authorization to resume.** It fires on its own when a measured condition crosses a line, then holds the agent stopped until a human re-authorizes. Its job is to catch *known* failure modes automatically, because the threshold is watching when no human is.

**[Kill Switch](article-ai-kill-switch.html): human-triggered, stops everything now, in an emergency.** A person (or a monitor acting for one) halts the whole agent immediately, including in-flight work, without first diagnosing it. The difference from a breaker is the trigger. The kill switch is *pulled by a person*; the breaker *fires by itself*.

**Rate limit / Blast-Radius Cap: always-on, per-action ceiling.** A rate limit caps how fast or how much any single action can do (max spend, max recipients, max requests per minute). It does not stop the agent; it shrinks each action so a mistake stays small. The [Blast-Radius Cap](article-ai-agent-guardrails.html) runs continuously. The circuit breaker sits on top: when the *aggregate* of those capped actions still trends wrong, the breaker pulls the plug.

The clean mental model: a **rate limit** keeps every action small, a **circuit breaker** automatically stops the whole agent when a threshold trips, and a **kill switch** is the human override for when neither caught it.

## How it fits RAIL and the grades

In LoopRails, every governed action should keep four properties (**RAIL**: **R**eversible, **A**uthorized, **I**nterruptible, **L**ogged). The circuit breaker is a core expression of **I, [Interruptible](rail-interruptible.html)**: an agent that cannot be stopped automatically when it crosses a danger threshold is not truly interruptible, because the only stop you have depends on a human happening to be watching. The breaker makes interruptibility *automatic*.

It leans just as hard on **L, [Logged](rail-logged.html)**: the trip, the in-flight state, the half-open probe, and the re-authorization all need to be recorded, both to resume safely and to learn what tripped it. And resumption is an **Authorized** act, so the human's "yes" to reopen has to be informed.

How much breaker you need scales with the **grade** of the actions your agent can take. Grade each by reversibility, blast radius, and stakes; the [interactive grader](index.html#grader) does this for you:

- **G0 to G1 (trivial / low):** counters and logging are good hygiene; a breaker is rarely the headline control.
- **[G2 (high)](guide-g2.html):** a circuit breaker is **expected**. Actions like `git push`, spending within a budget, or modifying shared state move faster than per-action review, so automatic thresholds earn their keep.
- **[G3 (critical)](guide-g3.html):** a circuit breaker is **required**, alongside prevention (sandboxing, capability locks, blast-radius caps) and a tested kill switch. At G3, review alone is a trap, and the breaker is your containment when a human cannot catch the mistake in time.

The circuit breaker is one of several controls that *contain* a mistake rather than merely flag it, and how much containment you need rises with the agent's [autonomy level](article-ai-agent-autonomy-levels.html).

## Implementation checklist

Run this against any agent that can take G2 or G3 actions.

- [ ] **Thresholds are defined and measured:** error rate, spend (and spend rate), action volume, repeated retries, anomaly signals.
- [ ] **Trip conditions are enforced server-side**, outside the prompt, so the agent cannot ignore or talk its way past them.
- [ ] **The breaker auto-trips** when a threshold crosses, with no human reaction time required.
- [ ] **An open breaker stays open.** It does not auto-retry or auto-close on a timer.
- [ ] **Resuming requires human re-authorization:** a deliberate, separate decision, never the default.
- [ ] **A half-open probe** lets a capped trial confirm the fix before fully reopening.
- [ ] **The trip is logged:** what crossed the threshold, what was in flight, and the time.
- [ ] **The resume is logged:** who re-authorized, when, and why.
- [ ] **Thresholds are tuned** so the breaker trips on real trouble without firing so often it gets ignored.
- [ ] **The breaker is tested.** Induce the condition on a schedule and confirm it actually trips and holds.

## Key takeaways

- A **circuit breaker for AI agents** automatically pauses the agent when a measured threshold crosses (error rate, spend, action volume, retries, anomalies) and requires human re-authorization to resume.
- The pattern comes from **electrical engineering**, was borrowed by **software reliability** (stop cascading failures between services) and **financial markets** (trading halts), and exists because feedback loops can run away faster than a human can react.
- Agents need **automatic thresholds** because humans miss both fast cascades and slow drips, and lose the signal in alarm floods. A counter does not. Knight Capital lost ~$440M in ~45 minutes with no effective automatic stop.
- The defining rule is **governed resumption**: an open breaker does not auto-close; a human re-authorizes, optionally after a half-open probe.
- A **circuit breaker** (automatic) differs from a **[kill switch](article-ai-kill-switch.html)** (human-triggered emergency stop) and a **rate limit** (always-on per-action cap). Use all three.
- The circuit breaker is core to **I, Interruptible** in RAIL, depends on **Logged**, and is **expected at G2 and required at G3**.

## Get started

Grade your agent's riskiest actions with the [interactive grader](index.html#grader) to see which need a circuit breaker, then work the four moves with the [practitioner playbook](playbook.html) and keep the [cheatsheet](cheatsheet.html) next to your next agent review. The evidence behind every claim here lives in the [research codex](codex.html). The next time someone proposes shipping an agent with no automatic stop, ask the only question that matters: when this goes wrong faster than anyone can react, and no one is watching, what trips the brake?
