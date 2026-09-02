# Preface

This book began in the research for *The Delivery Gap*.

That work followed a stubborn mismatch: AI was making generation faster, but verification capacity was not keeping up. Once a defect entered the delivery pipeline, I kept tracing the same three outcomes. A machine caught it. A human saved it. Or it escaped into production. That investigation became the Verification Triangle: intent clarity, verification quality, and cost [DG-01].

The Triangle was built for AI-assisted software delivery, but one question refused to stay in its lane. What happens when the thing being verified is itself an AI agent? The definition of correct no longer sits neatly in a test suite. It may live in a database state, a citation, a policy, a tool trace, an expert judgment, or an outcome that arrives three days later.

That question became *Measure Twice, Prompt Once*. The title is a reminder to settle what counts as success before asking the model for another performance. Prompting changes the worker; measurement tells you whether the change helped.

Teams tried the clever prompt.

They tried the larger model.

They added a second clever prompt explaining the first clever prompt.

They tried capital letters.

Capital letters have a distinguished history in software requirements. They are also not a measurement system.

What made products improve was a loop: observe, define, measure, change, and observe again. The loop sounds obvious when written in one sentence. It becomes less obvious on Tuesday afternoon, when the demo works, the launch date is Friday, and someone asks whether the team really needs to label twenty more conversations.

This book is about that Tuesday afternoon.

Maybe you are the engineer wondering whether the eval tests the outcome or merely the wording. Maybe you are the product manager trying to turn “make it more helpful” into something a team can act on. Domain experts will recognize the dangerous mistakes hiding inside fluent prose. Leaders may recognize the green dashboard, the unhappy users, and the creeping suspicion that the dashboard is measuring the dashboard.

The central idea is that an AI system contains two loops.

The **agent loop** does the work. It observes, reasons, calls tools, checks results, retries, stops, or escalates. It may run in seconds.

The **eval loop** improves the worker. People sample real outcomes, analyze errors, turn failures into tasks, build graders, compare changes, and update the system. It may run over days or weeks.

The loops depend on each other. An agent loop without an eval loop can repeat mistakes at extraordinary speed. An eval loop disconnected from the agent loop becomes a benchmark program: impressive charts, limited influence, excellent snacks at the quarterly review.

The seam between them is where the working artifacts live: task cases, traces, graders, release rules, and production telemetry. Build that seam well and product development becomes cumulative. Every consequential failure can become a permanent case. Every change can be compared on the same evidence. Every judge can be challenged. Every release can be discussed in terms more precise than “the vibes seem better.”

Four published evaluation programs run through the book.

**SWE-bench** gives us executable truth: agents patch real software repositories and tests decide whether the patch works. Its later auditing also gives us a humbling lesson—tests can be precise and still encode the wrong contract [SWE-01] [SWE-03].

**τ-bench and τ³-bench** give us environmental truth: a customer-service agent may claim it changed a reservation, but the database gets a vote [TAU-01] [TAU-02].

**HealthBench** gives us expert truth: physicians define case-specific criteria for what a strong response must notice, communicate, and avoid [HEALTH-01].

**DeepResearch Bench** gives us evidentiary truth: a polished report is not enough; its claims must be supported by the sources it cites [DRB-01].

Together they show that there is no universal grader. The right grader depends on where truth lives.

Published programs rarely expose every link from private production trace to later maintenance. Appendix E therefore follows ParcelPath, a clearly fictional delivery assistant, through the entire chain. Its team reads traces, adjudicates expert labels, builds a runnable grader, calibrates the remaining judgment, changes the product, compares outcomes, and discovers six weeks later that the loop has acquired another job. The story's numbers prove nothing about the outside world. Its artifacts are there so you can inspect—and break—the machinery yourself.

Tool catalogs age before the screenshots do. The book uses small schemas and pseudocode, then spends its time on the work that survives a UI refresh: choosing tasks, defining evidence, calibrating judgment, comparing noisy results, learning from production, and deciding who owns the loop.

Certainty is unavailable. Evals are evidence, not a force field around production. A well-designed eval reduces uncertainty about a specific decision. A portfolio of offline tasks, deterministic checks, expert review, production monitoring, and controlled experiments reduces it further. An open system still refuses to become a theorem. Rude, but realistic.

Disciplined learning is a pretty good consolation prize.

The route starts with twenty real cases: build the closest trustworthy grader for each, attack those graders, compare variants on the same evidence, connect offline results to production, and keep the whole contraption alive.

Right. Let's get our hands dirty.
