"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Badge from "@/components/Badge";
import { vehicles, getCompanyById, vehicleSummary, formatBaht } from "@/lib/mockData";
import { Search, Download } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 12;

export default function VehiclesListPage() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    return vehicles
      .filter((v) =>
        q
          ? v.registrationNumber.includes(q) || v.engineNumber.includes(q) || v.chassisNumber.includes(q) || v.vehicleModel.toLowerCase().includes(q.toLowerCase())
          : true
      )
      .filter((v) => (group === "ทั้งหมด" ? true : v.vehicleGroup === group));
  }, [q, group]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "รถของบริษัท" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">รถของบริษัท</h1>
        <button className="flex items-center gap-1.5 bg-white border border-iks-border rounded-lg px-3.5 py-2 text-sm text-gray-600 hover:bg-iks-surface">
          <Download size={15} /> ส่งออกข้อมูล
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="ค้นหาทะเบียน, รุ่นรถ, เลขเครื่อง, เลขแชสซี..."
            className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
          />
        </div>
        <select
          value={group}
          onChange={(e) => { setGroup(e.target.value); setPage(1); }}
          className="bg-iks-surface border border-iks-border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
        >
          <option value="ทั้งหมด">กลุ่มรถ: ทั้งหมด</option>
          <option value="P-UP">P-UP</option>
          <option value="MU-X">MU-X</option>
          <option value="รถบรรทุก">รถบรรทุก</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">ทะเบียน</th>
              <th className="font-medium px-4 py-3">รุ่นรถ</th>
              <th className="font-medium px-4 py-3">กลุ่มรถ</th>
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3 text-center">ซื้อกับ</th>
              <th className="font-medium px-4 py-3 text-center">ครั้งเข้าศูนย์</th>
              <th className="font-medium px-4 py-3 text-right">ยอดสะสม</th>
              <th className="font-medium px-4 py-3">สถานะ</th>
              <th className="font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((v) => {
              const company = getCompanyById(v.companyId);
              const s = vehicleSummary(v.id);
              return (
                <tr key={v.id} className="table-row-hover border-t border-iks-border">
                  <td className="px-4 py-3 font-medium text-gray-800">{v.registrationNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{v.vehicleModel}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.vehicleGroup}
                    {v.vehicleSubtype !== "-" && <span className="text-gray-400"> · {v.vehicleSubtype}</span>}
                  </td>
                  <td className="px-4 py-3 text-iks-navy">
                    <Link href={`/company/${company?.id}`} className="hover:underline">{company?.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-center"><Badge value={v.ownershipStatus} small /></td>
                  <td className="px-4 py-3 text-center">{s.serviceCount}</td>
                  <td className="px-4 py-3 text-right font-medium">฿{formatBaht(s.totalCost)}</td>
                  <td className="px-4 py-3"><Badge value={v.vehicleStatus} small /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/company/${company?.id}/vehicle/${v.id}`} className="text-iks-navy text-xs font-medium border border-iks-navy/30 rounded-lg px-3 py-1.5 hover:bg-iks-navy hover:text-white transition-colors">
                      ดูรายละเอียดรถ
                    </Link>
                  </td>
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
