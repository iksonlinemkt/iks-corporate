import { Hero } from '@/components/Hero';
import { Media } from '@/components/Media';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { HighlightGrid } from '@/components/Cards';
import { Rail } from '@/components/Rail';
import { getActivities, getHero, getHighlights, getSections } from '@/lib/content';
import { formatThaiDate } from '@/lib/format';
import { pageMetadata, Sections } from '@/lib/page';
import { FlexVideo } from '@/components/FlexVideo';
import { embedVideo } from '@/lib/video';
import { resolveVideoUrl } from '@/lib/videoResolve';
import { mediaUrl } from '@/lib/format';
import type { Section } from '@/lib/types';

/** คลิปแนะนำตัว Happy Whale + ข้อความสรุปด้านข้าง */
async function WhaleVideo({ s }: { s: Section }) {
  const video = embedVideo(await resolveVideoUrl(s.video_url));
  if (!video) return null;
  const vertical = video.vertical || s.data?.vertical === true;
  const lines = (s.body ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const lead = lines.filter((l) => !/^[-•]/.test(l));
  const points = lines.filter((l) => /^[-•]/.test(l)).map((l) => l.replace(/^[-•]\s*/, ''));
  return (
    <section id="video" className="scroll-mt-32 bg-blue-soft 2xl:scroll-mt-24">
      <div className={`container-x grid items-center gap-8 py-12 sm:py-16 lg:gap-14 ${vertical ? 'lg:grid-cols-[minmax(0,400px)_1fr]' : 'lg:grid-cols-[1.25fr_1fr]'}`}>
        <FlexVideo video={video} title={s.title ?? 'แนะนำ Happy Whale'} poster={mediaUrl(s.image)} vertical={vertical} />
        <div>
          {s.subtitle && <p className="mb-2 font-display text-[15px] font-semibold tracking-wide text-copper-dark">{s.subtitle}</p>}
          <h2 className="text-[30px] font-bold leading-tight sm:text-[38px]"><span className="text-navy-metal">{s.title ?? 'สวัสดีครับ ผม Happy Whale'}</span></h2>
          {lead.map((l) => <p key={l} className="mt-4 text-[17px] leading-relaxed text-navy/85">{l}</p>)}
          {points.length > 0 && (
            <ul className="mt-6 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex gap-3 rounded-[var(--radius-card)] bg-white/80 p-4 text-[16px] leading-relaxed text-navy shadow-[0_6px_20px_-14px_rgb(12_35_70/0.4)]">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-copper" aria-hidden />
                  <span>{p.includes(':') ? <><strong className="font-semibold">{p.slice(0, p.indexOf(':') + 1)}</strong>{p.slice(p.indexOf(':') + 1)}</> : p}</span>
                </li>
              ))}
            </ul>
          )}
          {s.cta_label && s.cta_url && <a href={s.cta_url} className="btn btn-navy mt-7">{s.cta_label}</a>}
        </div>
      </div>
    </section>
  );
}

export const generateMetadata = () => pageMetadata('happy-whale');

export default async function HappyWhalePage() {
  const [sections, hero, hl, allActivities] = await Promise.all([
    getSections('happy-whale'), getHero('happy-whale'), getHighlights(), getActivities(),
  ]);
  // แสดงเฉพาะกิจกรรม Happy Whale (ไม่รวมโชว์เคสรถ เช่น Trooper)
  const activities = allActivities.filter((a) => a.slug.startsWith('happy-whale') || /happy\s*whale|วาฬ/i.test(`${a.title} ${a.summary ?? ''}`));
  const intro = sections.find((s) => s.section_key === 'intro');
  const origin = sections.find((s) => s.section_key === 'origin');

  return (
    <Sections
      list={sections}
      render={{
        hero: () => <Hero slides={hero} fallbackTitle="Happy Whale" />,
        video: (s) => <WhaleVideo s={s} />,
        intro: (s) => (
          <SectionShell id="intro">
            <div className="grid items-center gap-10 lg:grid-cols-[320px_1fr_1fr]">
              <Media src={s.image} slot="mascot" alt="Happy Whale" fit="contain" className="mx-auto aspect-square w-56 rounded-lg lg:w-full" />
              <div>
                <SectionHeading title={s.title} subtitle={s.subtitle} />
                {s.body && <p className="text-[17px] leading-relaxed">{s.body}</p>}
              </div>
              {origin && (
                <div className="border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                  <h2 className="text-2xl font-bold">{origin.title}</h2>
                  {origin.body && <p className="mt-3 text-[17px] leading-relaxed text-steel">{origin.body}</p>}
                </div>
              )}
            </div>
          </SectionShell>
        ),
        // ถ้าซ่อน "intro" ไว้ ให้แสดง "origin" เป็น section ของตัวเอง
        origin: (s) =>
          !intro && (
            <SectionShell>
              <SectionHeading title={s.title} subtitle={s.subtitle} />
              {s.body && <p className="max-w-3xl text-[17px] leading-relaxed">{s.body}</p>}
            </SectionShell>
          ),
        values: (s) =>
          (hl.whale_values?.length ?? 0) > 0 && (
            <SectionShell tone="mist">
              <SectionHeading title={s.title} subtitle={s.subtitle} />
              <HighlightGrid items={hl.whale_values} cols={4} />
            </SectionShell>
          ),
        care: (s) =>
          (hl.whale_care?.length ?? 0) > 0 && (
            <SectionShell>
              <SectionHeading title={s.title} subtitle={s.subtitle} />
              <HighlightGrid items={hl.whale_care} cols={4} />
            </SectionShell>
          ),
        activities: (s) =>
          activities.length > 0 && (
            <SectionShell tone="mist" id="activities">
              <SectionHeading title={s.title} subtitle={s.subtitle} link="/activities" linkLabel="ดูกิจกรรมทั้งหมด" />
              <Rail cols={4}>
                {activities.map((a) => (
                  <a key={a.id} href={`/activities#${a.slug}`} className="block overflow-hidden rounded-[var(--radius-card)] border border-line bg-white hover:border-copper">
                    <Media src={a.cover_image} slot="activity_cover" alt={a.title} className="aspect-[3/2] w-full" />
                    <div className="p-5">
                      {a.event_date && <p className="text-[13px] text-steel">{formatThaiDate(a.event_date)}</p>}
                      <h3 className="mt-0.5 text-lg font-bold leading-snug">{a.title}</h3>
                      {a.summary && <p className="mt-1 text-[15px] text-steel">{a.summary}</p>}
                    </div>
                  </a>
                ))}
              </Rail>
            </SectionShell>
          ),
      }}
    />
  );
}
