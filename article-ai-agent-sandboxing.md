# Sandboxing AI Agents

A sandbox limits where an agent can act: the files it can access, programs it can run, services it can reach and resources it can use. Those limits reduce harm when the model follows a bad instruction.

Isolation depends on the implementation and configuration. “Runs in a container” is not enough to establish a secure boundary.

## A useful baseline

- Start with a disposable workspace and narrowly scoped mounts.
- Restrict outbound destinations; deny network access when the task does not need it.
- Keep host sockets, unrelated home directories and production credentials outside.
- Apply memory, CPU, time and spending limits.
- Use short-lived credentials and a broker for sensitive tool access.
- Record boundary crossings and provide a tested stop.

Choose containers, virtual machines or other isolation according to the threat model. A Git worktree helps avoid edit conflicts; it does not isolate processes or secrets.

## What the sandbox cannot do

It cannot decide whether an authorized payment is sensible or whether a draft is factually correct. It may still allow disclosure through approved outputs, logs or destinations. Restricting open internet access helps, but any allowed channel that carries sensitive data needs scrutiny.

A sandbox escape, misconfigured mount or excessive credential scope can widen the effects. Test those assumptions and keep the runtime patched.

## Pair isolation with action controls

Allow exploration inside the boundary. Check authority and show evidence before a consequential action crosses it. Review the actual target and arguments, and bind authorization to that action.

Current [Codex documentation](https://learn.chatgpt.com/docs/sandboxing) treats sandbox restrictions and approval policy as distinct controls. Your own agent harness needs to enforce its own boundaries.

Use the [guardrails checklist](kit.html) to record what is contained, what can leave and how recovery works.
