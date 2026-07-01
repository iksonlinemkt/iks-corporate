"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Badge from "@/components/Badge";
import StatCard from "@/components/StatCard";
import Whale from "@/components/Whale";
import {
  getCompanyById, getCompanyVehicles, getCompanyServiceRecords,
  getCompanyVisits, getCompanyTasks, getCompanyExecutives,
  companySummary, vehicleSummary, formatBaht,
} from "@/lib/mockData";
import { Truck, Wrench, Coins, Calendar, ClipboardCheck, ExternalLink, Phone, Mail, Star, User, Table2, GitCommitVertical } from "lucide-react";

const TABS = ["ภาพรวม","ข้อมูลบริษัท","รถของบริษัท","ประวัติการเข้าศูนย์","ประวัติการเข้าเยี่ยม","งานติดตาม"] as const;
type Tab = (typeof TABS)[number];

const TAB_PARAM: Record<string,Tab> = { profile: "ข้อมูลบริษัท", overview: "ภาพรวม", vehicles: "รถของบริษัท", service: "ประวัติการเข้าศูนย์", visits: "ประวัติการเข้าเยี่ยม", tasks: "งานติดตาม" };

export default function CompanyDetailPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}

function Inner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const company = getCompanyById(params.id);
  const initTab: Tab = TAB_PARAM[searchParams.get("tab") || ""] || "ภาพรวม";
  const [tab, setTab] = useState<Tab>(initTab);

  useEffect(() => {
    const t = TAB_PARAM[searchParams.get("tab") || ""];
    if (t) setTab(t);
  }, [searchParams]);

  if (!company) return <AppShell><p className="text-gray-500">ไม่พบข้อมูลบริษัท</p></AppShell>;

  const summary = companySummary(company.id);
  const vehicles = getCompanyVehicles(company.id);
  const services = getCompanyServiceRecords(company.id).sort((a,b) => a.serviceDateISO < b.serviceDateISO ? 1 : -1);
  const visits = getCompanyVisits(company.id).sort((a,b) => a.visitDate < b.visitDate ? 1 : -1);
  const tasks = getCompanyTasks(company.id);
  const execs = getCompanyExecutives(company.id);

  return (
    <AppShell>
      <Breadcrumb items={[{ label:"บริษัท / ข้อมูลลูกค้า", href:"/company" },{ label:"Company Detail / Customer 360" }]} />

      {/* Header */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5 mb-4">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-iks-navy/10 flex items-center justify-center text-iks-navy font-bold text-xl shrink-0">
              {company.name.charAt(4) || "บ"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-800">{company.name}</h1>
                <Badge value={company.iksPurchaseStatus} small />
                {company.customerGrade && <span className="text-xs bg-iks-navy text-white px-2 py-0.5 rounded-full">เกรด {company.customerGrade}</span>}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">เลขประจำตัวผู้เสียภาษี {company.taxId} · {company.businessType}</div>
              <div className="flex gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                <span>สาขา: <b className="text-gray-700">{company.branch}</b></span>
                <span>เซลส์/SC: <b className="text-gray-700">{company.salesOwner}</b></span>
                {company.customerGroup && <span>กลุ่ม: <b className="text-gray-700">{company.customerGroup}</b></span>}
                {company.customerSince && <span>ลูกค้าตั้งแต่: <b className="text-gray-700">{company.customerSince}</b></span>}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <Badge value={company.opportunityLevel} />
            <div className="mt-2 flex gap-2 justify-end">
              <Link href={`/visit-log/new?company=${company.id}`} className="bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-3 py-1.5 text-xs font-medium">+ บันทึกเข้าเยี่ยม</Link>
              <Link href={`/customer-view/${company.id}`} target="_blank" className="bg-iks-navy hover:bg-iks-navyLight text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1">Customer View <ExternalLink size={11} /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <StatCard icon={<Truck size={18}/>} label="รถทั้งหมด" value={summary.totalVehicles} unit="คัน" />
        <StatCard icon={<Truck size={18}/>} label="รถ IKS" value={summary.iksVehicles} unit="คัน" iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard icon={<Wrench size={18}/>} label="ครั้งเข้าศูนย์รวม" value={summary.totalServiceCount} unit="ครั้ง" iconBg="bg-iks-copper/10" iconColor="text-iks-copper" />
        <StatCard icon={<Coins size={18}/>} label="ยอดค่าใช้จ่าย" value={"฿"+formatBaht(summary.totalServiceCost)} iconBg="bg-iks-copper/10" iconColor="text-iks-copper" />
        <StatCard icon={<Calendar size={18}/>} label="เข้าเยี่ยมล่าสุด" value={summary.lastVisitDate || "-"} />
        <StatCard icon={<ClipboardCheck size={18}/>} label="งานติดตามถัดไป" value={summary.nextTaskDate || "-"} iconBg="bg-red-50" iconColor="text-iks-red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-iks-border mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab===t ? "border-iks-copper text-iks-navy font-semibold" : "border-transparent text-gray-500 hover:text-iks-navy"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "ภาพรวม" && <OverviewTab vehicles={vehicles} services={services} companyId={company.id} />}
      {tab === "ข้อมูลบริษัท" && <ProfileTab company={company} execs={execs} />}
      {tab === "รถของบริษัท" && <VehiclesTab vehicles={vehicles} companyId={company.id} />}
      {tab === "ประวัติการเข้าศูนย์" && <ServiceHistoryTab services={services} vehicles={vehicles} />}
      {tab === "ประวัติการเข้าเยี่ยม" && <VisitHistoryTab visits={visits} companyId={company.id} />}
      {tab === "งานติดตาม" && <FollowUpTab tasks={tasks} />}
    </AppShell>
  );
}

// ─── Overview ────────────────────────────────────────────────
function OverviewTab({ vehicles, services, companyId }: any) {
  const byVehicleCount: Record<string,number> = {};
  services.forEach((s: any) => (byVehicleCount[s.vehicleId] = (byVehicleCount[s.vehicleId]||0)+1));
  const topVehicles = Object.entries(byVehicleCount).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([vid,count]) => ({ v: vehicles.find((v: any) => v.id === vid), count })).filter((x: any) => x.v);

  const typeCounts: Record<string,number> = {};
  services.forEach((s: any) => (typeCounts[s.serviceType]=(typeCounts[s.serviceType]||0)+1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">รถที่เข้าศูนย์บ่อยที่สุด</h3>
        <table className="w-full text-sm">
          <tbody>
            {topVehicles.map(({ v, count }: any) => (
              <tr key={v.id} className="border-t border-iks-border">
                <td className="py-2 text-gray-600">{v.vehicleModel}</td>
                <td className="py-2 text-gray-400 text-xs">{v.registrationNumber}</td>
                <td className="py-2 text-right font-medium">{count} ครั้ง</td>
              </tr>
            ))}
            {topVehicles.length===0 && <tr><td className="py-4 text-gray-400 text-center">ยังไม่มีประวัติ</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">สรุปประเภทงานซ่อม</h3>
        <div className="space-y-2">
          {Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]).map(([type,count]) => {
            const pct = services.length ? Math.round((count/services.length)*100) : 0;
            return (
              <div key={type}>
                <div className="flex justify-between text-xs text-gray-600 mb-1"><span>{type}</span><span>{pct}% ({count})</span></div>
                <div className="h-2 rounded-full bg-iks-surface overflow-hidden">
                  <div className="h-full bg-iks-navy rounded-full" style={{ width:`${pct}%` }} />
                </div>
              </div>
            );
          })}
          {services.length===0 && <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีประวัติ</p>}
        </div>
      </div>
      <div className="bg-gradient-to-b from-iks-navy to-iks-navyDark rounded-xl p-5 text-white flex flex-col items-center text-center">
        <Whale size={56} />
        <h3 className="font-semibold mt-3 mb-1">Customer View</h3>
        <p className="text-sm text-white/80 mb-4">ภาพรวมที่เปิดให้ลูกค้าดูระหว่างเข้าเยี่ยม</p>
        <Link href={`/customer-view/${companyId}`} target="_blank"
          className="bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5">
          เปิด Customer View <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────
function ProfileTab({ company, execs }: { company: any; execs: any[] }) {
  return (
    <div className="space-y-4">
      {/* Section 1 */}
      <SectionCard num="1" title="ข้อมูลบริษัท (Company Information)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <Field label="ชื่อบริษัท" value={company.name} />
          <Field label="ที่อยู่" value={company.address} />
          <Field label="ประเภทธุรกิจ" value={company.businessType} />
          <Field label="ลักษณะธุรกิจ" value={company.businessDescription || "บริการขนส่งสินค้าทางบก ทั้งในและต่างประเทศ"} />
          <Field label="เลขประจำตัวผู้เสียภาษี" value={company.taxId} />
          <Field label="สาขา" value={company.branch} />
          <Field label="SC / เซลส์ผู้ดูแล" value={company.salesOwner} />
          <Field label="เกรดลูกค้า" value={company.customerGrade || "-"} />
        </div>
      </SectionCard>

      {/* Section 2 — Executives table */}
      <SectionCard num="2" title="ข้อมูลผู้ติดต่อ / ผู้บริหาร (Contact Information)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-iks-surface text-left text-xs text-gray-500">
                <th className="font-medium px-3 py-2 rounded-tl-lg">ชื่อผู้บริหาร</th>
                <th className="font-medium px-3 py-2">ตำแหน่ง</th>
                <th className="font-medium px-3 py-2">เบอร์โทร</th>
                <th className="font-medium px-3 py-2">LINE ID</th>
                <th className="font-medium px-3 py-2">Email</th>
                <th className="font-medium px-3 py-2">วันเกิด</th>
                <th className="font-medium px-3 py-2 rounded-tr-lg">งานอดิเรก</th>
              </tr>
            </thead>
            <tbody>
              {execs.map((e, i) => (
                <tr key={e.id} className={`border-t border-iks-border ${e.isPrimary ? "bg-iks-navy/5" : ""}`}>
                  <td className="px-3 py-2.5 font-medium text-gray-800 flex items-center gap-1.5">
                    {e.isPrimary && <span className="text-[10px] bg-iks-navy text-white px-1.5 py-0.5 rounded">หลัก</span>}
                    {e.name}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{e.position}</td>
                  <td className="px-3 py-2.5 text-gray-600">{e.phone}</td>
                  <td className="px-3 py-2.5 text-gray-500">{e.lineId || "-"}</td>
                  <td className="px-3 py-2.5 text-gray-500">{e.email || "-"}</td>
                  <td className="px-3 py-2.5 text-gray-500">{e.birthday || "-"}</td>
                  <td className="px-3 py-2.5 text-gray-500">{e.hobby || "-"}</td>
                </tr>
              ))}
              {execs.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">ยังไม่มีข้อมูลผู้ติดต่อ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Section 3 — Fleet */}
      <SectionCard num="3" title="ข้อมูลรถ (Fleet Information)">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
          <Field label="จำนวนรถใหญ่ (Isuzu)" value={`${company.truckCount || 0} คัน`} />
          <Field label="จำนวนรถยนต์นั่ง" value={`${company.sedanCount || 0} คัน`} />
          <Field label="จำนวนรถ PICK UP" value={`${company.pickupCount || 0} คัน`} />
          <Field label="รถยี่ห้ออื่น" value={company.otherBrand || "-"} />
          <Field label="เส้นทางวิ่งประจำ" value={company.routeDescription || "-"} />
          <Field label="รอบการเปลี่ยนรถ" value={company.replacementCycle || "-"} />
          <Field label="เงื่อนไขการซื้อ" value={company.purchaseCondition || "-"} />
          <Field label="ต้องการซื้อรถเพิ่ม" value={company.vehicleNeedCount ? `${company.vehicleNeedCount} คัน` : "-"} />
          <Field label="ระยะที่ต้องการซื้อ" value={company.vehicleNeedPeriod || "-"} />
          <Field label="นำรถมาซ่อมที่ IKS" value={company.bringToService ? `${company.bringToService} คัน` : "-"} />
        </div>
      </SectionCard>

      {/* Section 4 — Maintenance */}
      <SectionCard num="4" title="ข้อมูลการบำรุงรักษาและอะไหล่ (Maintenance & Parts)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <Field label="ศูนย์บริการที่ใช้ประจำ" value={company.preferredServiceCenter || "-"} />
          <Field label="ความถี่ในการเข้าศูนย์" value={company.serviceFrequency || "-"} />
          <Field label="น้ำมันเครื่องที่ใช้" value={company.oilBrand || "-"} />
          <Field label="ยางที่ใช้" value={company.tyreBrand || "-"} />
        </div>
      </SectionCard>

      {/* Section 5 — Opportunity */}
      <SectionCard num="5" title="ข้อมูลเพิ่มเติมและโอกาสทางการขาย (Additional Info & Opportunities)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <Field label="ความสนใจพิเศษ (HOT)" value={company.hotInterest || "-"} />
          <Field label="Pain Point / ปัจจัยตัดสินใจ" value={company.painPoint || "-"} />
          <Field label="สมาชิกสมาคม / Club" value={company.clubMember || "-"} />
          <Field label="หมายเหตุภายใน" value={company.internalNote || "-"} />
        </div>
      </SectionCard>
    </div>
  );
}

function SectionCard({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-iks-border">
        <span className="w-6 h-6 rounded-full bg-iks-navy text-white text-xs flex items-center justify-center font-bold shrink-0">{num}</span>
        <h3 className="font-semibold text-iks-navy text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm py-0.5">
      <span className="text-gray-400 shrink-0 min-w-[130px]">{label}</span>
      <span className="text-gray-700 text-right">{value}</span>
    </div>
  );
}

// ─── Vehicles Tab ─────────────────────────────────────────────
function VehiclesTab({ vehicles, companyId }: any) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-iks-surface text-left text-gray-500 text-xs">
            <th className="font-medium px-4 py-3">ทะเบียน</th>
            <th className="font-medium px-4 py-3">รุ่นรถ</th>
            <th className="font-medium px-4 py-3">กลุ่มรถ</th>
            <th className="font-medium px-4 py-3">เลขเครื่อง / แชสซี</th>
            <th className="font-medium px-4 py-3">ผู้ใช้รถ</th>
            <th className="font-medium px-4 py-3 text-center">ซื้อกับ</th>
            <th className="font-medium px-4 py-3 text-center">ครั้งเข้าศูนย์</th>
            <th className="font-medium px-4 py-3">สถานะ</th>
            <th className="font-medium px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v: any) => {
            const vs = vehicleSummary(v.id);
            return (
              <tr key={v.id} className="table-row-hover border-t border-iks-border">
                <td className="px-4 py-3 font-medium text-gray-800">{v.registrationNumber}</td>
                <td className="px-4 py-3 text-gray-600">{v.vehicleModel}</td>
                <td className="px-4 py-3 text-gray-600">{v.vehicleGroup}{v.vehicleSubtype!=="-" && <span className="text-gray-400"> · {v.vehicleSubtype}</span>}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{v.engineNumber}<br/>{v.chassisNumber}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{v.driverName || "-"}<br/>{v.driverPhone && <span className="text-gray-400">{v.driverPhone}</span>}</td>
                <td className="px-4 py-3 text-center"><Badge value={v.ownershipStatus} small /></td>
                <td className="px-4 py-3 text-center">{vs.serviceCount}</td>
                <td className="px-4 py-3"><Badge value={v.vehicleStatus} small /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/company/${companyId}/vehicle/${v.id}`} className="text-iks-navy text-xs font-medium border border-iks-navy/30 rounded-lg px-3 py-1.5 hover:bg-iks-navy hover:text-white transition-colors">ดูรายละเอียดรถ</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Service History with Calendar view ───────────────────────
const MONTH_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const YEAR_COLORS: Record<number, string> = {
  2024: "bg-yellow-200 text-yellow-900",
  2025: "bg-sky-200 text-sky-900",
  2026: "bg-amber-800/20 text-amber-900",
};
const YEARS = [2024, 2025, 2026];

function ServiceHistoryTab({ services, vehicles }: any) {
  const [view, setView] = useState<"table" | "calendar">("table");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setView("table")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${view==="table" ? "bg-iks-navy text-white border-iks-navy" : "bg-white text-gray-600 border-iks-border"}`}>
          <Table2 size={14}/> ตาราง
        </button>
        <button onClick={() => setView("calendar")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${view==="calendar" ? "bg-iks-navy text-white border-iks-navy" : "bg-white text-gray-600 border-iks-border"}`}>
          <Calendar size={14}/> ปฏิทินรายปี
        </button>
      </div>
      {view==="table" ? <ServiceTable services={services} /> : <ServiceCalendar vehicles={vehicles} services={services} />}
    </div>
  );
}

function ServiceTable({ services }: any) {
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
          {services.slice(0,40).map((s: any) => (
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
          {services.length===0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">ยังไม่มีประวัติการเข้าศูนย์</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ServiceCalendar({ vehicles, services }: any) {
  // Build map: vehicleId → year → month[] (list of day strings)
  const calMap: Record<string, Record<number, Record<number, string[]>>> = {};
  vehicles.forEach((v: any) => {
    calMap[v.id] = {};
    YEARS.forEach(y => { calMap[v.id][y] = {}; for(let m=0;m<12;m++) calMap[v.id][y][m]=[]; });
  });
  services.forEach((s: any) => {
    if (!s.serviceDateISO) return;
    const d = new Date(s.serviceDateISO);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate().toString();
    if (calMap[s.vehicleId]?.[y]?.[m] !== undefined) {
      if (!calMap[s.vehicleId][y][m].includes(day)) calMap[s.vehicleId][y][m].push(day);
    }
  });

  // Average visits per vehicle per year
  function avgVisits(vehicleId: string) {
    const srs = services.filter((s: any) => s.vehicleId === vehicleId);
    if (!srs.length) return "-";
    const roSet = new Set(srs.map((s: any) => s.roNumber));
    return (roSet.size / 3).toFixed(1) + " ครั้ง/ปี";
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Legend */}
        <div className="flex gap-4 px-4 py-3 border-b border-iks-border text-xs text-gray-500">
          {YEARS.map(y => (
            <div key={y} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${YEAR_COLORS[y]?.split(" ")[0]}`}/>
              <span>{y + 543} (พ.ศ. {y + 543})</span>
            </div>
          ))}
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-iks-navy text-white">
              <th className="px-3 py-2 text-left w-8 font-medium">ลำดับ</th>
              <th className="px-3 py-2 text-left w-10 font-medium">ปี พ.ศ.</th>
              <th className="px-3 py-2 text-left w-28 font-medium">ทะเบียนรถ</th>
              {MONTH_SHORT.map(m => <th key={m} className="px-2 py-2 font-medium text-center w-16">{m}</th>)}
              <th className="px-3 py-2 text-center font-medium">เฉลี่ยรอบ</th>
              <th className="px-3 py-2 text-left font-medium min-w-[100px]">ผู้ใช้รถ</th>
              <th className="px-3 py-2 text-left font-medium">เบอร์โทร</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v: any, vi: number) => (
              YEARS.map((year, yi) => (
                <tr key={`${v.id}-${year}`} className={`border-b border-iks-border ${yi===0 ? "border-t-2 border-t-gray-300" : ""}`}>
                  {yi===0 && <td className="px-3 py-1.5 text-gray-500 font-medium text-center" rowSpan={3}>{vi+1}</td>}
                  <td className={`px-3 py-1.5 font-medium text-center ${YEAR_COLORS[year]?.split(" ")[0]} ${YEAR_COLORS[year]?.split(" ")[1]}`}>{year+543}</td>
                  {yi===0 && (
                    <td className="px-3 py-1.5 text-iks-navy font-medium" rowSpan={3}>
                      <div>{v.registrationNumber}</div>
                      <div className="text-gray-400 font-normal">{v.vehicleModel}</div>
                    </td>
                  )}
                  {Array.from({length:12},(_,mi) => {
                    const days = calMap[v.id]?.[year]?.[mi] || [];
                    return (
                      <td key={mi} className="px-1 py-1 text-center border-l border-iks-border">
                        {days.length > 0 ? (
                          <div className={`rounded px-1 py-0.5 font-medium ${YEAR_COLORS[year]}`}>
                            {days.join(", ")}
                          </div>
                        ) : ""}
                      </td>
                    );
                  })}
                  {yi===0 && <td className="px-3 py-1.5 text-center text-gray-600 font-medium" rowSpan={3}>{avgVisits(v.id)}</td>}
                  {yi===0 && <td className="px-3 py-1.5 text-gray-600" rowSpan={3}>{v.driverName || "-"}</td>}
                  {yi===0 && <td className="px-3 py-1.5 text-gray-500" rowSpan={3}>{v.driverPhone || "-"}</td>}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Visit History ────────────────────────────────────────────
function VisitHistoryTab({ visits, companyId }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href={`/visit-log/new?company=${companyId}`} className="bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-4 py-2 text-sm font-medium">
          + บันทึกการเข้าเยี่ยมใหม่
        </Link>
      </div>
      {visits.map((v: any) => (
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
      {visits.length===0 && (
        <div className="bg-white rounded-xl shadow-card border border-iks-border p-10 text-center text-gray-400 flex flex-col items-center gap-3">
          <Whale size={48} />
          ยังไม่มีประวัติการเข้าเยี่ยมบริษัทนี้
        </div>
      )}
    </div>
  );
}

// ─── Follow-up ────────────────────────────────────────────────
function FollowUpTab({ tasks }: any) {
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
          {tasks.map((t: any) => (
            <tr key={t.id} className="table-row-hover border-t border-iks-border">
              <td className="px-4 py-3">{t.taskTitle}</td>
              <td className="px-4 py-3 text-gray-600">{t.assignedTo}</td>
              <td className="px-4 py-3 text-gray-600">{t.dueDate}</td>
              <td className="px-4 py-3"><Badge value={t.priority} small /></td>
              <td className="px-4 py-3"><Badge value={t.status} small /></td>
              <td className="px-4 py-3 text-right">
                {t.status!=="เสร็จสิ้น" && <button className="text-iks-navy text-xs font-medium border border-iks-navy/30 rounded-lg px-3 py-1.5 hover:bg-iks-navy hover:text-white transition-colors">ปิดงาน</button>}
              </td>
            </tr>
          ))}
          {tasks.length===0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">ยังไม่มีงานติดตาม</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
