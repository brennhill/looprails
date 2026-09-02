# Glossary

Terms are defined as used in this book.

---

**Accepted outcome.** A task result that passes required gates and is accepted for product use. The denominator in cost per accepted outcome. A generated response is not accepted merely because generation completed.

**Action event.** A structured record of an attempted or completed tool action, including arguments, authorization, timestamps, result, error, idempotency key, and relevant postcondition.

**Adjudication.** Resolution of reviewer disagreement by a named person or process qualified to define the product or domain standard. Good adjudication repairs ambiguous criteria instead of forcing a label and walking away.

**Agent loop, or inner loop.** The runtime cycle in which an agent observes state, decides, acts, verifies, and continues, stops, or escalates.

**Annotation.** A human-created label and supporting evidence attached to a task, output, or trace. High-quality annotation records why the label applies and where evidence lives.

**Benchmark.** A defined collection of tasks, harnesses, graders, and reporting procedures used to compare systems. A benchmark result is meaningful only with version, procedure, budget, and limitations.

**Benchmark retirement.** The documented removal or demotion of a suite because it is stale, saturated, contaminated, invalid, or no longer aligned with product behavior.

**Calibration.** Comparison of a grader or confidence signal against labels or outcomes accepted as the relevant standard, followed by adjustment of criteria, prompts, thresholds, or scope.

**Calibration set.** Labeled data used to choose judge prompts, thresholds, or operating scope. It is distinct from the held-out audit set used to estimate performance after calibration.

**Capability case.** A task representing an important ability the product should develop or compare. Capability cases may be deliberately challenging and need not all pass today.

**Capability suite.** A broad collection of cases used to measure the frontier of useful product behavior, compare architectures, and guide investment. It differs from the stable regression suite.

**Case-specific criterion.** A grading requirement written for the facts and risks of one task rather than a generic quality dimension. HealthBench is a prominent published example of case-specific rubric design [HEALTH-01].

**Cluster.** A group of observations sharing a source of correlated error, such as one customer, conversation, document, repository, policy, or generated scenario.

**Confidence interval.** A range produced by a statistical procedure intended to express sampling uncertainty around an estimate. It does not include every source of uncertainty, such as grader bias, dataset shift, or harness bugs.

**Contamination.** Exposure of a model or development process to evaluation tasks, answers, gold patches, or close equivalents, weakening the interpretation of measured performance.

**Criteria drift.** Change in the operational meaning of good as reviewers see outputs, resolve disagreement, or encounter new policy and user behavior. Criteria drift should be versioned and reviewed rather than denied.

**Decision owner.** The named person accountable for release, hold, limited rollout, or other decision supported by an eval.

**Deterministic grader.** A grader that returns the same result for the same inputs under a controlled environment, such as a schema check, invariant, rule, or executable test.

**Discovery sample.** A deliberately varied or failure-enriched sample used to learn what can go wrong. Its raw proportions do not estimate ordinary production prevalence.

**Discordant pair.** In a paired A/B eval, a task on which one system passes and the other fails. Discordant cases supply the direct evidence of change.

**Effective citation.** A citation that resolves to an acceptable source and supports the claim attached to it. Citation presence alone is not effectiveness.

**Environment oracle.** Authoritative state or outcome exposed by the task environment and used as grading evidence, such as a reservation record, payment event, test result, or simulator state.

**Eval.** A repeatable procedure for collecting evidence about system behavior to support a decision. It includes tasks, a harness, graders, and reporting—not only a metric.

**Eval funnel.** The progression from fast local checks to pull-request regression gates, nightly capability runs, held-out audits, and controlled production validation.

**Eval loop, or outer loop.** The product-improvement cycle of observing production, analyzing errors, updating tasks and graders, comparing changes, releasing, and learning from new outcomes.

**Executable truth.** Evidence produced by running a test, invariant, validator, or program against an artifact or state. Executable truth is conditional on the correctness and completeness of the executable contract.

**Expert truth.** A standard requiring qualified domain judgment, especially for ambiguous, value-laden, or consequential criteria. Expert truth may be scaled through calibrated automated graders but remains expert-owned.

**False fail.** A grader rejects an output that the accepted standard labels as passing. Sometimes called a false negative depending on label convention.

**False pass.** A grader approves an output that the accepted standard labels as failing. False passes are often the critical error when an eval gates consequential release.

**First departure.** The earliest evidence-backed point in a trace where the run moved away from a good path or lost important information. It is often more actionable than the final visible error.

**Gold label.** A label accepted as the calibration or audit standard after qualified review and, where needed, adjudication. “Gold” describes its role, not infallibility.

**Grader.** A function that converts run evidence into a structured result for one or more criteria.

