#!/usr/bin/env bash
# IKS Website — สำรองข้อมูลทั้งหมดบนเซิร์ฟเวอร์ และกู้คืน
#
#   bash /root/ikssa_backup.sh                 สำรองตอนนี้ (ฐานข้อมูล + รูป/ไฟล์ที่อัปโหลด + ตั้งค่า + เว็บเวอร์ชันที่ใช้อยู่)
#   bash /root/ikssa_backup.sh --list          ดูรายการที่สำรองไว้
#   bash /root/ikssa_backup.sh --auto          ตั้งให้สำรองอัตโนมัติทุกวัน ตี 3 (เก็บย้อนหลัง 14 วัน)
#   bash /root/ikssa_backup.sh --restore-db  <ชื่อชุด>   กู้ "ข้อมูลในหลังบ้าน" กลับไปเหมือนวันนั้น
#   bash /root/ikssa_backup.sh --restore-app <ชื่อชุด>   กู้ "หน้าตาเว็บ/โค้ด" กลับไปเวอร์ชันของวันนั้น
#   bash /root/ikssa_backup.sh --restore-media <ชื่อชุด> กู้รูป/ไฟล์ที่อัปโหลด
#
# ทุกครั้งก่อนกู้คืน สคริปต์จะสำรองสถานะปัจจุบันไว้ก่อนเสมอ (ย้อนกลับได้อีกที)
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then echo "กรุณารันด้วย: bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1; fi
set -euo pipefail

BK_ROOT=${BK_ROOT:-/root/backups/ikssa}
KEEP_DAYS=${KEEP_DAYS:-14}
APP_DIR=/opt/ikssa-web
CONF_DIR=/root/iks-web
PM2_NAME=ikssa-web
DB_CT=iks-web-db
MEDIA_DIR=$(grep -E '^MEDIA_DIR=' "$CONF_DIR/db.env" 2>/dev/null | cut -d= -f2- || true)
MEDIA_DIR=${MEDIA_DIR:-/var/www/ikssa-media}

