---
created: 2026-08-25T14:01:36.924Z
title: Build runnable eval-loop companion
area: general
files:
  - book/06-executable-truth.md:44
  - book/appendix-case-study-field-guide.md:3
  - book/appendix-exercises.md:1
  - book/README.md:1
---

## Problem

*Measure Twice, Prompt Once* explains runnable task contracts, graders, paired comparisons, trace review, release gates, and statistical reporting, but the repository does not yet contain one cloneable end-to-end companion implementation. Chapter 6 deliberately uses illustrative code, while the case-study field guide routes readers to several external projects. A reader should be able to run one small, coherent eval loop locally without assembling the parts from separate chapters or depending on protected benchmark data.

## Solution

Build an original, license-clean companion project around one synthetic but realistic agent workflow. It should include:

- 12–20 versioned task cases with ordinary, regression, edge, and must-not-fail examples;
- isolated fixtures and deterministic reset behavior;
- executable state, schema, invariant, and evidence graders;
- one narrow rubric-based judge with expert-label fixtures and a calibration report;
- baseline and candidate implementations run on matched tasks and budgets;
- trial-level traces, invalid-run states, and an annotated disagreement set;
- Wilson, paired-comparison, zero-event-bound, and repeated-reliability reports;
- local smoke tests, a pull-request gate, and a broader on-demand or nightly command;
- a release contract, decision record, review-capacity worksheet, and incident-to-regression example;
- a guided README mapping each artifact to the relevant book chapter and exercise.

Keep provider adapters optional and make the default path deterministic and inexpensive. Use invented data and original traces so the project can be published without leaking or contaminating benchmark material.
