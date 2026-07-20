// Server Component — โหลด JSON ฝั่ง server ไม่เข้า client bundle
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { realCompanies, realCompanySummary, formatBahtReal } from "@/lib/realDataLoader";
import CompanyListClient from "./CompanyListClient";

export default function CompanyPage() {
  // เตรียมข้อมูลทั้งหมดฝั่ง server ก่อนส่งให้ client
  const rows = realCompanies.map(c => ({
    ...c,
    summary: realCompanySummary(c.id),
  }));
  const branches = [...new Set(realCompanies.map(c => c.branch).filter(Boolean))].sort();

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "บริษัท / ข้อมูลลูกค้า" }]} />
      <CompanyListClient rows={rows} branches={branches} />
    </AppShell>
  );
}
