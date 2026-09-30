# Context Engineering for Agent Loops

Context engineering decides what information the model receives on each turn: goals, constraints, current state, tool definitions, retrieved evidence and recent results.

A long context window does not guarantee that every detail will be used reliably. Relevant information can be omitted, buried or distorted during summarization.

## Give each turn a useful state

Keep the goal and hard constraints explicit. Supply current artifact locations, completed actions, unresolved questions and the evidence needed for the next decision. Retrieve task-relevant material instead of repeatedly pasting the whole corpus.

Persist operational state outside the conversation. A summary can point to evidence, but should not replace authoritative records of what actually happened.

## Budget the window

Tool definitions, history and large results compete for space. Load capabilities when needed, trim irrelevant output and keep source identifiers for omitted details. Do not truncate away an error or policy exception just to save tokens.

[Anthropic’s MCP engineering example](https://www.anthropic.com/engineering/code-execution-with-mcp) demonstrates context savings from on-demand tool use and processing results outside the model. It is an implementation example, not a fixed saving for every client.

## Protect the instruction boundary

Treat retrieved content and persistent notes as untrusted unless their origin establishes authority. A poisoned document or memory file can carry an attack into later turns. Separate task evidence from rules the agent must obey.

Scope each subagent to its job and return a compact handoff with artifacts, evidence and unresolved issues. More context is useful when it supplies missing information; less context is useful when it removes distracting material. Measure both.

## Diagnose with comparisons

Compare runs with a minimal relevant context and the full history. Track selection errors, forgotten constraints, cost and task outcomes. See [tool overload](article-mcp-skill-overload.html) and [loop health](article-loop-health-monitoring.html).
