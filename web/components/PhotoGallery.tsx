'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Expand } from 'lucide-react';
import { Lightbox } from './IndustryCard';

type Photo = { src: string; thumb: string; alt: string | null };

/** แกลเลอรีรูปแยกแท็บ (เช่น D-MAX / MU-X) · กดรูปเพื่อดูเต็มจอ */
export function PhotoGallery({ groups, name, initial = 9, light = false }: { groups: { key: string; label: string; photos: Photo[] }[]; name: string; initial?: number; light?: boolean }) {
  const list = groups.filter((g) => g.photos.length);
  const [tab, setTab] = useState(list[0]?.key);
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const g = list.find((x) => x.key === tab) ?? list[0];
  if (!g) return null;
  const shown = all ? g.photos : g.photos.slice(0, initial);

  return (
    <div>
      {list.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2" role="tablist">
          {list.map((x) => (
            <button key={x.key} type="button" role="tab" aria-selected={x.key === g.key} onClick={() => { setTab(x.key); setAll(false); }}
              className={`rounded-full px-5 py-2 font-display text-[16px] font-semibold ${x.key === g.key ? (light ? 'bg-white text-navy' : 'bg-navy text-white') : light ? 'border border-white/30 text-white hover:border-copper-light' : 'border border-line text-navy hover:border-copper'}`}>
              {x.label} <span className="ml-1 text-[13px] opacity-70">{x.photos.length}</span>
            </button>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        {shown.map((p, i) => (
          <li key={p.src}>
            <button type="button" onClick={() => setOpen(i)} aria-label={`ขยายรูป ${p.alt ?? `${name} ${i + 1}`}`}
              className="group relative block aspect-[3/2] w-full overflow-hidden rounded-[var(--radius-card)] bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt={p.alt ?? `${name} ${i + 1}`} loading="lazy" decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-navy-950/60 text-white opacity-0 transition-opacity group-hover:opacity-100"><Expand size={16} aria-hidden /></span>
            </button>
          </li>
        ))}
      </ul>
      {!all && g.photos.length > initial && (
        <div className="mt-5 text-center">
          <button type="button" onClick={() => setAll(true)} className={`btn ${light ? 'btn-ghost-light' : 'btn-ghost'}`}>ดูรูปทั้งหมด {g.photos.length} รูป</button>
        </div>
      )}
      {open !== null && createPortal(
        <Lightbox name={`${name} · ${g.label}`} images={g.photos.map((p) => p.src)} alts={g.photos.map((p) => p.alt)} start={open} onClose={() => setOpen(null)} />,
        document.body)}
    </div>
  );
}
