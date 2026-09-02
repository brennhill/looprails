# Statistics Without the Lab Coat

*You do not need to become a statistician. You do need to stop treating 43 out of 50 as a law of nature.*

An eval score is a sample, produced by a procedure, briefly pretending to stand in for the future.

Three bits matter:

- **estimate:** the observed score is not the true future rate;
- **sample:** the cases stand in for a larger population;
- **procedure:** prompts, models, seeds, retries, graders, and budgets affect the result.

Statistics help a team say how much evidence it has and what remains uncertain. They do not make a weak task contract strong or rescue a judge that approves unsupported claims. Statistics keep the measurement honest.

## Start with the unit

What is one observation?

- a response;
- a full conversation;
- a completed task;
- a user session;
- an account over a week;
- a document;
- a model run on a task;
- a release evaluated across tasks.

For agents, the unit is usually a completed end-to-end task. Scoring each turn as though it were independent inflates the sample and misses outcome failure.

The unit should match the decision. If users perform eight tasks over a month, per-task success and user-level reliable completion answer different questions.

## Forty-three out of fifty

An agent passes 43 of 50 tasks. The observed rate is:

`43 / 50 = 0.86`, or 86 percent.

How uncertain is that estimate? For a binomial proportion, a Wilson 95 percent interval behaves well as a default across many ordinary sample sizes and rates [STAT-02]. The formula is:

```text
center = (p̂ + z²/(2n)) / (1 + z²/n)
half   = z/(1 + z²/n) × sqrt(p̂(1-p̂)/n + z²/(4n²))
```

With `p̂ = .86`, `n = 50`, and `z = 1.96`, the interval is approximately 73.8 to 93.0 percent.

The point estimate clears an 85 percent threshold. The interval does not. If the release decision requires the lower bound to clear 85 percent too, run more representative cases or reconsider the threshold and risk model.

Why Wilson rather than the familiar `p ± 1.96 × standard error`? The simple normal interval behaves poorly with small samples and proportions near zero or one. Wilson stays within sensible bounds and has better coverage.

Show the numerator and denominator beside the interval. “86% ± something” hides whether the suite had 50 cases or 50,000.

## Paired comparisons

When comparing variants, run them on the same tasks. Pairing removes much of the variation caused by task difficulty.

Suppose 100 tasks produce:

| Result | Cases |
|---|---:|
| Both pass | 62 |
| New only passes | 18 |
| Old only passes | 8 |
| Both fail | 12 |

Old passes `62 + 8 = 70`. New passes `62 + 18 = 80`. The observed difference is ten percentage points.

The evidence for change lives in the 26 discordant pairs. Under a no-difference assumption, either version would be equally likely to win each discordant case. An exact two-sided binomial form of McNemar's test asks how surprising 18 versus 8 is [STAT-03]. The result is approximately `p = 0.0755`.

Ten points looks promising, but the result does not cross a conventional 0.05 threshold. Do not translate that into “no improvement.” The uncertainty remains material. Inspect the 26 disagreements, report an interval for the paired difference, and decide whether to collect more evidence.

The p-value is not a tiny magistrate who declares the feature innocent or guilty.

### A published paired-intervention example

The ACES study compares agent runs with and without a target skill while holding the task, agent, model, workspace, harness, and scorer fixed. Across 947 scored paired task cases, it reports mean composite Skill Lift of `0.2134` with a 95 percent paired-case interval from `0.1967` to `0.2301` [ACES-01]. Of those paired cases, 689 had positive composite lift, 171 had zero lift, and 87 had negative lift.

The 87 negative pairs are where debugging starts. An average positive effect did not make every skill helpful. Some negative pairs exposed routing overhead, skipped verification, truncated responses, or extra tool use without better outcomes.

The paper also reports near-zero rank correlation between two static skill-review scores and live lift on the subset with matching metadata. That does not prove static review is useless; it supports a narrower conclusion: document quality and runtime contribution were different measurements in this corpus. The authors caution that harness coverage was uneven, the corpus concentrated on enterprise infrastructure skills, and the paired effect remains dependent on the declared workspace and baseline policy.

Steal the method, not the headline: compare interventions on matched tasks, keep the support environment fixed, report the delta and its uncertainty, and inspect negative pairs even when the mean is positive.

## Minimum effect before significance

Before running the comparison, decide what improvement would change the product decision.

If every real improvement has product value, say so. Do not invent a larger threshold for statistical convenience. But keep the size of the observed change separate from the evidence that the change is real: a positive result from one noisy run may disappear on the next. Decide how much uncertainty the decision can tolerate, then keep every hard product constraint intact.

Write:

- minimum worthwhile effect;
- must-not-regress dimensions;
- acceptable false-release risk;
- acceptable false-hold risk;
- sample size or evidence budget;
- follow-up production test.

