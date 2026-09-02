# Measure Twice, Prompt Once — Diagram and Cartoon Brief

**Status:** Living editorial design brief; technical figures are generated, The Cherry-Picked Demo is the current cover, and a second robot-measurement cover round is under review  
**Prepared:** 2026-08-24  
**Manuscript build reviewed:** 238-page KDP interior, 6×9 inches

This document records every strong visual opportunity discovered after the complete manuscript was drafted and rendered. It is intentionally separate from the book so design can happen as one coherent pass. Figure placement should be finalized only after sketches are tested at actual print size.

## 1. Visual job

The art must make relationships easier to understand, not decorate pages that already work.

The book has four recurring visual ideas:

1. Two loops operating at different speeds.
2. Truth living outside fluent output.
3. Evidence getting stronger as a grader moves closer to consequence.
4. Production failures becoming durable organizational memory.

Diagrams should carry the technical argument. Cartoons should release pressure and make anti-patterns memorable. They should never trivialize clinical, safety, privacy, or incident material.

## 2. Art direction

The named visual system is **Evidence Workshop**. Its complete palette, typography, recurring cast, cover direction, and generation rules live in `visual-theme.md`.

Match the current print system:

- **Navy `#17324D`:** system structure, labels, primary lines.
- **Copper `#A85F32`:** decisions, active paths, failure highlights.
- **Gold `#C6922A`:** evidence, checkpoints, small emphasis.
- **Warm paper `#FCFAF6`:** standard PDF background; art must also work on white KDP stock.
- **Muted gray `#6B7280`:** context, inactive paths, secondary annotation.

### Diagram style

- Flat vector SVG, no gradients required.
- Strong silhouettes and simple geometry.
- One visual argument per figure.
- Labels remain legible at 4.6 inches wide.
- Minimum effective print type approximately 8.5 pt.
- Use line style and shape as well as color; figures must survive grayscale printing and color-vision differences.
- Avoid screenshots of vendor UIs. They age quickly and reproduce poorly.
- Avoid tiny dashboard mockups full of fictional numbers.
- Prefer direct labels over legends.
- Give every figure a one-sentence takeaway caption.

### Cartoon style

- Contemporary 2020s digital editorial cartoon, one or two panels: crisp vector-like shapes, smooth outlines, restrained soft shadows, bright negative space, and no retro texture.
- Recurring characters: an earnest soft-square agent robot, a practical modern product engineer, an unimpressed database, and occasionally a geometric model judge with a clipboard.
- Gentle absurdity rather than snark at users or practitioners.
- Minimal dialog; the exact caption should carry the idea even if dialog is omitted in an audiobook or accessible edition.
- No anthropomorphic medical patient data, security incidents, or real company failures.
- Explicitly avoid sepia, dry brush, cross-hatching, mid-century advertising, 1970s instructional art, retro-futurism, and invented text.

### Asset convention

```text
book/images/
  diagrams/
    ch01-01-demo-vs-product.svg
    ch05-01-grader-ladder.svg
  cartoons/
    ch01-01-dashboard.svg
  source/
    [editable design source if not SVG-native]
```

Number by chapter and order of intended appearance. Keep SVG as the print source of truth. Export PNG only for formats that require it. Add figure alt text and source/adaptation notes to an adjacent metadata file or a central image manifest.

## 3. Cover cartoon concepts

The cover needs one visual joke and one technical idea. It should read in this order at thumbnail size: title, joke, loop. The joke is that a polished example is not yet evidence; the loop is the varied queue of cases passing through measurement and returning to the agent.

### Selected — The Cherry-Picked Demo

An earnest robot proudly presents one perfect cherry under a ludicrously grand spotlight. Just behind it, an engineer points to the actual work: a mixed queue of tasks, documents, tools, and one unruly rubber duck passing through two measurement gates and looping back.

This is the strongest cover because the joke lands before the reader knows the vocabulary. The cherry carries “cherry-picked demo,” the gates carry evals, and the returning queue carries the book's central loop. Keep the robot pleased rather than foolish; the target is demo culture, not the person running the demo.

