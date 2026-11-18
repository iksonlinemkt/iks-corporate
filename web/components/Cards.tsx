import Link from 'next/link';
import { ChevronRight, Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { Media } from './Media';
import { Icon } from './Icon';
import { formatPrice, formatThaiDate, mapEmbedSrc, mapHref, mediaUrl, telHref } from '@/lib/format';
import type { Branch, Highlight, Promotion, Vehicle } from '@/lib/types';
import type { BranchRating } from '@/lib/reviews';
import { RatingBadge } from './Reviews';
import { branchPath } from '@/lib/branch';

/* ---------------- รุ่นรถ ---------------- */
export function VehicleCard({ v, size = 'md' }: { v: Vehicle; size?: 'md' | 'lg' }) {
  const price = formatPrice(v.price_from);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white text-navy transition-colors hover:border-copper">
      <div className={`relative aspect-[16/10] overflow-hidden ${v.image_cutout ? 'stage' : 'bg-mist'}`}>
        {v.image_cutout ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(v.image_cutout)!} alt={v.name} loading="lazy" decoding="async" className="stage-car absolute inset-x-[6%] top-[4%] h-[78%] w-[88%] object-contain object-bottom" />
        ) : (
          <Media src={v.image_card} slot="vehicle_card" alt={v.name} className="h-full w-full" />
        )}
        {v.badge && (
          <span className={`absolute left-3 top-3 rounded px-2.5 py-1 font-display text-xs font-semibold ${/turbo/i.test(v.badge) ? 'bg-red font-bold text-white' : 'bg-copper text-navy-950'}`}>{v.badge}</span>
        )}
      </div>
      <div className="copper-metal h-[3px] origin-left scale-x-[0.18] transition-transform duration-500 group-hover:scale-x-100" aria-hidden />
      <div className="flex flex-1 flex-col p-5">
        <h3 className={`font-bold ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
          <Link href={`/models/${v.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {v.name}
          </Link>
        </h3>
        {v.tagline && <p className="mt-1 text-[15px] text-steel">{v.tagline}</p>}
        {v.colors.length > 0 && (
          <ul className="mt-3 flex gap-1.5" aria-label="สีที่มี">
            {v.colors.slice(0, 6).map((c) => (
              <li key={c.hex + c.name} title={c.name} className="h-4 w-4 rounded-full border border-navy/20" style={{ backgroundColor: c.hex }} />
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {price ? (
              <>
                <p className="text-[13px] text-steel">ราคาเริ่มต้น</p>
                <p className="font-display text-xl font-bold"><span className="text-gold-dark">{price}</span> <span className="text-base font-semibold text-navy">บาท</span></p>
              </>
            ) : v.capacity_label ? (
              <>
                <p className="text-[13px] text-steel">น้ำหนักบรรทุก</p>
                <p className="font-display text-lg font-bold text-navy">{v.capacity_label}</p>
              </>
            ) : (
              <p className="text-[15px] font-medium text-copper-dark">สอบถามราคา</p>
            )}
          </div>
          <span className="inline-flex items-center gap-0.5 font-display text-[14px] font-semibold text-copper-dark" aria-hidden>
            รายละเอียด<ChevronRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ---------------- โปรโมชั่น ---------------- */
export function PromoCard({ p, compact = false }: { p: Promotion; compact?: boolean }) {
  const ends = formatThaiDate(p.ends_at);
  return (
    <article id={p.slug} className="flex scroll-mt-24 flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white text-navy">
      <div className="relative aspect-[4/3] bg-mist">
        <Media src={p.image} slot="promotion" alt={p.title} className="h-full w-full" />
        {p.badge && <span className="absolute left-3 top-3 rounded bg-red px-2.5 py-1 font-display text-xs font-semibold text-white">{p.badge}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold">{p.title}</h3>
        {p.subtitle && <p className="mt-0.5 text-[15px] text-steel">{p.subtitle}</p>}
        {p.value_text && (
          <p className="mt-4">
            {p.value_label && <span className="block text-[13px] text-steel">{p.value_label}</span>}
            <span className="font-display text-[28px] font-bold leading-tight text-red">{p.value_text}</span>
          </p>
        )}
        {!compact && p.bullets.length > 0 && (
          <ul className="mt-3 space-y-1 text-[15px]">
            {p.bullets.map((b) => (
              <li key={b} className="flex gap-2"><Icon name="check" size={18} className="mt-1 shrink-0 text-copper-dark" />{b}</li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[13px] text-steel">
          <span>{ends ? `ถึง ${ends}` : ''}</span>
          <Link href={`/contact?type=quote&promo=${p.slug}`} className="inline-flex items-center gap-1 font-display text-[15px] font-semibold text-copper-dark hover:underline">
            สอบถามโปรนี้ <ChevronRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ---------------- สาขา ---------------- */
export function BranchCard({ b, showHours = false, rating }: { b: Branch; showHours?: boolean; rating?: BranchRating }) {
  const tel = telHref(b.phone);
  const map = mapHref(b);
  const embed = mapEmbedSrc(b);
  const services = [b.has_showroom && 'โชว์รูม', b.has_service && 'ศูนย์บริการ', b.has_parts && 'อะไหล่'].filter(Boolean) as string[];
  return (
    <article className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white text-navy">
      <div className="relative aspect-[3/2] overflow-hidden bg-mist">
        {!b.image && embed ? (
          <>
            {/* ยังไม่มีรูปสาขา → แสดงแผนที่แทน (กดแล้วเปิด Google Maps) */}
            <iframe title={`แผนที่ ${b.name}`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={-1}
              className="pointer-events-none absolute inset-0 h-full w-full border-0" />
            {map && <a href={map} target="_blank" rel="noopener" className="absolute inset-0" aria-label={`เปิดแผนที่ ${b.name} ใน Google Maps`} />}
          </>
        ) : (
          <Media src={b.image} slot="branch" alt={`อีซูซุกรุงเทพเซลส์ ${b.name}`} className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold"><Link href={branchPath(b)} className="hover:text-copper-dark">{b.name}</Link></h3>
        {services.length > 0 && <p className="mt-0.5 text-[13px] text-steel">{services.join(' / ')}</p>}
        {rating && <div className="mt-2"><RatingBadge r={rating} /></div>}
        {b.address && (
          <p className="mt-3 flex gap-2 text-[15px] leading-relaxed"><MapPin size={18} className="mt-1 shrink-0 text-copper-dark" aria-hidden />{b.address}</p>
        )}
        {showHours && (b.hours_showroom || b.hours_service) && (
          <div className="mt-3 space-y-1 text-[14px] text-steel">
            {b.hours_showroom && <p className="flex gap-2"><Clock size={16} className="mt-1 shrink-0" aria-hidden />โชว์รูม {b.hours_showroom}</p>}
            {b.hours_service && <p className="flex gap-2"><Clock size={16} className="mt-1 shrink-0" aria-hidden />ศูนย์บริการ {b.hours_service}</p>}
          </div>
        )}
        {(tel || map) && (
          <div className="mt-auto flex gap-2 pt-5">
            {tel && <a href={tel} className="btn btn-ghost flex-1 px-3"><Phone size={17} aria-hidden />โทร</a>}
            {map && <a href={map} target="_blank" rel="noopener" className="btn btn-navy flex-1 px-3"><Navigation size={17} aria-hidden />นำทาง</a>}
          </div>
        )}
        <Link href={branchPath(b)} className="mt-3 text-center font-display text-[14px] font-semibold text-copper-dark hover:underline">ข้อมูลสาขา{b.name.replace(/^สาขา/, '')} →</Link>
      </div>
    </article>
  );
}

/* ---------------- ไอคอน + หัวข้อ ---------------- */
export function HighlightGrid({ items, cols = 4, light = false }: { items: Highlight[] | undefined; cols?: 3 | 4 | 5 | 6; light?: boolean }) {
  if (!items?.length) return null;
  const grid = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-3 xl:grid-cols-6' }[cols];
  return (
    <ul className={`grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 ${grid}`}>
      {items.map((h) => (
        <li key={h.id} className="flex flex-col gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-md ${light ? 'bg-white/8 text-copper-light' : 'bg-copper/12 text-copper-dark'}`}>
            <Icon name={h.icon} />
          </span>
          <div>
            <p className={`font-display text-[17px] font-bold leading-snug ${light ? 'text-white' : 'text-navy'}`}>{h.title}</p>
            {h.subtitle && <p className={`mt-0.5 text-[14px] leading-snug ${light ? 'text-white/70' : 'text-steel'}`}>{h.subtitle}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** แถบทางลัดใต้ Hero: พื้นน้ำเงินเข้ม ไอคอน copper */
export function QuickLinks({ items }: { items: Highlight[] | undefined }) {
  if (!items?.length) return null;
  const cols = items.length >= 6 ? 'sm:grid-cols-3 lg:grid-cols-6' : items.length === 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : items.length === 3 ? 'sm:grid-cols-3' : 'lg:grid-cols-4';
  return (
    <nav aria-label="ทางลัด" className="bg-navy-950 text-white">
      <ul className={`container-x grid grid-cols-2 gap-px bg-white/10 ${cols}`}>
        {items.map((h) => (
          <li key={h.id} className="bg-navy-950">
            <Link href={h.url ?? '#'} className="group flex h-full items-center gap-3 px-3 py-5 transition-colors hover:bg-white/5 sm:gap-4 sm:px-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-copper/60 text-copper-light transition-colors group-hover:bg-copper group-hover:text-navy-950">
                <Icon name={h.icon} />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[16px] font-bold leading-tight">{h.title}</span>
                {h.subtitle && <span className="mt-0.5 block truncate text-[13px] text-white/60">{h.subtitle}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
