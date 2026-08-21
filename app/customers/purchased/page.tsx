// Server Component
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { realCompanies, realCompanySummary, getRealCompanyVehicles } from "@/lib/realDataLoader";
import PurchasedClient from "./PurchasedClient";

export default function PurchasedPage() {
  const rows = realCompanies
    .filter(c => c.iksPurchaseStatus === "IKS_CUSTOMER")
    .map(c => {
      const s = realCompanySummary(c.id);
      const vs = getRealCompanyVehicles(c.id);
      const latestV = [...vs].sort((a,b) => b.purchaseYear - a.purchaseYear)[0];
      return { ...c, summary: s, latestModel: latestV?.vehicleModel || "-" };
    })
    .sort((a,b) => b.summary.iksVehicles - a.summary.iksVehicles);

  const branches = [...new Set(realCompanies.map(c => c.branch).filter(Boolean))].sort();

  return (
    <AppShell>
      <Breadcrumb items={[{ label:"ลูกค้าที่ซื้อรถ" }]} />
      <PurchasedClient rows={rows} branches={branches} />
    </AppShell>
  );
}
