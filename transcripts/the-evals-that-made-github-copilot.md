# The Evals That Made GitHub Copilot

- **Video:** https://www.youtube.com/watch?v=LwLxlEwrtRA
- **Channel:** Hamel Husain
- **Published:** 2025-05-13
- **Duration:** 00:58:26
- **Captions:** human-written (en-US)
- **Retrieved:** 2026-09-02 (yt-dlp)
- **Cue count:** 838

## Chapters

- [00:00:00](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=0s) — <Untitled Chapter 1>
- [00:06:01](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=361s) — Overview: how evaluations were central to Copilot's development and success.
- [00:06:12](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=372s) — Introducing the Four Main Types of Evals: Algorithmic, Verifiable, LLM-as-Judge, and A/B Testing.
- [00:09:05](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=545s) — Details on Harnesslib's goals, its process of collecting test samples, running tests against generated code, and its success rate criteria.
- [00:12:27](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=747s) — Harnesslib lessons learned: Key takeaways including ensuring test content isn't in training data, consistency with production traffic, testing the entire system, and keeping the harness flexible.
- [00:15:56](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=956s) — A/B Tests for Online Traffic: how the team ensured model/prompt changes are acceptable before full rollout.
- [00:17:51](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1071s) — Key Metrics and Guardrail Metrics: Discussion of key metrics (acceptance rate, characters retained, latency) and a multitude of guardrail metrics.
- [00:22:07](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1327s) — LLM-as-Judge: how the team used LLMs to make subjective quality judgments for evolving chat experiences. How they transitioned from human baselines to fully LLM-as-Judge rubrics with specific criteria.
- [00:29:07](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1747s) — Evolution of evals: the unsuitability of Harnesslib for new chat products, the product-building focus of evals, and the "who's judging the judge?" challenge.
- [00:38:55](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2335s) — Algorithmic Tool Use Evaluation, ensuring the correct tools (functions) were being called by the LLM, and the utility of confusion matrices.
- [00:42:09](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2529s) — Summary: John recaps where each of the four evaluation types was applied in Copilot's development.
- [00:43:22](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2602s) — Q&A

## Transcript

_Timestamps link into the video. Captions are human-written._

**[00:00:00](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=0s)**
All right, then let's kick it off. This talk is the evals that made GitHub Copilot. And just to
get things started, we'll go through a quick intro so that you guys can know who you're talking
to. My name is John Berryman. Very nice to make all your acquaintance. I worked at GitHub
starting in 2019, but that was well before Copilot was a thing. And so my first thing at GitHub
was search. At that time, search was the world to me. Search is my hammer and the world is a
nail. But over time, after I worked on the code search team, I moved on to data science and
then worked with Hamel there, actually. It's the first time we got to meet.

**[00:00:53](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=53s)**
And then from there, moved into Copilot because I had kind of a data background and an
engineering background, so it was a good fit for me. My projects while I was there was code
completions. And then after about six, seven months of that, I moved into the chat, but it was
web chat, so it's not the IDE chat. Since then, about a year ago, I stepped away finally from
GitHub to become an independent consultant, following again in Hamel's footsteps. And I wrote a
book that was published last November called Prompt Engineering for LLMs. Also, since he's
given me the bully pulpit, and Hamel, if you wouldn't mind just posting a link from this, that
would be awesome.

**[00:01:42](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=102s)**
I do have a Maven course coming up soon about building LLM applications. So the idea is we're
getting lots of buzzwords and there's like a million different ways that you can build all this
stuff. But when you get right down to it, there's a few underlying principles, and if you know
them, you can rearrange them to make an amazing diversity of things. So that's kind of the...
That. Sean, do you want to come in here? Yeah. Hi. I posted John's course in the chat. Thanks,
Hannah. Hi, I'm Sean Simister. Worked at GitHub for three years, starting just after Copilot
had come out in beta. Before that, I was at Google working on some machine learning stuff, some
search engine stuff. And yeah, so at GitHub, I took over some of the offline

**[00:02:35](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=155s)**
evaluation work, building out—we'll talk about the frameworks that we were building out for
offline evaluation. And then I prototyped the first version of Copilot Chat, and that led to a
whole bunch of new evaluation techniques as well, and so I'll talk about that later. And then,
yeah, just recently I've been working on some personal research projects, explain prompt,
ground rules, just really enjoying building with LLMs and building developer tools. And thank
you for, John, for inviting me to reminisce about our times working on GitHub Copilot. Yeah,
this is really exciting. I mean, from my perspective, just, you know, I was around when GitHub
Copilot first started, and when it first—that effort first kicked off, I was pretty skeptical.

**[00:03:27](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=207s)**
You know, they just partnered with OpenAI, and it seemed like, you know, the first project they
jumped into right away, there was a whole, like, menu of different things. One was, you know,
code search, which I thought, okay, that one seems like you could tackle it. You know, no one
really ever has seen, like, a language model like that before, the one that OpenAI privately
shared with GitHub, and You know, I was really skeptical. Like the first version did not work
well at all. It was like barely functional, if that. But it's really like because of the evals
that I saw the product improve. Like you could see, like every other day, all the engineers
would make progress against the evals. And by the time,

**[00:04:15](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=255s)**
you know, first it was like vibe-based evals. Like the people on the GitHub team, we would be
using it and be like, okay, this is cool. And after a certain point, like the evals, you know,
like we would be moving the metrics on evals. And after, you know, that provided a lot of
signal into what wasn't and was working. And it seemed like it was really unlocked the product.
So I think from my perspective, it's like very critical. So, but I don't know the whole story.
Y'all know the whole story because y'all have been there. Y'all worked on it for quite a long
time. So. We know the whole story up until the point where we left, and it's a really
interesting story. So I guess let's just, let's dive in. First off, obviously quick slide, but
make sure we have a shared foundation. Copilot, you guys all know what it is, right?

