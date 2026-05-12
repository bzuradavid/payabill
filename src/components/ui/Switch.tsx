"use client";

import { cn } from "~/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className,
  size = "md",
}: SwitchProps) {
  const isSm = size === "sm";
  const trackW = isSm ? "w-9" : "w-11";
  const trackH = isSm ? "h-5" : "h-6";
  const thumbSize = isSm ? "h-4 w-4" : "h-5 w-5";
  const thumbTranslate = isSm ? "translate-x-4" : "translate-x-5";

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312D97] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        trackW,
        trackH,
        checked ? "bg-[#312D97]" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200",
          thumbSize,
          checked ? thumbTranslate : "translate-x-0.5",
        )}
      />
    </button>
  );

  if (!label && !description) {
    return <span className={className}>{control}</span>;
  }

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-3",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {control}
      <span className="flex flex-col">
        {label && (
          <span className="text-sm font-medium text-[#1a174f]">{label}</span>
        )}
        {description && (
          <span className="text-xs text-slate-500">{description}</span>
        )}
      </span>
    </label>
  );
}
