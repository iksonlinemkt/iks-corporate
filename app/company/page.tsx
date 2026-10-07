// Async Server Component — fetches data from MySQL
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { getCompanies, getAllCompaniesSummaryMap } from "@/lib/dataService";
import CompanyListClient from "./CompanyListClient";

export default async function CompanyPage() {
  const [allCompanies, summaryMap] = await Promise.all([
    getCompanies(),
    getAllCompaniesSummaryMap(),
  ]);

  const rows = allCompanies.map(c => ({
    ...c,
    summary: summaryMap[c.id] || {
      totalVehicles: 0, iksVehicles: 0, nonIksVehicles: 0,
      vehiclesServiced: 0, totalServiceCount: 0, totalServiceCost: 0,
      tyreCount: 0, batteryCount: 0, ispCount: 0,
      noTyreCount: 0, noBatteryCount: 0, noISPCount: 0,
    },
  }));

  const branches = [...new Set(allCompanies.map(c => c.branch).filter(Boolean))].sort();

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "บริษัท / ข้อมูลลูกค้า" }]} />
      <CompanyListClient rows={rows} branches={branches} />
    </AppShell>
  );
}
