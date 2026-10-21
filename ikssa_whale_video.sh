#!/usr/bin/env bash
# IKS Website — โหลดคลิปแนะนำ Happy Whale จาก Google Drive → แปลงให้เล่นบนเว็บ + ภาพปก → ใส่ในหน้า Happy Whale
# รัน:  bash /root/ikssa_whale_video.sh [GOOGLE_DRIVE_FILE_ID]
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then echo "กรุณารันด้วย: bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1; fi
set -euo pipefail
ID=${1:-1XdLhPcInjiZn6DXar0phYOyzsI1W0fSU}
MEDIA_DIR=${MEDIA_DIR:-/var/www/ikssa-media}
FFMPEG_IMG=jrottenberg/ffmpeg:6.1-ubuntu
TMP=$(mktemp -d /root/iks-web/video.XXXX 2>/dev/null || mktemp -d); trap 'rm -rf "$TMP"' EXIT
STAMP=$(date +%Y%m%d%H%M)
OUT_V="videos/whale-intro-$STAMP.mp4"; OUT_P="videos/whale-intro-$STAMP.jpg"
mkdir -p "$MEDIA_DIR/videos"

# ---------- 1) ดาวน์โหลด ----------
if [ -n "${SRC_FILE:-}" ]; then cp "$SRC_FILE" "$TMP/in.mp4"; else
  echo "▶ ดาวน์โหลดคลิปจาก Google Drive…"
  curl -fsSL --retry 2 -o "$TMP/in.mp4" "https://drive.usercontent.google.com/download?id=$ID&export=download&confirm=t" \
    || { echo "✖ ดาวน์โหลดไม่สำเร็จ"; exit 1; }
fi
SIZE=$(stat -c %s "$TMP/in.mp4")
if [ "$SIZE" -lt 200000 ] || head -c 600 "$TMP/in.mp4" | grep -qi '<html\|<!doctype'; then
  echo "✖ ได้หน้าเว็บแทนไฟล์วิดีโอ — ตั้งค่าแชร์ไฟล์ใน Google Drive เป็น \"ทุกคนที่มีลิงก์ (Anyone with the link)\" แล้วรันใหม่"
  exit 1
fi
echo "✔ ได้ไฟล์ $(numfmt --to=iec "$SIZE")"

# ---------- 2) แปลงไฟล์ให้เล่นบนเว็บ ----------
ff() { if [ -n "${FFMPEG_LOCAL:-}" ]; then (cd "$TMP" && ffmpeg "$@"); else docker run --rm -v "$TMP":/w -w /w "$FFMPEG_IMG" "$@"; fi; }
fp() { if [ -n "${FFMPEG_LOCAL:-}" ]; then (cd "$TMP" && ffprobe "$@"); else docker run --rm --entrypoint ffprobe -v "$TMP":/w -w /w "$FFMPEG_IMG" "$@"; fi; }
echo "▶ แปลงไฟล์ (1-3 นาที)…"
if [ -z "${FFMPEG_LOCAL:-}" ]; then docker pull -q "$FFMPEG_IMG" >/dev/null 2>&1 || true; fi
if ff -y -loglevel error -i in.mp4 -vf "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset medium -crf 22 -maxrate 5M -bufsize 10M \
      -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart out.mp4 \
   && ff -y -loglevel error -ss 1 -i out.mp4 -frames:v 1 -q:v 3 poster.jpg; then
  cp "$TMP/out.mp4" "$MEDIA_DIR/$OUT_V"; cp "$TMP/poster.jpg" "$MEDIA_DIR/$OUT_P"
  echo "✔ แปลงแล้ว $(numfmt --to=iec "$(stat -c %s "$TMP/out.mp4")")"
else
  echo "! แปลงไฟล์ไม่ได้ ใช้ไฟล์ต้นฉบับแทน"
  cp "$TMP/in.mp4" "$MEDIA_DIR/$OUT_V"; OUT_P=""
fi
chmod 644 "$MEDIA_DIR"/videos/*; chmod 755 "$MEDIA_DIR/videos"
DIM=$(fp -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 out.mp4 2>/dev/null \
   || fp -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 in.mp4 2>/dev/null || true)
DIM=$(printf '%s' "$DIM" | head -1 | tr -d '\r ')
W=${DIM%%x*}; H=${DIM##*x}; VERT=false
if [ -n "$W" ] && [ -n "$H" ] && [ "$H" -gt "$W" ] 2>/dev/null; then VERT=true; fi
echo "✔ ขนาดคลิป ${DIM:-?} (แนวตั้ง: $VERT)"

# ---------- 3) ใส่ในหน้า Happy Whale ----------
docker exec -i iks-web-db psql -q -U iks_owner -d iks_web -v ON_ERROR_STOP=1 <<SQL
update public.page_sections
   set video_url = '/media/$OUT_V'${OUT_P:+, image = '$OUT_P'},
       data = coalesce(data, '{}'::jsonb) || jsonb_build_object('vertical', $VERT),
       status = 'published', is_visible = true
 where page_slug = 'happy-whale' and section_key = 'video';
\pset footer off
select section_key, video_url, image, data from public.page_sections where page_slug = 'happy-whale' and section_key = 'video';
SQL
echo; echo "✔ เสร็จแล้ว — ดูได้ที่ https://ikssa.io/happy-whale"
