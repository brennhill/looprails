#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "../..");
const IMAGE_ROOT = path.join(ROOT, "book/images");
const MANIFEST_PATH = path.join(IMAGE_ROOT, "fal-manifest-nano-banana-2.json");
const ENDPOINT = "fal-ai/nano-banana-2";
const QUEUE_ROOT = "https://queue.fal.run";
const RESOLUTION = "2K";
const COST_USD_PER_IMAGE = 0.12;

const STYLE = [
  "Modern 2020s editorial cartoon for a thoughtful technology magazine, crisp and current.",
  "Clean vector-like shapes, smooth confident outlines, bright warm-white background, generous negative space, subtle soft shadows, and only a trace of fine digital grain.",
  "Palette: deep navy and cobalt structure, copper-coral active moments, small gold evidence accents, restrained teal support, warm white background.",
  "Expressive minimal faces and contemporary clothing. Clever and humane, not childish and not corporate clip art.",
  "Recurring cast when requested: compact earnest soft-square robot with slate-navy shell, warm-white face screen, two dot eyes, copper side panels, and one small gold status pill; practical contemporary product engineer; clean database stack with a minimal unimpressed face; geometric clipboard-carrying judge.",
  "Absolutely no vintage treatment: no sepia, no distressed paper, no dry brush, no cross-hatching, no woodcut texture, no mid-century advertising, no 1970s instructional art, no retro-futurism.",
  "No photorealism, no glossy 3D, no neon circuitry, no holograms, no generic AI brain, no logos, no watermark, and no signature.",
].join(" ");

const COVER_STYLE = [
  STYLE,
  "Vertical 2:3 nonfiction book front cover, sophisticated contemporary editorial composition that reads clearly as a thumbnail.",
  "Use strong typographic hierarchy and render exactly this text, correctly spelled: title on two lines, ‘MEASURE TWICE,’ then ‘PROMPT ONCE’; subtitle, ‘Building Evals for AI Agents That Work in Production’; author, ‘BRENN HILL’.",
  "The comma immediately after TWICE is mandatory, clearly visible, and part of the title; do not omit it.",
  "No other words, letters, numbers, pseudo-text, or logos. Avoid an infinity-symbol composition.",
].join(" ");

const CARTOON_STYLE = [
  STYLE,
  "Single-panel 3:2 landscape editorial cartoon for a current nonfiction book.",
  "One visual joke, clean staging, readable gestures, large simple shapes, and a calm lower caption strip.",
  "Any incidental screens, papers, tickets, signs, trophies, ballots, or charts use simple icons only, never pseudo-text.",
].join(" ");

