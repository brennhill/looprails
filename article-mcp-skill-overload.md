# MCP and Skill Overload: How the Number of Tools Affects Agent Accuracy

Every tool you connect to an agent has to introduce itself before the agent can use it. The name, a description of what it does, the parameters it takes, the shape of what it returns: all of that goes into the context window as text the model reads on every turn. One tool is a few lines. A dozen MCP servers, each exposing ten or twenty tools, is a wall of definitions the model wades through before it sees the actual task.

Anthropic's engineering team reported a case where loading all MCP tool definitions upfront cost about 150,000 tokens, and loading only the tools a task needed on demand dropped that to roughly 2,000 [TOOL-15](codex-loops.html#ref-TOOL-15). Same capabilities, same servers, two orders of magnitude difference in what the agent carried into the window. That gap is the whole subject of this article. The number of tools and skills you wire up is not free. It costs accuracy and it costs context, and both costs grow with the count.

This is first-party engineering reporting, not a peer-reviewed result, so read the specific number as illustrative of the mechanism rather than a benchmark. The mechanism is what matters, and it is well supported.

## The first cost: accuracy

Give a model two tools and ask which one fits the task, and it usually picks right. Give it two hundred and the picture changes. As the candidate set grows, the model confuses similar tools, reaches for one that almost fits, or calls one that does not belong. The research community has spent enough effort working around this that the workaround has a standard shape.

