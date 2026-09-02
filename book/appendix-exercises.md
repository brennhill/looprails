# Appendix A: Exercises

These exercises turn the book into a working eval program. They can be completed by one product team, used as workshop modules, or assigned across product, engineering, domain, data, and risk roles.

Use real product data only under appropriate privacy and access controls. If those rules keep the real data off-limits, create representative synthetic traces that preserve the failure relationship without preserving personal information.

## Exercise 1: Twenty traces, no taxonomy

**Purpose:** Discover what your system actually gets wrong before choosing metrics.

**Time:** 90 minutes for the group session, plus sample preparation.

**Participants:** Product owner, engineer, domain expert, optional data or risk partner.

**Prepare:** Twenty traces: eight randomly sampled, four user complaints, four consequential actions, two new-segment cases, and two apparent successes. Record the selection stratum. Choose whether the review unit is a response, turn, generation span, trace, thread, or task outcome; record the exact target. Show task, messages, tool events, final state, cost, latency, and available user outcome.

**Steps:**

1. Open one queue item and confirm that it contains the intended review unit and enough context to interpret it.
2. Review the first five together.
3. For each, write the user goal, final outcome, strongest evidence, first departure, severity, and an open note.
4. Review ten independently or in pairs.
5. Compare notes. Do not force agreement.
6. Review the final five while testing emerging labels.
7. Identify three cases: one common, one consequential, one ambiguous.

**Deliverable:** Annotated trace sheet plus raw open notes.

**Debrief:** Which apparent success failed after state or evidence inspection? Which disagreement revealed a missing policy? Which system component did reviewers blame without enough evidence?

**Extension:** Repeat with a representative sample and compare discovery categories with estimated prevalence. Explain why the two samples should not be combined without weights.

## Exercise 2: Build a failure taxonomy

**Purpose:** Convert trace observations into categories useful for engineering and product decisions.

**Time:** 60 minutes.

**Input:** Notes from Exercise 1.

**Steps:**

1. Put each first-departure note on a separate card.
2. Cluster cards by observed user outcome.
3. For every cluster, write the evidence that proves the failure.
4. Separately list intervention hypotheses: prompt, retrieval, tool, policy, model, controller, grader, or organization.
5. Name categories at an actionable middle level.
6. Attach concrete examples and counterexamples.
7. Mark high disagreement and must-not-fail categories.
8. Ask a model to propose an alternate grouping from the raw notes. Have the domain owner accept, edit, or reject every suggestion.
9. Add an `other / not yet classified` category and define what volume or pattern will trigger taxonomy review.
10. Review additional strata until new traces stop changing categories or product actions. Record the stopping judgment; do not mistake it for a prevalence estimate.

**Deliverable:** Taxonomy v1 with three fields per category:

```yaml
id: false_completion_claim
definition: response states an external action completed when final evidence does not confirm it
evidence: final environment state or authoritative operation status
examples: [trace-104, trace-219]
counterexample: response says action is pending after timeout
severity: high
intervention_hypotheses: [tool_semantics, retry_controller, response_grader]
```

**Debrief:** Which categories describe outcomes and which accidentally describe suspected causes? Which category would two qualified reviewers apply differently? What policy question must be resolved before measurement?

**Extension:** Give the taxonomy to a reviewer who missed Exercise 1. Measure where they use “other” or disagree. Revise definitions rather than merely coaching the reviewer.

## Exercise 3: Turn five failures into task contracts

**Purpose:** Preserve the diagnostic property of production failures in replayable, privacy-safe cases.

**Time:** 90 minutes.

**Input:** Five traces representing different categories.

**Steps:**

1. State the capability or risk each trace represents.
2. Identify the property that made the original case hard.
3. Remove names, identifiers, and incidental details.
4. Preserve the relevant policy conflict, state, ambiguity, or tool behavior.
5. Write setup, input, limits, expected evidence, owner, source, and review date.
6. Label the case capability, regression, adversarial, or calibration.
7. Have another participant try to solve the case using only the contract.

**Deliverable:** Five versioned task files.

**Quality test:** A competent person should have enough information to succeed, multiple valid solutions should remain possible where appropriate, and the expected evidence should follow from the stated contract.

**Debrief:** Did simplification remove the reason the case was difficult? Did the expected answer prescribe wording rather than properties? Which environment dependency needs to be frozen?

**Extension:** Use the SWE-bench task-fairness questions [SWE-06]. Ask one reviewer to argue that the grader is too narrow and another that it is too broad.

## Exercise 4: Build the grader without an LLM

**Purpose:** Move every criterion as low as possible on the grader ladder.

**Time:** 60 minutes.

**Input:** Three task contracts.

**Steps:**

1. List every claim, state transition, policy constraint, and quality criterion.
2. For each, ask whether environment state can answer it.
3. If not, try executable test, structured evidence, or deterministic rule.
4. Mark the judgment that remains.
5. Identify hard gates, quality dimensions, diagnostics, cost, and latency.
6. Sketch check-level output, including grader-error status.

**Deliverable:** Grader map.

