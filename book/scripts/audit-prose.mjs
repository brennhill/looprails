#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const bookDirectory = path.resolve(import.meta.dirname, "..");
const sourcePattern = /^(?:00-|[0-9]{2}-|part-|appendix-|glossary|about-author|amazon-listing).*\.md$/;

const checks = [
  {
    id: "stock-vocabulary",
    pattern: /\b(?:delv(?:e|es|ed|ing)|tapestr(?:y|ies)|testament|multifaceted|pivotal|seamless(?:ly)?|ever[- ]evolving|game[- ]changer|realm|paradigm|synergy|myriad|paramount|boast(?:s|ed|ing)?|underscor(?:e|es|ed|ing)|intricate(?:ly)?|intricacies|showcas(?:e|es|ed|ing)|surpass(?:es|ed|ing)?|garner(?:s|ed|ing)?|groundbreaking|advancements?|comprehend(?:s|ed|ing)?|emphasiz(?:e|es|ed|ing)|aligns|meticulous(?:ly)?|palpable|camaraderie|vibrant|unwavering|transformative|grappl(?:e|es|ed|ing)|fleeting|ignit(?:e|es|ed|ing)|unspoken|amidst|cacophony|unravel(?:s|ed|ing)?|solace|commendable|noteworthy|unveil(?:s|ed|ing)?|prowess)\b/gi,
  },
  {
    id: "business-fog",
    pattern: /\b(?:leverag(?:e|es|ed|ing)|utiliz(?:e|es|ed|ing)|unlock(?:s|ed|ing)?|elevat(?:e|es|ed|ing)|streamlin(?:e|es|ed|ing)|foster(?:s|ed|ing)?|navigat(?:e|es|ed|ing)|empower(?:s|ed|ing)?|facilitat(?:e|es|ed|ing)|bolster(?:s|ed|ing)?)\b/gi,
  },
  {
    id: "inflated-importance",
    pattern: /\b(?:crucial|robust|comprehensive|holistic|fundamentally|importantly|interestingly|notably|ultimately|essentially|invaluable)\b/gi,
  },
  {
    id: "empty-transition",
    pattern: /\b(?:it(?:'|’)s important to note|it is important to note|it is worth noting|at its core|in today(?:'|’)s|when it comes to|in conclusion|to sum up|in summary)\b/gi,
  },
  {
    id: "teacher-preamble",
    pattern: /\b(?:let(?:'|’)s (?:delve|explore|unpack|break this down)|this chapter (?:will|explores|examines)|in this chapter)\b/gi,
  },
  {
    id: "false-suspense",
    pattern: /\b(?:here(?:'|’)s the thing|here is the thing|here(?:'|’)s where it gets interesting|what people miss)\b/gi,
  },
  {
    id: "canned-contrast",
    pattern: /\b(?:(?:this|that|it) is not|isn(?:'|’)t just|is not just|doesn(?:'|’)t just|does not just|not merely|not simply|the (?:goal|point|question|job|purpose|result) is not)\b/gi,
  },
  {
    id: "inflated-copula",
    pattern: /\b(?:serves as|stands as|represents a|marks a|plays an? [a-z-]+ role)\b/gi,
  },
  {
    id: "magic-adverb",
    pattern: /\b(?:quietly|deeply|remarkably|arguably|undeniably)\b/gi,
  },
];

// These are ordinary words, including several legitimate technical terms. They
// become editorial smells through repetition, so audit density rather than
// presence. Limits are per file to catch a chapter leaning on one vague word.
const densityChecks = [
  { word: "important", pattern: /\bimportant\b/gi, minimum: 4, maximumPerThousand: 3 },
  { word: "useful", pattern: /\buseful\b/gi, minimum: 5, maximumPerThousand: 3 },
  { word: "meaningful", pattern: /\bmeaningful\b/gi, minimum: 4, maximumPerThousand: 2.5 },
  { word: "valuable", pattern: /\bvaluable\b/gi, minimum: 3, maximumPerThousand: 2 },
  { word: "significant", pattern: /\bsignificant(?:ly)?\b/gi, minimum: 3, maximumPerThousand: 2 },
  { word: "key", pattern: /\bkey\b/gi, minimum: 8, maximumPerThousand: 4 },
  { word: "insight", pattern: /\binsights?\b/gi, minimum: 3, maximumPerThousand: 2 },
  { word: "highlight", pattern: /\bhighlight(?:s|ed|ing)?\b/gi, minimum: 3, maximumPerThousand: 2 },
  { word: "align", pattern: /\balign(?:s|ed|ing)?\b/gi, minimum: 3, maximumPerThousand: 2 },
  { word: "enhance", pattern: /\benhanc(?:e|es|ed|ing)\b/gi, minimum: 3, maximumPerThousand: 2 },
  { word: "additional", pattern: /\badditional(?:ly)?\b/gi, minimum: 3, maximumPerThousand: 2 },
  { word: "particularly", pattern: /\bparticularly\b/gi, minimum: 3, maximumPerThousand: 2 },
  { word: "effectively", pattern: /\beffectively\b/gi, minimum: 3, maximumPerThousand: 2 },
  { word: "nuance", pattern: /\bnuanc(?:e|es|ed)\b/gi, minimum: 3, maximumPerThousand: 2 },
];

function wordCount(value) {
  return (value.match(/\b[\p{L}\p{N}][\p{L}\p{N}’'-]*\b/gu) || []).length;
}

function proseFromMarkdown(line) {
  return line
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\[[A-Z][A-Z0-9]*-\d+\]/g, " ")
    .replace(/<https?:\/\/[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/^\s*(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+[.)]\s+)/, "")
    .replace(/[*_~]/g, " ")
    .trim();
}

const files = (await readdir(bookDirectory)).filter((name) => sourcePattern.test(name)).sort();
const findings = [];
const longSentences = [];
let totalWords = 0;
let totalEmDashes = 0;

for (const file of files) {
  const source = await readFile(path.join(bookDirectory, file), "utf8");
  totalWords += wordCount(source);
  totalEmDashes += (source.match(/—/g) || []).length;
  let inFence = false;
  const lines = source.split("\n");
  const proseLines = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence || /^\s*\|/.test(line) || /^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line) || !line.trim()) continue;

    const prose = proseFromMarkdown(line);
    if (!prose) continue;
    proseLines.push({ line: index + 1, value: prose });

    for (const check of checks) {
      check.pattern.lastIndex = 0;
      const matches = [...prose.matchAll(check.pattern)];
      for (const match of matches) {
        findings.push({
          check: check.id,
          file,
          line: index + 1,
          match: match[0],
          excerpt: prose,
        });
      }
    }

    for (const sentence of prose.split(/(?<=[.!?])\s+(?=[A-Z“`])/)) {
      const words = wordCount(sentence);
      if (words >= 45) longSentences.push({ file, line: index + 1, words, sentence: sentence.trim() });
    }
  }

  const prose = proseLines.map((entry) => entry.value).join("\n");
  const proseWords = wordCount(prose);
  for (const check of densityChecks) {
    check.pattern.lastIndex = 0;
    const count = [...prose.matchAll(check.pattern)].length;
    const perThousand = proseWords === 0 ? 0 : (count / proseWords) * 1000;
    if (count < check.minimum || perThousand <= check.maximumPerThousand) continue;

    const first = proseLines.find((entry) => {
      check.pattern.lastIndex = 0;
      return check.pattern.test(entry.value);
    });
    findings.push({
      check: "soft-vocabulary-density",
      file,
      line: first?.line,
      match: check.word,
      count,
      proseWords,
      perThousand: Number(perThousand.toFixed(2)),
      maximumPerThousand: check.maximumPerThousand,
      excerpt: first?.value,
    });
  }
}

const checkIds = [...checks.map((check) => check.id), "soft-vocabulary-density"];
const byCheck = Object.fromEntries(checkIds.map((id) => [id, findings.filter((item) => item.check === id).length]));
console.log(JSON.stringify({
  sourceFiles: files.length,
  words: totalWords,
  emDashes: totalEmDashes,
  checks: byCheck,
  findings,
  longSentences: longSentences.sort((left, right) => right.words - left.words),
}, null, 2));
