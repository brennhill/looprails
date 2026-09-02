# The Two Loops

*One loop does the work. The other teaches the first loop what “working” means.*

An agent is a loop:

`observe → decide → act → verify → continue or stop`

An AI product team also needs a loop:

`observe production → analyze errors → update tasks and graders → compare change → release → observe production`

The loops run at different speeds and have different owners. They meet through evidence.

Call the first the **inner agent loop** and the second the **outer eval loop**.

## Inside the agent loop

A dependable agent loop has more structure than `while not done: ask_model()`.

### Goal and state

The loop begins with an objective and explicit execution state. State may include the user's goal, plan, completed actions, tool results, remaining budget, unresolved questions, and observed environment.

Keep operational truth outside the model's prose. The model may summarize state for context, but the orchestration layer should own authoritative records such as tool events, idempotency keys, permissions, and budgets.

### Action space

The agent can choose among tools and messages to the user. Smaller, clearer tool sets reduce ambiguity. Tool names, schemas, errors, and permissions form an interface for the model.

Every action should expose an observable result. “Request sent” and “refund committed” are different results. If the tool collapses them into `success: true`, the eval loop will eventually discover this, probably through finance.

### Verification

After an action, the loop checks ground truth:

- read state after a write;
- run tests after a patch;
- resolve a citation after attaching it;
- validate a schema before calling a tool;
- check policy before committing a side effect.

The verifier supports retry, alternative action, escalation, or completion. It should not be the agent merely saying, “I have verified my work.” That sentence has enormous confidence-to-evidence ratio.

### Control

Deterministic orchestration enforces:

- maximum turns and wall time;
- token and spend budgets;
- tool and permission boundaries;
- retry policy;
- stop conditions;
- escalation;
- checkpoints and recovery.

The model can propose. The controller disposes.

### Outcome

The loop ends with an artifact and evidence:

- final environment state;
- final answer;
- tests and checks;
- action log;
- sources;
- cost and latency;
- reason for completion or escalation.

These outputs enter the outer loop.

## Around the agent loop

The eval loop begins where the agent loop ends.

### Observe

Sample real traces and outcomes. Include ordinary traffic, complaints, high-risk actions, novel segments, and apparent successes. Capture user feedback and delayed business outcomes.

### Understand

Review traces. Find the first departure. Build and revise a failure taxonomy. Separate user outcome, evidence, and intervention hypothesis.

### Encode

Turn representative failures into versioned tasks. Build the closest trustworthy grader stack. Add capability cases, regression cases, and adversarial grader tests.

### Compare

Run old and new systems on paired tasks under controlled budgets. Repeat stochastic tasks. Report uncertainty, segments, hard gates, cost, and latency.

### Decide

Apply a rule written before the result. Release, hold, roll out gradually, or gather more evidence. Record the decision and residual risk.

### Learn from production

Monitor outcomes, run controlled experiments where possible, and ask whether the offline proxy predicted user value. Feed new failures and disagreements back into observation.

Evaluation-driven development keeps the work going after launch [OPS-01]. That is the outer loop's job.

## Buy brains or build rails?

When a model underperforms, teams often open the model catalog first. The catalog is quick to open and pleasantly free of meetings about field definitions.

A model swap is only one of three levers:

1. **Buy more general capability.** Use a stronger hosted frontier model.
2. **Build better rails.** Improve the task contract, field definitions, schema, constrained decoding, validation, retries, and escalation around the model.
3. **Specialize the weights.** Fine-tune an open-weight model on a stable, narrow task.

These levers solve different failures. A frontier model may handle ambiguity, novel instructions, and messy long-tail inputs better. A harness can make allowed outputs explicit and reject impossible states. Fine-tuning can teach a repeated domain mapping to a smaller model. Calling all three “model quality” is how teams end up buying a larger engine because the cup holder rattles.

