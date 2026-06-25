# The LoopRails Kit

These are the artifacts you fill in before you let a loop run, the same way you would not ship a service without a runbook. They turn a vague "let the agent figure it out" into something a teammate can review, approve, and shut off. They pair with the LoopRails starter project (the working scaffold) and the Doctrine (the principles behind the rails). The fourth artifact, the Model Adaptation Worksheet, covers choosing and adapting the model itself, since that decision is part of building the loop too. The fifth, the Loop Health Signals, covers what to watch once the loop is running.

## 1. The Done-Condition Spec

Write this first, before you build anything. If you cannot state how the loop knows it is finished and how that gets checked independently, the loop is not ready to run. The point is to force a precise, checkable finish line instead of an open-ended "keep going."

How to use it: copy the block, fill every field, and keep it next to the loop's code. If "Done when" and "Verified by" are the same thing, your check is not independent. Fix that before shipping.

```
Loop name:
Goal (one sentence):
Done when (precise, checkable condition):
Verified by (independent check that proves done):
  - test command / metric threshold / second-agent review / human sign-off
Definitely NOT done if (failure signals):
Max iterations:
Max time:
Max spend:
On timeout (pick one): stop and escalate / roll back / hand to human
```

Worked example, a "fix the failing tests" loop:

```
Loop name: fix-failing-tests
Goal (one sentence): Make the existing test suite pass without weakening it.
Done when: `npm test` exits 0 with the same test count as the starting commit.
Verified by:
  - `npm test` run in a clean checkout (not the agent's working dir)
  - diff review confirms no tests were deleted, skipped, or had assertions removed
Definitely NOT done if: test count dropped, tests marked skip/only, or
  assertions replaced with trivial ones (assert true).
Max iterations: 15
Max time: 30 min
Max spend: $5
On timeout: stop and escalate (open a PR with progress so far, tag owner)
```

## 2. The Loop Card

A one-page record of what a loop is and how it is governed, modeled on a model card. The goal is that a reviewer or auditor who has never seen the loop can understand its risk and controls in under a minute.

Grades in one line: a grade combines reversibility, blast radius, and stakes. G0 is trivial and reversible (read a file), G1 is low-stakes and easily undone, G2 is meaningful or annoying to reverse, G3 is irreversible or high-stakes (delete data, deploy to prod, spend money, message a customer).

How to use it: fill one card per loop, store it in the repo next to the loop, and update "Last reviewed" whenever the loop's actions or caps change. The highest-graded action drives the approval rule, so be honest about it.

```
Loop name + owner:
Purpose:
Inputs:
Outputs:
Actions it can take (with grade):
  - <action> .......... G0/G1/G2/G3
  - <action> .......... G0/G1/G2/G3
Highest-graded action + who must approve it:
Verifier (what it checks, and is it independent? yes/no):
Caps: iterations / time / spend
Stop controls: kill switch / circuit breaker
Memory + audit logs live at:
Known failure modes:
Last reviewed (date + by whom):
```

Filled-in example, a "dependency upgrade" loop:

```
Loop name + owner: dep-upgrade / platform-team
Purpose: Bump outdated dependencies and confirm the build still passes.
Inputs: lockfile, list of outdated packages, CI config
Outputs: a branch + PR with version bumps and a passing build
Actions it can take (with grade):
  - read manifest / lockfile ............ G0
  - update versions in a branch ......... G1
  - run build + tests in CI ............. G1
  - open a PR ........................... G2
  - merge to main ...................... G3 (NOT permitted to the loop)
Highest-graded action + who must approve it:
  open PR (G2) auto-runs; merge (G3) requires a human reviewer.
Verifier: clean-checkout CI build + test run; independent: yes (runs in CI,
  not the agent's sandbox).
Caps: 10 iterations / 20 min / $3
Stop controls: kill switch via CI cancel; circuit breaker after 3 builds
  with no new packages resolved.
Memory + audit logs live at: repo /loops/dep-upgrade/runs/ (committed)
Known failure modes: a transitive bump breaks a peer dep; flaky test reads
  as a real failure; major-version jump with breaking API changes.
Last reviewed: 2026-06-22 by platform-team
```

## 3. The Guardrails Checklist

Run this before turning a loop loose unattended. If any box is unchecked, the loop stays supervised.

Before it runs

