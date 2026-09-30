# Human-in-the-Loop for Financial Transactions

Separate a payment proposal from execution. A safe design checks authority, destination and aggregate exposure before funds move; a confirmation click alone supplies none of those checks.

## Grade the actions

These are starting points. Data sensitivity, reversibility and cumulative impact can raise the grade; the [framework](framework.html#2-grade-the-action) defines the rule.

| Action | Starting grade | Control |
|---|---|---|
| Analyze authorized transaction data | Depends on sensitivity | Use read-only access. |
| Prepare a payment draft | G1 | Keep it unsubmitted. |
| Execute a bounded recoverable adjustment | G2 or higher | Verify identity, limits and idempotency. |
| Make an irreversible consequential transfer | G3 | Use independent authorization and destination checks. |

## Set the boundaries

Enforce per-payment and cumulative limits outside the model. Verify payee changes through an independent channel. Separate proposing and approving privileges; two agents sharing credentials and context are not independent authorization.

## Make review useful

Show payee, amount, currency, fees, source account and recovery limits. Explain what changed from prior payments. Pause when evidence is incomplete or the destination differs from the authorized request.

## Test the workflow

Test duplicate execution after a lost response, many small transfers, altered payees and compromised approval links. Reconcile uncertain outcomes before retrying.

The [SEC account of Knight Capital](https://www.sec.gov/newsroom/press-releases/2013-222) documents failed deployment and risk controls. It supports hard exposure limits and tested incident response, not a claim that one missing stop button caused the loss. These controls are engineering guidance; payment obligations depend on jurisdiction and provider.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
