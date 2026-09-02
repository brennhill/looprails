# Appendix B: Templates

Whether your team works in Markdown, YAML, JSONL, a database, or an eval platform, copy these templates into the system people already use. The nonnegotiable properties are versioning, ownership, evidence, and review.

## Template 1: Evaluation objective and decision record

```markdown
# Evaluation Objective: [workflow / release]

## Decision
We will decide whether to [release / choose / route / automate / retire] ______.

Decision owner: [name]
Decision date: [date]

## Population and unit
Target population: ______
Unit of evaluation: [response / conversation / task / user-period] ______
Important segments: ______

## Product outcome
The user or business outcome we actually care about is ______.
The offline eval is expected to predict it because ______.

## Primary evidence
Primary metric: ______
Minimum worthwhile effect or threshold: ______
Uncertainty method: ______

## Hard gates
- [must-not-fail criterion]
- [must-not-regress criterion]

## Operating conditions
Mark each condition as a hard constraint, decision criterion, or monitoring signal.
Cost requirement: ______
Latency requirement: ______
Escalation or refusal requirement: ______

## Known limitations
- ______

## Follow-up
Production validation: ______
Review date: ______
```

## Template 2: Task case

```yaml
id: workflow_capability_001
version: 1
status: active
purpose:
  capability: ""
  failure_category: ""
  decision: ""
source:
  type: production_redacted | synthetic | public_benchmark | incident
  reference: ""
  rights_class: internal_restricted | original | licensed | anti_leak
setup:
  environment_version: ""
  policy_version: ""
  initial_state: {}
  tools: []
  permissions: []
input:
  messages: []
limits:
  max_turns: 0
  max_tool_calls: 0
  max_wall_seconds: 0
  max_cost_usd: 0
  retry_policy: ""
expected:
  hard_gates: []
  quality_criteria: []
  evidence_required: []
metadata:
  severity: low | medium | high | must_not_fail
  suite: capability | regression | adversarial | calibration
  tags: []
  owner: ""
  created: YYYY-MM-DD
  last_reviewed: YYYY-MM-DD
  review_by: YYYY-MM-DD
  dependencies: []
```

## Template 3: Trace annotation sheet

```yaml
trace_id: ""
reviewer: ""
review_date: YYYY-MM-DD
review_target:
  unit: response | turn | generation_span | trace | thread | task_outcome
  target_id: ""
  context_available: []
selection:
  stratum: random | complaint | high_risk | new_segment | apparent_success | other
  inclusion_probability: null
task:
  user_goal: ""
  contract_summary: ""
outcome:
  final_result: success | partial | failure | unknown
  world_state: ""
  strongest_evidence: ""
analysis:
  first_departure_step: ""
  observation: ""
  recovery_behavior: ""
  severity: low | medium | high | must_not_fail
  user_recoverable: true
taxonomy:
  user_outcome_category: ""
  evidence_category: ""
  intervention_hypotheses: []
grader:
  false_pass: false
  false_fail: false
  missing_criterion: ""
next:
  candidate_eval_case: true
  runtime_prevention: ""
  owner: ""
open_note: ""
```

## Template 4: Failure taxonomy register

```markdown
# Failure Taxonomy v[version]

Owner: [name]  
Effective date: [date]  
Supersedes: [version]
Fallback category: other / not yet classified  
Last trace that changed the taxonomy: [ID / date]  
Discovery strata reviewed: [list]  
Next taxonomy-review trigger: [event / date / fallback-case pattern]

## [category_id]: [name]

Definition: [observable user or system outcome]

In scope:
- [example]

Out of scope:
- [counterexample]

Strongest evidence:
- [state / event / source / expert criterion]

Severity guidance:
- Low: ______
- Medium: ______
- High: ______
- Must-not-fail: ______

Known intervention hypotheses:
- [prompt / retrieval / tool / controller / policy / grader / organization]

Example traces: [IDs]
Related eval cases: [IDs]
Open disagreements: ______
Review trigger: ______
```

## Template 5: Grader specification

