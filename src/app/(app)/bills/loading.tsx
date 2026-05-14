import { Skeleton } from "~/components/ui/Skeleton";
import { BillsTableSkeleton } from "./BillsTableSkeleton";

export default function BillsLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a174f]">Bills</h1>
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ecebff] bg-white px-4 py-3 shadow-lg shadow-[#d3d1ff]/40">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-56 rounded-md" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#ecebff] bg-white shadow-lg shadow-[#d3d1ff]/40">
        <BillsTableSkeleton />
      </div>
    </div>
  );
}
