"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "~/components/ui/Input";
import { Select } from "~/components/ui/Select";
import { Button } from "~/components/ui/Button";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";
import { LineItemsEditor, type LineItem } from "~/components/bills/LineItemsEditor";
import { createBill } from "~/actions/bills";
import { formatCurrency } from "~/lib/utils";

interface Vendor {
  id: string;
  name: string;
  defaultPaymentMethod: string;
}

interface GLAccount {
  id: string;
  code: string;
  name: string;
}

interface NewBillFormProps {
  vendors: Vendor[];
  glAccounts: GLAccount[];
}

export function NewBillForm({ vendors, glAccounts }: NewBillFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitMode, setSubmitMode] = useState<"draft" | "submit">("draft");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const today = new Date().toISOString().split("T")[0]!;
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

  const total = lineItems.reduce((s, li) => s + li.amount, 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const payload = {
      vendorId: data.vendorId as string,
      invoiceNumber: data.invoiceNumber ? (data.invoiceNumber as string) : undefined,
      invoiceDate: data.invoiceDate as string,
      dueDate: data.dueDate as string,
      paymentMethod: data.paymentMethod ? (data.paymentMethod as string) : undefined,
      memo: data.memo ? (data.memo as string) : undefined,
      lineItems: lineItems.map(({ description, quantity, unitPrice, amount, glAccountId }) => ({
        description,
        quantity,
        unitPrice,
        amount,
        glAccountId: glAccountId !== "" ? glAccountId : undefined,
      })),
    };

    startTransition(async () => {
      const result = await createBill(payload);
      if (!result.success) {
        setError(result.error);
        return;
      }

      if (submitMode === "draft") {
        router.push(`/bills/${result.data.id}`);
      } else {
        const { submitBill } = await import("~/actions/bills");
        const submitResult = await submitBill(result.data.id);
        if (!submitResult.success) {
          setError(submitResult.error);
          return;
        }
        router.push(`/bills/${result.data.id}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Vendor & invoice details */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Bill Details</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span-2">
            <Select
              name="vendorId"
              label="Vendor"
              required
              placeholder="Select a vendor"
              options={vendors.map((v) => ({ value: v.id, label: v.name }))}
            />
          </div>
          <Input
            name="invoiceNumber"
            label="Invoice Number"
            placeholder="INV-2025-001"
          />
          <Select
            name="paymentMethod"
            label="Payment Method"
            options={[
              { value: "ACH", label: "ACH Transfer" },
              { value: "CHECK", label: "Check" },
              { value: "WIRE", label: "Wire Transfer" },
            ]}
            placeholder="Select method"
          />
          <Input
            name="invoiceDate"
            label="Invoice Date"
            type="date"
            defaultValue={today}
            required
          />
          <Input
            name="dueDate"
            label="Due Date"
            type="date"
            defaultValue={thirtyDaysFromNow}
            required
          />
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Memo
            </label>
            <textarea
              name="memo"
              placeholder="Notes about this bill (optional)"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Line Items</h2>
          {total > 0 && (
            <span className="text-sm font-semibold text-slate-900">
              {formatCurrency(total)}
            </span>
          )}
        </CardHeader>
        <CardContent>
          <LineItemsEditor glAccounts={glAccounts} onChange={setLineItems} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="secondary"
          loading={isPending && submitMode === "draft"}
          onClick={() => setSubmitMode("draft")}
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isPending && submitMode === "submit"}
          onClick={() => setSubmitMode("submit")}
        >
          Submit for Approval
        </Button>
      </div>
    </form>
  );
}
