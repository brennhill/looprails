# Agentic Evaluations Workshop - Deep Dive on the Future on Evals for Agents.

- **Video:** https://www.youtube.com/watch?v=UxMZfbWI3LY
- **Channel:** Hugging Face
- **Published:** 2026-03-20
- **Duration:** 01:48:46
- **Captions:** auto-generated (en)
- **Retrieved:** 2026-09-02 (yt-dlp)
- **Cue count:** 2852

## Transcript

_Timestamps link into the video. Captions are auto-generated: no speaker labels, and names/jargon are often mangled — verify before quoting._

**[00:00:25](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=25s)**
Hi everyone. Welcome to the agentic e-vals workshop organized by Hugging Face. I'm Ben and I
take responsibility for the community education at Hugging Face and I organize programs like
our courses and workshops like this. This is the first time that we've organized a workshop and
we're really excited about it and it is a new kind of new format for Hugging Face where we're
going to tackle more nuanced and and complicated topics that we can't necessarily put into
courses or educational material, things that we don't necessarily fully understand and we think
that we need to take the time to bring experts in and and work through. Today, we're going to
focus on agentic e-vals, which is a particularly challenging problem. To some extent, we
figured out how to evaluate LLMs on on

**[00:01:14](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=74s)**
text tasks, but there are still limitations there. And as we move into agentic domains and
agents start to work on long-running tasks, evaluating those over time becomes exceptionally
difficult as we're going to hear today. We have a broad selection of of speakers from industry,
research, policy, and open source and we're going to work through those. So, first we'll have
Balaji from Hugging Face and also from e-val e-vals and Balaji is going to introduce the
problem. And then we're going to move to Arvind Narayanan from Princeton who's going to talk
about e-vals further and then we're going to go through the program to Piero

**[00:02:02](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=122s)**
and from Neta who will talk about Gaia 2, the agentic benchmark paper. And then we'll hear from
Amish Shrestha Morty from Bespoke Labs who will talk about how they're evaluating agents at
Bespoke Labs in in industry. And then we're going to hear from Nath Nathan Deeb, also from
Hugging Face and maintainer of the Open LLM Leaderboard and now the last feature. I don't want
to take up too much time. I'm going to give as much time as possible to the speakers. So, if
you do have questions, just raise those in the chat and I'll raise them to the to the speakers
and we'll try to keep the tempo quite high and move from one talk to the So, without further
ado, I'll pass over to Balaji. Thanks, Ben. Let me try to share my

**[00:02:52](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=172s)**
screen. >> [snorts] >> Great, you should be able to Balaji, get your slides up right now.
Great. Cool. Yeah, are you able to see my screen? Okay. Um hello everyone. I'm Balaji Koch and
I'm a technical AI policy researcher at Hugging Face. And today I'm going to be talking about
My talk today is called evaluation reporting in the age of agentic AI. Um as Ben mentioned, I
also lead a group of 400 plus researchers called e-val e-val. Um a big focus of that has been
looking to e-val documentation. So, this talk is going to look at um what's currently

**[00:03:40](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=220s)**
missing in the field of e-vals, how specifically it relates to agentic e-vals and what we're
doing to uh fix that problem. So, we have moved on from LLMs that generate text to now more
agentic systems that plan, decide, and act. So, in terms of that, we have examples like
OpenAI's computer use, uh Claude's computer use, Gemini now has agent mode. We all uh really
enjoyed Manes. Um and we have also heard about Open Claude. It's it's everywhere. Um but before
we dive deep into agentic e-vals, um I wanted to talk about the state of e-vals generally
speaking and what the missing part parts are in terms of honest and transparent e-val

**[00:04:28](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=268s)**
reporting. So, a lot of e-val nuances are actually hidden in the small print. So, this
screenshot is from um OpenAI's uh system card for GPT-5.2 and it was criticized heavily by
Anthropic and also just by other e-val folks because um they reported a very high SWE bench
score, but then in a very tiny fine print um they basically said that they had omitted 40 out
of the 237 problems. Um this is not immediately apparent if you are trying to consume e-vals
very very quickly and you look at just the table and move on with your lives. Um there are
other similar issues. When Llama 4 was released, um it came out that Meta had used um different
versions of Llama 4 to uh

**[00:05:18](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=318s)**
score different benchmarks, which just uh sounded like not the best e-val practice and um their
reports were also criticized for similar reasons, uh essentially benchmark mixing. Um we also
have seen problems in the community, uh basically chart crisis or misrepresentation of data
using weird graphics. So, a couple of those examples are currently on the screen. Um for
instance, um the SWE bench score of OpenAI was reported in a very weird way. Like you can see
that um 69.1 and 30.8 are shown as similarly tall histograms, uh which is not scaled to
anything based in reality. Um similarly, people often don't report um error bars,

**[00:06:07](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=367s)**
um which is another problem in terms of e-val rigor. Um and that's just talking about um
regular capability e-vals. When it comes to social impact e-vals, uh the situation is far
worse. So, the e-val e-val coalition that I mentioned that that I co-lead, um we have a paper
out called Who Evaluates AI's Social Impacts: Mapping Coverage and Gaps in First- and
Third-Party Evaluations. Um so, that paper looks at the state of reporting of social impact
e-vals. And by social impact, I specifically mean things like environmental impacts, financial
um such uh stuff and so on, bias um and so on. Um we looked at uh social impact e-vals by
foundation model developers over time. Um specifically, we looked at 171 model

**[00:06:57](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=417s)**
release documents. Um we see a lot of uh interesting things. We first of all observed that
model developers have become less transparent about their e-val results over time. So, for
instance, environmental cost reporting in first-party reports. So, essentially this chart is
showing the things that model developers report themselves, um that has become um less
transparent over time. In fact, less than 15% mention labor and environmental effects. This
this used to be not the case back in 2022. Like most orgs were reporting um almost everything
about their models. Um but then as time has passed, uh model developers have become less
transparent for a host of different reasons. Um so, we look at specific examples. Um for
instance, Google and Meta used to report

**[00:07:47](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=467s)**
a lot more back in 2022 and 2023 and they don't report um these social impact e-vals anymore.
Um first-party reports in general are not transparent and are of lower quality. We also
therefore did interviews of e-val practitioners. We asked like, "Okay, why are you not
reporting these things over time? What happened?" Um we were told that companies have either
broken up or reassigned teams dedicated to documentation or social impact evaluation. We also
heard that um because of the changing political climate or legal liabilities, companies are
told to focus more on capability reporting over risk measurement. Um at the same time, in terms
of positive news, we find that um third-party reporting, meaning

**[00:08:35](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=515s)**
third-party orgs like Meter and Apollo, um Marco and so on, um e-vals reported by them have
gone up both in terms of quality and in terms of raw quantity over time, um which only
strengthens the position that good quality independent third-party evaluations are paramount
for holistic AI safety. Um given that observation, um how do we see all of these third-party
evaluations for a model in one single place? Because these evaluations are not really always
published in the same format. Somebody produces a leaderboard, somebody else produces a report,
somebody else produces, I don't know, blog post. Um so, to centralize that information, we
created uh a project called Every E-val Ever.

**[00:09:22](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=562s)**
Um so, we launched this project last month with a host of different organizations. Some of
their logos are on the screen. Um so, what is Every E-val Ever? Every E-val Ever is a a unified
open data format or schema and then B, a public data set of every possible first- and
third-party evaluations on Hugging Face with these results. Um we are actively collecting these
uh evaluation results in that schema. So, very briefly, the schema um has supports both
aggregate results. So, you are required to report things [snorts] like source provenance,
specification about the model, and not just the model, but also what quantization you used,
what version of the model you used, and so on, what evaluation library you used.

**[00:10:12](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=612s)**
We also support the instant schema, meaning that if your eval result is not just reporting an
aggregate score, but also line-by-line results, we support that as well. And eventually, the
hope is that with all this data, we will be able to build something that we're calling eval
cards. So, a dummy screenshot is currently on the screen. The hope is that you'll be able to go
to the eval cards website, click on whatever model you want to look at, say when 72 billion,
and you get to see all of these first and third-party evals organized under categories, and get
a very quick sense of what's going on for that model. Um So, that's where we are in terms of
building

**[00:11:00](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=660s)**
infrastructure to centralize and report evals in ways that cannot be gamified as easily because
um this type of filtering allows you to hold all of these confounding variables constant, and
then see the exact scores between models. And later on, we'll get into other infrastructure
issues later in in the talk. We'll hear from him later. But I think this is extremely important
for honest and non-gamified eval reporting. Um And now, given that situation of requirement of
centralized eval documentation, we get to the state of agentic evals. So, what's going on in
agentic evals specifically? Um agentic evals are a step beyond LLM evals because they are

**[00:11:47](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=707s)**
more complex systems. So, on the screen, you see an example of two agents that score that score
or pass on an eval, but they're actually completely two different stories. So, the first one
like takes less number of steps, is cheaper, takes less time, and does not crash or has zero
errors. Meaning that the metrics for agents generally look different, and so the evaluations
need to be more robust. Um current agentic benchmarks are still mutually incompatible. They
look at different things, and it's really hard to sort of generalize results between different
things over time. For instance, Tau bench specifically measures user messaging,

**[00:12:36](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=756s)**
which is not really something you can then also use to measure computer performance on the web.
So, therefore, it's not compatible with WebArena, and not compatible with Terminal bench. So,
more generalized performance is required. Specifically, agentic evals need to capture sequence
of actions, meaning are you measuring what's happening in the chain of thought? Are you
measuring what tools are being called? What is the context of the action? What was the user
input? What environment was it? What was the noise? Also, I think human interaction is
under-measured in the current landscape of agentic evals. So, people can interact in different