const assets = [
  {
    id: "cover-evidence-workbench",
    kind: "cover",
    output: "cover/source/cover-evidence-workbench.png",
    width: 1200,
    height: 1800,
    seed: 410217,
    title: "The Evidence Workbench",
    prompt: `${COVER_STYLE} A physical evidence workbench holds two distinct connected loop mechanisms: a small fast inner loop of five simple mechanical stations nested inside a much larger slower inspection loop. A copper paper trace ribbon exits the small loop, passes through a small unlabeled gold diamond-shaped checkpoint symbol, travels around the outer loop, and returns as a calibrated tool. The checkpoint is communicated only by the diamond icon: do not add a label, callout, legend, or surrounding words. The earnest robot and practical engineer stand beside the mechanism maintaining it together. The loops are clearly different sizes and speeds, with purposeful gaps at decision points. Precise, friendly, instrument-like, not mystical.`,
  },
  {
    id: "cover-loop-press",
    kind: "cover",
    output: "cover/source/cover-loop-press.png",
    width: 1200,
    height: 1800,
    seed: 410229,
    title: "The Loop Press",
    prompt: `${COVER_STYLE} A charming mechanical printmaking press shaped from two connected circular tracks. Messy copper trace ribbons enter from one side; crisp blank evidence cards with gold corner stamps emerge from the other and feed back toward a compact earnest robot adjusting the original mechanism. A practical engineer checks alignment with a small square and notebook. The metaphor is iterative measurement turning behavior into evidence, not manufacturing or factory scale.`,
  },
  {
    id: "cover-instrument-cabinet",
    kind: "cover",
    output: "cover/source/cover-instrument-cabinet.png",
    width: 1200,
    height: 1800,
    seed: 410241,
    title: "The Instrument Cabinet",
    prompt: `${COVER_STYLE} An open workshop instrument cabinet arranged around a central loop mechanism. Four drawers are distinguished only by icons: test tube and check, database drawer, expert clipboard, source document with evidence diamond. A copper trace ribbon connects the drawers into a larger loop around a fast inner mechanism. The robot reaches into one drawer while the engineer studies the returning evidence. Organized and tactile, like a field scientist's cabinet, with no written labels.`,
  },
  {
    id: "cover-cherry-picked-demo",
    kind: "cover",
    output: "cover/source/cover-cherry-picked-demo.png",
    width: 1200,
    height: 1800,
    seed: 410253,
    title: "The Cherry-Picked Demo",
    prompt: `${COVER_STYLE} A witty, immediately readable cover metaphor. In the foreground, the single earnest robot stands under a comically grand tiny spotlight, proudly presenting one flawless glossy red cherry on a miniature pedestal with one small gold check-shaped accent. Just behind the robot, the practical engineer gently points toward the much larger reality: a curving but non-crossing conveyor carries a varied parade of odd task boxes, documents, tool pieces, and one slightly unruly rubber duck through two distinct clean measuring arches made from calipers and rulers. Some cases pass neatly; one harmless box sits sideways and another waits for review. The robot looks over its shoulder with a charmingly sheepish ‘oh, right’ expression. One robot only, one engineer only. Keep the visual joke warm and subtle. Clear visual hierarchy, large simple shapes, plenty of open space, no factory clutter, no infinity symbol, no extra text.`,
  },
  {
    id: "cover-megaphone-and-calipers",
    kind: "cover",
    output: "cover/source/cover-megaphone-and-calipers.png",
    width: 1200,
    height: 1800,
    seed: 410267,
    title: "The Megaphone and the Calipers",
    prompt: `${COVER_STYLE} A dry visual joke about prompting versus measuring. The single earnest robot has brought one absurdly oversized copper megaphone to a compact agent workbench and is about to use it with great confidence. Beside the workbench, the practical engineer has quietly installed two precise measurement stations: one large caliper arch checks varied output cards, and a second square-and-gauge station checks the resulting tool state before cards curve back toward the workbench on a simple open loop. The robot notices that the engineer's modest instruments are doing the useful work and lowers the giant megaphone slightly, amused. One robot only, one engineer only. Strong thumbnail silhouette, restrained machinery, non-crossing loop, no infinity symbol, no extra text.`,
  },
  {
    id: "cover-one-question-exam",
    kind: "cover",
    output: "cover/source/cover-one-question-exam.png",
    width: 1200,
    height: 1800,
    seed: 410279,
    title: "The One-Question Exam",
    prompt: `${COVER_STYLE} A modern editorial cartoon with a small reveal. The single earnest robot stands proudly beside one pristine blank answer card on a tiny exam desk, wearing a little gold winner ribbon with no letters. The practical engineer calmly pulls aside a short curtain to reveal a friendly queue of many wildly different task props waiting behind it: a tool box, document stack, database drawer, citation card, timeout clock, and rubber duck. The queue feeds through two clear measurement gates and curves back toward the agent desk as a simple open loop. The robot gives the queue a surprised but game little smile, as if realizing the exam has more than one question. One robot only, one engineer only. Clean spacious composition, charming rather than slapstick, no classroom text, no infinity symbol, no extra words.`,
  },
  {
    id: "cover-robot-under-the-calipers",
    kind: "cover",
    output: "cover/source/cover-robot-under-the-calipers.png",
    width: 1200,
    height: 1800,
    seed: 410293,
    title: "The Robot Under the Calipers",
    prompt: `${COVER_STYLE} The subject being measured is the agent itself. In the lower half, the compact earnest robot stands happily inside a comically oversized but elegant precision caliper, like a friendly engineering inspection portrait. The caliper measures the robot from head to feet while a practical engineer checks one simple blank evidence card and adjusts a small gauge. Behind them, three much smaller robots wait in an orderly inspection queue; one has a harmless loose wheel, one is holding a parcel upside down, and one has turned around to face the wrong way. Warm visual humor, never cruel. The giant caliper and robot form one bold thumbnail silhouette. Keep the upper title area spacious. No conveyor of boxes, no infinity symbol, no extra text.`,
  },
  {
    id: "cover-calipers-measure-twice",
    kind: "cover",
    output: "cover/source/cover-calipers-measure-twice.png",
    width: 1200,
    height: 1800,
    seed: 410371,
    title: "The Robot Measured Twice",
    prompt: `${COVER_STYLE} Make the title's joke literal and immediate. In the lower half, one large friendly foreground robot stands calmly while it is measured twice at the same time: a tall elegant height caliper measures from feet to head, and a second large horizontal precision caliper measures its width. Both instruments clearly touch and frame the robot itself, not a box or output. A practical engineer compares the two readings on one blank evidence card. Farther back, three smaller robots wait; one faces backward, one holds a loose wheel, and one is gently tangled in its own measuring tape. The two calipers and robot must form one simple bold silhouette at thumbnail size. Keep background comedy secondary, upper title area spacious, BRENN HILL at the bottom, no extra text, no infinity symbol.`,
  },
  {
    id: "cover-calipers-closeup",
    kind: "cover",
    output: "cover/source/cover-calipers-closeup.png",
    width: 1200,
    height: 1800,
    seed: 410383,
    title: "The Caliper Close-Up",
    prompt: `${COVER_STYLE} A bold close-up cover portrait. One compact earnest robot fills most of the lower half, facing the reader, while the jaws of one enormous precision caliper frame its head and shoulders unmistakably. A round gauge sits above the robot like a measurement halo, but remains a mechanical gauge, not mystical. The robot holds a small blank evidence card and looks pleasantly curious about being tested. In the far background, three tiny robots provide restrained comedy: one bumps a clear panel, one carries a parcel upside down, and one proudly points the wrong way. No engineer in front; keep the central robot and caliper huge and uncluttered. Exact title and subtitle, BRENN HILL at the bottom, no extra text, no infinity symbol.`,
  },
  {
    id: "cover-calipers-closeup-v2",
    kind: "cover",
    output: "cover/source/cover-calipers-closeup-v2.png",
    width: 1200,
    height: 1800,
    seed: 410389,
    title: "The Caliper Close-Up — Clean Type",
    prompt: `${COVER_STYLE} The title begins directly with the letter M in MEASURE. Put absolutely no quotation mark, apostrophe, bullet, decoration, or symbol before MEASURE. Put BRENN HILL on its own line at the very bottom on warm-white space, never across the robot. Preserve a bold close-up portrait: one compact earnest robot fills most of the lower half, facing the reader, while the jaws of one enormous precision caliper frame its head and shoulders unmistakably. A simple mechanical gauge sits above the robot. The robot holds a small blank evidence card. In the far background, three tiny robots provide restrained comedy: one bumps a clear panel, one carries a parcel upside down, and one points the wrong way. No engineer in front. Huge uncluttered central robot and caliper, exact title and subtitle, no other text, no infinity symbol.`,
  },
  {
    id: "cover-calipers-lineup",
    kind: "cover",
    output: "cover/source/cover-calipers-lineup.png",
    width: 1200,
    height: 1800,
    seed: 410397,
    title: "The Caliper Lineup",
    prompt: `${COVER_STYLE} A friendly lineup of robots being evaluated, with the robots themselves as the specimens. One large foreground robot stands inside a graceful body-sized caliper arch while a practical engineer checks the gauge. Behind it, a short curved queue of four smaller robots approaches the same caliper: one tries to enter sideways, one is distracted by a rubber duck, one holds a wheel that should still be attached, and one waits correctly with a blank task card. The foreground robot is calm and competent; the background robots are silly but unharmed. Strong central caliper silhouette, readable depth, no factory conveyor, no tiny clutter. Keep title and subtitle exact, BRENN HILL at bottom, no other words, no infinity symbol.`,
  },
  {
    id: "cover-calipers-self-check",
    kind: "cover",
    output: "cover/source/cover-calipers-self-check.png",
    width: 1200,
    height: 1800,
    seed: 410409,
    title: "The Robot Checks Itself",
    prompt: `${COVER_STYLE} In the lower foreground, one earnest robot carefully uses a large precision caliper to measure its own arm while comparing the reading with a blank evidence card. The caliper is unmistakable, oversized enough to read at thumbnail size, and clearly touches the robot itself. Behind it, three smaller robots attempt the same evaluation less successfully: one measures the floor, one has wrapped a measuring tape around itself, and one celebrates before opening the caliper. A practical engineer watches the evidence with amused approval. The self-checking robot is competent rather than smug. Clean modern staging, strong foreground silhouette, restrained background slapstick, exact title and subtitle, BRENN HILL at bottom, no extra text, no infinity symbol.`,
  },
  {
    id: "cover-calipers-workshop",
    kind: "cover",
    output: "cover/source/cover-calipers-workshop.png",
    width: 1200,
    height: 1800,
    seed: 410421,
    title: "The Robot Measurement Workshop",
    prompt: `${COVER_STYLE} A cleaner, more sophisticated version of a robot measurement workshop. One large foreground robot stands centered beneath an oversized precision caliper that clearly spans from one side of its body to the other. A practical engineer stands slightly behind, reading a simple round gauge and a blank evidence card, never blocking the robot. In the distant background, three small robots make distinct harmless mistakes: one walks into a spotless glass panel, one carries a parcel upside down, and one turns around after following itself in a small circle. Keep the main robot, caliper, and gauge as a single uncluttered cover icon; background comedy should reward a second look. Plenty of warm-white negative space, exact title and subtitle, BRENN HILL at bottom, no extra text, no infinity symbol.`,
  },
  {
    id: "cover-calipers-double-portrait",
    kind: "cover",
    output: "cover/source/cover-calipers-double-portrait.png",
    width: 1200,
    height: 1800,
    seed: 410433,
    title: "The Double-Caliper Portrait",
    prompt: `${COVER_STYLE} A clean, iconic portrait with no foreground human. One large earnest robot stands centered in the lower half and is visibly measured by two instruments: a vertical height gauge behind it and a horizontal precision caliper across its middle. The two instruments form a neat geometric frame around the robot, making “measure twice” obvious without clutter. The robot holds one small blank evidence card and looks calmly toward the reader. In the background, three smaller robots make gentle mistakes: one bumps a clear panel, one carries a parcel upside down, and one walks in a small circle after its own arrow. Use the recurring soft-square robot design for every robot. Strong thumbnail silhouette, generous warm-white space, exact title and subtitle, BRENN HILL at the bottom, no opening quotation mark, no extra text, no infinity symbol.`,
  },
  {
    id: "cover-robot-inspection-day",
    kind: "cover",
    output: "cover/source/cover-robot-inspection-day.png",
    width: 1200,
    height: 1800,
    seed: 410307,
    title: "Robot Inspection Day",
    prompt: `${COVER_STYLE} A witty robot inspection lane in the lower half of the cover. Several compact friendly robots, not boxes or products, pass through three simple body-sized measurement stations: a caliper arch, a square-and-level gate, and a final gold check light. In the foreground one composed robot has passed all three and calmly verifies its own tool result on a blank card. In the background, one robot squeezes through a gate sideways, another exits with one arm still pointing backward, and a third politely waits while holding its detached wheel. The practical engineer watches the actual evidence rather than awarding medals. Clear left-to-right action with no crossing tracks, modern and charming, not a factory. Keep the upper title area clean. No infinity symbol, no extra text.`,
  },
  {
    id: "cover-robot-inspection-day-v2",
    kind: "cover",
    output: "cover/source/cover-robot-inspection-day-v2.png",
    width: 1200,
    height: 1800,
    seed: 410313,
    title: "Robot Inspection Day — Clean Type",
    prompt: `${COVER_STYLE} The title must begin directly with the letter M in MEASURE. Absolutely no opening quotation mark, apostrophe, decorative glyph, bullet, or symbol before MEASURE. Put BRENN HILL at the very bottom. In the lower half, show a witty inspection lane measuring robots themselves. One large composed foreground robot has passed through a body-sized caliper arch and now checks its own tool result against a blank evidence card. Behind it, three smaller friendly robots make distinct harmless mistakes: one tries the arch sideways, one points confidently in the wrong direction, and one patiently holds a loose wheel. A practical engineer watches the evidence. Strong foreground hero, secondary background comedy, simple measurement gates, spacious composition, not an airport and not a factory. No infinity symbol and no text beyond the exact title, subtitle, and author.`,
  },
  {
    id: "cover-robot-obstacle-course",
    kind: "cover",
    output: "cover/source/cover-robot-obstacle-course.png",
    width: 1200,
    height: 1800,
    seed: 410321,
    title: "The Robot Obstacle Course",
    prompt: `${COVER_STYLE} A playful evaluation obstacle course for small office robots occupies the lower half. In the foreground, one earnest robot pauses at a gold checkpoint to compare a blank task card with the actual state of a small open drawer before continuing. In the middle distance, three other friendly robots make harmless, distinct mistakes: one gently bumps into a spotless glass panel, one circles the same traffic cone for the third time, and one celebrates beside the wrong empty finish pedestal. A practical engineer records the outcomes with a compact clipboard. The front robot is competent because it verifies, not because it is shinier or larger. Broad readable shapes, restrained slapstick, lots of warm-white breathing room, no text on signs, no injury, no infinity symbol, no extra words.`,
  },
  {
    id: "cover-glass-wall-test",
    kind: "cover",
    output: "cover/source/cover-glass-wall-test.png",
    width: 1200,
    height: 1800,
    seed: 410333,
    title: "The Glass Wall Test",
    prompt: `${COVER_STYLE} A simple visual gag about testing agent behavior. In the foreground, one careful compact robot uses a tiny gold probe to discover the open gap in a nearly invisible glass partition, then steps through it with a pleased expression. Behind it, two friendly robots have gently bonked into other clear sections and now sit harmlessly puzzled, while a third confidently follows an arrow it drew for itself in a small circle. The practical engineer measures the actual paths with a floor ruler and a blank trace card. Make the clear wall legible through sparse navy edges and soft reflections. One dominant foreground robot, amusing background behavior, no pain, no text, no infinity symbol, no extra words.`,
  },
  {
    id: "cover-the-careful-one",
    kind: "cover",
    output: "cover/source/cover-the-careful-one.png",
    width: 1200,
    height: 1800,
    seed: 410347,
    title: "The Careful One",
    prompt: `${COVER_STYLE} One composed robot fills the lower foreground, kneeling to measure its own completed work with a small square, ruler, and blank evidence card before declaring success. Behind it is a lively but uncluttered comedy of three smaller robots on the same task course: one tries to push a pull-style door from the wrong side with no writing on it, one carries a stack of parcels tall enough to obscure its face, and one enthusiastically stamps a blank card while its drawer remains open behind it. A practical engineer looks toward the careful robot's evidence. The careful robot is the hero because it checks the world. Strong foreground silhouette, background mishaps readable but secondary, warm and contemporary, no extra text, no infinity symbol.`,
  },
  {
    id: "cover-wrong-finish-line",
    kind: "cover",
    output: "cover/source/cover-wrong-finish-line.png",
    width: 1200,
    height: 1800,
    seed: 410359,
    title: "The Wrong Finish Line",
    prompt: `${COVER_STYLE} A dry visual joke about grading the outcome rather than the announcement. In the foreground, one earnest robot has stopped at a clean measurement gate where a caliper and open database drawer confirm the task is actually complete; it holds one small gold check token. In the background, three cheerful robots throw a tiny celebration at an obviously premature finish pedestal while the task object sits untouched a few steps farther on. One robot has confetti stuck to its head and another proudly holds an empty ribbon. The practical engineer points from the celebration toward the unfinished state with gentle amusement. Keep the gag instantly readable, spacious, and kind. No lettering on flags or props, no infinity symbol, no extra words.`,
  },
  {
    id: "preface-01-capital-letters",
    kind: "cartoon",
    output: "cartoons/source/preface-01-capital-letters.png",
    width: 1200,
    height: 800,
    seed: 520101,
    title: "Capital letters as measurement",
    caption: "Emphasis is not instrumentation.",
    prompt: `${CARTOON_STYLE} A practical engineer has built an absurdly enormous blank instruction placard on an easel, using a comically huge bold marker. Beside it, the compact robot wears safety goggles and cautiously holds a tiny ruler up to the placard as if trying to measure its effectiveness. The contrast between giant emphasis and tiny measurement tool is the joke.`,
  },
  {
    id: "ch01-01-green-dashboard",
    kind: "cartoon",
    output: "cartoons/source/ch01-01-green-dashboard.png",
    width: 1200,
    height: 800,
    seed: 520113,
    title: "The green dashboard",
    caption: "A green proxy is not a green product.",
    prompt: `${CARTOON_STYLE} Engineer and robot proudly inspect a wall dashboard made entirely of reassuring blank green indicator circles. Through a large window directly behind the dashboard, a small delivery machine repeatedly drops plain packages into a puddle while an exasperated user waits. The engineer notices the real scene; the dashboard remains serenely green.`,
  },
  {
    id: "ch01-02-footnote-confetti",
    kind: "cartoon",
    output: "cartoons/source/ch01-02-footnote-confetti.png",
    width: 1200,
    height: 800,
    seed: 520127,
    title: "Footnote confetti",
    caption: "Citation volume is not evidence quality.",
    prompt: `${CARTOON_STYLE} The earnest robot enthusiastically operates a confetti cannon that sprays dozens of tiny blank paper citation slips into the air. At a desk, the engineer calmly uses a magnifying glass to compare one blank claim card against one source page, finding the connection missing. Festive quantity versus careful support.`,
  },
  {
    id: "ch03-01-review-room",
    kind: "cartoon",
    output: "cartoons/source/ch03-01-review-room.png",
    width: 1200,
    height: 800,
    seed: 520139,
    title: "The review room",
    caption: "Review rigor should scale with consequence. Meeting-room capacity may not.",
    prompt: `${CARTOON_STYLE} A tiny meeting-room doorway is comically overwhelmed by a long orderly crowd of software developers, each carrying a different oddly shaped blank edge-case card, test fixture, or bug box. Inside, the robot has prepared one very small table and exactly two chairs. No crowd panic, just dry logistical absurdity.`,
  },
  {
    id: "ch04-01-database-vote",
    kind: "cartoon",
    output: "cartoons/source/ch04-01-database-vote.png",
    width: 1200,
    height: 800,
    seed: 520151,
    title: "The database gets a vote",
    caption: "Grade the world, not the announcement.",
    prompt: `${CARTOON_STYLE} The earnest robot stands at a tiny press-conference lectern and triumphantly gestures that a task is complete. Beside the lectern, the squat filing-cabinet database raises an unmistakably dissenting blank ballot card and points to an unchanged drawer. The engineer looks from the announcement to the actual drawer state.`,
  },
  {
    id: "ch04-02-self-certification",
    kind: "cartoon",
    output: "cartoons/source/ch04-02-self-certification.png",
    width: 1200,
    height: 800,
    seed: 520163,
    title: "Student, examiner, accreditation board",
    caption: "Self-evaluation is evidence. Self-certification is a governance structure of unusual efficiency.",
    prompt: `${CARTOON_STYLE} Three adjacent tiny desks form a miniature bureaucracy. At the first desk the same robot writes an answer; at the second it wears reading glasses and stamps its own paper; at the third it wears a ceremonial sash and awards itself a blank certificate. The engineer stands to the side counting the identical robots with one raised eyebrow.`,
  },
  {
    id: "ch05-01-mood-ring",
    kind: "cartoon",
    output: "cartoons/source/ch05-01-mood-ring.png",
    width: 1200,
    height: 800,
    seed: 520177,
    title: "The mood-ring grader",
    caption: "A broad impression is not a grader contract.",
    prompt: `${CARTOON_STYLE} The clipboard-carrying desk-lamp judge solemnly examines a glowing oversized mood ring sitting on a blank report. The ring changes through several spot colors while the practical engineer asks for evidence by holding up an empty evidence card and pencil. The robot watches the ring as if it were a weather forecast.`,
  },
  {
    id: "ch09-01-pvalue-magistrate",
    kind: "cartoon",
    output: "cartoons/source/ch09-01-pvalue-magistrate.png",
    width: 1200,
    height: 800,
    seed: 520189,
    title: "The tiny p-value magistrate",
    caption: "Effect, uncertainty, and case evidence all belong in the decision.",
    prompt: `${CARTOON_STYLE} A comically tiny robed magistrate stands on a stack of books and bangs a miniature gavel beside a very large table covered with contrasting paired case cards. The magistrate turns away from the rich case evidence after peering at one tiny blank decimal card. Engineer and robot exchange a puzzled look.`,
  },
  {
    id: "ch11-01-haunted-ci",
    kind: "cartoon",
    output: "cartoons/source/ch11-01-haunted-ci.png",
    width: 1200,
    height: 800,
    seed: 520201,
    title: "Haunted CI and pass eventually",
    caption: "Keeping the green run measures persistence, not reliability.",
    prompt: `${CARTOON_STYLE} An engineer repeatedly pulls a large rerun lever while a spectral test indicator flickers unpredictably between red and green. The cheerful robot already holds up a blank trophy and celebratory ribbon after the first green flash. The unimpressed database keeps a long tally of all the red attempts on blank tick-mark cards without readable symbols.`,
  },
  {
    id: "ch12-01-users-invoices",
    kind: "cartoon",
    output: "cartoons/source/ch12-01-users-invoices.png",
    width: 1200,
    height: 800,
    seed: 520213,
    title: "The distribution sending invoices",
    caption: "Production users are not an edge case.",
    prompt: `${CARTOON_STYLE} In an office, the engineer and robot point at a neat bell-curve chart with one small cluster placed far outside it. That supposedly remote cluster has walked into the room as several ordinary users carrying real blank invoices, parcels, and support tickets. They are calm, present, and clearly not theoretical.`,
  },
  {
    id: "ch13-01-recursive-audit",
    kind: "cartoon",
    output: "cartoons/source/ch13-01-recursive-audit.png",
    width: 1200,
    height: 800,
    seed: 520227,
    title: "The recursive audit",
    caption: "The audit needs owners and actions, not another unowned audit.",
    prompt: `${CARTOON_STYLE} Engineer, robot, and desk-lamp judge are nearly buried under a recursively growing stack of clipboards, each inspecting the clipboard below it. Outside the window a tiny tree passes through several seasons, shown by a few leaves, while no one has touched the single waiting repair tool on the desk.`,
  },
  {
    id: "ch14-01-everyone-owns",
    kind: "cartoon",
    output: "cartoons/source/ch14-01-everyone-owns.png",
    width: 1200,
    height: 800,
    seed: 520239,
    title: "Everyone owns quality",
    caption: "Shared responsibility still needs named accountability.",
    prompt: `${CARTOON_STYLE} One blank work ticket sits untouched in the center of a round table. Seven varied team members all politely point responsibility toward the next person around the circle. Under the table, the squat database quietly opens an empty drawer and files the ticket into it. Dry workplace humor, no blame or hostility.`,
  },
  {
    id: "ch14-02-level-decorative",
    kind: "cartoon",
    output: "cartoons/source/ch14-02-level-decorative.png",
    width: 1200,
    height: 800,
    seed: 520251,
    title: "Level Decorative",
    caption: "Tooling without a recurring decision is an exhibit.",
    prompt: `${CARTOON_STYLE} A magnificent but unused evaluation control room is displayed like a museum exhibit behind a velvet rope. It has many beautiful blank screens, polished gauges, and elaborate knobs, but no trace cards, no task cases, and no operator chair. Engineer and robot stand outside holding a small practical toolbox and looking unconvinced.`,
  },
  {
    id: "ch15-01-platform-first",
    kind: "cartoon",
    output: "cartoons/source/ch15-01-platform-first.png",
    width: 1200,
    height: 800,
    seed: 520263,
    title: "The platform-first forklift",
    caption: "Choose the task and evidence model before optimizing the platform.",
    prompt: `${CARTOON_STYLE} Engineer and robot have acquired an enormous immaculate warehouse forklift for one tiny unlabeled box sitting on the floor. The robot proudly studies the forklift's many blank gauges while the engineer kneels beside the tiny box, trying to determine what is actually inside. The scale mismatch is the joke.`,
  },
];

