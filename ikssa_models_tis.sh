#!/usr/bin/env bash
# IKS Website — ดึงรูป + ราคาเริ่มต้นรุ่นรถจาก isuzu-tis.com มาใส่หน้า "รุ่นรถ" และเผยแพร่ · รันซ้ำได้
if [ "${BASH_SOURCE[0]:-$0}" != "$0" ]; then echo "กรุณารันด้วย: bash ${BASH_SOURCE[0]}"; return 1 2>/dev/null || exit 1; fi
set -euo pipefail
MEDIA_DIR=${MEDIA_DIR:-/var/www/ikssa-media}
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
[ -f "${SHARP_FROM:-/opt/ikssa-web/package.json}" ] || { echo "✖ ไม่พบเว็บที่ /opt/ikssa-web"; exit 1; }
cat > "$TMP/fetch_models.mjs" <<'NODE_EOF'
// ดึงรูปรุ่นรถจาก isuzu-tis.com (Contentstack CDN) → ทำรูปการ์ด/รูปตัดพื้น/แกลเลอรี → เขียน SQL
// ใช้ sharp จากแอปเว็บ: node fetch_models.mjs <MEDIA_DIR> <SQL_OUT>
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(process.env.SHARP_FROM ?? '/opt/ikssa-web/package.json');
const sharp = require('sharp');

const MEDIA = process.argv[2];
const SQL_OUT = process.argv[3];
const CDN = (process.env.CDN_BASE ?? 'https://images.contentstack.io/v3/assets/blt04fb7dc282801dd0').replace(/\/$/, '');
const DIR = 'vehicles';
mkdirSync(path.join(MEDIA, DIR), { recursive: true });

// ราคาเริ่มต้นจาก isuzu-tis.com (ต.ค. 2569)
const MODELS = [
  { slug: 'd-max-v-cross', cat: 'pickup', series: 'D-MAX', name: 'ISUZU D-MAX V-CROSS 4x4', tagline: 'ลุยได้ทุกเส้นทาง', price: 937000, featured: true, badge: '4x4',
    car: 'blt0cd55479af9403a1/68f5e5ec831bbe1efc3e98c9/banner-vcross-car.png', og: 'blt7fdce984a5837133/68f1951263452b31a11ef9bb/og-v-cross.jpg' },
  { slug: 'd-max', cat: 'pickup', series: 'D-MAX', name: 'ISUZU D-MAX 4 ประตู', tagline: 'พลังที่อยู่เคียงข้างทุกเส้นทางของคุณ', price: 749000, featured: true,
    car: 'blt09ae3900bd26ea99/68d617e69c1abc9a0a487687/banner-4door-car.png', og: 'blt20d412bcf8c3d089/68e3915fd56ee21496a056dc/4-door.jpg' },
  { slug: 'd-max-2-door', cat: 'pickup', series: 'D-MAX', name: 'ISUZU D-MAX 2 ประตู', tagline: 'ห้องโดยสารกว้าง พร้อมใช้งานทุกวัน', price: 668000, featured: false,
    car: 'blt1721f678956331cb/68d648481d73638f39029e58/banner-2door-car.png', og: 'blt51a60d8bb476d868/68e391ea4306503c960b5cc7/2-door.jpg' },
  { slug: 'd-max-spark', cat: 'pickup', series: 'D-MAX', name: 'ISUZU D-MAX SPARK', tagline: 'กระบะตอนเดียว คุ้มค่า พร้อมลุยงาน', price: 595000, featured: false,
    car: 'blt35c40b57e3862d2f/68d65e0b26e10806d0009dc9/banner-spark-car.png', og: 'blt769372105d2b9468/68e396c57173c4b49deb78ad/spark.jpg' },
  { slug: 'd-max-x-series', cat: 'pickup', series: 'D-MAX', name: 'ISUZU D-MAX X-SERIES', tagline: 'สไตล์ที่ใช่...ตัวตนที่ชัดเจน', price: 768000, featured: false,
    car: 'blta9cee2992ec66f3d/68d6657c1922c68d7c97fb2b/banner-x-series-speed-car.png', og: 'bltd890022abf3423f1/68f1932d36fedc6585ff7d92/og-x-series-speed.jpg' },
  { slug: 'mu-x-rs', cat: 'suv', series: 'MU-X', name: 'ISUZU MU-X RS', tagline: 'สปอร์ตพรีเมียม เหนือทุกระดับ', price: 1624000, featured: false, badge: 'RS',
    car: 'blta1dbc02786ab4030/699eb5c73b580ed1ca24a66d/banner-mux-rs-2-2-car.png', og: 'bltdf89876850eb3f3b/699c19962b6dd50008a8a00e/mu-x-rs-2-2.jpg' },
  { slug: 'mu-x', cat: 'suv', series: 'MU-X', name: 'ISUZU MU-X', tagline: 'ความพรีเมียม...ที่มากกว่า', price: 1194000, featured: true,
    car: 'blt16e2a7235e8ed618/68d66564062566f5338e576f/banner-mux-ultimate-car.png', og: 'blt9a74986b83cc17d8/68f192b16df5882c0bb3ca38/og-mu-x-ultimate.jpg' },
];

