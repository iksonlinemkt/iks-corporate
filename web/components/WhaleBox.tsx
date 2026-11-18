import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';
import { Media } from './Media';
import { Icon } from './Icon';
import { lineHref, telHref } from '@/lib/format';
import type { Highlight, Section, Settings } from '@/lib/types';

/** กล่อง Happy Whale: ช่องทางถามคำถาม (ใช้ซ้ำหลายหน้า) */
export function WhaleBox({ s, settings, items, stacked = false }: { s: Section; settings: Settings; items?: Highlight[]; stacked?: boolean }) {
  const tel = telHref(settings.phone_main);
  const line = settings.line_oa_url ?? lineHref(settings.line_oa_id);
  return (
    <div className={`grid items-center gap-6 overflow-hidden rounded-[var(--radius-card)] bg-blue-soft p-6 ${stacked ? 'grid-cols-1 gap-4 sm:p-7' : 'sm:grid-cols-[1fr_200px] sm:p-10 lg:grid-cols-[1fr_260px]'}`}>
      <div>
        {s.title && <h2 className="text-[28px] font-bold text-blue sm:text-[32px]">{s.title}</h2>}
        {s.subtitle && <p className="mt-1 font-display text-lg font-semibold text-navy">{s.subtitle}</p>}
        {s.body && <p className="mt-3 max-w-xl text-[15px] text-steel">{s.body}</p>}
        {items && items.length > 0 && (
          <ul className="mt-4 grid gap-2 text-[15px] sm:grid-cols-2">
            {items.map((h) => (
              <li key={h.id} className="flex items-start gap-2"><Icon name={h.icon} size={19} className="mt-1 shrink-0 text-blue" />{h.title}</li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {line && <a href={line} target="_blank" rel="noopener" className="btn btn-navy"><MessageCircle size={18} aria-hidden />แชตทาง LINE</a>}
          {tel && <a href={tel} className="btn btn-ghost"><Phone size={18} aria-hidden />{settings.phone_main}</a>}
          {!line && !tel && <Link href={s.cta_url ?? '/contact'} className="btn btn-navy">{s.cta_label ?? 'ติดต่อเรา'}</Link>}
        </div>
      </div>
      <Media src={s.image} slot="mascot" alt="Happy Whale" fit="contain" className={`mx-auto aspect-square rounded-lg ${stacked ? 'order-first w-24 justify-self-start' : 'w-40 sm:w-full'}`} />
    </div>
  );
}