**[00:05:04](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=304s)**
Yeah, you type in some code and it automatically completes stuff. I think this is probably one
of the most common completions that I got while writing comments. It was always insulting my
work. This was the first part that grabbed everyone's attention, but it wasn't the only part.
Both Sean and I worked on the code completions, but Sean was actually one of the very first
people to work on the chat component to it. And here you see kind of a screenshot of how that's
evolved into what it is today. And that's not the only part that there was. There's, it's
probably you're less familiar with it, but this is the part that I moved to after code
completions. There is an online component that you still have access today.

**[00:05:55](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=355s)**
I think it's free to everyone, so you can ask questions about your repo and stuff like that.
But as Hamel was saying, evaluations were really a core piece of what made Copilot. And so
let's dig into that. Now, this kind of gets into how my own thinking has shaped since working
at Copilot. And I'm going to attend Hamel and Trey's course, so I'm excited to be corrected.
But this is the way I kind of mentally cut up the evaluations that we were doing at GitHub. On
the easy end of the spectrum, you have something that's like algorithmic, things that you get
to code completion, and it's easy to just, like, check, like an equalities check for whatever
you're testing.

**[00:06:45](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=405s)**
So does, you know, if I'm extracting structured content from a particular website, does this
website lead to exactly this output? And you can have, you know, a bunch of those as, like,
tests that you use in eval. Does the response structure adhere to JSON, and in particular the
schema that I'm looking at? Is the length of the response within limit, or does, you know,
maybe it goes, it's too verbose or something, or too pithy? Is the code all in backticks? Any
of these things are things that are just really easy to write a normal programming check for.
At the other end of the spectrum, we have LLM as judge, which is hugely important because so
much of the work that we're doing is subjective in nature, and you

**[00:07:35](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=455s)**
kind of need a human to do it, but humans don't scale. So LLM as judge is anything that is
subjective. You ask, you know, what is a preference for, you know, this completion versus,
like, the canned response? Am I hallucinating, or is my response, you know, actually accurately
using the context provided? Those type things, more subjective things that you can't write an
algorithm for. Now, Copilot was at this kind of interesting in-between that I've come to call
verifiable evaluations. There are things that it's like, it's algorithmic in some respect, but
it's not just so easy as looking at the output. It's things like, I'm generating code and I
want to make sure the code compiles. I want to make sure that the code passes unit tests.

**[00:08:28](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=508s)**
Maybe it's SQL, and I want to make sure that, I don't care what query it writes, but it needs
to have the right answers come back, so it can have some degree of freedom with that. So all
these things, the code completion, you can't immediately look at it, but you can run it,
evaluate it somehow in a way that's more complicated than just the algorithm. And finally,
underlying everything is A/B testing. There's nothing particularly special about this for
Copilot, but it was just an important part of our history. All right, so we're going to walk
through each of these and tell you the piece of the puzzle as it lived itself out at GitHub. So
the first thing was exactly what Hamel was referring to a moment ago.

**[00:09:18](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=558s)**
We called it Harnesslib. It was a verifiable code completion evaluation, and the idea was, you
know, we've got this magic box. Certainly it was magic at the time, that will look at your code
and write, hopefully, working code. So as we were working on making the completions better,
pulling in more context data that was, you know, we hoped would be helpful, we had to test the
changes before we go live with them. So this is an offline tool that we did for this. And it
was one of the first things I was introduced to when I started with Copilot. The idea is
simple, but you got to admit, it's a really cool idea. First off, we would gather test samples.

**[00:10:11](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=611s)**
And here's the rundown of how that works. Basically, you grab, you know, we've got all the
repos. So you grab a large set of open source repos. Specifically in our case, Python and
JavaScript. We had to narrow it down. You run their tests. That's basically why we had to
narrow it down. We could run Python and JavaScript tests pretty easily. You run their tests,
and you keep the repos where all the tests pass. So it's kind of a funnel. Of those, you use
code coverage tools to associate the functions with your unit tests. You have to make sure that
you're actually testing something. And then of those functions that had some coverage, we've
kind of forgotten the exact criteria, but basically the candidate functions had to have one
unit test, had to have at least some

**[00:11:02](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=662s)**
percentage of its lines covered. It had to have, you know, no more than blah number of lines.
Otherwise, you know, it was too hard of a task for, you know, early days Copilot. And it needed
a doc string. So we're looking for something that is the function, function name, the
signature, the doc string, and the context around this piece of code. All those became
candidate tests for evaluation. And then running it, you kind of see what we would do. We would
grab some of these, one of these candidate functions, kind of, you know, melon baller scoop out
the implementation of it, generate the contents again, and run the unit test again. And if we
do this across lots and lots of functions, across lots and lots of repos,

**[00:11:55](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=715s)**
then we can start to get an idea of directionality. Like, as a baseline, we know what version X
of Copilot did. It wouldn't succeed at all, and I forgot what it was up to. It was like 40 or
50 percent. It wasn't even a huge number back then. But we know that— Can you talk a little bit
about, if I recall, y'all selected these repos to be like, you know, you had a way of selecting
or filtering ones for, like, higher quality and stuff like that. Can you talk a little bit
about that? Maybe I touch on it a little bit in this lessons learned thing right here, but
Sean's going to cut in here in a second. See, we got these cute little pictures, and he can
probably address that a little bit too if I miss any points. But, you know, as far as quality
is concerned, that was one of the things that

