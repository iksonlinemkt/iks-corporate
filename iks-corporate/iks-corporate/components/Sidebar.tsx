"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Wrench,
  Building2,
  Truck,
  History,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
} from "lucide-react";
import Whale from "./Whale";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers/purchased", label: "ลูกค้าที่ซื้อรถ", icon: Car },
  { href: "/customers/serviced", label: "ลูกค้าที่ซ่อมรถ", icon: Wrench },
  { href: "/company", label: "บริษัท / ข้อมูลลูกค้า", icon: Building2 },
  { href: "/vehicles", label: "รถของบริษัท", icon: Truck },
  { href: "/service-history", label: "ประวัติการเข้าศูนย์", icon: History },
  { href: "/visit-log", label: "การเข้าเยี่ยม", icon: Users },
  { href: "/follow-up", label: "งานติดตาม", icon: ClipboardList },
  { href: "/reports", label: "รายงาน", icon: BarChart3 },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-iks-navy text-white min-h-screen flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
            <path d="M7 12a5 5 0 0 1 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="font-bold text-sm tracking-wide">IKS</div>
          <div className="text-[10px] text-white/60">ISUZU KRUNGTHEP SALES</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-iks-copper text-white font-medium"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5">
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2">
            <Whale size={56} />
          </div>
          <div className="text-sm font-medium">สวัสดีครับ! 👋</div>
          <p className="text-xs text-white/70 mt-1 leading-relaxed">
            ผมพร้อมช่วยคุณดูแลลูกค้า และวางแผนการดูแลได้อย่างมีประสิทธิภาพครับ
          </p>
        </div>
      </div>
    </aside>
  );
}
