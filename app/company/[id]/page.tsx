"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Badge from "@/components/Badge";
import StatCard from "@/components/StatCard";
import Whale from "@/components/Whale";
import {
  getCompanyById,
  getCompanyVehicles,
  getCompanyServiceRecords,
  getCompanyVisits,
  getCompanyTasks,
  companySummary,
  vehicleSummary,
  formatBaht,
} from "@/lib/mockData";
import {
  Truck,
  Wrench,
  Coins,
  Calendar,
  ClipboardCheck,
  ExternalLink,
  Phone,
  Mail,
  Star,
} from "lucide-react";

const TABS = ["ภาพรวม", "ข้อมูลบริษัท", "รถของบริษัท", "ประวัติการเข้าศูนย์", "ประวัติการเข้าเยี่ยม", "งานติดตาม"] as const;
type Tab = (typeof TABS)[number];

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const company = getCompanyById(params.id);
  const [tab, setTab] = useState<Tab>("ภาพรวม");

  if (!company) {
    return (
      <AppShell>
        <p className="text-gray-500">ไม่พบข้อมูลบริษัท</p>
      </AppShell>
    );
  }

  const summary = companySummary(company.id);
  const vehicles = getCompanyVehicles(company.id);
  const services = getCompanyServiceRecords(company.id).sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
  const visits = getCompanyVisits(company.id).sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1));
  const tasks = getCompanyTasks(company.id);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "บริษัท / ข้อมูลลูกค้า", href: "/company" }, { label: "Company Detail / Customer 360" }]} />

      {/* Header card */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5 mb-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-iks-navy/10 flex items-center justify-center text-iks-navy font-bold text-xl shrink-0">
              {company.name.charAt(4) || "บ"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-800">{company.name}</h1>
                <Badge value={company.iksPurchaseStatus} small />
              </div>
              <div className="text-xs text-gray-400 mt-1">เลขประจำตัวผู้เสียภาษี {company.taxId}</div>
              <div className="text-xs text-gray-400">{company.businessType}</div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>สาขา: {company.branch}</span>
                <span>เซลส์ผู้ดูแล: {company.salesOwner}</span>
                {company.customerGroup && <span>กลุ่มลูกค้า: {company.customerGroup}</span>}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-gray-400">Opportunity Level</div>
            <Badge value={company.opportunityLevel} />
            <div className="text-xs text-gray-400 mt-2">ลูกค้าตั้งแต่ {company.customerSince}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <StatCard icon={<Truck size={18} />} label="รถทั้งหมด" value={summary.totalVehicles} unit="คัน" />
        <StatCard icon={<Truck size={18} />} label="รถ IKS" value={summary.iksVehicles} unit="คัน" iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard icon={<Wrench size={18} />} label="ครั้งเข้าศูนย์รวม" value={summary.totalServiceCount} unit="ครั้ง" iconBg="bg-iks-copper/10" iconColor="text-iks-copper" />
        <StatCard icon={<Coins size={18} />} label="ยอดค่าใช้จ่ายรวม" value={"฿" + formatBaht(summary.totalServiceCost)} iconBg="bg-iks-copper/10" iconColor="text-iks-copper" />
        <StatCard icon={<Calendar size={18} />} label="เข้าเยี่ยมล่าสุด" value={summary.lastVisitDate || "-"} />
        <StatCard icon={<ClipboardCheck size={18} />} label="งานติดตามถัดไป" value={summary.nextTaskDate || "-"} iconBg="bg-red-50" iconColor="text-iks-red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-iks-border mb-5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t ? "border-iks-copper text-iks-navy font-semibold" : "border-transparent text-gray-500 hover:text-iks-navy"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "ภาพรวม" && <OverviewTab vehicles={vehicles} services={services} companyId={company.id} />}
      {tab === "ข้อมูลบริษัท" && <ProfileTab company={company} />}
      {tab === "รถของบริษัท" && <VehiclesTab vehicles={vehicles} companyId={company.id} />}
      {tab === "ประวัติการเข้าศูนย์" && <ServiceHistoryTab services={services} />}
      {tab === "ประวัติการเข้าเยี่ยม" && <VisitHistoryTab visits={visits} companyId={company.id} />}
      {tab === "งานติดตาม" && <FollowUpTab tasks={tasks} />}
    </AppShell>
  );
}

