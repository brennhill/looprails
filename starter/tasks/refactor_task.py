"""The example task.

A task is just data: a goal, a checkable done-condition, a starting state, and
the set of action types the loop is allowed to use. Keeping it as plain data
(no behavior) is what lets you swap in your own task without touching the loop.

This task: raise the test coverage of a mock module to >= 90%. The "module"
is simulated with a single number so the whole thing runs offline with no real
test suite. The maker proposes edits that raise the number; the verifier checks
the number against the target.
"""


# The allowlist (principle 8: least privilege, everything off by default).
# The loop refuses to run any action whose type is not in this set, no matter
# what the maker proposes. "deploy" is deliberately absent: the maker could ask
# for it, but the guardrail would block it.
ALLOWED_ACTIONS = {
    "noop",
    "read_file",
    "propose_edit",
    "run_tests",
    "commit",
}


TASK = {
    "name": "raise-coverage",
    "goal": "Raise test coverage of the mock module `config` to >= 90%.",

    # The done-condition (principle 1: the loop knows when it is finished and
    # correct). The verifier reads this; nothing else decides done.
    "done_condition": {
        "min_coverage": 90.0,
    },

    # The starting state. `coverage` is the mock "result" the maker improves
    # and the verifier scores. Real tasks would put their working state here.
    "start_state": {
        "module": "config",
        "coverage": 20.0,
    },

    "allowed_actions": ALLOWED_ACTIONS,
}


def load_task():
    """Return a fresh copy of the task so a run never mutates the definition."""
    import copy
    return copy.deepcopy(TASK)
