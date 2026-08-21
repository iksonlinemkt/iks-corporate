"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import {
  getRealVehicleById, getRealCompanyById, getRealVehicleServiceRecords,
  realVehicleSummary, formatBahtReal,
} from "@/lib/realDataLoader";
import { Wrench, Calendar, Coins, Gauge, Hash, Truck } from "lucide-react";

const OWN_LABEL: Record<string,string> = {
  IKS_PURCHASE:"ซื้อกับ IKS", NON_IKS_PURCHASE:"ซื้อที่อื่น", UNKNOWN:"ไม่ทราบ",
};

export default function VehicleDetailPage() {
  const params  = useParams<{ id: string; vehicleId: string }>();
  const vehicle = getRealVehicleById(params.vehicleId);
  const company = getRealCompanyById(params.id);

  if (!vehicle || !company) {
    return <AppShell><p className="text-gray-500">ไม่พบข้อมูลรถ</p></AppShell>;
  }

  const records = getRealVehicleServiceRecords(vehicle.id);
  const summary = realVehicleSummary(vehicle.id);

  return (
    <AppShell>
      <Breadcrumb items={[
        { label:"บริษัท / ข้อมูลลูกค้า", href:"/company" },
        { label:company.name, href:`/company/${company.id}` },
        { label:"Vehicle Detail" },
      ]}/>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-5 mb-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-iks-navy/10 flex items-center justify-center text-iks-navy shrink-0">
              <Truck size={28}/>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-800">
                  {vehicle.registrationNumber !== "-" ? vehicle.registrationNumber : vehicle.engineNumber}
                </h1>
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                  {vehicle.vehicleStatus}
                </span>
              </div>
              <div className="text-sm text-gray-500">{vehicle.vehicleModel}</div>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Hash size={12}/> เลขเครื่อง {vehicle.engineNumber}</span>
                {vehicle.chassisNumber && <span className="flex items-center gap-1"><Hash size={12}/> แชสซี {vehicle.chassisNumber}</span>}
              </div>
              <div className="flex gap-4 mt-1 text-xs text-gray-500">
                {vehicle.vehicleYear > 0 && <span>ปีรถ {vehicle.vehicleYear}</span>}
                {vehicle.purchaseYear > 0 && <span>ปีที่ซื้อ {vehicle.purchaseYear}</span>}
                <span>กลุ่มรถ: {vehicle.vehicleGroup}{vehicle.vehicleSubtype !== "-" && ` (${vehicle.vehicleSubtype})`}</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-gray-400">สังกัดบริษัท</div>
            <Link href={`/company/${company.id}`} className="text-iks-navy font-medium hover:underline text-sm">
              {company.name}
            </Link>
            <div className="mt-1">
              <span className={`text-xs border rounded-full px-2 py-0.5 ${
                vehicle.ownershipStatus === "IKS_PURCHASE"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}>
                {OWN_LABEL[vehicle.ownershipStatus]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <StatCard icon={<Wrench size={18}/>}   label="จำนวนครั้งเข้าศูนย์"  value={summary.serviceCount}  unit="ครั้ง"  iconBg="bg-iks-copper/10" iconColor="text-iks-copper"/>
        <StatCard icon={<Calendar size={18}/>}  label="วันที่เข้าศูนย์ล่าสุด" value={summary.lastServiceDate || "-"}/>
        <StatCard icon={<Coins size={18}/>}     label="ยอดครั้งล่าสุด"        value={summary.lastServiceCost ? "฿"+formatBahtReal(summary.lastServiceCost) : "-"}/>
        <StatCard icon={<Coins size={18}/>}     label="ยอดสะสมทั้งหมด"        value={"฿"+formatBahtReal(summary.totalCost)}  iconBg="bg-iks-copper/10" iconColor="text-iks-copper"/>
        <StatCard icon={<Wrench size={18}/>}    label="ประเภทงานบ่อยสุด"      value={summary.topServiceType || "-"}/>
        <StatCard icon={<Gauge size={18}/>}     label="ระยะไมล์ล่าสุด"        value={summary.lastMileage ? formatBahtReal(summary.lastMileage) : "-"} unit="กม."/>
      </div>

      {/* Tyre / Battery */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={`rounded-xl border p-4 ${vehicle.lastTyreDate ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
          <div className="text-sm font-medium mb-1">🔵 ยาง</div>
          {vehicle.lastTyreDate
            ? <div className="text-green-700 font-semibold">ซื้อแล้ว ✓<div className="text-xs font-normal text-green-600">ล่าสุด: {vehicle.lastTyreDate}</div></div>
            : <div className="text-orange-600 font-semibold">ยังไม่ซื้อ <span className="text-xs">⚠️ โอกาสขาย</span></div>}
        </div>
        <div className={`rounded-xl border p-4 ${vehicle.lastBatteryDate ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
          <div className="text-sm font-medium mb-1">🔋 แบตเตอรี่</div>
          {vehicle.lastBatteryDate
            ? <div className="text-green-700 font-semibold">ซื้อแล้ว ✓<div className="text-xs font-normal text-green-600">ล่าสุด: {vehicle.lastBatteryDate}</div></div>
            : <div className="text-orange-600 font-semibold">ยังไม่ซื้อ <span className="text-xs">⚠️ โอกาสขาย</span></div>}
        </div>
      </div>

      {/* Service Timeline */}
      <div className="bg-white rounded-xl shadow-card border border-iks-border">
        <div className="flex items-center justify-between p-5 border-b border-iks-border">
          <h3 className="font-semibold text-gray-800 text-sm">ประวัติการเข้าศูนย์ (Service Timeline)</h3>
          <span className="text-xs text-gray-400">{records.length} รายการ</span>
        </div>
        <div className="p-5">
          {records.length > 0 ? (
            <div className="space-y-0">
              {records.map((r, i) => (
                <div key={r.id} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-iks-navy mt-1.5 shrink-0"/>
                    {i < records.length - 1 && <div className="w-px flex-1 bg-iks-border"/>}
                  </div>
                  <div className="pb-5 flex-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <span className="font-medium text-gray-800 text-sm">{r.serviceDate}</span>
                        <span className="text-iks-navy text-sm ml-2 font-mono text-xs">{r.roNumber}</span>
                      </div>
                      <span className="font-medium text-sm">฿{formatBahtReal(r.totalCost)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{r.serviceType} — {r.serviceDetail}</div>
                    <div className="flex gap-4 text-xs text-gray-400 mt-1">
                      <span>{r.serviceCenter}</span>
                      {r.serviceAdvisor && <span>ที่ปรึกษา: {r.serviceAdvisor}</span>}
                      {r.mileage > 0 && <span>ระยะ {formatBahtReal(r.mileage)} กม.</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">ยังไม่มีประวัติการเข้าศูนย์รถคันนี้</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
