#!/usr/bin/env bash
# =====================================================================
#  IKS Website (ikssa.io) — ติดตั้ง/อัปเดตเว็บบน VPS
#  รัน:  bash /root/deploy_web.sh
#
#  ครั้งแรก : แตกโค้ด → build → รันด้วย pm2 (พอร์ต 3100) → ตั้ง Nginx + SSL ให้ ikssa.io / www.ikssa.io
#  ครั้งต่อไป: แตกโค้ดเวอร์ชันใหม่ → build → reload (ไม่แตะ Nginx/SSL ที่ตั้งไว้แล้ว)
#
#  ไม่แตะ stock / requisition / ฐานข้อมูล
# =====================================================================
# ต้องรันด้วย "bash ไฟล์" (ถ้าใช้ source/. จะอ่านไฟล์ตัวเองไม่ได้ และอาจปิดหน้าต่าง console)
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then
  echo "✖ กรุณารันด้วยคำสั่ง:  bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1
fi
set -euo pipefail
SELF="$(readlink -f "${BASH_SOURCE[0]:-$0}")"

APP_DIR=/opt/ikssa-web
WEB_VERSION=__WEB_VERSION__
CONF_DIR=/root/iks-web
PM2_NAME=ikssa-web
PORT=3100
DOMAIN=ikssa.io
NGINX_SITE=/etc/nginx/sites-enabled/ikssa.io

