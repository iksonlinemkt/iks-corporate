import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Gift } from 'lucide-react';
import { LeadForm } from '@/components/LeadForm';
import { LaunchSpotlight } from '@/components/LaunchSpotlight';
import { TrustStrip } from '@/components/TrustStrip';
import { JsonLd } from '@/components/JsonLd';
import { campaignPhase, getBranches, getCampaign, getSettings } from '@/lib/content';
import { getReviewData } from '@/lib/reviews';
import { pageMetadata } from '@/lib/page';
import { lineHref, mediaUrl } from '@/lib/format';
import { SITE_URL } from '@/lib/site';
import { getLiveTest } from '@/lib/preview';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [base, c] = await Promise.all([pageMetadata('live'), getCampaign()]);
  const img = mediaUrl(c?.image_desktop);
  return img ? { ...base, openGraph: { ...base.openGraph, images: [img] } } : base;
}

const INTERESTS = ['รับข้อมูลและราคาก่อนใคร', 'ขอใบเสนอราคา', 'จองทดลองขับ', 'สอบถามรถเพื่อการพาณิชย์ / ต่ออุปกรณ์', 'สอบถามการเทิร์นรถคันเก่า'];
const SOURCES: Record<string, string> = { fb: 'facebook_live', facebook: 'facebook_live', tt: 'tiktok_live', tiktok: 'tiktok_live', yt: 'youtube_live', youtube: 'youtube_live', line: 'line', qr: 'qr_on_screen' };

export default async function LivePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [c, settings, branches, reviews] = await Promise.all([getCampaign(), getSettings(), getBranches(), getReviewData()]);
  if (!c) notFound();
  const phase = campaignPhase(c);
  // ไลฟ์จบแล้ว + ตั้งเมนู NEW ไว้ (เช่น /biturbo): คนที่เข้า /live (รวมจาก Google) ไปหน้ารุ่นใหม่แทน
  // แคมเปญถัดไป (ยังไม่เริ่ม/กำลังไลฟ์) หน้านี้กลับมาใช้ได้เอง · ทีมที่กำลังทดสอบลิงก์ไลฟ์ยังเห็นหน้านี้
  const nextUrl = settings.nav_new_url?.trim();
  if (phase === 'ended' && nextUrl?.startsWith('/') && !nextUrl.startsWith('/live') && !(await getLiveTest())) redirect(nextUrl);
  const src = sp.utm_source ?? SOURCES[(sp.src ?? '').toLowerCase()] ?? (sp.src ? sp.src.slice(0, 40) : undefined);
  const utm = { ...(src ? { utm_source: src } : {}), utm_campaign: c.slug, ...(sp.utm_medium ? { utm_medium: sp.utm_medium.slice(0, 40) } : {}) };
  const formTitle = phase === 'live' ? 'สนใจรุ่นใหม่? ฝากข้อมูลไว้ ทีมงานโทรกลับทันที'
    : phase === 'ended' ? 'สนใจรุ่นใหม่? ขอราคาและจองทดลองขับ' : c.form_title ?? 'ลงทะเบียนรับข้อมูลก่อนใคร';
  const showrooms = branches.filter((b) => b.has_showroom);
  const follow = [
    ['Facebook', settings.facebook_url], ['TikTok', settings.tiktok_url], ['YouTube', settings.youtube_url],
    ['LINE', settings.line_oa_url ?? lineHref(settings.line_oa_id)],
  ].filter(([, u]) => !!u) as [string, string][];

  return (
    <>
      <LaunchSpotlight c={c} phase={phase} variant="live" />

      <section className="bg-mist">
        <div className="container-x grid gap-6 py-10 lg:grid-cols-[1fr_1.15fr] lg:gap-x-10 lg:py-14">
          <div id="register" className="scroll-mt-32 lg:col-start-2 lg:row-start-1">
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[0_20px_50px_-30px_rgb(12_35_70/0.35)] sm:p-7 lg:sticky lg:top-32 xl:top-24">
              <h2 className="text-[22px] font-bold leading-snug sm:text-[24px]">{formTitle}</h2>
              <p className="mb-5 mt-1 text-[14px] text-steel">ที่ปรึกษาการขายของสาขาใกล้คุณจะติดต่อกลับ</p>
              <LeadForm
                fixedType
                defaultType="launch"
                sourcePage="/live"
                promo={c.slug}
                utm={utm}
                interests={INTERESTS}
                branches={showrooms.map((b) => ({ id: b.id, name: b.name }))}
                pdpaText={settings.pdpa_text}
                pdpaVersion={settings.pdpa_version}
                submitLabel={phase === 'upcoming' ? 'ลงทะเบียน' : 'ส่งข้อมูล'}
              />
            </div>
          </div>
          <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
            {c.offer_title && (
              <div className="flex gap-4 rounded-[var(--radius-card)] border border-copper/40 bg-white p-5">
                <span className="copper-metal flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"><Gift size={22} aria-hidden /></span>
                <div>
                  <p className="font-display text-[19px] font-bold">{c.offer_title}</p>
                  {c.offer_body && <p className="mt-1 whitespace-pre-line text-[15px] text-steel">{c.offer_body}</p>}
                </div>
              </div>
            )}

            <div className="rounded-[var(--radius-card)] bg-navy-950 p-6 text-white">
              <p className="font-display text-[20px] font-bold"><span className="text-gold">ลงทะเบียนวันนี้ ได้อะไร?</span></p>
              <ul className="mt-3 space-y-2 text-[15px] text-white/85">
                <li>• รับข้อมูลรุ่นใหม่ ราคา และโปรโมชั่นก่อนใคร</li>
                <li>• ที่ปรึกษาการขายสาขาใกล้บ้านติดต่อกลับ ตอบทุกคำถาม</li>
                <li>• สิทธิ์นัดชมรถจริงและทดลองขับเมื่อรถเข้าโชว์รูม</li>
              </ul>
            </div>

            {follow.length > 0 && (
              <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
                <p className="font-display text-[17px] font-bold">ติดตามไลฟ์และข่าวรุ่นใหม่</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {follow.map(([n, u]) => (
                    <li key={n}><a href={u} target="_blank" rel="noopener" className="block rounded-md border border-line px-4 py-2 font-display text-[15px] font-semibold hover:border-copper">{n}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </section>

      <div className="border-t border-line bg-white">
        <div className="container-x py-7"><TrustStrip settings={settings} branches={branches.length} rating={reviews.overall} /></div>
      </div>

      {c.launch_at && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: `${c.title}${c.highlight ? ` ${c.highlight}` : ''}`,
          description: c.body ?? undefined,
          startDate: c.launch_at,
          endDate: new Date(new Date(c.launch_at).getTime() + c.live_hours * 3600_000).toISOString(),
          eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: { '@type': 'VirtualLocation', url: `${SITE_URL}/live` },
          organizer: { '@type': 'AutoDealer', name: settings.company_name_th ?? 'อีซูซุกรุงเทพเซลส์', url: SITE_URL },
          image: c.image_desktop ? [`${SITE_URL}${mediaUrl(c.image_desktop)}`] : undefined,
        }} />
      )}
    </>
  );
}
