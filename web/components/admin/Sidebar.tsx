'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Building2, CarFront, ClipboardCheck, ExternalLink, Hammer, History, Inbox, LayoutDashboard, LayoutGrid, ListChecks,
  LogOut, Menu, Settings, Sparkles, Radio, Store, Tag, Tags, Truck, UserCog, Users, Wrench, X, CalendarClock, KeyRound,
} from 'lucide-react';
import { Wordmark } from '@/components/Brand';

type Item = { href: string; label: string; icon: typeof Inbox; badge?: number; external?: boolean };

export function Sidebar({
  user, newLeads, checklist, logout,
}: {
  user: { email: string; full_name: string | null; role: string };
  newLeads: number;
  checklist: number;
  logout: () => Promise<void>;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const groups: { title?: string; items: Item[] }[] = [
    {
      items: [
        { href: '/admin', label: 'ภาพรวม', icon: LayoutDashboard },
        { href: '/admin/leads', label: 'รายชื่อลูกค้า (Lead)', icon: Inbox, badge: newLeads },
        { href: '/admin/checklist', label: 'เช็กก่อนเปิดเว็บ', icon: ClipboardCheck, badge: checklist },
      ],
    },
    {
      title: 'หน้าเว็บ',
      items: [
        { href: '/admin/pages', label: 'หน้าเว็บ + แบนเนอร์', icon: LayoutGrid },
        { href: '/admin/settings', label: 'ตั้งค่าเว็บ / ติดต่อ', icon: Settings },
      ],
    },
    {
      title: 'เนื้อหา',
      items: [
        { href: '/admin/c/campaigns', label: 'เปิดตัวรุ่นใหม่ / ไลฟ์', icon: Sparkles },
        { href: '/admin/live-test', label: 'ควบคุมไลฟ์ / ทดสอบ', icon: Radio },
        { href: '/admin/c/vehicles', label: 'รุ่นรถ', icon: CarFront },
        { href: '/admin/c/vehicle-grades', label: 'รุ่นย่อยและราคา', icon: Tags },
        { href: '/admin/c/vehicle-categories', label: 'กลุ่มรุ่นรถ', icon: Truck },
        { href: '/admin/c/faqs', label: 'คำถามที่พบบ่อย', icon: ListChecks },
        { href: '/admin/c/promotions', label: 'โปรโมชั่น', icon: Tag },
        { href: '/admin/c/promotion-categories', label: 'หมวดโปรโมชั่น', icon: Tags },
        { href: '/admin/c/services', label: 'บริการ', icon: Wrench },
        { href: '/admin/c/body-types', label: 'ตัวถัง', icon: Hammer },
        { href: '/admin/c/industries', label: 'ประเภทธุรกิจ', icon: Building2 },
        { href: '/admin/c/highlights', label: 'ไอคอนและจุดเด่น', icon: ListChecks },
        { href: '/admin/c/branches', label: 'สาขา', icon: Store },
        { href: '/admin/c/staff', label: 'ทีมขาย', icon: Users },
        { href: '/admin/c/activities', label: 'กิจกรรม', icon: Sparkles },
        { href: '/admin/c/gallery', label: 'แกลเลอรีรูป', icon: Sparkles },
        { href: '/admin/c/communities', label: 'Community (คลับ)', icon: Users },
        { href: '/admin/c/community-posts', label: 'โพสต์ Community', icon: Users },
        { href: '/admin/c/areas', label: 'หน้าพื้นที่ (SEO)', icon: Building2 },
        { href: '/admin/c/timeline', label: 'ไทม์ไลน์บริษัท', icon: CalendarClock },
      ],
    },
    {
      title: 'ระบบ',
      items: [
        ...(user.role === 'admin'
          ? [
              { href: '/admin/users', label: 'ผู้ใช้งาน', icon: UserCog },
              { href: '/admin/audit', label: 'ประวัติการแก้ไข', icon: History },
            ]
          : []),
        { href: '/admin/account', label: 'เปลี่ยนรหัสผ่าน', icon: KeyRound },
        { href: '/admin/preview', label: 'เปิดดูเว็บ (พรีวิว)', icon: ExternalLink, external: true },
      ],
    },
  ];

  const isActive = (href: string) => (href === '/admin' ? path === '/admin' : path === href || path.startsWith(href + '/'));

  const nav = (
    <nav aria-label="เมนูหลังบ้าน" className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((g, gi) => (
        <div key={gi} className="mb-4">
          {g.title && <p className="mb-1 px-3 text-[12px] font-semibold text-copper-light/80">{g.title}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const on = !it.external && isActive(it.href);
              const I = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    target={it.external ? '_blank' : undefined}
                    prefetch={it.external ? false : undefined}
                    onClick={() => setOpen(false)}
                    aria-current={on ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors ${
                      on ? 'bg-copper text-navy-950' : 'text-white/80 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <I size={18} aria-hidden className="shrink-0" />
                    <span className="flex-1 truncate">{it.label}</span>
                    {!!it.badge && (
                      <span className={`min-w-6 rounded-full px-1.5 text-center text-[12px] font-bold ${on ? 'bg-navy-950 text-white' : 'bg-copper text-navy-950'}`}>{it.badge}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const userBox = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-[14px] font-semibold text-white">{user.full_name || user.email}</p>
      <p className="truncate text-[12px] text-white/55">{user.email} · {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'การตลาด'}</p>
      <form action={logout} className="mt-3">
        <button className="inline-flex items-center gap-2 text-[13px] font-semibold text-copper-light hover:underline"><LogOut size={15} />ออกจากระบบ</button>
      </form>
    </div>
  );

  return (
    <>
      {/* มือถือ */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-navy-950 px-4 lg:hidden">
        <Link href="/admin"><Wordmark light className="h-8" /></Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="เปิดเมนู" className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10">
          <Menu size={24} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-[290px] flex-col bg-navy-950">
            <div className="flex h-14 items-center justify-between px-4">
              <Wordmark light className="h-8" />
              <button type="button" onClick={() => setOpen(false)} aria-label="ปิดเมนู" className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10"><X size={22} /></button>
            </div>
            {nav}
            {userBox}
          </div>
          <button type="button" aria-label="ปิดเมนู" className="flex-1 bg-navy-950/60" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* คอม */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col bg-navy-950 lg:flex">
        <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-5">
          <Link href="/admin" aria-label="ภาพรวม"><Wordmark light className="h-10" /></Link>
          <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-copper-light">หลังบ้าน</span>
        </div>
        {nav}
        {userBox}
      </aside>
    </>
  );
}
