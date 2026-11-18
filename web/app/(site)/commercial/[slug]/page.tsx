import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, MessageCircle, Phone } from 'lucide-react';
import { ShowroomBg } from '@/components/ShowroomBg';
import { IndustryCard } from '@/components/IndustryCard';
import { RichLines } from '@/components/RichLines';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { VehicleCard } from '@/components/Cards';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import { getBranches, getFaqs, getIndustries, getSettings, getVehicleCategories, getVehicles } from '@/lib/content';
import { lineHref, mediaUrl, telHref } from '@/lib/format';
import { branchArea, branchPath } from '@/lib/branch';
import { SITE_URL } from '@/lib/site';

const STEPS = [
  ['ปรึกษาทีมรถเพื่อการพาณิชย์', 'บอกลักษณะงาน สินค้าที่บรรทุก และงบประมาณ'],
  ['เลือกรุ่นรถและแบบอุปกรณ์', 'แนะนำรุ่นและขนาดตัวถังให้เหมาะกับงาน'],
  ['รับใบเสนอราคา', 'ราคารถพร้อมอุปกรณ์ และทางเลือกสินเชื่อ'],
  ['รับรถพร้อมใช้งาน', 'ดูแลต่อเนื่องด้วยศูนย์บริการ 4 สาขา'],
] as const;

async function findUpfit(slug: string) {
  const all = await getIndustries();
  const it = all.find((i) => i.slug === slug && (i.headline || i.description));
  return { it: it ?? null, all };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { it } = await findUpfit(slug);
  if (!it) return {};
  const head = it.headline ?? `กระบะอีซูซุ ${it.name}`;
  const title = `${head} | อีซูซุกรุงเทพเซลส์`.slice(0, 90);
  const first = (it.description ?? '').split('\n')[0];
  const description = `${first} ขอใบเสนอราคารวมอุปกรณ์ที่อีซูซุกรุงเทพเซลส์ 4 สาขาในกรุงเทพฯ`.slice(0, 160);
  const img = mediaUrl(it.image);
  return {
    title, description,
    alternates: { canonical: `/commercial/${slug}` },
    openGraph: { title, description, url: `/commercial/${slug}`, siteName: 'อีซูซุกรุงเทพเซลส์', locale: 'th_TH', type: 'website', images: img ? [img] : undefined },
  };
}

