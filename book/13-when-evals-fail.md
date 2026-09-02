# When Evals Fail

*The eval is part of the system. It can drift, leak, saturate, break, and become extremely pleased with itself.*

An eval can improve while the product worsens.

No paradox here. The team optimized what the eval measures, and the measurement stopped representing the goal.

Goodhart's law is commonly summarized as: when a measure becomes a target, it ceases to be a good measure. AI systems add several twists. Models can infer grader preferences. Training data may contain benchmark answers. Teams may repeatedly tune prompts against the same cases. Model judges may share biases with generators. A test harness may encode the wrong behavior.

The eval loop needs an immune system.

## Failure mode 1: grader gaming

The system learns a shortcut that satisfies the grader.

Examples:

- copy rubric phrases into the response;
- include many citations without improving support;
- create an empty expected file;
- hard-code benchmark examples;
- make answers longer because the judge rewards completeness;
- call the escalation tool on every difficult case because escalation avoids incorrect outcomes;
- refuse broadly because safety errors are weighted more than helpfulness.

Countermeasures:

- adversarial “bad but passing” cases;
- hidden or rotating tasks;
- diverse evidence sources;
- outcome and process checks;
- penalty for unnecessary escalation or refusal;
- expert audits of high scores;
- production outcomes;
- a hacker role during grader review.

Ask someone to maximize the score while violating intent. Red-team the measurement, not only the model.

## Failure mode 2: wrong executable contract

Tests can be too narrow, too broad, stale, or unfair.

SWE-bench Verified is the recurring example. It was created to improve task quality through substantial developer review [SWE-02] [SWE-06]. Later targeted auditing still found material issues among often-failed tasks, and contamination concerns weakened interpretability [SWE-03].

Careful curation bought SWE-bench time, not immortality.

Audit executable cases for:

- valid alternatives rejected;
- consequential outcomes unchecked;
- hidden implementation constraints;
- stale dependencies or policies;
- fixture leakage;
- tests modified or bypassed by the agent;
- nondeterminism;
- ambiguous issue descriptions.

When a task is wrong, fix its history transparently. Recompute baselines. Never edit the case while leaving old scores in the same chart.

## Failure mode 3: contamination

The model has seen evaluation items, answers, gold patches, or close variants during training or development.

Signs include:

- unusually exact reproduction of reference artifacts;
- comments or identifiers from hidden solutions;
- benchmark gains that do not transfer to fresh tasks;
- performance concentrated on old public cases;
- suspiciously low exploration or time-to-solution.

Contamination is difficult to prove from behavior alone. Manage risk:

- maintain private or time-split holdouts;
- create post-training-cutoff tasks where feasible;
- rotate production-derived cases;
- compare public and fresh internal performance;
- restrict gold artifacts;
- log developer access;
- avoid publishing protected cases;
- report uncertainty without cosmetic surgery.

### Split by the thing that can leak

A random row split is not clean merely because the random-number generator enjoyed itself. Rows often share a parent: one query paired with many results, several chunks from one document, multiple turns from one conversation, or paraphrases grown from the same synthetic seed. Put siblings on both sides of the split and the test set starts sending postcards from training.

In public talks about its evals, a major international delivery company described an early fine-tuning result that changed after the team replaced a row-level split with a split that kept each search query on only one side. Treat this as a field report, not a published effect estimate. Its durable lesson is the unit of separation: split on the smallest group that can carry memorized signal across rows.

| Rows in the dataset | Group to keep together |
|---|---|
| One query, several results | Query or intent family |
| Chunks from one source | Source document |
| Turns from one interaction | Conversation or user episode |
| Synthetic variations | Parent seed or source example |
| Related agent tasks | Repository or task family |

Record the group key in dataset provenance and assert that development, calibration, and audit groups do not overlap. If the product question genuinely concerns familiar groups, say so. An interpolation test can be useful. It should not borrow a generalization costume.

OpenAI's retirement report for SWE-bench Verified described evidence consistent with gold-patch exposure across frontier models it examined [SWE-03]. HealthBench and BrowseComp maintainers explicitly ask people not to reveal examples, even where data may be accessible [HEALTH-03] [BROWSE-01]. Anti-leak discipline is part of eval validity.

## Failure mode 4: saturation

When nearly every candidate scores near the ceiling, the suite stops differentiating improvements.

Saturation may mean:

- the capability is solved for the tested population;
- cases are too easy;
- graders are too lenient;
- systems have overfit;
- the product moved to harder work;
- only a few noisy cases remain.

A harder suite should represent harder work, not riddles added to spread leaderboard scores. Add cases representing the next real capability frontier, higher reliability, harder combinations, or consequential segments.

Track:

- score distribution across systems;
- number of always-pass cases;
- disagreement concentrated in grader-noisy cases;
- production failures absent from the suite;
- gap between public and private holdouts;
- marginal information from adding runs.

