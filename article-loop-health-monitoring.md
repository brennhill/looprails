# Loop Health: What to Monitor in a Running Agent Loop

An agent loop runs many turns on its own. It prompts a model, checks the output, decides the next step, and repeats until a goal is met or a cap stops it. While it runs, you are not watching each turn. So you need signals that tell you whether the loop made progress, spun in place, or quietly spent money on the wrong thing. From the outside those three look identical: a process that was busy and then stopped. Monitoring is how you tell them apart.

This article covers which signals to watch and what each tells you, what healthy versus sick looks like, and which thresholds feed the automatic controls that stop a runaway. It is the Run-and-Learn end of the LoopRails loop lifecycle: the signals you watch become the thresholds that stop a bad run and the evidence that decides whether to trust the next one.

## The audit log is the source of truth

Before any metric, there is the record. Every turn the loop takes (the action it chose, whether it was allowed, the verifier result, the spend so far) gets written to an append-only audit log. Metrics are derived from that log, not collected separately. This ordering matters. Skip the log and compute metrics directly, and you get a success rate with no trail back to the turns that produced it: a number you cannot explain when a run goes wrong. So one rule before anything else: write the audit log, then read metrics out of it. The LoopRails starter loop does exactly this, and the rest of this article assumes that shape.

## The signals, grouped

Four groups are worth tracking. Progress tells you the loop is converging. Cost tells you what convergence is costing. Reliability tells you how often the machinery breaks. Oversight tells you how the loop's behavior is changing relative to the humans watching it.

### Progress

**Turns used versus the cap.** The simplest signal: how many iterations this run took against its maximum. A run that finishes well under the cap is a different animal from one that finished on the last allowed turn, even if both passed. The second is one bad turn from the wall.

**Verifier-score trend.** Each turn produces a result, and an independent verifier scores it. The trend across turns is the real progress signal. A score that climbs turn over turn means each iteration is improving the result. A score flat while turns accumulate means the loop is busy but not converging.

**No-progress streak.** Turns since the verifier score last improved: the trend collapsed into one number you can threshold. One or two stale turns is normal; a streak that keeps growing is the loop spinning in place.

**Completion / success rate across runs.** Zoom out from a single run to the population. Of the last N runs, how many reached the done-condition versus stopped for some other reason. A single failed run is noise. A success rate that drifts down over a week is a trend you act on.

### Cost

**Tokens and spend per run.** What one run costs, in tokens and money. Track it per run, not just in aggregate, so an expensive outlier does not hide inside a monthly total.

**Cost per successful outcome.** This is the number that matters. A loop that costs little per run but rarely finishes is not cheap, because you pay for the failed runs too and get nothing for them. Divide total spend by successful outcomes for the honest unit cost, and watch it above raw spend.

**Latency per turn and per run.** Rising latency can mean the model is working harder per turn, a tool is slow, or retries are piling up. It also sets how fast a kill switch or circuit breaker has to act to matter.

### Reliability

**Error and retry rate.** How often turns fail and have to be retried. A low, steady rate is normal. A climbing rate is the earliest sign the loop has lost the plot, before the verifier score reacts.

**Tool-failure rate.** Errors from the tools the loop calls, separated from model errors. A tool that starts failing (an API rate-limiting you, a credential expiring) shows up here first and points at the cause faster than a generic error count.

**Cap-hit rate.** How often runs stop because they hit a cap (timeout, max iterations, max spend) instead of finishing on the done-condition. Hitting a cap is a stop, not a success: a run that finishes is converging, a run that hits a cap ran out of road. A rising share of cap-hits means the loop is finishing less and grinding more.

**Circuit-breaker trips.** How often the breaker fires on its own. An occasional trip is the system working. A rising trip rate means the loop is crossing danger thresholds more often, a behavior change worth investigating.

### Oversight

**Human-intervention rate.** How often a human has to step in to approve a gated action, correct the loop, or stop it. This is the cost the loop externalizes onto you. A loop that needs a human on most runs is not running unattended; it is a manual process with extra steps.

**Approval reject rate.** At a human gate, how often the human says no. A reject is a human catching something the loop wanted to do and shouldn't. A low rate means the loop's proposals are mostly sound. A rate climbing over time means the loop is increasingly proposing actions a human won't sign off on, a signal its behavior is drifting.