**[00:13:24](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=804s)**
levels of the agent workflow. Are we measuring the impact of all the noise produced by the
human input? There's a paper out where I was one of the co-authors saying agentic systems
should be general. Specifically, in that paper, we claim that we should build the protocols,
evaluation frameworks, and development practices needed to support adaptable agents.
General-purpose agents are probably the future that we're all moving towards, so our evaluation
frameworks should look the same. So, what is concretely missing across agentic evals? A lot of
evals don't report session level reporting,

**[00:14:13](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=853s)**
meaning that you can have completely different results between two sessions, even though you
might have two identical scores, as I showed in the example above. So, having session level
information is important for reproducibility. Agent [snorts] identity is a black hole. Right
now, most agentic evals are tagged with a model name. The model is not necessarily the agent.
So, we would also like information about the sub-agent list, MCP servers, memory config, and so
on. Benchmark-specific protocols block block generalist agents. So, if you have designed a
benchmark that requires a very specific setup, that does not work very well with generalist
agents.

**[00:15:01](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=901s)**
Robustness measurements are not standardized. People are not reporting seeds, prompt
perturbations, pass at K, and so on. We need better standardization around those. Cost
reporting is inconsistent or absent. Some evals report cost, but not others. Also, benchmarks
are currently lacking in the features that that they're not simultaneously cross-model,
cross-environment, cross-agent, cross-protocol, and agent-agnostic. So, working towards
generality is something that we've advocated for. So, how does that relate to documentation?
So, bringing it back to every eval ever, the team that wrote that paper, they have proposed
some agentic extensions. So, in terms of standardized eval reporting, we can

**[00:15:50](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=950s)**
extend that for also agents by additionally submitting system compositions. So, what are the
models inside the system? What are their roles? What are the sub-agents? What are the MCP
servers, and so on. Session semantics. So, we need to very clearly add fields for what defines
a particular run or a particular session of an agent. Interaction accounting. So, again, all of
these additional measurements that measure interaction. And finally, eval conditions. So, what
are the conditions required to reproduce that agent action that can be evaluated by somebody
else cleanly by especially by a third party. As Ben mentioned at the top of the talk, there
still remains technical challenges. I still would like to see more human AI interaction
measurement or

**[00:16:40](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1000s)**
human agent interaction measurement specifically in systems. We are also starting to see
emergent multi-agent effects. Now, with open clock, people have claws. We ourselves have been
noticing in the hugging face that we get a lot more pull requests by people's claws. It is not
very clear to us how to sort of do that kind of monitoring cleanly. Um And then, we also we,
meaning the community, is also working towards better measurement of long-horizon tasks because
that is not yet clearly defined. Meter has a long-horizon benchmark, but again, that is people
mean different things when they mean long horizon. Um

**[00:17:29](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1049s)**
What are the policy implications of this this sort of need for standardization of reporting?
So, governance requires session data. So, we, in terms of actually holding people liable or
their agents liable, we need clear session information. Otherwise, you cannot clean the audit
agent behavior. Just giving a score is not enough. You also need white-box system records. So,
just saying the model data is insufficient. You need to see which actor was responsible for a
harm. This already happens in AI. So, when you look at an AI life cycle, you have the data
collector, you have the model trainer, you have the system designer, you have the person who
was responsible for making you interact with the system. So, if you're in a professional
scenario, somebody was responsible for

**[00:18:18](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1098s)**
whitelisting some AI systems and not allowing others, and then you have the end user. Agents
make that problem worse by multiple orders of magnitude. So, having infrastructure that sort of
allows you to measure accountability cleanly is needed. Shared schemas are great for
independent evaluation. You can both see all of the evaluations for an agent or a system or an
LLM in one single place, and you can reproduce them with the technical parameters that we're
requiring for the schema. Finally, safety oversight is undermined by benchmark gaming. So, we
need we as a community need to continuously talk about malpractices in eval reporting, so that
we move away from benchmark

**[00:19:06](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1146s)**
gaming, and actually move towards holistic AI safety reporting. So, in terms of my closing
thoughts, the call to actions I have for the community are we should build evals in the open,
we should have compatible open reporting frameworks, we should stop benchmark chasing and look
at the aggregate picture, look at what happened beyond just getting a particular score. We need
better scalable oversight, so we can't just have the world have 1 million open claws. We also
need to make sure that it is monitorable by humans. And finally, eval policy should move beyond
capability measurements, and also keep humans and societal impacts in mind. With that, I'm at
the end of my talk. Thank you so much for listening, and I'm open to questions and feedback.
Thanks, Averil. Yeah, that was a really

**[00:19:55](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1195s)**
cool talk and it really set the stage for for the the rest of the workshop. We had a couple of
We actually had a number of questions coming in and one that I think was repeated a few times
was really about the relationship between the model and its harness or its implementation, like
the agent's implementation. Um one question was how much of the safety concerns come from the
the underlying LLM and how much come from the agent? Uh and another question which which I kind
of want to echo myself was really how would we evaluate harnesses agnostically? Would we have
like a single harness that we say this is our eval harness or would we just need to kind of
take every major harness and and and evaluate them? Which strategy do you suggest? So, um so

**[00:20:43](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1243s)**
there is a paper a follow-up paper to the paper I shared about agentic systems should be
general called exgenic um by the IBM team. Um so they really go really deep into this meaning
that there is a way to create uh agentic evaluations that are harness agnostic. Um to get to
your first question though is um some errors do come from LLM underlying LLMs and some errors
come from the tool itself. Um there is a ton of work uh pre-agentic work on cascading biases
for instance like I come from a fact background. Um uh so I I I just generally think that we
should look at agents as a white box fashion meaning that you look at the whole system. You not
only see what the failure modes of

**[00:21:31](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1291s)**
the underlying LLM are but also what are the failure modes of the tools that are used. Um was a
particular tool called correctly during the agent run? Uh was there is the chain of thought
inconsistent um and so on? So it's it's more holistic than that. So like I personally favor
reporting all information um for maximal reproducibility and then we go from there. >> [snorts]
>> I think you're muted, Ben. Great, thank you. We're going to keep the train moving and move
on to Arvind uh Narayanan now and uh he's going to give a presentation on uh towards a science
of AI agent

**[00:22:19](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1339s)**
reliability. I'm in. Great. Thank you, Ben. Uh hi, everybody. I hope you can all hear me. Uh
Evgeny really nicely set up a lot of the problems with AI agent evaluation and I would like to
tell you about my team's recent work taking a big swing at one set of those problems, those
related to AI agent reliability which we think is a kind of a separate orthogonal component
from capability. And until this work, we're not really aware of any serious efforts to even
define what reliability is, figure out what are the different components of reliability, and
try to measure them and see whether reliability is improving over time. And so that's what
we've done in this paper. I want to give a shout-out to the team, in particular Stefan
Rabanser, the first author, who's put an incredible amount of work into this.

**[00:23:05](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1385s)**
And some of the slides are also from him. Okay. So to motivate this, let me start with a
paradox that many people have been noticing, uh which is that AI agents have been basically
crushing all kinds of capability benchmarks. And if you believe this hype, companies should be
replacing people with agents left and right. That doesn't seem to be happening. There's no
measurable impact on, let's say, the GDP yet. What could be the reasons for this? One possible
reason is that it's just going to take time. Many companies, people might not even be aware of
these capabilities yet, so maybe we just have to wait a while. That is a plausible explanation.
We think there is another plausible explanation, which is that these capability benchmarks are
looking at only one component of what it takes to make an AI agent useful. And these agents are
actually not useful enough

**[00:23:54](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1434s)**
yet to be sort of drop-in replacements for almost any kind of human worker. And we think this
is a big gap. This is a capability reliability gap. Uh and so that's the hypothesis we explore
in this paper. Now, uh we've kind of known this for a while. There have been some notable
failures of consumer products. We'll talk about enterprise in a second. Consumer products that
were highly capable but were not reliable enough and so no one wanted them. So here's one
example that many people might have seen. This is This was called the Rabbit R1. I think again
this was from almost 2 years ago. You could just talk to it. It didn't have a screen, but you
could just talk to it and could order products for you online. That's an incredible capability,
right? People were just building these wrappers on top of LLMs and trying to make these kind of
agentic hardware products, but people will

**[00:24:42](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1482s)**
quickly notice when they tried these that there were reliability problems. So in this example,
it delivered food to the incorrect address. And also something with the tip you can see at the
bottom. Now, even with free LLM agentic systems like Alexa and Siri, we've had reliability
problems, but if Alexa or Siri plays the wrong song 10% of the time, that's merely an
annoyance. But if an agentic product, you know, uses your credit card and does the wrong order
10% of the time, that's dead on arrival, right? So this is a really serious issue. And so we
I've been ranting about this on social media for 2 years, but 6 months ago we started to really
try to define and measure the problem. And I want to tell you about some of those results, but
let me give you some more examples. While we were doing this research, we noticed many

**[00:25:30](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1530s)**
many other examples of reliability failures of deployed agents, whether it's Sorry. Uh skip the
slide there. Whether it's OpenAI's operator, again with incorrect purchases, or on the right
here you can see an agentic coding system deleting a production database. You've probably seen
many horror stories like that. Even governments, which are usually pretty slow to move, are not
immune from the reliability failures of these systems. Now, if you look at the attitude in the
AI industry compared to other traditional industries where safety is important, like aviation
or nuclear power, it's just such a different approach to things, right? So if you think about
it in terms of pure capability, you know, ever since the Wright brothers, we've had
demonstrations that planes can fly. But getting them to the point where it's one

