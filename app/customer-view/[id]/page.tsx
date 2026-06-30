"use client";

import { useParams, useRouter } from "next/navigation";
import Whale from "@/components/Whale";
import Badge from "@/components/Badge";
import {
  getCompanyById,
  getCompanyVehicles,
  getCompanyServiceRecords,
  vehicleSummary,
  currentUser,
} from "@/lib/mockData";
import { ArrowLeft, Truck, Wrench, CheckCircle2, Calendar, Phone, Mail } from "lucide-react";

export default function CustomerViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const company = getCompanyById(params.id);

  if (!company) {
    return <div className="p-10 text-gray-500">ไม่พบข้อมูลบริษัท</div>;
  }

  const vehicles = getCompanyVehicles(company.id);
  const services = getCompanyServiceRecords(company.id);
  const readyVehicles = vehicles.filter((v) => v.vehicleStatus === "พร้อมใช้งาน").length;
  const inServiceVehicles = vehicles.filter((v) => v.vehicleStatus === "เข้าศูนย์อยู่").length;
  const avgServicePerYear = vehicles.length ? (services.length / vehicles.length / 2).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-iks-surface">
      <header className="bg-white border-b border-iks-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-iks-navy flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <path d="M7 12a5 5 0 0 1 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="font-bold text-iks-navy text-sm">IKS Corporate Customer 360 & Visit App</div>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-iks-navy">
          <ArrowLeft size={15} /> กลับหน้าหลัก
        </button>
      </header>

      <div className="bg-gradient-to-br from-iks-navy to-iks-navyLight px-8 py-10 flex flex-wrap items-center justify-between gap-6">
        <div className="text-white max-w-lg">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <CheckCircle2 size={20} className="text-iks-copperLight" />
          </div>
          <p className="text-white/80 text-sm">ยินดีต้อนรับเข้าสู่ IKS Corporate Customer 360</p>
          <p className="text-white/60 text-sm">ขอบคุณที่ไว้วางใจให้เราดูแลรถของคุณ</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <MiniStat icon={<Truck size={18} />} value={vehicles.length} label="รถทั้งหมด" />
            <MiniStat icon={<Wrench size={18} />} value={inServiceVehicles} label="กำลังให้บริการ" />
            <MiniStat icon={<CheckCircle2 size={18} />} value={readyVehicles} label="พร้อมใช้งาน" />
            <MiniStat icon={<Calendar size={18} />} value={avgServicePerYear} label="เข้าศูนย์เฉลี่ย/คัน/ปี" />
          </div>
        </div>
        <Whale size={140} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-iks-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">ข้อมูลรถของท่าน</h3>
          </div>
          <div className="space-y-3">
            {vehicles.slice(0, 6).map((v) => {
              const s = vehicleSummary(v.id);
              return (
                <div key={v.id} className="flex items-center justify-between border border-iks-border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-iks-surface flex items-center justify-center text-iks-navy">
                      <Truck size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{v.registrationNumber}</div>
                      <div className="text-xs text-gray-400">{v.vehicleModel}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge value={v.vehicleStatus} small />
                    <div className="text-xs text-gray-400 mt-1">เข้าศูนย์ล่าสุด {s.lastServiceDate || "-"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">ผู้ดูแลของท่าน</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-medium`}>
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">{currentUser.name}</div>
                <div className="text-xs text-gray-400">Sales Executive</div>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Phone size={14} /> 081-234-5678</div>
              <div className="flex items-center gap-2"><Mail size={14} /> sales@iks.co.th</div>
            </div>
          </div>

          <div className="bg-iks-copperLight/40 border border-iks-copper/30 rounded-xl p-5">
            <h3 className="font-semibold text-iks-copperDark text-sm mb-1">โปรโมชั่น / สิทธิพิเศษ</h3>
            <p className="text-sm text-gray-700">ส่วนลดค่าอะไหล่ 10% สำหรับการเปลี่ยนถ่ายน้ำมันเครื่อง วันนี้ถึงสิ้นเดือน</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pb-8">
        IKS ดูแลรถของคุณเหมือนรถของเรา — ขอบคุณที่ไว้วางใจ และร่วมเดินทางไปข้างหน้าด้วยกัน
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-white/10 rounded-lg p-3">
      <div className="text-white mb-1">{icon}</div>
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-white/70 text-[11px]">{label}</div>
    </div>
  );
}
