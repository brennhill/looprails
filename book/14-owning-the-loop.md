# Owning the Loop

*“Everyone owns quality” is a fine value and a terrible ticket assignee.*

Evals decay when nobody owns the standard.

The harness may belong to a platform team. The rubric may need a domain expert. The task may originate in support. The grader may be written by engineering. A product leader may make the release decision. Legal or safety may define a hard boundary.

This distribution is normal. Ambiguity about it is optional.

## The seven owners

### Eval platform

Owns shared infrastructure:

- task and result storage;
- isolated harnesses;
- model and prompt version capture;
- grader execution;
- trace viewer;
- CI and deployment integration;
- access control and audit logs;
- cost and latency observability;
- re-grading and reproducibility;
- platform reliability.

The platform team should not decide what counts as a clinically safe response or a fair refund. It makes those standards executable and observable.

Anthropic's guidance describes a similar division: dedicated eval teams can own infrastructure while domain and product teams contribute tasks and interpret results [ANTH-01].

### Product or domain owner

Owns the meaning of good for the workflow:

- prioritized capabilities and risks;
- case coverage;
- rubric intent;
- product tradeoffs;
- release thresholds;
- connection to user outcomes;
- retirement of stale behavior.

This person cannot outsource the product definition to a benchmark or a model judge.

### Domain experts

Own standards that require specialized judgment:

- gold labels;
- case-specific criteria;
- adjudication;
- dangerous ambiguity;
- judge calibration;
- high-consequence audit;
- changes in domain practice.

Experts may be clinicians, lawyers, educators, researchers, support-policy specialists, security engineers, or experienced operators. “Human fallback” is too vague a job description. Give named experts defined questions.

### Engineering team

Owns product behavior and strong checks:

- task fixtures;
- executable graders and invariants;
- tool contracts;
- trace instrumentation;
- fixes and regression cases;
- runtime prevention;
- harness compatibility;
- on-call response for relevant failures.

The team that changes the system should see the cases that define its success.

### Statistics or data science

Owns measurement design where scale or consequence justifies specialization:

- representative sampling;
- paired comparisons;
- cluster and repeated-trial analysis;
- confidence intervals;
- power and experiment design;
- delayed-outcome modeling;
- drift detection;
- proxy validation.

Small teams may not have this role. They still need someone accountable for the questions, with external review for consequential decisions.

### Safety, risk, legal, or compliance

Owns hard constraints relevant to its mandate:

- prohibited behavior;
- approval requirements;
- held-out adversarial audits;
- data handling;
- regulatory evidence;
- escalation and incident obligations;
- residual-risk review.

This function should define enforceable criteria with the product team, not arrive at the end carrying a ceremonial red pen.

### Decision owner

Owns release or hold.

The decision owner reviews the evidence, applies or explicitly overrides the release contract, records residual risk, and assigns follow-up. This may be the product owner for routine changes and a more senior accountable leader for high-risk autonomy.

Name one person. Committees advise; one person decides.

## Central platform, local truth

Centralize the mechanics; keep meaning close to the product.

LinkedIn has described horizontal teams responsible for shared evaluation, testing, and prompt foundations alongside vertical teams building product agents [ORG-01]. Its search work also describes product-manager adjudication and large-scale judging infrastructure [ORG-02].

Notion describes a hybrid role called **AI Data Specialist** that combines quality assurance, prompt engineering, and product judgment. Its specialists write feature-specific criteria, inspect real user behavior, and operate continuous evaluation across dozens of models and hundreds of prompts [ORG-06]. Whatever the title, somebody must connect what users do, what the rubric says, and what the system changes next.

A central team can provide:

- task schema;
- harness SDK;
- grader registry;
- trace viewer;
- CI templates;
- statistical reporting;
- access and governance;
- training and office hours.

Domain teams provide:

- real cases;
- product policies;
- rubric criteria;
- subject-matter labels;
- release decisions;
- production interpretation.

Two designs fail predictably.

**Central oracle:** the eval team owns every rubric and becomes a queue. Domain meaning is lost in translation.

**Local islands:** every product invents schemas, judges, dashboards, and definitions. Results cannot be reproduced or compared, and infrastructure work repeats.

The interface is a service contract: the platform guarantees mechanics; the domain guarantees standards and ownership.

