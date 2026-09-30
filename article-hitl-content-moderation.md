# Human-in-the-Loop for Content Moderation

Automate routine moderation where the policy is clear and the cost of mistakes is understood. Send ambiguous or high-impact cases to trained reviewers. Give affected users a way to appeal.

## Grade the actions

Use these grades as starting points. Sensitive data or combined effects may raise the risk. [Check the grading rule](framework.html#2-grade-the-action).

| Action | Starting grade | Control |
|---|---|---|
| Classify content internally | G0–G1 | Record policy version and evidence. |
| Temporarily hide a post | G1–G2 | Make restoration quick and visible. |
| Suspend an account | G2 | Review evidence and user history. |
| Make a consequential external referral | G3 | Require specialist authority and a controlled process. |

## Set the boundaries

Calibrate routing thresholds on labeled cases; a model saying it is confident is insufficient. Measure false removals and missed violations separately, including language and subgroup differences. Use temporary containment where it meaningfully reduces harm.

## Make review useful

Show the relevant content and policy clause, with surrounding context. Let reviewers disagree, restore content and escalate. Support reviewer wellbeing and limit repetitive exposure to disturbing material.

## Test the workflow

Test context-dependent language, policy exceptions, appeals and coordinated abuse. Audit overturned decisions and queue delays. Review capacity must match the volume routed to people.

The [research codex](codex.html#ref-F-7) covers automation bias. These are design recommendations, not evidence that a particular moderation system or threshold is safe.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
