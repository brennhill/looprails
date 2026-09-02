# Production Is the Real Test

*Your users are not out-of-distribution. They are the distribution sending invoices.*

Offline evals give you a controlled snapshot of known behavior. Production supplies changing tasks, delayed outcomes, partial observability, adversarial inputs, and people who use the product in ways no planning document predicted.

The outer loop closes only when production evidence changes the eval suite and the product.

## Offline verifies; online validates

An offline eval can show that a new support agent:

- passes more known tasks;
- violates fewer policy cases;
- cites better evidence;
- costs less per accepted outcome;
- handles simulated tool failures;
- remains stable over repeated trials.

It cannot, by itself, show that users resolve issues faster, trust the answers appropriately, contact support less, or experience fewer harmful errors.

Those are production outcomes.

Spotify's engineering guidance makes this distinction explicit: evals narrow and verify candidates; online experiments validate whether the proxy predicts user value [ORG-04]. The two methods form a funnel.

## Build an outcome chain

Map offline criteria to observable product outcomes:

| Offline signal | Expected near-term behavior | Product outcome |
|---|---|---|
| Correct account state | Fewer manual corrections | Higher task resolution |
| No false completion claims | Users know when action failed | Fewer repeat contacts |
| Better citation support | Editors make fewer corrections | Lower review time and retraction risk |
| Better urgency routing | Appropriate escalation | Lower harmful delay |
| Lower redundant tool calls | Faster completion | Lower latency and cost |

Each arrow is a hypothesis. Production evidence tests it.

If the offline metric improves but the product outcome does not, possible explanations include:

- the eval targets an unimportant capability;
- the production population differs;
- user behavior offsets the gain;
- the metric is too weak;
- the improvement is too small to matter;
- another dimension regressed;
- instrumentation is wrong.

A broken arrow is a result. Find which link failed before tuning the proxy harder.

## Sample production deliberately

Production evaluation has at least three samples.

### Representative sample

Estimate ordinary performance. Sample randomly or with known probability. Preserve weights if traffic is stratified.

### Risk-enriched sample

Oversample:

- consequential actions;
- low-confidence runs;
- escalations;
- tool errors;
- new policies, languages, or segments;
- long or expensive traces;
- user complaints;
- suspected prompt injection or abuse.

Use for discovery and safety review, not unweighted prevalence estimates.

### Change-focused sample

After a release, sample tasks likely affected by the change. A retrieval update may require source-specific review. A tool change may require timeout and side-effect cases. A new model may require broad language and policy checks.

Document why each trace entered the queue.

Nova Escola reportedly ran daily evaluation over two percent of production traffic after repairing its rubric process [ORG-03]. Two percent is a case detail, not a recipe. Borrow the recurring evaluation, production grounding, and expert-aligned criteria.

## Dogfood is a peculiar sample

Internal use produces excellent discovery data and lousy population estimates.

Coding agents enjoy unusually rich dogfooding. Their builders are also frequent users, understand the domain, can inspect the artifact, and often notice a bad patch before it reaches anyone else. Many products do not have this arrangement. The people building a clinical assistant, property-leasing bot, or payroll extractor may differ sharply from the people using it. Insiders may also tolerate rough edges, know secret workarounds, and possess debugging access that ordinary users never will [MEDIA-01].

Treat dogfood as one named stratum. Turn its failures into cases. Keep its compliments too, if morale requires snacks. But do not use internal enthusiasm as a prevalence estimate or as a substitute for representative sampling and qualified review.

## Delayed ground truth

Some outcomes arrive later:

- the customer reopens the case;
- the refund settles;
- the cited paper is challenged by an editor;
- the code change causes an incident;
- the patient seeks appropriate care;
- a user corrects a generated record;
- a recommendation changes retention weeks later.

Connect traces to later events with privacy-safe identifiers. Define outcome windows. Avoid attributing every later event to the agent without a causal design.

Near-term proxy:

> No support contact within 24 hours.

Possible delayed truth:

> Issue remained resolved after seven days and account state required no correction.

The delayed label may enter a production dataset, calibrate the offline grader, or support an experiment. It may also reveal that the near-term proxy rewards users giving up.

## Online evaluation layers

### Asynchronous automated scoring

Sample completed traces and apply graders after the response. You get broad monitoring without adding user latency [OPS-02].

Use for:

- policy and communication criteria;
- claim–evidence support;
- state consistency;
- failure category classification;
- cost and loop-health signals.

### Runtime guards

