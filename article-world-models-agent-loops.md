# World Models: Preview Before Acting

A world model predicts what may happen after an action. An agent can use it to compare plans, practice in simulation or spot likely consequences before acting.

A prediction is evidence about a possible outcome, not an authorization or a guarantee.

## Three useful roles

**Consequence preview:** Estimate affected state before a consequential operation. Prefer a real dry run, staging environment or transaction-based check where available.

**Planning:** Compare bounded candidate action sequences in simulation, then validate assumptions before executing in the real environment.

**Offline evaluation:** Exercise the agent in repeatable simulated tasks while checking whether simulation behavior transfers to production.

[Qwen-AgentWorld](https://arxiv.org/abs/2606.24597) reports language-world-model training and downstream gains in its benchmark settings. Those results do not establish that learned predictions are reliable safety checks for arbitrary payments, database changes or clinical decisions.

## Where predictions fail

Rare states, new tools and changing environments create a simulation-to-reality gap. Prediction errors can compound over several steps. Using the same model for planning and prediction can produce correlated mistakes.

A [September 2026 world-agent benchmark](https://arxiv.org/abs/2609.32692) reports weaker performance as pre-built structure is removed. It is early evidence about that benchmark, not a deployment assurance standard.

## Use concrete previews first

An infrastructure plan, a supported dry-run API or a staging execution may provide stronger evidence for a narrow action. SQL EXPLAIN shows an execution plan; it does not prove the intended business effect or reveal every side effect.

Calibrate predictions against actual outcomes. Keep authorization, effect limits, cancellation and recovery independent of the simulator. For critical actions, a predicted safe outcome cannot replace the required decision owner.

See [verification functions](article-verification-functions.html) and the [G3 guide](guide-g3.html).
