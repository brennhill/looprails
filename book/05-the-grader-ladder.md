# The Grader Ladder

*Use the least magical grader that can answer the question.*

A grader converts evidence into a result.

That result may be binary, numeric, categorical, or a structured bundle. Format comes second. Trust follows the chain:

`task → run → evidence → grader → result → decision`

Weakness anywhere in the chain weakens the decision. A perfectly written judge prompt cannot recover evidence the harness failed to capture. A database assertion cannot tell you whether the agent was rude. A domain expert cannot reliably inspect ten million routine outputs.

Use a **grader stack**: several checks, arranged from strong and mechanical to flexible and judgment-heavy.

OpenAI's grader documentation illustrates the implementation range: exact string checks, text similarity, model scoring, executable code, and combinations of those checks [OPENAI-02]. The product rule is simpler than the menu: use the lowest rung that can answer the criterion without bluffing.

## The ladder

### Rung 1: environment oracle

The environment exposes the outcome directly.

Examples:

- a reservation record;
- a payment event;
- a deployed version;
- a file-system diff;
- a game score;
- a simulator's terminal state.

Environment checks are powerful because they inspect consequences rather than claims. τ-bench provides a clear published example for tool-using agents [TAU-01] [TAU-03].

They can still be incomplete. The final state may be right even if the agent violated authorization, exposed data, or took an unnecessarily costly path. Preserve action logs and policy evidence too.

### Rung 2: executable test or invariant

Run code that decides whether a property holds.

Examples:

- unit, integration, or browser test;
- type and schema validation;
- arithmetic reconciliation;
- “no account balance became negative”;
- “all citations resolve”;
- “no tool outside the allowlist was called.”

SWE-bench's harness runs repository-specific test suites against patches [SWE-04]. Executable tests are ideal for CI because they are repeatable and diagnostic.

Their danger is specification error. A test can overconstrain the solution, undercheck the outcome, or encode stale behavior. Test the test.

### Rung 3: structured evidence check

Validate fields, events, provenance, or relationships.

Examples:

- every substantive claim has a citation object;
- tool authorization precedes the side effect;
- a refund amount references the correct order line;
- a source's publication date meets policy;
- the answer includes uncertainty when the confidence field is low.

Structured checks are often less brittle than parsing final prose. They require the system to emit or preserve inspectable intermediate artifacts.

### Rung 4: deterministic rule

Rules operate over text or structured data:

- required phrase or disclosure;
- forbidden claim;
- length or format limit;
- policy decision table;
- regular expression;
- keyword or language detection.

Rules are cheap and legible. They are also literal. Use them for literal requirements, not for concepts that merely have words associated with them.

“Contains the word emergency” does not prove safe triage. It proves the word had a busy day.

### Rung 5: model judge

A model evaluates a narrow criterion using supplied evidence and a rubric.

Good uses:

- does the claim follow from this passage?
- did the response clearly disclose the fee?
- did it answer the user's actual question?
- which error category best fits this trace?
- are two outputs equivalent under the task contract?

Poor uses:

- is the entire agent good?
- is this medically safe, with no case criteria?
- did the tool actually change the database, when the database is available?
- output a number from one to ten based on overall vibes.

Model judges scale judgment. They also scale bias, ambiguity, and occasional whim. Calibrate them.

### Rung 6: expert judgment

Use experts when the standard depends on domain knowledge, values, ambiguous evidence, or consequential tradeoffs.

Expert review may supply:

- gold labels;
- rubric criteria;
- adjudication;
- judge calibration;
- audit samples;
- high-risk case decisions.

HealthBench illustrates expert-defined, case-specific criteria at benchmark scale [HEALTH-01]. Experts should define the standard, not spend their lives confirming that a JSON field exists.

## Compose, do not average blindly

Suppose a customer-service task has six criteria:

| Criterion | Grader | Weight or rule |
|---|---|---|
| Correct final state | Database assertion | Required |
| Authorized action | Policy/event check | Required |
| No duplicate side effect | Action-history check | Required |
| Accurate explanation | Model judge | 0–2 |
| Clear next step | Model judge | 0–2 |
| Respectful tone | Model judge | 0–1 |

