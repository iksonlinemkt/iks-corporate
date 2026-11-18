import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarCheck, Clock, FileText, MapPin, MessageCircle, Navigation, Phone, Wrench } from 'lucide-react';
import { ShowroomBg } from '@/components/ShowroomBg';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { PromoCard, VehicleCard } from '@/components/Cards';
import { Rail } from '@/components/Rail';
import { RatingBadge, ReviewsSection } from '@/components/Reviews';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import { getBranches, getPromotions, getSettings, getVehicles } from '@/lib/content';
import { getReviewData } from '@/lib/reviews';
import { lineHref, mapEmbedSrc, mapHref, mediaUrl, telHref } from '@/lib/format';
import { branchArea, branchNearby, branchPath, branchSlug } from '@/lib/branch';
import { SITE_URL } from '@/lib/site';
import type { Branch, Faq, Promotion, Section } from '@/lib/types';
import type { BranchRating } from '@/lib/reviews';

async function findBranch(slug: string) {
  const branches = await getBranches();
  return { branch: branches.find((b) => branchSlug(b) === slug) ?? null, branches };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { branch: b } = await findBranch(slug);
  if (!b) return {};
  const area = branchArea(b);
  const near = branchNearby(b);
  const title = near[0]
    ? `อีซูซุ ${area} ใกล้${near[0]} โชว์รูมและศูนย์บริการ | อีซูซุกรุงเทพเซลส์`
    : `อีซูซุ ${area} โชว์รูมและศูนย์บริการ | อีซูซุกรุงเทพเซลส์ สาขา${area}`;
  const parts = [
    `อีซูซุกรุงเทพเซลส์ สาขา${area}${near.length ? ` ใกล้${near.slice(0, 3).join(' ')}` : ''}`,
    [b.has_showroom && 'โชว์รูม', b.has_service && 'ศูนย์บริการ', b.has_parts && 'อะไหล่แท้'].filter(Boolean).join(' '),
    b.address,
    b.hours_showroom && `เปิด ${b.hours_showroom}`,
    b.phone && `โทร ${b.phone}`,
  ].filter(Boolean);
  const description = parts.join(' · ').slice(0, 160);
  const img = mediaUrl(b.image);
  return {
    title, description,
    alternates: { canonical: branchPath(b) },
    openGraph: { title, description, url: branchPath(b), siteName: 'อีซูซุกรุงเทพเซลส์', locale: 'th_TH', type: 'website', images: img ? [img] : ['/cover/showroom.webp'] },
  };
}

