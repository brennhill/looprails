# Measure Twice, Prompt Once Codex

**Status:** Living source registry  
**Last updated:** 2026-09-02  
**Scope:** Every external source used or considered for *Measure Twice, Prompt Once*, including sources that appear only in research notes, sidebars, exercises, or permissions decisions.

This file is the book's reference source of truth. Manuscript citations use the stable IDs below. Do not renumber an existing ID. If a source is superseded, retain its entry, mark it superseded, and point to the replacement. Add a `Used in` field whenever a source enters a chapter.

## Entry schema

- **ID** — permanent citation key.
- **Source** — full-enough bibliographic citation for fact checking.
- **Type** — paper, official documentation, repository, dataset, engineering report, or practitioner case study.
- **Supports** — the claims or methods for which the source is acceptable.
- **Used in** — dossier or manuscript locations.
- **Version/access** — publication date, benchmark version, commit, or access date when relevant.
- **Reuse note** — license, quotation, contamination, screenshot, or uncertainty constraints.

---

## Foundations and practitioner methods

### [DG-01] The Delivery Gap and the Verification Triangle

- **Source:** Brenn Hill, *The Delivery Gap: Why AI Adoption Fails and How Engineering Leaders Fix It*, second edition, August 2026, <https://thedeliverygap.com/>.
- **Type:** Published practitioner book grounded in public engineering data, incident reports, case studies, and original synthesis.
- **Supports:** The delivery gap between generation velocity and verification capacity; the Verification Triangle's three vertices of intent clarity, verification quality, and cost; machine catch, human save, and production escape as the three observable fates of defects that enter the delivery pipeline.
- **Used in:** Preface; origin of this book's investigation into how verification changes when the product is itself an AI system.
- **Version/access:** Second edition, August 2026; source manuscript checked at sibling-repository commit `b8d27cc22bb763e96972f12a9d19b1fa1b89eaea`; website accessed 2026-08-27.
- **Reuse note:** This is the author's preceding book. Paraphrase the framework rather than repeating its chapter-length argument.

### [FOUND-01] AI product engineering field guide

- **Source:** Hamel Husain, “AI Product Engineering,” published 2026-08-12, <https://hamel.dev/notes/llm/ai-product-engineering/>.
- **Type:** Practitioner field guide and linked notes.
- **Supports:** Error analysis before premature rubric design; tight product-improvement loops; evals as product engineering rather than benchmark theater.
- **Used in:** Research dossier and conceptual foundation for Chapters 2, 10, and 15.
- **Version/access:** Published 2026-08-12; accessed 2026-08-24.
- **Reuse note:** Paraphrase and cite. Do not reproduce long passages.

### [FOUND-02] Field guide to rapidly improving AI products

- **Source:** Hamel Husain, “A Field Guide to Rapidly Improving AI Products,” <https://hamel.dev/blog/posts/field-guide/>.
- **Type:** Practitioner guidance.
- **Supports:** Reading production traces, bottom-up error taxonomies, data viewers, capability funnels, domain-expert ownership.
- **Used in:** Chapters 2, 8, 12, 14, 15.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Practitioner evidence; distinguish prescriptive advice from controlled findings.

### [FOUND-03] Your AI product needs evals

- **Source:** Hamel Husain, “Your AI Product Needs Evals,” published 2024-03-29, <https://hamel.dev/blog/posts/evals/>.
- **Type:** Practitioner guidance.
- **Supports:** Golden datasets, error analysis, eval-driven iteration.
- **Used in:** Chapters 1–3, 10.
- **Version/access:** Published 2024-03-29; accessed 2026-08-24.
- **Reuse note:** Paraphrase.

### [MEDIA-01] Lenny's Podcast eval walkthrough

- **Source:** Lenny Rachitsky, host, “Why AI evals are the hottest new skill for product builders,” interview with Hamel Husain and Shreya Shankar, *Lenny's Podcast*, September 25, 2025, <https://www.youtube.com/watch?v=BsWxPI9UM4c>; publisher transcript and episode notes at <https://www.lennysnewsletter.com/p/why-ai-evals-are-the-hottest-new-skill>.
- **Type:** Long-form practitioner interview with a screen-shared analysis of anonymized production traces.
- **Supports:** A worked property-management example; human-led open coding; first-upstream-failure notes; LLM-assisted axial coding after human review; a fallback category for taxonomy gaps; theoretical saturation as a discovery stopping rule; narrow binary judges; the class-imbalance failure of aggregate agreement; eval criteria as living product requirements; limits of dogfooding outside developer products; and failure-grounded experiment hypotheses.
- **Used in:** Chapters 2, 7, and 12; Exercises 1 and 2; Template 4; `research/lenny-evals-episode-notes.md`.
- **Version/access:** Published 2025-09-25; duration 1:46:33; YouTube automatic captions and publisher chapter notes reviewed 2026-09-01.
- **Reuse note:** Treat the episode as high-value practitioner evidence, not a controlled study. The automatic transcript contains recognition errors. Paraphrase the demonstrations; do not reproduce the transcript or screen-shared customer traces. The speakers' counts—such as traces reviewed, number of judges, initial setup time, and weekly maintenance time—are personal heuristics, not universal staffing or statistical requirements. The methodological claims overlap with [FOUND-02] and [JUDGE-02], which remain stronger support where applicable.

### [AUTO-01] Automated error-analysis comparison

- **Source:** Antaripa Saha and Hamel Husain, “Do Automated Evals Work?” Parlance Labs, published 2026-07-11, <https://parlance-labs.com/blog/posts/auto-evals/index.html>.
- **Type:** Practitioner comparison using anonymized production traces and masked human annotations.
- **Supports:** Six automated systems analyzing the same 100 apartment-leasing traces; 39 human-labeled failures; reported recall from 74.4 to 87.2 percent and precision from 77.4 to 91.0 percent; each system finding 17–20 valid issues missed in the original human review; consistent automated misses on objection handling, SMS formatting, interruptions, and handoffs that required product context absent from the trace.
- **Used in:** Chapters 2 and 8; `research/worked-eval-examples-comparison.md`.
- **Version/access:** Published 2026-07-11; accessed 2026-09-01.
- **Reuse note:** This is the closest direct comparison to [MEDIA-01], but it uses the same Nurture Boss dataset and comes from an overlapping practitioner circle; it is not an independent replication. The authors explicitly say that one dataset and 39 known failures are too small for vendor ranking. Customer traces cannot be redistributed. Report system-specific counts only as results from this dataset, never as automation targets.

### [WORKED-01] Langfuse error-analysis walkthrough

- **Source:** Annabell Schäfer, “Error Analysis for LLM Applications: Step by Step Guide,” Langfuse Guides, <https://langfuse.com/guides/cookbook/error-analysis-llm-applications>.
- **Type:** Vendor-authored, hands-on product-analysis walkthrough.
- **Supports:** Constructing a 100-trace review queue from 505 traces and 478 sessions; choosing the annotation unit when readable content sits in a generation observation rather than the trace shell; open coding before taxonomy; model-assisted clustering; human splitting of passive identity non-disclosure from active child impersonation; connecting categories to fixes, judges, or monitoring.
- **Used in:** Chapter 2; Exercise 1; Template 3; `research/worked-eval-examples-comparison.md`.
- **Version/access:** Accessed 2026-09-01.
- **Reuse note:** The published failure-category table is described as illustrative and is based on only 19 labeled traces. Do not present its rates as prevalence. The guide does not report a before/after product outcome and is not independent evidence about Langfuse tooling.

### [EXPERT-01] Expert schema for scholarly QA errors