**The mix of action grades.** LoopRails grades each action by reversibility, blast radius, and stakes, from G0 (trivial) to G3 (critical). Track how often each grade fires. A loop that mostly takes G0 and G1 actions, with the occasional gated G2, has a stable risk profile. A rising share of G2 and G3 actions means the loop is reaching for more consequential moves than it used to, even if every individual action was allowed. Notice that shift while it is happening, not after.

## What healthy versus sick looks like

A healthy loop has a recognizable shape. The verifier score climbs over the first few turns, then plateaus at "done," and the run stops on the done-condition with turns to spare. Most runs finish under cap. Spend per successful outcome holds roughly steady run to run. Humans rarely reject a gated action, and the mix of action grades stays where you expect it. Boring, in other words, which is the target.

A sick loop's tells mirror the healthy ones. The verifier score goes flat while the turn count climbs: motion without progress. Runs increasingly stop on a cap rather than a finish. Spend per success rises as failed and capped runs drag the unit cost up. The reject rate climbs as humans catch more proposals they don't like. None of these is a single dramatic event. Each is a trend, which is exactly why a human watching a dashboard misses it and a threshold on the trend does not.

## Thresholds that feed the automatic controls

Monitoring is the input to the brakes, not a screen you glance at. Each signal above earns its keep by feeding a threshold that drives an automatic control. There are three jobs.

**Stop the loop.** No progress for N turns trips the [circuit breaker](article-circuit-breaker-ai-agents.html): the no-progress streak crosses its limit and the breaker halts the loop and holds it until a human re-authorizes. Spend over budget or turns over the cap stops the run outright. Continuing only spends more to get the same nothing.

**Page a human.** A falling success rate or a climbing reject rate is not an emergency you can wire to a hard stop, but it is a trend a person should see. These feed an alert, not an auto-halt, because the right response is judgment (retune, re-scope, or pull the loop), not a reflex.

**Keep the kill switch ready.** Behind both of the above sits the [kill switch](article-ai-kill-switch.html), the human-pulled stop for when a signal says something is wrong faster than any threshold caught it. Monitoring tells the human when to reach for it. A no-progress streak is just a number until it trips the breaker; monitoring that feeds no control is a dashboard you admire while the loop keeps going.

## Drift over time

A loop that worked last month can degrade without anyone touching it. The common cause is outside your code entirely: a provider updates the model under you, and the same prompts now behave a little differently. The loop did not change; its substrate did. Without a baseline, this shows up as a confusing run of incidents nobody can trace to a cause.

The defense is the same evaluation set you use everywhere else, version-pinned and run on a schedule. Pin the behavior you expect, watch the trend, and drift becomes a falling score on a graph rather than a surprise outage: you see the model getting worse at your task before your users do. For the model side of this, see the companion article "What You Can and Can't Do With Models You Don't Control."

## Start here

You do not need every signal from day one. A small set, emitted from the first run, covers most of the value. Write these to a metrics record alongside the audit log so they are queryable:

- **Turns used** (and the cap they ran against).
- **Spend** (tokens and money).
- **Verifier score per turn** (so you have the trend, not just the final number).
- **No-progress streak** (turns since the score last improved).
- **Stop reason** (done-condition met, cap hit, breaker tripped, human rejected, killed).
- **Success / failure** (did the run reach the done-condition).

The stop reason is the one teams skip and regret. "It stopped" tells you nothing; "it stopped because it hit the iteration cap with a flat verifier score" tells you the loop is spinning. Capture why every run ended and most of the debugging is already done.

## See it in practice

LoopRails ships a starter loop that already does this. It writes an append-only audit log every turn and a metrics record ending with a final block: stop reason, whether it passed, the final score, spend, and iterations. Those signals are written to disk on every run, which makes them queryable and makes the circuit-breaker and cap thresholds something you can see firing. The Kit's Guardrails Checklist turns the same signals into a pre-flight check: caps set, the breaker wired to no-progress, the audit log captured, a named person owning the review. Read one, run the other, and the signals stop being abstract.

## Tie it back

Monitoring closes the loop. It sits at the Run-and-Learn end of the lifecycle and feeds back in two directions. Forward, the signals become thresholds that stop a bad run. Backward, the same signals are the evidence that tells you whether to trust the next run or pull the loop and fix it.

This pairs with the BRACE Framework's observability requirements, which harden the agent's infrastructure underneath. BRACE makes the loop observable at the environment and network level; LoopRails monitoring is what you do with that observability once the loop runs. Watch the right signals, wire them to the breaker and the kill switch, and a loop running unattended at 3 a.m. is a system you can actually leave alone.
