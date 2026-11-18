import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Media } from '@/components/Media';
import { LeadForm } from '@/components/LeadForm';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { EquipmentStrip } from '@/components/EquipmentStrip';
import { TrustStrip } from '@/components/TrustStrip';
import { JsonLd } from '@/components/JsonLd';
import { getBranches, getGrades, getIndustries, getSettings, getVehicle, getVehicleCategories, getVehicles } from '@/lib/content';
import { getReviewData } from '@/lib/reviews';
import { formatPrice, mediaUrl } from '@/lib/format';
import { SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await getVehicle((await params).slug);
  if (!v) return {};
  const img = mediaUrl(v.image_card);
  const price = formatPrice(v.price_from);
  const desc = `${v.name} ${v.tagline ?? ''}${price ? ` ราคาแนะนำเริ่มต้น ${price} บาท` : ''} · ดูราคาทุกรุ่นย่อย จองทดลองขับ ขอใบเสนอราคา ที่อีซูซุกรุงเทพเซลส์`;
  return {
    title: `${v.name}${price ? ` ราคาเริ่มต้น ${price} บาท` : ''} | อีซูซุกรุงเทพเซลส์`,
    description: desc,
    alternates: { canonical: `/models/${v.slug}` },
    openGraph: { title: v.name, description: desc, images: img ? [img] : undefined },
  };
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const [v, vehicles, branches, settings, allGrades, categories, industries, reviews] = await Promise.all([
    getVehicle(slug), getVehicles(), getBranches(), getSettings(), getGrades(), getVehicleCategories(), getIndustries(), getReviewData(),
  ]);
  if (!v) notFound();
  const price = formatPrice(v.price_from);
  const specs = Object.entries(v.specs ?? {});
  const grades = allGrades.filter((g) => g.vehicle_id === v.id);
  const cat = categories.find((c) => c.id === v.category_id);
  const commercial = cat?.slug === 'commercial-pickup';
  const prices = grades.map((g) => g.price).filter((p): p is number => p !== null);
  const img = mediaUrl(v.image_card ?? v.image_cutout);

  return (
    <>
      <section className="bg-mist">
        <div className="container-x grid items-center gap-8 py-8 lg:grid-cols-[1.25fr_1fr] lg:py-14">
          {v.image_cutout ? (
            <div className="stage aspect-[16/10] rounded-[var(--radius-card)] shadow-[0_30px_60px_-30px_rgb(6_22_48/0.7)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(v.image_cutout)!} alt={v.name} fetchPriority="high" className="stage-car absolute inset-x-[5%] top-[5%] h-[78%] w-[90%] object-contain object-bottom" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-card)] bg-white">
              <Media src={v.image_card} slot="vehicle_card" alt={v.name} priority className="aspect-[16/10] w-full" />
            </div>
          )}
          <div>
            <Link href="/models" className="mb-4 inline-flex items-center gap-1 text-[15px] font-semibold text-copper-dark hover:underline">
              <ChevronLeft size={18} aria-hidden />รุ่นรถทั้งหมด
            </Link>
            {v.badge && <p className="mb-2"><span className="rounded bg-navy px-2.5 py-1 font-display text-xs font-semibold text-white">{v.badge}</span></p>}
            <h1 className="text-[34px] font-bold sm:text-[44px]"><span className="text-navy-metal">{v.name}</span></h1>
            {v.tagline && <p className="mt-2 text-lg text-steel">{v.tagline}</p>}
            {price && (
              <p className="mt-6">
                <span className="block text-[14px] text-steel">ราคาเริ่มต้น</span>
                <span className="font-display text-[34px] font-bold"><span className="text-gold-dark">{price}</span> <span className="text-xl text-navy">บาท</span></span>
                {v.price_note && <span className="mt-1 block text-[13px] text-steel">{v.price_note}</span>}
              </p>
            )}
            {!price && v.capacity_label && (
              <p className="mt-6"><span className="block text-[14px] text-steel">น้ำหนักบรรทุก</span><span className="font-display text-[28px] font-bold">{v.capacity_label}</span></p>
            )}
            {v.colors.length > 0 && (
              <div className="mt-6">
                <p className="text-[14px] text-steel">สีที่มี</p>
                <ul className="mt-2 flex flex-wrap gap-3">
                  {v.colors.map((c) => (
                    <li key={c.hex + c.name} className="flex items-center gap-2 text-[14px]">
                      <span className="h-6 w-6 rounded-full border border-navy/20" style={{ backgroundColor: c.hex }} aria-hidden />{c.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#quote" className="btn btn-primary">ขอใบเสนอราคา</a>
              <Link href={`/test-drive?model=${v.slug}`} className="btn btn-ghost">จองทดลองขับ</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-line bg-white">
        <div className="container-x py-6"><TrustStrip settings={settings} branches={branches.length} rating={reviews.overall} /></div>
      </div>

      {grades.length > 0 && (
        <SectionShell>
          <SectionHeading title={`ราคาและรุ่นย่อย ${v.name}`} subtitle={v.price_note ?? 'ราคาแนะนำจากผู้ผลิต อาจเปลี่ยนแปลงได้'} />
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
            <table className="w-full min-w-[760px] text-left text-[15px]">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="p-4 font-display">รุ่นย่อย</th><th className="p-4 font-display">เครื่องยนต์</th>
                  <th className="p-4 font-display">เกียร์ / ขับเคลื่อน</th><th className="p-4 font-display">จุดเด่น</th>
                  <th className="p-4 text-right font-display">ราคาแนะนำ (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {grades.map((g) => (
                  <tr key={g.id} className="align-top odd:bg-white even:bg-mist/60">
                    <th scope="row" className="p-4 font-display font-bold text-navy">{g.name}</th>
                    <td className="p-4">{g.engine}<span className="block text-[13px] text-steel">{[g.power, g.torque].filter(Boolean).join(' · ')}</span></td>
                    <td className="p-4">{[g.transmission, g.drive].filter(Boolean).join(' · ')}</td>
                    <td className="p-4 text-[14px] text-steel">{[g.wheels, g.screen && `จอ ${g.screen}`, g.features].filter(Boolean).join(' · ')}</td>
                    <td className="p-4 text-right font-display text-[17px] font-bold text-navy">{g.price ? formatPrice(g.price) : <span className="text-[15px] text-copper-dark">สอบถามราคา</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {commercial && <EquipmentStrip items={industries} title="ต่ออุปกรณ์ได้ตามธุรกิจของคุณ" />}
        </SectionShell>
      )}

      {v.description && (
        <SectionShell tone="mist">
          <SectionHeading title={`รู้จัก ${v.name}`} />
          <div className="max-w-3xl whitespace-pre-line text-[17px] leading-relaxed">{v.description}</div>
        </SectionShell>
      )}

      {specs.length > 0 && (
        <SectionShell>
          <SectionHeading title="ข้อมูลจำเพาะ" />
          <dl className="grid max-w-3xl divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {specs.map(([k, val]) => (
              <div key={k} className="grid grid-cols-[minmax(120px,40%)_1fr] gap-4 px-5 py-3.5 text-[15px]">
                <dt className="text-steel">{k}</dt><dd className="font-medium">{val}</dd>
              </div>
            ))}
          </dl>
        </SectionShell>
      )}

      {v.gallery.length > 0 && (
        <SectionShell>
          <SectionHeading title="แกลเลอรี" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {v.gallery.map((g, i) => (
              <Media key={g} src={g} slot="vehicle_gallery" alt={`${v.name} รูปที่ ${i + 1}`} className="aspect-[3/2] w-full rounded-[var(--radius-card)]" />
            ))}
          </div>
        </SectionShell>
      )}

      <SectionShell tone="navy" id="quote">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHeading title={`ขอใบเสนอราคา ${v.name}`} subtitle="กรอกข้อมูลสั้นๆ ที่ปรึกษาการขายจะโทรกลับพร้อมราคาและโปรโมชั่นล่าสุด" light />
          </div>
          <LeadForm
            dark
            fixedType
            defaultType="quote"
            sourcePage={`/models/${v.slug}`}
            vehicles={vehicles.map((x) => ({ id: x.id, name: x.name }))}
            defaultVehicleId={v.id}
            branches={branches.filter((b) => b.has_showroom).map((b) => ({ id: b.id, name: b.name }))}
            pdpaText={settings.pdpa_text}
            pdpaVersion={settings.pdpa_version}
            submitLabel="ขอใบเสนอราคา"
          />
        </div>
      </SectionShell>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: v.name,
        brand: { '@type': 'Brand', name: 'ISUZU' },
        category: cat?.name,
        description: v.description ?? v.tagline ?? undefined,
        image: img ? [`${SITE_URL}${img}`] : undefined,
        url: `${SITE_URL}/models/${v.slug}`,
        ...(prices.length ? {
          offers: {
            '@type': 'AggregateOffer', priceCurrency: 'THB', lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: grades.length,
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'AutoDealer', name: settings.company_name_th ?? 'อีซูซุกรุงเทพเซลส์', url: SITE_URL },
          },
        } : {}),
      }} />
    </>
  );
}
