# World Models for Agent Loops: Simulate Before You Act

An agent loop usually runs blind. It proposes an action, runs it, and only then sees what happened. For a reversible action that is fine: the loop tries something, checks the result, and moves on. For an action that moves money, drops a table, or ships code, acting first and learning second is how a loop hurts you. A world model changes the order of operations. It lets the loop ask what an action will do before it commits to doing it.

A world model is a model of an environment. Given the current state and a candidate action, it predicts the next state. Robotics and reinforcement learning have used world models for years to let an agent plan and practice without touching the real world. The newer development is building them out of language models, over the messy text-shaped environments that agents actually work in: shells, codebases, browsers, ticket systems, APIs.

A June 2026 paper from the Qwen team, "Qwen-AgentWorld: Language World Models for General Agents" [WM-1](codex-loops.html#ref-WM-1), is a useful marker of where this is heading. The authors train language world models (they report two, at 35B and 397B parameters) on more than 10 million trajectories across 7 domains, using continued pretraining, supervised fine-tuning, and reinforcement learning. They report that using the world model as a simulator for warm-up training improved downstream agent performance and, on their own benchmark, exceeded training in the real environment. Read those as the authors' results on their own benchmark rather than a settled law. The direction is what matters: simulating the environment is becoming a first-class part of building capable agents.

Here is why this belongs in LoopRails. A world model answers exactly one question: if the agent takes this action, what happens next. That is a consequence preview, and consequence is half of how LoopRails decides who is allowed to run an action. A world model is, in framework terms, a way to dry-run an action you could not otherwise dry-run.

## Where it fits in the loop

A world model slots into three places you already have.

The first is a checker in front of a graded action. LoopRails grades each action G0 to G3 by reversibility, blast radius, and stakes, and routes the high grades to a human. Before that human gate, the loop can simulate the action and inspect the predicted outcome. A predicted result that deletes more than expected, or touches a table nobody mentioned, gets stopped before anyone is paged. This is the maker and checker split with a cheap first checker: the world model catches the obvious mistakes, and the human spends attention on the ones that survive. Used this way it lowers how often a reversible-but-annoying action needs a person, without lowering the bar on the actions that truly matter.

The second is planning by lookahead. Instead of act, check, repeat, the loop can roll out a few candidate action sequences against the world model, score the predicted outcomes, and execute the one that looks best. Control engineers call this model-predictive control, and it makes a clean loop pattern: plan in simulation, act in reality. The plan-in-simulation recipe in the [loop patterns](article-loop-patterns.html) cookbook is exactly this shape.

The third is offline evaluation and drift detection. A world model gives you a stable, cheap, repeatable environment to test a loop in before it runs against the real thing, which is the same idea as [evaluation-driven development](article-evaluation-driven-development.html) applied to the whole environment rather than one output. Run the loop against the simulator, watch the score, and a regression shows up as a number going down instead of an incident in production. That ties into [loop health](article-loop-health-monitoring.html): the simulator is one more place the verifier-score trend can warn you early.

## The catch: a prediction is a claim

A world model is itself a model. Its prediction can be wrong, and it will be most wrong exactly where the environment is unusual, which is often where the dangerous actions live. The gap between what the model predicts and what the real environment does, the sim-to-real gap, never fully closes. A model trained on ten million ordinary trajectories has seen very few of the rare, expensive states you most want it to get right.

So a world model lowers the need for a real verifier and a human. It does not remove them. Treat the simulated outcome the way LoopRails treats any oversight signal: a claim to confirm before you rely on it. A confident world model that is quietly wrong is a fresh way to build a rubber stamp, and the loop will feel safer while being less safe, which is the worst place a loop can be. The rule holds at the top of the grade scale: for an irreversible, high-stakes action (a [G3](guide-g3.html)), the simulation informs the human, it does not stand in for them.

There is a quieter risk too. If the same model both proposes the action and predicts its outcome, it can be wrong in a way that agrees with itself, predicting success for a plan it already likes. A checker is only worth something if it is independent of the maker. Where you can, the predictor and the actor should not be the same model carrying the same blind spots.

## You do not need a 397B model to start

The technique scales down, and the discipline is worth more than the parameter count. Before any large world model, you can get most of the value by asking a model, even a cheaper one, to predict the outcome of a consequential action and flag anything surprising before the loop runs it. For a narrow domain you can skip the model entirely: a dry-run flag, a transaction you can roll back, a SQL EXPLAIN that shows what a query will touch, a plan output from an infrastructure tool. These are all consequence previews, and they predate the term. What a learned world model adds is coverage of environments too open-ended to dry-run by hand.

The habit is the point. A loop that previews its consequential actions, by whatever means, is a loop you can let run further on its own, because it stops more of its own mistakes before they land. The quality of the predictor sets how much you can trust the preview, and the grade of the action sets how much trust you are allowed to extend.

## Fitting it to the rails

A world model plugs into the parts you already have rather than replacing them. It feeds the grade, by predicting blast radius. It acts as a cheap first checker before the human gate. It gives the verifier a second input, a predicted outcome to compare against the real one. It does not change the caps, the circuit breaker, the kill switch, or who signs off on an irreversible action. Add it where the cost of acting blind is highest, and leave the rest of the loop alone.

Used this way, a world model makes a loop both more effective and safer at once: more effective because it can plan and pick the best action, safer because it previews the worst one. That is rails in both senses, which is the whole idea. For where the human still belongs in all of this, start with the [LoopRails framework](framework.html).
