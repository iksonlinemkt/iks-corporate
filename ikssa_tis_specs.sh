#!/usr/bin/env bash
# เก็บราคา/สเปกทุกรุ่นย่อยจากหน้าเปรียบเทียบของ isuzu-tis.com (ใช้ Chromium แบบไม่มีหน้าจอ) → https://ikssa.io/media/_tis/
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then echo "กรุณารันด้วย: bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1; fi
set -euo pipefail
W=/root/iks-web/tis-scraper; OUT=/var/www/ikssa-media/_tis2
mkdir -p "$W" && cd "$W"
# Ubuntu 26.04 ยังไม่รองรับ Chromium ของ Playwright โดยตรง → รันใน Docker image ทางการของ Playwright
if [ ! -d node_modules/playwright ]; then
  [ -f package.json ] || npm init -y >/dev/null
  npm i --no-audit --no-fund --loglevel=error playwright@1.56.1
fi
IMG=mcr.microsoft.com/playwright:v1.56.1-noble
echo "▶ เตรียมเบราว์เซอร์ (ครั้งแรกดาวน์โหลด ~2 GB, 3-8 นาที)…"
docker pull -q "$IMG" >/dev/null
cat > specs.mjs <<'NODE_EOF'
// หน้า compare ของ isuzu-tis.com: หารายชื่อรุ่นย่อยทั้งหมด แล้วเปิดเปรียบเทียบทีละ 3 รุ่น เก็บข้อความตารางสเปก/ราคา
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const OUT = process.argv[2];
const BASE = process.env.TIS_BASE ?? 'https://www.isuzu-tis.com';
const START = '/compare?model=2-door-hi-lander-2-door-2-2-ddi-z-mt_elbrus-gray-opaque&model=4-door-hi-lander-4-door-2-2-ddi-m-at_elbrus-gray-opaque&model=mu-x-2-2-rs_dolomite-pearl-white';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: 'th-TH', viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
await page.goto(BASE + START, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(3000);

const probe = await page.evaluate(() => {
  const opts = [...document.querySelectorAll('select option')].map((o) => `${o.value}|${o.textContent.trim()}`);
  const rsc = (self.__next_f ?? []).map((x) => (Array.isArray(x) ? x[1] ?? '' : '')).join('');
  const html = document.documentElement.outerHTML;
  const pool = rsc + '\n' + html;
  const slugs = [...new Set(pool.match(/[a-z0-9]+(?:-[a-z0-9]+)*-(?:mt|at|ddi)[a-z0-9-]*_[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? [])];
  return { selects: document.querySelectorAll('select').length, opts, slugs, rscLen: rsc.length };
});
let slugs = probe.opts.map((o) => o.split('|')[0]).filter((v) => /_/.test(v));
if (!slugs.length) slugs = probe.slugs;
slugs = [...new Set(slugs)];
writeFileSync(`${OUT}/probe.txt`, [`selects=${probe.selects} rsc=${probe.rscLen}`, '--- options', ...probe.opts, '--- slugs found', ...probe.slugs].join('\n'));
console.log(`พบรุ่นย่อย ${slugs.length} รุ่น`);

const index = [];
for (let i = 0; i < slugs.length; i += 3) {
  const group = slugs.slice(i, i + 3);
  const url = `${BASE}/compare?${group.map((s) => `model=${s}`).join('&')}`;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(2500);
    const text = await page.evaluate(() => document.querySelector('main')?.innerText ?? document.body.innerText);
    const f = `cmp-${String(i / 3 + 1).padStart(2, '0')}.txt`;
    writeFileSync(`${OUT}/${f}`, `MODELS: ${group.join(' , ')}\n\n${text}`);
    index.push(`${f}\t${group.join(' , ')}`);
    console.log('✔', f, group.join(' , '));
  } catch (e) { console.log('✖', group.join(','), e.message); }
}
await browser.close();
writeFileSync(`${OUT}/index.txt`, index.join('\n') + '\n');
NODE_EOF
rm -rf "$OUT"; mkdir -p "$OUT"
# เบราว์เซอร์เก็บไว้ใน $W/.browsers (ดาวน์โหลดครั้งแรกครั้งเดียว) แล้วรันภายในคอนเทนเนอร์
docker run --rm --ipc=host -e PLAYWRIGHT_BROWSERS_PATH=/work/.browsers -v "$W":/work -v "$OUT":/out -w /work "$IMG" \
  sh -c 'node node_modules/playwright/cli.js install chromium-headless-shell >/dev/null 2>&1 || node node_modules/playwright/cli.js install chromium; node specs.mjs /out'
chmod -R a+rX "$OUT"
echo; echo "✔ เสร็จ — ส่งข้อความนี้กลับมาได้เลย: dump พร้อมแล้ว"