Now statistics has a job: help make the decision.

## pass@k versus pass^k

Two metrics answer opposite product questions.

If each independent attempt succeeds with probability `p`:

`pass@k = 1 - (1 - p)^k`

This gives the chance that at least one of k attempts succeeds. It fits generate-and-select workflows, where several candidates are produced and a reliable verifier picks a winner. The code-evaluation literature uses a finite-sample estimator for pass@k when drawing candidates [STAT-04].

`pass^k = p^k`

This gives the chance all k uses succeed. It fits repeated reliability.

At `p = .75` and `k = 3`:

- `pass@3 = 98.44%`
- `pass^3 = 42.19%`

At `k = 8`, `pass^8` is about 10 percent under the simplistic independence assumption. Real attempts may be correlated, which can make retries less valuable than the formula suggests. If a model always misunderstands the same policy, eight samples may produce eight elegantly varied misunderstandings.

Report the metric matching the workflow:

- best-of-n candidate generation → pass@k plus selector quality and cost;
- unattended repeated tasks → pass^k or user/session-level success;
- retries after transient tool failure → conditional recovery rate;
- escalation workflow → automation rate plus resolved-outcome rate.

## Repeated trials and dependence

LLM outputs vary. Run multiple trials per consequential task when:

- sampling temperature is nonzero;
- tool results vary;
- user simulators are stochastic;
- the agent explores different paths;
- the product permits retries or selection.

Store trial-level results. Report:

- mean success across tasks;
- distribution of task success probabilities;
- fraction of always-pass, unstable, and always-fail tasks;
- pass^k for reliability;
- pass@k for selection scenarios;
- cost and latency across trials.

Do not treat ten trials of one task as equivalent to one trial of ten tasks. The first estimates variability on that task; the second estimates breadth across tasks.

## Clusters are families of shared trouble

Suppose an eval contains fifty questions drawn from five source documents. Questions from the same document share retrieval structure, formatting, topic, and possible extraction errors. They are clustered.

Treating all fifty as independent makes uncertainty too small. The effective sample size may be closer to five than fifty for some failure modes.

Common clusters include:

- customer or account;
- conversation;
- document;
- repository;
- policy;
- language;
- domain;
- generated user persona;
- day or deployment batch.

Anthropic's statistical guidance reports examples where cluster-aware standard errors exceeded naive ones by more than threefold [STAT-01]. Cluster at the level that can create correlated errors. If uncertain, report both task-level and cluster-level summaries.

A simple bootstrap approach is to resample clusters, then observations within selected clusters where appropriate. For paired comparisons, preserve pairing during resampling.

## Confidence intervals for what?

An interval reflects sampling assumptions. It does not include every uncertainty:

- mislabeled gold cases;
- grader bias;
- benchmark contamination;
- future distribution shift;
- model provider changes;
- harness bugs;
- missing failure categories.

Report these separately. “95% confidence” does not mean 95 percent confidence that the product is safe. It means the interval procedure has a particular long-run behavior under its model.

The label is unfortunately confident. The mathematics is more modest.

## Zero disasters is not zero risk

A must-not-fail suite runs 300 representative, independent trials and observes no catastrophic failures. The observed rate is zero. The plausible rate is not.

For zero events in `n` trials, the exact one-sided 95 percent upper bound is:

`1 - .05^(1/n)`

A handy approximation is the **rule of three**: the upper bound is about `3/n` [STAT-05]. With zero events in 300 trials, that is roughly 1 percent. With zero in 3,000, it is roughly 0.1 percent.

Report it plainly:

> 0/300 catastrophic failures observed; one-sided 95% upper bound approximately 1.0% under the sampling assumptions.

This calculation assumes the trials reasonably represent the future and contribute independent information. Three hundred slight rewrites of one benign task do not establish a one-percent bound for the product. Correlated tool failures, shared accounts, common documents, and adversarial behavior can make the effective sample much smaller.

For a catastrophic failure, zero observed events may be a necessary release condition. It is rarely sufficient evidence by itself. Pair the bound with risk analysis, targeted adversarial cases, runtime prevention, incident response, and a sample large enough for the rate you need to rule out. A zero is lovely, but offers no force field.

## Several metrics, one release

AI products have multiple dimensions:

- outcome success;
- policy compliance;
- factual support;
- must-not-fail safety criteria;
- latency;
- cost;
- escalation rate;
- user effort;
- consistency across segments.

Avoid combining all of them into one weighted score unless the weights represent a real, accepted tradeoff. A release rule can be multi-dimensional:

```text
Release only if:
  paired outcome improvement meets the product's decision rule
  no high-severity regression case fails
  policy false-pass risk stays within the approved limit
  latency remains within the service-level requirement
  cost per accepted task remains within the approved budget
  protected segments meet their pre-specified requirements
```

