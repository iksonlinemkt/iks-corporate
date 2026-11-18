import { Star } from 'lucide-react';
import { SectionHeading, SectionShell } from './SectionHeading';
import { Rail } from './Rail';
import type { BranchRating, ReviewData } from '@/lib/reviews';
import type { Section } from '@/lib/types';

export function Stars({ value, size = 16, className = '' }: { value: number; size?: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`${value.toFixed(1)} จาก 5 ดาว`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} aria-hidden className={i <= full ? 'fill-amber text-amber' : 'fill-current text-white/25'} />
      ))}
    </span>
  );
}

/** ป้ายคะแนนเล็ก ใช้ในการ์ดสาขา */
export function RatingBadge({ r, light = false }: { r: BranchRating; light?: boolean }) {
  return (
    <a href={r.uri ?? '#'} target="_blank" rel="noopener"
      className={`inline-flex items-center gap-1.5 text-[14px] font-semibold hover:underline ${light ? 'text-white' : 'text-navy'}`}
      aria-label={`คะแนน Google ${r.rating.toFixed(1)} จาก ${r.count} รีวิว`}>
      <Star size={15} className="fill-amber text-amber" aria-hidden />
      {r.rating.toFixed(1)}
      <span className={`font-normal ${light ? 'text-white/65' : 'text-steel'}`}>({r.count.toLocaleString('th-TH')} รีวิว Google)</span>
    </a>
  );
}

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

export function ReviewsSection({ s, data }: { s: Section; data: ReviewData }) {
  if (!data.overall && data.reviews.length === 0) return null;
  const ratings = [...data.byBranch.values()];
  return (
    <SectionShell tone="deep" id="reviews">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <SectionHeading title={s.title ?? 'รีวิวจากลูกค้า'} subtitle={s.subtitle} light />
        {data.overall && (
          <div className="mb-7 flex items-center gap-4 sm:mb-9">
            <span className="font-display text-[56px] font-bold leading-none text-white">{data.overall.rating.toFixed(1)}</span>
            <span>
              <Stars value={data.overall.rating} size={20} />
              <span className="mt-1 block text-[14px] text-white/70">
                จาก {data.overall.count.toLocaleString('th-TH')} รีวิวบน Google Maps
              </span>
            </span>
          </div>
        )}
      </div>

      {ratings.length > 1 && (
        <ul className="-mt-2 mb-8 flex flex-wrap gap-2">
          {ratings.map((r) => (
            <li key={r.id}>
              <a href={r.uri ?? '#'} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[14px] text-white hover:border-copper-light">
                <span className="font-semibold">{r.name}</span>
                <span className="inline-flex items-center gap-1 text-white/80"><Star size={13} className="fill-amber text-amber" aria-hidden />{r.rating.toFixed(1)}</span>
                <span className="text-white/50">({r.count.toLocaleString('th-TH')})</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {data.reviews.length > 0 && (
        <Rail cols={3}>
          {data.reviews.map((r) => (
            <figure key={r.key} className="flex flex-col rounded-[var(--radius-card)] bg-white p-6 text-navy shadow-[0_18px_40px_-24px_rgb(0_0_0/0.6)]">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex gap-0.5" role="img" aria-label={`${r.rating} ดาว`}>
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} aria-hidden className={i <= r.rating ? 'fill-amber text-amber' : 'text-line'} />)}
                </span>
                <span className="rounded-full bg-mist px-2.5 py-0.5 text-[12px] font-semibold text-steel">{r.branch}</span>
              </div>
              <blockquote className="mt-4 line-clamp-6 flex-1 text-[15px] leading-relaxed text-ink">{r.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                {r.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.photo} alt="" width={40} height={40} loading="lazy" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-display font-bold text-white" aria-hidden>{initials(r.author)}</span>
                )}
                <span className="min-w-0">
                  {r.authorUri ? (
                    <a href={r.authorUri} target="_blank" rel="noopener nofollow" className="block truncate font-display text-[15px] font-bold hover:text-copper-dark">{r.author}</a>
                  ) : (
                    <span className="block truncate font-display text-[15px] font-bold">{r.author}</span>
                  )}
                  {r.relative && <span className="block text-[13px] text-steel">{r.relative} · Google</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </Rail>
      )}

      <p className="mt-6 text-[13px] text-white/55">
        คะแนนและรีวิวจาก Google Maps อัปเดตอัตโนมัติวันละ 2 ครั้ง
        {ratings.length === 1 && ratings[0].uri && (
          <> · <a href={ratings[0].uri} target="_blank" rel="noopener" className="text-copper-light hover:underline">ดูรีวิวทั้งหมดบน Google Maps</a></>
        )}
      </p>
    </SectionShell>
  );
}
