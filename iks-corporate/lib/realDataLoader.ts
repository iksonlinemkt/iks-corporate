// โหลดข้อมูลจริงจาก Excel — แยกเป็น 3 ไฟล์เพื่อลด memory ตอน Vercel build
import companiesRaw from "./data/companies.json";
import vehiclesRaw from "./data/vehicles.json";
import serviceRecordsRaw from "./data/serviceRecords.json";

export interface RealCompany {
  id: string; name: string; taxId: string;
  contactName: string; contactPosition: string; contactPhone: string;
  address: string; salesOwner: string; branch: string;
  businessType: string; province: string;
  iksPurchaseStatus: string; opportunityLevel: string; customerGrade: string;
}

export interface RealVehicle {
  id: string; companyId: string;
  registrationNumber: string; registrationProvince: string;
  engineNumber: string; chassisNumber: string;
  vehicleModel: string; vehicleGroup: string; vehicleSubtype: string;
  vehicleYear: number; purchaseYear: number;
  purchaseDate: string; purchaseDateISO: string;
  ownershipStatus: string; vehicleStatus: string;
  sellingPrice: number; campaign: string; purchaseType: string;
}

export interface RealServiceRecord {
  id: string; companyId: string; vehicleId: string;
  roNumber: string; serviceDate: string; serviceDateISO: string;
  serviceType: string; serviceDetail: string; mileage: number;
  serviceCenter: string; serviceAdvisor: string;
  totalCost: number; warrantyCost: number; customerPaidAmount: number;
  notes: string;
}

export const realCompanies = companiesRaw as RealCompany[];
export const realVehicles = vehiclesRaw as RealVehicle[];
export const realServiceRecords = serviceRecordsRaw as RealServiceRecord[];

export const getRealCompanyById = (id: string) => realCompanies.find(c => c.id === id);
export const getRealVehicleById = (id: string) => realVehicles.find(v => v.id === id);
export const getRealCompanyVehicles = (companyId: string) => realVehicles.filter(v => v.companyId === companyId);
export const getRealVehicleServiceRecords = (vehicleId: string) =>
  realServiceRecords.filter(s => s.vehicleId === vehicleId).sort((a,b) => b.serviceDateISO.localeCompare(a.serviceDateISO));
export const getRealCompanyServiceRecords = (companyId: string) =>
  realServiceRecords.filter(s => s.companyId === companyId).sort((a,b) => b.serviceDateISO.localeCompare(a.serviceDateISO));

export function realCompanySummary(companyId: string) {
  const vs = getRealCompanyVehicles(companyId);
  const srs = getRealCompanyServiceRecords(companyId);
  const roSet = new Set(srs.map(s => s.roNumber));
  const totalCost = srs.reduce((sum,s) => sum + s.totalCost, 0);
  const vehiclesWithService = new Set(srs.map(s => s.vehicleId));
  return {
    totalVehicles: vs.length,
    iksVehicles: vs.filter(v => v.ownershipStatus === "IKS_PURCHASE").length,
    nonIksVehicles: vs.filter(v => v.ownershipStatus === "NON_IKS_PURCHASE").length,
    vehiclesServiced: vehiclesWithService.size,
    totalServiceCount: roSet.size,
    totalServiceCost: totalCost,
    lastVisitDate: undefined as string | undefined,
    nextTaskDate: undefined as string | undefined,
  };
}

export function realVehicleSummary(vehicleId: string) {
  const srs = getRealVehicleServiceRecords(vehicleId);
  const roSet = new Set(srs.map(s => s.roNumber));
  const totalCost = srs.reduce((sum,s) => sum + s.totalCost, 0);
  const last = srs[0];
  const typeCounts: Record<string,number> = {};
  srs.forEach(s => (typeCounts[s.serviceType] = (typeCounts[s.serviceType]||0)+1));
  const topType = Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0]?.[0];
  return {
    serviceCount: roSet.size, totalCost,
    lastServiceDate: last?.serviceDate,
    lastServiceDateISO: last?.serviceDateISO,
    lastServiceCost: last?.totalCost,
    topServiceType: topType,
    lastMileage: last?.mileage,
  };
}

export const formatBahtReal = (n: number) => new Intl.NumberFormat("th-TH").format(Math.round(n));
