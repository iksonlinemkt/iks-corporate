import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { PromoCard } from '@/components/Cards';
import { FilterChips, Rail } from '@/components/Rail';
import { Media } from '@/components/Media';
import { Backdrop } from '@/components/Backdrop';
import { getHero, getPromotionCategories, getPromotions, getSections } from '@/lib/content';
import { pageMetadata, Sections } from '@/lib/page';

export const generateMetadata = () => pageMetadata('promotions');

export default async function PromotionsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat = '' } = await searchParams;
  const [sections, hero, cats, promos] = await Promise.all([
    getSections('promotions'), getHero('promotions'), getPromotionCategories(), getPromotions(),
  ]);
  const usedCats = cats.filter((c) => promos.some((p) => p.category_id === c.id));
  const active = usedCats.find((c) => c.slug === cat);
  const shown = active ? promos.filter((p) => p.category_id === active.id) : promos;
  const featured = shown.filter((p) => p.is_featured);
  const others = shown.filter((p) => !p.is_featured);

  const empty = shown.length === 0 && (
    <SectionShell>
      <p className="text-lg text-steel">ยังไม่มีโปรโมชั่นในหมวดนี้ <Link href="/promotions" className="font-semibold text-copper-dark underline">ดูโปรโมชั่นทั้งหมด</Link></p>
    </SectionShell>
  );

  return (
    <Sections
      list={sections}
      render={{
        hero: () => <Hero slides={hero} fallbackTitle="โปรโมชั่น" />,
        category_tabs: () =>
          usedCats.length > 1 && (
            <div id="all" className="scroll-mt-24 border-b border-line bg-white">
              <div className="container-x py-5">
                <FilterChips basePath="/promotions" anchor="all" active={active?.slug ?? ''}
                  items={[{ value: '', label: 'ทั้งหมด' }, ...usedCats.map((c) => ({ value: c.slug, label: c.name }))]} />
              </div>
            </div>
          ),
        featured: (s) =>
          featured.length > 0 ? (
            <SectionShell>
              <SectionHeading title={active ? active.name : s.title} subtitle={active ? active.subtitle : s.subtitle} />
              <Rail cols={featured.length >= 4 ? 4 : 3}>{featured.map((p) => <PromoCard key={p.id} p={p} />)}</Rail>
            </SectionShell>
          ) : empty,
        others: (s) =>
          others.length > 0 && (
            <SectionShell tone="mist">
              <SectionHeading title={s.title} subtitle={s.subtitle} />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {others.map((p) => <PromoCard key={p.id} p={p} compact />)}
              </div>
            </SectionShell>
          ),
        whale_cta: (s) => (
          <section className="relative overflow-hidden bg-navy-950 text-white">
            <Backdrop variant="band" />
            <div className="container-x relative grid items-center gap-6 py-12 sm:grid-cols-[120px_1fr_auto]">
              <Media src={s.image} slot="mascot" alt="Happy Whale" fit="contain" dark className="hidden aspect-square w-[120px] rounded-lg sm:flex" />
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">{s.title}</h2>
                {s.subtitle && <p className="mt-1 text-white/75">{s.subtitle}</p>}
              </div>
              <Link href={s.cta_url ?? '/contact?type=quote'} className="btn btn-primary">{s.cta_label ?? 'สอบถามโปรโมชั่น'}</Link>
            </div>
          </section>
        ),
      }}
    />
  );
}