**[00:26:17](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1577s)**
error every trillion miles or whatever that standard is, that level of reliability took most of
a century. And I think that is uh uh you know, maybe maybe it won't take most of a century, but
there's a long way to go I think for AI agents to be able to be used in high-stakes
environments uh in order to reach those levels of reliability. Okay. So with that, let's get
into some details here. So when we looked at all of these domains, we found that there are four
different dimensions of reliability that emerge. Consistency. Uh so uh a 70% accuracy might
mean that uh there are 70% of tasks that the agents can perform consistently and the other 30%
where it will consistently fail, or it could mean that on any given task, unpredictably it'll
work 70% of the time and fail 30% of the time. Uh

**[00:27:06](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1626s)**
robustness, what happens if you slightly change the prompt or environment or whatever?
Predictability, can it look back at an agentic trace and figure out if it has performed the
task correctly or not? And then when failures do happen, is the severity high or low? So again,
these are from traditional systems, but we were also able to adapt them to AI agents. And so
here's our key finding. So we looked at uh 14 different frontier models and we used agentic
scaffolds. You can see the details of the scaffolds and harnesses in the paper, but the
critical finding is that over the last 18 months, a period when accuracy on different
benchmarks has been improving dramatically, when you look at these four dimensions of
reliability uh and you have a composite score based on those different dimensions, reliability

**[00:27:54](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1674s)**
has only been going up very gradually. And um you know, if um if you think that AI agent
capability is improving exponentially, this should be a bit of a sobering finding. Yes,
capability is going up, but capability doesn't fully measure usefulness and there is this other
dimension we should care about. Uh and so this was on uh Gaia uh and the Tau bench airline uh
benchmark. We've started with two, uh but we're gradually working to add more benchmarks to
this. So I'm going to show some more charts that go into this in a bit more detail. Um So
there's going to be a lot on this slide. I apologize. So let's start with the middle. So in the
middle here, you see the two uh charts uh the two benchmarks, Gaia and Tau bench, uh broken
down separately. So

**[00:28:44](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1724s)**
uh especially on Gaia, but on Tau bench as well, the reliability progress has been slow. On the
other hand, accuracy progress, as you can see on the left, has been much more rapid. The slope
is much higher. Uh and then on the right-hand side, you see accuracy versus reliability. It's a
remarkably straight plot. Uh so there seems to be a very strong linear relationship. Uh so
reliability does go up as accuracy goes up, but much much slower. And this is across a whole
bunch of different frontier models. So that is the key finding. Okay. So what I want to do in
the rest of the time, you know, in the next 5 to 10 minutes, is to look in a little bit more
detail at what these different dimensions are and what they're capturing. So if we look at the
consistency dimension, that actually further splits into three different

**[00:29:33](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1773s)**
metrics. We look at uh you know, is it is it the same pass/fail result each time for any given
task or is it kind of stochastic even within a particular task? So that's outcome consistency.
And then trajectory consistency is is it taking the same set of actions in the same sequence
each time or is it you know exploring different ways of doing the task. That kind of creativity
can be actually helpful in certain scenarios, but if you have like a customer service agent for
instance, you really want it to have the same predictable behavior for each customer, otherwise
it's hard to have quality assurance over how it's going to work on a scale of millions of
customers. And then cost and other resources, how stable are they across different ones. And
then we have different kinds of robustness. Fault robustness we

**[00:30:21](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1821s)**
specifically injects faults into the environment because of course when agents are deployed
there are going to be you know API timeouts and various other kinds of errors. How good are
they at dealing with these things? Another one is prompt robustness. We use an LLM to
automatically reword the prompt in a way that preserves the semantics, but changes you know the
style or tone or something like that. So in this example you might see an informal style of
prompt might lead to one answer compared to a more formal style of prompt. So this is a
hypothetical example, but I'll show you some some real insights from agent traces as well.
Calibration, so this is really important. You know if if an agent is not calibrated, typically
not calibrated agents tend to be overconfident rather than

**[00:31:08](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1868s)**
underconfident, then you elicit its confidence score, how likely is it that you got the correct
answer? If it says 60% then you know you expect that to actually be true 60% of the time, but
in the case of an overconfident agent it's going to be giving scores like 1.0, but in fact only
half of those cases did it actually succeed. Now one good news is that calibration has been
improving because of issues like psychophancy we suspect that's the reason why companies have
been really careful about fixing this because they've gotten into trouble for overconfident
chatbots and agents, but the downside has has been that discrimination has been getting worse
over time. So you want good discrimination which means that the agent doesn't always say 50% or
something close to that when asked how likely it is that it succeeded. You want

**[00:31:56](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1916s)**
it to be able to separate its successes from its failures. Okay, and then finally safety. This
is something we measure but we don't aggregate into our overall index. We look at the severity
of failures. Is it something minor like a formatting error or is it something major like data
deletion? All right. So here I want to give you some insights from automatic as well as manual
analysis of agent traces on the Gaia benchmark which we found to be a very interesting
benchmark for this purpose and I believe we'll hear a Gaia 2 talk later. One thing we found is
that on the calibration problem specifically models tend to get get to get confused when they
have a very clean process versus a messy process. If there were some tool calling failures,
that sort of thing, the model

**[00:32:44](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1964s)**
thinks oh maybe the answer was wrong when in fact that actually has nothing to do with the
correctness of the answer. So that was one kind of failure mode. Another one is many of the
questions in Gaia were ambiguous and that's really interesting from the perspective of
eliciting capability you might think this is a bad thing. It's under eliciting capability
because models are getting confused by ambiguous questions, but from a reliability perspective
that's very helpful for us. We can examine what happens when these models are faced with
ambiguous questions because in real world deployment of course there will be ambiguous tasks
all the time and they don't handle it that well. And then I won't go through all of these, but
you know we did find many cases of hallucinations when for instance we inject faults which
means that some of the data that they need to download to complete the task becomes
inaccessible. So even if by default the

**[00:33:32](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2012s)**
model might not hallucinate much when we put it in the situation then it might do so. Okay. So
what are some lessons from this? So we do think that companies that are deploying agents have
to make a critical distinction between whether the agent is meant to augment human
productivity. So for example in a coding agent, you know many of these errors are maybe not too
not too bad because the programmer is still in the loop and they're reviewing the code and so
forth. But in a customer service agent, you want the agent to autonomously handle customers,
these are much worse errors, right? So reliability really matters in automation tasks as
opposed to augmentation tasks. Okay. And so maybe you know for release

**[00:34:23](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2063s)**
decisions it's not just capability that matters, it's also some reliability threshold that
needs to be met before you decide to deploy an agent. And for researchers and developers, we
think it really should be the norm that for every benchmark, you know this is not some
reliability specific benchmark. I want to I want to clarify that. You can take any benchmark
and measure all of our reliability metrics on it. So maybe that should become the norm. And
then we've seen many researchers say oh you know as models get smarter in general reliability
issues will get solved. Maybe, but I think we should also prepare for the possibility that
maybe that won't happen and we have to specifically work towards optimizing reliability. Okay.
So I do want to clarify that so far our findings are tentative. We we're we're you know
reviewing our runs for for any bugs. We know there are

**[00:35:12](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2112s)**
many limitations, only two benchmarks, not too many scaffolds, etc. So we're working on all of
those. And we're hoping to launch a reliability index which will be a one-stop shop for
tracking how reliability is changing over time in the community. Um And then just some last
thoughts on some big picture implications. One thing I wanted to mention is that if you look at
to the extent that you're interested in you know the grand ambition of the AI community to
achieve AGI, I think our work has some implications for that. So the UK AI safety institute
recently or security institute recently put out a nice report listing six barriers to AGI.
Right? And what our work did is to drill down into reliability and identify these 12 different
metrics. And most of these

**[00:36:02](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2162s)**
metrics aren't solved. Two of them are more or less solved, but the other ones still remain
barriers. So we think that if other researchers were to drill down into each of these other
barriers and identify those subdimensions, we're going to identify lots more barriers that need
to be solved before we can get to some notion of AGI. AI that can replace you know almost any
human worker. And then one final thought. This is on long horizon tasks. You already heard a
little bit from I Vijay the bad long horizon tasks. So meter famously recently said oh you know
our task suite is starting to get saturated. Well, maybe. But what if what's getting saturated
is not the task suite? The tasks are fine, but the metric is saturated. It's not enough to look
at capability. You have to look at you know

**[00:36:49](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2209s)**
12 different dimensions of reliability, various other things, maybe collaboration ability,
cost, latency, so many other metrics you might want to want to look at. So that is a
provocation that I want to end on. Our evaluations for agents need to be much more
multi-dimensional. If everybody is just focusing on capability, we're really missing many
questions about what makes agents useful in the economy. Okay, thank you very much. Thank you
Arvin. That was a really cool talk and and and we went even deeper. That was great. Yeah, we
had once again questions firing in and kind of also about the implementation again. People were
interested specifically in a kind of react paradigm or even in yeah in kind of other
implementations of agents.

**[00:37:36](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2256s)**
What it would look like practically and and how if I was building an agent in a research or
industry context, how I would measure reliability. Like for example if I was working on an
open-ended task and agents could achieve that task in in many different ways over different
numbers of turns, how I would measure that in my system and kind of act based on on what I
found. Yeah, definitely. So in terms of you know reproducing our results and doing these same
measurements for different tasks or different benchmarks, our code is available, you know we're
please feel free to reach out. We're happy to help with that. What I take from the question is
that if you had you know a kind of more open-ended task, what does it mean to to look at the
consistency of the agent's performance? I want to clarify that on

