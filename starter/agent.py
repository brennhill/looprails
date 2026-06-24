"""The maker (principle 5: maker/checker separation, maker half).

`propose(task, state)` looks at the current state and returns ONE proposed
action. It does not run the action and it does not verify anything. That keeps
the maker and the checker (verify.py) on opposite sides of the wall.

The shipped implementation is MockMaker: deterministic, offline, no API key.
It makes steady progress so the demo terminates cleanly in a few iterations,
and it deliberately proposes one consequential (G2) action partway through so
the human-approval path gets exercised.

To wire a real model, implement the Maker protocol with a class whose
`propose` calls a model and returns the same action dict shape. A commented
stub for that is at the bottom of this file.
"""


class Maker:
    """Protocol for a maker. Anything with this method works in the loop."""

    def propose(self, task, state):
        """Return an action dict: {"type": str, "summary": str, "meta": {...},
        and any fields the executor needs to apply it}."""
        raise NotImplementedError


class MockMaker(Maker):
    """Deterministic maker for the offline demo.

    It walks a fixed script of edits that raise the mock module's coverage in
    steady steps toward the target. One step in the middle is a "commit"
    (graded G2) so the loop has to stop for human approval. After the target
    is reached it proposes a "noop" so the loop has a clean thing to do if it
    is still spinning.

    Determinism is on purpose: a teaching demo should produce the same trace
    every run. A real maker is non-deterministic, but the loop around it does
    not care.
    """

    # Each step raises coverage by `gain`. The "commit" step is the
    # consequential one that trips the human gate.
    SCRIPT = [
        {"type": "propose_edit", "summary": "add tests for parse_config()",  "gain": 25.0, "meta": {}},
        {"type": "propose_edit", "summary": "add tests for load_defaults()",  "gain": 25.0, "meta": {}},
        {"type": "commit",       "summary": "commit the new tests to shared history", "gain": 0.0, "meta": {}},
        {"type": "propose_edit", "summary": "add tests for the error paths",   "gain": 25.0, "meta": {}},
        {"type": "propose_edit", "summary": "add tests for the CLI wrapper",   "gain": 15.0, "meta": {}},
    ]

    def __init__(self):
        self._step = 0

    def propose(self, task, state):
        if self._step < len(self.SCRIPT):
            action = dict(self.SCRIPT[self._step])  # copy so callers can't mutate the script
            self._step += 1
            return action
        # Out of scripted steps: nothing left to do that makes progress.
        return {"type": "noop", "summary": "no further progress available", "gain": 0.0, "meta": {}}


def make_maker():
    """Factory the loop calls. Swap MockMaker() for a real maker here."""
    return MockMaker()


# ---------------------------------------------------------------------------
# Wiring a real model (a commented stub: do NOT uncomment in the demo, it
# would add a dependency and require an API key).
#
# The seam is `call_model`: a function that turns the current state into a
# proposed action by asking a model. Everything else in the loop stays the
# same, because the loop only ever sees the action dict that propose() returns.
#
#   # pip install anthropic      (the official Anthropic Claude Python SDK)
#   import anthropic
#   import json
#
#   class ClaudeMaker(Maker):
#       def __init__(self, model="claude-opus-4-8"):
#           # Reads ANTHROPIC_API_KEY from the environment.
#           self._client = anthropic.Anthropic()
#           self._model = model
#
#       def propose(self, task, state):
#           prompt = (
#               "You are the MAKER in a guarded agent loop. Propose exactly one "
#               "next action as JSON with keys type, summary, meta. Goal: {}. "
#               "Current state: {}."
#           ).format(task["goal"], json.dumps(state))
#           msg = self._client.messages.create(
#               model=self._model,
#               max_tokens=1024,
#               # Adaptive thinking is the recommended mode on current models;
#               # the model decides how much to think (no fixed token budget).
#               thinking={"type": "adaptive"},
#               messages=[{"role": "user", "content": prompt}],
#           )
#           text = next(b.text for b in msg.content if b.type == "text")
#           return json.loads(text)
#
# Then in make_maker(): return ClaudeMaker().
# Note the maker still never verifies its own work: the checker in verify.py
# stays a separate function, and for G2/G3 actions the checker is a human.
# ---------------------------------------------------------------------------