Start with the contract and harness before touching the weights. Husain's AI product-engineering guidance treats evaluation as the foundation of the improvement process and argues for improving context, system, and harness before reaching for post-training [FOUND-01]. The eval does not choose the intervention in advance. It tells each intervention what problem it must beat.

### Give context a job description

Context is not a sack into which every possibly relevant file gets tipped. Calboreanu proposes five roles for a context package—authority, exemplar, constraint, rubric, and metadata—and a staged reviewer → design → builder → auditor workflow [CONTEXT-01]. The names force each artifact to declare why it is present. A policy governs. An example demonstrates. A constraint limits. A rubric describes quality. Metadata helps everyone find the meeting again.

The paper reports 55 percent first-pass acceptance and 2.0 average iteration cycles across 200 structured interactions, compared with 32 percent and 3.8 cycles across 50 unstructured interactions [CONTEXT-01]. Treat those numbers as an interesting field observation, not an effect size. One practitioner produced and coded the interactions; the baseline was smaller, retrospective, and nonrandomized; and the practitioner, templates, and methodology all improved during the study. Several horses changed while the photograph was being taken.

The paper's method does suggest a testable practice. Version every context artifact, label its intended role, and specify which source wins when instructions conflict. Then ablate one component at a time on paired tasks while holding the model, harness, workspace, budget, and grader fixed. A visible rubric may belong in the task contract; hidden checks and trusted audit evidence should remain outside the agent's reach when revealing them would change the task. More context is not automatically better context. Sometimes it is just a larger attic.

Do not import a universal priority order from the paper. Product authority decides whether policy, contract, rubric, or another source governs a particular conflict. Nor does a different model logo make the auditor independent. Separate builder and auditor roles, then calibrate the auditor and prefer evidence that can fail differently: environment state, executable tests, source passages, or expert labels.

### A payroll extractor gets progressively fussier

A sequence of practitioner experiments from Jebra makes the distinction unusually concrete. The domain was payroll-rule extraction: turn contracts, emails, offer letters, and similar text into structured records.

The first experiment used a 1.5-billion-parameter Qwen2.5 model with grammar-constrained JSON output. It tested 1,000 rows: the same payroll agreement written in five styles for 200 workers. Simply spelling out abbreviations improved field accuracy by nearly eleven percentage points. Turning the explicit shorthand into polished prose did little. Repetition and legal filler made extraction worse [EXTRACT-01]. The model did not need nicer sentences. It needed fewer private dialects.

The next experiment added complexity. Across 2,500 payroll clauses, full grammatical sentences offered little benefit for simple agreements but beat shorthand by nearly twenty-one percentage points for agreements with several class types and rates. The reported quantization results also depended on that slice: Q2 was unusable, Q4 struggled on complex cases, and Q8 and FP16 were statistically indistinguishable across the tested complexity levels [EXTRACT-02]. “Which model wins?” was already the wrong-sized question. Ask the product-sized question instead: “Which configuration wins on the inputs we actually find difficult?”

Then the experiment separated **documentation** from **grammar**. Two Qwen2.5 model sizes processed 264 hand-verified agreements under four conditions: field names alone or full field definitions, each with free or grammar-constrained decoding. That produced 2,112 extractions. With definitions, the 14-billion-parameter model reached 92 percent field accuracy—but only 31 percent of whole records were completely correct. Grammar without definitions also forced `false` fifty times where the source said nothing and the right value was `null`; adding definitions removed that error in the experiment [EXTRACT-03].

Grammar solved syntax, not meaning. It can stop malformed JSON. It cannot teach the difference between “no” and “not mentioned.” The llama.cpp documentation makes the same boundary explicit: its JSON Schema grammar constrains output, but the schema is not automatically an explanation of the task [FORMAT-01]. Rails keep the train on the track. They do not tell it which city deserves a visit.