**Generated proof:** `images/cover/source/nano-banana-2/cover-cherry-picked-demo.png`

### Alternate — The Megaphone and the Calipers

The robot arrives with an absurdly large prompting megaphone. The engineer has brought modest calipers and a state-checking gauge. The contrast makes the title's “prompt once” half visible, though the product-evaluation story is a beat less immediate.

**Generated proof:** `images/cover/source/nano-banana-2/cover-megaphone-and-calipers.png`

### Alternate — The One-Question Exam

The robot celebrates one pristine answer while the engineer opens a curtain on the long, varied queue still waiting. This is warm and charming, but it needs the title to make the measurement argument fully legible.

**Generated proof:** `images/cover/source/nano-banana-2/cover-one-question-exam.png`

All three proofs use the Nano Banana 2 cover system recorded in `scripts/generate-fal-art.mjs`. The final wrap should preserve the winning central illustration, then be rebuilt to the exact KDP spine width after pagination is locked.

### Round 2 — Measure the robots

This round makes the agent itself the object under test and increases the background comedy. The foreground robot earns trust by checking evidence; it is not simply painted a more heroic color.

**Review sheet:** `../output/cover/cover-concepts-round-2.png`

#### A — Robot Under the Calipers

A giant caliper measures the foreground robot while three small robots wait with minor defects and orientation problems.

**Assessment:** Strongest literal title connection and best single silhouette. It may imply physical specification more than behavioral evaluation, but the joke lands instantly.

**Generated proof:** `images/cover/source/nano-banana-2/cover-robot-under-the-calipers.png`

#### B — Robot Inspection Day

The foreground robot checks an evidence card after passing a body-sized measurement gate. Behind it, one robot tries the gate sideways, another points the wrong way, and one holds a loose wheel.

**Assessment:** Cleanest balance of measurement, agent behavior, and restrained comedy. Less immediately funny than A, C, or F.

**Generated proof:** `images/cover/source/nano-banana-2/cover-robot-inspection-day-v2.png`

#### C — The Obstacle Course

One robot checks the actual drawer state at a checkpoint. Background robots bump a glass panel, circle a cone, and celebrate beside the wrong pedestal.

**Assessment:** Funniest ensemble and clearest expression of evaluation across behavior. Slightly busier at thumbnail size, though the foreground robot remains dominant.

**Generated proof:** `images/cover/source/nano-banana-2/cover-robot-obstacle-course.png`

#### D — The Glass Wall

One robot probes for the opening while others bump the transparent partition or follow themselves in a circle.

**Assessment:** Charming and readable at full size, but the glass metaphor is narrower and the scene feels younger than the rest of the book. Weakest candidate in this round.

**Generated proof:** `images/cover/source/nano-banana-2/cover-glass-wall-test.png`

#### E — The Careful One

The foreground robot measures its own work. Behind it, robots push the wrong side of a door, carry a blinding stack of parcels, and stamp a result before closing the drawer.

**Assessment:** Closest to the requested “one good robot in front, silly robots behind” brief. Warm, conversational, and broad enough to cover the whole book.

**Generated proof:** `images/cover/source/nano-banana-2/cover-the-careful-one.png`

#### F — The Wrong Finish Line

The foreground robot verifies the completed state at a measurement gate while three robots celebrate a premature finish behind it.

**Assessment:** Strongest outcome-versus-announcement joke. It combines the book's measurement theme with a memorable little failure of organizational enthusiasm.

**Generated proof:** `images/cover/source/nano-banana-2/cover-wrong-finish-line.png`

The first `Robot Inspection Day` draft is retained for provenance but rejected because the generated title included an unwanted opening quotation mark. The `v2` proof replaces it in review materials.

### Round 3 — Caliper variations

The user preferred Round 2 concept A, so this round keeps the robot under measurement and tests five tighter variations against the original.

**Review sheet:** `../output/cover/cover-concepts-calipers-round-3.png`

