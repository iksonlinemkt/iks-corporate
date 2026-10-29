#!/usr/bin/env bash
# IKS Website — ตั้งค่าแจ้งเตือนลูกค้าใหม่ (ทดลองขับ / ใบเสนอราคา ฯลฯ) เข้ากลุ่ม LINE หรือ n8n
#   bash /root/ikssa_lead_notify.sh --line-token <Channel access token> --line-secret <Channel secret>
#   bash /root/ikssa_lead_notify.sh --webhook https://n8n.example.com/webhook/iks-lead     (ส่ง JSON ให้ n8n)
#   bash /root/ikssa_lead_notify.sh --show        ดูค่าที่ตั้งไว้
#   bash /root/ikssa_lead_notify.sh --off-line | --off-webhook     ปิด
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then echo "กรุณารันด้วย: bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1; fi
set -euo pipefail
CONF_DIR=/root/iks-web; APP_DIR=/opt/ikssa-web; ENVF=$APP_DIR/.env.production; PM2_NAME=ikssa-web
okay() { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✖ %s\033[0m\n' "$*"; exit 1; }
[ "$(id -u)" = 0 ] || die "ต้องรันด้วย root"
[ -f "$ENVF" ] || die "ไม่พบ $ENVF — ติดตั้งเว็บ v38 ขึ้นไปก่อน"
[ $# -gt 0 ] || { sed -n '2,7p' "$0"; exit 0; }

setf() { umask 077; printf '%s\n' "$2" > "$CONF_DIR/$1"; umask 022; }
setenv() { # key value(ว่าง = ลบ)
  grep -v "^$1=" "$ENVF" > "$ENVF.tmp" || true
  [ -n "$2" ] && echo "$1=$2" >> "$ENVF.tmp"
  mv "$ENVF.tmp" "$ENVF"; chmod 600 "$ENVF"
}
mask() { local v=${1:-}; [ -z "$v" ] && echo "(ไม่ได้ตั้ง)" || echo "${v:0:6}…${v: -4} (${#v} ตัวอักษร)"; }

changed=0
while [ $# -gt 0 ]; do
  case "$1" in
    --line-token)  [ -n "${2:-}" ] || die "ใส่ token ต่อท้าย"; setf line_channel_token "$2"; setenv LINE_CHANNEL_TOKEN "$2"; changed=1; shift 2 ;;
    --line-secret) [ -n "${2:-}" ] || die "ใส่ secret ต่อท้าย"; setf line_channel_secret "$2"; setenv LINE_CHANNEL_SECRET "$2"; changed=1; shift 2 ;;
    --webhook)     [[ "${2:-}" =~ ^https?:// ]] || die "ใส่ URL ของ n8n webhook ต่อท้าย"; setf lead_webhook_url "$2"; setenv LEAD_WEBHOOK_URL "$2"; changed=1; shift 2 ;;
    --off-line)    rm -f "$CONF_DIR/line_channel_token" "$CONF_DIR/line_channel_secret"; setenv LINE_CHANNEL_TOKEN ""; setenv LINE_CHANNEL_SECRET ""; changed=1; shift ;;
    --off-webhook) rm -f "$CONF_DIR/lead_webhook_url"; setenv LEAD_WEBHOOK_URL ""; changed=1; shift ;;
    --show)        shift ;;
    *) die "ไม่รู้จัก $1" ;;
  esac
done

if [ "$changed" = 1 ]; then
  pm2 restart "$PM2_NAME" --update-env >/dev/null && okay "รีสตาร์ทเว็บแล้ว"
  sleep 3
fi
SITE=$( { tr -d "[:space:]" < "$CONF_DIR/site_url"; } 2>/dev/null || true); SITE=${SITE:-https://isuzukrungthep.com}
echo
echo "LINE token   : $(mask "$(grep '^LINE_CHANNEL_TOKEN=' "$ENVF" | cut -d= -f2-)")"
echo "LINE secret  : $(mask "$(grep '^LINE_CHANNEL_SECRET=' "$ENVF" | cut -d= -f2-)")"
echo "n8n webhook  : $(grep '^LEAD_WEBHOOK_URL=' "$ENVF" | cut -d= -f2- || true)"
if grep -q '^LINE_CHANNEL_TOKEN=' "$ENVF"; then
  printf 'ทดสอบ token : '
  curl -s -m 10 -H "Authorization: Bearer $(grep '^LINE_CHANNEL_TOKEN=' "$ENVF" | cut -d= -f2-)" https://api.line.me/v2/bot/info \
    | python3 -c 'import sys,json; d=json.load(sys.stdin); print("✔ บอท "+d.get("displayName","?")+" ("+d.get("basicId","")+")" if "userId" in d else "✖ "+d.get("message","token ไม่ถูกต้อง"))' 2>/dev/null || echo "✖ เชื่อมต่อ LINE ไม่ได้"
fi
echo
echo "ขั้นต่อไป:"
echo "  1) LINE Developers → Messaging API → Webhook URL: $SITE/api/line/webhook → เปิด Use webhook"
echo "  2) เชิญบอทเข้ากลุ่ม LINE → พิมพ์ \"รหัสกลุ่ม\" → นำรหัสไปใส่ หลังบ้าน → ตั้งค่าเว็บ → แจ้งเตือนลูกค้าใหม่เข้า LINE"
echo "  3) หลังบ้าน → รายชื่อลูกค้า (Lead) → ปุ่ม \"ทดสอบแจ้งเตือน LINE\""
