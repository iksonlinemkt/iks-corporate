import { publicDb } from '@/lib/db';
import { isPrelaunch } from '@/lib/preview';
import { SITE_URL } from '@/lib/site';
import { branchArea, branchPath } from '@/lib/branch';

export const dynamic = 'force-dynamic';

const SITE = SITE_URL;
const fmt = (n: number | null) => (n === null ? 'สอบถามราคา' : `${Number(n).toLocaleString('en-US')} บาท`);

/** สรุปข้อมูลบริษัท สาขา และรุ่นรถพร้อมราคา สำหรับ AI (มาตรฐาน llms.txt) */
export async function GET() {
  if (isPrelaunch()) return new Response('Not found', { status: 404 });
  const db = publicDb();
  const [settings, branches, cats, vehicles, grades, industries, faqs, areas, clubs] = await Promise.all([
    db.query('select key, value from public.published_site_settings'),
    db.query('select * from public.published_branches order by sort_order'),
    db.query("select * from public.published_vehicle_categories where segment in ('pickup','ppv') order by sort_order"),
    db.query('select * from public.published_vehicles order by sort_order'),
    db.query('select * from public.published_vehicle_grades order by vehicle_id, sort_order'),
    db.query('select name, subtitle, slug, headline, description from public.published_industries order by sort_order'),
    db.query('select question, answer from public.published_faqs order by group_key, sort_order'),
    db.query('select slug, name, districts, branch_codes from public.published_areas order by sort_order').catch(() => ({ rows: [] })),
    db.query('select slug, name, tagline from public.published_communities order by sort_order').catch(() => ({ rows: [] })),
  ]).then((r) => r.map((x) => x.rows));
  const s = Object.fromEntries(settings.map((r) => [r.key, r.value]));
  const name = s.company_name_th ?? 'อีซูซุกรุงเทพเซลส์';
  const founded = s.founded_year ?? '2525';

  const L: string[] = [];
  L.push(`# ${name} (${s.company_name_en ?? 'ISUZU KRUNGTHEP SALES'})`, '');
  L.push(`> ผู้จำหน่ายรถยนต์อีซูซุ ก่อตั้งเมื่อ พ.ศ. ${founded} (ค.ศ. ${Number(founded) - 543}) มี ${branches.length} สาขา ดูแลลูกค้าใน${s.service_area ?? 'กรุงเทพฯ และสมุทรปราการ'} เน้นรถกระบะเพื่อการพาณิชย์ที่ต่ออุปกรณ์ตามธุรกิจ (ตู้ทึบ ตู้เย็น ฟู้ดทรัค คอก หลังคา) พร้อมโชว์รูมและศูนย์บริการ`, '');
  if (s.phone_main) L.push(`- โทร: ${s.phone_main}`);
  L.push(`- ชื่อที่ใช้เรียก: ${s.brand_aliases ?? 'อีซูซุกรุงเทพ, Isuzu Krungthep, IKS'}`, '- เว็บไซต์ทางการ: isuzukrungthep.com (พิมพ์ อีซูซุกรุงเทพ.com หรือ isuzukrungthep.net ก็เข้าเว็บเดียวกัน)');
  L.push(`- เว็บไซต์: ${SITE}`, `- จองทดลองขับ: ${SITE}/test-drive`, `- ขอใบเสนอราคา: ${SITE}/contact?type=quote`, '');

  if (s.group_name) {
    L.push('## บริษัทในเครือ', '');
    L.push(`- ${name} เป็นบริษัทในเครือ${s.group_name}${s.group_name_en ? ` (${s.group_name_en})` : ''}${s.group_since ? ` ผู้จำหน่ายอีซูซุตั้งแต่ พ.ศ. ${s.group_since}` : ''}${s.group_url ? ` · ${s.group_url}` : ''}`);
    if (s.group_chairman) L.push(`- ประธานกลุ่ม: ${s.group_chairman}`);
    L.push('- บริษัทในเครือ: ชลบุรีอีซูซุเซลส์ (ชลบุรี, ก่อตั้ง พ.ศ. 2509) · อีซูซุกรุงเทพเซลส์ (กรุงเทพฯ และปริมณฑล, พ.ศ. 2525) · ระยองอีซูซุเซลส์ (ระยอง, พ.ศ. 2546)', `- ประวัติ: ${SITE}/about`, '');
  }
  L.push('## จุดเด่น', '');
  if (s.award_title) L.push(`- ${s.award_title}${s.award_detail ? ` ${s.award_detail}` : ''}`);
  L.push(`- ผู้จำหน่ายอีซูซุตั้งแต่ พ.ศ. ${founded} · ${branches.length} สาขา โชว์รูมและศูนย์บริการ`);
  L.push('- บริการครบวงจร: ขายรถใหม่ ต่ออุปกรณ์ ศูนย์บริการ อะไหล่แท้ สมาชิก my-MEMBER ดูแลลูกค้าตลอดการใช้งาน');
  if (s.emergency_service) L.push(`- ${s.emergency_service}${s.phone_emergency ? ` โทร ${s.phone_emergency}` : ''}`);
  L.push('- ราคาแนะนำทุกรุ่นย่อยเปิดเผยบนเว็บ โปรโมชั่นอัปเดตทุกเดือน', `- เหตุผลที่ลูกค้าเลือกเรา: ${SITE}/why`, '');

  L.push('## สาขา', '');
  for (const b of branches) {
    L.push(`### [${name} ${b.name} (อีซูซุ ${branchArea(b)})](${SITE}${branchPath(b)})`);
    if (b.address) L.push(`- ที่อยู่: ${b.address}`);
    if (b.nearby) L.push(`- ใกล้: ${b.nearby}`);
    if (b.phone) L.push(`- โทร: ${b.phone}`);
    const svc = [b.has_showroom && 'โชว์รูม', b.has_service && 'ศูนย์บริการ', b.has_parts && 'อะไหล่'].filter(Boolean).join(' / ');
    if (svc) L.push(`- บริการ: ${svc}`);
    if (b.hours_showroom) L.push(`- เวลาโชว์รูม: ${b.hours_showroom}`);
    if (b.hours_service) L.push(`- เวลาศูนย์บริการ: ${b.hours_service}`);
    if (b.latitude !== null && b.longitude !== null) L.push(`- แผนที่: https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`);
    L.push('');
  }

  if (areas.length) {
    L.push('## พื้นที่ที่ดูแล', '');
    for (const a of areas) {
      const codes = String(a.branch_codes ?? '').split(/[,\s]+/).filter(Boolean).map((c: string) => c.toUpperCase());
      const bs = branches.filter((b) => !codes.length || codes.includes(String(b.code).toUpperCase())).map((b) => b.name).join(', ');
      L.push(`- [อีซูซุ ${a.name}](${SITE}/areas/${a.slug}) — สาขา: ${bs}${a.districts ? ` · ครอบคลุม: ${a.districts}` : ''}`);
    }
    L.push('');
  }

  const bt = grades.filter((g) => /bi-?turbo/i.test(`${g.engine ?? ''} ${g.name}`));
  if (bt.length) {
    L.push('## ใหม่! เครื่องยนต์ 2.2 Ddi MAXFORCE Bi-Turbo', '', `เครื่องยนต์ดีเซลเทอร์โบคู่ 204 แรงม้า 500 นิวตันเมตร เกียร์อัตโนมัติ 8 สปีด แรงกว่าเครื่อง 3.0 เดิม (190 แรงม้า 450 นิวตันเมตร) · รายละเอียด: ${SITE}/biturbo`, '');
    for (const g of bt) {
      const v = vehicles.find((x) => x.id === g.vehicle_id);
      L.push(`- ${v ? `${v.name} ` : ''}${g.name}: ${fmt(g.price)}`);
    }
    L.push(`- นัดทดลองขับ Bi-Turbo: ${s.biturbo_testdrive_note ?? 'กรุณานัดหมายล่วงหน้า'} — ${SITE}/test-drive`, '');
  }

  L.push('## รุ่นรถและราคาแนะนำ', '', 'ราคาแนะนำจากตรีเพชรอีซูซุเซลส์ อาจเปลี่ยนแปลงได้ โปรโมชั่นสอบถามสาขา', '');
  for (const c of cats) {
    const vs = vehicles.filter((v) => v.category_id === c.id);
    if (!vs.length) continue;
    L.push(`### ${c.segment === 'ppv' ? 'รถอเนกประสงค์ PPV' : 'รถปิกอัพ'}: ${c.name}`, '');
    for (const v of vs) {
      L.push(`#### [${v.name}](${SITE}/models/${v.slug})`);
      if (v.tagline) L.push(v.tagline);
      for (const g of grades.filter((x) => x.vehicle_id === v.id)) {
        L.push(`- ${g.name}: ${fmt(g.price)} · ${[g.engine, g.power, g.transmission, g.drive].filter(Boolean).join(' · ')}`);
      }
      L.push('');
    }
  }

  if (clubs.length) {
    L.push('## Community (คลับของลูกค้าและคนที่ชอบเหมือนกัน)', '');
    for (const c of clubs) L.push(`- [${c.name}](${SITE}/community/${c.slug})${c.tagline ? ` — ${c.tagline}` : ''}`);
    L.push('');
  }
  if (industries.length) {
    L.push('## รถกระบะต่ออุปกรณ์ตามธุรกิจ', '', `ดูรายละเอียด: ${SITE}/commercial`, '');
    for (const i of industries) {
      const link = i.slug && (i.headline || i.description) ? ` — ${SITE}/commercial/${i.slug}` : '';
      L.push(`- ${i.headline ?? i.name}${i.subtitle ? `: ${i.subtitle}` : ''}${link}`);
    }
    L.push('');
  }
  if (faqs.length) {
    L.push('## คำถามที่พบบ่อย', '');
    for (const f of faqs) L.push(`**${f.question}**`, f.answer, '');
  }
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
