# How to Build a Good Human-in-the-Loop for AI Coding Agents

A good **human in the loop for coding agents** is not a wall of "approve?" prompts. It is a system where the human only has to catch the mistakes they can realistically catch in time, and everything else is prevented by design. The way to build one is to grade each action the agent takes by how much damage it can do, then match the control to the grade: let trivial actions run, make low-risk edits notify-and-undoable, require a real review for risky merges, and outright prevent the high-stakes actions a human could never catch fast enough — destructive shell commands, untrusted dependency installs, production deploys. Approval prompts are for the narrow band where a human can actually see the problem and stop it. For the rest, prevention beats review.

This article walks through that build: the actions a typical coding agent takes, the grade each one earns, and the controls that fit. It rests on one question from [the LoopRails framework](framework.html): can a human realistically catch this mistake in time? When the honest answer is no, you prevent the outcome instead of gating it behind a prompt nobody can meaningfully read.

## Why approval prompts fail for coding agents

The reflex is to wrap a coding agent in confirmations: "ask me before you edit," "ask me before you run anything." It feels like oversight, but for most of what a coding agent does it is theater. Research on AI coding agents (see the LoopRails codex) found that requiring up-front plan approval did reduce attacks — yet when a human was given the chance to intervene mid-task, their success at actually catching and stopping the bad action stayed in the 9–26% range. People rubber-stamp: the harmful action looks like the helpful ones, scrolls past in a wall of diffs and shell output, and is often done the instant it fires.

That is the whole problem with **AI code review with a human in the loop** done naively — you put the human where they are a weak detector. The worst action a coding agent takes (`rm -rf` on the wrong path, a typosquatted dependency, a deploy of broken code) is irreversible by the time the prompt is read. Good **coding agent oversight** moves the safety boundary off the per-action prompt for everything the human can't catch, and reserves the prompt for the cases where they genuinely can.

## Grade the actions

