"""The verifier (principle 2: independent check, separate from the maker).

The verifier scores a result against the task's done-condition. It returns
pass/fail, a numeric score, and a short human-readable reason.

The rule that matters: this function MUST NOT call the maker (agent.propose).
The thing that grades the work cannot be the thing that produced it, or the
grade is just the maker marking its own homework. Here that separation is
structural: verify.py imports nothing from agent.py, and the score is computed
only from the task definition and the observed state.
"""


def verify(task, state):
    """Score `state` against `task`'s done-condition.

    Returns a dict:
      passed : bool   - did we meet the done-condition?
      score  : float  - progress metric (here: coverage 0..100), higher better
      reason : str    - one line a human can read in the trace / audit log

    The score is what the circuit breaker watches: if it stops improving, the
    loop gives up instead of burning the whole budget (see loop.py).
    """
    # For this demo the "result" is a coverage number carried in state. A real
    # verifier would run the actual test suite and parse real coverage, or diff
    # against a spec, or call a separate scoring model. The shape is the same:
    # read the observed result, compare to the target, report.
    coverage = float(state.get("coverage", 0.0))
    target = float(task["done_condition"]["min_coverage"])

    passed = coverage >= target
    if passed:
        reason = "coverage {:.0f}% meets target {:.0f}%".format(coverage, target)
    else:
        reason = "coverage {:.0f}% below target {:.0f}%".format(coverage, target)

    return {"passed": passed, "score": coverage, "reason": reason}
