import { Skeleton } from "~/components/ui/Skeleton";

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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#ecebff] bg-white shadow-lg shadow-[#d3d1ff]/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ecebff] bg-brand-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Invoice Date</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[#ecebff] last:border-0">
                  <td className="px-6 py-3.5">
                    <Skeleton className="h-4 w-36" />
                  </td>
                  <td className="px-6 py-3.5">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-3.5">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-3.5">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-end">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
