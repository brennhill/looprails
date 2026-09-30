# What Is Agentic AI?

An AI agent uses a model to choose steps and tools toward a goal. It can search, inspect results, change a file and decide what to try next. A fixed workflow follows control flow written by a developer; an agent chooses some of that control flow at runtime.

“Agentic” describes a design pattern, not a guarantee of intelligence, autonomy or reliability.

## The basic loop

1. Receive a goal and permitted scope.
2. Inspect the available state.
3. Propose an action.
4. Check permission and execute through a tool.
5. Observe the result and check progress.
6. Finish, retry within limits or escalate.

Tools turn a plausible answer into a real-world effect. That is why agent safety must include permissions and execution boundaries as well as response quality.

## When to use an agent

Use a fixed [workflow](article-agent-workflow-patterns.html) when the steps are predictable. Consider an agent when the route depends on discoveries during the task, such as debugging or researching several sources. Start with the simplest design that meets the need.

An agent earns more autonomy when success is checkable and mistakes are contained. A test-fixing agent in a disposable environment is easier to govern than one with production credentials and an ambiguous objective.

## What makes it reliable

Give the agent a clear goal, relevant context, well-defined tools and an external completion check. Cap time, cost, retries and cumulative effects. Keep credentials outside model-visible text where possible. Record actions and provide a tested stop.

[Anthropic’s agent-design guidance](https://www.anthropic.com/engineering/building-effective-agents) distinguishes workflows from agents and recommends adding complexity when it demonstrably helps. Benchmark success still needs validation in your own task distribution.

Build a small example with the [starter](https://github.com/brennhill/looprails/tree/main/starter) and [done-condition template](kit.html).
