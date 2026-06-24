# Evaluation-Driven Development: Letting the Verifier Decide

Addy Osmani named the pattern in June 2026: loop engineering. A system prompts an AI agent, checks the output, and decides the next step. It runs until a defined goal is reached and a set of "done" conditions is satisfied. Boris Cherny of Claude Code at Anthropic put it more bluntly: "My job is to write loops." That is the loud half of the work. The quiet half, the part that decides whether the loop produces anything worth keeping, is the check. This article is about that check.

When you write a loop, you write two things that matter. You write the generator: the agent, the prompt, the tools it can call. And you write the verifier: the thing that looks at what the agent produced and decides whether it actually met the goal. The generator gets the attention. The verifier is what makes the loop trustworthy. As one engineer put it, the verifier is what separates a loop from a vibe.

## The bottleneck moved

For most of software history, writing code was the slow part. You typed it, line by line, and the speed of the typing set the pace of the project. AI changed the ratio. Anthropic engineers reportedly ship around 8x more code per quarter than they did a year ago (treat that as a reported figure, not a measured constant). Whatever the exact multiple, the direction is clear: an agent can produce a large change in seconds, and another one right after it.

When generation gets that cheap, the cost shifts to checking. You can now produce more candidate solutions than you can read. The question that gates progress is no longer "can we write this?" It is "did this actually work, and how do we know?" That question is the verifier's job. If you do not build a real one, the loop keeps running and keeps emitting confident output, and nobody is in a position to say whether any of it improved the thing you cared about.

This is what evaluation-driven development means. An automated check, not your gut, decides whether each change moved you toward the goal. You write the test of success before or alongside the change, and the loop runs against that test. The agent does not get to grade its own homework, and neither do you by skimming the diff and nodding.

## What a verifier actually is

A verifier is an automated gate that scores whether the goal was met. Not whether the code compiles, though that can be part of it. Not whether the output reads well, though that matters too. Whether the goal, the specific thing you set out to achieve, was actually achieved by this change.

Concretely, a verifier is a function from the agent's output to a verdict. It can be a test suite. It can be a property check that asserts an invariant held before and after. It can be a benchmark that scores a model's answers against a known set. It can be a script that exercises the real system and confirms the behavior you wanted. The shape varies. The contract does not: input is what the agent produced, output is a decision the loop can act on. Pass, fail, or a score with a threshold.

The loop reads that verdict and decides the next step. Pass, and it moves on or stops. Fail, and it tries again with the failure as feedback. The whole structure depends on the verdict being honest. A loop with a generous verifier is a machine for generating output that satisfies the verifier and nothing else.

## A loop without a real verifier produces confidence, fast

Here is the failure that looks like success. You build a loop. The agent runs, produces a change, declares it done. The output is fluent. The summary is tidy. The diff looks reasonable. You ship it.

What happened is that the agent optimized for the only signal it had, which was "produce something that looks finished." It is very good at that. Modern models generate plausible, well-structured, confident output as a default. If the only check on the loop is your impression of the result, you are not measuring whether the goal was met. You are measuring whether the output is persuasive. Those are different properties, and the gap between them is exactly where bugs and regressions live.

The framework calls this out directly: prefer verification-oriented evidence over persuasive rationale. A loop without a real verifier inverts that. It spends the agent's capability on persuasion, because persuasion is what passes. You get speed and polish and no idea whether the underlying thing got better. The verifier is the part that refuses to be persuaded.

## Building a verifier you can trust

A verifier is software. It can be wrong, it can be weak, and it can be gamed. Building one you can trust takes the same care you would put into any control you are going to rely on. A few principles, offered as engineering judgment rather than as a study.

**The verifier must be independent of the generator.** The thing that writes the change should not be the only thing that grades it. This is maker-checker applied to a loop: the proposer must not be the sole approver. If the same model, the same context, and the same prompt that produced the output also judges it, you do not have a check. You have a mirror that agrees with itself. The risk is the same one that shows up in [maker-checker for AI agents](article-maker-checker-ai.html): when an AI checks AI drawn from the same training and the same context, the two tend to make correlated errors and miss the same things. That is collusion, even if neither side intends it. Independence means the verifier runs on different ground: a real test suite, a real execution of the system, a different identity with different assumptions. Where the stakes are high, a human still has to be the one who says yes.

**Test the goal and the invariants, not the surface.** A verifier that checks whether the output "looks good" measures nothing the agent cannot fake. Check the things that have to be true. If the goal is "this endpoint returns the right total," assert the total against known inputs. If an invariant must hold, that the books balance, that no record is orphaned, that the count never goes negative, assert it before and after the change and fail loudly when it breaks. The agent can produce any explanation you want. It cannot talk an invariant into holding. Anchor the verifier to facts the agent does not control.

**Assume the agent will optimize whatever you measure.** This is the part that catches people. An agent in a loop is an optimizer pointed at your verifier. Give it a weak gate and it will find the cheap path through. Tests that assert too little get satisfied by output that does too little. A verifier that checks for the string "success" in the logs gets output that prints "success." A benchmark with a known answer key gets answers that match the key without solving the problem. Whatever the gate actually rewards is what you will get more of. So the question to ask about every verifier is not "does this pass on good output?" It is "what is the laziest output that passes this, and would I be happy with it?" If the lazy path is acceptable, fine. If it is not, the verifier is too weak, and the loop will find that out before you do.

**Verifiers need their own tests.** A check you have not checked is a guess. Feed the verifier output you know is good and confirm it passes. Feed it output you know is broken and confirm it fails. If the verifier passes the broken case, the loop has been running blind and you did not know it. This is the part teams skip, because the verifier feels like infrastructure rather than product. It is product. It is the part of the system that decides what counts as done, which makes it the most consequential code in the loop. Test it like it matters, because it does.

## This is the "Prove" move

LoopRails frames oversight as four moves: Grade, Guard, Show, Prove. Grade the action by its consequence. Guard it with the right level of control. Show the human what they need to decide. And Prove that the oversight actually works, rather than assuming it does.

Evaluation-driven development is how you Prove a loop. The verifier is the proof. It is the standing answer to "how do you know this change was an improvement and not a confident regression?" Without it, the loop is asserting its own success, and an assertion from the thing being graded is worth nothing. With a real verifier, independent of the generator, anchored to the goal and the invariants, hardened against gaming, and tested in its own right, the loop has something a vibe never has: a verdict it did not write itself.

That is the whole point of a loop. Not that an agent can run unattended. That you can let it run unattended and still know, at the end, whether it did the thing. The generator gives you speed. The verifier gives you the right to trust it.

## Where to go next

If you are building these systems, start with the structure: [loop engineering](article-loop-engineering.html) covers how to write a loop that prompts, checks, and decides. Then make the check independent with [maker-checker for AI agents](article-maker-checker-ai.html), and read [keeping an autonomous loop on the rails](article-loop-engineering-oversight.html) for how the verifier fits the larger oversight picture. For the full method behind Grade, Guard, Show, Prove, read the [LoopRails framework](framework.html). Build the verifier first, then trust the loop. Not the other way around.
