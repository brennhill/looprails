# Evaluation-Driven Development for Agents

Build the check alongside the agent. An eval should tell you whether a change improved the product behavior you care about, under the same conditions you will deploy.

## Turn failure into a case

Inspect real traces and artifacts. Write down the goal, initial state, allowed actions, expected outcome and unacceptable effects. Include cases where the agent should abstain or escalate, not only cases where it should act.

Use production failures, expert examples and deliberate adversarial variants. Synthetic cases help fill gaps but need validation against real work.

## Choose a grader

Prefer direct state checks, trusted tests or assertions for behavior that can be specified. Use rubrics and model judges for subjective quality, calibrated against qualified human labels. Keep a cannot-tell outcome when evidence is insufficient.

A verifier inside one run and a release eval serve different decisions. The first checks whether this artifact is ready; the second estimates performance across tasks and repeated trials.

## Compare changes fairly

Hold the dataset, environment, budgets and grading policy constant. Evaluate baseline and candidate on the same cases. Inspect important disagreements and critical failures, not just the average score.

[Anthropic’s infrastructure-noise analysis](https://www.anthropic.com/engineering/infrastructure-noise) is a reminder that resource settings can change measured agent results. Record them as part of the experiment.

## Protect the check

Do not let the optimizing agent edit hidden cases or weaken the release gate. Use held-out audits, repeated trials and production monitoring to reveal overfitting and drift. Passing tests proves only the behavior those tests cover.

Start with the [full eval-building guide](evals.html) and [verification-function guide](article-verification-functions.html). Add a small regression case for each confirmed production failure.
