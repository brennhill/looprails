# Read the Failures

*The shortest path to an eval worth keeping usually passes through an uncomfortable transcript.*

Before building a rubric, open twenty real traces.

This advice is almost offensively simple. Teams avoid it with great creativity. They schedule a metric-design workshop. They ask a model to propose a taxonomy. They import a benchmark. They debate whether “coherence” should be weighted 15 or 20 percent. One day, someone opens the actual conversations and discovers that the system is repeatedly using last year's cancellation policy.

The taxonomy was elegant. The product was wrong.

Error analysis is the first serious act of evaluation. It discovers what “good” must mean in this system, for these users, under current conditions [FOUND-02].

In a recorded walkthrough of a property-management assistant, one reply was factually tidy and still bad for the product. The assistant correctly said that an apartment was unavailable, then stopped. The product needed it to continue helping the prospective renter. In another trace, the assistant offered a virtual tour the service could not provide. A generic factuality score could miss the first failure; a generic helpfulness score might forgive the second. The domain owner could see both because she knew what the product was supposed to do [MEDIA-01].

That is why error analysis begins with a person who knows the work, not a model guessing what the business probably meant.

## Name the thing being reviewed

A queue can hold one answer, one conversational turn, one model-generation span, a whole conversation, a tool trace, or a task plus its final state. Pick the unit before annotation. Otherwise one reviewer may grade a sentence while another grades whether the user's problem was resolved. Both will appear to have filled in the same column. They have not.

A published Langfuse walkthrough ran into this immediately. The trace-level input and output were empty; the readable exchange lived inside a generation observation. The analyst had to decide what the label would attach to before the queue could work [WORKED-01]. Choosing the label target will not win the meeting, but it prevents nonsense later.

Record the **review unit** and the exact **target ID**. Show enough surrounding context to interpret the target, but do not change the target halfway through the review. Think of it as choosing the camera's focus: the room may remain visible, but everyone should agree whether the photograph is of the chair or the person sitting in it.

## Start with open notes

If the team begins with a fixed list of labels, reviewers will fit failures into the list. A fixed list earns its keep once the categories are stable. Early on it hides novelty.

For the first pass, give reviewers an open note field and a few factual prompts:

- What was the user trying to accomplish?
- What happened?
- Where did the run first depart from a good path?
- What evidence shows the failure?
- How harmful or costly was it?
- Could a user recover?
- What system component appears involved?
- What would a correct outcome look like?

“First departure” matters. The final answer may contain five problems caused by one earlier error. If retrieval selected the wrong policy, the agent may then reason correctly, call the wrong tool correctly, and explain the wrong outcome beautifully. Counting all five symptoms equally leads to five prompt patches instead of one retrieval fix.

Write observations, not diagnoses, until the evidence supports the diagnosis.

Bad note:

> Model reasoning failure.

Better note:

> The agent selected the 2025 cancellation article even though the customer account was governed by the 2026 policy. It then calculated the fee from the selected article. The trace does not show whether retrieval omitted the current policy or the agent ignored it.

The better note separates what happened from what remains unknown.

## Sample for learning, not comfort

A purely random sample estimates ordinary performance. It may not teach you much about rare, expensive failures. A queue containing only escalations teaches you about hard cases but exaggerates their frequency.

Use a mixed sample:

- a random slice of ordinary traffic;
- known failures and user complaints;
- high-consequence or irreversible actions;
- low-confidence or high-latency runs;
- new segments, languages, tools, or workflow variants;
- a few apparent successes, because silent failures often dress well.

Keep the strata. Later you may want to estimate prevalence, and a deliberately enriched failure sample cannot be treated as representative traffic. “Eight of twenty reviewed traces failed” means little if twelve were selected because users complained.

Call these a **discovery sample** and a **measurement sample**.

The discovery sample asks, “What can go wrong?”

The measurement sample asks, “How often does it go wrong?”

Use the first to build categories and tasks. Use the second to estimate rates. Mix them and the denominator stops meaning what everyone thinks it means.

