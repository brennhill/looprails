# Appendix D: Statistical Recipes

This appendix is a desk reference, not a substitute for statistical review in high-consequence work. Every recipe begins with a defined unit, sample, and decision. Run calculations in reviewed code and preserve the inputs with the eval result.

## Recipe 1: Binomial pass rate with Wilson interval

**Use when:** Each independent unit has a binary pass/fail result and the sample design supports treating units as independent.

**Inputs:** Passes `x`, total valid units `n`, confidence level.

**Estimate:**

`p̂ = x / n`

For a 95 percent Wilson interval with `z = 1.96` [STAT-02]:

```text
denominator = 1 + z²/n
center = (p̂ + z²/(2n)) / denominator
half_width = z/denominator × sqrt(p̂(1-p̂)/n + z²/(4n²))
interval = center ± half_width
```

**Worked example:** `x = 43`, `n = 50`, `p̂ = .86`. Wilson interval is approximately `.738` to `.930`.

**Report:** “43/50 tasks passed (86%; Wilson 95% CI 73.8–93.0%).”

**Do not use without adjustment when:** Tasks are clustered, trials repeat the same task, selection is failure-enriched, or labels have important uncertainty.

## Recipe 2: Paired binary comparison

**Use when:** Old and new systems run on the same tasks under comparable conditions.

Build:

| | New pass | New fail |
|---|---:|---:|
| Old pass | both pass | old only |
| Old fail | new only | both fail |

The observed difference is:

`(new_only - old_only) / total_tasks`

For a simple exact McNemar/binomial test, condition on discordant pairs `d = new_only + old_only` and test whether new-only wins follow `Binomial(d, .5)` [STAT-03].

**Worked example:** New only 18, old only 8, total 100. Difference is `+10` points. Exact two-sided p-value is approximately `0.0755`.

**Report:** Effect size, uncertainty or test, all four cells, and categories among discordant cases. Do not report only the p-value.

**Decision note:** A must-not-fail regression can block release regardless of aggregate improvement.

## Recipe 3: Cluster bootstrap for a paired difference

**Use when:** Tasks share a customer, document, conversation, repository, scenario, or other source of correlated failure.

**Procedure:**

1. Choose the cluster level before analysis.
2. Keep old/new results paired within each task.
3. Sample clusters with replacement until the bootstrap sample has the original number of clusters.
4. Include all tasks from each sampled cluster, or apply the planned within-cluster resampling design.
5. Calculate paired pass-rate difference.
6. Repeat many times, such as 5,000 or 10,000.
7. Use appropriate quantiles for an interval and inspect the bootstrap distribution.

**Report:** Number of clusters and tasks, resampling procedure, repetitions, observed effect, and interval.

**Caution:** Five clusters remain weak evidence even if they contain thousands of questions. More rows do not manufacture more independent worlds.

Anthropic's guidance provides further examples and cautions for clustered eval data [STAT-01].

## Recipe 4: Repeated stochastic tasks

**Use when:** Model sampling, user simulation, tools, or control paths vary.

For task `i`, run `r` trials and estimate:

`p̂_i = passes_i / r`

Report across tasks:

- mean and median `p̂_i`;
- always-pass share;
- unstable share (both pass and fail observed);
- always-fail share;
- cost and latency distribution;
- user-relevant sequence reliability.

Do not pool all trials and present them as independent tasks. Preserve the task hierarchy.

If comparing variants, use matched seeds or simulated-user configurations where that meaningfully reduces noise, but do not claim deterministic comparability when external tools vary.

## Recipe 5: pass@k

**Use when:** The product generates k candidates and needs at least one success.

Under a simplified independent per-attempt probability `p`:

`pass@k = 1 - (1 - p)^k`

For code-generation benchmarks that sample `n` candidates and observe `c` correct, use the appropriate finite-sample estimator described by Chen et al. rather than substituting the simplistic formula [STAT-04].

Also measure:

- selector success given a correct candidate exists;
- total generation and grader cost;
- latency under parallel or sequential generation;
- correlation among candidates;
- fraction of tasks where every candidate fails the same way.

Overall product success is not pass@k if the selector cannot identify the good candidate.

## Recipe 6: pass^k

**Use when:** The user needs k consecutive tasks or sessions to succeed.

Under a simplified independent probability `p`:

`pass^k = p^k`

At `p = .75`:

- `pass^3 = 42.19%`
- `pass^8 = 10.01%`

τ-bench foregrounds this repeated-reliability view [TAU-01].

**Caution:** Dependence matters. Stable task-specific weaknesses can make sequence success lower or differently distributed. Estimate user- or scenario-level reliability from grouped data when available.

## Recipe 7: Judge confusion matrix

**Use when:** A model judge is compared with accepted expert labels.

Define “pass” as the positive label:

- `TP`: judge pass, expert pass;
- `FP`: judge pass, expert fail—the false passes;
- `FN`: judge fail, expert pass;
- `TN`: judge fail, expert fail.

Calculate:

