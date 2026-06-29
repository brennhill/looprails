# The Two Loops: Closing the Delivery Gap with Intent Clarity

There is a gap in every software project between what someone intended and what actually got built. Call it the delivery gap. Most of the pain of shipping lives in that gap, and most of it is not a coding problem. It is an intent problem: nobody stated clearly enough what they wanted, so what came back was not it. Agents do not remove this gap. They make it faster and more visible, because an agent delivers exactly what your instructions and your checks say, and the distance between that and what you meant shows up right away.

Loop engineering, underneath the mechanics, is a way to close that gap without pretending you can specify everything up front. It does it with two loops.

## The verifier is intent, written down so you can run it

In a loop, the verifier is the thing that decides whether a pass met the goal. Look at it from the intent side and it is something more specific: the verifier is the part of your intent you have made explicit enough to execute. Whatever you can encode in the check, the tests, the invariants, the rubric, is intent the loop can act on. Whatever you cannot encode is intent still living in your head, where neither a teammate nor an agent can see it.

That turns the slogan "the verifier is the spec" into something more useful for building. The verifier is intent made executable, and the delivery gap is the distance between the intent in your head and the intent in the check. Closing the gap means moving intent out of your head and into the check, one piece at a time. For what actually makes a check trustworthy once you write it, see [what makes a verifier work](article-verification-functions.html).

## The inner loop and the outer loop

A working loop is really two loops running at different speeds.

The inner loop is the agent against a fixed verifier. It proposes, the check grades, it tries again, until the check passes. Fast, automated, able to run unattended. The inner loop closes the gap between the output and the current statement of intent. It is good at this and getting better, which is exactly why generation is no longer the bottleneck.

The outer loop is you. You look at what the inner loop produced and you sharpen the verifier and the goal. Slow, deliberate, human-in-the-loop. The outer loop closes the gap between the current statement of intent and what you actually meant. It is the loop that does the intent clarity.

The verifier sits on the seam between them. It is where intent is recorded, handed to the agent, and improved. The inner loop reads it; the outer loop writes it. A loop that has only an inner loop runs fast toward the wrong target. A process that has only an outer loop is a person editing a spec that never runs. You need both, and you need to know which one you are in.

## Intent clarity is emergent, which is why this is not waterfall

The objection to "write the verifier first" is that it sounds like waterfall: specify everything before you build. And you cannot, because you do not know exactly what you want until you see what you do not want. That objection is right about people and wrong about the method, because the verifier is not written once up front. It accretes.

You start the inner loop with a cheap floor: the code compiles, the existing tests pass, one invariant holds. You run it, you look at the output, and every time you notice "that is wrong," you have just discovered a piece of your own intent. You encode it into the check. The verifier grows the way a regression suite grows from bugs: each failure you catch once becomes a check that catches it forever. The detailed specification you could not write on day one assembles itself, in the outer loop, out of the failures you actually hit.

So the outer loop is not overhead. It is the intent-discovery engine. Waterfall tries to run it exactly once, completely, before building anything. Loop engineering keeps it running, and banks every pass in the verifier.

## What this changes about how you build

- Stop trying to write the perfect spec first. Write the floor, the invariants you already know, and start the inner loop against that.
- Treat every outer-loop pass as intent clarification, and store the result in the verifier, not in a doc nobody runs. A clarified intent that lives only in a meeting is gone by the next sprint.
- Spend your effort on the cadence of the outer loop and the quality of the verifier, because that is where the delivery gap actually closes. Generation is cheap now; intent is the constraint.
- Match the investment to repetition. A recurring outcome, booking a meeting, fixing failing tests, a standard refactor, earns a real reusable verifier, because you amortize it over many runs and the target is knowable. A one-off, exploratory task gets a cheap proxy check plus your own eyes, and there the loop buys iteration speed, not autonomy.

## The bridge to the delivery gap

For a team, the delivery gap is the difference between what the business meant and what shipped, and the team that closes it fastest is the one that clarifies intent fastest. The two loops are how you do that with agents. The inner loop turns intent into working software at machine speed. The outer loop turns observed output back into sharper intent. The verifier is where that intent is stored and compounded, run after run, so the clarity you bought last week is not relearned this week.

This is the part that does not get automated away. As generation gets cheaper, the scarce skill is not writing the code, it is knowing what you actually want and encoding it well enough to check. Intent clarity is the work now. The two loops are how you get it.

## Where this fits

The two loops are the working shape behind [the LoopRails Doctrine](article-loop-engineering-doctrine.html) and the [framework](framework.html). Start with [loop engineering](article-loop-engineering.html) for how to write a loop that prompts, checks, and decides; read [what makes a verifier work](article-verification-functions.html) and [evaluation-driven development](article-evaluation-driven-development.html) for how to build the check the whole thing turns on; and use the [Kit](kit.html) to write your done-condition down before you build. Generation is the inner loop. Intent is the outer one. Build for both.
