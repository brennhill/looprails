# Worked Eval Examples: A Comparative Review

**Status:** Research note for *Measure Twice, Prompt Once*  
**Reviewed:** 2026-09-01  
**Question:** Which public examples show enough of the work to test the book's trace → taxonomy → grader → change loop?

This review uses a fairly rude admission test. A source should expose real or representative cases, explain how people labeled or analyzed them, show what the analysis changed, and state enough limitations that a reader can tell evidence from sales copy. A tool tutorial with a cheerful screenshot does not qualify merely because the screenshot contains a number.

The stable IDs below are maintained in [`../book/codex.md`](../book/codex.md).

## Comparison

| Source | Material and setting | Human work | Automated work | What it genuinely shows | What remains missing |
|---|---|---|---|---|---|
| Lenny's Podcast property-leasing walkthrough [MEDIA-01] | Anonymized production conversations from a leasing assistant | A domain owner reads traces, records open observations, checks the product contract, and edits the taxonomy | A model performs axial coding after the human pass; later, narrow judges operationalize selected criteria | The complete logic of human-first error discovery in a recognizable product workflow | No downloadable traces, grader code, calibrated before/after result, or independent replication |
| Automated-eval comparison [AUTO-01] | The same 100 apartment-leasing traces, including 39 human-labeled failures | Domain experts establish the reference failures and product-context categories | Six systems independently analyze the traces; the best recovered 34 of 39 known failures, and every system found valid issues the original review missed | Automated analysts can be useful second readers, but all consistently miss some rules that are not visible in the trace itself | One dataset, small denominators, overlapping practitioner circle, no vendor ranking, and no redistributable customer data |
| Langfuse error-analysis walkthrough [WORKED-01] | 505 traces from a Dad Tech Support chatbot; a 100-trace queue is constructed across six strata | The analyst chooses the review unit, open-codes examples, edits clusters, and maps categories to fixes, judges, or monitoring | A model proposes clusters and category descriptions | An unusually concrete, reproducible walkthrough of queue construction, open coding, and human correction of model-made categories | The published category counts are explicitly illustrative and based on 19 labeled traces; no before/after product result; vendor-authored |
| Expert schema for scholarly QA [EXPERT-01] | 68 author-written questions in development, followed by 120 questions from ten additional scientists | Domain experts and an NLP developer open-code feedback, reconcile views, and refine a structured error inventory | A retrieval-augmented QA system supplies the outputs being evaluated | Experts and system builders notice overlapping but also distinct error types; an open pass followed by a structured pass can reveal problems missed on first inspection | Small validation group, science and engineering only, one system, and no production deployment outcome |
| TRAIL [TRACE-01] | 148 human-annotated agent traces containing 1,987 OpenTelemetry spans and 841 labeled errors | Experienced annotators localize and categorize errors; industry researchers review annotations | Models must identify both error category and location in long traces | Long, multi-step trace diagnosis is a different and much harder automation problem: the best tested model reached 11 percent joint category-and-location accuracy | Research benchmark rather than a product improvement cycle; category imbalance; gated data with reuse restrictions |
| OpenAI evaluation-flywheel cookbook [OPENAI-04] | A worked implementation using the apartment-leasing example | Human review precedes taxonomy and grader construction | Dataset tooling, model-assisted coding, graders, optimization, and synthetic expansion | A practical implementation companion for moving from traces to graders | It is not independent corroboration of the underlying case; some displayed category rates are hypothetical examples |
| Nova Escola [ORG-03] | Production education assistant at substantial reported traffic | Pedagogical experts rewrite criteria after annotators disagree badly | Daily scoring on sampled production traffic after the rubric is repaired | Rubric-first annotation can fail because the domain standard has not yet been encoded | No public trace set, grader implementation, or controlled before/after product outcome |
| Lyft support-agent platform [ORG-10] | Production support agents with per-turn tracing, staged rollout, datasets, judges, sampling, and dashboards | Product teams add agent-specific metrics and review production traces | Shared judge patterns, sampled online evaluation, and operational alerts | A concrete organizational architecture for turning traces into reusable datasets and online monitoring | Company/vendor report; no raw traces, calibration matrix, or attributable product-effect estimate |
| Anthropic agent-eval guidance [ANTH-01] | Broad guide with examples from Descript, Bolt, Claude Code, and research benchmarks | Domain teams define tasks and inspect transcripts | Executable checks, judges, and harnesses run repeated evaluations | A strong map of the territory and useful examples of layered grading | It is guidance rather than one end-to-end, auditable case study |

## The four most useful comparisons

### 1. The automated-eval comparison is the closest controlled sequel

Saha and Husain gave the same 100 leasing traces to six automated analysis systems after masking the human annotations [AUTO-01]. The strongest system on that dataset recovered 34 of the 39 known failures. The systems also found 17–20 valid issues the original human review had missed.

