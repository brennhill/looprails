# Transcripts

Reference transcripts for six talks/interviews on AI evals and agent evaluation.
Pulled with `yt-dlp` from YouTube captions on 2026-09-02.

See **[LESSONS.md](LESSONS.md)** for the substantive takeaways pulled out of these transcripts,
with a timestamp behind every claim.

See **[VISUAL-CAPTURE.md](VISUAL-CAPTURE.md)** for timestamps where the speech points at
something on screen worth grabbing as a still.

| # | Transcript | Channel | Published | Length | Captions |
|---|---|---|---|---|---|
| 1 | [Agentic Evaluations at Scale, For Everybody — Nicholas Kang & Michael Aaron, Google DeepMind](agentic-evaluations-at-scale-google-deepmind.md) | AI Engineer | 2026-05-25 | 00:20:02 | auto |
| 2 | [When an AI Coding Agent Drives a Phone Through the Terminal, No Screen Needed](coding-agent-drives-a-phone-through-the-terminal.md) | AI Papers: A Deep Dive | 2026-06-20 | 00:24:29 | auto |
| 3 | [The Evals That Made GitHub Copilot](the-evals-that-made-github-copilot.md) | Hamel Husain | 2025-05-13 | 00:58:26 | human |
| 4 | [From Noob to Automated Evals In A Week (as a PM) w/Teresa Torres](noob-to-automated-evals-in-a-week-teresa-torres.md) | Hamel Husain | 2025-08-15 | 01:10:21 | human |
| 5 | [Why AI evals are the hottest new skill for product builders — Hamel Husain & Shreya Shankar](lennys-podcast-why-ai-evals-are-the-hottest-new-skill.md) | Lenny's Podcast | 2025-09-25 | 01:46:33 | auto |
| 6 | [Agentic Evaluations Workshop - Deep Dive on the Future on Evals for Agents.](agentic-evaluations-workshop-huggingface.md) | Hugging Face | 2026-03-20 | 01:48:46 | auto |

## Layout

- `*.md` — timestamped transcripts. Every block header deep-links back into the video.
- `LESSONS.md` — cross-cutting lessons, each anchored to a timestamp.
- `VISUAL-CAPTURE.md` — curated frame-grab flags, per video.
- `raw/` — original yt-dlp output: `*.json3` caption tracks and `*.info.json` metadata (chapters, description).
- `scripts/json3_to_md.py` — regenerates the markdown from `raw/`.
- `scripts/find_visuals.py <video_id> [min_score]` — rescans captions for on-screen-reference cues.
- `scripts/grab_frame.sh <video_id> <HH:MM:SS> [out_name]` — pulls one still into `frames/`.
- `scripts/grab_frames.sh <video_id> <HH:MM:SS>=<name.png> ...` — several stills from one video, resolving the stream URL once. Use this for more than one frame.
- `frames/` — 53 captured stills, every one referenced by name from `LESSONS.md` or `VISUAL-CAPTURE.md`.

## Caveats

- Four of six tracks are auto-generated: no speaker labels, and proper nouns are often mangled
  (e.g. Hamel/Shreya appear in several spellings). Verify any quote against the video before citing it.
- The two Hamel Husain channel talks have human-written captions and are accurate enough to quote.
- Transcript blocks are 45-second groupings, not sentence-accurate paragraph breaks.
- **Slides drift from the speech that references them.** Speakers describe a slide 30–90s after it appears, or keep talking past it. Six of the first sixteen grabs landed on a neighbouring slide. Sweep ±60s and check the frame before trusting a timestamp; `VISUAL-CAPTURE.md` records the timestamp that actually holds each slide, and flags the places where the original note was wrong about what is on screen.
