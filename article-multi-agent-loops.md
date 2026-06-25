# Multi-Agent Loops: When More Agents Help, and How They Break

Splitting a task across several agents feels like progress. You draw an orchestrator, hang a few workers off it, add a reviewer, and the diagram looks serious. Then you ship it and discover the diagram was the easy part. The agents talk past each other, the reviewer approves work it should have rejected, and a worker quietly takes an action no human ever signed off on.

More agents is not automatically better. The single-agent baseline is strong and getting stronger as base models improve, which means the gap a second agent has to justify keeps shrinking [MA-14](codex-loops.html#ref-MA-14). So the question is not "should I use multiple agents." It is narrower: what does an extra agent boundary actually buy, and what does it cost. This article works through when the trade pays off, the patterns that hold up, how multi-agent loops break, and what oversight each agent needs. It is part of LoopRails, a framework for building agent loops that are fast to build and safe to run.

## When an extra agent earns its keep

There are a few cases where a second agent boundary pays for itself. They share a structure: the win comes from something a single pass through one model cannot give you cheaply.

The first is parallel breadth. Several agents explore different parts of a problem at once, then a later stage combines their output. Mixture-of-Agents formalizes this as aggregate-and-refine: a layer of proposer agents generates candidates, an aggregator merges them, and you can stack layers so each refines the last [MA-10](codex-loops.html#ref-MA-10). You are buying coverage and a second look, paid for in tokens and latency.

The second is independent cross-checking. Multiagent debate runs several instances that propose answers, critique each other, and revise toward consensus, which improves reasoning and factuality at the cost of more compute [MA-8](codex-loops.html#ref-MA-8). The mechanism is the point: a wrong answer that survives one model's pass often does not survive an independent model arguing against it. You pay compute to buy error-catching you could not get from a single forward pass.

The third is typed phase handoffs. When work moves through distinct stages, encoding the stages into roles that emit structured artifacts cuts cascading hallucination. MetaGPT bakes standard operating procedures into its roles so the team produces specs, code, and tests as checkable documents rather than free-form chat [MA-3](codex-loops.html#ref-MA-3). ChatDev runs specialized agents along a design-code-test waterfall, with a chat chain controlling what each pair is allowed to discuss [MA-4](codex-loops.html#ref-MA-4). In both, the structure does the work. The handoff between phases is where a single sprawling agent tends to lose the thread.

The frameworks handle the plumbing. AutoGen gives you conversable agents and configurable conversation patterns over a message-passing layer [MA-1](codex-loops.html#ref-MA-1). LangGraph supplies graph orchestration with supervisor, swarm, and hierarchical architectures, typed handoffs, and shared state [MA-6](codex-loops.html#ref-MA-6). CrewAI models role-goal-backstory agents in crews sequenced by flows [MA-7](codex-loops.html#ref-MA-7). For the wider map of how these pieces fit, the multi-agent survey lays out profiling, communication, capabilities, environments, and the open challenges [MA-12](codex-loops.html#ref-MA-12).

## Structure beats chat

One thread runs through the patterns that work, and it is the part teams most often get wrong.

When correctness matters, constrain what agents exchange and force verifiable intermediate artifacts. Free-form dialogue between agents is seductive because it is easy to set up and it demos well. It is also where reliability goes to die. An open conversation lets errors propagate as confident assertions, lets agents drift off task, and gives you nothing concrete to check at the seams. The systems that hold up replace chat with typed handoffs and structured outputs: a spec the next agent must satisfy, a diff the next stage must apply, a test the result must pass [MA-3](codex-loops.html#ref-MA-3)[MA-6](codex-loops.html#ref-MA-6).

The rule of thumb: prefer a typed handoff over an open conversation whenever you would be unhappy to be wrong. Chat is fine for brainstorming and for low-grade work where a mistake is cheap to undo. For anything consequential, make the agents pass artifacts you can inspect, not opinions you have to trust.

## How multi-agent loops break

Adding agents adds failure surface. Each boundary between two agents is a place where intent can be lost, a message can be misread, or an error can slip through unchecked. The honest way to design a multi-agent loop is to budget oversight for the seams, not just for the agents.

The failures are not random. Cemri et al. studied real multi-agent systems and built MAST, a taxonomy of 14 failure modes grouped into three categories: specification and design issues, inter-agent misalignment, and task verification [MA-13](codex-loops.html#ref-MA-13). Specification failures are bad role definitions and unclear task boundaries. Misalignment failures are agents working at cross purposes, dropping context across a handoff, or talking past each other. Verification failures are the system accepting output that should have been rejected. Their finding worth tattooing on the architecture review: weak verification is a leading cause of failure. The system did not break because an agent was dumb. It broke because nothing competent checked the work.

Some of these failures showed up at the very start of the role-play era. CAMEL, with its inception prompting, documented role flipping and drift: agents abandoning their assigned roles, the assistant starting to act like the user, the conversation wandering away from the task [MA-2](codex-loops.html#ref-MA-2). If you run agents in roles, expect them to slip out of those roles, and design so that slipping out is caught rather than silently tolerated.

## The reviewer-agent trap

The most common fix for weak verification is to add a reviewer agent. A writer drafts, a reviewer critiques, and approved work flows downstream. It is the right instinct and it has a specific trap.

Using a model to evaluate other models carries known biases. LLM-as-a-judge work documents position bias, verbosity bias, and self-enhancement bias: the judge favors the first option it sees, favors longer answers, and favors output that resembles what it would have produced itself [MA-9](codex-loops.html#ref-MA-9). A reviewer sub-agent built without controlling for these does not give you independent verification. It gives you a rubber stamp that launders bad output into apparent approval, which is worse than no reviewer, because now the bad output carries a green check.

This connects directly to the LoopRails maker-checker idea (see [the maker-checker article](article-maker-checker-ai.html)). Separating the maker from the checker only helps if the checker is genuinely independent and hard to game. A reviewer drawn from the same model, given the same context and prompt as the writer, is not a second set of eyes. It is a mirror, and mirrors make correlated errors. To get real independence, control for the biases: randomize the order of options so position cannot decide the verdict, blind the reviewer to which agent authored the work so self-enhancement has nothing to latch onto, and require the reviewer to cite evidence rather than render an opinion. A reviewer that has to point at a failing test or a violated constraint is much harder to fool than one asked whether the work "looks good."

## What classical multi-agent theory already settled

Multi-agent systems are not new. The field worked out a lot of this before LLMs existed, and the lessons transfer cleanly. Wooldridge's textbook is the standard reference for architectures, cooperation, and negotiation [MA-19](codex-loops.html#ref-MA-19), and Shoham and Leyton-Brown give the game-theory, mechanism-design, and social-choice foundations for combining several agents' outputs into one decision [MA-20](codex-loops.html#ref-MA-20). A few specific results are worth lifting directly.

Use typed messages with explicit intent. The Contract Net Protocol allocates tasks through announce-bid-award negotiation, and its cost is exactly the round-trip overhead of that negotiation [MA-15](codex-loops.html#ref-MA-15). FIPA ACL standardized typed performatives like inform, request, propose, accept, and refuse, each with defined preconditions [MA-18](codex-loops.html#ref-MA-18). The takeaway for agent loops: a message whose type and intent are explicit is far easier to route, validate, and audit than a paragraph of prose.

Coordinate through shared state when you can. The Hearsay-II blackboard let independent knowledge sources coordinate through a shared workspace rather than direct messages [MA-16](codex-loops.html#ref-MA-16). Stigmergy generalizes the idea: agents coordinate indirectly by leaving traces in a shared environment, a low-overhead alternative to chatty protocols [MA-26](codex-loops.html#ref-MA-26). A shared scratchpad your agents read and write often beats an N-by-N web of conversations.

Manage commitment deliberately so agents neither thrash nor get stuck. BDI agents track beliefs, desires, and intentions, and reconsider committed plans on purpose rather than at every step, which is how they avoid thrashing [MA-17](codex-loops.html#ref-MA-17). Cohen and Levesque define a persistent goal as one held until it is achieved, becomes impossible, or becomes irrelevant [MA-22](codex-loops.html#ref-MA-22), and Jennings shows durable cooperation needs an explicit shared commitment to a common goal [MA-21](codex-loops.html#ref-MA-21). Agents that re-plan on every observation churn; agents that never re-plan ride a dead plan into the wall. You want considered reconsideration in between.

Monitor teammates and reallocate on failure. Tambe's work on flexible teamwork has agents watch their teammates, redistribute work when one fails, and communicate selectively, only when the message is worth more than the interruption [MA-23](codex-loops.html#ref-MA-23). A multi-agent loop with no teammate monitoring has no answer for the moment one agent silently dies or goes off the rails.

Do not trust one agent for a critical decision. The Byzantine Generals result is blunt: reaching agreement when some members are faulty or malicious requires more than two-thirds honest participants, so you cannot stake a critical decision on a single agent's word [MA-24](codex-loops.html#ref-MA-24). For coordination, Raft is the model: elect one leader at a time and keep a single ordered shared log [MA-25](codex-loops.html#ref-MA-25). For high-grade actions, use redundancy or a quorum; for who-decides-what, elect one coordinator with an authoritative log rather than letting several agents each believe they are in charge.

## Oversight per agent

LoopRails grades each action by consequence on a G0-G3 scale and matches oversight to the grade. In a multi-agent system you apply that per agent, not once for the whole pile. The orchestrator, each worker, and the reviewer get their own grants and their own gates. A few rules carry the weight.

Least privilege per sub-agent. A worker that only drafts text should not hold credentials to deploy, send mail, or delete data. Scope each agent to the actions its job requires and nothing more, so a compromised or confused worker cannot reach beyond its role.

One kill switch for the whole system. When something goes wrong, you want to stop everything, not chase agents one at a time while they keep acting. A single halt for the entire loop is the control that keeps a local failure from becoming a runaway. See [the kill switch article](article-ai-kill-switch.html) for the mechanics.

Provenance and logging so you know which agent did what. When a multi-agent run produces a bad outcome, the first question is which agent did it and on whose say-so. Log every action with the agent that took it and the approval that authorized it. Without that record you cannot debug the failure, and responsibility quietly diffuses across the system until no one owns it.

Grade actions per agent so a worker cannot take a G3 action a human never approved. This is the load-bearing rule. The reviewer agent might be cleared to approve a G1 edit on its own, but a G3 action, deleting production data, moving money, sending an external message, still routes to a human regardless of how many agents signed off internally. Internal consensus among agents is not human approval. Do not let a chain of agents manufacture authority that no person granted.

Long-running sub-agents need memory and reflection to stay coherent. Generative Agents kept long-running agents coherent with an observation-planning-reflection memory loop [MA-11](codex-loops.html#ref-MA-11). An agent that runs for hours without consolidating what it has done drifts, repeats itself, and loses the plot. Give the long-lived ones a way to remember and to reflect on what they remember.

Finally, judge the whole system on end-state correctness, not on whether each agent looked busy. tau-bench evaluates a multi-step agent on whether the final state of the world is correct, and uses pass^k to measure reliability across repeated trials [FR-29](codex-loops.html#ref-FR-29). A multi-agent loop that produces beautiful intermediate artifacts and the wrong final answer has failed. Measure the outcome, and measure it across enough runs to know whether the result was reliable or lucky.

## A decision rule

Reach for multiple agents when the win is concrete: parallel breadth, independent verification, or typed phase handoffs that cut cascading hallucination [MA-10](codex-loops.html#ref-MA-10)[MA-8](codex-loops.html#ref-MA-8)[MA-3](codex-loops.html#ref-MA-3). In those cases the extra boundary buys something a single model cannot give you cheaply, and the cost is worth paying.

Stay single-agent when one strong model with good tools and the right context fits the job. Every agent you add brings cost, latency, and a new slice of failure surface, and the multi-agent advantage shrinks as the base model gets better [MA-14](codex-loops.html#ref-MA-14)[MA-13](codex-loops.html#ref-MA-13). The default should be one capable agent, well instrumented, with humans gating the actions that matter. Add agents when you can name the specific thing the extra boundary buys. If you cannot name it, you are paying for plumbing you do not need.

For the full method behind grading, guarding, and proving agent actions, see the [LoopRails framework](framework.html). For the human-oversight angle on multi-agent setups specifically, see [human-in-the-loop for multi-agent systems](article-hitl-multi-agent-systems.html).
