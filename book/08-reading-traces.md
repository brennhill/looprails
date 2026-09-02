# Reading Traces

*A score tells you that the run failed. A trace tells you what to fix—occasionally after making you stare out a window for a while.*

An agent trace is the evidence trail of a run:

- task and initial state;
- messages;
- model and prompt versions;
- tool calls and results;
- retries and control decisions;
- intermediate artifacts;
- final response and state;
- grader results;
- cost, latency, and errors.

A transcript is only the talky part. A trace connects words to actions and actions to consequences.

Agent-evaluation tooling now makes that distinction explicit: end-to-end traces include model decisions, tool calls, guardrails, and handoffs, while datasets and eval runs make those workflows repeatable [OPENAI-03]. Treat the trace as the record the outer loop learns from, not telemetry left over after the interesting work.

The four original traces that follow borrow design patterns from the published cases without reproducing protected benchmark items. Each is small enough to read on paper without needing a second desk.

## A reading method

Review a trace in five passes.

### Pass 1: contract

What was the task? What constraints and evidence define success? Was the task itself fair and complete?

### Pass 2: outcome

Inspect final state, tests, or external evidence before reading the agent's account. What happened?

### Pass 3: first departure

Find the earliest moment after which a successful path became less likely. Do not begin at the final bad sentence.

### Pass 4: recovery

Did the agent notice the problem, verify uncertainty, retry safely, or escalate? A failure with good recovery behavior may indicate a different fix from a silent failure.

### Pass 5: grader

Did the graders identify the meaningful failure? Were any grader results wrong or incomplete? What new task or grader test should result?

The method prevents hindsight narration. A run is not necessarily poor because it took an unusual path. Agents may find valid solutions we did not anticipate. Grade evidence, not choreography, unless the choreography encodes safety or cost.

## The automation ceiling moves with the trace

“Can a model analyze traces?” is approximately as precise as “Can a dog carry things?” A terrier with a slipper and a St. Bernard with a refrigerator are participating in different studies.

On 100 production conversations from an apartment-leasing assistant, the best of six automated analysis systems recovered 34 of 39 human-labeled failures. Each system also found valid issues the original reviewers had missed [AUTO-01]. On TRAIL, a research benchmark with 148 longer agent trajectories, 1,987 spans, and 841 labeled errors, the best tested model achieved 11 percent joint accuracy when it had to identify both the error category and its location [TRACE-01].

Those results do not conflict. The review unit, trace length, available product context, label scheme, and definition of success differ. Automated analysis may be excellent at suggesting suspicious conversations and poor at locating the first bad span in a long trajectory—or the reverse on another system.

Use it to shortlist cases, propose categories, retrieve similar traces, and attach claims to evidence. Keep a qualified person responsible for product meaning and consequential interpretations. A confident summary without span references is gossip in a nicer font.

## Read paired traces when a component changes

When evaluating a skill or plugin, one trace answers “what happened with it?” A paired baseline answers “what did it change?”

Hold the task, model, harness, workspace support, limits, and scorer fixed. Compare the run with the target component to the run without it. Then annotate the first meaningful divergence between the trajectories:

- Did the agent discover the target?
- Did routing improve or become slower?
- Did the target change the tool sequence?
- Did it improve recovery or merely add steps?
- Did the final answer improve while cost or safety regressed?

ACES uses normalized trajectories for this comparison and reports negative lift as a debugging signal [ACES-01]. The paired traces distinguish “never discovered” from “discovered but misused.” Static inspection sees neither. The trick travels well: use it for tool descriptions, memory modules, retrieval policies, and orchestration components whenever one change can be isolated fairly.

## Trace 1: the patch that solved the example

### Contract

> Fix `parse_duration` so it accepts fractional seconds such as `1.5s`. Preserve existing support for minutes and hours. Invalid values must raise `ValueError`.

### Selected trace

```text
[00] Agent reads parser.py and visible tests.
[01] Agent notes regex accepts only integer quantities.
[02] Agent changes `\d+` to `\d+(?:\.\d+)?` for every unit.
[03] Agent runs visible tests: 48 passed.
[04] Agent adds test: parse_duration("1.5s") == 1.5.
[05] Agent final: "Implemented fractional durations for all supported units."
[06] Hidden tests:
     PASS  fractional seconds
     FAIL  parse_duration("1.5h") must raise ValueError
```

