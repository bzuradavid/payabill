import { Skeleton } from "~/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";

export default function NewBillLoading() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">New Bill</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Create a new bill to track and pay
        </p>
      </div>

      <div className="flex max-w-4xl flex-col gap-6">
      {/* Form skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_80px_120px_140px_120px_32px]"
            >
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      </div>
    </div>
  );
}
