import { Skeleton } from "~/components/ui/Skeleton";

export default function StaffLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1a174f]">Staff</h1>
        <Skeleton className="mt-1.5 h-4 w-72" />
      </div>

      {/* Invite staff card */}
      <div className="rounded-2xl border border-[#ecebff] bg-white shadow-lg shadow-[#d3d1ff]/40">
        <div className="flex items-center justify-between border-b border-[#ecebff] px-6 py-4">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="px-6 py-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Team members card */}
      <div className="rounded-2xl border border-[#ecebff] bg-white shadow-lg shadow-[#d3d1ff]/40">
        <div className="flex items-center justify-between border-b border-[#ecebff] px-6 py-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3.5 w-12" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ecebff] bg-brand-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-[#ecebff] last:border-0">
                  <td className="px-6 py-3.5">
                    <Skeleton className="h-4 w-36" />
                  </td>
                  <td className="px-6 py-3.5">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-6 py-3.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-6 py-3.5" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending invitations card */}
      <div className="rounded-2xl border border-[#ecebff] bg-white shadow-lg shadow-[#d3d1ff]/40">
        <div className="flex items-center justify-between border-b border-[#ecebff] px-6 py-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3.5 w-14" />
        </div>
        <div className="px-6 py-10 text-center">
          <Skeleton className="mx-auto h-4 w-40" />
        </div>
      </div>
    </div>
  );
}
