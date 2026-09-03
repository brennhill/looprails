#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const bookDir = path.resolve(scriptDir, "..");
const workspace = path.resolve(bookDir, "..");
const generatedDir = path.join(bookDir, "generated");
const pdfOutputDir = path.join(workspace, "output", "pdf");
const epubOutputDir = path.join(workspace, "output", "epub");
const coverOutputDir = path.join(workspace, "output", "cover");

const metadata = {
  title: "Measure Twice, Prompt Once",
  subtitle: "Building Evals for AI Agents That Work in Production",
  author: "Brenn Hill",
  lang: "en-US",
};

const outputSlug = "measure-twice-prompt-once";
const ebookCoverSource = path.join(
  bookDir,
  "images",
  "cover",
  "source",
  "nano-banana-2",
  "cover-calipers-self-check.png",
);

const manifest = [
  { file: "00-preface.md" },
  { file: "key-principles.md" },
  { part: ["I", "Find the Truth"] },
  { file: "part-01-find-the-truth.md" },
  { file: "01-demos-lie.md" },
  { file: "02-read-the-failures.md" },
  { file: "03-from-failure-to-task.md" },
  { file: "04-four-kinds-of-truth.md" },
  { part: ["II", "Build the Measuring Machine"] },
  { file: "part-02-build-the-measuring-machine.md" },
  { file: "05-the-grader-ladder.md" },
  { file: "06-executable-truth.md" },
  { file: "07-judgment-and-judges.md" },
  { file: "08-reading-traces.md" },
  { file: "09-statistics-without-the-lab-coat.md" },
  { part: ["III", "Make It Survive Production"] },
  { file: "part-03-make-it-survive-production.md" },
  { file: "10-the-two-loops.md" },
  { file: "11-release-gates.md" },
  { file: "12-production-is-the-real-test.md" },
  { file: "13-when-evals-fail.md" },
  { part: ["IV", "Make It a Habit"] },
  { file: "part-04-make-it-a-habit.md" },
  { file: "14-owning-the-loop.md" },
  { file: "15-the-first-thirty-days.md" },
  { file: "16-epilogue.md" },
  { part: ["", "The Field Kit"] },
  { file: "appendix-exercises.md" },
  { file: "appendix-templates.md" },
  { file: "appendix-case-study-field-guide.md" },
  { file: "appendix-statistical-recipes.md" },
  { file: "appendix-complete-fictional-loop.md" },
  { file: "glossary.md" },
  { file: "references.md" },
  { file: "about-author.md" },
];

function referenceNumbers(referenceSource) {
  const ids = [...referenceSource.matchAll(/^\*\*\[([A-Z][A-Z0-9]*-\d+)\]\*\*/gm)]
    .map((match) => match[1]);
  return new Map(ids.map((id, index) => [id, index + 1]));
}

function numberCitations(source, numbers) {
  return source.replace(/\[([A-Z][A-Z0-9]*-\d+)\]/g, (match, id) => {
    const number = numbers.get(id);
    if (!number) throw new Error(`Unknown citation ID: ${id}`);
    return `^[${number}](#ref-${id.toLowerCase()})^`;
  });
}

function numberReferenceEntries(source, numbers) {
  return source.replace(
    /^\*\*\[([A-Z][A-Z0-9]*-\d+)\]\*\*/gm,
    (match, id) => `[]{#ref-${id.toLowerCase()}}**${numbers.get(id)}.**`,
  );
}

function run(command, args, cwd = workspace) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with status ${code}`));
    });
  });
}

function capture(command, args, cwd = workspace) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "inherit"] });
    let stdout = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} exited with status ${code}`));
    });
  });
}

async function assemble(mode) {
  const chunks = [];
  const referenceSource = await fs.readFile(path.join(bookDir, "references.md"), "utf8");
  const numbers = referenceNumbers(referenceSource);
  if (mode === "epub") {
    const copyright = await fs.readFile(path.join(bookDir, "copyright.md"), "utf8");
    chunks.push(copyright.trim());
  }
  for (const entry of manifest) {
    if (entry.part) {
      const [roman, title] = entry.part;
      if (mode === "print") {
        chunks.push(`\`\`\`{=typst}\n#part-divider("${roman}", "${title}")\n\`\`\``);
      } else {
        const label = roman ? `Part ${roman} — ${title}` : title;
        chunks.push(`# ${label} {.part}`);
      }
      continue;
    }
    const source = await fs.readFile(path.join(bookDir, entry.file), "utf8");
    const numbered = entry.file === "references.md"
      ? numberReferenceEntries(source, numbers)
      : numberCitations(source, numbers);
    chunks.push(numbered.trim());
  }
  return `${chunks.join("\n\n")}\n`;
}

