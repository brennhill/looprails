# From Noob to Automated Evals In A Week (as a PM) w/Teresa Torres

- **Video:** https://www.youtube.com/watch?v=N-qAOv_PNPc
- **Channel:** Hamel Husain
- **Published:** 2025-08-15
- **Duration:** 01:10:21
- **Captions:** human-written (en-US)
- **Retrieved:** 2026-09-02 (yt-dlp)
- **Cue count:** 1104

## Chapters

- [00:00:00](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=0s) — Intro: Teresa Torres, product management legend and first cohort student
- [00:01:50](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=110s) — The product: an AI interview coach for customer interview practice
- [00:07:00](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=420s) — Why she got stuck before finding this course
- [00:09:04](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=544s) — First Sunday night: writing Python she'd never used before, with ChatGPT as a guide
- [00:10:30](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=630s) — Using Airtable as her first annotation tool
- [00:12:05](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=725s) — Seeing her failure modes for the first time: "holy crap, my coach sucks"
- [00:15:00](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=900s) — Her first two evals: an LLM judge and a code assertion
- [00:19:12](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1152s) — The insight an engineer without domain expertise would have missed
- [00:24:58](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1498s) — Fast feedback loop: how evals changed how she develops the product
- [00:31:09](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1869s) — Today's setup: VS Code, Claude Code, custom annotation tools
- [00:40:00](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2400s) — The A/B test that took an error from 81% to 3% of transcripts
- [00:46:15](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2775s) — How product managers and engineers should split eval work going forward
- [00:58:38](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3518s) — What background do you actually need to do what Teresa did?

## Transcript

_Timestamps link into the video. Captions are human-written._

**[00:00:00](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=0s)**
Welcome, everybody. We're really excited about this talk with Teresa Torres, who was a student
in our first cohort. Teresa Torres is a legendary person in the product management space. She
has trained, I think, like over 70,000 people or something like that on how to do product
management effectively. She's the author of this book, Continuous Discovery Habits, which is
right behind her. You'll see it. You should definitely check that book out. It's very—it's like
one of the canons in product management, from my understanding. I'm not a product manager
myself, but every product manager tells me that. The reason this talk is so exciting and the
reason why you should pay attention to this is, hey, like Teresa, she's not coding every day or
anything like that and

**[00:00:50](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=50s)**
wasn't, like, necessarily doing evals. She had her own approach combined with her product
management expertise, and she has a unique take on how she went about things and has found a
workflow that she likes. And she's going to share that today. So I'm going to hand it off to
Teresa to get us started. All right. I'm really excited to do this. I really enjoyed this class
quite a bit, and you're going to see I learned a ton and was able to put a lot of it into
practice right away. And I cannot emphasize this enough. I forget when the first cohort
started. I think it was in June, maybe May. I barely knew what an eval was. Like, and we'll
talk about that in my talk. I'm going to share some slides, but I'm happy to keep this very
conversational. So please feel free to jump in, Hamel or Shreya, with questions.

**[00:01:45](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=105s)**
We'll just dig in. I'm going to start by giving a little bit of context about the product that
I'm building. And Camel mentioned some of this in my intro, so I'll touch on this briefly.
Like, my day job, I work as a product discovery coach. It means I help product teams make
better decisions about what to build. Some of you I know are familiar with my book. We have a
wide variety of courses. In fact, I saw Letty is here. Letty is currently in our continuous
interviewing course and has gotten to experience the continuous interview coach firsthand. But
basically, because I primarily am an educator, when I started to think about generative AI and
how it might impact what I do, I was thinking about it from a teaching standpoint. And that's
the part that's relevant here. So I found myself in March, I actually had to have ankle
surgery,

**[00:02:37](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=157s)**
and I was like on the couch for months. And I was like, how in the world am I going to use my
time? And I started with this question of what does generative AI make just now possible? And I
was asking this in the context of our courses. And there was one course in particular I thought
this would help a lot with, which is our continuous interviewing course. So in this course,
students learn how—this is customer interviews, so not job interviews—and in this course,
students learn how to ask the right questions. They practice active listening techniques. We
teach a very specific type of customer interview where they're asking the customer to share a
specific story about their past behavior. And there's reasons for this. This is a way to
collect reliable feedback. I'm a little bit of like a research methods wonk, so I'm like trying
to look at what's the easiest way to teach product teams who are not researchers effective

**[00:03:31](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=211s)**
ways to get customer feedback. And in all of our classes, they're very practice oriented. So,
like in this class, students come to class and they interview each other, and we give them a
rubric to help give each other feedback, right? So I'm a big fan of deliberate practice. We
practice a skill, we get feedback, we then know exactly what to practice. There's one
challenge, though. Like when students give each other feedback, they're not really experts, so
they don't give expert feedback. And so the problem I was looking to solve was like, can we
help students give each other better feedback on their practice interviews? And that led to
this question of, can we model what good feedback looks like? And so this is the tool that I
built. I built an interview coach where students submit their interview transcripts and they
get very detailed feedback on what their— how they did on conducting an interview.

**[00:04:22](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=262s)**
And the coach actually— this is actually what you get from the coach. And the coach, this is
actually a partial response, but the coach is basically evaluating the interview transcript on
four different dimensions, and this is from the rubric that we teach in the class. So we're
evaluating: did they ask a story-based question? Did they ask the participant to set the scene?
That's the two that you're seeing here. There's also a dimension about building the timeline.
How well did they get the participant to tell their story? And then did they do a good job of
redirecting generalizations? And you can— I'm going to dive into this a little bit because a
lot of my evals are about this coach feedback, so this will give you some context. So you can
see here for each dimension, they're getting a score. The score can be keep practicing, getting
it, or great. This coach is pulling out real excerpts from the interview transcript and then

**[00:05:13](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=313s)**
giving them a tip. So this might be, this was really good. It might be, here's some room for
improvement. And it's doing this across all four dimensions. So there's two sections of this
email we're not seeing, but it's basically excerpt, tip, excerpt, tip. Okay, so that's the
interview coach. So let's get into... We need the dimensions. Is it that those, is it like
different stages, opening with the story-based question and setting the scene? Are those the
dimensions? Yeah. It's, so what we're looking for in the transcript is, did they ask the
participant to share a story? We teach that they should ask them to set the scene because this
helps with memory recall. So it's a cognitive tip to help get a more reliable story. And then
the building the timeline dimension is, did they help the participant go step by step through
their story so they're

**[00:06:04](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=364s)**
learning what actually happened? And then the last dimension is, if I ask you, tell me about
the last time you watched Netflix, you might start to generalize about what you usually do on
Netflix. And so my job as the interviewer is to redirect you back to the specifics of your
story. And so that's the fourth dimension that we're evaluating on. Interesting. Yeah. I need
to read the book too. This is also, this is already very interesting to me. Awesome. Okay. So
as I was building the interview coach, I literally was like vibe checking the coach's
responses. Some of them looked good, some of them had some problems, and I started to get
concerned, like, how do I know if my interview coach is any good? I would make like... So what
did you have in the interview coach? Was it like transcript of your book?

