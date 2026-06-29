# The LoopRails Doctrine: Principles of Loop Engineering

For most of the last few years the skill people practiced was prompting: you wrote a careful instruction, read what came back, tried again. Then the work moved up a rung. Karpathy named the next one, context engineering, the craft of filling the model's window with the right files and constraints. After that came harnesses, the room an agent runs inside: its tools, its permissions, its rules. Now it has moved up again, to loops. A loop is a system that prompts an agent, checks the output, decides the next step, and repeats until a goal is met or a stop condition fires. Addy Osmani has described this shift as loop engineering. Boris Cherny has put it more bluntly: "My job is to write loops." Take those as things smart people have said about where the work is going, not as settled history.

Principles matter now because the loop is becoming the unit of work. You used to be the person in the chat box; you are becoming the person who designs the machine that runs it and then walks away. A loop that runs unattended is one of two things: an asset quietly closing tickets while you sleep, or an incident making the same mistake a few hundred times before anyone notices. The difference is almost never the model. It is the engineering around it.

That is what LoopRails is for, and the name carries two meanings on purpose. The first is rails in the Ruby on Rails sense: scaffolding and conventions that let you build agent loops quickly, with sensible defaults baked in. The second is guardrails, the controls that keep a running loop from hurting you. These are one idea, not two, because the conventions that make a loop fast to build are the ones that make it safe to run. Safe defaults are a feature, not a tax.

What follows is ten principles. The first five are mostly about building a loop that works. The last five are mostly about running one without getting hurt. The second half assumes you got the first half right.

## 1. Every loop needs a checkable done-condition

Before you write a line of orchestration, answer one question: how does this loop know it is finished and correct? If you cannot state that as a condition a program could evaluate, you have a vibe with a `while` statement around it, not a loop.

A done-condition is concrete. "The failing test now passes and no previously passing test broke" is a done-condition. "The code looks better" is not. This matters more in a loop than in hand-prompting because you are no longer there to call it: a loop stops when its condition says so, and if that condition is mushy it will either spin forever or declare victory over nothing. The good version of a test-fixing loop checks the suite by running it, not by asking the agent whether it would pass.

## 2. The verifier is the product

The hardest and most valuable thing you build is the check that decides whether each pass was an improvement, not the agent. Everything else can be mediocre and the loop will still grind toward something useful, as long as the verifier is honest. Get it wrong and the loop optimizes cheerfully toward a number that means nothing.

Two properties make a verifier worth trusting. It has to be independent of the thing producing the work, because a checker that shares the generator's blind spots will wave through the generator's mistakes. And it has to be hard to game, because a loop finds the path of least resistance to a passing grade. Give an agent a test suite and a way to edit the tests, and you will eventually find it deleted the assertions, which is not malice but what an optimizer does when you leave a shortcut lying around.

This is the heart of evaluation-driven development: you write the check first, the loop runs against it, and the check decides. A test suite the agent cannot edit, a scorer in a separate process, a review-only second agent, a human at a gate: any of these works, as long as it sits outside the maker's reach. One way to see the verifier: it is your intent, written down in a form you can run. Whatever you can put in the check is intent the loop can act on; whatever you cannot is intent still stuck in your head.

## 3. Cap the loop

Every loop runs against three budgets, and you set all three before it starts: iterations, wall-clock time, and money. The iteration cap stops a loop that cannot converge, the time cap stops one converging too slowly to be worth it, and the spend cap stops the one calling a paid API in a tight loop while you are at lunch.

An unbounded loop is an outage waiting to happen: the agent gets stuck, tries the same fixes over and over, and burns tokens or compute or rate limit until something downstream falls over. A capped exit is also a signal that the problem was harder than the loop was provisioned for, so treat it as a routine event with a clean handoff, not an error.

## 4. Memory lives in a file, not the model

The model forgets everything between turns, so whatever you do not write down is gone when the run ends. The durable state of a loop, the decisions made, the things tried, the current plan, the audit trail, belongs in the repository, not the agent's head. The agent forgets; the repository remembers.

In practice the loop reads a file at the start of each run and writes to it at the end. That file lets a run pick up where the last one left off instead of relearning the project every time, and it is your record of what the loop did and why. Keep it in version control for the same reasons you keep your code there: history, diffs, blame, and rollback to a known point. A loop whose memory lives only in a running process can lose the whole task to a crash, with nothing left to audit.

## 5. Separate the maker from the checker

One role proposes a change, a different role disposes of it: the maker writes the code, the checker decides whether it ships, and the checker does not answer to the maker. What the checker cannot be is the same agent that wrote the change, grading its own homework with the same assumptions that produced the bug. An agent asked "is this correct?" about its own output will tell you yes with confidence, because the reasoning that wrote the code is the reasoning now reviewing it. You want a separation of powers, the reason a bank does not let one clerk write and approve the same wire.

A data-cleaning loop shows the shape. The maker normalizes records; the checker is a separate validation pass that asserts invariants the maker never sees: row counts within tolerance, no nulls in required fields, totals that reconcile against a source of truth. When the checker is genuinely independent, the loop can run hard, because something that did not write the data stands guard over it.

## 6. Grade the action before you run it