Finally, Jebra reports fine-tuning the 1.5-billion-parameter model with QLoRA on roughly 280 examples. Field match rose from 54 to 97 percent, while exact whole-record match rose from zero to 62 percent [EXTRACT-04]. QLoRA trains small adapter weights through a frozen quantized base model, reducing the memory needed for specialization [TUNE-01]. A follow-up ran the same test set through Claude Opus 5 and reported 96.72 versus 81.81 percent field match, and 62 versus zero percent exact match, in favor of the tuned small model [EXTRACT-05].

Treat that last comparison as a lead, not a verdict. The post does not publish the train/test split sizes, prompts, inference settings, confidence intervals, latency method, field-by-field errors, or enough detail to reproduce the frontier run. It is a practitioner result from one narrow task, not proof that small models beat frontier models. The lesson that survives scrutiny is narrower: a broad model's reputation does not settle a specialized product decision. A fixed eval can test it.

### Run the race in the right order

Do not fine-tune your way out of a confused contract. The model will learn the confusion with admirable dedication.

Use this sequence:

1. **Freeze a representative test set.** Include ordinary inputs, hard complexity slices, missing information, conflicting values, noisy documents, and sources the system should reject.
2. **Separate the metrics.** Track parse or schema validity, field correctness, whole-record correctness, latency, and cost per accepted record. A valid JSON object full of wrong values is valid JSON and a failed product.
3. **Improve the task contract.** Define each field, allowed value, null behavior, precedence rule, and evidence requirement. Remove abbreviations and accidental ambiguity from upstream text where the product controls it.
4. **Build the smallest harness that does the job.** Constrain syntax, validate semantics, expose check-level failures, and route uncertain or invalid cases for retry or review.
5. **Compare model candidates under that same harness.** A frontier model, an untuned open-weight model, and a tuned candidate should receive the same task definition and face the same held-out cases.
6. **Tune only against a stable target.** Keep training data away from the held-out set. Re-run every consequential slice after tuning, including rare values and explicit absence.

Running the interventions in this order gives each one a fair trial and shows what you are paying for. If field definitions close most of the gap, fine-tuning may be unnecessary. If a frontier model wins mainly on rare, messy inputs, test it as a fallback rather than assuming it belongs on every request. If tuning improves common cases but damages a consequential tail, keep that damage out of the aggregate's broom closet.

### Choose a system, not a mascot

Put each option on the same test track; the winner belongs to the task and operating constraints, not to a shopping guide.

**A frontier model deserves a trial** when the task changes often, labeled data is scarce, or inputs are novel and ambiguous. Measure the complete system, including review, retries, invalid outputs, and operating constraints.

**An open-weight model with a custom harness deserves a trial** when the task is narrow, deployment control matters, and the rules can be stated clearly. Include serving, upgrades, observability, and difficult slices in the comparison; a quantization that looks fine on easy cases may still eat a rare enum.

**A tuned open-weight model deserves a trial** when the target has stopped wriggling, representative labels exist, and the remaining errors repeat after the contract and harness have improved. Use a strict holdout: specialization can improve the common path while sanding breadth off the edges.

Choose on evidence and operating fit, not model politics. Open weights offer control and create operating work. Frontier APIs offer broad capability and create dependency on a moving external system. Fine-tuning can compress domain behavior into a small model and can also compress last month's labeling mistakes into a small model.

Hybrids belong on the track too. One design sends routine, well-specified records to the small model and routes invalid, novel, or high-consequence cases to a stronger model or a person. If a frontier model drafts training examples, people should adjudicate the gold labels, and generated examples must not wander into the held-out set through the side door.

Treat the router as part of the product. Evaluate the small model, the fallback, and the routing rule together. Report end-to-end whole-record accuracy, escalation rate, review load, latency, and cost. A cheap extractor that sends 70 percent of cases to an expensive fallback is not cheap. It is an expensive system with a tiny receptionist.

The outer loop should make this decision repeatedly. Model releases, prices, hardware, data residency rules, and task mix change. Keep the eval stable enough to compare systems and alive enough to represent production. Then buy brains, build rails, tune weights, or mix the three according to evidence—not allegiance.

