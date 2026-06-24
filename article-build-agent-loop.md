# How to Build Your First Agent Loop

You have driven an AI agent by hand. You type a prompt, read what comes back, type the next prompt, and repeat until the thing is done. A loop replaces you in that chair. It prompts the agent, checks the output, and decides the next step, and it keeps going until a goal is met and a set of done-conditions is satisfied. Addy Osmani named this loop engineering in June 2026. Boris Cherny, who runs Claude Code at Anthropic, described his own work the same way: "My job is to write loops." This article walks you through building your first one, end to end.

The approach here is opinionated on purpose. Ruby on Rails made web apps fast because it shipped conventions and sensible defaults, so you did not relitigate every decision before you wrote a line. A loop framework does the same for agents. It gives you a shape to fill in, and it puts the safety in the defaults instead of leaving it as homework. The guardrails that keep a loop from hurting you are part of the convention, not an extra project you do later. By the end you will have a loop you can leave running.

## The anatomy of a loop

A loop has a small number of parts, and once you see them you see them in every loop.

**The driver.** This is the small piece of code you write. It prompts the agent, runs a check on the output, and branches on the result: keep going, stop because the goal is met, or stop because something went wrong. The driver is the loop. Everything else is a part the driver coordinates.

**The goal and the done-conditions.** The goal is what you want. The done-conditions are how the loop knows it got there. When you hand-prompt, you hold both in your head and adjust as you watch. A loop holds neither unless you write them down. A vague goal runs to the wrong finish line at speed.

**The verifier.** This is the automated gate that decides whether each pass actually improved things. A test suite, a script that exercises the system, a scorer with a threshold. The verifier does the job your eyes used to do, on every iteration. It is the heart of [evaluation-driven development](article-evaluation-driven-development.html), and it is what separates a loop from an agent making changes fast while you hope they are good.

**Memory in a file.** The model forgets everything between runs. So memory lives in a file the agent reads at the start of each pass and updates at the end: what it tried, what worked, where it is now. The agent forgets. The repository remembers.

**The harness it drives.** The harness is the environment the agent runs inside: the tools it can call, the files it can touch, the commands it can run. Your driver does not talk to the model directly. It drives the harness, and the harness runs the agent.

That is the whole machine: a driver, a goal, a verifier, a memory file, and a harness. The build is standing these up in order.

## Step 1: Pick a task with a checkable done-condition

Your first loop should target work where "done" is something a machine can confirm. Migrate a module to a new API and pass the existing tests. Bring a flaky test suite to green. Add a feature with a spec you can assert against. The shared trait is that success is a fact, not an opinion. Avoid anything whose done-condition is "looks good to me," because you cannot hand "looks good to me" to a driver. If you cannot name the check before you start, pick a different task. The loop is only as good as the thing that grades it.

## Step 2: Write the goal and the done spec plainly

Write two short paragraphs in a file. The goal: what should be true when this is finished. The done spec: the exact conditions that prove it. Be concrete. "The new client replaces the old one in all call sites, the test suite passes, and no deprecated import remains" is a done spec. "Modernize the client" is a wish. This file is a control surface now, not a convenience. If the loop does the wrong thing correctly, this is usually where the mistake started.

## Step 3: Wire the loop skeleton

Now the driver. It is smaller than you expect. Call the agent with the goal and the memory, run the verifier, branch on the result, and cap the iterations so a stuck loop stops on its own.

```
load goal, done_spec, memory
for i in 1..MAX_ITERATIONS:
    result = run_agent(goal, done_spec, memory)
    verdict = run_verifier(result)
    append(memory, result, verdict)
    if verdict == PASS:
        stop "done"
    # else: continue, with the failure as feedback
stop "hit iteration cap"
```

That is a working loop. The max-iteration cap matters more than it looks. Without it, a loop that cannot reach done will run forever, and a loop that is making things worse will keep doing so. The cap is your floor: the worst case is bounded by a number you chose.

## Step 4: Give it memory in a file

