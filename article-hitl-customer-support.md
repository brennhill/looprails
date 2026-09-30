# Human-in-the-Loop for Customer Support

A support agent can answer questions autonomously while account changes, refunds and commitments use separate permissions. Design the handoff around what the next person needs to resolve the case.

## Grade the actions

These are starting points. Data sensitivity, reversibility and cumulative impact can raise the grade; the [framework](framework.html#2-grade-the-action) defines the rule.

| Action | Starting grade | Control |
|---|---|---|
| Retrieve authorized help content | G0 | Enforce customer and source access. |
| Draft a reply | G1 | Keep it editable. |
| Change an account or issue a limited refund | G2 or higher | Check identity, policy and cumulative limits. |
| Make an irreversible high-value commitment | G3 | Require an authorized decision owner. |

## Set the boundaries

Authenticate before reading private records or changing state. Enforce refund limits, recipient checks and idempotency in the service that executes the action. Many small refunds must count against one aggregate budget.

## Make review useful

Show verified account facts, the proposed action and policy exceptions. Handoffs need the conversation, completed actions, unresolved question and owner. Do not make the customer repeat everything.

## Test the workflow

Test duplicate refunds, wrong-account access, forged tool success and policy exceptions. Judge the final account state as well as the reply. Monitor repeat contacts and unresolved escalations.

[Agent evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) recommends checking outcomes as well as trajectories. See the [evals guide](evals.html) for a refund case with explicit state checks.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
