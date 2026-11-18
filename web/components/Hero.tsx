import Link from 'next/link';
import { Media } from './Media';
import { HeroRotator } from './HeroRotator';
import { Backdrop } from './Backdrop';
import { ShowroomBg } from './ShowroomBg';
import type { HeroSlide } from '@/lib/types';

function Slide({ s, first }: { s: HeroSlide; first: boolean }) {
  const H = first ? 'h1' : 'h2';
  const hasImage = !!(s.image_desktop || s.image_mobile);
  return (
    <div className="relative h-[600px] sm:h-[620px] lg:h-[640px]">
      {!hasImage && s.page_slug !== 'happy-whale' && <ShowroomBg priority={first} />}
      {hasImage && <Media src={s.image_mobile ?? s.image_desktop} slot="hero_mobile" alt={s.image_alt ?? s.title} dark priority={first} placeholder="none"
        className="absolute inset-0 h-full w-full items-start! pt-6 lg:hidden" />}
      {hasImage && <Media src={s.image_desktop} slot="hero_desktop" alt={s.image_alt ?? s.title} dark priority={first} placeholder="none"
        className="absolute inset-0 hidden h-full w-full items-start! justify-end! p-6 lg:flex" />}
      {hasImage && (
        <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/60 to-navy-950/0 lg:bg-linear-to-r lg:from-navy-950 lg:via-navy-950/70 lg:to-navy-950/0" />
      )}
      {s.page_slug === 'happy-whale' && !s.image_desktop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/brand/happy-whale.png" alt="" aria-hidden width={271} height={342}
          className="absolute right-[8%] top-1/2 hidden h-[78%] w-auto -translate-y-1/2 drop-shadow-[0_30px_40px_rgb(0_0_0/0.35)] lg:block" />
      )}
      <div className="container-x relative flex h-full flex-col justify-end pb-20 lg:justify-center lg:pb-10">
        <div className="max-w-[620px]">
          {s.eyebrow && <p className="mb-3 text-[15px] font-medium text-white/80">{s.eyebrow}</p>}
          <H className="text-[38px] font-bold leading-[1.15] text-white sm:text-5xl lg:text-[58px]">
            <span className="text-chrome">{s.title}</span>
            {s.highlight && (
              <span className="text-gold mt-2 block text-[24px] font-semibold leading-snug sm:text-[30px] lg:text-[36px]">
                {s.highlight}
              </span>
            )}
          </H>
          {s.subtitle && (
            <p className="mt-5 flex items-center gap-3 font-display text-[15px] font-semibold tracking-[0.05em] text-white/80">
              <span className="copper-metal h-[2px] w-10" aria-hidden />{s.subtitle}
            </p>
          )}
          {s.body && <p className="mt-3 max-w-[540px] text-[15px] leading-relaxed text-white/85 sm:text-[17px]">{s.body}</p>}
          {(s.cta1_label || s.cta2_label) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {s.cta1_label && s.cta1_url && <Link href={s.cta1_url} className="btn btn-primary">{s.cta1_label}</Link>}
              {s.cta2_label && s.cta2_url && <Link href={s.cta2_url} className="btn btn-ghost-light">{s.cta2_label}</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Hero({ slides, fallbackTitle }: { slides: HeroSlide[]; fallbackTitle: string }) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white" aria-label="แบนเนอร์">
      <Backdrop variant="hero" />
      {slides.length === 0 ? (
        <div className="relative flex min-h-[230px] items-end sm:min-h-[280px] lg:min-h-[340px] lg:items-center">
          <ShowroomBg />
          <div className="container-x relative pb-9 pt-14 sm:pb-12 lg:py-14">
            <p className="mb-2 font-display text-[13px] font-semibold tracking-[0.18em] text-copper-light sm:text-[14px]">ISUZU KRUNGTHEP SALES</p>
            <h1 className="text-[38px] font-bold leading-tight sm:text-5xl lg:text-[58px]"><span className="text-chrome">{fallbackTitle}</span></h1>
            <span className="red-streak mt-4 block" style={{ width: 'min(70%, 380px)' }} aria-hidden />
          </div>
        </div>
      ) : slides.length === 1 ? (
        <Slide s={slides[0]} first />
      ) : (
        <HeroRotator labels={slides.map((s) => s.title)}>
          {slides.map((s, i) => <Slide key={s.id} s={s} first={i === 0} />)}
        </HeroRotator>
      )}
    </section>
  );
}