Add a memory file the agent reads at the start of each pass and writes to at the end. Keep it plain: the goal, the current state, what the last pass changed, what the verifier said, and what to try next. Without this, every pass starts from zero and the agent relearns the task each time, often repeating the same dead end. With it, pass three knows what passes one and two already ruled out. The file is the difference between a loop that makes progress and one that paces in a circle.

## Step 5: Split into a writer and a reviewer

One agent that both writes and grades its own work is a mirror that agrees with itself. Split the work into two subagents. A writer subagent makes the change. A reviewer subagent reads the change against the goal and the done spec and reports problems before the verifier even runs. This is maker-checker inside the loop, and it catches a class of error the verifier was not built to see. The writer is trying to finish. The reviewer is trying to find what the writer missed. Different jobs, different prompts, and the friction between them is the point. For more on structuring the parts, see [loop patterns for engineering and data science](article-loop-patterns.html).

## Step 6: Run it in an isolated git worktree

Run the loop in its own git worktree, separate from your working copy. A worktree gives the loop a real checkout it can edit, commit to, and thrash around in, with no risk to the branch you care about. If the run goes badly, you delete the worktree and nothing of yours is touched. This one habit changes how it feels to run a loop. A bad run becomes throwaway instead of a cleanup job. You stop watching nervously and start letting it work, because the cost of a failed run dropped to almost nothing.

## Step 7: Put the guardrails on by default

Here is where the Rails way earns its keep. You do not bolt safety on after the loop works. You start with it, because the controls you set before the loop runs are the only controls you have once it is running. You are not in the chair anymore. These are the defaults, on from the first run.

**Sandbox with no network.** Run the agent in a contained environment with networking off unless the task genuinely needs it. Most do not. No network removes the path by which a hijacked instruction reaches out, and it shrinks the blast radius to the box. This is the core of [AI agent sandboxing](article-ai-agent-sandboxing.html): whatever the loop does, including a mistake, stays inside.

**Scoped, short-lived credentials.** Give the loop the narrowest access the task needs and credentials that expire soon. Not your personal token, not broad write access to everything. If a credential leaks or is misused, a small scope and a short life keep the damage small.

**A blast-radius cap.** Decide up front what the loop is allowed to touch. A directory, a service, a dataset. Everything outside that boundary is off limits, enforced by the environment rather than by the agent's good behavior.

**A kill switch.** One command that stops the loop now, cleanly, from outside it. You should never have to hunt for how to halt a running loop. Know the stop command before you start.

**A circuit breaker on iterations and spend.** The iteration cap from step 3 is half of this. Add a spend cap so a loop that burns tokens chasing a goal it cannot reach trips off instead of running up a bill. A circuit breaker is the difference between a bounded failure and an open-ended one.

None of these slow down a loop that is working. They only bite when something goes wrong, which is exactly when you want them. For how these gates fit the larger oversight picture, read [keeping an autonomous loop on the rails](article-loop-engineering-oversight.html).

## Step 8: Schedule it once it is trustworthy

A loop you trust unattended is a loop you can put on a schedule. Run it nightly against a moving target, or on a trigger when new work arrives. But schedule last, not first. A loop earns the schedule by running clean while you watch, hitting its done-conditions, and tripping its guardrails when it should. Scheduling a loop you have not watched is just automating a process you do not understand yet. Earn the trust, then step away.

## The defaults are the feature

Notice what the build sequence actually did. The worktree that makes a bad run throwaway, the verifier that decides done, the memory file, the iteration cap, the sandbox, the scoped credentials, the kill switch: those are the same things whether you frame them as scaffolding that helped you build the loop or as guardrails that keep the loop from hurting you. They are one framework. The convention that makes a loop fast to build is the convention that makes it safe to run. That is the dual sense of rails, and it is why safe defaults are a feature and not a tax. You did not pay extra for safety. You got it by following the shape.

Build the smallest loop that hits a checkable done-condition, with the guardrails on from the first run. Watch it work, then schedule it. Do it once and you stop being the person in the chat box and become the person who builds the machine. For the method behind all of it, start with [loop engineering](article-loop-engineering.html) and the [LoopRails framework](framework.html).
