# How to Keep an Autonomous Loop on the Rails

**Loop engineering** is the practice of building a system that prompts an agent, checks the output, decides the next step, and repeats, running unattended until a goal is met. Addy Osmani named it in June 2026, and Boris Cherny, who works on Claude Code at Anthropic, put the job description plainly: "My job is to write loops." A loop runs many actions with no human watching each one. That single fact changes the safety question. You stop asking "did I approve this step" and start asking "what can this loop do while no one is looking, and how do we stop it when it goes wrong." This article shows how to put oversight around an autonomous loop using LoopRails, a free practitioner framework whose method is **Grade · Guard · Show · Prove** (see [the framework](framework.html)). For the engineering pattern itself, start with [loop engineering](article-loop-engineering.html).

## A loop relocates oversight, it does not remove it

The instinct when a team adopts loop engineering is to assume oversight has gone away, because nobody is clicking approve anymore. That instinct is dangerous. The oversight has not disappeared. It has moved.

When you approved every step, your judgment sat in the path of each action. That was your safety. The moment you let an agent loop unattended, you pulled your judgment out of the path, and the safety has to go somewhere. If you do nothing, it goes nowhere, and you are standing at the edge of the YOLO Cliff: full autonomy with nothing to contain a cascading mistake. So the work of loop engineering is not only writing the loop. It is rebuilding, in the system, the oversight you used to provide in person. Grading, gating, circuit breakers, a kill switch, and a clean audit trail are the part of your old job you cannot delete just because you stopped doing it by hand.

## Grade the actions the loop can take

A loop is a set of actions wrapped in a controller. The controller is new. The actions are the same ones any agent takes, and you grade them the same way. LoopRails grades each action on three axes: **reversibility, blast radius, and stakes.** The highest axis sets the grade. That gives you four grades, G0 through G3. Run your loop's tool calls through the [LoopRails grader](index.html#grader) and you get a grade per action plus the controls that match it.

- **G0 (trivial).** Fully reversible, contained, near zero stakes. Reading a file, running a query.
- **G1 (low).** Reversible with some effort, limited blast radius. Renaming a local symbol, a draft PR.
- **G2 (high).** Hard to reverse, shared blast radius, real money or trust at stake. A push to a shared branch, a deploy to staging.
- **G3 (critical).** Irreversible and external or severe. Deleting production data, a wire transfer, a destructive command, a mass send.

Inside a loop the grade decides how much freedom each action gets. Let the loop run **G0 and G1 actions freely and logged.** That is the whole point of the loop: do the cheap, recoverable work fast, without a prompt, with a record. Prompting a human for a G0 read is not oversight. It trains a rubber stamp, and the rubber stamp poisons judgment on the actions that actually matter.

The hard part is G2 and G3 reached from inside a loop. A confirm-before prompt assumes a human is sitting there ready to read the real change and catch a mistake in time. In a loop, no one is. The prompt fires at 3 a.m. into an empty room, or it fires forty times an hour until the person approving has stopped reading. So for **G2 and G3 actions a loop can reach, deploys, payments, destructive commands, irreversible writes, you either gate them or prevent them by design.** Gate means the loop pauses and a real human, with real context, authorizes before that one action proceeds. Prevent means the dangerous version cannot execute at all: cap the blast radius, force reversibility, sandbox the destructive command, lock the capability. The choice comes down to the core question in all of LoopRails: can a human realistically catch this mistake in time? If the honest answer is no, prevent it, because a confirm prompt no one reads is a delay with a signature on it. For how grade maps to autonomy, see [AI agent autonomy levels](article-ai-agent-autonomy-levels.html).

## A loop fails differently: it repeats

Here is the property that makes a loop more dangerous than a single prompt. A single bad action is one bad action. A loop takes that same bad action and runs it again. And again. A small error becomes a thousand.

This is the runaway loop, the failure mode loop engineering invites by design. The loop is built to keep going until the goal is met. When the goal check is wrong, or the environment shifts under it, or a tool starts returning garbage that the next step treats as truth, the loop does not get tired or bored. It just keeps firing, and the error compounds at machine speed. Knight Capital is the example from the same family: in 2012, malfunctioning trading software kept firing orders with no effective automatic stop and lost roughly 440 million dollars in about 45 minutes. No human reaction time closes a gap that fast.

A runaway loop needs two things that have nothing to do with per-step approval.

