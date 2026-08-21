"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Whale from "@/components/Whale";
import {
  realCompanies, realVehicles, realServiceRecords, formatBahtReal,
} from "@/lib/realDataLoader";
import {
  Building2, Users, Truck, Wrench, Coins, ArrowRight, ChevronDown,
} from "lucide-react";
import Link from "next/link";

const MONTH_TH = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const YEARS = [2025, 2026];

export default function DashboardPage() {
  const [filterYear,  setFilterYear]  = useState<number|"all">("all");
  const [filterMonth, setFilterMonth] = useState<number|"all">("all");

  // ── Filtered service records ──────────────────────────────
  const filteredSR = useMemo(() =>
    realServiceRecords.filter(s => {
      if (!s.serviceDateISO) return false;
      const y = parseInt(s.serviceDateISO.slice(0,4));
      const m = parseInt(s.serviceDateISO.slice(5,7));
      if (filterYear  !== "all" && y !== filterYear)  return false;
      if (filterMonth !== "all" && m !== filterMonth) return false;
      return true;
    }), [filterYear, filterMonth]
  );

  // ── Static counts (snapshot, not filtered by month) ───────
  const totalCompanies = realCompanies.length;
  const iksCustomers   = realCompanies.filter(c => c.iksPurchaseStatus === "IKS_CUSTOMER").length;
  const nonIksSvc      = realCompanies.filter(c => c.iksPurchaseStatus === "NON_IKS_CUSTOMER").length;
  const totalVehicles  = realVehicles.length;
  const iksVehicles    = realVehicles.filter(v => v.ownershipStatus === "IKS_PURCHASE").length;

  // ── Opportunity counts (real) ─────────────────────────────
  const noTyreVeh    = realVehicles.filter(v => !v.lastTyreDate).length;
  const noBattVeh    = realVehicles.filter(v => !v.lastBatteryDate).length;
  const noISPVeh     = realVehicles.filter(v => !v.lastISPDate).length;

  // ── Filtered metrics ──────────────────────────────────────
  const totalServiceVisits = new Set(filteredSR.map(s => s.roNumber)).size;
  const totalCost          = filteredSR.reduce((sum,s) => sum + s.totalCost, 0);
  const companyServiceCount: Record<string,number> = {};
  const companyServiceCost:  Record<string,number> = {};
  filteredSR.forEach(s => {
    companyServiceCount[s.companyId] = (companyServiceCount[s.companyId]||0) + 1;
    companyServiceCost[s.companyId]  = (companyServiceCost[s.companyId] ||0) + s.totalCost;
  });
  const avgCostPerVisit = totalServiceVisits > 0
    ? Math.round(totalCost / totalServiceVisits) : 0;

  const topServiceCos = Object.entries(companyServiceCount)
    .sort((a,b) => b[1]-a[1]).slice(0,5)
    .map(([id,count]) => ({ c: realCompanies.find(c=>c.id===id)!, count })).filter(x=>x.c);

  const topCostCos = Object.entries(companyServiceCost)
    .sort((a,b) => b[1]-a[1]).slice(0,5)
    .map(([id,cost]) => ({ c: realCompanies.find(c=>c.id===id)!, cost })).filter(x=>x.c);

  const filterLabel = filterYear === "all" ? "ทั้งหมด"
    : filterMonth === "all" ? `ปี ${filterYear+543}` : `${MONTH_TH[filterMonth]} ${filterYear+543}`;

  return (
    <AppShell>
      <Breadcrumb items={[{ label:"Dashboard" }]}/>

      {/* ── Month Filter ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm font-medium text-gray-600">แสดงข้อมูล:</span>
        <div className="relative">
          <select value={filterYear === "all" ? "all" : filterYear}
            onChange={e => { setFilterYear(e.target.value==="all"?"all":parseInt(e.target.value)); setFilterMonth("all"); }}
            className="appearance-none bg-white border border-iks-border rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 outline-none cursor-pointer">
            <option value="all">ทุกปี</option>
            {YEARS.map(y => <option key={y} value={y}>พ.ศ. {y+543}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        </div>
        {filterYear !== "all" && (
          <div className="relative">
            <select value={filterMonth === "all" ? "all" : filterMonth}
              onChange={e => setFilterMonth(e.target.value==="all"?"all":parseInt(e.target.value))}
              className="appearance-none bg-white border border-iks-border rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 outline-none cursor-pointer">
              <option value="all">ทุกเดือน</option>
              {MONTH_TH.slice(1).map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
        )}
        <div className="flex gap-1">
          <QuickBtn label="ทั้งหมด"  active={filterYear==="all"}           onClick={() => { setFilterYear("all"); setFilterMonth("all"); }}/>
          <QuickBtn label="2568"      active={filterYear===2025&&filterMonth==="all"} onClick={() => { setFilterYear(2025); setFilterMonth("all"); }}/>
          <QuickBtn label="2569"      active={filterYear===2026&&filterMonth==="all"} onClick={() => { setFilterYear(2026); setFilterMonth("all"); }}/>
        </div>
        <span className="text-xs text-gray-400 ml-auto">📅 {filterLabel} — {filteredSR.length.toLocaleString()} รายการ</span>
      </div>

      {/* ── Row 1: Snapshot (ไม่เปลี่ยนตาม filter เดือน) ── */}
      <p className="text-xs text-gray-400 mb-2">ข้อมูลรวม (snapshot)</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-3">
        <KpiCard icon={<Building2 size={20}/>} label="บริษัททั้งหมด"      value={totalCompanies} unit="บริษัท" bg="bg-iks-navy/5"  color="text-iks-navy"/>
        <KpiCard icon={<Users size={20}/>}     label="ลูกค้าซื้อกับ IKS"  value={iksCustomers}   unit="บริษัท" bg="bg-green-50"    color="text-green-600"/>
        <KpiCard icon={<Users size={20}/>}     label="เข้าศูนย์ ไม่ซื้อ IKS" value={nonIksSvc}  unit="บริษัท" bg="bg-orange-50"   color="text-orange-600" badge="โอกาสขาย"/>
        <KpiCard icon={<Truck size={20}/>}     label="รถทั้งหมด"           value={totalVehicles} unit="คัน"    bg="bg-iks-navy/5"  color="text-iks-navy"/>
        <KpiCard icon={<Truck size={20}/>}     label="รถซื้อกับ IKS"       value={iksVehicles}   unit="คัน"    bg="bg-green-50"    color="text-green-600"/>
      </div>

      {/* ── Row 2: Service (เปลี่ยนตาม filter เดือน) ── */}
      <p className="text-xs text-gray-400 mb-2">ข้อมูลการเข้าศูนย์ ({filterLabel})</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-5">
        <KpiCard icon={<Wrench size={20}/>} label="จำนวนครั้งเข้าศูนย์" value={totalServiceVisits.toLocaleString()} unit="ครั้ง" bg="bg-iks-copper/10" color="text-iks-copper"/>
        <KpiCard icon={<Coins size={20}/>}  label="ยอดค่าใช้จ่ายรวม"   value={"฿"+formatBahtReal(totalCost)}       bg="bg-iks-copper/10"  color="text-iks-copper"/>
        <KpiCard icon={<Coins size={20}/>}  label="เฉลี่ยต่อครั้ง"      value={avgCostPerVisit > 0 ? "฿"+formatBahtReal(avgCostPerVisit) : "-"} bg="bg-iks-copper/5" color="text-iks-copper"/>
      </div>

      {/* ── Row 3: Opportunities (real) ── */}
      <p className="text-xs text-gray-400 mb-2">โอกาสขาย (ข้อมูลจริง)</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <OppCard icon="🔵" label="ยังไม่ซื้อยาง"    value={noTyreVeh}  total={totalVehicles} href="/company"/>
        <OppCard icon="🔋" label="ยังไม่ซื้อแบต"    value={noBattVeh}  total={totalVehicles} href="/company"/>
        <OppCard icon="🛡️" label="ยังไม่ซื้อ ISP"   value={noISPVeh}   total={totalVehicles} href="/company"/>
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Panel title={`เข้าศูนย์บ่อยที่สุด (${filterLabel})`} href="/customers/serviced">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 text-xs"><th className="font-normal pb-2">#</th><th className="font-normal pb-2">บริษัท</th><th className="font-normal pb-2 text-right">ครั้ง</th></tr></thead>
                <tbody>
                  {topServiceCos.length > 0 ? topServiceCos.map(({ c, count }, i) => (
                    <tr key={c.id} className="table-row-hover border-t border-iks-border">
                      <td className="py-2 text-gray-400">{i+1}</td>
                      <td className="py-2"><Link href={`/company/${c.id}`} className="text-iks-navy hover:underline">{c.name}</Link></td>
                      <td className="py-2 text-right font-medium">{count}</td>
                    </tr>
                  )) : <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">ไม่มีข้อมูล</td></tr>}
                </tbody>
              </table>
            </Panel>

            <Panel title={`ยอดค่าใช้จ่ายสูงสุด (${filterLabel})`} href="/customers/serviced">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 text-xs"><th className="font-normal pb-2">#</th><th className="font-normal pb-2">บริษัท</th><th className="font-normal pb-2 text-right">ยอดสะสม</th></tr></thead>
                <tbody>
                  {topCostCos.length > 0 ? topCostCos.map(({ c, cost }, i) => (
                    <tr key={c.id} className="table-row-hover border-t border-iks-border">
                      <td className="py-2 text-gray-400">{i+1}</td>
                      <td className="py-2"><Link href={`/company/${c.id}`} className="text-iks-navy hover:underline">{c.name}</Link></td>
                      <td className="py-2 text-right font-medium">฿{formatBahtReal(cost)}</td>
                    </tr>
                  )) : <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">ไม่มีข้อมูล</td></tr>}
                </tbody>
              </table>
            </Panel>
          </div>

          {/* Monthly breakdown */}
          {filterYear !== "all" && (
            <Panel title={`สรุปรายเดือน ปี พ.ศ. ${filterYear+543}`} href="/service-history">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-xs">
                    <th className="font-normal pb-2">เดือน</th>
                    <th className="font-normal pb-2 text-center">ครั้งเข้าศูนย์</th>
                    <th className="font-normal pb-2 text-right">ยอดค่าใช้จ่าย</th>
                    <th className="font-normal pb-2 text-center">บริษัท</th>
                  </tr></thead>
                  <tbody>
                    {MONTH_TH.slice(1).map((mLabel, mi) => {
                      const mn = mi + 1;
                      const mSR = realServiceRecords.filter(s => {
                        if (!s.serviceDateISO) return false;
                        return parseInt(s.serviceDateISO.slice(0,4)) === filterYear &&
                               parseInt(s.serviceDateISO.slice(5,7)) === mn;
                      });
                      const ro   = new Set(mSR.map(s=>s.roNumber)).size;
                      const cost = mSR.reduce((sum,s)=>sum+s.totalCost,0);
                      const cos  = new Set(mSR.map(s=>s.companyId)).size;
                      const sel  = filterMonth === mn;
                      return (
                        <tr key={mn} onClick={() => setFilterMonth(filterMonth===mn?"all":mn)}
                          className={`border-t border-iks-border cursor-pointer transition-colors ${sel?"bg-iks-navy/5":ro>0?"table-row-hover":"text-gray-300"}`}>
                          <td className={`py-2 font-medium ${sel?"text-iks-navy":""}`}>{sel?"▶ ":""}{mLabel}</td>
                          <td className="py-2 text-center">{ro>0?ro:"-"}</td>
                          <td className="py-2 text-right">{cost>0?"฿"+formatBahtReal(cost):"-"}</td>
                          <td className="py-2 text-center">{cos>0?cos:"-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">คลิกเดือนเพื่อ filter · คลิกอีกครั้งเพื่อยกเลิก</p>
            </Panel>
          )}
        </div>

        {/* Right: Whale + branch breakdown */}
        <div className="space-y-5">
          <div className="bg-gradient-to-b from-iks-navy to-iks-navyDark rounded-xl p-5 text-white">
            <div className="flex justify-center mb-3"><Whale size={64}/></div>
            <div className="font-semibold text-center mb-1">✨ ผู้ช่วย IKS</div>
            <p className="text-sm text-white/85 text-center leading-relaxed">
              {filterYear !== "all"
                ? `${filterLabel} — เข้าศูนย์ ${totalServiceVisits.toLocaleString()} ครั้ง จาก ${Object.keys(companyServiceCount).length} บริษัท`
                : `ข้อมูลรวม ${totalCompanies} บริษัท · ${totalVehicles.toLocaleString()} คัน · ${totalServiceVisits.toLocaleString()} ครั้งเข้าศูนย์`
              }
            </p>
            <div className="grid gap-2 mt-4">
              <Link href="/visit-log/new" className="bg-iks-copper hover:bg-iks-copperDark text-center rounded-lg py-2.5 text-sm font-medium">+ บันทึกการเข้าเยี่ยม</Link>
              <Link href="/customers/serviced" className="bg-white/10 hover:bg-white/20 text-center rounded-lg py-2.5 text-sm font-medium">ดูลูกค้าที่ซ่อมรถ</Link>
            </div>
          </div>

          {/* Branch breakdown */}
          <Panel title="ยอดเข้าศูนย์แยกสาขา" href="/service-history">
            {(() => {
              const byC: Record<string,number> = {};
              filteredSR.forEach(s => { byC[s.serviceCenter] = (byC[s.serviceCenter]||0) + s.totalCost; });
              const sorted = Object.entries(byC).sort((a,b)=>b[1]-a[1]);
              return sorted.length > 0 ? (
                <div className="space-y-2">
                  {sorted.map(([center, cost]) => {
                    const pct = totalCost > 0 ? Math.round((cost/totalCost)*100) : 0;
                    // Shorten center name
                    const short = center.replace("บริษัท อีซูซุกรุงเทพบริการ จำกัด","IKS").replace("(","").replace(")","").trim();
                    return (
                      <div key={center}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="truncate pr-2">{short}</span>
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

// ─── Small components ─────────────────────────────────────────
function QuickBtn({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${active?"bg-iks-navy text-white border-iks-navy":"bg-white text-gray-600 border-iks-border hover:bg-iks-surface"}`}>
      {label}
    </button>
  );
}

function KpiCard({ icon, label, value, unit, bg, color, badge }: {
  icon: React.ReactNode; label: string; value: string|number; unit?: string;
  bg: string; color: string; badge?: string;
}) {
  return (
    <div className={`rounded-xl border border-iks-border p-4 shadow-card bg-white`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
          <span className={color}>{icon}</span>
        </div>
        {badge && <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-1.5 py-0.5">{badge}</span>}
      </div>
      <div className="text-xl font-bold text-gray-800">{value} {unit && <span className="text-xs font-normal text-gray-400">{unit}</span>}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function OppCard({ icon, label, value, total, href }: { icon:string; label:string; value:number; total:number; href:string }) {
  const pct = total > 0 ? Math.round((value/total)*100) : 0;
  return (
    <Link href={href} className="bg-orange-50 border border-orange-200 rounded-xl p-4 hover:border-orange-400 transition-colors block">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] bg-orange-100 text-orange-600 border border-orange-200 rounded-full px-2 py-0.5">โอกาสขาย</span>
      </div>
      <div className="text-2xl font-bold text-orange-700">{value.toLocaleString()} <span className="text-sm font-normal text-gray-500">คัน</span></div>
      <div className="text-xs text-gray-500 mt-0.5">{label} ({pct}% ของ {total.toLocaleString()} คัน)</div>
      <div className="h-1.5 rounded-full bg-white/80 mt-2">
        <div className="h-full bg-orange-400 rounded-full" style={{width:`${pct}%`}}/>
      </div>
    </Link>
  );
}

function Panel({ title, href, children }: { title:string; href:string; children:React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        <Link href={href} className="text-xs text-iks-navy hover:underline flex items-center gap-1">ดูทั้งหมด <ArrowRight size={12}/></Link>
      </div>
      {children}
    </div>
  );
}
