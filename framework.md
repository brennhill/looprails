# LoopRails: Oversight for AI Agents

**Grade · Guard · Show · Prove.** Rate each action, enforce appropriate limits, give reviewers useful evidence and test the complete workflow.

LoopRails is a research-informed design framework. Its grades and autonomy ladder are local conventions, not a validated risk calculator or a compliance standard. Use the [playbook](playbook.html) for a quick checklist and the [codex](codex.html) for evidence and limitations.

## 0. Start with the decision

Ask what can go wrong, who has authority and whether anyone can detect and change the outcome in time. An approval can establish permission without proving correctness. Specify both jobs when both matter.

Human review needs four conditions:

| Condition | Required evidence |
|---|---|
| Authority | The reviewer can reject, edit, stop or redirect the action |
| Awareness | The action, source evidence and consequences are understandable |
| Ability | The reviewer has competence and time to evaluate |
| Accountability | Responsibility matches actual authority and is traceable |

The [September 2026 revision of Chen et al.](https://arxiv.org/abs/2604.04918v2) studied 48 participants across 192 live web sessions. It highlights timing and attention problems in computer-use oversight. It does not establish that every human approval is ineffective or supply a universal coding-agent detection rate.

## 1. Consequence and controllability

**Consequence** is the possible harm: how reversible the action is, how far its effects reach and what is at stake. **Controllability** is the ability to detect and correct an error before harm occurs.

| | Low controllability | High controllability |
|---|---|---|
| Low consequence | Allow bounded autonomy with suitable records | Use a light touch and easy recovery |
| High consequence | Contain, stage, restrict or transfer the action | Invest in evidence, review and prevention |

If review cannot catch the error, improve evidence, buy time, reduce the effects or remove the capability. A confirmation prompt alone does not solve the underlying problem.

## 2. Grade the action

Score each dimension from 0 to 2 using the actual target and effect.

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Reversibility | No lasting change or easy tested undo | Recovery requires effort | No reliable recovery after commitment |
| Reach | Contained local effect | Shared team or system state | External parties or public effects |
| Stakes | Trivial | Meaningful time, money or trust | Severe safety, legal, security or financial harm |

Apply the rules in this order:

1. **G3:** reversibility is 2 and either reach or stakes is 2.
2. **G2:** any dimension is 2, or at least two dimensions are 1.
3. **G1:** exactly one dimension is 1, with none at 2.
4. **G0:** all dimensions are 0.

This is a heuristic, not multiplication or a probability estimate. Round up when evidence is missing, and assess cumulative effects across the run.

A file read can expose a secret. A SELECT can consume production resources or invoke functions. Installing a dependency or running tests can execute code. An ordinary code deployment may be recoverable; a destructive migration may not be. Grade the effect rather than assigning permanent grades to command names.

## 3. Choose the control

| Level | Mode |
|---|---|
| L0 | Run without surfacing a negligible action |
| L1 | Run with an appropriate audit record |
| L2 | Run, notify and offer tested recovery |
| L3 | Confirm one action before execution |
| L4 | Approve a plan with runtime scope checks and checkpoints |
| L5 | Co-execute consequential decisions; consider an independent initial judgment |
| L6 | Transfer the decision or forbid the capability |

G0 usually needs little interruption; G1 often permits records and recovery. G2 calls for stronger evidence and authority. G3 requires prevention and explicit authority; use L6 when the proposed execution cannot be governed adequately.

These are starting points. Existing authorization may cover bounded routine work. Novel scope, missing evidence, cumulative effects or a changed destination can require escalation. Model-reported confidence is insufficient unless calibrated.

Automated action review is a separate layer from this human-involvement ladder. Evaluate missed hazards and false blocks, and keep execution boundaries independent of the reviewer’s judgment.

## 4. Enforce the boundaries

Every consequential action needs a plan for **RAIL**:

- **Reversible:** provide tested undo or containment; document effects that cannot be reversed.
- **Authorized:** check identity, delegated scope and actual arguments at execution.
- **Interruptible:** block new steps, stop supported in-flight work and reconcile committed effects.
- **Logged:** preserve privacy-safe records of decisions, evidence and outcomes.

Use scoped credentials, restricted files and destinations, disposable environments and aggregate caps. A sandbox needs a threat model and careful configuration. A worktree or command blocklist does not provide equivalent isolation.

Stage consequential actions before commitment. Keep independent authorization where required, and ensure the maker cannot grant itself checker privileges. Model-based guardrails can complement these controls, but they can be wrong.

## 5. Show a useful review

Show the goal, exact action, target, source evidence, expected consequences and recovery limits. Highlight changes from the approved plan, missing information and policy exceptions.

Offer approve, edit, reject and escalate. Bind the decision to the exact action version; changed arguments invalidate it. Do not ask a reviewer to verify an unreadable artifact within an unrealistic deadline.

For handoffs, include completed actions, current state, the unresolved decision and remaining time. If nobody can respond safely, pause or contain the action.

## 6. Defend against failure

Test automation bias, excessive prompts, persuasive but unsupported explanations, malicious retrieved content, stale approvals, duplicate effects and correlated checker errors.

Keep sensitive data away from unnecessary tools. Private data, untrusted content and an outbound channel create an exfiltration path; inspect permitted outputs as well as open internet access. Redact secrets before logging or feeding tool output to a model.

## 7. Prove the workflow

Measure errors caught, missed hazards, false blocks, reviewer effort, stop latency and final state. Seed realistic mistakes and test unavailable reviewers, interrupted execution and restart.

Use representative cases, repeated trials where reliability matters and independent held-out audits. Record the dataset, model, tools, environment and grader versions. A passing suite establishes tested behavior, not universal safety.

## 8. Apply it

1. List actions and their cumulative effects.
2. Grade them in the actual environment.
3. Define authority, boundaries and recovery limits.
4. Choose checks and human decisions.
5. Test failure, cancellation and resume.
6. Monitor production and turn confirmed failures into cases.

Store the result in a [Loop Card](kit.html). The inner loop meets the current contract; the outer loop uses user and production evidence to improve that contract. See [the two loops](article-two-loops.html).

## 9. Worked examples

**Coding:** explore and edit in a restricted workspace; review trusted tests and the actual diff before shared integration. Production credentials stay separate.

**Browser:** fill a form without submitting; verify destination and fields before commitment. Page text cannot authorize a new task.

**Support:** answer authorized questions routinely; enforce identity, refund limits and idempotency at the account service. Handoff includes completed changes.

## 10. Limits

Human-factors results, benchmark papers and vendor engineering reports have different evidential strength. Findings from one domain do not supply universal rates for another. Regulatory duties depend on jurisdiction and intended use.

Use the [research codex](codex.html) to inspect sources, including entries marked UNVERIFIED. For security-specific threat modeling, see the [BRACE Framework](https://braceframework.org).