ToolLLM was built over more than 16,000 real APIs, and it does not put them all in front of the model [TOOL-1](codex-loops.html#ref-TOOL-1). It uses a retriever to pull a small relevant subset per instruction, for the plain reason that 16,000 API definitions cannot fit in any context window worth the name. Gorilla takes the same approach: an LLM paired with a retriever to call the right API out of a large set, which cuts down hallucinated calls compared to asking the model to know everything at once [TOOL-2](codex-loops.html#ref-TOOL-2). When the field's answer to "many tools" is consistently "retrieve a few," that tells you the model does worse facing the full pile.

It is also a genuinely hard retrieval problem, not a solved one. ToolRet found that standard retrieval models do poorly at tool retrieval, and the reason it has to be solved at all is that tool-using LLMs have limited context, so you are forced to select a subset and selection is the hard part [TOOL-9](codex-loops.html#ref-TOOL-9). The hardness compounds the accuracy problem: you cannot fit everything, you have to choose, and choosing well is its own engineering task.

Even when the right tool is available, models leave accuracy on the table in picking it. API-Bank, a multi-turn tool benchmark, shows models with large headroom in choosing the correct API for a step [TOOL-5](codex-loops.html#ref-TOOL-5). That headroom is the gap you widen by adding more candidates. The clearest direct evidence comes from a worked case in Less is More: cutting the tools presented to the model from 46 down to 19 let it pick correctly where the larger set tripped it up [TOOL-10](codex-loops.html#ref-TOOL-10). Fewer tools, better selection, on the same task.

Part of why bloat hurts is redundancy. COLT showed that pure semantic matching retrieves redundant, near-duplicate tools and misses the diverse set a task actually needs, so you have to curate for diversity rather than trust similarity scores [TOOL-6](codex-loops.html#ref-TOOL-6). Two tools that do almost the same thing do not double your capability. They double the chance the model picks the wrong one and add nothing. ToolRerank makes the related point that the size of the relevant subset should be tuned, not maximized [TOOL-7](codex-loops.html#ref-TOOL-7). There is a right number of tools to show, and it is not "all of them."

None of this is something you should take on faith for your own agent. The Berkeley Function Calling Leaderboard exists to measure exactly this: it scales to thousands of functions and includes cases where no function is relevant and the model must abstain rather than force a call [TOOL-4](codex-loops.html#ref-TOOL-4). The abstain case is the one that punishes a cluttered toolset, because a model staring at two hundred tools is more likely to find one that looks close enough and use it when the correct move was to do nothing. Measure your own tool-selection accuracy the same way, against a set that includes "none of these."

## The second cost: context budget

Set selection aside and assume the model picks correctly. The definitions still cost tokens, and spending tokens has a price of its own.

The window is smaller than the spec says. RULER showed that the effective context of a model is much shorter than its advertised length, and models degrade well before they hit the stated limit [TOOL-13](codex-loops.html#ref-TOOL-13). A model sold with a long window does not get to use all of it well. So the budget you are spending on tool definitions comes out of a pool that was already smaller than the number on the box.

Filling that pool with anything, even unrelated text, makes the model reason worse. Same Task, More Tokens held the task fixed and padded the input, and reasoning quality fell far below the model's maximum length just from the padding [TOOL-12](codex-loops.html#ref-TOOL-12). The task did not change. Only the amount of surrounding text did, and that was enough. Tool definitions the model is not using this turn are exactly that kind of padding: text in the window, competing for attention, doing nothing for the current step.

And where the important content sits inside the window matters. Lost in the Middle found that models use information best at the start and end of a context and underuse what falls in the middle [TOOL-11](codex-loops.html#ref-TOOL-11). When a third of your window is tool boilerplate, the task details, the constraints, the data the agent needs get pushed into the middle where the model attends to them least. You did not just shrink the usable budget. You moved the work into the part of the window the model reads worst.

Put the three together. The window is shorter than advertised, padding alone degrades reasoning, and the middle gets underused. Tool definitions hit all three at once. The room you thought you had for the task is smaller than the spec promised, and what you filled it with is competing with the work for the model's attention.

## What this does to turns

This is where the two costs land for anyone building a loop. A loop runs for many turns, and the window does not grow to fit them. Context engineering is the work of deciding what goes into the window each turn, and a window half-full of tool definitions makes that work harder before the loop does anything useful. See [context engineering for agent loops](article-context-engineering-agent-loops.html) for the full treatment.

The arithmetic is direct. If a large fraction of the window is spent on tool boilerplate every turn, the agent reaches its limit sooner. It has to compact or summarize earlier, which means it starts forgetting earlier: the goal from turn one, the decision from turn five, the constraint you pinned at the start. The loop gets fewer useful turns before quality starts to slide, because less of each turn's budget is available for the task and more of it is fixed overhead it pays whether it uses those tools or not.

That is why this shows up in loop health, not just in a single response. Two of the signals worth watching are context-used and turns: how much of the window is occupied, and how many productive turns the loop gets before it stalls or degrades. A fat toolset moves both in the wrong direction, raising context-used as a baseline and cutting the turns you get out of a run. See [loop health monitoring](article-loop-health-monitoring.html) for what to track. The point here is that the number of tools is one of the inputs to those signals, and it is one you control directly.

## MCP made this easy, which is the trap

The Model Context Protocol is an open standard for connecting AI tools and data sources, and it works [TOOL-14](codex-loops.html#ref-TOOL-14). Connecting a new server is a small amount of config, and once connected its tools are available to the agent. That ease is the reason the problem spread. When adding a server costs you five minutes and feels like pure upside, you add servers, and each one's tools load into the context window along with the rest.

The cost is invisible at connect time and shows up later as a slower, less accurate agent that hits its window sooner. Anthropic's first-party guidance is to load tools on demand rather than all upfront, the move that produced the drop from 150,000 to 2,000 tokens [TOOL-15](codex-loops.html#ref-TOOL-15). The protocol gives you the connections. Whether every connected tool sits in the window on every turn is a choice you make on top of it, and the default of loading everything is the expensive one.

## Skills attack the per-item cost directly

Agent Skills take a different angle on the same problem. They load through progressive disclosure: only a name and a short description sit in the context until a skill is actually invoked, at which point the full instructions and resources load [TOOL-16](codex-loops.html#ref-TOOL-16). You pay the small advertising cost for every skill and the full context cost only for the ones you use.

That is the general lesson stated as a design rule. A capability the agent might use should cost almost nothing until the agent uses it. A name and a sentence is enough for the model to know a skill exists and decide whether to reach for it. The body of the skill, the long instructions, the examples, the reference material, only needs to be in the window when the skill is running. Pay the full cost on use, not on connect. This is first-party engineering reporting again, but the principle holds independent of any one product: progressive disclosure turns a fixed per-item tax into a cost you only pay when there is something to show for it.

## The fixes

The moves below all follow from the two costs, and most of them are things you can do this week.

Retrieve a relevant subset per query instead of exposing everything. This is RAG over tools: index your tool definitions, and for each task pull the handful that fit rather than loading all of them into context. It is the approach behind ToolLLM and Gorilla, and Re-Invoke shows it can be done with unsupervised retrieval that scales to large toolsets, so you retrieve-then-use rather than load-all [TOOL-1](codex-loops.html#ref-TOOL-1) [TOOL-2](codex-loops.html#ref-TOOL-2) [TOOL-8](codex-loops.html#ref-TOOL-8) [TOOL-9](codex-loops.html#ref-TOOL-9).

Curate, dedupe, and namespace. Remove near-duplicate tools, because redundancy hurts selection and adds no capability, and tune how many you surface rather than maximizing the count [TOOL-6](codex-loops.html#ref-TOOL-6) [TOOL-7](codex-loops.html#ref-TOOL-7). Namespacing keeps two tools with similar names from colliding in the model's reading of them. The goal is a small, diverse, clearly distinct set, not a large one.

Write concise tool docs. Tool documentation that is clear and short lets models use tools zero-shot, matching or beating few-shot demonstrations [TOOL-3](codex-loops.html#ref-TOOL-3). A tight description does more for selection than a long one stuffed with examples, and it costs fewer tokens doing it. Long examples in a tool definition are padding the model carries on every turn.

Load on demand and use progressive disclosure. Do not put every tool definition in the window upfront when you can load the ones a task needs as it needs them [TOOL-15](codex-loops.html#ref-TOOL-15), and structure skills so only a name and a description sit in context until invoked [TOOL-16](codex-loops.html#ref-TOOL-16).

Scope each sub-agent to its own toolset. When a loop splits work across sub-agents, give each one only the tools its job needs rather than the full shared set. A research sub-agent does not need the deployment tools, and handing them over only adds clutter and selection risk to its window. This is context isolation applied to tools, and it is part of why multi-agent designs help; see [multi-agent loops](article-multi-agent-loops.html).

Set a tool budget. Decide how much of the window tools are allowed to occupy, the same way you set a budget for history or for retrieved data, and treat going over it as a problem to fix rather than a number to ignore. The toolset is one more claimant on a fixed window, and it should compete for space on the same terms as everything else.

Measure as you add. Track tool-selection accuracy against a benchmark that includes no-relevant-tool cases, and watch context-used as the toolset grows [TOOL-4](codex-loops.html#ref-TOOL-4) [TOOL-5](codex-loops.html#ref-TOOL-5). Adding a tool should be a change you can see the effect of, not a default you never revisit.

## Where this sits in LoopRails

The number of tools is a design knob, not a free upgrade. Past a point, more tools does not buy you more capability. It buys you more wrong turns and less room to work, because every definition you add spends accuracy on selection and spends context the task needed. The model picks worse from a bigger pile, and the pile itself crowds out the work.

Treat the toolset like the budget it spends. Retrieve a subset instead of loading all, curate and dedupe what you keep, write the docs short, load on demand, scope each sub-agent to its slice, cap how much of the window tools may take, and measure selection accuracy and context-used as you go. A lean toolset is a faster, more accurate loop that gets more useful turns before it has to compact. That is the trade, and it runs the opposite direction from the instinct to connect one more server.
