"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { serviceRecords, getCompanyById, getVehicleById, formatBaht } from "@/lib/mockData";
import { Search } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 15;

export default function ServiceHistoryPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    return [...serviceRecords]
      .sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1))
      .filter((s) => {
        if (!q) return true;
        const company = getCompanyById(s.companyId);
        const vehicle = getVehicleById(s.vehicleId);
        return (
          company?.name.toLowerCase().includes(q.toLowerCase()) ||
          vehicle?.registrationNumber.includes(q) ||
          s.roNumber.toLowerCase().includes(q.toLowerCase())
        );
      });
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "ประวัติการเข้าศูนย์" }]} />
      <h1 className="text-xl font-bold text-gray-800 mb-5">ประวัติการเข้าศูนย์</h1>

      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4">
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="ค้นหาบริษัท, ทะเบียนรถ, เลข RO..."
            className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">วันที่</th>
              <th className="font-medium px-4 py-3">เลข RO</th>
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3">ทะเบียนรถ</th>
              <th className="font-medium px-4 py-3">ประเภทงาน</th>
              <th className="font-medium px-4 py-3">ศูนย์บริการ</th>
              <th className="font-medium px-4 py-3 text-right">ยอดค่าใช้จ่าย</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((s) => {
              const company = getCompanyById(s.companyId);
              const vehicle = getVehicleById(s.vehicleId);
              return (
                <tr key={s.id} className="table-row-hover border-t border-iks-border">
                  <td className="px-4 py-3">{s.serviceDate}</td>
                  <td className="px-4 py-3 text-iks-navy">{s.roNumber}</td>
                  <td className="px-4 py-3">
                    <Link href={`/company/${company?.id}`} className="text-iks-navy hover:underline">{company?.name}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/company/${company?.id}/vehicle/${vehicle?.id}`} className="hover:underline">{vehicle?.registrationNumber}</Link>
                  </td>
                  <td className="px-4 py-3">{s.serviceType}</td>
                  <td className="px-4 py-3 text-gray-600">{s.serviceCenter}</td>
                  <td className="px-4 py-3 text-right font-medium">฿{formatBaht(s.totalCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-iks-border text-sm text-gray-500">
          <span>แสดง {pageRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, rows.length)} จาก {rows.length} รายการ</span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-iks-border disabled:opacity-40">ก่อนหน้า</button>
            <span className="px-3 py-1.5 rounded-lg bg-iks-navy text-white">{page}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-iks-border disabled:opacity-40">ถัดไป</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