- **Source:** Anna Martin-Boyle et al., “An Expert Schema for Evaluating Large Language Model Errors in Scholarly Question-Answering Systems,” *Proceedings of the 2026 CHI Conference on Human Factors in Computing Systems*, 2026, <https://doi.org/10.1145/3772318.3791843>; preprint at <https://arxiv.org/abs/2602.21059>.
- **Type:** Peer-reviewed qualitative and validation study.
- **Supports:** Two domain experts and an NLP developer open-coding 68 scholarly QA pairs; 49 distinct codes consisting of 20 shared, 14 developer-only, and 15 expert-only codes; consolidation into 20 patterns across seven categories; validation and refinement with ten additional scientists and 120 questions; structured review surfacing additional failure types.
- **Used in:** Chapter 2; `research/worked-eval-examples-comparison.md`.
- **Version/access:** CHI 2026 paper and arXiv v1 checked 2026-09-01.
- **Reuse note:** The validation group is small, covers science and engineering, and evaluates one retrieval-augmented system. Use it to demonstrate complementary evaluator perspectives and iterative schema construction, not as a universal distribution or staffing ratio.

### [CONTEXT-01] Context Engineering practitioner methodology

- **Source:** Elias Calboreanu, “Context Engineering: A Practitioner Methodology for Structured Human-AI Collaboration,” arXiv:2604.04258v1, 2026, <https://arxiv.org/abs/2604.04258>.
- **Type:** Practitioner methodology and observational preprint; submitted to a journal but not reported as peer reviewed.
- **Supports:** Treating context as a versioned product intervention; the five proposed context roles of Authority, Exemplar, Constraint, Rubric, and Metadata; a staged Reviewer → Design → Builder → Auditor workflow; preserving stage outputs and separating construction from audit. Reports 55 percent first-pass acceptance and 2.0 average iteration cycles among 200 structured interactions, compared with 32 percent and 3.8 cycles among 50 retrospectively reconstructed unstructured interactions.
- **Used in:** Chapter 10, “Give context a job description”; research dossier.
- **Version/access:** arXiv v1, submitted 2026-04-05; accessed 2026-08-31.
- **Reuse note:** Do not present the reported differences as causal effects or forecasts. The study covers one operator; outcomes were self-coded; the smaller baseline was nonrandomized, retrospective, and selected for sufficient documentation; and operator skill, templates, and the methodology changed together over time. Do not adopt the paper's fixed role-priority ordering as a universal rule. Do not treat two model vendors as independent auditors without calibration; role separation is useful, but shared model biases remain possible. The paper's formal reliability and information-theory sections are post hoc analogies, not validation of the method.

### [JUDGE-01] Creating an LLM-as-a-judge

- **Source:** Hamel Husain, “Using LLM-as-a-Judge for Evaluation: A Complete Guide,” published 2024-10-29, <https://hamel.dev/blog/posts/llm-judge/>.
- **Type:** Practitioner method.
- **Supports:** Binary criteria, calibration to a principal domain expert, disagreement review, reported greater-than-90-percent agreement after iteration in the described case.
- **Used in:** Chapter 7; judge-calibration exercise and template.
- **Version/access:** Published 2024-10-29; accessed 2026-08-24.
- **Reuse note:** Do not generalize one case's agreement rate into a universal target.

### [JUDGE-02] EvalGen / Who validates the validators?

- **Source:** Shankar et al., “Who Validates the Validators? Aligning LLM-Assisted Evaluation of LLM Outputs with Human Preferences,” UIST 2024; <https://arxiv.org/abs/2404.12272>.
- **Type:** Peer-reviewed research paper and system.
- **Supports:** Criteria drift, human–judge alignment, interactive rubric development.
- **Used in:** Chapters 2, 7, 13.
- **Version/access:** 2024 paper; accessed 2026-08-24.
- **Reuse note:** Cite the paper for findings. This edition reproduces no interface images from the project.

### [OPS-01] Evaluation-driven development and operations

- **Source:** Boming Xia, Qinghua Lu, Liming Zhu, Zhenchang Xing, Dehai Zhao, and Hao Zhang, “Evaluation-Driven Development and Operations of LLM Agents: A Process Model and Reference Architecture,” <https://arxiv.org/abs/2411.13768>.
- **Type:** Research paper.
- **Supports:** Offline and online evaluation, runtime monitoring, human review at critical points, lifecycle framing.
- **Used in:** Chapters 10–14.
- **Version/access:** arXiv v3, revised 2025-11-17; accessed 2026-08-25.
- **Reuse note:** The paper is under review. Cite it as a preprint and do not describe the reference architecture as an adopted standard.

### [OPS-02] Braintrust evaluation guide

- **Source:** Braintrust, “What is LLM evaluation?” <https://www.braintrust.dev/articles/llm-evaluation-guide>.
- **Type:** Vendor practitioner guide.
- **Supports:** Online sampled scoring, golden-set growth from production failures, CI regression gates, drift comparison.
- **Used in:** Chapters 10–13.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Vendor source; use for documented practices, not independent product-effect claims.

---

## Structured extraction and model specialization

### [EXTRACT-01] Write for the machine

- **Source:** Jebra, “Write for the machine,” DEV Community, 2026-06-19, <https://dev.to/jebra/write-for-the-machine-mf>.
- **Type:** Practitioner experiment.
- **Supports:** Input-language effects on structured extraction; 1,000-row experiment using five phrasings of one 11-field payroll agreement across 200 workers; reported nearly-eleven-point field-accuracy gain from spelling out abbreviations; distinction between explicit vocabulary, syntax, redundancy, and filler under grammar-constrained decoding.
- **Used in:** Chapter 10, “Buy brains or build rails?”; research dossier.
- **Version/access:** Published 2026-06-19; accessed through the DEV API 2026-08-28.
- **Reuse note:** One synthetic-style experiment, one small model family, and one domain. Report the setup and findings as a practitioner case, not a general law about prose.

### [EXTRACT-02] Payroll complexity and quantization

- **Source:** Jebra, “When payroll gets complicated, the machine gets harder to please,” DEV Community, 2026-07-02, <https://dev.to/jebra/when-payroll-gets-complicated-the-machine-gets-harder-to-please-5a75>.
- **Type:** Practitioner experiment.
- **Supports:** Complexity-aware slices for structured extraction; 2,500 payroll clauses; reported nearly-twenty-one-point benefit from full sentences over shorthand on complex shift-rate agreements; reported Q2 failure, Q4 weakness on complex cases, and statistical indistinguishability of Q8 and FP16 within the tested model family.
- **Used in:** Chapter 10, “Buy brains or build rails?”; research dossier.
- **Version/access:** Published 2026-07-02; accessed through the DEV API 2026-08-28.
- **Reuse note:** The post does not publish enough statistical detail to independently verify the “statistically indistinguishable” claim. Attribute it, preserve the one-family limitation, and do not turn the quantization result into a deployment rule.

### [EXTRACT-03] Dicts and Docs

- **Source:** Jebra, “Dicts and Docs: The Value of Grammar and Documentation for LLM-Based Automation,” DEV Community, 2026-07-16, <https://dev.to/jebra/dicts-and-docs-the-value-of-grammar-and-documentation-for-llm-based-automation-59p3>.
- **Type:** Practitioner experiment using hand-verified records.
- **Supports:** Separation of schema grammar from field semantics; 264 gold payroll agreements, two model sizes, four conditions, and 2,112 extractions; reported 92 percent field accuracy but 31 percent whole-record accuracy for the documented 14B configuration; reported false/null failure created by grammar without definitions.
- **Used in:** Chapter 10, “Buy brains or build rails?”; research dossier.
- **Version/access:** Published 2026-07-16; accessed through the DEV API 2026-08-28.
- **Reuse note:** Strong illustration of metric decomposition and absent-value semantics. The dataset, full results, and code are not linked in the post, so treat exact results as author-reported.

### [EXTRACT-04] QLoRA for JSON extraction

