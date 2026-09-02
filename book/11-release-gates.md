# Release Gates

*A gate should make a decision. If everyone can walk around it while admiring the dashboard, it is landscaping.*

An eval suite becomes operational when results affect releases.

Not every evaluation should block every change. Fast deterministic checks belong close to development. Expensive, stochastic, or expert-graded suites may run nightly or before major releases. Production experiments follow offline evidence. Arrange them as a funnel.

## The evaluation funnel

### Local smoke checks

Purpose: catch obvious breakage in seconds or minutes.

- schema and type checks;
- a handful of critical task cases;
- prompt-template rendering;
- tool-contract tests;
- deterministic invariants;
- mocked error paths.

Run before a developer submits a change. These checks should be stable. A flaky local gate trains people to ignore gates, a form of organizational reinforcement learning we could do without.

### Pull-request regression suite

Purpose: prevent known behavior from breaking.

- fast regression cases;
- must-not-fail safety and policy checks;
- deterministic or low-variance graders;
- limited repeated trials where affordable;
- comparison with the current baseline.

Block on hard-gate failures and clear regressions. Store artifacts for review.

### Nightly capability suite

Purpose: measure broader performance and unstable behavior.

- full capability set;
- repeated trials;
- model judges;
- cost and latency;
- segment breakdowns;
- trace-quality diagnostics;
- grader health.

Nightly runs can tolerate hours. They should not silently block all morning because one external model endpoint had feelings.

### Held-out release audit

Purpose: evaluate a candidate on cases not used during development.

- frozen held-out tasks;
- adversarial cases;
- judge calibration check;
- high-risk expert review;
- contamination and leakage review;
- release rule applied before result inspection.

Use for model, prompt, tool, retrieval, policy, or orchestration changes capable of altering shipped behavior.

### Production rollout

Purpose: validate that offline improvement transfers to users.

- shadow mode where possible;
- canary or percentage rollout;
- guardrail metrics;
- randomized experiment when appropriate;
- circuit breaker and rollback;
- sampled trace review.

Offline eval verifies known properties. Production validates product impact.

Spotify describes eval and experimentation as a funnel rather than competing forks: offline evaluation narrows candidates, and online experiments test whether proxy improvements affect users [ORG-04].

Uber's prompt-engineering toolkit describes the same handoff in operational terms: candidate prompts are tested against an evaluation dataset before production, then watched through production monitoring after release [ORG-05]. The boundary matters. Passing the dataset earns a controlled encounter with users; it does not earn retirement from measurement.

## What runs when

Create a change-impact matrix. The checks below are a starting list, not universal minimums; the product's risks and operating requirements decide what is mandatory.

| Change | Checks to consider |
|---|---|
| Prompt wording | Smoke, regression, relevant capability, cost/latency |
| Model version | Full regression/capability, repeated trials, judge compatibility, held-out audit |
| Tool schema | Contract tests, tool tasks, error paths, action-policy checks |
| Retrieval index | Retrieval cases, citation/evidence checks, stale-source tests |
| Business policy | Affected tasks, rubric, gold labels, production monitors |
| Judge model or prompt | Calibration, held-out judge audit, affected historical re-grade |
| Harness or fixture | Harness self-tests, affected tasks, baseline reconciliation |
| Runtime controller | Retry, stop, budget, escalation, and side-effect tasks |

The matrix saves a small copy edit from a week-long audit and stops a model swap from sneaking through on five smoke tests.

Three published systems make the funnel concrete. Block describes an agent-testing pyramid in which deterministic tests use mock model providers; recorded model and tool sessions make integration paths replayable; stochastic benchmarks run repeatedly outside pull-request CI; and rubric-based judge evaluations are repeated before a majority result is recorded [ORG-08]. Block's schedule is theirs, not a law of testing. The transferable rule is to match the test's cost and uncertainty to the clock on which it runs.

Salesforce fills in the failure-path layer with a shared mock LLM service offering configurable outputs, latency, 4xx responses, and 5xx outages. The team used it to test failover and internal capacity without waiting for a real provider incident, reporting sustained tests at 16,000 requests per minute, bursts above 24,000, and more than $500,000 in annual token-cost savings [ORG-07]. A mock cannot establish answer quality. It can make retry, timeout, circuit-breaker, and load behavior wonderfully boring—and boring infrastructure is a compliment.

ACES applies the same logic to reusable capability packages. Static structure, lint, and security scans supply cheap evidence; live paired trials answer whether a package changes agent behavior [ACES-01]. Its open-source SkillEvaluator exposes the two forms as separate tiers [ACES-02].

