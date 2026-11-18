import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { Icon } from '@/components/Icon';
import { Media } from '@/components/Media';
import { LeadForm } from '@/components/LeadForm';
import { SectionHeading, SectionShell } from '@/components/SectionHeading';
import { BranchCard } from '@/components/Cards';
import { Rail } from '@/components/Rail';
import { WhaleBox } from '@/components/WhaleBox';
import { getBranches, getHero, getHighlights, getSections, getServices, getSettings, getStaff, getVehicles } from '@/lib/content';
import { ServiceBooking, ServiceList, ServicePackage } from '@/components/ServiceBlocks';
import { lineHref, mapEmbedSrc, mapHref, telHref } from '@/lib/format';
import { getReviewData } from '@/lib/reviews';
import { ReviewsSection } from '@/components/Reviews';
import { BranchMap, type MapBranch } from '@/components/BranchMap';
import { pageMetadata, Sections } from '@/lib/page';
import type { Section, Settings } from '@/lib/types';

export const generateMetadata = () => pageMetadata('contact');

const TYPES = ['quote', 'test_drive', 'service_booking', 'contact', 'commercial'];

function Channels({ s, settings }: { s: Section; settings: Settings }) {
  const line = settings.line_oa_url ?? lineHref(settings.line_oa_id);
  const rows = [
    settings.phone_main && { icon: Phone, label: 'โทรหาเรา', value: settings.phone_main, href: telHref(settings.phone_main) },
    line && { icon: MessageCircle, label: 'LINE Official', value: settings.line_oa_id ?? 'เพิ่มเพื่อน', href: line },
    settings.email_main && { icon: Mail, label: 'อีเมล', value: settings.email_main, href: `mailto:${settings.email_main}` },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href: string | null }[];
  const social = [
    ['Facebook', settings.facebook_url], ['Instagram', settings.instagram_url],
    ['YouTube', settings.youtube_url], ['TikTok', settings.tiktok_url],
  ].filter(([, u]) => !!u) as [string, string][];
  if (!rows.length && !social.length) return null;
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-6">
      <h2 className="text-xl font-bold">{s.title}</h2>
      <ul className="mt-4 space-y-4">
        {rows.map(({ icon: I, label, value, href }) => (
          <li key={label}>
            <a href={href ?? '#'} className="flex items-center gap-3 hover:text-copper-dark">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-copper/12 text-copper-dark"><I size={20} aria-hidden /></span>
              <span><span className="block text-[13px] text-steel">{label}</span><span className="block font-display text-[17px] font-bold">{value}</span></span>
            </a>
          </li>
        ))}
      </ul>
      {social.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
          {social.map(([n, u]) => (
            <li key={n}><a href={u} target="_blank" rel="noopener" className="block rounded-md border border-line px-3 py-1.5 text-[14px] font-medium hover:border-copper">{n}</a></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string; model?: string; promo?: string }> }) {
  const sp = await searchParams;
  const [sections, hero, hl, settings, branches, staff, vehicles, reviews, services] = await Promise.all([
    getSections('contact'), getHero('contact'), getHighlights(), getSettings(), getBranches(), getStaff(), getVehicles(), getReviewData(), getServices(),
  ]);
  const general = services.filter((x) => x.group_key === 'general');
  const centers = branches.filter((b) => b.has_service);
  const type = TYPES.includes(sp.type ?? '') ? sp.type! : 'contact';
  const model = vehicles.find((v) => v.slug === sp.model);
  const keys = new Set(sections.map((s) => s.section_key));
  const whale = sections.find((s) => s.section_key === 'whale_chat');
  const channels = sections.find((s) => s.section_key === 'channels');
  // แผนที่: สำนักงานใหญ่ขึ้นก่อน แล้วตามลำดับในหลังบ้าน
  const mapBranches: MapBranch[] = [...branches]
    .sort((a, z) => Number(z.is_headquarters) - Number(a.is_headquarters))
    .flatMap((b) => {
      const embed = mapEmbedSrc(b);
      if (!embed) return [];
      const r = reviews.byBranch.get(b.id);
      return [{
        id: b.id, name: b.name, address: b.address, phone: b.phone, tel: telHref(b.phone),
        hours: b.hours_showroom ? `โชว์รูม ${b.hours_showroom}` : b.hours_service ? `ศูนย์บริการ ${b.hours_service}` : null,
        embed, directions: mapHref(b), rating: r ? { rating: r.rating, count: r.count, uri: r.uri } : null,
      }];
    });
  const branchName = new Map(branches.map((b) => [b.id, b.name]));

  return (
    <Sections
      list={sections}
      render={{
        hero: () => (
          <>
            <Hero slides={hero} fallbackTitle="ติดต่อเรา" />
            {(hl.contact_features?.length ?? 0) > 0 && (
              <div className="bg-navy text-white">
                <ul className="container-x grid grid-cols-2 gap-4 pb-8 lg:grid-cols-4">
                  {hl.contact_features!.map((f) => (
                    <li key={f.id} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10"><Icon name={f.icon} size={19} /></span>
                      <span><span className="block font-display text-[15px] font-bold">{f.title}</span>{f.subtitle && <span className="block text-[13px] text-white/65">{f.subtitle}</span>}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ),
        form: (s) => (
          <SectionShell tone="mist" id="form">
            <div className={`grid gap-8 ${whale || channels ? 'lg:grid-cols-[1.5fr_1fr]' : ''}`}>
              <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-8">
                <SectionHeading title={s.title} subtitle={s.subtitle} />
                <LeadForm
                  defaultType={type}
                  sourcePage="/contact"
                  vehicles={vehicles.map((v) => ({ id: v.id, name: v.name }))}
                  defaultVehicleId={model?.id}
                  branches={branches.map((b) => ({ id: b.id, name: b.name }))}
                  promo={sp.promo?.slice(0, 80)}
                  pdpaText={settings.pdpa_text}
                  pdpaVersion={settings.pdpa_version}
                  submitLabel="ส่งข้อความ"
                />
              </div>
              {(whale || channels) && (
                <div className="flex flex-col gap-5">
                  {channels && <Channels s={channels} settings={settings} />}
                  {whale && <WhaleBox s={whale} settings={settings} stacked />}
                </div>
              )}
            </div>
          </SectionShell>
        ),
        // งานบริการหลังการขาย (ย้ายมาจากหน้า "บริการ" เดิม)
        booking: (s) => <ServiceBooking s={s} settings={settings} services={general} centers={centers} sourcePage="/contact" />,
        services: (s) => <ServiceList s={s} services={general} />,
        service_package: (s) => <ServicePackage s={s} />,
        // ถ้าซ่อนฟอร์มไว้ ให้แสดงกล่องเหล่านี้แยก
        whale_chat: (s) => !keys.has('form') && <div className="container-x py-10"><WhaleBox s={s} settings={settings} /></div>,
        channels: (s) => !keys.has('form') && <div className="container-x py-10"><Channels s={s} settings={settings} /></div>,
        sales_team: (s) =>
          staff.length > 0 && (
            <SectionShell>
              <SectionHeading title={s.title} subtitle={s.subtitle} />
              <Rail cols={4}>
                {staff.map((p) => {
                  const tel = telHref(p.phone);
                  const line = lineHref(p.line_id);
                  return (
                    <article key={p.id} className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
                      <Media src={p.photo} slot="staff" alt={p.full_name} className="aspect-square w-full" />
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-lg font-bold leading-snug">{p.full_name}{p.nickname ? ` (${p.nickname})` : ''}</h3>
                        <p className="text-[14px] text-steel">{[p.position, p.branch_id && branchName.get(p.branch_id)].filter(Boolean).join(' / ')}</p>
                        <div className="mt-auto flex gap-2 pt-4">
                          {tel && <a href={tel} className="btn btn-ghost flex-1 px-3"><Phone size={17} aria-hidden />โทร</a>}
                          {line && <a href={line} target="_blank" rel="noopener" className="btn btn-navy flex-1 px-3"><MessageCircle size={17} aria-hidden />LINE</a>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </Rail>
            </SectionShell>
          ),
        branches: (s) =>
          branches.length > 0 && (
            <SectionShell tone="mist" id="branches">
              <SectionHeading title={s.title} subtitle={s.subtitle} />
              <Rail cols={4}>{branches.map((b) => <BranchCard key={b.id} b={b} showHours rating={reviews.byBranch.get(b.id)} />)}</Rail>
            </SectionShell>
          ),
        map: (s) =>
          mapBranches.length > 0 && (
            <SectionShell id="map">
              <SectionHeading title={s.title} subtitle={s.subtitle ?? 'เลือกสาขาเพื่อดูแผนที่ แล้วกด "นำทาง" เพื่อเปิด Google Maps'} />
              <BranchMap branches={mapBranches} />
            </SectionShell>
          ),
        hours: (s) =>
          branches.some((b) => b.hours_showroom || b.hours_service || b.hours_parts) && (
            <SectionShell>
              <SectionHeading title={s.title} subtitle={s.subtitle} />
              <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
                <table className="w-full min-w-[640px] text-left text-[15px]">
                  <thead className="bg-mist font-display">
                    <tr><th className="p-4">สาขา</th><th className="p-4">โชว์รูม</th><th className="p-4">ศูนย์บริการ</th><th className="p-4">อะไหล่</th></tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {branches.map((b) => (
                      <tr key={b.id}>
                        <th scope="row" className="p-4 font-display font-bold">{b.name}</th>
                        <td className="p-4">{b.has_showroom ? b.hours_showroom ?? 'สอบถาม' : '-'}</td>
                        <td className="p-4">{b.has_service ? b.hours_service ?? 'สอบถาม' : '-'}</td>
                        <td className="p-4">{b.has_parts ? b.hours_parts ?? 'สอบถาม' : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionShell>
          ),
        reviews: (s) => <ReviewsSection s={s} data={reviews} />,
      }}
    />
  );
}