- **Source:** Jebra, “Fine-Tuning with QLoRA for JSON Extraction,” DEV Community, 2026-08-10, <https://dev.to/jebra/fine-tuning-with-qlora-for-json-extraction-f8k>.
- **Type:** Practitioner fine-tuning report.
- **Supports:** A narrow structured-extraction fine-tuning case using roughly 280 samples and Qwen2.5-1.5B-Instruct; separate field-match and exact-record metrics; reported improvement from 54 to 97 percent field match and zero to 62 percent exact match for the 16-bit experiment.
- **Used in:** Chapter 10, “Buy brains or build rails?”; research dossier.
- **Version/access:** Published 2026-08-10; accessed through the DEV API 2026-08-28.
- **Reuse note:** The post omits train/test counts, sampling method, hyperparameters, confidence intervals, and lower-bit results. Useful case evidence, not a reproducible benchmark report.

### [EXTRACT-05] Tuned Qwen versus Claude Opus 5

- **Source:** Jebra, “Fine-Tuned Qwen2.5-1.5B vs Claude-Opus-5 for JSON Extraction,” DEV Community, 2026-08-24, <https://dev.to/jebra/fine-tuned-qwen25-15b-vs-claude-opus-5-for-json-extraction-5aco>.
- **Type:** Practitioner model-comparison report.
- **Supports:** The need to compare frontier and specialized small models on the same product eval; author-reported field-match result of 96.72 versus 81.81 percent and exact-match result of 62 versus zero percent on the payroll extraction test.
- **Used in:** Chapter 10, “Buy brains or build rails?”; research dossier.
- **Version/access:** Published 2026-08-24; accessed through the DEV API 2026-08-28.
- **Reuse note:** The comparison omits test-set size, prompt and API settings, statistical uncertainty, latency measurement, per-field results, and reproduction artifacts. Do not repeat the “1,000x smaller” claim: Anthropic does not publish the frontier model's parameter count. Present the result as a hypothesis-generating case that readers should reproduce on their own workload.

### [TUNE-01] QLoRA

- **Source:** Tim Dettmers, Artidoro Pagnoni, Ari Holtzman, and Luke Zettlemoyer, “QLoRA: Efficient Finetuning of Quantized LLMs,” arXiv:2305.14314, 2023, <https://arxiv.org/abs/2305.14314>.
- **Type:** Research paper and released implementation.
- **Supports:** QLoRA's method: backpropagating through a frozen four-bit quantized model into low-rank adapters; memory-efficient specialization; the distinction between the training technique and claims from any one downstream task.
- **Used in:** Chapter 10, “Buy brains or build rails?”
- **Version/access:** Submitted 2023-05-23; accessed 2026-08-28.
- **Reuse note:** Cite for the method. Do not use its instruction-following results to validate the payroll experiment.

### [FORMAT-01] llama.cpp grammar guide

- **Source:** ggml-org, “GBNF Guide,” `llama.cpp`, <https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md>.
- **Type:** Official project documentation.
- **Supports:** Grammar-constrained generation and JSON Schema-to-grammar conversion; explicit warning that the schema constrains output but is not automatically injected as a task explanation.
- **Used in:** Chapter 10, “Buy brains or build rails?”
- **Version/access:** `master` documentation accessed 2026-08-28.
- **Reuse note:** Implementation details change. Keep the book's claim at the durable boundary between syntactic constraint and semantic instruction.

### [MODEL-01] Qwen2.5-1.5B-Instruct-GGUF model card

- **Source:** Qwen, `Qwen/Qwen2.5-1.5B-Instruct-GGUF`, Hugging Face, <https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF>.
- **Type:** Official model card.
- **Supports:** Model size, GGUF availability, listed quantizations, structured-output positioning, and Apache 2.0 license for the model used in the practitioner experiments.
- **Used in:** Research verification for Chapter 10; not cited directly in reader prose.
- **Version/access:** Accessed 2026-08-28.
- **Reuse note:** A model card documents the artifact; it does not independently validate downstream payroll results.

### [MODEL-02] Claude Opus 5 product page

- **Source:** Anthropic, “Claude Opus,” including Claude Opus 5 availability and pricing, <https://www.anthropic.com/claude/opus>.
- **Type:** Official product documentation.
- **Supports:** Existence, availability, model identifier, and published token pricing for the frontier model named in EXTRACT-05.
- **Used in:** Research verification for Chapter 10; not cited directly in reader prose.
- **Version/access:** Accessed 2026-08-28.
- **Reuse note:** Anthropic does not publish a parameter count for Claude Opus 5. Do not infer or repeat parameter-ratio claims.

---

## Agent-evaluation guidance

### [ANTH-01] Demystifying evals for AI agents

- **Source:** Anthropic, “Demystifying evals for AI agents,” <https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents>.
- **Type:** Official engineering guidance with customer examples.
- **Supports:** Outcome vs. transcript, 20–50 initial cases, task/grader/harness anatomy, capability vs. regression suites, dedicated eval-team/product-team split, transcript review and production layers; Descript and Bolt examples.
- **Used in:** Chapters 3–8, 10–15; exercises and templates.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Company guidance and reported examples, not peer-reviewed comparative evidence.

### [STAT-01] Statistical approach to model evaluations

- **Source:** Anthropic, “A statistical approach to model evaluations,” <https://www.anthropic.com/research/statistical-approach-to-model-evals>.
- **Type:** Official research guidance.
- **Supports:** Standard errors and confidence intervals, clustered standard errors, stochastic resampling, paired differences, power analysis; reported examples of cluster-aware errors exceeding naive errors by more than threefold.
- **Used in:** Chapter 9; statistical exercises.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Recalculate all worked arithmetic independently; do not lift figures without permission.

### [OPENAI-01] Evaluation best practices

- **Source:** OpenAI, “Evaluation best practices,” <https://developers.openai.com/api/docs/guides/evaluation-best-practices>.
- **Type:** Official documentation.
- **Supports:** Task-specific eval design, continuous evaluation, criterion-based scoring, comparison and classification framing.
- **Used in:** Chapters 3, 5, 7, 10.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Product interfaces age quickly. Keep book examples vendor-neutral.

### [OPENAI-02] Graders guide

- **Source:** OpenAI, “Graders,” <https://developers.openai.com/api/docs/guides/graders>.
- **Type:** Official documentation.
- **Supports:** String, text-similarity, score-model, and code-based grader patterns; grader composition.
- **Used in:** Chapters 5–7; grader specification template.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Platform implementation may be deprecated or renamed. Cite concepts, not UI steps.

### [OPENAI-03] Agent-workflow evaluation guide

- **Source:** OpenAI, “Evaluate agent workflows,” <https://developers.openai.com/api/docs/guides/agent-evals>.
- **Type:** Official documentation.
- **Supports:** Trace-level and workflow-level evaluation concepts.
- **Used in:** Chapters 8, 10, 11.
- **Version/access:** Accessed and status checked 2026-08-25.
- **Reuse note:** Keep operational guidance vendor-neutral. The book does not depend on product UI or API steps.

### [OPENAI-04] Evaluation-flywheel cookbook

- **Source:** OpenAI, “Building Resilient Prompts Using an Evaluation Flywheel,” *OpenAI Cookbook*, <https://github.com/openai/openai-cookbook/blob/main/examples/evaluation/Building_resilient_prompts_using_an_evaluation_flywheel.md>.
- **Type:** Official implementation tutorial based on a practitioner course example.
- **Supports:** A concrete platform workflow from production examples through open and axial coding, dataset construction, narrow graders, prompt optimization, and synthetic expansion.
- **Used in:** `research/worked-eval-examples-comparison.md`; implementation cross-check only.
- **Version/access:** Accessed 2026-09-01.
- **Reuse note:** The tutorial reuses the apartment-leasing example associated with [MEDIA-01] and [AUTO-01], so it is an implementation companion rather than independent corroboration. Its displayed category rates are hypothetical examples, not measured findings.

### [ACES-01] Agentic Continuous Evaluation of Skills

