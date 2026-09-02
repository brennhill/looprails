#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const proofDirectory = path.join(root, "book/images/proofs");
const output = path.join(proofDirectory, "review-gallery.html");
const fal = JSON.parse(await readFile(path.join(root, "book/images/fal-manifest-nano-banana-2.json"), "utf8"));
const figures = JSON.parse(await readFile(path.join(root, "book/images/figure-manifest.json"), "utf8"));
const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const rel = (target) => path.relative(proofDirectory, path.join(root, target)).split(path.sep).join("/");

const covers = fal.assets.filter((asset) => asset.kind === "cover");
const cartoons = fal.assets.filter((asset) => asset.kind === "cartoon");
const totalCost = fal.assets.reduce((sum, asset) => sum + Number(asset.estimatedCostUsd || 0), 0);

function cards(items, className, imagePath) {
  return items.map((item) => `<article class="card ${className}">
    <a href="${esc(imagePath(item))}"><img src="${esc(imagePath(item))}" alt="${esc(item.title || item.alt)}" loading="lazy"></a>
    <div class="copy">
      <h3>${esc(item.title)}</h3>
      ${item.caption ? `<p>${esc(item.caption)}</p>` : ""}
      <dl>
        ${item.chapter ? `<div><dt>Placement</dt><dd>${esc(item.chapter)}</dd></div>` : ""}
        ${item.priority ? `<div><dt>Priority</dt><dd>${esc(item.priority)}</dd></div>` : ""}
        ${item.requestId ? `<div><dt>fal request</dt><dd><code>${esc(item.requestId)}</code></dd></div>` : ""}
        ${item.resolution ? `<div><dt>Resolution</dt><dd>${esc(item.resolution)} · ${esc(item.width)}×${esc(item.height)}</dd></div>` : ""}
        ${item.estimatedCostUsd ? `<div><dt>Estimated cost</dt><dd>$${Number(item.estimatedCostUsd).toFixed(4)}</dd></div>` : ""}
        ${item.reviewStatus ? `<div><dt>Review</dt><dd>${esc(item.reviewStatus)}</dd></div>` : ""}
      </dl>
      <code class="filename">${esc(item.output || item.file)}</code>
    </div>
  </article>`).join("\n");
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Measure Twice, Prompt Once — Evidence Workshop Review</title>
  <style>
    :root { --navy:#17324D; --copper:#A85F32; --gold:#C6922A; --paper:#FCFAF6; --gray:#6B7280; --mat:#E7E1D8; }
    * { box-sizing:border-box; }
    body { margin:0; background:var(--mat); color:var(--navy); font-family:"Avenir Next",Avenir,Helvetica,Arial,sans-serif; }
    header { padding:4rem clamp(1.2rem,5vw,5rem) 3rem; background:var(--paper); border-bottom:6px solid var(--gold); }
    header p { max-width:72ch; color:#475569; line-height:1.55; }
    h1,h2 { font-family:"Iowan Old Style",Georgia,serif; }
    h1 { margin:0; font-size:clamp(2.5rem,6vw,5.8rem); line-height:.95; }
    .eyebrow { color:var(--copper); text-transform:uppercase; letter-spacing:.14em; font-weight:800; }
    nav { position:sticky; top:0; z-index:3; display:flex; gap:1rem; padding:.8rem clamp(1.2rem,5vw,5rem); background:rgba(23,50,77,.95); }
    nav a { color:white; text-decoration:none; font-weight:700; }
    main { padding:2rem clamp(1rem,4vw,4rem) 6rem; }
    section { scroll-margin-top:4rem; margin:0 auto 4rem; max-width:1600px; }
    h2 { font-size:2.6rem; margin:0 0 .25rem; }
    .section-note { color:var(--gray); margin:0 0 1.5rem; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:1.25rem; align-items:start; }
    .covers { grid-template-columns:repeat(auto-fit,minmax(330px,1fr)); }
    .card { overflow:hidden; border:1px solid #c9c1b7; border-radius:14px; background:var(--paper); box-shadow:0 9px 25px rgba(23,50,77,.08); }
    .card img { display:block; width:100%; height:auto; background:var(--paper); }
    .cover img { aspect-ratio:2/3; object-fit:contain; }
    .cartoon img { aspect-ratio:3/2; object-fit:contain; }
    .diagram img { aspect-ratio:30/19; object-fit:contain; }
    .copy { padding:1rem 1.1rem 1.2rem; border-top:1px solid #ddd5ca; }
    h3 { margin:0 0 .35rem; font-size:1.12rem; }
    .copy p { min-height:2.5em; margin:.25rem 0 .8rem; color:#4b5563; line-height:1.35; }
    dl { margin:.6rem 0; font-size:.78rem; }
    dl div { display:flex; gap:.5rem; }
    dt { color:var(--gray); min-width:6rem; }
    dd { margin:0; overflow-wrap:anywhere; }
    code { font-family:Menlo,monospace; font-size:.72rem; }
    .filename { display:block; color:var(--copper); overflow-wrap:anywhere; }
    .warning { padding:.9rem 1rem; border-left:5px solid var(--copper); background:#f5e9e1; max-width:72ch; }
  </style>
</head>
<body>
  <header>
    <div class="eyebrow">Evidence Workshop · Nano Banana 2 replacement pass</div>
    <h1>Measure Twice, Prompt Once</h1>
    <p>Three cover directions, fourteen editorial cartoons, and twenty-one editable technical figures. The generated art uses <code>${esc(fal.endpoint)}</code>; retained estimated cost is $${totalCost.toFixed(4)}.</p>
    <p class="warning"><strong>Cover review:</strong> All three covers now carry the new title with correct copy. The Evidence Workbench is the strongest candidate. The Loop Press and Instrument Cabinet are retained as alternates, but their central mechanisms drift toward the sideways-eight motif the brief asked us to avoid. Technical figures below were not regenerated.</p>
  </header>
  <nav><a href="#covers">Covers</a><a href="#cartoons">Cartoons</a><a href="#diagrams">Diagrams</a></nav>
  <main>
    <section id="covers"><h2>Cover directions</h2><p class="section-note">Click any image to inspect it at full resolution.</p><div class="grid covers">${cards(covers, "cover", (item) => rel(item.output))}</div></section>
    <section id="cartoons"><h2>Editorial cartoons</h2><p class="section-note">Each generated caption was checked against the exact caption stored in the manifest.</p><div class="grid">${cards(cartoons, "cartoon", (item) => rel(item.output))}</div></section>
    <section id="diagrams"><h2>Technical figures</h2><p class="section-note">Existing SVG set: directly labeled, grayscale-aware, editable, and unchanged in this replacement pass.</p><div class="grid">${cards(figures.figures, "diagram", (item) => rel(item.file))}</div></section>
  </main>
</body>
</html>\n`;

await writeFile(output, html);
process.stdout.write(`${path.relative(root, output)}\n`);
