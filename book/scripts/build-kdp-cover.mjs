#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const bookDir = path.resolve(scriptDir, "..");
const workspace = path.resolve(bookDir, "..");

const slug = "measure-twice-prompt-once";
const interiorPdf = path.join(workspace, "output", "pdf", `${slug}-kdp.pdf`);
const coverDir = path.join(workspace, "output", "cover");
const coverPdf = path.join(workspace, "output", "pdf", `${slug}-paperback-cover-kdp.pdf`);
const coverSvg = path.join(coverDir, `${slug}-paperback-wrap.svg`);
const coverPreview = path.join(coverDir, `${slug}-paperback-wrap-preview.png`);
const frontSource = path.join(
  bookDir,
  "images",
  "cover",
  "source",
  "nano-banana-2",
  "cover-calipers-self-check.png",
);
const preparedFront = path.join(coverDir, `${slug}-paperback-front.png`);

const DPI = 300;
const TRIM_WIDTH_IN = 6;
const TRIM_HEIGHT_IN = 9;
const BLEED_IN = 0.125;
const WHITE_PAPER_SPINE_IN_PER_PAGE = 0.002252;

const colors = {
  navy: "#17324D",
  copper: "#A85F32",
  gold: "#C6922A",
  body: "#252A30",
  muted: "#6B7280",
  paper: "#FCFAF6",
  paleGold: "#F8F0D8",
  white: "#FFFFFF",
};

const f = (value, digits = 4) => Number(value.toFixed(digits));

async function pageCount() {
  const { stdout } = await execFileAsync("pdfinfo", [interiorPdf]);
  const match = stdout.match(/^Pages:\s+(\d+)$/m);
  if (!match) throw new Error(`Could not read page count from ${interiorPdf}`);
  return Number(match[1]);
}

async function prepareFront(widthPx, heightPx) {
  await execFileAsync("magick", [
    frontSource,
    "-auto-orient",
    "-resize", `${widthPx}x${heightPx}^`,
    "-gravity", "center",
    "-extent", `${widthPx}x${heightPx}`,
    "-colorspace", "sRGB",
    "-strip",
    "-units", "PixelsPerInch",
    "-density", String(DPI),
    preparedFront,
  ]);
}

