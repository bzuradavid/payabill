import { Skeleton } from "~/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";

export default function NewVendorLoading() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">New Vendor</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Add a new vendor to your payables directory
        </p>
      </div>

      <VendorFormSkeleton />
    </div>
  );
}

export function VendorFormSkeleton() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {[
        { label: "Basic info", fields: 4 },
        { label: "Address", fields: 5 },
        { label: "Payment", fields: 4 },
      ].map((section) => (
        <Card key={section.label}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: section.fields }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}
