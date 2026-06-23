# How to Build a Good Human-in-the-Loop for Multi-Agent Systems

A good **human in the loop for multi-agent systems** does not mean watching every agent in real time — you cannot, and you never will. It means building the system so a human only has to catch the mistakes they can realistically catch in time, and preventing the rest by design. The method is the same one you would use for a single agent, applied harder: grade every action each agent and sub-agent takes by how much damage it can do, then match the control to the grade. The difference with a swarm is that no human can supervise the activity directly, so the work shifts almost entirely to prevention — scope each sub-agent to least privilege, give each one a distinct identity you can trace, cap the whole system's blast radius, and wire one kill switch that halts everything at once.

This article walks through building that. It rests on one question from [the LoopRails framework](framework.html): can a human realistically catch this mistake in time? In a multi-agent system the honest answer is almost always no — the action is taken by a sub-agent the human is not watching, under permissions they may not have known it had. So you stop trying to review and start engineering the system so the dangerous outcomes cannot happen.

## The scenario: orchestrators and sub-agents

A typical multi-agent setup has an orchestrator that decomposes a goal and hands pieces to specialized sub-agents — one searches the web, one writes code, one queries a database, one calls external APIs. The sub-agents may spawn their own sub-agents. They run concurrently, pass results back, and the orchestrator stitches the work together. It is fast and capable, and that is exactly why it is hard to oversee.

A single agent at least has one place to watch and one identity to hold accountable. A swarm scatters both. By the time a human notices something is wrong, a dozen actions have already fired across several agents, and the trail of which agent did what — under whose authority — is muddy. The framework's question gets brutal here: a human cannot catch a mistake in time if they cannot even see it happen.

## Why multi-agent makes oversight harder

Multi-agent systems break the assumptions that make single-agent oversight workable. Five problems compound.

**Permission inheritance.** Sub-agents can silently inherit a parent agent's permissions and bypass settings, granting them more autonomy than you intended unless you scope each one explicitly (see the LoopRails codex). You configure the orchestrator carefully, it spawns a sub-agent for a small task, and that sub-agent quietly arrives with god-mode — full tool access, no approval gates — because it took the parent's settings by default. Nobody granted it that on purpose. It is the default that grants it.

**Blurred provenance and accountability.** When five agents act under one set of credentials, your logs say "the system did X." They do not say which sub-agent did it, on whose behalf, or which human owns the consequence. Without provenance, you cannot reconstruct the chain, you cannot revoke the right access, and you cannot answer the only question that matters after an incident: who was accountable?

**Compounding blast radius.** Each sub-agent's actions might be individually modest. Run ten of them in parallel and the aggregate is not modest — ten agents each making "small" external calls, spending "a little," or touching "a few" records add up to a large, fast, system-level effect that no single per-action grade captures.

**Emergent behavior.** Agents react to each other's outputs. One sub-agent's mistake becomes another's input; loops form; the system does things no single agent was instructed to do. The behavior is a property of the interaction, not of any one component you reviewed.

**No single place to intervene.** With one agent, you pause one process. With a swarm, the work is distributed across many in-flight agents. If you can only stop them one at a time, the rest keep running while you scramble — which is not a stop at all.

Underneath all of this is the principal–agent problem: a delegate may act against the principal's interest, and the more delegates you stack, the further the action drifts from the human who is supposed to own it. Accountability has to be engineered to stay with a human; it does not stay there on its own.

## Grade the actions — every one of them

The core move does not change for multi-agent: grade each tool action by reversibility, blast radius, and stakes, G0 (trivial) to G3 (critical). The discipline that does change is *whose* actions you grade. Grade EACH action, regardless of which agent or sub-agent takes it. A database write is a G2 whether the orchestrator does it or a three-levels-deep sub-agent does it. The grade is a property of the action and its consequences, not of the agent's position in the hierarchy.

