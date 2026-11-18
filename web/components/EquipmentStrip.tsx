import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { mediaUrl } from '@/lib/format';
import type { Industry } from '@/lib/types';

/** แถบ "ต่ออุปกรณ์ตามธุรกิจ" (ใช้ในหน้ารุ่นรถ / รายละเอียดรุ่นรถพาณิชย์) */
export function EquipmentStrip({ items, title = 'ต่ออุปกรณ์ตามธุรกิจ' }: { items: Industry[]; title?: string }) {
  const list = items.filter((i) => i.image);
  if (!list.length) return null;
  return (
    <div className="mt-6 rounded-[var(--radius-card)] bg-navy-950 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 text-white">
        <p className="font-display text-[17px] font-bold">{title}</p>
        <Link href="/commercial" className="inline-flex items-center gap-1 text-[14px] font-semibold text-copper-light hover:underline">
          ดูทั้งหมด<ChevronRight size={16} aria-hidden />
        </Link>
      </div>
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-7">
        {list.map((i) => (
          <li key={i.id} className="w-[42%] shrink-0 snap-start sm:w-auto">
            <Link href={i.slug && (i.headline || i.description) ? `/commercial/${i.slug}` : '/commercial'} className="group relative block aspect-[4/3] overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(i.image)!} alt={`รถกระบะอีซูซุ ${i.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-950/90 to-transparent px-2 pb-1.5 pt-6 font-display text-[13px] font-bold text-white">{i.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
