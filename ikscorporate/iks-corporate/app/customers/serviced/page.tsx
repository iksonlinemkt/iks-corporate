"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import {
  realCompanies, realVehicles, realServiceRecords,
  realCompanySummary, formatBahtReal,
} from "@/lib/realDataLoader";
import { Search, Download, Building2, Wrench, Coins, ChevronDown } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 10;

const IKS_STATUS_LABEL: Record<string, string> = {
  IKS_CUSTOMER: "ซื้อกับ IKS",
  NON_IKS_CUSTOMER: "ไม่พบข้อมูลซื้อ",
  PENDING_VERIFICATION: "รอตรวจสอบ",
};
const IKS_STATUS_COLOR: Record<string, string> = {
  IKS_CUSTOMER:         "bg-green-50 text-green-700 border-green-200",
  NON_IKS_CUSTOMER:     "bg-orange-50 text-orange-600 border-orange-200",
  PENDING_VERIFICATION: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export default function ServicedCustomersPage() {
  const [q,             setQ]             = useState("");
  const [branchFilter,  setBranchFilter]  = useState("ทั้งหมด");
  const [statusFilter,  setStatusFilter]  = useState("ทั้งหมด"); // clicks on stat cards
  const [page,          setPage]          = useState(1);

  // ── branches from real data ─────────────────────────────────
  const branches = useMemo(() =>
    ["ทั้งหมด", ...[...new Set(realCompanies.map(c => c.branch).filter(Boolean))].sort()],
    []
  );

  // ── All rows with service data ──────────────────────────────
  const allRows = useMemo(() => {
    const companiesWithService = new Set(realServiceRecords.map(s => s.companyId));
    return realCompanies
      .filter(c => companiesWithService.has(c.id))
      .map(c => {
        const srs  = realServiceRecords.filter(s => s.companyId === c.id);
        const roSet = new Set(srs.map(s => s.roNumber));
        const totalCost = srs.reduce((sum, s) => sum + s.totalCost, 0);
        const vehiclesServiced = new Set(srs.map(s => s.vehicleId)).size;
        const lastSr = [...srs].sort((a, b) => b.serviceDateISO.localeCompare(a.serviceDateISO))[0];
        return {
          c,
          serviceCount:   roSet.size,
          totalCost,
          vehiclesServiced,
          lastServiceDate: lastSr?.serviceDate || "-",
        };
      })
      .sort((a, b) => b.serviceCount - a.serviceCount);
  }, []);

  // ── Summary counts for stat cards ──────────────────────────
  const countAll   = allRows.length;
  const countIKS   = allRows.filter(r => r.c.iksPurchaseStatus === "IKS_CUSTOMER").length;
  const countNon   = allRows.filter(r => r.c.iksPurchaseStatus === "NON_IKS_CUSTOMER").length;
  const countPend  = allRows.filter(r => r.c.iksPurchaseStatus === "PENDING_VERIFICATION").length;

  // ── Filtered rows (apply all filters) ───────────────────────
  const filteredRows = useMemo(() =>
    allRows
      .filter(r => q ? r.c.name.toLowerCase().includes(q.toLowerCase()) : true)
      .filter(r => branchFilter === "ทั้งหมด" ? true : r.c.branch === branchFilter)
      .filter(r => statusFilter === "ทั้งหมด" ? true : r.c.iksPurchaseStatus === statusFilter),
    [allRows, q, branchFilter, statusFilter]
  );

  const totalPages   = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows     = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filteredServiceCount = filteredRows.reduce((s, r) => s + r.serviceCount, 0);
  const filteredCost         = filteredRows.reduce((s, r) => s + r.totalCost, 0);

  function handleStatClick(status: string) {
    const next = statusFilter === status ? "ทั้งหมด" : status;
    setStatusFilter(next);
    setPage(1);
  }

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "ลูกค้าที่ซ่อมรถ" }]} />
      <h1 className="text-xl font-bold text-gray-800 mb-5">ลูกค้าที่ซ่อมรถ</h1>

      {/* ── Stat Cards (clickable filter) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">

        {/* Total */}
        <ClickStatCard
          label="ทั้งหมด"
          value={filteredRows.length}
          unit="บริษัท"
          icon={<Building2 size={18}/>}
          active={statusFilter === "ทั้งหมด"}
          onClick={() => { setStatusFilter("ทั้งหมด"); setPage(1); }}
          subLabel={`จากทั้งหมด ${countAll} บริษัท`}
          bg="bg-iks-navy/5" activeBg="bg-iks-navy" color="text-iks-navy"
        />

        {/* IKS */}
        <ClickStatCard
          label="ซื้อกับ IKS"
          value={countIKS}
          unit="บริษัท"
          icon={<span className="text-base">✅</span>}
          active={statusFilter === "IKS_CUSTOMER"}
          onClick={() => handleStatClick("IKS_CUSTOMER")}
          bg="bg-green-50" activeBg="bg-green-600" color="text-green-700"
        />

        {/* Non IKS */}
        <ClickStatCard
          label="ไม่พบข้อมูลซื้อ"
          value={countNon}
          unit="บริษัท"
          icon={<span className="text-base">🔶</span>}
          active={statusFilter === "NON_IKS_CUSTOMER"}
          onClick={() => handleStatClick("NON_IKS_CUSTOMER")}
          bg="bg-orange-50" activeBg="bg-orange-500" color="text-orange-600"
          badge="โอกาสขาย"
        />

        {/* Pending */}
        <ClickStatCard
          label="รอตรวจสอบ"
          value={countPend}
          unit="บริษัท"
          icon={<span className="text-base">🕐</span>}
          active={statusFilter === "PENDING_VERIFICATION"}
          onClick={() => handleStatClick("PENDING_VERIFICATION")}
          bg="bg-yellow-50" activeBg="bg-yellow-500" color="text-yellow-700"
        />

        {/* Service stats (filtered) */}
        <div className="bg-white border border-iks-border rounded-xl p-4 shadow-card col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-iks-copper/10 rounded-lg flex items-center justify-center text-iks-copper">
              <Wrench size={16}/>
            </div>
            <span className="text-xs text-gray-500">ตามที่กรอง</span>
          </div>
          <div className="text-lg font-bold text-gray-800">{filteredServiceCount.toLocaleString()}</div>
          <div className="text-xs text-gray-400">ครั้งเข้าศูนย์รวม</div>
          <div className="text-sm font-semibold text-iks-copper mt-1">฿{formatBahtReal(filteredCost)}</div>
          <div className="text-xs text-gray-400">ยอดค่าใช้จ่ายรวม</div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
              placeholder="ค้นหาชื่อบริษัท..."
              className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
            />
          </div>

          {/* Branch filter */}
          <div className="relative">
            <select
              value={branchFilter}
              onChange={e => { setBranchFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-iks-surface border border-iks-border rounded-lg pl-3 pr-8 py-2 text-sm text-gray-600 outline-none"
            >
              {branches.map(b => (
                <option key={b} value={b}>{b === "ทั้งหมด" ? "สาขา: ทั้งหมด" : b}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>

          {/* Status filter (synced with stat cards) */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-iks-surface border border-iks-border rounded-lg pl-3 pr-8 py-2 text-sm text-gray-600 outline-none"
            >
              <option value="ทั้งหมด">สถานะ IKS: ทั้งหมด</option>
              <option value="IKS_CUSTOMER">ซื้อกับ IKS</option>
              <option value="NON_IKS_CUSTOMER">ไม่พบข้อมูลซื้อ</option>
              <option value="PENDING_VERIFICATION">รอตรวจสอบ</option>
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>

          {/* Active filters */}
          {(statusFilter !== "ทั้งหมด" || branchFilter !== "ทั้งหมด") && (
            <button
              onClick={() => { setStatusFilter("ทั้งหมด"); setBranchFilter("ทั้งหมด"); setQ(""); setPage(1); }}
              className="text-xs text-iks-red border border-red-200 bg-red-50 rounded-lg px-3 py-1.5 hover:bg-red-100"
            >
              ล้าง filter ✕
            </button>
          )}
        </div>

        <button className="flex items-center gap-1.5 bg-iks-navy hover:bg-iks-navyLight text-white rounded-lg px-3.5 py-2 text-sm">
          <Download size={15}/> Export
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">#</th>
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3">สาขา</th>
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
            {pageRows.map(({ c, serviceCount, totalCost, vehiclesServiced, lastServiceDate }, i) => (
              <tr key={c.id} className="table-row-hover border-t border-iks-border">
                <td className="px-4 py-3 text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="px-4 py-3 font-medium text-iks-navy">
                  <Link href={`/company/${c.id}`} className="hover:underline">{c.name}</Link>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.branch}</td>
                <td className="px-4 py-3 text-center">{vehiclesServiced} คัน</td>
                <td className="px-4 py-3 text-center font-medium">{serviceCount}</td>
                <td className="px-4 py-3 text-right font-medium">฿{formatBahtReal(totalCost)}</td>
                <td className="px-4 py-3 text-gray-600">{lastServiceDate}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] border rounded-full px-2 py-0.5 font-medium ${IKS_STATUS_COLOR[c.iksPurchaseStatus]}`}>
                    {IKS_STATUS_LABEL[c.iksPurchaseStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{c.salesOwner !== "SC ไม่ระบุ" ? c.salesOwner : "-"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/company/${c.id}`}
                    className="text-iks-navy text-xs font-medium border border-iks-navy/30 rounded-lg px-3 py-1.5 hover:bg-iks-navy hover:text-white transition-colors">
                    ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</td></tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-iks-border text-sm text-gray-500">
          <span>แสดง {filteredRows.length === 0 ? 0 : (page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filteredRows.length)} จาก {filteredRows.length} บริษัท</span>
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

// ─── Clickable Stat Card ──────────────────────────────────────
function ClickStatCard({
  label, value, unit, icon, active, onClick,
  bg, activeBg, color, subLabel, badge,
}: {
  label: string; value: number; unit: string; icon: React.ReactNode;
  active: boolean; onClick: () => void;
  bg: string; activeBg: string; color: string;
  subLabel?: string; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all cursor-pointer w-full shadow-card ${
        active
          ? `${activeBg} text-white border-transparent ring-2 ring-offset-1 ring-${activeBg.replace("bg-","")}`
          : `bg-white border-iks-border hover:border-iks-navy/30`
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-white/20" : bg}`}>
          <span className={active ? "text-white" : color}>{icon}</span>
        </div>
        {badge && !active && (
          <span className="text-[10px] bg-orange-100 text-orange-600 border border-orange-200 rounded-full px-1.5 py-0.5">{badge}</span>
        )}
        {active && <span className="text-[10px] bg-white/20 text-white rounded-full px-1.5 py-0.5">active ✓</span>}
      </div>
      <div className={`text-xl font-bold ${active ? "text-white" : "text-gray-800"}`}>
        {value} <span className={`text-xs font-normal ${active ? "text-white/80" : "text-gray-400"}`}>{unit}</span>
      </div>
      <div className={`text-xs mt-0.5 ${active ? "text-white/80" : color}`}>{label}</div>
      {subLabel && <div className={`text-[10px] mt-0.5 ${active ? "text-white/60" : "text-gray-400"}`}>{subLabel}</div>}
    </button>
  );
}