async function get(rel) {
  const res = await fetch(`${CDN}/${rel}`, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${rel}`);
  return Buffer.from(await res.arrayBuffer());
}

// พื้นหลังการ์ด: เทาอ่อนไล่สี + เงาใต้รถ (โทนเดียวกับเว็บ)
const BG = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f8fb"/><stop offset="0.62" stop-color="#e9edf3"/><stop offset="1" stop-color="#d5dce6"/></linearGradient>
    <radialGradient id="s" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#0c2346" stop-opacity="0.32"/><stop offset="1" stop-color="#0c2346" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#g)"/>
  <rect y="560" width="1200" height="3" fill="#c27c45" opacity="0.35"/>
  <ellipse cx="600" cy="640" rx="470" ry="34" fill="url(#s)"/>
</svg>`);

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const media = [];
const rows = [];

for (const m of MODELS) {
  try {
    const carRaw = await get(m.car);
    // ตัดขอบใสออก แล้ววางกลางกรอบ 1200×800 (พื้นใส)
    const trimmed = await sharp(carRaw).ensureAlpha().trim({ threshold: 1 }).png().toBuffer();
    const cutout = await sharp(trimmed).resize(1140, 740, { fit: 'inside' }).toBuffer();
    const cm = await sharp(cutout).metadata();
    const cutoutFile = `${DIR}/${m.slug}-cutout.webp`;
    await sharp({ create: { width: 1200, height: 800, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: cutout, left: Math.round((1200 - cm.width) / 2), top: Math.round(800 - cm.height - 30) }])
      .webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(MEDIA, cutoutFile));

    // รูปการ์ด 1200×750: รถบนพื้นหลังแบรนด์
    const car = await sharp(trimmed).resize(1000, 520, { fit: 'inside' }).toBuffer();
    const km = await sharp(car).metadata();
    const cardFile = `${DIR}/${m.slug}-card.webp`;
    await sharp(BG).composite([{ input: car, left: Math.round((1200 - km.width) / 2), top: Math.round(650 - km.height) }])
      .webp({ quality: 86 }).toFile(path.join(MEDIA, cardFile));

    // แกลเลอรี: รูปโฆษณาทางการ
    const gallery = [];
    try {
      const ogFile = `${DIR}/${m.slug}-gallery-1.webp`;
      await sharp(await get(m.og)).resize(1600, 1067, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(MEDIA, ogFile));
      gallery.push(ogFile);
    } catch (e) { console.warn(`! ${m.slug}: แกลเลอรีโหลดไม่ได้ (${e.message})`); }

    for (const f of [cutoutFile, cardFile, ...gallery]) {
      const meta = await sharp(path.join(MEDIA, f)).metadata();
      media.push(`(${q(f)}, ${q(path.basename(f))}, 'image/webp', ${statSync(path.join(MEDIA, f)).size}, ${meta.width}, ${meta.height}, ${q(m.name)})`);
    }
    rows.push({ ...m, cardFile, cutoutFile, gallery });
    console.log(`✔ ${m.name}`);
  } catch (e) {
    console.error(`✖ ${m.name}: ${e.message}`);
  }
}

if (!rows.length) { console.error('ไม่ได้รูปเลย — ยกเลิก'); process.exit(1); }

const sql = [
  'set client_min_messages = warning;',
  'begin;',
  `insert into public.media_files (path, original_name, mime_type, size_bytes, width, height, alt_text) values\n  ${media.join(',\n  ')}\non conflict (path) do update set size_bytes = excluded.size_bytes, width = excluded.width, height = excluded.height;`,
  `update public.vehicle_categories set status = 'published' where slug in ('pickup', 'suv');`,
  ...rows.map((m, i) => `insert into public.vehicles (slug, category_id, series, name, tagline, price_from, price_note, badge, image_card, image_cutout, gallery, colors, is_featured, status, sort_order)
values (${q(m.slug)}, (select id from public.vehicle_categories where slug = ${q(m.cat)}), ${q(m.series)}, ${q(m.name)}, ${q(m.tagline)}, ${m.price},
  'ราคาเริ่มต้นตามประกาศของตรีเพชรอีซูซุเซลส์ อาจเปลี่ยนแปลงได้', ${m.badge ? q(m.badge) : 'null'}, ${q(m.cardFile)}, ${q(m.cutoutFile)}, ${q(JSON.stringify(m.gallery))}::jsonb, '[]'::jsonb, ${m.featured}, 'published', ${(i + 1) * 10})
on conflict (slug) do update set category_id = excluded.category_id, series = excluded.series, name = excluded.name,
  tagline = coalesce(public.vehicles.tagline, excluded.tagline), price_from = excluded.price_from, price_note = excluded.price_note, badge = excluded.badge,
  image_card = excluded.image_card, image_cutout = excluded.image_cutout, gallery = excluded.gallery, colors = excluded.colors,
  is_featured = excluded.is_featured, status = 'published', sort_order = excluded.sort_order;`),
  'commit;',
  '\\pset footer off',
  `select v.name as "รุ่น", to_char(v.price_from, 'FM9,999,999') as "ราคาเริ่มต้น", v.status as "สถานะ", case when v.is_featured then 'ยอดนิยม' else '' end as "หน้าแรก"
     from public.vehicles v where v.status = 'published' order by v.sort_order;`,
].join('\n');
writeFileSync(SQL_OUT, sql);
console.log(`✔ เตรียมข้อมูล ${rows.length} รุ่น`);
NODE_EOF
echo "▶ ดาวน์โหลดและเตรียมรูปรุ่นรถ…"
node "$TMP/fetch_models.mjs" "$MEDIA_DIR" "$TMP/models.sql"
chmod 755 "$MEDIA_DIR/vehicles"; chmod 644 "$MEDIA_DIR"/vehicles/*.webp
docker exec -i iks-web-db psql -q -U iks_owner -d iks_web -v ON_ERROR_STOP=1 < "$TMP/models.sql"
echo; echo "✔ เสร็จแล้ว — ดูได้ที่ https://ikssa.io/models"