**[00:12:46](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=766s)**
was kind of a lesson learned. We had to make sure that the content itself wasn't trained into
the model. We would get these models from OpenAI, and guess what they were training the models
on? All the code at GitHub. So when we had close relations early on with OpenAI, because we
were one of their first main customers, we could get a list of what went into the training and
make sure that we had something that was trained after that date. It's also important to make
sure that your repos are consistent with the traffic that you expect in production. And I think
we never quite—I mean, it was always very subjective of this, but I think we always knew that
we wished it was a little bit more consistent.

**[00:13:37](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=817s)**
Some of the models— Because they weren't in the training set were the newer models—sorry, some
of the code bases that weren't in the training data were newer code bases. And guess what?
Newer code bases tend to be smaller, tend to be a certain type of thing. And so, like, a lot of
our code bases were a little bit smaller than what, you know, you see worked on in production.
That's really interesting about the relationship with OpenAI. You mentioned, like, in the
beginning it seemed really close. Like every week there was calls with Greg Brockman and Ilya,
I remember. I'd get on conference calls with just them and a few other people. It seemed like
super close. So it didn't stay that way? It wasn't like that necessarily throughout the entire
time? Yeah, it's interesting.

**[00:14:26](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=866s)**
And by the way, Sean, you feel free to cut in here at any point that you want. You had an
earlier window than I did, even though we were working at GitHub at the same time, but you were
in the middle of it at that point. Sean got to see about a year before I did, and then I think
both me and Sean left at about a similar time, middle of last year. So yeah, at some point, we
were the big kid in the kiddie pool. But eventually, you know, ChatGPT landed, and it was very
important for them to do the best thing for their own product. Maybe a couple—we've got a lot
of ground to cover, so maybe just a couple more tidbits here, and then we've got the three
other types of evals to go through.

**[00:15:20](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=920s)**
But a lesson that I think I learned, and the reason I've got our pictures here is because Sean
almost learned the opposite lesson, and he makes a really great point. But I always felt like
our test harness should have been more— Should have basically been a headless VS Code, so we
could absolutely test every single component of our codebase as it changed. And I still agree
with myself. That ends up being really good for, like, integration tests to make sure that
you're keeping the evaluations high. And now, maybe Sean, you can pop in here, but I liked the
points that you're making about the flexibility of the harness. Yeah, yeah. Just there was this
kind of these different phases of product development where, you know, sometimes you've got a
new model with new

**[00:16:13](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=973s)**
capabilities coming out, and you're trying to imagine, like, oh, how would people use this? And
how can we evaluate something that people have not even had a chance to try yet? And so in that
sense, you can't just wrap the existing product in an evaluation harness and have that be the
only way to test things. You do need this more experimental system where you can kind of
prototype out new ways of using the AI, new ways of using the product. But then those are
always less reliable, and so once you launch that, you kind of have to go back into making it
more reliable, more easy to evaluate. So that covers Harnesslib. The next big chunk is, so
Harnesslib was verifiable tests, and it was probably the biggest chunk of our evaluations, and
also definitely one of the coolest.

**[00:17:09](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1029s)**
A/B testing is what we did whenever it was time to ship our changes online. The offline test
that we had would, you know, hopefully, you know, limit— Limit the exposure to, you know,
shipping something that was surprisingly bad. And I think it did a good job of that and helped
us really flesh out what was going to be a good product to ship. But once we finally did ship
it, we had to make sure that the changes are appropriate, that, you know, we'll start our users
on like 10% of the traffic and kind of ramp it up, keep an eye on how the product is doing and
see if anything is changing. And a really important lesson for us came from basically how these
things were set up.

**[00:18:00](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1080s)**
We had just a very few key metrics, and to the best of our memory, it's these three items on
the screen here: completion acceptance rate. So, you know, a user gets the ghost text on the
screen. Do they accept it or not? So how often do they accept it? Characters retained. A lot of
times, especially for users like me, I would like mindlessly accept everything and then edit.
That was kind of the pattern that I used. So we also had to incorporate that type of user, that
type of use case into it and make sure that, you know, people weren't zombie-like accepting
everything and then, you know, not liking any of it and having to, you know, go back and change
it. And the last thing is kind of an obvious one, is latency.

**[00:18:49](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1129s)**
If we come out with a recommended piece of code that is too late, then it's just bad for
everything. Now, beyond the key metrics, we had several guardrail metrics. And by several, I
mean I tens, maybe even into low in the hundred. But there were a few of these were like
variations of these things above, like characters retained after a certain number of minutes.
But, you know, anything that would give us a way of kind of measuring how How much it changed
to see if there's anything weird going on in the side. So I have a question about guardrails.
Like, a lot of times, guardrails, people have guardrails, they're like binary pass-fails, like
really catastrophic errors or something they want to, like,

**[00:19:42](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1182s)**
prevent against. Was there some of that too, something like that too, or was it mostly like
these metrics you keep an eye on with the, like, drifting wildly? Yeah, mostly we were looking
at the key metrics. That made the conversations really easy. Just so we would focus on just
those few simple things. Guardrails, we didn't have, like, just a hard fail if something went
wrong with them. They were part of the conversation if something was really going wrong. Or,
you know, if we were trying to understand the metrics, the guardrails were just a useful side
conversation to diagnose and figure out what was going on with the key metrics. So it all kind
of fed back into that. When, in the cases where, like, let's say those key metrics, like
acceptance rate, latency, everything were, like, improving, let's say,

