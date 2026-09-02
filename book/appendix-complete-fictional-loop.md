# Appendix E: The Whole Loop, With Receipts

*ParcelPath is fictional. So are its people, traces, counts, failures, experiment results, and maintenance history. The companion files are real and runnable. This is a teaching case, not evidence that any particular intervention will produce the same result elsewhere.*

Published case studies rarely expose the whole chain. Customer data stays private. Judge prompts go missing. The intervention gets described as “we improved the system,” which is a splendid phrase if you are trying to hide three months of difficult work in four words.

So here is one complete loop. It is compact enough to inspect, detailed enough to argue with, and contrived for the same reason as a fire drill.

## Meet ParcelPath

ParcelPath sells delivery-status software to small online shops. Its assistant can answer tracking questions and reschedule an eligible delivery window.

The team is small:

- **Nia**, the product manager, owns the workflow contract and release decision.
- **Priya**, the support lead, knows what customers expect and which carrier states are trustworthy.
- **Luis**, the engineer, owns the tools, controller, and eval harness.
- **Sam**, the analyst, owns sampling and the outcome comparison.

The local contract for rescheduling is specific:

1. Offer only windows returned by `available_windows`.
2. Commit at most one reschedule event for a user request.
3. Reuse one idempotency key for any retry of that request.
4. After a timeout, call `get_reschedule_status` before describing the result.
5. Say the delivery is rescheduled only when authoritative state confirms the requested window.
6. If the result remains uncertain, say so and route the request to support.
7. Keep p95 response latency below the product's locally chosen five-second limit.

That last number belongs to ParcelPath. Any resemblance to a universal latency recommendation is purely fictional, including the moustache.

## Monday: the complaint

A shop owner forwards a customer message:

> The bot said Saturday was set. The tracking page still says Friday. Which one should I believe?

The tracking page, as it happens.

Luis finds the trace:

```text
[00] User: Move order P-104 to Saturday morning.
[01] Agent -> available_windows(P-104)
[02] Tool  -> [SAT_AM, MON_AM]
[03] Agent -> reschedule_delivery(P-104, SAT_AM, key="r-881")
[04] Tool  -> TIMEOUT
[05] Agent: "Done — your delivery is now scheduled for Saturday morning."
[06] Final state: window=FRI_PM, reschedule_events=0
```

The final sentence is the visible failure. The first actionable departure is step 5: the agent converts an unknown tool result into a completion claim without checking state.

Nia does not ask Luis to add “NEVER LIE” to the prompt. This saves everyone several minutes.

## Tuesday: production traces become observations

Sam prepares a fictional 24-trace discovery sample for the exercise: ordinary traffic, complaints, tool timeouts, unavailable-window requests, and apparent successes. The strata are preserved because this queue is deliberately enriched for learning. Nobody calls `5 / 24` a production failure rate.

Priya and Luis label independently. Their sheet identifies the review target as the **whole rescheduling trace**, while the completion claim and first departure point to exact spans inside it.

Three annotations look like this:

| Trace | Expert observation | First departure | Strongest evidence | Candidate action |
|---|---|---|---|---|
| `prod-017` | Claimed Saturday was confirmed after a timeout | Response after timeout | Final window remained Friday | Check operation status before responding |
| `prod-031` | Retried with a new key and committed twice | Second call used a new key | Two reschedule events | Move idempotency-key ownership into controller |
| `prod-044` | Offered Sunday although tool returned only Monday | Response invented availability | Tool-result payload | Generate offers from structured tool result |

They disagree on six traces. Two disagreements are simple misses. Three expose vague wording around “pending.” One reveals that Priya considers a bare “Saturday is unavailable” a failure when the tool returned useful alternatives, while Luis has been grading only state correctness.

Nia settles the product question: when a requested window is unavailable and alternatives exist, the assistant should offer them. The rubric changes. The reviewers revisit affected traces.

Their first taxonomy is multi-label:

| Category | Meaning | Observed in the enriched queue | Likely prevention layer |
|---|---|---:|---|
| False completion claim | Says the requested state exists when authoritative state does not confirm it | 5 | Response contract and state check |
| Unsafe retry | Repeats a possibly committed action without stable idempotency | 3 | Controller and tool interface |
| Invented availability | Offers a window absent from tool evidence | 4 | Structured response input |
| Weak recovery | Reports failure without a useful next step available in evidence | 6 | Narrow communication criterion |
| Other / unresolved | Does not fit the current categories | 2 | More review |

The counts overlap. They describe this discovery queue and nothing larger.

## Wednesday: observations become a dataset

