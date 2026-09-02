# Appendix C: Case Study Field Guide

These four cases come with public artifacts worth opening: datasets, task schemas, annotation guidance, grader implementations, harness code, and benchmark-maintenance decisions.

This appendix explains what to study and how to adapt the methods without copying protected evaluation items into a product or publication.

## SWE-bench: real repositories and executable contracts

### What the project gives you

SWE-bench begins with real GitHub issues and corresponding changes from twelve Python repositories. The original benchmark contains 2,294 tasks [SWE-01]. Its public repository and evaluation harness show how to provision repository environments, apply predicted patches, execute task-specific tests, and aggregate results [SWE-04] [SWE-05].

SWE-bench Verified adds a particularly valuable editorial artifact: human annotation instructions used to assess whether a task is clear, solvable, and fairly tested [SWE-06]. The Verified curation screened 1,699 candidates with 93 Python developers and three independent reviews per candidate, retaining 500 [SWE-02].

The benchmark's later history supplies a second set of artifacts: an audit of often-failed tasks, a contamination analysis, and a decision to stop using the suite as a primary reported measure [SWE-03]. Few case studies show creation, curation, scaling, auditing, and retirement this clearly.

### What to inspect

1. **Task representation.** Identify how repository, base commit, problem statement, tests, and expected patch lineage are stored.
2. **Environment isolation.** Follow the path from task to container image, repository checkout, patch application, and test execution.
3. **Test selection.** Examine how fail-to-pass and pass-to-pass behavior is represented. Ask what broader regression coverage remains outside a task.
4. **Run artifact.** Find where prediction, logs, exit status, and per-task result are preserved.
5. **Annotation rubric.** Compare task clarity and test fairness questions with your own task review.
6. **Versioning.** Identify which result claims depend on dataset release and harness configuration.

### Internal adaptation

For an internal coding-agent eval, create a task package:

```yaml
id: billing_issue_042
repository: billing-service
base_commit: 6f12a9b
problem_statement: "Refund events may be applied twice after worker restart."
environment_image: billing-eval:2026-08-24
visible_checks:
  - unit/refunds_idempotency_test.py
trusted_checks:
  - integration/restart_replay_test.py
invariants:
  - one_ledger_entry_per_idempotency_key
limits:
  wall_minutes: 30
  network: disabled
grader_version: billing_patch_v3
```

Then conduct two independent reviews:

- A maintainer asks whether the problem statement contains the required context.
- A tester attempts an alternative valid repair and asks whether trusted checks accept behavior rather than a preferred implementation.

Preserve ordinary regression tests in addition to task-specific tests. A patch that fixes the issue while breaking neighboring behavior should not pass the product eval.

### What not to conclude

A benchmark score does not equal general software-engineering ability. Task languages, repository selection, environment, issue style, available tools, time budget, and contamination all matter. A test pass does not establish maintainability, security, or alignment with unstated intent.

The targeted 138-task audit in [SWE-03] should not be quoted as the defect rate of all SWE-bench Verified tasks. It selected tasks frequently failed across o3 runs. Its value is diagnostic: even a heavily curated executable benchmark needs continuing audit.

### Publication and reuse

The repository is MIT licensed, but repository tasks can embed material originating in upstream projects. Record the exact license and commit for anything reproduced. Public gold patches or hidden tests should not be copied into prompts, training data, or general-audience examples. Newly written schematic patches and tests are safer for teaching.

## τ-bench and τ³-bench: grading state, policy, and interaction

### What the project gives you

The original τ-bench paper defines tool-agent-user tasks for realistic customer-service domains and introduces `pass^k` as a repeated-reliability measure [TAU-01]. The maintained repository, currently named `tau2-bench` and branded τ³-bench, expands domains, simulation modes, task fixes, evaluator components, and trajectory workflows [TAU-02].

Open the evaluator implementation. It makes composite grading concrete by combining checks over environment state, actions, communicated information, and natural-language assertions [TAU-03]. The CLI documentation shows how to run, inspect, and re-grade trajectories [TAU-04].

### What to inspect

1. **Domain policy.** Observe how policy is made available to the agent and represented in tasks.
2. **Database or environment.** Identify initial and expected states and how a run is reset.
3. **Tools.** Inspect schemas, error behavior, and the relationship between tool call and state.
4. **User simulation.** Determine how user goals and responses create interaction variability.
5. **Evaluator composition.** Trace how each grader produces evidence and how the task result is aggregated.
6. **Trajectory review.** Inspect the artifacts required to explain a fail.
7. **Repeated trials.** Compare individual task success with `pass^k`.

### Internal adaptation

Build one tool-agent task around an uncertain side effect:

```yaml
id: order_cancel_timeout_009
initial_state:
  order_status: paid
  refund_status: none
tool_behavior:
  first_cancel_call:
    side_effect: order_cancelled_refund_pending
    response: timeout
user_goal: cancel_order
policy:
  confirmation_required: true
expected:
  order_status: cancelled
  refund_status: pending
  cancel_event_count: 1
  communication:
    must_not_claim: refund_completed
```

Grade four layers:

- state matches the intended outcome;
- one cancellation event exists;
- confirmation occurred before commitment;
- communication distinguishes pending from completed.

Set the trial count from pilot variance and the reliability requirement. One correct timeout trace cannot establish repeatable behavior, especially if other attempts duplicate the action.

### Version caution

The maintained benchmark has corrected many tasks. Do not mix original paper scores, current task files, and a new evaluator under one label. Identify release, split, commit, model, attempts, and simulator configuration.

### Publication and reuse