/** คำถามที่พบบ่อยของสาขา — สร้างจากข้อมูลสาขาจริง (ที่อยู่ เวลา บริการ) */
function branchFaqs(b: Branch, area: string, near: string[], promos: Promotion[], rating?: BranchRating): Faq[] {
  const q = (id: string, question: string, answer: string | null | false | undefined): Faq[] =>
    answer ? [{ id: `${b.code}-${id}`, group_key: 'branch', question, answer }] : [];
  const services = [b.has_showroom && 'โชว์รูมรถใหม่', b.has_service && 'ศูนย์บริการซ่อมบำรุง', b.has_parts && 'อะไหล่แท้'].filter(Boolean).join(' ');
  return [
    ...q('where', `อีซูซุ ${area} อยู่ที่ไหน?`, b.address && `อีซูซุกรุงเทพเซลส์ สาขา${area} ตั้งอยู่ที่ ${b.address}${b.phone ? ` โทร ${b.phone}` : ''} กดปุ่ม "นำทาง" ในหน้านี้เพื่อเปิด Google Maps ได้เลย`),
    ...q('hours', `อีซูซุ ${area} เปิดกี่โมง?`, (b.hours_showroom || b.hours_service) && [
      b.hours_showroom && `โชว์รูม: ${b.hours_showroom}`, b.hours_service && `ศูนย์บริการ: ${b.hours_service}`, b.hours_parts && `อะไหล่: ${b.hours_parts}`,
    ].filter(Boolean).join('\n')),
    ...q('services', `สาขา${area} มีบริการอะไรบ้าง?`, services && `สาขา${area} มี${services} จำหน่ายรถอีซูซุ D-MAX, Spark, V-Cross, X-Series, MU-X และรถกระบะเพื่อการพาณิชย์พร้อมต่ออุปกรณ์ เช่น ตู้ทึบ ตู้เย็น หลังคา คอก`),
    ...q('booking', `จองนัดเข้าศูนย์บริการสาขา${area} ได้อย่างไร?`, b.has_service && `จองออนไลน์ได้ที่ปุ่ม "จองนัดเข้าศูนย์บริการ" ในหน้านี้ หรือหน้า "ติดต่อเรา" เลือกศูนย์บริการสาขา${area} วันและเวลาที่สะดวก${b.phone ? ` หรือโทร ${b.phone}` : ''}`),
    ...(near[0] ? q('near', `อีซูซุ ใกล้${near[0]} มีที่ไหนบ้าง?`, `อีซูซุกรุงเทพเซลส์ สาขา${area} อยู่ใกล้${near.slice(0, 3).join(' ')}${b.address ? ` ที่อยู่ ${b.address}` : ''} มี${services || 'โชว์รูมและศูนย์บริการ'}${b.hours_showroom ? ` เปิด ${b.hours_showroom}` : ''}`) : []),
    ...q('service-quality', `ศูนย์บริการอีซูซุ ${area} ดีไหม?`, b.has_service && [
      rating ? `ลูกค้าให้คะแนนสาขา${area}บน Google Maps ${rating.rating.toFixed(1)} จาก 5 (${rating.count.toLocaleString('th-TH')} รีวิว)` : null,
      `ศูนย์บริการมาตรฐานอีซูซุ ใช้อะไหล่แท้ จองนัดล่วงหน้าออนไลน์ได้ ไม่ต้องรอคิวนาน`,
      `สมาชิก my-MEMBER สะสมคะแนนทุกครั้งที่เข้าศูนย์ และรับส่วนลดน้ำมันเครื่องและอะไหล่ตามระดับสมาชิก`,
    ].filter(Boolean).join(' · ')),
    ...q('promotion', `อีซูซุ ${area} มีโปรโมชั่นอะไรบ้างตอนนี้?`, promos.length
      ? `โปรโมชั่นที่ใช้ได้ที่สาขา${area}ตอนนี้: ${promos.slice(0, 4).map((p) => p.title + (p.value_text ? ` (${p.value_text})` : '')).join(' · ')} ดูรายละเอียดและเงื่อนไขได้ที่หน้าโปรโมชั่น หรือขอใบเสนอราคาให้ทีมขายคำนวณข้อเสนอให้`
      : `โปรโมชั่นเปลี่ยนตามช่วงเวลาและรุ่น ขอใบเสนอราคาหรือโทรสอบถามสาขา${area} ทีมขายจะแจ้งข้อเสนอล่าสุดให้`),
    ...q('testdrive', `ทดลองขับรถอีซูซุที่สาขา${area} ได้ไหม?`, b.has_showroom && `ได้ จองทดลองขับออนไลน์ได้ที่หน้า "จองทดลองขับ" เลือกรุ่นและสาขา${area} ทีมขายจะติดต่อกลับเพื่อนัดวันเวลา`),
  ];
}

