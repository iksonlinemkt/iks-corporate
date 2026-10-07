// Async Server Component — fetches data from MySQL
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { getServiceRecords, getCompanies, getVehicles } from "@/lib/dataService";
import ServiceHistoryClient from "./ServiceHistoryClient";

export default async function ServiceHistoryPage() {
  const [serviceRecords, companies, vehicles] = await Promise.all([
    getServiceRecords(),
    getCompanies(),
    getVehicles(),
  ]);

  const companyMap: Record<string, { id: string; name: string }> = {};
  companies.forEach(c => { companyMap[c.id] = { id: c.id, name: c.name }; });

  const vehicleMap: Record<string, { id: string; engineNumber: string; registrationNumber: string }> = {};
  vehicles.forEach(v => {
    vehicleMap[v.id] = { id: v.id, engineNumber: v.engineNumber, registrationNumber: v.registrationNumber };
  });

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "ประวัติการเข้าศูนย์" }]} />
      <ServiceHistoryClient
        serviceRecords={serviceRecords}
        companyMap={companyMap}
        vehicleMap={vehicleMap}
      />
    </AppShell>
  );
}