- **A0 — Original Favorite:** Still friendly and direct. The engineer overlaps the instrument more than necessary, and “twice” remains implicit.
- **A1 — Measured Twice:** A vertical height gauge and horizontal caliper measure the same robot. Best connection to the exact title and the recommended candidate from this round.
- **A2 — Caliper Lineup:** Clear inspection story, but the humanoid robot design drifts from the recurring soft-square cast and the joke is mild.
- **A3 — Self-Check:** **Selected cover direction.** Funniest image and strongest background comedy. The self-measurement is the visual joke; the bungling robots behind it keep the scene from reading as a serious endorsement of self-certification.
- **A4 — Clean Workshop:** Best pure refinement of A0. The robot is larger, the engineer no longer blocks it, and background failures reward a second look. Recommended runner-up.
- **A5 — Double Portrait:** Clean and pleasantly odd, with no foreground engineer. The horizontal caliper appears to pass through the robot, making the physical metaphor slightly less natural.

**Generated proofs:**

- `images/cover/source/nano-banana-2/cover-calipers-measure-twice.png`
- `images/cover/source/nano-banana-2/cover-calipers-lineup.png`
- `images/cover/source/nano-banana-2/cover-calipers-self-check.png`
- `images/cover/source/nano-banana-2/cover-calipers-workshop.png`
- `images/cover/source/nano-banana-2/cover-calipers-double-portrait.png`

Two close-up attempts are retained for provenance but rejected. Both added an unwanted opening quotation mark to the title despite explicit negative instructions; the first also placed the author name across the robot. The close-up composition remains viable if final typography is composed deterministically rather than generated into the illustration.

**Decision:** A3 — Self-Check is the approved front-cover artwork for the EPUB and KDP build pipelines.

## 4. Recommended figure set

The priorities assume a practical first edition:

- **P0:** build before publication; central to the argument.
- **P1:** high value; build if page budget and design time allow.
- **P2:** optional or online companion.

### P0-1 — The nested loops

**File:** `diagrams/ch10-01-nested-loops.svg`  
**Primary chapter:** 10, immediately after the opening definitions of the inner and outer loops  
**Earlier preview:** A simplified version may appear in the Preface; avoid duplicating the full figure.

**Purpose:** Hero model of the book.

**Composition:**

- Small clockwise inner loop: `Observe → Decide → Act → Verify → Continue / Stop`.
- Larger clockwise outer loop surrounding it: `Sample → Analyze → Encode → Compare → Decide → Production`.
- Five bridges across the rings: `Task contracts`, `Verification functions`, `Traces`, `Budgets`, `Runtime/release rules`.
- Copper path from production failure through the outer loop and back into the inner verifier.
- Different clock icons or line weights show seconds/minutes for the inner loop and days/weeks for the outer loop.

**Caption:** “The inner loop performs the task. The outer loop improves the task performer. Evidence is the seam.”

**Alt text:** Two concentric cycles: a fast agent cycle inside a slower product-evaluation cycle, connected by task, grader, trace, budget, and rule artifacts.

### P0-2 — The grader ladder

**File:** `diagrams/ch05-01-grader-ladder.svg`  
**Placement:** Chapter 5, after the six rungs.

**Purpose:** Make the book's core selection rule memorable.

**Composition:** Six ascending steps:

1. Environment oracle
2. Executable test or invariant
3. Structured evidence
4. Deterministic rule
5. Model judge
6. Expert judgment

Left-side arrow: `More direct / repeatable / cheap at scale` toward the bottom. Right-side arrow: `More flexible / interpretive / expensive` toward the top. A small figure climbs only until it reaches the answer, with a sign: “Stop when evidence is strong enough.”

**Caption:** “Use the least magical grader that can answer the criterion.”

**Design caution:** Do not imply experts are lower quality. The vertical movement represents interpretive scope and cost, not prestige.

### P0-3 — Four kinds of truth

**File:** `diagrams/ch04-01-four-truths.svg`  
**Placement:** Chapter 4, after the introductory “Where does truth live?” examples.

**Purpose:** Unite the sustained case studies.

**Composition:** Four workbenches arranged around one fluent agent output in the center:

- SWE-bench: patch → tests/repository state.
- τ-bench: promise → database/action state.
- HealthBench: response → case-specific expert criteria.
- DeepResearch Bench: claim → cited source passage.

