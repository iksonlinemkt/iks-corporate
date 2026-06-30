"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Badge from "@/components/Badge";
import { companies, companySummary } from "@/lib/mockData";
import { Search } from "lucide-react";
import Link from "next/link";

export default function CompanyListPage() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => companies.filter((c) => (q ? c.name.toLowerCase().includes(q.toLowerCase()) : true)),
    [q]
  );

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "บริษัท / ข้อมูลลูกค้า" }]} />
      <h1 className="text-xl font-bold text-gray-800 mb-5">บริษัท / ข้อมูลลูกค้า</h1>

      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4">
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อบริษัท..."
            className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((c) => {
          const s = companySummary(c.id);
          return (
            <Link
              key={c.id}
              href={`/company/${c.id}`}
              className="bg-white rounded-xl shadow-card border border-iks-border p-4 hover:border-iks-navy/40 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800 text-sm leading-snug pr-2">{c.name}</h3>
                <Badge value={c.iksPurchaseStatus} small />
              </div>
              <div className="text-xs text-gray-400 mb-3">{c.businessType} · {c.branch}</div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>รถ {s.totalVehicles} คัน</span>
                <span>เข้าศูนย์ {s.totalServiceCount} ครั้ง</span>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