say()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
okay() { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✖ %s\033[0m\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || die "ต้องรันด้วย root"
mkdir -p "$BK_ROOT"; chmod 700 "$BK_ROOT"

backup() { # $1 = ป้ายชื่อ (daily / manual / pre-install / pre-restore)
  local tag=${1:-manual} ts dir
  ts=$(date +%Y%m%d-%H%M%S); dir="$BK_ROOT/$ts-$tag"
  mkdir -p "$dir"
  say "สำรองข้อมูล → $dir"

  # 1) ฐานข้อมูล (ทุกอย่างที่แก้ในหลังบ้าน: หน้าเว็บ รุ่นรถ ราคา โปร Lead ตั้งค่า Community ฯลฯ)
  docker exec "$DB_CT" pg_dump -U iks_owner -d iks_web -Fc --no-owner > "$dir/db.dump" \
    || { rm -rf "$dir"; die "สำรองฐานข้อมูลไม่สำเร็จ (docker $DB_CT ทำงานอยู่ไหม?)"; }
  docker exec "$DB_CT" pg_dumpall -U iks_owner --globals-only > "$dir/db-roles.sql" 2>/dev/null || true
  okay "ฐานข้อมูล $(du -h "$dir/db.dump" | cut -f1)"

  # 2) รูป/คลิป/ไฟล์ที่อัปโหลด (ไฟล์ใหญ่: ชุดอัตโนมัติเก็บสัปดาห์ละครั้งวันอาทิตย์ · ก่อนติดตั้งเว็บไม่ต้องเก็บ เพราะติดตั้งไม่แตะรูป)
  local want_media=1
  [ "$tag" = pre-install ] && want_media=0
  [ "$tag" = daily ] && [ "$(date +%u)" != 7 ] && want_media=0
  if [ "$want_media" = 0 ]; then echo "  (ข้ามรูป — ชุดนี้เก็บเฉพาะข้อมูลและโค้ด)"
  elif [ -d "$MEDIA_DIR" ]; then
    local free_kb need_kb
    free_kb=$(df -Pk "$BK_ROOT" | awk 'NR==2{print $4}'); need_kb=$(du -sk "$MEDIA_DIR" | cut -f1)
    if [ "$free_kb" -lt $((need_kb + 1048576)) ]; then warn "พื้นที่เหลือน้อย ข้ามการเก็บรูป (ต้องการ $((need_kb/1024)) MB + เผื่อ 1 GB)"; else
    tar -czf "$dir/media.tar.gz" -C "$(dirname "$MEDIA_DIR")" "$(basename "$MEDIA_DIR")"
    okay "รูปและไฟล์ $(du -h "$dir/media.tar.gz" | cut -f1)"; fi
  else warn "ไม่พบโฟลเดอร์รูป $MEDIA_DIR"; fi

  # 3) ตั้งค่า (รหัสต่าง ๆ, โดเมน, Apache, SSL)
  tar -czf "$dir/config.tar.gz" --ignore-failed-read \
    "$CONF_DIR" /etc/apache2/sites-available /etc/apache2/sites-enabled /etc/letsencrypt 2>/dev/null || true
  okay "ตั้งค่า $(du -h "$dir/config.tar.gz" | cut -f1)"

  # 4) โค้ดเว็บเวอร์ชันที่ใช้อยู่ (ไม่รวม node_modules — ตอนกู้จะติดตั้งใหม่)
  if [ -d "$APP_DIR" ]; then
    tar -czf "$dir/app.tar.gz" --exclude=./node_modules --exclude=./.next/cache -C "$APP_DIR" .
    okay "โค้ดเว็บ $(du -h "$dir/app.tar.gz" | cut -f1)"
  fi

  {
    echo "created=$(date -Iseconds)"; echo "tag=$tag"; echo "host=$(hostname)"
    echo "site_url=$(tr -d '[:space:]' < "$CONF_DIR/site_url" 2>/dev/null || true)"
    echo "web_version=$(cat "$APP_DIR/.ikssa_version" 2>/dev/null || echo unknown)"
  } > "$dir/INFO"
  (cd "$dir" && sha256sum ./* > SHA256SUMS)
  chmod -R go-rwx "$dir"
  ln -sfn "$dir" "$BK_ROOT/latest"
  okay "เสร็จ: $(du -sh "$dir" | cut -f1) · $(basename "$dir")"

  # ลบชุดอัตโนมัติที่เก่ากว่า KEEP_DAYS วัน (ชุด manual / pre-install / pre-restore เก็บไว้จนกว่าจะลบเอง)
  find "$BK_ROOT" -maxdepth 1 -type d -name '*-daily' -mtime +"$KEEP_DAYS" -exec rm -rf {} + 2>/dev/null || true
  # ชุดก่อนติดตั้งเว็บ เก็บล่าสุด 10 ชุด
  ls -1d "$BK_ROOT"/*-pre-install 2>/dev/null | sort | head -n -10 | xargs -r rm -rf
  LAST_DIR=$dir
}

pick() { # หาโฟลเดอร์จากชื่อชุด (หรือ latest)
  local n=${1:-}; [ -n "$n" ] || die "ระบุชื่อชุด (ดูด้วย --list)"
  local d="$BK_ROOT/$n"; [ "$n" = latest ] && d=$(readlink -f "$BK_ROOT/latest")
  [ -d "$d" ] || die "ไม่พบชุด $n"
  (cd "$d" && sha256sum -c --quiet SHA256SUMS) || die "ไฟล์ในชุด $n เสียหาย"
  echo "$d"
}

confirm() {
  printf '\033[1;33m%s\033[0m\nพิมพ์ YES เพื่อยืนยัน: ' "$1"; read -r ans
  [ "$ans" = YES ] || die "ยกเลิก"
}

case "${1:-}" in
  ""|--now) backup manual ;;
  --daily) backup daily ;;
  --pre-install) backup pre-install ;;
  --list)
    say "ชุดสำรองใน $BK_ROOT"
    for d in $(ls -1d "$BK_ROOT"/*/ 2>/dev/null | sort); do
      n=$(basename "$d"); [ "$n" = latest ] && continue
      printf '  %-34s %6s  เว็บ %-5s %s\n' "$n" "$(du -sh "$d" | cut -f1)" "$(grep '^web_version=' "$d/INFO" 2>/dev/null | cut -d= -f2)" "$([ -f "$d/media.tar.gz" ] && echo '+รูป')"
    done
    df -h "$BK_ROOT" | tail -1 | awk '{print "\n  พื้นที่ว่างบนเครื่อง: "$4}'
    ;;
  --auto)
    install -m 700 "$(readlink -f "$0")" /root/ikssa_backup.sh 2>/dev/null || true
    echo "0 3 * * * root /bin/bash /root/ikssa_backup.sh --daily >> /var/log/ikssa-backup.log 2>&1" > /etc/cron.d/ikssa-backup
    chmod 644 /etc/cron.d/ikssa-backup
    okay "ตั้งสำรองอัตโนมัติทุกวัน 03:00 แล้ว (เก็บ $KEEP_DAYS วัน) · log: /var/log/ikssa-backup.log"
    backup manual
    ;;
  --restore-db)
    d=$(pick "${2:-}")
    confirm "จะแทนที่ข้อมูลในหลังบ้านทั้งหมดด้วยข้อมูลของชุด $(basename "$d") (Lead ที่เข้ามาหลังจากนั้นจะหาย แต่มีสำรองก่อนกู้ให้)"
    backup pre-restore
    say "กู้ฐานข้อมูลจาก $(basename "$d")"
    docker cp "$d/db.dump" "$DB_CT:/tmp/restore.dump"
    docker exec "$DB_CT" pg_restore -U iks_owner -d iks_web --clean --if-exists --no-owner -1 /tmp/restore.dump \
      || die "กู้ไม่สำเร็จ — ข้อมูลเดิมยังอยู่ (กู้แบบ all-or-nothing) · ชุดก่อนกู้: $(basename "$LAST_DIR")"
    docker exec "$DB_CT" rm -f /tmp/restore.dump
    pm2 restart "$PM2_NAME" >/dev/null 2>&1 || true
    okay "กู้ข้อมูลแล้ว · ถ้าต้องการย้อนกลับ: bash /root/ikssa_backup.sh --restore-db $(basename "$LAST_DIR")"
    ;;
  --restore-app)
    d=$(pick "${2:-}")
    [ -f "$d/app.tar.gz" ] || die "ชุดนี้ไม่มีโค้ดเว็บ"
    confirm "จะเปลี่ยนหน้าตาเว็บ/โค้ด กลับเป็นเวอร์ชันของชุด $(basename "$d") ($(grep '^web_version=' "$d/INFO" | cut -d= -f2))"
    backup pre-restore
    NEW=$(mktemp -d /opt/ikssa-web.restore.XXXX)
    tar -xzf "$d/app.tar.gz" -C "$NEW"
    cp "$APP_DIR/.env.production" "$NEW/.env.production" 2>/dev/null || true
    say "ติดตั้งแพ็กเกจและ build (2-4 นาที)"
    (cd "$NEW" && npm ci --no-audit --no-fund --loglevel=error && NEXT_TELEMETRY_DISABLED=1 npx next build) \
      || { rm -rf "$NEW"; die "build ไม่สำเร็จ — เว็บเดิมยังทำงานต่อ"; }
    rm -rf "$APP_DIR.prev"; mv "$APP_DIR" "$APP_DIR.prev"; mv "$NEW" "$APP_DIR"
    pm2 restart "$PM2_NAME" >/dev/null
    okay "เว็บกลับเป็นเวอร์ชันของชุด $(basename "$d") แล้ว (ข้อมูลในหลังบ้านไม่ถูกแตะ)"
    ;;
  --restore-media)
    d=$(pick "${2:-}")
    [ -f "$d/media.tar.gz" ] || die "ชุดนี้ไม่มีรูป (ชุดอัตโนมัติเก็บรูปเฉพาะวันอาทิตย์ · ดูชุดที่มีรูปด้วย --list)"
    confirm "จะแทนที่โฟลเดอร์รูป $MEDIA_DIR ด้วยของชุด $(basename "$d")"
    backup pre-restore
    mv "$MEDIA_DIR" "$MEDIA_DIR.before-restore-$(date +%s)"
    tar -xzf "$d/media.tar.gz" -C "$(dirname "$MEDIA_DIR")"
    okay "กู้รูปแล้ว (ของเดิมเก็บไว้ที่ $MEDIA_DIR.before-restore-*)"
    ;;
  *) sed -n '2,12p' "$0"; exit 1 ;;
esac
