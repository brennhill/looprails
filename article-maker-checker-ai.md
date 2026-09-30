# Maker–Checker for AI Agents

In maker–checker review, one party proposes an action and another authorizes it. The maker prepares the change. The checker examines the evidence and decides whether it may proceed.

It helps only when the separation is real. Two model calls sharing credentials and assumptions do not create independent authorization.

## Choose the checker for the job

| Need | Strong starting check |
|---|---|
| Validate known constraints | Deterministic assertions and policy rules |
| Check implementation behavior | Tests, state comparison and artifact inspection |
| Review ambiguous quality | A calibrated model judge or qualified reviewer |
| Authorize a critical commitment | An independently authorized decision owner |

A model can assist the checker, but cannot manufacture legal or organizational authority.

## Bind approval to execution

Show the exact target, arguments, effect, evidence and recovery limits. Record the checker’s identity and decision. Make the executor verify that the approved action matches the one about to run.

Changing the amount, recipient, code artifact or scope invalidates approval. Do not let the maker grant itself checker privileges or route around a denial through a different tool.

## Evaluate independence

Try shared blind spots, fabricated evidence, stale approvals and compromised checker inputs. Measure missed hazards and false blocks. Critical decisions need a fallback when the checker is unavailable.

The [separation-of-duties references](codex.html#ref-O-1) ground the authorization pattern. For automated review, [current Claude Code engineering guidance](https://www.anthropic.com/engineering/claude-code-auto-mode) describes a model-based screening layer with fallible judgments.

See [Authorized](rail-authorized.html) and the [approval guide](article-ai-agent-approval.html).
