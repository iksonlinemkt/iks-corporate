/**
 * lib/dataService.ts — Async data functions (MySQL version)
 * แทน realDataLoader.ts ที่ใช้ static JSON import
 */
import pool from "./db";
import type { RealCompany, RealVehicle, RealServiceRecord } from "./realDataLoader";

function toDate(v: unknown): string | null {
  if (!v) return null;
  const d = v as Date;
  return d instanceof Date ? d.toISOString().split("T")[0] : String(v).slice(0, 10);
}

function mapCompany(r: Record<string, unknown>): RealCompany {
  return {
    id:                String(r.id),
    name:              String(r.name),
    taxId:             String(r.taxId || ""),
    iksPurchaseStatus: String(r.iksPurchaseStatus || ""),
    opportunityLevel:  String(r.opportunityLevel || ""),
    branch:            String(r.branch || ""),
    salesOwner:        String(r.salesOwner || ""),
    contactName:       String(r.contactName || ""),
    contactPosition:   String(r.contactPosition || ""),
    contactPhone:      String(r.contactPhone || ""),
    address:           String(r.address || ""),
    businessType:      String(r.businessType || ""),
    province:          String(r.province || ""),
    customerGrade:     String(r.customerGrade || ""),
    memberStatus:      (r.memberStatus as any) || null,
    memberSince:       toDate(r.memberSince),
    hasSalesData:      r.hasSalesData === 1 || r.hasSalesData === true,
  };
}

function mapVehicle(r: Record<string, unknown>): RealVehicle {
  return {
    id:                 String(r.id),
    companyId:          String(r.companyId),
    engineNumber:       String(r.engineNumber || ""),
    registrationNumber: String(r.registrationNumber || ""),
    vehicleModel:       String(r.vehicleModel || ""),
    vehicleGroup:       String(r.vehicleGroup || ""),
    vehicleSubtype:     String(r.vehicleSubtype || ""),
    chassisNumber:      String(r.chassisNumber || ""),
    ownershipStatus:    String(r.ownershipStatus || ""),
    vehicleStatus:      String(r.vehicleStatus || ""),
    purchaseYear:       r.purchaseYear ? Number(r.purchaseYear) : undefined,
    purchaseDateISO:    toDate(r.purchaseDateISO) ?? undefined,
    sellingPrice:       r.sellingPrice ? Number(r.sellingPrice) : undefined,
    lastTyreDate:       toDate(r.lastTyreDate),
    lastBatteryDate:    toDate(r.lastBatteryDate),
    lastISPDate:        toDate(r.lastISPDate),
  };
}

function mapServiceRecord(r: Record<string, unknown>): RealServiceRecord {
  return {
    id:                 String(r.id),
    companyId:          String(r.companyId),
    vehicleId:          String(r.vehicleId),
    roNumber:           String(r.roNumber || ""),
    serviceDate:        String(r.serviceDate || ""),
    serviceDateISO:     toDate(r.serviceDateISO) || "",
    serviceType:        String(r.serviceType || ""),
    serviceDetail:      String(r.serviceDetail || ""),
    mileage:            Number(r.mileage || 0),
    serviceCenter:      String(r.serviceCenter || ""),
    serviceAdvisor:     String(r.serviceAdvisor || ""),
    totalCost:          Number(r.totalCost || 0),
    warrantyCost:       Number(r.warrantyCost || 0),
    customerPaidAmount: Number(r.customerPaidAmount || 0),
    boughtTyre:         r.boughtTyre === 1 || r.boughtTyre === true,
    boughtBattery:      r.boughtBattery === 1 || r.boughtBattery === true,
    boughtISP:          r.boughtISP === 1 || r.boughtISP === true,
  };
}

// ── Company queries ───────────────────────────────────────────

export async function getCompanies(): Promise<RealCompany[]> {
  const [rows] = await pool.query("SELECT * FROM companies ORDER BY name");
  return (rows as Record<string, unknown>[]).map(mapCompany);
}

export async function getCompanyById(id: string): Promise<RealCompany | undefined> {
  const [rows] = await pool.query("SELECT * FROM companies WHERE id = ? LIMIT 1", [id]);
  const list = rows as Record<string, unknown>[];
  return list.length ? mapCompany(list[0]) : undefined;
}

// ── Vehicle queries ───────────────────────────────────────────

export async function getVehicles(): Promise<RealVehicle[]> {
  const [rows] = await pool.query("SELECT * FROM vehicles ORDER BY vehicleModel");
  return (rows as Record<string, unknown>[]).map(mapVehicle);
}

export async function getVehicleById(id: string): Promise<RealVehicle | undefined> {
  const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ? LIMIT 1", [id]);
  const list = rows as Record<string, unknown>[];
  return list.length ? mapVehicle(list[0]) : undefined;
}

export async function getCompanyVehicles(companyId: string): Promise<RealVehicle[]> {
  const [rows] = await pool.query(
    "SELECT * FROM vehicles WHERE companyId = ? ORDER BY vehicleModel",
    [companyId]
  );
  return (rows as Record<string, unknown>[]).map(mapVehicle);
}

// ── Service record queries ────────────────────────────────────

export async function getServiceRecords(): Promise<RealServiceRecord[]> {
  const [rows] = await pool.query(
    "SELECT * FROM service_records ORDER BY serviceDateISO DESC"
  );
  return (rows as Record<string, unknown>[]).map(mapServiceRecord);
}

