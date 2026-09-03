# Transcript evidence map — what the six talks give the book

Source transcripts: `../transcripts/`. Lessons index: `../transcripts/LESSONS.md`.

The book's **concepts** are largely already in place. What these six sources supply is
**named, quantified, citable cases** to carry concepts the manuscript currently argues in the
abstract — which is what the editorial target asks for ("published cases recur across chapters
rather than appearing once and vanishing").

---

## Already covered — do not re-import

Present in the manuscript already: confusion matrices (ch.07, statistical appendix), criteria
drift (ch.02, ch.07), theoretical saturation (ch.02, ch.11, ch.13), contamination (ch.01, ch.03,
ch.04, ch.13), calibration (nearly every chapter), binary judges (ch.05, ch.07), domain expertise
(ch.02, ch.05, ch.07, ch.14), guardrail metrics (ch.08, ch.11, ch.12), harness (throughout).

Absent from the manuscript entirely (zero hits): **axial coding**, **open coding**, **benevolent
dictator**, **Copilot** as a named case, **reward hacking**, **Likert / 1-to-5 judge critique**,
**building your own annotation tool**.

---

## Load-bearing additions, by chapter

### 01 — Demos Lie
The chapter's thesis has a formal empirical result behind it now. Rabanser et al. measure exactly
the gap the chapter asserts: across 15 models spanning early 2024 to mid 2026, reliability
improves at **0.03/yr on GAIA** and **0.09/yr on τ-bench** while accuracy climbs far faster
(reliability-vs-accuracy slopes 0.18 and 0.33). All three frontier providers cluster together,
which makes it an industry-wide plateau rather than a vendor problem. `[RELY-01]`

The paper's opening incidents are better than invented ones because each is documented: a coding
assistant deleting a production database despite instructions forbidding it, an agent making an
unauthorized purchase that bypassed user confirmation, a government chatbot giving illegal
business advice. Each was judged capable in internal assessment and failed in deployment — which
is the chapter's argument stated as a pattern rather than an anecdote. `[RELY-01]`

Also usable: Anthropic's study of 80,000+ people found unreliability — hallucinations,
inaccuracies, and the verification burden they create — was the most frequently cited concern
about AI. That connects straight back to the Verification Triangle in the preface. `[RELY-01]`

### 02 — Read the Failures
The chapter says open twenty traces. It does not yet name the method, and the method has a
literature. Import the vocabulary and the rules:

- **Open coding**: one free-text note per trace, capturing only the **first and most upstream**
  error. Not a taxonomy — that comes later. `[MEDIA-01 @00:21:47]`
- **Axial coding**: cluster the notes afterwards, with an LLM, then rewrite the categories
  yourself because the model's first pass produces unactionable ones like "capability
  limitations". `[MEDIA-01 @00:34:51]`
- Give the categoriser a **"none of the above"** bucket; anything landing there says the taxonomy
  is incomplete. `[MEDIA-01 @00:43:44]`
- The note quality rule, with evidence: in the published example, 42 traces yielded conversational
  flow 17, human handoff 13, tour scheduling 8, formatting 2 — **and two rows that are the
  categoriser's own complaints**, because those two open codes were written too thinly to sort.
  Vague notes do not vanish; they arrive as noise in the table you prioritise from.
  `[MEDIA-01 @00:45:05]`
- An LLM cannot do this first pass. Asked whether a trace contains an error, it approves a
  response that offers a virtual tour the company does not provide. The judgment requires context
  the model does not have. `[MEDIA-01 @00:24:04]`

### 04 — Four Kinds of Truth
The chapter's central claim — evidence gets less arguable as it approaches the consequence — has
an independent production corroboration the book does not currently use. The GitHub Copilot team
arrived at the same partition from the other direction: **algorithmic** (exact match, schema
conformance, length, parsability), **verifiable** (it compiles, the tests pass, the SQL returns
the expected rows), **LLM-as-judge** (grounding, expected facts, better/worse than a reference),
all sitting on **A/B testing**. Copilot used all four. `[CASE-COPILOT-01 @00:08:52]`

The talk also poses the chapter's hardest open question out loud: verifiable evals are the
cheapest useful tier and they "pop up a lot in code gen — but elsewhere?" Worth answering
explicitly rather than leaving implicit.

### 05 — The Grader Ladder
"Use the least magical grader" gets its best case study. A product manager with domain expertise
reduced a subjective failure mode — the coach suggesting a *general* rather than *specific*
interview question — to a red-flag keyword list. A code assertion, no false positives, catching
nearly everything she caught by hand. Her own read on it: an engineer without the teaching
background would have reached for an LLM judge. That is the ladder argument and the ownership
argument in one example. `[CASE-COACH-01 @00:18:34]`

Corroborating design decision at benchmark scale: GAIA 2 moved **away** from rubric/LLM judging to
event-by-event comparison of the agent's action diagram against an annotated expected diagram —
cheaper and more reproducible — reserving LLM soft verifiers for free-text content like an email
body. `[WORKSHOP-01 @00:50:28]`

### 06 — Executable Truth
Harnesslib is the canonical published instance of verifiable grading at scale, and the book has no
named case for this chapter. The construction: open-source Python and JS repos → run their tests →
keep only repos where everything passes → use coverage to map functions to tests → keep functions
with a doc string, a covering test and a line cap → remove the body → regenerate → rerun the test.
Early pass rates were 40–50%. `[CASE-COPILOT-01 @00:10:11]`

Two details the chapter should not skip, both of which sharpen the contamination discussion the
book already has:

1. Repos had to postdate the model's training cutoff, and GitHub could obtain the training-set
   list from OpenAI directly. `[CASE-COPILOT-01 @00:12:46]`
2. **That filter created its own bias.** Repos new enough to be uncontaminated are smaller than
   real production code, so the eval set was systematically easier than live traffic. The fix for
   one validity threat introduced another. `[CASE-COPILOT-01 @00:13:37]`

Also: cache the *preparation*, not the inference — repo selection, test runs and function offsets
stored in SQL and reused every run. `[CASE-COPILOT-01 @00:44:34]`

### 07 — Judgment and Judges
Three additions to a chapter that already has confusion matrices and criteria drift.

- **The Likert critique**, which the manuscript never states. A 1-to-7 scale is a way of avoiding
  the decision, and nobody can act on the difference between 3.2 and 3.7. Binary, one failure mode
  per judge. `[MEDIA-01 @00:52:35]`
- **Why judging works at all**: checking a granular checklist is a strictly easier task than
  generating the answer. This is the answer to the standing objection that the model is marking
  its own homework, and the book should state it plainly. `[CASE-COPILOT-01 @00:31:35]`
- **The progression that produces a usable judge**, from the person who built it: a judge asked
  "which is better" graded brace placement; the same judge given an explicit checklist — is there
  a test for null values, is there a test for an empty list — stayed on task. Escalate specificity
  until the judge stops being creative. `[CASE-COPILOT-01 @00:27:20]`

### 09 — Statistics Without the Lab Coat
- **The prevalence trap**, stated as a number: for a failure occurring 10% of the time, a judge
  that always says "pass" scores 90% agreement. Anyone reporting bare agreement should be asked
  for the matrix. `[MEDIA-01 @00:58:14]`
- A concrete argument that a score is a sample: Rabanser et al. run each task K=5 times **at
  temperature zero** and still observe variance, attributable to floating-point non-associativity,
  batch-size variation under concurrent load, and non-deterministic kernel scheduling. Determinism
  is not available even when you ask for it. `[RELY-01]`
- Benchmark hygiene, as a cautionary number: they restrict τ-bench to a verified 26-task subset
  because 24 of the original 50 airline tasks were found to contain errors — flawed ground-truth
  labels and ambiguous specifications. Published benchmarks are not automatically correct.
  `[RELY-01]`

### 11 — Release Gates
- The Copilot shiproom as a worked gate: three key metrics only (completion acceptance rate,
  characters retained, latency), a 10% traffic ramp, and guardrails deliberately *not* wired as
  hard fails — they are diagnostic context for the three key metrics. When a guardrail moved
  unexpectedly it was either explained in the room or the launch was delayed a week while someone
  dug through logs. `[CASE-COPILOT-01 @00:18:00, @00:23:06]`
- **A reliability threshold belongs in the gate alongside capability**, and the distinction that
  sets the threshold is automation versus augmentation: a coding agent's errors are absorbed by a
  reviewer, an autonomous customer-service agent's are not. `[RELY-01]`, `[WORKSHOP-01 @00:33:32]`

### 12 — Production Is the Real Test
- Judges are not only a pre-ship gate: sample ~1,000 production traces a day through the same
  judge and the score becomes a live quality measure rather than a snapshot. `[MEDIA-01 @00:50:59]`
- Copilot's guardrail metrics accreted from past breakages — each one is a post-mortem crystallised
  into a number that would have caught the incident a week earlier. That is a concrete mechanism
  for the chapter's argument about production teaching the suite. `[CASE-COPILOT-01 @00:56:27]`

### 13 — When Evals Fail
The chapter's failure catalogue is missing four modes that these sources document:

- **Reward hacking** — absent from the manuscript entirely. Agents fix the failing unit test
  rather than the bug. If you ask for three things and grade two, the third gets skipped.
  Countermeasures: fingerprint tests, deny the agent access to grader and solution.
  `[WORKSHOP-01 @01:01:03, @01:06:41]`
- **Judges age.** Model output style shifted enough in a year that GAIA 2's comparison judges had
  to be rewritten. A judge validated once is not validated forever. `[WORKSHOP-01 @00:52:54]`
- **The harness confound.** Six frontier models sat within a couple of points of each other on
  SWE-bench Pro while harness choice moved results by 22%. A model comparison may be a harness
  comparison. `[KAGGLE-01 @00:18:39]`, corroborated on terminal-bench `[WORKSHOP-01 @01:09:55]`
- **Interface-shaped sampling bias** — the most portable idea in the phone-agent paper. A benchmark
  can only contain what its interface can express; mobile benchmarks were built around the screen,
  so an entire task category was invisible to every score. Cross-app tasks cap at 11% for
  screen-based agents and more capable models do not move it, because one screenshot per step is a
  structural bottleneck rather than an intelligence limit. The worry travels to web and desktop
  agents. `[PHONE-01 @00:12:53, @00:15:18]`

Also for this chapter: **measure the ceiling, not just the score.** Hand-built oracle solutions
(must pass the verifier, must reach the answer by genuine exploration, three independent
professionals must sign off) showed 89% of tasks solvable at 3.7 steps average against live agents
taking ~15. A suite that never establishes its ceiling cannot tell a hard task from a bad agent.
`[PHONE-01 @00:08:00]`

### 14 — Owning the Loop
- **The benevolent dictator.** One trusted domain expert does the coding, not a committee.
  Consensus processes make error analysis expensive enough that teams stop doing it. This is the
  chapter's "everyone owns quality is a terrible ticket assignee" argument with a name and a
  published rationale. `[MEDIA-01 @00:25:51]`
- **Two eval personas need two pipelines.** One group wants a canned run that emits a number for a
  ship decision; the other wants modular pieces to prototype products that do not exist yet.
  Copilot found that forcing both into one pipeline served neither, and that having more than one
  way to run evals felt like sprawl but was correct. `[CASE-COPILOT-01 @00:33:17]`
- The PM/engineer split is a live open question, not a solved one, and the practitioner who did
  both says so directly: the domain expert must be involved in eval *design* even when they are
  not writing the code. `[CASE-COACH-01 @00:19:23]`

### 15 — The First Thirty Days
An actual thirty-day case with dates and numbers, which is exactly this chapter's shape:

- Started with no Python, no IDE, no dev/prod split. First two evals written on a Sunday evening;
  five evals running against a trace set within four days. `[CASE-COACH-01 @00:28:56]`
- Started annotation in a spreadsheet tool she already knew rather than adopting an eval platform,
  deliberately limiting how much was new per step. `[CASE-COACH-01 @00:10:16]`
- Cost of the loop once established: 3–4 days of initial error analysis, then roughly 30 minutes a
  week. `[MEDIA-01 @01:30:37]`
- The payoff, quantified: an error mode spanning multiple LLM calls went from **81% of transcripts
  to 3%**. The detector had to be built before the fix, because the repeated excerpts were not
  textually identical, and the fix was a workflow change rather than a prompt change — so the A/B
  test had to compare workflows. Three days end to end. `[CASE-COACH-01 @00:43:14]`
- Build your own annotation tooling: annotation you avoid is annotation you do not do. Half a dozen
  purpose-built tools, each generated in about two minutes. `[CASE-COACH-01 @01:06:41]`

---

## Two findings that could restructure an argument rather than decorate one

1. **Reliability is a separate axis from capability, and it is measurable.** The book currently
   treats reliability as an adjective. Rabanser et al. make it a decomposition with an operational
   definition, which gives ch.01 a spine and ch.11 a second gate criterion. See the definition
   section below.
2. **The eval can be more correct than the human who wrote it.** Writing a specific eval forced a
   practitioner to codify a rubric she had never made explicit, at which point her own historical
   labels were wrong and had to be redone. This complicates the book's implicit assumption that
   human labels are the ground truth judges are aligned against — worth a passage in ch.07 or
   ch.13 rather than a footnote. `[CASE-COACH-01 @00:26:21]`

---

## Skip

Kaggle's hackathon and Game Arena product detail; the phone paper's Android-specific mechanics;
course and podcast promotional segments; the eval-drama-on-X discussion (entertaining, adds no
argument the book needs).

---

## What reliability actually means

For ch.01, ch.11 and the glossary. Source: Rabanser, Kapoor, Kirgis, Liu, Utpala, Narayanan,
"Towards a Science of AI Agent Reliability," ICML 2026 / arXiv:2602.16666v3. **CC BY 4.0**, so
figures are reproducible with attribution if wanted.

**Scope.** Reliability is treated as an empirically measurable property of agent behaviour under
*natural variation and incidental faults*. Explicitly excluded: adversarial attacks, and broader
socio-technical notions such as value alignment. "Safety" is used narrowly, to mean bounded
operational severity. The framing is imported from safety-critical engineering — aviation, nuclear
power, automotive, process control — where reliability has long been multi-dimensional and
certification requires bounded failure severity and graceful degradation, not just a good average.

**Four dimensions, each a question:**

| Dimension | The question it asks |
|---|---|
| Consistency | Does the system behave the same way across repeated runs under identical conditions? |
| Robustness | When conditions deviate from nominal, does it degrade gracefully or fail abruptly? |
| Predictability | Can the system recognise when it is likely to fail? |
| Safety | When failures occur, how severe are the consequences? |

**The load-bearing claim: all four are independent of raw capability.** A highly capable system can
be unreliable; a less capable system can be highly reliable within its envelope. Improving
capability does not automatically improve reliability, which is why it needs separate measurement.

**Twelve metrics**, all normalised to [0,1] with higher meaning better:

- *Consistency* — outcome consistency (does the same task pass or fail the same way across runs);
  trajectory consistency, measured both distributionally and as action ordering; resource
  consistency (variability in cost, time and API calls).
- *Robustness* — fault robustness (accuracy retained under injected API timeouts and error
  responses); environment robustness (under semantics-preserving changes such as reordered fields
  or renamed API parameters); prompt robustness (under equivalent paraphrases — "cancel my
  subscription" versus "end my plan").
- *Predictability* — calibration; discrimination (AUROC — can it separate its successes from its
  failures); Brier score, which jointly captures both.
- *Safety* — compliance (fraction of tasks with no constraint violation, e.g. no PII exposure, no
  destructive operations); harm severity (violations weighted low 0.25 / medium 0.5 / high 1.0).

**Aggregation, and the part worth borrowing.** The overall score averages consistency,
predictability and robustness only. **Safety is deliberately excluded from the aggregate**, on the
grounds that safety violations are a tail phenomenon: averaging safety with the other dimensions
would hide an agent that behaves safely 99% of the time and causes catastrophic harm in the
remaining 1%. Safety deterioration is treated as a hard constraint instead. That is a directly
transferable design principle for the book's release-gate chapter — *some dimensions are gates,
not terms in an average.*

**Setup, for accurate citation.** 15 models across OpenAI, Google and Anthropic, release dates
early 2024 to mid 2026. Two benchmarks: GAIA (165-task validation split, three difficulty levels,
ReAct-style scaffold with browsing, code execution and file tools) and τ-bench (customer-service
simulation, tool-calling scaffold, restricted to a verified 26-task subset). K=5 runs per task at
temperature zero. Interactive dashboard at <https://hal.cs.princeton.edu/reliability/>.

---

## Fact-check notes for the codex

The talk and the paper disagree; cite the paper.

- The talk says **14 models over 18 months**. The paper says **15 models**, release dates early
  2024 to mid 2026, and Figure 1 describes **24 months of model releases**.
- The talk says safety is measured but not aggregated. **The paper confirms this** — do not
  describe reliability as a four-dimension average.
- Do not cite the reliability trend as a single number read off the slide. Cite the paper's
  regression slopes: 0.03/yr on GAIA, 0.09/yr on τ-bench.
- An automated summary of the paper misattributed the benchmarks as WebArena and SWE-bench and
  placed calibration under robustness. Both are wrong. The benchmarks are GAIA and τ-bench.

## Proposed codex entries

| Key | Source |
|---|---|
| `[MEDIA-01]` | already registered — Lenny's Podcast, Husain & Shankar |
| `[RELY-01]` | Rabanser et al., "Towards a Science of AI Agent Reliability," ICML 2026, arXiv:2602.16666v3. CC BY 4.0 |
| `[CASE-COPILOT-01]` | Berryman & Simister, "The Evals That Made GitHub Copilot," Hamel Husain channel, 13 May 2025, 58:26 |
| `[CASE-COACH-01]` | Torres, "From Noob to Automated Evals In A Week (as a PM)," Hamel Husain channel, 15 Aug 2025, 1:10:21 |
| `[WORKSHOP-01]` | Hugging Face, "Agentic Evaluations Workshop," 20 Mar 2026, 1:48:46 — multi-speaker; attribute per segment |
| `[KAGGLE-01]` | Kang & Aaron, "Agentic Evaluations at Scale, For Everybody," AI Engineer, 25 May 2026, 20:02 |
| `[PHONE-01]` | Cite the underlying paper, "Beyond the GUI Paradigm: Do Mobile Agents Need the Phone Screen?", arXiv 16 Jun 2026 — not the AI-narrated video summary |

**Reuse notes.** The two Hamel Husain channel talks have human-written captions and are safe to
quote. The other four are auto-captioned: no speaker labels and mangled proper nouns, so verify
any quotation against the video before it reaches the manuscript. `[PHONE-01]` is an AI-generated
narration of a paper by AI voices — treat it as a reading aid and cite the paper itself. The
`[WORKSHOP-01]` segments have different speakers and different employers; attribute the reliability
material to Narayanan, GAIA 2 to the Meta presenter, and the environment material to Bespoke Labs.