// ---------------- Overview Tab ----------------
function OverviewTab({ vehicles, services, companyId }: { vehicles: ReturnType<typeof getCompanyVehicles>; services: ReturnType<typeof getCompanyServiceRecords>; companyId: string }) {
  const byVehicleCount: Record<string, number> = {};
  services.forEach((s) => (byVehicleCount[s.vehicleId] = (byVehicleCount[s.vehicleId] || 0) + 1));
  const topVehicles = Object.entries(byVehicleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([vid, count]) => ({ v: vehicles.find((v) => v.id === vid)!, count }))
    .filter((x) => x.v);

  const typeCounts: Record<string, number> = {};
  services.forEach((s) => (typeCounts[s.serviceType] = (typeCounts[s.serviceType] || 0) + 1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">รถที่เข้าศูนย์บ่อยที่สุด</h3>
        <table className="w-full text-sm">
          <tbody>
            {topVehicles.map(({ v, count }) => (
              <tr key={v.id} className="border-t border-iks-border">
                <td className="py-2 text-gray-600">{v.vehicleModel}</td>
                <td className="py-2 text-right font-medium">{count} ครั้ง</td>
              </tr>
            ))}
            {topVehicles.length === 0 && <tr><td className="py-4 text-gray-400 text-center">ยังไม่มีประวัติ</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">สรุปประเภทงานซ่อม</h3>
        <div className="space-y-2">
          {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
            const pct = services.length ? Math.round((count / services.length) * 100) : 0;
            return (
              <div key={type}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{type}</span>
                  <span>{pct}% ({count})</span>
                </div>
                <div className="h-2 rounded-full bg-iks-surface overflow-hidden">
                  <div className="h-full bg-iks-navy rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {services.length === 0 && <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีประวัติ</p>}
        </div>
      </div>

      <div className="bg-gradient-to-b from-iks-navy to-iks-navyDark rounded-xl p-5 text-white flex flex-col items-center text-center">
        <Whale size={56} />
        <h3 className="font-semibold mt-3 mb-1">Customer View</h3>
        <p className="text-sm text-white/80 mb-4">ภาพรวมแรกที่ลูกค้าเห็น เกี่ยวกับบริษัทนี้</p>
        <Link
          href={`/customer-view/${companyId}`}
          target="_blank"
          className="bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5"
        >
          เปิด Customer View <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  );
}

// ---------------- Profile Tab ----------------
function ProfileTab({ company }: { company: NonNullable<ReturnType<typeof getCompanyById>> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <SectionCard title="1. ข้อมูลบริษัท (Company Information)">
        <Field label="ชื่อบริษัท" value={company.name} />
        <Field label="ที่อยู่" value={company.address} />
        <Field label="ประเภทธุรกิจ" value={company.businessType} />
        <Field label="เลขประจำตัวผู้เสียภาษี" value={company.taxId} />
        <Field label="สาขา" value={company.branch} />
      </SectionCard>

      <SectionCard title="2. ข้อมูลผู้ติดต่อ (Contact Information)">
        <Field label="ผู้ติดต่อหลัก" value="คุณสมชาย ใจดี" icon={<Phone size={13} />} />
        <Field label="ตำแหน่ง" value="ผู้จัดการฝ่ายจัดซื้อ" />
        <Field label="เบอร์โทร" value="081-234-5678" />
        <Field label="Email" value="contact@company.co.th" icon={<Mail size={13} />} />
        <Field label="LINE ID" value="@company_purchase" />
      </SectionCard>

      <SectionCard title="3. ข้อมูล Fleet (Fleet Information)">
        <Field label="จำนวนรถ Isuzu" value={`${companySummary(company.id).iksVehicles} คัน`} />
        <Field label="จำนวนรถยี่ห้ออื่น" value={`${companySummary(company.id).nonIksVehicles} คัน`} />
        <Field label="รอบการเปลี่ยนรถ" value="ทุก 5 ปี" />
        <Field label="เงื่อนไขการซื้อ" value="เช่าซื้อ / ลีสซิ่ง" />
        <Field label="ระยะเวลาที่ต้องการซื้อ" value="ไตรมาส 3 ปีถัดไป" />
      </SectionCard>

      <SectionCard title="4. การบำรุงรักษาและอะไหล่ (Maintenance & Parts)">
        <Field label="ศูนย์บริการที่ใช้ประจำ" value="IKS รามอินทรา" />
        <Field label="ความถี่ในการเข้าศูนย์" value="ทุก 45 วัน / คัน" />
        <Field label="อะไหล่ที่เปลี่ยนบ่อย" value="ผ้าเบรก, ยาง, แบตเตอรี่" />
        <Field label="ความพึงพอใจด้านบริการ" value="★★★★☆" />
      </SectionCard>

      <SectionCard title="5. ข้อมูลเพิ่มเติมและโอกาสทางการขาย">
        <Field label="ความสนใจรถรุ่นใหม่" value="MU-X, D-MAX SPC HR" />
        <Field label="โอกาสขายรถเพิ่ม" value={company.opportunityLevel} />
        <Field label="คู่แข่ง" value="Hino, Fuso" />
        <Field label="หมายเหตุภายใน" value="-" />
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
      <h3 className="font-semibold text-iks-navy text-sm mb-3 pb-2 border-b border-iks-border">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-gray-400 flex items-center gap-1 shrink-0">{icon}{label}</span>
      <span className="text-gray-700 text-right">{value}</span>
    </div>
  );
}

// ---------------- Vehicles Tab ----------------
function VehiclesTab({ vehicles, companyId }: { vehicles: ReturnType<typeof getCompanyVehicles>; companyId: string }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-iks-surface text-left text-gray-500 text-xs">
            <th className="font-medium px-4 py-3">ทะเบียน</th>
            <th className="font-medium px-4 py-3">รุ่นรถ</th>
            <th className="font-medium px-4 py-3">กลุ่มรถ</th>
            <th className="font-medium px-4 py-3">เลขเครื่อง / แชสซี</th>
            <th className="font-medium px-4 py-3 text-center">ซื้อกับ</th>
            <th className="font-medium px-4 py-3 text-center">ครั้งเข้าศูนย์</th>
            <th className="font-medium px-4 py-3">สถานะ</th>
            <th className="font-medium px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => {
            const vs = vehicleSummary(v.id);
            return (
              <tr key={v.id} className="table-row-hover border-t border-iks-border">
                <td className="px-4 py-3 font-medium text-gray-800">{v.registrationNumber}</td>
                <td className="px-4 py-3 text-gray-600">{v.vehicleModel}</td>
                <td className="px-4 py-3 text-gray-600">
                  {v.vehicleGroup}
                  {v.vehicleSubtype !== "-" && <span className="text-gray-400"> · {v.vehicleSubtype}</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{v.engineNumber}<br />{v.chassisNumber}</td>
                <td className="px-4 py-3 text-center"><Badge value={v.ownershipStatus} small /></td>
                <td className="px-4 py-3 text-center">{vs.serviceCount}</td>
                <td className="px-4 py-3"><Badge value={v.vehicleStatus} small /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/company/${companyId}/vehicle/${v.id}`} className="text-iks-navy text-xs font-medium border border-iks-navy/30 rounded-lg px-3 py-1.5 hover:bg-iks-navy hover:text-white transition-colors">
                    ดูรายละเอียดรถ
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------- Service History Tab ----------------
function ServiceHistoryTab({ services }: { services: ReturnType<typeof getCompanyServiceRecords> }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-iks-surface text-left text-gray-500 text-xs">
            <th className="font-medium px-4 py-3">วันที่</th>
            <th className="font-medium px-4 py-3">เลข RO</th>
            <th className="font-medium px-4 py-3">ประเภทงาน</th>
            <th className="font-medium px-4 py-3">รายละเอียด</th>
            <th className="font-medium px-4 py-3">ศูนย์บริการ</th>
            <th className="font-medium px-4 py-3 text-right">ระยะไมล์</th>
            <th className="font-medium px-4 py-3 text-right">ยอดค่าใช้จ่าย</th>
          </tr>
        </thead>
        <tbody>
          {services.slice(0, 30).map((s) => (
            <tr key={s.id} className="table-row-hover border-t border-iks-border">
              <td className="px-4 py-3">{s.serviceDate}</td>
              <td className="px-4 py-3 text-iks-navy">{s.roNumber}</td>
              <td className="px-4 py-3">{s.serviceType}</td>
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{s.serviceDetail}</td>
              <td className="px-4 py-3 text-gray-600">{s.serviceCenter}</td>
              <td className="px-4 py-3 text-right">{formatBaht(s.mileage)} กม.</td>
              <td className="px-4 py-3 text-right font-medium">฿{formatBaht(s.totalCost)}</td>
            </tr>
          ))}
          {services.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">ยังไม่มีประวัติการเข้าศูนย์บริษัทนี้</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------- Visit History Tab ----------------
function VisitHistoryTab({ visits, companyId }: { visits: ReturnType<typeof getCompanyVisits>; companyId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href={`/visit-log/new?company=${companyId}`} className="bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-4 py-2 text-sm font-medium">
          + บันทึกการเข้าเยี่ยมใหม่
        </Link>
      </div>
      {visits.map((v) => (
        <div key={v.id} className="bg-white rounded-xl shadow-card border border-iks-border p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-medium text-gray-800">{v.visitDate} — {v.objective}</div>
              <div className="text-xs text-gray-400">ผู้เข้าเยี่ยม: {v.visitorName} | พบ: {v.attendeeName} ({v.attendeePosition})</div>
            </div>
            <Badge value={v.opportunityLevel} small />
          </div>
          <p className="text-sm text-gray-600 mb-2">{v.discussionSummary}</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 border-t border-iks-border pt-2 mt-2">
            <span>ผลการเยี่ยม: <b className="text-gray-700">{v.visitResult}</b></span>
            <span>งานติดตาม: <b className="text-gray-700">{v.nextAction}</b></span>
            <span>วันติดตามถัดไป: <b className="text-gray-700">{v.nextFollowupDate}</b></span>
          </div>
        </div>
      ))}
      {visits.length === 0 && (
        <div className="bg-white rounded-xl shadow-card border border-iks-border p-10 text-center text-gray-400 flex flex-col items-center gap-3">
          <Whale size={48} />
          ยังไม่มีประวัติการเข้าเยี่ยมบริษัทนี้
        </div>
      )}
    </div>
  );
}

// ---------------- Follow-up Tab ----------------
function FollowUpTab({ tasks }: { tasks: ReturnType<typeof getCompanyTasks> }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
      <div className="flex justify-end p-4 border-b border-iks-border">
        <button className="bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-4 py-2 text-sm font-medium">+ สร้างงานใหม่</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-iks-surface text-left text-gray-500 text-xs">
            <th className="font-medium px-4 py-3">งาน</th>
            <th className="font-medium px-4 py-3">ผู้รับผิดชอบ</th>
            <th className="font-medium px-4 py-3">วันครบกำหนด</th>
            <th className="font-medium px-4 py-3">ความสำคัญ</th>
            <th className="font-medium px-4 py-3">สถานะ</th>
            <th className="font-medium px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="table-row-hover border-t border-iks-border">
              <td className="px-4 py-3">{t.taskTitle}</td>
              <td className="px-4 py-3 text-gray-600">{t.assignedTo}</td>
              <td className="px-4 py-3 text-gray-600">{t.dueDate}</td>
              <td className="px-4 py-3"><Badge value={t.priority} small /></td>
              <td className="px-4 py-3"><Badge value={t.status} small /></td>
              <td className="px-4 py-3 text-right">
                {t.status !== "เสร็จสิ้น" && (
                  <button className="text-iks-navy text-xs font-medium border border-iks-navy/30 rounded-lg px-3 py-1.5 hover:bg-iks-navy hover:text-white transition-colors">
                    ปิดงาน
                  </button>
                )}
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">ยังไม่มีงานติดตามบริษัทนี้</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
