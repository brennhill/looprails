# Autonomous Agent Patterns: A Recipe Book

An autonomous agent runs a loop. It looks at the goal and the current state, decides on an action, takes it, reads the result, and repeats until the work is done. That is the whole shape, and that flexibility is both the point and the danger. A scripted workflow does the same three steps in the same order every time. An autonomous agent picks the next step itself, which means it can handle problems you did not anticipate, and it can also wander, repeat itself, or declare victory on work that is not finished.

The recipes below are the pieces you assemble to build one. Most real agents combine several of them: a ReAct core, some typed tools, a memory file, a plan up front, a reflection pass on the output. None of these patterns is exotic. The skill is knowing what each one buys you, how each one fails, and what to put around it so a bad step does not turn into a bad outcome.

The LoopRails stance runs through all of them. Autonomy is earned, not assumed. Every step the agent can take should be graded by consequence and bounded by a hard limit on iterations, time, and spend. And the thing that decides whether the agent is making progress should be an independent check, a test or a tool result or a separate judge, not the agent's own opinion of its work. Keep those three ideas in mind and the rest of this chapter is just where to apply them.

## The core loop

### ReAct (reason, act, observe)

**What it is:** the base pattern most agents sit on. The model thinks about what to do, calls a tool, reads the result, and uses that result to decide the next step. Reasoning and acting alternate in a loop instead of the model trying to plan the entire job in one shot.

**When to reach for it:** almost any task where the agent needs information it does not have up front, or where each step depends on what the last step returned. Searching a codebase, debugging a failure, answering a question that needs a few lookups. If the work involves "find out X, then decide what to do based on X," ReAct is the default.

**How it fails:** the two big ones are thrashing and losing the goal. Thrashing is when the agent repeats the same action and gets the same result, like rerunning a failing command or searching the same term three times, because nothing in the loop notices it is stuck. Losing the goal happens over a long run: after thirty steps the agent is solving a sub-problem it invented and has drifted off the thing you actually asked for. A third failure is context bloat, where every observation gets appended to the window until the window is mostly stale tool output and the model's attention is buried.

**How to fix it:** detect repeats and break the loop on no-progress. If the last few actions and their results look the same, stop and escalate rather than burn another iteration. This is a circuit breaker, and it pairs with a hard cap on total iterations so a confused agent cannot run forever (more in [keeping an autonomous loop on the rails](article-loop-engineering-oversight.html) and [circuit breakers for AI agents](article-failure-recovery-agent-loops.html)). Keep the goal in front of the model by restating it each turn rather than trusting it to remember from twenty steps ago. And manage the window: summarize or drop old observations so the agent reasons over a tight, current picture instead of a transcript ([context engineering for agent loops](article-context-engineering-agent-loops.html) covers the how). Grade each action the agent can take, so the loop runs free on the cheap G0 and G1 steps and routes the consequential ones to a human.

### Reflection / self-critique

**What it is:** the agent looks at its own output, critiques it, and tries again. Draft an answer, ask "what is wrong with this," then revise. It is a cheap way to catch sloppy first attempts before they ship.

**When to reach for it:** writing and editing tasks, code the agent just produced, plans before they execute, anywhere a second pass tends to catch obvious mistakes. Reflection earns its place most when there is a real signal to reflect against, like a failing test or a tool that returns an error the agent can read and fix.

**How it fails:** here is the caveat that matters, said plainly. A model grading its own work with no outside signal often does not improve, and sometimes makes things worse. It talks itself out of a correct answer, or it rewrites a passable draft into a worse one while feeling more confident about it. The model that produced the mistake is the same model judging it, with the same blind spots, so the critique tends to be a mirror rather than a check. You get the appearance of rigor (a critique step, a revision) and none of the substance, because nothing independent ever said the new version was actually better.

**How to fix it:** give reflection something real to react to. The critique should point at an external signal, not at the model's own taste. Run the tests and let the failures drive the revision. Run the code and feed the stack trace back in. Use a tool result, a linter, a schema check, or a separate judge model that was not the author and does not share its context. The rule is that an independent verifier decides whether the new version is better, not the agent's say-so. If you cannot give reflection an outside signal, be honest that you are running a vibe check, and do not let it gate anything that matters. This is the maker-checker idea applied to a single agent: the checker only helps if it is genuinely separate from the maker ([maker-checker for AI](article-maker-checker-ai.html)).