- [ ] Done-Condition Spec is written and the finish line is checkable
- [ ] Verifier is independent and hard to game (not the same code the loop edits)
- [ ] Allowlist of permitted actions exists; default is deny
- [ ] Credentials and scope are least-privilege for this loop only
- [ ] Loop runs in a sandbox or isolated worktree, not on shared state

Caps and stops

- [ ] Iteration, time, and spend caps are set
- [ ] Circuit breaker trips on no-progress (no new result over N steps)
- [ ] Kill switch exists and has been tested (you have stopped it on purpose)
- [ ] Rollback path exists and has been tested

At the consequential edges

- [ ] Every action the loop can take has a grade (G0-G3)
- [ ] G2 and G3 actions require a human in the loop
- [ ] No irreversible action runs without explicit approval
- [ ] Consequential actions are previewed (dry-run or simulated) before they run, where possible

After it runs

- [ ] Audit log captured for the full run
- [ ] Memory persisted to version control
- [ ] A named person owns reviewing the log
- [ ] Failure modes are documented in the Loop Card

## 4. The Model Adaptation Worksheet

Adapting the model is part of building the loop, not a separate project. Work down this ladder from cheapest and most reversible to most expensive and hardest to undo. Most loops never need to touch the weights at all.

How to use it: start at the top. Only move down a rung when you have an evaluation set that shows the current rung has plateaued. Write down where you stopped and why, so the next person does not redo the climb. The two questions that decide your options are "how good does this need to be" and "can I even change this model's weights."

```
Loop name:
Task the model must do:
Eval set + metric (without this you cannot tell if adaptation helped):

Adaptation ladder (stop at the first rung that clears your metric):
  [ ] 1. Prompt + system prompt + few-shot examples
  [ ] 2. Context engineering / retrieval (RAG), best for changing facts
  [ ] 3. Tools (let the model call code instead of guessing)
  [ ] 4. LoRA / PEFT (cheap, swappable adapters; needs open weights or a provider service)
  [ ] 5. Full fine-tuning (all weights; needs open weights or a managed service; large dataset)
  [ ] 6. Continued / domain pre-training, then pre-training from scratch (almost never)

Can you even change the weights?
  [ ] Closed API model (for example Claude, GPT, Gemini): rungs 1-3, plus a provider
        fine-tune service if one is offered (check the provider).
  [ ] Open-weight model (for example Llama, Mistral, Gemma, Qwen): all rungs,
        subject to the model's license (read it).

Where the adapter / fine-tune artifact lives + its version:
Re-verification after adapting (the verifier and the rails still decide what ships):
```

A tuned model is still a model: it can still be wrong, so adapting it does not remove the need for an independent verifier or for the rails (caps, action grading, a human at consequential steps). For the trade-offs behind rungs 4-6, see the articles "LoRA vs Fine-Tuning vs Pre-Training" and "What You Can and Can't Do With Models You Don't Control."

## 5. The Loop Health Signals

A running loop works unattended, so you need signals that tell you whether it is making progress, stuck, or burning money. Emit these from day one, written next to the audit log so they are queryable. The starter writes them to `.looprails/metrics.json`.

How to use it: emit the metrics below every run, and set the alert thresholds before you let the loop run unattended. The no-progress streak and the spend total are the two that should drive automatic action, not just sit on a dashboard.

Emit every run:

- [ ] turns used / iteration cap
- [ ] spend used / spend cap (and cost per successful outcome, not just per run)
- [ ] verifier score per turn (the trend, so you can see it climb or flatten)
- [ ] no-progress streak (turns since the verifier score last improved)
- [ ] grade mix (how many G0/G1/G2/G3 actions the loop took)
- [ ] human-gate count (approvals required, and how many were rejected)
- [ ] stop reason + outcome (done / no progress / hit a cap / killed; success or incomplete)

Alert or act when:

- [ ] no-progress streak crosses N turns, trip the circuit breaker
- [ ] spend over budget or turns over cap, stop the run
- [ ] success rate falling or reject rate climbing across runs, page a human
- [ ] verifier score flat while turns keep climbing, the loop is spinning, stop it

Healthy looks like: the score climbs then plateaus at done, most runs finish under cap, spend per success holds steady, few human rejects. Sick is the mirror image: score flat while turns climb, more runs hitting caps, spend per success rising, rejects climbing. For the full picture see the article "Loop Health: What to Monitor in a Running Agent Loop."
