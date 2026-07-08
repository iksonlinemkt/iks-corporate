"use client";

import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import Whale from "@/components/Whale";
import Badge from "@/components/Badge";
import {
  companies,
  vehicles,
  serviceRecords,
  followUpTasks,
  visitLogs,
  formatBaht,
  companySummary,
} from "@/lib/mockData";
import {
  Building2,
  Users,
  MessageSquare,
  Truck,
  Wrench,
  Coins,
  ClipboardCheck,
  Star,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const totalCompanies = companies.length;
  const iksCustomers = companies.filter((c) => c.iksPurchaseStatus === "IKS_CUSTOMER").length;
  const nonIksServiced = companies.filter((c) => c.iksPurchaseStatus === "NON_IKS_CUSTOMER").length;
  const totalVehicles = vehicles.length;
  const totalServiceVisits = new Set(serviceRecords.map((s) => s.roNumber)).size;
  const totalCost = serviceRecords.reduce((s, r) => s + r.totalCost, 0);
  const pendingTasks = followUpTasks.filter((t) => t.status !== "เสร็จสิ้น").length;
  const hotCompanies = companies.filter((c) => c.opportunityLevel === "HOT").length;

  const topServiceCompanies = companies
    .map((c) => ({ c, s: companySummary(c.id) }))
    .sort((a, b) => b.s.totalServiceCount - a.s.totalServiceCount)
    .slice(0, 5);

  const topCostCompanies = [...topServiceCompanies].sort((a, b) => b.s.totalServiceCost - a.s.totalServiceCost).slice(0, 5);

  const upcomingTasks = followUpTasks
    .filter((t) => t.status !== "เสร็จสิ้น")
    .slice(0, 5)
    .map((t) => ({ t, c: companies.find((c) => c.id === t.companyId)! }));

  const recentVisits = [...visitLogs]
    .sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1))
    .slice(0, 5)
    .map((v) => ({ v, c: companies.find((c) => c.id === v.companyId)! }));

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "Dashboard" }]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Building2 size={20} />} label="จำนวนบริษัททั้งหมด" value={totalCompanies} unit="บริษัท" trend="8%" trendLabel="จากเดือนก่อน" />
        <StatCard icon={<Users size={20} />} label="ลูกค้าที่ซื้อรถกับ IKS" value={iksCustomers} unit="บริษัท" trend="6%" trendLabel="จากเดือนก่อน" iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard icon={<MessageSquare size={20} />} label="ลูกค้าที่เข้าศูนย์แต่ไม่ซื้อกับ IKS" value={nonIksServiced} unit="บริษัท" trend="10%" trendLabel="จากเดือนก่อน" iconBg="bg-orange-50" iconColor="text-orange-600" />
        <StatCard icon={<Truck size={20} />} label="รถทั้งหมด" value={totalVehicles} unit="คัน" trend="7%" trendLabel="จากเดือนก่อน" />
        <StatCard icon={<Wrench size={20} />} label="จำนวนครั้งเข้าศูนย์รวม" value={formatBaht(totalServiceVisits)} unit="ครั้ง" trend="9%" trendLabel="จากเดือนก่อน" iconBg="bg-iks-copper/10" iconColor="text-iks-copper" />
        <StatCard icon={<Coins size={20} />} label="ยอดค่าใช้จ่ายรวม" value={"฿" + formatBaht(totalCost)} trend="11%" trendLabel="จากเดือนก่อน" iconBg="bg-iks-copper/10" iconColor="text-iks-copper" />
        <StatCard icon={<ClipboardCheck size={20} />} label="งานติดตามใกล้ถึงกำหนด" value={pendingTasks} unit="งาน" iconBg="bg-red-50" iconColor="text-iks-red" />
        <StatCard icon={<Star size={20} />} label="บริษัทที่ควรเข้าเยี่ยม (HOT)" value={hotCompanies} unit="บริษัท" iconBg="bg-yellow-50" iconColor="text-yellow-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Panel title="บริษัทที่เข้าศูนย์บริการบ่อยที่สุด (Top 5)" href="/customers/serviced">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs">
                    <th className="font-normal pb-2">#</th>
                    <th className="font-normal pb-2">ชื่อบริษัท</th>
                    <th className="font-normal pb-2 text-right">ครั้ง</th>
                  </tr>
                </thead>
                <tbody>
                  {topServiceCompanies.map(({ c, s }, i) => (
                    <tr key={c.id} className="table-row-hover border-t border-iks-border">
                      <td className="py-2 text-gray-400">{i + 1}</td>
                      <td className="py-2">
                        <Link href={`/company/${c.id}`} className="text-iks-navy hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-2 text-right font-medium">{s.totalServiceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <Panel title="บริษัทที่มียอดค่าใช้จ่ายศูนย์บริการสูงสุด (Top 5)" href="/customers/serviced">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs">
                    <th className="font-normal pb-2">#</th>
                    <th className="font-normal pb-2">ชื่อบริษัท</th>
                    <th className="font-normal pb-2 text-right">ยอดสะสม</th>
                  </tr>
                </thead>
                <tbody>
                  {topCostCompanies.map(({ c, s }, i) => (
                    <tr key={c.id} className="table-row-hover border-t border-iks-border">
                      <td className="py-2 text-gray-400">{i + 1}</td>
                      <td className="py-2">
                        <Link href={`/company/${c.id}`} className="text-iks-navy hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-2 text-right font-medium">฿{formatBaht(s.totalServiceCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>

          <Panel title="งานติดตามใกล้ถึงกำหนด" href="/follow-up">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs">
                  <th className="font-normal pb-2">กำหนดวันที่</th>
                  <th className="font-normal pb-2">ชื่องาน</th>
                  <th className="font-normal pb-2">บริษัท</th>
                  <th className="font-normal pb-2">ผู้รับผิดชอบ</th>
                  <th className="font-normal pb-2">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTasks.map(({ t, c }) => (
                  <tr key={t.id} className="table-row-hover border-t border-iks-border">
                    <td className="py-2.5">{t.dueDate}</td>
                    <td className="py-2.5">{t.taskTitle}</td>
                    <td className="py-2.5">
                      <Link href={`/company/${c.id}`} className="text-iks-navy hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-2.5">{t.assignedTo}</td>
                    <td className="py-2.5">
                      <Badge value={t.status} small />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="บันทึกการเข้าเยี่ยมล่าสุด" href="/visit-log">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs">
                  <th className="font-normal pb-2">วันที่เข้าเยี่ยม</th>
                  <th className="font-normal pb-2">บริษัท</th>
                  <th className="font-normal pb-2">ผู้เข้าเยี่ยม</th>
                  <th className="font-normal pb-2">ผลการเยี่ยม</th>
                  <th className="font-normal pb-2">โอกาส</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map(({ v, c }) => (
                  <tr key={v.id} className="table-row-hover border-t border-iks-border">
                    <td className="py-2.5">{v.visitDate}</td>
                    <td className="py-2.5">
                      <Link href={`/company/${c.id}`} className="text-iks-navy hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-2.5">{v.visitorName}</td>
                    <td className="py-2.5">{v.visitResult}</td>
                    <td className="py-2.5">
                      <Badge value={v.opportunityLevel} small />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <div className="space-y-5">
          <div className="bg-gradient-to-b from-iks-navy to-iks-navyDark rounded-xl p-5 text-white">
            <div className="flex justify-center mb-3">
              <Whale size={64} />
            </div>
            <div className="font-semibold text-center mb-1">✨ ผู้ช่วย IKS</div>
            <p className="text-sm text-white/85 text-center leading-relaxed">
              สวัสดีครับ! วันนี้มี {pendingTasks} งานที่ใกล้ถึงกำหนด และมี {hotCompanies} บริษัทที่แนะนำให้เข้าเยี่ยม
              อย่าลืมติดตามลูกค้าก่อนครบกำหนดนะครับ 😊
            </p>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <Link
                href="/visit-log/new"
                className="bg-iks-copper hover:bg-iks-copperDark text-center rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                + เพิ่มงานติดตาม
              </Link>
              <Link
                href="/visit-log/new"
                className="bg-white/10 hover:bg-white/20 text-center rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                วางแผนการเข้าเยี่ยม
              </Link>
            </div>
          </div>

          <Panel title="ลูกค้าที่ควรเข้าเยี่ยม" href="/customers/purchased">
            <div className="space-y-2">
              {companies
                .filter((c) => c.opportunityLevel === "HOT")
                .slice(0, 5)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/company/${c.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-iks-surface border border-iks-border"
                  >
                    <span className="text-sm text-gray-700 truncate pr-2">{c.name}</span>
                    <Badge value={c.opportunityLevel} small />
                  </Link>
                ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        <Link href={href} className="text-xs text-iks-navy hover:underline flex items-center gap-1">
          ดูทั้งหมด <ArrowRight size={12} />
        </Link>
      </div>
      {children}
    </div>
  );
}