function buildSvg({ pages, spineIn, spinePx, totalWidthPx, heightPx, frontX, frontWidthPx, frontData }) {
  const backTrimLeft = BLEED_IN * DPI;
  const backTrimRight = backTrimLeft + TRIM_WIDTH_IN * DPI;
  const spineCenter = backTrimRight + spinePx / 2;
  const trimTop = BLEED_IN * DPI;
  const trimBottom = trimTop + TRIM_HEIGHT_IN * DPI;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${f(totalWidthPx / DPI, 6)}in" height="${f(heightPx / DPI, 6)}in"
     viewBox="0 0 ${f(totalWidthPx)} ${heightPx}">
  <title>Measure Twice, Prompt Once paperback cover</title>
  <desc>Full-bleed KDP paperback wrap for a ${pages}-page, 6 by 9 inch, black-and-white interior on white paper. Spine width ${f(spineIn, 6)} inches.</desc>

  <rect width="${f(totalWidthPx)}" height="${heightPx}" fill="${colors.paper}"/>

  <!-- BACK COVER -->
  <g font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">
    <text x="150" y="225" font-size="58" font-weight="800" fill="${colors.navy}" letter-spacing="1.5">YOUR AI DEMO WORKS.</text>
    <text x="150" y="300" font-size="43" font-weight="700" fill="${colors.copper}" letter-spacing="0.7">PRODUCTION HAS FOLLOW-UP QUESTIONS.</text>
    <rect x="150" y="350" width="230" height="10" rx="5" fill="${colors.gold}"/>

    <g font-size="38" font-weight="400" fill="${colors.body}">
      <text x="150" y="445">The agent gives a convincing answer. But did the database change?</text>
      <text x="150" y="499">Did the citation support the claim? Did the patch solve the</text>
      <text x="150" y="553">problem, or merely charm the test?</text>

      <text x="150" y="665"><tspan font-weight="700" fill="${colors.navy}">Measure Twice, Prompt Once</tspan> shows product and engineering</text>
      <text x="150" y="719">teams how to turn those awkward questions into a working</text>
      <text x="150" y="773">evaluation loop.</text>
    </g>

    <text x="150" y="885" font-size="32" font-weight="800" letter-spacing="4" fill="${colors.copper}">INSIDE</text>

    <g font-size="37" font-weight="500" fill="${colors.body}">
      <path d="M 171 940 l 15 15 l -15 15 l -15 -15 z" fill="${colors.gold}"/>
      <text x="215" y="968">Read real failures without drowning in traces</text>

      <path d="M 171 1055 l 15 15 l -15 15 l -15 -15 z" fill="${colors.gold}"/>
      <text x="215" y="1083">Build tasks and graders around evidence that matters</text>

      <path d="M 171 1170 l 15 15 l -15 15 l -15 -15 z" fill="${colors.gold}"/>
      <text x="215" y="1198">Compare changes without statistical theater</text>

      <path d="M 171 1285 l 15 15 l -15 15 l -15 -15 z" fill="${colors.gold}"/>
      <text x="215" y="1313">Connect CI, release gates, and production feedback</text>

      <path d="M 171 1400 l 15 15 l -15 15 l -15 -15 z" fill="${colors.gold}"/>
      <text x="215" y="1428">Give the loop an owner, a cadence, and a budget</text>
    </g>

    <rect x="150" y="1515" width="1515" height="250" rx="24" fill="${colors.paleGold}" stroke="${colors.gold}" stroke-width="4"/>
    <g font-size="35" font-weight="600" fill="${colors.navy}">
      <text x="205" y="1588">Four published programs. One complete fictional loop. Plus</text>
      <text x="205" y="1642">statistical recipes, thirteen exercises, sixteen templates, and a</text>
      <text x="205" y="1696">30-day minimum viable eval-loop plan.</text>
    </g>

    <text x="150" y="1885" font-size="30" font-weight="800" letter-spacing="4" fill="${colors.copper}">ABOUT THE AUTHOR</text>
    <g font-size="32" font-weight="400" fill="${colors.body}">
      <text x="150" y="1950"><tspan font-weight="700" fill="${colors.navy}">Brenn Hill</tspan> is a software engineer, engineering leader,</text>
      <text x="150" y="1998">and published author. He teaches AI-augmented development</text>
      <text x="150" y="2046">practices and builds tools for verification, agent loops,</text>
      <text x="150" y="2094">and human oversight.</text>
    </g>

    <text x="150" y="2590" font-size="31" font-weight="700" fill="${colors.navy}" letter-spacing="1">looprails.com</text>
  </g>

  <!-- Amazon places its 2 x 1.2 inch barcode in the unoccupied lower-right back-cover area. -->

  <!-- SPINE -->
  <rect x="${f(backTrimRight)}" y="0" width="${f(spinePx)}" height="${heightPx}" fill="${colors.navy}"/>
  <rect x="${f(backTrimRight)}" y="${trimTop}" width="${f(spinePx)}" height="8" fill="${colors.gold}"/>
  <rect x="${f(backTrimRight)}" y="${f(trimBottom - 8)}" width="${f(spinePx)}" height="8" fill="${colors.copper}"/>
  <g font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" fill="${colors.white}">
    <g transform="translate(${f(spineCenter)} 1240) rotate(90)">
      <text x="0" y="0" text-anchor="middle" font-size="38" font-weight="800" letter-spacing="2.5">MEASURE TWICE, PROMPT ONCE</text>
    </g>
    <path d="M ${f(spineCenter)} 1900 l 13 13 l -13 13 l -13 -13 z" fill="${colors.gold}"/>
    <g transform="translate(${f(spineCenter)} 2300) rotate(90)">
      <text x="0" y="0" text-anchor="middle" font-size="31" font-weight="700" letter-spacing="2">BRENN HILL</text>
    </g>
  </g>

  <!-- FRONT COVER: approved Self-Check concept, cropped to the exact full-bleed panel. -->
  <image x="${f(frontX)}" y="0" width="${f(frontWidthPx)}" height="${heightPx}"
         preserveAspectRatio="none" xlink:href="data:image/png;base64,${frontData}"/>
</svg>
`;
}

async function main() {
  await fs.mkdir(coverDir, { recursive: true });
  await fs.mkdir(path.dirname(coverPdf), { recursive: true });

  const pages = await pageCount();
  const spineIn = pages * WHITE_PAPER_SPINE_IN_PER_PAGE;
  const spinePx = spineIn * DPI;
  const heightIn = TRIM_HEIGHT_IN + 2 * BLEED_IN;
  const heightPx = heightIn * DPI;
  const totalWidthIn = 2 * TRIM_WIDTH_IN + spineIn + 2 * BLEED_IN;
  const totalWidthPx = totalWidthIn * DPI;
  const backTrimRight = (BLEED_IN + TRIM_WIDTH_IN) * DPI;
  const frontX = backTrimRight + spinePx;
  const frontWidthPx = totalWidthPx - frontX;

  const frontRasterWidth = Math.ceil(frontWidthPx);
  await prepareFront(frontRasterWidth, heightPx);
  const frontData = (await fs.readFile(preparedFront)).toString("base64");
  const svg = buildSvg({
    pages,
    spineIn,
    spinePx,
    totalWidthPx,
    heightPx,
    frontX,
    frontWidthPx,
    frontData,
  });
  await fs.writeFile(coverSvg, svg, "utf8");

  await execFileAsync("rsvg-convert", [
    `--width=${f(totalWidthIn, 6)}in`,
    `--height=${f(heightIn, 6)}in`,
    "--format=pdf",
    "--output", coverPdf,
    coverSvg,
  ]);
  await execFileAsync("rsvg-convert", [
    "--width=1907",
    "--height=1388",
    "--format=png",
    "--output", coverPreview,
    coverSvg,
  ]);

  const { stdout: info } = await execFileAsync("pdfinfo", [coverPdf]);
  const pageSize = info.match(/^Page size:\s+(.+)$/m)?.[1] ?? "unknown";
  process.stdout.write(
    [
      `Built KDP paperback cover for ${pages} pages.`,
      `Spine: ${f(spineIn, 6)} in`,
      `Full wrap: ${f(totalWidthIn, 6)} x ${f(heightIn, 6)} in`,
      `PDF page size: ${pageSize}`,
      `Cover PDF: ${coverPdf}`,
      `Preview: ${coverPreview}`,
    ].join("\n") + "\n",
  );
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
