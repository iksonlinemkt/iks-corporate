export const dynamic = "force-dynamic";
// Async Server Component — fetches data from MySQL
import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { getCompanies, getAllCompaniesSummaryMap } from "@/lib/dataService";
import CreateVisitLogClient from "./CreateVisitLogClient";

export default async function CreateVisitLogPage() {
  const [companies, summaryMap] = await Promise.all([
    getCompanies(),
    getAllCompaniesSummaryMap(),
  ]);

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "การเข้าเยี่ยม", href: "/visit-log" }, { label: "สร้างบันทึกการเข้าเยี่ยม" }]} />
      <Suspense fallback={null}>
        <CreateVisitLogClient companies={companies} summaryMap={summaryMap} />
      </Suspense>
    </AppShell>
  );
}
