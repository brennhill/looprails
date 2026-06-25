# LoopRails

A small, runnable starter for a guarded AI agent loop. Think of it as the
"build a blog in 15 minutes" demo, but the thing you build is a safe agent
loop instead of a CRUD app.

It runs on Python 3 with the standard library only. No pip installs, no API
key. The shipped maker is a deterministic mock so the demo terminates cleanly
and produces the same trace every run.

## What "rails" means here (the double meaning)

Two senses, both intended:

1. Rails as in Ruby on Rails: scaffolding that gets you from nothing to a
   working loop fast, with sensible structure already in place.
2. Rails as in guardrails: the loop is fenced in by caps, an allowlist, a
   verifier, action grading, a human gate, and a kill switch. The agent runs
   on rails it cannot jump off.

## 5 minutes to a guarded loop

```
cd starter
python3 loop.py
```

That runs interactively. Partway through it hits a consequential action (a
"commit", graded G2) and stops to ask you to approve it. Type `y` to continue.

To run it unattended (CI, demos, or if you just want to watch it go end to
end without typing), set the auto-approve env var:

```
LOOPRAILS_AUTO_APPROVE=1 python3 loop.py
```

In auto-approve mode the loop does not pretend the gate is not there. It logs
that a human WOULD have been required for the G2 action, then proceeds. The
gate is visible either way.

When it finishes it writes three files under `.looprails/`:

- `.looprails/memory.json`  - the loop's durable memory (what it did, where it ended)
- `.looprails/audit.log`    - an append-only record, one JSON line per action
- `.looprails/metrics.json` - the loop-health signals (see "The health summary" below)

## What just happened (the output, against the ten principles)

The trace prints one block per iteration. Here is how each line maps to a
principle the loop is built around.

- **proposed:** the maker (`agent.py`) suggested one action. The maker only
  proposes; it never runs or grades its own work. (P5: maker/checker separation)
- **grade:** `grades.py` scored the action G0-G3 from reversibility, blast
  radius, and stakes (worst axis wins). (P6: action grading)
- **gate:** G0/G1 auto-run and are logged; G2/G3 need a human. (P7: human gate
  at the consequential edges only)
- **verifier:** `verify.py`, a separate function that never calls the maker,
  scored the result against the done-condition. (P2: independent verifier)
- **progress:** how close the result is to the done-condition the loop is
  checking for. (P1: a checkable done-condition)
- **spend now X/Y:** a mock cost counter; the loop refuses to start an action
  it cannot afford. (P3: caps, here the spend cap)

The loop also:

- writes `memory.json` every iteration, not just at the end. (P4: memory in a file)
- appends to `audit.log` for every action: its grade, the gate decision, and
  the verifier result. (P10: append-only audit log)
- refuses any action whose type is not on the task's allowlist, no matter what
  the maker asks for. The allowlist is the whole permission set; everything
  else is off. (P8: guardrails on by default, least privilege)
- stops early if the verifier score stops improving for a few iterations
  instead of burning the full budget. (P3: the circuit breaker)
- stops gracefully if you create `.looprails/STOP` or press Ctrl-C, and logs
  the stop. (P9: kill switch)

The SUMMARY block at the end reports iterations used, spend used, the final
verifier result, and the paths of the memory and audit files.

### The health summary

After SUMMARY the loop prints a LOOP HEALTH block and writes the same data to
`.looprails/metrics.json`. These are the signals the "Loop Health" article and
the Kit health checklist describe: a quick read on whether the run stayed
inside its rails. Each signal:

- **outcome:** `success` if the done-condition was met, else `incomplete`.
- **stop reason:** why the loop ended (done-condition met, no progress, a cap,
  or the kill switch). Same string as SUMMARY.
- **turns used / cap:** iterations run against `MAX_ITERATIONS`.
- **spend used / cap:** mock cost spent against `MAX_SPEND`.
- **score trend:** the verifier score after each turn, in order. The trend made
  visible so you can see whether the loop was still climbing.
- **no-progress streak:** the longest run of consecutive turns where the
  verifier score did not improve. This is the signal the circuit breaker
  watches: when it reaches `NO_PROGRESS_LIMIT` the loop stops instead of burning
  the rest of the budget.