Confirm repository and generated-trajectory rights before reproducing a full trace. For teaching, original traces like the timeout example above preserve the method without creating leakage or confusing historical versions.

## HealthBench: expert-defined, case-specific quality

### What the project gives you

HealthBench contains 5,000 health conversations and 48,562 case-specific criteria created with 262 physicians across 60 countries [HEALTH-01]. It includes multilingual, multi-turn, synthetic, and human-adversarial material. The evaluation approach scores criteria individually with assigned values rather than relying on one generic impression.

The meta-evaluation code compares automated grading with physician opinion, making the judge itself an object of study [HEALTH-04]. Consensus and hard variants help distinguish broad agreement from difficult cases.

### What to inspect without copying examples

The dataset card documents schema, fields, license, and an explicit request not to reproduce evaluation examples in plain text or images [HEALTH-03]. Honor the request. Study:

1. how criteria attach to cases;
2. how points and pass conditions are represented;
3. how automated grading is compared with experts;
4. how categories and agreement are reported;
5. how variants represent consensus and difficulty.

Do not paste a benchmark conversation into internal documents, slides, screenshots, this book, or a model prompt merely because the file is accessible.

### Internal adaptation

Use a nonmedical or appropriately expert-reviewed original case. For example, suppose an organization's security team defines the following local incident policy for a likely credential leak. A case-specific rubric might require the assistant to:

- identify that an exposed production credential is urgent;
- recommend the immediate containment action named in that policy rather than postponing it to a future deployment;
- preserve relevant audit evidence;
- avoid asking the user to paste the secret;
- distinguish containment from complete incident resolution;
- escalate to the incident process.

Two security experts label fifty outputs independently. Disagreements reveal ambiguous incident policy. After adjudication, a narrow model judge grades each criterion. Report false passes by criterion; a judge suitable for “mentions revocation” may be unsuitable for “does not destroy forensic evidence.”

The method is the point: case-specific domain criteria, expert ownership, automated scale, and judge meta-evaluation. The security policy in this example is a fixture, not general incident-response advice.

### What not to conclude

High judge agreement does not establish clinical safety in a different product. A benchmark may cover many scenarios without representing a local population, language mix, workflow, regulatory context, or action boundary. Use domain-specific evaluation and human accountability appropriate to the product.

### Publication and reuse

Legal license and responsible publication are separate decisions. The dataset is MIT licensed, but the anti-contamination request is clear. Describe structure and results, link to official sources, and create original analogous material.

## DeepResearch Bench: report quality and evidence quality

### What the project gives you

DeepResearch Bench provides 100 expert-written tasks across 22 fields, 400 reports from four systems, and 150 expert RACE annotations. Its authors report balancing domains using analysis of 96,147 user queries and involving more than 70 master's-level or domain-expert annotators, with three annotators per task in the consistency study [DRB-01].

The public dataset includes tasks, reports, and annotations under Apache 2.0 [DRB-02]. The repository contains the evaluation implementation [DRB-03].

The benchmark separates:

- **RACE:** comprehensiveness, depth, instruction following, readability;
- **FACT:** citation accuracy and effective citation count.

### What to inspect

1. **Task distribution.** How are domains and user-query patterns represented?
2. **Report artifact.** What structure, citation format, and metadata are available?
3. **RACE criteria.** How are report-level dimensions operationalized?
4. **FACT pipeline.** How are citations resolved and support evaluated?
5. **Human annotations.** What evidence accompanies labels and where do annotators disagree?
6. **Judge implementation.** Which prompts, models, and aggregation choices affect the score?

### Internal adaptation

Build a ten-task research set from real, permissioned work. Each task should specify audience, scope, source constraints, recency, and output requirements. Grade a structured artifact:

```json
{
  "report": "...",
  "claims": [
    {
      "claim": "...",
      "importance": "major",
      "citations": [
        {"url": "...", "source_id": "...", "passage": "..."}
      ]
    }
  ]
}
```

Use separate checks:

- URL resolves;
- source meets date and type constraints;
- cited passage appears in the source;
- passage supports the claim;
- major factual claims have effective citations;
- report covers required subquestions;
- synthesis distinguishes evidence from inference;
- readability and instruction following meet the audience contract.

Give each check an evidence pointer. The claim–passage judge should see only the local claim, passage, and necessary context. An expert editor reviews sampled false passes and source-quality judgments.

### Third-party rights

Apache 2.0 on a dataset does not erase copyright in papers, news articles, or other sources cited inside reports. Before reproducing report passages, citations, screenshots, or annotations, review the individual material. For book examples, original claims and short invented source passages are safer.

## Comparing the four cases

| Design question | SWE-bench | τ-bench / τ³ | HealthBench | DeepResearch Bench |
|---|---|---|---|---|
| Primary artifact | Code patch | Tool interaction | Health response | Research report |
| Strong truth | Tests/repo state | Environment state | Expert criteria | Claim/source relationship |
| Key grader risk | Wrong or narrow tests | Right state via wrong process | Judge–expert disagreement | Citation presence mistaken for support |
| Reliability concern | Repeat across tasks/runs | pass^k | Category and expert agreement | Judge and report variability |
| Maintenance lesson | Audit and retirement | Task/version fixes | Protect cases from leakage | Separate dimensions and rights |

Do not crown one case as the universal model. Borrow their strongest habits:

- executable checks where possible;
- final-state and action evidence for tools;
- case-specific expert criteria for judgment;
- local claim–evidence checks for research;
- repeated-trial reliability;
- versioned tasks and graders;
- explicit anti-contamination and rights practices;
- benchmark audit and retirement.

That combination is the practical eval loop.