export async function getVehicleServiceRecords(vehicleId: string): Promise<RealServiceRecord[]> {
  const [rows] = await pool.query(
    "SELECT * FROM service_records WHERE vehicleId = ? ORDER BY serviceDateISO DESC",
    [vehicleId]
  );
  return (rows as Record<string, unknown>[]).map(mapServiceRecord);
}

export async function getCompanyServiceRecords(companyId: string): Promise<RealServiceRecord[]> {
  const [rows] = await pool.query(
    "SELECT * FROM service_records WHERE companyId = ? ORDER BY serviceDateISO DESC",
    [companyId]
  );
  return (rows as Record<string, unknown>[]).map(mapServiceRecord);
}

// ── Summary type ──────────────────────────────────────────────

export type CompanySummary = {
  totalVehicles: number;
  iksVehicles: number;
  nonIksVehicles: number;
  vehiclesServiced: number;
  totalServiceCount: number;
  totalServiceCost: number;
  tyreCount: number;
  batteryCount: number;
  ispCount: number;
  noTyreCount: number;
  noBatteryCount: number;
  noISPCount: number;
};

// ── Batch summary map (3 queries for ALL companies) ───────────

export async function getAllCompaniesSummaryMap(): Promise<Record<string, CompanySummary>> {
  const [[vRows], [sRows]] = await Promise.all([
    pool.query(`
      SELECT companyId,
        COUNT(*) as total,
        SUM(ownershipStatus = 'IKS_PURCHASE') as iks,
        SUM(ownershipStatus != 'IKS_PURCHASE') as nonIks,
        SUM(lastTyreDate IS NOT NULL) as tyreC,
        SUM(lastBatteryDate IS NOT NULL) as battC,
        SUM(lastISPDate IS NOT NULL) as ispC
      FROM vehicles GROUP BY companyId
    `),
    pool.query(`
      SELECT companyId,
        COUNT(DISTINCT roNumber) as svcCount,
        SUM(totalCost) as svcCost,
        COUNT(DISTINCT vehicleId) as svcVehicles
      FROM service_records GROUP BY companyId
    `),
  ]);

  const vMap: Record<string, Record<string, unknown>> = {};
  (vRows as Record<string, unknown>[]).forEach(r => { vMap[String(r.companyId)] = r; });
  const sMap: Record<string, Record<string, unknown>> = {};
  (sRows as Record<string, unknown>[]).forEach(r => { sMap[String(r.companyId)] = r; });

  const [allRows] = await pool.query("SELECT id FROM companies");
  const result: Record<string, CompanySummary> = {};
  (allRows as Record<string, unknown>[]).forEach(({ id }) => {
    const cid = String(id);
    const v = vMap[cid] || {};
    const s = sMap[cid] || {};
    const total  = Number(v.total  || 0);
    const tyreC  = Number(v.tyreC  || 0);
    const battC  = Number(v.battC  || 0);
    const ispC   = Number(v.ispC   || 0);
    result[cid] = {
      totalVehicles:     total,
      iksVehicles:       Number(v.iks  || 0),
      nonIksVehicles:    Number(v.nonIks || 0),
      vehiclesServiced:  Number(s.svcVehicles || 0),
      totalServiceCount: Number(s.svcCount    || 0),
      totalServiceCost:  Number(s.svcCost     || 0),
      tyreCount:         tyreC,
      batteryCount:      battC,
      ispCount:          ispC,
      noTyreCount:       total - tyreC,
      noBatteryCount:    total - battC,
      noISPCount:        total - ispC,
    };
  });
  return result;
}

// ── Per-company summary (single company) ─────────────────────

export async function getCompanySummary(companyId: string): Promise<CompanySummary> {
  const [vs, srs] = await Promise.all([
    getCompanyVehicles(companyId),
    getCompanyServiceRecords(companyId),
  ]);
  const roSet     = new Set(srs.map(s => s.roNumber));
  const totalCost = srs.reduce((sum, s) => sum + s.totalCost, 0);
  const withSvc   = new Set(srs.map(s => s.vehicleId));
  const tyreV  = vs.filter(v => v.lastTyreDate).length;
  const battV  = vs.filter(v => v.lastBatteryDate).length;
  const ispV   = vs.filter(v => v.lastISPDate).length;
  return {
    totalVehicles:     vs.length,
    iksVehicles:       vs.filter(v => v.ownershipStatus === "IKS_PURCHASE").length,
    nonIksVehicles:    vs.filter(v => v.ownershipStatus !== "IKS_PURCHASE").length,
    vehiclesServiced:  withSvc.size,
    totalServiceCount: roSet.size,
    totalServiceCost:  totalCost,
    tyreCount:         tyreV,
    batteryCount:      battV,
    ispCount:          ispV,
    noTyreCount:       vs.length - tyreV,
    noBatteryCount:    vs.length - battV,
    noISPCount:        vs.length - ispV,
  };
}

// ── Per-vehicle summary ───────────────────────────────────────

export async function getVehicleSummary(vehicleId: string) {
  const srs       = await getVehicleServiceRecords(vehicleId);
  const roSet     = new Set(srs.map(s => s.roNumber));
  const totalCost = srs.reduce((sum, s) => sum + s.totalCost, 0);
  const last      = srs[0];
  const typeCounts: Record<string, number> = {};
  srs.forEach(s => (typeCounts[s.serviceType] = (typeCounts[s.serviceType] || 0) + 1));
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    serviceCount:       roSet.size,
    totalCost,
    lastServiceDate:    last?.serviceDate,
    lastServiceDateISO: last?.serviceDateISO,
    lastServiceCost:    last?.totalCost,
    topServiceType:     topType,
    lastMileage:        last?.mileage,
  };
}
