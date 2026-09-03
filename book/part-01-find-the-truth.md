*Four products are waiting at the workbench. Each can fail while sounding entirely pleased with itself.*

The software agent writes a patch. The service agent changes a booking. The health assistant offers guidance. The research agent produces a report. All four can make a polished demo. None can be evaluated by polish alone.

Our first job is to follow the evidence backward: begin with actual failures, turn them into fair tasks, and locate the strongest source of truth for each criterion. The four cases keep the argument honest because they disagree about what “correct” means:

| Case | The question that matters |
|---|---|
| SWE-bench | Did the patch satisfy the repository's real behavior? |
| τ-bench / τ³-bench | Did the agent leave the world in the right state, by an allowed path? |
| HealthBench | Did the response satisfy expert criteria written for this case? |
| DeepResearch Bench | Does the cited evidence actually support the claim? |

By the end of the part, these are no longer four benchmark summaries. They are four reusable truth patterns: executable, state, expert, and evidentiary. Your product may combine all four before lunch.

First, though, we need to stop applauding the tech demo long enough to follow its result into the database, test runner, cited source, or expert review, where the lurking surprises have been waiting politely.