**[00:20:35](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1235s)**
but then the other metrics were sort of going astray, did that ever happen? And, like, did you
do a bunch of analysis, like data science-y type of work to, like, figure out why? And how was
that conversation, like, surfaced, let's say? So stuff like that would happen occasionally.
And, you know, I'm going to be super fuzzy on this because I wasn't really in the middle of
this discussion. But we did have, like, weird coupling in several of the metrics. It's the
second bullet here: weird trade-offs. So, like, sometimes you would maximize one of the
metrics, and it would just tank another metric, and you'd have to think really hard about why
those two were trading off.

**[00:21:24](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1284s)**
Like, you know, if you really optimize for acceptance rates, well, one silly thing that would
happen is, like, you have a bunch of little tiny completions, and so the experience was garbage
when that happened. But you'd have to really dig around in some of the other metrics to figure
out, you know, why a sudden departure happened from whatever your baseline was. How did that
process, that detective work happen? Was it like a lot of data science-y type of work where
you're kind of doing a lot of data exploration or, you know, like, yeah, how did it—who did
that kind of, like, detective work? How did that work? Yeah. So as part of, like, these A/B
experiments, you know, we would ship out new models, new prompt crafting

**[00:22:17](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1337s)**
techniques, and then, you know, we would hope to see, you know, the key metrics going up. But
then sometimes we would see something like a guardrail metric, like number of lines generated,
you know, average number of lines generated would jump in some weird direction, either up or
down, could be kind of alarming. And so then there were different scales of that, is like, you
know, we'd have the prompt engineering folks in the meeting and they might say, Oh yeah, we,
you know, we expect that because we improved the prompt in this way and it's giving more
targeted suggestions, so it's actually okay if the number of lines goes down because they're
higher quality lines. And then, like you said, there are other times where everyone's like, We
don't know why the number of lines have gone up. This is concerning enough that it's worth, you
know, delaying the launch for a week while

**[00:23:06](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1386s)**
someone digs into the logs and actually figures out what's going on, and then it becomes a data
science project. And so luckily, yeah, we had a whole bunch of people on the Copilot evals team
that had that skill set who could kind of go off and dig through the data and figure out what
was going on, come back the next week for ship room and say, All right, we looked at it. It's
okay. Here's why. Let's move forward. Hey, Sean, you're doing the talking right now. I think
this is one of the most interesting parts, and you were right in the middle of this
LLM-as-judge stuff. Do you want to take this next section? Just tell me when to progress the
slides. Yeah. Yeah, so, yeah, like we felt we had a really, really good system with this
offline Harnesslib eval where we could run different prompt crafting

**[00:23:55](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1435s)**
experiments or, you know, fine-tune models and see how that affects the product in an offline
setting. And then we could also kind of ground that in online A/B experiments and make sure
that, you know, the changes actually played out the way that we expected with our real user
base. So we were feeling pretty good about that. And then ChatGPT came out, and it kind of
changed how we thought about evals. And I think it was obvious from the beginning that these
chat models were going to be a big deal, but we didn't quite realize at the time, you know, how
much it was going to change our evals. And so, yeah, this is how we kind of backed our way into
LLM-as-judge, I guess, and kind of started looking more at, like, subjective quality judgments
instead

**[00:24:49](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1489s)**
of these purely kind of execution-based, you know, does the code work or not, which was kind of
one of the key ingredients to getting the Copilot completion product to that point. So at
first—yeah, thank you, John—at first, I think when we looked at what people were doing with
ChatGPT and, like, kind of conversational programming, I think we were calling it at the time,
it kind of looked like what we were already doing with Copilot. You know, people would ask it,
you know, make this code cleaner or, you know, write some unit tests for me or help me fix this
bug, and then it would, you know, go through multiple steps of the conversation, but there'd
still be some code output. And so I— I started building out the first version of Copilot Chat
and thinking

**[00:25:39](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1539s)**
about how I would evaluate that so we could launch something eventually. And I started to
realize, like, even though there was code coming out of chat, what we needed to evaluate wasn't
just the code that was coming out of chat. What we needed to evaluate was the actual
conversation, right? And people obviously cared about getting good code that came out, but they
also wanted to feel like the conversation was productive, like the assistant was listening to
them and giving them good feedback and that sort of thing. And then, you know, we also had use
cases in chat where there wasn't code coming out, right? So someone would say, like, Explain to
me how this code works, or like, you know, Why is it using this API and not that API? And those
are really helpful answers, but there's no code that we can run. And so I started to think,
like, maybe the only way to evaluate these is

**[00:26:32](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1592s)**
just to have, like, side-by-sides, right? Like, you have your baseline, like, here's how
ChatGPT handles it, and then here's how our agent handles it. Which one is better? And you just
put it in front of a human and you ask them to, you know, to rate, you know, which one is
better, which one is worse. But obviously that's slow and it's expensive to, you know, hire
people and get a lot of those kind of judgments. And you have to come up with a lot of
guidelines too to help people. You can't just say which one is better. You have to explain what
better means, and they kind of read through and judge which parts of it. And then, so I set up
a basic version of that in Label Studio so I could just kind of test the flow, and I found it
difficult just to say which one was better.

**[00:27:20](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1640s)**
And so I tried to make my life easier by passing it into GPT-4 and saying, okay, here's my
grading criteria. Tell me which one you think is better. And then now I can just click through
in Label Studio and kind of judge the judge and say, you know, did GPT-4 make the right call on
which one is better or worse? But even that was challenging. You know, this was years ago when
models weren't as good at following the system instructions. And so sometimes it would get
distracted and it would say, you know, the code on this conversation is more maintainable
because, you know, they put their braces on a new line, whereas this one, the braces are on the
same line, so someone would have to go in and adjust that. And I was like, no, that's not what
I'm evaluating at all.

