# Visual capture flags

Timestamps where the speech points at something on screen that the transcript alone does not carry —
a chart, an architecture slide, a trace/notebook screenshot, a leaderboard, a live demo.

Each flag is: **[timestamp](deep link) — what is on screen — what the text loses without it.**

Grab a still with `scripts/grab_frame.sh <video_id> <HH:MM:SS>` (one) or
`scripts/grab_frames.sh <video_id> <HH:MM:SS>=<name.png> ...` (several, one URL resolution).
Flags marked ✅ have been captured and checked against the frame.

**Slides drift from the speech that references them.** A speaker often describes a slide 30–90s
after it appears, or keeps talking past it. Every ✅ below records the timestamp that actually
holds the slide, which is not always the timestamp of the sentence that points at it. When adding
new flags, sweep ±60s before trusting a single grab.

---

## 1. Agentic Evaluations at Scale, For Everybody — Google DeepMind (20:02)

Slide-driven conference talk, no chapter markers. Nearly every claim is anchored to a slide.

- **[00:04:48](https://www.youtube.com/watch?v=Ubwb6NzegyA&t=288s)** — the wastewater-treatment-plant benchmark built by a user in Turkey. The slide shows the actual benchmark; the anecdote is the whole argument for domain-expert-authored evals.
- **[00:05:58](https://www.youtube.com/watch?v=Ubwb6NzegyA&t=358s)** — ✅ `frames/kaggle-four-product-map.png`. "Kaggle is trying to solve these problems": Hackathons, Agent Exams, Game Arena, Benchmarks as four labelled quadrants. The talk's structure in one image; the audio only says "top left / bottom".
- **[00:09:45](https://www.youtube.com/watch?v=Ubwb6NzegyA&t=585s)** — ✅ `frames/kaggle-agent-exams-leaderboard.png`. Standardized Agent Exams: one-line prompt in, exam taken, score on a leaderboard. Includes the "extend this to safety, competitions, benchmarks" line.
- **[00:11:16](https://www.youtube.com/watch?v=Ubwb6NzegyA&t=676s)** — ✅ `frames/kaggle-sae-first-impressions.png`. First impressions for SAE, with the adoption chart on the right. The demand numbers live in the chart, not the speech.
- **[00:14:40](https://www.youtube.com/watch?v=Ubwb6NzegyA&t=880s)** — ✅ `frames/kaggle-game-arena-pipeline.png`. Design & iterate → build harness → run simulations → publish results, branching to benchmark / dataset / leaderboard / visualizer.
- **[00:16:48](https://www.youtube.com/watch?v=Ubwb6NzegyA&t=1008s)** — ✅ `frames/kaggle-benchmarks-open-verifiable.png`. The Kaggle Benchmarks product page beside the claim that anyone can build, run and share evals in an open and verifiable way.
- **[00:17:18](https://www.youtube.com/watch?v=Ubwb6NzegyA&t=1038s)** — ✅ `frames/kaggle-benchmark-execution-challenges.png`. **Flag was wrong**: the deck is not on the XKCD SVG task here, it is on the execution-challenges slide — isolation and reproducibility, agent-to-benchmark connection, ambiguity in eval conditions, fast deprecation. Kept because those four challenges are the operational case for hosted eval infrastructure. The XKCD SVG task is not on screen anywhere in ±90s.

## 2. When an AI Coding Agent Drives a Phone Through the Terminal (24:29)

Paper walkthrough. Visuals are the paper's figures.

- **[00:00:00](https://www.youtube.com/watch?v=W3sZRAStjDs&t=0s)** — seven-tap delete vs three-command delete. The framing comparison.
- **[00:04:40](https://www.youtube.com/watch?v=W3sZRAStjDs&t=280s)** — ✅ `frames/phone-controlled-comparison.png`. "Is CLI Even Viable?" — tap-based/screen-dependent/mobile-trained against a terminal agent with zero mobile training, under *same tasks, same rules, same verifier*. The experiment design in one figure.
- **[00:08:15](https://www.youtube.com/watch?v=W3sZRAStjDs&t=495s)** — ✅ `frames/phone-triple-signoff-rule.png`. **Flag was wrong**: not the headroom chart — the deck is on "Does It Count? The Triple Sign-Off Rule": no peeking at the verifier's source, attempts plus feedback, three independent sign-offs, all three must agree. The verifier-integrity rule, worth more than what the flag asked for.
- **[00:10:56](https://www.youtube.com/watch?v=W3sZRAStjDs&t=656s)** — ✅ `frames/phone-canyon-of-headroom.png`. "Oracle Solutions & The Canyon of Headroom": bash-only agent at 17 steps with a 10-step quoting detour, against clean tools at 11. The gap the flag calls a canyon is the picture. (Not the per-model bar chart the flag expected.)
- **[00:16:18](https://www.youtube.com/watch?v=W3sZRAStjDs&t=978s)** — ✅ `frames/phone-cross-app-wall.png`. "The Bottleneck Is the Channel": screen agent scoring a flat 0% on cross-app, terminal agent collapsing App A and App B into one workspace. Labelled *structural*, not a capability gap.
- **[00:20:04](https://www.youtube.com/watch?v=W3sZRAStjDs&t=1204s)** — ✅ `frames/phone-benchmark-selection.png`. "Unequal Playing Field?" — benchmarks kept (final state checked) against AndroidLab excluded (interface structure checked). The selection-bias critique rests on this figure.

## 3. The Evals That Made GitHub Copilot — John Berryman & Sean (58:26)

Human-written captions. Slide deck + conversation.

- **[00:05:25](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=325s)** — screenshot of how Copilot Chat evolved into its current form.
- **[00:08:52](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=532s)** — ✅ `frames/copilot-four-eval-types.png`. The four-eval-types slide, fully built: Algorithmic / Verifiable / LLM-as-Judge as three columns over a Traditional A/B Testing band. The spine of the whole talk. The slide builds progressively — at [00:06:12](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=372s) only the Algorithmic column is up, so grab 00:08:52, not the chapter marker.
- **[00:43:01](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2581s)** — ✅ `frames/copilot-four-eval-types-recap.png`. The same slide under the header "GitHub made use of all of these", annotated with sticky notes placing Harnesslib code completions on Algorithmic/Verifiable, chat completions on LLM-as-Judge, and model/tokenizer/prompt on A/B testing. The mapping from taxonomy to shipped systems. (Speech points at it from [00:42:31](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2551s).)
- **[00:10:11](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=611s)** — ✅ `frames/copilot-harnesslib-pipeline.png`. Harnesslib construction: open-source repos → run their tests → keep the green ones → keep functions with a covering test, docstring and line cap → remove the body → regenerate → rerun. Evaluation criteria: success rate.
- **[00:12:53](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=773s)** — ✅ `frames/copilot-harnesslib-lessons.png`. The four Harnesslib lessons: test content must not be in training data, test content must match production traffic, test the whole system, keep the harness flexible. (Speech reaches it at [00:12:23](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=743s); the slide lands 30s later.)
- **[00:18:00](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1080s)** — ✅ `frames/copilot-production-metrics.png`. Shiproom A/B tests: three key metrics (completion acceptance rate — flagged as most correlated with developer satisfaction — characters retained, latency) over a much longer guardrail list, all sliceable by language and locale.
- **[00:27:06](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1626s)** — ✅ `frames/copilot-judge-for-chat-method.png`. **Flag was wrong**: no Label Studio screenshot is on screen in ±90s — the deck holds the LLM-as-Judge for Chat method slide, which is the better artifact anyway. It walks the whole path from "compare against a baseline with a real human" (didn't scale) through LLM-assisted human review to fully rubric-driven judging.
- **[00:36:39](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2199s)** — ✅ `frames/copilot-judge-lessons-learned.png`. **Flag was wrong**: not Harnesslib candidate construction — the deck is on the LLM-as-Judge lessons slide, carrying the talk's most quotable line ("evals are not for evals, they're for building products") plus "who's judging the judge?".
- **[00:41:10](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=2470s)** — ✅ `frames/copilot-tool-call-confusion-matrix.png`. Algorithmic tool-use evaluation with the function-call confusion matrix: expected tool against actual tool. Explicitly a picture; the point does not survive as text.

## 4. From Noob to Automated Evals In A Week (as a PM) — Teresa Torres (1:10:21)

Human-written captions. Almost entirely screen-share of notebooks and custom tooling.

- **[00:04:44](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=284s)** — ✅ `frames/teresa-four-coaching-dimensions.png`. The product's own output: coaching feedback broken into named dimensions, each with a score and a tip. What the evals are scoring against.
- **[00:11:11](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=671s)** — ✅ `frames/teresa-airtable-first-annotation.png`. The first annotation grid — traces, LLM response, annotation, colour-coded failure modes. The "start ugly" reference image.
- **[00:21:44](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1304s)** — ✅ `frames/teresa-trace-summary-grid.png`. The trace summary table: one row per transcript, one column per eval, green/red. What a hand-built eval dashboard looks like before any tooling.
- **[00:27:00](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1620s)** — ✅ `frames/teresa-llm-and-code-evals.png`. Her two evals side by side (the pair she first introduces at [00:15:06](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=906s)): "suggests a leading question" as an LLM judge, "suggests a general question" as a code assertion. Headings, inline documentation, printed output.
- **[00:29:59](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1799s)** — ✅ `frames/teresa-are-my-evals-any-good.png`. **The highest-value frame in this talk.** "Are my evals any good?" — TP/FP/FN with precision, recall and F1 per failure mode, next to the trace grid. This is a PM validating her judges against her own labels, in numbers. Speech reaches the ship/no-ship discussion at [00:30:29](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1829s).
- **[00:30:29](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1829s)** — ✅ `frames/teresa-fast-feedback-loop.png`. "Now I can run experiments" — the grid beside the list of changes it now covers (model, prompt, temperature, chunking, anything else). The payoff slide for the whole week.
- **[00:32:37](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1957s)** — ✅ `frames/teresa-notebook-workspace.png`. Her working notebook, dark theme, code beside rendered output. The environment the rest of the talk happens in.
- **[00:39:02](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2342s)** — ✅ `frames/teresa-analysis-visualization.png`. The analysis-and-visualization section: summary visualization (pie plus bar) over an individual transcript detail view. The failure-mode distribution the flag at [00:21:14](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1274s) was asking for.
- **[00:40:02](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2402s)** — ✅ `frames/teresa-coach-app-ui.png`. The coach product itself — transcript in, structured feedback out — as the thing under evaluation.
- **[00:40:00 chapter](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2400s)** — the A/B test that moved one error from 81% to 3% of transcripts. Those two numbers are not on any captured frame; grab the table if it surfaces on a re-watch.

## 5. Why AI evals are the hottest new skill for product builders — Hamel Husain & Shreya Shankar, Lenny's Podcast (1:46:33)

Auto captions (no speaker labels). Two long screen-share segments.

- **[00:11:01](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=661s)** — screen share opens on Nurture Boss, an AI assistant for apartment property managers. Sets up every example that follows.
- **[00:13:23](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=803s)** — ✅ `frames/lenny-trace-viewer.png`. The log viewer full screen, structured trace expanded. The "what a trace actually looks like" reference frame.
- **[00:15:22](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=922s)** — ✅ `frames/lenny-full-trace.png`. One full trace with the assistant's guidelines and the tool calls it fired. Best single image of a real agent trace in the episode.
- **[00:20:53](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=1253s)** — ✅ `frames/lenny-garbled-response-failure.png`. The human-review pane over a failing trace — notes box, per-trace navigation. The annotation loop as it is actually operated.
- **[00:45:05](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=2705s)** — ✅ `frames/lenny-error-analysis-pivot.png`. "The big unveil": the axial-coding pivot table. 42 traces categorized — conversational flow 17, human handoff 13, tour scheduling 8, formatting 2 — plus two rows where the LLM categorizer refused for vagueness. Those refusal rows are the "don't write janky" lesson showing up as data.
- **[00:52:10](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=3130s)** — ✅ `frames/lenny-judge-prompt.png`. A real judge prompt on screen: one failure mode (handoff failure), TRUE/FALSE output, an explicit definitions block, an enumerated list of what counts, and "return exactly one token." The concrete rebuttal to 1–7 rating scales.
- **[01:00:03](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=3603s)** — ✅ `frames/lenny-judge-vs-human-matrix.png`. The judge-against-human confusion matrix: 73 / 18 / 1 / 8 over 100 traces. The artifact behind "never accept a bare agreement percentage."
- **[01:01:03](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=3663s)** — ✅ `frames/lenny-judge-agreement-tpr-tnr.png`. The same sheet reduced to agreement 81.00%, TPR 88.89%, TNR 80.22%. Read it beside the matrix above: the headline number and the two cells that qualify it.
- **[01:02:58](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=3778s)** — ✅ `frames/lenny-judge-validation-paper.png`. The judge-validation paper on screen (Shankar et al., criteria drift / "who validates the validators?"), open at the user-study findings. Capture for the reference list.
- **[00:32:51](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=1971s)** — CSV of error notes uploaded to a Claude project for categorization; **[00:36:25](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=2185s)** the same categories reorganized by user-story stage.
- **[00:38:18](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=2298s)** — they play an Andrew Ng clip to argue error analysis is old ML practice, not new. Note the source rather than re-capturing third-party video.
- **[01:27:44](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=5264s)** — second screen share: where to use LLMs across the eval process without replacing the human.

## 6. Agentic Evaluations Workshop — Hugging Face (1:48:46)

Auto captions, multi-speaker, no chapters. Speaker changes are unlabelled — the slides are the only reliable way to tell segments apart.

- **[00:04:26](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=266s)** — screenshot of a model system card, used as the example of eval detail buried in small print.
- **[00:05:40](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=340s)** — ✅ `frames/workshop-misleading-bar-chart.png`. **Flag was imprecise.** Two tweets side by side. Left: a vendor SWE-bench chart where a *stacked* with-thinking segment makes 52.8 read as taller than a competitor's 69.1 — the question on the tweet is literally "which is larger, 52.8 or 69.1?". Right: a second critique about missing error bars on a 72.5 vs 74.5 comparison. Two distinct chart crimes in one frame; highest-value image of the first segment.
- **[00:06:52](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=412s)** — ✅ `frames/workshop-social-impact-evals.png`. The Social Impact Evals slide and the EvalEval Coalition paper — the "Every Eval Ever" mapping effort the speech reaches at [00:09:11](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=551s).
- **[00:07:22](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=442s)** — ✅ `frames/workshop-reporting-transparency-over-time.png`. "What we (don't) measure": average first-party social-impact reporting scores per release quarter, as a colour-graded table with the count of models per quarter. The transparency-decline claim is entirely in this grid.
- **[00:10:23](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=623s)** — the eval-cards mockup ("a dummy screenshot is currently on the screen").
- **[00:12:05](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=725s)** — ✅ `frames/workshop-two-agents-same-pass.png`. "Why we need to look beyond raw scores for agents": two agents both marked PASS — 3 steps / $0.04 / 12 seconds / 0 errors against 18 steps / $0.41 / 4 minutes / 2 crashes. Caption: the score just says "pass", nothing else. The single best argument for trajectory and resource metrics.
- **[00:12:35](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=755s)** — ✅ `frames/workshop-benchmarks-incompatible.png`. Tau-Bench, WebArena and TerminalBench side by side with their incompatible protocols (user messaging / browser interface / command line). Cross-environment evaluation needs ad-hoc engineering per benchmark.
- **[00:13:05](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=785s)** — ✅ `frames/workshop-agent-evals-must-capture.png`. The agent-workflow diagram beside the three things agent evals must capture: sequence of actions, context of action, human interaction.
- **[00:25:36](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1536s)** — the failure gallery: incorrect agent purchases, and a coding agent deleting a production database.
- **[00:27:50](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1670s)** — ✅ `frames/workshop-reliability-lags-capability.png`. "Main finding: AI agent reliability lags capability" — reliability plotted May 2024 → Dec 2025 across Google/Anthropic/OpenAI models, trend ~0.70 → ~0.80 in 19 months. (Rabanser et al., "Towards a Science of AI Agent Reliability", 2026.)
- **[00:29:00](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1740s)** — ✅ `frames/workshop-three-panel-reliability.png`. The dense follow-up: GAIA and τ-bench accuracy against release date on the left, reliability against release date in the middle, reliability against accuracy on the right, with fitted slopes and per-model markers. The presenter apologises for its density, which is why it has to be an image. Distinct from the main-finding chart above — don't grab one for the other.
- **[00:29:30](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1770s)** — ✅ `frames/workshop-consistency-overview.png`. The definition slide for reliability: run the same task K times, then split into Outcome (same pass/fail?), Trajectory (same action types, same ordering?) and Resource (stable cost and time?). The taxonomy every reliability number in this talk rests on.
- **[00:30:34](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=1834s)** — ✅ `frames/workshop-prompt-rewording.png`. Prompt robustness: one original question and two paraphrases with identical meaning; the first two score correct, the informal third is wrong. Same semantics, different answer.
- **[00:39:09](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=2349s)** — GAIA 2 opening slide (Meta) with the contributor list.
- **[00:51:42](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3102s)** — ✅ `frames/workshop-hybrid-hard-soft-checking.png`. The verification pipeline: hard verifier for cheap deterministic checks, LLM judge for semantic ones, combined into a verified score. Presented as action-level rewards with high precision, powering both the GAIA2 benchmark and an RL training environment.
- **[00:52:12](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=3132s)** — ✅ `frames/workshop-key-findings-table.png`. The key-findings results table — models against capability dimensions including search, adapt, time and ambiguity — with the two callout boxes underneath. Flagged on air as already outdated; capture it with that caveat attached.
- - **[01:09:26](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4166s)** — ✅ `frames/workshop-agent-metrics.png`. The efficiency metric list — steps to success/fail, token count, latency, cost. What to record beside pass/fail.
- **[01:10:26](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4226s)** — ✅ `frames/workshop-harness-safety-reward-hacking.png`. **Flag was wrong**: no terminal-bench dashboard is on screen anywhere in ±90s, so the harness-moves-the-number claim survives as text only. What the deck holds instead is "other aspects to evaluate": role of the harness, safety (did the agent delete all the data — incorporate these as tasks/graders), reward hacking, beside a press clipping about agents that book trips and cause trouble.
- **[01:11:40](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4300s)** — ✅ `frames/workshop-failure-analysis.png`. Failure analysis: read the trace and spot issues, then automate deeper analysis. The worked example on the slide — a model at 80% average success on a harness dropping to 50% on one task category — is the case for slicing by category rather than reporting one number.
- **[01:13:10](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4390s)** — ✅ `frames/workshop-going-forward-environment-first.png`. The closing recommendation: environment-first evaluation, with environments, tasks, grading and harness as the four things to design.
- **[01:22:19](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=4939s)** — ✅ `frames/workshop-hle-leaderboard.png`. An HLE leaderboard on the Hub, read row by row: per-row notes on how each model was run (shots, agent used). The notes are unreadable in audio.
- **[01:31:00](https://www.youtube.com/watch?v=UxMZfbWI3LY&t=5460s)** — **no visual available.** The presenter says the screen share failed and the community-events demo could not be shown. Do not spend time hunting for a frame here.
