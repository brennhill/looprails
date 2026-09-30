# Human-in-the-Loop for Browser Agents

A browser agent can read a page, fill a form, or submit a purchase. Those actions need different controls. Review the destination and exact effect before anything leaves the browser.

## Grade the actions

These are starting points. Data sensitivity, reversibility and cumulative impact can raise the grade; the [framework](framework.html#2-grade-the-action) defines the rule.

| Action | Starting grade | Control |
|---|---|---|
| Read public pages | G0 | Run within a scoped browser session. |
| Fill a form without submitting | G1 | Preview fields and preserve the draft. |
| Submit a consequential form | G2–G3 | Confirm destination, data and authority. |
| Buy, publish, or send sensitive data | G3 when irreversible and external | Enforce account, recipient and spending limits. |

## Set the boundaries

Use a dedicated browser profile with only the sessions the task needs. Restrict downloads, uploads and permitted destinations outside the model. Treat page text, hidden instructions and retrieved files as untrusted data. A page cannot authorize a new task.

## Make review useful

Before submission, show the actual domain, recipient, fields, attachments and price. Bind approval to that version of the action; changes require a fresh check. Avoid exposing unrelated logged-in accounts.

## Test the workflow

Plant a malicious page instruction and a changed checkout price. Check that the agent cannot submit without a valid authorization. Test cancellation while a request is in flight.

[Computer-use oversight study, revised September 2026](https://arxiv.org/abs/2604.04918v2) compares live web sessions, not coding-agent review. Its findings support testing the timing and content of review, rather than assuming a prompt is effective.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
