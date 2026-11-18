import Link from 'next/link';
import { CalendarDays, ChevronRight, PlayCircle, Radio } from 'lucide-react';
import { Backdrop } from './Backdrop';
import { Countdown } from './Countdown';
import { VideoPlayer } from './VideoPlayer';
import { embedVideo } from '@/lib/video';
import { mediaUrl } from '@/lib/format';
import type { Campaign } from '@/lib/types';

/**
 * แคมเปญเปิดตัวรุ่นใหม่: ข้อความครึ่งซ้าย + คลิปใหญ่ครึ่งขวา (ชิดขอบจอ)
 * ใช้ทั้งหน้าแรก (variant="home") และหน้า /live (variant="live")
 */
export function LaunchSpotlight({ c, phase, variant = 'home' }: { c: Campaign; phase: 'upcoming' | 'live' | 'ended'; variant?: 'home' | 'live' }) {
  const video = embedVideo(phase === 'live' ? c.live_url ?? c.teaser_url : phase === 'ended' ? c.replay_url ?? c.live_url ?? c.teaser_url : c.teaser_url);
  const time = c.launch_at ? new Date(c.launch_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }) : null;
  const H = variant === 'live' ? 'h1' : 'h2';
  const poster = mediaUrl(c.video_poster ?? c.image_desktop);

  const media = video ? (
    <div className={`overflow-hidden bg-black ${video.vertical ? 'mx-auto aspect-[9/16] max-h-[80vh]' : 'aspect-video'}`}>
      <VideoPlayer video={video} title={c.title} poster={poster} />
    </div>
  ) : (
    <Link href={variant === 'home' ? '/live' : '#register'} className="relative flex aspect-video flex-col items-center justify-center bg-white/5 text-center hover:bg-white/8">
      {phase === 'live' ? <Radio size={52} className="text-red" aria-hidden /> : <PlayCircle size={52} className="text-copper-light" aria-hidden />}
      <span className="mt-3 font-display text-[20px] font-bold">{phase === 'upcoming' ? `ไลฟ์เปิดตัว ${c.date_text ?? ''}` : 'ชมคลิปเปิดตัว'}</span>
    </Link>
  );

  return (
    <section aria-label="เปิดตัวรุ่นใหม่" className="relative overflow-hidden bg-navy-950 text-white">
      <Backdrop variant="hero" />
      <div className="relative lg:flex lg:min-h-[min(34vw,640px)] lg:items-center">
        {/* คลิป: มือถืออยู่บน · คอมชิดขวาครึ่งจอ */}
        <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:flex lg:w-[54%] lg:items-center">
          <div className="w-full shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] lg:overflow-hidden lg:rounded-l-[var(--radius-card)] lg:ring-1 lg:ring-white/10">
            {media}
          </div>
          <span className="pointer-events-none absolute inset-y-0 -left-px hidden w-10 bg-linear-to-r from-navy-950/80 to-transparent lg:block" aria-hidden />
        </div>

        <div className="container-x relative py-10 sm:py-12 lg:py-16">
          <div className="lg:w-[42%] lg:pr-6">
            <p className="mb-4 flex flex-wrap items-center gap-3">
              {phase === 'live' ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-red px-3 py-1 font-display text-[13px] font-bold shadow-[0_0_20px_rgb(213_31_38/0.6)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden />LIVE ตอนนี้
                </span>
              ) : (
                <span className="copper-metal rounded-full px-3 py-1 font-display text-[13px] font-bold text-navy-950">{phase === 'ended' ? 'รุ่นใหม่' : 'เร็วๆ นี้'}</span>
              )}
              {c.eyebrow && <span className="text-[15px] font-medium text-white/80">{c.eyebrow}</span>}
            </p>
            <H className="text-[36px] font-bold leading-[1.08] sm:text-[48px] xl:text-[56px]">
              <span className="text-chrome">{c.title}</span>
              {c.highlight && <span className="text-gold mt-3 block text-[22px] font-semibold leading-snug sm:text-[28px]">{c.highlight}</span>}
            </H>
            {variant === 'live' && c.body && <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-white/80">{c.body}</p>}
            {(c.date_text || time) && (
              <p className="mt-5 flex items-center gap-2 font-display text-[18px] font-bold">
                <CalendarDays size={20} className="text-copper-light" aria-hidden />{c.date_text}{time && ` · ${time} น.`}
              </p>
            )}
            {phase === 'upcoming' && c.launch_at && new Date(c.launch_at).getTime() > Date.now() && (
              <div className="mt-5"><Countdown to={c.launch_at} /></div>
            )}
            {c.points.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {c.points.map((p) => (
                  <li key={p} className="rounded-md border border-copper-light/40 bg-white/5 px-3.5 py-1.5 font-display text-[15px] font-semibold shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]">
                    <span className="text-gold">{p}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={variant === 'home' ? '/live#register' : '#register'} className="btn btn-primary shadow-[0_10px_30px_-10px_rgb(194_124_69/0.8)]">
                {phase === 'upcoming' ? 'ลงทะเบียนรับข้อมูลก่อนใคร' : 'สนใจรุ่นใหม่ ฝากข้อมูลไว้'}<ChevronRight size={18} aria-hidden />
              </Link>
              {variant === 'home' && <Link href="/live" className="btn btn-ghost-light">ดูหน้าเปิดตัว</Link>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
