# Executable Truth

*Tests do not care how confidently the agent explains the bug. This is among their more endearing qualities.*

The best eval grader is often a small program.

Executable checks are repeatable, quick to inspect, and easy to wire into release gates. Code can still encode a bad idea with flawless syntax. When truth can be expressed as a state transition, invariant, schema, or test, start there.

Then try to break it.

## A minimal state grader

Consider a fictional flight-change task modeled on the architecture of tool-agent benchmarks such as τ-bench. The user asks to move a booking. Policy allows the change with a fee. The agent must confirm before committing.

The grader should not search the final response for “changed.” It inspects state and events:

```python
def grade_flight_change(task, run):
    state = run.final_state
    events = run.action_events

    checks = {
        "flight_changed": state["flight_id"] == task.expected["flight_id"],
        "fee_correct": state["change_fee"] == task.expected["change_fee"],
        "confirmation_obtained": any(
            e["type"] == "user_confirmation" and
            e["before"] == "commit_change"
            for e in events
        ),
        "single_commit": sum(
            e["type"] == "commit_change" for e in events
        ) == 1,
        "no_forbidden_action": not any(
            e["tool"] in task.forbidden_tools for e in events
        ),
    }

    return {
        "pass": all(checks.values()),
        "checks": checks,
    }
```

The code is illustrative, not copied from the benchmark. Its value comes from decomposition. A failed result identifies whether the problem was state, fee, confirmation, duplication, or scope.

Keep grader code independent of agent code. The agent should not be able to change the expected fixture, rewrite the event log, or skip the check. Run it with separate permissions.

## Invariants outlive answers

An expected final value works for a specific case. An invariant protects a class of cases.

Examples:

- sum of ledger entries remains zero;
- a refund never exceeds the captured payment;
- inventory never becomes negative;
- every changed record retains an audit event;
- no action occurs before authorization;
- a deployment either completes or rolls back to the prior healthy version;
- the number of side-effect events for an idempotency key is at most one.

Invariants are especially useful for agentic systems because the path may vary. You do not need to prescribe every tool call if every valid path must preserve the same facts.

A test that checks the goal but not the invariants can reward destructive shortcuts. An agent asked to reduce storage cost may delete logs. The cost metric improves with unusual enthusiasm. The retention invariant supplies context the objective omitted.

## Differential checks

Sometimes the correct answer is difficult to enumerate but two systems can be compared.

Try these differential checks:

- run the old and new implementation on the same inputs;
- compare an agent's calculation with a trusted library;
- replay historical events through both policy versions;
- compare structured extraction with known source fields;
- use a slower authoritative system as an oracle for sampled cases.

Differential checks are good migration tools. They can reveal disagreement without asserting that the old system is always correct. Classify disagreements, then determine which side has evidence.

For a prompt change, paired tasks are the equivalent: the same cases, environments, and seeds where practical. The discordant cases tell you more than two independent averages.

## Metamorphic checks

When no single reference answer exists, define transformations that should preserve or predictably change behavior.

Examples:

- Reordering irrelevant context should not change the outcome.
- Replacing names with other names should not change policy eligibility.
- Adding an unsupported sentence to a source should not make a different claim supported.
- Translating a request and answer should preserve the required decision.
- Increasing the requested refund above the payment should change approval to rejection.
- Removing a required fact should cause clarification, not guessing.

Metamorphic testing catches brittle shortcuts and hidden dependencies. Exact-output matching rarely fits LLM systems, so these transformations give the harness something sturdier to test.

Generate transformations deliberately and inspect them. Automated paraphrases can change meaning. A test suite full of “equivalent” prompts that are not equivalent is a tiny philosophy department with a CI budget.

## Sandboxing the grader

Software-agent evals execute model-generated code. That code is untrusted.

The harness should provide:

- ephemeral containers or sandboxes;
- no production credentials;
- controlled or disabled network access;
- explicit CPU, memory, disk, time, and process limits;
- repository state reset per task;
- captured stdout, stderr, and test artifacts;
- trusted grader files mounted read-only;
- cleanup after timeout or crash.

SWE-bench uses containerized execution because repository dependencies and tests need reproducible environments [SWE-04]. Internal coding-agent evals deserve the same care. “It is only a benchmark” is not a security boundary.

Tool-agent environments also need isolation. A test refund should not become a real refund because a “staging” credential points to production. Label fixtures visibly. Use separate accounts. Apply spend and action caps outside the model.

## Test the test with four attacks

For every executable grader, try:

### 1. The narrow pass

Produce the exact value the test checks while leaving related behavior broken.

If a test checks one example date, hard-code it. If it checks a file exists, create an empty file. If it checks one database row, corrupt a sibling row.

### 2. The overconstraint

Find a valid solution the test rejects.

Perhaps the test expects one function name, ordering, or internal data structure even though the request only specifies behavior. Hidden overconstraints make an eval measure conformity to a reference patch rather than correctness.

### 3. The side-effect escape

Satisfy the final assertion while violating process or safety.

Modify the fixture. Disable the test. Use a forbidden network call. Delete conflicting records. Make the expected state true by changing what “expected” points to.

### 4. The environment trick

Exploit stale state, time, randomness, locale, dependency version, or test order.

If a task passes only after another task, the harness is grading history. If dates depend on the evaluator's timezone, your leaderboard may observe daylight saving time.

## What SWE-bench teaches about task fairness

SWE-bench Verified's curation asked developers to judge whether issue descriptions were sufficiently clear and whether tests were appropriate [SWE-02] [SWE-06]. That review removed a large share of candidates. Reality supplies the catch: “real-world” does not automatically mean “good evaluation.” Real issues are often underspecified because maintainers share context, discuss details elsewhere, or write tests after deciding on an implementation.

The later retirement audit reinforces the point. Among the targeted often-failed tasks, tests sometimes enforced narrow expected patches or included behavior outside the issue [SWE-03]. A model can fail a benchmark task while producing a reasonable solution to the stated problem. It can also pass a test while missing the user's broader intent.

For internal suites, attach a **task fairness review**:

- Would a competent person have enough information?
- Does the grader test only stated or necessary behavior?
- Are important constraints available to the agent?
- Are dependencies and fixtures correct?
- Do test failures explain the violated property?
- Has a second person attempted an alternative valid solution?

## Report check-level results

Never store only `pass = false`.

Preserve:

- check ID and version;
- expected and observed values;
- relevant evidence pointer;
- execution status;
- grader error status;
- duration;
- logs;
- hard-gate classification.

Check-level results allow failure analysis and grader debugging. They also let the team distinguish capability regression from harness outage.

Example:

```json
{
  "task_id": "flight_change_041",
  "task_version": 3,
  "grader_version": 5,
  "result": "fail",
  "checks": [
    {"id": "flight_changed", "pass": true},
    {"id": "fee_correct", "pass": true},
    {"id": "confirmation_obtained", "pass": false,
     "evidence": "events://run-892#17"},
    {"id": "single_commit", "pass": true}
  ],
  "grader_status": "complete"
}
```

This run should fail even though the final reservation is correct. The missing confirmation is the product failure.

## Field move

Take one criterion currently graded by a person or model and move it down into state, executable, structured, or rule-based evidence. Then use Exercise 5 to attack it with a narrow pass, a valid alternative, an unsafe shortcut, and an environment dependency. Improve the contract before automating a check that loses the fight.