- **Source:** Christopher Kevin, Narendran Raghavan, Jean-Francois Puget, Roshni Malani, Meghana Puvvadi, Moshe Abramovitch, Mohit Gupta, Rama Akkiraju, Subodh Prabhu, Yogesh Dangi, Wei Luo, and Seong Hee Lee, “Evaluating Skills, Not Just Agents: Agentic Continuous Evaluation of Skills,” arXiv:2608.20614v1, <https://arxiv.org/abs/2608.20614>.
- **Type:** Research preprint and empirical enterprise case study.
- **Supports:** Evaluating reusable skills and plugins as executable interventions rather than static documents; author-owned evaluation assets; paired with-skill/baseline trials under fixed task, model, harness, workspace, and scorer; ATIF-normalized trajectories; Skill Lift; isolation versus group routing tests; static-versus-live evidence; release-candidate and model-update cadence.
- **Used in:** Chapters 3, 8, 9, 11, and 14; research dossier.
- **Version/access:** Version 1 submitted 2026-08-20; accessed 2026-08-25.
- **Reuse note:** Extended preprint accepted at two 2026 workshops. Treat findings as one organization's mixed internal/public corpus, not a universal skill-effect estimate. Preserve paired-case denominators and the authors' caveats about uneven harness coverage, corpus skew, live-judge calibration, environment dependence, and endpoint failures. Paraphrase; do not reproduce paper figures without permission.

### [ACES-02] NVIDIA SkillEvaluator

- **Source:** NVIDIA, `NVIDIA/SkillEvaluator`, <https://github.com/NVIDIA/SkillEvaluator>.
- **Type:** Open-source repository and implementation documentation.
- **Supports:** Public implementation of deterministic validation, deduplication, evaluation-dataset creation, live paired skill evaluation, and report inspection; three-tier workflow and repository-native operation.
- **Used in:** Chapters 11 and 14; implementation notes.
- **Version/access:** Commit `009aa300be7925c7ba75760592baeb941cc29ba8`, resolved 2026-08-25.
- **Reuse note:** Apache-2.0 repository at access time. Prefer the paper for empirical claims and the repository for implementation availability and current commands.

### [TRACE-01] TRAIL trace-localization benchmark

- **Source:** Darshan Deshpande et al., “TRAIL: Trace Reasoning and Agentic Issue Localization,” arXiv:2505.08638v1, 2025, <https://arxiv.org/abs/2505.08638>.
- **Type:** Research preprint and human-annotated trace benchmark.
- **Supports:** Joint error-category and span-localization evaluation over 148 agent traces, 1,987 OpenTelemetry spans, and 841 labeled errors; four experienced annotators with review by four industry ML researchers; reported best tested-model joint accuracy of 11 percent; difficulty of automating diagnosis in long agent trajectories.
- **Used in:** Chapter 8; `research/worked-eval-examples-comparison.md`.
- **Version/access:** arXiv v1 submitted 2025-05-13; accessed 2026-09-01.
- **Reuse note:** Output-generation errors, especially formatting and instruction noncompliance, account for roughly 42 percent of labeled errors, so category mix matters. Compare its result with conversational analysis only after stating the different review unit, trace length, labels, and success definition.

### [TRACE-02] TRAIL repository and dataset

- **Source:** Patronus AI, *TRAIL Benchmark*, <https://github.com/patronus-ai/trail-benchmark>; dataset card at <https://huggingface.co/datasets/PatronusAI/TRAIL>.
- **Type:** Open-source repository and gated dataset.
- **Supports:** Benchmark implementation, task schema, and current access conditions for [TRACE-01].
- **Used in:** `research/worked-eval-examples-comparison.md`; research verification only.
- **Version/access:** Accessed 2026-09-01.
- **Reuse note:** Repository code is MIT-licensed at access time. The Hugging Face data is gated and its card requests that downloaded data not be reshared outside gated or private repositories. Do not copy benchmark traces into the book or public project fixtures.

---

## SWE-bench case study

### [SWE-01] Original SWE-bench paper

- **Source:** Carlos E. Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik Narasimhan, “SWE-bench: Can Language Models Resolve Real-World GitHub Issues?” <https://arxiv.org/abs/2310.06770>.
- **Type:** Research paper.
- **Supports:** Benchmark construction; 2,294 issue–patch tasks from twelve Python repositories; repository-level coding evaluation.
- **Used in:** Chapters 1, 3–6, 9, 13.
- **Version/access:** arXiv v3, revised 2024-11-11; accessed 2026-08-25.
- **Reuse note:** Paper text is copyrighted; paraphrase. Benchmark assets follow repository/data licenses.

### [SWE-02] Introducing SWE-bench Verified

- **Source:** OpenAI, “Introducing SWE-bench Verified,” <https://openai.com/index/introducing-swe-bench-verified/>.
- **Type:** Official benchmark curation report.
- **Supports:** 1,699 screened candidates, 93 Python developers, three reviews per candidate, 500 selected tasks, 68.3 percent filtered.
- **Used in:** Chapters 3, 6, 13.
- **Version/access:** 2024 report; accessed 2026-08-24.
- **Reuse note:** Report selection and annotation claims with the stated study scope.

### [SWE-03] SWE-bench Verified retirement audit

- **Source:** OpenAI, “Why we no longer evaluate SWE-bench Verified,” <https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/>.
- **Type:** Official benchmark audit.
- **Supports:** Targeted audit of 138 often-failed tasks; at least 59.4 percent with material issues, including 35.5 percent narrow tests, 18.8 percent wide tests, and 5.1 percent miscellaneous; contamination evidence; recommendation to stop reporting the benchmark.
- **Used in:** Chapters 1, 6, 13.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Do not extrapolate the targeted sample to the complete benchmark. Preserve “evidence of” wording for contamination.

### [SWE-04] SWE-bench evaluation harness

- **Source:** SWE-bench documentation, “Evaluation Harness,” <https://www.swebench.com/SWE-bench/api/harness/>.
- **Type:** Official technical documentation.
- **Supports:** Containerized evaluation architecture and reproducible task execution.
- **Used in:** Chapters 3, 6, 11.
- **Version/access:** Documentation matched to repository commit `7a21e05772954cc81471ae19d56f436cecf43c54`, resolved 2026-08-25.
- **Reuse note:** Diagrams should be newly drawn.

### [SWE-05] SWE-bench repository

- **Source:** Princeton NLP, `princeton-nlp/SWE-bench`, <https://github.com/princeton-nlp/SWE-bench/blob/main/README.md?plain=1>.
- **Type:** Repository.
- **Supports:** Public implementation, task assets, current project status, MIT repository license.
- **Used in:** Chapters 3, 6; exercise notes.
- **Version/access:** Commit `7a21e05772954cc81471ae19d56f436cecf43c54`, resolved 2026-08-25.
- **Reuse note:** MIT repository license at the pinned commit. Dataset components may include upstream repository material with separate rights. The book reproduces no repository code or task text.

### [SWE-06] Verified annotation instructions

- **Source:** OpenAI, “SWE-bench Verified Annotation Instructions,” <https://cdn.openai.com/introducing-swe-bench-verified/swe-b-annotation-instructions.pdf>.
- **Type:** Annotation protocol.
- **Supports:** Human review criteria for issue clarity, test fairness, and task solvability.
- **Used in:** Chapters 2, 3, 6, 14.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** The book summarizes the protocol and reproduces no pages or screenshots.

### [SWE-07] SWE-agent repository and trajectories

- **Source:** Princeton NLP, `SWE-agent/SWE-agent`, <https://github.com/SWE-agent/SWE-agent>.
- **Type:** Repository and agent ecosystem.
- **Supports:** Software-agent trajectory format and public agent implementation context.
- **Used in:** Chapter 8; research dossier.
- **Version/access:** Commit `3ea751c087f32b16e039a2233dd6eefecef325d5`, resolved 2026-08-25.
- **Reuse note:** No trajectory or embedded repository content is reproduced in this edition.

---

## τ-bench / τ³-bench case study

