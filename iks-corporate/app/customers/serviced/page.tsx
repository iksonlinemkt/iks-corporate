"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Badge from "@/components/Badge";
import StatCard from "@/components/StatCard";
import { companies, companySummary, formatBaht, getCompanyServiceRecords } from "@/lib/mockData";
import { Search, Download, Building2, Wrench, Coins } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function ServicedCustomersPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    return companies
      .map((c) => ({ c, s: companySummary(c.id) }))
      .filter(({ s }) => s.totalServiceCount > 0)
      .filter(({ c }) => (q ? c.name.toLowerCase().includes(q.toLowerCase()) : true))
      .filter(({ c }) => (statusFilter === "ทั้งหมด" ? true : c.iksPurchaseStatus === statusFilter))
      .sort((a, b) => b.s.totalServiceCount - a.s.totalServiceCount);
  }, [q, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCompaniesServiced = rows.length;
  const totalServiceCount = rows.reduce((s, r) => s + r.s.totalServiceCount, 0);
  const totalCost = rows.reduce((s, r) => s + r.s.totalServiceCost, 0);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "ลูกค้าที่ซ่อมรถ" }]} />
      <h1 className="text-xl font-bold text-gray-800 mb-5">ลูกค้าที่ซ่อมรถ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard icon={<Building2 size={20} />} label="จำนวนบริษัท" value={totalCompaniesServiced} unit="บริษัท" trend="9%" trendLabel="จากเดือนที่แล้ว" />
        <StatCard icon={<Wrench size={20} />} label="จำนวนครั้งเข้าศูนย์รวม" value={formatBaht(totalServiceCount)} unit="ครั้ง" trend="9%" trendLabel="จากเดือนที่แล้ว" iconBg="bg-iks-copper/10" iconColor="text-iks-copper" />
        <StatCard icon={<Coins size={20} />} label="ยอดค่าใช้จ่ายรวม" value={"฿" + formatBaht(totalCost)} trend="11%" trendLabel="จากเดือนที่แล้ว" iconBg="bg-iks-copper/10" iconColor="text-iks-copper" />
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="ค้นหาบริษัท, ทะเบียนรถ, เลขตัวถัง, เบอร์โทร..."
              className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-iks-surface border border-iks-border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="ทั้งหมด">สถานะซื้อกับ IKS: ทั้งหมด</option>
            <option value="IKS_CUSTOMER">ซื้อกับ IKS</option>
            <option value="NON_IKS_CUSTOMER">ไม่พบข้อมูลซื้อ</option>
            <option value="PENDING_VERIFICATION">รอตรวจสอบ</option>
          </select>
        </div>
        <button className="flex items-center gap-1.5 bg-iks-navy hover:bg-iks-navyLight text-white rounded-lg px-3.5 py-2 text-sm">
          <Download size={15} /> Export
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">#</th>
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3 text-center">รถที่เข้าศูนย์</th>
              <th className="font-medium px-4 py-3 text-center">ครั้งเข้าศูนย์รวม</th>
              <th className="font-medium px-4 py-3 text-right">ยอดค่าใช้จ่ายสะสม</th>
              <th className="font-medium px-4 py-3">เข้าศูนย์ล่าสุด</th>
              <th className="font-medium px-4 py-3 text-center">สถานะซื้อกับ IKS</th>
              <th className="font-medium px-4 py-3">ผู้รับผิดชอบ</th>
              <th className="font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(({ c, s }, i) => {
              const lastSr = [...getCompanyServiceRecords(c.id)].sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1))[0];
              return (
                <tr key={c.id} className="table-row-hover border-t border-iks-border">
                  <td className="px-4 py-3 text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3 text-iks-navy font-medium">
                    <Link href={`/company/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">{s.vehiclesServiced} คัน</td>
                  <td className="px-4 py-3 text-center font-medium">{s.totalServiceCount}</td>
                  <td className="px-4 py-3 text-right font-medium">฿{formatBaht(s.totalServiceCost)}</td>
                  <td className="px-4 py-3 text-gray-600">{lastSr?.serviceDate || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge value={c.iksPurchaseStatus} small />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.salesOwner}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/company/${c.id}`} className="text-iks-navy text-xs font-medium border border-iks-navy/30 rounded-lg px-3 py-1.5 hover:bg-iks-navy hover:text-white transition-colors">
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-iks-border text-sm text-gray-500">
          <span>
            แสดง {pageRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, rows.length)} จาก {rows.length} รายการ
          </span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-iks-border disabled:opacity-40">
              ก่อนหน้า
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-iks-navy text-white">{page}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-iks-border disabled:opacity-40">
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
