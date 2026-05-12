import { cn } from "~/lib/utils";

type BadgeVariant =
  | "gray"
  | "amber"
  | "indigo"
  | "purple"
  | "emerald"
  | "red"
  | "blue";

const variantClasses: Record<BadgeVariant, string> = {
  gray: "bg-slate-100 text-slate-600",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  indigo: "bg-brand-200 text-[#312D97] border border-[#ecebff]",
  purple: "bg-brand-200 text-[#312D97] border border-[#ecebff]",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  red: "bg-red-50 text-red-700 border border-red-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
