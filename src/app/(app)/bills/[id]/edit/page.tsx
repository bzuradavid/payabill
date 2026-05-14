export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getServices } from "~/server/container";
import { NewBillForm } from "../../new/NewBillForm";

interface EditBillPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBillPage({ params }: EditBillPageProps) {
  const { id } = await params;
  const { billService, vendorService, glAccountService } = await getServices();

  const [bill, vendors, glAccounts] = await Promise.all([
    billService.getById(id),
    vendorService.listForPicker(),
    glAccountService.list(),
  ]);

  if (!bill) notFound();
  if (bill.status !== "DRAFT" && bill.status !== "REJECTED") redirect(`/bills/${id}`);

  const n2u = <T,>(v: T | null): T | undefined => v ?? undefined;

  const billData = {
    id: bill.id,
    vendorId: bill.vendorId,
    invoiceNumber: n2u(bill.invoiceNumber),
    invoiceDate: bill.invoiceDate,
    dueDate: bill.dueDate,
    paymentMethod: n2u(bill.paymentMethod as string | null),
    memo: n2u(bill.memo),
    lineItems: bill.lineItems.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      amount: li.amount,
      glAccountId: n2u(li.glAccountId),
    })),
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-xl font-bold text-[#1a174f]">Edit Bill</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Update this draft before submitting for approval
        </p>
      </div>
      <NewBillForm vendors={vendors} glAccounts={glAccounts} bill={billData} />
    </div>
  );
}
