# When an AI Coding Agent Drives a Phone Through the Terminal, No Screen Needed

- **Video:** https://www.youtube.com/watch?v=W3sZRAStjDs
- **Channel:** AI Papers: A Deep Dive
- **Published:** 2026-06-20
- **Duration:** 00:24:29
- **Captions:** auto-generated (en)
- **Retrieved:** 2026-09-02 (yt-dlp)
- **Cue count:** 655

## Chapters

- [00:00:00](https://www.youtube.com/watch?v=W3sZRAStjDs&t=0s) — The seven-tap delete versus the three-command delete
- [00:02:53](https://www.youtube.com/watch?v=W3sZRAStjDs&t=173s) — Android is Linux, and the question nobody asked
- [00:05:34](https://www.youtube.com/watch?v=W3sZRAStjDs&t=334s) — Is it even viable? The controlled comparison
- [00:08:15](https://www.youtube.com/watch?v=W3sZRAStjDs&t=495s) — Oracle solutions and the canyon of headroom
- [00:10:56](https://www.youtube.com/watch?v=W3sZRAStjDs&t=656s) — The apostrophe problem and when tools actually help
- [00:13:37](https://www.youtube.com/watch?v=W3sZRAStjDs&t=817s) — Building a highway: the new off-screen tasks
- [00:16:18](https://www.youtube.com/watch?v=W3sZRAStjDs&t=978s) — Why the cross-app wall is structural, not about intelligence
- [00:18:59](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1139s) — The steelman: did the contestants get equal coaching?
- [00:21:40](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1300s) — Cost, privacy, and the hybrid future

## Transcript

_Timestamps link into the video. Captions are auto-generated: no speaker labels, and names/jargon are often mangled — verify before quoting._

**[00:00:00](https://www.youtube.com/watch?v=W3sZRAStjDs&t=0s)**
Welcome to paperdive.ai, your daily deep dive into the frontier of AI research and the
engineering behind agents, one paper at a time. Right, let's get to it. >> 71.8% That's how
often one AI agent finished real tasks on a standard mobile benchmark, adding contacts, editing
files, juggling settings on an Android phone. Which sounds ordinary until you hear how it
pulled it off. This agent never once looked at the screen. It had never been trained on a phone
in its life. It was a coding agent, the kind of thing built to fix bugs in a software repo, and
it drove the entire phone through a terminal, typing text commands like it was logged into a
Linux box. And it beat every specialized

**[00:00:47](https://www.youtube.com/watch?v=W3sZRAStjDs&t=47s)**
phone-trained agent the authors could line up against it. That result is from a paper that went
up on archive on June 16th, 2026, and we're recording 3 days later on the 19th. Quick note
before we get into it. What you're hearing is AI-generated. The script was written by
Anthropic's Claude Opus 4.8. The paper is called Beyond the GUI Paradigm: Do Mobile Agents Need
the Phone Screen? I'm Bella, an AI voice from ElevenLabs. >> And I'm Eric, also an AI voice
from ElevenLabs, and neither of us nor either company has anything to do with producing this
show. So, let me ground that headline with the example the authors open on, Bella, because it's
the whole paper in miniature. The task is about as simple as it gets:

**[00:01:36](https://www.youtube.com/watch?v=W3sZRAStjDs&t=96s)**
delete one video file. It's called Backup Funny Zebra, sitting in the phone's movies folder.
The screen-based agent, the one that looks at the phone the way a person does, takes seven
steps. Open the files app, tap into the menu, find movies, tap in, search for the file, hit
delete, confirm. Seven careful taps, each one read off a fresh screenshot. The terminal agent
takes three. It lists the folder and sees nine files. It removes the one it wants. It lists
again, confirms eight remain. Done. Same task, same pass-fail check on whether the file is
actually gone. And a wildly different amount of work to get there. >> And that gap, seven
versus three, isn't

**[00:02:24](https://www.youtube.com/watch?v=W3sZRAStjDs&t=144s)**
really about deleting files. It points at a question the whole field had quietly skipped. For
years now, the standard recipe for a phone agent has been make it imitate a human thumb. You
take a vision model, you show it a screenshot, it figures out where the delete button is in
pixel space, and it emits a tap. Then you train it hard. You collect thousands of these
interaction traces, you fine-tune, you run reinforcement learning inside live Android
emulators. It's enormously expensive, and it makes in the assumption that the right way to use
a phone is to look at it. But here's what the authors noticed, and once you say it out loud, it
sounds almost too obvious. Android is Linux. Underneath the pretty interface, it's a

**[00:03:12](https://www.youtube.com/watch?v=W3sZRAStjDs&t=192s)**
Unix-like system with a full command line reachable through a developer tool called the Android
Debug Bridge. Through that terminal, you can list files, read an app's database, query system
services, change the state of the device directly, all in pure text without a single pixel ever
being drawn. So, the question the paper asks is just do mobile agents actually need the screen
at all? >> And I want to flag why that's not a cheap rhetorical question. Text is a language
model's native habitat. A coding agent reads terminal output, runs a command, reads the result,
runs the next one. That's exactly the loop it was built for. The bet here is that the skill
which

**[00:03:59](https://www.youtube.com/watch?v=W3sZRAStjDs&t=239s)**
lets Claude code, fix a bug in a Linux repo, transfers basically intact to operating a phone.
The screen was never the model strength. It was the human's interface. And we made the model
cosplay as a human to use it. >> Right. So, the paper is structured as a layered argument, and
each layer is built to answer the obvious objection to the layer before it. The first layer is
just, is this even viable? Can an off-the-shelf coding agent with zero mobile training keep up
with the specialists who were trained for exactly this? And the methodological move I really
admire here is how cleanly they isolate the variable. Same tasks, same random seeds, same
scoring. The only thing that changes is the

**[00:04:46](https://www.youtube.com/watch?v=W3sZRAStjDs&t=286s)**
interface. Does the agent see screenshots and emit taps, or does it see terminal text and emit
shell commands? Everything else is held still. >> That control is the part that makes the
comparison fair. And it hinges on one decision. How they grade. They don't use an AI judge
reading the transcript and forming an opinion about whether the agent did well. They use a
rule-based verifier, a script that just inspects the final state of the phone. Did the file
actually get deleted? Did the contact actually get added? Pass or fail, no model in the loop.
>> Which matters because both kinds of agent get judged purely on whether they changed the
world correctly, not on how they got there. Now, to make a coding agent work on a

**[00:05:33](https://www.youtube.com/watch?v=W3sZRAStjDs&t=333s)**
phone, you can't just hand it a terminal and walk away. It doesn't know what Android is. So,
the authors write it a system prompt distilled from public Android developer docs. And this is
where a skeptic should lean in, So, let me be precise about what's in it. It's generic
know-how. A four-phase rhythm, find the relevant data, inspect the current state, act, then
verify. A priority order for how to change things. Try the official channels first, fall back
to writing the database directly only if you must. Some efficiency rules like batch your
probes, and if two or three probes turn up nothing, stop digging. And a list of Android
gotchas. For instance, after you write a file, you have to ping the system so the photo app

**[00:06:21](https://www.youtube.com/watch?v=W3sZRAStjDs&t=381s)**
even notices it exists. What's crucially not in the prompt is any task-specific or app-specific
information. It teaches the agent how Android works in general. It never tells it the answer to
any task. >> And the headline number lives at the end of that setup? >> It does. The best
configuration, Claude code running on Opus 4.7, hits that 71.8% on the benchmark called Android
world, and just under 52% on a harder one called mobile world. The reproducible screen-based
baselines? On Android world, they land around 69, 68, 58%. On the harder benchmark, it's not
even close. They're at 43, 26, 13. And the part that makes this a paradigm

**[00:07:10](https://www.youtube.com/watch?v=W3sZRAStjDs&t=430s)**
result and not a lucky champion result, every CLI configuration they tried stayed competitive.
A second coding agent on a different model cleared 70% on Android world and did it in fewer
steps. It's not one clever agent, it's the whole class. >> So, that's viability handled. But,
viability just says as good as. The authors then ask a sharper question. How good could a
terminal agent possibly get? And they answer it by hand-building what they call oracle
solutions. >> Yeah, and this is my favorite stretch of the methodology. An oracle here is the
best possible terminal solution to a task constructed by humans working with the model. And
they impose two rules on it. One, it has to actually pass the verifier, no

**[00:08:00](https://www.youtube.com/watch?v=W3sZRAStjDs&t=480s)**
fantasy solutions. Two, and this is the honest part, it has to reach the answer through real
exploration. It's not allowed to cheat by peeking at the verifier's source code or hard-coding
the answer it already knows. Each task gets a few attempts with feedback and then three
independent professionals have to sign off. A task only counts as terminal solvable if all
three agree. And what they find is that about 89% of the tasks on Android world, 103 out of
116, are solvable through the terminal alone. On the harder benchmark, around 86%. But the
number that actually stopped me was the step count. Those oracle solutions average 3.7 steps
per task. The live agents were taking around 15.

**[00:08:51](https://www.youtube.com/watch?v=W3sZRAStjDs&t=531s)**
So, there's this enormous canyon of headroom between what the agents currently do and what the
paradigm can do. They're not near the ceiling, they're nowhere near it. >> And to their credit,
the 13 to 16 tasks that aren't terminal solvable are exactly the ones you'd predict. Transcribe
receipt photo. Freehand draw something. Take an actual camera picture. Record audio. Anything
genuinely visual or anything that captures fresh multimodal data that stays outside the
terminal's reach, full stop. They enumerate every one of them. It's an unusually honest way to
bound your own claim. >> Now, there's a wrinkle in here, I think, is the most quietly useful
finding in the whole paper. And it's about the tools.

**[00:09:38](https://www.youtube.com/watch?v=W3sZRAStjDs&t=578s)**
So, the authors don't just give the agent raw shell access. They also wrap some commands into
cleaner tools. A tool for running database queries, tools for reading and writing files, that
kind of thing. And these mostly exist to solve one mundane, infuriating problem, shell
escaping. >> Escaping, meaning the punctuation problem? >> Exactly that. When you type into a
shell, certain characters, quotes, apostrophes, have special meaning. And if you don't handle
them carefully, the shell misreads your command. Think of it like dictating a sentence full of
awkward punctuation over a bad phone line, versus just emailing the text. And there's a case
study in the paper that is honestly a little comedy of errors.

**[00:10:26](https://www.youtube.com/watch?v=W3sZRAStjDs&t=626s)**
One task involves saving a note. The bash-only agent, working with raw commands, burns 17 steps
fighting nested quotes and formatting. It ends up writing the wrong kind of empty value into
the database and fails. The version with the clean tools reads the schema in two tidy calls and
finishes in 11. There's an even crisper one where a single apostrophe in the French word
l'amour inside a note sends the bare bash agent down a 10-step escaping rabbit hole. The tool
version just encodes the text safely and does it in one shot. >> Strangled by an apostrophe for
10 steps. That's painfully relatable to anyone who's ever written a shell script. >> Right? But
here's the twist, and it's the actual finding. Those tools help

**[00:11:16](https://www.youtube.com/watch?v=W3sZRAStjDs&t=676s)**
weak models enormously, and strong models almost not at all. One model, GPT-5.3-Codex, jumps
something like 12 to 14 percentage points when you give it the tools, and gets meaningfully
cheaper to run, too. The strong clawed models, they barely move, a point or less. So, the
authors land on this crisp rule, tools should be gated on model strength. >> And the intuition
there is clean. Picture handing someone a nail gun. A novice carpenter who is losing time
fighting the hammer, they improve dramatically. A master who already internalized all the
fiddly mechanics, barely speeds up because the swing was never their bottleneck. The tools
remove the fiddly part.

**[00:12:04](https://www.youtube.com/watch?v=W3sZRAStjDs&t=724s)**
So, they rescue the weaker model and leave the strong one roughly where it was because the
strong one had already absorbed the escaping pain on its own. >> Which is a genuinely portable
lesson about agent design. Scaffolding pays off inversely to how capable your base model
already is. Okay, Eric, this is your half because so far the story is terminal agents match the
screen agents. The paper's bolder claim is that on a whole category of things people actually
want, it isn't even a contest. >> And this is where the paper turns from a result into an
argument. The authors make a claim about the benchmarks themselves. Every existing mobile
benchmark was designed around the screen. So, by construction, it only contains

**[00:12:53](https://www.youtube.com/watch?v=W3sZRAStjDs&t=773s)**
tasks a tap sequence can express. And that's a sampling bias. It means an entire class of real
user needs is just invisible to the scores because no one ever thought to measure what the
screen can't do. The analogy I keep coming back to, imagine testing how good a car is on a
track shaped like a parking lot. Tight turns, no straightaways. Cars built for cornering look
fantastic. You would never discover that some other car is twice as fast because your track has
no highway to find out on. The existing benchmarks are the parking lot. They can't reveal
capability that lives off the screen because there's no off-the-screen on the test. >> So, they
build a highway.

**[00:13:40](https://www.youtube.com/watch?v=W3sZRAStjDs&t=820s)**
>> They build a highway. 45 new tasks across five categories, all chosen specifically to be
things touchscreens serve badly. Bulk operations, filtering by multiple conditions,
aggregation, like top K, totals, averages, cross-app questions, and queries about hidden device
state, things that never appear on any screen at all, like which apps were granted background
location access. And they're careful. They check with embeddings that these tasks are genuinely
new and not just relabeled old ones. They also have human raters confirm each task is something
a real person would actually ask. >> And the results on the highway?

**[00:14:28](https://www.youtube.com/watch?v=W3sZRAStjDs&t=868s)**
>> A blowout. Every terminal agent beats every screen agent in all five categories. Overall,
the terminal agents score somewhere in the low to high 60s percent. The screen agents are stuck
between 22 and 33. And they do it in roughly half the steps, about 11 on average versus nearly
19. But the single number that I think is the most striking in the paper is in the cross-app
category. The screen-based agents cap out at 11% and it does not matter how big the model is.
11% is a wall. >> Hang on, though. That has to just be that the models aren't smart enough yet,
right? Throw a bigger model at it and the wall moves. >> That's the natural read and it's
wrong. And why it's wrong is the most beautiful

**[00:15:18](https://www.youtube.com/watch?v=W3sZRAStjDs&t=918s)**
part of the paper. The wall isn't about intelligence. It's structural. A cross-app task is
something like "Did anyone text me during my meetings yesterday?" To answer that, you have to
hold two apps in your head at once, the calendar and the messages, and reason across both. Now,
think about the screen agent's predicament. Every single step, it sees exactly one screenshot,
one screen. The moment it flips from the calendar to the messages app, the calendar is gone
from view. It's like being asked to compare two documents when you're only allowed to look at
one page at a time, and you have no memory between glances. Every time you turn to the second
one, you've forgotten the first.

**[00:16:07](https://www.youtube.com/watch?v=W3sZRAStjDs&t=967s)**
That's not a problem a smarter reader solves. The bottleneck is the one screenshot at a time
channel itself. One of these models, by the way, scored a flat 0% on cross-app. The terminal
agent just queries both apps' data into the same text workspace and reasons over all of it
together. The state lives in one place. >> And that explains the shape of the whole category
breakdown, doesn't it? The gap is biggest exactly where the task needs composition. >>
Precisely. The terminal lead is largest on aggregation, around 52 points, and on
multi-condition filtering, around 41. Those are the tasks where you're combining things,
composing filters, summing rows, set-level operations that

**[00:16:56](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1016s)**
a shell pipe or a database query expresses in one breath. And the lead is narrowest on plain
bulk operations, about 30 points. And the authors' framing of why is lovely, because for bulk
work, repeated taps can still get you there. You can grind. So, the advantage grows with
composition and shrinks with mere repetition. Summing a hundred numbers by tapping is tedious,
but doable. Filter to the rows above average, then total those. That's where the screen just
gives up on you and you give up on it. >> That's the part that lands for me as a real human
experience. The reason you don't check which apps have your location or whether your spending
is above your own average. It's

**[00:17:46](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1066s)**
not that it's impossible on a phone. It's that tapping through 40 screens to find out isn't
worth it. Those are the tasks people abandon and the terminal makes them one-liners. >> Right,
these aren't exotic. Show me my expenses above my average is a thing a normal person wants and
quietly never does. >> So, let me play the skeptic for a second because the paper is unusually
honest about its own soft spots and I don't want us to oversell this. The biggest one for me is
this really terminal paradigm beats screen paradigm or is it well-engineered terminal harness
beats off-the-shelf screen model? Because the terminal agents got a lot of love. That long
handcrafted system prompt, the four-phase reasoning cycle,

**[00:18:36](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1116s)**
the priority hierarchy, the custom tools. The screen baselines were mostly run as is. >> That's
the one that nags at me, too. And I don't think the Oracle ceiling fully closes it. The authors
are scrupulous that no task-specific answer leaks into the prompt. That part I believe. But, no
answers isn't the same as no engineering. The honest version of the claim is something like
with good harness engineering, the terminal paradigm reaches competitive territory and
dominates a class of composition tasks. What we don't know is what the screen side looks like
with equivalent harness love poured into it. The two contestants didn't get the same coaching.
>> And there are two more I think we have to say out loud because saying them makes the rest
more credible, not less.

**[00:19:24](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1164s)**
First, the very best reported screen agent actually still wins on one benchmark. There's a
system called UI Venus that hits 77.6% on Android world, higher than the terminal agent's 71.8.
The authors set it aside because its evaluation pipeline isn't public, so they can't reproduce
it. That's a defensible call, but it means the headline beats every screen baseline quietly
leans on the word reproducible. >> And second, the choice of which benchmarks to keep is itself
a little correlated with what terminal agents are good at. These benchmarks grade by checking
the final device state directly, which is precisely what a terminal manipulates directly. One
benchmark, Android Lab, was excluded

**[00:20:12](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1212s)**
because its verifier checks the interface structure instead, which doesn't fit the terminal
paradigm. That's a reasonable exclusion in isolation, but step back and the playing field,
while internally fair, was partly selected to be compatible with one of the players. >> And the
new task suite is, by the authors' own description, designed around tasks the screen wasn't
built for. So that 60 versus 30 blowout is somewhat self-fulfilling. It's real evidence that
these tasks exist and matter. It is not evidence about how often, in a normal day of phone use,
you hit a composition task versus a tap and go one. The realism rubric tells us the tasks are
plausible. It doesn't tell us they're representative. >> And I want to keep that one open
rather than tidy it away because

**[00:21:00](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1260s)**
I think it's the live question. The paper convinced me the category is real and that the screen
has a hard structural ceiling on it. It did not convince me, and I don't think it tried to,
that the terminal is the better default interface for the median thing a person does on their
phone all day. Those are different claims, and the second one is the one a product person
actually needs answered. >> I think that's fair, and I don't think the paper would fight you on
it. Which brings us to the limitations they put their own name to, and their candid. The
strongest terminal agents all run on frontier proprietary APIs. The total bill for all the
experiments in this paper was around $8,000. They flatly say that's well beyond what's
acceptable for everyday on-device use.

**[00:21:47](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1307s)**
This is a research result, not a product you're going to install next week. >> And there's a
privacy statement in there that's genuinely sobering, and I'm glad they wrote it. A deployed
terminal agent is a privileged process sitting on your device. It reads your private storage
directly, which means it sails right past the permission prompts that normally gate an app's
access to your messages, your location, your photos. And on every step, it ships what it reads
to a cloud model provider. The thing that makes it powerful, direct access to everything
underneath the screen, is exactly the thing that makes it a privacy problem. >> Which is why
the landing the authors reach for isn't the screen is dead. It's hybrid. Route the genuinely
visual tasks, read this receipt, edit this photo, anything

**[00:22:38](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1358s)**
that needs eyes, to a screen agent. Route the composition and the cross app and the hidden
state questions to a terminal agent. Different interfaces are good at different things, and the
future is probably a router that sends each task to whichever one fits. >> And that reframing
is the part I think outlives the specific numbers. The most portable idea in this paper isn't
terminals beat screens. It's the benchmark critique. Your benchmark can only ever contain what
your interface can express. We measured mobile agents inside a box drawn by the screen. And the
box hid an entire category of capability. That worry travels. It's just as true for web agents,
for desktop agents.

**[00:23:26](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1406s)**
Anywhere we've quietly let the human facing surface define what we even think to test. >>
That's the line I'll carry out of this one. We spent years teaching machines to use phones like
thumbs and never asked whether the thumb was the bottleneck. Turns out for a big slice of what
we actually want, it was. >> And the 11% wall is the proof that no amount of scale was going to
fix it from inside the screen. Some ceilings aren't about being smarter. They're about the
shape of the window you're forced to look through. >> The paper's linked in the show notes,
along with some further reading if you want to go deeper on it. And if you want the full
transcript with every term like content providers and shell escaping defined in line, plus the
links over to our other episodes on

**[00:24:14](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1454s)**
agents, that's all on paperdive.ai. >> This has been AI papers, a deep dive. Thanks for
listening.
