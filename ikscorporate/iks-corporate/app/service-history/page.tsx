"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import {
  realServiceRecords, getRealCompanyById, getRealVehicleById, formatBahtReal,
} from "@/lib/realDataLoader";
import { Search, ChevronDown } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 20;

export default function ServiceHistoryPage() {
  const [q, setQ]           = useState("");
  const [center, setCenter] = useState("ทั้งหมด");
  const [page, setPage]     = useState(1);

  const centers = useMemo(() =>
    ["ทั้งหมด", ...[...new Set(realServiceRecords.map(s => s.serviceCenter).filter(Boolean))].sort()],
    []
  );

  const rows = useMemo(() =>
    [...realServiceRecords]
      .sort((a, b) => b.serviceDateISO.localeCompare(a.serviceDateISO))
      .filter(s => {
        if (center !== "ทั้งหมด" && s.serviceCenter !== center) return false;
        if (!q) return true;
        const company = getRealCompanyById(s.companyId);
        const vehicle = getRealVehicleById(s.vehicleId);
        return (
          company?.name.toLowerCase().includes(q.toLowerCase()) ||
          vehicle?.engineNumber.toLowerCase().includes(q.toLowerCase()) ||
          vehicle?.registrationNumber.includes(q) ||
          s.roNumber.toLowerCase().includes(q.toLowerCase())
        );
      }),
    [q, center]
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows   = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "ประวัติการเข้าศูนย์" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">ประวัติการเข้าศูนย์</h1>
        <span className="text-sm text-gray-400">{rows.length.toLocaleString()} รายการ</span>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="ค้นหาบริษัท, ทะเบียนรถ, เลขเครื่อง, เลข RO..."
            className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"/>
        </div>
        <div className="relative">
          <select value={center} onChange={e => { setCenter(e.target.value); setPage(1); }}
            className="appearance-none bg-iks-surface border border-iks-border rounded-lg pl-3 pr-8 py-2 text-sm text-gray-600 outline-none">
            {centers.map(c => <option key={c} value={c}>{c === "ทั้งหมด" ? "ศูนย์บริการ: ทั้งหมด" : c}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">วันที่</th>
              <th className="font-medium px-4 py-3">เลข RO</th>
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3">เลขเครื่อง</th>
              <th className="font-medium px-4 py-3">ประเภทงาน</th>
              <th className="font-medium px-4 py-3">รายละเอียด</th>
              <th className="font-medium px-4 py-3">ศูนย์บริการ</th>
              <th className="font-medium px-4 py-3 text-right">ยอด (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(s => {
              const company = getRealCompanyById(s.companyId);
              const vehicle = getRealVehicleById(s.vehicleId);
              return (
                <tr key={s.id} className="table-row-hover border-t border-iks-border">
                  <td className="px-4 py-3 whitespace-nowrap">{s.serviceDate}</td>
                  <td className="px-4 py-3 font-mono text-xs text-iks-navy">{s.roNumber}</td>
                  <td className="px-4 py-3">
                    <Link href={`/company/${company?.id}`} className="text-iks-navy hover:underline">{company?.name}</Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{vehicle?.engineNumber || "-"}</td>
                  <td className="px-4 py-3">{s.serviceType}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{s.serviceDetail}</td>
                  <td className="px-4 py-3 text-gray-600">{s.serviceCenter}</td>
                  <td className="px-4 py-3 text-right font-medium">฿{formatBahtReal(s.totalCost)}</td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">ไม่พบรายการ</td></tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-iks-border text-sm text-gray-500">
          <span>แสดง {rows.length === 0 ? 0 : (page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, rows.length)} จาก {rows.length.toLocaleString()} รายการ</span>
          <div className="flex items-center gap-1">
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1.5 rounded-lg border border-iks-border disabled:opacity-40">ก่อนหน้า</button>
            <span className="px-3 py-1.5 rounded-lg bg-iks-navy text-white">{page}</span>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1.5 rounded-lg border border-iks-border disabled:opacity-40">ถัดไป</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