**[00:06:55](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=415s)**
What information, like, was your initial version? Yes. So because we have a course on this
topic, I already had a rubric for how to evaluate an interview. And so I started with the
rubric that we use in the class, and then I included a lot of the instructional content that we
provide to students in the class to the LLM. And, like, my very first prototype was in a Claude
project. I just uploaded a bunch of files to Claude, and I was just like, Here's an interview
transcript. Give me feedback. It obviously has iterated and evolved quite a bit from there. But
basically, the coach, the AI tool, the coach gets a full interview transcript, and then it has
a lot of context about what's a good interview, what these four dimensions are. It started as
one prompt. It's now, like, depending on the content and the context and what errors it

**[00:07:46](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=466s)**
uncovers, it's anywhere from five to nine LLM calls. So it's a pretty complex workflow. And I
can imagine one day it will be an agent. Like, what I would love to do is to pull in a
student's learning history and then adjust the feedback based on where that student is on their
learning journey and move the coach to more of an agent model where it's choosing what
dimensions to evaluate on based on the student's history. But I'm not there yet. Okay, so,
like, in my earliest days building this—so, thank—by the way, all this is fresh. I started this
on March 23rd, and I really had never built an AI product. I was using all no-code tools at
this point. And I just was making—I had one prompt. Like, it started as one prompt, and I was—I
didn't even know what temperature

**[00:08:36](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=516s)**
was when I started. And so as I was making tweaks, I would see some things get better and some
things get worse, and I was like, This seems insane. Like, product discovery is all about
feedback loops. That's literally what I teach. And so I was like, Oh my God, what is my
feedback loop? Like, I need a more systematic way to evaluate this. And you're all in an evals
class, so you already know the answer is evals. But I got stuck, and you might understand why.
Like, I started at OpenAI, and they talk about evals, and it sounds like it's just a bunch of
input data. And I was like, Yeah, but I don't have a bunch of transcripts, and maybe I could
synthetically generate transcripts, but let me tell you how hard that is. Like, it sucks. And
so I kept looking, and I found like this Python package. And what was interesting to me here is
it started to talk about evals as code.

**[00:09:28](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=568s)**
And I was like, oh, interesting. That's like interesting. And then I came across Amon Khan's
blog post on Lenny's newsletter, and I was like, oh, there's different types of evals. And now
I got sucked in. And that's—we're gonna skip this. You guys know what evals are. That's when I
found this class. And I will tell you, in the very first session when this model was
introduced, like light bulbs went off in my head because this is the scientific method. I teach
the scientific method. And I was like, okay, I'm in. Let's do it. And so over the course of the
four weeks of class, I literally, instead of doing the homework, I just applied each lesson to
the interview coach. And this is how I work. I'm a very goal-directed learner. So I was like, I
have a project. I'm gonna take everything I'm learning and just apply it to my project.

**[00:10:16](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=616s)**
And so, again, some of these slides were for a non-experienced audience, so I'm gonna skip past
them. So I started by collecting my traces in Airtable. So why did I use Airtable? This is a
tool that I'm familiar with. I already had plenty of new to learn, and this is gonna be a theme
of this talk. Like, I try to limit how much I have to learn in each step so that I don't get
overwhelmed. And so I was like, okay, I see that there's these eval tools, but they look really
overwhelming to me. I'm just gonna store everything in Airtable. And so that's what I did. It's
an excellent approach. I highly recommend that people do this. It's like, hey, don't try to
swallow these tools. Everyone wants to go for tools, but yeah, stay where you're comfortable
with in the beginning for sure. So I think I had—God, where did my original data came from?

**[00:11:05](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=665s)**
I think I had about 15 interviews that I conducted. I think I had about 10 other interviews
that— Some of my instructors had conducted, and then I think I had about 10 interviews that
some of our alumni let me play with while I was developing this tool. So it was small data
sets, and I actually used Airtable interface as my very first annotation tool. So if you're not
familiar with Airtable, like it's a database basically, and then it gives you these like UIs to
construct viewers. And you can see here, like I have a trace down here at the bottom. I have an
annotation box. I have my failure modes, and then I can mark it as reviewed so that it doesn't
show up again in my annotation tool. Dead simple, right? And if I go back, you can see like
I've got a bunch of annotated traces.

**[00:11:53](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=713s)**
I've got failure modes. This is my—these screenshots are from my very first round of doing any
of this. This is literally during the class. And I'll tell you, when I saw this, looking at all
these failure modes, I was like, holy crap, my coach sucks. And what's funny is that I thought
it was pretty good. Like when I was just vibe checking responses, I was like, oh, it's pretty
good. Yeah, I was embarrassed at this point. This is amazing. I love this so much. Okay, so I
then sat down. I remember this vividly because it was like a Sunday evening. I'm sitting on my
deck right next to my husband, who's also on his laptop. We're both nerds working away, and I
was trying to design my first set of evals. So I was literally, like whenever I code, I didn't
talk about my coding background. As an undergrad, I took some computer science classes.

**[00:12:45](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=765s)**
I did a cognitive science program where computer science was a big part of it. My first couple
jobs, I was also a front-end developer, so I did JavaScript development before there were any
frameworks. I did not code for 15 years, and then maybe longer. And then about three years ago,
I started coding again to automate a lot of my business logic. So I run cohort-based courses.
Running cohort-based courses requires a lot of, like, data management, and so I started coding
to work with that stuff. I'm not really an engineer. I had never worked in an IDE. Like, I
didn't have a dev environment and a prod environment. Like, I didn't know how to do these real
things. And so I actually chose to work in AWS's serverless environment because, like, I didn't
want to manage an EC2 instance.

**[00:13:33](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=813s)**
Like, I just wanted to, like, execute code and move data from this app to this app. And so I
started writing Node.js Lambda functions and then orchestrated them with Step Functions. So
that was my experience when I started this product. And you'll see this influences a lot of my
tech decisions. Okay, so it's Sunday evening. I'm like, okay, this is in the middle of the
first cohort. I've identified my top failure modes, and I'm like, I need to write my first
evals. And whenever I write code, I always start in pseudo code, and I just start, like, in a
text document. And I literally was in an Apple Note, and I was, like, writing out JSON. And I
don't know if you guys have ever used Apple Note, but it turns quotes into smart quotes, which
breaks your code. And I was, like, banging my head against the wall, and my husband goes, Why
don't

**[00:14:21](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=861s)**
you use a Jupyter notebook? And I was like, What? What's a Jupyter notebook? So I literally
asked ChatGPT, I'm a total beginner. What's a Jupyter notebook? For those of you that aren't
familiar with notebooks, this is a screenshot of a Jupyter notebook. This top part up here is
Markdown, and then my code is here. Here's what this allowed me to do. I started in a Markdown
cell and just brainstormed, like, different ways to do an eval. In kind of pseudo code, and
then I could try to write that in my cell block and actually execute it and then see the
results. And then what I realized, which was really great about this, is like for one eval, I
might have three different ideas about how to implement it best. I could do all three in a
different cell block, run them, and then compare their output. And so that was awesome. I was
like, okay, I'm sold on notebooks.

**[00:15:11](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=911s)**
I'm going to show you two of my first evals that I ever created. So this one. So we need a
little bit of context. Remember, the coach is taking in a transcript and it's sending you
detailed feedback on that transcript. And sometimes it'll suggest to you, it'll be like,
Hannel, you asked a great question here, but you could have asked this follow-on question,
right? So sometimes the coach will suggest a question to you. The problem is sometimes the
coach's suggestions are wrong. So there's two failure modes that came up where sometimes the
coach would tell you you should ask a leading question, like the question it suggested to you
was a leading question. And if you're not familiar with this concept, a leading question is
just a question that implies the answer.

