# From Failure to Task

*A production failure becomes valuable only after it can be replayed without summoning production.*

The transcript is not yet an eval case.

It contains accidental details: timestamps, account state, tool versions, earlier messages, retries, hidden defaults, and perhaps a user who wrote “pls fix???” at 2:13 a.m. The job is to preserve the capability being tested while removing noise and sensitive material.

Turning the trace into a case takes judgment. Simplify too far and the case becomes easy. Preserve everything and it becomes brittle, private, or impossible to run.

## The anatomy of a task

An agent-eval task needs six parts:

1. **Purpose** — the capability or risk the case represents.
2. **Setup** — initial environment, data, tools, policies, and permissions.
3. **Input** — what the user or upstream system provides.
4. **Execution contract** — time, attempt, cost, and interaction limits.
5. **Expected evidence** — facts a grader can inspect.
6. **Metadata** — source, version, owner, tags, severity, and rights.

Anthropic describes the core eval structure as tasks, graders, and a harness [ANTH-01]. The prompt is only one piece. For agents, the environment and harness are often most of the evaluation.

Here is a compact schema:

```yaml
id: retail_return_017
capability: policy_compliant_return
source: production_failure_redacted
severity: high
setup:
  customer_tier: standard
  purchase_age_days: 42
  item_category: final_sale
  current_state:
    refund_issued: false
    case_escalated: false
input:
  user_message: "I was told I could return this. Please refund it."
limits:
  max_tool_calls: 8
  max_wall_seconds: 60
expected:
  state:
    refund_issued: false
    case_escalated: true
  communication:
    must_explain: final_sale_restriction
    must_not_claim: refund_completed
metadata:
  owner: returns_product
  created: 2026-08-24
  review_by: 2026-11-24
```

The schema is intentionally boring, which gives it a fighting chance against the next exciting reorg.

## Evaluate capability packages as interventions

Sometimes the thing changing is not the whole agent. It is a reusable skill, tool wrapper, plugin, retrieval package, or workflow file loaded by the agent. That artifact can pass structural checks and still make runtime behavior worse.

A clean document cannot tell you whether the agent will:

- discover the capability from a realistic request;
- choose it among plausible alternatives;
- read instructions before invoking a script;
- use the correct arguments;
- recover when a tool fails;
- interpret an intermediate artifact correctly;
- avoid colliding with another installed capability.

Treat the package as an intervention. Run the same task twice under the same model, harness, workspace, budget, and grader: once with the target package available and once with it withheld. Keep prerequisite and decoy packages fixed in both arms. The paired difference estimates what the target adds under that declared environment.

The ACES study applies this design to agent skills. Questions, expected outcomes, observable behaviors, fixtures, and optional custom tasks or graders live beside the skill in the repository and belong to its author [ACES-01]. The repository becomes the task contract's home. A skill without runtime cases may be well documented, but it has not declared the behavior it should preserve.

## Preserve the reason it was hard

When converting a failure, ask: **What property made this case diagnostic?**

Perhaps:

- the current policy conflicted with an older retrieved article;
- the tool timed out after committing a side effect;
- the user requested an outcome the policy prohibited;
- the answer needed to synthesize evidence across several sources;
- the prompt omitted a fact the agent should ask for;
- the task required maintaining state across turns;
- the grader needed expert judgment about harm.

Keep that property. Remove incidental names, IDs, and prose.

A common mistake is to convert a messy production failure into a clean trivia question. The original agent failed because it had to resolve a conflict among user intent, policy, and system state. The eval case asks it to recite the policy. The score improves. Production does not. The test removed the task.

SWE-bench is instructive because its tasks preserve repository context, real issue descriptions, and executable behavior [SWE-01]. That realism creates power and difficulty. It also creates ambiguity: the issue may not fully specify what the tests enforce. The Verified curation process asked reviewers to assess whether an issue was clear and whether tests were fair [SWE-02] [SWE-06]. Task design must examine both sides of the contract.

## Capability cases and regression cases

Keep two suites with different jobs.

### Capability suite

The capability suite asks, “How well can the system perform the work the product needs to learn?”

- broad coverage;
- challenging and representative tasks;
- room for improvement;
- suited to comparing architectures, models, and workflows;
- may include cases the current system cannot pass.

### Regression suite

The regression suite asks, “Did we break behavior we had earned?”

- stable, previously passing cases;
- linked to incidents and consequential fixes;
- fast enough for frequent use;
- clear expected evidence;
- strict version control.

Descript's reported approach separates quality and regression concerns in a similar spirit [ANTH-01]. The distinction prevents an awkward release debate. A system may improve the frontier capability score while breaking five routine cases. One aggregate number can hide that exchange.

Every consequential production failure should be considered for the regression suite after the fix. Not every failure belongs forever. Duplicates, transient infrastructure issues, and cases tied to retired behavior may be represented by a category or removed through a documented process.

