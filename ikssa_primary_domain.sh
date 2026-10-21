#!/usr/bin/env bash
# IKS Website — เปลี่ยนโดเมนหลักของเว็บ (เช่น isuzukrungthep.com) ให้ช่อง URL แสดงชื่อนี้ และ ikssa.io ส่งต่อมาแบบ 301
#
# ขั้นตอน (รันได้ซ้ำ ปลอดภัย):
#   รอบ 1 — ก่อนแก้ DNS:  bash /root/ikssa_primary_domain.sh     → เตรียมเซิร์ฟเวอร์ให้รับโดเมนใหม่ไว้ก่อน
#   แก้ DNS:  A record ของ @ และ www → IP เซิร์ฟเวอร์นี้
#   รอบ 2 — หลัง DNS ชี้มาแล้ว: bash /root/ikssa_primary_domain.sh → ขอ SSL + เปลี่ยนโดเมนหลัก (ikssa.io ยังเปิดได้ปกติ)
#   รอบ 3 — อีก 24 ชม. (ให้ DNS ทั่วโลกลืมค่าเก่า กันวนไม่รู้จบ): bash /root/ikssa_primary_domain.sh --redirect-old
# ย้อนกลับ: bash /root/ikssa_primary_domain.sh --rollback
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then echo "กรุณารันด้วย: bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1; fi
set -euo pipefail

NEW=${NEW_DOMAIN:-isuzukrungthep.com}
OLD=${OLD_DOMAIN:-ikssa.io}
PORT=${PORT:-3100}
MEDIA=${MEDIA_DIR:-/var/www/ikssa-media}
CONF_DIR=${CONF_DIR:-/root/iks-web}
APP_DIR=${APP_DIR:-/opt/ikssa-web}
PM2_NAME=${PM2_NAME:-ikssa-web}
AV=/etc/apache2/sites-available
BK=$CONF_DIR/apache-backup

