import Link from 'next/link';
import { CalendarCheck, ChevronRight, FileText, Gauge, MapPin, Settings2, Zap } from 'lucide-react';
import { ShowroomBg } from '@/components/ShowroomBg';
import { PhotoSlideshow } from '@/components/PhotoSlideshow';
import { PhotoGallery } from '@/components/PhotoGallery';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import { getBranches, getGallery, getGrades, getSettings, getVehicles } from '@/lib/content';
import { formatPrice, mediaUrl } from '@/lib/format';
import { branchArea, branchPath } from '@/lib/branch';
import { pageMetadata } from '@/lib/page';
import { SITE_URL } from '@/lib/site';
import type { Faq, Vehicle, VehicleGrade } from '@/lib/types';

export const generateMetadata = () => pageMetadata('biturbo');

const isBT = (g: Pick<VehicleGrade, 'engine' | 'name'>) => /bi-?turbo/i.test(`${g.engine ?? ''} ${g.name}`);
const baht = (n: number | null) => (n === null ? 'สอบถามราคา' : `${formatPrice(n)} บาท`);

/** ตัวเลขเครื่องยนต์จากตรีเพชรอีซูซุเซลส์ (หน้า engine ของ isuzu-tis.com) */
const ENGINES = [
  { name: '2.2 Ddi MAXFORCE', power: '163', torque: '400', hi: false },
  { name: '2.2 Ddi MAXFORCE Bi-Turbo', power: '204', torque: '500', hi: true },
  { name: '3.0 Ddi MAXFORCE', power: '190', torque: '450', hi: false },
];

const TECH = [
  { t: 'ระบบอัดอากาศ Bi-Turbo', d: 'เทอร์โบคู่ ทำงานประสานกันตั้งแต่รอบต่ำถึงรอบสูง ให้แรงบิดมาเร็วและต่อเนื่อง' },
  { t: 'หัวฉีดแรงดันสูง Gi-BOOST', d: 'ฉีดน้ำมันละเอียดขึ้น เผาไหม้สมบูรณ์ ได้ทั้งกำลังและความประหยัด' },
  { t: 'ระบบหล่อเย็นและหล่อลื่น HIGH FLOW PERFORMANCE', d: 'ระบายความร้อนได้ดี รองรับการใช้งานหนักและบรรทุกต่อเนื่อง' },
  { t: 'ลูกสูบ ULTRA LOW FRICTION', d: 'เคลือบผิว EVOGLIDE TECH ลดแรงเสียดทาน พร้อมช่องระบายความร้อนพิเศษ' },
  { t: 'เสื้อสูบแกร่งพิเศษ EXTREME STRENGTH', d: 'รองรับแรงดันสูงของเครื่องยนต์ไบเทอร์โบ ทนทานระยะยาว' },
  { t: 'เกียร์อัตโนมัติ 8 สปีด', d: 'อัตราทดถี่ เปลี่ยนเกียร์นุ่ม เร่งแซงมั่นใจ และช่วยประหยัดน้ำมันที่ความเร็วเดินทาง' },
];

type Row = { g: VehicleGrade; v: Vehicle };