**Grader attack.** A deliberately constructed good output that fails or bad output that passes, used to test measurement validity.

**Grader error.** Failure of the measurement mechanism—timeout, parse error, missing evidence, crash, or invalid environment—rather than failure of the system being evaluated.

**Grader ladder.** The progression used in this book: environment oracle, executable test, structured evidence, deterministic rule, model judge, and expert judgment. A criterion should climb only as high as necessary.

**Grader stack.** Several graders composed to cover hard gates, quality dimensions, diagnostics, cost, and latency while preserving distinct results.

**Hard gate.** A criterion whose failure blocks task success or release rather than being averaged with other dimensions.

**Harness.** The controlled system that sets up tasks, runs agents, enforces budgets and permissions, captures traces and final state, invokes graders, and stores reproducible results.

**Held-out audit.** Evaluation on cases not used to tune the system or grader, typically performed before an important release or during periodic review.

**Idempotency key.** A stable identifier allowing repeated requests to represent one intended side effect. It helps a system retry safely after uncertain tool responses.

**Insufficient evidence.** A legitimate grader result indicating the supplied artifacts cannot resolve the criterion. It should not silently default to pass or fail.

**Invariant.** A property that must remain true across all valid agent paths, such as no duplicate charge, no negative balance, or every side effect has authorization.

**Judge drift.** Change in the error behavior of a model judge caused by model, prompt, rubric, evidence, language, or production-distribution changes.

**Learning lead time.** Elapsed time from a meaningful production failure to an implemented and verified product change with a durable regression case or monitoring improvement.

**Measurement sample.** A representative or statistically designed sample used to estimate rates for a defined population.

**Metamorphic test.** A test defined through a transformation that should preserve or predictably change behavior when no single reference answer exists.

**Minimum worthwhile effect.** The smallest true improvement that would change a product decision, assuming every hard constraint still holds. It may be any positive effect. It should be written before examining comparison results and kept separate from the evidence needed to distinguish that effect from noise.

**Model judge.** A model prompted to classify or score another system's output under a rubric and supplied evidence. It must be calibrated for a defined scope.

**Outcome chain.** The hypothesized connection from an offline criterion to near-term behavior and an ultimate product or user outcome.

**Paired evaluation.** Comparison of variants on the same tasks, environments, and budgets so task difficulty is shared and discordant cases can be inspected.

**pass@k.** The probability or estimator describing at least one success among k candidates. It fits generate-and-select use cases and must include selector quality and cost.

**pass^k.** The probability that all k uses succeed. It is a repeated-reliability metric introduced prominently in τ-bench [TAU-01].

**Postcondition.** Authoritative evidence describing state after an action, used to confirm whether the intended side effect occurred.

**Production escape.** A failure not detected by offline or runtime controls before affecting users or real state.

**Proxy.** A measurable signal used in place of a delayed or expensive product outcome. A proxy should have an explicit outcome hypothesis and validation history.

**Proxy divorce.** Loss of a useful relationship between an offline metric and the product outcome it was intended to predict.

**Regression case.** A durable task representing behavior that previously worked or a failure that has been repaired. Regression cases protect earned capability.

**Release contract.** A pre-specified decision rule covering primary effect, hard gates, segments, reliability, cost, latency, rollout, and rollback.

**Representative sample.** A sample selected with a known design to estimate behavior in a target population. It differs from a risk-enriched review queue.

**Risk-enriched sample.** A sample that deliberately oversamples consequential actions, complaints, tool errors, low-confidence runs, or new segments to improve discovery and review.

**Rubric.** A set of criteria and label definitions used by human or automated graders. Useful rubrics tie labels to observable evidence.

**Saturation.** A benchmark state where most relevant systems are near the ceiling or cases no longer differentiate useful capability.

**Selector.** The mechanism that chooses among several generated candidates in a pass@k workflow. Overall success depends on generation and selector error.

**State truth.** Evidence from authoritative environment state rather than the agent's verbal description of an outcome.

**Task contract.** The full definition of an eval case: purpose, setup, input, execution limits, expected evidence, metadata, ownership, and version.

**Trace.** The structured evidence trail of a run, including task, messages, tool events, state, control decisions, artifact, grader results, cost, latency, and versions.

**Trace viewer.** An interface that places contracts, events, state, grader evidence, versions, and annotations together so teams can review behavior and create cases efficiently.

**Unit of evaluation.** The item counted as one observation, such as a complete task, conversation, user session, or account-period.

**Version lineage.** Recorded dependency among task, policy, environment, agent, grader, and harness versions, allowing a result to be reconstructed and compared honestly.

**Wilson interval.** A confidence interval for a binomial proportion with better small-sample behavior than the basic normal approximation [STAT-02].
