import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { Media } from '@/components/Media';
import { Icon } from '@/components/Icon';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { ExternalLink, MapPin } from 'lucide-react';
import { getHero, getHighlights, getSections, getSettings, getTimeline } from '@/lib/content';
import { buddhistYear, mediaUrl } from '@/lib/format';
import { pageMetadata, Sections } from '@/lib/page';

export const generateMetadata = () => pageMetadata('about');

export default async function AboutPage() {
  const [sections, hero, hl, timeline, settings] = await Promise.all([
    getSections('about'), getHero('about'), getHighlights(), getTimeline(), getSettings(),
  ]);
  type Company = { code: string; name: string; en?: string; area: string; since?: string; url?: string; current?: boolean };
  const groupName = settings.group_name ?? 'กลุ่มชลบุรีอีซูซุ';
  const groupYears = settings.group_since ? new Date().getFullYear() + 543 - Number(settings.group_since) : null;
  const chairPhoto = mediaUrl(settings.group_chairman_photo);
  const vision = sections.find((s) => s.section_key === 'vision');
  const mission = sections.find((s) => s.section_key === 'mission');
  const visionMission = () =>
          (vision || mission) && (
            <SectionShell tone="mist">
              <div className="grid gap-5 md:grid-cols-2">
                {[vision, mission].filter(Boolean).map((v) => (
                  <div key={v!.id} className="rounded-[var(--radius-card)] border border-line bg-white p-7 sm:p-9">
                    <h2 className="text-2xl font-bold text-copper-dark">{v!.title}</h2>
                    {v!.body && <p className="mt-3 text-[17px] leading-relaxed">{v!.body}</p>}
                  </div>
                ))}
              </div>
            </SectionShell>
          );

  return (
    <Sections
      list={sections}
      render={{
        hero: () => <Hero slides={hero} fallbackTitle="เกี่ยวกับเรา" />,
        stats: () =>
          (hl.about_stats?.length ?? 0) > 0 && (
            <div className="border-b border-line bg-white">
              <ul className="container-x grid grid-cols-2 gap-y-6 py-8 sm:grid-cols-3 lg:grid-cols-5">
                {hl.about_stats!.map((st) => (
                  <li key={st.id} className="flex items-start gap-3 pr-4">
                    <Icon name={st.icon} className="mt-1 shrink-0 text-copper-dark" />
                    <span>
                      <span className="block font-display text-[22px] font-bold leading-tight">{st.title}</span>
                      {st.subtitle && <span className="block text-[13px] leading-snug text-steel">{st.subtitle}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ),
        intro: (s) => (
          <SectionShell>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <SectionHeading title={s.title} subtitle={s.subtitle} />
                {s.body && <p className="text-[17px] leading-relaxed">{s.body}</p>}
              </div>
              <Media src={s.image} slot="section_banner" alt={s.title ?? 'อีซูซุกรุงเทพเซลส์'} className="aspect-[4/3] w-full rounded-[var(--radius-card)]" />
            </div>
          </SectionShell>
        ),
        // ในเครือกลุ่มชลบุรีอีซูซุ: ประธานกลุ่ม + บริษัทในเครือ
        group: (s) => {
          const companies = ((s.data?.companies ?? []) as Company[]);
          return (
            <SectionShell>
              <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
                <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-navy-950 p-7 text-white sm:p-9">
                  <span className="red-streak absolute left-0 top-0 block" style={{ width: '60%' }} aria-hidden />
                  {groupYears && (
                    <p className="font-display leading-none"><span className="text-chrome-xl text-[88px] font-extrabold sm:text-[110px]">{groupYears}</span><span className="ml-2 text-[26px] font-bold text-white/85">ปี</span></p>
                  )}
                  <p className="mt-2 font-display text-[19px] font-bold">{groupName}{settings.group_since && <span className="font-medium text-white/70"> · ตั้งแต่ พ.ศ. {settings.group_since}</span>}</p>
                  {settings.group_name_en && <p className="text-[14px] tracking-[0.12em] text-copper-light uppercase">{settings.group_name_en}</p>}
                  {settings.group_chairman && (
                    <div className="mt-8 flex items-center gap-4 border-t border-white/15 pt-6">
                      {chairPhoto && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={chairPhoto} alt={settings.group_chairman} className="h-20 w-20 shrink-0 rounded-full object-cover object-top ring-2 ring-copper-light" />
                      )}
                      <div>
                        <p className="font-display text-[20px] font-bold">{settings.group_chairman}</p>
                        <p className="text-[15px] text-white/75">{settings.group_chairman_title ?? `ประธาน${groupName}`}</p>
                      </div>
                    </div>
                  )}
                  {settings.group_chairman_message && (
                    <blockquote className="mt-5 border-l-2 border-copper-light pl-4 text-[16px] italic leading-relaxed text-white/85">“{settings.group_chairman_message}”</blockquote>
                  )}
                </div>
                <div>
                  <SectionHeading title={s.title} subtitle={s.subtitle} />
                  {s.body && <p className="text-[17px] leading-relaxed">{s.body}</p>}
                  {companies.length > 0 && (
                    <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                      {companies.map((c) => (
                        <li key={c.code} className={`relative flex flex-col rounded-[var(--radius-card)] border p-5 ${c.current ? 'border-copper bg-copper/8' : 'border-line bg-white'}`}>
                          {c.current && <span className="absolute right-3 top-3 rounded bg-copper px-2 py-0.5 text-[11px] font-bold text-navy-950">เว็บนี้</span>}
                          <span className="font-display text-[30px] font-extrabold leading-none text-navy">{c.code}</span>
                          <span className="mt-2 font-display text-[16px] font-bold leading-snug">{c.name}</span>
                          {c.en && <span className="text-[12px] text-steel">{c.en}</span>}
                          <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-copper-dark"><MapPin size={14} aria-hidden />{c.area}</span>
                          {c.since && <span className="text-[13px] text-steel">ก่อตั้ง พ.ศ. {c.since}</span>}
                          {!c.current && c.url && (
                            <a href={c.url} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-navy underline-offset-2 hover:underline">เว็บไซต์กลุ่ม<ExternalLink size={13} aria-hidden /></a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </SectionShell>
          );
        },
        // วิสัยทัศน์ + พันธกิจ แสดงคู่กันในตำแหน่งของตัวที่มาก่อน
        vision: () => visionMission(),
        mission: () => (vision ? null : visionMission()),
        dna: (s) =>
          (hl.company_dna?.length ?? 0) > 0 && (
            <SectionShell tone="navy">
              <SectionHeading title={s.title} subtitle={s.subtitle} light />
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {hl.company_dna!.map((d) => (
                  <li key={d.id} className="rounded-[var(--radius-card)] border border-white/15 p-5">
                    <span className="block font-display text-[56px] font-bold leading-none text-white" aria-hidden>{d.title.charAt(0)}</span>
                    <span className="mt-3 block font-display text-lg font-bold text-white">{d.title}</span>
                    {d.subtitle && <span className="mt-1 block text-[14px] leading-snug text-white/70">{d.subtitle}</span>}
                  </li>
                ))}
              </ul>
            </SectionShell>
          ),
        timeline: (s) =>
          timeline.length > 0 && (
            <SectionShell tone="mist">
              <SectionHeading title={s.title} subtitle={s.subtitle} />
              <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {timeline.map((t) => (
                  <li key={t.id} className="relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
                    {t.image && <Media src={t.image} slot="timeline" alt={t.title} className="aspect-[16/10] w-full" />}
                    <div className="flex flex-1 gap-4 p-5">
                      <span className="w-1 shrink-0 rounded-full bg-linear-to-b from-copper to-red" aria-hidden />
                      <div>
                        <p className="font-display text-[30px] font-extrabold leading-none text-navy">{buddhistYear(t.year)}<span className="ml-2 text-[14px] font-semibold text-steel">ค.ศ. {t.year}</span></p>
                        <p className="mt-2 font-display text-[18px] font-bold leading-snug">{t.title}</p>
                        {t.description && <p className="mt-1 text-[15px] leading-relaxed text-steel">{t.description}</p>}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </SectionShell>
          ),
        csr: (s) => (
          <SectionShell tone="mist">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <SectionHeading title={s.title} subtitle={s.subtitle} />
                {s.body && <p className="max-w-3xl text-[17px] leading-relaxed">{s.body}</p>}
              </div>
              <Link href={s.cta_url ?? '/happy-whale#activities'} className="btn btn-navy">{s.cta_label ?? 'ดูกิจกรรมเพื่อสังคม'}</Link>
            </div>
          </SectionShell>
        ),
      }}
    />
  );
}
