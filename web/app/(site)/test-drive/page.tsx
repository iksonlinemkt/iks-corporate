import { CalendarCheck, CarFront, PhoneCall } from 'lucide-react';
import { ShowroomBg } from '@/components/ShowroomBg';
import { LeadForm } from '@/components/LeadForm';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { TrustStrip } from '@/components/TrustStrip';
import { FaqList } from '@/components/FaqList';
import { getBranches, getFaqs, getSettings, getVehicleCategories, getVehicles } from '@/lib/content';
import { getReviewData } from '@/lib/reviews';
import { pageMetadata } from '@/lib/page';

export const generateMetadata = () => pageMetadata('test-drive');

const STEPS = [
  { icon: CarFront, title: 'เลือกรุ่นและสาขา', text: 'เลือกรุ่นที่อยากลอง สาขา และวันเวลาที่สะดวก' },
  { icon: PhoneCall, title: 'ทีมงานโทรยืนยัน', text: 'ที่ปรึกษาการขายโทรยืนยันรุ่นรถและเวลานัด' },
  { icon: CalendarCheck, title: 'มาทดลองขับ', text: 'นำใบขับขี่มาในวันนัด พร้อมรับคำแนะนำรุ่นที่เหมาะกับคุณ' },
];

export default async function TestDrivePage({ searchParams }: { searchParams: Promise<{ model?: string }> }) {
  const { model } = await searchParams;
  const [settings, branches, vehicles, categories, faqs, reviews] = await Promise.all([
    getSettings(), getBranches(), getVehicles(), getVehicleCategories(), getFaqs('test_drive'), getReviewData(),
  ]);
  const order = new Map(categories.map((c, i) => [c.id, i]));
  const list = [...vehicles].sort((a, b) => (order.get(a.category_id ?? '') ?? 99) - (order.get(b.category_id ?? '') ?? 99));
  const picked = vehicles.find((v) => v.slug === model);
  const showrooms = branches.filter((b) => b.has_showroom);

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <ShowroomBg dim />
        <div className="container-x relative py-14 sm:py-20">
          <span className="lane mb-4 block" aria-hidden />
          <h1 className="text-[36px] font-bold leading-tight sm:text-5xl">จองทดลองขับรถอีซูซุ</h1>
          <p className="mt-4 max-w-2xl text-[17px] text-white/80">
            {picked ? `${picked.name} และรถอีซูซุทุกรุ่น` : 'ISUZU D-MAX, Spark, V-Cross, X-Series และ MU-X'} ทดลองขับได้ที่อีซูซุกรุงเทพเซลส์{showrooms.length ? ` สาขา${showrooms.map((b) => b.name.replace('สาขา', '')).join(' ')}` : ''}
          </p>
        </div>
      </section>
      <div className="border-b border-line bg-mist">
        <div className="container-x py-6"><TrustStrip settings={settings} branches={branches.length} rating={reviews.overall} /></div>
      </div>

      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading title="จองง่ายใน 3 ขั้นตอน" />
            <ol className="space-y-5">
              {STEPS.map(({ icon: I, title, text }, i) => (
                <li key={title} className="flex gap-4">
                  <span className="copper-metal flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"><I size={20} aria-hidden /></span>
                  <span><span className="block font-display text-[18px] font-bold">{i + 1}. {title}</span><span className="text-[15px] text-steel">{text}</span></span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[0_20px_50px_-30px_rgb(12_35_70/0.35)] sm:p-8">
            <h2 className="mb-5 text-[24px] font-bold">กรอกข้อมูลจองทดลองขับ</h2>
            <LeadForm
              fixedType
              defaultType="test_drive"
              sourcePage="/test-drive"
              vehicles={list.map((v) => ({ id: v.id, name: v.name }))}
              defaultVehicleId={picked?.id}
              branches={showrooms.map((b) => ({ id: b.id, name: b.name }))}
              pdpaText={settings.pdpa_text}
              pdpaVersion={settings.pdpa_version}
              submitLabel="จองทดลองขับ"
            />
          </div>
        </div>
      </SectionShell>

      {faqs.length > 0 && (
        <SectionShell tone="mist">
          <SectionHeading title="คำถามเรื่องการทดลองขับ" />
          <FaqList items={faqs} />
        </SectionShell>
      )}
    </>
  );
}