say()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
okay() { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✖ %s\033[0m\n' "$*"; exit 1; }

[ "$(id -u)" = 0 ] || die "ต้องรันด้วย root"
systemctl is-active --quiet apache2 || die "Apache ไม่ได้ทำงานอยู่"
mkdir -p "$BK"

set_site_url() {
  echo "$1" > "$CONF_DIR/site_url"
  if [ -f "$APP_DIR/.env.production" ]; then
    sed -i '/^SITE_URL=/d' "$APP_DIR/.env.production"
    echo "SITE_URL=$1" >> "$APP_DIR/.env.production"
    pm2 restart "$PM2_NAME" --update-env >/dev/null && okay "เว็บรีสตาร์ตแล้ว (SITE_URL=$1)"
  fi
}

reload_or_restore() {
  if apache2ctl configtest >/dev/null 2>&1; then systemctl reload apache2; return 0; fi
  apache2ctl configtest || true
  warn "ตั้งค่า Apache ไม่ผ่าน — คืนค่าเดิม"
  for f in "$BK"/*.conf; do [ -e "$f" ] && cp "$f" "$AV/"; done
  apache2ctl configtest >/dev/null 2>&1 && systemctl reload apache2
  die "ยกเลิกแล้ว เว็บกลับเป็นแบบเดิม"
}

# ---------- ย้อนกลับ ----------
if [ "${1:-}" = "--rollback" ]; then
  say "ย้อนกลับเป็น $OLD"
  if ls "$BK"/*.conf >/dev/null 2>&1; then
    for f in "$BK"/*.conf; do cp "$f" "$AV/"; okay "คืนค่า $(basename "$f")"; done
    reload_or_restore
  fi
  set_site_url "https://$OLD"
  okay "ย้อนกลับเรียบร้อย — เว็บหลักกลับเป็น https://$OLD"
  exit 0
fi

# ---------- 1) vhost สำหรับโดเมนใหม่ (เตรียมไว้ก่อนแก้ DNS) ----------
say "1/4 เตรียม Apache สำหรับ $NEW"
NEWCONF="$AV/$NEW.conf"
if [ ! -f "$NEWCONF" ]; then
  cat > "$NEWCONF" <<EOF
# $NEW — เว็บบริษัท (Next.js ที่พอร์ต $PORT) สร้างโดย ikssa_primary_domain.sh
<VirtualHost *:80>
    ServerName $NEW
    ServerAlias www.$NEW
    ProxyPreserveHost On
    ProxyRequests Off
    LimitRequestBody 13000000
    RequestHeader set X-Forwarded-Proto expr=%{REQUEST_SCHEME}

    # www.$NEW → https://$NEW (ช่อง URL แบบเดียว)
    RewriteEngine On
    RewriteCond %{HTTP_HOST} ^www\. [NC]
    RewriteCond %{REQUEST_URI} !^/\.well-known/acme-challenge/
    RewriteRule ^/(.*)\$ https://$NEW/\$1 [R=301,L]

    ProxyPass /.well-known/acme-challenge/ !
    ProxyPass /media/ !
    Alias /media/ $MEDIA/
    <Directory $MEDIA/>
        Options -Indexes
        Require all granted
    </Directory>

    ProxyPass / http://127.0.0.1:$PORT/
    ProxyPassReverse / http://127.0.0.1:$PORT/
</VirtualHost>
EOF
  a2enmod -q proxy proxy_http headers alias rewrite >/dev/null 2>&1 || true
  a2ensite -q "$NEW" >/dev/null
  if ! apache2ctl configtest >/dev/null 2>&1; then
    apache2ctl configtest || true; a2dissite -q "$NEW" >/dev/null; rm -f "$NEWCONF"
    die "ตั้งค่า Apache ไม่ผ่าน — ลบไฟล์ที่เพิ่งสร้างแล้ว เว็บเดิมไม่กระทบ"
  fi
  systemctl reload apache2
  okay "เซิร์ฟเวอร์พร้อมรับ $NEW และ www.$NEW แล้ว"
else
  okay "มี $NEWCONF อยู่แล้ว"
fi

# ---------- 2) DNS ----------
say "2/4 เช็ก DNS"
MYIP=$(curl -4 -s -m 10 https://api.ipify.org || hostname -I | awk '{print $1}')
ok_dns=1
for d in "$NEW" "www.$NEW"; do
  ips=$(getent ahostsv4 "$d" 2>/dev/null | awk '{print $1}' | sort -u | tr '\n' ' ')
  if printf '%s' " $ips" | grep -q " $MYIP "; then printf '  ✔ %-28s → %s\n' "$d" "$MYIP"
  else printf '  · %-28s → %s\n' "$d" "${ips:-ไม่พบ}"; ok_dns=0; fi
done
if [ $ok_dns = 0 ]; then
  echo
  warn "DNS ยังไม่ชี้มาที่ $MYIP — ตอนนี้เว็บยังใช้ $OLD เหมือนเดิม ไม่มีอะไรเปลี่ยน"
  echo "  ให้แก้ A record ของ $NEW และ www.$NEW เป็น $MYIP แล้วรันสคริปต์นี้อีกครั้ง (DNS อาจใช้เวลา 5–60 นาที)"
  exit 0
fi

# ---------- 3) SSL ของโดเมนใหม่ ----------
say "3/4 ขอ SSL สำหรับ $NEW"
certbot --apache --non-interactive --agree-tos --register-unsafely-without-email --redirect \
  --cert-name "$NEW" -d "$NEW" -d "www.$NEW" || die "ขอ SSL ไม่สำเร็จ — เว็บยังใช้ $OLD ตามเดิม ลองรันใหม่ภายหลัง"
curl -s -o /dev/null -m 15 --resolve "$NEW:443:127.0.0.1" "https://$NEW/" -w '%{http_code}' | grep -q '^200$' \
  || die "https://$NEW ยังเปิดไม่ได้ — ยังไม่เปลี่ยนโดเมนหลัก"
okay "https://$NEW ใช้ได้"

# ---------- 4) เปลี่ยนโดเมนหลัก + ikssa.io ส่งต่อมา ----------
say "4/4 ให้ $NEW เป็นโดเมนหลัก"
set_site_url "https://$NEW"

# ikssa.io (http และ https) → โดเมนใหม่ แบบ 301 พร้อม path เดิม — ทำเฉพาะเมื่อสั่ง --redirect-old
# (ถ้าทำทันที ลูกค้าที่ DNS ยังจำ IP เก่าจะวน: โดเมนใหม่(เครื่องเดิม) → ikssa.io → โดเมนใหม่(เครื่องเดิม) → …)
if [ "${1:-}" != "--redirect-old" ]; then
  okay "ช่อง URL แสดง https://$NEW แล้ว · Google จะนับ $NEW เป็นเว็บหลัก (canonical)"
  warn "$OLD ยังเปิดเว็บได้ตามปกติ (ยังไม่ส่งต่อ) — อีก 24 ชั่วโมงให้รัน: bash /root/ikssa_primary_domain.sh --redirect-old"
  echo
  for u in "https://$NEW/" "https://www.$NEW/live?src=fb" "https://$OLD/"; do
    printf '  %-42s ' "$u"; curl -s -o /dev/null -m 10 -w '%{http_code} -> %{redirect_url}\n' "$u" || echo "เชื่อมต่อไม่ได้"
  done
  echo; echo "  หลังบ้าน: https://$NEW/admin (ต้องล็อกอินใหม่ 1 ครั้ง)"
  exit 0
fi
for f in $(grep -l "ServerName $OLD" "$AV"/*.conf 2>/dev/null); do
  base=$(basename "$f")
  [ -f "$BK/$base" ] || cp "$f" "$BK/$base"
  if grep -q '<VirtualHost \*:443>' "$f"; then
    ssl_lines=$(grep -E '^\s*(SSLCertificateFile|SSLCertificateKeyFile|SSLCertificateChainFile|Include /etc/letsencrypt/)' "$BK/$base" || true)
    cat > "$f" <<EOF
# $OLD → https://$NEW (301) สร้างโดย ikssa_primary_domain.sh · ต้นฉบับ: $BK/$base
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName $OLD
    ServerAlias www.$OLD
    RedirectMatch 301 ^/(?!\.well-known/acme-challenge/)(.*)\$ https://$NEW/\$1
$ssl_lines
</VirtualHost>
</IfModule>
EOF
  else
    cat > "$f" <<EOF
# $OLD → https://$NEW (301) สร้างโดย ikssa_primary_domain.sh · ต้นฉบับ: $BK/$base
<VirtualHost *:80>
    ServerName $OLD
    ServerAlias www.$OLD
    RedirectMatch 301 ^/(?!\.well-known/acme-challenge/)(.*)\$ https://$NEW/\$1
</VirtualHost>
EOF
  fi
  okay "$base → ส่งต่อไป https://$NEW"
done
reload_or_restore

# ---------- สรุป ----------
say "ผลทดสอบ"
sleep 2
for u in "https://$NEW/" "https://www.$NEW/live?src=fb" "http://$NEW/" "https://$OLD/branches/kaset" "http://$OLD/"; do
  printf '  %-42s ' "$u"; curl -s -o /dev/null -m 10 -w '%{http_code} -> %{redirect_url}\n' "$u" || echo "เชื่อมต่อไม่ได้"
done
echo
okay "เสร็จ — เว็บหลักคือ https://$NEW (ถ้ามีปัญหา ย้อนกลับด้วย: bash /root/ikssa_primary_domain.sh --rollback)"
echo "  หลังบ้าน: https://$NEW/admin (ต้องล็อกอินใหม่ 1 ครั้ง)"