## Write contracts, not preferred sentences

Reference-answer matching is easy and often brittle when many responses can be correct.

Instead of:

> The answer must equal: “I cannot issue a refund because this item was final sale, but I have escalated your case.”

Specify:

- refund state remains false;
- escalation state becomes true;
- the answer does not claim a refund occurred;
- it explains the final-sale restriction;
- it does not invent a resolution time;
- tone is respectful.

The first five criteria can be checked with state, structured assertions, or narrow judgment. Tone may need a model or human grader. The task permits good variation without accepting wrong outcomes.

DeepResearch Bench grades dimensions instead of demanding one reference report [DRB-01]. HealthBench goes further with criteria specific to each case [HEALTH-01]. Grade the properties, not a favorite sentence.

## Define the budget

An agent task is incomplete without resource limits:

- maximum turns;
- maximum tool calls;
- maximum model tokens;
- maximum wall time;
- retry policy;
- concurrency;
- allowed tools and permissions;
- selection policy if several candidates are sampled.

Why? Because a system that succeeds after 200 tool calls is a different product from one that succeeds after five. A model that gets three hidden retries is not directly comparable with one given a single attempt. A research agent with two hours may rank differently from the same agent with 32 hours, as RE-Bench's human–agent comparisons illustrate [REBENCH-01].

The budget is part of what you are evaluating.

Report cost per **accepted** task, not cost per attempt. If a cheaper system needs four retries and an expensive judge, its token price is not its product cost.

## Build a deterministic harness

The harness should make task runs as comparable as practical:

- initialize from a known state;
- isolate tasks from one another;
- record model, prompt, tool, policy, and dataset versions;
- capture tool inputs, outputs, errors, and timestamps;
- enforce limits outside the agent;
- preserve final state;
- run graders independently of the agent;
- store enough evidence to reproduce the score;
- clean up safely.

SWE-bench's containerized harness exists because repository tasks otherwise inherit local dependencies, stale state, and environmental surprises [SWE-04]. Customer-service tasks need the same discipline for databases and APIs. A stale fixture can make an agent look either brilliant or confused. Neither result tells you much.

The harness should not expose grader secrets to the agent. If the full hidden test suite or model-judge rubric sits in the context, the agent is solving the grader as well as the task. Sometimes that is acceptable—the criteria are the product contract. Often it invites overfitting.

## Task quality needs review

Before accepting a task, ask reviewers:

1. Is the goal understandable from the information provided?
2. Does the setup contain everything required?
3. Are multiple valid solutions allowed?
4. Does the expected evidence follow from the stated contract?
5. Could a bad outcome pass?
6. Could a good outcome fail?
7. Is the task representative of a real capability or risk?
8. Does it contain private, copyrighted, or contamination-sensitive material?
9. Is the owner named?
10. When should it be reviewed or retired?

For high-stakes cases, seek independent perspectives from a domain reviewer and someone who did not write the task. Task authors know what they meant. Users and agents receive what they wrote.

The SWE-bench Verified process used three independent reviews for screened candidates [SWE-02]. Your internal suite may not need 93 Python developers, which is fortunate because they are difficult to fit in most sprint-planning rooms. It does need independent scrutiny proportional to the decision.

## Version everything that can change the meaning

At minimum:

- task dataset version;
- task ID and revision;
- policy and knowledge-base version;
- tool schema and environment image;
- agent prompt and orchestration code;
- model and inference settings;
- grader code, prompt, threshold, and model;
- harness version;
- evaluation date.

A score without these is an anecdote wearing a decimal.

Version changes do not all invalidate the same layer. A model change may require rerunning the whole suite. A model-judge change requires recalibration against expert labels. A database fixture fix may change only affected tasks. A policy update may make an old expected outcome actively wrong.

Store relationships, not just labels: task version 3 depends on policy version 12 and grader version 4. Six months later, that dependency map will save an archaeological dig.

## Protect users while learning from them

Production failures are valuable data. They may also contain personal, medical, financial, proprietary, or legally restricted information.

Before a trace becomes a task:

- minimize retained fields;
- redact or synthesize identifying details;
- preserve the diagnostic relationship, not the identity;
- control access and retention;
- record provenance;
- separate raw restricted traces from reusable fixtures;
- obtain review for sensitive domains;
- prevent eval outputs from entering training pipelines by accident.

For public benchmarks, respect anti-contamination requests. HealthBench's maintainers ask that evaluation examples not be reproduced in text or images [HEALTH-03]. So this book describes the schema and creates new examples. Responsible use sometimes means declining an available copy button.

## Field move

Use Exercise 3 and Template 2 to turn one frequent, one severe, and one ambiguous failure into task contracts. Hand them to someone who did not see the traces and ask for one valid success that fails and one invalid outcome that passes. Every example they find is a bug report that arrived before launch.
