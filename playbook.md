# The LoopRails Playbook

**Grade · Guard · Show · Prove.** Use this checklist for each action and for the combined effects of a run. The [framework](framework.html) defines the method and its limits.

## Grade: what can go wrong?

Rate reversibility, reach and stakes from 0 to 2.

| Grade | Rule | Starting control |
|---|---|---|
| G0 | All dimensions 0 | Autonomy within clear limits; action records |
| G1 | Exactly one dimension 1; none 2 | Records and tested recovery |
| G2 | Any dimension 2, or at least two dimensions 1 | Stronger evidence and appropriate authorization |
| G3 | Reversibility 2 and either reach or stakes 2 | Prevention and explicit authority; restrict or transfer when needed |

Apply G3 first. These grades are LoopRails heuristics, not validated risk scores. A read can disclose secrets; a test can execute code. Grade actual effects.

## Guard: enforce the scope

Keep each consequential action on **RAIL**:

- **Reversible:** tested undo or containment, with irreversible effects documented.
- **Authorized:** scoped identity and permissions, checked at execution.
- **Interruptible:** a tested stop that reaches workers and queues.
- **Logged:** records that protect sensitive data of proposals, decisions and outcomes.

Set time, spending, retry and limits on combined effects. Keep production access separate from exploration. A worktree separates edits; use an execution boundary for isolation.

If a person cannot detect or stop a mistake in time, stage it, reduce its effects, restrict the capability or transfer it to a controlled process. Approval alone cannot fill that gap.

## Show: give reviewers what they need

Show the exact action, target, evidence, expected effect, missing information and recovery limits. Provide approve, edit, reject and escalate choices.

The reviewer needs evidence, time, relevant expertise and the power to change the decision. Bind approval to the action version; meaningful changes require a new check. Respect the number of reviews the team can handle.

## Prove: test the whole workflow

Introduce realistic errors and inspect what actually happened. Track missed hazards, false blocks, errors caught, reviewer effort and stop latency. Test cancellation, failed dependencies, unavailable reviewers and resume after a crash.

A [2026 computer-use study](https://arxiv.org/abs/2604.04918v2) highlights timing and attention problems in review. It supports testing your own interface, not assuming a universal intervention rate.

## Common failures

| Failure | Repair |
|---|---|
| Approval without useful evidence | Show the actual effect and source checks |
| Many low-value prompts | Route routine work within explicit bounds |
| Agent can bypass a blocklist | Enforce permissions at the executor |
| Undo covers only local edits | Test external effects and document limits |
| Second agent agrees with the first | Require independent evidence |
| Dashboard reports overspend afterward | Enforce caps before the next action |
| Stop leaves child work running | Propagate cancellation and check which actions completed |

## Three starting recipes

**Coding:** restricted workspace, protected tests, readable diff and separate release authority.

**Support:** authenticated access, service-side limits, idempotent changes and a handoff that includes the case history and next decision.

**Browser:** scoped sessions, destination restrictions and a preview before submission.

Capture the design in the [Kit](kit.html), build evaluation cases with the [evals guide](evals.html), and inspect the [research codex](codex.html) when a claim needs closer review.
