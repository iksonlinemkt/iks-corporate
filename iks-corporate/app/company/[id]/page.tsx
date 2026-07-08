"use client";

import { useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import Whale from "@/components/Whale";
import {
  getRealCompanyById, getRealCompanyVehicles, getRealCompanyServiceRecords,
  getRealVehicleServiceRecords, realCompanySummary, realVehicleSummary, formatBahtReal,
} from "@/lib/realDataLoader";
import { Truck, Wrench, Coins, Calendar, ClipboardCheck, ExternalLink, Table2 } from "lucide-react";

const TABS = ["ภาพรวม","ข้อมูลบริษัท","รถของบริษัท","ประวัติการเข้าศูนย์"] as const;
type Tab = (typeof TABS)[number];
const TAB_PARAM: Record<string,Tab> = { profile:"ข้อมูลบริษัท", overview:"ภาพรวม", vehicles:"รถของบริษัท", service:"ประวัติการเข้าศูนย์" };

const OWN_LABEL: Record<string,string> = { IKS_PURCHASE:"ซื้อ IKS", NON_IKS_PURCHASE:"ซื้อที่อื่น", UNKNOWN:"ไม่ทราบ" };
const OWN_COLOR: Record<string,string> = { IKS_PURCHASE:"bg-green-50 text-green-700 border-green-200", NON_IKS_PURCHASE:"bg-gray-100 text-gray-500 border-gray-200", UNKNOWN:"bg-gray-50 text-gray-400 border-gray-200" };

const MONTH_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const YEAR_COLORS: Record<number,string> = { 2024:"bg-yellow-200 text-yellow-900", 2025:"bg-sky-200 text-sky-900", 2026:"bg-amber-700/20 text-amber-900" };
const YEARS = [2024,2025,2026];

export default function CompanyDetailPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}