```yaml
id: grader_name
version: 1
owner: ""
criterion: ""
decision_supported: ""
grader_type: environment | executable | structured | rule | model_judge | expert
inputs:
  required: []
  optional: []
output:
  schema: {}
  labels: []
  grader_error_status: "invalid"
interpretation:
  hard_gate: false
  pass_rule: ""
  threshold: null
evidence:
  pointer_required: true
  independent_from_agent: ""
calibration:
  dataset: ""
  last_run: YYYY-MM-DD
  false_pass_rate: null
  false_fail_rate: null
known_failures:
  - ""
adversarial_cases:
  - ""
operations:
  expected_cost_usd: 0
  expected_latency_ms: 0
  timeout_status: invalid
  sandbox: ""
review_trigger:
  - grader_model_change
  - criterion_change
  - production_drift
  - scheduled_audit
```

## Template 6: Model-judge prompt

```text
SYSTEM
You grade exactly one criterion. Use only the TASK CONTRACT, EVIDENCE, and
OUTPUT. Do not infer missing facts from outside knowledge. If the evidence is
insufficient, return insufficient_evidence. Return valid JSON only.

CRITERION
[One binary or categorical requirement, including important exceptions.]

LABELS
pass: [definition]
fail: [definition]
insufficient_evidence: [definition]

TASK CONTRACT
{{task_contract}}

EVIDENCE
{{evidence}}

OUTPUT TO GRADE
{{output}}

RETURN
{
  "label": "pass | fail | insufficient_evidence",
  "output_span": "exact relevant span or empty",
  "evidence_span": "exact relevant evidence or empty",
  "reason": "one sentence tied to the criterion"
}
```

Keep the actual prompt, examples, model version, inference settings, and parser version in the grader registry. Do not put protected benchmark examples in a generally distributed prompt library.

## Template 7: Judge calibration report

```markdown
# Judge Calibration: [grader ID and version]

Criterion: ______
Decision supported: ______
Expert owner: ______
Judge model/prompt: ______
Date: ______

## Dataset
Cases: ______
Source strata: ______
Development / calibration / audit split: ______
Group split key: ______
Cross-split group overlap: ______
Languages and segments: ______
Annotation mode: independent / model-prelabeled / mixed
Blind-label audit slice: ______
Adjudication process: ______
Disagreement disposition: candidate error ___ / label error ___ / unresolved ambiguity ___

## Confusion matrix

| | Expert pass | Expert fail |
|---|---:|---:|
| Judge pass | | |
| Judge fail | | |

Agreement: ______
Pass precision: ______
Pass recall: ______
False-pass rate: ______
False-fail rate: ______
Insufficient-evidence rate: ______

## Breakdown

| Category / segment | n | false pass | false fail | decision |
|---|---:|---:|---:|---|

## Bias and attack tests
- Position swap: ______
- Length control: ______
- Style control: ______
- Rubric keyword attack: ______
- Long-context evidence position: ______

## Allowed use
The judge may ______.
The judge may not ______.
Cases routed to people: ______.

## Follow-up
Next audit: ______
Owner: ______
```

## Template 8: Eval run comparison

```markdown
# Eval Comparison: [A] vs [B]

Decision: ______
Run date: ______
Valid run: yes / no
Invalid tasks or grader errors: ______

## Versions

| Artifact | A | B |
|---|---|---|
| Code / prompt | | |
| Model / settings | | |
| Tools / policy | | |
| Task set | | |
| Graders | | |
| Harness | | |

## Primary paired results

| | Count |
|---|---:|
| Both pass | |
| A only | |
| B only | |
| Both fail | |

Observed paired difference: ______
Confidence interval / analysis: ______
Minimum worthwhile effect: ______

## Hard gates
- ______

## Reliability
Trials per task: ______
pass@k: ______
pass^k: ______
Unstable tasks: ______

## Segments
[table]

## Cost and latency
Cost per attempt: ______
Cost per accepted task: ______
Median / p95 latency: ______

## Discordant-case review
New wins: ______
Regressions: ______
New failure classes: ______

## Limitations
- ______
```

## Template 9: Release decision

```markdown
# Release Decision: [release]

Decision owner: ______
Date: ______
Decision: release / hold / limited rollout / gather more evidence

## Pre-specified contract
Primary threshold: ______
Hard gates: ______
Segment rule: ______
Cost rule: ______
Latency rule: ______

## Evidence
Run comparison: [link]
Held-out audit: [link]
Judge calibration: [link]
Reviewed trace IDs: ______

## Result against contract
[table of each rule and pass/fail/invalid]

## Known limitations and residual risk
- ______

## Exception
Contract overridden? yes / no
Reason and authority: ______
Compensating controls: ______
Expiry / follow-up: ______

## Rollout
Initial percentage: ______
Guardrails: ______
Rollback trigger: ______
Rollback owner: ______
Production review date: ______
```

