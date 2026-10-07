export const dynamic = "force-dynamic";
// Async Server Component — fetches data from MySQL
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { getCompanies, getServiceRecords } from "@/lib/dataService";
import ServicedClient from "./ServicedClient";

export default async function ServicedCustomersPage() {
  const [companies, serviceRecords] = await Promise.all([
    getCompanies(),
    getServiceRecords(),
  ]);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "ลูกค้าที่ซ่อมรถ" }]} />
      <ServicedClient companies={companies} serviceRecords={serviceRecords} />
    </AppShell>
  );
}