Some lines are decision criteria; others are hard barriers. Mark them. A gain on the first line cannot compensate for breaking one of the latter. Yes, that is clumsier than “quality score 82.” It also describes an actual product.

If the team looks at twenty metrics and reports only the three that improved, uncertainty is no longer the main problem. Pre-register the primary decision metrics. Treat others as diagnostics and label exploratory findings.

The Boolean logic matters. If any one of five independent tests at the 5 percent level can justify release, the chance of at least one false green under the global null is about:

`1 - .95^5 = 22.6%`

If all five gates must clear and each has a 95 percent chance of clearing for a truly acceptable system, the chance that all clear is only:

`.95^5 = 77.4%`

The first design creates false passes. The second creates false holds. Independence is a simplifying assumption, but the example exposes the tradeoff.

For a family of inferential claims where any false green matters, use a family-wise procedure such as Holm's sequentially rejective method [STAT-08]. For an all-gates release contract, simulate the complete decision rule and measure both false-release and false-hold rates. Keep deterministic hard gates separate from statistical claims. Do not Bonferroni every dashboard light because someone once heard the word “multiple.”

## Nightly results and the peeking problem

A fixed-horizon interval or test assumes the sample size or stopping rule was fixed independently of the accumulating result. It does not survive this routine:

1. Run the suite every night.
2. Look at the result every morning.
3. Ship on the first green day.
4. Call the stopping rule “agile.”

Continuous monitoring with ordinary fixed-horizon inference can make false positives much more common. Johari and colleagues develop always-valid inference for decisions made under continuous monitoring [STAT-06]. Confidence sequences are the interval version: a sequence of ranges designed to retain coverage across an open-ended series of looks [STAT-07].

Choose one of three honest approaches:

- pre-specify the sample size and decision date, using nightly charts only for operational diagnosis;
- pre-specify a small set of interim looks with a reviewed sequential design;
- use an always-valid method or confidence sequence implemented by someone who can defend its assumptions.

Nightly monitoring is not itself a statistical sin. The sin is waiting for the line to cross and then analyzing the result as if the stopping time had been fixed all along. The graph may be green; the method is wearing a fake moustache.

## Power and sample size

Power asks how often the planned sample would detect the change you care about.

The required size depends on:

- baseline rate;
- minimum effect;
- paired agreement structure;
- desired false-positive and false-negative rates;
- clustering;
- number of repeated trials;
- expected missing or grader-error results.

Use simulation when the design is complex. Take pilot data, model task and cluster variability, simulate old/new outcomes under candidate effects, and apply the planned decision rule. Estimate how often the rule ships.

Simulation is usually easier and more faithful than forcing the design into one textbook formula. Document the assumptions.

With a first suite of 20–50 cases, use the result for discovery and directional comparison [ANTH-01]. Do not dress it up as certification. Grow coverage from real failures and collect more representative samples before making consequential release claims.

## Cost per accepted outcome

Compare total system cost, not model-call price:

```text
cost per accepted outcome =
  (generation + tools + retries + graders + human review + failed-run overhead)
  / accepted outcomes
```

A more expensive model may reduce retries and human review. A cheaper judge may create false passes that cost more in production. A best-of-five system may raise pass@k and triple cost.

Report:

- cost per attempt;
- attempts per task;
- grader cost;
- human-review minutes;
- cost per passed task;
- cost per accepted production outcome where measurable.

Latency deserves similar decomposition. Mean latency hides users at the tail. Report median and a high percentile such as p95, and separate agent work from tool waiting.

## A small release worksheet

| Question | Example answer |
|---|---|
| Primary unit | Completed customer task |
| Sample | 200 paired tasks, stratified by policy category |
| Primary effect | New minus old hard-gate pass rate |
| Minimum useful effect | Any positive improvement that the evidence can distinguish from run noise |
| Must-not-regress | Unauthorized action, duplicate side effect |
| Uncertainty | Cluster bootstrap by customer scenario |
| Repeated trials | Set from pilot variance and the workflow's reliability question |
| Cost rule | Stay within the approved operating budget |
| Latency rule | Meet the existing service-level requirement |
| Production follow-up | Controlled rollout sized by the product's blast-radius policy |
| Decision owner | Support product director |

Write the sheet before seeing the run. This example treats any real gain as useful and keeps the operating constraints separate. Another product may have a migration cost large enough to require a bigger effect. Neither policy comes from statistics, and neither comes from this book.

## Field move

Run Exercises 7 and 8 on one current result. Write the denominator, uncertainty, clusters, repeated trials, paired disagreements, sequential-use reliability, and cost per accepted outcome; add the zero-event, repeated-look, and multiple-threshold recipes when they apply. Nobody needs a statistics seminar at every release meeting. We do need one decimal place to stop impersonating certainty.
