# AI Agent Autonomy Levels

Autonomy is permission to act within a scope. Set it per action, then revise it when the task, evidence or consequences change.

The following ladder is a **LoopRails design vocabulary**, not an industry standard or a validated measurement scale.

| Level | Mode | What happens |
|---|---|---|
| L0 | Silent | Runs without surfacing the action; reserve for negligible effects |
| L1 | Logged | Runs with an appropriate audit record |
| L2 | Notify after | Runs, reports the change and offers tested recovery |
| L3 | Confirm before | Pauses for a decision on one action |
| L4 | Approve a plan | Pauses before a sequence, with execution checkpoints |
| L5 | Co-execute | Human decides key steps, sometimes before seeing the suggestion |
| L6 | Escalate or forbid | Transfers the decision or blocks the capability |

## Choose a starting point

G0 actions usually need little interruption. G1 actions can often run with records and recovery. G2 actions need stronger evidence and authorization. G3 actions require prevention and explicit authority; review alone may be inadequate.

Those grades depend on reversibility, reach and stakes. Reading a private credential is consequential even though it changes no file. Running tests or installing a dependency can execute arbitrary code. Grade the real effect, not the tool name.

## Adjust during the run

Increase control when scope changes, cumulative effects grow, evidence is missing or the task leaves its tested domain. Model-reported confidence is a weak signal unless calibrated. Make it easy to return to manual control.

Automated action review does not fit neatly into a human-involvement ladder: it is a separate control layer. Evaluate it alongside permissions, monitoring and recovery.

See the [framework](framework.html) for the exact grading rule and the [approval guide](article-ai-agent-approval.html) for execution checks.
