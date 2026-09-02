#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUTPUT = path.join(ROOT, "book/images/diagrams");
const MANIFEST = path.join(ROOT, "book/images/figure-manifest.json");

const C = {
  navy: "#17324D",
  copper: "#A85F32",
  gold: "#C6922A",
  paper: "#FCFAF6",
  gray: "#6B7280",
  carbon: "#252A30",
  paleNavy: "#E9EEF3",
  paleCopper: "#F5E9E1",
  paleGold: "#F8F0D8",
  white: "#FFFFFF",
};

const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const attrs = (values) => Object.entries(values).filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => `${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}="${esc(value)}"`).join(" ");

function text(x, y, value, options = {}) {
  const { size = 30, weight = 600, fill = C.navy, anchor = "middle", family = "Avenir Next, Helvetica, Arial, sans-serif", italic = false, className } = options;
  const lines = String(value).split("\n");
  const tspans = lines.map((line, index) => `<tspan x="${x}" dy="${index ? size * 1.22 : 0}">${esc(line)}</tspan>`).join("");
  return `<text ${attrs({ x, y, textAnchor: anchor, fontFamily: family, fontSize: size, fontWeight: weight, fontStyle: italic ? "italic" : "normal", fill, class: className })}>${tspans}</text>`;
}

function rect(x, y, width, height, options = {}) {
  return `<rect ${attrs({ x, y, width, height, rx: options.rx ?? 18, fill: options.fill ?? C.white, stroke: options.stroke ?? C.navy, strokeWidth: options.strokeWidth ?? 3, strokeDasharray: options.dash, opacity: options.opacity })}/>`;
}

function line(x1, y1, x2, y2, options = {}) {
  return `<line ${attrs({ x1, y1, x2, y2, stroke: options.stroke ?? C.navy, strokeWidth: options.width ?? 4, strokeDasharray: options.dash, markerEnd: options.arrow === false ? undefined : "url(#arrow-navy)", opacity: options.opacity })}/>`;
}

function copperLine(x1, y1, x2, y2, options = {}) {
  return `<line ${attrs({ x1, y1, x2, y2, stroke: C.copper, strokeWidth: options.width ?? 6, strokeDasharray: options.dash, markerEnd: options.arrow === false ? undefined : "url(#arrow-copper)" })}/>`;
}

function circle(cx, cy, r, options = {}) {
  return `<circle ${attrs({ cx, cy, r, fill: options.fill ?? C.white, stroke: options.stroke ?? C.navy, strokeWidth: options.strokeWidth ?? 3, strokeDasharray: options.dash, opacity: options.opacity })}/>`;
}

function pathElement(d, options = {}) {
  return `<path ${attrs({ d, fill: options.fill ?? "none", stroke: options.stroke ?? C.navy, strokeWidth: options.width ?? 4, strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: options.dash, markerEnd: options.arrow ? (options.stroke === C.copper ? "url(#arrow-copper)" : "url(#arrow-navy)") : undefined, opacity: options.opacity })}/>`;
}

function card(x, y, width, height, label, options = {}) {
  const fill = options.fill ?? C.white;
  const stroke = options.stroke ?? C.navy;
  const size = options.size ?? 27;
  const lineCount = String(label).split("\n").length;
  const body = [rect(x, y, width, height, { fill, stroke, strokeWidth: options.strokeWidth ?? 3, rx: options.rx ?? 16 })];
  if (options.icon) body.push(text(x + width / 2, y + 38, options.icon, { size: 28, fill: options.iconFill ?? C.gold }));
  const centeredBaseline = y + height / 2 + size * 0.35 - (lineCount - 1) * size * 0.61;
  const baselineWithSub = y + height / 2 - (lineCount - 1) * size * 0.61;
  body.push(text(x + width / 2, options.icon ? y + 78 : options.sub ? baselineWithSub : centeredBaseline, label, { size, weight: options.weight ?? 650, fill: options.textFill ?? C.navy }));
  if (options.sub) body.push(text(x + width / 2, y + height - 28, options.sub, { size: options.subSize ?? 21, weight: 500, fill: C.gray }));
  return body.join("");
}

function evidenceDiamond(cx, cy, size = 22) {
  return `<path d="M ${cx} ${cy - size} L ${cx + size} ${cy} L ${cx} ${cy + size} L ${cx - size} ${cy} Z" fill="${C.gold}" stroke="${C.carbon}" stroke-width="2"/>`;
}

function svg(body, options = {}) {
  const width = options.width ?? 1200;
  const height = options.height ?? 760;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(options.title || "Measure Twice, Prompt Once figure")}</title>
  <desc id="desc">${esc(options.alt || "")}</desc>
  <defs>
    <marker id="arrow-navy" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="${C.navy}"/></marker>
    <marker id="arrow-copper" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="${C.copper}"/></marker>
    <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="${C.gray}" stroke-width="3" opacity="0.35"/></pattern>
  </defs>
  <rect width="100%" height="100%" fill="${C.paper}"/>
  ${body}
</svg>\n`;
}

function loopArc(cx, cy, r, start, end, options = {}) {
  const point = (angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  const [x1, y1] = point(start);
  const [x2, y2] = point(end);
  const large = end - start > Math.PI ? 1 : 0;
  return pathElement(`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, { stroke: options.stroke ?? C.navy, width: options.width ?? 5, arrow: true, dash: options.dash });
}

