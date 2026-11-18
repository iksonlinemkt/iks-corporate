import Link from 'next/link';
import { FileText, MapPin, MessageCircle, Phone } from 'lucide-react';
import { lineHref, telHref } from '@/lib/format';
import type { Settings } from '@/lib/types';

/** แถบปุ่มลัดติดล่างจอ เฉพาะมือถือ/แท็บเล็ต */
export function MobileActionBar({ settings }: { settings: Settings }) {
  const tel = telHref(settings.phone_main);
  const line = settings.line_oa_url ?? lineHref(settings.line_oa_id);
  const items = [
    tel && { href: tel, label: 'โทร', icon: Phone, external: true },
    line && { href: line, label: 'LINE', icon: MessageCircle, external: true },
    { href: '/contact#branches', label: 'สาขา', icon: MapPin, external: false },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Phone; external: boolean }[];

  return (
    <nav aria-label="ติดต่อด่วน" className="fixed inset-x-0 bottom-0 z-30 border-t border-copper/40 bg-navy-950 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="flex">
        {items.map(({ href, label, icon: I, external }) => (
          <li key={label} className="flex-1">
            {external ? (
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener"
                className="flex h-[60px] flex-col items-center justify-center gap-0.5 text-[12px] font-semibold text-white">
                <I size={21} aria-hidden />{label}
              </a>
            ) : (
              <Link href={href} className="flex h-[60px] flex-col items-center justify-center gap-0.5 text-[12px] font-semibold text-white">
                <I size={21} aria-hidden />{label}
              </Link>
            )}
          </li>
        ))}
        <li className="flex-[1.4] p-2">
          <Link href="/contact?type=quote" className="flex h-full items-center justify-center gap-1.5 rounded-md bg-copper font-display text-[15px] font-semibold text-navy-950">
            <FileText size={18} aria-hidden />ขอใบเสนอราคา
          </Link>
        </li>
      </ul>
    </nav>
  );
}
