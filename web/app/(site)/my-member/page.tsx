import Link from 'next/link';
import { CalendarCheck, Crown, Download, Gift, MessageCircle, Smartphone, Sparkles, Users, Wrench } from 'lucide-react';
import { Backdrop } from '@/components/Backdrop';
import { ShowroomBg } from '@/components/ShowroomBg';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { TrustStrip } from '@/components/TrustStrip';
import { FaqList } from '@/components/FaqList';
import { getBranches, getFaqs, getSettings } from '@/lib/content';
import { getReviewData } from '@/lib/reviews';
import { lineHref } from '@/lib/format';
import { pageMetadata } from '@/lib/page';

export const generateMetadata = () => pageMetadata('my-member');

/* ข้อมูลโปรแกรม my-MEMBER (ใช้เหมือนกันทุกผู้จำหน่ายอีซูซุ) */
const PLAY = 'https://play.google.com/store/apps/details?id=com.tis.myisuzu';
const APPSTORE = 'https://apps.apple.com/th/app/my-isuzu/id1612415578';

const TIERS = [
  { name: 'Silver', need: 'ได้ทันทีเมื่อเป็นเจ้าของรถอีซูซุ', life: 'ตลอดการครอบครองรถ',
    bg: 'linear-gradient(135deg,#8e99a8 0%,#eef2f7 35%,#b7c1ce 55%,#f7f9fc 75%,#8e99a8 100%)', ink: 'text-navy' },
  { name: 'Gold', need: 'สะสมครบ 15,000 คะแนน', life: 'อายุ 1 ปี',
    bg: 'linear-gradient(135deg,#9c6a1e 0%,#f6dc8c 35%,#c9932f 55%,#fff1c2 75%,#9c6a1e 100%)', ink: 'text-navy-950' },
  { name: 'Platinum', need: 'สะสมครบ 20,000 คะแนน', life: 'อายุ 1 ปี',
    bg: 'linear-gradient(135deg,#5b6b82 0%,#dfe7f2 32%,#90a3bd 55%,#f4f8fd 76%,#5b6b82 100%)', ink: 'text-navy-950' },
  { name: 'Diamond', need: 'สะสมครบ 30,000 คะแนน', life: 'อายุ 1 ปี',
    bg: 'linear-gradient(135deg,#061630 0%,#1f4275 35%,#6fb3ff 52%,#15335e 68%,#061630 100%)', ink: 'text-white' },
];

const BENEFITS: [string, string[]][] = [
  ['ส่วนลดซื้อรถกระบะใหม่ (ทุกรุ่น)', ['5,000 บาท', '10,000 บาท', '20,000 บาท', '30,000 บาท']],
  ['ส่วนลดซื้อ MU-X ใหม่ (ทุกรุ่น)', ['10,000 บาท', '20,000 บาท', '30,000 บาท', '50,000 บาท']],
  ['ส่วนลดน้ำมันเครื่องและไส้กรอง', ['–', '3%', '5%', '10%']],
  ['ส่วนลดอะไหล่ (ช่วงล่าง เบรก คลัตช์ ฯลฯ)', ['–', '5%', '10%', '15%']],
  ['ส่วนลดยาง (รับประกัน 5 ปี ไม่จำกัดระยะทาง)', ['1,200 บาท', '2,400 บาท', '2,400 บาท', '2,400 บาท']],
  ['ส่วนลดแบตเตอรี่ (รับประกันสูงสุด 18 เดือน)', ['300 บาท', '600 บาท', '600 บาท', '600 บาท']],
];

const EARN: { icon: typeof Wrench; title: string; items: [string, string][] }[] = [
  { icon: Wrench, title: 'เข้าศูนย์บริการ', items: [['ค่าบริการและอะไหล่ทุก 100 บาท', '25'], ['ซื้อแพ็กเกจขยายการรับประกัน', '1,500'], ['เปลี่ยนน้ำมันเครื่องตรงตามระยะ', '300'], ['นัดหมายล่วงหน้า', '50'], ['ตอบแบบสอบถามความพึงพอใจ', '50']] },
  { icon: Smartphone, title: 'ใช้งานแอป my-ISUZU', items: [['ลงทะเบียนครั้งแรก', '4,000'], ['เชื่อมต่อ LINE OA', '1,000'], ['เชื่อมต่อ Isuzu Leasing', '500'], ['วันเกิด', '100']] },
  { icon: Users, title: 'แนะนำเพื่อน / ซื้อรถ', items: [['ซื้อรถอีซูซุคันใหม่', '5,000'], ['แนะนำเพื่อนซื้อรถสำเร็จ', '5,000'], ['แนะนำเพื่อนมาทดลองขับ', '500']] },
  { icon: Sparkles, title: 'กิจกรรม my-CIRCLE', items: [['เข้าร่วมกิจกรรมอีซูซุ', '100'], ['โพสต์ใหม่ทุก 5 โพสต์', '10'], ['ผู้ติดตามทุก 20 คน', '10'], ['รีแอคชันทุก 25 ครั้ง', '5']] },
];