async function build() {
  const epubOnly = process.argv.includes("--epub-only");
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.mkdir(pdfOutputDir, { recursive: true });
  await fs.mkdir(epubOutputDir, { recursive: true });
  await fs.mkdir(coverOutputDir, { recursive: true });

  const printMarkdown = await assemble("print");
  const epubMarkdown = await assemble("epub");
  const printMdPath = path.join(generatedDir, "manuscript-print.md");
  const epubMdPath = path.join(generatedDir, "manuscript-epub.md");
  await fs.writeFile(printMdPath, printMarkdown);
  await fs.writeFile(epubMdPath, epubMarkdown);

  const from = "markdown+pipe_tables+fenced_code_blocks+raw_attribute+footnotes+superscript+bracketed_spans+smart";

  // KDP's ideal ebook-cover canvas is 1600x2560. The approved illustration is
  // slightly wider, so fill the target and crop from the center rather than
  // distorting it. A four-pixel gray keyline keeps the warm-white cover visible
  // against white storefront and device backgrounds.
  const ebookCover = path.join(coverOutputDir, `${outputSlug}-ebook.jpg`);
  await run("magick", [
    ebookCoverSource,
    "-auto-orient",
    "-resize", "1592x2552^",
    "-gravity", "center",
    "-extent", "1592x2552",
    "-bordercolor", "#6B7280",
    "-border", "4",
    "-colorspace", "sRGB",
    "-strip",
    "-units", "PixelsPerInch",
    "-density", "300",
    "-quality", "95",
    ebookCover,
  ]);

  // Build and validate the reflowable edition before print artifacts. This
  // ordering is intentional: the ebook is the first publishing deliverable.
  const epubPath = path.join(epubOutputDir, `${outputSlug}.epub`);
  await run("pandoc", [
    epubMdPath,
    `--from=${from}`,
    "--to=epub3",
    "--toc",
    "--toc-depth=2",
    "--split-level=1",
    `--css=${path.join(bookDir, "epub.css")}`,
    `--epub-cover-image=${ebookCover}`,
    `--resource-path=${bookDir}${path.delimiter}${workspace}`,
    `--metadata=title:${metadata.title}`,
    `--metadata=subtitle:${metadata.subtitle}`,
    `--metadata=author:${metadata.author}`,
    `--metadata=lang:${metadata.lang}`,
    "--metadata=date:2026",
    "--metadata=rights:Copyright © 2026 Brenn Hill. All rights reserved.",
    "--metadata=description:A practical field guide to building evaluation loops for AI agents that work in production.",
    `--output=${epubPath}`,
  ]);
  await run("unzip", ["-t", epubPath]);

  if (epubOnly) {
    process.stdout.write(`\nBuilt EPUB first: ${epubPath}\n`);
    return;
  }

  const template = path.join(bookDir, "typst", "pandoc-template.typ");
  const standardTyp = path.join(generatedDir, `${outputSlug}.typ`);
  const kdpTyp = path.join(generatedDir, `${outputSlug}-kdp.typ`);

  const commonPandoc = [
    printMdPath,
    `--from=${from}`,
    "--to=typst",
    `--template=${template}`,
    "--toc",
    "--toc-depth=1",
    `--metadata=title:${metadata.title}`,
    `--metadata=subtitle:${metadata.subtitle}`,
    `--metadata=author:${metadata.author}`,
    `--metadata=lang:${metadata.lang}`,
  ];

  await run("pandoc", [...commonPandoc, `--output=${standardTyp}`]);
  await run("pandoc", [...commonPandoc, "--metadata=kdp:true", `--output=${kdpTyp}`]);

  const standardPdf = path.join(pdfOutputDir, `${outputSlug}.pdf`);
  const kdpPdf = path.join(pdfOutputDir, `${outputSlug}-kdp.pdf`);
  await run("typst", ["compile", "--root", workspace, standardTyp, standardPdf]);
  await run("typst", ["compile", "--root", workspace, kdpTyp, kdpPdf]);

  let pdfInfo = await capture("pdfinfo", [kdpPdf]);
  let pageCount = Number(pdfInfo.match(/^Pages:\s+(\d+)$/m)?.[1]);
  if (Number.isFinite(pageCount) && pageCount % 2 !== 0) {
    await run("pandoc", [
      ...commonPandoc,
      "--metadata=kdp:true",
      "--metadata=finalblank:true",
      `--output=${kdpTyp}`,
    ]);
    await run("typst", ["compile", "--root", workspace, kdpTyp, kdpPdf]);
    pdfInfo = await capture("pdfinfo", [kdpPdf]);
    pageCount = Number(pdfInfo.match(/^Pages:\s+(\d+)$/m)?.[1]);
  }
  const pageLine = pdfInfo.split("\n").find((line) => line.startsWith("Pages:"));
  const sizeLine = pdfInfo.split("\n").find((line) => line.startsWith("Page size:"));
  await run("node", [path.join(scriptDir, "build-kdp-cover.mjs")]);
  process.stdout.write(`\nBuilt ${metadata.title}.\n${pageLine ?? "Page count unavailable"}\n${sizeLine ?? "Page size unavailable"}\n`);
  process.stdout.write("The KDP cover wrap was regenerated from this page count.\n");
}

build().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