**[00:28:12](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1692s)**
You know, I'm trying to ask, like, did it write better unit tests? And so I started going in
and actually just writing out in, like, bullet points explicitly what I wanted it to evaluate.
Like, does it have a test for, you know, passing in null values? Does it have a test for
passing in an empty list? And finally that got to the point where I could use this LLM as
judge, and it would stick to my, you know, very granular list of things that I wanted it to
evaluate on and give me good results. And I could kind of click through quickly and
double-check these. And then once I verified that it worked for one model, then that could kind
of become the baseline, and I would only have to compare the new conversation to see if it
matched the baseline.

**[00:29:01](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1741s)**
So that was kind of how we backed our way into this LLM as judge. It wasn't something that we
decided that we needed at the beginning. It was more just kind of realizing that Harnesslib
wasn't going to be able to give us What we needed, because Copilot Chat was, in fact, like a
whole new product. It wasn't just the obvious next step for code completion. Now, were you able
to measure, like, somehow the alignment between the judge and yourself or other people? Like,
how did you go about instilling trust in the judge? I would have loved to have done a much, a
much more extensive study proving that our judgments were being aligned with the judge.

**[00:29:53](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1793s)**
It was a crazy time to be working on AI, and everyone was shipping chat products as quickly as
possible. And so, yeah, the first version of Copilot Chat went out with basically our gut
feelings of, you know, here's what we think users will do with this product, and here is an
offline data set that kind of models that gut instinct. And then, you know, once we launch it,
then we can actually start to collect telemetry and see how users are using it and then adjust
our offline benchmarks. But the first version was really just like a bet on how we thought this
conversational programming would evolve. So on balance, like, would you say the judge was
helpful, like more

**[00:30:47](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1847s)**
helpful than wrong? Like, you were able to see the outputs of the judge and find, you know, use
cases, find examples you needed to work on or correct things in, you know, in the product?
Yeah, absolutely. So once, once we kind of made the, the adjustment to like micromanaging the
judge, where we're saying like, you know, is there a test for this? Is there a test for that?
Is there a test for that? Or like, does the, does the answer mention that you have to do this?
Does the answer refer to this specific, you know, part of the API? Then it, it was much more
reliable. And I think that that helped people get over also this, this weirdness with LLM as
judge, where it's like, OK, you're asking the LLM to write some code for you, and then you're
asking the same LLM or like a slightly different LLM whether it did a good job.

**[00:31:35](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1895s)**
Like, isn't it always just going to say, yeah, I did a great job. But the, the intuition here
is that like the generative task of starting from, you know, the user's question and actually
solving it is a much harder task than giving it this really like detailed list of requirements
and then just getting it to check each one off. So once we got to that point, yeah, we were
pretty confident that it was giving us good results. I mean, obviously there's still sometimes
would be hallucinations where, you know, you ask it to check a box off on the list and it adds
three more items to the list, you know. I think people always like to ask, OK, when you're
doing all this work on the LLM as a judge prompt, did anything from that prompt make it over
into the, that the code completion model? Or, you know, did you end up prompting another model
with elements from the rubric of the judge?

**[00:32:23](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1943s)**
Did you end up, you know, making the main prompt more specific based upon like, you know, yeah,
like just curious, like did it kind of feed into each other at all? Maybe didn't prompt the
model. Maybe it was just like a code completion model that was just, you know, but I'm just
curious if there's anything like that going on. I don't remember any specific cases where it
did. I mean, like I said, we were much more familiar and confident with how we were evaluating
the code completion product at that point. And so much of the Copilot autocomplete was like,
can we get the right context in the prompt? And so, and we were also fine-tuning models, but it
wasn't like crafting the right system prompts the same way we were doing with Copilot Chat.

**[00:33:17](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1997s)**
I know that we had done a number of experiments with writing unit tests in Copilot completion,
and then we did, you know, other experiments in chat with writing unit tests. But I don't think
one ended up feeding into the other. It ended up just mostly happening in chat. But one of the
interesting lessons that we learned coming out of this was, or that I learned personally
building this, was that there ended up being these two very different personas on the team for
evaluation. There were folks who, you know, were trying to ship things, were trying to keep
things from breaking, were trying to prevent regressions, and they would come in and they would
want to run the eval. And so we would have to have, you know, really clean, reliable ways to
run the

**[00:34:10](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2050s)**
eval, get a number out, compare it to the previous number, and make a shipping decision. And at
the same time, there were a whole bunch of folks who wanted to pull everything apart into Lego
blocks and reconfigure them and say, what if the product worked this way? What if we use this
model? What if we did that? And so it was much more experimental and trying new things that
hadn't been built before. And so, yeah, it wasn't always clear that That should be all one eval
pipeline. And I think over time, we developed more and more evaluation tools, evaluation
pipelines, and it felt a little bit overwhelming to some people to have more than one way to do
eval. But I believe it was necessary because there's just more than one type of eval. There's
these kind of unit testing, experimental things, and the more regression testing, you know,
ship decision things.

**[00:35:00](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2100s)**
What's like one of the more experimental things where you kind of took it apart with modular
pieces and whatever? That sounds really interesting. Actually, John was doing some of this
stuff with, like, trying to— originally, we would just kind of chop up code by line numbers and
shove it into the prompt. And John was trying to be a little bit smarter about that and find
ways to treat code as code. Yeah, it's hard because it's so— I've forgotten a lot of the
details, but I remember we used to have, when we were running the evals, it was basically a
notebook. And in the notebook, we had a pattern for, like, a typical Harnesslib eval with, you
know, where to get the data from and how to set up these individual tests.

