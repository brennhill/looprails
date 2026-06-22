# LoopRail

**Calibrated oversight for agentic AI. Keep your agents on the rails.**

LoopRail is a research-grounded framework for designing *human-in-the-loop* behavior in agentic LLM
systems (coding agents, copilots, computer-use agents, autonomous assistants). It replaces the
useless binary — *"should there be a human in the loop?"* — with the questions that actually matter,
asked **per action**: which actions need a human, at what level of control, shown to the human how,
and how do we know the oversight actually works?

## The method: Grade · Guard · Show · Prove

- **Grade** every action by **blast radius × reversibility × stakes** (G0–G3).
- **Guard** it by grade — and where a human can't reliably catch the error in time, **prevent, don't review** (sandbox, make reversible, or forbid).
- **Show** the human a well-built oversight moment — clarity, consequences + reversibility, provenance ("how did this get to me?"), and detection affordances — within a respected attention budget.
- **Prove** the oversight works: measure whether humans actually *catch* errors, and red-team the oversight, not just the agent.

Every governed action stays on the **RAIL**: **R**eversible · **A**uthorized · **I**nterruptible · **L**ogged.

## The one rule that matters most

A confirmation prompt does **not** make a human a good error-catcher. Approval gates cut *bad
actions* but barely improve *catching* them. So when stakes are high and the human can't realistically
catch the mistake in time, **prevention beats review** every time.

## The docs

| File | What | For |
|---|---|---|
| [`playbook.md`](./playbook.md) | do-this field guide — cheat sheet, pattern + anti-pattern decks, smell tests, recipes | practitioners |
| [`framework.md`](./framework.md) | the full method and reasoning (§0–§10) | designers / leads |
| [`codex.md`](./codex.md) | 366-source annotated research base across 17 clusters (5 parts) | the evidence |

---

*Research synthesis + framework, assembled 2026-06-22. A few citations in the codex are flagged
`UNVERIFIED` pending a pinpoint check before external reuse.*
