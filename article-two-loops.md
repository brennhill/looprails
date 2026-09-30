# The Two Loops

An agent loop tries to produce work that passes a check. A separate improvement loop asks whether that check still represents the user’s needs and operational constraints.

These loops run at different speeds and have different responsibilities.

| Loop | Question | Typical evidence |
|---|---|---|
| Inner delivery loop | Does this artifact meet the current contract? | Tests, state checks, rubrics and tool results |
| Outer improvement loop | Is the contract measuring the right behavior? | User feedback, production failures and held-out audits |

## The inner loop

Propose, act within scope, verify and either finish or retry within budget. Keep the goal and rules stable enough to evaluate progress. Passing the check does not authorize unrelated actions.

Protect trusted tests and hidden cases from the component optimizing against them. Otherwise the quickest route to a pass may be to weaken the check.

## The outer loop

Inspect actual failures and disagreements. Clarify ambiguous intent, improve cases and graders, and revise permissions or recovery controls. Keep independent audit cases to distinguish general improvement from overfitting.

An approval of a plan can be part of oversight, but the outer loop is broader: it maintains what “good” means. It should not require a person to inspect every trivial intermediate action.

## Avoid moving the target invisibly

Version the contract, dataset, grader and environment. Record why a criterion changed. Compare baseline and candidate under the same version before shipping.

[Current agent-evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) supports this separation between improving capability and protecting regression behavior. LoopRails uses the two-loop model as a design aid, not a standardized taxonomy.

Use the [eval-building guide](evals.html) to operate the improvement loop and the [done-condition template](kit.html) to define one delivery run.
