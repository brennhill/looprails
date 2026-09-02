# Four Kinds of Truth

*The evidence usually gets less arguable as it approaches the consequence.*

Where does truth live in your system?

That question sits underneath grader design. Teams often reach first for an LLM judge because the output is language. But the fact that a claim is expressed in language does not mean language is the best place to verify it.

If an agent says, “I changed your booking,” truth lives in the booking system.

If it says, “The patch fixes the bug,” truth may live in executable behavior.

If it says, “This symptom pattern requires urgent care,” truth may require clinical expertise.

If it says, “The study found a 40 percent reduction,” truth lives in the cited study and the relationship between its evidence and the claim.

We will use the four recurring cases as workbenches for finding that truth.

## Workbench one: executable truth

SWE-bench begins with a compelling design: take real software issues and corresponding repository changes, give an agent the issue and codebase, and run tests against its patch [SWE-01].

Executable truth has wonderful properties:

- it is repeatable;
- it is fast relative to human review;
- it produces specific failures;
- it can run in CI;
- it is difficult to persuade with eloquence;
- it often points toward the broken behavior.

When an assertion checks `balance_after == balance_before + deposit`, the agent cannot recover by explaining that, conceptually, the books feel balanced.

Executable checks should sit low in the grader stack because they are strong and cheap. Use them for schemas, invariants, calculations, file changes, permissions, state transitions, compilation, tests, and policy rules that can be encoded safely.

But executable truth is conditional truth. It says the artifact satisfies the assertions, in this environment, for these inputs.

It does not say:

- the assertions fully represent the request;
- the environment matches production;
- no material case is missing;
- the implementation is secure or maintainable;
- the test itself is correct.

The history of SWE-bench Verified makes that last point vivid. The Verified curation removed many ambiguous or unfair candidates [SWE-02]. A later targeted audit still found substantial issues in often-failed tasks and reported evidence of benchmark contamination [SWE-03]. Keep the tests. Drop the fantasy that determinism makes them omniscient.

### Design rule

Use executable checks wherever truth can be encoded, then test the checks adversarially.

For each check, ask:

- What bad implementation passes?
- What good implementation fails?
- Which hidden assumption is enforced?
- Which production invariant is absent?

The test is an executable specification. That is power, not innocence.

## Workbench two: state truth

τ-bench moves the focus from final text to final world state. An agent must interact with a user, follow domain policy, use tools, and leave the environment in the right condition [TAU-01].

This maps directly to production agents:

- reservation changed;
- refund issued;
- address updated;
- ticket escalated;
- invoice reconciled;
- access revoked;
- deployment rolled back.

Each is a state transition. The response is part of the task but not the ground truth of the transition.

State truth supports a compact task model:

`initial state + allowed actions + policy + interaction → final state + evidence`

The evaluator can compare the actual and expected state, inspect prohibited or required actions, and separately grade communication [TAU-03]. You get several answers instead of one suspiciously tidy number:

| Dimension | Example question |
|---|---|
| State | Does the reservation contain the requested flight? |
| Authorization | Was the change allowed for this user and fare? |
| Action path | Did the agent avoid prohibited tools or side effects? |
| Communication | Did it accurately describe the outcome and fee? |
| Interaction | Did it request information that was truly needed? |

The dimensions reveal four combinations the aggregate would blur:

1. Right state, right process.
2. Right state, wrong or unsafe process.
3. Wrong state, honest communication.
4. Wrong state, false claim of success.

An aggregate score may rank them. An engineering team needs to see them separately.

### The timeout problem

State checks earn their keep around uncertain side effects. A tool call times out. Did the action fail before commit, succeed before the response was lost, or continue asynchronously?

The agent must not blindly retry a non-idempotent action. Nor should it declare failure without checking. A good task can simulate this ambiguity:

- first call commits the change but returns a timeout;
- the environment exposes a read method;
- the expected behavior is to inspect state before deciding whether to retry;
- duplicate side effects fail the task.

The grader evaluates the final state and action history. That tells you more than asking a judge whether the transcript “handled the timeout well.”

### Design rule

Whenever the agent changes the world, grade the world.

## Workbench three: expert truth

Some outcomes cannot be reduced to a database diff or test suite without discarding the thing that matters.

Health communication is a clear example. A response may need to recognize urgency, avoid a harmful recommendation, communicate uncertainty, ask a missing question, and use language suited to the user. The correct standard depends on the case.

HealthBench was built with 262 physicians across 60 countries and contains 48,562 case-specific rubric criteria for 5,000 conversations [HEALTH-01] [HEALTH-02]. Its design does not ask a generic judge, “Is this medically good?” It asks whether the response satisfies criteria written for that particular situation.

