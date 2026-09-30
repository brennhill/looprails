# What Is Loop Engineering?

Loop engineering designs the cycle around an AI agent: propose work, execute within bounds, check the result and decide whether to finish, retry or escalate.

The term describes a practical engineering pattern. It does not require a new class of model or make repeated prompting reliable by itself.

## The pieces that matter

| Piece | Job |
|---|---|
| Goal and scope | Define the desired result and permitted actions |
| Context | Supply relevant state, constraints and evidence |
| Tools | Execute actions through controlled interfaces |
| Verifier | Check specified outcomes and prohibited effects |
| Controller | Choose finish, bounded retry or escalation |
| Operational controls | Enforce budgets, recovery, authorization and stopping |

A verifier is strong evidence only for what it actually checks. A test suite can miss behavior; a judge can be biased; a simulator can predict the wrong outcome.

## Start with a checkable task

Choose a small task whose result you can inspect independently. Preserve the starting state, write explicit done-conditions and set time, retry and spending caps. Run in a contained environment before granting external capabilities.

Use the simplest controller that works. Fixed workflows are often enough. More agents, reflection steps or planning calls need to earn their added cost in an evaluation.

## Keep improving the check

An inner loop improves an artifact against current checks. An outer loop compares those checks with user needs, production failures and independent audits. Protect evaluation data and policy from the component optimizing against them.

[Anthropic’s current agent-evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) emphasizes complete outcomes and repeated trials. Apply that discipline to your own task distribution rather than treating a benchmark as a deployment guarantee.

Start with [build your first loop](article-build-agent-loop.html), the [templates](kit.html) and the [starter](https://github.com/brennhill/looprails/tree/main/starter).