The team converts the diagnostic properties into sixteen synthetic replay cases. Names and order numbers disappear. The diagnostic relationships remain:

- ordinary successful reschedules;
- unavailable windows with and without alternatives;
- timeouts where the operation committed;
- timeouts where it did not;
- duplicate retry hazards;
- delayed or malformed status responses;
- already-delivered orders;
- a timezone boundary;
- a user who changes the requested window mid-conversation.

Six cases descend directly from trace categories. The others probe nearby boundaries. Every case specifies initial state, tool behavior, allowed completion claims, expected final state, action-history limits, required recovery calls, and whether a useful next step is available.

A shortened task looks like this:

```json
{
  "id": "timeout_committed",
  "scenario": "reschedule call times out after committing",
  "initial_window": "FRI_PM",
  "requested_window": "SAT_AM",
  "tool_fixture": "timeout_after_commit",
  "expected": {
    "final_window": "SAT_AM",
    "commit_events": 1,
    "allowed_claims": ["confirmed"],
    "required_tools": ["get_reschedule_status"]
  }
}
```

The source trace ID records lineage, but the synthetic case does not reproduce customer text. A changed carrier policy or tool contract can now invalidate the case without requiring anybody to remember which Slack thread contained the explanation.

## Thursday morning: build the grader from the ground up

Luis does not start with one broad quality judge. He builds a composite result:

| Criterion | Evidence | Grader | Gate? |
|---|---|---|---|
| Requested final window exists | Delivery record | Exact state assertion | Yes |
| At most one commit occurred | Event history | Count assertion | Yes |
| Required recovery call occurred | Tool trace | Sequence assertion | Yes |
| Completion claim matches evidence | Structured claim plus state | Allowed-value assertion | Yes |
| Next step is useful and grounded | Response plus returned alternatives | Narrow model judge | Yes when alternatives exist |
| Latency meets local contract | Trace timing | Numeric assertion | Yes for this product |

The runnable companion grader expresses the hard checks directly:

```javascript
const checks = {
  state_matches:
    run.final_state.window === task.expected.final_window,
  commit_count_matches:
    run.commit_events === task.expected.commit_events,
  claim_is_grounded:
    task.expected.allowed_claims.includes(run.claimed_status),
  required_tools_used:
    task.expected.required_tools.every((tool) => run.tools.includes(tool)),
  helpful_next_step:
    !task.expected.helpful_next_step_required ||
      run.judge_helpful_next_step === true,
};

const pass = Object.values(checks).every(Boolean);
```

Each failure returns the individual checks. `pass: false` without a reason is not a grader result; it is a small electronic shrug.

## Thursday afternoon: calibrate the one judgment

Only “useful and grounded next step” needs a model judge. Priya and Nia independently label twelve short responses, compare evidence, and adjudicate disagreements. The calibration set includes pleasant wording with invented windows, terse but valid alternatives, false certainty after timeouts, and truthful escalation.

Judge v1 gets nine of twelve labels right:

| Expert label | Judge pass | Judge fail |
|---|---:|---:|
| Pass | 5 | 1 |
| Fail | 2 | 4 |

The two false passes share a pattern: both offer a helpful-sounding window that did not come from the tool. The false fail is blunt but accurate.

Luis revises the criterion. Judge v2 must identify the offered action, point to the tool evidence that permits it, and fail when that evidence is absent. On the same calibration set it gets eleven of twelve right, with no false passes and one false fail:

| Expert label | Judge pass | Judge fail |
|---|---:|---:|
| Pass | 5 | 1 |
| Fail | 0 | 6 |

Those results authorize a narrow job in this fictional workflow. They do not turn the judge into a licensed general contractor for truth.

The remaining false fail routes to human review during the pilot. The calibration records preserve text, expert label, both judge versions, and the reason for the adjudicated label.

## Friday: change the product

The traces point to a bundle of changes rather than a grander prompt:

1. The controller creates the idempotency key and reuses it across retries.
2. A timeout moves the workflow into `unknown`, then triggers `get_reschedule_status`.
3. The tool layer returns a structured operation outcome: `confirmed`, `not_committed`, `pending`, or `unavailable`.
4. The response generator receives only verified windows and the structured outcome.
5. Malformed or undecidable status routes to support instead of becoming a jaunty success message.
6. The prompt explains how to phrase those structured states. It no longer has to invent the states themselves.

No model is replaced. The team improves the rails around the model because the evidence points there.

## The offline comparison

The same sixteen cases run against the production baseline and Candidate A. The full check-level outputs are kept, not just totals.

