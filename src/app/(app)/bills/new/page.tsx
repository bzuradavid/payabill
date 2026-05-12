export const dynamic = "force-dynamic";

import { getServices } from "~/server/container";
import { NewBillForm } from "./NewBillForm";

export default async function NewBillPage() {
  const { vendorService, glAccountService } = await getServices();
  const [vendors, glAccounts] = await Promise.all([
    vendorService.listForPicker(),
    glAccountService.list(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">New Bill</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Create a new bill to track and pay
        </p>
      </div>
      <NewBillForm vendors={vendors} glAccounts={glAccounts} />
    </div>
  );
}