Arrows point outward from output to evidence. The center speech bubble is deliberately not labeled truth.

**Caption:** “The output tells you what the agent said. The workbench tells you where to verify it.”

### P0-4 — Anatomy of an eval task

**File:** `diagrams/ch03-01-task-anatomy.svg`  
**Placement:** Chapter 3, after “The anatomy of a task.”

**Purpose:** Show that an eval task is more than a prompt.

**Composition:** Horizontal contract:

`Purpose → Setup → Input → Execution limits → Expected evidence → Metadata/owner`

Below, a bracket labeled `Harness` spans setup through evidence. A separate line shows version dependencies: policy, tools, model, grader, environment.

**Caption:** “A prompt is one field in a task contract.”

### P0-5 — Annotated trace and first departure

**File:** `diagrams/ch08-01-trace-first-departure.svg`  
**Placement:** Chapter 8, after the five-pass reading method.

**Purpose:** Teach the trace-reading method visually.

**Composition:** One left-to-right timeline with six events. The final failure appears at the right, while the earliest unsafe inference is marked in copper at event three. Parallel lanes show:

- conversation;
- tool/action event;
- environment state;
- grader evidence.

At the bottom, five review tabs: Contract, Outcome, First departure, Recovery, Grader.

Use the fictional duplicate booking-change trace, not a benchmark item.

**Caption:** “The visible failure is at the end. The actionable departure is often earlier.”

### P0-6 — pass@k versus pass^k

**File:** `diagrams/ch09-01-pass-at-vs-power.svg`  
**Placement:** Chapter 9, after the `.75`, `k=3` example.

**Purpose:** Make the reliability contrast immediate.

**Composition:** Two three-card sequences.

- Top: three candidates feeding a selector; only one must be green. Label `pass@3 = 98.44%`.
- Bottom: three user tasks in sequence; every card must be green. Label `pass^3 = 42.19%`.

Same 75 percent per-attempt badge on both sides.

**Caption:** “A nearly certain demo and a worse-than-even user journey can come from the same per-task score.”

### P0-7 — Evaluation funnel

**File:** `diagrams/ch11-01-eval-funnel.svg`  
**Placement:** Chapter 11, after the five funnel stages.

**Purpose:** Map checks to release time and cost.

**Composition:** Funnel or ascending gates:

`Local smoke → PR regression → Nightly capability → Held-out audit → Production rollout`

Annotate each with approximate speed, suite type, and blocking behavior. A side arrow shows fewer candidates and stronger evidence as the system moves right. Production loops back to task discovery rather than terminating.

**Caption:** “Fast checks protect iteration; deeper evidence protects release; production starts the next cycle.”

### P0-8 — Dataset lifecycle

**File:** `diagrams/ch13-01-dataset-lifecycle.svg`  
**Placement:** Chapter 13, before “Retiring a benchmark.”

**Purpose:** Normalize benchmark maintenance and retirement.

**Composition:** Circular lifecycle:

`Production failure → Candidate case → Fairness/review → Capability suite → Regression suite → Saturation/staleness/leakage audit → Refresh or retire`

Show separate exits for `invalid—fix history`, `solved—regression only`, and `misaligned—retire`.

**Caption:** “An eval suite is maintained evidence, not a permanent monument.”

### P0-9 — Ownership map and clocks

**File:** `diagrams/ch14-01-ownership-cadence.svg`  
**Placement:** Chapter 14, between the seven owners and the three-column responsibility table.

**Purpose:** Show central mechanics, local truth, and recurring cadence in one view.

**Composition:**

- Center: `Eval artifacts`—tasks, graders, traces, decisions.
- Inner owners: product, engineering, domain expert.
- Supporting ring: platform, data science, risk.
- Decision owner at the release arrow.
- Four small clock badges: every change, nightly, weekly, monthly/quarterly.

**Caption:** “Centralize the mechanics. Keep the meaning of good with the domain. Put both on a clock.”

### P0-10 — The first thirty days

**File:** `diagrams/ch15-01-thirty-day-plan.svg`  
**Placement:** Chapter 15, after the opening deliverables.

**Purpose:** Provide a one-page implementation memory aid.

