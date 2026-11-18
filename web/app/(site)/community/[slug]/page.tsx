import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, ChevronRight, MessageCircle } from 'lucide-react';
import { ShowroomBg } from '@/components/ShowroomBg';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { IndustryCard } from '@/components/IndustryCard';
import { FlexVideo } from '@/components/FlexVideo';
import { RichLines } from '@/components/RichLines';
import { JsonLd } from '@/components/JsonLd';
import { getCommunities, getCommunityPosts } from '@/lib/content';
import { formatThaiDate, mediaUrl } from '@/lib/format';
import { embedVideo } from '@/lib/video';
import { resolveVideoUrl } from '@/lib/videoResolve';
import { SITE_URL } from '@/lib/site';
import type { CommunityPost } from '@/lib/types';

async function find(slug: string) {
  const clubs = await getCommunities();
  return { club: clubs.find((c) => c.slug === slug) ?? null, clubs };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { club } = await find(slug);
  if (!club) return {};
  const title = `${club.name} · Community อีซูซุกรุงเทพเซลส์`;
  const description = (club.tagline ?? club.description ?? '').replace(/\s+/g, ' ').slice(0, 160);
  const img = mediaUrl(club.cover_image ?? club.gallery?.[0]);
  return {
    title: { absolute: title }, description,
    alternates: { canonical: `/community/${club.slug}` },
    openGraph: { title, description, url: `/community/${club.slug}`, siteName: 'อีซูซุกรุงเทพเซลส์', locale: 'th_TH', type: 'website', images: img ? [img] : ['/cover/showroom.webp'] },
  };
}

async function Post({ p }: { p: CommunityPost }) {
  const video = embedVideo(await resolveVideoUrl(p.video_url));
  const images = (p.images ?? []).map((x) => mediaUrl(x)!).filter(Boolean);
  return (
    <article id={`post-${p.id}`} className="scroll-mt-32 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
      {video ? <FlexVideo video={video} title={p.title} poster={images[0] ?? null} />
        : images.length > 0 && <IndustryCard name={p.title} images={images} aspect="aspect-[4/3]" showName={false} />}
      <div className="p-5 sm:p-6">
        {p.post_date && <p className="mb-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-copper-dark"><CalendarDays size={15} aria-hidden />{formatThaiDate(p.post_date)}</p>}
        <h3 className="text-[20px] font-bold leading-snug text-navy sm:text-[22px]">{p.title}</h3>
        {p.body && <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-ink">{p.body}</p>}
        {images.length > 1 && !video && <p className="mt-3 text-[13px] text-steel">{images.length} รูป · กดที่รูปเพื่อดูเต็มจอ</p>}
      </div>
    </article>
  );
}

export default async function CommunityClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, clubs } = await find(slug);
  if (!club) notFound();
  const posts = await getCommunityPosts(club.id);
  const cover = mediaUrl(club.cover_image);
  const gallery = (club.gallery ?? []).map((x) => mediaUrl(x)!).filter(Boolean);
  const join = club.join_url?.trim() || '/contact';
  const external = /^https?:\/\//.test(join);
  const others = clubs.filter((c) => c.id !== club.id);
  const path = `/community/${club.slug}`;

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={club.name} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
            <span className="absolute inset-0 bg-linear-to-t from-[#060a14] via-[#060a14]/60 to-[#060a14]/10 lg:bg-linear-to-r lg:from-[#060a14]/95 lg:via-[#060a14]/60 lg:to-transparent" aria-hidden />
          </>
        ) : <ShowroomBg />}
        <div className="container-x relative flex min-h-[300px] flex-col justify-end pb-10 pt-16 sm:min-h-[360px] lg:min-h-[440px] lg:justify-center lg:py-14">
          <p className="mb-2 font-display text-[13px] font-semibold tracking-[0.18em] text-copper-light sm:text-[14px]">
            <Link href="/community" className="hover:underline">COMMUNITY</Link> · ISUZU KRUNGTHEP SALES
          </p>
          <div className="flex items-center gap-4">
            {club.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(club.logo)!} alt="" aria-hidden className="h-16 w-16 shrink-0 rounded-full bg-white object-contain p-1 sm:h-20 sm:w-20" />
            )}
            <h1 className="text-[40px] font-bold leading-tight sm:text-5xl lg:text-[58px]"><span className="text-chrome">{club.name}</span></h1>
          </div>
          <span className="red-streak mt-4 block" style={{ width: 'min(70%, 380px)' }} aria-hidden />
          {club.tagline && <p className="mt-4 max-w-[680px] text-[17px] text-white/85 sm:text-[19px]">{club.tagline}</p>}
          <div className="mt-6">
            <a href={join} {...(external ? { target: '_blank', rel: 'noopener' } : {})} className="btn btn-primary">
              <MessageCircle size={18} aria-hidden />{club.join_label || 'สนใจร่วมคลับ'}
            </a>
          </div>
        </div>
      </section>

      {(club.description || gallery.length > 0) && (
        <SectionShell>
          <div className={`grid items-center gap-8 ${gallery.length ? 'lg:grid-cols-2 lg:gap-12' : ''}`}>
            {club.description && (
              <div>
                <SectionHeading title={`เกี่ยวกับ${club.name}`} />
                <RichLines text={club.description} className="text-[17px] leading-relaxed" />
              </div>
            )}
            {gallery.length > 0 && <IndustryCard name={club.name} images={gallery} aspect="aspect-[16/10]" showName={false} />}
          </div>
        </SectionShell>
      )}

      <SectionShell tone="mist">
        <SectionHeading title="ข่าวและภาพกิจกรรม" subtitle={posts.length ? `${posts.length} โพสต์ล่าสุดของ${club.name}` : undefined} />
        {posts.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-10 text-center text-[16px] text-steel">ติดตามภาพและข่าวกิจกรรมของ{club.name}ได้ที่นี่ เร็ว ๆ นี้</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <Post key={p.id} p={p} />)}
          </div>
        )}
      </SectionShell>

      {others.length > 0 && (
        <SectionShell>
          <SectionHeading title="คลับอื่นใน Community" />
          <ul className="flex flex-wrap gap-3">
            {others.map((o) => <li key={o.id}><Link href={`/community/${o.slug}`} className="inline-flex items-center gap-1 rounded-full border border-line px-5 py-2.5 font-display text-[16px] font-semibold text-navy hover:border-copper">{o.name}<ChevronRight size={16} aria-hidden /></Link></li>)}
          </ul>
        </SectionShell>
      )}

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}${path}#club`,
        name: club.name,
        description: club.tagline ?? undefined,
        url: `${SITE_URL}${path}`,
        image: cover ? `${SITE_URL}${cover}` : undefined,
        parentOrganization: { '@id': `${SITE_URL}/#org` },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Community', item: `${SITE_URL}/community` },
          { '@type': 'ListItem', position: 3, name: club.name, item: `${SITE_URL}${path}` },
        ],
      }} />
    </>
  );
}
