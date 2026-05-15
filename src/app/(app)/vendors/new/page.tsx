import { requireManagerContext } from "~/server/get-user";
import { VendorForm } from "../VendorForm";

export default async function NewVendorPage() {
  await requireManagerContext();

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">New Vendor</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Add a new vendor to your payabill directory
        </p>
      </div>
      <VendorForm />
    </div>
  );
}