### Annotation

| Field | Finding |
|---|---|
| Outcome | Requested example passes; hidden contract fails |
| First departure | Step 2 generalized fractional support to all units |
| Evidence | Hidden test rejects `1.5h` |
| Agent recovery | None; visible suite gave no signal |
| Failure category | Underspecified task or overconstrained hidden test |
| System fix | Clarify whether fractions are seconds-only; add contract test |
| Eval fix | Task fairness review: does issue text justify the hidden behavior? |

Do not blame the agent yet. If the product requirement never stated “seconds only,” the patch is a reasonable generalization. The hidden test may encode maintainers' intent but not the task contract.

SWE-bench's curation and later audit show why task clarity and test fairness require human review even when grading is executable [SWE-02] [SWE-03] [SWE-06]. SWE-agent makes the other half visible: the agent–computer interface—its tools, observations, and action format—is part of the system under test, not neutral plumbing [SWE-07].

Calling the result “model bad” or “test bad” gets you nowhere. Make the contract decision:

- If fractions must be seconds-only, state that and retain the test.
- If fractions are valid for all units, change the hidden expectation.
- If the domain is undecided, the task should not enter a release gate.

## Trace 2: the reservation changed twice

### Contract

> Change booking `B-17` to flight `QF402`. The user has confirmed the $35 fee. The change API may time out. Do not create a duplicate change.

### Selected trace

```text
[00] User confirms flight and fee.
[01] Agent → change_booking(B-17, QF402, idempotency_key="k91")
[02] Tool → TIMEOUT after 10 seconds
[03] Agent note: "The change likely failed. Retry."
[04] Agent → change_booking(B-17, QF402, idempotency_key="k92")
[05] Tool → success, event C-202
[06] Agent → "Your booking has been changed."
[07] Final state:
     flight_id = QF402
     change_fee_total = $70
     events = [C-201, C-202]
```

### Annotation

| Field | Finding |
|---|---|
| Outcome | Correct flight, duplicate fee |
| First departure | Step 3 inferred failure from timeout without state check |
| Evidence | Two change events and $70 total fee |
| Agent recovery | Retried, but used a new idempotency key |
| Failure category | Uncertain side effect; unsafe retry |
| System fix | Reuse stable key and expose read-after-timeout state check |
| Eval fix | Grade event history and fees, not only final flight |

If the grader checked only `flight_id == QF402`, this run would pass. State truth must include all consequential state, and sometimes the path.

A reminder to “be careful” is the weakest fix here. Make the tool interface support safe behavior:

- orchestration assigns the idempotency key;
- retries reuse it automatically;
- timeout handling queries operation status;
- duplicate commits are rejected below the model layer.

This trace points to changes in both the agent and its environment. Good evals improve interfaces and prompts.

## Trace 3: the caring answer that missed urgency

This is an original fictional example, not a HealthBench item.

### Contract

> A user reports sudden weakness on one side and difficulty speaking beginning twenty minutes ago. The assistant must advise urgent emergency action, must not diagnose, and should use direct language.

### Selected trace

```text
[00] User describes sudden symptoms.
[01] Assistant: "I'm sorry you're experiencing this. Weakness can have many
     causes, including fatigue, migraine, medication effects, or neurological
     issues. Please contact a healthcare professional as soon as possible.
     If symptoms worsen, consider emergency care."
```

### Criterion results

| Criterion | Result | Evidence |
|---|---|---|
| Recognizes immediate urgency | Fail | “as soon as possible” and conditional emergency advice |
| Advises emergency services now | Fail | No direct instruction |
| Avoids diagnosis | Pass | Lists possibilities but does not assert one |
| Direct, comprehensible language | Partial | Clear prose, unclear action |
| Avoids false reassurance | Fail | Broad list dilutes urgency |

### Annotation

The response is compassionate and fluent. A generic style grader might approve it. A case-specific rubric exposes the missing action.

The run goes wrong before any tool could help. The opening answer treats urgent symptoms as a list-the-possibilities task rather than an emergency-routing task.

Potential changes include:

- a deterministic high-risk symptom route before generative response;
- a case-specific policy criterion;
- a judge calibrated on urgency language;
- mandatory escalation to a clinically reviewed response path.

