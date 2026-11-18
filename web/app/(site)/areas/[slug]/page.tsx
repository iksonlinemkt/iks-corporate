import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarCheck, ChevronRight, FileText, LifeBuoy, MapPin, Trophy } from 'lucide-react';
import { ShowroomBg } from '@/components/ShowroomBg';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { BranchCard, PromoCard } from '@/components/Cards';
import { Rail } from '@/components/Rail';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import { getAreas, getBranches, getPromotions, getSettings } from '@/lib/content';
import { getReviewData } from '@/lib/reviews';
import { branchArea, branchPath } from '@/lib/branch';
import { SITE_URL } from '@/lib/site';
import type { Area, Branch, Faq, Settings } from '@/lib/types';

const list = (s: string | null | undefined) => (s ?? '').split(/[,\n、·]/).map((x) => x.trim()).filter(Boolean);

async function findArea(slug: string) {
  const [areas, all] = await Promise.all([getAreas(), getBranches()]);
  const area = areas.find((a) => a.slug === slug) ?? null;
  const codes = list(area?.branch_codes).map((c) => c.toUpperCase());
  const branches = codes.length ? all.filter((b) => codes.includes(b.code.toUpperCase())) : all;
  return { area, branches, areas };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [{ area, branches }, settings] = await Promise.all([findArea(slug), getSettings()]);
  if (!area) return {};
  const title = area.headline ?? `อีซูซุ ${area.name} โชว์รูมและศูนย์บริการ | อีซูซุกรุงเทพเซลส์`;
  const description = [
    `อีซูซุ${area.name} — อีซูซุกรุงเทพเซลส์ ${branches.length} สาขาใกล้คุณ: ${branches.map((b) => branchArea(b)).join(' ')}`,
    settings.award_title,
    'บริการครบวงจร ช่วยเหลือฉุกเฉิน 24 ชม.',
  ].filter(Boolean).join(' · ').slice(0, 165);
  const path = `/areas/${area.slug}`;
  return {
    title: { absolute: title }, description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'อีซูซุกรุงเทพเซลส์', locale: 'th_TH', type: 'website', images: ['/cover/showroom.webp'] },
  };
}