say()  { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31m✖ %s\033[0m\n' "$*"; exit 1; }
okay() { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }

[ "$(id -u)" = 0 ] || die "ต้องรันด้วย root"
[ -f "$CONF_DIR/db.env" ] || die "ไม่พบ $CONF_DIR/db.env (ต้องรัน setup_db.sh ก่อน)"
command -v node >/dev/null || die "ไม่พบ node"
command -v pm2  >/dev/null || die "ไม่พบ pm2"
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 18 ] || die "ต้องใช้ Node 18 ขึ้นไป (ตอนนี้ $(node -v))"

# ---------- 1) แตกโค้ด ----------
say "1/5 แตกโค้ดเว็บไปที่ $APP_DIR"
NEW_DIR=$(mktemp -d /opt/ikssa-web.new.XXXX)
trap 'rm -rf "$NEW_DIR"' ERR   # build ล้ม: ลบโฟลเดอร์ใหม่ทิ้ง เว็บเดิมยังทำงานต่อ
sed -n '/^__ARCHIVE_BELOW__$/,$p' "$SELF" | tail -n +2 | base64 -d | tar -xz -C "$NEW_DIR"
okay "แตกไฟล์แล้ว ($(find "$NEW_DIR" -type f | wc -l) ไฟล์)"

# ---------- 2) ไฟล์ตั้งค่า ----------
say "2/5 เตรียมไฟล์ตั้งค่า"
# PREVIEW_TOKEN สร้างครั้งเดียวแล้วใช้ต่อ / SITE_MODE เก็บค่าเดิมไว้
[ -f "$CONF_DIR/preview_token" ] || { openssl rand -hex 20 > "$CONF_DIR/preview_token"; chmod 600 "$CONF_DIR/preview_token"; }
[ -f "$CONF_DIR/site_mode" ]     || echo prelaunch > "$CONF_DIR/site_mode"
PREVIEW_TOKEN=$(cat "$CONF_DIR/preview_token")
SITE_MODE=$(cat "$CONF_DIR/site_mode")
umask 077
{
  grep -E '^(DATABASE_URL_PUBLIC|DATABASE_URL_ADMIN|MEDIA_DIR)=' "$CONF_DIR/db.env"
  echo "MEDIA_PUBLIC_URL=/media"
  echo "PREVIEW_TOKEN=$PREVIEW_TOKEN"
  echo "SITE_MODE=$SITE_MODE"
  echo "NEXT_TELEMETRY_DISABLED=1"
  # Google Maps (คะแนน/รีวิว + ค้นหาสาขาในหลังบ้าน) — ไม่มีไฟล์ = ปิดฟีเจอร์นี้
  [ -s "$CONF_DIR/google_maps_key" ] && echo "GOOGLE_MAPS_API_KEY=$(tr -d '[:space:]' < "$CONF_DIR/google_maps_key")"
  # โดเมนหลัก (เปลี่ยนโดเมนได้ด้วย ikssa_domain.sh) — ไม่มีไฟล์ = https://ikssa.io
  [ -s "$CONF_DIR/site_url" ] && echo "SITE_URL=$(tr -d '[:space:]' < "$CONF_DIR/site_url")"
  # แจ้งเตือนลูกค้าใหม่เข้า LINE / n8n (ตั้งด้วย ikssa_lead_notify.sh)
  [ -s "$CONF_DIR/line_channel_token" ]  && echo "LINE_CHANNEL_TOKEN=$(tr -d '[:space:]' < "$CONF_DIR/line_channel_token")"
  [ -s "$CONF_DIR/line_channel_secret" ] && echo "LINE_CHANNEL_SECRET=$(tr -d '[:space:]' < "$CONF_DIR/line_channel_secret")"
  [ -s "$CONF_DIR/lead_webhook_url" ]    && echo "LEAD_WEBHOOK_URL=$(tr -d '[:space:]' < "$CONF_DIR/lead_webhook_url")"
  true
} > "$NEW_DIR/.env.production"
umask 022
okay "SITE_MODE=$SITE_MODE"
if [ -s "$CONF_DIR/google_maps_key" ]; then okay "Google Maps API key: มี"; else printf '\033[1;33m! ยังไม่มี Google Maps API key — รีวิว/ค้นหาสาขาจาก Google จะยังไม่แสดง\033[0m\n'; fi

echo "$WEB_VERSION" > "$NEW_DIR/.ikssa_version"

# ---------- สำรองข้อมูลก่อนอัปเดต (กู้คืนได้ด้วย ikssa_backup.sh --restore-db / --restore-app) ----------
say "สำรองข้อมูลก่อนอัปเดต"
if [ -f /root/ikssa_backup.sh ]; then
  bash /root/ikssa_backup.sh --pre-install || { rm -rf "$NEW_DIR"; die "สำรองข้อมูลไม่สำเร็จ — หยุดติดตั้งเพื่อความปลอดภัย (เว็บเดิมยังทำงานต่อ)"; }
else
  BK="/root/backups/ikssa/$(date +%Y%m%d-%H%M%S)-pre-install"; mkdir -p "$BK"; chmod 700 /root/backups /root/backups/ikssa "$BK"
  docker exec iks-web-db pg_dump -U iks_owner -d iks_web -Fc --no-owner > "$BK/db.dump" \
    || { rm -rf "$NEW_DIR"; die "สำรองฐานข้อมูลไม่สำเร็จ — หยุดติดตั้งเพื่อความปลอดภัย (เว็บเดิมยังทำงานต่อ)"; }
  [ -d "$APP_DIR" ] && tar -czf "$BK/app.tar.gz" --exclude=./node_modules --exclude=./.next/cache -C "$APP_DIR" .
  printf 'created=%s\ntag=pre-install\nweb_version=%s\n' "$(date -Iseconds)" "$(cat "$APP_DIR/.ikssa_version" 2>/dev/null || echo unknown)" > "$BK/INFO"
  (cd "$BK" && sha256sum ./* > SHA256SUMS); ln -sfn "$BK" /root/backups/ikssa/latest
  okay "สำรองแล้ว: $BK"
fi

# ---------- อัปเดตฐานข้อมูล (migration รันซ้ำได้) ----------
if ls "$NEW_DIR"/db-migrations/*.sql >/dev/null 2>&1; then
  for f in "$NEW_DIR"/db-migrations/*.sql; do
    docker exec -i iks-web-db psql -q -U iks_owner -d iks_web -v ON_ERROR_STOP=1 < "$f" \
      || { rm -rf "$NEW_DIR"; die "อัปเดตฐานข้อมูลไม่สำเร็จ ($(basename "$f")) — เว็บเดิมยังทำงานต่อ"; }
  done
  okay "อัปเดตฐานข้อมูลแล้ว"
fi

# ---------- 3) ติดตั้ง + build ----------
say "3/5 ติดตั้งแพ็กเกจและ build (ประมาณ 2-4 นาที)"
cd "$NEW_DIR"
npm ci --no-audit --no-fund --loglevel=error
NEXT_TELEMETRY_DISABLED=1 npx next build
okay "build สำเร็จ"

# สลับโฟลเดอร์: เก็บเวอร์ชันก่อนหน้าไว้ 1 ชุด
if [ -d "$APP_DIR" ]; then rm -rf "$APP_DIR.prev"; mv "$APP_DIR" "$APP_DIR.prev"; fi
mv "$NEW_DIR" "$APP_DIR"
cd "$APP_DIR"

# ---------- 4) รันด้วย pm2 ----------
say "4/5 รันเว็บด้วย pm2 ($PM2_NAME พอร์ต $PORT)"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 delete "$PM2_NAME" >/dev/null
fi
sleep 1
if command -v ss >/dev/null && [ -n "$(ss -tlnH "sport = :$PORT")" ]; then
  die "พอร์ต $PORT ถูกโปรแกรมอื่นใช้อยู่ — ดูด้วย: ss -tlnp | grep $PORT"
fi
pm2 start npm --name "$PM2_NAME" --cwd "$APP_DIR" --max-memory-restart 600M -- start >/dev/null
pm2 save >/dev/null
# ให้ pm2 เปิดเว็บเองหลังรีบูตเครื่อง
systemctl is-enabled pm2-root >/dev/null 2>&1 || pm2 startup systemd -u root --hp /root >/dev/null
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/robots.txt" || true)
  [ "$code" = 200 ] && break
  sleep 1
done
[ "${code:-}" = 200 ] || { pm2 logs "$PM2_NAME" --lines 40 --nostream; die "เว็บไม่ตอบที่พอร์ต $PORT"; }
okay "เว็บรันแล้ว"

# ---------- 5) Nginx + SSL (ครั้งแรกเท่านั้น) ----------
say "5/5 เว็บเซิร์ฟเวอร์ + SSL"
if systemctl is-active --quiet apache2; then
  # เครื่องนี้ใช้ Apache เป็นหลัก (stock / dashboard อยู่บน Apache) — ไม่ยุ่งกับ nginx
  if [ -f /etc/apache2/sites-enabled/ikssa.io.conf ]; then
    okay "Apache มี ikssa.io อยู่แล้ว ไม่แก้ไข"
  else
    printf '\033[1;33m! Apache ยังไม่มี ikssa.io — ต้องเพิ่ม vhost ก่อนเว็บจะเปิดได้\033[0m\n'
  fi
elif [ ! -f "$NGINX_SITE" ]; then
  cat > "$NGINX_SITE" <<NGINX_EOF
# ikssa.io — เว็บบริษัท (Next.js ที่พอร์ต $PORT)
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 12M;

    # รูปที่อัปโหลดจากหลังบ้าน
    location /media/ {
        alias /var/www/ikssa-media/;
        try_files \$uri =404;
        expires 30d;
        add_header Cache-Control "public";
        add_header X-Content-Type-Options "nosniff";
        access_log off;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:$PORT;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}
NGINX_EOF
  if ! nginx -t 2>/dev/null; then
    rm -f "$NGINX_SITE"; nginx -t || true
    die "ตั้งค่า Nginx ไม่ผ่าน — ลบไฟล์ที่เพิ่งสร้างแล้ว เว็บอื่นไม่กระทบ"
  fi
  systemctl reload nginx
  okay "Nginx: $DOMAIN, www.$DOMAIN → พอร์ต $PORT"

  if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --redirect; then
    okay "SSL พร้อม (https)"
  else
    printf '\033[1;33m! ขอ SSL ไม่สำเร็จ (DNS อาจยังไม่อัปเดต) เว็บใช้ผ่าน http ได้ก่อน\n  ลองใหม่ภายหลังด้วย: certbot --nginx -d %s -d www.%s --redirect\033[0m\n' "$DOMAIN" "$DOMAIN"
  fi
else
  okay "มีการตั้งค่า Nginx อยู่แล้ว ไม่แก้ไข"
fi

# ---------- สรุป ----------
SHOW_URL=$(tr -d '[:space:]' < "$CONF_DIR/site_url" 2>/dev/null || true); SHOW_URL=${SHOW_URL:-https://$DOMAIN}
printf '\n\033[1;32m✔ เสร็จแล้ว\033[0m\n'
printf 'เว็บ:          %s  (โหมด %s)\n' "$SHOW_URL" "$SITE_MODE"
printf 'ลิงก์พรีวิว:    %s/preview?token=%s\n' "$SHOW_URL" "$PREVIEW_TOKEN"
printf '               (เปิดลิงก์นี้เพื่อดูเว็บพร้อมข้อมูลตัวอย่าง — ส่งให้เฉพาะทีมงาน)\n'
printf 'ดู log:        pm2 logs %s\n\n' "$PM2_NAME"
exit 0