### [TAU-01] τ-bench paper

- **Source:** Yao et al., “τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains,” <https://arxiv.org/abs/2406.12045>.
- **Type:** Research paper.
- **Supports:** Policy-and-tool tasks, end-state database grading, simulated users, pass^k, original airline and retail results.
- **Used in:** Chapters 1, 3–6, 8–10, 13.
- **Version/access:** Original 2024 paper; accessed 2026-08-24.
- **Reuse note:** Original tasks and current maintained benchmark are not interchangeable.

### [TAU-02] Maintained τ³-bench repository

- **Source:** Sierra Research, `sierra-research/tau2-bench`, <https://github.com/sierra-research/tau2-bench>.
- **Type:** Repository and benchmark documentation.
- **Supports:** Current τ³ branding, domains, base split, task fixes, text and voice modes, historical trajectories.
- **Used in:** Chapters 3–6, 8, 11, 13.
- **Version/access:** Commit `a2c024725189473d2d7cea3a5cfdbcc67478e41f`, resolved 2026-08-25; repository identified release 1.0.1 as the current grading boundary.
- **Reuse note:** State the exact release/split for every current result.

### [TAU-03] Composite evaluator implementation

- **Source:** Sierra Research, `src/tau2/evaluator/evaluator.py`, <https://github.com/sierra-research/tau2-bench/blob/main/src/tau2/evaluator/evaluator.py>.
- **Type:** Source code.
- **Supports:** Environment, action, communication, and natural-language assertion grading components.
- **Used in:** Chapters 5–7; grader-stack template.
- **Version/access:** Commit `a2c024725189473d2d7cea3a5cfdbcc67478e41f`, resolved 2026-08-25.
- **Reuse note:** MIT repository license at the pinned commit. The book uses original pseudocode rather than copied implementation.

### [TAU-04] CLI and trajectory review

- **Source:** Sierra Research, “CLI Reference,” <https://github.com/sierra-research/tau2-bench/blob/main/docs/cli-reference.md>.
- **Type:** Technical documentation.
- **Supports:** Running, inspecting, and re-grading trajectories.
- **Used in:** Chapters 8, 11, 13.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** The manuscript discusses the workflow without printing CLI commands. Repository behavior is tied to the pinned commit in [TAU-02].

---

## HealthBench case study

### [HEALTH-01] HealthBench paper

- **Source:** Rahul K. Arora, Jason Wei, Rebecca Soskin Hicks, Preston Bowman, Joaquin Quiñonero-Candela, Foivos Tsimpourlas, Michael Sharman, Meghan Shah, Andrea Vallone, Alex Beutel, Johannes Heidecke, and Karan Singhal, “HealthBench: Evaluating Large Language Models Towards Improved Human Health,” <https://arxiv.org/abs/2505.08775>.
- **Type:** Research paper.
- **Supports:** 5,000 conversations, 48,562 criteria, 262 physicians, 60 countries, rubric and benchmark design.
- **Used in:** Chapters 1–5, 7–9, 13, 14.
- **Version/access:** arXiv v1, submitted 2025-05-13; accessed 2026-08-25.
- **Reuse note:** Paraphrase benchmark methods and aggregate quantities. Do not reproduce protected examples.

### [HEALTH-02] HealthBench introduction

- **Source:** OpenAI, “Introducing HealthBench,” published 2025-05-12, <https://openai.com/index/healthbench/>.
- **Type:** Official benchmark overview.
- **Supports:** Benchmark motivation, variants, high-level data and expert-participation claims.
- **Used in:** Chapters 1, 4, 7.
- **Version/access:** Published 2025-05-12; accessed 2026-08-24.
- **Reuse note:** Prefer paper for scholarly claims.

### [HEALTH-03] HealthBench dataset card

- **Source:** OpenAI, `openai/healthbench`, <https://huggingface.co/datasets/openai/healthbench>.
- **Type:** Dataset card.
- **Supports:** Dataset schema, MIT license, explicit anti-contamination request not to reproduce prompts/examples in text or images.
- **Used in:** Chapters 3, 7, 13; rights checklist.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Do not reproduce benchmark prompts, answers, or rubric examples. Create original analogues.

### [HEALTH-04] HealthBench meta-evaluation

- **Source:** OpenAI, `healthbench_meta_eval.py` in `openai/simple-evals`, <https://github.com/openai/simple-evals/blob/main/healthbench_meta_eval.py>.
- **Type:** Evaluation code.
- **Supports:** Comparing automated judge output with physician opinion and reporting agreement by category.
- **Used in:** Chapters 7, 9, 13.
- **Version/access:** Commit `652c89d0ca9df547706735883097e9537d40dc47`, resolved 2026-08-25.
- **Reuse note:** MIT repository license at the pinned commit. The repository is deprecated for new results but retains reference implementations. The book explains the method with original prose and pseudocode.

---

## DeepResearch Bench case study

### [DRB-01] DeepResearch Bench paper

- **Source:** Mingxuan Du, Benfeng Xu, Chiwei Zhu, Xiaorui Wang, and Zhendong Mao, “DeepResearch Bench: A Comprehensive Benchmark for Deep Research Agents,” <https://arxiv.org/abs/2506.11763>.
- **Type:** Research paper.
- **Supports:** 100 expert tasks across 22 fields, analysis of 96,147 user queries, 400 reports, 150 RACE annotations, 70+ expert annotators, RACE and FACT design.
- **Used in:** Chapters 1, 3–5, 7–9, 12, 13.
- **Version/access:** arXiv v1, submitted 2025-06-13; accessed 2026-08-25.
- **Reuse note:** Aggregate construction claims are tied to the paper version. Current leaderboard results are not used in the book.

### [DRB-02] DeepResearch Bench dataset

- **Source:** `muset-ai/DeepResearch-Bench-Dataset`, <https://huggingface.co/datasets/muset-ai/DeepResearch-Bench-Dataset>.
- **Type:** Dataset card and public reports/annotations.
- **Supports:** Public task, report, and annotation availability; Apache 2.0 dataset license.
- **Used in:** Chapters 3, 7, 8; exercise candidates.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Third-party works cited in reports retain their own rights. Review each reproduced asset.

### [DRB-03] DeepResearch Bench repository

- **Source:** `Ayanami0730/deep_research_bench`, <https://github.com/Ayanami0730/deep_research_bench>.
- **Type:** Repository and evaluation code.
- **Supports:** RACE and FACT evaluator implementation and reproducibility.
- **Used in:** Chapters 5, 7, 8.
- **Version/access:** Commit `469cce54ea7f6a63c163d3d9fec879cf289ec484`, resolved 2026-08-25.
- **Reuse note:** Apache-2.0 repository license at the pinned commit. The book uses original pseudocode and newly drawn diagrams.

---

## Advanced benchmarks

### [PAPER-01] PaperBench

- **Source:** Giulio Starace et al., “PaperBench: Evaluating AI's Ability to Replicate AI Research,” <https://arxiv.org/abs/2504.01848>.
- **Type:** Research paper and public benchmark.
- **Supports:** 20 ICML papers, 8,316 hierarchical criteria, paper-author involvement, JudgeEval, judge F1 0.83, reported agent and human scores.
- **Used in:** Chapters 3, 7, 9; sidebar.
- **Version/access:** arXiv v3, revised 2025-04-07; accessed 2026-08-25.
- **Reuse note:** Aggregate figures were checked against v3. The book does not reproduce paper figures or benchmark tasks.

### [REBENCH-01] RE-Bench

- **Source:** “RE-Bench: Evaluating Frontier AI R&D Capabilities of Language Model Agents against Human Experts,” <https://arxiv.org/abs/2411.15114>.
- **Type:** Research paper and public benchmark.
- **Supports:** Seven environments, 71 eight-hour attempts by 61 experts, public human/agent trajectories, time-budget crossover, score@k and bootstrap methods.
- **Used in:** Chapters 8, 9, 13; sidebar and exercise.
- **Version/access:** arXiv v2, revised 2025-05-27; accessed 2026-08-25.
- **Reuse note:** Time-budget claims are tied to v2. The paper states that environments, human data, analysis code, and trajectories are open-sourced; this edition reproduces no trajectory content.