| Result | Baseline | Candidate A |
|---|---:|---:|
| Passed | 8 / 16 | 14 / 16 |
| Failed | 8 / 16 | 2 / 16 |
| False completion cases passed | 1 / 5 | 5 / 5 |
| Duplicate-action cases passed | 0 / 3 | 3 / 3 |

The paired outcomes are more revealing:

| | Candidate A passes | Candidate A fails |
|---|---:|---:|
| Baseline passes | 7 | 1 |
| Baseline fails | 7 | 1 |

Candidate A fixes seven cases and regresses one. The exact paired calculation on those eight disagreements is about `p = 0.0703`. The regressed case is also readable: the new controller converts a carrier-local timestamp incorrectly at a daylight-saving boundary.

The other remaining failure is a malformed status payload that should have escalated. Luis fixes both. Candidate B passes all sixteen cases.

That perfect score earns Candidate B a controlled production test, not a coronation. The suite is small, enriched, and used during development. It cannot estimate ordinary production performance, and the team has now looked at every case often enough to recognize them at a birthday party.

## The controlled outcome comparison

Sam randomly assigns 240 eligible fictional requests during the pilot: 120 remain on the baseline and 120 use Candidate B. The product contract and analysis fields were written before opening the results.

| Product evidence | Baseline | Candidate B |
|---|---:|---:|
| Verified requested final state | 88 / 120 | 105 / 120 |
| False completion claim | 14 / 120 | 3 / 120 |
| Support recontact within 24 hours | 25 / 120 | 16 / 120 |
| p95 response latency | 3.8 seconds | 4.6 seconds |

The team does not average these into `ParcelPath Quality = 8.7`. The state and false-claim results address the original failure. Recontact is a product outcome worth continued observation. Latency becomes slower but remains inside ParcelPath's prewritten five-second contract.

Nia approves a gradual rollout. That decision belongs to the fictional product's risk and operating context. Another product could make a different call on the same pattern of evidence.

## Six weeks later: the loop declines to be finished

A carrier introduces a new status: `accepted_pending`. The tool has accepted the change but authoritative delivery state may take up to a minute to update.

The online evaluator finds three responses that say “confirmed” while state is still pending. Priya labels them false completion claims. Luis initially argues that the action will probably settle. Nia points at the word “confirmed,” which has chosen an inconvenient moment to retain its dictionary meaning.

The weekly review produces five changes:

1. Add `accepted_pending` to the operation-outcome schema.
2. Add two replay cases: one that settles and one that later rejects.
3. Split “timeout recovery” from the broader “uncertain outcome” category.
4. Recalibrate the communication judge on pending-language examples.
5. Route long-pending operations into a status-notification workflow.

The maintenance register records owner, date, trigger, affected cases, grader version, and rollout decision. Two stale cases are rewritten when the carrier fixture changes. One saturated wording example is retired from the expensive judge suite but remains in a cheap structured smoke test.

The eval did not guard a score. It absorbed a new fact about the product.

## The ownership card

By the end of the story, every link has a name:

| Artifact or decision | Owner | Recurring work |
|---|---|---|
| Product contract and allowed claims | Nia | Resolve policy questions and approve releases |
| Expert labels and adjudication | Priya | Review disagreements and novel failures |
| Harness, state oracle, and controller | Luis | Keep fixtures and grader behavior current |
| Sampling and outcome analysis | Sam | Maintain representative samples and comparison reports |
| Judge scope | Priya and Luis | Recalibrate after category, prompt, or model changes |
| Residual release risk | Nia | Record why the evidence is sufficient for this rollout |

“The AI team” owns nothing in this table. The AI team is not a person and cannot attend Tuesday's trace review, no matter how many calendar invitations it receives.

## Open the companion

The complete fictional package lives under `examples/parcelpath/`:

- `product-contract.json` — the local rules and evidence sources;
- `production-traces.jsonl` — six short synthetic production traces with expert annotations;
- `dataset.jsonl` — sixteen replayable task contracts;
- `calibration.jsonl` — expert labels and two judge versions;
- `runs/baseline.jsonl` — the fictional production baseline;
- `runs/candidate-a.jsonl` — the first intervention, including its regression;
- `runs/candidate-b.jsonl` — the corrected intervention;
- `grader.mjs` — dependency-free composite grading and paired comparison;
- `maintenance-log.md` — the later carrier change and resulting eval updates.

Run:

```bash
node examples/parcelpath/grader.mjs
```

Then break it on purpose. Change an allowed claim. Remove the status check. Make a duplicate commit look harmless. Add a new carrier state and decide who gets to define it. A worked example earns its keep when it stops being a museum display and starts an argument.
