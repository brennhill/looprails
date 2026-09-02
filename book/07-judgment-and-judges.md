# Judgment and Judges

*An LLM judge is an opinionated colleague who never sleeps. Handy, certainly. Correct, pending calibration.*

Some criteria require interpretation. Did the answer address the user's real concern? Does the cited passage support the claim? Was the refusal appropriately explained? Did the response communicate urgency without inventing a diagnosis?

At product scale, humans cannot read every output. Model judges can apply a rubric repeatedly and cheaply enough to support iteration.

They are also models. The judge may prefer verbose answers, familiar styles, its own phrasing, or information that sounds plausible. It may be inconsistent near a threshold. It may fail systematically on a language or domain. Calibrate it before giving it a badge.

## Give the judge a small question

Broad prompt:

> Rate this response from 1 to 10 for correctness, helpfulness, safety, relevance, style, and overall quality.

This prompt compresses six undefined dimensions into a number whose precision is purely decorative.

Narrow prompt:

> Given the customer's request, policy excerpt, final account state, and response, did the response accurately state whether a refund was issued? Return `pass`, `fail`, or `insufficient_evidence`. Cite the exact state field and response phrase used.

The narrow question supplies evidence, defines labels, and requires a rationale tied to artifacts.

Build several narrow graders instead of one oracle. DeepResearch Bench demonstrates the split between report quality and citation quality [DRB-01]. HealthBench's case-specific criteria go further: the judge evaluates whether each criterion is satisfied, not whether the response has an aura of wellness [HEALTH-01].

## Prefer classification and comparison

Judges tend to perform better on constrained decisions than on uncalibrated scalar scoring [OPENAI-01]. Prefer outputs such as:

- pass / fail / insufficient evidence;
- supported / partial / unsupported;
- violation category;
- A better / B better / tie;
- criterion present / absent;
- escalation required / not required.

If a numeric scale is necessary, define every level with examples and interpret the result as ordinal unless calibration supports more.

Pairwise comparison often fits a choice between two variants. It reduces the task from inventing an absolute score to deciding which output better satisfies the criteria. Randomize presentation order and measure position bias. Include ties. A judge forced to choose will discover preferences even when the outputs are equivalent—rather like a wine taster forbidden to say, “These are the same bottle.”

## A judge prompt with an evidence contract

```text
SYSTEM
You are grading one criterion only. Use only the supplied task contract,
evidence, and response. Do not use outside knowledge. If the evidence cannot
resolve the criterion, return insufficient_evidence.

CRITERION
The response must not claim that a refund was issued unless final_state shows
refund_status is pending or completed for the requested order line.

TASK
{task_input}

FINAL STATE
{final_state_json}

RESPONSE
{agent_response}

OUTPUT JSON
{
  "label": "pass | fail | insufficient_evidence",
  "response_span": "exact relevant phrase or empty",
  "state_evidence": "exact relevant field or empty",
  "reason": "one concise sentence"
}
```

Validate the JSON. Treat malformed output as a grader error, not a task failure. Store the exact prompt, judge model, settings, and evidence.

Ask for evidence spans because explanations alone can be post-hoc. The span lets code or a reviewer verify that the judge looked at the relevant material.

## Build the gold set

Calibration requires cases labeled by people qualified to define the criterion.

A practical starting process:

1. Sample across the expected categories and difficulty levels; set the count from the judge's intended use and the uncertainty you can tolerate.
2. Include clear passes, clear fails, ambiguous cases, and adversarial near misses.
3. Have qualified reviewers label independently where the stakes or ambiguity require it.
4. Resolve disagreements through a named domain owner.
5. Record both final labels and disagreement reasons.
6. Freeze a calibration split and a later audit split.

No wisdom number appears. Good. A practical judge-building method begins with domain experts making binary decisions and writing critiques, then accumulates edge cases as the rubric and prompt mature [JUDGE-01]. PaperBench shows the same discipline at much larger scale: its authors decomposed research replication into 8,316 gradable rubric items across twenty papers, co-developed the rubrics with paper authors, and separately evaluated the judge used to score them [PAPER-01].

The judge does not need to agree with every initial reviewer. Humans make errors too. The gold label should represent the current product standard after adjudication.

LinkedIn's search case describes establishing sufficiently reliable human labels before treating them as gold, using weighted Cohen's kappa of at least 0.8 and product-manager adjudication [ORG-02]. Do not cargo-cult the threshold. Agreement depends on prevalence, category structure, and the decision. Use the example to establish a process, not a universal commandment engraved on a tablet.

### Audit the disagreement itself

In public talks about its evals, a major international delivery company described a multilingual search project that had stopped improving. The team reread human–model mismatches instead of treating the original label as holy writ. The mismatches fell into three operational buckets. This is a field report, not published evidence, so the company details and reported rates are deliberately omitted.

| Mismatch bucket | What review finds | Next move |
|---|---|---|
| Candidate error | Evidence and the current rule support the adjudicated label, not the candidate | Repair the system; add the case to the right suite |
| Label error | The original label conflicts with the evidence or current rule | Correct the label; inspect related labels and the review process |
| Unresolved ambiguity | Evidence is incomplete, or more than one label remains defensible | Clarify the rule, allow abstention, fetch context, or preserve the ambiguity |

The last row matters. If two qualified reviewers can defend different labels from the same evidence, squeezing a binary answer out of them does not improve the dataset. It embalms the argument.

