export const dynamic = "force-dynamic";
// Async Server Component — fetches data from MySQL
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { getVehicles, getCompanies, getServiceRecords } from "@/lib/dataService";
import VehiclesClient from "./VehiclesClient";

export default async function VehiclesListPage() {
  const [vehicles, companies, serviceRecords] = await Promise.all([
    getVehicles(),
    getCompanies(),
    getServiceRecords(),
  ]);

  // Build compact company lookup map
  const companyMap: Record<string, { id: string; name: string }> = {};
  companies.forEach(c => { companyMap[c.id] = { id: c.id, name: c.name }; });

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "รถของบริษัท" }]} />
      <VehiclesClient vehicles={vehicles} serviceRecords={serviceRecords} companyMap={companyMap} />
    </AppShell>
  );
}
