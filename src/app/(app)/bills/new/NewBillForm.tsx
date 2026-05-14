"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createBill, updateBill } from "~/actions/bills";
import { LineItemsEditor, type LineItem } from "~/components/bills/LineItemsEditor";
import { Button } from "~/components/ui/Button";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";
import { Input } from "~/components/ui/Input";
import { Select } from "~/components/ui/Select";
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

interface BillData {
  id: string;
  vendorId: string;
  invoiceNumber?: string;
  invoiceDate: Date;
  dueDate: Date;
  paymentMethod?: string;
  memo?: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    glAccountId?: string;
  }>;
}

interface NewBillFormProps {
  vendors: Vendor[];
  glAccounts: GLAccount[];
  bill?: BillData;
}

const NEW_VENDOR_VALUE = "__new__";

const formatDateInput = (d: Date) => new Date(d).toISOString().split("T")[0]!;

export function NewBillForm({ vendors, glAccounts, bill }: NewBillFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitMode, setSubmitMode] = useState<"draft" | "submit">("draft");
  const [lineItems, setLineItems] = useState<LineItem[]>(
    bill?.lineItems.map((li) => ({ ...li, glAccountId: li.glAccountId ?? "" })) ?? [],
  );
  const [vendorChoice, setVendorChoice] = useState<string>(bill?.vendorId ?? "");
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorEmail, setNewVendorEmail] = useState("");
  const [newVendorPaymentMethod, setNewVendorPaymentMethod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>(bill?.paymentMethod ?? "");

  const today = new Date().toISOString().split("T")[0]!;
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

  const total = lineItems.reduce((s, li) => s + li.amount, 0);
  const isAddingNewVendor = vendorChoice === NEW_VENDOR_VALUE;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!vendorChoice) {
      setError("Select a vendor or add a new one");
      return;
    }
    if (isAddingNewVendor && !newVendorName.trim()) {
      setError("Enter a name for the new vendor");
      return;
    }

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const payload = {
      ...(isAddingNewVendor
        ? {
            inlineVendor: {
              name: newVendorName.trim(),
              email: newVendorEmail.trim() || undefined,
              defaultPaymentMethod:
                (newVendorPaymentMethod as "ACH" | "CHECK" | "WIRE") || undefined,
            },
          }
        : { vendorId: vendorChoice }),
      invoiceNumber: data.invoiceNumber ? (data.invoiceNumber as string) : undefined,
      invoiceDate: data.invoiceDate as string,
      dueDate: data.dueDate as string,
      paymentMethod: paymentMethod || undefined,
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
      if (bill?.id) {
        const result = await updateBill(bill.id, payload);
        if (!result.success) {
          setError(result.error);
          return;
        }
        if (submitMode === "submit") {
          const { submitBill } = await import("~/actions/bills");
          const submitResult = await submitBill(bill.id);
          if (!submitResult.success) {
            setError(submitResult.error);
            return;
          }
        }
        router.push(`/bills/${bill.id}`);
      } else {
        const result = await createBill(payload);
        if (!result.success) {
          setError(result.error);
          return;
        }
        if (submitMode === "submit") {
          const { submitBill } = await import("~/actions/bills");
          const submitResult = await submitBill(result.data.id);
          if (!submitResult.success) {
            setError(submitResult.error);
            return;
          }
        }
        router.push(`/bills/${result.data.id}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-4xl flex-col gap-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Vendor & invoice details */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[#1a174f]">Bill Details</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span-2 flex flex-col gap-3">
            <Select
              label="Vendor"
              required
              value={vendorChoice}
              onChange={(e) => setVendorChoice(e.target.value)}
              placeholder="Select a vendor"
              options={[
                ...vendors.map((v) => ({ value: v.id, label: v.name })),
                { value: NEW_VENDOR_VALUE, label: "+ Add new vendor…" },
              ]}
            />

            {isAddingNewVendor && (
              <div className="rounded-xl border border-dashed border-[#10A6CC]/40 bg-[#10A6CC]/5 p-4">
                <p className="mb-3 text-xs font-medium text-[#1a174f]">
                  New vendor — just enter the basics. A manager can fill in the
                  rest later.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Vendor name"
                      placeholder="Acme Co."
                      value={newVendorName}
                      onChange={(e) => setNewVendorName(e.target.value)}
                      required={isAddingNewVendor}
                    />
                  </div>
                  <Input
                    label="Contact email (optional)"
                    type="email"
                    placeholder="billing@acme.com"
                    value={newVendorEmail}
                    onChange={(e) => setNewVendorEmail(e.target.value)}
                  />
                  <Select
                    label="Payment method (optional)"
                    value={newVendorPaymentMethod}
                    onChange={(e) => setNewVendorPaymentMethod(e.target.value)}
                    placeholder="Choose later"
                    options={[
                      { value: "ACH", label: "ACH Transfer" },
                      { value: "CHECK", label: "Check" },
                      { value: "WIRE", label: "Wire Transfer" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          <Input
            name="invoiceNumber"
            label="Invoice Number"
            placeholder="INV-2025-001"
            defaultValue={bill?.invoiceNumber ?? ""}
          />
          <Select
            name="paymentMethod"
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
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
            defaultValue={bill ? formatDateInput(bill.invoiceDate) : today}
            required
          />
          <Input
            name="dueDate"
            label="Due Date"
            type="date"
            defaultValue={bill ? formatDateInput(bill.dueDate) : thirtyDaysFromNow}
            required
          />
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-[#1a174f]">
              Memo
            </label>
            <textarea
              name="memo"
              placeholder="Notes about this bill (optional)"
              defaultValue={bill?.memo ?? ""}
              rows={2}
              className="w-full rounded-xl border border-[#ecebff] px-3 py-2 text-base text-[#1a174f] placeholder:text-slate-400 transition-colors focus:border-[#312D97] focus:ring-1 focus:ring-[#312D97] focus:outline-none sm:text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[#1a174f]">Line Items</h2>
          {total > 0 && (
            <span className="text-sm font-semibold text-slate-900">
              {formatCurrency(total)}
            </span>
          )}
        </CardHeader>
        <CardContent>
          <LineItemsEditor
            glAccounts={glAccounts}
            initialItems={
              bill?.lineItems.map((li) => ({ ...li, glAccountId: li.glAccountId ?? "" }))
            }
            onChange={setLineItems}
          />
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
