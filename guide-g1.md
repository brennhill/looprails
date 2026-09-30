# G1: Low-Consequence Actions

Exactly one dimension is 1, with none at 2. Recovery may require some effort, or reach or stakes may be meaningful, but the combined effect remains limited. These are [LoopRails consequence grades](framework.html#2-grade-the-action), not universal risk classifications.

## Examples

Editing a tracked local file with tested restoration, or changing a recoverable local artifact within a small scope. Grades can change with data sensitivity, target environment, authority and cumulative effects.

## Choose the control

Allow actions covered by the task’s authority, record the result and offer clear recovery. Batch routine notifications where immediate attention adds little value.

## Watch the boundary

Undo must cover the actual effect. Git cannot reverse a sent message or a database write. Installing dependencies and running tests execute code, so their grade depends on the environment.

## Test it

Use scoped permissions and a recovery checkpoint. Test restoration after partial failure and check whether many small actions create a larger consequence.

Check the four RAIL questions: what can be reversed or contained, who is authorized, how it stops and what evidence is recorded. For irreversible effects, document the limit rather than promising undo.

Current [computer-use oversight evidence](https://arxiv.org/abs/2604.04918v2) highlights timing and attention problems in human review. It does not determine the correct grade or approval policy for every action.

Use the [playbook](playbook.html) and [Loop Card](kit.html) to capture the design. The [research codex](codex.html) preserves the broader evidence and its caveats.
