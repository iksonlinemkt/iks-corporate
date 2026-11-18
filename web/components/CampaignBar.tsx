'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

/** แถบประกาศแคมเปญเปิดตัว (ทุกหน้า ยกเว้นหน้า /live เอง) */
export function CampaignBar({ text, live, hideHome = false, href = '/live' }: { text: string; live: boolean; hideHome?: boolean; href?: string }) {
  const path = usePathname();
  if (path.startsWith(href) || (hideHome && path === '/')) return null;
  return (
    <Link href={href} className={`group block text-white ${live ? 'bg-red' : 'bg-linear-to-r from-copper-dark via-copper to-copper-dark'}`}>
      <span className="container-x flex min-h-10 items-center justify-center gap-2 py-2 text-center font-display text-[14px] font-semibold sm:text-[15px]">
        {live && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-white" aria-hidden />}
        <span>{text}</span>
        <span className="inline-flex shrink-0 items-center underline-offset-2 group-hover:underline">{live ? 'ดูไลฟ์' : 'ดูรายละเอียด'}<ChevronRight size={16} aria-hidden /></span>
      </span>
    </Link>
  );
}
