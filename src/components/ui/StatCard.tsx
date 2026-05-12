import { cn } from "~/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  accent?: "default" | "indigo" | "red" | "amber" | "emerald";
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "",
  indigo: "border-l-2 border-l-indigo-300 bg-gradient-to-r from-indigo-50/30 via-white to-white",
  red: "border-l-2 border-l-red-200 bg-gradient-to-r from-red-50/25 via-white to-white",
  amber: "border-l-2 border-l-amber-200 bg-gradient-to-r from-amber-50/25 via-white to-white",
  emerald: "border-l-2 border-l-emerald-200 bg-gradient-to-r from-emerald-50/25 via-white to-white",
};

const accentValueClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "text-[#1a174f]",
  indigo: "text-indigo-800",
  red: "text-red-700",
  amber: "text-amber-700",
  emerald: "text-emerald-700",
};

export function StatCard({
  label,
  value,
  sub,
  className,
  accent = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#ecebff] bg-white px-6 py-5 shadow-lg shadow-[#d3d1ff]/40 transition-shadow hover:shadow-xl hover:shadow-[#d3d1ff]/60",
        accentClasses[accent],
        className,
      )}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tracking-tight", accentValueClasses[accent])}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
