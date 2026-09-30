# MCP and Skill Overload

Connected tools and skills can add capabilities, but their descriptions and results also consume context and make selection harder. There is no universal safe tool count.

The cost depends on what the client loads, how distinct the tools are and which definitions the task actually needs. Connecting a server does not necessarily load every tool into every turn.

## Two costs to measure

**Selection:** Similar or ambiguous tools can lead to wrong choices. Include tasks where no available tool applies, so retrieval is not rewarded for always selecting something.

**Context:** Long definitions and oversized results leave less room for task evidence. Measure tokens and latency separately from answer quality.

[Anthropic’s MCP implementation example](https://www.anthropic.com/engineering/code-execution-with-mcp) reports a reduction from 150,000 to 2,000 tokens using code execution and selective loading. That is one reported workflow, not a benchmark for every MCP integration.

## Keep the useful subset

Retrieve or discover tools on demand. Give them distinct names, short descriptions and clear argument schemas. Remove duplicates. Scope each subagent’s tools to its role, with authorization enforced independently of what the model sees.

Skills can use progressive disclosure: brief metadata advertises a capability, with full instructions loaded when needed. Inspect the actual client behavior rather than assuming the format guarantees lazy loading.

## Check the security trade

A concise description can hide important effects. Keep permission requirements, destinations and side effects clear. Treat instructions and executable resources as dependencies that need review and restricted privileges.

## Evaluate each addition

Compare selection accuracy, task completion, context use and latency before and after adding tools. Inspect wrong-tool and no-tool cases. A larger catalog earns its place only when it improves useful outcomes within budget.

See the [tool research references](codex-loops.html#ref-TOOL-1), [context guide](article-context-engineering-agent-loops.html) and [credential-leak study](article-llm-agent-skills-credential-leak.html).
