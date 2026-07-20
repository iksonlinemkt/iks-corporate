"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import {
  realVehicles, realServiceRecords, getRealCompanyById, formatBahtReal,
} from "@/lib/realDataLoader";
import { Search, Download, ChevronDown } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 15;

const OWN_LABEL: Record<string,string> = {
  IKS_PURCHASE:"ซื้อ IKS", NON_IKS_PURCHASE:"ซื้อที่อื่น", UNKNOWN:"ไม่ทราบ",
};
const OWN_COLOR: Record<string,string> = {
  IKS_PURCHASE:"bg-green-50 text-green-700 border-green-200",
  NON_IKS_PURCHASE:"bg-gray-100 text-gray-500 border-gray-200",
  UNKNOWN:"bg-gray-50 text-gray-400 border-gray-200",
};

export default function VehiclesListPage() {
  const [q, setQ]         = useState("");
  const [group, setGroup] = useState("ทั้งหมด");
  const [page, setPage]   = useState(1);

  // Pre-compute vehicle service summary
  const vSummaryMap = useMemo(() => {
    const map: Record<string, { count: number; totalCost: number; lastDate: string }> = {};
    realServiceRecords.forEach(s => {
      if (!map[s.vehicleId]) map[s.vehicleId] = { count: 0, totalCost: 0, lastDate: "" };
      map[s.vehicleId].count++;
      map[s.vehicleId].totalCost += s.totalCost;
      if (!map[s.vehicleId].lastDate || s.serviceDateISO > map[s.vehicleId].lastDate)
        map[s.vehicleId].lastDate = s.serviceDate;
    });
    return map;
  }, []);

  const rows = useMemo(() =>
    realVehicles
      .filter(v => group === "ทั้งหมด" ? true : v.vehicleGroup === group)
      .filter(v => {
        if (!q) return true;
        return (
          v.engineNumber.toLowerCase().includes(q.toLowerCase()) ||
          v.registrationNumber.includes(q) ||
          v.vehicleModel.toLowerCase().includes(q.toLowerCase()) ||
          v.chassisNumber.toLowerCase().includes(q.toLowerCase())
        );
      }),
    [q, group]
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows   = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "รถของบริษัท" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">รถของบริษัท</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{rows.length.toLocaleString()} คัน</span>
          <button className="flex items-center gap-1.5 bg-white border border-iks-border rounded-lg px-3.5 py-2 text-sm text-gray-600">
            <Download size={15}/> ส่งออก
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="ค้นหาเลขเครื่อง, ทะเบียน, รุ่น, แชสซี..."
            className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"/>
        </div>
        <div className="relative">
          <select value={group} onChange={e => { setGroup(e.target.value); setPage(1); }}
            className="appearance-none bg-iks-surface border border-iks-border rounded-lg pl-3 pr-8 py-2 text-sm text-gray-600 outline-none">
            <option value="ทั้งหมด">กลุ่มรถ: ทั้งหมด</option>
            <option value="P-UP">P-UP</option>
            <option value="MU-X">MU-X</option>
            <option value="รถบรรทุก">รถบรรทุก</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">เลขเครื่อง</th>
              <th className="font-medium px-4 py-3">รุ่นรถ</th>
              <th className="font-medium px-4 py-3">กลุ่มรถ</th>
              <th className="font-medium px-4 py-3">ทะเบียน</th>
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3 text-center">ซื้อกับ</th>
              <th className="font-medium px-4 py-3 text-center">ครั้งเข้าศูนย์</th>
              <th className="font-medium px-4 py-3 text-right">ยอดสะสม</th>
              <th className="font-medium px-4 py-3">เข้าศูนย์ล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(v => {
              const company = getRealCompanyById(v.companyId);
              const vs = vSummaryMap[v.id] || { count: 0, totalCost: 0, lastDate: "-" };
              return (
                <tr key={v.id} className="table-row-hover border-t border-iks-border">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{v.engineNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{v.vehicleModel}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {v.vehicleGroup}{v.vehicleSubtype !== "-" && <span className="text-gray-400"> · {v.vehicleSubtype}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.registrationNumber !== "-" ? v.registrationNumber : "-"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/company/${company?.id}`} className="text-iks-navy hover:underline">{company?.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] border rounded-full px-2 py-0.5 ${OWN_COLOR[v.ownershipStatus]}`}>
                      {OWN_LABEL[v.ownershipStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{vs.count}</td>
                  <td className="px-4 py-3 text-right font-medium text-iks-copper">
                    {vs.totalCost > 0 ? "฿"+formatBahtReal(vs.totalCost) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{vs.lastDate || "-"}</td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">ไม่พบข้อมูล</td></tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-iks-border text-sm text-gray-500">
          <span>แสดง {rows.length===0?0:(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,rows.length)} จาก {rows.length.toLocaleString()} คัน</span>
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