**[00:15:59](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=959s)**
So it's like you're leading the witness. That was one of my failure modes. And then my other
failure mode that was really concerning to me is sometimes the coach would suggest a general
question. So it would say something like, You should have asked, Tell me about your typical
morning routine. We don't teach that because that leads to really unreliable responses. We
teach, Tell me about your morning routine this morning. So the specific, not the general. And
so for someone that's new to notebooks and stuff, like, it seems like you organize your
notebooks quite well. You have, like, headings, you have a little bit of documentation, and
you— Kind of print it out to show yourself what it does. This is like, yeah, good practices. So
here's what I'll tell you. I'm not an engineer day to day, but, like, I did—I took a lot of
computer science classes at Stanford where they hammer, like, elegant

**[00:16:51](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1011s)**
code and well-documented code. And, like, I feel like I have a pretty good foundation in, like,
good engineering practices. And then as a product manager, I always worked at teeny tiny
startups where, like, I was involved in all the engineering decisions. So I think I'm a very
technical product manager. And, like, actually now, like four months in, I'm ready to call
myself an engineer, and you'll see why as we get further along. It's actually been really fun,
like, embracing my engineering skill set. Okay, so these two evals, these two error cases—the
coach suggesting a leading question and the coach suggesting a general question—as a teacher,
were catastrophic for me. These are two of the things that students really struggle with, and I
did not want the coach reinforcing it. But if you look at this code, this one on the left looks

**[00:17:41](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1061s)**
really complicated. It is not complicated at all. What's happening here is this is a prompt
where I'm explaining to an LLM what a leading question is, and then it gets sent a list of
questions, and it's being told if any of these questions are leading, fail the test, and if
none of the questions are leading, pass the test. All this code down here is just Python to
call a production Lambda function, so you can ignore all that. So this is an LLM as judge, and
I iterated on this a lot. I tried, like, sending all the questions at once. I tried sending one
question at a time. I tried sending the full coach response versus just the questions. So
that's what I mean by I tried different strategies for how do I get this eval to be fully
aligned with my human labels. And then this eval, the general question, I actually banged my
head about how do I

**[00:18:34](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1114s)**
teach an LLM what a general question is? Do I have to, like, give it the whole context of a
specific story and the human tendency to generalize? And actually, I realized that there's just
a small set of keywords that tend to indicate a general question. And this turned into a code
assertion. I'm just looking for red flag words in the questions the coach suggested. I've
extended this list of keywords over time, but what's funny about this very elementary eval is
it has a really high alignment rate. Like, it never has false positives, and it catches almost
everything I catch. I'm so happy about this. You nailed it, because what you want to do with
evals is you want to have the right cost benefit. And the fact that you had this intuition,
like, hey, this can be a code-based eval, a lot of people would miss this, honestly.

**[00:19:23](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1163s)**
They would say, Oh, I don't know, let's have an LLM do it. You had the good insight of making a
code-based eval. Okay, I'm glad you highlighted this, because this was the moment where I was
like, Holy crap, who's going to do this in real life? Like product managers, designers,
engineers, like what's the right role? Because the reason why I could identify this insight is
because I've been teaching this stuff for years, and I see the mistakes that students make.
Like, this required domain expertise. And so if I just left this to an engineer who wasn't me,
I don't think this would have happened. And so this is still an open question for me as a
discovery coach that teaches cross-functional collaboration to product teams. I'm like, Oh, we
got to get good at working really closely together, because not every product manager is going
to write code like I did, but I think they

**[00:20:12](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1212s)**
need to be involved in the design of their evals. Definitely, I can almost guarantee you with
almost 100% certainty that an engineer would not have tried to make an LLM judge out of that
and not have. Yeah, totally. Yeah, so these two are literally the first two evals I wrote. I
love them because they're still in production today. Like, they're still really valuable. I've
actually been able to reduce these errors quite a bit. And so, like, this sold me. And I did
this on that first Sunday night. Now, I wrote these on that first Sunday night. I didn't have
any infrastructure for, like, how do I run them against all my traces and how do I score my
judges? So we'll get to that. Okay, so the other story I didn't tell you is on Sunday night
when I started all of

**[00:21:02](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1262s)**
this, I had never even seen Python. But I think my husband works with Python, and he might have
told me that Python has all these visualization tools. I think he did. And also in class and in
the Discord, everybody was talking about all the cool Python visualization tools. So my
notebook is actually a Python notebook, which still blows my mind. And how did I do this not
knowing Python? I literally had ChatGPT open and was like, Here's what I'm trying to do. Can
you help me figure out how to do this? It would present some code. I won't run code that I
don't understand. So I literally would go line by line and be like, What does this mean? What
is this doing? And then once I understood it, I would copy it into my cell block and run it.
Okay, so ChatGPT plus my Python notebook helped me import, like, my traces. So I exported a CSV
file from Airtable.

**[00:21:57](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1317s)**
I imported that CSV file and used, like, pandas. took a look at it. And I created a cell block
in my notebook that ran all of my evals against—at this point, I had one, two, three, four,
five evals—against my traces. And, oh, the other thing I did in my notebook, this I think might
be helpful for people. These two evals, they don't actually take in the transcript. I actually
do some transcript processing to help make my evals more efficient. So one thing I noticed is a
lot of my failure modes were related to the questions the coach was suggesting. So I have a
helper function that—it's just code—that, like, takes the JSON response from the coach and
pulls out all the

**[00:22:49](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1369s)**
coaching tips. That's just code. And then I have another helper function that I think is an LLM
that pulls out all the questions from the tips. So then my evals don't have—especially my
LLM-as-judge evals—they don't have huge input tokens. I just constrained the context to what
that eval needs to assess what it's assessing. And actually, this has saved me a ton of money
and makes my evals really fast, because when I'm testing and iterating, I can run all my helper
functions once for all my transcripts. And then as I change an eval, the input data isn't
changing, so I don't have to rerun all those helpers. And those are, like, the expensive LLM
calls, whereas my evals end up being a lot more lightweight and a lot cheaper. This is amazing.
This is so amazing because not only are you saving money, but, like, you're also making the
eval better if you're constraining the context

**[00:23:42](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1422s)**
to, like, only what it needs to know. If you've done— that's pretty advanced. And that's really
great that you, like, did that work. And people would call that, quote, context engineering,
and you have been doing context engineering from the very beginning, which is excellent. Yeah.
What's funny is that this tapped into—I did this originally just as, like, decomposition. I was
like, oh, this eval and this eval need the same stuff. I'm going to separate that into its own
function, and it was just like a separate cell block in my notebook. And then I realized that,
oh, this enables different experiments I can run. Like, what if I give this eval the full
coaching output? What if I give it just the questions? What if I give it one question at a
time? And that's what really allowed me to tweak and figure out which strategy was most aligned
with my human labels. And I literally did all of this in a single

**[00:24:36](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1476s)**
notebook. Okay. So then I, like, in my notebook, I worked with ChatGPT and was like, okay, I
have evals, I have the CSV file. How do I run all my evals against all my traces? It helped me
create a code block that does that, and that code block outputted what you're seeing here. And
this is basically my eval results. And this was my very first run. So I have one, two, three,
four, five evals, and the traces are the rows. And you can see at a glance, I can start to see
how I'm doing. So those first two error cases that I was most concerned about, they're
happening pretty frequently, like I think about 20 to 25 percent of the time. And then you can
see in this middle one, it looks like, wow, this fails all the time, and this one on the right
seems to be a huge problem. But as I dug into this, I started to realize some really
interesting things.

