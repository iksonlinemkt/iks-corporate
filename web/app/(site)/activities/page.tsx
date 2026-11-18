import { CalendarDays } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { Media } from '@/components/Media';
import { IndustryCard } from '@/components/IndustryCard';
import { FlexVideo } from '@/components/FlexVideo';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { getActivities, getHero, getSections } from '@/lib/content';
import { formatThaiDate, mediaUrl } from '@/lib/format';
import { embedVideo } from '@/lib/video';
import { resolveVideoUrl } from '@/lib/videoResolve';
import { pageMetadata, Sections } from '@/lib/page';
import type { Activity } from '@/lib/types';

export const generateMetadata = () => pageMetadata('activities');

/** สื่อของกิจกรรม: มีคลิป = แสดงคลิป · ไม่มี = สไลด์รูป (รูปปก + รูปสไลด์) */
async function ActivityMedia({ a }: { a: Activity }) {
  const video = embedVideo(await resolveVideoUrl(a.video_url));
  const poster = mediaUrl(a.cover_image);
  if (video) {
    return <FlexVideo video={video} title={a.title} poster={poster} />;
  }
  const images = [a.cover_image, ...(a.gallery ?? [])].filter((x): x is string => !!x).map((x) => mediaUrl(x)!).filter(Boolean);
  const unique = [...new Set(images)];
  if (unique.length === 0) return <Media src={null} slot="activity_cover" alt={a.title} className="aspect-[16/10] w-full rounded-[var(--radius-card)]" />;
  return (
    <div className="shadow-[0_24px_50px_-30px_rgb(12_35_70/0.6)]">
      <IndustryCard name={a.title} images={unique} aspect="aspect-[16/10]" showName={false} />
    </div>
  );
}

export default async function ActivitiesPage() {
  const [sections, hero, activities] = await Promise.all([getSections('activities'), getHero('activities'), getActivities()]);
  return (
    <Sections
      list={sections}
      render={{
        hero: () => <Hero slides={hero} fallbackTitle="กิจกรรม" />,
        list: (s) => (
          <SectionShell>
            <SectionHeading title={s.title ?? 'กิจกรรมของเรา'} subtitle={s.subtitle} />
            {activities.length === 0 ? (
              <p className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-[16px] text-steel">เร็วๆ นี้ ติดตามกิจกรรมของอีซูซุกรุงเทพเซลส์ได้ที่นี่</p>
            ) : (
              <div className="space-y-14 sm:space-y-20">
                {activities.map((a, i) => (
                  <article key={a.id} id={a.slug} className="grid scroll-mt-32 items-center gap-6 lg:grid-cols-2 lg:gap-14 2xl:scroll-mt-24">
                    <div className={i % 2 ? 'lg:order-2' : ''}><ActivityMedia a={a} /></div>
                    <div>
                      {a.event_date && (
                        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-copper/12 px-3 py-1 font-display text-[14px] font-semibold text-copper-dark">
                          <CalendarDays size={16} aria-hidden />{formatThaiDate(a.event_date)}
                        </p>
                      )}
                      <h2 className="text-[26px] font-bold leading-snug sm:text-[32px]"><span className="text-navy-metal">{a.title}</span></h2>
                      {a.summary && <p className="mt-3 text-[17px] font-medium leading-relaxed text-navy">{a.summary}</p>}
                      {a.body && <p className="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-steel">{a.body}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionShell>
        ),
      }}
    />
  );
}