Retire or move solved cases into a lightweight regression suite. Capability suites should remain diagnostic.

## Failure mode 5: stale truth

Policies, products, tools, and user expectations change.

An old eval may reward behavior now prohibited. A clinical guideline may update. A support policy may gain an exception. A source may be retracted. A tool schema may change error semantics. A user group may adopt a new workflow.

Every task and grader needs:

- owner;
- source and policy dependency;
- creation and last-review date;
- review trigger;
- planned expiry or review-by date;
- deprecation status.

Run dependency queries after a policy change: which tasks, rubrics, gold labels, and monitors rely on this policy version?

If the answer is “we will search the spreadsheet,” the spreadsheet is requesting a database costume.

## Failure mode 6: judge drift

A model judge can change because:

- the model version changes;
- provider behavior shifts behind an alias;
- the prompt or rubric changes;
- evidence length grows;
- production categories change;
- output style changes;
- language mix shifts.

Monitor agreement on a stable gold audit set and on fresh production labels. Break down false passes and false fails by category. Recalibrate thresholds. Preserve old judge versions for re-grading where possible.

Do not let a judge grade the examples used to calibrate it. Avoid sharing prompt context between generator and judge unless the design requires it. Independence can be partial, but it should be deliberate.

## Failure mode 7: proxy divorce

The offline score improves, but the user outcome does not.

Possible causes:

- score rewards qualities users do not value;
- users adapt behavior;
- latency or friction cancels accuracy gains;
- selection excludes hard production cases;
- the system optimizes communication while state accuracy stays flat;
- the effect is statistically visible but practically trivial;
- downstream processes cannot use the improvement.

Controlled production experiments catch this proxy divorce. Spotify's funnel treats online outcomes as calibration for offline evals [ORG-04]. If the proxy repeatedly fails to predict the outcome, revise or demote it.

Keep a **proxy ledger**:

| Offline metric | Intended product outcome | Last validated | Observed relationship | Decision |
|---|---|---|---|---|
| Citation support | Editor correction time | 2026-Q3 | Strong decrease | Keep |
| Response length | User satisfaction | 2026-Q2 | None | Remove |
| Simulated resolution | 7-day recontact | 2026-Q3 | Weak | Revise |

## Failure mode 8: metric collapse

A single aggregate hides tradeoffs.

An 84 can contain:

- excellent routine performance;
- poor Spanish performance;
- one dangerous policy violation;
- lower cost;
- worse latency;
- more unnecessary escalations.

Report profiles and hard gates. Keep raw task-level evidence. Use a weighted score for navigation, not absolution.

HealthBench's case criteria and DeepResearch Bench's separate dimensions both resist total collapse [HEALTH-01] [DRB-01]. τ³-bench's composite evaluator preserves state, action, and communication distinctions [TAU-03]. All three break the score apart, and for good reason.

## Audit the eval itself

Run a monthly or quarterly eval health review.

### Coverage

- Which high-volume and high-consequence capabilities are represented?
- Which production failure categories have no tasks?
- Which segments are thin?
- Which tools and policies lack error-path cases?

### Grader validity

- What are false-pass and false-fail rates?
- Which criteria have high reviewer disagreement?
- Can bad outputs game the grader?
- Are hard gates tied to strong evidence?

### Dataset health

- Which cases are stale, duplicate, leaking, or saturated?
- Are discovery and measurement samples distinguished?
- Are versions and provenance complete?
- Are rights and anti-contamination constraints honored?

### Operational health

- How often do harness or grader errors occur?
- Is re-grading reproducible?
- How long from incident to regression case?
- Are release exceptions closed?
- Is production sampling occurring at the promised cadence?

### Product validity

- Do offline gains predict online outcomes?
- What failures do users report that scores miss?
- What behaviors are being optimized unintentionally?
- Should any metric be retired?

Assign actions and owners. An audit without follow-through is merely an eval of the eval loop, which can continue recursively until the sun cools.

## Retiring a benchmark

Retirement is healthy. Create a deprecation record:

```yaml
suite: research_quality_v2
status: deprecated
reason:
  - 94_percent_always_pass
  - new_product_supports_multi_source_tasks
  - suspected_example_exposure
replacement: research_quality_v3
score_comparability: none
historical_use: regression_only_for_12_months
decision_owner: research_product
date: 2026-08-24
```

Preserve historical results with labels. Do not splice new-suite scores into old charts. If a few cases remain valuable, migrate them with new IDs or explicit lineage.

Benchmark retirement can feel like losing progress. Retirement proves that someone is still watching the instruments.

## Field move

Use Exercise 12 and Template 11 to attack one suite: produce a bad pass and good fail, find a stale criterion and missing production category, audit judge false passes, and nominate a saturated case for retirement. The eval should emerge slightly bruised, with fewer ways to lie.
