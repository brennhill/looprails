# The First Thirty Days

*Start with twenty cases and one decision. You can purchase a platform later, after it has something worth platforming.*

The first month should produce a **minimum viable eval loop** for one workflow the team cannot shrug off.

If you want the plan in one working document, start with Template 16 in Appendix B. It turns this chapter into six evidence gates and a rollout record. The calendar below supplies a useful order; the gates decide whether the team advances.

Not the whole company. Not every model. Not a unified theory of helpfulness. One workflow, chosen because it matters, repeats, and has outcomes the team can inspect.

“Minimum viable” describes the loop, not the quality bar. The month proves that one team can observe behavior, turn failures into tasks, compare a change, make a recorded decision, and learn again. It does not certify a product as safe, settle every grader dispute, or require a production launch before the calendar gets bored.

The case counts below set the workload for this worked plan. They are not claims of statistical sufficiency. Consequential decisions still need a sample design tied to the product, the failure rate, and the uncertainty the decision can tolerate.

By day thirty, the loop should be able to:

- replay real tasks;
- grade consequential outcomes;
- compare a change with a baseline;
- inspect disagreements and traces;
- apply a release rule;
- sample production or complete an approved shadow-evidence plan;
- assign recurring ownership.

## Prerequisites

The thirty-day clock starts when the team has:

- a named decision owner and domain owner;
- access to privacy-approved traces or representative synthetic fixtures;
- enough instrumentation to capture inputs, versions, tool events, outputs, and outcomes;
- a sandbox or staging path for side effects;
- protected engineering and review time;
- authority to change the chosen workflow;
- a rollback, disable, or containment path for any limited rollout.

If one of these is missing, use **month zero** to build it. Instrumentation and ownership are the work, not throat-clearing before it.

## Before day one: choose the slice

Choose a pilot with:

- user value the team can name;
- repeated tasks;
- accessible traces;
- observable outcomes;
- enough failures to learn from;
- bounded action scope;
- an engaged domain owner;
- a change the team expects to make.

Avoid the easiest toy workflow. It may demonstrate the tooling without testing the method. Avoid the most consequential autonomous workflow if you have no evaluation practice. Choose a vertical slice where the team can learn safely.

Examples:

- support article answer with citations;
- refund eligibility recommendation without autonomous payment;
- coding agent for one repository;
- research report section with source checks;
- appointment-intake classification with human action;
- document extraction into a validated schema.

Write the decision:

> In thirty days, we will decide whether version B should replace version A for this workflow under a limited production rollout.

Name the decision owner.

## Week 1: discover

### Day 1: instrument and sample

Confirm traces include:

- inputs;
- messages;
- tool calls and results;
- final state or artifact;
- model, prompt, tool, and policy versions;
- cost, latency, and errors;
- user feedback where allowed.

Create a mixed sample of twenty traces: ordinary, complaints, high-risk, new segments, and apparent successes. Record selection strata.

Deliverable: `trace-sample-v1` with privacy review.

### Day 2: shared review

Product, engineering, and a domain expert review the first five traces together. Agree on what counts as evidence. Use open notes.

Deliverable: five annotated traces and an evidence vocabulary.

### Day 3: independent review

Review the remaining fifteen in pairs or independently. Mark user goal, outcome, first departure, evidence, severity, and open notes.

Deliverable: twenty annotated traces.

### Day 4: taxonomy

Cluster observations. Separate user outcome, evidence, and intervention hypothesis. Identify disagreement and missing policy.

Deliverable: failure taxonomy v1 with examples and unresolved questions.

### Day 5: choose tasks

Select:

- five common failures;
- five successes worth protecting;
- five high-consequence or edge cases;
- five confusing or disagreement cases.

Twenty to fifty cases are enough to start learning [ANTH-01].

Deliverable: task backlog with owner and purpose.

### Week 1 checkpoint

Do not continue if the team cannot access outcome evidence or no domain owner will resolve ambiguity. Fixing instrumentation and ownership is the work, not a delay before the work.

## Week 2: encode

### Day 6–7: write task contracts