const figures = [
  {
    file: "ch10-01-nested-loops.svg", priority: "P0", chapter: "10", title: "The nested loops",
    caption: "The inner loop performs the task. The outer loop improves the task performer. Evidence is the seam.",
    alt: "Two concentric cycles: a fast agent cycle inside a slower product-evaluation cycle, connected by task, grader, trace, budget, and rule artifacts.",
    draw() {
      const out = [];
      out.push(circle(600, 375, 292, { fill: C.paleNavy, stroke: C.navy, strokeWidth: 5 }));
      out.push(circle(600, 375, 148, { fill: C.white, stroke: C.copper, strokeWidth: 6 }));
      for (let i = 0; i < 5; i += 1) out.push(loopArc(600, 375, 250, -Math.PI / 2 + i * 1.24, -Math.PI / 2 + i * 1.24 + 0.9, { width: 5 }));
      for (let i = 0; i < 5; i += 1) out.push(loopArc(600, 375, 115, -Math.PI / 2 + i * 1.24, -Math.PI / 2 + i * 1.24 + 0.9, { stroke: C.copper, width: 6 }));
      const outer = [[600, 80, "Sample"], [870, 240, "Analyze"], [770, 610, "Encode"], [430, 650, "Compare"], [305, 290, "Decide"], [600, 710, "Production"]];
      outer.forEach(([x, y, label]) => out.push(text(x, y, label, { size: 27 })));
      const inner = [[600, 278, "Observe"], [688, 348, "Decide"], [660, 458, "Act"], [540, 462, "Verify"], [505, 348, "Stop / continue"]];
      inner.forEach(([x, y, label]) => out.push(text(x, y, label, { size: 21, fill: C.copper })));
      out.push(text(600, 382, "AGENT\nseconds / minutes", { size: 23, weight: 750 }));
      const bridges = [[600, 205, "Task contracts", 600, 176], [790, 335, "Verification", 855, 342], [700, 540, "Traces", 700, 583], [470, 540, "Budgets", 470, 583], [405, 335, "Runtime rules", 340, 342]];
      bridges.forEach(([x, y, label, labelX, labelY]) => { out.push(evidenceDiamond(x, y, 15)); out.push(text(labelX, labelY, label, { size: 17, fill: C.gray })); });
      out.push(copperLine(935, 450, 745, 470, { width: 7 }));
      out.push(text(980, 445, "production\nfailure", { size: 21, fill: C.copper }));
      out.push(text(600, 42, "EVAL LOOP · days / weeks", { size: 25, weight: 800 }));
      return out.join("");
    },
  },
  {
    file: "ch05-01-grader-ladder.svg", priority: "P0", chapter: "5", title: "The grader ladder",
    caption: "Use the least magical grader that can answer the criterion.",
    alt: "Six ascending grader steps from an environment oracle to expert judgment, with increasing interpretive scope and cost.",
    draw() {
      const labels = ["Environment oracle", "Executable test", "Structured evidence", "Deterministic rule", "Model judge", "Expert judgment"];
      const out = [];
      labels.forEach((label, index) => {
        const x = 210 + index * 135;
        const y = 610 - index * 82;
        out.push(rect(x, y, 170, 82, { fill: index < 3 ? C.paleGold : index < 5 ? C.paleNavy : C.paleCopper, stroke: index === 5 ? C.copper : C.navy, rx: 8 }));
        out.push(text(x + 85, y + 34, label, { size: 20 }));
      });
      out.push(pathElement("M 120 650 L 120 150", { stroke: C.navy, width: 5, arrow: true }));
      out.push(text(86, 635, "direct", { size: 20, anchor: "end" }));
      out.push(text(86, 190, "flexible", { size: 20, anchor: "end" }));
      out.push(pathElement("M 1080 650 L 1080 150", { stroke: C.copper, width: 5, arrow: true }));
      out.push(text(1115, 635, "cheap", { size: 20, anchor: "start", fill: C.copper }));
      out.push(text(1115, 190, "costly", { size: 20, anchor: "start", fill: C.copper }));
      out.push(card(440, 82, 320, 72, "Stop when evidence is strong enough", { fill: C.paleGold, stroke: C.gold, size: 23 }));
      out.push(pathElement("M 600 156 C 660 210, 710 230, 760 275", { stroke: C.gold, width: 5, arrow: true }));
      return out.join("");
    },
  },
  {
    file: "ch04-01-four-truths.svg", priority: "P0", chapter: "4", title: "Four kinds of truth",
    caption: "The output tells you what the agent said. The workbench tells you where to verify it.",
    alt: "A fluent agent output points to four external evidence workbenches: repository tests, database state, expert criteria, and cited source passages.",
    draw() {
      const out = [card(445, 285, 310, 180, "Fluent agent output", { fill: C.paleCopper, stroke: C.copper, icon: "“ … ”", size: 30, sub: "claim, patch, promise, report" })];
      const cards = [
        [60, 60, "SWE-bench", "patch → tests / repo state", "⌁"],
        [810, 60, "τ-bench", "promise → database / actions", "▤"],
        [60, 540, "HealthBench", "response → expert criteria", "✚"],
        [810, 540, "DeepResearch", "claim → source passage", "◇"],
      ];
      cards.forEach(([x, y, label, sub, icon]) => out.push(card(x, y, 330, 150, label, { fill: C.white, icon, sub, size: 27, subSize: 19 })));
      [[445, 330, 390, 180], [755, 330, 810, 180], [445, 420, 390, 615], [755, 420, 810, 615]].forEach(([x1, y1, x2, y2]) => out.push(line(x1, y1, x2, y2)));
      out.push(text(600, 505, "Truth lives outside the prose", { size: 25, fill: C.copper, weight: 750 }));
      return out.join("");
    },
  },
  {
    file: "ch03-01-task-anatomy.svg", priority: "P0", chapter: "3", title: "Anatomy of an eval task",
    caption: "A prompt is one field in a task contract.",
    alt: "A task contract flows from purpose through setup, input, execution limits, expected evidence, and owner metadata, with harness and version dependencies shown below.",
    draw() {
      const labels = ["Purpose", "Setup", "Input", "Execution\nlimits", "Expected\nevidence", "Metadata\n+ owner"];
      const out = [];
      labels.forEach((label, index) => {
        const x = 45 + index * 190;
        out.push(card(x, 170, 160, 120, label, { fill: index === 2 ? C.paleCopper : C.white, stroke: index === 2 ? C.copper : C.navy, size: 25 }));
        if (index < labels.length - 1) out.push(line(x + 160, 230, x + 187, 230));
      });
      out.push(pathElement("M 225 330 L 225 380 L 965 380 L 965 330", { stroke: C.gold, width: 5 }));
      out.push(text(595, 420, "HARNESS", { size: 26, fill: C.gold, weight: 800 }));
      out.push(text(600, 100, "TASK CONTRACT", { size: 34, weight: 800 }));
      const deps = [[110, "Policy"], [300, "Tools"], [490, "Model"], [680, "Grader"], [870, "Environment"], [1060, "Data version"]];
      deps.forEach(([x, label]) => { out.push(circle(x, 565, 52, { fill: C.paleNavy })); out.push(text(x, 574, label, { size: 19 })); out.push(line(x, 513, x, 455, { arrow: false, dash: "8 8", width: 3 })); });
      out.push(text(600, 680, "Version these dependencies with the task", { size: 24, fill: C.gray }));
      return out.join("");
    },
  },
  {
    file: "ch08-01-trace-first-departure.svg", priority: "P0", chapter: "8", title: "Annotated trace and first departure",
    caption: "The visible failure is at the end. The actionable departure is often earlier.",
    alt: "A four-lane trace timeline marks an unsafe inference at event three and a visible duplicate booking change at event six.",
    draw() {
      const out = [];
      const lanes = [[120, "Conversation"], [245, "Tool / action"], [370, "Environment"], [495, "Grader evidence"]];
      lanes.forEach(([y, label]) => { out.push(text(35, y + 8, label, { size: 21, anchor: "start" })); out.push(line(180, y, 1140, y, { arrow: false, width: 2, stroke: C.gray })); });
      const xs = [230, 400, 570, 740, 910, 1080];
      xs.forEach((x, index) => { out.push(circle(x, 120, 22, { fill: index === 2 ? C.paleCopper : C.white, stroke: index === 2 ? C.copper : C.navy, strokeWidth: index === 2 ? 6 : 3 })); out.push(text(x, 130, index + 1, { size: 20 })); });
      out.push(card(335, 185, 135, 80, "Lookup", { fill: C.paleNavy, size: 21 }));
      out.push(card(505, 185, 135, 80, "Assume", { fill: C.paleCopper, stroke: C.copper, size: 21 }));
      out.push(card(675, 185, 135, 80, "Change", { fill: C.paleNavy, size: 21 }));
      out.push(card(845, 185, 135, 80, "Retry", { fill: C.paleGold, stroke: C.gold, size: 21 }));
      out.push(card(1015, 185, 135, 80, "Change", { fill: C.paleCopper, stroke: C.copper, size: 21 }));
      out.push(text(570, 335, "state not re-read", { size: 22, fill: C.copper }));
      out.push(evidenceDiamond(740, 370, 18));
      out.push(text(740, 415, "first change", { size: 20 }));
      out.push(evidenceDiamond(1080, 370, 18));
      out.push(text(1080, 415, "duplicate", { size: 20, fill: C.copper }));
      out.push(card(500, 445, 160, 82, "FIRST\nDEPARTURE", { fill: C.paleCopper, stroke: C.copper, size: 21 }));
      out.push(copperLine(580, 445, 570, 285, { width: 5 }));
      out.push(card(980, 445, 160, 82, "VISIBLE\nFAILURE", { fill: C.paleCopper, stroke: C.copper, size: 21 }));
      out.push(copperLine(1060, 445, 1080, 285, { width: 5 }));
      ["Contract", "Outcome", "First departure", "Recovery", "Grader"].forEach((label, index) => out.push(card(105 + index * 205, 625, 185, 66, label, { fill: index === 2 ? C.paleGold : C.white, stroke: index === 2 ? C.gold : C.navy, size: 20 })));
      return out.join("");
    },
  },
  {
    file: "ch09-01-pass-at-vs-power.svg", priority: "P0", chapter: "9", title: "pass at k versus pass to the k",
    caption: "A nearly certain demo and a worse-than-even user journey can come from the same per-task score.",
    alt: "Three candidate attempts produce 98.44 percent pass at three, while three required sequential tasks produce 42.19 percent journey reliability, both from a 75 percent per-task rate.",
    draw() {
      const out = [text(600, 55, "Same per-task rate: 75%", { size: 31, weight: 800 })];
      out.push(text(80, 210, "pass@3", { size: 31, anchor: "start", fill: C.copper }));
      [300, 485, 670].forEach((x, i) => out.push(card(x, 130, 140, 115, i === 1 ? "PASS" : "try", { fill: i === 1 ? C.paleGold : C.white, stroke: i === 1 ? C.gold : C.navy, size: 24 })));
      out.push(line(810, 187, 925, 187));
      out.push(card(945, 127, 180, 120, "98.44%", { fill: C.paleGold, stroke: C.gold, size: 34, sub: "one must pass" }));
      out.push(text(80, 485, "pass³", { size: 31, anchor: "start", fill: C.copper }));
      [300, 485, 670].forEach((x, i) => out.push(card(x, 405, 140, 115, i === 2 ? "FAIL" : "PASS", { fill: i === 2 ? C.paleCopper : C.paleGold, stroke: i === 2 ? C.copper : C.gold, size: 24 })));
      out.push(line(810, 462, 925, 462));
      out.push(card(945, 402, 180, 120, "42.19%", { fill: C.paleCopper, stroke: C.copper, size: 34, sub: "all must pass" }));
      out.push(text(600, 650, "Selection rewards one success · journeys expose every failure", { size: 25, fill: C.gray }));
      return out.join("");
    },
  },
  {
    file: "ch11-01-eval-funnel.svg", priority: "P0", chapter: "11", title: "Evaluation funnel",
    caption: "Fast checks protect iteration; deeper evidence protects release; production starts the next cycle.",
    alt: "Five narrowing evaluation gates move from local smoke checks through PR, nightly, held-out audit, and production rollout, which loops back to discovery.",
    draw() {
      const stages = [
        [60, 150, 190, 420, "Local smoke", "seconds\nsmall + blocking"],
        [250, 190, 190, 340, "PR regression", "minutes\nchanged areas"],
        [440, 230, 190, 260, "Nightly", "hours\ncapability suite"],
        [630, 270, 190, 180, "Held-out audit", "scheduled\nrelease evidence"],
        [820, 310, 190, 100, "Production", "guarded\nreal outcomes"],
      ];
      const out = [];
      stages.forEach(([x, y, w, h, label, sub], index) => {
        out.push(rect(x, y, w, h, { fill: index === 4 ? C.paleCopper : index === 3 ? C.paleGold : C.paleNavy, stroke: index === 4 ? C.copper : index === 3 ? C.gold : C.navy, rx: 6 }));
        out.push(text(x + w / 2, y + 55, label, { size: 23 }));
        out.push(text(x + w / 2, y + 100, sub, { size: 18, fill: C.gray }));
        if (index < stages.length - 1) out.push(line(x + w, y + h / 2, x + w + 42, y + h / 2));
      });
      out.push(pathElement("M 915 435 C 900 650, 360 690, 150 600", { stroke: C.copper, width: 7, arrow: true }));
      out.push(text(565, 705, "production evidence starts task discovery", { size: 24, fill: C.copper }));
      out.push(text(1065, 195, "fewer\ncandidates", { size: 20, fill: C.gray }));
      out.push(text(1065, 355, "stronger\nevidence", { size: 20, fill: C.gray }));
      return out.join("");
    },
  },
  {
    file: "ch13-01-dataset-lifecycle.svg", priority: "P0", chapter: "13", title: "Dataset lifecycle",
    caption: "An eval suite is maintained evidence, not a permanent monument.",
    alt: "A circular dataset lifecycle runs from production failure through candidate review, capability and regression suites, audit, then refresh or retirement.",
    draw() {
      const nodes = [
        [600, 92, "Production\nfailure"], [900, 190, "Candidate\ncase"], [1030, 410, "Fairness +\nreview"], [800, 625, "Capability\nsuite"], [400, 625, "Regression\nsuite"], [170, 410, "Staleness /\nleakage audit"], [300, 190, "Refresh\nor retire"],
      ];
      const out = [];
      nodes.forEach(([x, y, label], index) => { out.push(circle(x, y, 76, { fill: index === 6 ? C.paleCopper : index === 0 ? C.paleGold : C.white, stroke: index === 6 ? C.copper : index === 0 ? C.gold : C.navy, strokeWidth: 4 })); out.push(text(x, y - 9, label, { size: 21 })); });
      nodes.forEach((node, index) => { const next = nodes[(index + 1) % nodes.length]; const angle1 = Math.atan2(next[1] - node[1], next[0] - node[0]); const sx = node[0] + 82 * Math.cos(angle1); const sy = node[1] + 82 * Math.sin(angle1); const ex = next[0] - 88 * Math.cos(angle1); const ey = next[1] - 88 * Math.sin(angle1); out.push(line(sx, sy, ex, ey)); });
      out.push(card(430, 295, 340, 170, "MAINTAINED\nEVIDENCE", { fill: C.paleNavy, size: 30, sub: "owned · versioned · reviewed" }));
      out.push(card(65, 635, 220, 75, "invalid → fix history", { fill: C.paleCopper, stroke: C.copper, size: 19 }));
      out.push(card(490, 675, 220, 60, "solved → regression", { fill: C.paleGold, stroke: C.gold, size: 19 }));
      out.push(card(915, 635, 220, 75, "misaligned → retire", { fill: C.paleCopper, stroke: C.copper, size: 19 }));
      return out.join("");
    },
  },
  {
    file: "ch14-01-ownership-cadence.svg", priority: "P0", chapter: "14", title: "Ownership map and clocks",
    caption: "Centralize the mechanics. Keep the meaning of good with the domain. Put both on a clock.",
    alt: "Eval artifacts sit at the center of product, engineering, and domain owners, supported by platform, data science, and risk, with recurring review clocks.",
    draw() {
      const out = [circle(600, 360, 125, { fill: C.paleGold, stroke: C.gold, strokeWidth: 5 }), text(600, 330, "EVAL\nARTIFACTS", { size: 28 }), text(600, 420, "tasks · graders\ntraces · decisions", { size: 20, fill: C.gray })];
      const inner = [[600, 105, "Product"], [355, 460, "Engineering"], [845, 460, "Domain expert"]];
      inner.forEach(([x, y, label]) => { out.push(circle(x, y, 80, { fill: C.white })); out.push(text(x, y + 8, label, { size: 22 })); out.push(line(x, y + (y < 200 ? 80 : -80), 600 + (x - 600) * 0.48, 360 + (y - 360) * 0.48, { arrow: false })); });
      const support = [[150, 190, "Platform"], [150, 620, "Data science"], [1050, 190, "Risk"], [1050, 620, "Decision owner"]];
      support.forEach(([x, y, label], index) => { out.push(card(x - 95, y - 45, 190, 90, label, { fill: index === 3 ? C.paleCopper : C.paleNavy, stroke: index === 3 ? C.copper : C.navy, size: 20 })); });
      [[270, 190, 500, 280], [270, 620, 480, 445], [930, 190, 700, 280], [930, 620, 720, 445]].forEach(([x1, y1, x2, y2], index) => out.push(index === 3 ? copperLine(x1, y1, x2, y2) : line(x1, y1, x2, y2, { dash: "8 8" })));
      const clocks = [[390, 670, "every change"], [535, 670, "nightly"], [680, 670, "weekly"], [825, 670, "monthly / qtr"]];
      clocks.forEach(([x, y, label]) => { out.push(circle(x, y, 35, { fill: C.white, stroke: C.gold })); out.push(pathElement(`M ${x} ${y} L ${x} ${y - 18} M ${x} ${y} L ${x + 14} ${y + 8}`, { stroke: C.gold, width: 3 })); out.push(text(x, y + 58, label, { size: 17 })); });
      return out.join("");
    },
  },
  {
    file: "ch15-01-thirty-day-plan.svg", priority: "P0", chapter: "15", title: "The first thirty days",
    caption: "A month can establish one minimum viable eval loop; consequence sets the release pace.",
    alt: "Four weekly columns cover discover, encode, measure, and operate, ending in controlled shadow or production evidence with artifacts accumulating across the month.",
    draw() {
      const weeks = [
        ["WEEK 1", "DISCOVER", ["Read traces", "Find truth", "Taxonomy", "20 cases"]],
        ["WEEK 2", "ENCODE", ["Task contracts", "Grader map", "Hard checks", "Rubric"]],
        ["WEEK 3", "MEASURE", ["Baseline", "Calibration", "Paired compare", "Release rule"]],
        ["WEEK 4", "OPERATE", ["CI + nightly", "Held-out audit", "Shadow / rollout", "Owners"]],
      ];
      const out = [];
      weeks.forEach(([week, verb, items], index) => {
        const x = 45 + index * 285;
        out.push(rect(x, 85, 255, 500, { fill: index === 3 ? C.paleCopper : index === 2 ? C.paleGold : C.white, stroke: index === 3 ? C.copper : index === 2 ? C.gold : C.navy, rx: 10 }));
        out.push(text(x + 127, 130, week, { size: 20, fill: C.gray }));
        out.push(text(x + 127, 180, verb, { size: 30, weight: 800, fill: index === 3 ? C.copper : C.navy }));
        items.forEach((item, itemIndex) => { out.push(evidenceDiamond(x + 42, 245 + itemIndex * 75, 11)); out.push(text(x + 70, 253 + itemIndex * 75, item, { size: 22, anchor: "start" })); });
        if (index < 3) out.push(line(x + 255, 335, x + 282, 335));
      });
      out.push(pathElement("M 75 640 L 1125 640", { stroke: C.gold, width: 10 }));
      [220, 505, 790, 1075].forEach((x, index) => { out.push(evidenceDiamond(x, 640, 20)); out.push(text(x, 700, ["cases", "graders", "decision", "cadence"][index], { size: 20 })); });
      out.push(text(600, 745, "Artifacts accumulate; the loop stays closed", { size: 22, fill: C.gray }));
      return out.join("");
    },
  },
  {
    file: "ch01-01-demo-vs-product.svg", priority: "P1", chapter: "1", title: "Demo question versus product questions",
    caption: "The demo is a valid answer to a smaller question.",
    alt: "One spotlighted demo case asks whether the system can work once, while varied production cases ask about truth, repetition, safety, variation, and learning.",
    draw() {
      const out = [rect(50, 90, 350, 560, { fill: C.paleGold, stroke: C.gold }), text(225, 145, "DEMO", { size: 30, weight: 800 })];
      out.push(circle(225, 330, 105, { fill: C.white, stroke: C.gold, strokeWidth: 6 }));
      out.push(text(225, 315, "Can it work", { size: 28 })); out.push(text(225, 355, "once?", { size: 34, fill: C.copper }));
      out.push(rect(455, 90, 695, 560, { fill: C.paleNavy, stroke: C.navy })); out.push(text(802, 145, "PRODUCT", { size: 30, weight: 800 }));
      const cases = [[580, 260, "Variation"], [800, 225, "Truth"], [1010, 280, "Repetition"], [630, 460, "Safety"], [850, 440, "Recovery"], [1040, 500, "Learning"]];
      cases.forEach(([x, y, label], index) => { out.push(circle(x, y, 72, { fill: index % 2 ? C.white : C.paleCopper, stroke: index % 2 ? C.navy : C.copper })); out.push(text(x, y + 8, label, { size: 21 })); });
      out.push(text(802, 610, "What happens across the distribution?", { size: 24, fill: C.gray }));
      return out.join("");
    },
  },
  {
    file: "ch02-01-two-samples.svg", priority: "P1", chapter: "2", title: "Discovery sample versus measurement sample",
    caption: "Use enriched samples to discover categories and representative samples to estimate rates.",
    alt: "Production feeds a failure-enriched discovery basket and a probability-sampled measurement basket with different questions.",
    draw() {
      const out = [card(440, 55, 320, 100, "PRODUCTION", { fill: C.paleNavy, size: 29 })];
      out.push(line(520, 155, 310, 275)); out.push(line(680, 155, 890, 275));
      out.push(rect(80, 275, 450, 320, { fill: C.paleCopper, stroke: C.copper }));
      out.push(text(305, 325, "DISCOVERY SAMPLE", { size: 27, fill: C.copper, weight: 800 }));
      out.push(text(305, 375, "failure-enriched", { size: 23, fill: C.gray }));
      [[180, 455], [260, 440], [335, 470], [415, 430]].forEach(([x, y], i) => out.push(circle(x, y, 34, { fill: i < 3 ? C.paleCopper : C.white, stroke: C.copper })));
      out.push(text(305, 550, "What can fail?", { size: 29 }));
      out.push(rect(670, 275, 450, 320, { fill: C.paleGold, stroke: C.gold }));
      out.push(text(895, 325, "MEASUREMENT SAMPLE", { size: 27, fill: C.navy, weight: 800 }));
      out.push(text(895, 375, "probability-sampled", { size: 23, fill: C.gray }));
      [[770, 455], [850, 440], [925, 470], [1005, 430]].forEach(([x, y], i) => out.push(circle(x, y, 34, { fill: i % 2 ? C.white : C.paleGold, stroke: C.gold })));
      out.push(text(895, 550, "How often?", { size: 29 }));
      out.push(text(600, 690, "Different sampling frames answer different questions", { size: 25, fill: C.gray }));
      return out.join("");
    },
  },
  {
    file: "ch05-02-composite-grader.svg", priority: "P1", chapter: "5", title: "Composite grader",
    caption: "Do not let beautiful communication average away an unauthorized action.",
    alt: "State, authorization, action history, communication quality, cost, and latency feed a structured result, with hard gates separated from soft quality.",
    draw() {
      const inputs = [[55, 90, "State", true], [55, 205, "Authorization", true], [55, 320, "Action history", true], [55, 435, "Communication", false], [55, 550, "Cost + latency", false]];
      const out = [];
      inputs.forEach(([x, y, label, hard]) => { out.push(card(x, y, 260, 80, label, { fill: hard ? C.paleCopper : C.paleNavy, stroke: hard ? C.copper : C.navy, size: 23 })); out.push(hard ? copperLine(315, y + 40, 510, y + 40) : line(315, y + 40, 510, y + 40)); });
      out.push(rect(510, 115, 300, 445, { fill: C.white, stroke: C.navy, strokeWidth: 5 }));
      out.push(text(660, 165, "STRUCTURED RESULT", { size: 27, weight: 800 }));
      out.push(card(565, 220, 190, 90, "eligible?", { fill: C.paleCopper, stroke: C.copper, size: 25 }));
      out.push(card(565, 350, 190, 90, "quality vector", { fill: C.paleNavy, size: 24 }));
      out.push(text(660, 500, "evidence + reasons", { size: 21, fill: C.gray }));
      out.push(line(810, 335, 935, 335));
      out.push(card(935, 245, 210, 180, "DECISION", { fill: C.paleGold, stroke: C.gold, size: 30, sub: "no hidden averaging" }));
      out.push(evidenceDiamond(220, 685, 13)); out.push(text(245, 693, "copper = hard gate", { size: 19, anchor: "start", fill: C.copper }));
      out.push(circle(535, 685, 13, { fill: C.paleNavy, stroke: C.navy })); out.push(text(560, 693, "navy = quality signal", { size: 19, anchor: "start" }));
      return out.join("");
    },
  },
  {
    file: "ch06-01-test-the-test.svg", priority: "P1", chapter: "6", title: "Four attacks on an executable grader",
    caption: "Every executable oracle needs cases that test the oracle.",
    alt: "Four quadrants show narrow passing, overconstraint, side-effect escape, and environment tricks as attacks on executable graders.",
    draw() {
      const qs = [[50, 70, "NARROW PASS", "Can a wrong solution\nsatisfy this test?"], [620, 70, "OVERCONSTRAINT", "Does a valid alternative\nfail?"], [50, 405, "SIDE-EFFECT ESCAPE", "What changed outside\nthe assertion?"], [620, 405, "ENVIRONMENT TRICK", "Did setup make the\nanswer accidental?"]];
      const out = [];
      qs.forEach(([x, y, label, question], index) => { out.push(rect(x, y, 530, 275, { fill: index % 2 ? C.paleNavy : C.paleCopper, stroke: index % 2 ? C.navy : C.copper })); out.push(text(x + 265, y + 55, label, { size: 26, weight: 800, fill: index % 2 ? C.navy : C.copper })); out.push(circle(x + 130, y + 160, 55, { fill: C.white, stroke: index % 2 ? C.navy : C.copper })); out.push(text(x + 130, y + 171, index === 0 ? "✓?" : index === 1 ? "✕?" : index === 2 ? "↗" : "⚙", { size: 34, fill: index % 2 ? C.navy : C.copper })); out.push(text(x + 330, y + 150, question, { size: 24 })); });
      return out.join("");
    },
  },
  {
    file: "ch07-01-judge-calibration.svg", priority: "P1", chapter: "7", title: "Judge calibration pipeline",
    caption: "Calibration decides where the judge may be trusted, not whether it is universally good.",
    alt: "Expert labels flow through adjudication, development data, a judge, category confusion matrices, bounded scope, and drift audit.",
    draw() {
      const labels = ["Expert\nlabels", "Adjudicate", "Development\nsplit", "Judge", "By-category\nconfusion", "Allowed scope\n+ human route", "Drift\naudit"];
      const out = [];
      labels.forEach((label, index) => { const x = 25 + index * 168; const y = index % 2 ? 230 : 175; out.push(card(x, y, 145, 120, label, { fill: index === 4 ? C.paleGold : index === 5 ? C.paleCopper : C.white, stroke: index === 4 ? C.gold : index === 5 ? C.copper : C.navy, size: 20 })); if (index < labels.length - 1) out.push(line(x + 145, y + 60, x + 165, (index + 1) % 2 ? 290 : 235)); });
      out.push(rect(385, 445, 430, 220, { fill: C.white, stroke: C.navy }));
      out.push(text(600, 485, "SYNTHETIC CALIBRATION", { size: 24, weight: 800 }));
      out.push(text(500, 545, "judge pass", { size: 20 })); out.push(text(700, 545, "judge fail", { size: 20 }));
      out.push(card(430, 570, 140, 70, "36", { fill: C.paleGold, stroke: C.gold, size: 30 })); out.push(card(630, 570, 140, 70, "5", { fill: C.paleCopper, stroke: C.copper, size: 30 }));
      out.push(text(350, 610, "expert pass", { size: 20, anchor: "end" }));
      out.push(card(430, 660, 140, 70, "10", { fill: C.paleCopper, stroke: C.copper, size: 30 })); out.push(card(630, 660, 140, 70, "49", { fill: C.paleGold, stroke: C.gold, size: 30 }));
      out.push(text(350, 700, "expert fail", { size: 20, anchor: "end" }));
      return out.join("");
    },
  },
  {
    file: "ch09-02-paired-disagreements.svg", priority: "P1", chapter: "9", title: "Paired comparison",
    caption: "The average says plus ten. The 26 disagreements explain the change.",
    alt: "One hundred paired tasks divide into 62 both pass, 18 new-only, 8 old-only, and 12 both fail, emphasizing the 26 disagreements.",
    draw() {
      const groups = [[45, 120, 600, 250, 62, "both pass", C.paleGold, C.gold], [675, 120, 220, 250, 18, "new only", C.paleNavy, C.navy], [925, 120, 220, 250, 8, "old only", C.paleCopper, C.copper], [45, 420, 1100, 180, 12, "both fail", C.white, C.gray]];
      const out = [];
      groups.forEach(([x, y, w, h, count, label, fill, stroke]) => { out.push(rect(x, y, w, h, { fill, stroke, strokeWidth: label.includes("only") ? 6 : 3 })); out.push(text(x + w / 2, y + 80, count, { size: 48, fill: stroke, weight: 800 })); out.push(text(x + w / 2, y + 130, label, { size: 25 })); });
      out.push(pathElement("M 785 390 L 1035 390", { stroke: C.copper, width: 5 }));
      out.push(text(910, 415, "26 discordant cases", { size: 24, fill: C.copper, weight: 750 }));
      out.push(text(600, 690, "New score − old score = +10 points", { size: 29, weight: 800 }));
      return out.join("");
    },
  },
  {
    file: "ch09-03-clusters.svg", priority: "P1", chapter: "9", title: "Clustered evidence",
    caption: "Fifty rows from five documents are not fifty independent worlds.",
    alt: "Fifty question dots are grouped inside five documents to show shared error families rather than independent observations.",
    draw() {
      const out = [text(235, 80, "NAIVE VIEW", { size: 28, weight: 800 }), text(875, 80, "DEPENDENCE VIEW", { size: 28, weight: 800 })];
      for (let i = 0; i < 50; i += 1) out.push(circle(65 + (i % 10) * 38, 150 + Math.floor(i / 10) * 55, 11, { fill: i % 7 === 0 ? C.copper : C.paleNavy, stroke: i % 7 === 0 ? C.copper : C.navy, strokeWidth: 2 }));
      out.push(text(235, 490, "50 independent rows?", { size: 24, fill: C.gray }));
      for (let doc = 0; doc < 5; doc += 1) {
        const x = 590 + (doc % 3) * 190;
        const y = 135 + Math.floor(doc / 3) * 270;
        out.push(rect(x, y, 160, 210, { fill: doc % 2 ? C.paleGold : C.white, stroke: doc % 2 ? C.gold : C.navy, rx: 4 }));
        for (let point = 0; point < 10; point += 1) out.push(circle(x + 30 + (point % 5) * 25, y + 70 + Math.floor(point / 5) * 55, 8, { fill: point === doc ? C.copper : C.paleNavy, stroke: point === doc ? C.copper : C.navy, strokeWidth: 1 }));
        out.push(text(x + 80, y + 35, `doc ${doc + 1}`, { size: 18, fill: C.gray }));
      }
      out.push(text(875, 680, "5 shared-error families", { size: 25, fill: C.copper }));
      out.push(line(480, 380, 550, 380));
      return out.join("");
    },
  },
  {
    file: "ch12-01-outcome-chain.svg", priority: "P1", chapter: "12", title: "Offline-to-online outcome chain",
    caption: "An offline metric is a proxy until production validates the arrows.",
    alt: "Offline criterion flows through near-term behavior to product outcome, with each arrow labeled hypothesis and a production experiment feeding evidence back.",
    draw() {
      const out = [card(55, 210, 300, 160, "OFFLINE\nCRITERION", { fill: C.paleNavy, size: 30, sub: "measured in suite" }), card(450, 210, 300, 160, "NEAR-TERM\nBEHAVIOR", { fill: C.paleGold, stroke: C.gold, size: 30, sub: "observed in use" }), card(845, 210, 300, 160, "PRODUCT\nOUTCOME", { fill: C.paleCopper, stroke: C.copper, size: 30, sub: "what matters" })];
      out.push(line(355, 290, 450, 290)); out.push(line(750, 290, 845, 290));
      out.push(text(402, 260, "hypothesis", { size: 20, fill: C.gray })); out.push(text(797, 260, "hypothesis", { size: 20, fill: C.gray }));
      out.push(card(450, 500, 300, 110, "PRODUCTION EXPERIMENT", { fill: C.white, stroke: C.copper, size: 24, sub: "validate the chain" }));
      out.push(pathElement("M 995 370 C 1000 550, 805 555, 750 555", { stroke: C.copper, width: 6, arrow: true }));
      out.push(pathElement("M 450 555 C 250 555, 210 430, 210 370", { stroke: C.copper, width: 6, arrow: true }));
      out.push(text(600, 690, "Evidence returns to the proxy definition", { size: 25, fill: C.copper }));
      return out.join("");
    },
  },
  {
    file: "ch12-02-production-layers.svg", priority: "P1", chapter: "12", title: "Production evidence layers",
    caption: "Independent evidence layers fail differently.",
    alt: "Six offset evidence layers with different holes cover runtime guards, asynchronous graders, samples, risk review, delayed outcomes, and experiments.",
    draw() {
      const labels = ["Runtime guard", "Async grader", "Representative sample", "Risk review", "Delayed outcome", "Controlled experiment"];
      const out = [];
      labels.forEach((label, index) => {
        const x = 90 + index * 85; const y = 90 + index * 80;
        out.push(rect(x, y, 770, 100, { fill: index % 3 === 0 ? C.paleCopper : index % 3 === 1 ? C.paleNavy : C.paleGold, stroke: index % 3 === 0 ? C.copper : index % 3 === 1 ? C.navy : C.gold, opacity: 0.96, rx: 8 }));
        out.push(text(x + 40, y + 58, label, { size: 23, anchor: "start" }));
        const holeX = x + 400 + ((index * 117) % 260);
        out.push(circle(holeX, y + 50, 25, { fill: C.paper, stroke: C.gray, dash: "6 5" }));
      });
      out.push(pathElement("M 1050 120 L 1050 650", { stroke: C.copper, width: 7, arrow: true }));
      out.push(text(1090, 120, "risk", { size: 23, anchor: "start", fill: C.copper }));
      out.push(text(1090, 650, "caught", { size: 23, anchor: "start", fill: C.copper }));
      out.push(text(600, 735, "No single layer covers the whole system", { size: 25, fill: C.gray }));
      return out.join("");
    },
  },
  {
    file: "ch13-02-eval-failure-wheel.svg", priority: "P1", chapter: "13", title: "Eval failure wheel",
    caption: "Measurement needs monitoring, adversaries, owners, and an exit plan.",
    alt: "Eight eval failure modes surround the statement that the eval is part of the system.",
    draw() {
      const labels = ["Gaming", "Wrong contract", "Contamination", "Saturation", "Stale truth", "Judge drift", "Proxy divorce", "Metric collapse"];
      const out = [];
      const cx = 600, cy = 370, inner = 150, outer = 310;
      labels.forEach((label, index) => {
        const a0 = -Math.PI / 2 + index * Math.PI / 4;
        const a1 = a0 + Math.PI / 4 - 0.025;
        const points = [[cx + inner * Math.cos(a0), cy + inner * Math.sin(a0)], [cx + outer * Math.cos(a0), cy + outer * Math.sin(a0)], [cx + outer * Math.cos(a1), cy + outer * Math.sin(a1)], [cx + inner * Math.cos(a1), cy + inner * Math.sin(a1)]];
        out.push(pathElement(`M ${points.map((p) => p.join(" ")).join(" L ")} Z`, { fill: index % 2 ? C.paleCopper : C.paleNavy, stroke: index % 2 ? C.copper : C.navy, width: 3 }));
        const mid = (a0 + a1) / 2; const tx = cx + 235 * Math.cos(mid); const ty = cy + 235 * Math.sin(mid);
        out.push(text(tx, ty + 7, label, { size: 20, fill: index % 2 ? C.copper : C.navy }));
      });
      out.push(circle(cx, cy, 128, { fill: C.paleGold, stroke: C.gold, strokeWidth: 5 }));
      out.push(text(cx, cy - 15, "THE EVAL IS", { size: 25, weight: 800 })); out.push(text(cx, cy + 25, "PART OF THE SYSTEM", { size: 23, weight: 800 }));
      return out.join("");
    },
  },
  {
    file: "app-c-01-four-case-card.svg", priority: "P1", chapter: "Appendix C", title: "Four-case comparison card",
    caption: "Four benchmarks, four locations of truth, four different maintenance problems.",
    alt: "Four vertical benchmark cards compare artifact, strongest truth, grader risk, and maintenance lesson for SWE-bench, tau-bench, HealthBench, and DeepResearch Bench.",
    draw() {
      const cases = [
        ["SWE-bench", "Patch", "Tests + repo", "Wrong contract", "Audit tests"],
        ["τ-bench", "Tool trace", "World state", "Claim ≠ action", "Version policy"],
        ["HealthBench", "Response", "Expert criteria", "Rubric drift", "Adjudicate"],
        ["DeepResearch", "Report", "Source support", "Citation theater", "Check claims"],
      ];
      const out = [];
      cases.forEach((entry, index) => {
        const x = 30 + index * 292;
        out.push(rect(x, 60, 265, 630, { fill: index % 2 ? C.paleNavy : C.white, stroke: index === 2 ? C.copper : C.navy, strokeWidth: index === 2 ? 5 : 3 }));
        out.push(text(x + 132, 115, entry[0], { size: 27, weight: 800 }));
        const rows = [["ARTIFACT", entry[1]], ["TRUTH", entry[2]], ["RISK", entry[3]], ["MAINTAIN", entry[4]]];
        rows.forEach(([label, value], row) => { out.push(text(x + 30, 210 + row * 120, label, { size: 17, anchor: "start", fill: C.gray })); out.push(text(x + 30, 250 + row * 120, value, { size: 23, anchor: "start", fill: row === 2 ? C.copper : C.navy })); if (row < 3) out.push(line(x + 30, 280 + row * 120, x + 235, 280 + row * 120, { arrow: false, width: 2, stroke: C.gray })); });
      });
      return out.join("");
    },
  },
];

async function main() {
  await mkdir(OUTPUT, { recursive: true });
  const manifest = { schemaVersion: 1, generatedAt: new Date().toISOString(), visualSystem: "Evidence Workshop", figures: [] };
  for (const figure of figures) {
    const body = figure.draw();
    const source = svg(body, { title: figure.title, alt: figure.alt });
    await writeFile(path.join(OUTPUT, figure.file), source);
    manifest.figures.push({
      file: `book/images/diagrams/${figure.file}`,
      type: "diagram",
      priority: figure.priority,
      chapter: figure.chapter,
      title: figure.title,
      caption: figure.caption,
      alt: figure.alt,
      source: "Original diagram for Measure Twice, Prompt Once; Evidence Workshop visual system.",
      reviewStatus: "generated-needs-print-review",
    });
    process.stdout.write(`wrote ${figure.file}\n`);
  }
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`wrote ${path.relative(ROOT, MANIFEST)} (${figures.length} figures)\n`);
}

await main();