| Criterion | Evidence | Grader | Hard gate? | Known gap |
|---|---|---|---|---|
| Refund not issued | Payment state | State assertion | Yes | Delayed settlement |
| Explanation accurate | State + response | Narrow judge | Yes | Implied claims |
| Tone respectful | Response | Judge | No | Cultural variation |

**Debrief:** Which criterion did the group initially give to a model even though code or state could answer it? Which rule is literal but being asked to infer meaning?

**Extension:** Redesign product output to emit one structured artifact that makes a previously expensive criterion cheap to grade.

## Exercise 5: Hack the grader

**Purpose:** Find false passes and false fails before optimization finds them for you.

**Time:** 75 minutes.

**Roles:** Grader author, hacker, product/domain judge.

**Steps:**

1. The author explains the task contract and grader outputs, not implementation secrets.
2. The hacker creates three bad outcomes intended to pass:
   - literal keyword compliance;
   - right final value through unsafe process;
   - benchmark-specific or reference-answer mimicry.
3. The hacker creates two good alternatives intended to fail.
4. Run or manually apply the grader.
5. The domain judge decides the true labels from evidence.
6. Revise task or grader. Add every successful attack as a grader regression case.

**Deliverable:** Adversarial grader report.

```yaml
attack: false_refund_claim_with_pending_language
expected: fail
grader_v2: pass
cause: rule checks word "pending" anywhere in response
repair: bind claim span to authoritative state
regression_case: grader_attack_012
```

**Debrief:** Did the repair overfit the exact attack? What class of bad outcomes does it now catch? What independent evidence would make gaming harder?

**Extension:** Swap graders between teams. Outside hackers are less attached to what the author meant.

## Exercise 6: Calibrate a model judge

**Purpose:** Define the scope in which an automated judge can support a decision.

**Time:** Two to four hours depending on labeling.

**Prepare:** Fifty to one hundred cases across clear passes, clear fails, ambiguity, segments, and adversarial near misses.

**Steps:**

1. Write one narrow criterion with pass, fail, and insufficient-evidence labels.
2. Two qualified reviewers label independently.
3. Sort disagreements into candidate error, label error, or unresolved ambiguity; adjudicate them and record the evidence.
4. Freeze development and audit splits with a group key that keeps related cases together.
5. Run the judge; build a confusion matrix; calculate false-pass and false-fail rates.
6. Break results down by category, language, length, and difficulty.
7. Test position, verbosity, style, and rubric-keyword bias.
8. Define which cases route to a person.

**Deliverable:** Judge calibration report with a clear allowed scope.

**Decision prompt:** If this judge gates a consequential action, which error is more costly? Does the observed false-pass rate support that use? If it only prioritizes a human queue, how does the tradeoff change?

**Extension:** Change the judge model or prompt. Re-run the frozen audit split. Explain why performance on the development set is not the release estimate.

## Exercise 7: pass@k and pass^k

**Purpose:** Choose a reliability metric matching real use.

**Time:** 45 minutes.

**Scenario:** A research agent succeeds on 75 percent of individual tasks. The product can generate three candidates and select one for a single report. Another workflow uses the agent once per day for eight days with no expert selection.

**Steps:**

1. Calculate `pass@3` under an independence assumption.
2. Calculate `pass^8`.
3. List reasons actual attempts may be correlated.
4. Add selector error: suppose the selector chooses a successful candidate 90 percent of the time when one exists.
5. Add cost: each generation costs $0.40 and selection costs $0.10.
6. Define product metrics for both workflows.

**Deliverable:** One-page reliability decision.

**Debrief:** Which headline would a demo prefer? Which metric would a returning user prefer? Can retries address transient tool failure but not repeated policy misunderstanding?

**Extension:** Use task-level trial data to classify always-pass, unstable, and always-fail cases. Decide whether to invest in retries, routing, or capability improvement.

## Exercise 8: Paired release comparison

**Purpose:** Compare two systems on the same tasks without losing case-level meaning.

**Time:** 60 minutes.

**Scenario:** On 100 tasks, both pass 62, new only passes 18, old only passes 8, and both fail 12.

**Steps:**

1. Calculate old and new pass rates.
2. Calculate the observed paired difference.
3. Identify the discordant case count.
4. Apply or look up the exact two-sided McNemar/binomial result; compare with the worked example in Chapter 9.
5. Inspect hypothetical categories for the 18 wins and 8 regressions.
6. Add a must-not-fail regression among the eight.
7. Make a release, hold, limited-rollout, or more-data decision.

**Deliverable:** Release decision with effect, uncertainty, hard gates, and follow-up.

**Debrief:** Why is “p greater than .05” not the same as “no effect”? Why can one hard-gate failure outweigh ten routine wins? What minimum effect should have been written before the run?

**Extension:** Cluster the tasks into ten customer scenarios. Explain why task-level independence may understate uncertainty and how cluster bootstrap resampling would work.

## Exercise 9: Design production sampling

**Purpose:** Connect offline evaluation to real behavior without confusing discovery samples and estimates.

**Time:** 75 minutes.

**Steps:**

