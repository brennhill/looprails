#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

async function readJsonl(file) {
  const text = await fs.readFile(path.join(here, file), "utf8");
  return text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function grade(task, run) {
  const checks = {
    state_matches: run.final_state.window === task.expected.final_window,
    commit_count_matches: run.commit_events === task.expected.commit_events,
    claim_is_grounded: task.expected.allowed_claims.includes(run.claimed_status),
    required_tools_used: task.expected.required_tools.every((tool) => run.tools.includes(tool)),
    helpful_next_step:
      !task.expected.helpful_next_step_required || run.judge_helpful_next_step === true,
    latency_within_local_limit: run.latency_ms <= task.expected.max_latency_ms,
  };
  return { id: task.id, pass: Object.values(checks).every(Boolean), checks };
}

function calibrationStats(rows, field) {
  let correct = 0;
  let falsePasses = 0;
  let falseFails = 0;
  for (const row of rows) {
    const prediction = row[field];
    if (prediction === row.expert_label) correct += 1;
    if (prediction === "pass" && row.expert_label === "fail") falsePasses += 1;
    if (prediction === "fail" && row.expert_label === "pass") falseFails += 1;
  }
  return { correct, total: rows.length, falsePasses, falseFails };
}

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let value = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    value = (value * (n - i + 1)) / i;
  }
  return value;
}

function exactTwoSidedPaired(candidateOnly, baselineOnly) {
  const n = candidateOnly + baselineOnly;
  const edge = Math.min(candidateOnly, baselineOnly);
  let lowerTail = 0;
  for (let k = 0; k <= edge; k += 1) lowerTail += choose(n, k) / (2 ** n);
  return Math.min(1, 2 * lowerTail);
}

function summarize(tasks, runs) {
  const byId = new Map(runs.map((run) => [run.id, run]));
  const results = tasks.map((task) => {
    const run = byId.get(task.id);
    if (!run) throw new Error(`Missing run for ${task.id}`);
    return grade(task, run);
  });
  return { results, passed: results.filter((result) => result.pass).length };
}

function paired(left, right) {
  const rightById = new Map(right.map((result) => [result.id, result]));
  const counts = { bothPass: 0, rightOnly: 0, leftOnly: 0, bothFail: 0 };
  for (const leftResult of left) {
    const rightResult = rightById.get(leftResult.id);
    if (leftResult.pass && rightResult.pass) counts.bothPass += 1;
    else if (!leftResult.pass && rightResult.pass) counts.rightOnly += 1;
    else if (leftResult.pass && !rightResult.pass) counts.leftOnly += 1;
    else counts.bothFail += 1;
  }
  return counts;
}

const [tasks, calibration, baselineRuns, candidateARuns, candidateBRuns] = await Promise.all([
  readJsonl("dataset.jsonl"),
  readJsonl("calibration.jsonl"),
  readJsonl("runs/baseline.jsonl"),
  readJsonl("runs/candidate-a.jsonl"),
  readJsonl("runs/candidate-b.jsonl"),
]);

const v1 = calibrationStats(calibration, "judge_v1");
const v2 = calibrationStats(calibration, "judge_v2");
const baseline = summarize(tasks, baselineRuns);
const candidateA = summarize(tasks, candidateARuns);
const candidateB = summarize(tasks, candidateBRuns);
const comparison = paired(baseline.results, candidateA.results);
const exactP = exactTwoSidedPaired(comparison.rightOnly, comparison.leftOnly);

console.log("Judge calibration (simulated)");
console.log(`v1: ${v1.correct}/${v1.total} correct; false passes=${v1.falsePasses}; false fails=${v1.falseFails}`);
console.log(`v2: ${v2.correct}/${v2.total} correct; false passes=${v2.falsePasses}; false fails=${v2.falseFails}`);
console.log("\nSystem evaluation (fictional)");
console.log(`baseline:    ${baseline.passed}/${tasks.length} passed`);
console.log(`candidate-a: ${candidateA.passed}/${tasks.length} passed`);
console.log(`candidate-b: ${candidateB.passed}/${tasks.length} passed`);
console.log("\nPaired baseline vs candidate-a");
console.log(`both pass=${comparison.bothPass}; candidate only=${comparison.rightOnly}; baseline only=${comparison.leftOnly}; both fail=${comparison.bothFail}`);
console.log(`two-sided exact paired p=${exactP.toFixed(4)}`);

for (const [name, summary] of [["baseline", baseline], ["candidate-a", candidateA], ["candidate-b", candidateB]]) {
  const failures = summary.results.filter((result) => !result.pass);
  if (failures.length === 0) continue;
  console.log(`\n${name} failures:`);
  for (const failure of failures) {
    const failedChecks = Object.entries(failure.checks).filter(([, pass]) => !pass).map(([check]) => check);
    console.log(`- ${failure.id}: ${failedChecks.join(", ")}`);
  }
}
