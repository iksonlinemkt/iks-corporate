import { JsonLd } from './JsonLd';
import { getBranches, getSettings } from '@/lib/content';
import { getReviewData } from '@/lib/reviews';
import { mapHref } from '@/lib/format';
import { SITE_URL } from '@/lib/site';

const SITE = SITE_URL;
const DAY: Record<string, string[]> = {
  'จันทร์ – อาทิตย์': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  'จันทร์ – เสาร์': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'จันทร์ – ศุกร์': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};
/** "จันทร์ – อาทิตย์ 08:00 – 18:00 น." → OpeningHoursSpecification */
function hours(text: string | null) {
  if (!text) return undefined;
  const m = text.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/);
  const days = Object.entries(DAY).find(([k]) => text.includes(k))?.[1];
  return m && days ? { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: m[1], closes: m[2] } : undefined;
}

/** ข้อมูลบริษัท + ทุกสาขา (schema.org AutoDealer) แสดงทุกหน้า */
export async function OrgSchema() {
  const [settings, branches, reviews] = await Promise.all([getSettings(), getBranches(), getReviewData()]);
  const founded = Number(settings.founded_year ?? 2525) - 543;
  const name = settings.company_name_th ?? 'อีซูซุกรุงเทพเซลส์';
  // ชื่อที่คนใช้ค้น (อีซูซุกรุงเทพ / Isuzu Krungthep / IKS) — แก้ได้ที่ ตั้งค่าเว็บ → brand_aliases
  const aliases = [settings.company_name_en ?? 'ISUZU KRUNGTHEP SALES',
    ...(settings.brand_aliases ?? 'อีซูซุกรุงเทพ, Isuzu Krungthep, IKS').split(',').map((x) => x.trim())]
    .filter((x, i, a) => x && x !== name && a.indexOf(x) === i);
  const sameAs = [settings.facebook_url, settings.line_oa_url, settings.instagram_url, settings.youtube_url, settings.tiktok_url].filter(Boolean);
  const dept = branches.map((b) => {
    const r = reviews.byBranch.get(b.id);
    return {
      '@type': 'AutoDealer',
      '@id': `${SITE}/#branch-${b.code.toLowerCase()}`,
      name: `${name} ${b.name}`,
      brand: { '@type': 'Brand', name: 'ISUZU' },
      telephone: b.phone ?? undefined,
      address: b.address ? { '@type': 'PostalAddress', streetAddress: b.address, addressLocality: b.district ?? undefined, addressRegion: b.province ?? undefined, postalCode: b.postcode ?? undefined, addressCountry: 'TH' } : undefined,
      geo: b.latitude !== null && b.longitude !== null ? { '@type': 'GeoCoordinates', latitude: b.latitude, longitude: b.longitude } : undefined,
      hasMap: mapHref(b) ?? undefined,
      openingHoursSpecification: hours(b.hours_showroom),
      aggregateRating: r ? { '@type': 'AggregateRating', ratingValue: r.rating, reviewCount: r.count } : undefined,
    };
  });
  return (
    <>
    {/* ชื่อเว็บที่ Google แสดงในผลค้นหา (site name) */}
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name,
      alternateName: aliases,
      inLanguage: 'th-TH',
      publisher: { '@id': `${SITE}/#org` },
    }} />
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      '@id': `${SITE}/#org`,
      name,
      alternateName: aliases,
      url: SITE,
      logo: `${SITE}/brand/iks-logo.png`,
      foundingDate: String(founded),
      description: `ผู้จำหน่ายรถยนต์อีซูซุ ก่อตั้งเมื่อ พ.ศ. ${founded + 543} มี ${branches.length} สาขา จำหน่ายรถกระบะ ISUZU D-MAX รถกระบะเพื่อการพาณิชย์ (ต่อตู้ ตู้เย็น หลังคา คอก) และรถอเนกประสงค์ MU-X พร้อมศูนย์บริการ${settings.award_title ? ` · ${settings.award_title} ${settings.award_detail ?? ''}` : ''}${settings.emergency_service ? ` · ${settings.emergency_service}` : ''}`,
      brand: { '@type': 'Brand', name: 'ISUZU' },
      parentOrganization: settings.group_name ? {
        '@type': 'Organization', name: settings.group_name, alternateName: settings.group_name_en ?? undefined, url: settings.group_url ?? undefined,
        foundingDate: settings.group_since ? String(Number(settings.group_since) - 543) : undefined,
      } : undefined,
      award: settings.award_title ? [settings.award_title, settings.award_detail].filter(Boolean).join(' ') : undefined,
      slogan: 'บริการครบวงจร ดูแลลูกค้าตลอดการใช้งาน',
      telephone: settings.phone_main ?? undefined,
      contactPoint: [
        settings.phone_sales && { '@type': 'ContactPoint', telephone: settings.phone_sales, contactType: 'sales', areaServed: 'TH', availableLanguage: 'th' },
        settings.phone_service && { '@type': 'ContactPoint', telephone: settings.phone_service, contactType: 'customer service', areaServed: 'TH', availableLanguage: 'th' },
        settings.phone_emergency && { '@type': 'ContactPoint', telephone: settings.phone_emergency, contactType: 'emergency', name: 'ช่วยเหลือฉุกเฉิน 24 ชั่วโมง', hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }, areaServed: 'TH', availableLanguage: 'th' },
      ].filter(Boolean),
      email: settings.email_main ?? undefined,
      areaServed: (settings.service_area ?? 'กรุงเทพมหานคร, สมุทรปราการ').split(',').map((x) => x.trim()).filter(Boolean)
        .map((n) => ({ '@type': 'AdministrativeArea', name: n })),
      sameAs: sameAs.length ? sameAs : undefined,
      aggregateRating: reviews.overall ? { '@type': 'AggregateRating', ratingValue: reviews.overall.rating, reviewCount: reviews.overall.count } : undefined,
      department: dept,
    }} />
    </>
  );
}
