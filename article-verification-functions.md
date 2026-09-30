# What Makes an Agent Verifier Useful?

A verifier checks a claim about an artifact or state. Its verdict is only as strong as its coverage, assumptions and resistance to being gamed.

## Choose a check that tests the claim

| Check | Strong at | Limitation |
|---|---|---|
| State assertion | Specified records and effects | Misses unspecified behavior |
| Trusted tests | Covered functionality | Passing does not establish full correctness |
| Type or compiler check | Supported structural properties | Not all intended semantics |
| Formal proof | Properties under stated assumptions | Wrong specification or assumptions remain possible |
| Simulator | Predicted environment behavior | Simulation can differ from reality |
| Human or model rubric | Ambiguous and subjective quality | Judgment can be inconsistent or biased |

There is no single ordering that makes one check best for every task. Combine complementary evidence.

## Protect the oracle

Keep hidden cases, trusted test fixtures and release criteria outside the optimizing agent’s control. Inspect changes to tests and graders. Distinguish fixes to product behavior from changes that merely make the score easier to pass.

A second agent is not automatically independent. Shared training, context and assumptions can create agreement on the same mistake.

## Evaluate repeated attempts

More trials can improve best-of-N success while increasing cost and opportunities to exploit a weak grader. Report the selection policy, budget and performance on unseen cases. Measure critical failures separately from the mean.

Current [agent-evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) emphasizes checking outcomes as well as transcripts. A convincing final answer is not evidence that the requested state change occurred.

## Keep specification separate from success

Executable checks encode part of the specification. An outer review must still ask whether they represent the user’s intent and relevant constraints. Passing a verifier can justify a bounded next step; it does not create new authority.

Use the [evals guide](evals.html) to build cases and calibrate graders, and [the two loops](article-two-loops.html) to maintain the contract.
