import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { HighlightGrid, VehicleCard } from '@/components/Cards';
import { WhaleBox } from '@/components/WhaleBox';
import { EquipmentStrip } from '@/components/EquipmentStrip';
import { TrustStrip } from '@/components/TrustStrip';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import {
  getBranches, getFaqs, getGrades, getHero, getHighlights, getIndustries, getSections, getSettings, getVehicleCategories, getVehicles,
} from '@/lib/content';
import { getReviewData } from '@/lib/reviews';
import { pageMetadata, Sections } from '@/lib/page';
import { SITE_URL } from '@/lib/site';

export const generateMetadata = () => pageMetadata('models');

const TABS = [
  { key: 'pickup', label: 'รถปิกอัพ' },
  { key: 'ppv', label: 'รถอเนกประสงค์ PPV' },
] as const;

const ENGINES = [
  { key: '', label: 'ทุกเครื่องยนต์', test: () => true },
  { key: 'biturbo', label: '2.2 Bi-Turbo', test: (e: string) => /bi-?turbo/i.test(e) },
  { key: '22', label: '2.2 MAXFORCE', test: (e: string) => /^2\.2/.test(e) && !/bi-?turbo/i.test(e) },
  { key: '30', label: '3.0', test: (e: string) => /^3\.0/.test(e) },
] as const;

