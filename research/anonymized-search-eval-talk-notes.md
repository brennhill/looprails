# Anonymized Multilingual Search-Evaluation Field Report

**Source status:** A private copy of slides from a public talk, reviewed 2026-09-02. The organization and speaker must remain anonymous. This note is editorial research, not a citable publication.

**Allowed reader-facing attribution:** “In public talks about its evals, a major international delivery company described…”

**Never publish from this source:** the organization or speaker; brands, markets, or venue; the deck title; screenshots or slide wording; model-vendor scorecards; exact sample sizes, rates, costs, thresholds, timelines, or staff details; distinctive example queries.

## What the talk contributes

The case concerns multilingual search-relevance evaluation at large operational scale. The team used human labels to align and check an LLM evaluator, then expanded the evaluator across languages, markets, and product categories. The most useful material is not the unpublished scorecard. It is what the team changed after reading its failures.

### 1. Audit the mismatch, not only the model

The team rereviewed human–model disagreements and separated them into:

- candidate errors, where the model's answer did not fit the evidence and current rule;
- label errors, where the original human label did not fit the evidence or rule;
- genuine ambiguity, where the evidence or product definition allowed more than one defensible answer.

Each bucket implies different work. Candidate errors suggest a system intervention. Label errors require dataset repair and review-process inspection. Ambiguity may require better context, a product decision, an abstention label, or an explicit ambiguity rate.

### 2. Treat labeling as a versioned workflow

The reported workflow used independent double review for calibration material and a third reviewer when the first two disagreed. Labelers supplied explicit reasoning, and repeated failures caused the guidance to change. Some review queues used an LLM pre-label as a draft for the person.

The book adds one caution not established by the talk: a visible pre-label can anchor the reviewer. A blind audit slice can test whether speed came with changed labels. For high-consequence gold data, preserve at least some independent human labels before revealing the model's answer.

### 3. Split on the source of resemblance

An early fine-tuning experiment used a random row split even though many rows shared a search query. The team later kept query groups separate across training and evaluation. The apparent result changed.

The reusable rule is broader than search: choose a split key for the smallest parent that can leak recognizable information across rows. Examples include a source document, conversation, user episode, repository, issue family, environment snapshot, or synthetic seed. Assert zero group overlap when the intended claim is generalization to unseen groups.

### 4. Track the profile, not only agreement

The experiments tracked overall human agreement alongside inter-rater agreement, operational cost, latency, and slices such as traffic frequency, query type, class, and language. Failure reading exposed problems tied to local entity knowledge, name-based shortcuts, transliteration or alias handling, multi-intent requests, class imbalance, and tail ambiguity.

These are prompts for product-specific slicing, not a universal checklist. A team's slices should come from its own population and failure taxonomy.

### 5. Compare interventions on one exam

The team compared changes to prompts, context, language, model choice, and fine-tuning. The field report suggests that better context and cleaner labels sometimes mattered more than moving to a larger model, and that a smaller tuned model could be attractive on a stable narrow task. The unpublished numbers cannot establish those claims generally.

The book's stronger formulation remains: freeze the task and operating constraints, test contract and context changes, preserve a group-aware holdout, and compare frontier, harnessed, tuned, and hybrid systems on the same evidence.

### 6. Close the operating loop

The talk showed a scheduled path from sampling through context collection, judgment, storage, dashboards, targeted human review, and refreshed guidance. It also described routing harder or disputed cases to stronger models or people. This supports the book's outer-loop design, although the talk does not publish enough operational detail for a reproducible case study.

## Where the book uses it

- Chapter 7: the three-way disagreement audit and layered labeling workflow.
- Chapter 13: group-aware splitting and an explicit overlap assertion.
- Exercise 6: disagreement disposition before adjudication.
- Template 7: split key, overlap, annotation mode, blind audit slice, and disagreement counts.

## Claims deliberately left out

- all performance and human-agreement percentages;
- any universal annotation-count rule;
- comparative claims about named models;
- cost ratios or price claims;
- a causal claim that one intervention produced the reported gain;
- a claim that the workflow is independently validated or reproducible from the slides.
