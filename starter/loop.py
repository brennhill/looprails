"""LoopRails: a small guarded agent loop.

Run it:

    LOOPRAILS_AUTO_APPROVE=1 python3 loop.py     # unattended (CI / demo)
    python3 loop.py                              # interactive (prompts at G2/G3)

What it does, in order, every iteration:
  1. ask the maker for one proposed action            (agent.propose)
  2. check the action is on the allowlist              (least privilege)
  3. grade the action G0-G3                            (grades.grade_action)
  4. if G2/G3, get a human checker's approval          (the consequential edge)
  5. run the action (here: apply its mock effect)
  6. verify the new state against the done-condition   (verify.verify)
  7. write memory + append an audit record             (durable state)
  8. stop on: done / kill switch / iteration cap / spend cap / no progress

The ten principles this embodies are called out in comments as P1..P10.
Stdlib only; no third-party packages; no API key needed for the mock run.
"""

import json
import os
import signal
import sys
import time

# Make sibling modules importable whether you run from inside starter/ or not.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from grades import grade_action, requires_approval
from verify import verify
from agent import make_maker
from tasks.refactor_task import load_task


# --- Caps (P3). Small numbers so the demo is quick and obvious. -------------
MAX_ITERATIONS = 8          # hard ceiling on loops
MAX_WALL_SECONDS = 30.0     # hard ceiling on wall-clock time
MAX_SPEND = 100             # mock "cost" units; each action costs some
NO_PROGRESS_LIMIT = 3       # circuit breaker: stop after N non-improving loops

# Mock cost per action type (P3: spend cap needs something to count).
ACTION_COST = {
    "noop": 1,
    "read_file": 1,
    "run_tests": 2,
    "propose_edit": 5,
    "commit": 8,
    "deploy": 20,
}

# --- Runtime files (P4 memory, P10 audit log). ------------------------------
RUNTIME_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".looprails")
MEMORY_PATH = os.path.join(RUNTIME_DIR, "memory.json")
AUDIT_PATH = os.path.join(RUNTIME_DIR, "audit.log")
METRICS_PATH = os.path.join(RUNTIME_DIR, "metrics.json")   # loop-health signals
STOP_PATH = os.path.join(RUNTIME_DIR, "STOP")   # P9: presence of this file = kill


# Set by the SIGINT handler so Ctrl-C stops the loop cheaply between steps
# rather than tearing the process down mid-action (P9: make stopping graceful).
_interrupted = {"flag": False}


def _on_sigint(signum, frame):
    _interrupted["flag"] = True


def ensure_runtime_dir():
    if not os.path.isdir(RUNTIME_DIR):
        os.makedirs(RUNTIME_DIR)


def write_memory(memory):
    """Persist memory to a file (P4: memory lives on disk, not just in RAM).

    Writing every iteration means a crashed or killed run leaves a readable
    record of where it got to, and a future run could resume from it.
    """
    with open(MEMORY_PATH, "w") as f:
        json.dump(memory, f, indent=2)
        f.write("\n")


def append_audit(record):
    """Append one JSON line to the audit log (P10: append-only audit trail).

    Append-only and one-record-per-line: easy to tail, grep, and diff, and a
    later record never rewrites an earlier one. Every action's grade, gate
    decision, and verifier result lands here.
    """
    record = dict(record)
    record["ts"] = time.time()
    with open(AUDIT_PATH, "a") as f:
        f.write(json.dumps(record) + "\n")


def write_metrics(metrics):
    """Persist the loop-health signals to a file (pretty-printed JSON).

    These are the signals the monitoring article and the Kit health checklist
    describe, and the same signals that feed the circuit breaker (no-progress
    streak) and the caps (turns and spend). One file you can diff run to run.
    """
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
        f.write("\n")


def kill_switch_tripped():
    """P9: stop if the STOP file exists or Ctrl-C was pressed."""
    return _interrupted["flag"] or os.path.exists(STOP_PATH)


def human_gate(action, grade, auto_approve):
    """The checker for consequential actions (P5 checker half, P7 the gate).

    For G2/G3 we need a human to approve before the action runs. In auto-approve
    mode (LOOPRAILS_AUTO_APPROVE=1) we do NOT silently skip the gate: we log
    that a human WOULD have been required and proceed, so CI runs still show the
    gate exists. Interactively we actually block on input().

    Returns (approved: bool, decision: str).
    """
    if not requires_approval(grade):
        return True, "auto-run"

    if auto_approve:
        # The honest non-interactive path: surface that a human was needed.
        print("    [GATE] {} is consequential -> a human WOULD be required "
              "(auto-approving for unattended run)".format(grade))
        return True, "auto-approved (human would be required)"

    # Interactive: actually ask. This is the maker/checker wall made concrete:
    # the human is the checker for consequential actions.
    print("    [GATE] {} is consequential and needs your approval.".format(grade))
    print("           action: {}".format(action.get("summary", action.get("type"))))
    answer = input("           approve? [y/N] ").strip().lower()
    if answer in ("y", "yes"):
        return True, "approved by human"
    return False, "rejected by human"