### [BROWSE-01] BrowseComp

- **Source:** “BrowseComp: A Simple Yet Challenging Benchmark for Browsing Agents,” <https://arxiv.org/abs/2504.12516>.
- **Type:** Research paper and benchmark.
- **Supports:** 1,266 difficult browsing questions, persistence evaluation, contamination discussion.
- **Used in:** Chapter 13 sidebar.
- **Version/access:** 2025 paper; accessed 2026-08-24.
- **Reuse note:** Maintainers request that benchmark examples not be exposed. Do not reproduce them.

### [AGENTLENS-01] AgentLens

- **Source:** Priyam Sahoo, Gaurav Mittal, Xiaomin Li, Shengjie Ma, Benjamin Steenhoek, Pingping Lin, and Yu Hu, “AgentLens: Revealing The Lucky Pass Problem in SWE-Agent Evaluation,” <https://arxiv.org/abs/2605.12925>.
- **Type:** Research preprint.
- **Supports:** Analysis of 2,614 OpenHands trajectories across 60 SWE-bench Verified tasks; a reported 1,815-trajectory evaluation subset annotated for quality, waste, and divergence; process-level analysis of successful outcomes.
- **Used in:** Chapter 8.
- **Version/access:** arXiv v3, revised 2026-06-02; accessed 2026-08-25.
- **Reuse note:** The v3 paper says the repository and dataset release is planned. This edition cites the paper only and does not claim that the artifacts are currently downloadable or reproduce them.

---

## Statistical methods

### [STAT-02] Wilson score interval

- **Source:** Edwin B. Wilson, “Probable Inference, the Law of Succession, and Statistical Inference,” *Journal of the American Statistical Association* 22(158), 1927, 209–212, <https://doi.org/10.1080/01621459.1927.10502953>.
- **Type:** Foundational statistics paper.
- **Supports:** Wilson interval for binomial proportions.
- **Used in:** Chapter 9; statistical exercise.
- **Version/access:** Stable historical source.
- **Reuse note:** Formula and newly calculated examples may be reproduced; cite source.

### [STAT-03] McNemar paired test

- **Source:** Quinn McNemar, “Note on the Sampling Error of the Difference between Correlated Proportions or Percentages,” *Psychometrika* 12, 1947, 153–157, <https://doi.org/10.1007/BF02295996>.
- **Type:** Foundational statistics paper.
- **Supports:** Comparing paired binary outcomes through discordant pairs.
- **Used in:** Chapter 9; paired-comparison exercise.
- **Version/access:** Stable historical source.
- **Reuse note:** Explain exact binomial form clearly; avoid ritual reliance on a p-value threshold.

### [STAT-04] pass@k estimator / HumanEval

- **Source:** Chen et al., “Evaluating Large Language Models Trained on Code,” <https://arxiv.org/abs/2107.03374>.
- **Type:** Research paper.
- **Supports:** pass@k framing and unbiased estimator used in code-generation evaluation.
- **Used in:** Chapter 9.
- **Version/access:** 2021 paper; accessed 2026-08-24.
- **Reuse note:** Distinguish the general at-least-one-success probability example from the paper's finite-sample estimator.

### [STAT-05] Zero-numerator upper bound

- **Source:** James A. Hanley and Abby Lippman-Hand, “If Nothing Goes Wrong, Is Everything All Right? Interpreting Zero Numerators,” *JAMA* 249(13), 1983, 1743–1745, <https://doi.org/10.1001/jama.1983.03330370053031>.
- **Type:** Peer-reviewed statistics paper.
- **Supports:** One-sided upper confidence bounds when zero events are observed; rule-of-three approximation.
- **Used in:** Chapter 9; Appendix D.
- **Version/access:** Stable 1983 publication; metadata checked 2026-08-25.
- **Reuse note:** The book derives its own example and arithmetic.

### [STAT-06] Always-valid inference

- **Source:** Ramesh Johari, Pete Koomen, Leonid Pekelis, and David Walsh, “Always Valid Inference: Continuous Monitoring of A/B Tests,” *Operations Research* 70(3), 2022, 1806–1821, <https://doi.org/10.1287/opre.2021.2135>.
- **Type:** Peer-reviewed statistics paper.
- **Supports:** Why fixed-horizon inference fails under endogenous continuous monitoring; always-valid p-values and intervals; sequential multiple-testing context.
- **Used in:** Chapter 9; Appendix D.
- **Version/access:** Published online 2021-08-10; volume publication 2022; accessed 2026-08-25.
- **Reuse note:** The book gives operational guidance, not an implementation of the paper's procedures.

### [STAT-07] Confidence sequences

- **Source:** Steven R. Howard, Aaditya Ramdas, Jon McAuliffe, and Jasjeet Sekhon, “Time-Uniform, Nonparametric, Nonasymptotic Confidence Sequences,” *The Annals of Statistics* 49(2), 2021, 1055–1080, <https://doi.org/10.1214/20-AOS1991>.
- **Type:** Peer-reviewed statistics paper.
- **Supports:** Time-uniform confidence sequences for repeated looks over an open-ended horizon.
- **Used in:** Chapter 9; Appendix D.
- **Version/access:** Stable 2021 publication; accessed 2026-08-25.
- **Reuse note:** Cite for the method class. Practical deployment requires reviewed statistical implementation.

### [STAT-08] Holm multiple-testing procedure

- **Source:** Sture Holm, “A Simple Sequentially Rejective Multiple Test Procedure,” *Scandinavian Journal of Statistics* 6(2), 1979, 65–70, <https://doi.org/10.2307/4615733>.
- **Type:** Peer-reviewed statistics paper.
- **Supports:** Step-down family-wise error control for a family of hypotheses.
- **Used in:** Chapter 9; Appendix D.
- **Version/access:** Stable 1979 publication; metadata checked 2026-08-25.
- **Reuse note:** The worked Boolean-gate probabilities are original calculations; Holm is presented as one suitable family-wise method, not a default for every dashboard metric.

---

## Organizational and production practice

### [FIELD-01] Anonymized international delivery search-evaluation talk

- **Source:** Public talk by an evaluation team at a major international delivery company; speaker, organization, title, and venue withheld. A private slide copy was reviewed for internal editorial research.
- **Type:** Anonymized practitioner field report; non-citable source.
- **Supports:** Three-way review of human–model disagreements as candidate error, label error, or genuine ambiguity; independent double labeling with third-reviewer adjudication; written label rationales; guidance revised from observed failures; model pre-labeling as a review aid; group-aware train/test splitting; segment-level experiment tracking; and comparison of context, prompt, model, and tuning changes on one multilingual relevance task.
- **Used in:** Chapters 7 and 13; Exercise 6; Template 7; `research/anonymized-search-eval-talk-notes.md`.
- **Version/access:** Public talk delivered in 2026; private slide copy reviewed 2026-09-02.
- **Reuse note:** Do not cite or identify the company, speakers, brands, countries, venue, deck title, model vendors, screenshots, unique queries, dataset sizes, costs, thresholds, or reported percentages. Do not reproduce slide wording. In reader-facing prose, attribute only as “in public talks about its evals, a major international delivery company described…” and call it a field report rather than published evidence.

### [ORG-01] LinkedIn generative-AI product practice

- **Source:** LinkedIn Engineering, “Musings on Building a Generative AI Product,” <https://www.linkedin.com/blog/engineering/generative-ai/musings-on-building-a-generative-ai-product>.
- **Type:** Official engineering case study.
- **Supports:** Horizontal eval/test/prompt team and vertical agent teams; multiple feedback latencies; linguist review volume up to 500 conversations per day.
- **Used in:** Chapters 12, 14.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Preserve “reported by LinkedIn” language.

