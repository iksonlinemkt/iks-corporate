import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import ImportClient from "./ImportClient";

export default function ImportPage() {
  return (
    <AppShell>
      <Breadcrumb items={[{ label: "นำเข้าข้อมูล" }]} />
      <ImportClient />
    </AppShell>
  );
}
