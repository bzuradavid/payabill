import { cn } from "~/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#312D97] text-white hover:bg-[#1d175a] focus-visible:ring-[#312D97] disabled:opacity-50",
  secondary:
    "bg-white text-[#312D97] border border-[#ecebff] hover:bg-brand-50 focus-visible:ring-[#312D97] disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:opacity-50",
  ghost:
    "bg-transparent text-[#312D97] hover:bg-brand-100 focus-visible:ring-[#312D97] disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-7 py-2.5 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold shadow-sm transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
