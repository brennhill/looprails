# Does Human-in-the-Loop Improve AI Safety?

Human review can improve safety when a reviewer has the evidence, ability, authority and time to catch a consequential error. Adding an approval button does not establish that those conditions exist.

## What current research shows

[Chen et al.’s computer-use study](https://arxiv.org/abs/2604.04918v2), revised September 12, 2026, compared four oversight strategies in 192 live web sessions with 48 participants. Strategies changed exposure to problematic actions, but intervention ability did not improve in that experiment. Timing mismatches and attention to task correctness rather than safety helped explain the gap.

This is evidence about that study’s web tasks and interfaces. It is not a universal detection rate for coding agents, medical decisions or every approval workflow.

## When review helps

A reviewer needs the concrete action: a readable diff, exact recipient, verified amount or state preview. They must be able to reject or edit it before execution. Make policy exceptions and missing evidence visible, and reserve attention for decisions where it can change the outcome.

Test review with realistic seeded mistakes. Measure missed hazards, false alarms, time to intervene and workload. Approval rate alone says little about safety.

## When review needs stronger controls

If the error is hard to detect or execution is too fast to stop, reduce its possible effects. Use scoped permissions, staged execution, sandboxing, spending limits and tested recovery. For critical actions, require the appropriate independent authorization.

Automated action reviewers are another layer. Current [Claude Code auto-mode guidance](https://www.anthropic.com/engineering/claude-code-auto-mode) describes this approach while recognizing false approvals and false blocks. A model reviewer can be wrong, so keep enforcement outside its judgment.

[Grade · Guard · Show · Prove](framework.html) is a design method for combining these controls. It is not a validated universal safety formula.