**Composition:** Four weekly columns:

- Discover: traces, evidence, taxonomy, 20 cases.
- Encode: contracts, grader map, deterministic checks, rubric.
- Measure: baseline, calibration, paired comparison, release rule.
- Operate: CI/nightly, held-out audit, controlled shadow or rollout evidence, ownership.

Bottom rail shows accumulating artifacts rather than tasks vanishing each week.

**Caption:** “A month can establish one minimum viable eval loop; consequence sets the release pace.”

## 5. P1 figure set

### P1-1 — Demo question versus product questions

**File:** `diagrams/ch01-01-demo-vs-product.svg`  
**Placement:** Chapter 1, after the opening question lists.

One spotlighted demo case on the left; a field of varied production cases on the right. The demo asks “Can it work once?” Production adds variation, truth, repetition, safety, and learning.

**Caption:** “The demo is a valid answer to a smaller question.”

### P1-2 — Discovery sample versus measurement sample

**File:** `diagrams/ch02-01-two-samples.svg`  
**Placement:** Chapter 2, after the distinction is introduced.

Two baskets drawn from production: a mixed, failure-enriched discovery basket and a probability-sampled measurement basket. Labels show `What can fail?` versus `How often?`.

**Caption:** “Use enriched samples to discover categories and representative samples to estimate rates.”

### P1-3 — Grader stack for one service task

**File:** `diagrams/ch05-02-composite-grader.svg`  
**Placement:** Chapter 5, after the composite result JSON.

State, authorization, action history, communication judge, cost, and latency feed a structured result. Hard gates remain separate from quality dimensions.

**Caption:** “Do not let beautiful communication average away an unauthorized action.”

### P1-4 — Four attacks on an executable grader

**File:** `diagrams/ch06-01-test-the-test.svg`  
**Placement:** Chapter 6, after the four attacks.

Four quadrants: narrow pass, overconstraint, side-effect escape, environment trick. Each shows a simple visual exploit and one audit question.

**Caption:** “Every executable oracle needs cases that test the oracle.”

### P1-5 — Judge calibration pipeline

**File:** `diagrams/ch07-01-judge-calibration.svg`  
**Placement:** Chapter 7, after the confusion matrix.

`Expert labels → Adjudication → Development split → Judge → Confusion matrix by category → Allowed scope / human route → Drift audit`.

Use the synthetic `36/5/10/49` matrix in a readable inset.

**Caption:** “Calibration decides where the judge may be trusted, not whether it is universally good.”

### P1-6 — Paired comparison

**File:** `diagrams/ch09-02-paired-disagreements.svg`  
**Placement:** Chapter 9, after the 100-task table.

One hundred dots grouped as both pass 62, new-only 18, old-only 8, both fail 12. Visually emphasize the 26 discordant cases.

**Caption:** “The average says plus ten. The 26 disagreements explain the change.”

### P1-7 — Clustered evidence

**File:** `diagrams/ch09-03-clusters.svg`  
**Placement:** Chapter 9, after the five-documents/fifty-questions example.

Fifty question dots nested in five document shapes. Contrast naive 50 independent dots with five shared-error families.

**Caption:** “Fifty rows from five documents are not fifty independent worlds.”

### P1-8 — Offline-to-online outcome chain

**File:** `diagrams/ch12-01-outcome-chain.svg`  
**Placement:** Chapter 12, after the outcome-chain table.

`Offline criterion → Near-term behavior → Product outcome`, with each arrow labeled hypothesis and a production experiment feeding evidence back.

**Caption:** “An offline metric is a proxy until production validates the arrows.”

### P1-9 — Production evidence layers

**File:** `diagrams/ch12-02-production-layers.svg`  
**Placement:** Chapter 12, after online evaluation layers.

Swiss-cheese style layers: runtime guard, asynchronous grader, representative sample, risk review, delayed outcome, controlled experiment. Holes differ across layers; no one layer covers the system.

**Caption:** “Independent evidence layers fail differently.”

### P1-10 — Eval failure wheel

**File:** `diagrams/ch13-02-eval-failure-wheel.svg`  
**Placement:** Chapter 13 opening spread.