A naive weighted average lets three excellent communication scores compensate for an unauthorized refund. Do not do this.

Separate:

- **hard gates**: failure makes the task fail;
- **quality dimensions**: reported separately and optionally combined;
- **diagnostics**: informative but not scored;
- **cost and latency**: constraints or tradeoff metrics.

A composite result might be:

```json
{
  "task_pass": false,
  "hard_gates": {
    "state_correct": true,
    "authorized": false,
    "no_duplicate_effect": true
  },
  "quality": {
    "explanation": 2,
    "next_step": 2,
    "tone": 1
  },
  "diagnostics": ["policy_violation:final_sale_override"],
  "cost_usd": 0.084,
  "latency_ms": 11420
}
```

Call this a polished failure. The agent communicated beautifully while doing something prohibited. The score should preserve both facts.

τ³-bench's evaluator code shows the pattern: it combines checks for state, actions, communication, and natural-language assertions rather than forcing every concern through one mechanism [TAU-03].

## Grader contracts

Write a specification for every grader:

- criterion being measured;
- decision it affects;
- inputs and evidence required;
- output schema;
- threshold or interpretation;
- known failure modes;
- calibration dataset;
- owner;
- version;
- review trigger;
- adversarial cases;
- cost and latency.

Example:

```yaml
id: citation_entailment_v3
criterion: cited passage supports attached factual claim
inputs:
  - claim_text
  - cited_passage
  - source_metadata
output:
  label: [supported, partially_supported, unsupported, insufficient_context]
  confidence: [low, medium, high]
  evidence_span: string
hard_fail_labels:
  - unsupported
calibration:
  dataset: citation_gold_v2
  expert_owner: research_editor
known_failures:
  - numerical claims with changed denominators
  - source describes correlation while claim asserts causation
review_trigger:
  - judge_model_change
  - rubric_change
  - monthly_drift_audit
```

The known-failures field earns its keep by turning grader limitations into test cases rather than folklore.

## Build from the bottom

For each criterion, walk upward:

1. Can the environment answer it?
2. Can executable code answer it?
3. Can structured evidence reduce it?
4. Can a deterministic rule answer the literal requirement?
5. What judgment remains?
6. Which expert defines or audits that judgment?

Each lower rung shrinks the model judge's job. A narrow judge with the exact claim and source passage is easier to calibrate than a judge reading a twelve-page report and producing “8.3.”

DeepResearch Bench's split between report dimensions and citation dimensions supports this decomposition [DRB-01] [DRB-03]. A complete research eval may use deterministic URL resolution, model-based entailment, rules for citation placement, and expert review for source quality.

## Design outputs for grading

Evaluation improves when the product emits better evidence.

Ask the agent or orchestration layer to preserve:

- intended action;
- tool name and arguments;
- authorization context;
- returned result;
- observed postcondition;
- sources attached to claims;
- uncertainty or escalation reason;
- final state summary generated from the environment, not memory.

Do not expose every internal token to users. Do create an auditable event model.

When an agent calls `issue_refund`, store the transaction evidence too:

```json
{
  "intent": "refund_order_line",
  "authorization": "returns_policy_2026_04#final_sale_exception",
  "tool_call_id": "tc_8491",
  "requested_amount": 42.50,
  "result_event_id": "refund_9932",
  "postcondition": {"refund_status": "pending", "amount": 42.50}
}
```

Now several criteria are cheap to grade. Build this observability into the product interface between the agent and the eval loop.

## Graders have side effects too

A model judge consumes money and time. A code grader may execute untrusted output. A browser grader may mutate state. An expert review may expose sensitive data.

Treat graders as production software:

- sandbox code execution;
- use read-only credentials where possible;
- isolate fixtures;
- make re-grading idempotent;
- log grader versions and errors;
- distinguish grader failure from task failure;
- monitor cost and latency;
- restrict sensitive evidence;
- test fallback behavior.

If the citation service is down, the result is “grader unavailable,” not “all claims supported.” This seems obvious in print, where many excellent operational decisions live.

## Field move

Fill out Template 5 for one task. Put each criterion on the lowest honest rung, mark hard gates and diagnostics, then ask what evidence could change the grader's mind. “None; it has a general impression” means the grader is a mood ring with API access.
