# Measure Twice, Prompt Once — Manuscript and Publishing Pipeline

This directory contains the source manuscript and production notes for:

**Measure Twice, Prompt Once: Building Evals for AI Agents That Work in Production**

The format follows the proven conventions of the sibling book at `../../ai-augmented-dev/main-book/`: Markdown source chapters, four part dividers, a 6×9 Typst print layout, a KDP-specific interior, and EPUB output from the same manuscript.

## Source-of-truth rules

1. Edit chapter Markdown in this directory.
2. Keep every external source in [`codex.md`](codex.md), including sources used only in research notes.
3. Cite stable codex IDs such as `[SWE-01]` in the manuscript.
4. Keep factual caveats, permissions notes, and benchmark version history in the codex.
5. Keep reader-facing references concise in `references.md`; do not let it become a second, divergent source database.
6. Follow the documented house style in [`citation-style.md`](citation-style.md); the publishing build turns stable editorial IDs into numbered reader notes.
7. Store future diagrams as source SVG under `images/` and document every proposed visual in `visual-brief.md` before production.

## Planned manuscript order

### Front matter

- `copyright.md`
- `00-preface.md`

### Part I — Discover

- `01-demos-lie.md`
- `02-read-the-failures.md`
- `03-from-failure-to-task.md`
- `04-four-kinds-of-truth.md`

### Part II — Measure

- `05-the-grader-ladder.md`
- `06-executable-truth.md`
- `07-judgment-and-judges.md`
- `08-reading-traces.md`
- `09-statistics-without-the-lab-coat.md`

### Part III — Operate

- `10-the-two-loops.md`
- `11-release-gates.md`
- `12-production-is-the-real-test.md`
- `13-when-evals-fail.md`

### Part IV — Build

- `14-owning-the-loop.md`
- `15-the-first-thirty-days.md`
- `16-epilogue.md`

### Back matter

- `appendix-exercises.md`
- `appendix-templates.md`
- `appendix-case-study-field-guide.md`
- `appendix-statistical-recipes.md`
- `appendix-complete-fictional-loop.md`
- `glossary.md`
- `references.md`
- `about-author.md`
- `codex.md` (complete editorial and source registry; likely online rather than in the print interior)
- `prose-style.md` (house voice and AI-ism editing rules)
- `visual-brief.md` (editorial production document, not part of the reader-facing book)

## Publishing targets

The production scaffold should ultimately emit:

| Output | Target |
|---|---|
| Standard PDF | 6×9, generous reading margins |
| KDP paperback interior | 6×9, white paper, KDP-safe gutter, no digital cover page |
| Kindle / generic EPUB | Reflowable EPUB from the same Markdown |
| Paperback cover wrap | Full-bleed KDP PDF regenerated from the current even page count |

As in the sibling pipeline, the print cover's spine width depends on the final interior page count. The manuscript is not cover-ready merely because the prose is finished.

## Build commands

Prerequisites: Node.js, Pandoc, Typst, and `pdfinfo`.

```bash
node book/scripts/build.mjs
```

Build and validate the EPUB first, without touching the print PDFs:

```bash
node book/scripts/build.mjs --epub-only
```

Run the prose audit before a publication build:

```bash
node book/scripts/audit-prose.mjs
```

The audit catches stock AI vocabulary, suspicious per-file word density, and sentence molds while ignoring code and citation machinery; [`prose-style.md`](prose-style.md) covers the judgment calls a regular expression cannot make.

The build produces:

| Output | Path |
|---|---|
| Standard 6×9 PDF | `output/pdf/measure-twice-prompt-once.pdf` |
| KDP 6×9 interior | `output/pdf/measure-twice-prompt-once-kdp.pdf` |
| KDP paperback cover | `output/pdf/measure-twice-prompt-once-paperback-cover-kdp.pdf` |
| Kindle / generic EPUB | `output/epub/measure-twice-prompt-once.epub` |
| Kindle storefront cover | `output/cover/measure-twice-prompt-once-ebook.jpg` |
| Paperback wrap preview | `output/cover/measure-twice-prompt-once-paperback-wrap-preview.png` |
| Assembled print Markdown | `book/generated/manuscript-print.md` |
| Assembled EPUB Markdown | `book/generated/manuscript-epub.md` |
| Generated Typst sources | `book/generated/measure-twice-prompt-once*.typ` |

The script reports the KDP page count after each build and adds an unnumbered final blank when necessary so the upload has an even page count. Whenever that count changes after cover production begins, regenerate the cover wrap against the current KDP dimensions.

## Editorial target

- Approximately 40,000–45,000 words before references and codex.
- Warm, practical, and slightly playful.
- One strong argument per chapter.
- Published cases recur across chapters rather than appearing once and vanishing.
- One clearly labeled fictional case exposes the complete trace-to-maintenance chain and ships with runnable companion artifacts.
- Every chapter ends with one concise field move linked to the field kit.
- Statistics are explained with concrete numbers and release decisions.
- Jokes should release pressure, not make the reader question whether the author has recently slept.

## Project status

The evidence dossier is at [`../research/eval-loop-book-reference.md`](../research/eval-loop-book-reference.md). The manuscript, codex, exercises, templates, visual brief, and build pipeline are developed from that source.