Use the [LoopRails grader](index.html#grader) on the full set of actions any agent in the system can perform — reads, edits, external calls, spends, deletes, deploys — and grade them by outcome.

Then add the part that is unique to swarms: the system's aggregate risk compounds. A single sub-agent sending one email is G1. An orchestrator that can spin up sub-agents each sending email is a different risk entirely, because the system can send a thousand before anyone reacts. So grade actions individually *and* grade the system's capacity to repeat and parallelize them. The aggregate is what you cap, covered below.

## Match the controls

Once actions are graded, the controls follow the same Grade · Guard · Show · Prove method — guard the action, show the human what they need, prove what happened — adapted for many agents and one accountable human.

**Least privilege per sub-agent — do not inherit the parent's bypass.** This is the highest-leverage control in a multi-agent system. Give each sub-agent a Capability Lock: only the tools and scopes its job requires, and nothing inherited by default. The search agent gets read-only web access and no database. The database agent gets a scoped, read-mostly connection and no shell. A sub-agent that cannot reach production cannot break it, no matter what it is talked into. Critically, override the default that lets a child inherit a parent's permissions — scope explicitly, per sub-agent. See [least privilege for AI agents](article-least-privilege-ai-agents.html) and the [Authorized RAIL](rail-authorized.html).

**Distinct identities and provenance logging.** Give each agent and sub-agent its own identity and credentials, and log every action so it traces back to a specific agent acting under a specific human owner. This is the W3C PROV idea applied to agents, with distributed-tracing concepts borrowed from microservices: every action carries who took it, on whose behalf, with what inputs, so you can reconstruct the full chain across agents after the fact (see the LoopRails codex). Without distinct identities, provenance is impossible — shared credentials make every action anonymous. See the [Logged RAIL](rail-logged.html).

**One kill switch that stops the whole system.** A swarm needs a single control that halts everything, including in-flight sub-agents — not a per-agent stop you have to chase around the system. When something goes wrong, you hit one switch and the orchestrator, every sub-agent, and every spawned descendant stop. This is the only realistic "intervene in time" mechanism for a system you cannot watch. See [building an AI kill switch](article-ai-kill-switch.html) and the [Interruptible RAIL](rail-interruptible.html).

**Global blast-radius caps.** Because individual grades miss the aggregate, set caps at the system level: a global spend ceiling, a global rate limit on external actions, a cap on how many sub-agents can spawn. When the system as a whole hits the limit, it stops — regardless of which agent was about to act. This is what contains compounding blast radius and emergent loops before they run away.

**A human escalation owner.** Name a specific human as the accountable principal for the system. When a sub-agent hits a G3 action or a cap, it escalates to that owner, who decides. Accountability does not get diffused across the agents or the team; it lands on a person. This is the answer to the principal–agent problem — the buck stops at a human by design. See the [G3 guide](guide-g3.html).

## Prevent, don't review

You cannot watch a swarm in real time, so real-time review is off the table — the human is not a viable detector when actions fire concurrently across agents they cannot see. Research on AI coding agents (see the LoopRails codex) found that even when a human was given the chance to intervene mid-task, their success at catching and stopping the bad action stayed at only 9–26% — and that was for a single agent the human could focus on. Spread that human across a swarm and the number only gets worse.

So prevent. Scope each sub-agent so the dangerous action is not in its toolset. Cap the system so the aggregate cannot run away. Wire one kill switch so you can stop everything at once. These are design-time controls that hold without a human in the moment — which is the only kind of control that works for a system no human can supervise live.

## Common mistakes

- **Sub-agents inheriting god-mode.** The default that lets a child inherit the parent's permissions is the single most common way a swarm gets more autonomy than anyone authorized. Scope each sub-agent explicitly.
- **No provenance.** Shared credentials and undifferentiated logs mean you cannot tell who did what. After an incident you are guessing, and you cannot revoke or fix the right thing.
- **No system-wide stop.** A per-agent pause is not a kill switch. If the rest of the swarm runs while you stop one agent, you do not have a stop.
- **Per-action grades only.** Grading each action without capping the aggregate misses the compounding blast radius — the failure mode unique to multi-agent systems.
- **Diffuse accountability.** When "the system" is responsible, no one is. That is a moral crumple zone: the human gets blamed for an outcome they had no real ability to control. Name an accountable principal.

## Key takeaways

- The right question is still "can a human realistically catch this mistake in time?" For a swarm the answer is no — so the work is prevention, not review.
- Grade EACH action G0–G3 by its outcome, regardless of which agent or sub-agent takes it, and also grade the system's capacity to parallelize and repeat.
- Scope every sub-agent to least privilege and do not inherit the parent's bypass — sub-agents silently inherit permissions otherwise.
- Give each agent a distinct identity with provenance logging so every action traces to an agent and a human owner.
- Wire one kill switch that halts the whole system and in-flight sub-agents, set global blast-radius caps, and name a human escalation owner as the accountable principal.

Ready to build it? Start with the LoopRails [playbook](playbook.html), grade your agents' actions with the [grader](index.html#grader), and read up on [AI agent autonomy levels](article-ai-agent-autonomy-levels.html) to set the right defaults per sub-agent. LoopRails is free and practitioner-focused, no signup required.
