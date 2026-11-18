#!/usr/bin/env bash
# สร้างตัวติดตั้งเว็บจากโค้ดในโฟลเดอร์ web/:  bash deploy/build_package.sh v40   → ikssa_web_v40.sh
set -euo pipefail
V=${1:?ระบุเวอร์ชัน เช่น v40}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${2:-$ROOT/ikssa_web_$V.sh}
{
  sed "s/__WEB_VERSION__/$V/" "$ROOT/deploy/deploy_web.head.sh"
  echo "__ARCHIVE_BELOW__"
  tar -cz -C "$ROOT/web" --exclude=./node_modules --exclude=./.next --exclude=./.env.local --exclude=./next-env.d.ts --exclude=./tsconfig.tsbuildinfo . | base64 -w 76
} > "$OUT"
bash -n "$OUT"
echo "สร้างแล้ว: $OUT ($(du -h "$OUT" | cut -f1))"
