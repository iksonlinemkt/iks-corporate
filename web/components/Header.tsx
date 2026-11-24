'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { NAV, Wordmark } from './Brand';

type Promo = { label: string; live: boolean; href?: string };
type Item = { href: string; label: string; promo?: boolean };

/** ป้ายเล็กข้างเมนูแคมเปญ: LIVE (แดงกะพริบ) หรือ NEW */
function Tag({ live }: { live: boolean }) {
  return live ? (
    <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-red px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />LIVE
    </span>
  ) : (
    <span className="ml-1.5 rounded bg-copper px-1.5 py-0.5 text-[10px] font-bold leading-none text-navy-950">NEW</span>
  );
}

export function Header({ promo }: { promo?: Promo | null }) {
  const items: Item[] = promo ? [NAV[0], { href: promo.href ?? '/live', label: promo.label, promo: true }, ...NAV.slice(1)] : NAV;
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy-950 text-white shadow-[0_6px_20px_-12px_rgb(0_0_0/0.6)]">
        <div className="container-x flex h-[64px] items-center justify-between gap-4 2xl:h-[78px] 2xl:max-w-[1680px] 2xl:px-8">
          <Link href="/" aria-label="อีซูซุกรุงเทพเซลส์ หน้าหลัก" className="shrink-0"><Wordmark light className="h-10 2xl:h-12" /></Link>

          <nav aria-label="เมนูหลัก" className="hidden 2xl:block">
            <ul className="flex items-center gap-0.5 min-[1700px]:gap-1">
              {items.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active(n.href) ? 'page' : undefined}
                    className={`relative flex items-center whitespace-nowrap px-2 py-2 font-display text-[14.5px] font-semibold transition-colors min-[1700px]:px-3 min-[1700px]:text-[15px] ${
                      active(n.href) ? 'text-copper-light' : 'text-white/85 hover:text-white'
                    }`}
                  >
                    {n.label}
                    {n.promo && promo && <Tag live={promo.live} />}
                    {active(n.href) && <span className="copper-metal absolute inset-x-3 -bottom-[19px] h-[3px]" aria-hidden />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/test-drive" className="btn btn-ghost-light hidden min-h-[42px] whitespace-nowrap px-4 md:inline-flex 2xl:hidden min-[1700px]:inline-flex">ทดลองขับ</Link>
            <Link href="/contact?type=quote" className="btn btn-primary hidden min-h-[42px] whitespace-nowrap px-4 sm:inline-flex">ขอใบเสนอราคา</Link>
            {/* โลโก้ ISUZU (ตัวแทนจำหน่ายอย่างเป็นทางการ) · ขอบขาวบางอยู่ในไฟล์ SVG */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/isuzu-logo.svg" alt="ISUZU" width={784} height={149} className="ml-1 h-5 w-auto shrink-0 md:h-6 2xl:ml-2 2xl:h-[26px]" />
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-md text-white hover:bg-white/10 2xl:hidden"
              aria-label="เปิดเมนูทั้งหมด"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={26} />
            </button>
          </div>
        </div>

        {/* เมนูแถวที่สอง: เห็นทุกเมนูตลอด เลื่อนซ้าย-ขวาได้ (จอเล็กกว่าคอมใหญ่) */}
        <nav aria-label="เมนูลัด" className="border-t border-white/10 2xl:hidden">
          <ul className="container-x flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((n) => (
              <li key={n.href} className="shrink-0">
                <Link
                  href={n.href}
                  aria-current={active(n.href) ? 'page' : undefined}
                  className={`relative flex h-11 items-center whitespace-nowrap px-3 font-display text-[14.5px] font-semibold ${
                    active(n.href) ? 'text-copper-light' : 'text-white/85'
                  }`}
                >
                  {n.label}
                  {n.promo && promo && <Tag live={promo.live} />}
                  {active(n.href) && <span className="copper-metal absolute inset-x-3 bottom-0 h-[3px]" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="copper-metal h-px opacity-70" aria-hidden />
      </header>

      {open && createPortal(
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="เมนูทั้งหมด" className="fixed inset-0 z-[60] overflow-y-auto bg-navy-950 text-white 2xl:hidden">
          <div className="container-x flex h-[64px] items-center justify-between">
            <Link href="/" aria-label="หน้าหลัก" onClick={() => setOpen(false)}><Wordmark light className="h-10" /></Link>
            <button type="button" onClick={() => setOpen(false)} aria-label="ปิดเมนู" autoFocus
              className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-white/10">
              <X size={26} />
            </button>
          </div>
          <nav aria-label="เมนูหลัก (มือถือ)" className="container-x pb-10">
            <ul className="divide-y divide-white/10 border-t border-white/10">
              {items.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    aria-current={active(n.href) ? 'page' : undefined}
                    className={`flex items-center py-4 font-display text-lg font-semibold ${active(n.href) ? 'text-copper-light' : 'text-white'}`}
                  >
                    {n.label}
                    {n.promo && promo && <Tag live={promo.live} />}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/test-drive" onClick={() => setOpen(false)} className="btn btn-ghost-light mt-6 w-full">จองทดลองขับ</Link>
            <Link href="/contact?type=quote" onClick={() => setOpen(false)} className="btn btn-primary mt-3 w-full">ขอใบเสนอราคา</Link>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