### [ORG-02] LinkedIn search evaluation

- **Source:** LinkedIn Engineering, “Reimagining LinkedIn's Search Stack,” <https://www.linkedin.com/blog/engineering/search/reimagining-linkedins-search-stack>.
- **Type:** Official engineering case study.
- **Supports:** Product-manager adjudication, weighted Cohen's kappa threshold of at least 0.8 for gold labels, high-volume LLM judging, distilled judge, stratified workflows.
- **Used in:** Chapters 7, 12, 14.
- **Version/access:** Published 2026-01-21; claims checked 2026-08-25.
- **Reuse note:** LinkedIn reports tens of millions of daily query–document judgments and an 8B distilled evaluator. Preserve company-reported wording and do not turn its kappa threshold into a universal standard.

### [ORG-03] Nova Escola production evals

- **Source:** Hamel Husain, “Evals in Production,” <https://hamel.dev/notes/llm/ai-product-engineering/evals-production.html>.
- **Type:** Practitioner case study.
- **Supports:** Approximately one million monthly users and 200,000 teachers; failed rubric-first labeling; worse-than-chance annotator agreement; expert rubric rewrite; daily evals over two percent of traffic.
- **Used in:** Chapters 2, 7, 12, 14.
- **Version/access:** Accessed 2026-08-24.
- **Reuse note:** Treat quantities as reported case details. Avoid generalizing to all annotation projects.

### [ORG-04] Spotify eval and experimentation funnel

- **Source:** Spotify Engineering, “Better Experiments with LLM Evals: A Funnel, Not a Fork,” <https://engineering.atspotify.com/2026/5/better-experiments-with-llm-evals-a-funnel-not-a-fork>.
- **Type:** Official engineering case study.
- **Supports:** Offline eval verifies while online experiment validates; experiments calibrate proxy metrics; reported 12 percent positive shipments, 64 percent valid learning, and 42 percent rollback on secondary regressions.
- **Used in:** Chapters 11, 12, 14.
- **Version/access:** Published 2026-05-18; claims checked 2026-08-25.
- **Reuse note:** Keep “Spotify reports” for organization-specific experiment rates and preserve the distinction between positive shipment, valid learning, and rollback.

### [ORG-05] Uber prompt engineering toolkit

- **Source:** Sishi Long, Manoj Sureddi, and Hwamin Kim, “Introducing the Prompt Engineering Toolkit,” Uber Engineering, published 2024-11-26, <https://www.uber.com/hk/en/blog/introducing-the-prompt-engineering-toolkit/>.
- **Type:** Official engineering case study.
- **Supports:** Evaluation-dataset threshold before production and subsequent production monitoring.
- **Used in:** Chapters 11, 12.
- **Version/access:** Published 2024-11-26; accessed 2026-08-24.
- **Reuse note:** Use as a lifecycle example, not a product endorsement.

### [ORG-06] Notion AI evaluation practice

- **Source:** Sarah Sachs, “Speed, Structure, and Smarts: The Notion AI Way,” Notion, <https://www.notion.com/blog/speed-structure-and-smarts-the-notion-ai-way>.
- **Type:** Official product-engineering case study.
- **Supports:** AI Data Specialist as a hybrid QA, prompt-engineering, and product role; feature-specific evaluation criteria; inspection of real user behavior; continuous evaluation across dozens of models and hundreds of prompts.
- **Used in:** Chapter 14.
- **Version/access:** Published 2025-05-29; accessed 2026-08-25.
- **Reuse note:** Treat scale and operating details as Notion's report. No comparative causal claim is made.

### [ORG-07] Salesforce mock LLM service

- **Source:** Sandeep Bansal and Seetharaman Gudetee, “How a Mock LLM Service Cut $500K in AI Benchmarking Costs, Boosted Developer Productivity,” Salesforce Engineering, <https://engineering.salesforce.com/how-a-mock-llm-service-cut-500k-in-ai-benchmarking-costs-boosted-developer-productivity/>.
- **Type:** Official engineering case study.
- **Supports:** Deterministic mock responses and latency; controlled 4xx, 5xx, and outage simulation; production-readiness load testing; reported annual token-cost reduction above $500,000; reported 16,000 sustained and 24,000-plus burst requests per minute.
- **Used in:** Chapter 11.
- **Version/access:** Published 2026-01-15; accessed 2026-08-25.
- **Reuse note:** Preserve “Salesforce reports.” The mock validates internal performance, reliability, and failover behavior; it does not validate model answer quality.

### [ORG-08] Block agent testing pyramid

- **Source:** Angie Jones, “Testing Pyramid for AI Agents,” Block Engineering, <https://engineering.block.xyz/blog/testing-pyramid-for-ai-agents>.
- **Type:** Official engineering case study.
- **Supports:** Deterministic mock-provider tests, record/replay model and MCP fixtures, repeated probabilistic benchmarks, rubric-based judge repetition, and separation of live benchmarks from pull-request CI.
- **Used in:** Chapter 11.
- **Version/access:** Published 2026-01-12; accessed 2026-08-25.
- **Reuse note:** Present as Block's operating pattern. Repeating a judge three times and taking a majority is not asserted as a generally calibrated statistical method.

### [ORG-09] Practitioner review cadence

- **Source:** Hamel Husain and Shreya Shankar, “How Often Should I Re-run Error Analysis on My Production System?” <https://hamel.dev/blog/posts/evals-faq/how-often-should-i-re-run-error-analysis-on-my-production-system.html>.
- **Type:** Practitioner guidance.
- **Supports:** Suggested weekly review of 10–20 sampled traces and larger cycles of at least 100 fresh traces every two to four weeks.
- **Used in:** Chapter 14.
- **Version/access:** Published 2025-07-27; accessed 2026-08-25.
- **Reuse note:** Present as a practitioner heuristic, not a staffing benchmark or controlled finding.

### [ORG-10] Lyft self-serve agent platform

- **Source:** LangChain, “How Lyft Built a Self-Serve AI Agent Platform with LangGraph and LangSmith,” <https://www.langchain.com/blog/lyft-built-a-self-serve-ai-agent-platform-for-customer-support-with-langgraph-and-langsmith>.
- **Type:** Vendor-published customer engineering case study.
- **Supports:** Per-turn tracing; low-volume rollout; converting production traces into datasets; a shared judge pattern plus agent-specific metrics; sampled online evaluation; dashboards and alerting as part of an operating platform.
- **Used in:** `research/worked-eval-examples-comparison.md`; organizational comparison only.
- **Version/access:** Accessed 2026-09-01.
- **Reuse note:** Useful architecture report, but it does not publish raw traces, human–judge calibration results, or a controlled product-effect estimate. Treat rollout fractions and alert thresholds as Lyft case details, not recommendations.

---

## Editorial voice and AI-writing audit

### [STYLE-01] Linguistic characteristics of AI-generated text

- **Source:** Luka Terčon and Kaja Dobrovoljc, “Linguistic Characteristics of AI-Generated Text: A Survey,” <https://arxiv.org/abs/2510.05136>.
- **Type:** Research survey.
- **Supports:** Reported tendencies toward formal and impersonal style, lower lexical diversity, smaller vocabulary, and repetition in studied AI-generated text.
- **Used in:** `book/prose-style.md`; manuscript-wide prose audit.
- **Version/access:** 2025 preprint; accessed 2026-08-25.
- **Reuse note:** Findings vary by model, language, genre, and prompt. Use them as editing signals, not authorship proof.

### [STYLE-02] ChatGPT and academic writing style

- **Source:** Mingmeng Geng and Roberto Trotta, “Is ChatGPT Transforming Academics' Writing Style?” <https://arxiv.org/abs/2404.08627>.
- **Type:** Research paper.
- **Supports:** Corpus-level evidence of word-frequency shifts in academic abstracts associated with ChatGPT-style revision.
- **Used in:** `book/prose-style.md`; review of academic-sounding prose.
- **Version/access:** 2024 preprint; accessed 2026-08-25.
- **Reuse note:** The study estimates aggregate influence under a particular calibration design; it is not a detector for individual passages.

