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
  default: "border-slate-200",
  red: "border-l-4 border-l-red-500",
  amber: "border-l-4 border-l-amber-500",
  emerald: "border-l-4 border-l-emerald-500",
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
        "rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm",
        accentClasses[accent],
        className,
      )}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