**[00:25:27](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1527s)**
First of all, this one on the right, when I created this eval, what this eval is, is I have
four dimensions, right? Sometimes a dimension is greedy. It expects every question in the
interview to be about its dimension. So my setting the scene feedback would be like, This is a
terrible setting the scene question, but it was a really good building the timeline question,
and the interviewer didn't do anything wrong. And so this error mode is it expects too much
setting the scene. So, like, they asked good setting the scene questions, and then they moved
on to building the timeline, and the coach was critical that they asked building the timeline
questions. And so it looks like this is happening a lot. But what I did to dig into this is, in
my notebook, I have tools that allow me to look into each of these failures and to give and to
examine the reason the LLM gave for why this failed.

**[00:26:21](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1581s)**
This one actually is a code eval, so that's not quite right. But I could look into the output
of the code, and then I could look at the individual trace and my human labels. And again, I'm
doing this all in my notebook. I don't have screenshots of that, but I'm doing this all in my—
So I, like, basically as I dug into my data, as I had questions, I would go to ChatGPT and be
like, Okay, it looks like my evals gave this and I gave this. Can you create a cell block where
I can compare my human label to the eval label? And so then I just iterated with ChatGPT to
turn my notebook into a data analysis tool. And what I found here in this last column, it
actually was a problem with my human labels. Like, my eval was better than my human judgment.
And it's because to write a specific eval for this error mode, I had to get a lot

**[00:27:15](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1635s)**
clearer about what I was evaluating, and I, like, codified that in code, but I hadn't codified
it in my human label. Like rubric. And so this was a case where the code was better than I was.
And so, like, I had to change the way I did human labels, which I thought was really
interesting. This is so amazing on so many levels. The one thing that really impresses me is
you actually took on the mindset of a data scientist. Pretty good, like putting on the hat of,
okay, let me investigate the data. Let me look at it in different ways. Let me figure out
what's wrong and, like, really dig around with this sort of investigative approach. Yeah, and
this is, I think, where notebooks shine.

**[00:28:04](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1684s)**
Like, I wrote little pieces of code to, like, visualize things a little differently and to look
at different data. And in some ways it's throwaway code, but it's not because it's reusable for
every eval I work on. So, like, you'll see at the end, I'll share the notebook I use now. I
basically created, like, an eval investigation notebook that I use anytime I'm working on an
eval. So the other thing that came up here is, like, this middle one is actually the reason why
it failed so much is because I had a bug in one of my helper functions. And so that was also
interesting to see, like, how this data really exposes where, like, something you're doing may
not be working the way you expect. And then I did score these evals. So these are my— also in
my notebook, I basically asked ChatGPT to write me a Python function that would compare my
human labels to my evals.

**[00:28:56](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1736s)**
This was my very first run. This was before I did any sort of iterations to align it. It's
pretty hit or miss at this point. And I don't even— I can't even— this was so long ago enough,
I can't even tell you what this blank line was. I think it's that I had human labels. But I
don't have evals for yet, but I'm not totally sure. So up until this point, this was that
Sunday through Thursday. I did all of this in four days while taking the class. And I was
really surprised by how far I could get. And a lot of this was because I just leaned on ChatGPT
as a thought partner really heavily. Okay, so now a week in, I'm like, okay, I guess I'm a
notebook Python developer. Let's keep going. And here's what this did for me. I, oh, I think I
already talked through some of this. Sorry. Let's see if there's anything new.

**[00:29:47](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1787s)**
Really what this did for me is these two error cases were my most concerning, and it really
helped me size the problem. Like, how big of a problem is this? And that was really reassuring
because, like, I know when I can measure something, I can improve it. It helped me find bugs, I
already talked about that, and it helped me get further clarity on my rubric. That was this
setting the scene one. So if I go back to this question, I was like, okay, now I have a really
structured way to ask, are my changes having an impact? And literally for every model change,
prompt change, temperature change, chunking strategy change, or now I've gotten into workflow
changes, I have a fast feedback loop. I basically make the change, I run my evals on my dev set
that's based on production, and I run my evals on my dev set based on my change. And I
literally look at this table, and it's never like totally better or totally

**[00:30:40](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1840s)**
worse. It's always, these evals got a little better, this one got a little worse, and I have to
make a judgment call about, is this better for, and should I release it or not? And I cannot
emphasize this enough, like as someone who teaches fast feedback loops, this just felt so
magical. I was like, oh, I can actually measure a non-deterministic product. This is awesome.
Okay, so what does it look like today? Today I work out of VS Code. The reason why I switched
to VS Code is I am a heavy Claude Code user. Like, I treasure my Opus minutes with Claude Code
because it designs everything for me. I want to clarify this because for the non-engineers in
the room, I am not vibe coding with Claude Code. Like, I'm not letting Claude Code just produce

**[00:31:31](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1891s)**
a whole bunch of code that I don't look at. That terrifies me. I still have this philosophy: if
I'm going to execute the code, I better understand it. So I pair program with Claude Code. We
talk about what's the best way to do this, and how should I implement this, and I don't like
that pattern. What are the other patterns? And so that's how I get a lot of work done. And
sure, Claude Code might write most of my code, but it's really important to me that I
understand all of it, and we'll talk about why in just a second. But basically the way that I
work is, you can see here, I don't know if it's very visible, but like, I have the whole evals
directory in my project. I run experiments, so I have different directories for different
experiments that I'm running. I had Claude Code write my A/B test runner, where it's basically
running all my traces against what's in production versus my change.

**[00:32:22](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1942s)**
I keep track of—I have evals for cross dimensions, I have evals for individual dimensions. So
this is growing into a gnarly beast, but I love it. What you're seeing here on the right is my
notebook. This is my current notebook that I work out of. And actually this screenshot, this in
this notebook, is this little tool where I can actually select a transcript, and it shows me
what my helper functions extracted, and then what each of the evals returned. And so this is
like my magical— Diagnostic, like what went wrong with this trace tool, which the fact that I
can just do this all on a notebook still blows my mind. The level of joy that I have in this
talk keeps increasing exponentially as you keep talking. It's quite fascinating. And so the
thing that is really great here is, like, not only do you use notebooks

**[00:33:12](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1992s)**
for data analysis, you created your own widgets and little user interfaces in the notebooks,
which is quite an advanced thing, and a lot of people know you can do that. Okay, so I didn't
know I could do that. Claude Code did that for me. Like, here's what I'm good at. I'm really
good at describing what I want, right? It's, okay, I see this error in this trace, but you
didn't tell me the trace number. Like, how am I supposed to go investigate? And they're like,
Oh, let me add the trace number. I'm like, Okay, now I have the trace number, but I don't want
to go to Airtable to look it up. And I have a cache helper functions, and you let me look at
the cache, but just put it all in one place. So I just demand things from Claude Code, and we
work on it together. And actually, if there's anything you take away from this talk, it's that
you don't have to know how to do any of this because LLMs are really good guides. But I have
vibe coded too, and what I'll tell you is just make sure you understand