The company also described a layered labeling queue: independent double review for calibration material, a third reviewer for mismatches, a written reason from labelers, and guidance revised from reviewed failures. Some cases arrived with a model pre-label for a person to review. That can save time, and it can anchor the reviewer. If you use pre-labels, retain a blind slice labeled without the model's suggestion and compare the two conditions. Gold needs an audit trail. A confident-looking cell is not one.

## Read the confusion matrix

Before admiring overall agreement, inspect the base rate. If experts find ten failures in one hundred cases, a judge that says `pass` every time agrees on ninety cases. It also catches precisely none of the failures. Ninety percent agreement can therefore describe a useless judge wearing a very respectable tie [MEDIA-01].

Suppose experts label 100 cases and the judge produces:

| | Expert pass | Expert fail |
|---|---:|---:|
| Judge pass | 36 | 5 |
| Judge fail | 10 | 49 |

The judge agrees on 85 cases. “85 percent agreement” sounds respectable. It hides the two errors that matter:

- **False pass:** the judge approves an expert-defined failure. Here, 5 cases.
- **False fail:** the judge rejects an expert-defined pass. Here, 10 cases.

For a safety gate, false passes may be much more expensive. For a discovery filter that sends suspected failures to humans, false fails may be acceptable while missed failures are costly.

Calculate:

- Pass precision: `36 / (36 + 5) = 87.8%`
- Pass recall: `36 / (36 + 10) = 78.3%`
- False-pass rate among expert failures: `5 / (5 + 49) = 9.3%`
- False-fail rate among expert passes: `10 / (10 + 36) = 21.7%`

Then inspect the cases. The matrix tells you where. The traces may tell you why.

## Calibrate by category

Aggregate agreement can hide systematic failure:

| Category | Cases | Agreement |
|---|---:|---:|
| Clear policy disclosure | 30 | 97% |
| Implied claim of completion | 20 | 75% |
| Spanish responses | 20 | 70% |
| Tool timeout cases | 15 | 93% |
| Ambiguous user intent | 15 | 60% |

This judge may be suitable for clear disclosures and unsuitable for ambiguous intent. Route the latter to people or a different grader. A judge that cannot run the whole shop may still earn one narrow job.

HealthBench's meta-evaluation compares automated judgments with physician opinions by category [HEALTH-04]. Borrow the method: calibrate the grader where it will be used and learn its boundaries.

## Common judge biases

Test for:

- **position bias:** preference for A or the first answer;
- **verbosity bias:** longer appears more complete;
- **style bias:** polished prose masks missing evidence;
- **self-preference:** a model favors outputs resembling its own style;
- **reference anchoring:** valid alternatives are penalized for differing from a reference;
- **authority bias:** citations or technical language receive unearned credit;
- **language disparity:** performance differs across languages or dialects;
- **rubric leakage:** output copies criterion wording without satisfying intent;
- **length/context failure:** relevant evidence is lost in a long trace.

Create counterexamples. Swap order. Equalize length. Remove decorative citations. Paraphrase while preserving meaning. Add rubric keywords to a wrong answer. Translate calibrated cases. Move evidence within the context.

The judge should earn its scope.

## Criteria drift is normal

While labeling, reviewers discover missing distinctions. A response the rubric marked safe may be misleading. A criterion may combine two ideas. Policy may change. Users may reveal a new harm.

EvalGen names the circularity: people need criteria to grade outputs, but grading outputs helps them discover the criteria [JUDGE-02]. Treat this as a loop:

`outputs → disagreement → criterion revision → relabeling → judge update`

Version rubric changes. Re-label affected gold cases. Do not compare judge metrics across incompatible rubrics without explanation.

The sensible version of “evals are the new PRDs” is that they become **living, executable product requirements**. They do not replace product intent, policy, or design. They record the parts of that intent that real outputs forced the team to make explicit, and they change when new evidence changes the standard [MEDIA-01].

Nova Escola's case shows the cost of pretending criteria are finished too early [ORG-03]. Experts rewrote the rubric after poor annotator agreement. That correction belonged to the work; it did not invalidate it.

## Do not train and test on the same disagreements

If you inspect fifty judge errors, rewrite the prompt until it handles them, and report performance on the same fifty, you have measured editing persistence.

Split cases into:

- development set for rubric and prompt iteration;
- calibration set for threshold selection;
- held-out audit set for final estimate;
- production drift sample for ongoing checks.

Small teams can use cross-validation or repeated holdouts, but they must preserve some unseen evidence. Add new production disagreements over time. Keep hard cases without allowing them to dominate prevalence estimates.

## Use humans where they change the standard

Human review is most valuable for:

- defining criteria;
- resolving ambiguity;
- auditing false passes;
- reviewing high-consequence cases;
- discovering new failure categories;
- checking judge drift after changes;
- deciding whether the proxy still matches product value.

A person repeatedly checking a fact the database could expose is expensive plumbing.

The operating model in Chapter 14 assigns experts to calibration and adjudication rather than endless queue-clearing. Human attention is scarce. Spend it on judgment.

## Field move

Use Exercise 6 with Templates 6 and 7 for one informally judged criterion. Build the three-label prompt, calibrate it on expert cases, inspect the confusion matrix by category, and name what must route to a person. Ask which decisions the judge can support—not whether it is “good.”
