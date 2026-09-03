#!/usr/bin/env bash
# Grab several stills from one YouTube video, resolving the stream URL once.
#   ./grab_frames.sh <video_id> <HH:MM:SS>=<out_name.png> [more...]
set -euo pipefail
ID="$1"; shift
DIR="$(cd "$(dirname "$0")/.." && pwd)/frames"
mkdir -p "$DIR"
URL="$(uvx yt-dlp -q --no-warnings -f 'bv*[height<=1080][ext=mp4]/bv*[height<=1080]' -g "https://www.youtube.com/watch?v=$ID" | head -1)"
for pair in "$@"; do
  TS="${pair%%=*}"; OUT="${pair#*=}"
  if ffmpeg -loglevel error -ss "$TS" -i "$URL" -frames:v 1 -y "$DIR/$OUT" </dev/null; then
    echo "ok   $TS -> $OUT"
  else
    echo "FAIL $TS -> $OUT"
  fi
done