**[00:38:25](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2305s)**
many kinds of tasks the reliability metrics that we measure might not be desirable things. In
some cases for instance if you want let's say just to take an extreme example, if you want an
agent that writes poetry, if it does the same thing every time, if it produces the same poem on
any on given topic every time, that would be a very bad thing. You want the agent to be
creative, you want it to be very stochastic. And so it really depends on the task whether it
actually makes sense to measure what we're measuring or not. Great. Thanks for that. We'll keep
on going on to Pierre Andre. Thanks Arvin. Okay. So Pierre Andre ready to go. I'll just get
your slides ready. There you go. So you can take it away Pierre. Hey, thank you Ben. Hey, I'm
Pierre. I'm a research engineer

**[00:39:13](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2353s)**
at Meta and I'm going to talk about Gaia 2 which is a new benchmark for agents that we've been
developing with people from the Gaia original team and and a bunch of other people you can see
on this slide. A lot of the previous speakers have talked about the challenges of evaluating
agents and here I'm going to dig into one possible benchmark. It's not the full benchmark for
everything, Um, but I'll talk about the challenges we're trying to solve. Um, and one core
thing we're trying to work on is agents. When you look at Open QA or Venice, they need to work
on a world that keeps changing. So, previous evaluations of LLMs would get a prompt input and
look at the output of

**[00:40:02](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2402s)**
the LLM and say this is the correct or the wrong answer and that that was um the evaluation.
Um, for three agent evaluations, you put your agent in a sandbox and you let let it work on a
bunch of code files and check that they compile um and pass the test you want, but they don't
have any input from the outside world. Um, >> [clears throat] >> but in real consumer agents,
um the outside world changes. You get new emails, um the news changes, the internet changes.
You have to be able to adapt to this. Um, so we need evaluation frameworks that let us do this.
Um, an example, and it's really tiny, I'm sorry. Um, is this task that you might give to
someone to an agent, which is um

**[00:40:51](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2451s)**
organize a wine tasting with some colleagues. Um, the agent has to um email the colleagues,
wait for their email responses, um book a bunch of things, and adjust to the environment
sending um inputs to the agent, not just the user talking to the agent. So, we're trying to
solve this with simulation um in Gaia 2. Um, and there are a few other uh environments that do
dynamic environments like this. So, Arvin mentioned uh Tau Square earlier that does uh user
simulation. So, the agent sends a message and uh user uh responds to the message in the in the
benchmark. Um, the vending bench benchmark does some um environment simulation by changing the
cost and the

**[00:41:40](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2500s)**
sales and the demand um of the vending machine. Um, but we're trying to focus on what we call
uh multi-app simulation. So, think of it as uh trying to simulate what you would have on a
mobile phone where you would have a bunch of apps. Some of them are connected to external
services like your email or your messenger apps. Some of them are purely local stuff like your
file system. Um, but they all interact and they might change with what the the agent does, what
the user does, or some external environment events. Um, the Gaia 2 benchmark has been built on
top of uh the Meta agent research environment, which is a platform or framework where you can

**[00:42:27](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2547s)**
build um use this simulation and build evaluations um for agents. So, it is not specific to
Gaia 2 and if you want to contribute other um kind of task, uh feel free to to try. >> [snorts]
>> Um, >> [cough] >> and the concept [clears throat] in um ARE are four main concepts. Uh
first, we have the apps. So, again, it's like an app on your phone. It keeps some state um
about the world and the app and it exposes some tools or some API surface then the agent can
interact with, um the environment can interact with, and the user can interact with either
through um API calls, through Python, through MCP, or even through CLIs if we want uh for our
more modern um orchestration frameworks.

**[00:43:15](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2595s)**
Um, then we have a concept of universe, which is your simulated environment and the initial
state of your environment. So, it's a bunch of apps um and all their initial states. So, past
emails you've received, your current calendar um events, message conversation with other
personas in the in the universe. All this is simulated. Um, and then on top of this, we can
inject events either from the user, the agent, or again the environment. Um, and then from all
of this, we can build uh tasks that we call scenarios because they're not a simple prompt like
you would have in other uh frameworks and benchmarks, uh but they are prompt that is the task,
a sequence of events that we expect from the agent and events that might happen

**[00:44:02](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2642s)**
in the environment during this task. Um, we want to be doing this in a simulation and not in
the real world, um so we can have reproducible um and observable evaluation uh like Arvin was
asking for, um where we can also test uh robustness um like we discussed earlier. Uh we want to
be able to do this in a safe environment, so we want to take destructive actions. We want to
ask the agent to remove all my emails, cancel calendar events. Um, so we don't want to test
this on the open web. Um, and we want it to be cheap, so it's reproducible again. So, don't
want to depend on external bandwidths and APIs. Um, so Gaia 2 was built on ARE. Um, we

**[00:44:50](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2690s)**
published a benchmark with a thousand uh scenarios um over 10 different universes and [snorts]
all of them use around 11 apps. Um, all these apps all are within all these 11 apps are in the
10 universes. Um, each universe was automatically generated from a database of personas um in a
hierarchical way um using an LLM to generate conversations, emails, calendar um data to set up
the initial state of our environment. And then we had um human annotators create tasks and
events um scenarios on top of this. Um Gaia 2 is uh split in five different capabilities.

**[00:45:37](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2737s)**
Um, the first one is execution, which is when you ask your agent to do uh a task that require a
bunch of tool calls um that will change the environment. So, cancel all my meetings, um respond
to that email. So, the agent has to take a bunch of of actions, but will do this within one
turn of the of the agent. Um, search, which is very similar to the first Gaia um benchmark, but
this one instead of testing search on the open web, um tests search within our set of apps. So,
within our universe. Um, and the agent has to find the information across different API
surfaces and not just um keyword searches.

**[00:46:25](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2785s)**
>> [snorts] >> So, a good example here is um I forgot my Netflix password, but I remember
sharing it with my parents. Uh can you retrieve it? The agent has to figure out who your
parents are um and search in a bunch of communication apps for messages that might contain this
Netflix password and return the password. Um >> [clears throat] >> The next one is
adaptability, which is um in a way next ex- an extension to the execution uh capability. Um, in
adaptability, you have multiple turns, so the agent takes some actions in the first turn, uh
but the environment messes up at some point with these actions. So, maybe it has booked a bunch
of uh meetings, but the other attendees cancel this meeting. So, the agent has to react to this

**[00:47:13](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2833s)**
um and adapt to the the environment changing and reschedule or take new actions based on that.
Um, the next one is time, which is similar to adaptability, but instead of adapting to events
of the environment coming after its action, um the events come based on time. So, you can think
of you know, asking the agent to book a flight when it's under a particular uh price, so you
have to wait for the flight price to lower in the in the flight app. Um, and react to to time
events like this. Um, time is interesting because when we run the evaluation benchmark and we
have a scenario that has events happening over two or three weeks, we don't want to wait for
three weeks for

**[00:48:02](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2882s)**
um that task to be performed. So, we have to simulate the time, uh fast forward or jump in time
in the simulation and make the agent aware of this as if it was in the real world. Um, and
finally, we have ambiguity, um which I think Arvin talked about from the original Gaia, um
where we have tasks which are ambiguous. So, the agent cannot resolve the task without asking
follow-up questions to the user. Um, so it's going to start doing search, doing actions on the
environment, and then figure out it has to stop and ask the user before doing something wrong.
Um >> [cough] >> And to do stress testing and robustness testing like Arvin was suggesting, um
we have a way to in-

**[00:48:50](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2930s)**
introduce noise into the simulation. Um, so we can introduce tool failures on all the apps um
in different forms. Um, we can uh vary the the API of the apps. So, change the names and the
API signatures of all the tools so that we can make sure the agent is not overfitting over um
some specific signatures. And we can introduce what we call the environment noise, which Sorry.
Let's us introduce um external events in the simulation that are not related to the task, but
will add extra noise um to the input to the context, so we can check that the agent is robust
to actual real world um noise happening. And finally, another argumentation is

**[00:49:40](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2980s)**
agent-to-agent where the agent, instead of being able to directly call the tool, has to talk to
a sub agent with natural language and the sub agent is the expert that will be able to call the
tool. So, this test being able to solve the task without any tools, just talking to two sub
agents. So, GAIA 2 is quite different from GAIA version 1. It's not limited to web browsing
anymore. It's on a bunch of apps. It's dynamic with real-time events. >> [cough] >> It's
[clears throat] not read-only anymore. It requires a lot of write actions. And we can do
verification at the action level. And the way we do verification is we moved away from rubric
judging, which

**[00:50:28](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3028s)**
was very dependent on LLMs and their capability and very expensive [clears throat] in a way to
even verification. So, if you think of a diagram of events like I showed in some of the
scenarios earlier, we have annotations for each scenarios of the expected set of actions of
right actions we want the the agent to take and we can compare this expected diagram of actions
to the actual diagram of action the agent took during the evaluation and check event-to-event
that they happened in the right order and they happened with the correct parameters. >> [cough
and clears throat] [laughter] >> And we do [snorts] this thanks to a hard verifier. So, this is
a lot cheaper than calling an LLM and a a lot more reliable

