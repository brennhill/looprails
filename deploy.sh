#!/usr/bin/env bash
# Build the LoopRails site and deploy to Cloudflare Pages (project: looprails).
# Usage: ./deploy.sh
# The site is served with clean URLs (Cloudflare Pages serves /kit from kit.html).
set -euo pipefail
cd "$(dirname "$0")"

node build-docs.js
node build-og.js   # regenerate OG cards (needs rsvg-convert)

# Assemble a clean, assets-only deploy dir (no .md sources, build scripts, or devto files).
rm -rf publish && mkdir publish
cp *.html *.png *.svg *.ico *.webmanifest \
   sitemap.xml feed.xml robots.txt llms.txt a6c15f4f9f3a7c000e62c7b3e2b7bd99.txt \
   publish/ 2>/dev/null || true

# Clean .html from links in the two hand-edited pages (build-docs.js already emits
# clean links for generated pages). Keeps the deploy self-healing if a raw .html
# link slips back into index.html / cheatsheet.html.
node -e '
const fs=require("fs");
const strip=h=>h.replace(/href="([^"#:]+)\.html(#[^"]*)?"/g,(m,p,x)=>`href="${p==="index"?"/":p}${x||""}"`);
for(const f of ["publish/index.html","publish/cheatsheet.html"]){
  if(fs.existsSync(f)) fs.writeFileSync(f,strip(fs.readFileSync(f,"utf8")));
}
'

wrangler pages deploy publish --project-name looprails --branch main --commit-dirty=true
echo "Deployed. Live at https://looprails.dev"
