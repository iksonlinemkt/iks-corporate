"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Badge from "@/components/Badge";
import { companies, branches, companySummary, getCompanyVisits, getCompanyTasks, getCompanyVehicles } from "@/lib/mockData";
import { Search, Plus, Download } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function PurchasedCustomersPage() {
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("ทั้งหมด");
  const [opp, setOpp] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    return companies
      .filter((c) => getCompanyVehicles(c.id).length > 0)
      .filter((c) => (q ? c.name.toLowerCase().includes(q.toLowerCase()) : true))
      .filter((c) => (branch === "ทั้งหมด" ? true : c.branch === branch))
      .filter((c) => (opp === "ทั้งหมด" ? true : c.opportunityLevel === opp))
      .map((c) => {
        const s = companySummary(c.id);
        const visits = getCompanyVisits(c.id).sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1));
        const tasks = getCompanyTasks(c.id).filter((t) => t.status !== "เสร็จสิ้น").sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));
        const vs = getCompanyVehicles(c.id);
        const latestVehicle = [...vs].sort((a, b) => b.purchaseYear - a.purchaseYear)[0];
        return { c, s, lastVisit: visits[0], nextTask: tasks[0], latestVehicle };
      });
  }, [q, branch, opp]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "ลูกค้าที่ซื้อรถ" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">ลูกค้าที่ซื้อรถ</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 bg-white border border-iks-border rounded-lg px-3.5 py-2 text-sm text-gray-600 hover:bg-iks-surface">
            <Download size={15} /> Export
          </button>
          <button className="flex items-center gap-1.5 bg-iks-navy hover:bg-iks-navyLight text-white rounded-lg px-3.5 py-2 text-sm">
            <Plus size={15} /> เพิ่มบริษัท
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาชื่อบริษัท, ทะเบียนรถ, เบอร์โทร..."
            className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
          />
        </div>
        <Select label="สาขา" value={branch} onChange={(v) => { setBranch(v); setPage(1); }} options={["ทั้งหมด", ...branches.map((b) => b.name)]} />
        <Select label="สถานะโอกาส" value={opp} onChange={(v) => { setOpp(v); setPage(1); }} options={["ทั้งหมด", "HOT", "WARM", "COLD", "NONE"]} />
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3">เซลส์ผู้ดูแล</th>
              <th className="font-medium px-4 py-3 text-center">จำนวนรถ</th>
              <th className="font-medium px-4 py-3 text-center">ซื้อกับ IKS</th>
              <th className="font-medium px-4 py-3">รถคันล่าสุด</th>
              <th className="font-medium px-4 py-3">วันที่เข้าเยี่ยมล่าสุด</th>
              <th className="font-medium px-4 py-3">งานติดตามครั้งถัดไป</th>
              <th className="font-medium px-4 py-3">สถานะโอกาส</th>
              <th className="font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(({ c, s, lastVisit, nextTask, latestVehicle }) => (
              <tr key={c.id} className="table-row-hover border-t border-iks-border">
                <td className="px-4 py-3 text-iks-navy font-medium">
                  <Link href={`/company/${c.id}`} className="hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.salesOwner}</td>
                <td className="px-4 py-3 text-center">{s.totalVehicles} คัน</td>
                <td className="px-4 py-3 text-center font-medium text-iks-navy">{s.iksVehicles} คัน</td>
                <td className="px-4 py-3 text-gray-600">{latestVehicle?.vehicleModel || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{lastVisit?.visitDate || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{nextTask?.dueDate || "-"}</td>
                <td className="px-4 py-3">
                  <Badge value={c.opportunityLevel} small />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/company/${c.id}?tab=profile`} className="text-iks-navy text-xs font-medium border border-iks-navy/30 rounded-lg px-3 py-1.5 hover:bg-iks-navy hover:text-white transition-colors">
                    ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-iks-border text-sm text-gray-500">
          <span>
            แสดง {pageRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, rows.length)} จาก {rows.length} รายการ
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-iks-border disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-iks-navy text-white">{page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-iks-border disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-iks-surface border border-iks-border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {label}: {o}
        </option>
      ))}
    </select>
  );
}