### [STYLE-03] Wikipedia field guide to signs of AI writing

- **Source:** WikiProject AI Cleanup, “Signs of AI writing,” <https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing>.
- **Type:** Community-maintained descriptive field guide.
- **Supports:** Watch list for clustered vocabulary, repetitive syntax, vague coverage claims, formatting habits, and other recurring cleanup patterns.
- **Used in:** `book/prose-style.md`; `book/scripts/audit-prose.mjs`.
- **Version/access:** Accessed 2026-08-25.
- **Reuse note:** The page explicitly warns that its signs are neither exclusive to AI nor proof of AI authorship. Use for editing, never accusation.

### [STYLE-04] Avoid generated prose tells

- **Source:** Joshka, “Avoid Generated Prose Tells,” <https://www.joshka.net/practice/rules/documentation/docs-avoid-generated-prose-tells/>.
- **Type:** Practitioner documentation style guide.
- **Supports:** Concrete review rules for stock words, negative parallelism, rule-of-three padding, empty transitions, false suspense, repeated summaries, inflated stakes, and vague action verbs.
- **Used in:** `book/prose-style.md`; `book/scripts/audit-prose.mjs`; contextual manuscript rewrite.
- **Version/access:** Accessed 2026-08-25.
- **Reuse note:** Practitioner guidance, not a validated authorship detector. Apply in context and preserve precise domain language.

### [STYLE-05] Lexical overrepresentation in ChatGPT scientific writing

- **Source:** Tom S. Juzek and Zina B. Ward, “Why Does ChatGPT ‘Delve’ So Much? Exploring the Sources of Lexical Overrepresentation in Large Language Models,” *Proceedings of COLING 2025*, <https://aclanthology.org/2025.coling-main.426/>.
- **Type:** Peer-reviewed corpus and model-comparison study with released code and data.
- **Supports:** A reproducible three-stage method identified 21 inflected word forms that both rose sharply in PubMed abstracts and were overrepresented in ChatGPT-3.5 scientific abstracts; comparison work also found broadly similar behavior in GPT-4o variants.
- **Used in:** `book/prose-style.md`; `book/scripts/audit-prose.mjs`.
- **Version/access:** COLING 2025; accessed 2026-09-02.
- **Reuse note:** The focal list comes from scientific English and particular model versions. Treat each match as an editing prompt, not evidence of authorship.

### [STYLE-06] Cross-genre human–LLM writing comparison

- **Source:** Alex Reinhart, Ben Markey, Michael Laudenbach, Kachatad Pantusen, Ronald Yurko, Gordon Weinberg, and David West Brown, “Do LLMs Write Like Humans? Variation in Grammatical and Rhetorical Styles,” *Proceedings of the National Academy of Sciences* 122, no. 8 (2025), <https://doi.org/10.1073/pnas.2422455122>.
- **Type:** Peer-reviewed parallel-corpus study.
- **Supports:** Instruction-tuned LLM output differed from matched human writing across genres in vocabulary and structure, including overrepresented lexical items, participial clauses, nominalizations, phrasal coordination, and a denser noun-heavy style.
- **Used in:** `book/prose-style.md`; `book/scripts/audit-prose.mjs`.
- **Version/access:** Published 2025-02-18; accessed 2026-09-02.
- **Reuse note:** Relative frequencies depend on model and genre. Structural tendencies belong in human review; the mechanical audit uses only a small lexical subset.

### [STYLE-07] AI-associated vocabulary in public webpages

- **Source:** Pew Research Center, “How Much of the Internet Is Written With AI?” <https://www.pewresearch.org/data-labs/2026/08/20/how-much-of-the-internet-is-written-with-ai/>.
- **Type:** Research-center analysis of 490,000 English-language webpages sampled from Common Crawl.
- **Supports:** Corpus-level growth in AI-associated vocabulary, em dashes, Oxford commas, and negative parallelism from 2023 through 2026; provides a current web-writing vocabulary list beyond academic prose.
- **Used in:** `book/prose-style.md`; `book/scripts/audit-prose.mjs`.
- **Version/access:** Published 2026-08-20; accessed 2026-09-02.
- **Reuse note:** The analysis partly uses a detector and reports aggregate trends. Individual words, punctuation marks, and passages are not proof of AI authorship.

### [STYLE-08] AI-associated lexical change in PubMed

- **Source:** Kentaro Matsui, “Delving Into PubMed Records: How AI-Influenced Vocabulary Has Transformed Medical Writing Since ChatGPT,” *Perspectives on Medical Education* 14, no. 1 (2025): 882–890, <https://doi.org/10.5334/pme.1929>.
- **Type:** Peer-reviewed structured review and longitudinal PubMed vocabulary analysis.
- **Supports:** Review-derived candidate vocabulary and post-2022 frequency changes across PubMed records; the largest reported increases included forms of *delve*, *underscore*, *meticulous*, and *boast*.
- **Used in:** `book/prose-style.md`; `book/scripts/audit-prose.mjs`.
- **Version/access:** Published 2025-12-02; accessed 2026-09-02.
- **Reuse note:** Temporal association does not identify the cause of any individual occurrence. The domain is medical writing and the candidate-term selection itself can introduce bias.

### [STYLE-09] Limits of fixed AI-vocabulary lists

- **Source:** Veronica Juliana Schmalz and Anaïs Tack, “Can GPTZero’s AI Vocabulary Distinguish Between LLM-Generated and Student-Written Essays?” *Proceedings of the 20th Workshop on Innovative Use of NLP for Building Educational Applications* (2025): 937–952, <https://aclanthology.org/2025.bea-1.71/>.
- **Type:** Peer-reviewed evaluation of vocabulary-based classification.
- **Supports:** Fixed vocabulary features had limited effectiveness across writing sources, performed much better on ChatGPT essays than Claude essays, and underperformed classifiers using the corpus's full vocabulary.
- **Used in:** `book/prose-style.md`; design of density warnings in `book/scripts/audit-prose.mjs`.
- **Version/access:** Published 2025-07-31; accessed 2026-09-02.
- **Reuse note:** This is the reason the project uses vocabulary for editorial review rather than authorship detection, and treats common words by density rather than presence.

---

## Visual-production references

### [VIS-01] fal.ai Nano Banana 2 API

- **Source:** fal.ai, “Nano Banana 2 (Gemini 3.1 Flash Image) — API,” <https://fal.ai/models/fal-ai/nano-banana-2/api>.
- **Type:** Official hosted-model API documentation.
- **Supports:** Endpoint name and request schema; 1K, 2K, and 4K output modes; prompt-based text rendering; generation settings used for the replacement cover and editorial-cartoon pass.
- **Used in:** Visual theme; visual brief; `book/scripts/generate-fal-art.mjs`; image provenance manifest and gallery.
- **Version/access:** Accessed 2026-08-25; production endpoint is an alias rather than a pinned immutable revision.
- **Reuse note:** Generated images require normal editorial and rights review. Retain request IDs, prompts, hashes, and generation disclosures; do not claim byte-for-byte reproducibility from an alias endpoint.

---

## Publication reference audit

Completed 2026-08-25:

- Manuscript source IDs are reconciled with `references.md`.
- Academic claims are tied to the paper revisions recorded above.
- Repository implementation claims are tied to resolved commits.
- The four sustained benchmark papers were checked against their current arXiv versions.
- This edition reproduces no third-party trace, benchmark prompt, repository code, paper figure, interface screenshot, or logo.
- New sources added during the final revision appear in both this codex and the reader bibliography.

For a later edition, recheck mutable documentation, hosted datasets, repository heads, and company engineering reports. Existing claims remain tied to the versions recorded here.
