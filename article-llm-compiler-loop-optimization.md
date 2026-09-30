# A Compiler-Guided Optimization Loop

ComPilot uses a language model to propose loop transformations, then receives compiler legality checks and measured performance as feedback. It illustrates a bounded task with concrete checks.

The [study](https://arxiv.org/abs/2511.00592) reports geometric-mean speedups on PolyBench of **2.66× for a single run** and **3.54× for best-of-five**, relative to the original code. These are benchmark results for that setup, not expected gains for arbitrary software.

## The loop

1. Propose a transformation.
2. Check whether the compiler accepts it as legal.
3. Measure performance under a defined setup.
4. Use the feedback to select or revise a candidate.

Correctness and speed are distinct criteria. Reject an invalid transformation even when its measured runtime looks better.

## What the verifier establishes

A legality check is strong evidence within the compiler’s supported transformation model. It does not establish every application-level property. Runtime measurements can vary with hardware, resources, warmup and input selection.

Protect the benchmark harness, compare against the same baseline and inspect performance beyond the tuning cases. The model must not “improve” a score by removing required computation or changing the measurement setup.

## What best-of-five means

Selecting the best result from several attempts buys exploration with additional compute. Report the selection policy and cost. The increase in a speedup ratio is not a separate universal speedup contribution.

## The transferable lesson

Before tuning a model, see whether better tools, feedback and independent checks solve the observed problem. That is an engineering hypothesis to test, not evidence that a harness always beats fine-tuning.

The [verification guide](article-verification-functions.html) explains check coverage and gaming. The [evals guide](evals.html) covers repeatable comparisons.
