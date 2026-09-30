# Human-in-the-Loop for Coding Agents

Let a coding agent explore and edit within an isolated workspace. Put stronger controls around shared branches, credentials, deployments and destructive commands.

## Grade the actions

These are starting points. Data sensitivity, reversibility and cumulative impact can raise the grade; the [framework](framework.html#2-grade-the-action) defines the rule.

| Action | Starting grade | Control |
|---|---|---|
| Read non-sensitive project files | G0 | Allow within scope. |
| Edit local tracked files | G1 | Keep a diff and tested recovery path. |
| Push or merge shared code | G2 | Review the diff and CI results. |
| Delete production data or expose secrets | G3 | Block by default; use a separate controlled process. |

## Set the boundaries

Use an isolated checkout for parallel edits and an actual sandbox for filesystem, process and network restrictions. A Git worktree separates edits; it does not isolate credentials or shell execution. Keep production credentials out of the development environment.

## Make review useful

Review the actual diff, tests and dependency changes. Protect tests and release policy from the optimizing agent. A passing suite demonstrates tested behavior, not complete correctness.

## Test the workflow

Try a command that reads an unrelated secret, weakens tests, or reaches production. Check that the boundary blocks it. Confirm which shell side effects your recovery mechanism can undo.

Current [Codex sandbox documentation](https://learn.chatgpt.com/docs/sandboxing) separates execution boundaries from approval policy. [Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode) also uses automated action review. A model reviewer adds a control; it does not replace isolation.

Use the [Loop Card and guardrails checklist](kit.html) to record the owner, limits and recovery path.
