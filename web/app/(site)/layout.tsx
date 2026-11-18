import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Header } from '@/components/Header';
import { Wordmark } from '@/components/Brand';
import { Backdrop } from '@/components/Backdrop';
import { Footer } from '@/components/Footer';
import { MobileActionBar } from '@/components/MobileActionBar';
import { campaignPhase, getAreas, getBranches, getCampaign, getPreviewState, getSettings } from '@/lib/content';
import { branchArea, branchPath } from '@/lib/branch';
import { getLiveTest } from '@/lib/preview';
import { isPrelaunch } from '@/lib/preview';
import { telHref } from '@/lib/format';
import { OrgSchema } from '@/components/OrgSchema';
import { CampaignBar } from '@/components/CampaignBar';
import { TopBar } from '@/components/TopBar';
import { Analytics } from '@/components/Analytics';
import type { Metadata } from 'next';

function ComingSoon({ phone }: { phone?: string }) {
  const tel = telHref(phone);
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-navy-950 text-white">
      <Backdrop variant="hero" />
      <div className="container-x relative flex flex-1 flex-col justify-center py-20">
        <Wordmark light />
        <h1 className="mt-10 max-w-2xl text-4xl font-bold sm:text-5xl">เว็บไซต์ใหม่ของอีซูซุกรุงเทพเซลส์ กำลังจะเปิดเร็วๆ นี้</h1>
        <p className="mt-4 max-w-xl text-lg text-white/75">ระหว่างนี้ติดต่อสอบถามรุ่นรถ โปรโมชั่น และนัดหมายเข้าศูนย์บริการได้ทางโทรศัพท์</p>
        {tel && <a href={tel} className="btn btn-primary mt-8 self-start">โทร {phone}</a>}
      </div>
      <div className="lane-road relative mb-10 opacity-40" aria-hidden />
    </main>
  );
}

/** รหัสยืนยันเจ้าของเว็บ Google Search Console / Bing Webmaster (ตั้งค่าเว็บ → Google / Bing / Analytics) */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  // รับได้ทั้งค่าล้วน, ค่าที่มีเครื่องหมายคำพูด หรือวางทั้งแท็ก <meta … content="…">
  const clean = (v?: string) => {
    const t = (v ?? '').trim();
    const m = t.match(/content\s*=\s*["']([^"']+)["']/i);
    return (m ? m[1] : t).replace(/^["'\s]+|["'\s/>]+$/g, '');
  };
  const google = clean(s.google_site_verification);
  const bing = clean(s.bing_site_verification);
  if (!google && !bing) return {};
  return { verification: { google: google || undefined, other: bing ? { 'msvalidate.01': bing } : undefined } };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, preview, campaign, branchList, areaList] = await Promise.all([getSettings(), getPreviewState(), getCampaign(), getBranches(), getAreas().catch(() => [])]);
  const seoLinks = [
    ...branchList.map((b) => ({ href: branchPath(b), label: `อีซูซุ ${branchArea(b)}` })),
    ...areaList.map((a) => ({ href: `/areas/${a.slug}`, label: `อีซูซุ ${a.name}` })),
    { href: '/why', label: 'ทำไมต้องอีซูซุกรุงเทพเซลส์' },
  ];
  const phase = campaign ? campaignPhase(campaign) : null;
  const liveTest = preview ? await getLiveTest() : null;
  // เมนู NEW: ระหว่างไลฟ์ = LIVE · นอกนั้นถ้าตั้ง nav_new_url (เช่น /biturbo) ใช้หน้านั้น · ไม่ตั้ง = เมนูแคมเปญเดิม
  const newUrl = settings.nav_new_url?.trim();
  const useNew = !!newUrl && phase !== 'live';
  const promo = useNew
    ? { label: settings.nav_new_label?.trim() || 'รุ่นใหม่', live: false, href: newUrl }
    : campaign?.show_in_nav ? { label: campaign.nav_label, live: phase === 'live' } : null;
  const barText = useNew
    ? settings.nav_new_bar?.trim() || null
    : campaign && promo
      ? phase === 'live' ? `LIVE ตอนนี้: ${campaign.title}${campaign.highlight ? ` ${campaign.highlight}` : ''}`
        : phase === 'ended' ? `ชมย้อนหลัง: ${campaign.title} · ลงทะเบียนรับราคาและสิทธิพิเศษ`
        : `${campaign.eyebrow ?? 'เปิดตัวรุ่นใหม่'} ${campaign.date_text ?? ''} · ลงทะเบียนรับข้อมูลก่อนใคร`
      : null;
  const gated = isPrelaunch() && !preview;

  return (
    <>
        {gated ? (
          <ComingSoon phone={settings.phone_main} />
        ) : (
          <>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
              ข้ามไปเนื้อหา
            </a>
            {preview && (
              <div className="relative z-50 bg-amber text-navy">
                <div className="container-x flex flex-wrap items-center justify-between gap-2 py-2 text-[14px] font-medium">
                  <span className="flex items-center gap-2"><Eye size={17} aria-hidden />โหมดพรีวิว: แสดงข้อมูลตัวอย่างและร่างด้วย คนทั่วไปจะไม่เห็นรายการเหล่านี้</span>
                  <span className="flex flex-wrap items-center gap-4">
                    {liveTest && <a href="/admin/live-test-go?stop=1" className="rounded bg-red px-2.5 py-0.5 font-semibold text-white">กำลังทดสอบไลฟ์ · หยุดทดสอบ</a>}
                    <Link href="/preview?exit=1" prefetch={false} className="font-semibold underline">ออกจากพรีวิว</Link>
                  </span>
                </div>
              </div>
            )}
            <TopBar settings={settings} />
            {barText && <CampaignBar text={barText} live={!useNew && phase === 'live'} hideHome={useNew ? false : campaign?.show_on_home !== false} href={useNew ? newUrl : '/live'} />}
            <Header promo={promo} />
            <main id="main">{children}</main>
            <Footer settings={settings} links={seoLinks} />
            <MobileActionBar settings={settings} />
            <OrgSchema />
            {/^G-[A-Z0-9]{4,20}$/.test(settings.ga4_id?.trim() ?? '') && !preview && <Analytics id={settings.ga4_id!.trim()} />}
          </>
        )}
    </>
  );
}