function AppButtons({ dark = false }: { dark?: boolean }) {
  const cls = `inline-flex items-center gap-3 rounded-[var(--radius-card)] px-5 py-3 font-display font-semibold transition-colors ${dark ? 'bg-white text-navy-950 hover:bg-copper-light' : 'bg-navy-950 text-white hover:bg-navy-2'}`;
  return (
    <div className="flex flex-wrap gap-3">
      <a href={APPSTORE} target="_blank" rel="noopener" className={cls}><Download size={20} aria-hidden /><span><span className="block text-[11px] font-medium opacity-70">ดาวน์โหลดบน</span>App Store</span></a>
      <a href={PLAY} target="_blank" rel="noopener" className={cls}><Download size={20} aria-hidden /><span><span className="block text-[11px] font-medium opacity-70">ดาวน์โหลดบน</span>Google Play</span></a>
    </div>
  );
}

export default async function MyMemberPage() {
  const [settings, branches, faqs, reviews] = await Promise.all([getSettings(), getBranches(), getFaqs('member'), getReviewData()]);
  const line = settings.line_oa_url ?? lineHref(settings.line_oa_id);

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <ShowroomBg dim />
        <div className="container-x relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-4 text-[15px] font-medium text-white/80">โปรแกรมสมาชิกอีซูซุ · สมัครฟรีผ่านแอป my-ISUZU</p>
            <h1 className="text-[42px] font-bold leading-[1.05] sm:text-[60px]">
              <span className="text-chrome">my-MEMBER</span>
              <span className="text-gold mt-3 block text-[24px] font-semibold leading-snug sm:text-[32px]">ยิ่งใช้ ยิ่งได้ สะสมคะแนน รับสิทธิ์เหนือระดับ</span>
            </h1>
            <ul className="mt-6 space-y-2 text-[16px] text-white/85">
              <li>• ส่วนลดอะไหล่สูงสุด <b className="text-gold">15%</b> น้ำมันเครื่องสูงสุด <b className="text-gold">10%</b></li>
              <li>• ส่วนลดซื้อรถใหม่สูงสุด <b className="text-gold">50,000 บาท</b> โอนสิทธิ์ให้ครอบครัวได้</li>
              <li>• ลงทะเบียนวันนี้รับทันที <b className="text-gold">4,000 คะแนน</b></li>
            </ul>
            <div className="mt-8"><AppButtons dark /></div>
          </div>
          <ul className="grid grid-cols-2 gap-4" aria-label="ระดับสมาชิก">
            {TIERS.map((t, i) => (
              <li key={t.name} className={`relative aspect-[1.586] overflow-hidden rounded-2xl p-4 shadow-[0_24px_50px_-24px_rgb(0_0_0/0.8)] ring-1 ring-white/20 ${i % 2 ? 'translate-y-6' : ''}`}
                style={{ background: t.bg }}>
                <span className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgb(255_255_255/0.45)_48%,transparent_60%)]" aria-hidden />
                <span className={`relative flex h-full flex-col justify-between ${t.ink}`}>
                  <span className="font-display text-[13px] font-bold tracking-[0.12em] opacity-80">my-MEMBER</span>
                  <span>
                    <span className="block font-display text-[24px] font-bold leading-none sm:text-[28px]">{t.name}</span>
                    <span className="mt-1 block text-[12px] font-medium opacity-80">{t.need}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="border-b border-line bg-mist">
        <div className="container-x py-6"><TrustStrip settings={settings} branches={branches.length} rating={reviews.overall} /></div>
      </div>

      <SectionShell>
        <SectionHeading title="สิทธิประโยชน์ตามระดับสมาชิก" subtitle="ส่วนลดที่ศูนย์บริการหักให้อัตโนมัติ · ส่วนลดซื้อรถใหม่โอนให้ครอบครัวได้ตามเงื่อนไข" />
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead>
              <tr>
                <th className="bg-navy p-4 font-display text-white">สิทธิประโยชน์</th>
                {TIERS.map((t) => (
                  <th key={t.name} className={`p-4 text-center font-display text-[17px] ${t.ink}`} style={{ background: t.bg }}>{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {BENEFITS.map(([label, vals]) => (
                <tr key={label} className="odd:bg-white even:bg-mist/60">
                  <th scope="row" className="p-4 font-medium text-navy">{label}</th>
                  {vals.map((v, i) => <td key={i} className="p-4 text-center font-display text-[16px] font-bold">{v === '–' ? <span className="text-steel">–</span> : <span className="text-gold-dark">{v}</span>}</td>)}
                </tr>
              ))}
              <tr className="bg-white">
                <th scope="row" className="p-4 font-medium text-navy">สิทธิพิเศษไลฟ์สไตล์ / กิจกรรม Exclusive</th>
                <td colSpan={4} className="p-4 text-center text-[14px] text-steel">ตามระดับสมาชิก · กดรับสิทธิ์ในแอป my-ISUZU ก่อนใช้งาน</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-steel">ระดับ Gold ขึ้นไปมีอายุ 1 ปี ต้องสะสมคะแนนในปีปัจจุบันเพื่อคงหรือเลื่อนระดับ · สิทธิ์บริการและกิจกรรมโอนให้ผู้อื่นไม่ได้</p>
      </SectionShell>

      <SectionShell tone="mist">
        <SectionHeading title="สะสมคะแนนได้จากอะไรบ้าง" subtitle="คะแนนเข้าทันทีเมื่อใช้บริการที่ศูนย์บริการ · วันหมดอายุคะแนนดูได้ในแอป" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EARN.map(({ icon: I, title, items }) => (
            <div key={title} className="rounded-[var(--radius-card)] border border-line bg-white p-5">
              <p className="flex items-center gap-3 font-display text-[18px] font-bold">
                <span className="copper-metal flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"><I size={19} aria-hidden /></span>{title}
              </p>
              <ul className="mt-4 divide-y divide-line">
                {items.map(([k, pts]) => (
                  <li key={k} className="flex items-baseline justify-between gap-3 py-2.5 text-[14px]">
                    <span className="text-ink">{k}</span>
                    <span className="shrink-0 font-display text-[16px] font-bold"><span className="text-gold-dark">+{pts}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading title="สมัครง่ายใน 3 ขั้นตอน" />
            <ol className="space-y-5">
              {[
                [Download, 'ดาวน์โหลดแอป my-ISUZU', 'มีทั้ง App Store และ Google Play สมัครฟรี'],
                [Smartphone, 'ลงทะเบียนและเพิ่มรถของคุณ', 'รับทันที 4,000 คะแนน · ลูกค้าเดิม "ยิ่งเข้า ยิ่งคุ้ม" ย้ายระดับให้อัตโนมัติ'],
                [MessageCircle, 'เชื่อมต่อ LINE OA', 'รับเพิ่มอีก 1,000 คะแนน พร้อมรับข่าวสารและแจ้งเตือนนัดหมาย'],
              ].map(([I, t, d], i) => {
                const Icon = I as typeof Download;
                return (
                  <li key={t as string} className="flex gap-4">
                    <span className="copper-metal flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"><Icon size={20} aria-hidden /></span>
                    <span><span className="block font-display text-[18px] font-bold">{i + 1}. {t as string}</span><span className="text-[15px] text-steel">{d as string}</span></span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-7"><AppButtons /></div>
          </div>
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-navy-950 p-7 text-white">
            <Backdrop variant="navy" />
            <div className="relative">
              <p className="flex items-center gap-2 font-display text-[15px] font-semibold text-white/80"><Crown size={18} className="text-copper-light" aria-hidden />SUPER FAN</p>
              <p className="mt-2 text-[28px] font-bold leading-tight"><span className="text-chrome">แนะนำเพื่อนซื้อรถ</span> <span className="text-gold">รับ 5,000 คะแนน</span></p>
              <p className="mt-3 text-[15px] text-white/80">แนะนำเพื่อนมาทดลองขับรับ 500 คะแนน ซื้อสำเร็จรับมงกุฎ SUPER FAN (มงกุฎเงิน 1–2 คัน · มงกุฎทอง 3 คันขึ้นไป)</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/test-drive" className="btn btn-primary"><CalendarCheck size={18} aria-hidden />พาเพื่อนมาทดลองขับ</Link>
                <Link href="/contact?type=quote" className="btn btn-ghost-light"><Gift size={18} aria-hidden />ขอใบเสนอราคาให้เพื่อน</Link>
              </div>
              <p className="mt-6 border-t border-white/10 pt-5 text-[15px] text-white/80">
                สมาชิกเข้าศูนย์บริการอีซูซุกรุงเทพเซลส์ทุกสาขา รับคะแนนและส่วนลดอัตโนมัติ
                {' '}<Link href="/contact#booking" className="font-semibold text-copper-light hover:underline">นัดเข้าศูนย์บริการ</Link>
                {line && <> · <a href={line} target="_blank" rel="noopener" className="font-semibold text-copper-light hover:underline">สอบถามทาง LINE</a></>}
              </p>
            </div>
          </div>
        </div>
      </SectionShell>

      {faqs.length > 0 && (
        <SectionShell tone="mist">
          <SectionHeading title="คำถามที่พบบ่อย my-MEMBER" />
          <FaqList items={faqs} />
        </SectionShell>
      )}

      <div className="bg-white">
        <p className="container-x py-6 text-[13px] text-steel">
          โปรแกรม my-MEMBER เป็นของบริษัท ตรีเพชรอีซูซุเซลส์ จำกัด สิทธิประโยชน์และเงื่อนไขเป็นไปตามที่บริษัทกำหนดและอาจเปลี่ยนแปลงได้ ตรวจสอบรายละเอียดล่าสุดในแอป my-ISUZU
        </p>
      </div>
    </>
  );
}
