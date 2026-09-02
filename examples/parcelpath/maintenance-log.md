# ParcelPath Maintenance Log

All entries are fictional.

## 2026-01-12 — Initial loop

- Trigger: complaints about confirmed reschedules absent from delivery state.
- Product contract: version 2.0.
- Dataset: 16 cases.
- Judge: `helpful_next_step_v2`, calibrated on 12 adjudicated responses.
- Decision: Candidate B enters a controlled pilot after composite grading.
- Owners: Nia (decision), Priya (labels), Luis (system and grader), Sam (sampling).

## 2026-02-23 — New carrier state

- Trigger: weekly trace review finds three completion claims made while carrier status is `accepted_pending`.
- Observation: the carrier accepted the request but had not updated authoritative delivery state.
- Taxonomy change: split `uncertain_outcome` from the narrower `timeout_recovery` category.
- Product-contract change: add `accepted_pending`; require pending language until state confirms.
- Dataset change: add one eventual-success case and one eventual-rejection case.
- Grader change: state oracle now distinguishes accepted operation from confirmed delivery state.
- Judge change: add pending-language examples and recalibrate false passes.
- Product change: long-pending operations enter a status-notification workflow.
- Decision: hold the affected carrier route until the new cases pass and sampled traces show grounded status language.

## 2026-03-09 — Fixture and suite maintenance

- Trigger: carrier sandbox changes timestamp format.
- Dataset change: rewrite two stale fixtures; preserve their behavioral contract.
- Retirement: move one saturated wording example out of the model-judge suite and retain it as a structured smoke test.
- Audit: confirm that production sampler still includes timeouts, unavailable windows, and new carrier states.
- Open question: whether delayed notifications need their own outcome measure rather than sharing the reschedule-completion metric.

