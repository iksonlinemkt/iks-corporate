// Async Server Component — fetches data from MySQL
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { getCompanies, getVehicles, getServiceRecords } from "@/lib/dataService";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [companies, vehicles, serviceRecords] = await Promise.all([
    getCompanies(),
    getVehicles(),
    getServiceRecords(),
  ]);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "Dashboard" }]} />
      <DashboardClient
        companies={companies}
        vehicles={vehicles}
        serviceRecords={serviceRecords}
      />
    </AppShell>
  );
}
