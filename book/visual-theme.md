# Measure Twice, Prompt Once Visual System

## Evidence Workshop

**Status:** First-edition visual direction  
**Use:** Cover, technical figures, editorial cartoons, chapter openers, and companion material  
**Core idea:** AI evaluation is a practical workshop for turning uncertain behavior into inspectable evidence.

The visual world should feel like a current digital editorial magazine crossed with a product-design field guide: crisp, confident, and lightly mischievous. Nothing should look like generic “AI art,” retro technical advertising, or a nostalgic engineering manual. The recurring objects are instruments of inspection—loops, evidence cards, stamps, clipboards, test fixtures, trace ribbons, database drawers, and clocks.

## 1. Visual promise

Every image should do at least one of three jobs:

1. reveal a relationship faster than prose;
2. make a failure mode memorable;
3. help the reader locate an idea later.

Technical figures are built as deterministic vectors. Generated art is reserved for the cover and cartoons, where texture, character, and surprise are useful. Model-generated text is never treated as final typography.

## 2. Palette

| Role | Color | Hex |
|---|---|---|
| Structure, systems, primary ink | Workshop navy | `#17324D` |
| Active paths, mistakes, decisions | Oxide copper | `#A85F32` |
| Evidence, checkpoints, small delight | Inspector gold | `#C6922A` |
| Paper and open space | Warm paper | `#FCFAF6` |
| Context and secondary notation | Instrument gray | `#6B7280` |
| Deep line art | Carbon | `#252A30` |

Color is never the only carrier of meaning. Copper paths are also heavier or dashed; gold evidence is also marked with a diamond or stamp; inactive material is lighter and thinner.

## 3. Typography

- **Display and chapter voice:** Iowan Old Style, with Georgia as the portable fallback.
- **Navigation and figure labels:** Avenir Next, with Helvetica/Arial as fallbacks.
- **Code, traces, and machine evidence:** Menlo, with ui-monospace/monospace as fallbacks.
- **Cover title:** large, restrained, high-contrast serif; no faux-futurist letterforms.

Generated images contain no final title, caption, diagram label, or dialogue. Those are applied as real type in the publishing pipeline.

## 4. Shape language

- Rounded evidence cards with one clipped corner.
- Clockwise loop arrows with deliberate gaps at human decision points.
- Gold evidence diamonds and approval stamps.
- Copper error paths that visibly re-enter the loop.
- Database drawers as squat, unimpressed filing cabinets.
- Trace events as paper tickets on a continuous ribbon.
- Small clock badges for cadence.

Corners are modestly rounded, not bubbly. Lines have the slight irregularity of screen-printed editorial illustration but the geometry of technical drafting.

## 5. Recurring cast

The cartoons use four recurring characters:

- **The agent:** a compact, earnest soft-square robot with a slate-navy shell, warm-white face screen, two dot eyes, copper side panels, and one gold status pill. Curious rather than foolish.
- **The engineer:** a contemporary product engineer in simple modern clothing, notebook or laptop, expressive eyebrow, never depicted as omniscient.
- **The database:** a clean stack of server/database cylinders with a minimal face and the patience of something that has seen the actual transaction log.
- **The judge:** a clean geometric character with a clipboard and a narrow inspection light representing bounded attention.

Characters are not gendered by default. Users are never the butt of the joke. Safety, medical, privacy, and incident examples remain diagrammatic rather than comic.

## 6. Illustration treatment

The target is modern 2020s editorial cartooning for a thoughtful technology publication:

- crisp vector-like shapes with smooth, confident outlines;
- bright warm-white ground and generous negative space;
- navy and cobalt structure, copper/coral active moments, small gold evidence accents, and restrained teal support;
- subtle soft shadows and very light digital grain; no faux paper aging;
- expressive minimal faces, modern clothing, and clean geometric props;
- one visual joke per image;
- no photorealism, glossy 3D, neon circuitry, holograms, or stock “AI brain” imagery;
- no sepia, dry brush, cross-hatching, woodcut texture, mid-century advertising, 1970s instructional art, or retro-futurism;
- no watermarks, signatures, brands, or text beyond the exact requested title or caption.

Important silhouettes and caption text must survive grayscale reproduction at 4.6 inches wide.

## 7. Cover concept

### Selected: The Cherry-Picked Demo

An earnest robot proudly presents one flawless cherry beneath a grand little spotlight. Behind it, a practical engineer points toward the actual work: a mixed queue of task boxes, documents, tools, and one unruly rubber duck passing through two measurement gates and returning around the loop.

The visual joke is that one polished success is a demo, while the varied queue is the product. The cover must read at thumbnail size in this order: title, cherry joke, measurement loop. The robot is pleased rather than foolish; the joke is about demo culture, not the person running the demo.

### Alternatives

- **The Megaphone and the Calipers:** a giant prompting megaphone loses an argument to a modest set of measuring tools.
- **The One-Question Exam:** one pristine answer meets the long queue of cases still waiting behind a curtain.

The Nano Banana exploration generated all three with exact title, subtitle, and author copy as a text-rendering test. The selected front is retained as a single composed illustration; spine and back-cover typography are deterministic SVG text for trim control.

## 8. Technical figures

Technical figures use the same palette and shapes but no generative imagery. They are SVG-first, with live labels, direct annotation, and a minimum effective print size of 8.5 points. Each figure must pass:

- five-second takeaway test;
- grayscale test;
- 4.6-inch print-width test;
- text extraction/accessibility test;
- vocabulary match against the chapter.

## 9. Cartoon layout

- Landscape frame, normally `3:2`, composed for 4.6-inch book width.
- One panel unless the joke requires sequence.
- Caption is generated verbatim in a clean lower strip for model review and retained separately in the figure manifest.
- Dialogue is avoided unless the joke depends on it.
- No unrequested lettering is allowed.

## 10. Production and provenance

The replacement model is `fal-ai/nano-banana-2` at 2K resolution, following the proven concept route in Aether. The first full replacement pass is budgeted at approximately `$0.12` per image. Each retained asset records:

- final prompt;
- endpoint alias;
- requested seed;
- fal request ID;
- returned dimensions and content type;
- estimated cost;
- creation date;
- human review status.

The endpoint is an alias rather than an immutable model revision, so exact future reproduction is not claimed. Rejected FLUX generations remain archived for provenance. New raw generations live under `book/images/**/source/nano-banana-2/`; print-treated or composed assets live one level above them.

## 11. Acceptance bar

An asset is ready for insertion only when it:

1. carries one clear idea;
2. matches the recurring cast and palette;
3. contains no malformed or accidental text;
4. has no visual ambiguity that changes the technical claim;
5. remains legible at final print size;
6. has alt text, caption, provenance, and a named owner for revision.