export default async function ModelsPage({ searchParams }: { searchParams: Promise<{ type?: string; engine?: string }> }) {
  const { type, engine } = await searchParams;
  const tab = type === 'ppv' ? 'ppv' : 'pickup';
  const eng = ENGINES.find((e) => e.key && e.key === engine) ?? ENGINES[0];
  const [sections, hero, hl, settings, categories, vehicles, industries, faqs, branches, reviews] = await Promise.all([
    getSections('models'), getHero('models'), getHighlights(), getSettings(), getVehicleCategories(), getVehicles(),
    getIndustries(), getFaqs('general'), getBranches(), getReviewData(),
  ]);
  const grades = await getGrades();
  const matches = (vid: string) => grades.filter((g) => g.vehicle_id === vid && eng.test(`${g.engine ?? ''} ${g.name.replace(/^[A-Za-z-]+\s+/, '')}`.trim()));
  // กรองเครื่องยนต์แล้ว: ราคาเริ่มต้นบนการ์ด = ราคาต่ำสุดของรุ่นย่อยที่ใช้เครื่องนั้น
  const withEnginePrice = <T extends { id: string; price_from: number | null }>(v: T): T => {
    if (!eng.key) return v;
    const p = matches(v.id).map((g) => (g.price === null ? null : Number(g.price))).filter((n): n is number => n !== null);
    return p.length ? { ...v, price_from: Math.min(...p) } : v;
  };
  const hasEngine = (vid: string) => !eng.key || grades.some((g) => g.vehicle_id === vid && eng.test(`${g.engine ?? ''} ${g.name.replace(/^[A-Za-z-]+\s+/, '')}`.trim()));
  const groups = categories
    .filter((c) => c.segment === tab)
    .map((c) => ({ c, list: vehicles.filter((v) => v.category_id === c.id && hasEngine(v.id)).map(withEnginePrice) }))
    .filter((g) => g.list.length > 0);
  const all = categories.filter((c) => c.segment === 'pickup' || c.segment === 'ppv')
    .flatMap((c) => vehicles.filter((v) => v.category_id === c.id));

  const browser = (
    <section id="browse" className="scroll-mt-[109px] bg-white 2xl:scroll-mt-[79px]">
      <div className="bg-navy-950">
        <div className="container-x flex gap-1.5 pt-6" role="tablist" aria-label="ประเภทรถ">
          {TABS.map((t) => (
            <Link key={t.key} href={`/models?type=${t.key}${eng.key ? `&engine=${eng.key}` : ''}#browse`} role="tab" aria-selected={tab === t.key} scroll={false}
              className={`rounded-t-[var(--radius-card)] px-5 py-3.5 font-display text-[16px] font-bold sm:px-7 sm:text-[17px] ${tab === t.key ? 'bg-white text-navy' : 'bg-white/8 text-white hover:bg-white/15'}`}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="container-x flex flex-wrap items-center gap-2 pb-2 pt-5" aria-label="กรองตามเครื่องยนต์">
        <span className="mr-1 text-[15px] font-semibold text-steel">เครื่องยนต์:</span>
        {ENGINES.map((e) => (
          <Link key={e.key || 'all'} href={`/models?type=${tab}${e.key ? `&engine=${e.key}` : ''}#browse`} scroll={false} aria-current={eng.key === e.key ? 'true' : undefined}
            className={`rounded-full px-4 py-1.5 font-display text-[15px] font-semibold ${eng.key === e.key ? (e.key === 'biturbo' ? 'bg-red text-white' : 'bg-navy text-white') : e.key === 'biturbo' ? 'border border-red/40 text-red hover:bg-red/5' : 'border border-line text-navy hover:border-copper'}`}>
            {e.label}
          </Link>
        ))}
        {eng.key === 'biturbo' && <Link href="/biturbo" className="ml-1 text-[15px] font-semibold text-copper-dark hover:underline">รู้จักเครื่อง Bi-Turbo →</Link>}
      </div>
      {groups.length === 0 && <p className="container-x py-10 text-[16px] text-steel">ไม่มีรุ่นที่ใช้เครื่องยนต์นี้ในหมวดนี้ ลองเลือกแท็บอื่น</p>}
      {groups.length > 1 && (
        <nav aria-label="กลุ่มรุ่นรถ" className="sticky top-[109px] z-20 border-b border-line bg-white/95 backdrop-blur 2xl:top-[79px]">
          <ul className="container-x flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
            {groups.map(({ c }) => (
              <li key={c.id} className="shrink-0">
                <a href={`#g-${c.slug}`} className="block whitespace-nowrap rounded-full border border-line px-4 py-2 font-display text-[15px] font-semibold text-navy hover:border-copper">{c.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="container-x pb-6">
        {groups.map(({ c, list }, i) => (
          <div key={c.id} id={`g-${c.slug}`} className="scroll-mt-[170px] pt-10 sm:pt-12 2xl:scroll-mt-36">
            <div className="mb-5 flex items-center gap-3">
              <span className="copper-metal flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold text-white">{i + 1}</span>
              <div>
                <h2 className="text-[24px] font-bold sm:text-[28px]">{c.name}</h2>
                {c.subtitle && <p className="text-[15px] text-steel">{c.subtitle}</p>}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((v) => <VehicleCard key={v.id} v={v} />)}
            </div>
            {c.slug === 'commercial-pickup' && <EquipmentStrip items={industries} />}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <>
      <Sections
        list={sections}
        render={{
          hero: () => (
            <>
              <Hero slides={hero} fallbackTitle="รุ่นรถอีซูซุ" />
              <div className="border-b border-line bg-mist">
                <div className="container-x py-6">
                  <TrustStrip settings={settings} branches={branches.length} rating={reviews.overall} />
                </div>
              </div>
            </>
          ),
          categories: () => browser,
          happy_whale_box: (s) => (
            <div className="container-x py-10"><WhaleBox s={s} settings={settings} items={hl.whale_help} /></div>
          ),
          faq: (s) =>
            faqs.length > 0 && (
              <SectionShell tone="mist">
                <SectionHeading title={s.title ?? 'คำถามที่พบบ่อย'} subtitle={s.subtitle} />
                <FaqList items={faqs} />
              </SectionShell>
            ),
          trust_bar: () =>
            (hl.models_trust?.length ?? 0) > 0 && (
              <SectionShell tone="mist" className="border-t border-line">
                <HighlightGrid items={hl.models_trust} cols={5} />
              </SectionShell>
            ),
        }}
      />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'รุ่นรถอีซูซุ อีซูซุกรุงเทพเซลส์',
        itemListElement: all.map((v, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/models/${v.slug}`, name: v.name })),
      }} />
    </>
  );
}
