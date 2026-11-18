import Link from 'next/link';
import { CalendarCheck, ChevronRight, LifeBuoy, MapPin, Phone, ShieldCheck, Tag, Trophy, Wrench } from 'lucide-react';
import { ShowroomBg } from '@/components/ShowroomBg';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { PromoCard } from '@/components/Cards';
import { Rail } from '@/components/Rail';
import { ReviewsSection } from '@/components/Reviews';
import { FaqList } from '@/components/FaqList';
import { getBranches, getFaqs, getPromotions, getSettings } from '@/lib/content';
import { getReviewData } from '@/lib/reviews';
import { telHref } from '@/lib/format';
import { branchArea, branchPath } from '@/lib/branch';
import { pageMetadata } from '@/lib/page';
import type { Section } from '@/lib/types';

export const generateMetadata = () => pageMetadata('why');

/** ทำไมต้องอีซูซุกรุงเทพเซลส์ — หลักฐานจริง (SSI · ปีก่อตั้ง · สาขา · 24 ชม.) + รีวิว + ถาม-ตอบ */
export default async function WhyPage() {
  const [settings, branches, faqs, promosAll, reviews] = await Promise.all([getSettings(), getBranches(), getFaqs('why'), getPromotions(), getReviewData()]);
  const founded = Number(settings.founded_year ?? 2525);
  const years = new Date().getFullYear() + 543 - founded;
  const company = settings.company_name_th ?? 'อีซูซุกรุงเทพเซลส์';
  const emergencyTel = telHref(settings.phone_emergency);
  const promos = (promosAll.some((p) => p.is_featured) ? promosAll.filter((p) => p.is_featured) : promosAll).slice(0, 3);
  const reviewSection = { id: 'r', page_slug: 'why', section_key: 'reviews', title: 'เสียงจากลูกค้าจริง', subtitle: 'รีวิวจาก Google Maps', body: null, cta_label: null, cta_url: null, image: null, data: {}, status: 'published' } as Section;

  const proofs = [
    settings.award_title && { icon: Trophy, title: settings.award_title, body: settings.award_detail ?? '' },
    { icon: ShieldCheck, title: `ผู้จำหน่ายอีซูซุตั้งแต่ พ.ศ. ${founded}`, body: `ดูแลลูกค้ามากว่า ${years} ปี` },
    branches.length > 0 && { icon: MapPin, title: `${branches.length} สาขา โชว์รูม + ศูนย์บริการ`, body: branches.map((b) => branchArea(b)).join(' · ') },
    settings.emergency_service && { icon: LifeBuoy, title: settings.emergency_service, body: settings.phone_emergency ? `โทร ${settings.phone_emergency}` : 'ดูแลตลอดการใช้งาน' },
  ].filter(Boolean) as { icon: typeof Trophy; title: string; body: string }[];

  const journey = [
    { icon: Tag, title: 'เลือกรุ่นและราคา', body: 'ราคาแนะนำทุกรุ่นย่อยเปิดเผยบนเว็บ ขอใบเสนอราคาออนไลน์ได้', href: '/models', cta: 'ดูรุ่นและราคา' },
    { icon: CalendarCheck, title: 'ทดลองขับก่อนตัดสินใจ', body: 'นัดทดลองขับที่สาขาใกล้บ้าน', href: '/test-drive', cta: 'จองทดลองขับ' },
    { icon: Wrench, title: 'ต่ออุปกรณ์ตามธุรกิจ', body: 'ตู้ทึบ ตู้เย็น หลังคา คอก สำหรับรถเพื่อการพาณิชย์', href: '/commercial', cta: 'รถเพื่อการพาณิชย์' },
    { icon: ShieldCheck, title: 'ศูนย์บริการ อะไหล่แท้', body: 'เช็กระยะ ซ่อม จองนัดล่วงหน้าออนไลน์ได้', href: '/contact#booking', cta: 'จองนัดเข้าศูนย์' },
    { icon: LifeBuoy, title: 'ช่วยเหลือฉุกเฉิน 24 ชม.', body: 'ดูแลลูกค้าตลอดการใช้งานรถ', href: emergencyTel ?? '/contact', cta: emergencyTel ? `โทร ${settings.phone_emergency}` : 'ติดต่อเรา' },
    { icon: Trophy, title: 'สมาชิก my-MEMBER', body: 'สะสมคะแนนทุกครั้งที่เข้าศูนย์ รับส่วนลดตามระดับ', href: '/my-member', cta: 'ดูสิทธิประโยชน์' },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <ShowroomBg />
        <div className="container-x relative flex min-h-[280px] flex-col justify-end pb-10 pt-16 sm:min-h-[320px] lg:min-h-[380px] lg:justify-center lg:py-14">
          <p className="mb-2 font-display text-[13px] font-semibold tracking-[0.18em] text-copper-light sm:text-[14px]">ISUZU KRUNGTHEP SALES</p>
          <h1 className="max-w-[860px] text-[34px] font-bold leading-tight sm:text-[46px] lg:text-[54px]"><span className="text-chrome">ทำไมต้อง{company}</span></h1>
          <span className="red-streak mt-4 block" style={{ width: 'min(70%, 380px)' }} aria-hidden />
          <p className="mt-4 max-w-[720px] text-[17px] text-white/85 sm:text-[19px]">
            {[settings.award_title && `${settings.award_title} ${settings.award_detail ?? ''}`.trim(), `ผู้จำหน่ายอีซูซุตั้งแต่ พ.ศ. ${founded}`, 'บริการครบวงจร ดูแลตลอดการใช้งาน'].filter(Boolean).join(' · ')}
          </p>
        </div>
      </section>

      <SectionShell tone="mist">
        <ul className={`grid gap-4 sm:grid-cols-2 ${proofs.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {proofs.map(({ icon: I, title, body }) => (
            <li key={title} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[0_14px_40px_-30px_rgb(12_35_70/0.5)]">
              <span className="copper-metal flex h-12 w-12 items-center justify-center rounded-full text-white"><I size={24} aria-hidden /></span>
              <p className="mt-4 font-display text-[19px] font-bold leading-snug text-navy">{title}</p>
              {body && <p className="mt-1 text-[15px] text-steel">{body}</p>}
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell>
        <SectionHeading title="บริการครบวงจร ดูแลตลอดการใช้งาน" subtitle="ตั้งแต่วันเลือกรถ จนถึงทุกครั้งที่ต้องการความช่วยเหลือ" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {journey.map(({ icon: I, title, body, href, cta }, i) => (
            <li key={title} className="flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-display text-[15px] font-bold text-white">{i + 1}</span>
                <I size={22} className="text-copper-dark" aria-hidden />
              </div>
              <p className="mt-3 font-display text-[18px] font-bold text-navy">{title}</p>
              <p className="mt-1 flex-1 text-[15px] text-steel">{body}</p>
              {href.startsWith('tel:')
                ? <a href={href} className="mt-4 inline-flex items-center gap-1 font-display text-[15px] font-semibold text-copper-dark hover:underline"><Phone size={16} aria-hidden />{cta}</a>
                : <Link href={href} className="mt-4 inline-flex items-center gap-1 font-display text-[15px] font-semibold text-copper-dark hover:underline">{cta}<ChevronRight size={16} aria-hidden /></Link>}
            </li>
          ))}
        </ol>
      </SectionShell>

      {promos.length > 0 && (
        <SectionShell tone="navy">
          <SectionHeading title="ราคาโปร่งใส โปรโมชั่นล่าสุด" subtitle="ราคาแนะนำทุกรุ่นย่อยดูได้บนเว็บ · ขอใบเสนอราคาเพื่อคำนวณดาวน์และค่างวด" link="/promotions" linkLabel="ดูโปรโมชั่นทั้งหมด" light />
          <Rail>{promos.map((p) => <PromoCard key={p.id} p={p} compact />)}</Rail>
        </SectionShell>
      )}

      <ReviewsSection s={reviewSection} data={reviews} />

      {faqs.length > 0 && (
        <SectionShell tone="mist">
          <SectionHeading title="คำถามที่ลูกค้าถามก่อนตัดสินใจ" />
          <FaqList items={faqs} />
        </SectionShell>
      )}

      {branches.length > 0 && (
        <SectionShell>
          <SectionHeading title="เลือกสาขาใกล้คุณ" />
          <ul className="flex flex-wrap gap-3">
            {branches.map((b) => (
              <li key={b.id}><Link href={branchPath(b)} className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-display text-[16px] font-semibold text-navy hover:border-copper"><MapPin size={17} className="text-copper-dark" aria-hidden />อีซูซุ {branchArea(b)}</Link></li>
            ))}
          </ul>
        </SectionShell>
      )}
    </>
  );
}