function parseArgs(argv) {
  const options = { ids: [], force: false, dryRun: false, concurrency: 2 };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--force") options.force = true;
    else if (value === "--dry-run") options.dryRun = true;
    else if (value === "--id") options.ids.push(argv[++index]);
    else if (value === "--kind") options.kind = argv[++index];
    else if (value === "--concurrency") options.concurrency = Math.max(1, Number(argv[++index]) || 1);
    else throw new Error(`Unknown argument: ${value}`);
  }
  return options;
}

function selectedAssets(options) {
  return assets.filter((asset) => {
    if (options.kind && asset.kind !== options.kind) return false;
    if (options.ids.length && !options.ids.includes(asset.id)) return false;
    return true;
  });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`fal returned HTTP ${response.status} with non-JSON: ${text.slice(0, 300)}`);
  }
  if (!response.ok) throw new Error(`fal returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  return data;
}

function falQueueUrl(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is missing`);
  const url = new URL(value);
  if (url.protocol !== "https:" || !(url.hostname === "queue.fal.run" || url.hostname.endsWith(".queue.fal.run"))) {
    throw new Error(`${label} is outside fal's HTTPS queue domain`);
  }
  return url.toString();
}

function effectivePrompt(asset) {
  const exactCaption = asset.caption
    ? `At the bottom, typeset this exact caption verbatim in a clean modern sans serif: “${asset.caption}” Spell every word correctly. Render no other text.`
    : "";
  return `${asset.prompt} ${exactCaption}`.trim();
}

