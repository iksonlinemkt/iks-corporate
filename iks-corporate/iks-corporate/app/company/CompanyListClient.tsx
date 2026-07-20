"use client";

import { useState, useMemo } from "react";
import { Search, Building2 } from "lucide-react";
import Link from "next/link";

const STATUS_LABEL: Record<string,string> = {
  IKS_CUSTOMER:"ซื้อกับ IKS", NON_IKS_CUSTOMER:"ไม่พบข้อมูลซื้อ", PENDING_VERIFICATION:"รอตรวจสอบ"
};
const STATUS_COLOR: Record<string,string> = {
  IKS_CUSTOMER:"bg-green-50 text-green-700 border-green-200",
  NON_IKS_CUSTOMER:"bg-orange-50 text-orange-600 border-orange-200",
  PENDING_VERIFICATION:"bg-yellow-50 text-yellow-700 border-yellow-200",
};

export default function CompanyListClient({ rows, branches }: { rows: any[]; branches: string[] }) {
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("ทั้งหมด");

  const filtered = useMemo(() =>
    rows
      .filter(r => q ? r.name.toLowerCase().includes(q.toLowerCase()) : true)
      .filter(r => branch === "ทั้งหมด" ? true : r.branch === branch),
    [rows, q, branch]
  );

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">บริษัท / ข้อมูลลูกค้า</h1>
        <span className="text-sm text-gray-400">{filtered.length} บริษัท</span>
      </div>
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาชื่อบริษัท..."
            className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none" />
        </div>
        <select value={branch} onChange={e => setBranch(e.target.value)}
          className="bg-iks-surface border border-iks-border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
          <option value="ทั้งหมด">สาขา: ทั้งหมด</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Link key={c.id} href={`/company/${c.id}?tab=profile`}
            className="bg-white rounded-xl shadow-card border border-iks-border p-4 hover:border-iks-navy/40 transition-colors">
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="font-medium text-gray-800 text-sm leading-snug pr-2">{c.name}</h3>
              <span className={`text-[10px] border rounded-full px-2 py-0.5 shrink-0 ${STATUS_COLOR[c.iksPurchaseStatus]}`}>
                {STATUS_LABEL[c.iksPurchaseStatus]}
              </span>
            </div>
            <div className="text-xs text-gray-400 mb-2">{c.branch} · {c.salesOwner !== "SC ไม่ระบุ" ? c.salesOwner : ""}</div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Building2 size={11}/> รถ {c.summary.totalVehicles} คัน ({c.summary.iksVehicles} IKS)</span>
              <span>เข้าศูนย์ {c.summary.totalServiceCount} ครั้ง</span>
            </div>
            {c.summary.totalServiceCost > 0 && (
              <div className="text-xs text-iks-copper mt-1">฿{new Intl.NumberFormat("th-TH").format(Math.round(c.summary.totalServiceCost))}</div>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
