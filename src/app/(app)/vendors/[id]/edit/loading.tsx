import { Skeleton } from "~/components/ui/Skeleton";
import { VendorFormSkeleton } from "../../new/loading";

export default function EditVendorLoading() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">Edit</h1>
          <Skeleton className="h-6 w-40" />
        </div>
        <p className="mt-0.5 text-sm text-slate-500">
          Update vendor information and payment details
        </p>
      </div>
      <VendorFormSkeleton />
    </div>
  );
}