Run hard checks before or during action:

- authorization;
- spend and rate limits;
- schema validation;
- policy constraints;
- state preconditions;
- duplicate-effect prevention;
- sandbox and permission boundaries.

Runtime guards prevent. Asynchronous evals learn. Do not ask a nightly judge to prevent today's duplicate charge.

### Human review

Review sampled traces for:

- new failure modes;
- high-consequence actions;
- grader disagreements;
- ambiguous outcomes;
- user complaints;
- judge drift;
- apparent successes with weak evidence.

LinkedIn describes different feedback clocks: engineering signals quickly, high-volume linguistic annotation later, and product or member outcomes later still [ORG-01]. Design dashboards and meetings around these latencies.

### Controlled experiments

When ethically and operationally appropriate, randomly assign eligible traffic to old and new variants. Predefine primary and guardrail outcomes. Keep consequential must-not-fail behavior protected by gates, not left for the experiment to discover.

Begin with a product hypothesis grounded in observed failures. An experiment can compare two variants cleanly and still answer a question nobody needed to ask. Trace evidence tells you which change deserves the traffic [MEDIA-01].

An A/B test answers causal product questions better than before/after comparison, which can be confounded by seasonality, user mix, policy changes, and general chaos—the largest stakeholder in many launches.

## Monitor distributions, not only means

Overall performance may stay flat while one segment degrades.

Track by:

- language and locale;
- task or policy category;
- customer tier;
- tool path;
- model and prompt version;
- retrieval source;
- risk class;
- account age or configuration;
- input length;
- escalation status.

Watch:

- volume distribution;
- success and hard-gate rates;
- judge-score distribution;
- false completion claims;
- cost and latency tails;
- retry and escalation rates;
- unknown or ungradable cases;
- user correction and complaint rates.

Drift can occur in inputs, behavior, graders, or outcomes.

**Input drift:** users ask different things.  
**Behavior drift:** a model or tool changes.  
**Grader drift:** judge agreement changes.  
**Concept drift:** the definition of good changes with policy or product.  
**Outcome drift:** the same behavior has different effects in a new context.

Each needs different evidence.

## Shadow and canary modes

Use shadow evaluation when a new system can process copied requests without affecting users. Compare proposed actions and outputs with production behavior. Protect sensitive data and avoid calling side-effect tools.

Use a canary when shadow mode cannot reveal the true workflow. Release to a small eligible population with:

- strong runtime constraints;
- explicit rollback conditions;
- real-time guardrail monitoring;
- staffed ownership during the window;
- trace retention;
- gradual expansion.

Do not call a limited rollout a canary if nobody is watching and rollback cannot meet the product's containment requirement. That is merely a smaller launch.

## User feedback is evidence with selection bias

Thumbs up and down tell you where to look. They do not label the whole event.

People respond when delighted, angry, confused, or unusually motivated. They may rate tone rather than correctness. They may not detect unsupported claims. Some user groups provide feedback more often than others.

Combine feedback with:

- state outcomes;
- recontact or correction behavior;
- expert audits;
- randomized prompt requests for feedback;
- representative trace sampling;
- task category and segment.

A negative comment is a fine place to start looking. It becomes a prevalence estimate only through a representative design.

## Incidents should leave a regression case

For every consequential incident:

1. Preserve the trace, versions, state, and grader outputs.
2. Identify first departure and missing prevention.
3. Create a minimal reproducible task.
4. Add a regression case and grader test.
5. Repair the layer closest to prevention.
6. Add runtime monitoring or a guard where prevention is possible.
7. Re-run related capability cases.
8. Verify the fix in a controlled rollout.
9. Review whether the taxonomy or release rule changes.

A prompt change does not close an incident. Close it when the product prevents the failure where possible, detects a recurrence, and triggers a named incident response when prevention fails.

## Privacy and governance

Production traces can be the most sensitive eval data a team holds.

Establish:

- purpose limitation;
- data minimization;
- retention windows;
- access roles;
- redaction and synthetic-fixture pipelines;
- regional and contractual controls;
- audit logging;
- reviewer training;
- deletion processes;
- rules for whether eval data may enter training.

Avoid sending restricted traces to external judge services without approved handling. Where possible, extract the minimum evidence needed for a criterion. A citation judge needs claim and passage, not the user's entire account history.

## Field move

Complete Template 10: define representative and risk sampling, automated checks, human volume, delayed outcomes, experiment eligibility, rollback, privacy, and the path from trace to task. Production is where the next eval set begins.