A discovery sample does not end at a magic trace count. Keep adding varied traces until new examples stop changing the taxonomy or the next product action. Qualitative researchers call this **theoretical saturation**. It is a stopping rule for learning categories, not evidence that you have measured their prevalence precisely [MEDIA-01].

Saturation can also lie if the sample is narrow. Fifty nearly identical support chats may stop producing surprises while an entire tool path remains unseen. Track the strata you have covered, the last trace that changed a category, and the cases that still do not fit. The twenty-trace session below is a beginning, not a graduation ceremony.

## Let categories emerge

After two reviewers annotate ten or twenty traces, gather the notes and cluster them. Useful categories describe a failure at a level where the team can act.

Too broad:

- bad answer;
- hallucination;
- tool issue.

Too narrow:

- omitted the Tuesday baggage exception for route 441 on a gold account.

Actionable:

- selected an outdated policy source;
- claimed an action succeeded without confirming state;
- omitted a required eligibility check;
- satisfied the user's request by violating policy;
- cited a source that does not support the claim;
- stopped after a tool timeout without checking whether the side effect occurred;
- asked for information already available in context;
- escalated a routine case;
- failed to escalate a high-risk case.

The narrow event becomes an example under an actionable category. The broad label becomes a parent if it still helps communication.

A practical taxonomy has three views:

1. **User outcome:** what went wrong for the user?
2. **Evidence:** how do we know?
3. **Likely intervention:** which part of the system could change?

Do not collapse these into one field. “Retrieval failure” is an intervention hypothesis, not a user outcome. “Incorrect cancellation fee” is an outcome, not a root cause. The distinction keeps error analysis from turning into a blame generator.

Once the open notes are concrete, a model can propose clusters and category names. Let it do the clerical lifting after a domain expert has looked at the traces. Then have the expert merge, split, rename, and reject its suggestions. The model has pattern recognition; the product owner has the awkward facts about what the product actually promises [MEDIA-01].

In the Dad Tech Support walkthrough, the model grouped failure to disclose identity with actively impersonating the user's child. A person split them because one was an omission and the other was deceptive behavior. They implied different product decisions and different fixes [WORKED-01]. A tidy cluster is not automatically a useful category.

Automated analysis can still be a formidable second reader. In a later comparison, six systems examined the same 100 apartment-leasing traces after the human annotations were hidden. The best-performing system in that study recovered 34 of the 39 human-labeled failures, and every system found valid problems the original reviewers had missed [AUTO-01]. Yet all six repeatedly missed product rules that were not visible in the trace itself, such as required handoffs and channel-specific formatting. Let the machine search the haystack. Do not assume it knows what your organization considers a needle.

Keep a category called **other / not yet classified**. Treat it as a smoke alarm for a taxonomy that has stopped learning. If cases collect there—or reviewers keep forcing odd cases into the nearest available box—the next job is to revise the categories, not scold the reviewers for insufficient enthusiasm.

## Disagreement is a finding

When reviewers disagree, the instinct is to average their labels and continue. Stop and inspect.

Disagreement can mean:

- the rubric is vague;
- the case lacks enough context;
- qualified reviewers hold different defensible standards;
- one reviewer missed evidence;
- the product policy is genuinely ambiguous;
- the category boundary is wrong;
- the outcome contains a judgment the product has not settled.

A 2026 CHI study found the same productive mismatch in scholarly question answering. Two subject-matter experts and an NLP developer open-coded 68 question-answer pairs and produced 49 distinct codes: 20 shared, 14 found only by the developer, and 15 found only by the experts. The team consolidated those views into an error schema, then refined it with ten additional scientists and 120 questions [EXPERT-01]. This small, single-system study does not supply a universal ratio. It shows why different qualified reviewers should be treated as complementary sensors, not noisy copies of one another.

Nova Escola's production-evals story is unusually instructive. The team began rubric work before sufficient error analysis. Two annotators reportedly agreed less often than chance. Pedagogical experts then rewrote the criteria, and the team eventually ran daily evals over a sample of production traffic [ORG-03]. The failure was not that the annotators needed a sterner meeting. The rubric did not yet encode the domain.

