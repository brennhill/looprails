# Demos Lie

*Not maliciously. Demos are usually lovely people. They answer a much easier question.*

A demo asks, **Can the system succeed once, on a case we chose, while we are watching?**

A product asks:

- Can it succeed on cases users choose?
- Can it succeed repeatedly?
- Can it fail safely?
- Can we tell when it failed?
- Can the team improve it without breaking something else?

These questions are cousins, but they are not twins.

The familiar launch story starts with a striking result. Someone types a request. The agent searches, reasons, calls three tools, and produces an answer that would have taken a person an hour. People lean toward the screen. Someone says, “That is amazing.” It is amazing.

Then the product meets variation.

The next user is vague. The account has an old configuration. The policy changed last month. The relevant document is a scanned PDF with a table split across two pages. A tool times out after making the change but before returning confirmation. The agent politely reports success. The database, showing a certain lack of team spirit, disagrees.

The demo was not fake. It was a sample of one.

A grander demo will not solve this. The remedy is a working loop between evaluation, diagnosis, and system change: study what failed, encode the behavior that matters, change the product, and run the evidence again [FOUND-03].

## The three gaps

Three gaps separate a convincing demonstration from dependable use.

### The task gap

The case in the demo is clean. Production cases come from a distribution nobody fully specified. Some are common; some are rare but costly; some are new combinations of old problems.

An eval suite begins by sampling that distribution intentionally. Represent the decision, not the universe. A team deciding whether to release a support agent needs ordinary refund requests, policy-edge cases, ambiguous requests, tool failures, and a small number of must-never-happen cases. A perfect ontology of human desire can wait. That project has been delayed.

### The truth gap

The output looks right, but what would prove it?

For code, proof may be a test, a type check, a changed file, or an invariant. For a customer-service task, it may be the final database state plus policy compliance. For clinical guidance, it may require expert criteria. For research, it may be whether each substantive claim is supported by a source.

Fluency proves the output is fluent. Booked flights, fixed bugs, safe recommendations, and supported claims need evidence of their own.

### The repetition gap

The system can do the task. Can it do the task reliably?

Suppose an agent succeeds on a task with probability 75 percent. If you give it three attempts and need only one success, the chance of at least one success is about 98.4 percent. A best-of-three demo looks terrific.

If a user needs the workflow to succeed three times in a row, the chance is about 42.2 percent. Same model. Same per-attempt score. Very different product.

τ-bench made this distinction concrete with `pass^k`: the probability that all k trials succeed. Its original retail results placed frontier agents below 25 percent on `pass^8`, even where individual successes looked encouraging [TAU-01]. The metric asks the question a returning user asks: “Will this keep working?”

## Four products, four ways to be fooled

The cases we will follow each reveal a different version of demo success.

### The patch that passes

In SWE-bench, an agent receives a real repository and GitHub issue, then writes a patch. Tests run. Green means success [SWE-01]. Reading the patch and admiring its posture is much weaker evidence.

But what if the hidden test requires a detail the issue never asked for? What if it accepts one narrow behavior but misses a broader regression? A later targeted audit of frequently failed SWE-bench Verified tasks reported material task or test problems in at least 59.4 percent of the 138 audited cases [SWE-03]. The number should not be extrapolated to the entire benchmark, but the lesson travels well: an executable grader can be wrong with tremendous precision.

### The reservation that “changed”

In τ-bench, an agent interacts with a user, follows a policy, and calls tools in a simulated domain. The evaluator can inspect the final state. Did the reservation change? Was the fee correct? Did the agent make a prohibited action? Did it communicate the right facts? [TAU-03]

A transcript can sound successful while the environment remains untouched. It can also reach the right state by violating policy. “Outcome” is not one number until the team has decided which outcomes count.

### The answer that sounds caring

In a health conversation, tone matters. So do missing red flags, dangerous advice, false reassurance, and failure to ask the one question that changes the urgency. HealthBench uses case-specific criteria created with physicians rather than relying on a generic “helpfulness” score [HEALTH-01].

