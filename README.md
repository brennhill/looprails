# LoopRails

**Right-sized human oversight for AI agents. Keep your agents on the rails.**

**Live site → https://looprails.dev** · © 2026 [Brenn Hill](https://www.linkedin.com/in/brennhill/)

LoopRails is a practical, research-grounded framework for deciding how much human oversight each
action of an AI agent needs — and for designing that oversight so it actually works. It applies to
agentic LLM systems: coding agents, copilots, computer-use agents, and autonomous assistants.

Instead of the unhelpful yes/no question — *"should there be a human in the loop?"* — it asks the
questions that actually matter, **one action at a time**: which actions need a human, how much control
that human should have, what to show them so they can judge well, and how you confirm the oversight
really catches mistakes.

## The method: Grade · Guard · Show · Prove

- **Grade** every action by how far harm could spread (its blast radius), whether it can be undone, and how bad it is if wrong. This gives a grade from G0 (trivial) to G3 (critical).
- **Guard** it according to its grade — and where a person can't reliably catch the mistake in time, **prevent the bad outcome instead of asking for review** (run it in a sandbox, make it reversible, or block it).
- **Show** the person a well-built oversight moment: make the action and its consequences clear, show where the request came from ("how did this get to me?"), help them spot problems — and don't spend more of their attention than the action is worth.
- **Prove** the oversight works: measure whether people actually *catch* errors, and attack your own oversight the way you'd attack the agent — not just the agent alone.

Every governed action stays on the **RAIL**: **R**eversible · **A**uthorized · **I**nterruptible · **L**ogged.

## The one rule that matters most

Asking a person to click *Approve* does **not** turn them into a reliable error-catcher. Approval
prompts stop some *bad actions*, but they barely improve a human's odds of *noticing* a bad one. So
when the stakes are high and a person can't realistically catch the mistake in time, **prevention
beats review** every time.

## The docs

| File | What | For |
|---|---|---|
| [`index.html`](./index.html) | the **website** — landing page (failure gallery, the interactive consequence-vs-controllability grid, and an action grader) plus the in-site docs reader (`docs.html`) | everyone |
| [`playbook.md`](./playbook.md) | the hands-on field guide — cheat sheet, pattern and anti-pattern decks, questions to ask in standup, recipes | practitioners |
| [`framework.md`](./framework.md) | the full method and reasoning (§0–§10) | designers / leads |
| [`codex.md`](./codex.md) | 366-source annotated research base across 17 clusters (5 parts) | the evidence |

---

*Research synthesis + framework, assembled 2026-06-22. A few citations in the codex are flagged
`UNVERIFIED` pending a pinpoint check before external reuse.*
