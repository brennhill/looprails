# Human-in-the-Loop for Voice Agents

A voice agent needs controls that work under real-time pressure. Recognition errors, interruptions and identity uncertainty can make a spoken confirmation ambiguous.

## Grade the actions

These are starting points. Data sensitivity, reversibility and cumulative impact can raise the grade; the [framework](framework.html#2-grade-the-action) defines the rule.

| Action | Starting grade | Control |
|---|---|---|
| Answer a public factual question | G0–G1 | Use appropriate source checks. |
| Draft or propose an appointment | G1 | Read back key details. |
| Change an account or place an order | G2 or higher | Verify identity and exact terms. |
| Authorize a consequential payment or clinical action | G3 | Move to a controlled, authenticated workflow. |

## Set the boundaries

Separate conversation from tool execution. Enforce permissions, rate limits and destination checks at the service. Do not treat a voice match or a recorded “yes” as sufficient authentication for sensitive actions.

## Make review useful

Read back names, dates, amounts and recipients. Ask a specific confirmation question and allow correction. Make barge-in stop new actions through the orchestrator, rather than relying only on the model understanding “stop.”

## Test the workflow

Test noise, accents, overlapping speakers, interrupted readbacks and a cancellation after submission. Track wrong-action rates and handoff delay, with privacy-conscious recording and retention.

The [interruptibility research](codex.html#ref-A-19) tests web agents, not voice systems. Its lesson is to verify stop and replanning behavior in the actual environment rather than transferring a benchmark rate to voice.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