Eight segments: gaming, wrong contract, contamination, saturation, stale truth, judge drift, proxy divorce, metric collapse. Center: “The eval is part of the system.”

**Caption:** “Measurement needs monitoring, adversaries, owners, and an exit plan.”

### P1-11 — Four-case comparison card

**File:** `diagrams/app-c-01-four-case-card.svg`  
**Placement:** Appendix C, replacing the current five-column comparison table if the figure proves more legible.

Four vertical cards with artifact, strongest truth, key grader risk, and maintenance lesson. This may be more print-friendly than the current narrow table.

### P1-12 — Buy brains or build rails?

**File:** `diagrams/ch10-02-model-harness-tuning.svg`  
**Placement:** Chapter 10, after “Run the race in the right order.”

Three workshop levers feed the same fixed test track:

- a large rented engine labeled `frontier model`;
- a set of rails, signals, and gauges labeled `task contract + harness`;
- a compact engine being adjusted with a small wrench labeled `tuned open weights`.

The test track ends in five gauges: schema validity, field correctness, whole-record correctness, latency, and cost per accepted record. A hybrid switch routes difficult cases from the compact engine to the large one. Keep the metaphor subordinate to the flow; readers should understand the comparison even if the labels are read without the art.

**Caption:** “Compare complete systems on one held-out track. Model reputation is not a product metric.”

**Alt text:** Three interventions—a frontier model, a custom harness, and tuned open weights—are compared on the same held-out dataset, with a hybrid route for difficult cases.

### P1-13 — Choose the review unit

**File:** `diagrams/ch02-02-review-unit.svg`  
**Placement:** Chapter 2, after “Name the thing being reviewed.”

A nested zoom control moves from `task outcome → thread → trace → turn → generation span → response`. One target is outlined in copper while surrounding context remains visible in gray. A label tag attaches to the highlighted target, not to the whole nest.

**Caption:** “Keep the context wide and the annotation target precise.”

**Alt text:** Nested review units from task outcome down to one response, with one exact target highlighted while its broader context remains visible.

### P1-14 — ParcelPath's complete loop

**File:** `diagrams/app-e-01-parcelpath-loop.svg`  
**Placement:** Appendix E, after “Meet ParcelPath.”

Seven stations share one evidence rail: `Production trace → Expert labels → Replay cases → Composite grader → Calibrated judge → Product change → Controlled outcome`. A maintenance arrow carries a new carrier status from production back to the contract, cases, and judge. Each station displays its owner rather than a generic team icon.

**Caption:** “A complete eval loop changes the product, checks the outcome, and remains available for the next surprise.”

**Alt text:** ParcelPath's fictional evaluation loop moves from production traces through expert labels, replay cases, graders, intervention, and controlled outcomes, then returns new production evidence to the maintained artifacts.

## 6. Cartoon ideas

Cartoons are P1 unless marked P2. Aim for six to eight in the first edition; more can live online.

### C1 — The green dashboard

**File:** `cartoons/ch01-01-green-dashboard.svg`  
**Placement:** Chapter 1 near “the dashboard may be measuring the dashboard.”

**Panel:** Product team faces a glowing green dashboard. Through the window behind it, a small agent is repeatedly dropping boxes labeled “user outcome.”

**Dialog:** Engineer: “Good news. The dashboard is healthy.”

**Caption:** “A green proxy is not a green product.”

### C2 — Capital letters as measurement

**File:** `cartoons/preface-01-capital-letters.svg`  
**Placement:** Preface after “They tried capital letters.”

**Panel:** An enormous prompt reads `DO NOT BE WRONG`. A tiny agent wearing safety goggles asks, “Does bold count as a runtime guard?”

**Caption:** “Emphasis is not instrumentation.”

### C3 — The database gets a vote

**File:** `cartoons/ch04-01-database-vote.svg`  
**Placement:** Chapter 4 after the booking example.

**Panel:** Agent at a press conference: “The reservation is changed.” An unimpressed database raises a ballot marked “No.”

**Caption:** “Grade the world, not the announcement.”

### C4 — The mood-ring grader

