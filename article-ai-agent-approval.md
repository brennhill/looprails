# When Should an AI Agent Ask for Approval?

Ask for approval when an action needs permission or a reviewer can catch a costly mistake. Existing permission can cover routine work within clear limits. Ask again when those limits change.

## Decide what the approval is doing

An approval can establish permission, catch an error, satisfy a separation-of-duties rule or clarify intent. These are different jobs. A person can authorize an action without being able to verify that it is technically correct.

For low-consequence work, use autonomy within clear limits and action records. For recoverable changes, provide a tested undo. For consequential actions, stage execution and show evidence. If nobody can evaluate the risk in time, restrict or contain the capability.

## Show what will happen

Include:

- The exact action, target environment and affected people or records.
- The diff, amount, recipient or preview needed to check it.
- Source evidence, policy exceptions and missing information.
- Recovery limits and the decision deadline.
- Clear approve, edit, reject and escalate choices.

Bind approval to the action’s identity and content. If arguments, recipients or effects change, invalidate the old approval. Enforce the decision at the service that executes the action.

## Plans need runtime checks

Approving a plan does not authorize every action an agent later invents. Check scope at execution and pause on material drift. Aggregate many small effects against a run-wide limit.

The [September 2026 revision of the computer-use oversight study](https://arxiv.org/abs/2604.04918v2) highlights timing and attention problems, including limits of upfront plan approval. Test your own workflow rather than adopting a reported rate as a universal constant.

Record the approval boundary in a [Loop Card](kit.html) and use the [G2 guide](guide-g2.html) to design the review.
