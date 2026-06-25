# The Loop Engineering Codex

This is the evidence base for building and operating AI agent loops. It collects what is known about two problems a loop runs into once it leaves the demo: how to recover when a run fails or crashes, and how to coordinate several agents without multiplying the chaos. The sources come from three places that rarely get read together: production reliability engineering, classical distributed AI, and recent work on LLM agents.

It is a companion to the main [research codex](codex.html), which covers human oversight of AI. This one covers the machinery of the loop itself.

Every entry below points to a real source with a working link. A small number are marked UNVERIFIED where a detail could not be independently confirmed; treat those with caution. Citations are tagged (for example FR-1, MA-1) and are linkable, so an article can point at the exact source behind a claim.

## Part 1: Failure recovery for agent loops

A loop that runs unattended will eventually crash mid-action, retry something that already happened, or wedge itself on a bad input. The engineering world solved most of this for long-running workflows years ago. The LLM-agent world is re-learning it now, with a new wrinkle: the agent can sometimes fix its own mistakes, and sometimes makes them worse when it tries.

### 1.1 Durable execution and checkpointing

**[FR-1]** The Definitive Guide to Durable Execution, Tom Wheeler (2025), Temporal. [temporal.io](https://temporal.io/blog/what-is-durable-execution). Durable execution treats a workflow as a function whose state survives a crash, so work resumes in a new process with local variables intact. This is the model an agent loop wants: the loop body should be resumable, not restart-from-zero.

**[FR-2]** Temporal Event History, Temporal documentation. [docs.temporal.io](https://docs.temporal.io/workflow-execution/event). Records every decision and result to an append-only history and replays it to rebuild state after a crash. The agent-loop translation: log each step so a restarted run reaches the same point without redoing side effects.

**[FR-3]** Durable Orchestrations (event sourcing and replay), Microsoft Learn. [learn.microsoft.com](https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-orchestrations). Reconstructs orchestrator state from an append-only history, which forces the control flow to be deterministic. The warning for loops: keep the non-deterministic model calls and tool effects out of the replayable control flow, in recorded steps.

**[FR-4]** Handling Errors in Step Functions Workflows, AWS documentation. [docs.aws.amazon.com](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html). Declarative Retry and Catch per state, with max attempts, backoff, jitter, and catch-and-route. A concrete vocabulary for "retry this step, then fall back" when a loop is modeled as a state machine.

**[FR-5]** Cadence Workflows, Cadence documentation. [cadenceworkflow.io](https://cadenceworkflow.io/docs/concepts/workflows). The open-source predecessor to Temporal, framing the fault-oblivious stateful model that preserves application state across host and process failure. A second independent statement of the durable-execution idea.

**[FR-6]** Tasks (retries and recovery), Apache Airflow documentation. [airflow.apache.org](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html). Work is a DAG of tasks with per-task retries, delays, and timeouts, re-runnable from the point of failure. The job-scheduler view of checkpoint and restart, one step at a time.

### 1.2 Transactions, sagas, idempotency, and delivery

**[FR-7]** Sagas, Hector Garcia-Molina and Kenneth Salem (1987), ACM SIGMOD. [dl.acm.org](https://dl.acm.org/doi/10.1145/38713.38742). Break a long transaction into smaller ones, each with a compensating transaction that semantically undoes it. This is the model for rolling back an agent loop that takes real-world actions: you cannot lock the world, so you record what to undo. (DOI 10.1145/38713.38742 confirmed via dblp; the ACM page blocks automated fetches.)

**[FR-8]** Consensus on Transaction Commit, Jim Gray and Leslie Lamport (2006), ACM TODS. [arxiv.org/abs/cs/0408036](https://arxiv.org/abs/cs/0408036). Shows two-phase commit is the failure-free special case of a Paxos commit, and why 2PC blocks when the coordinator dies. The lesson: strict all-or-nothing atomicity across distributed effects is expensive and blocking, so sagas and idempotent retries are usually more practical.

**[FR-9]** Making Retries Safe with Idempotent APIs, Malcolm Featonby (2021), Amazon Builders' Library. [aws.amazon.com](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/). Idempotency tokens and dedup make an operation safe to repeat. The single most important pattern for a loop, since a crash mid-action means the loop will retry, and a retry without idempotency double-charges or double-sends.

**[FR-10]** Timeouts, Retries, and Backoff with Jitter, Marc Brooker, Amazon Builders' Library. [aws.amazon.com](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/). Combines timeouts, bounded retries, exponential backoff, and jitter so retries do not synchronize into a thundering herd. Exactly the discipline a loop calling a model API or tools needs after a blip.

**[FR-11]** Exponential Backoff and Jitter, Marc Brooker (2015), AWS Architecture Blog. [aws.amazon.com](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/). The shorter companion with concrete jitter algorithms (full, equal, decorrelated). Worth citing for a retry helper you can implement directly.

**[FR-12]** Message Delivery Guarantees, Confluent / Apache Kafka documentation. [docs.confluent.io](https://docs.confluent.io/kafka/design/delivery-semantics.html). At-most-once, at-least-once, and exactly-once, with the practical point that you get at-least-once, so consumers must be idempotent. A queue-driven loop should assume each step can arrive more than once.

**[FR-13]** Using Dead-Letter Queues in Amazon SQS, AWS documentation. [docs.aws.amazon.com](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html). After a message fails N times it is moved aside so it stops blocking the queue and can be inspected. How to stop a poison input from retrying forever: cap attempts and quarantine the failed run.

### 1.3 Reliability primitives

**[FR-14]** Addressing Cascading Failures (Ch. 22), Site Reliability Engineering, Google (2016). [sre.google](https://sre.google/sre-book/addressing-cascading-failures/). Cascading failure is a positive-feedback loop usually triggered by overload; defenses include load shedding and limiting retries. Naive retry logic in a loop is a classic cascade trigger.

**[FR-15]** Handling Overload (Ch. 21), Site Reliability Engineering, Google (2016). [sre.google](https://sre.google/sre-book/handling-overload/). Degrade and shed load gracefully rather than collapse when past capacity. Guidance for loops that fan out to shared models or tools.

**[FR-16]** Circuit Breaker, Martin Fowler (2014). [martinfowler.com](https://martinfowler.com/bliki/CircuitBreaker.html). After repeated failures the breaker trips and fails fast for a cooldown, then probes for recovery. Wrap flaky tool and model calls so a dead dependency produces fast, contained failures instead of hung timeouts.

**[FR-17]** Release It! (2nd ed.), Michael T. Nygard (2018), Pragmatic Bookshelf. [pragprog.com](https://pragprog.com/titles/mnee2/release-it-second-edition/). The source of the stability-pattern catalog: timeouts, circuit breaker, bulkheads, fail fast, and their antipatterns. The canonical reference for the primitives a loop assembles to isolate failure.

### 1.4 LLM self-correction and its limits

**[FR-18]** Reflexion: Language Agents with Verbal Reinforcement Learning, Shinn et al. (2023), NeurIPS. [arxiv.org/abs/2303.11366](https://arxiv.org/abs/2303.11366). Turns a failed trajectory into a written self-critique stored in memory and read on the next attempt, improving behavior with no weight updates. The quality of the feedback signal, not the act of retrying, drives the gain.

**[FR-19]** Self-Refine: Iterative Refinement with Self-Feedback, Madaan et al. (2023), NeurIPS. [arxiv.org/abs/2303.17651](https://arxiv.org/abs/2303.17651). One model generates, critiques itself, and rewrites until a stop condition. The minimal self-refine inner loop, strongest on subjective generation, which motivates the verifier-gated approaches below.

**[FR-20]** CRITIC: LLMs Can Self-Correct with Tool-Interactive Critiquing, Gou et al. (2023), ICLR 2024. [arxiv.org/abs/2305.11738](https://arxiv.org/abs/2305.11738). The model critiques and fixes its output using external tools (a code interpreter, search) rather than introspection alone. Evidence that grounding the critique in a real tool result is what makes correction reliable.

**[FR-21]** Large Language Models Cannot Self-Correct Reasoning Yet, Huang et al. (2023), ICLR 2024. [arxiv.org/abs/2310.01798](https://arxiv.org/abs/2310.01798). Without external feedback, self-correction of reasoning often makes it worse, and reported gains leaned on oracle stop signals. Never gate a retry on the model's unaided self-assessment.

**[FR-22]** When Can LLMs Actually Correct Their Own Mistakes? Kamoi et al. (2024), TACL. [arxiv.org/abs/2406.01297](https://arxiv.org/abs/2406.01297). A survey organizing the conflicting results by feedback source, finding success depends almost entirely on reliable external feedback. The single citation that frames the whole self-correction design space.

### 1.5 Retry and search-based recovery

**[FR-23]** ReAct: Synergizing Reasoning and Acting in Language Models, Yao et al. (2022), ICLR 2023. [arxiv.org/abs/2210.03629](https://arxiv.org/abs/2210.03629). Interleaves reasoning with actions so the model can observe a tool result, notice a problem, and adjust within the same loop. The base prompt-act-observe loop most agent recovery sits on.

**[FR-24]** Tree of Thoughts, Yao et al. (2023), NeurIPS. [arxiv.org/abs/2305.10601](https://arxiv.org/abs/2305.10601). Explores multiple reasoning paths, self-evaluates, and backtracks when a branch looks bad. The search-based view of recovery: keep alternatives and abandon a failing path instead of forcing it forward.

**[FR-25]** Plan-and-Solve Prompting, Wang et al. (2023), ACL. [arxiv.org/abs/2305.04091](https://arxiv.org/abs/2305.04091). Separates devising a plan from executing it, reducing missing-step and misunderstanding errors. An explicit plan gives the loop named steps to retry or roll back to, instead of restarting the whole task.

**[FR-26]** Training Verifiers to Solve Math Word Problems, Cobbe et al. (2021). [arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168). Generate many candidates and use a separate verifier to rank and select. The origin of verifier-gated selection: decide which retry to keep rather than trusting the first or the last.

### 1.6 Checkpoint, persistence, resume, and rollback

**[FR-27]** LangGraph Persistence (Checkpointers), LangChain documentation. [docs.langchain.com](https://docs.langchain.com/oss/python/langgraph/persistence). Saves a state snapshot at each step under a thread id, enabling fault tolerance, resume after interruption, and human-in-the-loop pauses without burning compute. A production reference for the checkpoint-and-resume contract a loop needs.

**[FR-28]** SAFEFLOW: A Principled Protocol for Transactional Autonomous Agent Systems, Li et al. (2025). [arxiv.org/abs/2506.07564](https://arxiv.org/abs/2506.07564). Borrows write-ahead logging and rollback from database recovery so irreversible effects can be undone after an error or policy violation. The cleanest citation for making tool actions transactional rather than fire-and-forget.

**[FR-29]** tau-bench: A Benchmark for Tool-Agent-User Interaction, Yao et al. (2024). [arxiv.org/abs/2406.12045](https://arxiv.org/abs/2406.12045). Scores agents by comparing the final database state to a goal state and adds pass^k to measure reliability across repeated trials. Frames recovery as end-state correctness and consistency, not single-shot success.

## Part 2: Multi-agent loops

More agents is not automatically better. The modern frameworks show what cooperation can buy (breadth, cross-checking, typed handoffs), the failure studies show what it costs (every agent boundary is a new way to break), and forty years of distributed AI already worked out the coordination problems that LLM teams keep rediscovering.

### 2.1 Frameworks and systems

**[MA-1]** AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation, Wu et al. (2023). [arxiv.org/abs/2308.08155](https://arxiv.org/abs/2308.08155). Conversable agents (mixing models, tools, and humans) solve tasks through configurable conversation patterns. A foundational reference for the message-passing and turn-taking layer of a cooperating-agent loop.

**[MA-2]** CAMEL: Communicative Agents for Mind Exploration, Li et al. (2023). [arxiv.org/abs/2303.17760](https://arxiv.org/abs/2303.17760). Role-playing with inception prompting so two agents cooperate with little human steering, and an early look at failure tendencies like role flipping and drift. Relevant to any loop that relies on stable role boundaries.

**[MA-3]** MetaGPT: Meta Programming for a Multi-Agent Collaborative Framework, Hong et al. (2024), ICLR. [arxiv.org/abs/2308.00352](https://arxiv.org/abs/2308.00352). Encodes standard operating procedures into roles so a team produces structured artifacts instead of free-form chat, reducing cascading hallucination. A model for typed handoffs and verifiable intermediate outputs.

**[MA-4]** ChatDev: Communicative Agents for Software Development, Qian et al. (2024), ACL. [arxiv.org/abs/2307.07924](https://arxiv.org/abs/2307.07924). Specialized agents along a design-code-test waterfall, with a chat chain controlling what they discuss and a dehallucination step controlling how. Shows the promise and the cost of staged role-based pipelines.

**[MA-5]** AgentVerse: Facilitating Multi-Agent Collaboration, Chen et al. (2024), ICLR. [arxiv.org/abs/2308.10848](https://arxiv.org/abs/2308.10848). Assembles and orchestrates expert groups and studies the social behaviors, helpful and harmful, that emerge. Relevant when a loop dynamically recruits agents and you must manage group-level behavior.

**[MA-6]** LangGraph Multi-agent, LangChain documentation. [docs.langchain.com](https://docs.langchain.com/oss/python/langchain/multi-agent). Graph-based orchestration with supervisor, swarm, and hierarchical architectures, explicit handoffs, and shared state. A practical reference for the control-flow plumbing a real loop needs.

**[MA-7]** CrewAI, CrewAI documentation. [docs.crewai.com](https://docs.crewai.com/en/introduction). Role-goal-backstory agents grouped into crews and sequenced by flows, with guidance on autonomous crews versus structured flows. A reference for how teams package orchestrator-and-worker setups today.

### 2.2 Collaboration and debate patterns

**[MA-8]** Improving Factuality and Reasoning through Multiagent Debate, Du et al. (2023), ICML 2024. [arxiv.org/abs/2305.14325](https://arxiv.org/abs/2305.14325). Multiple model instances propose, critique, and revise across rounds toward consensus, improving reasoning and factual accuracy. The canonical reference for debate as a verification-and-correction loop, with its compute cost stated.

**[MA-9]** Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena, Zheng et al. (2023), NeurIPS. [arxiv.org/abs/2306.05685](https://arxiv.org/abs/2306.05685). Studies using a strong model to evaluate others and documents position, verbosity, and self-enhancement biases. Essential before you put a reviewer or judge agent inside a loop, because those biases corrupt automated critique.

**[MA-10]** Mixture-of-Agents Enhances Large Language Model Capabilities, Wang et al. (2024). [arxiv.org/abs/2406.04692](https://arxiv.org/abs/2406.04692). Layers proposer and aggregator models so each layer refines the last, beating strong single models. A clean instance of aggregate-and-refine, useful for reasoning about the latency and cost of stacking layers.

**[MA-11]** Generative Agents: Interactive Simulacra of Human Behavior, Park et al. (2023), UIST. [arxiv.org/abs/2304.03442](https://arxiv.org/abs/2304.03442). Many agents with an observation-planning-reflection memory architecture show believable emergent behavior. The lasting contribution for loop builders is the memory-and-reflection design that keeps long-running agents coherent.

### 2.3 Surveys

**[MA-12]** LLM-based Multi-Agents: A Survey of Progress and Challenges, Guo et al. (2024), IJCAI. [arxiv.org/abs/2402.01680](https://arxiv.org/abs/2402.01680). Covers agent profiling, communication, capability growth, environments, and open challenges. A single map of the design space and vocabulary before committing to one architecture.

### 2.4 Failure modes and evaluation

**[MA-13]** Why Do Multi-Agent LLM Systems Fail? Cemri et al. (2025), UC Berkeley. [arxiv.org/abs/2503.13657](https://arxiv.org/abs/2503.13657). Builds MAST, a 14-mode failure taxonomy in three categories (specification design, inter-agent misalignment, task verification) from 1600-plus annotated traces across seven frameworks. The most grounded account of where these systems break, and it points repeatedly at weak verification.

**[MA-14]** Single-agent or Multi-agent Systems? Why Not Both? Gao et al. (2025). [arxiv.org/abs/2505.18286](https://arxiv.org/abs/2505.18286). Finds the multi-agent advantage shrinks as base models get stronger, then proposes a hybrid that routes between them. A corrective to the assumption that more agents is always better.

### 2.5 Classical coordination protocols

**[MA-15]** The Contract Net Protocol, Reid G. Smith (1980), IEEE Transactions on Computers. [reidgsmith.com](https://www.reidgsmith.com/The_Contract_Net_Protocol_Dec-1980.pdf). Task allocation by negotiation: a manager announces a task, candidates bid, the manager awards a contract. The canonical pattern for dynamic delegation, with the cost named: the overhead of announce-bid-award rounds.

**[MA-16]** The Hearsay-II Speech-Understanding System, Erman et al. (1980), ACM Computing Surveys. [mas.cs.umass.edu](https://mas.cs.umass.edu/Documents/Erman_Hearsay80.pdf). The seminal blackboard architecture, where independent knowledge sources read and write a shared workspace instead of messaging directly. The ancestor of shared-context and shared-memory designs in agent frameworks.

**[MA-17]** BDI Agents: From Theory to Practice, Rao and Georgeff (1995), ICMAS. [aaai.org](https://aaai.org/papers/icmas95-042-bdi-agents-from-theory-to-practice/). Connects belief-desire-intention theory to a workable architecture. The lesson for a loop: track beliefs, goals, and committed plans, and reconsider intentions deliberately rather than on every observation, which avoids thrashing.

**[MA-18]** FIPA ACL Message Structure and Communicative Act Library, FIPA (2002, inherited by IEEE 2005). [fipa.org](http://www.fipa.org/repository/aclspecs.html). A standard agent communication language built on typed performatives (inform, request, propose, accept, refuse) each with defined preconditions. The case for giving inter-agent messages explicit, typed intent rather than free-form text. (Standard and IEEE adoption confirmed; the spec-index page returned a tracking-only response to automated fetches, so the live URL render is UNVERIFIED.)

### 2.6 Foundational texts

**[MA-19]** An Introduction to MultiAgent Systems (2nd ed.), Michael Wooldridge (2009), Wiley. [cs.ox.ac.uk](https://www.cs.ox.ac.uk/people/michael.wooldridge/pubs/imas/IMAS2e.html). The standard textbook covering architectures, communication, cooperation, negotiation, and coalition formation. The best single entry point to the vocabulary before reading the primary papers.

**[MA-20]** Multiagent Systems: Algorithmic, Game-Theoretic, and Logical Foundations, Shoham and Leyton-Brown (2009), Cambridge. [cambridge.org](https://www.cambridge.org/9780521899437). Grounds multi-agent systems in game theory, mechanism design, and social choice. The formal results that stop naive voting or aggregation schemes from being gamed when agents have differing objectives. (Free full text exists at masfoundations.org.)

### 2.7 Teamwork and task allocation

**[MA-21]** Controlling Cooperative Problem Solving Using Joint Intentions, Jennings (1995), Artificial Intelligence. [eprints.soton.ac.uk](https://eprints.soton.ac.uk/252187/). Argues durable cooperation needs an explicit model of joint commitment, demonstrated in a deployed industrial system. A team needs a shared goal and an agreement on when to abandon or recommit, or agents drift apart.

**[MA-22]** Intention Is Choice with Commitment, Cohen and Levesque (1990), Artificial Intelligence. [dl.acm.org](https://dl.acm.org/doi/10.1016/0004-3702(90)90055-5). Formalizes intention as a goal plus a persistent commitment held until achieved, believed impossible, or believed irrelevant. An implementable rule for commitment management instead of giving up at the first obstacle.

**[MA-23]** Towards Flexible Teamwork, Tambe (1997), JAIR. [jair.org](https://jair.org/index.php/jair/article/view/10193). STEAM: team members hold a hierarchy of joint commitments, monitor each other, reorganize when a member fails, and communicate selectively by expected benefit. Directly usable lessons: reallocate work on failure, and do not broadcast everything.

### 2.8 Distributed consensus and reliability

**[MA-24]** The Byzantine Generals Problem, Lamport, Shostak, Pease (1982), ACM TOPLAS. [lamport.azurewebsites.net](https://lamport.azurewebsites.net/pubs/byz.pdf). Agreement with faulty or malicious participants requires more than two-thirds honest. The reason you cannot blindly trust one agent: robust collective decisions need redundancy and a quorum, with hard limits on tolerable bad actors.

**[MA-25]** In Search of an Understandable Consensus Algorithm (Raft), Ongaro and Ousterhout (2014), USENIX ATC. [usenix.org](https://www.usenix.org/system/files/conference/atc14/atc14-paper-ongaro.pdf). Consensus decomposed into leader election, log replication, and safety. The transferable ideas: elect one coordinator at a time to avoid conflicting decisions, and keep an ordered shared log to recover from.

### 2.9 Coordination without direct communication

**[MA-26]** Stigmergy as a Universal Coordination Mechanism, Francis Heylighen (2016), Cognitive Systems Research. [pespmc1.vub.ac.be](https://pespmc1.vub.ac.be/Papers/Stigmergy-Springer.pdf). Agents coordinate indirectly by leaving traces in a shared environment that trigger the next action, with no direct messaging. A well-structured shared workspace can carry the coordination signal itself, a low-overhead alternative to chatty protocols.

## Part 3: World models and simulation

**[WM-1]** Qwen-AgentWorld: Language World Models for General Agents, Zuo et al. (2026), Qwen team. [arxiv.org/abs/2606.24597](https://arxiv.org/abs/2606.24597). Trains language world models (reported at 35B and 397B parameters) on more than 10 million trajectories across 7 domains via continued pretraining, supervised fine-tuning, and reinforcement learning, and reports that using the world model as warm-up improved downstream agent performance and exceeded real-environment training on their benchmark. A marker that simulating the environment is becoming part of building capable agents, and a way to preview an action's consequence before a loop commits to it. (Authors' reported results on their own benchmark.)

## What the evidence says: failure recovery

- Make every step durable and replayable. Log each decision, tool call, and result to an append-only history [FR-1] [FR-2] [FR-3] so a crashed run resumes at the step it died on, and keep the model's non-determinism out of the replayable control flow.
- Make actions idempotent before you make them retryable [FR-9] [FR-12]. You get at-least-once execution in practice, so a retry after a crash must not double-execute a side effect.
- Retry with bounded backoff, jitter, timeouts, and a circuit breaker [FR-10] [FR-11] [FR-16], or a retry storm turns a blip into a cascading failure [FR-14].
- Gate every retry on an external verifier, not the model's own opinion. Unaided self-correction can degrade quality [FR-21] [FR-22]; grounded checks and verifier-gated selection work [FR-20] [FR-26].
- Bound retries and quarantine poison runs [FR-13]. Cap attempts and route a stuck run to a human instead of looping forever.
- Plan rollback as compensation, not two-phase commit [FR-7] [FR-8] [FR-28]. Model multi-step actions as a saga where each step has a compensating action, and judge recovery on end-state correctness [FR-29].
- Checkpoint to durable storage and resume from the last good state [FR-27], and keep alternatives so you can backtrack to a named earlier step instead of restarting [FR-24] [FR-25].

## What the evidence says: multi-agent loops

- Add agents only when structure or redundancy buys something a single pass cannot: parallel breadth [MA-10], independent cross-checking [MA-8], or typed phase handoffs [MA-3] [MA-4]. As base models strengthen, the multi-agent advantage shrinks [MA-14].
- Every agent boundary is a new failure surface. Failures cluster in specification, inter-agent misalignment, and weak verification [MA-13], with drift and role flipping visible since the earliest role-play systems [MA-2].
- Structure beats free-form chat for reliability. The frameworks that cut cascading hallucination do it by constraining what agents exchange and forcing verifiable artifacts [MA-3] [MA-6].
- An evaluator or reviewer agent needs its own guardrails. LLM-as-judge carries position, verbosity, and self-enhancement biases [MA-9], so a reviewer can launder bad output into approval unless you control for them.
- Make intent explicit and typed. A small, defined message vocabulary [MA-15] [MA-18] makes agent conversations parseable and auditable.
- Manage commitment deliberately [MA-17] [MA-21] [MA-22], coordinate through shared state when you can [MA-16] [MA-26], communicate selectively and reallocate on failure [MA-23].
- Do not trust a single agent for a critical decision. Redundancy, quorum voting, one elected coordinator at a time, and a consistent shared log all carry over from distributed systems [MA-24] [MA-25].

For how human oversight fits on top of all this, see the [LoopRails framework](framework.html) and the main [research codex](codex.html).
