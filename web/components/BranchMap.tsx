'use client';

import { useState } from 'react';
import { Clock, MapPin, Navigation, Phone, Star } from 'lucide-react';

export type MapBranch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  tel: string | null;
  hours: string | null;
  embed: string;
  directions: string | null;
  rating: { rating: number; count: number; uri: string | null } | null;
};

/** แผนที่สาขา: เลือกสาขาจากรายการ → แผนที่เปลี่ยนตาม พร้อมปุ่มโทร/นำทาง */
export function BranchMap({ branches }: { branches: MapBranch[] }) {
  const [active, setActive] = useState(0);
  const b = branches[active] ?? branches[0];
  if (!b) return null;

  return (
    <div className="grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-white lg:grid-cols-[380px_1fr]">
      <div className="relative order-first min-h-[300px] bg-mist sm:min-h-[380px] lg:order-last lg:min-h-[540px]">
        <iframe
          key={b.id}
          title={`แผนที่ ${b.name}`}
          src={b.embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
        />
      </div>

      <ul className="divide-y divide-line lg:max-h-[540px] lg:overflow-y-auto" aria-label="เลือกสาขา">
        {branches.map((x, i) => {
          const on = i === active;
          return (
            <li key={x.id} className={`relative ${on ? 'bg-mist' : ''}`}>
              {on && <span className="copper-metal absolute inset-y-0 left-0 w-1" aria-hidden />}
              <button type="button" onClick={() => setActive(i)} aria-pressed={on}
                className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-mist/70">
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${on ? 'bg-navy text-white' : 'bg-blue-soft text-navy'}`}>
                  <MapPin size={18} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[17px] font-bold text-navy">{x.name}</span>
                  {x.rating && (
                    <span className="mt-0.5 flex items-center gap-1 text-[13px] text-navy">
                      <Star size={13} className="fill-amber text-amber" aria-hidden />
                      <b>{x.rating.rating.toFixed(1)}</b>
                      <span className="text-steel">({x.rating.count.toLocaleString('th-TH')} รีวิว Google)</span>
                    </span>
                  )}
                  {x.address && <span className={`mt-1 block text-[14px] leading-relaxed text-steel ${on ? '' : 'line-clamp-1'}`}>{x.address}</span>}
                </span>
              </button>
              {on && (
                <div className="px-5 pb-5 pl-[68px]">
                  {x.hours && <p className="mb-3 flex gap-2 text-[14px] text-steel"><Clock size={16} className="mt-0.5 shrink-0" aria-hidden />{x.hours}</p>}
                  <div className="flex flex-wrap gap-2">
                    {x.directions && (
                      <a href={x.directions} target="_blank" rel="noopener" className="btn btn-primary min-h-[42px] px-4 text-[15px]">
                        <Navigation size={17} aria-hidden />นำทาง
                      </a>
                    )}
                    {x.tel && (
                      <a href={x.tel} className="btn btn-ghost min-h-[42px] bg-white px-4 text-[15px]">
                        <Phone size={17} aria-hidden />{x.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
