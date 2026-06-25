# Context Engineering for Agent Loops

A model only knows what is in its context window. Everything else, the codebase, the conversation from ten turns ago, the goal you gave it at the start, exists only if you put it there this turn. In a single prompt that is easy: you write the instruction, include the file, read the answer. In a loop it gets hard, because a loop runs for many turns and the window does not grow to fit them. Deciding what goes into that window on each turn is the work. Karpathy called it context engineering, and the name has stuck.

Take that as his framing for a real skill, not as a proven law. It sits on a ladder that the rest of this site uses. First prompting: writing one good instruction. Then context engineering: filling the window with the right files and constraints. Then harnesses: the tools, permissions, and rules the agent runs inside. Then loops: a system that prompts the agent, checks the output, and decides the next step until a goal is met. The loop rung depends on this one, because a loop is just context engineering repeated, turn after turn, while you are not watching.

## Why this matters more in a loop than in a prompt

In a single prompt you carry the whole conversation in your head and steer with each message. A loop has no one in the chair. It assembles its own context every turn from whatever state it kept, and keeps running. The window is finite, the turns are not, and what you carry forward decides whether the agent stays on task or wanders off it.

Most loops that go wrong do not go wrong because the model is weak. They go wrong because the context is. A loop that forgets the goal it was given, redoes a step it already finished, or talks itself in slow circles is showing you a context problem wearing a model costume. Swapping in a smarter model rarely fixes it, because the smarter model reads the same crowded, drifting window. Fix what goes into the window and the same model behaves.

## The window is a budget you spend every turn

Think of the context window the way you think about memory allocation, not as an infinite scratchpad. Every turn you spend it on the same handful of things: the system prompt, the goal and done-condition, the relevant code or data, the results of tools the agent called, and the running history so far. They compete for one fixed space. Add more history and you have less room for the file the agent needs right now. Paste in a whole log and you crowd out the constraint that keeps the work correct.

A budget forces choices, and the choices are the engineering. Spend the window on what this turn needs to make progress. Stop treating it as a place to dump everything in case it comes in handy. It will not come in handy. It will sit there taking up room and pulling the model's attention away from the part that matters.

## The four moves on each turn

Every turn, before you hand the window to the model, you make four decisions about what is in it.

**KEEP.** Some things have to survive every turn or the loop loses the plot. The goal. The done-condition. The hard constraints, the ones that are expensive to violate: do not touch production, stay inside this directory, never delete without a backup. These are small and cheap to carry, and they are the first things a long history will quietly push out if you let it. Pin them.

**DROP.** Most of what accumulates is dead weight after a turn or two. The full text of a tool result you already acted on. A path the agent tried that did not work. A sub-task that is resolved. Once the outcome is recorded, the raw material that produced it is just noise competing for space. Drop it.

**SUMMARIZE.** History grows without bound, and the fix is to compact it. Instead of carrying twenty turns of back-and-forth, carry a short running state: what has been done, what is left, what was decided and why. A paragraph that captures the last twenty turns leaves room for the present. Raw history that fills the window does the opposite, and the present is what the model is supposed to be working on.

**RETRIEVE.** The counterpart to dropping is pulling in exactly what the current step needs, when it needs it, instead of stuffing everything in up front. The agent is about to edit one module: fetch that module, not the whole repository. It needs one fact from a spec: fetch the section, not the document. Retrieval keeps the window small and current rather than large and stale.

These four are not a checklist you run once. They are the loop's job on every turn: the part of the orchestration that decides what the model sees before it sees it.

## Memory lives in a file, not the model

The agent forgets between turns. The window is short-term memory and nothing more, so whatever you do not carry forward or write down is gone. The fix is one of the LoopRails Doctrine principles: durable state belongs in a file or a store the loop re-reads, not in the model's head. The repository remembers; the agent does not.

In practice the loop keeps a memory file: the plan, the decisions, the running state, the audit trail. At the start of a turn it reads what that turn needs and puts it in the window. At the end it writes back what changed. The window holds the present; the file holds everything. That is what lets a loop survive a crash, resume where it stopped, and leave a record you can read afterward. A loop whose only memory is the live context loses the whole task the moment the process dies. Keep the file in version control for the same reasons you keep code there: history, diffs, and a known point to roll back to.