function faqs(rows: Row[], branches: string[], note: string): Faq[] {
  const q = (id: string, question: string, answer: string): Faq => ({ id: `bt-${id}`, group_key: 'biturbo', question, answer });
  const priced = rows.filter((r) => r.g.price !== null).sort((a, b) => Number(a.g.price) - Number(b.g.price));
  const list = rows.map((r) => `- ${r.g.name}: ${baht(r.g.price === null ? null : Number(r.g.price))}`).join('\n');
  return [
    q('what', 'อีซูซุ 2.2 Bi-Turbo คืออะไร?', 'เครื่องยนต์ดีเซลใหม่ 2.2 Ddi MAXFORCE Biturbo ของอีซูซุ ใช้เทอร์โบคู่ (Bi-Turbo) ให้กำลังสูงสุด 204 แรงม้า แรงบิด 500 นิวตันเมตร มากกว่าเครื่อง 3.0 เดิม (190 แรงม้า 450 นิวตันเมตร) ทั้งที่ความจุเล็กกว่า'),
    q('models', 'Bi-Turbo มีในรุ่นไหน ราคาเท่าไหร่?', `${rows.length ? `มี ${rows.length} รุ่นย่อย (ราคาแนะนำจากตรีเพชรอีซูซุเซลส์):\n${list}` : 'สอบถามรุ่นและราคาได้ที่ทีมขาย'}${priced[0] ? `\nราคาเริ่มต้น ${baht(Number(priced[0].g.price))}` : ''}`),
    q('vs30', 'Bi-Turbo ต่างจากเครื่อง 3.0 อย่างไร?', 'เครื่อง 2.2 Bi-Turbo ให้กำลัง 204 แรงม้า และแรงบิด 500 นิวตันเมตร สูงกว่าเครื่อง 3.0 (190 แรงม้า 450 นิวตันเมตร) ตามข้อมูลของตรีเพชรอีซูซุเซลส์ แรงกว่า เร่งแซงเร็วกว่า และประหยัดน้ำมันกว่าเมื่อเทียบกับเครื่อง 3.0 ในการขับนอกเมือง รุ่นท็อปที่เคยเป็นเครื่อง 3.0 (V-Cross M, Hi-Lander M, MU-X RS) เปลี่ยนมาใช้ Bi-Turbo แล้ว'),
    q('testdrive', 'ทดลองขับ Bi-Turbo ได้ที่ไหน?', `${note} นัดหมายได้ที่ปุ่ม "นัดทดลองขับ Bi-Turbo" ในหน้านี้ หรือโทรหาสาขา${branches.length ? ` ${branches.join(' ')}` : ''} ของอีซูซุกรุงเทพเซลส์`),
    q('buy', 'ซื้อ อีซูซุ Bi-Turbo ที่ไหนดี ใกล้บางนา ศรีนครินทร์ บางเสาธง เกษตร?', `อีซูซุกรุงเทพเซลส์ มี ${branches.length} สาขา (${branches.join(', ')}) จำหน่าย V-Cross, Hi-Lander 4 ประตู และ MU-X เครื่อง 2.2 Bi-Turbo ขอใบเสนอราคาออนไลน์ได้ ทีมขายจะคำนวณดาวน์ ค่างวด และโปรโมชั่นล่าสุดให้`),
    q('fuel', 'Bi-Turbo กินน้ำมันไหม?', 'อัตราสิ้นเปลืองตามฉลาก ECO Sticker ของรุ่น Bi-Turbo อยู่ราว 15.3 – 16.6 กม./ลิตร ขึ้นกับรุ่นและระบบขับเคลื่อน (ข้อมูลจากตรีเพชรอีซูซุเซลส์) ตรีเพชรระบุว่าประหยัดกว่าเครื่อง 3.0 ในการขับนอกเมือง'),
  ];
}