That sounds like an argument for handing the job to a model, right up to the awkward bit: every system repeatedly missed failures that required product context absent from the trace. The assistants did not know that Markdown was unacceptable in SMS, what good objection handling required, or when a handoff should occur. None interviewed the authors to fill the gap.

The useful conclusion is not “human good, model bad” or its equally tedious mirror image. A person who knows the product should establish and revise the local contract. An automated analyst can then search broadly, challenge the first taxonomy, and point back to evidence. Neither gets to declare itself complete.

### 2. The scholarly-QA study is the strongest independent qualitative check

Martin-Boyle and colleagues asked two domain experts and an NLP developer to open-code feedback on 68 scholarly QA pairs [EXPERT-01]. They produced 49 unique open codes: 20 shared, 14 found only by the developer, and 15 found only by the experts. The team then consolidated these into 20 patterns across seven categories and tested a structured inventory with ten more scientists and 120 questions. The second phase exposed further hallucination subtypes and helped reviewers notice errors they had initially overlooked.

This does not produce a universal ratio of “expert errors” to “developer errors.” It demonstrates a more useful point: evaluator perspective changes the taxonomy. Open review surfaces local language; structured review makes the resulting standard reusable; disagreement tells the team where its picture is incomplete.

### 3. The Langfuse guide is the best nuts-and-bolts walkthrough

The Dad Tech Support example begins with a mundane problem that ruins many annotation projects: the top-level trace input and output were empty, while the readable exchange lived inside a generation observation [WORKED-01]. The analyst had to choose whether the object under review was a generation, a turn, a trace, or a session before labels could mean anything.

The guide also shows a model clustering `identity_not_disclosed` with active `impersonates_child` behavior. Human review splits them because one is an omission and the other is a deceptive act; they call for different fixes. That is precisely where model-assisted clerical work is helpful and model-owned product judgment is not.

The guide's category table is based on 19 labeled traces and is described as illustrative. It is a process example, not a prevalence study.

### 4. TRAIL is the necessary counterexample

TRAIL asks models to find both the type and exact location of errors in long agent trajectories [TRACE-01]. Its 148 traces contain 1,987 spans and 841 errors. Among the tested models, the best joint category-and-location accuracy was 11 percent.

That result does not contradict the much higher recall in the apartment-conversation study. The tasks differ. One asks for error discovery in fairly short customer conversations, scored against a product taxonomy. The other asks for precise diagnosis within long, multi-step agent traces. “AI can analyze traces” is therefore too baggy to be useful. Say which traces, which unit, which labels, which context, and what counts as correct.

## Shared pattern

Across the strongest sources, the workable loop looks like this:

1. Choose the review unit and make the surrounding evidence visible.
2. Let qualified people write concrete observations before imposing a fixed taxonomy.
3. Use a model to propose clusters, surface missed cases, and retrieve similar examples.
4. Require evidence links and human decisions for merges, splits, and product-policy claims.
5. Turn stable categories into narrow tasks and graders.
6. Measure on a representative sample that is separate from the failure-enriched discovery queue.
7. Preserve disagreement and novel cases so the taxonomy can change.

The public literature still lacks the ideal specimen: a redistributable production trace set with expert annotations, grader code and calibration, a documented intervention, before/after user outcomes, and several maintenance cycles. The absence matters. Many published examples show one or two links in the chain, then skip from “we built evals” to “the system improved” with the middle wearing an invisibility cloak.

Appendix E supplies a transparent fictional specimen instead. ParcelPath's counts and outcomes are simulated and support no empirical claim. Its companion dataset, annotated traces, calibration labels, run outputs, grader, and maintenance log are executable editorial artifacts designed to make every link inspectable.

## Changes carried into the book

- Chapter 2 now makes the annotation unit explicit before open coding.
- Chapter 2 compares human-first analysis with automated second-pass discovery and independent expert-schema research.
- Chapter 8 contrasts conversational error discovery with long-trace localization.
- Exercise 1 and Template 3 record the review unit and exact target.
- The visual brief now proposes an annotation-zoom diagram and a cartoon about the invisible product rulebook.
- Appendix E and `examples/parcelpath/` now carry one complete fictional loop from trace review through maintenance.

## What not to infer

- The 87.2 percent recall in [AUTO-01] is a result on one dataset, not an automation target.
- The 11 percent joint accuracy in [TRACE-01] is a result for one demanding localization task, not a ceiling on all trace analysis.
- The 19 labeled traces in [WORKED-01] do not establish category prevalence.
- The expert/developer code split in [EXPERT-01] shows complementary perspectives, not a staffing formula.
- Company rollout percentages, alert thresholds, and annotation volumes describe those companies. They are not defaults for the reader's product.