function areaFaqs(a: Area, branches: Branch[], s: Settings): Faq[] {
  const q = (id: string, question: string, answer: string | false | null | undefined): Faq[] =>
    answer ? [{ id: `${a.slug}-${id}`, group_key: 'area', question, answer }] : [];
  const districts = list(a.districts);
  const where = branches.map((b) => `- ${b.name}: ${b.address ?? ''}${b.phone ? ` โทร ${b.phone}` : ''}`).join('\n');
  return [
    ...q('where', `อีซูซุ ${a.name} มีที่ไหนบ้าง?`, branches.length > 0 && `อีซูซุกรุงเทพเซลส์ ดูแลลูกค้า${a.name}ด้วย ${branches.length} สาขา (โชว์รูม + ศูนย์บริการ):\n${where}`),
    ...districts.slice(0, 3).flatMap((d, i) => q(`d${i}`, `อยู่${d} ซื้อรถหรือเข้าศูนย์อีซูซุที่ไหนสะดวก?`,
      `ลูกค้าย่าน${d}เลือกได้ทั้ง ${branches.map((b) => b.name).join(' ')} ของอีซูซุกรุงเทพเซลส์ จองทดลองขับ ขอใบเสนอราคา และจองนัดเข้าศูนย์บริการได้ออนไลน์`)),
    ...q('why', `ทำไมคน${a.name}เลือกอีซูซุกรุงเทพเซลส์?`, [
      s.award_title && `${s.award_title} ${s.award_detail ?? ''}`.trim(),
      `ผู้จำหน่ายอีซูซุตั้งแต่ พ.ศ. ${s.founded_year ?? '2525'}`,
      'บริการครบวงจร ขาย ต่ออุปกรณ์ ศูนย์บริการ อะไหล่แท้ ดูแลลูกค้าตลอดการใช้งาน',
      'ราคาแนะนำทุกรุ่นเปิดเผยบนเว็บ โปรโมชั่นอัปเดตทุกเดือน',
    ].filter(Boolean).join(' · ')),
    ...q('24h', `รถอีซูซุเสียใน${a.name} มีบริการช่วยเหลือฉุกเฉินไหม?`, s.emergency_service && `มี ${s.emergency_service}${s.phone_emergency ? ` โทร ${s.phone_emergency}` : ' ติดต่อสาขาที่ใกล้ที่สุดได้ทันที'}`),
  ];
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ area: a, branches, areas }, settings, reviews, promosAll] = await Promise.all([findArea(slug), getSettings(), getReviewData(), getPromotions()]);
  if (!a) notFound();
  const districts = list(a.districts);
  const faqs = areaFaqs(a, branches, settings);
  const promos = promosAll.slice(0, 3);
  const others = areas.filter((x) => x.slug !== a.slug);
  const path = `/areas/${a.slug}`;
  const company = settings.company_name_th ?? 'อีซูซุกรุงเทพเซลส์';

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <ShowroomBg />
        <div className="container-x relative flex min-h-[280px] flex-col justify-end pb-10 pt-16 sm:min-h-[320px] lg:min-h-[380px] lg:justify-center lg:py-14">
          <p className="mb-2 font-display text-[13px] font-semibold tracking-[0.18em] text-copper-light sm:text-[14px]">ISUZU KRUNGTHEP SALES</p>
          <h1 className="text-[34px] font-bold leading-tight sm:text-[46px] lg:text-[54px]"><span className="text-chrome">อีซูซุ {a.name}</span></h1>
          <span className="red-streak mt-4 block" style={{ width: 'min(70%, 380px)' }} aria-hidden />
          <p className="mt-4 max-w-[760px] text-[17px] text-white/85 sm:text-[19px]">{a.intro ?? `${company} ${branches.length} สาขา โชว์รูมและศูนย์บริการ ใกล้คุณ`}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact?type=quote" className="btn btn-primary"><FileText size={18} aria-hidden />ขอใบเสนอราคา</Link>
            <Link href="/contact#booking" className="btn btn-ghost-light"><CalendarCheck size={18} aria-hidden />จองนัดเข้าศูนย์</Link>
          </div>
        </div>
      </section>

      <SectionShell tone="mist">
        <SectionHeading title={`สาขาที่ดูแลลูกค้า${a.name}`} />
        <div className={`grid gap-5 sm:grid-cols-2 ${branches.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {branches.map((b) => <BranchCard key={b.id} b={b} rating={reviews.byBranch.get(b.id)} />)}
        </div>
        {districts.length > 0 && (
          <div className="mt-8">
            <p className="font-display text-[17px] font-bold text-navy">พื้นที่ที่เราดูแล</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {districts.map((d) => <li key={d} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3.5 py-1.5 text-[15px] text-ink"><MapPin size={14} className="text-copper-dark" aria-hidden />อีซูซุ {d}</li>)}
            </ul>
          </div>
        )}
      </SectionShell>

      <SectionShell>
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            settings.award_title && { I: Trophy, t: settings.award_title, d: settings.award_detail ?? '' },
            { I: MapPin, t: `ตั้งแต่ พ.ศ. ${settings.founded_year ?? '2525'}`, d: 'บริการครบวงจร ดูแลลูกค้าตลอดการใช้งาน' },
            settings.emergency_service && { I: LifeBuoy, t: 'ช่วยเหลือฉุกเฉิน 24 ชม.', d: settings.phone_emergency ? `โทร ${settings.phone_emergency}` : settings.emergency_service },
          ].filter(Boolean).map((x) => { const { I, t, d } = x as { I: typeof Trophy; t: string; d: string }; return (
            <li key={t} className="flex items-start gap-3 rounded-[var(--radius-card)] border border-line p-5">
              <span className="copper-metal flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"><I size={22} aria-hidden /></span>
              <div><p className="font-display text-[17px] font-bold text-navy">{t}</p><p className="text-[15px] text-steel">{d}</p></div>
            </li>
          ); })}
        </ul>
        <p className="mt-5"><Link href="/why" className="inline-flex items-center gap-1 font-display text-[16px] font-semibold text-copper-dark hover:underline">ทำไมต้องอีซูซุกรุงเทพเซลส์<ChevronRight size={16} aria-hidden /></Link></p>
      </SectionShell>

      {promos.length > 0 && (
        <SectionShell tone="navy">
          <SectionHeading title={`โปรโมชั่นอีซูซุ ${a.name}`} link="/promotions" linkLabel="ดูทั้งหมด" light />
          <Rail>{promos.map((p) => <PromoCard key={p.id} p={p} compact />)}</Rail>
        </SectionShell>
      )}

      {faqs.length > 0 && (
        <SectionShell tone="mist">
          <SectionHeading title={`ถาม-ตอบ อีซูซุ ${a.name}`} />
          <FaqList items={faqs} />
        </SectionShell>
      )}

      {others.length > 0 && (
        <SectionShell>
          <SectionHeading title="พื้นที่อื่นที่เราดูแล" />
          <ul className="flex flex-wrap gap-3">
            {others.map((o) => <li key={o.id}><Link href={`/areas/${o.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-display text-[16px] font-semibold text-navy hover:border-copper"><MapPin size={17} className="text-copper-dark" aria-hidden />อีซูซุ {o.name}</Link></li>)}
          </ul>
        </SectionShell>
      )}

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'AutoDealer',
        '@id': `${SITE_URL}${path}#dealer`,
        name: `${company} — อีซูซุ ${a.name}`,
        url: `${SITE_URL}${path}`,
        brand: { '@type': 'Brand', name: 'ISUZU' },
        parentOrganization: { '@id': `${SITE_URL}/#org` },
        areaServed: [a.name, ...districts].map((n) => ({ '@type': 'Place', name: n })),
        department: branches.map((b) => ({ '@id': `${SITE_URL}/#branch-${b.code.toLowerCase()}`, '@type': 'AutoDealer', name: `${company} ${b.name}`, url: `${SITE_URL}${branchPath(b)}` })),
        award: settings.award_title ? `${settings.award_title} ${settings.award_detail ?? ''}`.trim() : undefined,
        keywords: [`อีซูซุ ${a.name}`, `อีซูซุ${a.name}`, ...districts.map((d) => `อีซูซุ ${d}`)].join(', '),
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: `อีซูซุ ${a.name}`, item: `${SITE_URL}${path}` },
        ],
      }} />
    </>
  );
}