**[00:35:50](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2150s)**
But it was like Lego blocks. You could just use the piece that you needed. But it's kind of
nice because if you were to make something that fit in the same place that the old Lego block
went, you could, you know, kind of mix and match. And like Sean is saying, you could prepare
for evaluation of a product that doesn't even exist yet, rather than do, like, a regression
test against something that's more rigid and frozen. And so I've forgotten the details. It's
going to be uninteresting. But some of the work I did was, whereas initially we were, like,
melon ball scooping out the full contents of our candidate functions, a lot of our important
completions were the one-line completions. And so I just made another way of harvesting
candidates as the Lego block, where the candidates were the function with a piece of the code
missing,

**[00:36:45](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2205s)**
or like the bottom half of the code missing, something like that, where it looked like you were
editing a block instead of editing the, you know, here's the new function, which is a little
bit different than what our users typically did. So, yeah, it was really neat, the Harnesslib,
just how modular everything was. You mentioned that some of these evals run in notebooks. Did
those, do you run the notebooks programmatically? Was it more like ad hoc, kind of open a
notebook and run each cell? How did, that's really interesting, I think, to a lot of people.
You, you couldn't done it either way. Um, and so like, for the more regression testing, like
flow, I guess, uh, these things were pretty, pretty canned. Uh, it was in a Python script and
you, you could just like run the thing. Um, the, but as, especially as you're getting, you
know, Sean had been working on this for a year by the time that I, I was, I

**[00:37:37](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2257s)**
was, uh, introduced to it. And to get intro to get an understanding of how these things work,
it was just so easy to go to a notebook, which was the same stuff as in this, you know, canned
script, but you could see how each, each bit of it worked and you had, you know, it's a
notebook, you can muck around with it and, and, uh, play with the Lego blocks, change out the
vowels and, and kind of get an idea for what you could do in the future. It was kind of neat.
Yeah, yeah, a lot of like and easy ideas or experiment ideas started off in a notebook and then
would kind of move into just a regular Python script so you could have an eval that people
could run easily. And then some of those would move actually into, like, you know, Azure
pipelines that would just run automatically. But notebook was mostly just for experimentation.
Yep. Yeah, a quick note on time.

**[00:38:29](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2309s)**
We're 15 minutes past time. There's a couple of slides left. No, we can keep going. This should
have been an hour. I don't know why I made it 30 minutes. It's my mistake. Yeah, it's because
we just had me in the beginning, and then we have a whole year's worth of knowledge prior to me
that joined after. Well, so let's keep going, and then, but we can obviously stick around for a
bit. The conversation's been fantastic so far. All right, so the last little bit, remember in
the first slide we had the four things we used. This is just kind of a footnote, to be
perfectly honest. It's a much smaller type of evaluation. As far as I know, it might have grown
and become a really important thing after I left, but it was coming into existence about the
time that I left, and I probably

**[00:39:21](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2361s)**
used it a solid twice. But it is a demonstration of the third, the fourth type of evaluation in
my hierarchy: algorithmic evaluation. And what we were doing with this is, you know, as the
chat models, you know, gave way to chat with functions, you know, these more interesting
capabilities. It was important to double check that the function was making the correct tool
calls, or sorry, that the LLM was making the correct tool calls. And the way you could do that
is you provide the context, user message, you know, all the tools that the model is going to
have access to. How many tools approximately did Copilot have roughly at the time?

**[00:40:16](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2416s)**
I could probably speak to the web interface, and Sean could probably speak to the VS Code, but
it's kind of funny. This is a hack. You can go to the web interface and get a right now
homework assignment, and you can ask it what its tools are, and it'll tell you. So we don't,
like, hide that very well if we're supposed to, but it doesn't matter. And I think there was
probably, when I was there, just a handful, like five, six. I think since then it's kind of
moved up to about double that, but I haven't checked in a bit. So not just a whole ton, but
more than a couple. Yeah, but the cool thing you could do is, you know, given that expected
kind of trial input, you know what the output should be.

**[00:41:10](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2470s)**
And you can, besides just doing, like, you know, checking for accuracy by seeing if this is an
exact match for the tool call, you could do cool stuff, like you could do confusion matrices
like this. I mean, it's a toy problem I showed you on the right. But, you know, you'd say,
here's all the tools that my model has access to, and we attempted to call them this number of
times. Here's what actually got called instead. And so that provides you with a lot of good
information there. You can say, you know, if you got any— Tools that get called that get
mistook a lot. You can kind of step back and say, oh, you know, I need to figure out how to
make these things more distinct, that your tools ideally need to partition the space that
they're operating in so that there isn't,

**[00:42:03](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2523s)**
you know, silly overlaps that will confuse the model. So that's just kind of a tidbit. I kind
of see the confusion matrix. Actually, in an earlier lightning lesson, Brian went over a very
similar confusion matrix for evaluating agents, like agent handoffs. So, yeah, this is pretty
cool. It makes sense, yeah. You can see how often they— Yeah, it's really important, right?
Because if you're— that's just a very similar task. If you're handing it off to the wrong
agent, then probably what it means is there's just too much overlap with your agents, and the
orchestrator model doesn't know how to decide between them. So, yeah, confusion matrices are
great for that type of thing. All right, so we're back to this slide again, and we have our
bases covered. Verifiable evals was Harness Code with code completion.

**[00:42:54](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2574s)**
LLM-as-judge was that really interesting conversation with Sean that revolved around chat
completion. Shiproom was our A/B testing, and that's, you know, whenever we change the model
or, you know, tokenization or the prompt or anything like that, we made sure that we put that
through A/B test. And then finally, just a footnote, but tool use evaluations was an example of
where we're also using algorithmic evaluations. So that is it for the content. Thank you guys
for sticking around for 22 minutes longer than we'd set this up for, but I guess we can still—
Yeah, there's some questions if you don't mind. One from Jesse is asking, what are your
approaches with respect to caching? Like if the inputs— The prompts, the model is the same.

