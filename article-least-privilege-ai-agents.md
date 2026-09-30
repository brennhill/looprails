# Least Privilege for AI Agents

Give an agent only the access needed for the authorized task, for only as long as needed. Scope both data visibility and actions; a read-only credential can still expose sensitive information.

## Separate access by purpose

Use different roles for research, editing and deployment. Restrict tenants, directories, records, destinations and spending. Keep production credentials out of routine development and debugging.

Broker sensitive actions through a service that checks identity, scope and policy. Where possible, keep raw secrets outside the model context and agent-executed code. Short-lived credentials reduce exposure duration but still need narrow permissions.

## Enforce every consequential call

Check the actual arguments and destination at execution. A prompt telling the agent not to use a powerful credential does not remove its power. Client-supplied roles and model-generated approval claims are not trusted authorization.

Tie delegated access to the originating user and task. A child agent should not gain broader authority merely because it has a new identity. Expire grants on completion, cancellation and scope change.

## Watch the aggregate effect

Several individually allowed operations can exceed a budget or export a dataset. Apply per-action and run-wide limits. Audit who proposed, approved and executed each consequential change.

[NIST’s 2026 agent-identity concept work](https://www.nist.gov/news-events/news/2026/02/new-concept-paper-identity-and-authority-software-agents) treats identification, authorization and audit as connected problems. It is exploratory guidance, not a certification standard.

Test denied access, expired grants, cross-tenant requests and privilege inheritance. See [Authorized](rail-authorized.html) for a concrete checklist.
