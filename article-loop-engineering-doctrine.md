# Ten Principles for Agent Loops

Build a loop around evidence of useful work, then limit what can happen when that evidence is wrong. These are LoopRails design recommendations, not universal empirical laws.

1. **State the goal and permitted scope.** Include prohibited effects and a named owner.
2. **Define completion before running.** Choose checks that examine the artifact or state, not only the agent’s claim.
3. **Start with the simplest controller.** Add planning, agents or retries only when measured results justify them.
4. **Use the strongest available evidence.** Prefer executable checks where they fit; calibrate subjective judgments.
5. **Protect the checks.** Keep held-out cases and release policy outside the optimizing agent’s control.
6. **Persist operational state.** Record completed actions, uncertain outcomes and remaining work. Do not depend on chat memory alone.
7. **Bound every run.** Cap time, cost, retries, permissions and cumulative effects across workers.
8. **Grade actual actions.** A tool name does not establish its risk. Read access can disclose secrets; a test command can run code.
9. **Make stopping and recovery real.** Test cancellation, restart and undo at the external-service boundary.
10. **Use failures to improve the next run.** Update cases and controls from production evidence, while preserving independent audits.

## Two loops, two responsibilities

The inner loop tries to meet the current done-condition. The outer loop asks whether that condition still represents the user’s intent and operational requirements. Passing the current verifier is a reason to inspect the result, not proof that every requirement was encoded.

## Research and practice

The [loop research codex](codex-loops.html) connects these principles to durable execution, agent evaluation, tool design and multi-agent coordination. Historical benchmarks illustrate particular systems; they do not rank today’s models.

Use a [Loop Card](kit.html) to make the proposed task, controls and recovery path reviewable. Then evaluate a small version with the [eval-building guide](evals.html).