Agent skills make this split concrete. The capability author should own the questions, expected behaviors, fixtures, and domain-specific grader intent alongside the skill. The platform should stage isolated environments, run matched baselines across supported harnesses, normalize traces, and retain reports. ACES describes this as developer-guided evaluation with bring-your-own-task and bring-your-own-grader extension points [ACES-01]. The central system supplies a protocol; it does not confiscate the product contract.

Composition boundaries create another review job. A skill may work alone but route poorly when twenty plausible neighbors are visible. The catalog or platform owner must provide group-workspace tests and realistic decoys, while the skill author reviews whether failures reflect description, content, prerequisites, or interaction. Put ownership at the boundary where someone can actually prevent the failure.

## A practical responsibility map

Customize this table. Fill it with names or it is decorative.

| Activity | Accountable | Contributors and reviewers |
|---|---|---|
| Select capabilities | Product owner | Domain expert, engineering, data, risk |
| Create task fixtures | Engineering | Product, domain expert, eval platform |
| Define expert rubric | Product owner | Domain expert, data, risk |
| Implement deterministic grader | Engineering | Domain expert, platform, risk |
| Calibrate model judge | Product owner | Domain expert, data, platform, risk |
| Operate harness | Eval platform | Engineering, data, risk |
| Review production traces | Product owner | Engineering, domain expert, data, risk |
| Set release contract | Decision owner | Product, engineering, domain, data, risk |
| Approve exception | Decision owner | Product, engineering, domain, data, risk |
| Retire suite | Product owner | Engineering, domain, platform, data, risk |

The accountable person owns the decision or outcome. Contributors and reviewers perform the work or supply evidence. Use a full RACI when your organization needs the distinction among responsible, consulted, and informed roles; this compact map is for naming the people who must act.

If one cell contains “AI Council” seven times, add people.

## The operating cadence

Evals need clocks.

### Every change

- Run deterministic smoke and regression cases.
- Capture versions and paired differences.
- Block must-not-fail regressions.
- Attach artifacts to the change.

Owner: engineering, supported by the platform.

### Nightly

- Run the full capability suite.
- Repeat stochastic tasks.
- Report cost, latency, and grader health.
- Flag new regressions and unstable cases.

Owner: platform for execution; product engineering for response.

### Weekly trace review

Sixty minutes, fixed sample, cross-functional participants.

Agenda:

1. Five minutes: volume, release, and incident context.
2. Thirty minutes: read ten to twenty sampled traces.
3. Ten minutes: review new failure categories and disagreements.
4. Ten minutes: choose cases, fixes, or grader changes.
5. Five minutes: assign names and dates.

Outputs:

- annotated traces;
- candidate eval cases;
- taxonomy updates;
- policy questions;
- runtime-prevention ideas;
- owners.

Owner: product or domain owner. Engineers and experts attend. The meeting should look at data, not slides about data.

### Monthly eval health review

- Judge false-pass and false-fail audit.
- Coverage by capability, risk, and segment.
- Saturated, stale, duplicate, or leaking cases.
- Harness and grader reliability.
- Production-to-eval learning lead time.
- Proxy ledger and experiment results.
- Open release exceptions.
- Rights, privacy, and retention review.

Owner: product and eval platform jointly, with domain and risk participation.

### Quarterly or major-change review

- Held-out and adversarial evaluation.
- Dataset refresh and contamination risk.
- Power and sample design.
- Policy and model dependency updates.
- Suite retirement.
- Autonomy and permission review.
- Offline-to-online validity.

Owner: decision owner for the product area.

### Incident cadence

An incident creates immediate work outside the calendar:

- preserve evidence;
- create a regression case;
- repair prevention and detection;
- verify under related tasks;
- review whether release criteria change.

The regression case belongs in the incident completion criteria.

## Review work is product work

Trace annotation is often treated as leftover labor. The organization then wonders why criteria are vague and graders drift.

High-quality review requires:

- domain context;
- protected time;
- a good interface;
- clear escalation;
- feedback showing how labels changed the product;
- quality checks and calibration;
- reasonable queue sizes;
- recognition in role expectations.

Published cases show the range. LinkedIn reports a linguist-led process capable of reviewing up to 500 conversations per day [ORG-01]. HealthBench reports that 262 compensated physicians built 5,000 conversations and 48,562 criteria over eleven months [HEALTH-01]. Husain and Shankar suggest reviewing ten to twenty sampled traces weekly and running a larger cycle of at least 100 fresh traces every two to four weeks [ORG-09]. These numbers mark the terrain; they do not staff your queue. None supplies a staffing ratio for your product.