function pngDimensions(bytes) {
  const signature = "89504e470d0a1a0a";
  if (bytes.length >= 24 && bytes.subarray(0, 8).toString("hex") === signature) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  return { width: null, height: null };
}

async function generate(asset, apiKey) {
  const headers = { authorization: `Key ${apiKey}`, "content-type": "application/json" };
  const body = {
    prompt: effectivePrompt(asset),
    system_prompt: STYLE,
    aspect_ratio: asset.kind === "cover" ? "2:3" : "3:2",
    resolution: RESOLUTION,
    num_images: 1,
    output_format: "png",
    safety_tolerance: "4",
    limit_generations: true,
    enable_web_search: false,
    thinking_level: "high",
    seed: asset.seed,
  };
  const submitted = await requestJson(`${QUEUE_ROOT}/${ENDPOINT}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const requestId = String(submitted.request_id || "").trim();
  if (!/^[A-Za-z0-9_-]{1,160}$/.test(requestId)) throw new Error("fal queue response omitted a safe request ID");
  const statusUrl = falQueueUrl(submitted.status_url, "fal status URL");
  const responseUrl = falQueueUrl(submitted.response_url, "fal response URL");
  process.stdout.write(`queued ${asset.id} ${requestId}\n`);
  for (let attempt = 0; attempt < 360; attempt += 1) {
    const status = await requestJson(statusUrl, { headers: { authorization: `Key ${apiKey}` } });
    const state = String(status.status || "").toUpperCase();
    if (state === "COMPLETED") {
      if (status.error) throw new Error(`fal completed with error: ${status.error}`);
      const result = await requestJson(responseUrl, { headers: { authorization: `Key ${apiKey}` } });
      const image = result.images?.[0];
      if (!image?.url) throw new Error("fal completed without an image URL");
      const media = new URL(image.url);
      const falMedia = media.hostname === "fal.media" || media.hostname.endsWith(".fal.media");
      const falGoogleStorage = media.hostname === "storage.googleapis.com" && media.pathname.startsWith("/falserverless/");
      if (media.protocol !== "https:" || (!falMedia && !falGoogleStorage)) {
        throw new Error("fal returned an image outside its HTTPS media domain");
      }
      const downloaded = await fetch(media);
      if (!downloaded.ok) throw new Error(`fal media download returned HTTP ${downloaded.status}`);
      const bytes = Buffer.from(await downloaded.arrayBuffer());
      if (!bytes.length) throw new Error("fal media download was empty");
      return { requestId, result, image, bytes };
    }
    if (["FAILED", "CANCELLED"].includes(state)) throw new Error(`fal queue ended in ${state.toLowerCase()}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("fal queue did not complete in six minutes");
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { schemaVersion: 1, generatedAt: null, endpoint: ENDPOINT, resolution: RESOLUTION, priceCard: { estimatedUsdPerImage: COST_USD_PER_IMAGE, source: "aether-concept-generator-2026-08-25" }, assets: [] };
  }
}