### Plan-and-execute

**What it is:** the agent makes a plan first, a list of named steps, and then carries them out one by one. Separating "decide the approach" from "do the work" gives you steps you can name, retry, and roll back to, and a plan a human can read and approve before any work starts.

**When to reach for it:** multi-step tasks with real consequences, where running blind is risky and you want a checkpoint before execution. Migrations, refactors that touch many files, anything where a human should sign off on the approach before the agent starts editing. It also helps on long tasks because the plan is a stable anchor the agent can check itself against, which fights goal drift.

**How it fails:** plans go stale. The agent commits to a plan written before it knew what it would find, and then marches through the steps even after step two revealed the plan was wrong, because following the plan is easier than admitting it broke. The opposite failure is replanning on every observation, where the agent throws out the plan and rewrites it each turn, so the plan stops meaning anything and you are back to a ReAct loop with extra ceremony. Plans also hide premature stopping: the agent checks off the last step and declares done, when "done" was the plan's idea of done, not the goal's.

**How to fix it:** treat the plan as revisable but not disposable. Let the agent update it when an observation genuinely contradicts it, but make replanning a deliberate move, not a reflex on every step. Put approval where it pays: a human approves the plan before execution for consequential work, which is plan-approve oversight, and the agent checkpoints between steps so you can roll back to a named point instead of unwinding a tangle. Tie "done" to an independent check on the goal, not to the last box being ticked. More on staging and approval in [agent workflow patterns](article-agent-workflow-patterns.html).

## The interfaces

### Tool use / function calling

**What it is:** you give the agent a set of typed tools instead of letting it guess. Each tool has a name, a description, and a defined set of arguments. The agent picks a tool and fills in the arguments, the tool runs, and the result comes back into the loop. This is how an agent touches the world: reads a file, queries a database, sends a request, runs a command.

**When to reach for it:** any time the agent needs to do something real rather than just produce text. Tools are also how you control what the agent can do, because the agent can only take actions you handed it. A small, well-shaped toolset is one of your strongest levers.

**How it fails:** hallucinated arguments are the classic one. The agent calls a real tool with a made-up file path, an invented ID, or arguments in the wrong shape, because it pattern-matched a plausible call instead of grounding it in something it actually saw. Tools with vague descriptions get used for the wrong job. Overlapping tools confuse the agent about which to pick. And a tool that fails silently or returns a confusing error sends the agent into a retry loop, hammering the same bad call.

**How to fix it:** make the tool boundary do the work the prompt cannot. Validate arguments at the tool, reject a malformed or non-existent path with a clear error, and return a message the agent can act on rather than a stack trace it will misread. Keep tool descriptions sharp and the toolset small, with no two tools that do almost the same thing. Have tools return errors the agent can recover from, like "that file does not exist, here are the ones that do," which turns a hallucinated argument into a correction instead of a loop. And grade tools by consequence: a read-only query is G0 and runs freely, while a tool that deletes data, spends money, or sends something external is G2 or G3 and gets a gate or a human. The grade lives on the tool, because the tool is the action. See [agent approval gates](article-ai-agent-approval.html) for where to place those gates.

### Memory

**What it is:** what the agent remembers, split into two kinds. Short-term memory is whatever fits in the context window this turn, the recent conversation and tool results the model can see right now. Long-term memory is a store or a file the agent reads and writes across turns, so information survives past the point where the window fills up. The plain version: the agent forgets, so write the state that matters to a file.

**When to reach for it:** short-term memory you always have, it is the window. You reach for long-term memory when a task runs longer than a single window can hold, when the agent needs facts from earlier that have scrolled off, or when several runs need to share state. Anything that runs for hours, or restarts, or hands off to another agent, needs durable state somewhere other than the window.

