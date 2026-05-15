import { cn } from "~/lib/utils";

interface CardProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export function Card({ id, className, children }: CardProps) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl border border-[#ecebff] bg-white shadow-lg shadow-[#d3d1ff]/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-[#ecebff] px-4 py-4 sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("px-4 py-4 sm:px-6", className)}>{children}</div>;
}
