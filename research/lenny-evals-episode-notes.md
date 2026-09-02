# Research note: Hamel Husain and Shreya Shankar on Lenny's Podcast

**Source ID:** [MEDIA-01]  
**Episode:** “Why AI evals are the hottest new skill for product builders”  
**Published:** 2025-09-25  
**Duration:** 1:46:33  
**Reviewed:** 2026-09-01  
**Source:** <https://www.youtube.com/watch?v=BsWxPI9UM4c>  
**Publisher page:** <https://www.lennysnewsletter.com/p/why-ai-evals-are-the-hottest-new-skill>

## Why this is high-value

This is not merely an interview about why evals matter. Husain and Shankar inspect anonymized traces from a property-management assistant, write open notes, build a failure taxonomy, draft a narrow judge, and test that judge against human labels. The screen-shared worked example makes several abstract parts of the book concrete.

The source remains practitioner evidence. It shows a credible process and the judgment behind it; it does not establish universal sample sizes, staffing levels, or causal effect sizes.

## Transcript handling

The review used YouTube's English automatic captions, checked against the publisher's chapter list and episode notes. Automatic captions contain speaker-name and word-recognition errors. No long verbatim passages should enter the book. The production traces shown on screen should be described only at the level needed to explain the method.

## High-signal findings

### 1. A truthful response can still fail the product

In the property-management walkthrough, the assistant correctly reports that a requested unit is unavailable and then ends the interaction. The local product requirement is to continue helping the prospective renter. Another trace offers a virtual-tour capability the product does not support.

The pair is useful because it defeats generic labels. One output can be factually correct but fail the user journey; another can sound helpful while inventing a capability. A domain owner sees both because she knows the product contract.

**Book use:** Chapter 2 opening vignette.  
**Timestamp:** 09:56–16:51.

### 2. Open coding should capture the first upstream departure

The initial human review writes short, descriptive notes rather than forcing traces into a prepared rubric. For a long trace, the reviewers focus on the first failure that changes the path; downstream symptoms often share that cause. Notes need enough local detail to support later grouping. A label such as “janky” is cathartic but not operational.

The initial observation should come from a product or domain expert. A model can recognize generic oddness, but it may not know that the business cannot provide a tour or that the assistant should preserve a sales opportunity.

**Book use:** Already substantially covered in Chapters 2 and 8. The episode strengthens the rationale and supplies the vignette.  
**Timestamp:** 16:51–25:16.

### 3. One standard owner can keep early discovery moving

The speakers describe a “benevolent dictator”: a trusted domain expert whose judgment sets the current product standard during the first analysis. This avoids turning early discovery into committee negotiation.

The phrase should not become a universal governance prescription. For consequential or contested criteria, the book's existing independent review and adjudication process remains appropriate. The durable point is that somebody with product authority must resolve the standard.

**Book use:** Already captured by the named product/domain owner and decision owner in Chapter 14. No new section needed.  
**Timestamp:** 25:16–28:07.

### 4. Saturation is about discovery, not measurement

There is no magic number of traces. Continue sampling until additional, varied traces stop revealing categories or changing what the team would do next. This is theoretical saturation.

The distinction matters:

- Saturation can tell a team that its current taxonomy is no longer changing.
- It cannot estimate category prevalence.
- It cannot compensate for missing strata or repetitive input.
- A count such as one hundred is a practitioner starting heuristic, not a statistical guarantee.

**Book use:** Chapter 2; Exercise 2; Template 4.  
**Timestamp:** 28:07–31:39.

### 5. Automate clustering after human observation

After humans write open notes, an LLM can propose axial codes: clusters that become the first failure taxonomy. Humans then merge, split, rename, and reject the suggestions. A `none of the above` or `other / not yet classified` label prevents the automated taxonomy from forcing every new case into an old box.

Counts from the categorized notes help establish frequency within the reviewed sample, but severity and consequence still affect priority. Some failures warrant an immediate engineering fix; not every note deserves a model judge.

**Book use:** Chapter 2; Exercise 2; Template 4.  
**Timestamp:** 31:39–46:06.

### 6. Judge agreement can look excellent while the judge is useless

The worked judge is narrow and binary. The speakers compare it with human labels and inspect false positives and false negatives separately. Their memorable base-rate example is elementary and important: with ten failures in one hundred cases, an always-pass judge achieves ninety-percent agreement while detecting no failures.

This supports the book's confusion-matrix treatment and gives a cleaner reason not to report agreement alone.

**Book use:** Chapter 7.  
**Timestamp:** 46:06–1:00:51.

### 7. Evals can act as living product requirements

The phrase “evals are the new PRDs” is useful only with a boundary. Evals do not replace intent, product design, policy, or discovery. They make observed requirements executable and revise them as trace review exposes missing distinctions. This matches EvalGen's criteria-drift result [JUDGE-02].

**Book use:** Chapter 7, under criteria drift.  
**Timestamp:** 1:00:51–1:05:09.

### 8. Dogfooding is a sample with unusual selection effects

Developer tools are unusually easy to dogfood well: the builders are frequent users, understand the domain, inspect the generated artifact, and can diagnose failures. Other products may be built by people unlike their users, and ordinary users lack privileged debugging access.

Dogfood is therefore valuable discovery data, not a population estimate and not a replacement for domain review or representative sampling.

**Book use:** Chapter 12.  
**Timestamp:** 1:15:15–1:18:23.

### 9. Experiments should begin with observed product failures

Offline evals, production metrics, and controlled experiments answer different questions. A/B tests are more useful when the hypothesis comes from observed trace failures and a credible outcome chain. Otherwise, randomization can cleanly answer an irrelevant question.

**Book use:** Chapter 12, controlled experiments.  
**Timestamp:** 1:07:41–1:09:57 and 1:18:23–1:23:02.

## Useful, but not promoted to book rules

The episode includes several concrete counts and time estimates. Preserve them as the speakers' experience, not reader instructions:

- roughly one hundred traces as a mental unblock for an initial analysis;
- different real analyses reaching saturation after very different counts;
- several narrow model judges rather than a single overall judge;
- a few days of initial setup followed by a short weekly review;
- simple notebooks, spreadsheets, and pivot tables as sufficient starting tools.

These examples make the practice feel attainable. They do not supply a staffing model, confidence guarantee, release threshold, or service-level objective.

## Material deliberately omitted

- promotional claims about the course and number of students;
- speculation about particular companies' internal eval practices;
- the surrounding social-media debate except where it clarifies definitions;
- exact customer trace text or screenshots;
- claims about how much eval work every team should perform;
- generic recommendations already covered more precisely by published papers or engineering reports.

## Integration summary

| Finding | Destination | Action |
|---|---|---|
| Truthful but product-wrong response | Chapter 2 | Added short vignette |
| Theoretical saturation | Chapter 2 | Added with sampling caveat |
| Human notes, model-assisted clustering | Chapter 2 | Added division of labor |
| Fallback taxonomy label | Chapter 2, Exercise 2, Template 4 | Added |
| Agreement base-rate trap | Chapter 7 | Added numerical example |
| Living executable requirements | Chapter 7 | Added with PRD boundary |
| Dogfood selection effects | Chapter 12 | Added subsection |
| Failure-grounded A/B hypothesis | Chapter 12 | Added sentence |
| Named domain standard owner | Chapter 14 | Already present; no duplication |
| Personal counts and time estimates | Codex/research note | Retained with caution only |
