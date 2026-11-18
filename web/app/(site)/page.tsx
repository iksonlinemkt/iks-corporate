import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CoverHero } from '@/components/CoverHero';
import { Media } from '@/components/Media';
import { Backdrop } from '@/components/Backdrop';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { BranchCard, PromoCard, QuickLinks, VehicleCard } from '@/components/Cards';
import { Rail } from '@/components/Rail';
import { LaunchSpotlight } from '@/components/LaunchSpotlight';
import { BiturboBand } from '@/components/BiturboBand';
import { mediaUrl } from '@/lib/format';
import { campaignPhase, getBranches, getCampaign, getFaqs, getGallery, getGrades, getHighlights, getPromotions, getSections, getSettings, getVehicles } from '@/lib/content';
import { pageMetadata, Sections } from '@/lib/page';
import { getReviewData } from '@/lib/reviews';
import { ReviewsSection } from '@/components/Reviews';
import { TrustStrip } from '@/components/TrustStrip';
import { FaqList } from '@/components/FaqList';
import type { Section } from '@/lib/types';

export const generateMetadata = () => pageMetadata('home');

/** แบนเนอร์รถพาณิชย์: พื้นน้ำเงินเข้ม + ขอบ copper */
function CommercialBanner({ s }: { s: Section }) {
  return (
    <Link href="/commercial" className="group relative flex min-h-[340px] overflow-hidden rounded-[var(--radius-card)] bg-navy-950 text-white">
      <Backdrop variant="navy" />
      <Backdrop variant="band" className="top-1/3" />
      <Media src={s.image} slot="section_banner" alt={s.title ?? 'รถเพื่อการพาณิชย์'} dark placeholder="none"
        className="absolute inset-0 h-full w-full items-end! justify-end! p-5" />
      {s.image && <span className="absolute inset-0 bg-linear-to-r from-navy-950 via-navy-950/80 to-navy-950/10" aria-hidden />}
      <span className="copper-metal absolute inset-y-0 left-0 w-1" aria-hidden />
      <span className="relative flex max-w-md flex-col justify-center p-8 sm:p-10">
        <span className="text-[28px] font-bold leading-tight sm:text-[34px]" role="heading" aria-level={2}><span className="text-chrome">{s.title}</span></span>
        {s.subtitle && <span className="mt-2 font-display text-lg font-semibold text-copper-light">{s.subtitle}</span>}
        {s.body && <span className="mt-3 text-[15px] text-white/70">{s.body}</span>}
        <span className="btn btn-primary mt-7 self-start">{s.cta_label ?? 'ดูรถเพื่อการพาณิชย์'}<ChevronRight size={18} aria-hidden /></span>
      </span>
    </Link>
  );
}

/** แบนเนอร์ Happy Whale: โทนอ่อน (มาสคอตสีฟ้า) */
function WhaleBanner({ s }: { s: Section }) {
  return (
    <Link href="/happy-whale" className="group relative grid min-h-[340px] grid-rows-[1fr_auto] overflow-hidden rounded-[var(--radius-card)] bg-blue-soft text-navy">
      <span className="flex flex-col p-8 sm:p-10">
        <span className="text-[28px] font-bold leading-tight text-navy sm:text-[34px]" role="heading" aria-level={2}>{s.title}</span>
        {s.subtitle && <span className="mt-2 font-display text-lg font-semibold text-copper-dark">{s.subtitle}</span>}
        {s.body && <span className="mt-3 max-w-sm text-[15px] text-steel">{s.body}</span>}
        <span className="mt-6 inline-flex items-center gap-1 font-display text-[15px] font-semibold text-navy group-hover:text-copper-dark">
          {s.cta_label ?? 'รู้จัก Happy Whale'}<ChevronRight size={18} aria-hidden />
        </span>
      </span>
      <Media src={s.image} slot="mascot" alt="Happy Whale" fit="contain" className="absolute -bottom-4 -right-4 h-40 w-40 rounded-full sm:h-48 sm:w-48" />
    </Link>
  );
}