async function atomicJson(destination, value) {
  const temporary = `${destination}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, destination);
}

async function runOne(asset, options, apiKey, manifest) {
  const versionedOutput = asset.output.replace("/source/", "/source/nano-banana-2/");
  const destination = path.join(IMAGE_ROOT, versionedOutput);
  const existing = manifest.assets.find((entry) => entry.id === asset.id);
  try {
    const existingBytes = await readFile(destination);
    if (!options.force && existing?.state === "completed") {
      const dimensions = pngDimensions(existingBytes);
      if (dimensions.width && dimensions.height) {
        existing.width = dimensions.width;
        existing.height = dimensions.height;
        existing.bytes = existingBytes.length;
        await atomicJson(MANIFEST_PATH, manifest);
      }
      process.stdout.write(`skip ${asset.id}\n`);
      return;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  process.stdout.write(`generate ${asset.id}\n`);
  const generated = await generate(asset, apiKey);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, generated.bytes);
  const dimensions = pngDimensions(generated.bytes);
  const width = Number(generated.image.width || dimensions.width || asset.width);
  const height = Number(generated.image.height || dimensions.height || asset.height);
  const entry = {
    id: asset.id,
    kind: asset.kind,
    title: asset.title,
    caption: asset.caption || null,
    state: "completed",
    output: path.relative(ROOT, destination),
    prompt: effectivePrompt(asset),
    systemPrompt: STYLE,
    endpoint: ENDPOINT,
    endpointRevision: null,
    reproducibility: "alias-only",
    requestedSeed: asset.seed,
    returnedSeed: generated.result.seed ?? null,
    requestId: generated.requestId,
    width,
    height,
    contentType: generated.image.content_type || downloadedContentType(generated.image) || "image/png",
    bytes: generated.bytes.length,
    sha256: createHash("sha256").update(generated.bytes).digest("hex"),
    resolution: RESOLUTION,
    estimatedCostUsd: COST_USD_PER_IMAGE,
    generatedAt: new Date().toISOString(),
    reviewStatus: "unreviewed",
  };
  const index = manifest.assets.findIndex((candidate) => candidate.id === asset.id);
  if (index < 0) manifest.assets.push(entry);
  else manifest.assets[index] = entry;
  manifest.generatedAt = new Date().toISOString();
  await atomicJson(MANIFEST_PATH, manifest);
  process.stdout.write(`done ${asset.id} $${entry.estimatedCostUsd.toFixed(4)} ${width}x${height}\n`);
}

function downloadedContentType(image) {
  return image.content_type || null;
}

async function mapLimit(items, limit, fn) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await fn(items[index]);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const selected = selectedAssets(options);
  if (!selected.length) throw new Error("No assets matched the requested filters");
  const expectedCost = selected.length * COST_USD_PER_IMAGE;
  process.stdout.write(`${selected.length} assets via ${ENDPOINT}; estimated maximum $${expectedCost.toFixed(4)}\n`);
  if (options.dryRun) {
    for (const asset of selected) process.stdout.write(`${asset.id}\t${asset.kind === "cover" ? "2:3" : "3:2"}\t${RESOLUTION}\t${asset.output.replace("/source/", "/source/nano-banana-2/")}\n`);
    return;
  }
  const apiKey = String(process.env.FAL_KEY || "").trim();
  if (!apiKey) throw new Error("FAL_KEY is required");
  const manifest = await readManifest();
  await mkdir(IMAGE_ROOT, { recursive: true });
  await mapLimit(selected, options.concurrency, (asset) => runOne(asset, options, apiKey, manifest));
  manifest.assets.sort((left, right) => left.id.localeCompare(right.id));
  await atomicJson(MANIFEST_PATH, manifest);
  const total = manifest.assets.reduce((sum, asset) => sum + Number(asset.estimatedCostUsd || 0), 0);
  process.stdout.write(`manifest ${path.relative(ROOT, MANIFEST_PATH)}; retained estimated total $${total.toFixed(4)}\n`);
}

await main();
