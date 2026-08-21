import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import {
  getRealCompanyById, getRealCompanyVehicles, getRealCompanyServiceRecords,
  realCompanySummary,
} from "@/lib/realDataLoader";
import CompanyDetailClient from "./CompanyDetailClient";

export default function CompanyDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const company = getRealCompanyById(params.id);
  if (!company) notFound();

  const vehicles = getRealCompanyVehicles(params.id);
  const services = getRealCompanyServiceRecords(params.id);
  const summary  = realCompanySummary(params.id);

  return (
    <AppShell>
      <Breadcrumb items={[{ label:"บริษัท / ข้อมูลลูกค้า", href:"/company" },{ label:"Customer 360" }]} />
      <CompanyDetailClient
        company={company}
        vehicles={vehicles}
        services={services}
        summary={summary}
        initialTab={searchParams.tab || ""}
      />
    </AppShell>
  );
}