**[00:43:43](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2623s)**
Do you somehow leverage caching? You know, with all of these tests, like you're running them in
mass, you know, how did that... I'll punt this over to Sean shortly, but I remember wishing
that we'd done something more intelligent with caching for Harnesslib, because some of those
tests took a while to run, and I felt like there was still room to do more caching. But Sean,
do you remember some of the specific... It's a horrible thing I'm doing to you. Yeah, no, I
don't remember any specific, like, prompt response caching. I mean, obviously the model hosting
had some optimizations to speed up, you know, reusing the same context, that sort of thing.

**[00:44:34](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2674s)**
But most of the caching approaches we had in Harnesslib were just sort of the preparing the
code, you know? So, you know, John talked about how, you know, we would select these
repositories, and then we would go through and run the tests, and then we would parse out the
function bodies and that sort of thing. You don't have to do that every time you run the eval
harness, right? And so, actually touching on another question we have here from Pasteur, you
know, we could run all of that analysis once for this fixed set of repos, store the list of
functions that we had and the offsets into those files because, you know, they weren't changing
in a SQL database, and then just refer to that SQL database every time we had to rerun the
harness. And did you build, like, your own dashboards and some kind of other alerting? Like,
what kind of... Thing did you build on top of that eval data that,

**[00:45:29](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2729s)**
you know, every time you run tests, you get all these telemetry, I'm thinking. Did you have
something on top of that that you used? So for the offline eval, you know, this was just
something that we were mostly kicking off manually, and then we would, you know, build a pretty
simple little, well, I don't even know if you could call it a scorecard, but just a list of
metrics, you know, showing pass rates. So there wasn't a lot of dashboards there. But for the
shiproom decisions, there was a lot more. And so the teams that we worked with at Azure had
already built a lot more tooling around, you know, displaying the results of the A/B
experiments and kind of making sound decisions based on, you know, how much data we'd collected
and whether they were, you know, representative samples and that sort of thing.

**[00:46:20](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2780s)**
And so that was really helpful to have that expertise brought in into the product. Did you find
that, you know, when it came to troubleshooting errors that you saw or kind of digging into the
results of the evals, was it, you know, was it necessary to hand things off to a separate data
science team, or were, like, engineers, like, able to figure things out? Or what's your
intuition on, like, can this be done by one set of skills, or do you need a distinct set of
skills to do it? You know, that's one of the questions that always comes up with evals, because
a lot of people are doing evals. You know, there's people of different stripes doing evals.

**[00:47:07](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2827s)**
There's, like, you know, a lot of software engineers with no data science experience. So I'm
just curious, like, how did it unfold at... One thing that I've often heard you say, Hamel, is
that, and I've started parroting it myself, that whenever you get someone to evaluate these
things, you get the people that are actually good at this stuff. You get, you know, the content
curators that know what the heck they're talking about when they're reviewing RAG or, you know,
whatever it is. In this case, it was great because I was an engineer. I was using this stuff,
and so, and the Harnesslib was really engineering-heavy test bed. I was using, you know, Python
notebook a lot of times when I was just running, kicking these things off.

**[00:47:55](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2875s)**
And I was the best, and I was the one working on the product that was running through the
valves. So maybe it's, you know, there's so many fortunate things about this very specific
niche of codegen that doesn't exist in other places, where you really do have to have the other
person that's not the engineer. But a fortunate thing that we had is, like, we could do it all,
and it made it, I think, a lot easier in that circumstance to say, like, this eval went
sideways, but I think I know what's happening. You didn't have to have that communication and
the breakdown. What about, like, for situations where code completions for programming
languages that you are not familiar with? I don't know which programming languages you're not
familiar with.

**[00:48:44](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2924s)**
Like, maybe you are not comfortable with Haskell. Maybe you're not comfortable with—maybe
Haskell is, like, a little bit lower resource, but I don't know, maybe not comfortable with C
something. Maybe you are, but pick a language. Like, how would—would you feel okay with, like,
trying to debug, like, hey, what's going on with this code completion? Like, why is it— Not,
you know, working the way I wanted to. You can take this, Sean or me. I mean, I was surprised
when we looked at the internal numbers and saw, you know, hey, we're running Harnesslib on
JavaScript and Python, and we're getting, you know, roughly similar acceptance rates for, you
know, Haskell and, you know, Visual Basic or whatever people are writing in this thing. And
it's like, it was really encouraging to see that the evals

**[00:49:35](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2975s)**
that we were doing translated over to other languages that we weren't necessarily evaluating on
or comfortable with. I'm not familiar with examples where we had to do a deep dive into, you
know, one of those less familiar languages. And I think a big part of that is, like, anytime
you're trying to diagnose one of these problems, especially in production, you want to kind of
go back and be like, okay, what's our baseline? You know, where is the point in the past where
this worked? And so you're always kind of building on the eval runs that you've done in the
past. And so if you don't have those evals for, like, hey, how did Haskell work in Copilot a
year ago, then it's kind of hard to diagnose that in the present. Okay, yeah, that makes sense.
It sounds like the high-resource languages, Python, JavaScript, are a good proxy, sounds like,
for even the low-resource ones.

**[00:50:29](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3029s)**
Surprisingly so, yeah. Okay, I'm gonna put y'all on the spot here with the question, but maybe
it'll work out. What is, like, a surprising thing that y'all learned? Like, if you can think of
any example that you learned from doing the evals, like, you know, that turned into an
improvement of some kind. Like, you know, that like something counterintuitive or something
that you remember that sticks out in your mind. I, well, just kind of go back to, uh, To Sean's
part, honestly, with the L judge. I really, this is well after the fact, but, uh, in our
conversation to to put this talk together, I thought it was just neat to hear him walk through
the learning