**[00:34:06](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2046s)**
what it does, because every time I give Claude Code a little bit of a longer leash, things go
horribly wrong. So, like, I am pair programming with Claude Code. Claude Code is not just
generating a bunch of code with me, for me. That's great, because I think a lot of people, they
try to eat too much. Like, they try to have the LLM, like, eval everything without looking at
the data. You have a sense of, okay, let me kind of work with AI to understand the problem
deeply, not let it just look at my traces and do my evals for me, which is, like, what a lot of
people try to do, and it doesn't work. Yeah, I think something about this class, like,
resonated with me so much at, like, my core that I just wanted to learn it really well. And I
think also it's why I didn't want to use the eval tool.

**[00:34:55](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2095s)**
Like, I figured if I rolled my own, I would know it inside and out. And even now, like, even on
the other side of this, I've been watching the eval videos from this second cohort, and I'm
still like, it just looks more complicated than what I have, and what I have is working, so I'm
going to stick with it. The other thing that's different today is my notebook has graduated. So
before, in my first notebook, all my eval code and my data analysis tools were in one notebook.
Now my evals are part of my, like, normal repo because, like, I run some of them as guardrails
in production. I run them on a percentage of traces. And so now my notebook is just a data
analysis tool, and it can execute my evals, but it's executing my production code.

**[00:35:46](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2146s)**
So they're no longer commingled. And so in my notebook, I have some tools that allow me—the
first thing it does is it allows me to run all my helper functions and cache them. So those are
my expensive calls. I can do that for my dev set once. And then because my dev set isn't
changing very often, the only time I ever have to rerun those is if I change a helper function,
and that's been huge. And then I can rerun specific evals. I can rerun all my evals right from
my notebook. I do my analysis and visualization right from my notebook. So this is a run I did
yesterday. This is how I'm currently doing on that general—suggested general question. You can
see I've gotten this error. It's almost non-existent. And actually, when it shows up, it's
showing up because there's some ambiguity. Like the participant starts by asking a specific

**[00:36:38](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2198s)**
question and then falls back to a general question. But literally having access to this data
and these visualizations has allowed me to iteratively, like, dramatically reduce the errors in
my interview coach. And then the notebook also has, like, diagnostic tools. Okay, what's going
on with this trace that failed? Can I go look at why it failed? Is it a problem with one of the
helper functions? Is it a problem with the eval itself? Is it a problem actually with the trace
and it's a real failure? And I can do all that right in the notebook. The other thing I can do
in the notebook, which I don't have screenshots of, is partly because one piece of it is
currently broken that I need to fix, but it can pull in my annotations and then compare my
annotations to my evals and then score any of my LLMs as judges.

**[00:37:29](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2249s)**
I just changed my annotation output, and so that part of the notebook is currently broken. I
need to fix it. But it's really nice having all of this in one place. And again, I just want to
say these notebooks are so well organized. They have sections, they have documentation, and
that's not just aesthetics. This actually helps when you're using AI. Okay, so I will say
Claude Code created this notebook for me. And because Claude Code created it and, like, I had
to work my way through understanding it, I would regularly update the Markdown because I just
didn't trust that since I— didn't write it, that I would remember it. So, like, a lot of the
documentation is for me because, like, I come back to the notebook and I'm like, which cells do
I have to run before I can run an eval, or what's going on with the cache?

**[00:38:17](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2297s)**
And yeah, I've learned, like, one of my biggest takeaways working with—I think I've been using
Claude Code for three weeks, maybe four weeks—and one of my favorite things about it is to be
like, okay, let's create a README file. Okay, what did you learn from this conversation? Let's
document that. Because everybody who codes knows, like, one of the hardest pieces is keeping
all that context in your head and getting back up to speed. So I'm using LLMs to help solve
that problem for me. Yeah, it's really powerful, and it's unique. It's a unique aspect of
notebooks that you can have this kind of in-context learning where you can have prose and code
interleaved in this way. I find that it really can really help language models, especially
since you're updating it with your understanding and knowledge. You're not just, like,

**[00:39:08](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2348s)**
letting it—you're actually, like, grooming this very carefully. Yeah, that's a great way to put
it, and I think that's really important to me. I gave this talk yesterday, and I realized
everybody thought I was just vibe coding, and I was like, oh, I need to distinguish this
because I don't want to send people off to just create a notebook. If I let Claude just create
this on its own, like, the data analysis would be wrong, especially if it was Sonnet. Like,
Sonnet is sloppy. And actually, Andrew Karpathy, in his Software 3.0 talk, had a really great
line that resonated with me, which was, I optimize for four-line diffs, not a thousand-line
diffs. And that, like, encapsulates perfectly how I work with Claude Code. Because I'm really
terrified of ending up with a product that I can't maintain myself.

**[00:39:55](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2395s)**
Okay, so the other thing that has changed, I now had Claude Code build me a custom annotation
tool. You can see here it follows everything you learned in this class. I got a progress bar at
the top. This is my trace. It's really nicely color coded and, like, visual for helping me
understand, like, what section I'm in. I've got an annotation box. I've got failure modes. I've
got next and back. Everything is key coded so I can do fast keyboard shortcuts. I actually have
about half a dozen custom annotation tools, and because sometimes I'm annotating the whole
trace, sometimes I'm annotating a single question. So I'm, like, loading a whole bunch of
questions into the tool. And just any time I'm working on an eval and, like, my annotation
needs change, I literally just have Claude Code. Like, I tell it, I like the interface from
this

**[00:40:44](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2444s)**
annotation tool, but now I have new input or a new output format. Just spin up another tool.
And it does it in two minutes. Like, it's just so fast. So these I vibe code. I can't even tell
you how this is implemented. I just test the inputs and the outputs and make sure that it's
working. And then here's the thing that's really exciting to me, is that I started this project
trying to create a teaching tool, and I was using it in my classes. And, like, my classes are
cohorts of 20 to 50 students. It's not high volume. If something went wrong, I would get an
email and I would just rerun it. But over the course of this project, I started talking to this
company, Vistaly. Vistaly is a software product for product discovery. They have a whole flow
for customer interviews and helping you synthesize your

**[00:41:33](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2493s)**
customer interviews and create opportunity solution trees. And actually, we're in the process
of rolling out the interview coach as a beta feature inside Vistaly. And what's crazy to me
about this, I'm going to tell you, two weeks ago I had never worked in a IDE. Two weeks ago, I
never had a dev environment and a prod environment. And suddenly, like, I have to make
production quality code. So for the last two weeks, I've been working nonstop, like learning
how to be a real software engineer. I've been working with Opus and O3 on, okay, walk me
through error handling, beat this up, like where is it going to fail? And I'm now pretty
confident that I have a pretty good production product. We are rolling out to beta customers
this week. We'll see how it goes, but I'm crossing my fingers that I've got a real AI app
that's doing pretty darn well.

**[00:42:23](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2543s)**
This is amazing. And as a product person, designer, kind of half-baked engineer, it feels
really good to release, like, a real product where I literally did every part. It's very
empowering, and I could not have done it without LLMs. This might be the best evaled product in
production that I have seen. Like, from now on, when someone asks me, hey, like, what's a good
example of a really good eval, like a product in production, this is it. There's actually,
there's one story that just makes me giggle when I think about it. Like, I'm so happy that I'm
at this point. So a few weeks ago, I ran two cohorts of continuous interviewing in July, which
means I was getting way more traces than I had ever had. And after week one, I started to see a
new error.

