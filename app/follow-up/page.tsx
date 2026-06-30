"use client";

import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Badge from "@/components/Badge";
import { followUpTasks, getCompanyById } from "@/lib/mockData";
import Link from "next/link";

export default function FollowUpListPage() {
  const rows = [...followUpTasks].sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "งานติดตาม" }]} />
      <h1 className="text-xl font-bold text-gray-800 mb-5">งานติดตาม</h1>

      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-4 py-3">งาน</th>
              <th className="font-medium px-4 py-3">บริษัท</th>
              <th className="font-medium px-4 py-3">ผู้รับผิดชอบ</th>
              <th className="font-medium px-4 py-3">วันครบกำหนด</th>
              <th className="font-medium px-4 py-3">ความสำคัญ</th>
              <th className="font-medium px-4 py-3">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const c = getCompanyById(t.companyId);
              return (
                <tr key={t.id} className="table-row-hover border-t border-iks-border">
                  <td className="px-4 py-3">{t.taskTitle}</td>
                  <td className="px-4 py-3">
                    <Link href={`/company/${c?.id}`} className="text-iks-navy hover:underline">{c?.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.assignedTo}</td>
                  <td className="px-4 py-3 text-gray-600">{t.dueDate}</td>
                  <td className="px-4 py-3"><Badge value={t.priority} small /></td>
                  <td className="px-4 py-3"><Badge value={t.status} small /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
