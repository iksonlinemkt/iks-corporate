#!/usr/bin/env bash
# IKS Website — โหลดรูป ISUZU Trooper 1989 Concept "ทรงลุง" จาก Google Drive → ย่อเป็น webp → ใส่เป็นสไลด์ในหน้า "กิจกรรม"
# รันซ้ำได้ (แทนรูปชุดเดิม · ไม่ทับชื่อ/คำอธิบายที่แก้ในหลังบ้าน)
# รัน:  bash /root/ikssa_trooper_photos.sh
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then echo "กรุณารันด้วย: bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1; fi
set -euo pipefail
MEDIA_DIR=${MEDIA_DIR:-/var/www/ikssa-media}
SITE=$(tr -d "[:space:]" < /root/iks-web/site_url 2>/dev/null || true); SITE=${SITE:-https://isuzukrungthep.com}
FOLDERS=(
  "trooper|1fISepGqOW1jwc1ZRepm-bW8_WQhBbg96|อีซูซุ Trooper 1989 Concept ทรงลุง"
)
export GALLERY_DIR=gallery/trooper
export ACTIVITY_SLUG=trooper-1989-concept
export ACTIVITY_TITLE='ISUZU Trooper 1989 Concept "ทรงลุง"'
export ACTIVITY_SUMMARY='ชมภาพ อีซูซุ Trooper ปี 1989 ในคอนเซ็ปต์ "ทรงลุง" รถอเนกประสงค์คลาสสิกจากอีซูซุ'
PY_IMG=python:3.12-slim
mkdir -p /root/iks-web
TMP=$(mktemp -d /root/iks-web/photos.XXXX); trap 'rm -rf "$TMP"' EXIT
STAMP=$(date +%Y%m%d%H%M)


cat > "$TMP/process.mjs" <<'NODE_EOF'
// ย่อรูปแกลเลอรีเป็น webp + เขียน SQL: node process.mjs <SRC_DIR> <MEDIA_DIR> <GROUP_KEY> <SOURCE_TAG> <ALT_PREFIX> <STAMP> <SQL_OUT>
import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(process.env.SHARP_FROM ?? '/opt/ikssa-web/package.json');
const sharp = require('sharp');
const [SRC, MEDIA, KEY, SOURCE, ALT, STAMP, SQL_OUT] = process.argv.slice(2);
const DIR = process.env.GALLERY_DIR ?? 'gallery/biturbo';
// ACTIVITY_SLUG=... → ใส่รูปเป็นสไลด์ของกิจกรรม (รูปแรก = รูปปก) แทนตารางแกลเลอรี
const ACT = process.env.ACTIVITY_SLUG;
mkdirSync(path.join(MEDIA, DIR), { recursive: true });
const q = (s) => (s === null || s === undefined ? 'null' : `'${String(s).replace(/'/g, "''")}'`);

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(SRC).filter((f) => /\.(jpe?g|jfif|jpe|png|webp|tiff?|avif|heic|heif|gif|bmp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

const rows = [];
const media = [];
let n = 0;
for (const f of files) {
  try {
    const base = sharp(f, { failOn: 'none' }).rotate();
    const num = String(n + 1).padStart(2, '0');
    const big = `${DIR}/${KEY}-${STAMP}-${num}.webp`;
    const small = `${DIR}/${KEY}-${STAMP}-${num}-t.webp`;
    const a = await base.clone().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(MEDIA, big));
    const b = await base.clone().resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(MEDIA, small));
    n++;
    const alt = `${ALT} รูปที่ ${n}`;
    rows.push(`(${q(KEY)}, ${q(big)}, ${q(small)}, ${q(alt)}, ${a.width}, ${a.height}, ${q(SOURCE)}, ${n * 10})`);
    media.push(`(${q(big)}, ${q(path.basename(f).slice(0, 200))}, 'image/webp', ${statSync(path.join(MEDIA, big)).size}, ${a.width}, ${a.height}, ${q(alt)})`);
    console.log(`  ✔ ${path.basename(f)} → ${a.width}×${a.height} (${Math.round(statSync(path.join(MEDIA, big)).size / 1024)} KB) · ย่อ ${b.width}×${b.height}`);
  } catch (e) {
    console.log(`  ! ข้าม ${path.basename(f)}: ${e.message.split('\n')[0]}`);
  }
}
const out = ['set client_min_messages = warning;', 'begin;'];
if (ACT) {
  const imgs = rows.map((r) => r.match(/^\('[^']*', '([^']*)'/)[1]);
  if (imgs.length) {
    out.push(`insert into public.activities (slug, title, summary, cover_image, gallery, status, sort_order)
values (${q(ACT)}, ${q(process.env.ACTIVITY_TITLE ?? ALT)}, ${q(process.env.ACTIVITY_SUMMARY ?? null)}, ${q(imgs[0])}, ${q(JSON.stringify(imgs.slice(1)))}::jsonb, 'published', 0)
on conflict (slug) do update set cover_image = excluded.cover_image, gallery = excluded.gallery;`);
  }
} else {
  out.push(`delete from public.gallery_images where source = ${q(SOURCE)};`);
  if (rows.length) out.push(`insert into public.gallery_images (group_key, image, thumb, alt, width, height, source, sort_order) values\n  ${rows.join(',\n  ')};`);
}
if (media.length) {
  out.push(`insert into public.media_files (path, original_name, mime_type, size_bytes, width, height, alt_text) values\n  ${media.join(',\n  ')}\non conflict (path) do update set size_bytes = excluded.size_bytes, width = excluded.width, height = excluded.height, alt_text = excluded.alt_text;`);
}
out.push('commit;');
writeFileSync(SQL_OUT, out.join('\n') + '\n');
console.log(`รวม ${n} รูป`);
NODE_EOF

echo "▶ เตรียมตัวโหลดไฟล์จาก Google Drive (ครั้งแรก 1-2 นาที)…"
docker pull -q "$PY_IMG" >/dev/null
TOTAL=0
for row in "${FOLDERS[@]}"; do
  IFS='|' read -r KEY ID ALT <<<"$row"
  echo; echo "▶ $ALT"
  mkdir -p "$TMP/$KEY"
  # โหลดจาก Drive (ลองซ้ำได้ 3 รอบ เผื่อ Google จำกัดการโหลดชั่วคราว · --continue = ข้ามไฟล์ที่ได้แล้ว)
  for TRY in 1 2 3; do
    docker run --rm -v "$TMP":/w "$PY_IMG" sh -c \
      "pip install -q --disable-pip-version-check --root-user-action=ignore gdown >/dev/null 2>&1 && gdown --folder --continue 'https://drive.google.com/drive/folders/$ID' -O '/w/$KEY'" \
      > "$TMP/$KEY.log" 2>&1 || true
    GOT=$(find "$TMP/$KEY" -type f -size +1k 2>/dev/null | wc -l)
    LISTED=$(grep -c '^- ' "$TMP/$KEY.log" || true)
    if [ "$LISTED" -gt 0 ]; then echo "  รอบ $TRY: ได้ $GOT จาก $LISTED ไฟล์"; else echo "  รอบ $TRY: ได้ $GOT ไฟล์"; fi
    if [ "$GOT" -gt 0 ] && { [ "$LISTED" -eq 0 ] || [ "$GOT" -ge "$LISTED" ]; }; then break; fi
    [ "$TRY" -lt 3 ] && { echo "  รอ 30 วินาทีแล้วลองใหม่…"; sleep 30; }
  done
  if [ "$GOT" -eq 0 ]; then
    echo "  ── ข้อความจาก Google Drive ──"; grep -v '^- ' "$TMP/$KEY.log" | grep -Ev '%\|' | tail -25 | sed 's/^/  /'
  fi
  CNT=$(find "$TMP/$KEY" -type f | grep -Eic '\.(jpe?g|jfif|jpe|png|webp|tiff?|avif|heic|heif|gif|bmp)$' || true)
  if [ "$CNT" -eq 0 ]; then
    ALLF=$(find "$TMP/$KEY" -type f | wc -l)
    echo "✖ ไม่พบไฟล์รูปในโฟลเดอร์ (ได้ไฟล์อื่น $ALLF ไฟล์)"
    find "$TMP/$KEY" -type f | sed "s|$TMP/$KEY/|    · |" | head -20
    echo "  ตรวจว่าแชร์โฟลเดอร์เป็น \"ทุกคนที่มีลิงก์ (Anyone with the link)\" และในโฟลเดอร์เป็นไฟล์รูป (JPG/PNG) แล้วรันใหม่"
    continue
  fi
  echo "  ได้ $CNT ไฟล์ · กำลังย่อรูป…"
  find "$TMP/$KEY" -type f -name '*.*' -exec chmod 644 {} +
  SHARP_FROM=/opt/ikssa-web/package.json node "$TMP/process.mjs" "$TMP/$KEY" "$MEDIA_DIR" "$KEY" "drive:$ID" "$ALT" "$STAMP" "$TMP/$KEY.sql"
  docker exec -i iks-web-db psql -q -U iks_owner -d iks_web -v ON_ERROR_STOP=1 < "$TMP/$KEY.sql"
  # ลบไฟล์รูปชุดเก่าของโฟลเดอร์นี้ (รอบก่อน)
  find "$MEDIA_DIR/$GALLERY_DIR" -maxdepth 1 -name "$KEY-*.webp" ! -name "$KEY-$STAMP-*" -delete 2>/dev/null || true
  TOTAL=$((TOTAL + CNT))
done
chmod 755 "$MEDIA_DIR/gallery" "$MEDIA_DIR/$GALLERY_DIR" 2>/dev/null || true
chmod 644 "$MEDIA_DIR/$GALLERY_DIR"/*.webp 2>/dev/null || true

if [ "$TOTAL" -eq 0 ]; then echo; echo "✖ ยังไม่ได้รูปเลย — ดูข้อความด้านบน"; exit 1; fi
echo
docker exec iks-web-db psql -q -U iks_owner -d iks_web -c "select title as กิจกรรม, 1 + jsonb_array_length(gallery) as จำนวนรูป from public.activities where slug = '$ACTIVITY_SLUG'"
echo "✔ เสร็จแล้ว — ดูได้ที่ $SITE/activities#$ACTIVITY_SLUG"
echo "  แก้ชื่อ / คำอธิบาย / ลำดับ: หลังบ้าน → กิจกรรม"