def apply_action(action, state):
    """Run the action. In the mock world this just updates the coverage number.

    A real executor would make the edit, run the command, call the API, etc.
    The loop does not care how the effect happens, only that it happens here,
    after the gate, and that verify() then scores the result.
    """
    if action["type"] == "propose_edit":
        state["coverage"] = min(100.0, state.get("coverage", 0.0) + action.get("gain", 0.0))
    # commit / run_tests / read_file / noop have no effect on coverage in the
    # mock; they still cost spend and still get graded, gated, and audited.
    return state


def cost_of(action):
    return ACTION_COST.get(action["type"], 10)


def build_metrics(memory, stop_reason):
    """Roll the per-iteration history up into the loop-health signals.

    Everything here is derived from what the loop already tracked, so the loop
    body stays unchanged. These are the signals the monitoring article and the
    Kit health checklist describe: the caps (turns, spend), the trend the
    circuit breaker watches (score_trend, no_progress_streak), the grade mix,
    and how often the human gate was hit.
    """
    history = memory["history"]
    final = memory["final"]

    # The verifier score after each turn, in order: the trend made visible.
    score_trend = [h["score"] for h in history]

    # Longest run of consecutive turns where the score did not improve. This is
    # the exact thing the circuit breaker watches (NO_PROGRESS_LIMIT).
    best = -1.0
    streak = 0
    no_progress_streak = 0
    for score in score_trend:
        if score > best:
            best = score
            streak = 0
        else:
            streak += 1
            if streak > no_progress_streak:
                no_progress_streak = streak

    # How many actions of each grade we took.
    grade_counts = {"G0": 0, "G1": 0, "G2": 0, "G3": 0}
    for h in history:
        if h["grade"] in grade_counts:
            grade_counts[h["grade"]] += 1

    # How many actions required (or in auto-approve mode WOULD have required) a
    # human. Derived from the grade so the count is honest in either mode.
    human_gate_count = sum(1 for h in history if requires_approval(h["grade"]))

    return {
        "task": memory["task"],
        "outcome": "success" if final["passed"] else "incomplete",
        "stop_reason": stop_reason,
        "turns_used": memory["iterations"],
        "turns_cap": MAX_ITERATIONS,
        "spend_used": memory["spend"],
        "spend_cap": MAX_SPEND,
        "score_trend": score_trend,
        "no_progress_streak": no_progress_streak,
        "no_progress_limit": NO_PROGRESS_LIMIT,
        "grade_counts": grade_counts,
        "human_gate_count": human_gate_count,
    }


