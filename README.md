# LoopRails

**Practical oversight for AI agents.** [Live site](https://looprails.dev)

LoopRails helps teams decide which actions need review, what execution controls to enforce and how to test the result. It is a research-informed design framework, not a validated risk calculator or a compliance standard.

## Grade · Guard · Show · Prove

- **Grade** each action by reversibility, reach and stakes, including cumulative effects.
- **Guard** execution with scoped permissions, containment, limits and recovery.
- **Show** reviewers the exact action and evidence, with time and authority to decide.
- **Prove** the workflow with realistic failures, independent checks and production feedback.

**RAIL:** Reversible · Authorized · Interruptible · Logged. Document where reversal or cancellation cannot undo a committed effect.

## Read and build

| File | Purpose |
|---|---|
| [index.html](index.html) | Interactive overview and action grader |
| [playbook.md](playbook.md) | Quick implementation checklist |
| [framework.md](framework.md) | Method, grading rules and limitations |
| [evals.md](evals.md) | Cases, graders, comparisons and release evidence |
| [kit.md](kit.md) | Five project templates |
| [codex.md](codex.md) | Annotated oversight research |
| [codex-loops.md](codex-loops.md) | Recovery, coordination and verification research |
| [starter](starter/) | Small runnable guarded loop |

After Markdown changes, run `node build-docs.js` to regenerate pages, article listings and feeds. The landing page and cheat sheet are maintained directly.

Copy revised October 1, 2026; research checked September 30. Current core claims were checked against primary research and official documentation. The bibliography also preserves historical entries and explicit UNVERIFIED details; it is not a claim that every archived citation was reverified.

© 2026 [Brenn Hill](https://www.linkedin.com/in/brennhill/). All rights reserved; see [LICENSE](LICENSE).
