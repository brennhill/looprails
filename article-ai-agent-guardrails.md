# Guardrails for AI Agents

Guardrails check an agent’s decisions and limit what its tools can do. These controls work differently: a scoped credential blocks access; a model reviewer judges whether an action looks acceptable. A judgment can be wrong.

## Build the boundary first

Restrict filesystem access, network destinations, credentials and executable capabilities. Apply authorization at the service that performs the action. Keep production access separate from exploration and drafting.

A prompt, command blocklist or browser confirmation can help guide behavior, but it does not provide the same assurance as an execution boundary. A sandbox also needs careful configuration; broad mounts or powerful credentials can defeat its containment.

## Add runtime controls

Set limits on time, spend, retries, affected records and external actions. Count aggregate effects across subagents. Stop when the authorized scope changes or a critical check fails.

Use validation for structured arguments and known policy constraints. Model-based screening can cover ambiguous cases, but measure false negatives and false positives. Fail closed when a required checker is unavailable.

## Put people where they can help

Show the actual action and evidence before consequential execution. Make approvals specific and versioned. If a person cannot detect or stop the mistake, stage the action, reduce its effects or move it to a controlled process.

## Test the controls together

Try prompt injection, expired authority, unavailable reviewers, forged tool success and many small actions that exceed a total budget. Verify that rejected actions cannot reach the executor through another route.

[NIST’s agent-security work](https://www.nist.gov/publications/summary-analysis-responses-request-information-regarding-security-considerations-ai) covers risks beyond malicious prompts, including unsafe behavior by otherwise uncompromised models. The [RAIL guides](framework.html#4-enforce-the-boundaries) turn these concerns into recovery, authorization, stopping and audit requirements.
