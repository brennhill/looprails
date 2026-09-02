# ParcelPath: Complete Fictional Eval Loop

ParcelPath is the runnable companion to Appendix E of *Measure Twice, Prompt Once*.

Everything in this directory is fictional: product, people, traces, labels, system outputs, timings, and results. The artifacts are intentionally small enough to inspect by hand. They demonstrate the shape of a complete eval loop; they do not predict performance for another product.

## Files

| File | Role in the loop |
|---|---|
| `product-contract.json` | Local product rules, evidence sources, and release constraint |
| `production-traces.jsonl` | Six synthetic traces with expert annotations |
| `dataset.jsonl` | Sixteen replay task contracts derived from the failure taxonomy |
| `calibration.jsonl` | Adjudicated expert labels plus judge v1 and v2 predictions |
| `runs/baseline.jsonl` | Fictional current-system outputs |
| `runs/candidate-a.jsonl` | First intervention, including one regression and one unresolved case |
| `runs/candidate-b.jsonl` | Corrected intervention |
| `grader.mjs` | Composite checks, judge confusion matrices, and paired comparisons |
| `maintenance-log.md` | A later carrier change and the eval updates it triggers |

## Run it

Requires only Node.js:

```bash
node examples/parcelpath/grader.mjs
```

Expected summary:

```text
Judge calibration (simulated)
v1: 9/12 correct; false passes=2; false fails=1
v2: 11/12 correct; false passes=0; false fails=1

System evaluation (fictional)
baseline:    8/16 passed
candidate-a: 14/16 passed
candidate-b: 16/16 passed

Paired baseline vs candidate-a
both pass=7; candidate only=7; baseline only=1; both fail=1
two-sided exact paired p=0.0703
```

The paired calculation describes this sixteen-case suite. The suite is deliberately enriched and was used during development, so the number is not a production-effect estimate.

## Suggested experiments

1. Remove `get_reschedule_status` from `candidate-a` case `timeout_committed`.
2. Change an unavailable-window response from `unavailable` to `confirmed`.
3. Add `accepted_pending` to the contract and create cases for eventual success and eventual rejection.
4. Make `judge_v2` false-pass an invented alternative and inspect how the composite gate changes.
5. Add a cost or hard latency check using a limit chosen for your fictional product.

The grader reports each failed check. If an edit changes only a total, improve the evidence output before improving the score.