Grade each action by reversibility × blast radius × stakes — G0 trivial, G3 critical. Use the [LoopRails grader](index.html#grader) and the [grading cheatsheet](cheatsheet.html) to set these for your own stack; here is where a coding agent's typical actions usually land.

| Action | Grade | Why |
| --- | --- | --- |
| Read / search files, browse the repo | G0 | No state change; nothing to undo. |
| Edit code in the working tree | G1 | Real change, but undoable — version control reverts it. |
| Run tests in a sandbox | G1 | Contained; no effect outside the box. |
| Commit to a branch | G1 | Reversible; isolated from main. |
| Push a branch / open a PR | G1–G2 | Shares work, but nothing ships yet; PR adds a review gate. |
| Merge to main | G2 | Changes the shared line; needs maker-checker, not self-approval. |
| Install dependencies | G2–G3 | Supply-chain risk; runs untrusted code, often outside undo. |
| Deploy | G2–G3 | Hits production; blast radius is real users. |
| Shell side-effects (`rm`, `mv`, `cp`, file deletion) | G3 | Irreversible and *outside the undo boundary* — see below. |

The grade that matters most is the last row. Most coding agents ship a checkpoint or undo feature, and it lulls teams into thinking everything is recoverable. It is not. Checkpoint and undo typically cover *structured file edits* — the diffs the agent makes through its editing tools — but they do **not** cover shell side-effects. An `rm`, `mv`, or `cp` run in a terminal sits *outside* the undo boundary. The most destructive operations a coding agent can perform are exactly the ones the undo button does not reach. That is what pushes them to G3, out of "just let it run, we can revert."

## Match the controls

Once each action has a grade, the controls follow. The method is Grade · Guard · Show · Prove: grade the action, guard it with the right constraint, show the human what they need to see, and prove what happened with a log. Each grade gets a different control, because a control that fits G3 would be intolerable friction on G0.

**G0 — run and log.** Reads and searches change nothing. Let the agent run them freely; just keep an audit trail so you can reconstruct the session.

**G1 — act, notify, undo.** Edits, sandboxed test runs, branch commits. Let the agent act, surface what it did, and make sure it is reversible. This is where checkpoints earn their keep: keep them for structured edits so any code change can be rolled back, and run the agent in a sandbox so test execution stays contained. See the [G1 guide](guide-g1.html) and the [Reversible RAIL](rail-reversible.html) for why undoability is the whole game at this grade.

**Sandbox-first, by default.** Underneath all of this, run the agent with **no network egress by default** and **scoped, short-lived credentials**. This is the single highest-leverage control, because it constrains every action at once instead of one prompt at a time: no network means the agent cannot exfiltrate your repo secrets even if it is prompt-injected, and scoped credentials mean a hijacked agent cannot reach production. Open the network per task to an explicit allowlist. The full setup is in [AI agent sandboxing](article-ai-agent-sandboxing.html).

**G2 — preview and approve.** Merges to main, lower-risk installs and deploys. Here a human *can* catch the problem, so a prompt is worth it — but make it a real review, not a rubber stamp. For merges to main, require **maker-checker**: the agent proposes, an independent reviewer approves, proposer ≠ approver. The agent does not merge its own work. For risky steps generally, require a **plan or diff approval** before the action fires, so the human reviews the actual change, not a vague "proceed?" See the [G2 guide](guide-g2.html) and [getting AI agent approval right](article-ai-agent-approval.html).

**G3 — prevent, stop and ask, or refuse.** Shell side-effects, untrusted dependency installs, high-end production deploys. The control here is different in kind: you do not review them, you prevent them — covered next.

## Prevent, don't review: the uncatchable actions

For the high-stakes actions a human cannot realistically catch in time, an approval prompt is the wrong tool. Prevent the bad outcome instead — make it impossible or contained, not gated.

**Shell side-effects (`rm`, `mv`, `cp`).** Because these live outside the undo boundary, "preview and approve" is a trap: the human okays a command they cannot truly evaluate, with no rewind if they get it wrong. Prevent instead. Run the agent in a sandboxed, disposable workspace with no access to your real home directory, SSH keys, or other projects, so a destructive command destroys only throwaway state. If a real deletion is needed, route it through an explicit, narrow, reversible operation — not a raw shell call.

**Dependency installs.** Installing a package runs untrusted code and pulls in a supply chain you did not vet; a typosquatted or compromised package is not something a human catches by reading an install prompt. Prevent: install in the sandbox first, pin and lock versions, and vet new dependencies out of band.

**Production deploys.** Treat deploy as G3 with a hard stop: required independent approval (maker-checker), the ability to interrupt mid-deploy, and a tested rollback. A kill switch and a reversible deploy matter more than a confirmation dialog. The [G3 guide](guide-g3.html) covers prevention for the critical tier.

This is also how you defuse the **lethal trifecta** for coding agents. A coding agent often has all three legs at once: access to repo secrets and private code, exposure to untrusted content (a dependency's README, an issue, a fetched web page, a pasted log), and a network path out. That combination is an exfiltration risk via prompt injection — and no approval prompt catches it, because the malicious instruction is buried in content the human will never read. Remove a leg: no network egress by default kills the exfiltration path; scoped credentials shrink what can leak. See [the lethal trifecta](article-lethal-trifecta.html) for the mechanism and the [Authorized RAIL](rail-authorized.html) for scoping credentials to least privilege.

Across all of this, hold to RAIL: every action should be **R**eversible, **A**uthorized, **I**nterruptible, and **L**ogged. Where an action cannot be made reversible — shell side-effects, deploys — that is your signal to prevent it, not to prompt about it.

## Common mistakes

- **Trusting checkpoints for everything.** Undo covers structured edits, not `rm`/`mv`/`cp`. Treating shell side-effects as recoverable is the most common and most expensive error.
- **Approval prompts as the main control.** A wall of confirmations trains rubber-stamping; intervention success was only 9–26% in the research. Reserve prompts for cases the human can actually evaluate.
- **Letting the agent merge its own PRs.** Self-approval is not maker-checker; the proposer must not be the approver.
- **Network on by default.** A coding agent with secrets, untrusted input, and open egress is the lethal trifecta. Default-deny egress.
- **Broad, long-lived credentials.** A standing production token in the agent's environment is a blast radius waiting to happen. Scope and expire.
- **Installing dependencies onto the host.** Supply-chain code runs the moment you install. Sandbox and pin it.
- **No kill switch.** If you cannot stop a runaway deploy or loop mid-flight, you have hope, not oversight.

## Key takeaways

- The right question is "can a human realistically catch this mistake in time?" For most coding-agent actions, no — so prevent, don't prompt.
- Grade every action G0–G3 by reversibility, blast radius, and stakes, then match the control: run+log, act-notify-undo, preview+approve, or prevent.
- Checkpoint/undo covers structured edits but not shell side-effects; `rm`/`mv`/`cp` are G3 and live outside the undo boundary.
- Sandbox-first with no egress and scoped credentials is the highest-leverage control, and it defuses the lethal trifecta.
- Require maker-checker for merges to main and a hard stop for deploys; reserve prompts for the band where a human can truly evaluate the change.

Ready to build it? Start with the LoopRails [playbook](playbook.html) and grade your agent's actions with the [grader](index.html#grader). LoopRails is free and practitioner-focused, no signup required.
