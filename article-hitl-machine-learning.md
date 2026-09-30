# Human-in-the-Loop for Machine Learning

Human-in-the-loop machine learning includes labeling, active learning and preference feedback. Those training workflows differ from approving a deployed agent action.

## Grade the actions

These are starting points. Data sensitivity, reversibility and cumulative impact can raise the grade; the [framework](framework.html#2-grade-the-action) defines the rule.

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