**[00:51:18](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3078s)**
to reproduce results. Cuz there's a lot of parameters to the tool calls like did I send it to
the right email? Did I Did the agent send it at the right time? That we can check with pure
equality or simple algorithmic code. And then we have soft verifiers. So, if the email If the
agent has to send an email, we can use an LLM to check that the content of the email generated
by the agent is the one that we expected. It doesn't have to match entirely. We can use the LLM
language capabilities for that. The key findings we published last year, so this table is a bit
outdated. >> [cough] >> And [clears throat and snorts] we can see a lot of agents and models
already perform quite well in search and execution,

**[00:52:07](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3127s)**
but time they're terrible. They are around 0% all of them, even the top models. Adaptability,
so adapting to the environment changing during the action, they're not super good either and
ambiguity also. What we've seen is that these numbers change very quickly with new models
coming out so often. So, we need to adjust and make tasks more complicated, but with the ARE
framework, it's easy to to add more turns and more expectations to to the scenarios. We also
need to adjust how the judges work for comparing events because we see that the style that we
expected from models last year is actually very different from the output style of model

**[00:52:54](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3174s)**
this year. So, yeah, this is two things we've open sourced last year. There's a paper coming up
at ICLR this year. The ARE framework lets you write new scenarios, new tasks, and even new
apps. So, you can create your own benchmark on top of this framework and you can use the GAIA 2
benchmark, which was human annotated and curated for for creating good results. Thank you.
Great. [snorts] Thanks for that, Pierre. That was another great presentation. Um Thank you. One
question that came to my mind and and maybe it's because of my bias of working on environment
RL environments. Um

**[00:53:44](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3224s)**
The question is what does like reward hacking or or what does hacking GAIA from an agent look
like? Like how would they do that? How did you anticipate that they would do that? And kind of
what did you build into GAIA to prevent them kind of hacking the the environment? Mhm. Um so,
in GAIA 2, um the the way we do this is we are quite strict checkers. So, in the way we check
the the results, we make sure we don't see hacking patterns in there. And also, we can increase
noise if we want. So, we can make sure the agents don't overfit and and and guess what the
tools look like or should do because we can increase failure rates and change

**[00:54:34](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3274s)**
the signatures of the tools while keeping the same tasks. Okay, cool. Thanks for that. I'm
going to move on to Mahesh now. Cool. Great, Mahesh. There's your slides. You're ready to go.
Yes. Um thank you, Ben, for the invitation and uh lots of great talks so far and I feel like
you guys have done excellent job of setting up the stage for me to talk about environments and
why environments are actually critical to to evaluations. And my name is Mahesh. I'm co-founder
and CEO at Bespoke Labs. And for those who don't know, Bespoke Labs is like an AI applied AI
research lab that focuses a lot on doing research as well as shipping RL environments. And

**[00:55:24](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3324s)**
so, we have a lot of experience working on environments, thinking about how to build them as
well as how to use them for evaluations. And also, previously we we we uh we um created Open
Thoughts and worked on it. It was a community effort. It's one of the best open reasoning data
sets that we did last year. So, with that, I want to kind of dive into environments, but before
that, I want to introduce here Hiccup uh whose uh you know goal in life is to train his dragon
Toothless. And he tries for a while, but the real transition happens when he actually starts to
observe his dragon and truly understands it. I feel that's a great metaphor for us also, where
a lot of us are either training When I say When I

**[00:56:13](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3373s)**
say train, some of us are, you know, uh post-training agents using SFT RL, but also just
building agents out, right? So, uh And I've And also, we speak to a lot to different
enterprises, where they are starting to or setting things up. But one of the things that
happens is like they don't you know, have this eval-first mentality. So, that's kind of what
I'm uh kind of advocating for is like you first start to understand and in our parlance,
evaluate your agents. And get the setup done, get the metrics defined. And then you start
improving your agents, right? So, I want to kind of keep this talk simple, where I will first
talk about, you know, how not to

**[00:57:01](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3421s)**
evaluate and why agent evals are hard. In fact, some of this I feel like has been covered in
the previous set of slides. And after these two main things, I want to say, "Okay, how how do
we set things up, especially around environments?" And then what what do we evaluate? How do we
evaluate? So, that's kind of going to be what I will be talking about. So, how not to evaluate?
You know, why evals are hard? So, a lot of times, what's happening is like people build agents.
Again, this talk is a bit more on the practical side, where people are deploying agents. So, as
I was saying previously, people, you know, are looking at what's happening to the output a bit
more on the right side. It just is is fine for easier or smaller agents,

**[00:57:50](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3470s)**
but quickly you run into issues, where you change something and you you kind of don't figure
you don't understand what has failed or you don't catch them on time, right? So, this is Again,
a lot of this stuff has been standard for software engineering, where we have to write all
these unit tests, regression tests, and whatnot. So, some of that I feel we should be
incorporating. Or sometimes, the other thing that happens is like there is an incorrect initial
level of focus, where people are starting to actually initially like identify, "Oh, here is my
agent, where there's a planner. Okay, is this doing the right thing?" That that that's
something that you have to do eventually, but that's not where you kind of start. Or thinking
into too many of these granular about, "Okay, is this the right

**[00:58:38](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3518s)**
function call to be done?" And things like that. And of course, one of the traps to watch out
and avoid is to deploy to production and evaluate, which again happens a lot. Um And briefly, I
want to talk about why agents evaluations are hard, because agents are very much stochastic.
Like two different runs can produce very different results, which I think Arvind was also
talking about consistency. Many steps to get to the progress to get to the final outcome,
right? So, that also introduces a lot of complexity. The other important thing is that it
Agents can interact with real world and tools. The world underneath can change. So, your agent
can do something, which

**[00:59:26](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3566s)**
you know, can change the world. So, So can make evaluations hard and not so reproducible. And
also sometimes real-world interactions can be expensive. You don't want to delete all your data
or you don't want to send incorrect messages to your users. And so let's get into how do we set
things up for evaluations. I'm going to kind of talk about this in a bit of okay different
levels of complexity. So level zero is like thinking about verifiable setups, right? So exact
easy example here is like coding agents where is the agent actually fixing the bug or not? Did
the unit test pass? So things are a lot more verifiable. Uh maybe in the context of math you
can

**[01:00:15](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3615s)**
check if the you know value is correct or not. So this is kind of the first set of things that
you can think of about is like okay is the final answer correct or not in the in the in the
case of verifiable domains. And even here there are some gotchas. For example, you know, if
you're building a coding agent if you have a number of unit tests, do do you give equal
weightage to all the tests? For example, many unit tests could be pretty simple and there could
be some important tests which that may be few in number and you may think okay most of the
tests are passing but you know ultimately the agent is still not getting the real work done,
right? So so thinking about this and then reward

**[01:01:03](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3663s)**
hacking is something that can happen. For example, we see agent goes and makes instead of
fixing the bug it just fixes the unit test so that just they artificially pass, right? So
things like that are something to watch out for. And then the other level to it is like when
you have cases where the output is not verifiable. So as an example, you are trying to build a
deeper search agent and the output is a paragraph or few pages in length. How do you even
evaluate it? There is no single right or wrong answer. So rubrics kind of come to the rescue
there, right? So what you can do is you can define various rubrics to evaluate whether the

**[01:01:51](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3711s)**
outcome looks reasonable. And in fact what happens in many situations is like you define a
bunch of tasks or or questions that you you you define them and then you can also write
corresponding rubrics for them. So here is an example where somebody there is a question around
I think kidney stone and you can define a bunch of rubrics around the correctness of the
answer, accuracy and and there are more here that you can define. Along with that you can also
define some numbers. The critical point the main point here is that you have your question and
you are able to use this with LLM as a judge get get this each of these can be zero and one,
right? And then you are applying weights and ultimately you end

**[01:02:39](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3759s)**
up with a score. So this gives you a nice nice methodology where you have your questions and
you get a final answer and you're either updating the you know agent harness or you're changing
the model or whatever and then you're able to measure and see whether the number is going up or
not, right? So that that is level one of thinking um going from verifiable to non-verifiable.
And the other thing now I I I want to kind of talk about is the concept of this environment.
Again, we have talked about this before in the previous slides previous talks here. But what's
essentially happening is the agent gets a task and it interacts with an environment and and it
produces an output or sometimes

**[01:03:29](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3809s)**
the output is like underneath the environment, right? So like for example code was that the bug
was fixed and and you you have to have a grader which is checking whether the output whether
whether the agent did the right thing or not. So as I was saying previously this grader can be
unit tests. Did they pass or not? Or you can have a bunch of rubrics to measure whether the
output looks you know reasonable, right? And then here I have these two arrows where the agent
is interacting with the environment. So this is kind of also uh um stuff around how the harness
behaves, right? So what are the what's the set of uh how is the agent planning things and so
on. So so this is

**[01:04:18](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3858s)**
the high level of how things can be thought about when defining these agents. Um defining
environments. And isolating and creating an environment is actually very useful because it can
help you do repeatable and reproducible evaluations and also it's isolated and safe. So one of
the things again I want to mention is this environment could actually be real world or you can
kind of encapsulate into a sandbox. So that's actually the definition we are going for here
when I when we say environment is like a sandbox. So let me actually move to the next slide.
There are a bunch of formats here to define your environment. So basically it has at the end of
the day what it is

**[01:05:06](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3906s)**
it's a sandbox. Uh uh which is containing the required dependencies, required you know, state
of the world, required tools um and and and data and so on. And Harbor is one of the popular
formats. There is also open end um and the the with along with the environment you have these
tasks that are defined and then ways of grading, right? So it's it's yeah great. So some of the
key design decisions when when it comes to using environments for evaluations is maybe you have
one or more environments, right? So maybe you are trying to evaluate uh

