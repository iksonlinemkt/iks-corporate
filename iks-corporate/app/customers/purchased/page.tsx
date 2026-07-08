"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { realCompanies, realCompanySummary, getRealCompanyVehicles } from "@/lib/realDataLoader";
import { Search, Download } from "lucide-react";
import Link from "next/link";

const OPP_COLOR: Record<string,string> = { HOT:"bg-red-50 text-red-600 border border-red-200", WARM:"bg-orange-50 text-orange-600 border border-orange-200", COLD:"bg-blue-50 text-blue-500 border border-blue-200", NONE:"bg-gray-100 text-gray-500 border border-gray-200" };
const PAGE_SIZE = 15;

export default function PurchasedCustomersPage() {
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);
  const branches = [...new Set(realCompanies.map(c => c.branch).filter(Boolean))].sort();

  const rows = useMemo(() => {
    return realCompanies
      .filter(c => c.iksPurchaseStatus === "IKS_CUSTOMER")
      .filter(c => q ? c.name.toLowerCase().includes(q.toLowerCase()) : true)
      .filter(c => branch === "ทั้งหมด" ? true : c.branch === branch)
      .map(c => {
        const s = realCompanySummary(c.id);
        const vs = getRealCompanyVehicles(c.id);
        const latestV = [...vs].sort((a,b) => b.purchaseYear - a.purchaseYear)[0];
        return { c, s, latestV };
      })
      .sort((a,b) => b.s.iksVehicles - a.s.iksVehicles);
  }, [q, branch]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  return (
    <AppShell>
      <Breadcrumb items={[{ label:"ลูกค้าที่ซื้อรถ" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">ลูกค้าที่ซื้อรถ</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{rows.length} บริษัท</span>
          <button className="flex items-center gap-1.5 bg-white border border-iks-border rounded-lg px-3.5 py-2 text-sm text-gray-600">
            <Download size={15}/> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4 flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} placeholder="ค้นหาชื่อบริษัท..."
            className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"/>
        </div>
        <select value={branch} onChange={e=>{setBranch(e.target.value);setPage(1);}}
          className="bg-iks-surface border border-iks-border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
          <option value="ทั้งหมด">สาขา: ทั้งหมด</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3">สาขา / เซลส์ผู้ดูแล</th>
              <th className="font-medium px-4 py-3 text-center">รถทั้งหมด</th>
              <th className="font-medium px-4 py-3 text-center">ซื้อกับ IKS</th>
              <th className="font-medium px-4 py-3">รถล่าสุด</th>
              <th className="font-medium px-4 py-3 text-center">ครั้งเข้าศูนย์</th>
              <th className="font-medium px-4 py-3">ผู้ติดต่อ</th>
              <th className="font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(({ c, s, latestV }) => (
              <tr key={c.id} className="table-row-hover border-t border-iks-border">
                <td className="px-4 py-3 font-medium text-iks-navy">
                  <Link href={`/company/${c.id}?tab=profile`} className="hover:underline">{c.name}</Link>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  <div>{c.branch}</div>
                  <div className="text-gray-400">{c.salesOwner !== "SC ไม่ระบุ" ? c.salesOwner : "-"}</div>
                </td>
                <td className="px-4 py-3 text-center">{s.totalVehicles}</td>
                <td className="px-4 py-3 text-center font-semibold text-iks-navy">{s.iksVehicles}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{latestV?.vehicleModel || "-"}</td>
                <td className="px-4 py-3 text-center">{s.totalServiceCount}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  <div>{c.contactName || "-"}</div>
                  <div className="text-gray-400">{c.contactPhone || ""}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/company/${c.id}?tab=profile`} className="text-iks-navy text-xs font-medium border border-iks-navy/30 rounded-lg px-3 py-1.5 hover:bg-iks-navy hover:text-white transition-colors">
                    ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">ไม่พบข้อมูล</td></tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-iks-border text-sm text-gray-500">
          <span>แสดง {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,rows.length)} จาก {rows.length}</span>
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
