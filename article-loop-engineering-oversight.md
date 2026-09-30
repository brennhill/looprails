# Oversight for Agent Loops

A loop needs two kinds of checks: whether it completed useful work and whether its actions stayed within authority and risk limits. A good output does not justify an unauthorized route to producing it.

## Grade actions in context

Use reversibility, reach and stakes to rate each capability. Local drafting may be low consequence; reading a credential, exporting data or running untrusted code can be consequential even without a file change.

Count cumulative effects. A series of small refunds or uploads can exceed the acceptable total. Apply the same run-wide limits to child agents.

## Guard execution

Enforce filesystem, network, credential and spending restrictions outside the model. Keep critical actions behind a separate, authorized process. Stage consequential changes so evidence can be inspected before commitment.

A prompt telling the agent to stop is not the stop mechanism. Check cancellation at the executor, propagate it to workers and reconcile effects already accepted by external services.

## Design the human decision

Show the actual action, target, evidence and recovery limits. Make approvals specific and invalidate them when the action changes. Route to a reviewer who has competence, time and authority.

Model reviewers can help screen actions, but they remain fallible. Evaluate false blocks and missed hazards alongside the other controls.

## Prove the workflow

Seed scope violations, malicious tool output, forged success, budget overruns and unavailable reviewers. Check what actually executed and whether the stop arrived before further effects.

The [September 2026 computer-use oversight revision](https://arxiv.org/abs/2604.04918v2) emphasizes timing, authority and attention. Use that finding to test your interfaces rather than assume that more prompts mean more control.

See the [framework](framework.html) and [Loop Card](kit.html).