**[00:43:14](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2594s)**
And the error was excerpts would get repeated across dimensions. So, like, in the opening with
the story-based, or in setting the scene, the coach would be like, this is a great setting the
scene question. And then in building the timeline, it would be the exact same excerpt. And it
would be like, this is a terrible building the timeline question. That's really confusing for
students. And it's one of the first times I saw an error mode that, like, spanned LLM calls.
And so at first I was like, oh, how am I going to fix this? And my first idea was like, I need
a question classifier, and then I'll only send each dimension the questions that are relevant
to it. And I spent like a day and a half working on a question classifier, which sucks. Like,
it's so ambiguous and so hard, and I don't have lots of questions, and, like, it was just
getting gnarly. And I took a break, and I was at dinner.

**[00:44:01](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2641s)**
I was talking to my husband about it, and I was like, oh, what if I just sent any subsequent
call the list of excerpts that were already used and told it not to use them? Okay, I went from
having an error mode that showed up in 81% of transcripts to having an error mode that only
occurred in 3% of transcripts. And what was super fun about this is that I didn't even know how
to detect the error, because the excerpts weren't exactly the same. So first I had to figure
out, like, how do I write an eval that even detects this error? And then I had to figure out,
okay, this isn't a prompt change. This is actually a workflow change. So how do I A/B test a
workflow change? And then I had—and it all worked. And, like, I did it all in three days.
That's when I was like, okay, I feel like an AI engineer now.

**[00:44:50](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2690s)**
Oh, you are definitely an AI engineer. You are in the very center of AI engineer. There is
probably—you're like the example that we need to show everybody as an AI engineer, to be
honest. I really love that you're always measuring things before you do the improvement.
There's so few people out there who actually take the effort and the initiative to write the
automated evaluator, or whatever it is, make sure they have measured 81%, then implement the
fix, and then say 3%. I don't know. So much of this is because, like, I just teach this exact
same stuff in a different domain, right? Like, in discovery, we talk about start with an
outcome. What are you trying to achieve? If you don't know what that is and you can't measure
it, don't start changing things.

**[00:45:39](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2739s)**
So there were so many analogies. Like, even Campbell's hammering on, look at your data. My
equivalent of that is go talk to your customer, right? There's just so many analogies that I
think I was really had a strong mental model to layer all this stuff onto. This is a really
good segue into this question of what do you think the product manager and the engineer and
whatever, how will they work together? It's very impressive, like, what you've done, honestly.
Like, to synthesize this together, you've taken a really good mindset this whole thing. Do you
think it may collapse into? Could a single person going to be doing this going forward? Do you
have an idea how

**[00:46:28](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2788s)**
you might teach product managers this, for example? Will you teach them how to code a little
bit? Like, I'm just curious, like, what your thinking is on this. Yeah, I wish I had a good
answer. I've been really thinking hard about this. I'm a teacher by nature, and so I'm starting
to think about, okay, product teams are clearly going to have to do a lot of this. And if they
want it to be good, what does that look like? Who is doing what? And I have some, like,
half-baked ideas because I have been thinking about it a lot, but I don't have a clear picture
yet. One of my half-baked ideas is I just separated my eval code from my data analysis. And
part of the reason why I did that was, like, to not reuse code, to be able to reuse code. But
one of the benefits of that is that, like, now someone can dig in and do data analysis without
having to see the code.

**[00:47:20](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2840s)**
And this is really important to me because I want to create, like, 20 of these teaching tools.
I have seven different classes, and this is just one of them. And I, like, have so many ideas
for teaching tools, but I can't do this iterative work on a lot of tools personally myself. So,
like, I want to engage my instructors in helping with these. And so maybe I'm the engineer, but
the instructor does the analysis and the evolution. I don't know. And so one idea I have is
maybe notebooks can help because I think notebooks are really good at—you can obfuscate some of
the code, but still let people execute it from a notebook. They can get visualizations. I think
this is a new skill that we're all going to have to learn around, okay, I wanted to create an
interview coach. I had no idea how to do it on day one, but I just took a first step and I
tried

**[00:48:11](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2891s)**
something. And then I got stuck, and I learned how to use an LLM to get unstuck. And then I
followed that pattern, like, 4,000 times over the last four months. And I think it's this skill
of, like, how do you identify the smallest piece that you need to learn, and then how do you
work with the LLM to learn that, and then iterate from there? Because, like, yesterday I gave
this exact same talk, and someone was like, okay, if we were where you were four months ago,
how should we get started? And I was like, I just told you. I told you how I got started. And
so clearly there's, like, an ability there of, like, how do you be a self-directed learner with
support from an LLM? And I think we're going to have to learn how to do that even as a
cross-functional team, right? So, like, the product manager has to learn some bits, but then
the engineer needs to learn where—

**[00:49:00](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2940s)**
Yeah, you could write an eval for this, but maybe someone with domain expertise would write a
better eval for this. And what does that look like? One thing that really strikes me is your
level of agency is super high, and the amount of self-help you availed yourself of proactively
with an LLM is quite good. And I feel like a lot of people fail there. Yeah. Is that something
you could teach, or is it—how do you teach that? I don't know. I'm actually been thinking about
this. Just yesterday I started thinking about it a lot, because a lot of the questions I got
yesterday were around like, Yeah, but what did you say to ChatGPT? I'm like, Okay, forget
everything you know about prompt engineering. It doesn't matter. I literally said to
ChatGPT—I'm not joking, this is like where

**[00:49:51](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2991s)**
I started—I want to learn how to use a Jupyter notebook. I'm a total beginner. What do I do?
Oh, and I'm on a Mac. So I didn't even have a development environment set up on my Mac when I
started, right? Like, I was a total beginner. But the thing is, like, you can ask an LLM all
your dumb questions because it doesn't care. And, like, I remember when I was in college and I
took computer science classes, I would get stuck and it was so frustrating. I got to go find a
TA, or I got to go ask another stupid smart Stanford student that I'm going to be embarrassed
asking my stupid question to. And, like, I never did it. I just turned in homework that didn't
work because, like, I was too embarrassed to ask what I didn't understand. And so I was a
terrible programmer in college. I was great at CS theory, which is how I graduated, but, like,
I was really bad at programming because I didn't know how to get unstuck.

**[00:50:42](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3042s)**
Whereas, like, now LLMs, like, they don't—you can ask a really dumb question and they don't
care. So I just, I think when you're in a conversational flow, like when you're in the web app
of Claude AI or ChatGPT.com, like prompt engineering does not matter because you can iterate,
right? So you can just be like, here's my half-baked question, and then it comes back and
you're like, no, I don't understand a thing you said. And I literally will copy and paste a
line and be like, what do you mean by this? And so some of it is just patience to pick through
it and know that you can figure it out with enough time. I went through this past week. So
we're like at the 11th hour about to release the interview coach inside Vistaly, and I was
running through all my, like, integration tests, and one of my integration tests caught an
error in one of my step functions that was not caught.

**[00:51:33](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3093s)**
And it didn't catch the error. It just, the test failed, and there was an uncaught error. And I
was like, wow, I've been beating up my error handling. Like, how do I still have an uncaught
error? And it was because I didn't know that—this is going to get really technical for just a
second—I didn't know that, like, JSON path errors in a step function are not catchable and
they're not retryable. Like, they just fail the step function. And I had written my sub step
functions to return an error in the payload. And, like, you can't do that. Like, it has to
throw an exception for the parent step function to call it. So I realized, like, at the 11th
hour, all of my error handling between my step function to step function calls were wrong.
Okay, if you didn't understand all of that, any of that, all you have to know is that this was
a very embarrassing last-minute thing that made me realize my really reliable app was not very
reliable.

