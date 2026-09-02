# Visual assets

This directory contains the **Evidence Workshop** visual system for *Measure Twice, Prompt Once*.

```text
cover/source/nano-banana-2/ raw Nano Banana 2 cover art
cover/              composed cover proofs with live typography sources
cartoons/source/nano-banana-2/ raw Nano Banana 2 editorial illustrations
cartoons/           print-treated cartoon assets
diagrams/           deterministic SVG technical figures
proofs/             review galleries and contact sheets
rejected/           superseded generated variants retained for provenance
fal-manifest-nano-banana-2.json prompts, seeds, request IDs, hashes, cost estimates, and review state
fal-manifest.json   archived FLUX.2 Klein pass retained for provenance
figure-manifest.json captions, alt text, placement, and diagram metadata
```

Raw generated images are never assumed publication-ready. Final title, labels, dialogue, and captions are applied with the book's typography. Technical claims are drawn as SVG rather than delegated to an image model.

Generate fal.ai assets:

```sh
node book/scripts/generate-fal-art.mjs --dry-run
node book/scripts/generate-fal-art.mjs --id cover-evidence-workbench --id ch04-01-database-vote
node book/scripts/generate-fal-art.mjs
```

The script requires `FAL_KEY`. It uses `fal-ai/nano-banana-2` at 2K with exact caption text and records retained output provenance in `fal-manifest-nano-banana-2.json`. The 17 retained images cost an estimated $2.04; rejected and superseded attempts bring estimated generation spend to $2.64. The cartoons remain current. All three covers now carry the new title with correct copy; the Evidence Workbench is the strongest candidate. The rejected FLUX.2 Klein pass and the superseded Nano Banana attempts remain archived where a retained file exists.

Run `node book/scripts/build-art-gallery.mjs` to refresh `proofs/review-gallery.html`. The Nano Banana contact sheets live at `proofs/nano-banana-2-cover-contact-sheet.jpg` and `proofs/nano-banana-2-cartoon-contact-sheet.jpg`.