Expert truth does not mean an expert reads every production output forever. It means experts define and calibrate the standard where domain judgment is irreducible.

A scalable pattern is:

1. Experts label a carefully sampled set.
2. Criteria are written at the smallest actionable level.
3. An automated judge applies those criteria at scale.
4. Judge output is compared with expert labels.
5. Disagreements are reviewed by category and consequence.
6. The judge, rubric, and threshold are revised.
7. Experts periodically audit drift and novel cases.

Use automation to save expert time for standard-setting, ambiguity, calibration, and high-risk exceptions.

### Specific beats generic

Generic criterion:

> The answer is safe.

Case-specific criteria for an original fictional example:

- recognizes that sudden one-sided weakness may require emergency evaluation;
- does not recommend waiting until a routine appointment;
- clearly advises contacting emergency services now;
- avoids claiming a diagnosis;
- uses direct language without minimizing the urgency or adding unsupported alarm.

The case criteria can be graded independently. If the answer fails, the team knows how.

### Design rule

Use experts to define good at the level where their disagreement becomes informative.

## Workbench four: evidentiary truth

Research outputs need two kinds of quality: the report should answer the question well, and its factual claims should be supported.

DeepResearch Bench separates these concerns. RACE covers comprehensiveness, depth, instruction following, and readability. FACT covers citation accuracy and effective citation count [DRB-01].

Check a research report in this order:

1. Extract checkable claims.
2. Resolve each citation to a source.
3. Locate the cited passage or data.
4. Determine whether it entails the claim.
5. Check whether material claims lack citations.
6. Evaluate source quality and relevance.
7. Grade overall coverage and synthesis separately.

Different checks can handle different steps:

- URL and identifier validators check resolution.
- Retrieval locates supporting passages.
- Rules check citation placement and format.
- A narrow model judge assesses claim–evidence entailment.
- A domain reviewer assesses source quality and synthesis for consequential cases.

The report-level judge should not grade its own evidence from memory. Show it the claim and the actual cited passage. Make the decision local.

### The citation-count trap

Counting citations rewards citation production. It does not reward support.

An effective-citation metric may count only citations that resolve, come from acceptable sources, and support the attached claim. Coverage asks what proportion of material claims have such support. Accuracy asks what proportion of included citations truly support their claims. These can move in opposite directions.

A report with four excellent citations may have high accuracy and poor coverage. A report with forty mixed citations may have broad coverage and low accuracy. The product decision determines the tradeoff.

### Design rule

Grade the relationship between claim and evidence, not the decorative presence of evidence-shaped objects.

## Truth source first, grader mechanism second

Most products mix the four truths. A medical scheduling agent may need state truth for the appointment, executable truth for authorization, expert truth for triage language, and evidentiary truth for cited guidance.

Keep two design questions separate:

| Question | Example answer |
|---|---|
| Where does truth live? | The appointment record |
| How will the grader read it? | A state assertion |

Truth is the evidence. The grader is the mechanism that reads it. An environment oracle, a test, a schema validator, a deterministic rule, a model judge, or a person may do that reading. Chapter 5 arranges those mechanisms into a ladder.

This distinction prevents a common category mistake. “Use an LLM judge” does not say what the judge should know, just as “write a test” does not say what behavior matters. Find the evidence first. Then choose the cheapest strong mechanism that can interpret it without pretending.

## Independence matters

The grader should rely on evidence the agent cannot rewrite.

If the agent produces both the answer and a self-evaluation that determines the score, it has become student, examiner, and, after a short reorganization, accreditation board.

Independence can come from:

- a separately controlled environment;
- hidden tests;
- read-only logs;
- a different model and prompt;
- expert labels the generator never sees;
- source passages retrieved independently;
- permissions that prevent editing grader code or expected state.

Buying from a second vendor does not automatically buy independence. Two models can share blind spots, and a separate model judge remains probabilistic. Strong independence comes from different evidence and failure modes.

## A truth inventory

For one workflow, list every material claim the system makes or implies.

Example: “Your return has been approved and $42.50 will arrive within five business days.”

| Claim | Strongest truth source |
|---|---|
| Return is eligible | Policy rule plus order facts |
| Return is approved | Case state |
| Refund amount is $42.50 | Executable calculation |
| Refund was initiated | Payment-system event |
| Arrival within five days | Current provider estimate and policy |
| Wording is clear and respectful | Narrow judge or human rubric |

The inventory often reveals that one friendly sentence contains six independently testable claims. At that point, one “response quality” score starts to look a little silly.

## Field move

Choose ten consequential claims or actions. For each, name where truth lives, the cheapest strong check, what that check can miss, who resolves ambiguity, and how the agent could game it. Carry the inventory into Template 5; Part II will turn it into a grader stack.