```text
pass precision = TP / (TP + FP)
pass recall = TP / (TP + FN)
false-pass rate = FP / (FP + TN)
false-fail rate = FN / (FN + TP)
```

Track insufficient-evidence and grader-error outcomes separately rather than forcing them into pass or fail.

Break the matrix down by criterion, severity, language, length, and ambiguity. Choose thresholds and routing based on error cost.

## Recipe 8: Stratified production estimate

**Use when:** Production is sampled at different rates by segment or risk stratum.

For mutually exclusive strata `h`, estimate each stratum rate `p̂_h` and weight by its share `W_h` in the target production population:

`p̂ = Σ W_h p̂_h`

Record selection probabilities and current production stratum sizes. Calculate uncertainty using a method matching the sampling design.

Do not treat a queue that contains every complaint and one in a thousand ordinary runs as a simple random sample. Its raw failure proportion is a review workload statistic, not a production rate.

## Recipe 9: Zero observed critical failures

**Use when:** A representative sample contains no observed event of a defined critical failure.

For `x = 0` events in `n` independent Bernoulli trials, the exact one-sided 95 percent upper confidence bound is:

`upper = 1 - .05^(1/n)`

The rule-of-three approximation is:

`upper ≈ 3/n`

[STAT-05]

**Worked example:** Zero failures in 300 trials give an exact upper bound of about `.00994`, or 0.994 percent. The rule of three gives 1 percent.

**Report:** “0/300 critical failures observed; one-sided 95% upper bound 0.994%, assuming representative independent trials.”

**Caution:** The calculation does not cover missing failure classes, adversarial distribution shift, correlated tasks, unreliable graders, or hidden incidents. Cluster at the source of shared failure and use risk-specific evidence alongside the bound.

## Recipe 10: Repeated looks at accumulating results

**Use when:** A release metric is inspected repeatedly and the team may act before a fixed sample is complete.

Choose and record one design before the run:

- fixed horizon: one inferential decision at a pre-specified sample size;
- planned interim analyses: a reviewed sequential design with explicit decision boundaries;
- open-ended monitoring: always-valid p-values or confidence sequences [STAT-06] [STAT-07].

Record every look, the stopping rule, and whether a decision was possible at that look. A nightly dashboard used only for diagnosis does not require a hypothesis test. A nightly dashboard that can release the product does.

Do not report a fixed-horizon p-value after stopping on the first favorable result.

## Recipe 11: Several simultaneous thresholds

**Use when:** A release contract contains several inferential gates or allows several possible reasons to ship.

1. Write the complete Boolean rule: which gates are `AND`, which are `OR`, and which are diagnostics.
2. Mark deterministic hard gates separately.
3. Specify the acceptable false-release and false-hold rates for the complete rule.
4. If any false-positive claim matters, use a family-wise correction such as Holm's procedure [STAT-08].
5. If all gates must pass, estimate the combined false-hold rate.
6. Simulate correlated metrics and the exact release rule using pilot data.

**Simple illustration:** Under independence, five 5-percent tests with an `OR` rule have a 22.6 percent chance of at least one false green under the global null. Five gates that each clear 95 percent of the time have only a 77.4 percent chance of all clearing.

The independence assumption is usually crude. Its job here is to reveal the direction of the problem, not finish the analysis.

## Recipe 12: Cost per accepted outcome

**Use when:** Variants differ in model cost, retries, tool use, grading, or human review.

```text
total_cost =
  generation_cost
  + tool_cost
  + retry_cost
  + automated_grader_cost
  + human_review_cost
  + failed_run_overhead

cost_per_accepted_outcome = total_cost / accepted_outcomes
```

State how human time is valued and which infrastructure costs are included. Report cost per attempt and acceptance rate too; the decomposition explains movement.

Pair with median and p95 latency. A cheap task that takes five minutes may have unusual product economics.

## Recipe 13: Simulation-based power

**Use when:** The release rule combines pairing, clusters, repeated trials, hard gates, or several thresholds.

**Procedure:**

1. Fit or specify a plausible data-generating process from pilot results.
2. Include task difficulty, cluster variation, trial noise, grader error, and missing runs as relevant.
3. Simulate results under candidate true effects.
4. Apply the exact planned release rule.
5. Repeat many times.
6. Estimate how often the rule releases under each effect and how often hard-gate violations occur.
7. Vary assumptions.

**Deliverable:** A table of true effect, sample design, release probability, expected cost, and key assumptions.

Simulation does not remove assumptions. It makes them executable and discussable.

## Reporting checklist

Every quantitative eval report should state:

- decision and pre-specified rule;
- unit of evaluation;
- target population;
- sampling and enrichment;
- tasks, clusters, and trials;
- invalid or missing results;
- model, prompt, tool, grader, and harness versions;
- numerator, denominator, estimate, and uncertainty;
- paired disagreements for comparisons;
- hard-gate outcomes;
- segment results;
- cost and latency;
- grader validity;
- limitations not captured by the interval;
- production follow-up.

If the report cannot state these yet, label the result exploratory. Exploratory is a respectable word. It has prevented many charts from being promoted beyond their abilities.
