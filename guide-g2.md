# G2: Consequential Actions

Any dimension is 2, or at least two dimensions are 1, unless the G3 rule applies first. These are [LoopRails consequence grades](framework.html#2-grade-the-action), not universal risk classifications.

## Examples

A shared branch change, a recoverable infrastructure update, or a consequential account change within defined limits. Grades can change with data sensitivity, target environment, authority and cumulative effects.

## Choose the control

Establish appropriate authority and show concrete evidence before the action executes. A reviewer needs a readable diff or state preview, competence, time and the power to change the decision.

## Watch the boundary

A preview is useful only when it can be evaluated. An unreadable diff or rushed approval may add little detection. Improve the evidence, split the action, stage it or restrict the capability.

## Test it

Bind approval to the exact artifact, target and arguments. Test stale approval, missing evidence and unavailable reviewers. Verify the resulting state and recovery path.

Check the four RAIL questions: what can be reversed or contained, who is authorized, how it stops and what evidence is recorded. For irreversible effects, document the limit rather than promising undo.

Current [computer-use oversight evidence](https://arxiv.org/abs/2604.04918v2) highlights timing and attention problems in human review. It does not determine the correct grade or approval policy for every action.

Use the [playbook](playbook.html) and [Loop Card](kit.html) to capture the design. The [research codex](codex.html) preserves the broader evidence and its caveats.