**[00:51:23](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3083s)**
process that necessitated LLM judge. We, I mean, this process has been done at several places
at this point, but what you kind of saw it then was the birth of. LLM judge, like this needs
humans, humans don't scale. Here's how like we break this down into, uh, something that that's
easier for humans. We like have at least this criteria so that we can digest it. Why not just
turn that over to an LLM? It's easier to do it, like, you know, uh, true or false, that's
that's gonna be a lot easier to to deal with than like something that's subjective as as a
human. So I thought that was kind of. A neat lesson that that came out of everything. Yeah, I
think, I think one of the things I remember is, is being kind of interesting is, you know, we
started off with this harness that was ripping the bodies out of

**[00:52:16](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3136s)**
functions and trying to synthesize them again. Uh, and also this intuition, like John was
saying of like, you know, the more characters that are accepted and retained in the code that
that that's a signal that we did something good. Um, and I, I remember. We kind of discovered
over time that users were getting frustrated when Copilot was trying to write too much code for
them at, at one time, and they would, you know, reluctantly accept it and then delete, you
know, the last half of it and then get a better completion for the, the second half of it. Um,
and so I remember we, we did a number of experiments and changes to the prompt to actually
generate shorter completions, uh, or even just, you know, chop off the completion and let the
user kind of naturally tab their way through, uh, the, the solution instead of trying to, to
one shot it.

**[00:53:06](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3186s)**
Um, and. And so that was something that was kind of counter to our initial intuition of, like,
Copilot should write as much code as possible for you, and then it should all be, you know,
good quality code on the first try. And this was more like, no, people actually want to, you
know, incrementally build up a good solution. Makes sense. If y'all were going to build a
product today, like some other kind of AI product, where would you still do evals, and, like,
where would you do it? Like, at what point would you start thinking about it, if at all? I
don't want to lead the answer. Well, it is interesting because I, the good student answer is,
well, you should have evals always from day one.

**[00:53:59](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3239s)**
And I bet Sean comes closer to that than I would. I think it's super important to have evals if
you have any type of product. But there is a point in time to introduce them. A lot of times
when you're just really early on trying to figure out what the product does, a good old vibe
check will get you a long way. You can say, is this working at all? Is, you know, what do I
need to do with this? And I would be interested, honestly, Hamel, in hearing your opinion as I
go through your course here in a few weeks about, like, what are the limits of, you know, how
much evaluation you do? Because, you know, we've all seen companies that are like, we're
supposed to have evals, and they go a little bit whole hog into that, and now they're an eval

**[00:54:48](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3288s)**
company, but they're not really measuring the right thing. So I feel like there's... It's
fairly early on, but it's not at the very beginning. At some point in the beginning, you need
to be just making prototypes and seeing what works. Yeah, yeah, totally agree. Yeah, like I
say, like, the purpose of building evals is not to have evals; it's to build products, right?
And so that should still be the number one priority. You shouldn't not build the product
because you can't think of the eval yet. And so you should be listening to your users and doing
these A/B experiments to understand what your users want and then going out and building those
products, but then thinking in the back of your mind, okay, eventually this product is going to
be successful. How are we going to keep it from regressing?

**[00:55:36](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3336s)**
How are we going to evaluate it? But it shouldn't block you from doing something wild and crazy
and different from your competitors. That makes sense. I agree with that. And what we'll teach
in the course is you should build evals after you've built a prototype. You don't need to start
it too early. You need to have something first. And even while you're doing evals, like if you
notice an error in the process, like you don't—there's a tension on, like, when do you write an
eval and when you don't. It's a judgment call on if there's an ROI to writing that eval. Some
errors you'll find, like, okay, you know exactly how to fix it. Just go fix it. Like, you know,
you don't necessarily need to write an eval for every single thing. But yeah, it makes sense.
Yeah, kind of my experience. I mean, on that Harnesslib, or on the A/B experiments, so many of
our guardrail

**[00:56:27](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3387s)**
metrics, I believe, came out of, you know, things that broke in the past, right? It was like
this accumulation of, like, oh, we tried something, it broke. Someone spent a week digging into
it and then found this metric after the fact that would have, you know, caught it earlier. And
so a lot of that stuff you kind of only learn by building it. I have a really fun question for
you before we wrap up. That element as a judge prompt, do you think, like, that would be, that
would make for good cursor rule, like the one that you have? Have you... It seems interesting,
right? Like if you have all these bulleted points of like, hey, this is good code, this is bad
code, whatever. It seems like the perfect prompt for yourself, in a way. Yeah, maybe.

**[00:57:20](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3440s)**
I mean, it's... you always get to cheat a little bit when you're building your own eval set and
kind of say like, here's what I think programming is, and here's, you know, the tasks that our
representative of what our users will be doing, and I'll only evaluate those tasks. The scary
thing whenever you're doing kind of, especially like a chat-based interface, is like it's just
wide open and people can ask anything and do anything with it. And so, yeah, I would hope that
the prompt that I did for LMS Judge would generalize to more just kind of general code quality,
but I also got to kind of pick and choose which use cases I covered and tailor it to those.
Makes sense. I kind of want to see this. It is pretty obvious I want to see the prompt.

**[00:58:08](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=3488s)**
Nice try, Animal. Yeah. No, thank you so much. This was a really great conversation. It was
really interesting. So thanks for coming on and teaching everybody about how y'all built evals.
Yeah, thank you for having me. This has been great.