**[00:52:24](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3144s)**
And this was, like, last Tuesday. And I panicked. And then I was like, okay, you know how to do
this. Just go talk to Claude and ChatGPT. And I, like, gave Opus an O3, like— Here's my testing
pattern. What are the existing patterns? What are the best practices? How do I fix it? And we
talked through three or four different error handling patterns between step functions. And I
was like, tell me about the pros and cons of each, and we picked one. And then I was like,
okay, now look at my code base and how many changes do we have to make, and how do we make a
project plan? And I do that in planning mode. Like, I don't want Claude touching my code while
we're debating how to do something. And then we write a project plan that's really detailed
that I've reviewed, and then we literally step by step implement it. And between Wednesday and
Friday, I re-architected all of the error handling in the interview coach and released it on
Monday morning.

**[00:53:18](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3198s)**
And then ChatGPT-5 came out, and I literally started asking ChatGPT-5, beat up my error
handling, and it's like, wow, you have really robust error handling. And I was like, yes. Just
so people can play with this, like the Vistaly thing, so that is, it's available right now. Can
you go sign up for this service and— Yeah. Okay, so part of the reason why I partnered with
Vistaly is that part of the story I didn't share is that when I launched this tool in my
course, I was expecting students to submit their practice interviews. And they did that, but
they also started submitting their real customer interviews. And this is scary because, like, I
just put this stuff in Airtable. Like, I'm not really—I'm certainly not SOC 2 compliant.

**[00:54:07](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3247s)**
And, like, people were sending sensitive customer data to me. And I was like, oh, I don't know
how to handle that. And I started to look into it, and I was like, yep, not doing that. And so
what we get with the partnership with Vistaly is this is a tool where product teams are already
storing their customer interviews. They are SOC 2 compliant. They follow all the, like, data
management laws. And so, unfortunately, there's only two ways to try this right now. One is
through our continuous, excuse me, our continuous interviewing course or through Vistaly. So if
you're looking for a product discovery tool, I do strongly recommend Vistaly. But I am starting
to think through what's a light version of the coach that I can make freely available. And
actually, it's based on those very two evals.

**[00:54:56](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3296s)**
Can I at least give people feedback for free on, did they ask leading questions and general
questions? So I'll have more that's, like, publicly available to, like, at least play with
probably in the next couple weeks. That's great. And what's the best way for people to follow
you or keep up with what you're doing? What do you recommend that people do? Yeah, so I blog at
producttalk.org. I'm on LinkedIn and X. LinkedIn lately has been my primary social network, but
I do check in on X every day. That's probably the best places. And then I'll be in the Discord,
so if there's lots of questions, I'm happy—if we have time, I'm happy to take questions now,
and I'm also happy to take questions in the Discord. Okay, yeah, we could take some questions
now. Do you have a little bit of time, Teresa?

**[00:55:43](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3343s)**
Yeah. Okay. Robert has a good question. Are you thinking about capturing annotations from end
users directly? Is that something that you've thought about, or do you feel like, I am the PM,
or I'm, like, building this product and I want to control all the annotation? Yeah, Robert, we
actually had a Twitter discussion about this, and I forgot I was going to tackle this. One of
the things I'm really excited about is, what's the customer feedback loop in all of this?
Because that's my jam. And there's a few places of things in the class that I learned that I
really want to experiment with. So one is— You guys learn to generate synthetic data by
defining, like, dimensions. I actually think those dimensions should come from customer needs
and customer pain points. So, like, the recipe bot, like if you've talked to people about how
they plan their meals and you know what their use cases are, like it gives you way better input

**[00:56:34](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3394s)**
for what those dimensions should be and, like, what types of variations you're going to have
ahead of time. That's a really clear area where I can see a connection between traditional
discovery work and, like, the very beginning phases of, like, how do we generate representative
synthetic data. Another area is, like, almost every AI product has, like, a thumbs up, thumbs
down, was this helpful? And, like, I did build that into the interview coach in Vistaly. I'm
still trying to figure out how to do it in our course because they get it by email. But I would
love it if we could find—I want to really experiment with UX patterns of, like, how can we get
the customer to communicate more granular error feedback? So if they're giving me feedback on
the whole response, this was helpful or not, that's great. It, like, it tells me to go
investigate that trace.

**[00:57:26](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3446s)**
If they give me a verbatim of why, that's even more helpful. But I would love to get to the
point of, no, this excerpt, the tip on this excerpt is wrong. Or—and just, like, what—like,
ultimately our product works if it works for the customer. And so as a product manager, you can
be a proxy for that. But is there a way—I'm always looking for, like, how do we get the
customer closer to the problem? I don't, Robert, I don't have answers for you yet. Like, I've
been so heads down building, getting ready for this Vistaly beta that I've just been an
engineer. But I'm going to put my product management, product discovery hat back on and start
to run some of those experiments too. You have some background in computer science education.
You did some JavaScript development early in your career.

**[00:58:18](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3498s)**
Do you think you would have been just as successful without that? Do people looking at this
talk, should they feel like they can do what you did without that education? Yeah. Okay, so for
like decades, there's been this debate in the product management world about should product
managers learn how to code. And I'm really glad I learned how to code in college. I a little
bit, even as a kid, I coded in BASIC on an Apple IIe, but like I really learned how to code in
college. I, because one of the skills I got from learning how to code is this like problem
solving, debugging, deconstructing like a big problem into smaller parts, and then also like
this attention to detail that I don't think you get in anything else.

**[00:59:07](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3547s)**
And so I think there's skills you learn from coding that transfer to other domains, and I think
coding is one of the best ways to learn those skills. So there's part of me that like
everybody, I think maybe coding, even with vibe coding being a thing, might be a proficiency
like literacy. I just feel like it teaches such good problem-solving skills. Could I have done
this if I didn't have that background? Okay, so my undergraduate was symbolic systems. So for
people that are familiar with this at Stanford, it's a cross-disciplinary, it's a
multidisciplinary program. It focuses on how humans and machines process information. It's also
what's happening in the world with generative AI is so cool in the context of symbolic systems.
And I had to take classes from computer science. The analytical side of linguistics, so like
the underlying structure of language,

**[01:00:03](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3603s)**
analytical philosophy, so like mind-brain philosophy, and then cognitive psychology. So it's
really like, how do we understand the information processing from four different domains? What
I really took away from that program was critical thinking and problem solving. And like,
ideally this is what every program is teaching, but I think when you see how four different
domains solve very similar problems, you start to see this pattern. For me anyway, I started to
see this pattern that I would call a more like problem-solving critical thinking pattern. And
so I think I could do this. I think that experience helped me be good at these types of things.
Like I think what I was good at in this whole process was just like the critical thinking part
of it. Is coding the only way to learn critical thinking?