function Inner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const company = getRealCompanyById(params.id);
  const initTab: Tab = TAB_PARAM[searchParams.get("tab")||""] || "ภาพรวม";
  const [tab, setTab] = useState<Tab>(initTab);

  if (!company) return <AppShell><p className="text-gray-500">ไม่พบข้อมูลบริษัท</p></AppShell>;

  const summary = realCompanySummary(company.id);
  const vehicles = getRealCompanyVehicles(company.id);
  const services = getRealCompanyServiceRecords(company.id);

  const statusLabel: Record<string,string> = { IKS_CUSTOMER:"ลูกค้า IKS", NON_IKS_CUSTOMER:"ไม่พบข้อมูลซื้อ", PENDING_VERIFICATION:"รอตรวจสอบ" };
  const statusColor: Record<string,string> = { IKS_CUSTOMER:"bg-green-50 text-green-700 border border-green-200", NON_IKS_CUSTOMER:"bg-orange-50 text-orange-600 border border-orange-200", PENDING_VERIFICATION:"bg-yellow-50 text-yellow-700 border border-yellow-200" };

  return (
    <AppShell>
      <Breadcrumb items={[{ label:"บริษัท / ข้อมูลลูกค้า", href:"/company" },{ label:"Company Detail / Customer 360" }]} />

      {/* Header */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5 mb-4">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-iks-navy/10 flex items-center justify-center text-iks-navy font-bold text-2xl shrink-0">
              {company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-800">{company.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[company.iksPurchaseStatus]}`}>
                  {statusLabel[company.iksPurchaseStatus]}
                </span>
                {company.customerGrade && <span className="text-xs bg-iks-navy text-white px-2 py-0.5 rounded-full">เกรด {company.customerGrade}</span>}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">เลขประจำตัวผู้เสียภาษี {company.taxId}</div>
              <div className="flex gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                <span>สาขา: <b className="text-gray-700">{company.branch}</b></span>
                {company.salesOwner !== "SC ไม่ระบุ" && <span>SC: <b className="text-gray-700">{company.salesOwner}</b></span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/customer-view/${company.id}`} target="_blank"
              className="bg-iks-navy hover:bg-iks-navyLight text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1">
              Customer View <ExternalLink size={11}/>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <StatCard icon={<Truck size={18}/>} label="รถทั้งหมด" value={summary.totalVehicles} unit="คัน"/>
        <StatCard icon={<Truck size={18}/>} label="รถซื้อกับ IKS" value={summary.iksVehicles} unit="คัน" iconBg="bg-green-50" iconColor="text-green-600"/>
        <StatCard icon={<Truck size={18}/>} label="รถเข้าศูนย์" value={summary.vehiclesServiced} unit="คัน" iconBg="bg-sky-50" iconColor="text-sky-600"/>
        <StatCard icon={<Wrench size={18}/>} label="ครั้งเข้าศูนย์รวม" value={summary.totalServiceCount} unit="ครั้ง" iconBg="bg-iks-copper/10" iconColor="text-iks-copper"/>
        <StatCard icon={<Coins size={18}/>} label="ยอดค่าใช้จ่ายรวม" value={"฿"+formatBahtReal(summary.totalServiceCost)} iconBg="bg-iks-copper/10" iconColor="text-iks-copper"/>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-iks-border mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab===t?"border-iks-copper text-iks-navy font-semibold":"border-transparent text-gray-500 hover:text-iks-navy"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "ภาพรวม" && <OverviewTab vehicles={vehicles} services={services} companyId={company.id}/>}
      {tab === "ข้อมูลบริษัท" && <ProfileTab company={company}/>}
      {tab === "รถของบริษัท" && <VehiclesTab vehicles={vehicles} companyId={company.id}/>}
      {tab === "ประวัติการเข้าศูนย์" && <ServiceHistoryTab services={services} vehicles={vehicles}/>}
    </AppShell>
  );
}

function OverviewTab({ vehicles, services, companyId }: any) {
  const byVC: Record<string,number> = {};
  services.forEach((s: any) => (byVC[s.vehicleId]=(byVC[s.vehicleId]||0)+1));
  const topV = Object.entries(byVC).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([vid,count]) => ({ v: vehicles.find((v: any)=>v.id===vid), count })).filter((x: any)=>x.v);
  const tc: Record<string,number> = {};
  services.forEach((s: any)=>(tc[s.serviceType]=(tc[s.serviceType]||0)+1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">รถที่เข้าศูนย์บ่อยที่สุด</h3>
        <table className="w-full text-sm"><tbody>
          {topV.map(({ v, count }: any) => (
            <tr key={v.id} className="border-t border-iks-border">
              <td className="py-2 text-gray-600">{v.vehicleModel}</td>
              <td className="py-2 text-xs text-gray-400">{v.engineNumber}</td>
              <td className="py-2 text-right font-medium">{count} ครั้ง</td>
            </tr>
          ))}
          {topV.length===0 && <tr><td className="py-4 text-gray-400 text-center">ยังไม่มีประวัติ</td></tr>}
        </tbody></table>
      </div>
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">สรุปประเภทงานซ่อม</h3>
        <div className="space-y-2">
          {Object.entries(tc).sort((a,b)=>b[1]-a[1]).map(([type,count]) => {
            const pct = services.length ? Math.round((count/services.length)*100) : 0;
            return (
              <div key={type}>
                <div className="flex justify-between text-xs text-gray-600 mb-1"><span>{type}</span><span>{pct}% ({count})</span></div>
                <div className="h-2 rounded-full bg-iks-surface"><div className="h-full bg-iks-navy rounded-full" style={{width:`${pct}%`}}/></div>
              </div>
            );
          })}
          {services.length===0 && <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีประวัติ</p>}
        </div>
      </div>
      <div className="bg-gradient-to-b from-iks-navy to-iks-navyDark rounded-xl p-5 text-white flex flex-col items-center text-center">
        <Whale size={56}/>
        <h3 className="font-semibold mt-3 mb-1">Customer View</h3>
        <p className="text-sm text-white/80 mb-4">เปิดให้ลูกค้าดูระหว่างเข้าเยี่ยม</p>
        <Link href={`/customer-view/${companyId}`} target="_blank"
          className="bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5">
          เปิด Customer View <ExternalLink size={14}/>
        </Link>
      </div>
    </div>
  );
}

function ProfileTab({ company }: any) {
  const F = ({ label, value }: any) => (
    <div className="flex justify-between gap-3 text-sm py-0.5 border-b border-iks-border/50 last:border-0">
      <span className="text-gray-400 min-w-[130px] shrink-0">{label}</span>
      <span className="text-gray-700 text-right">{value || "-"}</span>
    </div>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5 space-y-1">
        <h3 className="font-semibold text-iks-navy text-sm mb-3 pb-2 border-b border-iks-border">① ข้อมูลบริษัท</h3>
        <F label="ชื่อบริษัท" value={company.name}/>
        <F label="เลขประจำตัวผู้เสียภาษี" value={company.taxId}/>
        <F label="ที่อยู่" value={company.address}/>
        <F label="สาขา" value={company.branch}/>
        <F label="SC / เซลส์ผู้ดูแล" value={company.salesOwner !== "SC ไม่ระบุ" ? company.salesOwner : "-"}/>
        <F label="เกรดลูกค้า" value={company.customerGrade}/>
      </div>
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5 space-y-1">
        <h3 className="font-semibold text-iks-navy text-sm mb-3 pb-2 border-b border-iks-border">② ผู้ติดต่อ</h3>
        <F label="ชื่อผู้ติดต่อ" value={company.contactName}/>
        <F label="ตำแหน่ง" value={company.contactPosition}/>
        <F label="เบอร์โทร" value={company.contactPhone}/>
      </div>
    </div>
  );
}

function VehiclesTab({ vehicles, companyId }: any) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-iks-surface text-left text-gray-500 text-xs">
            <th className="font-medium px-4 py-3">เลขเครื่อง</th>
            <th className="font-medium px-4 py-3">รุ่นรถ</th>
            <th className="font-medium px-4 py-3">กลุ่ม</th>
            <th className="font-medium px-4 py-3">เลขแชสซี</th>
            <th className="font-medium px-4 py-3">ทะเบียน</th>
            <th className="font-medium px-4 py-3">ปีที่ซื้อ</th>
            <th className="font-medium px-4 py-3 text-center">ซื้อกับ</th>
            <th className="font-medium px-4 py-3 text-center">ครั้งเข้าศูนย์</th>
            <th className="font-medium px-4 py-3 text-right">ยอดค่าซ่อมสะสม</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v: any) => {
            const vs = realVehicleSummary(v.id);
            return (
              <tr key={v.id} className="table-row-hover border-t border-iks-border">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{v.engineNumber}</td>
                <td className="px-4 py-3 text-gray-700">{v.vehicleModel}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{v.vehicleGroup}{v.vehicleSubtype!=="-"&&<span className="text-gray-400"> · {v.vehicleSubtype}</span>}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.chassisNumber || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{v.registrationNumber !== "-" ? v.registrationNumber : "-"}</td>
                <td className="px-4 py-3 text-gray-600">{v.purchaseYear || "-"}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] border rounded-full px-2 py-0.5 font-medium ${OWN_COLOR[v.ownershipStatus]}`}>
                    {OWN_LABEL[v.ownershipStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-medium">{vs.serviceCount}</td>
                <td className="px-4 py-3 text-right font-medium text-iks-copper">{vs.totalCost > 0 ? "฿"+formatBahtReal(vs.totalCost) : "-"}</td>
              </tr>
            );
          })}
          {vehicles.length===0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูลรถ</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ServiceHistoryTab({ services, vehicles }: any) {
  const [view, setView] = useState<"table"|"calendar">("table");
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={()=>setView("table")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${view==="table"?"bg-iks-navy text-white border-iks-navy":"bg-white text-gray-600 border-iks-border"}`}>
          <Table2 size={14}/> ตาราง
        </button>
        <button onClick={()=>setView("calendar")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${view==="calendar"?"bg-iks-navy text-white border-iks-navy":"bg-white text-gray-600 border-iks-border"}`}>
          <Calendar size={14}/> ปฏิทินรายปี
        </button>
      </div>
      {view==="table" ? <SvcTable services={services}/> : <SvcCalendar vehicles={vehicles} services={services}/>}
    </div>
  );
}

function SvcTable({ services }: any) {
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
            <th className="font-medium px-4 py-3 text-right">ยอด (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {services.slice(0,50).map((s: any) => (
            <tr key={s.id} className="table-row-hover border-t border-iks-border">
              <td className="px-4 py-3 whitespace-nowrap">{s.serviceDate}</td>
              <td className="px-4 py-3 text-iks-navy text-xs font-mono">{s.roNumber}</td>
              <td className="px-4 py-3">{s.serviceType}</td>
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{s.serviceDetail}</td>
              <td className="px-4 py-3 text-gray-600">{s.serviceCenter}</td>
              <td className="px-4 py-3 text-right text-gray-600">{s.mileage>0?formatBahtReal(s.mileage):"-"}</td>
              <td className="px-4 py-3 text-right font-medium">฿{formatBahtReal(s.totalCost)}</td>
            </tr>
          ))}
          {services.length===0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">ยังไม่มีประวัติการเข้าศูนย์</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function SvcCalendar({ vehicles, services }: any) {
  const calMap: Record<string,Record<number,Record<number,string[]>>> = {};
  vehicles.forEach((v: any) => {
    calMap[v.id]={};
    YEARS.forEach(y => { calMap[v.id][y]={}; for(let m=0;m<12;m++) calMap[v.id][y][m]=[]; });
  });
  services.forEach((s: any) => {
    if (!s.serviceDateISO) return;
    const d = new Date(s.serviceDateISO);
    const y = d.getFullYear(); const m = d.getMonth(); const day = d.getDate().toString();
    if (calMap[s.vehicleId]?.[y]?.[m]!==undefined && !calMap[s.vehicleId][y][m].includes(day))
      calMap[s.vehicleId][y][m].push(day);
  });

  function avgPerYear(vehicleId: string) {
    const srs = services.filter((s: any) => s.vehicleId===vehicleId);
    if (!srs.length) return "-";
    const years = new Set(srs.map((s: any) => s.serviceDateISO?.slice(0,4))).size;
    const roSet = new Set(srs.map((s: any) => s.roNumber));
    return years>0 ? (roSet.size/years).toFixed(1)+" ครั้ง/ปี" : "-";
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-x-auto">
      <div className="min-w-[960px]">
        <div className="flex gap-4 px-4 py-3 border-b border-iks-border text-xs text-gray-500">
          {YEARS.map(y=>(
            <div key={y} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${YEAR_COLORS[y]?.split(" ")[0]}`}/><span>พ.ศ. {y+543}</span>
            </div>
          ))}
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-iks-navy text-white">
              <th className="px-2 py-2 text-center w-8">#</th>
              <th className="px-2 py-2 text-center w-10">ปี</th>
              <th className="px-3 py-2 text-left w-28">รถ / เลขเครื่อง</th>
              {MONTH_SHORT.map(m=><th key={m} className="px-1 py-2 text-center w-14 font-medium">{m}</th>)}
              <th className="px-2 py-2 text-center">เฉลี่ย</th>
              <th className="px-2 py-2 text-left">ศูนย์หลัก</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v: any, vi: number) => {
              const mainCenter = (() => {
                const srs = services.filter((s: any)=>s.vehicleId===v.id);
                const cc: Record<string,number>={};
                srs.forEach((s: any)=>(cc[s.serviceCenter]=(cc[s.serviceCenter]||0)+1));
                return Object.entries(cc).sort((a,b)=>b[1]-a[1])[0]?.[0]||"-";
              })();
              return YEARS.map((year,yi) => (
                <tr key={`${v.id}-${year}`} className={`border-b border-iks-border ${yi===0?"border-t-2 border-t-gray-300":""}`}>
                  {yi===0 && <td className="px-2 py-1.5 text-gray-500 font-medium text-center" rowSpan={3}>{vi+1}</td>}
                  <td className={`px-2 py-1 text-center font-medium ${YEAR_COLORS[year]}`}>{year+543}</td>
                  {yi===0 && (
                    <td className="px-3 py-1.5" rowSpan={3}>
                      <div className="text-iks-navy font-medium">{v.vehicleModel}</div>
                      <div className="text-gray-400 font-mono text-[10px]">{v.engineNumber}</div>
                    </td>
                  )}
                  {Array.from({length:12},(_,mi) => {
                    const days = calMap[v.id]?.[year]?.[mi]||[];
                    return (
                      <td key={mi} className="px-1 py-1 text-center border-l border-iks-border">
                        {days.length>0 ? (
                          <div className={`rounded px-0.5 py-0.5 font-medium leading-tight ${YEAR_COLORS[year]}`}>
                            {days.sort((a,b)=>+a-+b).join(", ")}
                          </div>
                        ):""}
                      </td>
                    );
                  })}
                  {yi===0 && <td className="px-2 py-1.5 text-center text-gray-600 whitespace-nowrap" rowSpan={3}>{avgPerYear(v.id)}</td>}
                  {yi===0 && <td className="px-2 py-1.5 text-gray-500 text-[11px]" rowSpan={3}>{mainCenter}</td>}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
