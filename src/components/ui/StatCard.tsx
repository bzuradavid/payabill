import { cn } from "~/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  accent?: "default" | "indigo" | "red" | "amber" | "emerald";
  icon?: React.ReactNode;
  className?: string;
}

type AccentKey = NonNullable<StatCardProps["accent"]>;

const configs: Record<
  AccentKey,
  { card: string; iconWrap: string; value: string; symbol: string }
> = {
  default: {
    card: "bg-white border-slate-200",
    iconWrap: "bg-slate-100 text-slate-500",
    value: "text-slate-900",
    symbol: "text-slate-400",
  },
  indigo: {
    card: "bg-white border-[#ecebff]",
    iconWrap: "bg-[#eceaff] text-[#312D97]",
    value: "text-slate-800",
    symbol: "text-slate-400",
  },
  amber: {
    card: "bg-white border-slate-200",
    iconWrap: "bg-amber-100 text-amber-700",
    value: "text-slate-800",
    symbol: "text-slate-400",
  },
  red: {
    card: "bg-white border-slate-200",
    iconWrap: "bg-red-100 text-red-600",
    value: "text-slate-800",
    symbol: "text-slate-400",
  },
  emerald: {
    card: "bg-white border-slate-200",
    iconWrap: "bg-emerald-100 text-emerald-700",
    value: "text-slate-800",
    symbol: "text-slate-400",
  },
};

export function StatCard({
  label,
  value,
  sub,
  accent = "default",
  icon,
  className,
}: StatCardProps) {
  const config = configs[accent];
  const isCurrency = value.startsWith("$");
  const symbol = isCurrency ? value[0] : null;
  const numericValue = isCurrency ? value.slice(1) : value;

  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-5 shadow-sm transition-shadow hover:shadow-md",
        config.card,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        {icon && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              config.iconWrap,
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start gap-0.5">
        {symbol && (
          <span
            className={cn(
              "mt-1.5 text-sm font-semibold leading-none",
              config.symbol,
            )}
          >
            {symbol}
          </span>
        )}
        <span
          className={cn(
            "text-[1.875rem] font-medium leading-none tracking-tight",
            config.value,
          )}
        >
          {numericValue}
        </span>
      </div>

      {sub && <p className="mt-2.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
