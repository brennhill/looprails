#!/usr/bin/env python3
"""Convert yt-dlp json3 caption files into timestamped markdown transcripts."""
import json, os, glob, re, sys, datetime

RAW = os.path.join(os.path.dirname(__file__), "..", "raw")
OUT = os.path.join(os.path.dirname(__file__), "..")
BLOCK_SECONDS = 45

SLUGS = {
    "BsWxPI9UM4c": "lennys-podcast-why-ai-evals-are-the-hottest-new-skill",
    "LwLxlEwrtRA": "the-evals-that-made-github-copilot",
    "N-qAOv_PNPc": "noob-to-automated-evals-in-a-week-teresa-torres",
    "Ubwb6NzegyA": "agentic-evaluations-at-scale-google-deepmind",
    "UxMZfbWI3LY": "agentic-evaluations-workshop-huggingface",
    "W3sZRAStjDs": "coding-agent-drives-a-phone-through-the-terminal",
}

def ts(ms):
    s = int(ms // 1000)
    return f"{s//3600:02d}:{(s%3600)//60:02d}:{s%60:02d}"

def slugify(t):
    t = re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
    return t[:70].strip("-")

def load_cues(path):
    d = json.load(open(path))
    cues = []
    for e in d.get("events", []):
        if "segs" not in e or e.get("aAppend"):
            continue
        text = "".join(s.get("utf8", "") for s in e["segs"])
        text = text.replace("\n", " ").strip()
        text = re.sub(r"\s+", " ", text)
        if not text:
            continue
        cues.append((e["tStartMs"], text))
    return cues

def pick_caption_file(vid):
    """Prefer human-written captions over auto-generated ones."""
    manual = sorted(glob.glob(os.path.join(RAW, f"{vid}.en-US.json3")))
    if manual:
        return manual[0], "human-written (en-US)"
    auto = os.path.join(RAW, f"{vid}.en.json3")
    return auto, "auto-generated (en)"

def blocks(cues):
    out, cur, start = [], [], None
    for t, txt in cues:
        if start is None:
            start = t
        cur.append(txt)
        if t - start >= BLOCK_SECONDS * 1000:
            out.append((start, " ".join(cur)))
            cur, start = [], None
    if cur:
        out.append((start, " ".join(cur)))
    return out

def wrap(text, width=95):
    words, lines, line = text.split(), [], ""
    for w in words:
        if len(line) + len(w) + 1 > width:
            lines.append(line); line = w
        else:
            line = f"{line} {w}".strip()
    if line:
        lines.append(line)
    return "\n".join(lines)

index = []
for info_path in sorted(glob.glob(os.path.join(RAW, "*.info.json"))):
    info = json.load(open(info_path))
    vid = info["id"]
    title = info["title"]
    slug = SLUGS.get(vid, slugify(title))
    cap_path, cap_kind = pick_caption_file(vid)
    cues = load_cues(cap_path)
    url = f"https://www.youtube.com/watch?v={vid}"
    up = info.get("upload_date") or ""
    up_fmt = f"{up[:4]}-{up[4:6]}-{up[6:]}" if up else "unknown"

    L = []
    L.append(f"# {title}\n")
    L.append(f"- **Video:** {url}")
    L.append(f"- **Channel:** {info.get('channel','?')}")
    L.append(f"- **Published:** {up_fmt}")
    L.append(f"- **Duration:** {ts((info.get('duration') or 0)*1000)}")
    L.append(f"- **Captions:** {cap_kind}")
    L.append(f"- **Retrieved:** {datetime.date.today().isoformat()} (yt-dlp)")
    L.append(f"- **Cue count:** {len(cues)}\n")

    chapters = info.get("chapters") or []
    if chapters:
        L.append("## Chapters\n")
        for c in chapters:
            st = int(c["start_time"])
            L.append(f"- [{ts(st*1000)}]({url}&t={st}s) — {c['title']}")
        L.append("")

    L.append("## Transcript\n")
    note = ("_Timestamps link into the video. Captions are auto-generated: no speaker labels, "
            "and names/jargon are often mangled — verify before quoting._\n"
            if cap_kind.startswith("auto") else
            "_Timestamps link into the video. Captions are human-written._\n")
    L.append(note)
    for start, text in blocks(cues):
        L.append(f"**[{ts(start)}]({url}&t={start//1000}s)**  ")
        L.append(wrap(text))
        L.append("")

    out_path = os.path.join(OUT, f"{slug}.md")
    open(out_path, "w").write("\n".join(L))
    index.append((up_fmt, title, slug, vid, info.get("channel", "?"),
                  ts((info.get("duration") or 0)*1000), cap_kind, len(cues)))
    print(f"{os.path.basename(out_path)}  cues={len(cues)}  {cap_kind}")

json.dump(index, open(os.path.join(OUT, ".index.json"), "w"), indent=1)
