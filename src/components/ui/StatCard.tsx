import { cn } from "~/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  accent?: "default" | "red" | "amber" | "emerald";
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "",
  red: "border-l-4 border-l-red-500",
  amber: "border-l-4 border-l-amber-400",
  emerald: "border-l-4 border-l-emerald-500",
};

const accentValueClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "text-[#1a174f]",
  red: "text-red-600",
  amber: "text-amber-600",
  emerald: "text-emerald-600",
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
      <p className={cn("mt-1 text-2xl font-bold tracking-tight", accentValueClasses[accent])}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
