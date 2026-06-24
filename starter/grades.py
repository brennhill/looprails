"""Action grading: G0-G3.

The grade answers one question before an action runs: how much damage could
this do if it is wrong? We score three axes and take the worst one, because a
single bad axis (irreversible, or huge blast radius, or high stakes) is enough
to make an action consequential.

Axes (each 0-3):
  reversibility - can we undo it? 0 = trivially, 3 = not at all.
  blast_radius  - how much does it touch? 0 = one local thing, 3 = everything.
  stakes        - what is on the line? 0 = nothing, 3 = money/safety/prod.

Grade = max(reversibility, blast_radius, stakes).

Policy:
  G0, G1 -> auto-run, just log it.
  G2, G3 -> require a human checker (the consequential edge, principle 7).

This module is pure (no I/O, no model calls) so it is easy to unit-test and
easy to reason about. The whole point of separating grading from the loop is
that the rule for "what needs a human" lives in one readable place.
"""


# Per-action-type scoring. An action proposed by the maker carries a "type"
# and some metadata; we look the type up here. Unknown types are treated as
# the most dangerous (G3) so the default is caution, not permissiveness.
ACTION_AXES = {
    # type            : (reversibility, blast_radius, stakes)
    "noop":             (0, 0, 0),
    "read_file":        (0, 0, 0),
    "propose_edit":     (1, 1, 1),   # an edit to one mock module, easily reverted
    "run_tests":        (0, 1, 0),   # read-only check, touches the test suite
    "commit":           (2, 2, 2),   # writes to shared history: consequential
    "deploy":           (3, 3, 3),   # irreversible, wide, high stakes
}


# Which grades may run without a human. Everything else needs approval.
# "Off by default" (principle 8): only the grades listed here auto-run.
AUTO_RUN_GRADES = {"G0", "G1"}


def grade_action(action):
    """Map an action to a grade string G0..G3.

    `action` is a dict with at least a "type" key and an optional "meta" dict.
    We use max-of-axes so the riskiest dimension decides the grade. An action
    that is cheap and local but irreversible is still consequential.
    """
    axes = ACTION_AXES.get(action.get("type"), (3, 3, 3))

    # Metadata can push an action up a grade. Example: editing a file flagged
    # as critical raises the stakes even though the edit itself is reversible.
    # This is where real systems encode "this particular target is sensitive."
    meta = action.get("meta", {})
    bump = 0
    if meta.get("critical_path"):
        bump = max(bump, 2)
    if meta.get("touches_prod"):
        bump = max(bump, 3)

    score = min(3, max(max(axes), bump))
    return "G{}".format(score)


def requires_approval(grade):
    """True if this grade needs a human checker before it can run.

    This is the policy knob for principle 7 (human gate at the consequential
    edges only). Flip an entry in AUTO_RUN_GRADES and the gate moves.
    """
    return grade not in AUTO_RUN_GRADES
