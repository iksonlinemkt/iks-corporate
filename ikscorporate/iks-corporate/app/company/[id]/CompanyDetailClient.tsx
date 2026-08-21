"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import Whale from "@/components/Whale";
import { MEMBER_COLOR, MEMBER_ICON, formatBahtReal } from "@/lib/realDataLoader";
import { Truck, Wrench, Coins, ExternalLink, Table2, Calendar, Search } from "lucide-react";

type Tab = "ภาพรวม"|"ข้อมูลบริษัท"|"รถของบริษัท"|"ประวัติการเข้าศูนย์";
const TABS: Tab[] = ["ภาพรวม","ข้อมูลบริษัท","รถของบริษัท","ประวัติการเข้าศูนย์"];
const TAB_MAP: Record<string,Tab> = {
  profile:"ข้อมูลบริษัท", overview:"ภาพรวม", vehicles:"รถของบริษัท", service:"ประวัติการเข้าศูนย์"
};

const STATUS_COLOR: Record<string,string> = {
  IKS_CUSTOMER:"bg-green-50 text-green-700 border border-green-200",
  NON_IKS_CUSTOMER:"bg-orange-50 text-orange-600 border border-orange-200",
  PENDING_VERIFICATION:"bg-yellow-50 text-yellow-700 border border-yellow-200",
};
const STATUS_LABEL: Record<string,string> = {
  IKS_CUSTOMER:"ลูกค้า IKS", NON_IKS_CUSTOMER:"ไม่พบข้อมูลซื้อ", PENDING_VERIFICATION:"รอตรวจสอบ"
};
const OWN_LABEL: Record<string,string> = {
  IKS_PURCHASE:"ซื้อ IKS", NON_IKS_PURCHASE:"ซื้อที่อื่น", UNKNOWN:"ไม่ทราบ"
};
const OWN_COLOR: Record<string,string> = {
  IKS_PURCHASE:"bg-green-50 text-green-700 border-green-200",
  NON_IKS_PURCHASE:"bg-gray-100 text-gray-500 border-gray-200",
  UNKNOWN:"bg-gray-50 text-gray-400 border-gray-200",
};
const MONTH_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const YEAR_COLORS: Record<number,string> = {
  2024:"bg-yellow-200 text-yellow-900",
  2025:"bg-sky-200 text-sky-900",
  2026:"bg-amber-700/20 text-amber-900"
};
const YEARS = [2024,2025,2026];
const fmt = (n: number) => new Intl.NumberFormat("th-TH").format(Math.round(n));