Avoid paying annotators for speed alone. Throughput targets can reward shallow review. Track agreement, adjudication quality, evidence use, and fatigue. Rotate high-stakes queues. Sample reviewer work for coaching, not surveillance theater.

## Budget the review queue

Run a timed pilot before requesting headcount. Measure work instead of estimating it by squinting at a spreadsheet.

| Input | Weekly calculation |
|---|---:|
| Incoming cases | `N` |
| Automatically resolved without human judgment | `N × automation_rate` |
| First human reviews | `N × (1 - automation_rate)` |
| Second reviews | `first_reviews × double_review_rate` |
| Adjudications | `first_reviews × adjudication_rate` |
| Quality audits | `first_reviews × audit_rate` |
| Calibration and queue administration | fixed hours |
| Interrupt and absence buffer | percentage of calculated hours |

Convert each row to hours with its own measured minutes per case:

```text
first_review_hours = first_reviews × first_review_minutes / 60
second_review_hours = second_reviews × second_review_minutes / 60
adjudication_hours = adjudications × adjudication_minutes / 60
audit_hours = audits × audit_minutes / 60

total_hours =
  (first_review_hours + second_review_hours +
   adjudication_hours + audit_hours + fixed_hours)
  × (1 + buffer_rate)

reviewer_capacity =
  total_hours / protected_review_hours_per_reviewer
```

Suppose 200 cases arrive each week. Automation resolves 40 percent without judgment. A first review takes eight minutes, and we assume a second review also takes eight minutes; 25 percent receive that second review; 15 percent require fifteen-minute adjudication; 10 percent receive a six-minute quality audit; calibration and administration take four hours. The queue needs 29.7 hours before a buffer, or about 35.6 hours with a 20 percent buffer.

If one reviewer has only 25 protected review hours after meetings, training, and other duties, the queue needs about 1.4 reviewer-equivalents. Calling it “one person” does not create the missing eleven hours. It creates Thursday afternoon.

Track the inputs weekly:

- cases arriving and aging;
- minutes by case type and severity;
- automation and routing rate;
- double-review and adjudication rate;
- expert hours by specialty;
- agreement and false-pass audit results;
- rework caused by vague criteria;
- protected capacity and queue overflow.

When demand exceeds capacity, change the sampling plan, automate a proven narrow decision, add reviewers, or reduce scope explicitly. Silent queue shedding is not an operating model.

## Incentives can open the loop

If teams are rewarded for launch date and benchmark score but not production outcomes, they will optimize launch date and score. Morality has very little to do with it. The employee scorecard is working exactly as designed.

Balance incentives:

- feature delivery;
- hard-gate quality;
- learning lead time;
- incident recurrence;
- production outcome;
- cost per accepted result;
- stale-case closure;
- reviewer burden.

Do not reward the number of eval cases. A thousand duplicates are not better coverage. Reward teams for making important failure classes observable and preventing them.

## Decision records preserve memory

For every major release, keep:

- decision and owner;
- alternatives;
- eval versions;
- primary results and uncertainty;
- paired disagreements reviewed;
- hard gates;
- segment, cost, and latency results;
- known grader and coverage limitations;
- exception or residual risk;
- rollout and rollback plan;
- follow-up date;
- production validation result.

Six months later, a model will change and someone will ask why a threshold exists. The record prevents threshold folklore.

## Maturity levels

### Level 0: demo

Success is shown through selected examples. No retained tasks or named owners.

### Level 1: cases

Twenty to fifty real cases, manual review, early taxonomy. Enough to begin discovery.

### Level 2: repeatable suite

Versioned tasks, graders, harness, baseline, regression checks.

### Level 3: release system

CI gates, held-out audits, release contracts, cost and segment reporting.

### Level 4: production loop

Recurring production sampling, trace review, delayed outcomes, incident-to-case process.

### Level 5: adaptive measurement

Judge calibration, proxy validation, drift, benchmark retirement, clear central/local ownership.

Vendor count says nothing about maturity. A spreadsheet with a weekly owner may be Level 1. A beautiful platform nobody uses may be Level Decorative.

## Field move

Do Exercise 10 and complete Template 12 with actual names. Schedule the weekly trace review and monthly health review, define their outputs, and calculate learning lead time from one recent failure. Anything without an owner lives in the wish pile.
