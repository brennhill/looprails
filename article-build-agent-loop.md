# Build Your First Agent Loop

Start with one task, clear limits and a completion check the agent cannot bypass. Fixing a failing test works well—provided the agent cannot weaken the test to claim success.

## 1. Write the contract

State the goal, permitted files and tools, prohibited changes, done-condition and owner. Set maximum turns, time and spend. Decide what happens on timeout: preserve partial work and escalate, discard it or use a tested rollback.

Use the [done-condition template](kit.html). “The agent says it is done” is not a completion check.

## 2. Build the controller

```python
while within_limits():
    proposal = agent.next_action(context)
    action = validate_and_authorize(proposal)
    result = execute_in_sandbox(action)
    persist(action, result)
    verdict = verify_artifact_and_state()
    if verdict == "pass":
        return artifact
    if verdict == "unsafe" or no_progress():
        break
escalate_with_evidence()
```

This is pseudocode. Real execution needs timeouts, error handling, cancellation and reconciliation of uncertain side effects.

## 3. Isolate and persist

Use a disposable environment with scoped filesystem and network access. A Git worktree separates edits but is not a security sandbox. Keep secrets outside model-visible context.

Persist the goal, constraints, completed steps, unresolved decisions and artifact locations. Record tool results so restart does not blindly repeat effects.

## 4. Check the result

Run trusted tests against the produced artifact in a clean environment. Inspect changes to tests and dependencies. A second agent can help review, but shared blind spots make it weaker than independent executable evidence for many tasks.

## 5. Test failure before scheduling

Force a timeout, crash, failed tool call and cancellation. Confirm that no child process or queued job keeps acting. Schedule only after repeated representative trials show useful performance within the intended limits.

Try the [starter](https://github.com/brennhill/looprails/tree/main/starter), then use [agent-evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) to build regression cases.
