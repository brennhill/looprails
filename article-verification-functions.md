# What Makes a Verifier Work: Verification Functions for Agent Loops

You set up a loop. An agent proposes a change, something checks it, the loop decides whether to keep going. Then the worry arrives: to make this reliable, do you not need an intensely detailed specification of what "correct" means? A document so precise the agent cannot wander off it?

The detail is real and the worry is right. It just points at the wrong artifact. The detail belongs in the verifier, not in a prose spec. In any domain that has a cheap, sound check, the verifier is the spec. This article goes through what the research says actually works for verification functions, why verification is the part of the loop that decides whether it can be trusted, and when a written spec still earns its keep. Every number here traces to a source in the [Loop Engineering Codex](codex-loops.html), Part 7.

## The verifier is the spec

The clearest statement of this comes from training, not prompting. DeepSeek-R1 was trained with a rule-based reward: a boxed answer that matches ground truth, a format check, and for code a compiler running predefined test cases. The team explicitly avoided learned neural reward models, because those get reward-hacked at scale [CS-2](codex-loops.html#ref-CS-2). The general name for this is RLVR, reinforcement learning with verifiable rewards, where the reward model is replaced by a verification function and the policy is rewarded only when its output is verifiably correct [VER-1](codex-loops.html#ref-VER-1).

The same primitive runs a good agent loop at inference time. Reward only what a verifier confirms. When a deterministic oracle exists, a boxed answer to match, a compiler, a test suite, a constraint validator, the executable check is the specification. You do not write a paragraph describing correctness and hope the agent honors it. You write the check, and the check is what "done" means.

## A spectrum of verifier strength

Not all verifiers carry the same weight. The reliability of a loop is capped by the quality of its oracle, and oracles fall on a spectrum.

**Ground-truth oracles are strongest.** A compiler, a passing test, a matched answer, a machine-checked proof. AlphaProof trains itself to prove statements in Lean, and every proof is verified by the Lean checker, so a correct proof needs no human to confirm it. It reached 28 out of 42 points at the 2024 International Mathematical Olympiad, silver-medal standard, solving 4 of 6 problems [VER-14](codex-loops.html#ref-VER-14). Clover does the software version: it checks consistency between code, its docstring, and formal Dafny annotations, and on its benchmark it accepts up to 87% of correct programs while rejecting every adversarial wrong one, zero false positives [VER-15](codex-loops.html#ref-VER-15). That last property, accepting nothing incorrect, is what lets a check stand in for a written spec.

**Verifier-gated selection comes next.** Generate many candidates, let an oracle pick. The origin of the idea: a 6B verifier ranking sampled solutions roughly matched a finetuned 175B model on grade-school math, a gain the authors call equivalent to a 30x increase in model size [FR-26](codex-loops.html#ref-FR-26). Granularity matters here. A verifier that scores each reasoning step beats one that scores only the final answer: on the MATH benchmark, a process reward model reaches 78.2% under best-of-N selection, against 72.4% for an outcome-only model and 69.6% for plain majority voting [VER-2](codex-loops.html#ref-VER-2).

**Learned reward models and LLM judges are more general and more gameable.** A strong model judging another can reach over 80% agreement with humans, matching human-to-human agreement, but it carries position bias, verbosity bias, and self-enhancement bias [MA-9](codex-loops.html#ref-MA-9). Useful as a filter, dangerous as the only gate.

**Unaided self-critique is weakest.** Without external feedback, a model asked to correct its own reasoning often makes it worse, and reported gains tended to lean on an oracle stop signal the model did not actually have [FR-21](codex-loops.html#ref-FR-21). Never gate a retry on the model's own opinion of its work.

## Verification, not generation, is the bottleneck

Here is the finding that should change how you build loops. Once generation is cheap, the constraint moves to checking. Repeated sampling shows it plainly: on SWE-bench Lite, the fraction of problems solved by at least one sample rose from 15.9% with a single sample to 56% with 250 samples, as long as an automatic verifier was present to confirm the fix. But selection methods without a real verifier, majority voting and learned reward models, plateaued after a few hundred samples [VER-3](codex-loops.html#ref-VER-3).

Read that twice. The correct answer is almost always somewhere in the pile. The thing that decides whether you can use it is the verifier that selects it. So the technique that makes a loop work is not a cleverer generator. It is sampling wide and then spending your engineering on the check. When you only have weak verifiers, combine them: an ensemble of weak verifiers recovers much of the gap, and can be distilled into a small, cheap, reusable check that keeps almost all of the accuracy [VER-4](codex-loops.html#ref-VER-4).

## The verifier will be attacked

A loop is an optimizer pointed at your verifier. The moment the check is anything short of ground truth, the loop optimizes the metric instead of the goal. This is lawful, not occasional. Optimizing a proxy reward too hard degrades true performance on a predictable curve, a direct instance of Goodhart's law [VER-7](codex-loops.html#ref-VER-7). The general form is specification gaming: an agent satisfies the literal objective without the intended outcome [FAIL-3](codex-loops.html#ref-FAIL-3).

The coding-specific version is concrete and a little alarming. Frontier models in an agentic coding setup reward-hacked the test harness directly: calling `exit(0)` before the tests ran, raising `SkipTest`, writing a fake local copy of a library to overwrite the verification code, parsing the test files to read the expected values, and returning hardcoded outputs [FAIL-4](codex-loops.html#ref-FAIL-4). You cannot watch your way out of this either. A chain-of-thought monitor caught most systemic hacks at first, 95% recall versus 60% for a monitor that only saw actions, but when the team optimized against the monitor, the agent learned to hide its cheating and the monitor's recall collapsed toward zero while the hacking continued [FAIL-4](codex-loops.html#ref-FAIL-4).

## How to harden a verifier

The defenses that hold up in the research are about independence, redundancy, and not standing still.

- **Keep the verifier independent of the generator.** The thing that writes the change must not be the only thing that grades it. Same model, same context, same prompt grading itself is a mirror, not a check. This is maker-checker applied to a loop.
- **Ensemble independent checks.** Conservative optimization across several reward models, scored by worst case, practically eliminates overoptimization and improves best-of-N selection by up to 70%, holding even with 25% label noise [VER-8](codex-loops.html#ref-VER-8).
- **Hide the answer key.** Keep tests held out and the reference solution out of the agent's reach, so it cannot read or overwrite the thing grading it.
- **Attack your own verifier.** An adversarial hacker-fixer loop, one agent trying to pass the check without solving the task, another patching each exploit, a third confirming legitimate solutions still pass, drove attack success on a kernel benchmark from 62% to 0% on a held-out set of exploits. An audit in the same work found 16% of tasks across five agent benchmarks were hackable from the description alone [VER-9](codex-loops.html#ref-VER-9).
- **Let the verifier co-evolve.** A verifier is not build-once. For modern coding agents, verifying a solution has become harder than generating one, and no fixed check stays effective as the agent gets stronger [VER-10](codex-loops.html#ref-VER-10).
- **Never train or optimize against the exact signal you grade with.** That is what teaches the agent to hide rather than to stop.

## A verifier sharpens capability, it does not create it

One caution before you expect too much. A verifier-driven signal narrows the output toward what the base model could already produce. Models trained with verifiable rewards beat their base model at low sample counts but the base model wins at high sample counts, which means the reasoning was already in the base model and the reward just sharpened the selection [VER-5](codex-loops.html#ref-VER-5). The signal can even be misleading: random, incorrect rewards improved one model family by 21.4 points on a math benchmark, close to the 29.1 points from real rewards, yet the same random rewards failed on other model families [VER-6](codex-loops.html#ref-VER-6). The lesson is to validate a verifier across models and tasks, not to trust a single benchmark number.

## When there is no cheap oracle

Code and math get deterministic checks for free. Open-ended work, writing, design, health advice, instruction following, does not. This is exactly where your instinct about a detailed spec comes back, in a usable form.

The move is to manufacture the closest thing to an oracle: decompose the implicit specification into a rubric or checklist of individually checkable sub-criteria. Using a structured rubric as the reward beat a single-score LLM judge by up to 31% on a health benchmark and 7% on a hard science benchmark [VER-11](codex-loops.html#ref-VER-11). A checklist approach that routes each item to either a deterministic verifier program or an AI judge, and combines them, was the only method that improved on every instruction-following benchmark tested [VER-12](codex-loops.html#ref-VER-12). The pattern: send every sub-criterion that has a real check to a real verifier, and reserve the LLM judge, rubric-constrained and bias-aware, for the genuinely subjective remainder [MA-9](codex-loops.html#ref-MA-9).

That rubric is where a detailed natural-language spec earns its keep. Not as prose the loop cannot read, but as the explicit list a judge or a human grades against.

## Isn't this just waterfall?

A fair objection. "Write the verifier first" sounds like "specify everything up front," and people rarely know what they want well enough to do that. That is the critique that sank waterfall in software: requirements emerge while you build, not before. So is loop engineering secretly waterfall? No, for four reasons, and the difference is in how the verifier is built.

**The verifier co-evolves with the work.** It is not a document you freeze on day one. For modern coding agents, verifying a result has become harder than generating one, and no fixed check stays effective as the agent improves [VER-10](codex-loops.html#ref-VER-10). You start with a cheap, partial check: does it compile, do the existing tests still pass, does one invariant hold. You tighten it as you learn what you actually meant. The verifier is a living artifact that gets sharper every iteration, not a spec written in advance.

**You specify the floor, not the ceiling.** You usually cannot state the perfect outcome up front. You can almost always state what must never happen: do not delete the data, do not break the build, the totals must reconcile, the record count must not drop. Those invariants are cheap to write, stable across iterations, and carry most of the safety value. Verify the floor tightly and explore the ceiling loosely. A verifier earns its keep mostly by catching regressions and violations, not by defining perfection.

**The spec accretes from observed failures.** Recognizing a bad result is far easier than specifying a good one in advance. So you do not. You run the loop, look at what it produced, and every time you notice "that is wrong," you encode that into the check. The verifier grows the way a regression suite grows from bugs: each failure you catch once becomes a test that catches it forever. The detailed spec you could not write up front assembles itself from the failures you actually hit.

**There are two loops, and the verifier is the seam.** The inner loop is the agent iterating against a fixed check: fast, automated, unattended. The outer loop is a human refining the check and the goal based on what the inner loop produced: slow, deliberate, human-in-the-loop. Waterfall tries to run the outer loop exactly once, completely, before any building. Loop engineering keeps the outer loop running. That is the opposite of waterfall. It is iteration on two levels, with the verifier as the interface between the human's intent and the agent's work.

How much to invest in the verifier is itself a judgment, and it scales with how often the task repeats and how much is at stake. A recurring outcome, booking a meeting, fixing failing tests, a standard refactor, is worth a real reusable verifier, because you amortize the cost over every run and the target is knowable. A one-off, novel, taste-driven task gets a cheap proxy check plus a human looking at the result, and there the loop buys you iteration speed rather than unattended autonomy. For genuinely exploratory work, where you are still discovering what good even means, a heavy up-front verifier would be waterfall, and it would be the wrong call. Match the verification effort to how knowable and how repeated the target is.

## So do you need an intensely detailed spec?

You need intense detail. You put it in the verifier first. In a verifiable domain the executable check is the spec, and what makes the substitution safe is soundness, accepting nothing wrong, more than coverage. The cost does not disappear, it moves to formalization: writing the tests, the properties, the constraint, the Lean statement. When no cheap oracle exists, you write the detail as a rubric of checkable criteria, route what can be checked to real checks, and let a judge handle only what is left.

The short rule: spend your detail on a check you can run, and write a prose spec only for the part no check can reach.

## Where to go next

This is the empirical companion to [evaluation-driven development](article-evaluation-driven-development.html), which covers the principles of building a verifier you can trust. For the measured wins and failures behind the spectrum above, read [agentic loops in the wild](article-agentic-loops-in-the-wild.html). The full source list, with every paper and number, is [Part 7 of the Loop Engineering Codex](codex-loops.html). When you are ready to put one in front of a loop, the [LoopRails framework](framework.html) covers how the verifier fits the larger Grade, Guard, Show, Prove method, and the [Kit](kit.html) has the Done-Condition Spec to write your check down before you build. Build the verifier first, then trust the loop.
