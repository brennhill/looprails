# What Is Human-in-the-Loop in AI?

Human-in-the-loop (HITL) means a person helps make or review an AI system’s decisions. For an agent, that could mean approving a payment, editing a code change or taking over a support case.

The useful question is: **what can this person detect and change before harm occurs?** A review step needs evidence, time and real authority.

## Three different jobs

| Job | Example | What to measure |
|---|---|---|
| Improve training data | Label examples or compare responses | Label quality and downstream performance |
| Review a proposed action | Check a recipient before sending | Errors caught before execution |
| Supervise a running system | Pause a rollout after an alert | Detection and intervention time |

These jobs need different interfaces and tests. A training-data annotator is not an operational approver.

## Choose oversight per action

Let bounded, low-consequence work run with action records. For recoverable actions, provide a tested undo. For consequential actions, show the actual effect and require the appropriate authorization. When a reviewer cannot detect or stop an error, add containment, stage execution or restrict the capability.

A file read is not automatically harmless: reading secrets into a model context can expose them. Sending a message is not automatically critical: consequences depend on its recipient, content and recovery limits. Grade the actual action in context.

## What the evidence says

A [computer-use study revised in September 2026](https://arxiv.org/abs/2604.04918v2) compared four oversight approaches with 48 participants. Strategy changed exposure to problematic actions without improving intervention ability in that experiment. It points to authority, timing and attention as design variables; it does not show that all human review is ineffective.

Use [Grade · Guard · Show · Prove](framework.html): rate the consequences, enforce boundaries, design the review and test whether it catches errors. Start with the [playbook](playbook.html).