- **grade counts:** how many actions of each grade (G0-G3) the run took.
- **human gate count:** how many actions required (or in auto-approve mode WOULD
  have required) a human checker.

`metrics.json` carries the same fields as plain JSON, one file per run, so you
can diff a run against the last one or feed it to a dashboard. It is covered by
the existing `.looprails/` gitignore entry, same as memory and the audit log.

### The kill switch

While a longer loop is running, in another terminal:

```
touch starter/.looprails/STOP
```

The loop checks for that file at the top of each iteration and stops cleanly,
logging the reason. Ctrl-C does the same. Stopping is cheap: it happens between
steps, never mid-action, so the loop never tears down in a half-finished state.

## How to adapt it to your own task

You change three files; the loop engine (`loop.py`) stays as is.

1. **The task** (`tasks/refactor_task.py`). A task is plain data: a `goal`
   string, a `done_condition`, a `start_state`, and the `allowed_actions` set
   (the allowlist). Copy this file, change the data, and point `loop.py`'s
   import at it.
2. **The verifier** (`verify.py`). Make `verify(task, state)` compute your real
   pass/fail and score. Run your actual test suite, diff against a spec, or
   call a separate scoring model. The one rule: it must not call the maker.
3. **The maker** (`agent.py`). Implement the `Maker` protocol so `propose`
   returns your next action. Keep the action dict shape (`type`, `summary`,
   `meta`) so grading, gating, and auditing keep working.

If you add new action types, give them an entry in `ACTION_AXES` (grades.py)
and `ACTION_COST` (loop.py), and add them to your task's allowlist. An unknown
action type grades G3 (most cautious) and an un-allowlisted type is blocked.

## How to wire a real model

`agent.py` ships `MockMaker`. To use a real model, implement the same `Maker`
protocol with a class whose `propose` calls a model and returns the same action
dict. There is a commented stub at the bottom of `agent.py` showing the shape,
using the official Anthropic Claude Python SDK (`pip install anthropic`,
model id `claude-opus-4-8`). It is commented out on purpose: the demo stays
dependency-free and key-free.

Two things stay true when you wire a real model:

- The verifier remains a separate function. The maker still does not grade
  itself.
- For G2/G3 actions the checker is still a human. A more capable maker does not
  remove the gate; it just makes better proposals to put through it.

## How the guardrails work (reference)

- **Grades (`grades.py`).** Each action type has three axes (reversibility,
  blast radius, stakes), each 0-3. The grade is the worst axis. Metadata can
  push a grade up (e.g. a critical-path or prod-touching edit). `AUTO_RUN_GRADES`
  is the policy knob for which grades skip the human gate.
- **Caps (`loop.py`).** `MAX_ITERATIONS`, `MAX_WALL_SECONDS`, `MAX_SPEND`, and
  `NO_PROGRESS_LIMIT` (the circuit breaker). Spend is a mock cost per action.
- **Kill switch (`loop.py`).** `.looprails/STOP` or Ctrl-C. Checked at the top
  of each iteration so stopping is cheap and logged.
- **Allowlist (`tasks/refactor_task.py`).** `allowed_actions`. The loop blocks
  anything not listed. This is least privilege: the maker can ask for "deploy"
  but the task never grants it.
- **Audit log (`loop.py`).** `.looprails/audit.log`, append-only, one JSON line
  per action plus a final stop record.
- **Health metrics (`loop.py`).** `.looprails/metrics.json`, the loop-health
  signals rolled up at the end of the run (`build_metrics`). The no-progress
  streak in it is what the circuit breaker watches. See "The health summary".

## File map

| file | role |
|---|---|
| `loop.py` | the loop engine and `main()` |
| `grades.py` | action grading G0-G3 and the auto-run policy |
| `verify.py` | the independent verifier |
| `agent.py` | the maker (mock, with a real-model stub) |
| `tasks/refactor_task.py` | the example task definition |
| `.gitignore` | ignores `.looprails/` (runtime memory, audit, and metrics) |