**How it fails:** the window is finite, so on a long run the early context, including the original goal and key decisions, scrolls off and the agent forgets what it was doing. Context bloat is the same problem from the other side: the window fills with stale tool output and old reasoning, the useful state gets buried, and the model's quality drops as the signal-to-noise gets worse. Long-term memory has its own failure: the agent writes to it sloppily or never reads it back, so the store exists but does not actually inform the next step, and you have the cost of memory with none of the benefit.

**How to fix it:** put durable state in a file, not just the window. A running scratchpad the agent updates with the goal, the decisions made, what is done, and what is left, then reads back at the start of each turn, survives the window filling up and gives the agent a stable spine on a long task. Summarize old context aggressively so the window stays current instead of accumulating a transcript. Be deliberate about what goes into long-term memory, because a store full of everything is as useless as no store at all. [Context engineering for agent loops](article-context-engineering-agent-loops.html) is the deep version of this recipe.

## The shape of the system

### Single-agent vs multi-agent

**What it is:** the choice between one agent doing the whole job with good tools, and several agents splitting the work. Multi-agent means an orchestrator handing pieces to workers, or a writer and a separate reviewer, or several agents exploring in parallel and combining their results.

**When to reach for it:** reach for more agents when you get something a single pass cannot give you cheaply. Three cases earn it. Breadth, where several agents cover different parts of a problem at once and a later stage merges them. Independent cross-checking, where a separate agent argues against an answer and catches errors the first agent's pass would not, which only works if the checker is genuinely independent. And clear role separation, where the work moves through distinct phases and giving each phase its own agent with typed handoffs keeps the seams clean. Outside those cases, one strong agent with a good toolset is usually simpler and more reliable, and the gap a second agent has to justify keeps shrinking as base models improve.

**How it fails:** every boundary between two agents is a place intent gets lost, a message gets misread, or an error slips through unchecked. More agents means more coordination cost and more failure surface, and teams reach for it too early because the architecture diagram looks impressive. The common breakages: agents talking past each other over free-form chat, context dropped across a handoff, and the reviewer trap, where a reviewer agent drawn from the same model with the same context rubber-stamps bad work instead of catching it, because a mirror makes correlated errors. A worker taking a consequential action no human approved is the failure that actually hurts.

**How to fix it:** split only when one of those three wins is real, and pay the coordination cost on purpose. When you do split, prefer typed handoffs over open conversation, so each agent passes an artifact the next one can check (a spec, a diff, a test) rather than an opinion it has to trust. Make any reviewer genuinely independent: a different prompt, blinded to the author, required to cite evidence like a failing test rather than render an opinion. And grade oversight per agent, not once for the whole system, because the orchestrator, each worker, and the reviewer each get their own grants and their own gates. The full treatment is in [multi-agent loops](article-multi-agent-loops.html).

## The bounds that hold it together

Read the recipes back to back and the same failures keep showing up. Tool-call loops and thrashing. Hallucinated arguments. Losing the goal over a long run. Context bloat as the window fills with stale history. Reflection that degrades quality because nothing outside the model ever checked it. Premature stopping, where the agent declares done on work that is not. And underneath all of them, two structural risks: runaway autonomy, an agent with no cap and no off switch, and unverifiable progress, a loop that cannot actually tell whether it is getting closer to the goal.

The fixes are not one per recipe. They are a handful of moves you apply across the whole system. Grade every action the agent can take on the G0-G3 scale, so the cheap reversible steps run free and the consequential ones route to a human. Bound the loop with hard limits on iterations, time, and spend, plus a circuit breaker that trips when the agent stops making progress and a kill switch a human can hit at any time. Put an independent verifier in charge of deciding progress, a test or a tool result or a separate judge, never the agent's own opinion of its work, which is the reflection caveat generalized to the whole loop. And keep the durable state in a file, so the goal and the decisions survive the window filling up.

That is the LoopRails recipe under all the others. The patterns in this chapter give an agent the freedom to decide its own next step. The bounds are what make that freedom safe to hand out. Build the loop, then build the things that keep it honest and keep it inside its limits, and make sure the check that grades it sits where the agent cannot reach it. For how the whole approach fits together, including exactly where a human still belongs, start with the [LoopRails framework](framework.html).