## Retrieval, and tool-result hygiene

Some facts change, and those do not belong baked into the prompt. Prices, inventory, the current state of a ticket, the latest version of a doc: put them behind retrieval (RAG) so the loop pulls the current value when it needs it, rather than carrying a copy that was right an hour ago. A fact hard-coded into the context goes stale silently, and a loop running on stale facts produces confident, wrong work.

Tool results are where budgets blow up fastest. An agent reads a file and the whole file lands in the window. It runs a command and a thousand lines of log come back. Paste that in raw, every turn, and history fills with material the agent already used. The hygiene is simple: summarize a large tool output down to the part that matters, or reference where it came from, and drop the rest once its result is captured. The agent needed the test failure, not the entire test run. Keep the failure, drop the run.

## Scope each sub-agent

A loop often splits work across sub-agents: a writer and a reviewer, a planner and an executor, one agent per file. Give each only the context its job needs. The reviewer needs the change and the standard it is judged against, not the writer's twenty turns of false starts. The executor needs the current step, not the planner's whole deliberation.

Isolation keeps each sub-agent focused and stops one sub-task's noise from leaking into another. It also keeps each window small, which is the budget argument again. A sub-agent handed the entire shared context inherits all of its clutter and all of its drift, then adds its own. Scope it to the slice it needs and it stays on task.

## The long-run failure modes, named plainly

A few specific things go wrong as a loop runs long, and they are worth naming so you recognize them.

**Context rot, or drift.** The goal was clear on turn one. By turn forty it is buried under thirty-nine turns of history, and the model optimizes for the recent conversation instead of the original task. The loop is still busy, just no longer pointed where you aimed it.

**Distraction by stale results.** Old tool output that should have been dropped is still in the window, and the model keeps reacting to it: re-reading a file it already changed, chasing a path it already abandoned. The window is describing a world that no longer exists.

**Lost in the middle.** Models tend to under-weight material buried in the middle of a long context, attending more to the start and the end. A constraint placed in the middle of a large block can get quietly ignored. This is a known tendency, not a fixed number; treat it as a reason to keep the window short and to pin the things that must not be missed where they will be seen.

## Practical tactics

Concrete moves that follow from all of the above.

Re-state the goal and the done-condition every turn. They are cheap to carry and the first thing drift erodes, so put them back at the top of the window each time rather than trusting the model still remembers them from turn one.

Keep a short running state in the memory file, and feed the model a summary of it, not the raw history. The summary is the present; the raw history is an archive the file can hold for you.

Compact when history crosses a fraction of the budget. Pick a threshold, a half or a third of the window, and when accumulated history passes it, summarize the old turns into the running state and clear them out. Do it on a rule, not by hand, because the loop runs while you are gone.

Drop tool output once its result is recorded. The verdict, the failure, the extracted value: keep that. The raw blob that produced it: let it go.

Scope each sub-agent to its slice: one job, the context for that job, nothing else.

## How to tell context is the problem

You usually do not get an error. You get a loop that is working hard and getting nowhere. The signs: it stalls or loops over the same moves. It repeats a step it already completed, because the record that it finished fell out of the window. It violates a constraint it was given earlier, because that constraint is now buried or gone. Its verifier score plateaus while it keeps reporting progress. These are loop-health signals, the ones a monitoring setup watches for, and most of them point back to the window before they point anywhere else. When a loop is busy and stuck, look at what is in its context first.

## Where this sits in LoopRails

Context engineering keeps a loop effective. It is what lets the agent stay on task across many turns instead of drifting, repeating, or forgetting. It does not decide whether the work is correct. That job belongs to the [verifier](article-evaluation-driven-development.html), and it is separate on purpose. A well-fed loop with a clean window can still produce a wrong answer, and a wrong answer that fits neatly in the budget is still wrong. The rails decide what ships: the verifier grades the work, the caps stop a runaway, action grading routes consequential steps to a human. Context engineering makes the loop good at its job. The rails make sure a good loop does not ship a bad result. You need both, which is why they are not the same part.
