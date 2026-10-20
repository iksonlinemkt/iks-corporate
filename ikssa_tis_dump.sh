#!/usr/bin/env bash
# เก็บข้อมูลรุ่นรถ/ราคา/สเปกจาก isuzu-tis.com (ใช้ Chromium แบบไม่มีหน้าจอ) → https://ikssa.io/media/_tis/
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then echo "กรุณารันด้วย: bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1; fi
set -euo pipefail
W=/root/iks-web/tis-scraper; OUT=/var/www/ikssa-media/_tis
mkdir -p "$W" && cd "$W"
# Ubuntu 26.04 ยังไม่รองรับ Chromium ของ Playwright โดยตรง → รันใน Docker image ทางการของ Playwright
if [ ! -d node_modules/playwright ]; then
  [ -f package.json ] || npm init -y >/dev/null
  npm i --no-audit --no-fund --loglevel=error playwright@1.56.1
fi
IMG=mcr.microsoft.com/playwright:v1.56.1-noble
echo "▶ เตรียมเบราว์เซอร์ (ครั้งแรกดาวน์โหลด ~2 GB, 3-8 นาที)…"
docker pull -q "$IMG" >/dev/null
cat > dump.mjs <<'NODE_EOF'
// เปิดหน้าเว็บ isuzu-tis.com ด้วย Chromium แล้วเก็บข้อมูลรุ่น/ราคา/สเปก (JSON ที่หน้าเว็บโหลด + ข้อความบนหน้า)
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const OUT = process.argv[2];
const BASE = process.env.TIS_BASE ?? 'https://www.isuzu-tis.com';
const PAGES = (process.env.TIS_PAGES ?? '/isuzu-spark,/isuzu-pick-up-2-door,/isuzu-pick-up-4-door,/isuzu-v-cross,/isuzu-x-series,/isuzu-mu-x,/isuzu-mu-x/ultimate,/compare?model=2-door-hi-lander-2-door-2-2-ddi-z-mt_elbrus-gray-opaque&model=4-door-hi-lander-4-door-2-2-ddi-m-at_elbrus-gray-opaque&model=mu-x-2-2-rs_dolomite-pearl-white').split(',');
mkdirSync(OUT, { recursive: true });
const index = [];
let n = 0;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ locale: 'th-TH', viewport: { width: 1440, height: 900 } });
for (const p of PAGES) {
  const page = await ctx.newPage();
  const tag = p.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || 'home';
  page.on('response', async (res) => {
    try {
      const ct = res.headers()['content-type'] ?? '';
      if (!/json|text\/x-component/.test(ct)) return;
      const body = await res.text();
      if (body.length < 800) return;
      const f = `${tag}-${String(++n).padStart(3, '0')}.txt`;
      writeFileSync(`${OUT}/${f}`, `URL: ${res.url()}\n\n${body}`);
      index.push(`${f}\t${body.length}\t${res.url().slice(0, 160)}`);
    } catch {}
  });
  try {
    await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 90000 });
    for (let y = 0; y < 12; y++) { await page.mouse.wheel(0, 1400); await page.waitForTimeout(700); }
    await page.waitForTimeout(2500);
    const text = await page.evaluate(() => document.body.innerText);
    writeFileSync(`${OUT}/${tag}-PAGE.txt`, `URL: ${BASE + p}\n\n${text}`);
    index.push(`${tag}-PAGE.txt\t${text.length}\t(ข้อความบนหน้า) ${p}`);
    console.log('✔', p);
  } catch (e) { console.log('✖', p, e.message); }
  await page.close();
}
await browser.close();
writeFileSync(`${OUT}/index.txt`, index.join('\n') + '\n');
console.log(`✔ เก็บแล้ว ${index.length} ไฟล์`);
NODE_EOF
rm -rf "$OUT"; mkdir -p "$OUT"
docker run --rm --ipc=host -v "$W":/work -v "$OUT":/out -w /work "$IMG" node dump.mjs /out
chmod -R a+rX "$OUT"
echo; echo "✔ เสร็จ — ส่งข้อความนี้กลับมาได้เลย: dump พร้อมแล้ว"