export default function CompanyDetailClient({ company, vehicles, services, summary, initialTab }: {
  company: any; vehicles: any[]; services: any[]; summary: any; initialTab: string;
}) {
  const [tab, setTab] = useState<Tab>(TAB_MAP[initialTab] || "ภาพรวม");

  const vSummary = (vehicleId: string) => {
    const srs = services.filter((s:any) => s.vehicleId === vehicleId);
    const roSet = new Set(srs.map((s:any) => s.roNumber));
    return {
      count: roSet.size,
      totalCost: srs.reduce((sum:number,s:any) => sum + s.totalCost, 0),
    };
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5 mb-4">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-iks-navy/10 flex items-center justify-center text-iks-navy font-bold text-xl shrink-0">
              {company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-800">{company.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[company.iksPurchaseStatus]}`}>
                  {STATUS_LABEL[company.iksPurchaseStatus]}
                </span>
                {company.customerGrade && (
                  <span className="text-xs bg-iks-navy text-white px-2 py-0.5 rounded-full">เกรด {company.customerGrade}</span>
                )}
                {company.memberStatus ? (
                  <span className={`text-xs border rounded-full px-2.5 py-0.5 font-semibold ${MEMBER_COLOR[company.memberStatus]}`}>
                    {MEMBER_ICON[company.memberStatus]} My Member · {company.memberStatus}
                  </span>
                ) : (
                  <span className="text-xs border border-gray-200 rounded-full px-2.5 py-0.5 text-gray-400">ไม่ใช่สมาชิก</span>
                )}
                {!company.hasSalesData && (
                  <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-2 py-0.5">⚠️ ไม่พบข้อมูลฝ่ายขาย</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">เลขประจำตัวผู้เสียภาษี {company.taxId || "-"}</div>
              <div className="flex gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                <span>สาขา: <b className="text-gray-700">{company.branch || "-"}</b></span>
                {company.salesOwner && <span>SC: <b className="text-gray-700">{company.salesOwner}</b></span>}
              </div>
            </div>
          </div>
          <Link href={`/customer-view/${company.id}`} target="_blank"
            className="bg-iks-navy hover:bg-iks-navyLight text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1 self-start">
            Customer View <ExternalLink size={11}/>
          </Link>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <StatCard icon={<Truck size={18}/>} label="รถทั้งหมด" value={summary.totalVehicles} unit="คัน"/>
        <StatCard icon={<Truck size={18}/>} label="รถซื้อกับ IKS" value={summary.iksVehicles} unit="คัน" iconBg="bg-green-50" iconColor="text-green-600"/>
        <StatCard icon={<Truck size={18}/>} label="รถเข้าศูนย์" value={summary.vehiclesServiced} unit="คัน" iconBg="bg-sky-50" iconColor="text-sky-600"/>
        <StatCard icon={<Wrench size={18}/>} label="ครั้งเข้าศูนย์รวม" value={summary.totalServiceCount} unit="ครั้ง" iconBg="bg-iks-copper/10" iconColor="text-iks-copper"/>
        <StatCard icon={<Coins size={18}/>} label="ยอดค่าใช้จ่ายรวม" value={"฿"+fmt(summary.totalServiceCost)} iconBg="bg-iks-copper/10" iconColor="text-iks-copper"/>
      </div>

      {/* ── Tyre / Battery / ISP Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        <MiniCard icon="🔵" label="ซื้อยางแล้ว" value={summary.tyreCount} total={summary.totalVehicles} positive/>
        <MiniCard icon="⚠️" label="ยังไม่ซื้อยาง" value={summary.noTyreCount} total={summary.totalVehicles} badge="โอกาสขาย"/>
        <MiniCard icon="🔋" label="ซื้อแบตแล้ว" value={summary.batteryCount} total={summary.totalVehicles} positive/>
        <MiniCard icon="⚡" label="ยังไม่ซื้อแบต" value={summary.noBatteryCount} total={summary.totalVehicles} badge="โอกาสขาย"/>
        <MiniCard icon="🛡️" label="ซื้อ ISP แล้ว" value={summary.ispCount} total={summary.totalVehicles} positive/>
        <MiniCard icon="📋" label="ยังไม่ซื้อ ISP" value={summary.noISPCount} total={summary.totalVehicles} badge="โอกาสขาย"/>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-iks-border mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab===t?"border-iks-copper text-iks-navy font-semibold":"border-transparent text-gray-500 hover:text-iks-navy"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "ภาพรวม"            && <OverviewTab vehicles={vehicles} services={services} companyId={company.id}/>}
      {tab === "ข้อมูลบริษัท"       && <ProfileTab company={company}/>}
      {tab === "รถของบริษัท"        && <VehiclesTab vehicles={vehicles} vSummary={vSummary}/>}
      {tab === "ประวัติการเข้าศูนย์" && <ServiceHistoryTab services={services} vehicles={vehicles}/>}
    </>
  );
}

// ─── Mini Card ────────────────────────────────────────────────
function MiniCard({ icon, label, value, total, positive, badge }: {
  icon: string; label: string; value: number; total: number;
  positive?: boolean; badge?: string;
}) {
  const pct = total > 0 ? Math.round((value/total)*100) : 0;
  const bg  = positive ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200";
  const bar = positive ? "bg-green-500" : "bg-orange-400";
  const txt = positive ? "text-green-700" : "text-orange-700";
  return (
    <div className={`rounded-xl border p-3 ${bg}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-base">{icon}</span>
        {badge && <span className="text-[10px] bg-orange-100 text-orange-600 border border-orange-200 rounded-full px-1.5 py-0.5">{badge}</span>}
      </div>
      <div className={`text-xl font-bold ${txt}`}>{value} <span className="text-xs font-normal text-gray-500">คัน</span></div>
      <div className="text-[11px] text-gray-500 truncate">{label} ({pct}%)</div>
      <div className="h-1 rounded-full bg-white/60 mt-1.5">
        <div className={`h-full rounded-full ${bar}`} style={{width:`${pct}%`}}/>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ vehicles, services, companyId }: any) {
  const byVC: Record<string,number> = {};
  services.forEach((s:any) => (byVC[s.vehicleId]=(byVC[s.vehicleId]||0)+1));
  const topV = Object.entries(byVC).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([vid,count]) => ({ v: vehicles.find((v:any)=>v.id===vid), count })).filter((x:any)=>x.v);
  const tc: Record<string,number> = {};
  services.forEach((s:any)=>(tc[s.serviceType]=(tc[s.serviceType]||0)+1));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">รถที่เข้าศูนย์บ่อยที่สุด</h3>
        <table className="w-full text-sm"><tbody>
          {topV.map(({ v, count }:any) => (
            <tr key={v.id} className="border-t border-iks-border">
              <td className="py-2 text-gray-600">{v.vehicleModel}</td>
              <td className="py-2 text-xs text-gray-400 font-mono">{v.engineNumber}</td>
              <td className="py-2 text-right font-medium">{count} ครั้ง</td>
            </tr>
          ))}
          {topV.length===0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">ยังไม่มีประวัติ</td></tr>}
        </tbody></table>
      </div>
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">สรุปประเภทงานซ่อม</h3>
        <div className="space-y-2">
          {Object.entries(tc).sort((a,b)=>b[1]-a[1]).map(([type,count]) => {
            const pct = services.length ? Math.round((count/services.length)*100) : 0;
            return <div key={type}>
              <div className="flex justify-between text-xs text-gray-600 mb-1"><span>{type}</span><span>{pct}%</span></div>
              <div className="h-2 rounded-full bg-iks-surface"><div className="h-full bg-iks-navy rounded-full" style={{width:`${pct}%`}}/></div>
            </div>;
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

// ─── Profile Tab ──────────────────────────────────────────────
function ProfileTab({ company }: any) {
  const F = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-3 text-sm py-1.5 border-b border-iks-border/40 last:border-0">
      <span className="text-gray-400 min-w-[130px] shrink-0">{label}</span>
      <span className="text-gray-700 text-right">{value || "-"}</span>
    </div>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ① Company */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
        <h3 className="font-semibold text-iks-navy text-sm mb-3 pb-2 border-b border-iks-border">① ข้อมูลบริษัท</h3>
        <F label="ชื่อบริษัท"             value={company.name}/>
        <F label="เลขประจำตัวผู้เสียภาษี" value={company.taxId}/>
        <F label="ที่อยู่"                 value={company.address}/>
        <F label="สาขา"                   value={company.branch}/>
        <F label="SC / เซลส์"             value={company.salesOwner}/>
        <F label="เกรดลูกค้า"             value={company.customerGrade}/>
        {!company.hasSalesData && (
          <div className="mt-3 text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-lg px-3 py-2">
            ⚠️ ยังไม่พบข้อมูลฝ่ายขาย — ที่อยู่/SC/ผู้ติดต่ออาจไม่ครบ
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* ② Contact */}
        <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
          <h3 className="font-semibold text-iks-navy text-sm mb-3 pb-2 border-b border-iks-border">② ผู้ติดต่อ</h3>
          <F label="ชื่อผู้ติดต่อ" value={company.contactName}/>
          <F label="ตำแหน่ง"       value={company.contactPosition}/>
          <F label="เบอร์โทร"      value={company.contactPhone}/>
        </div>

        {/* ③ My Member */}
        <div className={`rounded-xl border p-5 ${company.memberStatus ? MEMBER_COLOR[company.memberStatus] : "bg-gray-50 border-gray-200"}`}>
          <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-current/20">③ สถานะ My Member</h3>
          {company.memberStatus ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{MEMBER_ICON[company.memberStatus]}</span>
              <div>
                <div className="font-bold text-lg">{company.memberStatus}</div>
                {company.memberSince && <div className="text-xs opacity-70">สมาชิกตั้งแต่ {company.memberSince}</div>}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">ยังไม่ได้เป็นสมาชิก My Member</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Vehicles Tab ─────────────────────────────────────────────
function VehiclesTab({ vehicles, vSummary }: any) {
  const [tyreF,    setTyreF]    = useState<"all"|"yes"|"no">("all");
  const [battF,    setBattF]    = useState<"all"|"yes"|"no">("all");
  const [ispF,     setIspF]     = useState<"all"|"yes"|"no">("all");
  const [q,        setQ]        = useState("");

  const filtered = useMemo(() => vehicles.filter((v:any) => {
    if (q && !v.engineNumber.toLowerCase().includes(q.toLowerCase()) &&
              !v.vehicleModel.toLowerCase().includes(q.toLowerCase()) &&
              !(v.registrationNumber||"").includes(q)) return false;
    if (tyreF === "yes" && !v.lastTyreDate)    return false;
    if (tyreF === "no"  &&  v.lastTyreDate)    return false;
    if (battF === "yes" && !v.lastBatteryDate) return false;
    if (battF === "no"  &&  v.lastBatteryDate) return false;
    if (ispF  === "yes" && !v.lastISPDate)     return false;
    if (ispF  === "no"  &&  v.lastISPDate)     return false;
    return true;
  }), [vehicles, q, tyreF, battF, ispF]);

  const BtnGroup = ({ label, val, setVal }: { label: string; val: string; setVal: (v:any)=>void }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400 text-xs">{label}:</span>
      {(["all","yes","no"] as const).map(opt => (
        <button key={opt} onClick={()=>setVal(opt)}
          className={`px-2 py-1 rounded-lg text-xs border transition-colors ${val===opt?"bg-iks-navy text-white border-iks-navy":"bg-white text-gray-600 border-iks-border"}`}>
          {opt==="all"?"ทั้งหมด":opt==="yes"?"ซื้อแล้ว ✓":"ยังไม่ซื้อ ⚠️"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 flex flex-wrap gap-3 items-center">
        <div className="relative min-w-[180px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={q} onChange={e=>setQ(e.target.value)}
            placeholder="ค้นหาเลขเครื่อง, รุ่น, ทะเบียน..."
            className="w-full bg-iks-surface border border-iks-border rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none"/>
        </div>
        <BtnGroup label="🔵 ยาง" val={tyreF} setVal={setTyreF}/>
        <BtnGroup label="🔋 แบต" val={battF} setVal={setBattF}/>
        <BtnGroup label="🛡️ ISP" val={ispF}  setVal={setIspF}/>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} / {vehicles.length} คัน</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-iks-surface text-left text-gray-500 text-xs">
              <th className="font-medium px-3 py-3">เลขเครื่อง</th>
              <th className="font-medium px-3 py-3">รุ่นรถ</th>
              <th className="font-medium px-3 py-3">ทะเบียน</th>
              <th className="font-medium px-3 py-3 text-center">ซื้อกับ</th>
              <th className="font-medium px-3 py-3 text-center">ครั้งเข้าศูนย์</th>
              <th className="font-medium px-3 py-3 text-center">🔵 ยาง</th>
              <th className="font-medium px-3 py-3 text-center">🔋 แบต</th>
              <th className="font-medium px-3 py-3 text-center">🛡️ ISP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v:any) => {
              const vs = vSummary(v.id);
              const TyreBatt = ({ date }: { date: string|null }) =>
                date
                  ? <div className="text-green-600 text-xs text-center">✓<div className="text-gray-400">{date.slice(0,10)}</div></div>
                  : <div className="text-orange-500 text-xs font-medium text-center">ยังไม่ซื้อ</div>;
              return (
                <tr key={v.id} className="table-row-hover border-t border-iks-border">
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-700">{v.engineNumber}</td>
                  <td className="px-3 py-2.5 text-gray-700">{v.vehicleModel}</td>
                  <td className="px-3 py-2.5 text-gray-600">{v.registrationNumber !== "-" ? v.registrationNumber : "-"}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[10px] border rounded-full px-2 py-0.5 ${OWN_COLOR[v.ownershipStatus]}`}>
                      {OWN_LABEL[v.ownershipStatus]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-medium">{vs.count}</td>
                  <td className="px-3 py-2.5"><TyreBatt date={v.lastTyreDate}/></td>
                  <td className="px-3 py-2.5"><TyreBatt date={v.lastBatteryDate}/></td>
                  <td className="px-3 py-2.5"><TyreBatt date={v.lastISPDate}/></td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">ไม่พบรถที่ตรงกับเงื่อนไข</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Service History Tab ──────────────────────────────────────
function ServiceHistoryTab({ services, vehicles }: any) {
  const [view,         setView]        = useState<"table"|"calendar">("table");
  const [engineFilter, setEngineFilter]= useState("ทั้งหมด");

  const engines = useMemo(() =>
    ["ทั้งหมด", ...[...new Set(vehicles.map((v:any) => v.engineNumber))].filter(Boolean).sort()],
    [vehicles]
  );

  const filtSvc = useMemo(() =>
    engineFilter === "ทั้งหมด"
      ? services
      : services.filter((s:any) => vehicles.find((v:any) => v.id===s.vehicleId)?.engineNumber === engineFilter),
    [services, vehicles, engineFilter]
  );

  const filtVeh = useMemo(() =>
    engineFilter === "ทั้งหมด" ? vehicles : vehicles.filter((v:any) => v.engineNumber === engineFilter),
    [vehicles, engineFilter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(["table","calendar"] as const).map(v => (
            <button key={v} onClick={()=>setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${view===v?"bg-iks-navy text-white border-iks-navy":"bg-white text-gray-600 border-iks-border"}`}>
              {v==="table" ? <><Table2 size={14}/> ตาราง</> : <><Calendar size={14}/> ปฏิทินรายปี</>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Filter เลขเครื่อง:</span>
          <select value={engineFilter} onChange={e=>setEngineFilter(e.target.value)}
            className="bg-white border border-iks-border rounded-lg px-3 py-1.5 text-sm outline-none max-w-[200px]">
            {engines.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <span className="text-xs text-gray-400">{filtSvc.length} รายการ</span>
      </div>

      {view === "table" ? <SvcTable services={filtSvc} vehicles={vehicles}/> : <SvcCalendar vehicles={filtVeh} services={filtSvc}/>}
    </div>
  );
}

function SvcTable({ services, vehicles }: any) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-iks-surface text-left text-gray-500 text-xs">
            <th className="font-medium px-4 py-3">วันที่</th>
            <th className="font-medium px-4 py-3">เลข RO</th>
            <th className="font-medium px-4 py-3">เลขเครื่อง</th>
            <th className="font-medium px-4 py-3">ประเภทงาน</th>
            <th className="font-medium px-4 py-3">รายละเอียด</th>
            <th className="font-medium px-4 py-3">ศูนย์</th>
            <th className="font-medium px-4 py-3 text-center">ยาง</th>
            <th className="font-medium px-4 py-3 text-center">แบต</th>
            <th className="font-medium px-4 py-3 text-center">ISP</th>
            <th className="font-medium px-4 py-3 text-right">ยอด (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {services.slice(0,50).map((s:any) => {
            const v = vehicles.find((v:any) => v.id === s.vehicleId);
            return (
              <tr key={s.id} className="table-row-hover border-t border-iks-border">
                <td className="px-4 py-2.5 whitespace-nowrap">{s.serviceDate}</td>
                <td className="px-4 py-2.5 text-iks-navy text-xs font-mono">{s.roNumber}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{v?.engineNumber||"-"}</td>
                <td className="px-4 py-2.5">{s.serviceType}</td>
                <td className="px-4 py-2.5 text-gray-500 max-w-[150px] truncate">{s.serviceDetail}</td>
                <td className="px-4 py-2.5 text-gray-600 text-xs">{s.serviceCenter}</td>
                <td className="px-4 py-2.5 text-center text-xs">{s.boughtTyre    ? <span className="text-green-600 font-medium">✓ซื้อ</span> : <span className="text-gray-300">-</span>}</td>
                <td className="px-4 py-2.5 text-center text-xs">{s.boughtBattery ? <span className="text-green-600 font-medium">✓ซื้อ</span> : <span className="text-gray-300">-</span>}</td>
                <td className="px-4 py-2.5 text-center text-xs">{s.boughtISP     ? <span className="text-purple-600 font-medium">✓มี</span>  : <span className="text-gray-300">-</span>}</td>
                <td className="px-4 py-2.5 text-right font-medium">฿{fmt(s.totalCost)}</td>
              </tr>
            );
          })}
          {services.length===0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">ยังไม่มีประวัติ</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function SvcCalendar({ vehicles, services }: any) {
  const calMap: Record<string,Record<number,Record<number,string[]>>> = {};
  vehicles.forEach((v:any) => {
    calMap[v.id]={};
    YEARS.forEach(y => { calMap[v.id][y]={}; for(let m=0;m<12;m++) calMap[v.id][y][m]=[]; });
  });
  services.forEach((s:any) => {
    if (!s.serviceDateISO) return;
    const d=new Date(s.serviceDateISO), y=d.getFullYear(), m=d.getMonth(), day=d.getDate().toString();
    if (calMap[s.vehicleId]?.[y]?.[m]!==undefined && !calMap[s.vehicleId][y][m].includes(day))
      calMap[s.vehicleId][y][m].push(day);
  });

  function avgPerYear(vid: string) {
    const srs = services.filter((s:any)=>s.vehicleId===vid);
    if (!srs.length) return "-";
    const yrs = new Set(srs.map((s:any)=>s.serviceDateISO?.slice(0,4))).size;
    const ros = new Set(srs.map((s:any)=>s.roNumber)).size;
    return yrs>0 ? (ros/yrs).toFixed(1)+" ครั้ง/ปี" : "-";
  }

  if (!vehicles.length) return <div className="bg-white rounded-xl shadow-card border border-iks-border p-10 text-center text-gray-400">ไม่พบรถที่ตรงกับ filter</div>;

  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border overflow-x-auto">
      <div className="min-w-[1000px]">
        <div className="flex gap-4 px-4 py-3 border-b border-iks-border text-xs text-gray-500">
          {YEARS.map(y=>(
            <div key={y} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${YEAR_COLORS[y]?.split(" ")[0]}`}/>พ.ศ. {y+543}
            </div>
          ))}
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-iks-navy text-white">
              <th className="px-2 py-2 text-center w-8">#</th>
              <th className="px-2 py-2 text-center w-10">ปี</th>
              <th className="px-3 py-2 text-left w-36">เลขเครื่อง / รุ่น</th>
              {MONTH_SHORT.map(m=><th key={m} className="px-1 py-2 text-center w-14">{m}</th>)}
              <th className="px-2 py-2 text-center whitespace-nowrap">เฉลี่ย</th>
              <th className="px-2 py-2 text-left whitespace-nowrap">ยาง</th>
              <th className="px-2 py-2 text-left whitespace-nowrap">แบต</th>
              <th className="px-2 py-2 text-left whitespace-nowrap">ISP</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v:any,vi:number) => (
              YEARS.map((year,yi) => (
                <tr key={`${v.id}-${year}`} className={`border-b border-iks-border ${yi===0?"border-t-2 border-t-gray-300":""}`}>
                  {yi===0&&<td className="px-2 py-1.5 text-gray-500 text-center" rowSpan={3}>{vi+1}</td>}
                  <td className={`px-2 py-1 text-center font-medium ${YEAR_COLORS[year]}`}>{year+543}</td>
                  {yi===0&&<td className="px-3 py-1.5" rowSpan={3}>
                    <div className="font-mono text-[11px] text-iks-navy font-semibold">{v.engineNumber}</div>
                    <div className="text-gray-400 text-[10px]">{v.vehicleModel}</div>
                  </td>}
                  {Array.from({length:12},(_,mi) => {
                    const days = calMap[v.id]?.[year]?.[mi]||[];
                    return <td key={mi} className="px-1 py-1 text-center border-l border-iks-border">
                      {days.length>0 && <div className={`rounded px-0.5 py-0.5 font-medium leading-tight ${YEAR_COLORS[year]}`}>{days.sort((a,b)=>+a-+b).join(",")}</div>}
                    </td>;
                  })}
                  {yi===0&&<td className="px-2 py-1.5 text-center text-gray-600 whitespace-nowrap" rowSpan={3}>{avgPerYear(v.id)}</td>}
                  {yi===0&&<td className="px-2 py-1.5 text-[11px]" rowSpan={3}>
                    {v.lastTyreDate ? <span className="text-green-600">✓{v.lastTyreDate.slice(0,10)}</span> : <span className="text-orange-500">ยังไม่ซื้อ</span>}
                  </td>}
                  {yi===0&&<td className="px-2 py-1.5 text-[11px]" rowSpan={3}>
                    {v.lastBatteryDate ? <span className="text-green-600">✓{v.lastBatteryDate.slice(0,10)}</span> : <span className="text-orange-500">ยังไม่ซื้อ</span>}
                  </td>}
                  {yi===0&&<td className="px-2 py-1.5 text-[11px]" rowSpan={3}>
                    {v.lastISPDate ? <span className="text-purple-600">✓{v.lastISPDate.slice(0,10)}</span> : <span className="text-gray-400">ไม่มี</span>}
                  </td>}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
