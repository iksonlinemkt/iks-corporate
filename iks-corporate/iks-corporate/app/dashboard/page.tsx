"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import Whale from "@/components/Whale";
import {
  realCompanies, realVehicles, realServiceRecords, realCompanySummary, formatBahtReal,
} from "@/lib/realDataLoader";
import {
  Building2, Users, MessageSquare, Truck, Wrench, Coins, ClipboardCheck, Star, ArrowRight, ChevronDown,
} from "lucide-react";
import Link from "next/link";

const MONTH_TH = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const YEARS = [2025, 2026];

export default function DashboardPage() {
  const [filterYear, setFilterYear]   = useState<number | "all">("all");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");

  // ── Filtered service records ────────────────────────────────
  const filteredSR = useMemo(() =>
    realServiceRecords.filter(s => {
      if (!s.serviceDateISO) return false;
      const y = parseInt(s.serviceDateISO.slice(0,4));
      const m = parseInt(s.serviceDateISO.slice(5,7));
      if (filterYear  !== "all" && y !== filterYear)  return false;
      if (filterMonth !== "all" && m !== filterMonth) return false;
      return true;
    }),
    [filterYear, filterMonth]
  );

  // ── Summary from filtered records ───────────────────────────
  const totalServiceVisits = new Set(filteredSR.map(s => s.roNumber)).size;
  const totalCost          = filteredSR.reduce((sum, s) => sum + s.totalCost, 0);

  // ── Static (not affected by month filter) ───────────────────
  const totalCompanies = realCompanies.length;
  const iksCustomers   = realCompanies.filter(c => c.iksPurchaseStatus === "IKS_CUSTOMER").length;
  const nonIksServiced = realCompanies.filter(c => c.iksPurchaseStatus === "NON_IKS_CUSTOMER").length;
  const totalVehicles  = realVehicles.length;

  // ── Top 5 companies by filtered service records ─────────────
  const companyServiceCount: Record<string,number> = {};
  const companyServiceCost:  Record<string,number> = {};
  filteredSR.forEach(s => {
    companyServiceCount[s.companyId] = (companyServiceCount[s.companyId] || 0) + 1;
    companyServiceCost[s.companyId]  = (companyServiceCost[s.companyId]  || 0) + s.totalCost;
  });

  const topServiceCompanies = Object.entries(companyServiceCount)
    .sort((a,b) => b[1] - a[1]).slice(0,5)
    .map(([id,count]) => ({ c: realCompanies.find(c=>c.id===id)!, count }))
    .filter(x => x.c);

  const topCostCompanies = Object.entries(companyServiceCost)
    .sort((a,b) => b[1] - a[1]).slice(0,5)
    .map(([id,cost]) => ({ c: realCompanies.find(c=>c.id===id)!, cost }))
    .filter(x => x.c);

  // ── Filter label for display ────────────────────────────────
  const filterLabel = filterYear === "all"
    ? "ข้อมูลทั้งหมด"
    : filterMonth === "all"
      ? `ปี ${filterYear + 543}`
      : `${MONTH_TH[filterMonth]} ${filterYear + 543}`;

  return (
    <AppShell>
      <Breadcrumb items={[{ label:"Dashboard" }]} />

      {/* ── Month Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-600">แสดงข้อมูล:</span>

        {/* Year */}
        <div className="relative">
          <select
            value={filterYear === "all" ? "all" : filterYear}
            onChange={e => {
              const v = e.target.value;
              setFilterYear(v === "all" ? "all" : parseInt(v));
              setFilterMonth("all");
            }}
            className="appearance-none bg-white border border-iks-border rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-iks-navy/20 cursor-pointer"
          >
            <option value="all">ทุกปี</option>
            {YEARS.map(y => <option key={y} value={y}>พ.ศ. {y+543}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        </div>

        {/* Month (only if year selected) */}
        {filterYear !== "all" && (
          <div className="relative">
            <select
              value={filterMonth === "all" ? "all" : filterMonth}
              onChange={e => {
                const v = e.target.value;
                setFilterMonth(v === "all" ? "all" : parseInt(v));
              }}
              className="appearance-none bg-white border border-iks-border rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-iks-navy/20 cursor-pointer"
            >
              <option value="all">ทุกเดือน</option>
              {MONTH_TH.slice(1).map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
        )}

        {/* Quick month buttons */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => { setFilterYear("all"); setFilterMonth("all"); }}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${filterYear==="all"?"bg-iks-navy text-white border-iks-navy":"bg-white text-gray-600 border-iks-border hover:bg-iks-surface"}`}
          >ทั้งหมด</button>
          {[{y:2025,m:null,label:"2568"},{y:2026,m:null,label:"2569"}].map(item => (
            <button key={item.label}
              onClick={() => { setFilterYear(item.y); setFilterMonth("all"); }}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${filterYear===item.y && filterMonth==="all"?"bg-iks-navy text-white border-iks-navy":"bg-white text-gray-600 border-iks-border hover:bg-iks-surface"}`}
            >{item.label}</button>
          ))}
        </div>

        <span className="text-xs text-gray-400 ml-auto">
          📅 {filterLabel} — {filteredSR.length} รายการเข้าศูนย์
        </span>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Building2 size={20}/>} label="จำนวนบริษัททั้งหมด"
          value={totalCompanies} unit="บริษัท" />
        <StatCard icon={<Users size={20}/>} label="ลูกค้าที่ซื้อรถกับ IKS"
          value={iksCustomers} unit="บริษัท"
          iconBg="bg-green-50" iconColor="text-green-600"/>
        <StatCard icon={<MessageSquare size={20}/>} label="ลูกค้าที่เข้าศูนย์แต่ไม่ซื้อกับ IKS"
          value={nonIksServiced} unit="บริษัท"
          iconBg="bg-orange-50" iconColor="text-orange-600"/>
        <StatCard icon={<Truck size={20}/>} label="รถทั้งหมด"
          value={totalVehicles} unit="คัน"/>
        {/* These 2 change with month filter */}
        <StatCard icon={<Wrench size={20}/>}
          label={`จำนวนครั้งเข้าศูนย์ (${filterLabel})`}
          value={totalServiceVisits} unit="ครั้ง"
          iconBg="bg-iks-copper/10" iconColor="text-iks-copper"/>
        <StatCard icon={<Coins size={20}/>}
          label={`ยอดค่าใช้จ่าย (${filterLabel})`}
          value={"฿"+formatBahtReal(totalCost)}
          iconBg="bg-iks-copper/10" iconColor="text-iks-copper"/>
        <StatCard icon={<ClipboardCheck size={20}/>} label="บริษัทที่มีข้อมูลเข้าศูนย์"
          value={Object.keys(companyServiceCount).length} unit="บริษัท"
          iconBg="bg-blue-50" iconColor="text-blue-600"/>
        <StatCard icon={<Star size={20}/>} label="เฉลี่ยค่าซ่อมต่อครั้ง"
          value={totalServiceVisits > 0 ? "฿"+formatBahtReal(totalCost/totalServiceVisits) : "-"}
          iconBg="bg-yellow-50" iconColor="text-yellow-600"/>
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Panel title={`บริษัทที่เข้าศูนย์บ่อยที่สุด (${filterLabel})`} href="/customers/serviced">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs">
                    <th className="font-normal pb-2">#</th>
                    <th className="font-normal pb-2">ชื่อบริษัท</th>
                    <th className="font-normal pb-2 text-right">ครั้ง</th>
                  </tr>
                </thead>
                <tbody>
                  {topServiceCompanies.length > 0 ? topServiceCompanies.map(({ c, count }, i) => (
                    <tr key={c.id} className="table-row-hover border-t border-iks-border">
                      <td className="py-2 text-gray-400">{i+1}</td>
                      <td className="py-2">
                        <Link href={`/company/${c.id}`} className="text-iks-navy hover:underline">{c.name}</Link>
                      </td>
                      <td className="py-2 text-right font-medium">{count}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">ไม่มีข้อมูลในช่วงนี้</td></tr>
                  )}
                </tbody>
              </table>
            </Panel>

            <Panel title={`บริษัทที่มียอดค่าใช้จ่ายสูงสุด (${filterLabel})`} href="/customers/serviced">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs">
                    <th className="font-normal pb-2">#</th>
                    <th className="font-normal pb-2">ชื่อบริษัท</th>
                    <th className="font-normal pb-2 text-right">ยอดสะสม</th>
                  </tr>
                </thead>
                <tbody>
                  {topCostCompanies.length > 0 ? topCostCompanies.map(({ c, cost }, i) => (
                    <tr key={c.id} className="table-row-hover border-t border-iks-border">
                      <td className="py-2 text-gray-400">{i+1}</td>
                      <td className="py-2">
                        <Link href={`/company/${c.id}`} className="text-iks-navy hover:underline">{c.name}</Link>
                      </td>
                      <td className="py-2 text-right font-medium">฿{formatBahtReal(cost)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">ไม่มีข้อมูลในช่วงนี้</td></tr>
                  )}
                </tbody>
              </table>
            </Panel>
          </div>

          {/* Monthly breakdown when year is selected */}
          {filterYear !== "all" && (
            <Panel title={`สรุปรายเดือน ปี พ.ศ. ${filterYear+543}`} href="/service-history">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs">
                      <th className="font-normal pb-2">เดือน</th>
                      <th className="font-normal pb-2 text-center">ครั้งเข้าศูนย์</th>
                      <th className="font-normal pb-2 text-right">ยอดค่าใช้จ่าย</th>
                      <th className="font-normal pb-2 text-center">บริษัท</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTH_TH.slice(1).map((mLabel, mi) => {
                      const monthNum = mi + 1;
                      const monthSR = realServiceRecords.filter(s => {
                        if (!s.serviceDateISO) return false;
                        return parseInt(s.serviceDateISO.slice(0,4)) === filterYear &&
                               parseInt(s.serviceDateISO.slice(5,7)) === monthNum;
                      });
                      const ro = new Set(monthSR.map(s=>s.roNumber)).size;
                      const cost = monthSR.reduce((sum,s)=>sum+s.totalCost,0);
                      const companies = new Set(monthSR.map(s=>s.companyId)).size;
                      const isSelected = filterMonth === monthNum;
                      return (
                        <tr key={monthNum}
                          className={`border-t border-iks-border cursor-pointer transition-colors ${isSelected?"bg-iks-navy/5":ro>0?"table-row-hover":"text-gray-300"}`}
                          onClick={() => setFilterMonth(filterMonth === monthNum ? "all" : monthNum)}
                        >
                          <td className={`py-2 font-medium ${isSelected?"text-iks-navy":""}`}>
                            {isSelected && "▶ "}{mLabel}
                          </td>
                          <td className="py-2 text-center">{ro > 0 ? ro : "-"}</td>
                          <td className="py-2 text-right">{cost > 0 ? "฿"+formatBahtReal(cost) : "-"}</td>
                          <td className="py-2 text-center">{companies > 0 ? companies : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">คลิกเดือนเพื่อ filter / คลิกอีกครั้งเพื่อยกเลิก</p>
            </Panel>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="space-y-5">
          <div className="bg-gradient-to-b from-iks-navy to-iks-navyDark rounded-xl p-5 text-white">
            <div className="flex justify-center mb-3"><Whale size={64}/></div>
            <div className="font-semibold text-center mb-1">✨ ผู้ช่วย IKS</div>
            <p className="text-sm text-white/85 text-center leading-relaxed">
              {filterYear !== "all"
                ? `${filterLabel} — มีการเข้าศูนย์ ${totalServiceVisits} ครั้ง จาก ${Object.keys(companyServiceCount).length} บริษัท`
                : `ข้อมูลรวมทั้งหมด: เข้าศูนย์ ${totalServiceVisits} ครั้ง ยอดรวม ฿${formatBahtReal(totalCost)}`
              } 😊
            </p>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <Link href="/visit-log/new"
                className="bg-iks-copper hover:bg-iks-copperDark text-center rounded-lg py-2.5 text-sm font-medium transition-colors">
                + เพิ่มงานติดตาม
              </Link>
              <Link href="/visit-log/new"
                className="bg-white/10 hover:bg-white/20 text-center rounded-lg py-2.5 text-sm font-medium transition-colors">
                วางแผนการเข้าเยี่ยม
              </Link>
            </div>
          </div>

          {/* Service cost by branch (filtered) */}
          <Panel title="ยอดเข้าศูนย์แยกสาขา" href="/service-history">
            {(() => {
              const byCenter: Record<string,number> = {};
              filteredSR.forEach(s => {
                byCenter[s.serviceCenter] = (byCenter[s.serviceCenter]||0) + s.totalCost;
              });
              const sorted = Object.entries(byCenter).sort((a,b)=>b[1]-a[1]);
              return sorted.length > 0 ? (
                <div className="space-y-2">
                  {sorted.map(([center, cost]) => {
                    const pct = totalCost > 0 ? Math.round((cost/totalCost)*100) : 0;
                    return (
                      <div key={center}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="truncate pr-2">{center}</span>
                          <span className="shrink-0 font-medium">฿{formatBahtReal(cost)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-iks-surface">
                          <div className="h-full bg-iks-navy rounded-full" style={{width:`${pct}%`}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-gray-400 text-sm text-center py-4">ไม่มีข้อมูลในช่วงนี้</p>;
            })()}
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
          ดูทั้งหมด <ArrowRight size={12}/>
        </Link>
      </div>
      {children}
    </div>
  );
}
