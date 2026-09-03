# The Six Things You Must Get Right

An eval program can acquire a startling amount of machinery. Datasets. Rubrics. Judges. Dashboards. CI jobs. Review queues. A small parliament of YAML files.

Underneath all of it are six jobs. Miss one and the rest of the system becomes less trustworthy, no matter how handsome the dashboard is.

These are not maturity levels. A two-person team can do all six with a spreadsheet, a script, and a weekly meeting. A large company can neglect three of them while operating an impressive quantity of infrastructure.

## 1. Observe before you specify

Start with what the product actually did. Read real traces, outputs, tool calls, final states, user corrections, support tickets, and incidents. Ask a person who understands the domain to mark the first place the behavior went wrong. Name the failure only after seeing it.

This is how a team discovers that its real problem is not “accuracy.” Perhaps the assistant ends the conversation too early, uses the right tool with the wrong object, makes a promise the service cannot keep, or succeeds only after an expensive scenic tour through the tool catalog. Those failures need different fixes and different graders.

Inventing a taxonomy before reading the evidence is tidy and dangerous. It measures the failures the team expected, then congratulates the product for not having them. Error analysis belongs upstream of test design [MEDIA-01].

**The question:** What happened in real use, and where did it first go wrong?

## 2. Define the decision and the standard

An eval exists to inform a decision: ship this change, choose this harness, widen this rollout, keep a human review, retire a model, or investigate a failure. Write that decision down. Then define what counts as success for the cases involved.

“Helpful” is not yet a standard. “Correctly identifies an unavailable unit, offers only services we provide, and gives the user a valid next step” is getting there. The definition may include hard constraints. A product may require zero prohibited actions in a release set, a strict latency ceiling, or human approval for a high-consequence path. Those limits come from the product and its consequences, not from a generic recipe in a book.

An improvement does not need to clear an invented five-point hurdle to matter. The eval's job is to estimate what changed and how uncertain that estimate is. The product decision supplies the stakes.

**The question:** What decision will this evidence change, and what must be true for the answer to count as good?

## 3. Grade the consequence

Find the closest trustworthy evidence to the outcome. If the agent says it changed a reservation, inspect the reservation. If it writes code, run the code. If it cites a source, test whether the source supports the claim. If quality depends on clinical judgment, use criteria written by people with clinical expertise.

Prefer direct evidence over an opinion about the prose. Use environment state and executable checks where they fit; use rules, model judges, and expert review for the parts machines cannot settle cleanly. Composite products usually need composite graders. Fluency can describe an outcome; it cannot prove the outcome happened.

The four recurring cases in this book make the point from different directions: SWE-bench executes tests, τ-bench inspects state and actions, HealthBench uses case-specific physician criteria, and DeepResearch Bench checks claims against their sources [SWE-01] [TAU-03] [HEALTH-01] [DRB-01].

**The question:** Where does the truth become observable, and are we grading that—or merely grading the agent's description of it?

## 4. Test the measurement

Labels can be wrong. Rubrics can be vague. Model judges can miss the failure class they were hired to catch. Harnesses can leak answers, preserve stale state, or reward shortcuts. The test is part of the product, and it needs tests of its own.

Review disagreements instead of hiding them inside an average. Separate candidate error, label error, and genuine ambiguity. Keep judges narrow enough to diagnose. Compare their false passes and false holds with expert decisions, not just overall agreement. Try cases that should fool them. Protect verifiers from the system they grade. Revisit them when models, users, policies, or interfaces change [JUDGE-02] [HEALTH-04].

“The grader passed it” is the start of a useful conversation. It is not the end.

**The question:** How could the labels, rubric, judge, or harness be wrong—or be gamed?

## 5. Compare the whole system

The thing under evaluation is not a model name. It is the model plus its prompt, tools, context, memory, routing, retry policy, stopping rule, environment, and sometimes a flock of smaller agents doing mysterious errands.

Compare candidates on the same cases and record the conditions. Keep budgets and tool access visible. Split related cases as groups so near-duplicates do not flatter the result. Repeat stochastic work when consistency matters. Report failures, latency, cost, and tool behavior beside the headline score. Capability and reliability are different questions; a system can occasionally succeed at a task while remaining a terrible product [STAT-01] [ANTH-01].

Fair comparison does not mean every product uses the same release threshold. It means the evidence isolates the change well enough for that product to make its own decision.

**The question:** Did the candidates face comparable work and constraints, and did we measure the system users will actually meet?

## 6. Own the loop after launch

Offline evals are rehearsals. Production supplies new accents, integrations, policies, incentives, and forms of chaos that nobody thought to put in the rehearsal room.

Sample real outcomes. Connect offline scores with user and business consequences. Turn important incidents into cases. Give the task set, harness, labels, judges, release rule, and production review named owners. Put review and retirement dates on them. An eval suite without maintenance is not a safety net; it is a historical exhibit with a green build badge.

Ownership is shared but not vague. Domain experts own the meaning of good. Engineering owns reproducible execution. Product and operational leaders own the decisions and consequences. Someone must be able to say when a metric has stopped predicting what matters [ORG-09].

**The question:** Who reviews new evidence, who changes the eval, and when will they do it?

## The pocket version

Before trusting an eval result, ask:

1. **Did we observe real behavior?**
2. **Did we define the decision and the standard?**
3. **Did we grade the consequence?**
4. **Did we test the measurement?**
5. **Did we compare the whole system fairly?**
6. **Is someone keeping the loop alive after launch?**

Appendix B turns these questions into a copyable readiness checklist and rollout card. Chapter 15 supplies the longer thirty-day route.
