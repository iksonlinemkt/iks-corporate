#!/usr/bin/env bash
# IKS Website — ให้เซิร์ฟเวอร์ส่งต่อโดเมนสำรองทั้งหมดไป https://ikssa.io แบบ 301 พร้อม SSL (Let's Encrypt)
# ก่อนรัน: ตั้ง DNS (A record) ของโดเมนและ www ให้ชี้มาที่ IP เซิร์ฟเวอร์นี้ และลบการ Forwarding ที่ผู้จดโดเมนออก
# รัน:  bash /root/ikssa_redirect_domains.sh            (ทำเฉพาะโดเมนที่ DNS ชี้มาแล้ว รันซ้ำได้เรื่อย ๆ)
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then echo "กรุณารันด้วย: bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1; fi
set -euo pipefail

TARGET=${TARGET:-https://ikssa.io}
# อีซูซุกรุงเทพ.com / .net เขียนแบบ punycode (xn--...) ตามที่ระบบ DNS ใช้
DOMAINS=(
  isuzukrungthep.com www.isuzukrungthep.com
  isuzukrungthep.net www.isuzukrungthep.net
  xn--12cmka6dzb6a6esd6ach1h.com www.xn--12cmka6dzb6a6esd6ach1h.com
  xn--12cmka6dzb6a6esd6ach1h.net www.xn--12cmka6dzb6a6esd6ach1h.net
)
CONF=/etc/apache2/sites-available/iks-redirects.conf
CERT_NAME=iks-redirects

say()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
okay() { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✖ %s\033[0m\n' "$*"; exit 1; }

[ "$(id -u)" = 0 ] || die "ต้องรันด้วย root"
systemctl is-active --quiet apache2 || die "Apache ไม่ได้ทำงานอยู่"
command -v certbot >/dev/null || die "ไม่พบ certbot"

# ---------- 1) เช็กว่า DNS ของโดเมนไหนชี้มาที่เครื่องนี้แล้ว ----------
say "1/3 เช็ก DNS"
MYIP=$(curl -4 -s -m 10 https://api.ipify.org || hostname -I | awk '{print $1}')
okay "IP เครื่องนี้: $MYIP"
READY=(); PENDING=()
for d in "${DOMAINS[@]}"; do
  ips=$(getent ahostsv4 "$d" 2>/dev/null | awk '{print $1}' | sort -u | tr '\n' ' ')
  if printf '%s' " $ips" | grep -q " $MYIP "; then READY+=("$d"); printf '  ✔ %-40s → %s\n' "$d" "$MYIP"
  else PENDING+=("$d"); printf '  · %-40s → %s\n' "$d" "${ips:-ไม่พบ}"; fi
done
[ ${#READY[@]} -gt 0 ] || die "ยังไม่มีโดเมนไหนชี้มาที่ $MYIP — ตั้ง A record ที่ผู้จดโดเมนก่อน (DNS อาจใช้เวลา 5 นาที – 2 ชั่วโมง)"

# ---------- 2) Apache: ส่งต่อทุก path แบบ 301 ----------
say "2/3 ตั้งค่า Apache"
BACKUP=""
[ -f "$CONF" ] && { BACKUP=$(mktemp); cp "$CONF" "$BACKUP"; }
{
  echo "# IKS — โดเมนสำรองทั้งหมดส่งต่อไป $TARGET (สร้างโดย ikssa_redirect_domains.sh)"
  echo "<VirtualHost *:80>"
  echo "    ServerName ${READY[0]}"
  for d in "${READY[@]:1}"; do echo "    ServerAlias $d"; done
  echo "    # ให้ certbot ตรวจโดเมนได้ ก่อนส่งต่อ"
  echo "    RedirectMatch 301 ^/(?!\\.well-known/acme-challenge/)(.*)\$ $TARGET/\$1"
  echo "</VirtualHost>"
} > "$CONF"
a2ensite -q iks-redirects >/dev/null
if ! apache2ctl configtest >/dev/null 2>&1; then
  apache2ctl configtest || true
  if [ -n "$BACKUP" ]; then cp "$BACKUP" "$CONF"; else a2dissite -q iks-redirects >/dev/null; rm -f "$CONF"; fi
  die "ตั้งค่า Apache ไม่ผ่าน — คืนค่าเดิมแล้ว เว็บอื่นไม่กระทบ"
fi
systemctl reload apache2
okay "http ของ ${#READY[@]} โดเมน → $TARGET (301)"

# ---------- 3) SSL ----------
say "3/3 ขอใบรับรอง SSL"
ARGS=(); for d in "${READY[@]}"; do ARGS+=(-d "$d"); done
if certbot --apache --non-interactive --agree-tos --register-unsafely-without-email \
     --cert-name "$CERT_NAME" --expand "${ARGS[@]}"; then
  okay "https ใช้ได้แล้ว"
else
  warn "ขอ SSL ไม่สำเร็จ (http ยังส่งต่อได้ปกติ) — ถ้าเพิ่งเปลี่ยน DNS ให้รอสักครู่แล้วรันสคริปต์นี้ใหม่"
fi

# ---------- สรุป ----------
say "ผลทดสอบ"
sleep 2
for d in "${READY[@]}"; do
  for p in http https; do
    printf '  %-48s ' "$p://$d"
    curl -s -o /dev/null -m 10 -w '%{http_code} -> %{redirect_url}\n' "$p://$d/" || echo "เชื่อมต่อไม่ได้"
  done
done
if [ ${#PENDING[@]} -gt 0 ]; then
  echo; warn "ยังไม่ได้ทำ (DNS ยังไม่ชี้มา): ${PENDING[*]}"
  echo "  ตั้ง A record เป็น $MYIP แล้วรัน: bash /root/ikssa_redirect_domains.sh อีกครั้ง"
fi
echo; okay "เสร็จ — ทุกบรรทัดควรเป็น 301 -> $TARGET/"
