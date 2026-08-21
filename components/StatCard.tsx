import { ReactNode } from "react";

export default function StatCard({
  icon,
  label,
  value,
  unit,
  trend,
  trendLabel,
  iconBg = "bg-iks-navy/10",
  iconColor = "text-iks-navy",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendLabel?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 flex gap-3 items-start">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500 truncate">{label}</div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-xl font-bold text-gray-800">{value}</span>
          {unit && <span className="text-xs text-gray-400">{unit}</span>}
        </div>
        {trend && (
          <div className="text-xs text-green-600 mt-0.5 flex items-center gap-0.5">
            <span>↑ {trend}</span>
            {trendLabel && <span className="text-gray-400">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
