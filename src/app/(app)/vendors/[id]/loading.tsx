import { Skeleton } from "~/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";

export default function VendorDetailLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <span>Vendors</span>
        <span>/</span>
        <Skeleton className="h-4 w-32" />
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bills list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-50 last:border-0"
                      >
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-5 w-24" />
              </div>
            ))}
          </div>

          {/* Contact */}
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