export default async function BiturboPage() {
  const [settings, vehicles, grades, branches, gallery] = await Promise.all([getSettings(), getVehicles(), getGrades(), getBranches(), getGallery('biturbo-')]);
  const photo = (g: (typeof gallery)[number]) => ({ src: mediaUrl(g.image)!, thumb: mediaUrl(g.thumb ?? g.image)!, alt: g.alt });
  const dmax = gallery.filter((g) => g.group_key === 'biturbo-dmax').map(photo);
  const mux = gallery.filter((g) => g.group_key === 'biturbo-mux').map(photo);
  // สไลด์โชว์: สลับ D-MAX / MU-X อย่างละไม่เกิน 4 รูป (เฉพาะรูปแนวนอน)
  const wide = (g: (typeof gallery)[number]) => !g.width || !g.height || g.width >= g.height * 1.2;
  const pick = (k: string) => gallery.filter((g) => g.group_key === k && wide(g)).slice(0, 4).map(photo);
  const [sa, sb] = [pick('biturbo-dmax'), pick('biturbo-mux')];
  const slides = Array.from({ length: Math.max(sa.length, sb.length) }, (_, k) => [sa[k], sb[k]]).flat().filter(Boolean) as ReturnType<typeof photo>[];
  const byId = new Map(vehicles.map((v) => [v.id, v]));
  const rows: Row[] = grades.filter(isBT).flatMap((g) => { const v = byId.get(g.vehicle_id); return v ? [{ g, v }] : []; })
    .sort((a, b) => (a.g.price === null ? 1 : b.g.price === null ? -1 : Number(a.g.price) - Number(b.g.price)));
  const from = rows.find((r) => r.g.price !== null)?.g.price ?? null;
  const models = [...new Map(rows.map((r) => [r.v.id, r.v])).values()];
  const note = settings.biturbo_testdrive_note ?? 'รถทดลองขับมีจำนวนจำกัด กรุณานัดหมายล่วงหน้า';
  const img = mediaUrl(settings.biturbo_image);
  const areas = branches.map((b) => branchArea(b));
  const tdModel = models.find((v) => v.slug === 'v-cross') ?? models[0];
  const testDrive = `/test-drive${tdModel ? `?model=${tdModel.slug}` : ''}`;
  const items = faqs(rows, areas, note);

  return (
    <>
      <section className="relative overflow-hidden bg-[#060a14] text-white">
        {slides.length > 0 ? (
          <div className="relative aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
            <PhotoSlideshow images={slides} />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#060a14] to-transparent lg:hidden" aria-hidden />
            <span className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-[#060a14]/95 via-[#060a14]/70 via-40% to-transparent to-75% lg:block" aria-hidden />
          </div>
        ) : <ShowroomBg dim />}
        {img && !slides.length && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="เครื่องยนต์ อีซูซุ 2.2 Ddi MAXFORCE Bi-Turbo" className="absolute inset-y-0 right-0 hidden h-full w-[58%] object-cover [mask-image:linear-gradient(to_right,transparent,black_35%)] lg:block" />
        )}
        <div className={`container-x pointer-events-none relative grid gap-8 pb-12 lg:min-h-[600px] lg:content-center lg:py-16 ${slides.length ? '-mt-6 pt-0 lg:mt-0' : 'pt-14'}`}>
          <div className="pointer-events-auto max-w-[760px]">
            <p className="inline-flex items-center gap-2 rounded-full bg-red px-3 py-1 font-display text-[13px] font-bold tracking-[0.08em] text-white"><Zap size={14} aria-hidden />ใหม่! เครื่องยนต์ไบเทอร์โบ</p>
            <h1 className="mt-4 font-display leading-[1.05]">
              <span className="text-chrome-xl block text-[clamp(40px,7vw,86px)] font-extrabold uppercase">2.2 Bi-Turbo</span>
              <span className="mt-2 block text-[clamp(20px,2.6vw,30px)] font-bold text-white/90">อีซูซุ 2.2 Ddi MAXFORCE Biturbo</span>
            </h1>
            <span className="red-streak mt-4 block" style={{ width: 'min(80%, 420px)' }} aria-hidden />
            <dl className="mt-7 grid max-w-[620px] grid-cols-3 gap-3">
              {[['204', 'แรงม้า'], ['500', 'นิวตันเมตร'], ['8', 'สปีด อัตโนมัติ']].map(([n, u]) => (
                <div key={u} className="rounded-[var(--radius-card)] border border-white/15 bg-white/5 px-3 py-4 text-center backdrop-blur-sm">
                  <dt className="sr-only">{u}</dt>
                  <dd><span className="text-gold block font-display text-[clamp(34px,5vw,56px)] font-extrabold leading-none">{n}</span><span className="mt-1 block text-[14px] text-white/80 sm:text-[15px]">{u}</span></dd>
                </div>
              ))}
            </dl>
            {from !== null && <p className="mt-6 text-[17px] text-white/85">มีใน {models.map((v) => v.name.replace(/^ISUZU\s+/, '')).join(' · ')} <span className="whitespace-nowrap">ราคาเริ่มต้น <b className="text-white">{baht(Number(from))}</b></span></p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={testDrive} className="btn btn-primary"><CalendarCheck size={18} aria-hidden />นัดทดลองขับ Bi-Turbo</Link>
              <Link href="/contact?type=quote" className="btn btn-ghost-light"><FileText size={18} aria-hidden />ขอใบเสนอราคา</Link>
            </div>
            <p className="mt-3 max-w-[620px] text-[14px] text-white/70">{note}</p>
          </div>
        </div>
      </section>

      {rows.length > 0 && (
        <SectionShell tone="mist">
          <SectionHeading title="รุ่นที่มีเครื่อง 2.2 Bi-Turbo" subtitle="ราคาแนะนำจากตรีเพชรอีซูซุเซลส์ อาจเปลี่ยนแปลงได้ · ขอใบเสนอราคาเพื่อรับโปรโมชั่นล่าสุด" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ g, v }) => (
              <li key={g.id} className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white hover:border-copper">
                <div className="stage relative aspect-[16/9] overflow-hidden">
                  {v.image_cutout && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(v.image_cutout)!} alt={v.name} loading="lazy" className="stage-car absolute inset-x-[8%] top-[6%] h-[80%] w-[84%] object-contain object-bottom" />
                  )}
                  <span className="absolute left-3 top-3 rounded bg-red px-2.5 py-1 font-display text-xs font-bold text-white">BI-TURBO</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[14px] font-semibold text-copper-dark">{v.name}</p>
                  <h3 className="mt-0.5 text-[19px] font-bold leading-snug text-navy">
                    <Link href={`/models/${v.slug}`} className="after:absolute after:inset-0">{g.name}</Link>
                  </h3>
                  <p className="mt-1 text-[14px] text-steel">{[g.transmission, g.drive && (g.drive === '4x2' ? 'ขับเคลื่อน 2 ล้อ' : 'ขับเคลื่อน 4 ล้อ')].filter(Boolean).join(' · ')}</p>
                  <p className="mt-auto pt-4 font-display text-[22px] font-bold text-red">{baht(g.price === null ? null : Number(g.price))}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionShell>
      )}

      {(dmax.length > 0 || mux.length > 0) && (
        <SectionShell tone="navy">
          <SectionHeading title="ภาพรถจริง D-MAX และ MU-X Bi-Turbo" subtitle="กดที่รูปเพื่อดูเต็มจอ" light />
          <PhotoGallery light name="อีซูซุ 2.2 Bi-Turbo" groups={[{ key: 'dmax', label: 'D-MAX Bi-Turbo', photos: dmax }, { key: 'mux', label: 'MU-X Bi-Turbo', photos: mux }]} />
        </SectionShell>
      )}

      <SectionShell>
        <SectionHeading title="เทียบเครื่องยนต์อีซูซุ" subtitle="แรงกว่าเครื่อง 3.0 แต่ความจุเล็กกว่า · ข้อมูลจากตรีเพชรอีซูซุเซลส์" />
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
          <table className="w-full min-w-[560px] text-left text-[16px]">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 font-display font-semibold">เครื่องยนต์</th>
                <th className="px-4 py-3 font-display font-semibold"><Gauge size={16} className="mr-1 inline" aria-hidden />แรงม้า</th>
                <th className="px-4 py-3 font-display font-semibold"><Settings2 size={16} className="mr-1 inline" aria-hidden />แรงบิด (นิวตันเมตร)</th>
              </tr>
            </thead>
            <tbody>
              {ENGINES.map((e) => (
                <tr key={e.name} className={e.hi ? 'bg-red/5 font-bold text-navy' : 'border-t border-line text-ink'}>
                  <td className="px-4 py-3">{e.name}{e.hi && <span className="ml-2 rounded bg-red px-1.5 py-0.5 align-middle text-[11px] font-bold text-white">ใหม่</span>}</td>
                  <td className="px-4 py-3">{e.power}</td>
                  <td className="px-4 py-3">{e.torque}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-steel">อัตราสิ้นเปลืองแตกต่างตามรุ่นและระบบขับเคลื่อน ดูได้ในหน้ารุ่นรถแต่ละรุ่น</p>
      </SectionShell>

      <SectionShell tone="navy">
        <SectionHeading title="เทคโนโลยีในเครื่อง Bi-Turbo" light />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH.map((x, i) => (
            <li key={x.t} className="rounded-[var(--radius-card)] border border-white/12 bg-white/5 p-5">
              <span className="font-display text-[14px] font-bold text-copper-light">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-1 font-display text-[18px] font-bold text-white">{x.t}</p>
              <p className="mt-1 text-[15px] text-white/75">{x.d}</p>
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell tone="mist">
        <div className="grid items-center gap-6 rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-[26px] font-bold text-navy sm:text-[30px]">นัดทดลองขับ Bi-Turbo</h2>
            <p className="mt-2 text-[16px] text-steel">{note}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {branches.map((b) => <li key={b.id}><Link href={branchPath(b)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[15px] font-semibold text-navy hover:border-copper"><MapPin size={15} className="text-copper-dark" aria-hidden />อีซูซุ {branchArea(b)}</Link></li>)}
            </ul>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <Link href={testDrive} className="btn btn-primary w-full lg:w-auto"><CalendarCheck size={18} aria-hidden />นัดทดลองขับ</Link>
            <Link href="/contact?type=quote" className="btn btn-ghost w-full lg:w-auto">ขอใบเสนอราคา<ChevronRight size={18} aria-hidden /></Link>
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHeading title="ถาม-ตอบ อีซูซุ 2.2 Bi-Turbo" />
        <FaqList items={items} />
      </SectionShell>

      {rows.length > 0 && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'อีซูซุ 2.2 Ddi MAXFORCE Bi-Turbo ทุกรุ่น',
          image: [...dmax, ...mux].slice(0, 10).map((p) => `${SITE_URL}${p.src}`),
          itemListElement: rows.map(({ g, v }, i) => ({
            '@type': 'ListItem', position: i + 1,
            item: {
              '@type': 'Car', name: `${v.name} ${g.name}`, brand: { '@type': 'Brand', name: 'ISUZU' }, url: `${SITE_URL}/models/${v.slug}`,
              image: v.image_cutout ? `${SITE_URL}${mediaUrl(v.image_cutout)}` : undefined,
              vehicleEngine: { '@type': 'EngineSpecification', name: '2.2 Ddi MAXFORCE Biturbo', enginePower: { '@type': 'QuantitativeValue', value: 204, unitText: 'PS' }, torque: { '@type': 'QuantitativeValue', value: 500, unitCode: 'NU' } },
              vehicleTransmission: g.transmission ?? undefined, driveWheelConfiguration: g.drive ?? undefined,
              offers: g.price !== null ? { '@type': 'Offer', price: Number(g.price), priceCurrency: 'THB', availability: 'https://schema.org/InStock', seller: { '@id': `${SITE_URL}/#org` } } : undefined,
            },
          })),
        }} />
      )}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: '2.2 Bi-Turbo', item: `${SITE_URL}/biturbo` },
        ],
      }} />
    </>
  );
}
