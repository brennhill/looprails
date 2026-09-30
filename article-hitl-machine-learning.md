# Human-in-the-Loop for Machine Learning

People help train models by labeling examples, choosing useful training cases and rating outputs. These forms of human-in-the-loop machine learning serve a different purpose from approving an agent’s next action.

## Grade the actions

Use these grades as starting points. Sensitive data or combined effects may raise the risk. [Check the grading rule](framework.html#2-grade-the-action).

| Action | Starting grade | Control |
|---|---|---|
| Label a non-sensitive example | G0–G1 | Use a clear rubric. |
| Change a training dataset | G1–G2 | Version data and preserve provenance. |
| Promote a model into a shared product | G2 | Compare on held-out data and review slices. |
| Deploy a model making critical decisions | G3 where consequences justify it | Validate the operational workflow and fallback. |

## Set the boundaries

Use disagreement and uncertainty to select useful examples, but audit the selection policy. Model uncertainty can be miscalibrated and may miss confidently wrong examples. Separate training, calibration and held-out evaluation data.

## Make review useful

Give annotators the context needed to judge and a cannot-tell option. Measure agreement, adjudicate disagreements and update ambiguous labels. Preference labels capture judgments; they are not automatically facts about correctness.

## Test the workflow

Check subgroup coverage, label drift, leakage and distribution shift. Track whether new labels improve the target product behavior rather than only the development score.

See the [active-learning and RLHF references](codex.html#ref-B-1). For deployed agents, use the separate [oversight framework](framework.html).

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
