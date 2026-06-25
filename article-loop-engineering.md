# What Is Loop Engineering?

Loop engineering means you build a system that prompts an AI agent, checks its output, and decides the next step, instead of typing every prompt by hand. You define the goal and the conditions for "done," and the loop runs until it gets there. You stop being the person in the chat box and become the person who designs the machine that runs the chat box.

That is the short version. The longer version is more interesting, because moving from hand-prompting to loop-building does not get rid of your judgment. It moves it. This article explains what loop engineering is, where it came from, and what it changes about oversight. The change is the part most people miss. For what loop engineering looks like when it works and when it fails, with measured results, see [agentic loops in the wild](article-agentic-loops-in-the-wild.html).

## The term and where it sits

The name is recent. According to a June 2026 LinkedIn post that the LoopRails site owner shared, Google engineer Addy Osmani named "loop engineering" that month, shortly after Boris Cherny, who runs Claude Code at Anthropic, described his own work this way: "My job is to write loops." Treat the date and the naming as a reported claim rather than settled history. The idea behind it is straightforward enough to stand on its own.

It helps to see loop engineering as the latest rung on a ladder, because each rung is a response to the one before it.

**Prompts came first.** You wrote a good instruction and got a good answer. The skill was wording.

**Then context engineering.** Andrej Karpathy's term for filling the model's context window with the right information: the relevant files, the prior decisions, the examples, the constraints. The skill moved from phrasing one request to assembling everything the model needs to answer well.

**Then harnesses.** A harness is the environment a single agent runs inside: the tools it can call, the files it can read, the commands it can run, the rules it follows. You stopped tuning the words and started building the room the agent works in.

**Then loop engineering.** This puts that room on a schedule and lets it run without you in the chair. In practice that looks like scheduled automations, isolated git worktrees so parallel runs do not collide, reusable skills the agent can pull in, and subagents that split the work (one writes while another reviews). The model itself forgets everything between runs, so memory lives in a file the agent reads at the start of each run. The agent forgets. The repository remembers.

So the trajectory is: better words, then better context, then a better environment, then that environment running on its own.

## Why this is happening now

The pressure behind loop engineering is volume. Inside Anthropic, engineers reportedly ship roughly 8x more code per quarter than they did a year ago. Take that as a reported figure, not a measured fact you can lean on, but take the direction seriously, because it explains the rest.

When one person can produce that much more code, the hard part stops being how fast you write. It becomes how reliably you check. A human reviewing line by line cannot keep up with output at that scale, and a human approving things they did not really read is worse than no review at all. The bottleneck shifts from production to verification.

That shift has a quieter name than "loop engineering," and it is the serious half of the movement: evaluation-driven development. The idea is that an automated check, not your gut feeling, decides whether each change actually improved things. You write the check first, the loop runs against it, and the check either passes or it does not. As the LinkedIn post put it: "The verifier is what separates a loop from a vibe." A loop without a verifier is just an agent making changes quickly and you hoping they are good. A loop with a verifier is a system that can tell, on its own, whether it is making progress.

That distinction is the whole ballgame, and it leads straight to the part this site cares about.

## A loop does not remove oversight, it relocates it

Here is the move that gets misread. People look at loop engineering and see autonomy: the human steps out, the machine takes over, oversight is gone. That is not what happens. When you stop prompting each step by hand, you are not removing your judgment from the system. You are pulling it out of the per-step prompts and pushing it into three places you now have to get right.

**The goal and the done-conditions you define.** When you hand-prompt, you steer continuously, correcting the agent turn by turn as you watch it work. A loop has none of that. It runs against whatever target you wrote down. A vague goal or a sloppy definition of "done" no longer gets caught by you noticing mid-task and redirecting. It just runs to the wrong finish line, fast, and possibly many times. The specification stops being a convenience and becomes a control surface. If the loop does the wrong thing correctly, that is usually a goal you defined badly, not a model that misbehaved.

**The automated verifier.** This is the check that decides whether each pass improved things. In hand-prompting, you are the verifier: you read the diff, run it in your head, and decide. In a loop, that judgment has to be written down as something the loop can run: a test suite, an evaluation, a scorer, a linter, a comparison against expected output. The verifier is doing the job your eyes used to do, on every iteration, at machine speed. If it is weak or measures the wrong thing, the loop will happily optimize toward a number that does not mean what you think it means. A loop is only as trustworthy as the thing checking it.

**A small number of human checkpoints.** Some actions a verifier cannot judge, because the question is not "is this correct" but "should we do this at all." Sending money, deleting production data, publishing something public, merging to a shared branch, granting access. These are high-consequence and often irreversible, and an automated check has no standing to approve them. This is where a human still belongs in the loop. The trick is to keep that set small and aimed at exactly the actions that need it, so the human is a real reviewer at the moments that matter instead of a rubber stamp on a wall of prompts they cannot read.

So oversight does not disappear when you build a loop. It concentrates. Three things you used to do implicitly, turn by turn, now have to be designed explicitly and up front. Get them wrong and a loop is a way to make mistakes faster than you can see them. Get them right and a loop is a system you can actually trust to run.

For a fuller picture of what the agent inside the loop actually is, see [what agentic AI is](article-what-is-agentic-ai.html). And if you are deciding how much freedom to hand a given loop in the first place, the guide to [AI agent autonomy levels](article-ai-agent-autonomy-levels.html) maps how much room to give an agent to how much damage it can do.

## What changes for the person building it

If you are used to driving an agent by hand, the daily work changes shape. You spend less time wording requests and more time writing specifications, building verifiers, and deciding which actions deserve a human checkpoint. The repository carries the memory, so you spend real effort on the file the agent reads at the start of each run, because that file is the difference between an agent that picks up where the last run left off and one that relearns the project every time.

You also think harder about blast radius. A hand-prompted agent is bounded partly by you watching it. A loop is bounded only by what you set up before it ran: the worktree it is isolated in, the credentials it holds, the network it can reach, whether its actions can be undone. The controls you put in place before the loop starts are the controls you have, because once it is running you are not in the chair.

None of this is exotic. It is the same engineering discipline you already apply to anything that runs unattended: define the goal precisely, check the result automatically, and put a human gate on the handful of actions that genuinely need one.

## Where to go next

Loop engineering is the shift from prompting an agent by hand to building a system that prompts it for you. The system needs a clear goal, a check that decides whether each pass actually helped, and a few human gates on the actions a check cannot judge. Those three are where your oversight now lives.

Two of them deserve their own treatment, and the next pieces cover them. The verifier is the heart of [evaluation-driven development](article-evaluation-driven-development.html): how to write a check that actually decides progress instead of one that flatters the loop. The human gates are the safety side, covered in [keeping an autonomous loop on the rails](article-loop-engineering-oversight.html): which actions need a checkpoint, how to keep the set small, and how to make sure a missed step is still recoverable. For how all of this fits together into a method you can apply to your own loops, start with the [LoopRails framework](framework.html). Build the loop, then build the things that keep it honest.