**[01:00:54](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3654s)**
I'm sure there's plenty of people listening right now that are good critical thinkers and good
problem solvers and have never written a line of code. But I think it's a really good way to
learn it. And do you think, and this may be hard to predict, and I've asked this before, but I
just want to revisit it. If you were to teach, try to teach this to product managers, is your
sense, do you maybe introduce some code or teach them how to code, since you do think it's one
of the best, you mentioned AI is like the best thing, or would you try to go at it a different
way or you haven't decided yet? This is actually a genuinely hard problem for me. I'm trying to
decide what I can uniquely offer. So like the AI race right now is insane. Like Aman Khan is
doing really cool work in his last cohort of his Maven class. He had 30 people using, like
non-technical people using Cursor, which is awesome,

**[01:01:48](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3708s)**
right? Is that the right path? I don't know. I think right now, is it going to be the right
path in the long run? But I'm working out of a notebook, and I love notebooks, but notebooks
are pretty technical. Am I really going to teach all my instructors how to set up a development
environment on their Mac? And if they're on Windows, I can't help them. Like, there's some real
challenges with the way that I'm working for transferring it to other people. And, like, in
some ways, I wish I was still on a cross-functional team because, like, I kind of want to
partner with the engineer and play with some of these ideas and what do those handoffs look
like. One thing I am going to do, I'll give you guys all a sneak peek. I'm in the process—okay,
I'm in the process of recording some podcast episodes. I'm going to be launching a new podcast
in September, and I'm interviewing cross-functional product teams about how they're building
their AI products.

**[01:02:40](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3760s)**
So it's not the, like, How I AI, Clairvo podcast and how people are using AI in their
day-to-day workflows. It's, here's the story—it's what I did today. Here's the story of an AI
product. Here's how it came to fruition. And what I'm really interested in covering in those
stories is who did what and how do we collaborate? Because I think this is a really open
question, and I'm not sure what to teach yet. But I do want to help. Like, I do, as an
educator, I will be doing something in this space. I'm just still figuring out what the right
something is. I would love to see a visual map of how you went about annotation to the app that
you're building. Specifically, there's probably a lot of micro decisions that you had to make
along the way, and so could you unravel some of those? Were they difficult to make? How did you
know whether something was, like, a micro

**[01:03:32](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3812s)**
decision or something that, like, required more, like you learning something new or figuring
out something new? Yeah, I can talk about some of the kind of key decision points I made and
how they came about, and maybe that'll illustrate this a little bit. Yeah. Like, one of the big
ones was I started—the interview coach was one prompt. Like it was this monster prompt. And the
problem I saw with that was that in the coaching responses, like one of my biggest failure
modes was the coach would give feedback on one dimension, but use criteria from a different
dimension. So it was confusing the rules across dimensions. And I think like around that time,
I learned about workflows, and I was like, oh, maybe this needs to be a series of LLM calls.
And so I broke it up into four LLM calls.

**[01:04:24](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3864s)**
But then that introduced some new problems, like now, like setting this, it's that too much
setting the scene. Like setting the scene doesn't know about building the timeline, and it's
literally evaluating the entire interview based on setting the scene. And so like that change
had a really big impact. Like my overall quality went up when I split up my LLM calls, but my,
it introduced new error modes. And this is something that like I think is probably really
common. There isn't a magical change that makes everything better. It's like a change can
improve some things and then maybe introduce some new errors. And I then started, well, I had
four LLM calls, then I really got stuck on, I even asked this in the Discord, do I do evals for
each LLM call or do I do

**[01:05:15](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3915s)**
evals for the whole response? And I actually started by doing them one dimension at a time, and
it got really overwhelming because I was just like, I'm going to be doing evals for the rest of
my life. And I realized like by doing it one dimension at a time, I was like finding a lot of
errors, but a lot of them weren't critical errors. And so then I was like, oh, maybe I actually
should do evals on the whole trace. I should do analysis annotations on the whole trace,
because then I can still find dimension-specific errors, but I'm prioritizing all of them
against each other. And that actually made a really big difference. And I still do individual
dimension annotations when I'm working on an eval that's specific to that dimension. But I'm
doing my error analysis and, like, failure mode prioritization on the whole trace, because
that's, like, what's

**[01:06:05](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3965s)**
impacting my customer. And that was a pattern I really struggled with. What's the right way to
do this? And I've tried both. I've spent a ton of time annotating things I didn't need to
annotate as a result. And I just, I think, for me, my conclusion is I should start with the
customer experience. The customer gets the full trace. I'm going to look at the whole trace,
and it helps me prioritize a little bit better. So that was a key decision point. Choosing to
move from Airtable interfaces to my own annotation tool. Like, I know in class we learned build
your own annotation tool, and I was like, I did, in Airtable. But, like, really building my own
annotation tool, like I still, I'll be annotating, I'll be like four traces in, and I'll be
like, like even this morning I was annotating actually right before this, and I was

**[01:06:55](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=4015s)**
like, why didn't I add, like, little pills above my failure mode so, like, in this set, once
I've used an error mode, it should just be a pill so I don't have to go back and remember what
the stupid failure mode was. So, like, I'm constantly thinking of ways to make annotating
faster. And I literally just stop what I'm doing and I'm like, Claude, can you add this to this
annotation tool? And I'm forcing myself to do that because, like you learn in this class, like
annotation is so important, and if it's not effortless and fast, like you're just not going to
do enough of it. And my annotations are hard. Like that coach response is a lot of text. So,
like, my annotations are slow. When I'm doing full trace annotations, I have other annotations
that, like—like when I was doing my question classifier, I actually did my annotations with
Claude. I gave Claude a list of questions, and I just said, Ask me, like, Claude Code.

**[01:07:47](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=4067s)**
I said, Just show me one at a time and let me just tell you the failure mode. And we just ran
through like a hundred traces in like less than 10 minutes. And I was like, Whoa, that was a
cool annotation interface that I just used my LLM for. So I think, like, always just thinking
about what's the right tool for the moment. And then I think the other big thing I've learned
is just—it sounds so obvious—but take breaks, step away. Because I've definitely had moments
where, like, I'm banging my head at something, and I go and have a meal or I go for a walk and
I come back and just a way simpler solution comes to mind. And that's like a general
problem-solving tip, but even though I know it, I forget it often. I'm like, I literally am
having more fun than I think I've had in my entire career, and I'm obsessed right now, and I
code all day long.

**[01:08:39](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=4119s)**
My husband jokes that I broke up with him for Claude. And so, like, I really have to rein
in—like, I have to, I now set a timer on my watch to remind me, just get up and step away,
because it's just so fun. It feels like the '90s. It feels like the beginning of the internet,
and everybody's, like, geeking out and trying to learn this stuff, and everybody's sharing with
each other. It just, it feels really similar and really fun. Yeah, the amount you're having fun
is definitely coming through the screen. I can definitely feel it all the way over here. Level
of energy, really good. We can keep going on forever, but let's wrap things up. Yeah, and then
for folks, like in the class, if you guys are on a cross-functional product team and you're
building a product, like an AI

**[01:09:30](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=4170s)**
product, reach out, because I'm definitely looking for teams to interview. And you don't have
to be an expert. Partly what I want to show with this podcast is how we're all figuring it out
together, right? I'm not—I've done the guru thing. I'm over it. Now I'm just into the let's be
a community and share with each other. So that's my goal. It's just how do we share more
stories. That's great. That's really good humility. I would say I'm really impressed. I would
still call you a guru, like at this point. This is awesome. Yeah, thank you so much. Thank you
both. I really enjoyed this class and clearly learned a lot. Oh, definitely. You definitely
learned a lot. This is, yeah, A plus. Thank you so much. Thanks.