## Template 10: Production sampling plan

```yaml
workflow: ""
owner: ""
effective_date: YYYY-MM-DD
unit: task | conversation | user | account_period
representative_sample:
  method: ""
  rate: 0
  weights_recorded: true
risk_samples:
  - name: consequential_action
    trigger: ""
    review_rate: 1.0
  - name: grader_disagreement
    trigger: ""
    review_rate: 1.0
change_focused_sample:
  release: ""
  affected_segments: []
automated_graders: []
human_review:
  cases_per_week: 0
  reviewers: []
  adjudicator: ""
delayed_outcomes:
  - event: ""
    window_days: 0
privacy:
  retained_fields: []
  redacted_fields: []
  retention_days: 0
  access_role: ""
  external_judge_allowed: false
feedback_loop:
  case_creation_owner: ""
  weekly_review: ""
```

## Template 11: Eval suite health review

```markdown
# Eval Health Review: [suite] [month/quarter]

Owners present: ______

## Coverage
- Capabilities missing: ______
- High-risk categories missing: ______
- Thin segments: ______
- Production failures without cases: ______

## Grader health
- False-pass / false-fail audit: ______
- High-disagreement criteria: ______
- Successful grader attacks: ______
- Judge drift: ______

## Dataset health
- Always-pass cases: ______
- Unstable cases: ______
- Stale dependencies: ______
- Duplicates: ______
- Leakage / contamination risk: ______
- Rights or retention issues: ______

## Operations
- Harness invalid rate: ______
- Grader error rate: ______
- Median incident-to-case lead time: ______
- Open release exceptions: ______

## Product validity
- Offline metrics validated online: ______
- Proxies that failed: ______
- New user failure categories: ______

## Actions
| Action | Owner | Due | Completion evidence |
|---|---|---|---|
```

## Template 12: Ownership page

```markdown
# Eval Ownership: [workflow]

| Responsibility | Named owner | Backup | Cadence / trigger |
|---|---|---|---|
| Eval platform | | | |
| Product standard | | | |
| Domain adjudication | | | |
| Engineering behavior | | | |
| Sampling/statistics | | | |
| Safety/risk/privacy | | | |
| Release decision | | | |

Weekly trace review: [day/time, owner, required output]
Monthly health review: [day/time, owner, required output]
Quarterly held-out review: [owner]
Incident-to-regression criterion: ______
Escalation path: ______
```

## Template 13: Dataset provenance and rights card

```yaml
artifact_id: ""
artifact_type: task | trace | annotation | screenshot | dataset | diagram_adaptation
source:
  title: ""
  url: ""
  author_or_org: ""
  version_or_commit: ""
  accessed: YYYY-MM-DD
rights:
  license: ""
  third_party_content: true
  permission_required: unknown
  permission_record: ""
restrictions:
  anti_contamination_request: false
  contains_gold_answer: false
  contains_personal_data: false
  publication_allowed: false
allowed_use:
  internal_eval: true
  print_description: true
  verbatim_reproduction: false
  screenshot: false
notes: ""
owner: ""
review_by: YYYY-MM-DD
```

## Template 14: Benchmark version and deprecation log

```yaml
suite: ""
version: ""
status: active | maintenance | deprecated | retired
effective_date: YYYY-MM-DD
reason: []
indicators:
  always_pass_rate: null
  production_coverage_gap: ""
  leakage_risk: ""
  grader_validity: ""
replacement: ""
case_migration:
  regression_only: []
  revised_ids: []
score_comparability:
  compatible_with_previous: false
  explanation: ""
historical_reporting_label: ""
decision_owner: ""
communication: ""
```

## Template 15: Proxy ledger

```markdown
# Offline-to-Online Proxy Ledger

| Offline metric | Intended product outcome | Mechanism | Last validation | Result | Decision | Owner | Next review |
|---|---|---|---|---|---|---|---|
| | | | | | keep / revise / retire | | |
```

For each entry, attach the experiment or observational analysis and record important segment differences. A proxy with no validation date is a hypothesis, not an outcome metric.
