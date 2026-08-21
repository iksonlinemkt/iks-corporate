import companiesRaw    from "./data/companies.json";
import vehiclesRaw     from "./data/vehicles.json";
import serviceRaw      from "./data/serviceRecords.json";

// ─── Types ───────────────────────────────────────────────────
export type MemberStatus = "Diamond"|"Platinum"|"Gold"|"Silver"|null;

export interface RealCompany {
  id: string; name: string; taxId: string;
  iksPurchaseStatus: string; opportunityLevel: string;
  branch: string; salesOwner: string;
  contactName: string; contactPosition: string; contactPhone: string;
  address: string; businessType: string; province: string;
  customerGrade: string; memberStatus: MemberStatus; memberSince: string|null;
  hasSalesData: boolean;
}

export interface RealVehicle {
  id: string; companyId: string;
  engineNumber: string; registrationNumber: string;
  vehicleModel: string; vehicleGroup: string; vehicleSubtype: string;
  chassisNumber: string; ownershipStatus: string; vehicleStatus: string;
  purchaseYear?: number; purchaseDateISO?: string; sellingPrice?: number;
  lastTyreDate:    string|null;
  lastBatteryDate: string|null;
  lastISPDate:     string|null;
}

export interface RealServiceRecord {
  id: string; companyId: string; vehicleId: string;
  roNumber: string; serviceDate: string; serviceDateISO: string;
  serviceType: string; serviceDetail: string; mileage: number;
  serviceCenter: string; serviceAdvisor: string;
  totalCost: number; warrantyCost: number; customerPaidAmount: number;
  boughtTyre:    boolean;
  boughtBattery: boolean;
  boughtISP:     boolean;
}

// ─── Data ────────────────────────────────────────────────────
export const realCompanies     = companiesRaw as RealCompany[];
export const realVehicles      = vehiclesRaw  as RealVehicle[];
export const realServiceRecords = serviceRaw  as RealServiceRecord[];

// ─── Lookups ─────────────────────────────────────────────────
export const getRealCompanyById  = (id: string) => realCompanies.find(c => c.id === id);
export const getRealVehicleById  = (id: string) => realVehicles.find(v => v.id === id);
export const getRealCompanyVehicles = (companyId: string) =>
  realVehicles.filter(v => v.companyId === companyId);
export const getRealVehicleServiceRecords = (vehicleId: string) =>
  realServiceRecords.filter(s => s.vehicleId === vehicleId)
    .sort((a,b) => b.serviceDateISO.localeCompare(a.serviceDateISO));
export const getRealCompanyServiceRecords = (companyId: string) =>
  realServiceRecords.filter(s => s.companyId === companyId)
    .sort((a,b) => b.serviceDateISO.localeCompare(a.serviceDateISO));

// ─── Cost helper: sum cost per unique RO (avoid double-counting
//     when one RO covers multiple vehicles in the same fleet visit) ──
export function sumCostByRO(records: RealServiceRecord[]): number {
  const seen = new Set<string>();
  let total = 0;
  for (const s of records) {
    if (!seen.has(s.roNumber)) {
      seen.add(s.roNumber);
      total += s.totalCost;
    }
  }
  return total;
}

// ─── Company Summary ─────────────────────────────────────────
export function realCompanySummary(companyId: string) {
  const vs  = getRealCompanyVehicles(companyId);
  const srs = getRealCompanyServiceRecords(companyId);
  const roSet     = new Set(srs.map(s => s.roNumber));
  // ใช้ sumCostByRO เพื่อไม่นับ cost ซ้ำเมื่อ RO เดียวครอบหลายคัน
  const totalCost = sumCostByRO(srs);
  const withSvc   = new Set(srs.map(s => s.vehicleId));

  // Tyre / Battery / ISP from vehicle fields
  const tyreV    = vs.filter(v => v.lastTyreDate).length;
  const battV    = vs.filter(v => v.lastBatteryDate).length;
  const ispV     = vs.filter(v => v.lastISPDate).length;

  return {
    totalVehicles:    vs.length,
    iksVehicles:      vs.filter(v => v.ownershipStatus === "IKS_PURCHASE").length,
    nonIksVehicles:   vs.filter(v => v.ownershipStatus !== "IKS_PURCHASE").length,
    vehiclesServiced: withSvc.size,
    totalServiceCount: roSet.size,
    totalServiceCost:  totalCost,
    tyreCount:    tyreV,
    batteryCount: battV,
    ispCount:     ispV,
    noTyreCount:    vs.length - tyreV,
    noBatteryCount: vs.length - battV,
    noISPCount:     vs.length - ispV,
    lastVisitDate:  undefined as string|undefined,
    nextTaskDate:   undefined as string|undefined,
  };
}

// ─── Vehicle Summary ─────────────────────────────────────────
export function realVehicleSummary(vehicleId: string) {
  const srs = getRealVehicleServiceRecords(vehicleId);
  const roSet     = new Set(srs.map(s => s.roNumber));
  const totalCost = srs.reduce((sum,s) => sum + s.totalCost, 0);
  const last      = srs[0];
  const typeCounts: Record<string,number> = {};
  srs.forEach(s => (typeCounts[s.serviceType] = (typeCounts[s.serviceType]||0)+1));
  const topType = Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0]?.[0];
  return {
    serviceCount: roSet.size, totalCost,
    lastServiceDate:    last?.serviceDate,
    lastServiceDateISO: last?.serviceDateISO,
    lastServiceCost:    last?.totalCost,
    topServiceType:     topType,
    lastMileage:        last?.mileage,
  };
}

// ─── Member / Grade helpers ───────────────────────────────────
export const MEMBER_COLOR: Record<string,string> = {
  Diamond:  "bg-cyan-50 text-cyan-700 border-cyan-300",
  Platinum: "bg-purple-50 text-purple-700 border-purple-300",
  Gold:     "bg-yellow-50 text-yellow-700 border-yellow-300",
  Silver:   "bg-gray-100 text-gray-600 border-gray-300",
};
export const MEMBER_ICON: Record<string,string> = {
  Diamond:"💎", Platinum:"🏆", Gold:"⭐", Silver:"🥈",
};

export const formatBahtReal = (n: number) =>
  new Intl.NumberFormat("th-TH").format(Math.round(n));