**File:** `cartoons/ch05-01-mood-ring.svg`  
**Placement:** Chapter 5 closing paragraph.

**Panel:** A model judge holds a glowing mood ring labeled “Overall quality: 8.3.” Engineer asks, “What evidence would change your mind?” The ring changes color.

**Caption:** “A broad impression is not a grader contract.”

### C5 — Student, examiner, accreditation board

**File:** `cartoons/ch04-02-self-certification.svg`  
**Placement:** Chapter 4, Independence Matters.

**Three small desks, same agent:** Student writes output; examiner stamps PASS; accreditation board awards a certificate.

**Caption:** “Self-evaluation is evidence. Self-certification is a governance structure of unusual efficiency.”

### C6 — The tiny p-value magistrate

**File:** `cartoons/ch09-01-pvalue-magistrate.svg`  
**Placement:** Chapter 9 after the paired-comparison example.

**Panel:** A tiny robed figure stands beside a large table of discordant cases. It bangs a gavel: “0.0755. I refuse to learn anything else.”

**Caption:** “Effect, uncertainty, and case evidence all belong in the decision.”

### C7 — Haunted CI and pass@eventually

**File:** `cartoons/ch11-01-haunted-ci.svg`  
**Placement:** Chapter 11 after “rerunning until green.”

**Panel:** Engineer clicks “rerun” repeatedly as a spectral test flickers red/green. Agent holds a trophy labeled `pass@eventually`.

**Caption:** “Keeping the green run measures persistence, not reliability.”

### C8 — The distribution sending invoices

**File:** `cartoons/ch12-01-users-invoices.svg`  
**Placement:** Chapter 12 opener.

**Panel:** A chart labels a cluster “out-of-distribution.” The cluster walks into the office carrying real invoices and support tickets.

**Caption:** “Production users are not an edge case.”

### C9 — The recursive audit

**File:** `cartoons/ch13-01-recursive-audit.svg`  
**Placement:** Chapter 13 after the monthly audit section.

**Panel:** A stack of clipboards: eval, eval of eval, audit of eval of eval. The sun outside is visibly older.

**Caption:** “The audit needs owners and actions, not another unowned audit.”

### C10 — Everyone owns quality

**File:** `cartoons/ch14-01-everyone-owns.svg`  
**Placement:** Chapter 14 opener.

**Panel:** A ticket assigned to “Everyone” sits untouched. Seven people point at one another. The database quietly assigns it to `NULL`.

**Caption:** “Shared responsibility still needs named accountability.”

### C11 — Level Decorative

**File:** `cartoons/ch14-02-level-decorative.svg`  
**Placement:** Chapter 14 after maturity levels.

**Panel:** A gleaming eval platform with twelve screens and no traces. Velvet rope, museum placard: “Level Decorative.”

**Caption:** “Tooling without a recurring decision is an exhibit.”

### C12 — The platform-first forklift

**File:** `cartoons/ch15-01-platform-first.svg`  
**Placement:** Chapter 15 near “purchase a platform later.”

**Panel:** Team buys an enormous warehouse forklift. On the floor is one tiny unlabeled box. “What are we measuring?” “Forklift utilization, currently.”

**Caption:** “Choose the task and evidence model before optimizing the platform.”

### C13 — Footnote confetti (P2)

**File:** `cartoons/ch01-02-footnote-confetti.svg`  
**Placement:** Chapter 1, DeepResearch section.

**Panel:** Research agent fires a confetti cannon full of citation numbers while an editor checks one unsupported claim.

**Caption:** “Citation volume is not evidence quality.”

### C14 — The 93 Python developers (P2)

**File:** `cartoons/ch03-01-review-room.svg`  
**Placement:** Chapter 3 after the SWE-bench curation reference.

**Panel:** A meeting room door reads “Task review.” Ninety-three developers attempt to enter, each carrying a different edge case.

**Caption:** “Review rigor should scale with consequence. Meeting-room capacity may not.”

### C15 — The invisible rulebook

**File:** `cartoons/ch02-01-invisible-rulebook.svg`  
**Placement:** Chapter 2 after the automated-analysis comparison, only if it does not share a spread with the review-unit diagram.

