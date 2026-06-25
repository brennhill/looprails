# When the Verifier Is a Compiler: A Loop Optimization Case Study

Most of what LoopRails argues is hard to put a number on. Here is a case where someone did. A 2025 study built a loop in which a language model optimizes code, with a compiler as the verifier, and measured what it bought. It is one of the cleaner demonstrations of why a loop with a real verifier beats a clever prompt.

The paper is "Agentic Auto-Scheduling: An Experimental Study of LLM-Guided Loop Optimization" by Massinissa Merouani, Islem Kara Bernou, and Riyadh Baghdadi ([arXiv 2511.00592](https://arxiv.org/abs/2511.00592), November 2025; catalogued as [CS-1](codex-loops.html#ref-CS-1)). The system is called ComPilot. Every number below is theirs, measured on the PolyBench benchmark suite.

## The setup

Optimizing a loop nest, the kind of nested loops at the core of numerical and array code, is a known-hard problem. The space of legal transformations is large, the payoff depends on the hardware, and a transformation that looks good can turn out slower, or worse, incorrect.

ComPilot puts an off-the-shelf LLM in a loop with a compiler. No fine-tuning. The loop is short to describe:

1. The model proposes a transformation for a given loop nest.
2. The compiler attempts it and reports two things back: whether the transformation was legal, and the measured speedup or slowdown.
3. The model reads that concrete feedback and proposes its next move.

Repeat until it stops improving. That is the whole shape. If you have read the loop-engineering material on this site, it will look familiar, because it is the same loop, applied to a domain where the verifier happens to be excellent.

## The compiler is the verifier, and that is the point

The reason this works is the compiler. In LoopRails terms it is close to an ideal verifier: independent of the model that proposes the work, impossible to talk into a wrong answer, and returning ground truth rather than an opinion. The model cannot argue with a measured runtime.

It also splits cleanly into the two checks a good loop wants. Legality is the correctness gate: a transformation that changes what the code computes is rejected outright, no matter how fast it looks. Measured speedup is the quality metric: among the legal transformations, keep the one that actually runs faster. A change ships only if it is legal and faster. That is the same structure as grading an action and gating it, correctness first, then optimize within what is allowed.

Compare that to asking a model to "optimize this loop" in a single prompt. Without the compiler you get a transformation that looks plausible, and you have no idea whether it is correct or fast until you run it. The loop is what turns "looks plausible" into "measured and legal." The verifier is what separates a loop from a vibe, and here the verifier is a compiler.

## What the numbers say

On PolyBench, ComPilot reports a geometric mean speedup of 2.66x on a single run over the original code, and 3.54x when it takes the best of five runs [CS-1](codex-loops.html#ref-CS-1). It is competitive with Pluto, a state-of-the-art polyhedral optimizer built specifically for this job, and beats it in many cases.

Two things in those numbers are worth sitting with.

The jump from 2.66x to 3.54x is the value of best-of-five, and it is a clean example of a pattern the cookbook calls verifier-gated selection: run the loop several times and let the verifier pick the winner. Each run explores a different path, the compiler scores them all on the same ground truth, and you keep the best. The model does not have to be right on the first try, because the verifier is cheap to run and never lies, so you can afford to sample. The extra 0.88x is what that sampling bought, measured.

The second is that this is zero-shot. An off-the-shelf model, with no task-specific fine-tuning, competes with a specialized optimizer. The capability did not come from training the model on loop optimization. It came from the harness: a tight loop, a verifier that returns concrete legality and timing, and the model's ability to use that feedback. The model is the same one you could call for anything. The loop is what made it good at this.

## Why it matters for how you build

This study lands on three things LoopRails keeps saying, and gives each one evidence.

A loop beats a prompt when you have a real verifier. The whole gain here comes from feeding measured, ground-truth feedback into the next attempt. If you can check the work cheaply and honestly, build the loop.

The verifier is the asset, so go find the best one you have. A compiler is a gift: legality and timing, for free, every iteration. Not every domain has one this good, but most have something better than a human glance: a test suite, a metric on a held-out set, a type checker, a linter, a simulator. The quality of your loop is the quality of your verifier, and this study is what it looks like when the verifier is excellent.

Reach for the harness before you reach for fine-tuning. ComPilot did not tune a model. It wrapped a general model in a good loop and matched a purpose-built tool. Before you spend on fine-tuning, spend on the harness and the verifier, which is the order the [model adaptation](article-lora-vs-fine-tuning-vs-pre-training.html) ladder recommends. Sometimes the loop is the whole answer.

None of this removes the rest of the rails. ComPilot's actions are reversible, since a rejected transformation costs a compile rather than an outage, and the verifier is automated and trustworthy, so this loop earns a lot of autonomy. A loop whose actions move money or delete data, with a verifier you trust less, earns much less. The lesson is narrow: a loop is exactly as good as its verifier, and this one had a great verifier. For where a human still belongs, see [evaluation-driven development](article-evaluation-driven-development.html) and the [framework](framework.html).
