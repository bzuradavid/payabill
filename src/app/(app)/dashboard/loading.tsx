import { Skeleton } from "~/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a174f]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Overview of your accounts payable
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-40 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#ecebff] bg-white px-6 py-5 shadow-lg shadow-[#d3d1ff]/40"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Recent bills */}
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ecebff] bg-brand-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Vendor</th>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#ecebff] last:border-0"
                  >
                    <td className="px-6 py-3.5">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-3.5">
                      <Skeleton className="h-4 w-20" />
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
        </CardContent>
      </Card>
    </div>
  );
}
