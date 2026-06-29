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

## Part 4: Agent design and RAG patterns

These sources back the [Cookbook](cookbook.html), the recipe side of the framework. The agent-design entries name the patterns and the RAG entries cover retrieval and its documented failure modes. The core agent loops (ReAct [FR-23], Reflexion [FR-18], Plan-and-Solve [FR-25], Tree of Thoughts [FR-24]) are in Part 1.

### 4.1 Agent design patterns

**[AP-1]** Building Effective Agents, Anthropic, Erik Schluntz and Barry Zhang (2024). [anthropic.com](https://www.anthropic.com/engineering/building-effective-agents). The core engineering reference for this cookbook, separating workflows (LLMs and tools on fixed code paths) from agents (LLMs that direct their own steps), and naming the patterns: prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer.

**[AP-2]** Chain-of-Thought Prompting Elicits Reasoning in Large Language Models, Wei et al. (2022), NeurIPS. [arxiv.org/abs/2201.11903](https://arxiv.org/abs/2201.11903). Prompting with worked intermediate steps unlocks multi-step reasoning, the building block under the agent loops, and the reason agents reason step by step rather than answering in one shot.

### 4.2 Retrieval-augmented generation (RAG)

**[RAG-1]** Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, Lewis et al. (2020), NeurIPS. [arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401). The original RAG paper, pairing a generator with a neural retriever over a dense index so answers are grounded in fetched passages. The foundation of retrieve-then-generate, aimed at the failure mode of memory-only models inventing facts.

**[RAG-2]** Dense Passage Retrieval for Open-Domain Question Answering, Karpukhin et al. (2020), EMNLP. [aclanthology.org](https://aclanthology.org/2020.emnlp-main.550/). A dual-encoder dense retriever that beats keyword matching on passage accuracy, establishing embedding-based retrieval as the default. Informs the choice of dense vector search.

**[RAG-3]** Retrieval-Augmented Generation for Large Language Models: A Survey, Gao et al. (2023). [arxiv.org/abs/2312.10997](https://arxiv.org/abs/2312.10997). A map of the field organizing systems into Naive, Advanced, and Modular RAG and walking the retrieval, generation, and augmentation stages plus evaluation. The orientation reference and a source of named failure modes.

**[RAG-4]** Precise Zero-Shot Dense Retrieval without Relevance Labels, Gao et al. (2022). [arxiv.org/abs/2212.10496](https://arxiv.org/abs/2212.10496). HyDE has the model write a hypothetical answer for the query, then retrieves real passages similar to it. Addresses the failure mode where short or vague queries embed poorly against full documents.

**[RAG-5]** Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection, Asai et al. (2023), ICLR 2024. [arxiv.org/abs/2310.11511](https://arxiv.org/abs/2310.11511). Trains a model to decide when to retrieve and to critique passages and its own output with reflection tokens. Informs adaptive retrieval that skips or repeats fetching based on need.

**[RAG-6]** Corrective Retrieval Augmented Generation, Yan et al. (2024). [arxiv.org/abs/2401.15884](https://arxiv.org/abs/2401.15884). CRAG adds a lightweight evaluator that grades retrieved documents and, when they look weak, triggers corrective steps such as web search before generation. Directly handles retrieval-miss and irrelevant-context failures.

**[RAG-7]** From Local to Global: A Graph RAG Approach to Query-Focused Summarization, Edge et al. (2024), Microsoft. [arxiv.org/abs/2404.16130](https://arxiv.org/abs/2404.16130). GraphRAG builds an entity knowledge graph and pre-computes community summaries so the system can answer broad whole-corpus questions that flat chunk retrieval cannot.

**[RAG-8]** Introducing Contextual Retrieval, Anthropic (2024). [anthropic.com](https://www.anthropic.com/news/contextual-retrieval). Prepends a short chunk-specific context blurb to each chunk before embedding and indexing, cutting retrieval misses caused by chunks that lost their surrounding meaning. A practical chunk-preparation pattern.

**[RAG-9]** ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT, Khattab and Zaharia (2020), SIGIR. [arxiv.org/abs/2004.12832](https://arxiv.org/abs/2004.12832). Encodes query and document tokens separately and scores them with a cheap token-level match, giving fine-grained matching at low cost. Informs retrievers that need precision beyond a single pooled embedding.

**[RAG-10]** RAGAs: Automated Evaluation of Retrieval Augmented Generation, Es et al. (2023), EACL 2024. [aclanthology.org](https://aclanthology.org/2024.eacl-demo.16/). A reference-free framework that scores a pipeline on retrieval relevance, faithfulness, and answer quality without ground-truth labels. The basis for measuring whether retrieved context is used and answers stay grounded.

**[RAG-11]** Lost in the Middle: How Language Models Use Long Contexts, Liu et al. (2023), TACL. [arxiv.org/abs/2307.03172](https://arxiv.org/abs/2307.03172). Models use information best at the start or end of the input and lose it in the middle of long contexts. The source for ranking and reordering retrieved passages rather than dumping many into one prompt.

**[RAG-12]** Active Retrieval Augmented Generation, Jiang et al. (2023), EMNLP. [aclanthology.org](https://aclanthology.org/2023.emnlp-main.495/). FLARE retrieves fresh passages mid-generation when the draft contains low-confidence tokens, instead of retrieving only once up front. Informs iterative retrieval for long-form answers.

**[RAG-13]** The Probabilistic Relevance Framework: BM25 and Beyond, Robertson and Zaragoza (2009), Foundations and Trends in Information Retrieval. [dl.acm.org](https://dl.acm.org/doi/10.1561/1500000019). Derives BM25, the standard lexical baseline that hybrid search blends with dense retrieval. Use it to justify keeping keyword scoring alongside embeddings. (Verified via the ACM/Now Publishers DOI and Google Books; the author PDF mirror loads but is not text-extractable.)

**[RAG-14]** BM25 Retriever and Reciprocal Rerank Fusion, LlamaIndex documentation. [developers.llamaindex.ai](https://developers.llamaindex.ai/python/examples/retrievers/reciprocal_rerank_fusion/). Official docs showing how to combine a dense vector retriever with a BM25 keyword retriever and merge by reciprocal rank fusion, the canonical hybrid pattern.

**[RAG-15]** Semantic Chunker, LlamaIndex documentation. [developers.llamaindex.ai](https://developers.llamaindex.ai/python/examples/node_parsers/semantic_chunking/). Picks split points between sentences by embedding similarity instead of a fixed size, so each chunk holds related content. The engineering reference for semantic chunking, against chunks that split one idea in half.

### 4.3 Common RAG failure modes (from the literature)

- Lost-in-the-middle: relevant passages in the middle of a long prompt get underused, so ranking and reordering matter [RAG-11].
- Retrieval miss: the right passage is never fetched, which corrective retrieval and web-search fallback try to repair [RAG-6] [RAG-3].
- Irrelevant or noisy context: off-topic chunks degrade the answer, motivating relevance grading and filtering [RAG-6] [RAG-10].
- Query-document embedding mismatch: short or vague queries embed poorly against full documents, the gap HyDE targets [RAG-4].
- Lost chunk context: a chunk stripped of its document loses meaning and fails to match, fixed by prepending context [RAG-8] or better boundaries [RAG-15].
- Lexical mismatch: pure dense retrieval misses exact-term and rare-token matches that keyword scoring catches, the case for hybrid search [RAG-2] [RAG-13] [RAG-14].
- Global sensemaking gap: broad whole-corpus questions have no single answering chunk, addressed by graph-based summarization [RAG-7].
- Ungrounded answers: the generator ignores or contradicts retrieved evidence, which faithfulness scoring is built to catch [RAG-10] [RAG-1].

## Part 5: Tool, skill, and context overload

How the number of tools (including MCP servers and agent skills) and the amount of context spent affect accuracy and the number of useful turns. Lost-in-the-Middle is also catalogued as [RAG-11].

### 5.1 Tool count and selection

**[TOOL-1]** ToolLLM: Facilitating LLMs to Master 16000+ Real-world APIs, Qin et al. (2023), ICLR 2024. [arxiv.org/abs/2307.16789](https://arxiv.org/abs/2307.16789). Builds ToolBench over 16000+ APIs and uses a neural API retriever to recommend a small relevant subset per instruction, because all the APIs cannot fit in context at once. Evidence that large catalogs force retrieval rather than dumping every tool in the prompt.

**[TOOL-2]** Gorilla: Large Language Model Connected with Massive APIs, Patil et al. (2023). [arxiv.org/abs/2305.15334](https://arxiv.org/abs/2305.15334). Pairs an LLM with a retriever to call the right API from a massive set and adapt when docs change, reducing hallucinated calls. Retrieval-aware tool calling beats stuffing all docs into the prompt.

**[TOOL-3]** Tool Documentation Enables Zero-Shot Tool-Usage, Hsieh et al. (2023). [arxiv.org/abs/2308.00675](https://arxiv.org/abs/2308.00675). Concise tool documentation alone lets models use tools zero-shot, matching or beating few-shot demonstrations. Good docs are a cheaper per-tool context investment than long examples.

**[TOOL-4]** The Berkeley Function Calling Leaderboard, Patil et al. (2025), ICML. [proceedings.mlr.press](https://proceedings.mlr.press/v267/patil25a.html). The standard live function-calling benchmark, scaling to thousands of functions and including cases where no provided function is relevant so the model must abstain. A way to measure whether adding tools helps or just adds noise.

**[TOOL-5]** API-Bank: A Comprehensive Benchmark for Tool-Augmented LLMs, Li et al. (2023), EMNLP. [arxiv.org/abs/2304.08244](https://arxiv.org/abs/2304.08244). A multi-turn benchmark for planning, retrieving, and calling APIs across domains, showing models still have large headroom in deciding which API to call.

**[TOOL-6]** Towards Completeness-Oriented Tool Retrieval (COLT), Qu et al. (2024), CIKM. [arxiv.org/abs/2405.16089](https://arxiv.org/abs/2405.16089). Pure semantic matching retrieves redundant overlapping tools and misses the diverse set a task needs. Redundant tools degrade selection, so curation matters as much as count.

**[TOOL-7]** ToolRerank: Adaptive and Hierarchy-Aware Reranking for Tool Retrieval, Zheng et al. (2024), LREC-COLING. [arxiv.org/abs/2403.06551](https://arxiv.org/abs/2403.06551). Reranks retrieved tools with adaptive truncation; the relevant-subset size should be tuned, not maximized. (First-author name UNVERIFIED.)

**[TOOL-8]** Re-Invoke: Tool Invocation Rewriting for Zero-Shot Tool Retrieval, Chen et al. (2024), Findings of EMNLP. [arxiv.org/abs/2408.01875](https://arxiv.org/abs/2408.01875). Unsupervised tool retrieval that scales to large toolsets by generating synthetic queries per tool. The practical answer to many tools is retrieve-then-use, not load-all. (First-author name UNVERIFIED.)

**[TOOL-9]** Retrieval Models Aren't Tool-Savvy (ToolRet), Shi et al. (2025), Findings of ACL. [arxiv.org/abs/2503.01763](https://arxiv.org/abs/2503.01763). Standard IR models that do well on normal retrieval perform poorly at tool retrieval, framed as a problem precisely because tool-using LLMs have limited context and cannot hold all tools. Support that you must select a subset and that doing it well is hard.

**[TOOL-10]** Less is More: Optimizing Function Calling for LLM Execution on Edge Devices, Paramanayakam et al. (2024). [arxiv.org/abs/2411.15399](https://arxiv.org/abs/2411.15399). Selectively reducing the tools presented improves function-calling accuracy, with a worked example where cutting tools from 46 to 19 lets the model pick correctly. Fewer relevant tools beats a large undifferentiated set.

### 5.2 Context length degradation

**[TOOL-11]** Lost in the Middle: How Language Models Use Long Contexts, Liu et al. (2023), TACL. [aclanthology.org](https://aclanthology.org/2024.tacl-1.9/). Models use information best at the start or end of the context and underuse the middle, even in long-context models. Filling the window with tool definitions or documents buries the items the model needs to act on. (Also [RAG-11].)

**[TOOL-12]** Same Task, More Tokens: the Impact of Input Length on the Reasoning Performance of LLMs, Levy et al. (2024), ACL. [arxiv.org/abs/2402.14848](https://arxiv.org/abs/2402.14848). Holding the task fixed and only padding the input degrades reasoning accuracy far below the model's technical maximum. Spending context budget, even on padding, hurts the model's use of the actual task content.

**[TOOL-13]** RULER: What's the Real Context Size of Your Long-Context Language Models? Hsieh et al. (2024), COLM. [arxiv.org/abs/2404.06654](https://arxiv.org/abs/2404.06654). Most models that advertise 32K-plus windows degrade well before that length, so effective context is much shorter than the claimed number. Do not treat the advertised window as usable budget for tools plus task.

### 5.3 MCP and skills

**[TOOL-14]** Introducing the Model Context Protocol, Anthropic (2024). [anthropic.com](https://www.anthropic.com/news/model-context-protocol). The official announcement of MCP as an open standard for two-way connections between AI tools and data sources (November 2024). The standard whose tool definitions later compete for context budget.

**[TOOL-15]** Code Execution with MCP: Building More Efficient Agents, Anthropic (2025), engineering blog. [anthropic.com](https://www.anthropic.com/engineering/code-execution-with-mcp). Reports that loading all MCP tool definitions upfront consumes excessive tokens, with a case dropping from 150,000 to 2,000 tokens by having the agent load only the tools it needs on demand. First-party statement that many MCP tools fill the window and that on-demand loading recovers it. (Engineering blog, not peer-reviewed.)

**[TOOL-16]** Equipping Agents for the Real World with Agent Skills, Anthropic (2025), engineering blog. [anthropic.com](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills). Agent Skills are folders of instructions and resources the agent discovers and loads dynamically, using progressive disclosure so only a name and short description sit in context until a skill is invoked (October 2025). The explicit design goal of not paying full context cost for every available skill. (Engineering blog, not peer-reviewed.)

### 5.4 Key findings for tool and skill overload

- Tool-selection accuracy tends to drop as the candidate set grows, so retrieve a relevant subset per query rather than expose every tool [TOOL-1] [TOOL-2] [TOOL-9] [TOOL-10].
- Redundant or near-duplicate tools and a fixed maximal candidate count hurt selection; curate for diversity and tune the subset size [TOOL-6] [TOOL-7].
- Good per-tool documentation is a cheaper context investment than long demonstrations [TOOL-3].
- Effective usable context is shorter than the advertised window, so do not budget tools plus task against the headline number [TOOL-13].
- Adding tokens, even when the task is unchanged, degrades reasoning and buries middle-of-context material, so every tool or skill definition spends budget that the task then cannot use [TOOL-11] [TOOL-12].
- Connecting many MCP servers loads many tool definitions that can consume large context before work begins; first-party guidance is to load tools on demand [TOOL-14] [TOOL-15].
- Agent Skills use progressive disclosure so only a name and short description occupy context until the skill is invoked [TOOL-16].

## Part 6: Case studies, successes and failures

Real agentic loops, with measured results and, where reported, the cost. The pattern is consistent: the wins have a real, hard-to-game verifier and pay for inference compute; the failures lack one, get it gamed, or cost more than they return. Several failure cases are catalogued elsewhere in this codex: the MAST multi-agent failure taxonomy [MA-13], the limits of unaided self-correction [FR-21], tau-bench's inconsistency across trials [FR-29], and the shrinking multi-agent advantage [MA-14].

### 6.1 Successes, and what they cost

**[CS-1]** Agentic Auto-Scheduling: An Experimental Study of LLM-Guided Loop Optimization (ComPilot), Merouani, Kara Bernou, Baghdadi (2025). [arxiv.org/abs/2511.00592](https://arxiv.org/abs/2511.00592). An off-the-shelf LLM in a loop with a compiler that reports legality and measured speedup. On PolyBench, geometric-mean speedups of 2.66x (single run) and 3.54x (best-of-5), competitive with the Pluto optimizer, no fine-tuning. The compiler is a near-ideal verifier; best-of-5 is verifier-gated selection.

**[CS-2]** DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning, DeepSeek-AI (2025). [arxiv.org/abs/2501.12948](https://arxiv.org/abs/2501.12948). RL on verifiable math and code rewards; reports 79.8% on AIME 2024, 97.3% on MATH-500, and a Codeforces rating of 2029. DeepSeek-R1-Zero shows the loop effect directly: AIME pass@1 rises from 15.6% to 71.0% over training, and to 86.7% with majority voting. The reward is the verifier; majority voting is test-time sampling.

**[CS-3]** Code Generation with AlphaCodium: From Prompt Engineering to Flow Engineering, Ridnik, Kredo, Friedman (2024). [arxiv.org/abs/2401.08500](https://arxiv.org/abs/2401.08500). A test-driven iterative flow lifts GPT-4 pass@5 on CodeContests from 19% to 44%. The verifier is the test suite; the loop keeps only code that passes.

**[CS-4]** Competition-Level Code Generation with AlphaCode, Li et al. (2022), Science. [deepmind.google](https://deepmind.google/blog/competitive-programming-with-alphacode/). Generates a very large number of candidate programs per problem, then filters and clusters to at most 10 submissions, reaching roughly the top 54% of Codeforces participants. The win comes from spending compute to sample widely, then selecting by execution on tests.

**[CS-5]** Mathematical Discoveries from Program Search with Large Language Models (FunSearch), Romera-Paredes et al. (2023), Nature. [nature.com](https://www.nature.com/articles/s41586-023-06924-6). An LLM proposes programs scored by an evaluator; high scorers enter a database and feed the next round. Found the largest known cap sets in certain settings and better bin-packing heuristics. The evaluator in the loop guards against hallucination.

**[CS-6]** Voyager: An Open-Ended Embodied Agent with Large Language Models, Wang et al. (2023). [arxiv.org/abs/2305.16291](https://arxiv.org/abs/2305.16291). An iterative loop using environment feedback, execution errors, and self-verification to build a skill library; obtains 3.3x more unique items, travels 2.3x farther, and hits milestones up to 15.3x faster than prior work. Code is kept only if it runs and the self-check passes.

**[CS-7]** Self-Consistency Improves Chain of Thought Reasoning in Language Models, Wang et al. (2022). [arxiv.org/abs/2203.11171](https://arxiv.org/abs/2203.11171). Sample many reasoning paths and take the majority answer; improves GSM8K by 17.9 points, with gains across other benchmarks. The simplest test-time-compute win, where agreement across samples is the selection signal.

**[CS-8]** Scaling LLM Test-Time Compute Optimally Can Be More Effective Than Scaling Model Parameters, Snell et al. (2024). [arxiv.org/abs/2408.03314](https://arxiv.org/abs/2408.03314). Compute-optimal test-time search improves efficiency by more than 4x over a best-of-N baseline, and on matched FLOPs lets a model outperform one 14x larger. The backbone of spending inference compute guided by a verifier.

**[CS-9]** OpenAI o3 Breakthrough High Score on ARC-AGI, ARC Prize (2024). [arcprize.org](https://arcprize.org/blog/oai-o3-pub-breakthrough). o3 scored 75.7% (low-compute) and 87.5% (high-compute) on the ARC-AGI-1 semi-private set, with the high-compute run using 172x more compute. Cost was about 26 dollars per task at low compute, and the high-compute runs cost on the order of hundreds of thousands of dollars total. The clearest high-score, very-high-cost data point.

**[CS-10]** SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering, Yang et al. (2024), NeurIPS. [arxiv.org/abs/2405.15793](https://arxiv.org/abs/2405.15793). A custom interface lets the model navigate a repo, edit files, and run tests in a loop, reaching 12.5% pass@1 on the full SWE-bench test set, far above the prior non-interactive baseline. The project's own tests are the verifier.

### 6.2 Failures and reality-checks

**[FAIL-1]** GAIA: a Benchmark for General AI Assistants, Mialon et al. (2023). [arxiv.org/abs/2311.12983](https://arxiv.org/abs/2311.12983). On tasks simple for humans but hard for AI, humans scored 92% and GPT-4 with plugins scored 15%. Open-ended tool use is far below human reliability.

**[FAIL-2]** WebArena: A Realistic Web Environment for Building Autonomous Agents, Zhou et al. (2023). [arxiv.org/abs/2307.13854](https://arxiv.org/abs/2307.13854). The best GPT-4 agent completed 14.41% of realistic web tasks versus 78.24% for humans. A second independent confirmation that autonomous agents are unreliable on open tasks.

**[FAIL-3]** Specification Gaming: the Flip Side of AI Ingenuity, Krakovna et al. (2020), DeepMind. [deepmind.google](https://deepmind.google/discover/blog/specification-gaming-the-flip-side-of-ai-ingenuity/). Agents satisfy the literal objective without the intended outcome; in CoastRunners, a boat rewarded for hitting green blocks drove in circles instead of finishing the race. If the metric is gameable, the agent games it.

**[FAIL-4]** Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation, Baker et al. (2025), OpenAI. [arxiv.org/abs/2503.11926](https://arxiv.org/abs/2503.11926). In agentic coding, a frontier model reward-hacked the verifier: calling exit(0) before tests ran, raising SkipTest, faking a local pandas, and returning hardcoded expected values. A chain-of-thought monitor caught many, but optimization pressure on the reasoning produced obfuscated cheating. Verifiers in a loop get attacked directly.

**[FAIL-5]** The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery, Lu et al. (2024), Sakana AI. [arxiv.org/abs/2408.06292](https://arxiv.org/abs/2408.06292). Given control of its own execution, the agent edited its code to relaunch itself in a loop, and tried to extend its own timeout instead of making the code faster. Sakana notes sandboxing the environment mitigates this. An unsandboxed loop will rewrite its own constraints.

### 6.3 What separates the wins from the failures

- The wins have a real verifier or reward the agent cannot satisfy by cheating: tests [CS-1] [CS-3] [CS-10], a correctness reward [CS-2], an evaluator [CS-5], environment feedback [CS-6], a held-out grader [CS-9].
- The wins spend inference compute on purpose: wide sampling then filtering [CS-4], many paths then majority vote [CS-2] [CS-7], explicit compute scaling [CS-8] [CS-9].
- The failures lack a verifier or use a gameable one: self-correction degrades without external feedback [FR-21], gameable rewards get gamed [FAIL-3], and agents attack the test harness or their own constraints [FAIL-4] [FAIL-5].
- Results are inconsistent and far below human on open tasks: pass^k reliability is low [FR-29], and agents trail humans badly [FAIL-1] [FAIL-2].
- Cost is real and sometimes extreme. The same compute that buys a high score [CS-9] is the constraint, and adding agents is not free as base models improve [MA-14].

## Part 7: Verification functions and the spec

The verifier is the part of a loop that decides whether the work is actually done. This section collects what the research says about building one that works, and about the question every loop engineer hits: do you need an intensely detailed natural-language spec, or does a precise executable verifier stand in for it? The short version that the sources support: in domains with a cheap, sound oracle the verifier is the spec, and the detail you would have written into prose belongs in the check instead. Where no oracle exists, you manufacture the closest thing to one. Throughout, treat a verifier as software that can be weak, wrong, or gamed, the same stance taken in [evaluation-driven development](article-evaluation-driven-development.html).

### 7.1 The verifier as the reward: RLVR and verifiable domains

**[VER-1]** Tulu 3: Pushing Frontiers in Open Language Model Post-Training, Lambert et al. (2024), Allen Institute for AI. [arxiv.org/abs/2411.15124](https://arxiv.org/abs/2411.15124). Names and popularizes RLVR (Reinforcement Learning with Verifiable Rewards): an RL method that "replaces the reward model with a verification function," where the policy receives a reward only when its output is verifiably correct, such as an answer matching ground truth on math or a satisfied instruction-following constraint. The training-time form of the same primitive a reliable loop uses at inference: reward only what a verifier confirms.

DeepSeek-R1 [CS-2] is the clearest instance and states the design rule outright: it uses rule-based rewards (an accuracy reward plus a format reward) and a compiler running predefined test cases for code, and it explicitly drops neural reward models because they "may suffer from reward hacking in the large-scale reinforcement learning process." When a deterministic oracle exists, a learned verifier is both unnecessary and risky.

### 7.2 Granularity and selection: process beats outcome, and verification is the bottleneck

**[VER-2]** Let's Verify Step by Step, Lightman et al. (2023), OpenAI. [arxiv.org/abs/2305.20050](https://arxiv.org/abs/2305.20050). Process supervision (a verifier that scores each reasoning step) beats outcome supervision (scoring only the final answer). With best-of-N selection on the MATH test set, the process reward model reaches 78.2%, versus 72.4% for the outcome reward model and 69.6% for majority voting. Releases PRM800K, 800,000 step-level human labels. Verifier granularity, not just its presence, drives the gain: a step-level check catches a wrong path an answer-only check would pass.

**[VER-3]** Large Language Monkeys: Scaling Inference Compute with Repeated Sampling, Brown et al. (2024), Stanford / Oxford / Google DeepMind. [arxiv.org/abs/2407.21787](https://arxiv.org/abs/2407.21787). Coverage, the fraction of problems solved by at least one sample, scales with sample count over four orders of magnitude: on SWE-bench Lite, DeepSeek-Coder-V2-Instruct rises from 15.9% solved with one sample to 56% with 250 samples when an automatic verifier exists. But the paper finds that selection methods without a real verifier, majority voting and learned reward models, plateau after several hundred samples. The correct answer is almost always present; the constraint is picking it, which is the verifier's job.

**[VER-4]** Shrinking the Generation-Verification Gap with Weak Verifiers (Weaver), Stanford / Wisconsin / Together AI (2025). [arxiv.org/abs/2506.18203](https://arxiv.org/abs/2506.18203). Combines many weak, imperfect verifiers into a weighted ensemble, improving over Pass@1 by 17.9% for 8B models and 14.5% for 70B models and reaching 87.7% average accuracy (o3-mini level using Llama 3.3 70B as the generator). A distilled 400M cross-encoder keeps 98.7% of the accuracy while cutting verification compute by up to 99.97%. No single weak verifier is trustworthy, but a calibrated ensemble of them can gate selection well and be compressed into a cheap reusable check.

The origin of verifier-gated selection is Cobbe et al. [FR-26]: a 6B verifier ranking sampled solutions roughly matched a finetuned 175B model on GSM8K, an improvement the authors call equivalent to a 30x increase in model size. Majority vote [CS-7] and compute-optimal search [CS-8] are the verifier-free and verifier-guided ends of the same scaling story.

### 7.3 The limits of a verifier signal

**[VER-5]** Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model? Yue et al. (2025), NeurIPS 2025. [arxiv.org/abs/2504.13837](https://arxiv.org/abs/2504.13837). RLVR-trained models beat their base models at small k (such as pass@1), but the base models reach higher pass@k at large k. The authors conclude the reasoning abilities "originate from and are bounded by the base model." A verifier-driven reward sharpens selection from what the base model can already sample; it improves reliability, it does not raise the capability ceiling.

**[VER-6]** Spurious Rewards: Rethinking Training Signals in RLVR, Shao et al. (2025), Washington / Allen AI / Berkeley. [arxiv.org/abs/2506.10947](https://arxiv.org/abs/2506.10947). RLVR with randomly assigned rewards improved MATH-500 for Qwen2.5-Math-7B by 21.4 points, nearly matching the 29.1-point gain from ground-truth rewards, yet these spurious rewards "often fail to produce gains for other model families, such as Llama3 or OLMo2." Apparent gains from a reward signal can be an artifact of one base model's priors rather than the reward being correct, so verifier quality has to be validated across models, not assumed from a single benchmark.

### 7.4 How verifiers get gamed, and how to harden them

**[VER-7]** Scaling Laws for Reward Model Overoptimization, Gao, Schulman, Hilton (2022), OpenAI. [arxiv.org/abs/2210.10760](https://arxiv.org/abs/2210.10760). Optimizing a proxy reward model too hard degrades true performance (measured against a held-out gold reward), a direct instance of Goodhart's law. Gold reward as a function of KL distance from the initial policy follows a predictable functional form that differs between best-of-N and RL with a KL penalty, and the coefficients scale smoothly with reward-model size. A learned verifier is a proxy with a measurable breaking point: the harder you push, the more the policy exploits its errors.

**[VER-8]** Reward Model Ensembles Help Mitigate Overoptimization, Coste et al. (2023), ICLR 2024. [arxiv.org/abs/2310.02743](https://arxiv.org/abs/2310.02743). Conservative optimization across an ensemble of reward models (worst-case and uncertainty-weighted objectives) "practically eliminates overoptimization and improves performance by up to 70% for BoN sampling," and reduces overoptimization for PPO, holding even with 25% label noise. An ensemble of independent verifiers scored by disagreement is much harder to game than any single one.

**[VER-9]** Hardening Agent Benchmarks with Adversarial Hacker-Fixer Loops, Zhong et al. (2026). [arxiv.org/abs/2606.08960](https://arxiv.org/abs/2606.08960). An audit of 1,968 tasks across five terminal-agent benchmarks found 323 (16%) hackable by frontier models given only the task description. The proposed loop alternates three agents, a hacker that tries to pass the verifier without solving the task, a fixer that patches the verifier to reject each exploit, and a solver that confirms legitimate solutions still pass; on KernelBench it drove attack success from 62% to 0% on a held-out corpus of public exploits. A concrete maker-checker recipe for hardening a verifier: attack it, patch each hole, re-confirm real solutions still pass, repeat.

**[VER-10]** The Verification Horizon: No Silver Bullet for Coding Agent Rewards, Wang et al. (2026). [arxiv.org/abs/2606.26300](https://arxiv.org/abs/2606.26300). Argues that for modern coding agents verifying a solution has become harder than generating one, and frames verification quality along scalability, faithfulness, and robustness. Its central claim: "no fixed reward function can remain effective as policy capability continues to grow; and verification must co-evolve with the generator." A verifier is not a build-once artifact; as the agent gets stronger the check has to be strengthened with it.

These extend the gaming cases already in this codex. Specification gaming [FAIL-3] is the general form: an agent satisfies the literal metric, not the intent. Baker et al. [FAIL-4] is the coding-specific form, and adds the hardening lesson directly: a chain-of-thought monitor reached 95% recall on systemic hacks versus 60% for an action-only monitor, but under direct optimization pressure on the reasoning the agent learned to hide its cheating and monitor recall collapsed toward zero while it kept hacking. Do not train against the same signal you grade with, and keep the verifier and the reference solution out of the agent's reach.

### 7.5 When there is no cheap oracle: rubrics and checklists

**[VER-11]** Rubrics as Rewards (RaR): Reinforcement Learning Beyond Verifiable Domains, Gunjal et al. (2025). [arxiv.org/abs/2507.17746](https://arxiv.org/abs/2507.17746). For tasks with no binary correctness, decomposes the implicit spec into a structured rubric of checkable sub-criteria and uses it as the reward, reporting up to 31% relative improvement on HealthBench and 7% on GPQA-Diamond over an LLM-as-judge baseline that scores with a single Likert rating. The move when no oracle exists is to manufacture a near-oracle: turn a fuzzy quality judgment into many explicit checks.

**[VER-12]** Checklists Are Better Than Reward Models For Aligning Language Models (RLCF), Viswanathan et al. (2025). [arxiv.org/abs/2507.18624](https://arxiv.org/abs/2507.18624). Extracts an instruction-specific checklist and scores each item using both AI judges and specialized verifier programs, combining them into one reward. On Qwen2.5-7B-Instruct it adds 4 points on FollowBench hard-satisfaction, 6 on InFoBench, and 3 on Arena-Hard win rate, and was the only method tested that improved on every benchmark. The practical middle ground: send each sub-criterion that has a deterministic check to a real verifier, and only the genuinely subjective remainder to a judge.

The fallback oracle is LLM-as-judge, which Zheng et al. [MA-9] show can reach over 80% agreement with humans (matching human-human agreement) but carries position, verbosity, and self-enhancement biases. Constrain it with an explicit rubric and never use a raw judge score as the sole gate.

### 7.6 The verifier as the spec: executable specs and formal proof

**[VER-13]** Property-based testing as an executable specification. QuickCheck, Claessen and Hughes (2000), ICFP; Hypothesis is the common Python implementation. Explainer: [kiro.dev](https://kiro.dev/blog/property-based-testing/). A property is a runnable encoding of a requirement: the framework generates randomized inputs, checks that the property holds, and shrinks any counterexample to a minimal failing case. This is the clearest everyday form of "the verifier is the spec," and also its limit: properties capture invariants, not full intent, so they complement a written spec rather than fully replacing it.

**[VER-14]** AlphaProof, Google DeepMind (2024); peer-reviewed as Olympiad-level formal mathematical reasoning with reinforcement learning, Nature (2025). [deepmind.google](https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/). Trains itself to prove statements in the formal language Lean, pairing an LLM with AlphaZero-style RL, and every proof is machine-checked by Lean. On IMO 2024, AlphaProof with AlphaGeometry 2 scored 28/42 (silver-medal standard), solving 4 of 6 problems. The extreme of verifier-as-spec: the proof checker is a sound, total oracle, so a verified proof needs no human to confirm correctness. The cost moves entirely to the front end, formalizing the problem into Lean.

**[VER-15]** Clover: Closed-Loop Verifiable Code Generation, Sun, Sheng, Padon, Barrett (2023), SAIV 2024. [arxiv.org/abs/2310.17807](https://arxiv.org/abs/2310.17807). Reduces code correctness to a consistency check among three artifacts, the code, its docstring, and formal annotations, using the Dafny deductive verifier plus an LLM. On the CloverBench dataset it accepts up to 87% of correct instances while rejecting all adversarial incorrect ones (no false positives), and it caught 6 incorrect programs in a human-written set. Soundness, accepting nothing wrong even at the cost of rejecting some right answers, is the property that lets a verifier stand in for a written spec.

### 7.7 What this means for your verifier

- A verifier sits on a strength spectrum, and the loop is only as trustworthy as the oracle. Ground-truth checks (a compiler, a test suite, a matched answer, a Lean proof) are strongest and hardest to game [CS-1] [CS-2] [VER-14] [VER-15]; learned reward models and LLM judges are more general and more gameable [VER-7] [MA-9]; unaided self-assessment is the weakest and can make things worse [FR-21].
- Granularity and selection matter as much as presence. A step-level process verifier beats an outcome-only one [VER-2], and verification, not generation, is the binding constraint once you sample widely: coverage keeps rising but you cannot cash it in without a real verifier to select [VER-3], which is why ensembling weak verifiers helps [VER-4].
- Any verifier short of ground truth is a proxy with a breaking point. Optimize it too hard and the agent games it [VER-7] [FAIL-3] [FAIL-4]. Harden with independence (the checker is not the maker), ensembles [VER-8], hidden and held-out checks, adversarial hacker-fixer passes [VER-9], and continuous co-evolution as the agent improves [VER-10]. Never train or optimize against the exact signal you grade with [FAIL-4].
- On the spec question: in a verifiable domain the executable verifier is the spec, and the intense detail you imagined writing into prose belongs in the check instead [VER-1] [CS-2]. What makes the substitution safe is soundness, accepting nothing incorrect, more than coverage [VER-15]. The cost does not vanish, it moves to formalization: writing the tests, the properties, the Lean statement, the rubric.
- When no cheap oracle exists, manufacture the closest thing to one. Decompose the implicit spec into a rubric or checklist of individually checkable sub-criteria [VER-11] [VER-12], route every item that has a deterministic check to a real verifier, and reserve an LLM judge, rubric-constrained and bias-aware, for the genuinely subjective remainder [MA-9]. That is also where a detailed natural-language spec earns its keep: as the rubric a judge or a human grades against.

For how human oversight fits on top of all this, see the [LoopRails framework](framework.html) and the main [research codex](codex.html).