def run(task, maker, auto_approve):
    """The loop. Returns a summary dict."""
    ensure_runtime_dir()

    state = task["start_state"]
    allowed = task["allowed_actions"]

    # Memory we keep on disk every iteration (P4).
    memory = {
        "task": task["name"],
        "goal": task["goal"],
        "iterations": 0,
        "spend": 0,
        "history": [],          # one entry per iteration
        "final": None,
    }

    spend = 0
    best_score = -1.0
    stale = 0                   # consecutive non-improving iterations (P3 breaker)
    started = time.monotonic()
    stop_reason = None
    final_verify = None

    print("LoopRails starting.")
    print("  goal: {}".format(task["goal"]))
    print("  caps: max_iters={}  max_seconds={:.0f}  max_spend={}  no_progress_limit={}"
          .format(MAX_ITERATIONS, MAX_WALL_SECONDS, MAX_SPEND, NO_PROGRESS_LIMIT))
    print("  guardrails: allowlist={}".format(sorted(allowed)))
    print("")

    for i in range(1, MAX_ITERATIONS + 1):
        # --- stop checks BEFORE doing work, so stopping is cheap (P9). -------
        if kill_switch_tripped():
            stop_reason = "kill switch (STOP file or Ctrl-C)"
            break
        if time.monotonic() - started > MAX_WALL_SECONDS:
            stop_reason = "wall-clock cap reached"
            break

        print("iteration {}/{}".format(i, MAX_ITERATIONS))

        # 1. maker proposes (P5 maker half).
        action = maker.propose(task, state)
        summary = action.get("summary", action["type"])
        print("  proposed: {} ({})".format(action["type"], summary))

        # 2. allowlist check (P8 least privilege, everything off by default).
        if action["type"] not in allowed:
            print("  [BLOCKED] action type '{}' is not on the allowlist".format(action["type"]))
            append_audit({"iter": i, "action": action["type"], "summary": summary,
                          "grade": None, "decision": "blocked: not allowlisted",
                          "verifier": None})
            stop_reason = "proposed a disallowed action"
            break

        # 3. grade (P6 G0-G3).
        grade = grade_action(action)
        print("  grade: {}".format(grade))

        # 4. spend cap check: don't start an action we can't afford (P3).
        cost = cost_of(action)
        if spend + cost > MAX_SPEND:
            stop_reason = "spend cap would be exceeded (have {}, need {}, cap {})".format(
                spend, cost, MAX_SPEND)
            print("  [STOP] {}".format(stop_reason))
            break

        # 5. human gate for consequential actions (P7).
        approved, decision = human_gate(action, grade, auto_approve)
        print("  gate: {}".format(decision))
        if not approved:
            append_audit({"iter": i, "action": action["type"], "summary": summary,
                          "grade": grade, "decision": decision, "verifier": None})
            stop_reason = "human rejected a consequential action"
            break

        # 6. run it, then pay the cost.
        state = apply_action(action, state)
        spend += cost

        # 7. verify the result against the done-condition (P2 independent check).
        result = verify(task, state)
        final_verify = result
        print("  verifier: {} (score {:.0f})  spend now {}/{}".format(
            "PASS" if result["passed"] else "fail", result["score"], spend, MAX_SPEND))
        print("  progress: {}".format(result["reason"]))

        # 8. memory + audit, every iteration (P4, P10).
        memory["iterations"] = i
        memory["spend"] = spend
        memory["history"].append({
            "iter": i, "action": action["type"], "summary": summary,
            "grade": grade, "decision": decision,
            "score": result["score"], "passed": result["passed"],
        })
        write_memory(memory)
        append_audit({"iter": i, "action": action["type"], "summary": summary,
                      "grade": grade, "decision": decision,
                      "verifier": {"passed": result["passed"], "score": result["score"],
                                   "reason": result["reason"]},
                      "spend": spend})

        # done?
        if result["passed"]:
            stop_reason = "done-condition met"
            break

        # circuit breaker (P3): track whether the score improved this round.
        if result["score"] > best_score:
            best_score = result["score"]
            stale = 0
        else:
            stale += 1
            if stale >= NO_PROGRESS_LIMIT:
                stop_reason = "no progress for {} iterations, stopping".format(stale)
                break

        print("")
    else:
        # for-loop fell through without break: hit the iteration cap.
        stop_reason = "iteration cap reached"

    # Finalize memory.
    memory["final"] = {
        "stop_reason": stop_reason,
        "passed": bool(final_verify and final_verify["passed"]),
        "score": final_verify["score"] if final_verify else None,
        "spend": spend,
    }
    write_memory(memory)
    append_audit({"event": "stop", "reason": stop_reason,
                  "iterations": memory["iterations"], "spend": spend,
                  "passed": memory["final"]["passed"]})

    # Roll the run up into loop-health signals and write them alongside memory
    # and the audit log (the monitoring view of the same run).
    metrics = build_metrics(memory, stop_reason)
    write_metrics(metrics)

    return memory, metrics


def print_summary(memory):
    f = memory["final"]
    print("")
    print("=" * 56)
    print("SUMMARY")
    print("  stop reason : {}".format(f["stop_reason"]))
    print("  iterations  : {}".format(memory["iterations"]))
    print("  spend used  : {} / {}".format(f["spend"], MAX_SPEND))
    verdict = "PASS" if f["passed"] else "did not pass"
    score = "{:.0f}".format(f["score"]) if f["score"] is not None else "n/a"
    print("  verifier    : {} (final score {})".format(verdict, score))
    print("  memory file : {}".format(MEMORY_PATH))
    print("  audit log   : {}".format(AUDIT_PATH))
    print("=" * 56)


def print_health(metrics):
    """The monitoring view of the run: the same signals written to metrics.json.

    These line up with the Kit health checklist: are we inside the caps, is the
    score still climbing, how often did we hit the human gate, and did we finish.
    """
    m = metrics
    trend = ", ".join("{:.0f}".format(s) for s in m["score_trend"]) or "(none)"
    grades = m["grade_counts"]
    print("")
    print("=" * 56)
    print("LOOP HEALTH")
    print("  outcome          : {}".format(m["outcome"]))
    print("  stop reason      : {}".format(m["stop_reason"]))
    print("  turns used       : {} / {}".format(m["turns_used"], m["turns_cap"]))
    print("  spend used       : {} / {}".format(m["spend_used"], m["spend_cap"]))
    print("  score trend      : {}".format(trend))
    print("  no-progress streak: {} (breaker at {})".format(
        m["no_progress_streak"], m["no_progress_limit"]))
    print("  grade counts     : G0={} G1={} G2={} G3={}".format(
        grades["G0"], grades["G1"], grades["G2"], grades["G3"]))
    print("  human gate count : {}".format(m["human_gate_count"]))
    print("  metrics file     : {}".format(METRICS_PATH))
    print("=" * 56)


def main():
    auto_approve = os.environ.get("LOOPRAILS_AUTO_APPROVE") == "1"
    signal.signal(signal.SIGINT, _on_sigint)   # P9: Ctrl-C stops gracefully

    task = load_task()
    maker = make_maker()
    memory, metrics = run(task, maker, auto_approve)
    print_summary(memory)
    print_health(metrics)

    # Exit 0 whenever the loop completed in a controlled way (done, capped,
    # stopped, or kill switch). It is a guarded run that ended on its own
    # terms, not a crash.
    return 0


if __name__ == "__main__":
    sys.exit(main())