**A circuit breaker.** An automatic control that pauses the loop the moment a measured condition crosses a threshold, then refuses to resume until a human re-authorizes. Trip it on error rate, on spend (and on the rate of spend, which catches a runaway before it drains the budget), and on action volume. Set the thresholds server-side, outside the prompt, so the loop cannot talk its way past them. The breaker is the part of the system still watching at 3 a.m. Full detail in [circuit breakers for AI agents](article-circuit-breaker-ai-agents.html).

**A kill switch.** The human override for when the breaker did not catch it. One action stops the whole loop now, and it has to cancel in-flight work, not let the current batch finish. A stop that lets the loop drain its queue is a half-stop, and a half-stop on a runaway is still a runaway. Anyone should be able to pull it, and pulling it is never the wrong call. See [the AI kill switch](article-ai-kill-switch.html).

The breaker fires by itself on a threshold. The kill switch is pulled by a person in an emergency. A loop running unattended needs both, because the thing you are protecting against is precisely the case where no one was watching.

## The memory file and logs are your audit trail

When a human approves each step, the approval is the record. You know what happened because you were there. A loop removes the witness, so the loop's **memory file and its logs become the audit trail**, carrying the weight the live human used to.

This is the **Logged** property in RAIL, the four properties every governed action should keep: **R**eversible, **A**uthorized, **I**nterruptible, **L**ogged. In a loop, Logged stops being good hygiene and becomes the only way you will ever know what the loop did. After a long unattended run you reconstruct the whole episode from the memory file and the action log: what the loop decided, what it acted on, what each step returned, when the breaker tripped and on what, who pulled the kill switch and why. If that trail is thin, you have no oversight after the fact either, because there was none during.

So treat the memory file and logs as a first-class output of the loop. Log every action with its grade, target, result, and time, complete enough that someone who slept through the whole run can answer the only question that counts when a loop goes wrong: what did this thing do while no one was looking.

## Autonomy is a dial, so spend your human checkpoints where they count

A loop sits high on the autonomy ladder by definition. That is the deal you signed when you wrote it. The mistake is to react by sprinkling human checkpoints across the whole thing to feel safe. That does not make the loop safe. It makes the loop slow, and worse, it trains the person at the checkpoint to approve without looking, because the ninety-ninth prompt is the same as the first ninety-eight and they were all fine. That is a rubber stamp.

Autonomy is a dial, not a switch, and you set it per action. Most of a loop should run autonomous and logged. **Reserve human checkpoints for the few highest-consequence actions,** the G2 and G3 moments where a human can still catch the mistake in time and the action is worth the interruption. Everything else runs free under the breaker and the kill switch. A handful of real gates that people actually read beats a hundred reflexive clicks, which is also why you prevent the worst actions instead of gating them and save the human's attention for where it has a real chance of working.

## A checklist before you let a loop run unattended

Run this against any loop before it runs with no one watching.

- [ ] **Every action the loop can take is graded** G0 to G3 by reversibility, blast radius, and stakes.
- [ ] **G0 and G1 actions run freely and logged.** No prompts on trivial, recoverable work.
- [ ] **Every G2 and G3 action is gated or prevented by design.** No confirm prompt that depends on a human who is not there.
- [ ] **A circuit breaker trips automatically** on error rate, spend, spend rate, and action volume, enforced server-side, and an open breaker resumes only on a deliberate, logged human re-authorization.
- [ ] **A kill switch exists, anyone can pull it, and it cancels in-flight work,** not just future work.
- [ ] **The breaker and kill switch are tested** by inducing the condition, not assumed to work.
- [ ] **The memory file and logs capture every action,** its grade, target, result, and time, complete enough to reconstruct the run cold.
- [ ] **Human checkpoints are reserved for the few highest-consequence actions,** not spread across the loop.
- [ ] **For the riskiest actions you have answered the core question:** can a human realistically catch this mistake in time, and if not, is it prevented rather than gated.

The loop is a powerful pattern, and it is going to be how a lot of agent work gets done. Just remember what you traded for the speed: you took your judgment out of the path of each action, so put it back into the system as grades, gates, a breaker, a kill switch, and a log you can read the morning after. Grade your loop's actions with the [LoopRails grader](index.html#grader), pair it with [evaluation-driven development](article-evaluation-driven-development.html) so you know the loop is meeting its goal and not just running, then build the rails before you let it loose.
