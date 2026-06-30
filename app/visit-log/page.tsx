"use client";

import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Badge from "@/components/Badge";
import { visitLogs, getCompanyById } from "@/lib/mockData";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function VisitLogListPage() {
  const rows = [...visitLogs].sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1)).slice(0, 50);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "การเข้าเยี่ยม" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">การเข้าเยี่ยม</h1>
        <Link href="/visit-log/new" className="flex items-center gap-1.5 bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-3.5 py-2 text-sm">
          <Plus size={15} /> บันทึกการเข้าเยี่ยมใหม่
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">วันที่</th>
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3">ผู้เข้าเยี่ยม</th>
              <th className="font-medium px-4 py-3">ผู้ที่พบ</th>
              <th className="font-medium px-4 py-3">ผลการเยี่ยม</th>
              <th className="font-medium px-4 py-3">โอกาส</th>
              <th className="font-medium px-4 py-3">วันติดตามถัดไป</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const c = getCompanyById(v.companyId);
              return (
                <tr key={v.id} className="table-row-hover border-t border-iks-border">
                  <td className="px-4 py-3">{v.visitDate}</td>
                  <td className="px-4 py-3">
                    <Link href={`/company/${c?.id}`} className="text-iks-navy hover:underline">{c?.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.visitorName}</td>
                  <td className="px-4 py-3 text-gray-600">{v.attendeeName}</td>
                  <td className="px-4 py-3">{v.visitResult}</td>
                  <td className="px-4 py-3"><Badge value={v.opportunityLevel} small /></td>
                  <td className="px-4 py-3 text-gray-600">{v.nextFollowupDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