export default async function UpfitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ it, all }, settings, categories, vehicles, faqs, branches] = await Promise.all([
    findUpfit(slug), getSettings(), getVehicleCategories(), getVehicles(), getFaqs('commercial'), getBranches(),
  ]);
  if (!it) notFound();
  const head = it.headline ?? `กระบะอีซูซุ ${it.name}`;
  const images = [...new Set([it.image, ...(it.gallery ?? [])].map((p) => mediaUrl(p)).filter((u): u is string => !!u))];
  const comCat = categories.find((c) => c.slug === 'commercial-pickup');
  const models = comCat ? vehicles.filter((v) => v.category_id === comCat.id) : [];
  const others = all.filter((x) => x.id !== it.id && x.slug && (x.headline || x.description));
  const tel = telHref(settings.phone_main);
  const line = settings.line_oa_url ?? lineHref(settings.line_oa_id);
  const quote = `/contact?type=commercial#form`;
  const bg = images[0];

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        {bg ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
            <span className="absolute inset-0 bg-linear-to-t from-[#060a14]/95 via-[#060a14]/75 to-[#060a14]/40 lg:bg-linear-to-r lg:from-[#060a14]/95 lg:via-[#060a14]/75 lg:to-[#060a14]/25" aria-hidden />
          </>
        ) : <ShowroomBg />}
        <div className="container-x relative flex min-h-[260px] flex-col justify-end pb-10 pt-14 sm:min-h-[320px] lg:min-h-[380px] lg:justify-center lg:py-14">
          <nav aria-label="breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-[14px] text-white/70">
            <Link href="/commercial" className="hover:text-white">รถเพื่อการพาณิชย์</Link><ChevronRight size={14} aria-hidden /><span>{it.name}</span>
          </nav>
          <h1 className="max-w-[820px] text-[32px] font-bold leading-tight sm:text-[44px] lg:text-[52px]"><span className="text-chrome">{head}</span></h1>
          <span className="red-streak mt-4 block" style={{ width: 'min(70%, 380px)' }} aria-hidden />
          {it.subtitle && <p className="mt-4 text-[17px] text-white/85 sm:text-[19px]">{it.subtitle}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={quote} className="btn btn-primary"><FileText size={18} aria-hidden />ขอใบเสนอราคารวมอุปกรณ์</Link>
            {line && <a href={line} target="_blank" rel="noopener" className="btn btn-ghost-light"><MessageCircle size={18} aria-hidden />ปรึกษาทาง LINE</a>}
          </div>
        </div>
      </section>

      <SectionShell>
        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {images.length > 0 ? (
            <IndustryCard name={head} images={images} href={quote} aspect="aspect-[4/3]" showName={false} />
          ) : <div className="ph-dark aspect-[4/3] rounded-[var(--radius-card)]" />}
          <div>
            <h2 className="mb-4 text-[24px] font-bold sm:text-[28px]"><span className="text-navy-metal">รายละเอียด</span></h2>
            <RichLines text={it.description} className="text-ink" />
            {it.models_text && (
              <p className="mt-6 rounded-[var(--radius-card)] bg-mist p-4 text-[16px]"><strong className="font-display font-bold text-navy">รุ่นที่เหมาะ:</strong> {it.models_text}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={quote} className="btn btn-primary">ขอใบเสนอราคา</Link>
              {tel && <a href={tel} className="btn btn-ghost"><Phone size={17} aria-hidden />โทร {settings.phone_main}</a>}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell tone="mist">
        <SectionHeading title="ขั้นตอนซื้อรถพร้อมต่ออุปกรณ์" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="rounded-[var(--radius-card)] border border-line bg-white p-5">
              <span className="copper-metal flex h-10 w-10 items-center justify-center rounded-full font-display font-bold text-white">{i + 1}</span>
              <p className="mt-3 font-display text-[17px] font-bold">{t}</p>
              <p className="mt-1 text-[15px] text-steel">{d}</p>
            </li>
          ))}
        </ol>
      </SectionShell>

      {models.length > 0 && (
        <SectionShell>
          <SectionHeading title="รุ่นรถสำหรับต่ออุปกรณ์" subtitle="ราคารถตามรุ่นย่อย (ยังไม่รวมอุปกรณ์)" link="/models?type=pickup#g-commercial-pickup" linkLabel="ดูทุกรุ่น" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{models.map((v) => <VehicleCard key={v.id} v={v} />)}</div>
        </SectionShell>
      )}

      {faqs.length > 0 && (
        <SectionShell tone="mist">
          <SectionHeading title="คำถามที่พบบ่อย รถเพื่อการพาณิชย์" />
          <FaqList items={faqs} />
        </SectionShell>
      )}

      <SectionShell>
        {others.length > 0 && (
          <>
            <SectionHeading title="รถต่ออุปกรณ์แบบอื่น" />
            <ul className="flex flex-wrap gap-3">
              {others.map((o) => (
                <li key={o.id}><Link href={`/commercial/${o.slug}`} className="block rounded-full border border-line px-5 py-2.5 font-display text-[15px] font-semibold text-navy hover:border-copper">{o.name}</Link></li>
              ))}
            </ul>
          </>
        )}
        {branches.length > 0 && (
          <p className="mt-8 text-[15px] text-steel">
            ปรึกษาและชมรถได้ที่อีซูซุกรุงเทพเซลส์{' '}
            {branches.map((b, i) => (
              <span key={b.id}>{i > 0 && ' · '}<Link href={branchPath(b)} className="font-semibold text-navy hover:text-copper-dark">สาขา{branchArea(b)}</Link></span>
            ))}
          </p>
        )}
      </SectionShell>

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: head,
        serviceType: 'รถกระบะเพื่อการพาณิชย์พร้อมต่ออุปกรณ์',
        description: (it.description ?? '').replace(/\n-\s*/g, ' · '),
        image: images.map((u) => `${SITE_URL}${u}`),
        areaServed: (settings.service_area ?? 'กรุงเทพมหานคร, สมุทรปราการ').split(',').map((x) => x.trim()).filter(Boolean),
        brand: { '@type': 'Brand', name: 'ISUZU' },
        provider: { '@id': `${SITE_URL}/#org` },
        url: `${SITE_URL}/commercial/${slug}`,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'รถเพื่อการพาณิชย์', item: `${SITE_URL}/commercial` },
          { '@type': 'ListItem', position: 3, name: it.name, item: `${SITE_URL}/commercial/${slug}` },
        ],
      }} />
    </>
  );
}