Not every action carries the same weight, so not every action deserves the same gate. Grade each one before it runs, on three dimensions: reversibility, blast radius, and stakes. Combine them into a single grade from G0 to G3. A G0 action is trivial and reversible, like reading a file. A G3 action is irreversible and high-stakes, like deleting production data or moving money. The grade decides who may run the action.

Grading is what lets the loop be fast and safe at once. Reversible work, the G0 and most G1 actions, should run autonomously and at full speed, because the cost of a mistake is a quick undo. The G3 actions should require a human, because no automated check has standing to approve sending money or dropping a table. The failure modes are symmetric: treat every action as the most dangerous one and the loop grinds to a halt; treat every action as the safest and a refactor loop ends up force-pushing to main. The grade is the hinge the safety story turns on, because it puts effort exactly where the consequences are.

## 7. Put the human at the edges that matter, not everywhere

A human checkpoint is a scarce, expensive resource, and you should spend it where it changes the outcome. Approval on every step is theater: the human cannot review a thousand small diffs, so they stop reading and start clicking yes, a rubber stamp that legitimizes whatever went through. Approval nowhere is the opposite failure, a loop with no brakes on the actions that can hurt you.

Oversight should be calibrated, not uniform. Put the human at the consequential edges: the G3 actions, the irreversible ones, the moments where the question is not "is this correct" but "should we do this at all." Let the verifier handle the rest. A coding loop might run hundreds of edits with no human in sight, then stop and wait once, at the merge to a shared branch. Fewer gates, placed well, beat many gates placed everywhere.

## 8. Guardrails on by default

The controls that keep a loop safe should be present from the first run, not added after the first incident. Sandbox the agent so the worst case is contained. Give it the least privilege the task requires and nothing more. Wire in a kill switch so someone can stop it, and a circuit breaker so the loop stops itself when it misbehaves, after a run of failed verifications or a spike in retries.

Do this up front because the first incident is exactly when you have no controls, having planned to add them later, and retrofitting isolation under pressure only makes a bad day worse. The credentials you hand the loop are the only ones it has, so database write access it never needed is a blast radius you created for free. The circuit breaker is the part people skip, and the one that turns a stuck loop into a non-event.

## 9. Make stopping cheap

Two things have to be true at any moment while a loop runs: you can interrupt it, and you can roll back what it has done so far. If either is missing, you are not in control, you are watching and hoping. Interruption means a kill switch that stops the loop mid-action and leaves the system in a state you can reason about, not mid-mutation. Rollback means the loop's work is undoable: it ran in a worktree you can throw away, inside a transaction you can abort, or against changes in version control you can revert. Cheap stopping is what makes principle 6 safe, because the argument for running reversible actions fast rests on the undo being real and quick.

The version that bites people is the loop that took an irreversible action halfway through a sequence and then failed. If stopping was cheap, you halt, revert, and look. If not, you reconstruct the state of the world by hand, under pressure, which is the worst moment to learn the loop had no off switch.

## 10. Safe defaults are a feature, not a tax

The secure path should be the easy path. If doing the safe thing takes extra work, people skip it under deadline, and the loop that ships is the one with the guardrails commented out. So a developer who does the obvious thing should get sandboxing, least privilege, capped iterations, and a verifiable done-condition without having to think about it.

This is the lesson Rails taught the web. Rails made the conventional path the fast path, and a generation of developers shipped safer applications because the framework's defaults carried them there. LoopRails takes the same bet for agent loops: the scaffolding that gets you a working loop fastest should hand you a sandbox, a budget, a verifier, and a kill switch out of the box. Treat safe defaults as a tax and the safe option becomes the slow option, which you lose every time someone is in a hurry. Treat them as a feature and the fast path and the safe path are the same path, so you stop having to choose.

## The two loops

These principles run inside a structure worth naming, because it is what keeps loop engineering from collapsing into waterfall. A working loop is really two loops at different speeds. The inner loop is the agent against a fixed verifier: it proposes, the check grades, it retries, fast and unattended. The outer loop is a human looking at what the inner loop produced and sharpening the verifier and the goal: slow, deliberate, human-in-the-loop. The verifier is the seam between them, the place intent is recorded and handed down to the agent.

This answers the obvious objection to "write the done-condition first," which is that you rarely know exactly what you want up front. You do not write it once. The verifier accretes. You start with a cheap floor, it compiles, the existing tests pass, an invariant holds, and every time the outer loop catches a result that is wrong, you have found a piece of your own intent and you encode it into the check. The specification you could not write on day one assembles itself out of the failures you actually hit, the way a regression suite grows from bugs. The outer loop is not overhead. It is where intent gets clear, which is the scarce skill once generation is cheap. [The two loops](article-two-loops.html) covers this in full.

## How the principles fit together

The first five principles are about building a loop that works: a checkable done-condition tells it when to stop, an independent verifier tells it whether it got there, caps keep it from running forever, file-based memory keeps its state auditable, and separating maker from checker keeps it honest. Get those right and the loop converges on something real.

The last five are about running that loop without getting hurt. You grade each action by consequence, place the human only at the edges that matter, turn the guardrails on by default, and make stopping cheap. The grade, principle 6, is the hinge between the two halves: it lets a loop be fast and safe at once, sending reversible work down the autonomous fast lane and routing irreversible work to a human. Build with the first five, run safely with the last five, and the grade keeps you from having to choose.