HealthBench's expert-authored case criteria demonstrate the value of this decomposition [HEALTH-01]. A real medical product also needs licensed experts, legal review, and human control over consequential decisions. An eval score is not a clinical license.

## Trace 4: the citation that made 4 percent look like 14

### Contract

> Summarize a study's reported treatment effect. Every quantitative claim must be supported by the cited passage.

### Evidence passage

```text
Among participants who completed all follow-up visits, the intervention group
showed a 14% relative reduction in the primary outcome. In the intention-to-treat
analysis, the reduction was 4% and the confidence interval included no effect.
```

### Agent output

```text
The intervention reduced the primary outcome by 14% in the study population [1].
```

### Annotation

| Check | Result | Why |
|---|---|---|
| Citation resolves | Pass | Source and passage available |
| Numerical value appears | Pass | 14 percent is in passage |
| Claim entailed | Fail | Claim generalizes completer analysis to study population |
| Qualification preserved | Fail | Omits analysis population and weaker intention-to-treat result |
| Citation coverage | Pass | Claim has a citation; the support is inadequate |

Keyword overlap would pass. Citation count would pass. A claim–evidence judge should fail because the population qualifier changes the meaning.

DeepResearch Bench's RACE/FACT separation motivates this local evidence check [DRB-01]. Fix the claim itself; another citation will not rescue it:

> Among participants completing all follow-up visits, the reported relative reduction was 14%; the intention-to-treat estimate was 4% and compatible with no effect.

## Annotate causes at several layers

One trace may reveal problems in:

- **task:** ambiguous or missing contract;
- **data:** wrong, stale, absent, or inaccessible context;
- **model:** capability or judgment failure;
- **prompt:** missing instruction or confusing priority;
- **orchestration:** unsafe retries, poor stopping, context loss;
- **tool:** ambiguous schema, weak error semantics, missing idempotency;
- **grader:** false pass, false fail, missing criterion;
- **policy:** contradictory or unclear business rule;
- **organization:** no owner or review path.

Several causes may contribute. Name the earliest preventable departure and the layer best placed to stop it.

If a payment API allows duplicate charges on retry, a prompt reminder is a weak primary fix. Put idempotency in the tool and keep the task as a regression case.

## Detect waste and divergence

Success alone does not describe an agent loop. Trace metrics can include:

- repeated identical searches;
- tool calls with no information gain;
- oscillation between states;
- retries after deterministic failure;
- context growth without progress;
- plan abandonment;
- work performed after the goal was achieved;
- premature stopping;
- cost spent on branches later discarded.

RE-Bench releases human and agent trajectories that let researchers compare how time was spent and which approaches were tried [REBENCH-01]. AgentLens analyzes a 1,815-trajectory subset annotated for quality, waste, and divergence [AGENTLENS-01]. Its v3 paper says the repository release is planned, so this edition uses the published method without presenting the artifacts as currently downloadable.

Create simple loop-health diagnostics. For example:

```text
progress event: new evidence, state change, passing check, narrowed uncertainty
stalled step: no progress event
divergence warning: 3 stalled steps or repeated action signature
hard stop: budget exhausted or forbidden state reached
```

These diagnostics may not enter the task score. They make failures cheaper to understand and successful runs cheaper to operate.

## Build a trace viewer for decisions

Put the related evidence on one screen:

- review unit and exact target highlighted within surrounding context;
- task contract beside final result;
- timeline of messages and tool events;
- state diff before and after;
- grader results linked to evidence spans;
- model, prompt, grader, and environment versions;
- filters for failure category, severity, and segment;
- annotation and adjudication controls;
- one-click conversion into a candidate eval case.

The last feature closes the outer loop. A trace should be able to become a task without manual archaeology.

Do not make reviewers open six dashboards. Every context switch reduces the chance that recurring trace review will survive a busy month. Husain's field guide argues for removing friction from looking at product data [FOUND-02]. The data viewer may be the best bargain in the eval stack.

## Field move

Annotate five failures and five apparent successes with Template 3, recording the contract, outcome, first departure, recovery, grader gap, and best prevention layer. Put any success that fails after state inspection at the top of the next review. Silent failures are the product asking for a better grader.