## The seam

The two loops exchange five artifacts.

### Task contracts

The outer loop defines scenarios the inner loop must attempt. A contract includes setup, input, limits, and evidence. It is an executable question about product behavior.

### Verification functions

Some graders can run inside the agent loop to guide work and outside it to score results. Tests are the obvious example. An agent may run tests while editing code; the eval harness later runs trusted tests independently.

Keep the trusted final check beyond the agent's control. Shared logic is useful. Shared write access is less charming.

### Traces

The inner loop emits structured events. The outer loop reads them to diagnose behavior. If the trace omits the state that matters, the team cannot reliably learn from failure.

### Budgets

The outer loop defines acceptable cost, time, turns, and risk. The inner controller enforces them. Eval results report whether work completed within those constraints.

### Release and runtime rules

Eval findings may change prompts, tool permissions, escalation thresholds, circuit breakers, and allowed autonomy. The outer loop reshapes what the inner loop can do.

## One failure crossing both loops

Return to the duplicate booking change from Chapter 8.

### Inner-loop failure

1. Change call times out after committing.
2. Agent infers failure.
3. Agent retries with a new idempotency key.
4. Duplicate fee is charged.
5. Agent reports success.

### Outer-loop response

1. Production monitoring notices two events for one request.
2. Reviewer annotates “unsafe retry after uncertain side effect.”
3. Team creates a regression task simulating commit-then-timeout.
4. Grader checks final fee and event count.
5. Tool interface moves idempotency-key ownership to orchestration.
6. Controller checks operation state before retry.
7. New and old agents run on timeout tasks.
8. Release requires zero duplicate effects.
9. Production monitor alerts on duplicate event signatures.

The fix touches task, grader, tool, controller, release rule, and monitor. A prompt change might help, but it would leave the dangerous capability structurally available.

At this point the eval has put its boots on the tool interface and controller. That is where product engineering was hiding.

## Verification functions as shared infrastructure

One verification function can serve several moments:

| Moment | Use |
|---|---|
| During generation | Guide retry or selection |
| Local development | Fast feedback for an engineer |
| Pull request | Regression gate |
| Nightly eval | Full comparison and repeated trials |
| Production | Runtime invariant or asynchronous monitor |
| Incident review | Reproduce and confirm repair |

The implementation may differ by context. A production runtime check must be fast and safe. A nightly grader can be broader and slower. The underlying property should remain recognizable.

For research reports, claim–citation checking might:

- guide the agent to repair unsupported claims before completion;
- score a report in an offline eval;
- sample claims asynchronously in production;
- provide evidence during an editor's review.

One property, several loop positions.

## Avoid circular evidence

The loops can accidentally certify themselves.

- The agent generates a summary of its success.
- The judge grades only the summary.
- The release dashboard aggregates the judge.
- The team samples only dashboard failures.

Everything agrees because every layer sees the same story.

Break the circle with independent evidence:

- environment state;
- user outcomes;
- expert audits;
- raw tool events;
- alternate graders;
- hidden cases;
- controlled experiments;
- incident data.

Perfect independence is fantasy. Aim for graders that fail differently. A model judge and model generator may share biases; a database assertion and expert communication rubric usually do not. Their combination is stronger.

## Loop latency

Measure how long it takes learning to travel around the outer loop:

- failure occurs;
- failure is observed;
- trace is reviewed;
- case is created;
- fix is shipped;
- regression check is automated;
- production confirms improvement.

Call this **learning lead time**.

A team can have a sophisticated eval platform and a six-week learning lead time because nobody reviews traces or owns rubric decisions. Another team can begin with a spreadsheet and improve weekly because the loop closes.

Optimize the loop, not the logo on the tooling.

## Field move

Draw both loops for one workflow: inner state and control, outer sampling and release, and the five artifacts crossing the seam. Name each handoff owner and write the elapsed time from production failure to permanent regression case. Circle every arrow powered by memory alone; that is where the loop opens.