For each case, define setup, input, limits, expected evidence, metadata, and review date. Redact or synthesize sensitive details.

Ask someone who did not author the case to find:

- a bad outcome that passes;
- a good outcome that fails.

Deliverable: `task-set-v1`.

### Day 8: inventory truth

For every criterion, identify the strongest evidence:

- environment;
- executable test;
- structured evidence;
- deterministic rule;
- model judgment;
- expert judgment.

Mark hard gates and quality dimensions.

Deliverable: grader map.

### Day 9: implement the bottom rungs

Build state checks, schema validators, invariants, and rules. Capture check-level evidence. Distinguish task failure from grader error.

Deliverable: deterministic grader suite.

### Day 10: draft judgment criteria

Write narrow criteria for what remains. Have experts label a calibration sample. Record disagreements. Do not begin with an overall one-to-ten judge.

Deliverable: rubric v1 and initial gold labels.

### Week 2 checkpoint

Run the harness twice on the same fixed artifacts. Deterministic graders should reproduce results. Any difference needs a reason. Confirm task, environment, and grader versions are stored.

## Week 3: measure

### Day 11–12: baseline

Run current production version A over the suite. Set repeated-trial counts from a pilot variance study and the reliability question the workflow actually poses. Store task-level outcomes, traces, cost, and latency.

Deliverable: baseline run with validity report.

### Day 13: calibrate judges

Run model judges on expert-labeled cases. Create confusion matrices and category breakdowns. Inspect false passes first. Narrow scope or route uncertain categories to people.

Deliverable: judge calibration report.

### Day 14: implement version B

Make the product change suggested by the failure analysis. This might be a prompt change, retrieval fix, tool redesign, policy route, deterministic guard, or model swap.

Resist changing five layers at once. Change one layer so the result can tell you which intervention mattered.

Deliverable: versioned candidate B.

### Day 15: paired comparison

Run A and B on the same tasks and budgets. Inspect new-only and old-only passes. Calculate uncertainty appropriate to the sample. Report hard gates, segments, cost, latency, and repeated reliability.

Deliverable: comparison report.

### Week 3 checkpoint

Write the release contract before the final held-out run. If the team already saw every case while tuning B, set aside fresh cases from production or delay the claim. “Held out emotionally” does not count.

## Week 4: operate

### Day 16–17: integrate the funnel

Put fast deterministic cases in local or pull-request workflows. Put broader, stochastic, and model-judged cases in nightly runs. Define invalid-run statuses and artifact retention.

Deliverable: local/PR/nightly pipeline.

### Day 18: held-out review

Run fresh cases. Review must-not-fail outcomes and judge false-pass risk. Apply the release contract. The decision owner chooses release, hold, limited rollout, or more evidence.

Deliverable: signed release decision.

### Day 19: production or shadow plan

Define:

- representative and risk-enriched samples;
- runtime guards;
- automated asynchronous scoring;
- human review volume;
- delayed outcomes;
- rollout mode and entry criteria;
- canary percentage where release is approved;
- rollback rules;
- privacy and retention.

Deliverable: production-evidence plan.

### Day 20: ownership and calendar

Name the seven owners. Schedule weekly trace review and monthly eval health review. Add incident-to-regression-case criteria. Record suite review dates.

Deliverable: responsibility map and operating calendar.

### Days 21–30: controlled evidence and learning

For a routine pilot that cleared its release contract, roll out under the plan. For a held candidate or consequential workflow, remain in shadow mode, replay fresh production cases, or continue expert review. The calendar does not overrule the evidence.

Review early traces. Compare offline predictions with production or shadow evidence. Fix instrumentation gaps. Add representative failures. Do not spend the remaining days polishing a dashboard while traces remain unread.

Deliverables:

- production or shadow trace sample;
- new regression cases;
- first proxy-ledger entry;
- 30-day retrospective;
- next-quarter backlog.

## The thirty-day artifact set

At completion, the repository or eval system should contain:

