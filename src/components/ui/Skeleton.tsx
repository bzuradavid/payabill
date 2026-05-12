import { cn } from "~/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100",
        className,
      )}
    />
  );
}
