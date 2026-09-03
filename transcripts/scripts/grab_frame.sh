#!/usr/bin/env bash
# Grab a single still from a YouTube video at a timestamp.
#   ./grab_frame.sh <video_id> <HH:MM:SS> [out_name]
set -euo pipefail
ID="$1"; TS="$2"; OUT="${3:-${ID}_${TS//:/-}.png}"
DIR="$(cd "$(dirname "$0")/.." && pwd)/frames"
mkdir -p "$DIR"
URL="$(uvx yt-dlp -f 'bv*[height<=1080][ext=mp4]/bv*[height<=1080]' -g "https://www.youtube.com/watch?v=$ID" | head -1)"
ffmpeg -loglevel error -ss "$TS" -i "$URL" -frames:v 1 -y "$DIR/$OUT"
echo "$DIR/$OUT"
