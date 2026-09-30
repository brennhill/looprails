# Human-in-the-Loop for Email Agents

Keep drafting separate from sending. Once an email arrives, recall and deletion cannot reliably remove every copy.

## Grade the actions

Use these grades as starting points. Sensitive data or combined effects may raise the risk. [Check the grading rule](framework.html#2-grade-the-action).

| Action | Starting grade | Control |
|---|---|---|
| Draft locally | G0–G1 | Keep the draft editable. |
| Read an authorized mailbox | Depends on sensitivity | Scope folders and account access. |
| Send a routine authorized message | G2 or higher | Preview recipient, body and attachments. |
| Send sensitive or bulk external mail | G3 | Restrict recipients and require explicit authorization. |

## Set the boundaries

Enforce recipient allowlists, attachment checks and send-rate limits at the mail service. A short send delay permits cancellation before delivery; it is not an undo after delivery. Treat incoming mail as untrusted input.

## Make review useful

Show the exact recipients, including CC and BCC, the message and attachments. Confirm authority for commitments or sensitive disclosure. Bind approval to the message version and account.

## Test the workflow

Test lookalike domains, unexpected attachments, prompt injection in quoted mail and repeated sends after timeout. Use idempotency or delivery reconciliation to avoid duplicates.

The [computer-use oversight study](https://arxiv.org/abs/2604.04918v2) concerns intervention during web tasks. It does not establish a universal approval success rate for email. Test your actual sending workflow.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