**[01:05:53](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3953s)**
um agent for the legal domain so you can have different environments where they they all have
different data. And again associated with all of them there can be tasks, right? And you want
to make these environments as similar to production as possible. And the other thing to kind of
take care of which Harbor at least you know gives this natively is the agent should not have
access to the grader or the solution. Otherwise it can reward hack. And the other thing to
think through is like what are the tasks that you are defining for what the agents are going to
try and do, right? Again, as much as possible having something similar to what you get in
production. Um and and sometimes you can keep it very well

**[01:06:41](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4001s)**
defined, open-ended and whatnot. And grader is as we were talking about it can be a way of
verifiably grading things or there can be rubrics which convert the non-verifiable to in some
sense the verifiable numbers. And a lot of thought has to be given to make sure you are kind of
actually grading for the right thing for the right outcome and also making sure everything you
asked for in the task is graded otherwise it can you know cause reward hacking for example. Um
um if you have asked for three different things but you're grading only two things the agent
can see that oh um I I don't need to work on the third thing, right? So things like that. Uh

**[01:07:29](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4049s)**
which connects back to reward hacking where you you want to kind of you know, as an example add
fingerprint to unit test to make sure the agent doesn't muck muck around unit tests. So this is
kind of talking about how to set things up for evaluation. So thinking about the rubrics and
thinking about setting up the environments. Now what do you actually measure? There are many
many numbers many many different things but in fact Arvind was talking about some of these. But
you know um some of the primary metrics is you can start with something like success rate where
given again the agent, given the environment, given a task you try and roll outs try the let
the agent you know attempt the task n times and

**[01:08:19](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4099s)**
then you measure the success rate. How how often did it succeed? So the grading you just get an
average of the grades from for all these roll outs or you can also measure something called
pass at K. This is you know basically of the K roll outs at least one did at least one succeed
and if you have many many tasks then you can kind of get a sense of the average pass at K. Now
once you have these metrics I'm kind of showing this as an example where you can now compare
and contrast different models or even different harnesses to see okay what's happening with
pass at K, what's happening with success rate across these models. This is very specific
example we had

**[01:09:07](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4147s)**
for a specific domain where you can see how the different models are uh you know, performing
differently. And of course there are many other in addition to like thinking about the success
alone there are many other things, right? So as an example efficiency like how many steps did
it take to get to the final outcome? It could have succeeded or failed, but it could have taken
like, you know, hundreds of steps to get there. So, kind of getting a sense of that. Very
related is the token count. How how much tokens how many tokens are getting used? Latency, like
how long did it take to get the answer? And also cost. Cost matters, right? So, as we are
getting into,

**[01:09:55](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4195s)**
the models are expensive, but also we are using this in many different situations and the
rollouts are also expensive. So, these are some of the factors, but there can be many others
that depend on that that is that are specific to your application or your domain. And not not
to ignore, there are many other factors as well. For example, you want to also understand the
role of harness. So, given a agent, the if you put it in different harness, it can actually the
success rate can actually drastically vary. So, as an example, if you go to terminal bench
dashboard, you can see that the same model on different harnesses has different metrics, right?
And safety is another interesting aspect to verify. This is in

**[01:10:44](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4244s)**
fact article from today. You know, you want to make sure your agent didn't delete all the data
or it's not using your credit card. You know, and maxing out on it. So, you can kind of this is
why it's also useful to you know, encapsulate things in an environment. And then you can also
maybe incorporate some of these as tasks and degraders. For example, you can have a specific
grade or basically you can penalize the model if it deletes data, right? And again, reward
hacking, we we see this often. So, this is something to kind of think about and try to
incorporate as possible when you are getting the when you are setting up your evaluations to
make sure the agents are you know, not taking shortcuts.

**[01:11:37](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4297s)**
The other thing to do looking at the traces. So, this is kind of the flow of things, right? So,
you start with the success metrics and all these other additional metrics and then you also
kind of want to read your traces to some extent and that gives you a sense of how the agent is
behaving. And also in addition to that, you can do a lot of automated and deeper analysis. For
example, it can surface you lots of interesting you know, um insights. So, maybe the agent is
generally good, but when you when you dig deeper, you see that oh, in this specific kind of
scenarios, the success rate drops, right? Things like that is very useful when you can
basically do lots of these you know,

**[01:12:27](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4347s)**
automated failure analysis on the trajectories as well. And then going forward, what what I'm
kind of trying to tell here is in order to do these evaluations, think about being in
environment first. So, think about how to set up the environment where you can do these
evaluations. Think about what the tasks are going to be. Think about how to grade these things
properly. So, these are three specific things you can kind of incorporate and think about. And
and uh And also of course the harness. And it's not just for evaluations, but you can once you
have this nailed down, you can run something like the job algorithm or other ways of optimizing
these agents so

**[01:13:15](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4395s)**
that you can get a better sense of how to improve these agents given these environments, right?
So, you do that, you measure the improvements on your system and then you can deploy to
production. And not to mention, there are many new challenges like long horizon, right? So,
this is a general issue like when when the tasks are taking like many many hours, maybe even
days to finish. How do you do these evaluations? It gets quite you know, obviously takes a
while for us to wait and get these response, but also it's expensive. How do we think about
multi-agent systems or multi-users you know, things like that? And then yeah, I think the main
point here is you want to you know, just like what Hiccup was

**[01:14:04](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4444s)**
doing, you want to observe, understand and evaluate your agent before you actually start you
know, train or build it. So, I think with that, I I conclude my talk. Great, thanks Mahesh.
That was a really practical talk, which I think will be useful to to people listening. One
thing that came to my mind over the last few months, we started to see more environments land
on the Hugging Face Hub, right? In Open LM format, but also some in Harbor. Terminal Bench is
on the Hub now. And it's so see a lot of people building environments for for training and for
evaluation, but for also for for production or for usage, right? And so, the question came up
during your talk is how do you make

**[01:14:51](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4491s)**
in kind of general terms, like how would one make a real-world environment, right? So, you have
this training environment where you obviously don't have a an active Slack channel running,
right? So, so what what does that look like in in kind of simple terms if I wanted to push like
a a Slack environment to the Hub or a startup environment where I have like a Slack and a and a
GitHub and another kind of things. Like how how do I create that real-world environment for for
these training for training and evaluation? Yeah, as it's a great question. So, this is where
the sim-to-real gap comes in, right? So, all these environments we we want to build them so
that they are isolated sandboxes, but then the real world is lot more complex.

**[01:15:39](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4539s)**
It's a it's a challenge. What what ends up happening is you kind of try to there are lots of
you can basically also wipe code some of these things and uh maybe if you have Slack, you kind
of wipe code Slack and then incorporate as many relevant stuff as is needed for your real world
into these uh environments. So, yeah, that there is like this uh game of how do we make the
environment as realistic as possible so that it mimics the real world. So, Cool. Okay, thanks
for that question. We're now go over to Nathan. You can come right up. And I got your slides
ready. Thanks, Mahesh. Up.

**[01:16:28](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4588s)**
Everything is good. Everyone can hear me, I think. Yeah. Perfectly, yeah. Sure. Well, thanks
Ben for the introduction on this and welcome everyone to the last talk of the agentic
evaluation workshop. I'm Nathan and I'm an engineer at Hugging Face and the maintainer of
LightEval, the Open LLM leaderboard and Community Eval as of very recently. Which is what we're
going to talk about today. So, the subject of this talk is going to be defining living
benchmarks with Community Eval and how uh like maintaining the Open LLM leaderboard like back
in the days led us to introducing this new feature on the Hub and how you can use it to share
your

**[01:17:18](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4638s)**
benchmark, make it a living benchmark, how to get the community involved and basically how to
maintain your benchmark like through time. So, let's start with the state of Eval in 2026 and
as Abhijit like for the first talk, very well said, like it was a very nice introduction to my
talk. There is a quite a few issues with the evaluation now. So, one of them being like score
fragmentation. So, different sources usually report very different results. So, what you see
like for example, every time there is a new model coming out, you look at the evaluation page,
evaluation results and you see they evaluated a bunch of models, but it does

**[01:18:07](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4687s)**
not match previous reported scores on those models and probably the next release is not going
to match it either. So, we've been thinking on how to solve this. There is also a maintenance
burden. So, I maintained a few leaderboards and I can tell you and I'm probably sure a lot of
you listening have tried to maintain leaderboard. It is quite painful to maintain, especially
if you try to update it manually. And it's also quite painful to maintain um what is it called?
Like evaluation frameworks that you use for your benchmarks, especially if you're doing custom
evaluation frameworks for your benchmarks specifically. It can be a bit hard and a pain to
maintain. There is also right now not really a

**[01:18:56](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4736s)**
single source of truth, even though a few labs are trying to evaluate as many models as they
can and as to and to present themselves as the one source of unbiased evaluation, it's still
not really working and I feel like we need a lot more of community involvement in the Eval
space. What does it mean is that we can get truth in numbers by making the community more
involved in evaluating uh models and building benchmarks with a greater number of people where
each people is going to be able to say with with my agent with this agent framework that I just
did that I just five coded for example, this is the result and with a few people like a lot of
people

**[01:19:44](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4784s)**
doing this we maybe get closer to an actual evaluation space. Obviously with all the um What do
we say How do you say all the um specificity that Abhijit talked about in his talk. Also last
point benchmarks right now are kind of scattered sorry across like repos on GitHub making it
quite hard to find and when you find it how to run it on your custom model if you have like any
any custom evaluation task for example. So that's what Okay, that's what we are trying to solve
with what we call community advice on the hub. So community advice is basically hugging face
data sets that you can turn into benchmarks. So here is a a screenshot