export default async function HomePage() {
  const [sections, hl, vehicles, promos, branches, reviews, settings, whyFaqs] = await Promise.all([
    getSections('home'), getHighlights(), getVehicles(), getPromotions(), getBranches(), getReviewData(), getSettings(), getFaqs('why'),
  ]);
  const [campaign, grades, btPhotos] = await Promise.all([getCampaign(), getGrades(), getGallery('biturbo-dmax')]);
  // แถบ Bi-Turbo ใต้ภาพปก: แสดงเมื่อเมนู NEW ชี้ไป /biturbo และมีรุ่นย่อย Bi-Turbo
  const bt = grades.filter((g) => /bi-?turbo/i.test(`${g.engine ?? ''} ${g.name}`));
  const btPrices = bt.map((g) => (g.price === null ? null : Number(g.price))).filter((n): n is number => n !== null);
  const btModels = [...new Set(bt.map((g) => vehicles.find((v) => v.id === g.vehicle_id)?.name.replace(/^ISUZU\s+(D-MAX\s+)?/, '')).filter(Boolean))] as string[];
  const showBt = settings.nav_new_url?.trim() === '/biturbo' && bt.length > 0;
  const phase = campaign ? campaignPhase(campaign) : null;
  const spotlight = campaign && campaign.show_on_home !== false && phase ? <LaunchSpotlight c={campaign} phase={phase} /> : null;
  const featured = vehicles.filter((v) => v.is_featured).slice(0, 3);
  const featuredPromos = (promos.some((p) => p.is_featured) ? promos.filter((p) => p.is_featured) : promos).slice(0, 3);
  const commercial = sections.find((s) => s.section_key === 'commercial_banner');
  const whale = sections.find((s) => s.section_key === 'happy_whale_banner');

  // แบนเนอร์รถพาณิชย์ + Happy Whale วางคู่กันบนคอม (แสดงที่ตำแหน่งของตัวที่มาก่อน)
  const banners = () => (
    <section className="bg-white pb-16 sm:pb-20">
      <div className={`container-x grid gap-5 ${commercial && whale ? 'lg:grid-cols-[1.55fr_1fr]' : ''}`}>
        {commercial && <CommercialBanner s={commercial} />}
        {whale && <WhaleBanner s={whale} />}
      </div>
    </section>
  );
  const firstBanner = sections.find((s) => s.section_key === 'commercial_banner' || s.section_key === 'happy_whale_banner')?.section_key;

  return (
    <>
    {/* ระหว่างไลฟ์: ไลฟ์ขึ้นบนสุด · ช่วงอื่น: ภาพปกโชว์รูมก่อน */}
    {phase === 'live' && spotlight}
    {sections.some((x) => x.section_key === 'hero') && <CoverHero settings={settings} vehicles={vehicles} branches={branches} />}
    {showBt && phase !== 'live' && <BiturboBand from={btPrices.length ? Math.min(...btPrices) : null} models={btModels} bg={mediaUrl(btPhotos.find((p) => !p.width || !p.height || p.width > p.height)?.image)} />}
    {phase !== 'live' && spotlight}
    <Sections
      list={sections}
      render={{
        hero: () => null, // ภาพปกแสดงด้านบนสุดแล้ว (CoverHero)
        quick_links: () => <QuickLinks items={hl.home_quick} />,
        trust: (s) => (
          <section className="border-b border-line bg-white">
            <div className="container-x py-8">
              {s.title && <p className="mb-5 font-display text-[20px] font-bold text-navy sm:text-[22px]">{s.title}</p>}
              <TrustStrip settings={settings} branches={branches.length} rating={reviews.overall} />
            </div>
          </section>
        ),
        popular_models: (s) =>
          featured.length > 0 && (
            <SectionShell>
              <SectionHeading title={s.title} subtitle={s.subtitle} link="/models" linkLabel="ดูรุ่นรถทั้งหมด" />
              <Rail>{featured.map((v) => <VehicleCard key={v.id} v={v} />)}</Rail>
            </SectionShell>
          ),
        commercial_banner: () => firstBanner === 'commercial_banner' && banners(),
        happy_whale_banner: () => firstBanner === 'happy_whale_banner' && banners(),
        promotions: (s) =>
          featuredPromos.length > 0 && (
            <SectionShell tone="navy">
              <SectionHeading title={s.title} subtitle={s.subtitle} link="/promotions" linkLabel="ดูโปรโมชั่นทั้งหมด" light />
              <Rail>{featuredPromos.map((p) => <PromoCard key={p.id} p={p} compact />)}</Rail>
            </SectionShell>
          ),
        branches: (s) =>
          branches.length > 0 && (
            <SectionShell tone="mist">
              <SectionHeading title={s.title} subtitle={s.subtitle} link="/contact#branches" linkLabel="ดูสาขาทั้งหมด" />
              <Rail cols={4}>{branches.map((b) => <BranchCard key={b.id} b={b} rating={reviews.byBranch.get(b.id)} />)}</Rail>
            </SectionShell>
          ),
        reviews: (s) => <ReviewsSection s={s} data={reviews} />,
        why_faq: (s) =>
          whyFaqs.length > 0 && (
            <SectionShell tone="mist">
              <SectionHeading title={s.title ?? 'ทำไมลูกค้าเลือกอีซูซุกรุงเทพเซลส์'} subtitle={s.subtitle} link="/why" linkLabel="ดูเหตุผลทั้งหมด" />
              <FaqList items={whyFaqs.slice(0, 6)} />
            </SectionShell>
          ),
      }}
    />
    </>
  );
}