1. Define the production unit: task, conversation, user, or account-period.
2. Choose a representative random sample and rate.
3. Define risk-enriched strata.
4. Define a post-release change-focused sample.
5. Identify delayed outcome events and windows.
6. List automated asynchronous graders.
7. Specify human review volume and adjudication.
8. Define privacy fields, retention, access, and redaction.
9. Describe how selected traces become tasks.

**Deliverable:** Production sampling plan with inclusion probabilities or clear nonrepresentative labels.

**Debrief:** Which sampled queue can estimate prevalence? Which is for discovery? What failures are invisible to user ratings? What data cannot leave the approved environment?

**Extension:** Design a limited rollout sized by the product's blast-radius policy, with rollback triggers and a randomized experiment with primary and guardrail outcomes.

## Exercise 10: Assign ownership and cadence

**Purpose:** Keep the eval alive after launch week.

**Time:** 60 minutes.

**Steps:**

1. Name the platform, product, domain, engineering, measurement, risk, and decision owners.
2. Complete the responsibility map for tasks, rubrics, graders, runs, production review, release, and retirement.
3. Schedule weekly trace and monthly health reviews.
4. Define required attendees and outputs.
5. Add incident-to-regression-case completion criteria.
6. Measure learning lead time for the last incident.
7. Identify the handoff most dependent on memory.

**Deliverable:** Signed ownership page and calendar invitations.

**Debrief:** Where did several groups believe another group was accountable? Which review has no decision to make? Which domain expert lacks protected time?

**Extension:** Estimate reviewer capacity. If production sampling creates 200 cases per week and experts can review 40, design automation and prioritization without silently dropping high-risk work.

## Exercise 11: Run the full hacker–fixer loop

**Purpose:** Practice adversarial evolution of tasks, graders, and system design.

**Time:** Half day.

**Teams:** Hacker, fixer, domain adjudicator, release owner.

**Rounds:**

1. Fixer receives ten tasks and builds a system or proposed responses.
2. Hacker studies grader behavior and submits attacks.
3. Domain adjudicator labels intent from evidence.
4. Grader author repairs false passes and false fails.
5. Fixer updates the product.
6. Release owner evaluates on a hidden round.

**Rules:** The grader author cannot win by blocking exact attack strings. The hacker receives points for general failure classes. The fixer receives points for moving prevention below the prompt layer. The release owner reports cost and reliability alongside pass rate.

**Deliverable:** A changelog showing how each attack altered task, grader, runtime guard, tool interface, or product behavior.

**Debrief:** Did the teams converge on brittle rules or stronger evidence? Did the product learn to refuse everything? Which attacks suggest a new capability suite rather than another regression case?

## Exercise 12: Retire an eval suite

**Purpose:** Treat benchmark maintenance and retirement as normal lifecycle work.

**Time:** 75 minutes.

**Input:** A real or hypothetical mature suite.

**Steps:**

1. Calculate always-pass, unstable, and always-fail case shares.
2. Identify duplicates, stale policy dependencies, suspected leakage, and weak graders.
3. Compare current production failures with suite coverage.
4. Separate cases worth retaining as regressions.
5. Design replacement capability cases.
6. Write score-comparability rules.
7. Create a deprecation and communication plan.

**Deliverable:** Benchmark deprecation record and migration map.

**Debrief:** Is the suite saturated because the capability is solved or because graders are weak? Can historical results remain visible without implying comparability? Which protected cases should never be published?

**Extension:** Use the SWE-bench Verified lifecycle as a comparison [SWE-02] [SWE-03]. Identify curation, audit, contamination, and retirement practices your internal suite lacks.

## Exercise 13: Buy brains or build rails?

**Purpose:** Compare a frontier model, a custom harness, and tuned open weights without changing the exam between candidates.

**Time:** 90 minutes to design; runtime depends on the systems and dataset.

**Input:** One narrow production task and a held-out set with ordinary, difficult, missing-value, and rejection cases.

**Steps:**

1. Define field-level or criterion-level correctness and an all-or-nothing outcome metric.
2. Record schema validity separately from semantic correctness.
3. Freeze the task instructions, field definitions, input records, and grader versions.
4. Run a strong frontier model as the general-capability baseline.
5. Run an open-weight model with the same instructions and no custom constraints.
6. Add the harness: schema or grammar, validators, retry rules, and explicit null behavior.
7. If representative training data exists, run a tuned open-weight candidate without touching the held-out cases.
8. Design one hybrid router and record which cases escalate and why.
9. Compare paired case outcomes, hard slices, latency, and cost per accepted result.
10. Read every disagreement where the cheaper system wins and every disagreement where it loses.

**Deliverable:** A configuration decision that names the default path, escalation path, evidence, residual risk, and next experiment.

**Debrief:** Which gains came from the model, which came from the contract, and which came from the harness? Did constrained output improve meaning or only shape? Did the tuned model fail on novel or rare cases? Would the decision survive a different volume, review budget, or data-residency rule?

**Extension:** Repeat the comparison after a frontier-model update or a new quantization level. Decide which results remain comparable and which require a new baseline.