Schedule a new live baseline after a model update. A stronger model may raise performance in both arms and reduce the package's measured marginal value. That can be healthy: the baseline agent may need less procedural help. Release evidence should show both absolute outcomes and paired contribution.

## Baselines are artifacts

Write down the baseline. “Whatever production does today” is how historical reconstruction becomes séance work. Record:

- commit or release;
- prompt and orchestration versions;
- model name and dated version;
- inference settings;
- tool and policy versions;
- task and grader versions;
- environment image;
- run date and region;
- repeated-trial configuration;
- cost assumptions.

Provider aliases such as `latest` are convenient for product operation and terrible for historical reconstruction. Resolve the actual version where possible.

Store baseline task-level results, not only averages. A new version may trade failures among cases while preserving the mean. Paired comparison needs the individual outcomes.

## Write the release contract

A release contract tells the team what to do with the evidence. The values below are named product decisions, not numbers borrowed from a generic example. Replace each one with a documented requirement before running the comparison.

```yaml
release: support-agent-2026-09
decision_owner: director_support_product
primary_metric:
  name: hard_gate_task_pass
  required_effect: product_decision_rule
must_not_regress:
  - unauthorized_refund
  - duplicate_side_effect
  - false_claim_of_completion
segments:
  requirement: approved_segment_policy
  keys: [language, policy_category, customer_tier]
reliability:
  trials_per_task: set_from_variance_study
  required_sequence: defined_by_user_workflow
  minimum_sequence_reliability: product_requirement
cost:
  maximum_per_accepted_task: approved_operating_budget
latency:
  maximum_p95_seconds: service_level_requirement
production:
  initial_rollout: blast_radius_policy
  rollback_on:
    - guardrail_breach
    - duplicate_effect_event
```

Classify each condition as a hard constraint, a decision criterion, or a monitoring signal. Do not average across those categories. In particular, a quality improvement cannot compensate for violating a hard latency, safety, compliance, or cost requirement.

Record exceptions. If the decision owner ships despite missing the primary threshold because a known grader bug depressed the result, document the evidence, scope, compensating controls, and follow-up date. Exceptions are not forbidden. Invisible exceptions are.

## Flakiness is data

An eval case that alternates between pass and fail may reveal:

- stochastic model behavior;
- unstable tool or environment;
- ambiguous task;
- brittle grader;
- hidden state leakage;
- judge threshold sensitivity;
- a real reliability problem.

Do not solve flakiness by rerunning until green and keeping the green run. That is pass@eventually, a metric popular with haunted CI systems.

Classify the source. Report trial distributions. Quarantine only when the harness or grader is defective, and keep a ticket with an owner. Model variance is not test flakiness; it is product behavior.

## Capability and regression dashboards

Keep separate views.

Regression dashboard:

- number of known cases passing;
- newly broken case IDs;
- must-not-fail status;
- time since first regression;
- owners and release block.

Capability dashboard:

- performance by capability and segment;
- repeated-trial reliability;
- cost and latency;
- frontier failures;
- improvement over time;
- suite saturation.

If the capability score rises while the regression suite breaks, the system learned new tricks and forgot where it lives.

## Grader failures do not equal task failures

The pipeline needs at least four run statuses:

- task passed;
- task failed;
- grader unavailable or errored;
- harness invalid.

Never default missing evidence to pass. Do not call it a task failure when the decision concerns model capability. Surface infrastructure health separately.

Track:

- grader parse failures;
- model-judge timeouts;
- environment setup failures;
- missing traces;
- task timeouts;
- version mismatches;
- re-grade consistency.

An eval platform is a measurement instrument. Instruments need calibration and maintenance. Scientists do not usually declare gravity weaker because the scale lost power.

## A release meeting that can end

Keep the review focused:

1. What decision was pre-specified?
2. Did the run execute validly?
3. What changed on primary and hard-gate metrics?
4. Which paired cases disagree?
5. Did any segment regress?
6. What happened to reliability, cost, and latency?
7. What uncertainty or grader limitation matters?
8. Release, hold, limited rollout, or gather more data?
9. Who owns the next check and by when?

Inspect a small number of representative traces, especially new-only failures and must-not-fail cases. Do not reread every passing output in a room full of senior people. That is a very expensive book club.

## Field move

Map local, pull-request, nightly, held-out, and production checks into a five-row funnel. For each row, name the suite, budget, blocking behavior, owner, retained artifacts, and escalation path. Then complete Template 9 before the next run; a gate becomes real when its rule exists before its score.
