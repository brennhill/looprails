# Agent Loops in Practice: Read the Result and the Cost

An agent’s reported success depends on its task, tools, checks and budget. Read case studies for design lessons. Check the setup before applying their results to your own work.

## What the examples teach

| Example | Useful lesson | Limit |
|---|---|---|
| Compiler-guided optimization | Concrete feedback can guide repeated improvement | Supported transformations and benchmark workloads |
| Test-guided coding | Executable checks make some outcomes easier to verify | Tests can miss behavior or be weakened |
| Verifiable math and proof tasks | Strong correctness signals support search and training | Not every product task has a comparable oracle |
| Multi-agent research | Parallel exploration can increase coverage | Added cost, coordination and source-verification work |
| Reward gaming | A score can improve while the intended task fails | The score may be an incomplete proxy |

The [case-study bibliography](codex-loops.html#ref-CS-1) preserves the historical papers and reported results. Those systems are examples, not recommendations for current model selection.

## Ask five questions of every result

What exactly counted as success? Was the grader independent of the optimizing system? How many attempts and how much compute were allowed? Did performance hold on unseen tasks? What harmful or unauthorized effects were checked separately?

Best-of-N success differs from reliability across every attempt. A system that eventually finds one good result may still be unsuitable for actions whose failed attempts are costly.

## Check the environment

[Infrastructure-noise research](https://www.anthropic.com/engineering/infrastructure-noise) shows that resource and environment settings can influence agent scores. Record those settings alongside model and prompt versions.

Build your own representative cases and compare with a simpler baseline at a stated budget. Inspect failures and final state, then use the [evals guide](evals.html) to turn confirmed issues into regression tests.