export default async function BranchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ branch: b, branches }, settings, vehicles, reviews, promosAll] = await Promise.all([findBranch(slug), getSettings(), getVehicles(), getReviewData(), getPromotions()]);
  if (!b) notFound();
  const area = branchArea(b);
  const company = settings.company_name_th ?? 'อีซูซุกรุงเทพเซลส์';
  const tel = telHref(b.phone ?? settings.phone_main);
  const map = mapHref(b);
  const embed = mapEmbedSrc(b);
  const line = b.line_url ?? lineHref(b.line_id) ?? settings.line_oa_url ?? lineHref(settings.line_oa_id);
  const rating = reviews.byBranch.get(b.id);
  const featured = vehicles.filter((v) => v.is_featured).slice(0, 4);
  const near = branchNearby(b);
  const promos = (promosAll.some((p) => p.is_featured) ? promosAll.filter((p) => p.is_featured) : promosAll).slice(0, 3);
  const faqs = branchFaqs(b, area, near, promosAll, rating);
  const others = branches.filter((x) => x.id !== b.id);
  const branchReviews = { byBranch: new Map(rating ? [[b.id, rating]] : []), overall: rating ? { rating: rating.rating, count: rating.count } : null, reviews: reviews.reviews.filter((r) => r.branch === b.name) };
  const reviewSection = { id: 'r', page_slug: 'branch', section_key: 'reviews', title: `รีวิวลูกค้า สาขา${area}`, subtitle: 'จาก Google Maps', body: null, cta_label: null, cta_url: null, image: null, data: {}, status: 'published' } as Section;
  const hoursRows = [['โชว์รูม', b.has_showroom, b.hours_showroom], ['ศูนย์บริการ', b.has_service, b.hours_service], ['อะไหล่', b.has_parts, b.hours_parts]] as const;
  const img = mediaUrl(b.image);

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        {img ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`${company} สาขา${area}`} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
            <span className="absolute inset-0 bg-linear-to-r from-[#060a14]/95 via-[#060a14]/70 to-[#060a14]/20" aria-hidden />
          </>
        ) : <ShowroomBg />}
        <div className="container-x relative flex min-h-[260px] flex-col justify-end pb-10 pt-16 sm:min-h-[300px] lg:min-h-[360px] lg:justify-center lg:py-14">
          <p className="mb-2 font-display text-[13px] font-semibold tracking-[0.18em] text-copper-light sm:text-[14px]">ISUZU KRUNGTHEP SALES</p>
          <h1 className="text-[36px] font-bold leading-tight sm:text-5xl lg:text-[56px]">
            <span className="text-chrome">อีซูซุ {area}</span>
            <span className="mt-2 block text-[18px] font-semibold text-white/90 sm:text-[22px]">{company} สาขา{area}</span>
          </h1>
          {near.length > 0 && <p className="mt-2 text-[15px] text-white/80 sm:text-[17px]">ใกล้ {near.join(' · ')}</p>}
          <span className="red-streak mt-4 block" style={{ width: 'min(70%, 380px)' }} aria-hidden />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {[b.has_showroom && 'โชว์รูม', b.has_service && 'ศูนย์บริการ', b.has_parts && 'อะไหล่แท้'].filter(Boolean).map((t) => (
              <span key={t as string} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[14px] font-medium">{t}</span>
            ))}
            {rating && <RatingBadge r={rating} light />}
          </div>
        </div>
      </section>

      <SectionShell tone="mist">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-7">
            <h2 className="text-[22px] font-bold">ข้อมูลสาขา{area}</h2>
            {b.address && <p className="flex gap-3 text-[16px] leading-relaxed"><MapPin size={20} className="mt-1 shrink-0 text-copper-dark" aria-hidden />{b.address}</p>}
            {(b.phone || settings.phone_main) && <p className="flex gap-3 text-[16px]"><Phone size={20} className="mt-0.5 shrink-0 text-copper-dark" aria-hidden />{b.phone ?? settings.phone_main}</p>}
            <table className="w-full text-left text-[15px]">
              <tbody className="divide-y divide-line">
                {hoursRows.map(([label, has, h]) => has && (
                  <tr key={label}><th scope="row" className="flex items-center gap-2 py-2.5 pr-3 font-display font-semibold"><Clock size={16} className="text-steel" aria-hidden />{label}</th><td className="py-2.5">{h ?? 'สอบถามสาขา'}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {map && <a href={map} target="_blank" rel="noopener" className="btn btn-navy px-3"><Navigation size={17} aria-hidden />นำทาง</a>}
              {tel && <a href={tel} className="btn btn-ghost px-3"><Phone size={17} aria-hidden />โทร</a>}
              {line && <a href={line} target="_blank" rel="noopener" className="btn btn-ghost px-3"><MessageCircle size={17} aria-hidden />LINE</a>}
              <Link href="/contact?type=quote#form" className="btn btn-primary px-3"><FileText size={17} aria-hidden />ขอใบเสนอราคา</Link>
              {b.has_service && (settings.booking_url
                ? <a href={settings.booking_url} target="_blank" rel="noopener" className="btn btn-ghost col-span-2 px-3"><Wrench size={17} aria-hidden />จองนัดเข้าศูนย์บริการ</a>
                : <Link href="/contact#booking" className="btn btn-ghost col-span-2 px-3"><Wrench size={17} aria-hidden />จองนัดเข้าศูนย์บริการ</Link>)}
              {b.has_showroom && <Link href="/test-drive" className="btn btn-ghost col-span-2 px-3"><CalendarCheck size={17} aria-hidden />จองทดลองขับ</Link>}
            </div>
          </div>
          <div className="min-h-[320px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {embed ? (
              <iframe title={`แผนที่ อีซูซุ ${area}`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-[320px] w-full border-0" />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center p-8 text-center text-steel">ยังไม่มีพิกัดแผนที่ของสาขานี้</div>
            )}
          </div>
        </div>
      </SectionShell>

      {featured.length > 0 && (
        <SectionShell>
          <SectionHeading title={`รถอีซูซุรุ่นยอดนิยม ที่สาขา${area}`} subtitle="ดูราคาทุกรุ่นย่อย แล้วนัดชมรถจริงหรือทดลองขับได้ที่สาขา" link="/models" linkLabel="ดูรุ่นรถทั้งหมด" />
          <Rail>{featured.map((v) => <VehicleCard key={v.id} v={v} />)}</Rail>
        </SectionShell>
      )}

      {promos.length > 0 && (
        <SectionShell tone="navy">
          <SectionHeading title={`โปรโมชั่นล่าสุด ที่อีซูซุ ${area}`} subtitle="ข้อเสนอปัจจุบัน ใช้ได้ที่สาขานี้ · ขอใบเสนอราคาเพื่อคำนวณดาวน์และค่างวด" link="/promotions" linkLabel="ดูโปรโมชั่นทั้งหมด" light />
          <Rail>{promos.map((p) => <PromoCard key={p.id} p={p} compact />)}</Rail>
        </SectionShell>
      )}

      <ReviewsSection s={reviewSection} data={branchReviews} />

      {faqs.length > 0 && (
        <SectionShell tone="mist">
          <SectionHeading title={`คำถามที่พบบ่อย อีซูซุ ${area}`} />
          <FaqList items={faqs} />
        </SectionShell>
      )}

      {others.length > 0 && (
        <SectionShell>
          <SectionHeading title="สาขาอื่นของอีซูซุกรุงเทพเซลส์" />
          <ul className="flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={branchPath(o)} className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-display text-[16px] font-semibold text-navy hover:border-copper">
                  <MapPin size={17} className="text-copper-dark" aria-hidden />อีซูซุ {branchArea(o)}
                </Link>
              </li>
            ))}
          </ul>
        </SectionShell>
      )}

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'AutoDealer',
        '@id': `${SITE_URL}/#branch-${b.code.toLowerCase()}`,
        name: `${company} สาขา${area}`,
        alternateName: `อีซูซุ ${area}`,
        url: `${SITE_URL}${branchPath(b)}`,
        image: img ? `${SITE_URL}${img}` : `${SITE_URL}/cover/showroom.webp`,
        brand: { '@type': 'Brand', name: 'ISUZU' },
        parentOrganization: { '@id': `${SITE_URL}/#org` },
        telephone: b.phone ?? settings.phone_main ?? undefined,
        address: b.address ? { '@type': 'PostalAddress', streetAddress: b.address, addressLocality: b.district ?? undefined, addressRegion: b.province ?? undefined, postalCode: b.postcode ?? undefined, addressCountry: 'TH' } : undefined,
        geo: b.latitude !== null && b.longitude !== null ? { '@type': 'GeoCoordinates', latitude: b.latitude, longitude: b.longitude } : undefined,
        hasMap: map ?? undefined,
        areaServed: near.length ? near : undefined,
        keywords: [`อีซูซุ ${area}`, ...near.map((n) => `อีซูซุ ${n}`), 'ศูนย์บริการอีซูซุ', 'โชว์รูมอีซูซุ'].join(', '),
        aggregateRating: rating ? { '@type': 'AggregateRating', ratingValue: rating.rating, reviewCount: rating.count } : undefined,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'ติดต่อเรา', item: `${SITE_URL}/contact` },
          { '@type': 'ListItem', position: 3, name: `อีซูซุ ${area}`, item: `${SITE_URL}${branchPath(b)}` },
        ],
      }} />
    </>
  );
}
