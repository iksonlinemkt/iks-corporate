import { notFound } from "next/navigation";
import {
  getCompanyById, getCompanyVehicles, getCompanyServiceRecords, getCompanySummary,
} from "@/lib/dataService";
import type { RealServiceRecord } from "@/lib/realDataLoader";
import CustomerViewClient from "./CustomerViewClient";

// Compute per-vehicle summary from already-fetched service records (no extra DB calls)
function computeVehicleSummary(vehicleId: string, allServices: RealServiceRecord[]) {
  const vSrs = allServices
    .filter(s => s.vehicleId === vehicleId)
    .sort((a, b) => b.serviceDateISO.localeCompare(a.serviceDateISO));
  const roSet = new Set(vSrs.map(s => s.roNumber));
  const totalCost = vSrs.reduce((sum, s) => sum + s.totalCost, 0);
  const last = vSrs[0];
  const typeCounts: Record<string, number> = {};
  vSrs.forEach(s => (typeCounts[s.serviceType] = (typeCounts[s.serviceType] || 0) + 1));
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    serviceCount: roSet.size,
    totalCost,
    lastServiceDate:    last?.serviceDate,
    lastServiceDateISO: last?.serviceDateISO,
    lastServiceCost:    last?.totalCost,
    topServiceType:     topType,
    lastMileage:        last?.mileage,
  };
}

export default async function CustomerViewPage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  const [vehicles, services, summary] = await Promise.all([
    getCompanyVehicles(params.id),
    getCompanyServiceRecords(params.id),
    getCompanySummary(params.id),
  ]);

  // Pre-compute vehicle summaries from fetched service records
  const vehicleSummaries: Record<string, ReturnType<typeof computeVehicleSummary>> = {};
  vehicles.forEach(v => {
    vehicleSummaries[v.id] = computeVehicleSummary(v.id, services);
  });

  return (
    <CustomerViewClient
      company={company}
      vehicles={vehicles}
      services={services}
      summary={summary}
      vehicleSummaries={vehicleSummaries}
    />
  );
}
