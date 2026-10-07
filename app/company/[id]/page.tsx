import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import {
  getCompanyById, getCompanyVehicles, getCompanyServiceRecords, getCompanySummary,
} from "@/lib/dataService";
import CompanyDetailClient from "./CompanyDetailClient";

export default async function CompanyDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  const [vehicles, services, summary] = await Promise.all([
    getCompanyVehicles(params.id),
    getCompanyServiceRecords(params.id),
    getCompanySummary(params.id),
  ]);

  // Add optional fields that CompanyDetailClient may reference (were undefined in original)
  const summaryFull = { ...summary, lastVisitDate: undefined as string|undefined, nextTaskDate: undefined as string|undefined };

  return (
    <AppShell>
      <Breadcrumb items={[{ label:"บริษัท / ข้อมูลลูกค้า", href:"/company" },{ label:"Customer 360" }]} />
      <CompanyDetailClient
        company={company}
        vehicles={vehicles}
        services={services}
        summary={summaryFull}
        initialTab={searchParams.tab || ""}
      />
    </AppShell>
  );
}