HealthBench builds disagreement into the benchmark through consensus variants and comparisons with physician judgments [HEALTH-01] [HEALTH-04]. Experts need not agree on every case. The evaluation system does need to notice when they disagree.

For consequential criteria, establish an adjudication process:

1. Two people label independently.
2. They compare evidence, not just labels.
3. A named domain owner resolves policy or standard questions.
4. The team updates the rubric when the disagreement exposed ambiguity.
5. The changed rubric triggers re-review of affected cases.

Here criteria drift is doing its job. Grading reveals what the team had not specified, and the criteria improve [JUDGE-02].

## Read the trace, then inspect the state

Agent traces invite narrative bias. Once you read a plausible chain of reasoning, later actions can feel inevitable. Start with the outcome and evidence when possible.

For a tool-using workflow:

1. Read the task and expected constraints.
2. Inspect final environment state.
3. Inspect tool calls and results.
4. Read the conversation.
5. Only then consider any model-generated reasoning summary available for debugging.

This order keeps the agent's explanation from anchoring the reviewer. The model may say it changed the reservation after receiving a timeout. The environment may show that the change committed. Or did not. Or committed twice. The explanation is one artifact among several.

τ-bench's evaluator architecture makes this separation explicit by combining state, action, communication, and natural-language checks [TAU-03]. A product trace viewer should do the same visually. Put the evidence beside the claim.

## Separate severity from frequency

A failure taxonomy becomes a roadmap when each category has at least four numbers:

- observed count in the reviewed sample;
- estimated prevalence in representative traffic;
- consequence or severity;
- estimated tractability.

The most frequent failure does not automatically go first. A rare unauthorized refund may outrank a common redundant question. A frequent wording issue may be easy and worth fixing while a deeper retrieval problem is being designed. The arithmetic will not crown a winner; it puts the tradeoff on the table.

A simple priority estimate can help:

`priority = prevalence × consequence × exposure × tractability`

Do not worship the arithmetic. The numbers are ordinal judgments, not natural constants. The equation forces the conversation: is this common, costly, widely exposed, and realistically fixable?

Keep **must-not-fail** cases outside the weighted score. A system should not be able to compensate for one dangerous medical recommendation by writing nine charming greetings. Averages are sociable like that.

## The twenty-trace session

Run the first session in ninety minutes.

### Before

- Choose twenty traces using the mixed sampling plan.
- Redact or restrict sensitive data.
- Invite an engineer, product owner, and domain expert.
- Prepare a viewer showing task, transcript, tool calls, state, latency, cost, and user feedback.
- Create an annotation sheet with open notes.

### During

For the first five traces, review together. Agree on what counts as evidence. Do not agree on a taxonomy yet.

For the next ten, review independently or in pairs.

For the final five, test emerging categories. Add new ones freely.

End by selecting three failures worth turning into eval cases. Choose one common, one consequential, and one confusing.

### After

- Preserve raw notes.
- Create the first taxonomy version.
- Record disagreements and unresolved policy questions.
- Assign owners to the three selected cases.
- Schedule the next sample before people leave.

The calendar invite is the hinge. One review produces a document. A recurring review produces a loop.

## Beware the polished success

Include runs that received no complaint. Many AI failures are not reported because users cannot tell that a claim is unsupported or an action failed silently.

DeepResearch Bench catches the same problem. A report can score well on readability while its citations fail to support material claims [DRB-01]. If reviewers sample only obviously poor prose, they miss the dangerous quadrant: persuasive and wrong.

Likewise, a patch can pass visible tests while violating unstated behavior. A health answer can sound measured while omitting urgency. A service agent can announce success while the database remains unchanged.

The eval practitioner develops a mild, healthy suspicion of sentences that begin, “Great news!” Call it evidence hygiene, with a small side effect of cynicism.

## Field move

Do Exercise 1: select twenty traces from one workflow and annotate them with Template 3. Include random traffic, complaints, risk cases, new segments, and apparent successes. Do not build a model judge yet; first learn what you would ask it to judge.
