import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { ShowroomBg } from '@/components/ShowroomBg';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { getCommunities, getCommunityPosts } from '@/lib/content';
import { mediaUrl } from '@/lib/format';
import { pageMetadata } from '@/lib/page';

export const generateMetadata = () => pageMetadata('community');

/** Community: คลับที่รวมคนที่มีความชอบคล้ายกัน */
export default async function CommunityPage() {
  const [clubs, posts] = await Promise.all([getCommunities(), getCommunityPosts()]);
  const count = (id: string) => posts.filter((p) => p.community_id === id).length;
  const cover = (c: (typeof clubs)[number]) => mediaUrl(c.cover_image ?? c.gallery?.[0] ?? posts.find((p) => p.community_id === c.id && p.images?.length)?.images[0]);

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <ShowroomBg />
        <div className="container-x relative flex min-h-[260px] flex-col justify-end pb-10 pt-16 sm:min-h-[300px] lg:min-h-[340px] lg:justify-center lg:py-14">
          <p className="mb-2 font-display text-[13px] font-semibold tracking-[0.18em] text-copper-light sm:text-[14px]">ISUZU KRUNGTHEP SALES</p>
          <h1 className="text-[40px] font-bold leading-tight sm:text-5xl lg:text-[58px]"><span className="text-chrome">Community</span></h1>
          <span className="red-streak mt-4 block" style={{ width: 'min(70%, 380px)' }} aria-hidden />
          <p className="mt-4 max-w-[680px] text-[17px] text-white/85 sm:text-[19px]">คลับที่รวมคนที่มีความชอบคล้ายกัน มาทำกิจกรรมและสร้างความสัมพันธ์ไปด้วยกัน</p>
        </div>
      </section>

      <SectionShell>
        <SectionHeading title="คลับของเรา" subtitle="เลือกคลับที่ชอบ ดูภาพและข่าวกิจกรรมล่าสุด" />
        {clubs.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-[16px] text-steel">เร็ว ๆ นี้</p>
        ) : (
          <ul className={`grid gap-6 ${clubs.length === 1 ? '' : 'md:grid-cols-2'}`}>
            {clubs.map((c) => {
              const img = cover(c);
              const n = count(c.id);
              return (
                <li key={c.id}>
                  <Link href={`/community/${c.slug}`} className={`group grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-white hover:border-copper ${clubs.length === 1 ? 'lg:grid-cols-[1.2fr_1fr]' : ''}`}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-navy">
                      {img
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={img} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        : <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-navy to-navy-950"><Users size={72} className="text-white/25" aria-hidden /></div>}
                      {c.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(c.logo)!} alt="" aria-hidden className="absolute bottom-3 left-3 h-16 w-16 rounded-full bg-white object-contain p-1 shadow" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-6 sm:p-8">
                      <h2 className="text-[28px] font-bold leading-tight text-navy sm:text-[32px]">{c.name}</h2>
                      {c.tagline && <p className="mt-2 text-[17px] text-steel">{c.tagline}</p>}
                      <p className="mt-5 inline-flex items-center gap-1 font-display text-[16px] font-semibold text-copper-dark group-hover:underline">
                        ดูคลับ{n > 0 && ` · ${n} โพสต์`}<ChevronRight size={18} aria-hidden />
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </SectionShell>
    </>
  );
}
