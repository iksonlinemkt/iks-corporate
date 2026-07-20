"use client";

import { useParams, useRouter } from "next/navigation";
import Whale from "@/components/Whale";
import {
  getRealCompanyById, getRealCompanyVehicles, getRealCompanyServiceRecords,
  realCompanySummary, realVehicleSummary, formatBahtReal, MEMBER_COLOR, MEMBER_ICON,
} from "@/lib/realDataLoader";
import { ArrowLeft, Truck, Wrench, CheckCircle2, Calendar, Phone, Mail } from "lucide-react";

export default function CustomerViewPage() {
  const params  = useParams<{ id: string }>();
  const router  = useRouter();
  const company = getRealCompanyById(params.id);

  if (!company) return <div className="p-10 text-gray-500">ไม่พบข้อมูลบริษัท</div>;

  const vehicles = getRealCompanyVehicles(company.id);
  const services = getRealCompanyServiceRecords(company.id);
  const summary  = realCompanySummary(company.id);

  const readyVehicles   = vehicles.length - (services.filter(s => {
    const v = vehicles.find(v => v.id === s.vehicleId);
    return v?.vehicleStatus === "เข้าศูนย์อยู่";
  }).length);
  const avgPerVehicle   = vehicles.length > 0 ? (summary.totalServiceCount / vehicles.length).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-iks-surface">
      {/* Header bar */}
      <header className="bg-white border-b border-iks-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-iks-navy flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M7 12a5 5 0 0 1 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-iks-navy text-sm">IKS Corporate Customer 360</span>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-iks-navy">
          <ArrowLeft size={15}/> กลับหน้าหลัก
        </button>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-iks-navy to-iks-navyLight px-8 py-10 flex flex-wrap items-center justify-between gap-6">
        <div className="text-white max-w-lg">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <CheckCircle2 size={20} className="text-iks-copperLight"/>
          </div>
          <p className="text-white/70 text-sm">ยินดีต้อนรับเข้าสู่ IKS Corporate Customer 360</p>
          {company.memberStatus && (
            <div className={`inline-flex items-center gap-1.5 mt-2 border rounded-full px-3 py-1 text-sm font-semibold ${MEMBER_COLOR[company.memberStatus]}`}>
              {MEMBER_ICON[company.memberStatus]} My Member · {company.memberStatus}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <MiniStat icon={<Truck size={18}/>}        value={vehicles.length}      label="รถทั้งหมด"/>
            <MiniStat icon={<Wrench size={18}/>}       value={summary.iksVehicles}  label="รถ IKS"/>
            <MiniStat icon={<CheckCircle2 size={18}/>} value={readyVehicles}         label="พร้อมใช้งาน"/>
            <MiniStat icon={<Calendar size={18}/>}     value={avgPerVehicle}         label="ครั้งเฉลี่ย/คัน/ปี"/>
          </div>
        </div>
        <Whale size={140}/>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Vehicle list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-iks-border p-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">ข้อมูลรถของท่าน</h3>
          <div className="space-y-3">
            {vehicles.slice(0, 8).map(v => {
              const vs = realVehicleSummary(v.id);
              return (
                <div key={v.id} className="flex items-center justify-between border border-iks-border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-iks-surface flex items-center justify-center text-iks-navy">
                      <Truck size={18}/>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{v.vehicleModel}</div>
                      <div className="text-xs text-gray-400 font-mono">{v.engineNumber}</div>
                      {v.registrationNumber !== "-" && (
                        <div className="text-xs text-gray-400">{v.registrationNumber}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                      {v.vehicleStatus}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      {vs.lastServiceDate ? `เข้าศูนย์ล่าสุด ${vs.lastServiceDate}` : "ยังไม่เคยเข้าศูนย์"}
                    </div>
                  </div>
                </div>
              );
            })}
            {vehicles.length > 8 && (
              <p className="text-xs text-gray-400 text-center">และอีก {vehicles.length - 8} คัน</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="space-y-5">
          {/* Recent service */}
          <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">การเข้าศูนย์ล่าสุด</h3>
            <div className="space-y-2">
              {services.slice(0, 4).map(s => {
                const v = vehicles.find(v => v.id === s.vehicleId);
                return (
                  <div key={s.id} className="flex justify-between text-xs">
                    <div>
                      <div className="text-gray-700">{s.serviceType}</div>
                      <div className="text-gray-400 font-mono">{v?.engineNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500">{s.serviceDate}</div>
                      <div className="text-iks-copper font-medium">฿{formatBahtReal(s.totalCost)}</div>
                    </div>
                  </div>
                );
              })}
              {services.length === 0 && <p className="text-gray-400 text-xs">ยังไม่มีประวัติ</p>}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">ผู้ดูแลของท่าน</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-iks-copper flex items-center justify-center text-white font-medium text-lg">
                {company.salesOwner.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">{company.salesOwner}</div>
                <div className="text-xs text-gray-400">Sales Executive · {company.branch}</div>
              </div>
            </div>
          </div>

          {/* Promotion */}
          <div className="bg-iks-copperLight/40 border border-iks-copper/30 rounded-xl p-5">
            <h3 className="font-semibold text-iks-copperDark text-sm mb-1">โปรโมชั่น / สิทธิพิเศษ</h3>
            <p className="text-sm text-gray-700">ส่วนลดค่าอะไหล่ 10% สำหรับการเปลี่ยนถ่ายน้ำมันเครื่อง วันนี้ถึงสิ้นเดือน</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pb-8">
        IKS ดูแลรถของคุณเหมือนรถของเรา — ขอบคุณที่ไว้วางใจ
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string|number; label: string }) {
  return (
    <div className="bg-white/10 rounded-lg p-3">
      <div className="text-white mb-1">{icon}</div>
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-white/70 text-[11px]">{label}</div>
    </div>
  );
}