A demo listener may reasonably say, “That sounded compassionate.” The eval asks, “Did it notice the symptom that changes the urgency?” Both judgments can be true. Only one may protect the user.

### The report with thirty citations

The research agent produces twelve pages and thirty citations. The report is organized, readable, and faintly smells of mahogany.

DeepResearch Bench separates report quality from citation quality. Its RACE dimensions examine comprehensiveness, depth, instruction following, and readability; FACT examines citation accuracy and effective citation count [DRB-01]. More citations do not guarantee more supported claims. They can also mean the system has discovered footnote confetti.

## An eval is a decision instrument

Teams often begin by asking, “What metrics should we track?” Begin one step earlier:

> What decision will this evaluation change?

Common decisions include:

- release or hold a new prompt;
- choose between two models;
- add a tool or remove it;
- allow autonomous execution or require approval;
- route a class of cases to a specialist;
- invest in retrieval, fine-tuning, or workflow changes;
- retire a benchmark that no longer differentiates systems.

Without a decision, an eval tends to become a museum. The scores are carefully displayed. Visitors are respectful. Nothing in the product moves.

A decision gives the eval a unit, a population, a cost of error, and a threshold. If the decision is whether an agent may autonomously issue refunds under $50, false passes matter more than false fails. If the decision is which summarizer helps analysts review more documents, speed and coverage may matter alongside accuracy. If the decision is whether a prompt regression broke French responses, the sample must include French responses.

The decision also prevents metric shopping. Write the rule before the run:

> Ship the new version only if:
>
> - paired task pass rate clears the pre-agreed minimum worthwhile effect;
> - no must-not-fail case regresses;
> - policy compliance meets the product's requirement;
> - latency remains within the service-level requirement; and
> - cost per accepted task remains within the approved budget.

The team must supply those conditions before the run and label the hard constraints. If latency is a hard barrier, an accuracy gain does not bargain it away. The same is true of safety, compliance, cost, or any other non-negotiable requirement. Within those boundaries, an improvement that matters to the product is worth considering; an observed positive number still needs enough evidence to distinguish it from run noise. The rule may be imperfect, but at least it is inspectable. “We liked the result after seeing it” is elastic enough to fit through a keyhole and should not be given root access.

## Evals do not make production safe

An eval suite is a sample of possible behavior under a harness. Production is an open world with changing users, tools, data, models, and incentives. Passing the suite means the system supplied evidence for the tested decision. It does not mean the system is now certified Good At AI.

Safety comes in layers:

1. Offline evals measure known capabilities and regressions.
2. Deterministic runtime checks block invalid or dangerous actions.
3. Sandboxes, permissions, and limits constrain blast radius.
4. Production sampling discovers distribution shift and unknown failures.
5. Controlled experiments test whether offline proxies predict user outcomes.
6. Human review handles ambiguity, novel risk, and grader calibration.

A score of 94 has better stage presence. The layered version has somewhere to put the fire extinguisher. No single layer has to be omniscient. Each needs to catch failure modes the others miss.

## The first rule of the eval loop

Do not begin with the benchmark. Begin with the product behavior you need to understand.

Benchmarks are valuable. They provide shared tasks, public baselines, and tested methods. They can reveal whether a model family has a capability at all. They can also be saturated, contaminated, misaligned with your workflow, or optimized until the score and the product part company.

You probably should not run all four cases. They are here because each exposes a reusable design pattern:

- executable tests;
- environment-state checks;
- expert case rubrics;
- evidence and citation checks.

Your product may need one, several, or something else. The pattern comes before the platform.

## Field move

Complete Template 1 for one feature your team currently calls “good.” Name the decision, unit, strongest evidence, dangerous false pass, and realistic number of repeated uses. If the evidence is still “the response sounds right,” you have found the demo, not the product.
