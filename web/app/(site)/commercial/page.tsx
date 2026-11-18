import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { Media } from '@/components/Media';
import { Icon } from '@/components/Icon';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { HighlightGrid, VehicleCard } from '@/components/Cards';
import { FaqList } from '@/components/FaqList';
import { Rail } from '@/components/Rail';
import { IndustryCard } from '@/components/IndustryCard';
import { mediaUrl } from '@/lib/format';
import { WhaleBox } from '@/components/WhaleBox';
import {
  getBodyTypes, getFaqs, getHero, getHighlights, getIndustries, getSections, getServices, getSettings, getVehicleCategories, getVehicles,
} from '@/lib/content';
import { pageMetadata, Sections } from '@/lib/page';

export const generateMetadata = () => pageMetadata('commercial');

export default async function CommercialPage() {
  const [sections, hero, hl, settings, categories, vehicles, bodies, industries, services, faqs] = await Promise.all([
    getSections('commercial'), getHero('commercial'), getHighlights(), getSettings(), getVehicleCategories(),
    getVehicles(), getBodyTypes(), getIndustries(), getServices(), getFaqs('commercial'),
  ]);
  const comCat = categories.find((c) => c.slug === 'commercial-pickup');
  const comModels = comCat ? vehicles.filter((v) => v.category_id === comCat.id) : [];
  const types = categories.filter((c) => c.segment === 'commercial');
  const svc = services.filter((s) => s.group_key === 'commercial');
  const modelOf = (catId: string) => vehicles.find((v) => v.category_id === catId);

  return (
    <Sections
      list={sections}
      render={{
        hero: () => <Hero slides={hero} fallbackTitle="รถเพื่อการพาณิชย์" />,
        industries: (s) =>
          industries.length > 0 && (
            <SectionShell>
              <SectionHeading title={s.title ?? 'เลือกตามประเภทธุรกิจ'} subtitle={s.subtitle} />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {industries.map((it) => (
                  <IndustryCard key={it.id} name={it.name} href={it.url ?? (it.slug && (it.headline || it.description) ? `/commercial/${it.slug}` : '/contact?type=commercial')}
                    nameHref={it.slug && (it.headline || it.description) ? `/commercial/${it.slug}` : undefined}
                    images={[it.image, ...(it.gallery ?? [])].map((p) => mediaUrl(p)).filter((u): u is string => !!u)} />
                ))}
              </div>
            </SectionShell>
          ),
        commercial_models: (s) =>
          comModels.length > 0 && (
            <SectionShell tone="mist">
              <SectionHeading title={s.title ?? 'รุ่นรถสำหรับต่ออุปกรณ์'} subtitle={s.subtitle} link="/models?type=pickup#g-commercial-pickup" linkLabel="ดูรุ่นรถทั้งหมด" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{comModels.map((v) => <VehicleCard key={v.id} v={v} />)}</div>
            </SectionShell>
          ),
        faq: (s) =>
          faqs.length > 0 && (
            <SectionShell>
              <SectionHeading title={s.title ?? 'คำถามที่พบบ่อย'} subtitle={s.subtitle} />
              <FaqList items={faqs} />
            </SectionShell>
          ),
        vehicle_types: (s) =>
          types.length > 0 && (
            <SectionShell tone="mist">
              <SectionHeading title={s.title} subtitle={s.subtitle} />
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {types.map((c) => {
                  const m = modelOf(c.id);
                  return (
                    <li key={c.id}>
                      <Link href={m ? `/models/${m.slug}` : '/contact?type=commercial'}
                        className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white hover:border-copper">
                        <Media src={c.image ?? m?.image_cutout ?? null} slot="vehicle_category" alt={c.name} fit="contain" className="aspect-[4/3] w-full bg-white" />
                        <span className="border-t border-line p-4">
                          <span className="block font-display text-[16px] font-bold leading-tight">{c.name}</span>
                          {c.subtitle && <span className="mt-0.5 block text-[13px] text-steel">{c.subtitle}</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </SectionShell>
          ),
        body_types: (s) =>
          bodies.length > 0 && (
            <SectionShell>
              <SectionHeading title={s.title} subtitle={s.subtitle} link="/contact?type=commercial" linkLabel="ปรึกษาเรื่องตัวถัง" />
              <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                {bodies.map((b) => (
                  <li key={b.id}>
                    <Media src={b.image} slot="body_type" alt={b.name} fit="contain" className="aspect-[4/3] w-full rounded-[var(--radius-card)] bg-mist" />
                    <p className="mt-2 font-display text-[16px] font-bold leading-tight">{b.name}</p>
                    {b.name_en && <p className="text-[13px] text-steel">{b.name_en}</p>}
                  </li>
                ))}
              </ul>
            </SectionShell>
          ),
        why_us: (s) =>
          (hl.commercial_why?.length ?? 0) > 0 && (
            <SectionShell tone="navy">
              <SectionHeading title={s.title} subtitle={s.subtitle} light />
              <HighlightGrid items={hl.commercial_why} cols={6} light />
            </SectionShell>
          ),
        services: (s) =>
          svc.length > 0 && (
            <SectionShell>
              <SectionHeading title={s.title} subtitle={s.subtitle} link="/contact#services" linkLabel="ดูบริการทั้งหมด" />
              <Rail cols={svc.length === 5 ? 5 : 4}>
                {svc.map((x) => (
                  <article key={x.id} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
                    <Media src={x.image} slot="service" alt={x.title} className="aspect-[3/2] w-full" />
                    <div className="flex gap-3 p-4">
                      <Icon name={x.icon} className="mt-0.5 shrink-0 text-copper-dark" />
                      <div>
                        <h3 className="text-[16px] font-bold leading-snug">{x.title}</h3>
                        {x.subtitle && <p className="text-[13px] text-steel">{x.subtitle}</p>}
                      </div>
                    </div>
                  </article>
                ))}
              </Rail>
            </SectionShell>
          ),
        happy_whale_box: (s) => <div className="container-x pb-16 pt-4"><WhaleBox s={s} settings={settings} /></div>,
      }}
    />
  );
}
