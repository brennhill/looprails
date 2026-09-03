#!/usr/bin/env python3
"""Scan transcripts for on-screen-reference cues (deixis) worth capturing as stills."""
import json, os, glob, re, sys

RAW = os.path.join(os.path.dirname(__file__), "..", "raw")
BLOCK = 20  # seconds per merged window

STRONG = [
    r"\bthis (?:slide|chart|graph|table|diagram|figure|screenshot|dashboard|notebook|spreadsheet|plot|picture|image)\b",
    r"\bnext slide\b", r"\bthe slide\b", r"\bshare my screen\b", r"\bscreen ?share\b",
    r"\blet me show you\b", r"\bi'?ll show you\b", r"\bi'?m going to show\b", r"\bshowing you\b",
    r"\bpull(?:ing)? (?:this |it |that )?up\b", r"\bon (?:the|my) screen\b",
    r"\byou can see (?:here|this|that|the)\b", r"\bas you can see\b", r"\bif you look (?:at|here)\b",
    r"\bhere'?s (?:a|an|the|what|my|our)\b", r"\bthis is what .{0,20}looks like\b",
    r"\blooks? like this\b", r"\bover here\b", r"\bright here\b", r"\bup here\b",
    r"\bthe (?:x|y)[- ]axis\b", r"\bthis (?:screen|view|page|panel|tab)\b",
    r"\blive demo\b", r"\bdemo(?:ing|ed)?\b",
]
WEAK = [
    r"\bwalk (?:you )?through\b", r"\blook at (?:this|the|these)\b", r"\bthis example\b",
    r"\bthe (?:trace|traces)\b", r"\bthe (?:ui|interface)\b", r"\bthe code\b",
    r"\bthis (?:rubric|prompt|taxonomy|framework|pipeline|architecture|workflow)\b",
    r"\bon the (?:left|right|top|bottom)\b", r"\bcolumn\b", r"\bthe numbers\b",
    r"\bfor (?:example|instance)\b",
]
S = [re.compile(p, re.I) for p in STRONG]
W = [re.compile(p, re.I) for p in WEAK]

def ts(ms):
    s = int(ms // 1000)
    return f"{s//3600:02d}:{(s%3600)//60:02d}:{s%60:02d}"

def load_cues(path):
    d = json.load(open(path))
    out = []
    for e in d.get("events", []):
        if "segs" not in e or e.get("aAppend"):
            continue
        t = re.sub(r"\s+", " ", "".join(s.get("utf8", "") for s in e["segs"]).replace("\n", " ")).strip()
        if t:
            out.append((e["tStartMs"], t))
    return out

def pick(vid):
    m = os.path.join(RAW, f"{vid}.en-US.json3")
    return m if os.path.exists(m) else os.path.join(RAW, f"{vid}.en.json3")

vid = sys.argv[1]
minscore = int(sys.argv[2]) if len(sys.argv) > 2 else 2
cues = load_cues(pick(vid))
# merge into windows
wins, cur, start = [], [], None
for t, txt in cues:
    if start is None:
        start = t
    cur.append(txt)
    if t - start >= BLOCK * 1000:
        wins.append((start, " ".join(cur))); cur, start = [], None
if cur:
    wins.append((start, " ".join(cur)))

scored = []
for st, text in wins:
    hits = [p.pattern for p in S if p.search(text)]
    score = 2 * len(hits) + sum(1 for p in W if p.search(text))
    if score >= minscore:
        scored.append((score, st, text))

# merge adjacent windows
merged, prev = [], None
for score, st, text in scored:
    if prev and st - prev[1] <= BLOCK * 1000 + 500:
        prev = (max(prev[0], score), prev[1], prev[2] + " " + text)
        merged[-1] = prev
    else:
        prev = (score, st, text)
        merged.append(prev)

print(f"## {vid}  ({len(merged)} candidate windows)")
for score, st, text in sorted(merged, key=lambda x: x[1]):
    print(f"[{ts(st)}] s={score} :: {text[:400]}")