```text
evals/
  README.md
  decisions/
    objective.md
    release-v1.md
  tasks/
    manifest.yaml
    cases/
  graders/
    specs/
    deterministic/
    judge-prompts/
  calibration/
    gold-labels.jsonl
    judge-report.md
  runs/
    baseline/
    candidate/
    heldout/
  taxonomy/
    failures-v1.md
  production/
    sampling-plan.md
    review-log.md
  ownership.md
  CHANGELOG.md
```

The exact layout can change. Keep the artifacts.

## A slower track for consequential systems

Use sixty to ninety days—or longer—when failure can materially affect health, rights, money, security, or irreversible actions. Do not squeeze additional review into the same thirty boxes. Change the gates and let the dates follow.

### Stage 1: readiness and boundaries

- name accountable product, domain, risk, and release owners;
- define prohibited actions and autonomy limits;
- complete data, privacy, security, and environment readiness;
- establish rollback, incident, and evidence-retention paths.

### Stage 2: expert standard and discovery

- collect representative and adversarial cases;
- use qualified independent labels;
- adjudicate policy ambiguity;
- define critical failure classes before model comparison.

### Stage 3: implementation and independent challenge

- build deterministic prevention and graders;
- calibrate narrow judges by category;
- run repeated and clustered analyses;
- preserve a genuinely held-out audit set;
- have reviewers outside the implementation team challenge tasks, graders, and release logic.

### Stage 4: shadow, canary, and approval

- begin with shadow operation or recommendation-only use;
- require the full evidence package and formal approval;
- use a canary only after critical gates clear;
- retain human authority and runtime containment where consequence requires it;
- expand exposure by evidence, not by elapsed week.

The minimum viable loop is complete when the team can operate the measurement-and-learning system. Production autonomy is a separate decision. In a consequential system, “we reached Day 21” is not a control.

## Three pilot sizes

### Small team

- 20 cases;
- one engineer and one product/domain owner;
- manual trace review;
- deterministic graders plus one narrow judge;
- spreadsheet or JSONL results;
- weekly cadence.

### Growing product

- 50–200 cases;
- platform support;
- CI and nightly runs;
- expert calibration;
- segment reporting;
- production sampling;
- release contracts.

### Consequential domain

- risk-tiered tasks;
- independent domain labels;
- held-out adversarial audit;
- stronger runtime prevention;
- formal approval and evidence retention;
- privacy, legal, and safety review;
- controlled autonomy;
- explicit incident obligations.

Let consequence and repetition set the rigor. Fashion has enough responsibilities already.

## Common stalls

### “We need the perfect taxonomy first”

No. Version one needs to help select tasks. It will change.

### “We need hundreds of labels”

You need enough to learn and calibrate the first decision. Start with twenty to fifty tasks and expand where uncertainty matters.

### “We should choose a platform”

Choose the task and evidence model first. Tools become easier to evaluate after you know the work.

### “The judge agreement is only 80 percent”

Inspect by category and error cost. It may be excellent for some criteria and unusable for others.

### “Production data is too sensitive”

Then build a governed redaction and synthetic-fixture path. Do not pretend public benchmarks represent your users.

### “The new version's average is better”

Inspect paired regressions, hard gates, segments, cost, and reliability.

### “Nobody can attend weekly review”

Then the organization has decided that learning from product behavior is lower priority than every competing meeting. Make that decision visible.

## The next ninety days

After the pilot:

### Month 2

- expand task coverage from production;
- improve the trace viewer;
- automate more bottom-rung graders;
- stabilize CI and nightly runs;
- validate the first offline proxy online;
- add judge drift audit.

### Month 3

- onboard a second workflow using shared schemas;
- formalize central/local ownership;
- add held-out and adversarial cases;
- measure learning lead time;
- review cost per accepted outcome;
- retire weak or duplicate cases.

### Quarter end

- audit coverage and rights;
- review incidents and regression memory;
- compare proxy and user outcomes;
- update autonomy and runtime controls;
- publish an internal eval health report;
- choose the next capability frontier.

## Field move

Copy Template 16, choose the workflow and decision owner, and book the first trace review. The loop begins one calendar invite before any evaluator runs.