**[01:20:34](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4834s)**
for example. We have as of now 13 benchmarks on the hub like this going from all more OCR bench
just 8K empty bench not empty bench sorry NTB sweet bench pro and very sweet bench verified as
well as the math arena folks with AME 2026 and more of interest of you guys for agentic
evaluation we have terminal bench from the harbor framework folks. How do we think community
eval are going to fix our issue into the evaluation space? Well first of all is decentralized
which means that uh every data set on the hub has um way an eval YAML

**[01:21:21](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4881s)**
file that makes it very easy to run for everyone and all the data is public even though gated
but we'll get into this later and every results and leaderboard every results that's going to
show up in the leaderboard is and can be opened by a community member. And we'll get into this
later. So the decentralized aspect is very important for us. It's also very easy access is
basically just a hugging face leaderboard. So again very easy to find. And it's community first
as I said everyone can open PRs. And it displays the leaderboards on the data set display any
sources. As an example here we have HLE which stands for humanity last exam that you guys might
be familiar with. It's by

**[01:22:10](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4930s)**
the center of AI safety that we talked about in the previous talk. And now you can see it's a
data sets page but there is a leaderboard and the leaderboard displays results for open source
models and you can see the scores for each of them with a little note that I can't access now
but which a little note about how the model was run what agent was used for this model etc. For
example if it's five shot two shots no shots and all like anything that could be of use to
specify how the model was run can be can be added to the result. Now let's go into like how do
we define this evaluation humanity sorry last exam on the hub. So as I said we have an

**[01:23:00](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4980s)**
eval YAML sorry that defines the name of the task small description and most importantly an
evaluation framework. Here we use inspect AI for HLE and then for each task in the benchmark
because humanity's last exam is the benchmark and it defines possibly multiple task. Here there
is only one where the ID is HLE and you have a field spec that's not really like we won't go
into details from it but here in the same files we have also solvers that just here define like
how am I going to prompt my model how I am I going to add build a framework and a scaffolding
around my model. So here it's a very simple system message and a generate

**[01:23:49](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5029s)**
call to the model but it can be way more complex than this for you can do very big agentic
evaluation using this file especially using inspect AI. Then you have your scorer which
basically just is how am I grading the model answer and here is the model graded fact. It's
basically just LLM as a judge using O3 mini from open AI as the judge. The evaluation framework
that we use here is is inspect AI but it can be pretty much anything else on the hub and why is
it important and why do we recommend using existing sorry evaluation framework? It's because we
see quite a lot of evaluation

**[01:24:38](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5078s)**
benchmarks sorry that redefines their evaluation framework because it's quite easy to five code
now I guess but it's quite it's first of all it's way harder to maintain your own like
evaluation framework having done it myself there is a lot of you know very peculiar issues that
come with it. So using an existing one really reduces maintenance overhead. For example inspect
AI as we'll see later once you define your eval.yaml you have nothing to do like the the model
code is going to take it uh get taken care of the tooling is going to take care of too the
publishing of results is going to take care of. Basically the only thing you want when you're
defining an evaluation agentic or LLM vanilla LLM is defining your evaluation.

**[01:25:29](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5129s)**
It makes your benchmark more accessible because if one or just a few evaluation frameworks are
defining pretty much every benchmarks then it's very easy to jump from one to to the other. And
it's standardized tooling and separate benchmark as I said from your evaluation logic. Now that
you've done this how do you actually run the benchmark that you've defined agentic or not? You
can use obviously what we did for the open LLM leaderboard back in the days is that we had a
local cluster and it's fine but it's quite hard to maintain and you have to take care of like
GPU GPU usage and all of this when there is more than only your team on the on the cluster. And
use usually just a local just one

**[01:26:19](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5179s)**
GPU or local small cluster is not going to cut it for bigger models. You can use also cloud
compute any cloud compute that you have that is available for you but recently more in like
what we wish we had for for example the open LLM leaderboard is HF jobs. HF jobs basically you
can just um it's cloud compute but like you can ask what hardware do you want and it is very
reproducible and it's a one liner to run your evaluation. So these are your option but another
option that I see a lot of people using and I don't really uh like we are quite against using
it I guess but it's inference providers of any sort

**[01:27:08](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5228s)**
because what we saw when evaluating a lot of models with evaluation with inference providers is
that in reality you are evaluating the provider which can be a good thing but maybe not what
you want and you're not evaluating the model. What this means is that uh inference provider
usually you don't know how the model is called in the back end you don't know if it's prompt in
exactly the way you want it to be prompt and this can cause a lot of issue first of all it's
not reproducible you don't really know what's happening with the model. So we would say that to
you need to use local inference or at least control environments like HF jobs. Once you define
your model with on the hub it's very simple to run it

**[01:27:56](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5276s)**
using here inspect AI. So you just use UV here UVX for tooling. So you use UV call inspect AI
um say that the the benchmark is from HF give it the benchmark give it your model here it's
going to use open AI GPT OSS 20B running with VLLM. So this one liner you can just use HF jobs
to run it and it's going to run and publish your results. How does it publish the results? It
creates here it's HF space but it can be a website it can be anything it's very easy to
publish. It's going to create logs very detailed logs about what temperature was used how the
model was how the LLM server was spin up how many tries

**[01:28:45](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5325s)**
if you use the metric for example pass at K it's going to be detailed also here. It's also
computing the standard error of the evaluation and you have pretty much all the metrics that
you needed and we talked about in previous talks how important it was to have very like
detailed logging during your evaluation just to be able to share it and when you are building
your model you also want detailed logging to be able to build on top of it to get better
results after this. Um here we also saw it's not a very good screenshot, sorry, but it's a PR
in model uh repository and it's this PR that is going to be used to display on the leaderboard.
So, once you've done your

**[01:29:34](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5374s)**
evaluation result uh your evaluation run, how do you share results dynamically and to make a
live leaderboard is that you simply have to open a PR on the model uh repository on Hugging
Face and it's automatically show up with all all the info that you want on the leaderboard
dataset. On the dataset leaderboard, sorry. Talking about the leaderboard, so as I said, it's
something that auto updates, uh which is great. Like when we are running the Open LLM
leaderboard, we had quite a few of issues with uh with pipelines. It breaks. It It used to
break like uh quite a lot. And uh now the leaderboard is linked directly on your dataset page.
You have nothing to do, no infra to set up, nothing.

**[01:30:21](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5421s)**
And yeah, it shows latest results in real time and it's very easy easy to share with the
community. And also, on it because each result is a PR, the community can discuss it on the PR
itself. If, for example, it does not agree with one of the results, if one of the results seem
a bit low or a bit high, it can just discuss it in the PR. Uh as I said, community engagement
for the for the leaderboard not the leaderboard, the evaluation and benchmarking is very
important. Oh, yeah. And also, I forgot to say that model author can close or hide uh disputed
scores, like scores that they do not agree with. They can discuss it and if it's really bad,
like you can hide the the result, obviously. And uh yes, that was it for presenting

**[01:31:11](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5471s)**
the the community events feature. I was I wanted to do a small demo, but uh I can't share my
screen, unfortunately. So, yeah. Thank you. Cool. Thanks, Nathan. Thanks for sharing that
feature that we've been building over the last few months. That's really useful. A quick
question that came to my mind um was that if I like let's let's say I'm evaluating uh models
that I'm using, not not exhaustively, and maybe in some ways I am evaluating the provider. Like
I'm using one or or two models and I'm evaluating across providers and and maybe quantizations.
Mhm. And I and I have these results and and they're important to like me or or my domain or or
my language and or something like that. And I want to get them out into

**[01:31:59](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5519s)**
the community. Like like what would that look like? Like how how would I do that, basically? Uh
sure. I mean, that's a great question. The The what would look like is that you would probably
want to sort the results in a certain way. So, do have a leaderboard and if you build your
evaluation, you probably have a dataset on a on Hugging Face to be able to run your
evaluations. And so, the way you would do it is that you could just define your dataset as a
benchmark. Your models, you're going to just open a PR with the results on uh the model repo.
It's going to show up and then when people want to see your evaluation results and you want to
share your leaderboard, you can just share the dataset page.

**[01:32:46](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5566s)**
Cool. And I guess from that the advantage is then other people could go and and evaluate like
other models that I hadn't I hadn't got around to. Absolutely. It makes it super open to see
like blind spot, to evaluate on your model specifically. It makes it makes it very community uh
based. Cool. Okay. With that, uh thanks, Nathan. That was really cool. I'm now going to bring
uh everyone else back on and we're going to have a a kind of short panel uh just to close. Uh
yeah, so so thanks again, everyone, for your for your talks. Uh in my opinion, that that was
really cool. Like that was really well rounded and uh uh and it was amazing. So, yeah. Once
again, thanks. I prepared a a few sort of questions, but maybe if I do like a quick round table
and and someone can just kind of

**[01:33:36](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5616s)**
mention any any sort of topic that was of particular interest to them and and any kind of like
quick takeaway that they had from it or um it doesn't necessarily need to be super articulated,
but just kind of uh yeah, short takeaway. Uh maybe uh Abishek? Um I mean, I think I think what
I'm realizing from this entire discussion is we still don't know what we don't know. Like I
would say if you had asked me last year what I think about agents, I would say that oh, agents
um agents are just terms with tools and we don't need to build further scaffolding. We can just
move on with our lives uh back to the tools and so on. But then people are doing so many more