**Panel:** Three earnest robot inspectors study a perfectly polite SMS trace and stamp it `PASS`. Just outside their little inspection booth, the domain owner is holding the missing rulebook open to “No Markdown” and “Required handoff.” One robot has brought a magnifying glass large enough to inspect a comma but not the rulebook.

**Caption:** “A trace cannot reveal the contract you forgot to supply.”

## 7. Placement plan by chapter

| Chapter | Essential | Optional diagram | Cartoon |
|---|---|---|---|
| Preface | Simplified nested-loop mark | — | Capital letters |
| 1 | Demo vs product | — | Green dashboard or footnote confetti |
| 2 | Discovery vs measurement samples | Review-unit zoom; trace-review flow | Invisible rulebook |
| 3 | Task anatomy | Dataset lineage | Review room |
| 4 | Four kinds of truth | Truth inventory | Database vote; self-certification |
| 5 | Grader ladder | Composite grader | Mood-ring grader |
| 6 | Four grader attacks | Sandbox boundary | — |
| 7 | Judge calibration | Bias test matrix | — |
| 8 | Annotated trace | Waste/divergence loop | — |
| 9 | pass@k vs pass^k | Paired cases; clusters | p-value magistrate |
| 10 | Nested loops | Model/harness/tuning race; verification reuse map | — |
| 11 | Eval funnel | Change-impact matrix | Haunted CI |
| 12 | Outcome chain | Evidence layers | Users sending invoices |
| 13 | Dataset lifecycle | Eval failure wheel | Recursive audit |
| 14 | Ownership/cadence | Maturity ladder | Everyone owns; Level Decorative |
| 15 | Thirty-day plan | Artifact tree | Platform-first forklift |
| Appendix C | Four-case card | — | — |
| Appendix E | ParcelPath complete loop | Artifact lineage | — |

Avoid placing both a major diagram and cartoon on the same two-page spread unless the chapter is unusually dense and the visual hierarchy remains clear.

## 8. Production sequence

### Round 1: structural sketches

Sketch these first in black and white at 6×9 print size:

1. Nested loops.
2. Grader ladder.
3. Four kinds of truth.
4. Eval funnel.
5. Dataset lifecycle.
6. Ownership/cadence.
7. Thirty-day plan.

Validate each with two questions:

- Can a reader state the takeaway after five seconds?
- Does the figure add a relationship the prose does not show as quickly?

### Round 2: applied diagrams

Add task anatomy, trace timeline, pass@k/pass^k, calibration, outcome chain, and production layers. Test labels against the actual chapter wording to prevent a second vocabulary.

### Round 3: cartoons

Choose six to eight jokes with varied targets. Do not repeat “dashboard bad” in three forms. Recommended first set:

- capital letters;
- database vote;
- mood-ring grader;
- p-value magistrate;
- haunted CI;
- users sending invoices;
- everyone owns quality;
- platform-first forklift.

### Round 4: insertion and rebuild

For every inserted figure:

1. Add SVG and metadata.
2. Insert immediately after the paragraph that creates the visual question.
3. Add a takeaway caption and alt text.
4. Rebuild standard PDF, KDP PDF, and EPUB.
5. Inspect print at 100 percent and grayscale.
6. Check table of contents and page count.
7. Regenerate the paperback cover wrap after the final KDP page count.

The current KDP interior is 238 pages with the technical figure set, including the final even-page blank required for exact KDP cover calculation. Further cartoons or copy edits can still change pagination and spine width. Regenerate the final cover wrap whenever that count changes.

## 9. Ideas to reject

- Generic robot holding a magnifying glass.
- A wall of tiny benchmark logos.
- Screenshots of current vendor dashboards.
- A “good AI / bad AI” split brain.
- Stock-photo humans staring at holograms.
- Decorative flowcharts that restate a three-item bullet list.
- A safety cartoon placed beside clinical urgency examples.
- Fake quantitative charts that could be mistaken for research results.
- A giant infinity symbol used as the two-loop model; it hides the different speeds and artifacts.

The book's visuals should feel like instruments: friendly, precise, and useful under pressure.
