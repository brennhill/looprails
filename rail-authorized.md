# A: Authorized

An action is authorized when the authenticated principal has permission to perform that exact operation within the task’s scope. A model claiming “the user approved” is not proof of authorization.

## Enforce at the service

Check identity, tenant, role, target, arguments and permitted scope before execution. Use narrow credentials and short-lived delegated grants. Keep sensitive secrets outside model-visible text and code where possible.

An approval decision and a technical permission are related but distinct. A person may approve a proposal while lacking organizational authority to permit it. The executor must enforce both where required.

## Make delegation traceable

Tie each agent and child worker to the originating user, task and permission grant. A child must not gain wider privileges merely through inheritance or a new identity. Expire access on cancellation, completion and material scope change.

[NIST’s 2026 identity-and-authority concept work](https://www.nist.gov/news-events/news/2026/02/new-concept-paper-identity-and-authority-software-agents) connects agent identification, authorization and audit. It is exploratory work, not a universal certification requirement.

## Separate critical decisions

Use maker–checker when independent authorization is needed. The proposer must not grant itself checker privileges. A second model can assist review, but shared credentials or blind spots undermine independence.

Bind approval to a specific action and version. A changed recipient, amount or artifact invalidates the decision. Enforce aggregate limits across agents, not only per-call limits.

## Test denial paths

Try expired grants, cross-tenant access, stale approvals, missing reviewers and alternative routes around a denial. Check that untrusted documents cannot expand authority and that denied calls never reach an effectful executor.

See [least privilege](article-least-privilege-ai-agents.html), [maker–checker](article-maker-checker-ai.html) and the [guardrails checklist](kit.html).