**[01:34:24](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5664s)**
interesting cool things um with agents, especially the human behavior aspect of it. Like I as a
person would not probably give an agent access to my entire computer and and allow it to read
my WhatsApp messages. But then somebody working in machine learning safety at a big company
apparently think that's okay. So, when we add the additional real-life noise to agentic
evaluations, I think the error landscape uh meaningfully changes and I'd be curious to see what
comes up in the following year. Cool. Thank you. Um Pierre? Yeah, I think like Abishek said,
there's a lot of things we need to evaluate for agents, which are not just like tokens in,

**[01:35:13](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5713s)**
tokens out, right? There's a lot of higher-level behaviors um we want to evaluate and a lot of
this doesn't just go through one score, as I think Arvind said, like it's good to collect
robustness and all the things. Um There's a all a lot of safety evals to do on agents. Like if
you give it access to a lot of stuff, like how how are you sure it's going to do the right
thing? How do you know it's not open to um prompt injection and this kind of things. Um And one
thing we've seen now is with things like uh open code that people just drop in Telegram
conversations is um a lot of current evals are just one user, one agent. Um

**[01:36:00](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5760s)**
And then, you know, in Gaia 2, we have some environment stuff happening. But what happens when
you have multiple actors? Like how do you evaluate this? Um the the agent behavior, who it's
supposed to align with. Um Like they complicated questions on behavior more than just token in,
token out, again. Okay. Um Mahesh? Sure. Sure. Yeah. So, I think that the the ARE work on Gaia
2, they are quite interesting. They kind of show us how to push the frontier on building these
complex environments, which are very useful to, you know, understand these frontier models,
frontier agents. But how can we democratize something like that for enterprises, right? So, the
ARE, for

**[01:36:50](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5810s)**
example, is is a complex environment, which is very specific to some use cases, but many many
others are building agents for their use cases. How can we build something like ARE uh so that
they can start evaluating very safely on their uh you know, enterprise setting, right? So,
things like that. That That's I I think we are just scratching the surface here of, in fact,
you know, building these environments, building uh doing evaluations. So, I feel there is a lot
of interesting work ahead of us. Cool. And Nathan? Sure. Something that I found very
interesting and that actually came out like in almost every presentation today is long context
long horizon, sorry, evaluation. And I think that's one of

**[01:37:40](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5860s)**
the next challenge of agentic AI and I found it a very interesting subject. Especially right
now, like in the last, for example, week or two weeks, a few benchmarks started coming out
already. For example, you have SwissAI, which is like uh the next not the next, but like the
the the the the follow-up to Swiss We Bench, where it's going to evaluate how the model does
not only code, but like how does it maintain on the longer on the long run a code base. And
there is a few it's going to be very interesting to see how benchmarks adapt to long horizon
evaluation. Cool. Yeah, so those are some really interesting takeaways. I've kind of got some
questions um yeah, but based on those and also ones that came in in the

**[01:38:29](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5909s)**
chat. One thing that I I think kind of came out of um Nathan's uh presentation, but it's maybe
a question I address to Abishek is is there a like a a tension between open open evaluations
and and preventing benchmark gaming? And and how do we implement that um within the community?
Like how do we make open environments and and open datasets, but uh not just allow them to be
gamed, basically? I think I think like disclosure plays a huge role. Like there are some common
misconceptions that have not been verified. For instance, um most people you talk to will say
benchmarks get saturated when they're public. But that has not been like massively tested. So
at the Valley lab we had a or have a benchmark saturation paper. Um

**[01:39:17](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5957s)**
it's currently submitted to ICML. So we will talk about it more when the results are out. And
we find that um whether benchmark is public or or private or partially private does not have a
strong correlation with how quickly the benchmark saturates. But on the flip side when you
don't have a public benchmark data set um it allows for this lack of transparency and other
people cannot verify what's going on. So even if you game something if you were doing it in a
way that is reproducible other people could then check um whether you were doing that. Uh so
that's why I'm like a big fan of disclosure. So public benchmarks um open standards and the
bare minimum amount of information necessary for somebody else to validate your evaluation. Um
those

**[01:40:05](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6005s)**
are things we are definitely need. Cool. So Yeah, I mean does anyone else want to go into that
just if you do um say. Otherwise I had a question. I'll go ahead. But [snorts] you can have
open evaluations and check that they're game only if you have access to the models right? Like
if if the models are closed like even if they are evaluated on open evaluations you don't know
um how they were evaluated right? Was it the same model that was run? Um So it's going to be
very hard to check. Cool. So a question I had for Mahesh was what's the

**[01:40:51](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6051s)**
So so thinking about closed and open environments really and and that we want open environments
so that agents can perform well on on tasks and applications that we want to use. But there's a
kind of growing evaluation environments industry right? Like I'm building specific environments
for for labs and and these kinds of things. Um What's the tension there and and how do we
navigate that in the open source? Like like how do we get environments that we can use to
evaluate models? Um Yeah, great point. I think uh The tension exists between even even for
models right? There is there are closed models always more more powerful than

**[01:41:39](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6099s)**
the open ones. Uh But of course the open in open source a community keeps surprising us. So uh
We we did open thoughts which was the reasoning data and now there is actually open thoughts
agents which is actually working on how do we create these environments in the open community.
So that that work is going on. There are various ways of creating these that that we are kind
of you know working on. So that is happening. Um but also you know there is I think the tension
between closed versus open it's there but ultimately what also matters for many people and the
enterprises like okay are they able to build uh environments that are very

**[01:42:28](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6148s)**
suitable or very specific to their and their internal use cases right? So right? So as long as
we are able to work on methodologies and publish them and have good tooling maybe it doesn't
matter if the labs have access to very good environments and open source has you know not as
many environments. But as long as there are these tooling that allows people to build their
environments for their enterprises then maybe that that that solves you know at least one part
of the issue. Obviously researchers do want to have access to environments. The other
interesting aspect is like the environments are typically calibrated to the models. So for very
strong models you get to kind of

**[01:43:16](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6196s)**
build very complex environments. Um Whereas for open models if they are not as strong you can
kind of have some slightly uh weaker environments which are maybe still useful for doing
research. Great. Yeah, I mean it also made me think about open and and a number of the
environments that have come out in for open and have been um like re-implementations and
standardizations of of environments that were previously closed. Where like the rubrics and and
the the rewards have been open but like the the source kind of seed data has not been. Which
yeah bridges that gap for the for open right? Um I I I guess Pierre I've got a question for you
that kind of comes

**[01:44:03](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6243s)**
really just from from your closing point there about multi-agent setups and and and what would
that look like? Um obviously in a kind of Gaia 2 setting like you couldn't necessarily do that
or or could you? Would you have an a sub-agent that acted in a verifiable way or or would you
evaluate teams? Like do you have any intuitions there about what multi-agent evaluation would
look like? Yeah, it's a good question. Um You [clears throat] know in Gaia 2 we have this agent
to agent mode where we have this sub-agent and one sub-agent is responsible for one app like
one set of tools basically. So it can be very specialized to this. Um but what we see in open
flow for instance you could have two open flows

**[01:44:52](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6292s)**
plus a bunch of humans in the same chat right? Or like how do you deal with this? Like this not
specialized agent like you have to simulate the full separate agent with its own memory. With
memory you know it and so files if we take the the open flow um terminology that come from a
different user right? From a different persona that initialized it slightly different. It has
access to slightly different tools. We could do it in array. Um we haven't tried yet. Um Don't
think it's it's very complicated but then you get to one level of complication in in your
parameter parameterization of your eval right? Because like Nathan was

**[01:45:39](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6339s)**
saying we want to document all the parameters. There's already a judge model. There's the model
you're evaluating. There's like what agent orchestration you're using but if you add more
agents like there's the model of that agents like how it was set up. Is it a different
orchestration? Again you have this explosion of ways of evaluating um simple tasks right? And
if you want to cover all of this then you have to have even more annotations. Like possible
task and possible things to reproduce through there. So that I don't know how to manage this
complexity yet. But we'll have to get there. Mhm. Cool. Yeah, thanks for those intuitions. That
that's really insightful. I I guess my my kind of finishing individual

**[01:46:27](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6387s)**
question would be to to Nathan and about community evals and and like the it's a really
optimistic project right? Like that's like kind of in its origins and it's not necessarily like
dictating a standard and saying like this is the way to do things. It's kind of just like
opening up the data layer to the community. Where do you see it? Like like it you know if it
everything worked as planned like 6 months a year from now like what do you see that community
looking like and and how do you see evaluations kind of living on the hub? And how do you see
it? >> Sure. I mean [clears throat] as you said it's not we are not trying to define anything
with the this feature we just trying exactly as what you said open up the possibility for the

**[01:47:14](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6434s)**
community to define their own not way of doing thing because they I guess someone uh the the
way of doing thing would be defined but like by like a bigger like labs or agencies. But to
have a say in how model results are reported and how benchmarks are created. If you make it
easy for everyone to the bench benchmarks and to report results the hope for example in 6
months or in a year his is to have on the hub many many people just like you see today with
models. Every time a model come out there is a lot of people fine-tuning there to their own
data set and to opening it on the hub. The idea would be to have the same with evaluation data

**[01:48:04](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=6484s)**
set and benchmarks. Everyone a benchmark comes out for example. Every time a benchmark comes
out you can just use this run your own models on it do small changes maybe to the to the data
set and to this and have people built built on top of each other. That would be the idea. Cool.
Yeah, that's that's a a great vision and I think a really nice point to close. I I just say
thanks again to all the speakers. It fell together really nicely and I'm looking forward to
doing doing another kind of talk like this and and maybe inviting you all back uh one day.
Probably not next time. Thank you. >> for organizing. Thank you. This was amazing. Yeah.
