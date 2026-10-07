// Async Server Component — fetches data from MySQL
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import {
  getCompanies, getVehicles, getAllCompaniesSummaryMap,
} from "@/lib/dataService";
import PurchasedClient from "./PurchasedClient";

export default async function PurchasedPage() {
  const [allCompanies, summaryMap, allVehicles] = await Promise.all([
    getCompanies(),
    getAllCompaniesSummaryMap(),
    getVehicles(),
  ]);

  // Build vehicle lookup by companyId
  const vehiclesByCompany: Record<string, typeof allVehicles> = {};
  allVehicles.forEach(v => {
    if (!vehiclesByCompany[v.companyId]) vehiclesByCompany[v.companyId] = [];
    vehiclesByCompany[v.companyId].push(v);
  });

  const purchased = allCompanies.filter(c => c.iksPurchaseStatus === "IKS_CUSTOMER");

  const rows = purchased
    .map(c => {
      const vs = vehiclesByCompany[c.id] || [];
      const summary = summaryMap[c.id] || {
        totalVehicles: 0, iksVehicles: 0, nonIksVehicles: 0,
        vehiclesServiced: 0, totalServiceCount: 0, totalServiceCost: 0,
        tyreCount: 0, batteryCount: 0, ispCount: 0,
        noTyreCount: 0, noBatteryCount: 0, noISPCount: 0,
      };
      const latestV = [...vs].sort((a, b) => (b.purchaseYear || 0) - (a.purchaseYear || 0))[0];
      return { ...c, summary, latestModel: latestV?.vehicleModel || "-" };
    })
    .sort((a, b) => b.summary.iksVehicles - a.summary.iksVehicles);

  const branches = [...new Set(allCompanies.map(c => c.branch).filter(Boolean))].sort();

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "ลูกค้าที่ซื้อรถ" }]} />
      <PurchasedClient rows={rows} branches={branches} />
    </AppShell>
  );
}
