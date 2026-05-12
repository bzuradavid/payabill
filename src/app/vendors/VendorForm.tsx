"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "~/components/ui/Input";
import { Select } from "~/components/ui/Select";
import { Button } from "~/components/ui/Button";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";
import { createVendor, updateVendor } from "~/actions/vendors";

interface VendorData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  defaultPaymentMethod?: string;
  bankName?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  taxId?: string;
}

interface VendorFormProps {
  vendor?: VendorData;
}

export function VendorForm({ vendor }: VendorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState(
    vendor?.defaultPaymentMethod ?? "ACH",
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form));
    const data: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(raw)) {
      data[k] = typeof v === "string" && v !== "" ? v : undefined;
    }

    startTransition(async () => {
      const result = vendor?.id
        ? await updateVendor(vendor.id, data)
        : await createVendor(data);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (vendor?.id) {
        router.push(`/vendors/${vendor.id}`);
      } else {
        const id = (result as { success: true; data: { id: string } }).data.id;
        router.push(`/vendors/${id}`);
      }
    });
  };

  const needsBankFields = paymentMethod === "ACH" || paymentMethod === "WIRE";

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">
            Vendor Information
          </h2>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              name="name"
              label="Vendor Name"
              defaultValue={vendor?.name}
              required
              placeholder="e.g. Stripe, Inc."
            />
          </div>
          <Input
            name="email"
            label="Billing Email"
            type="email"
            defaultValue={vendor?.email}
            placeholder="billing@vendor.com"
          />
          <Input
            name="phone"
            label="Phone"
            type="tel"
            defaultValue={vendor?.phone}
            placeholder="+1 (555) 000-0000"
          />
          <div className="col-span-2">
            <Input
              name="website"
              label="Website"
              type="url"
              defaultValue={vendor?.website}
              placeholder="https://vendor.com"
            />
          </div>
          <Input
            name="taxId"
            label="Tax ID (EIN)"
            defaultValue={vendor?.taxId}
            placeholder="XX-XXXXXXX"
            hint="Used for 1099 reporting"
          />
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Address</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              name="addressLine1"
              label="Street Address"
              defaultValue={vendor?.addressLine1}
              placeholder="123 Main St"
            />
          </div>
          <div className="col-span-2">
            <Input
              name="addressLine2"
              label="Suite / Unit"
              defaultValue={vendor?.addressLine2}
              placeholder="Suite 100"
            />
          </div>
          <Input
            name="city"
            label="City"
            defaultValue={vendor?.city}
            placeholder="San Francisco"
          />
          <Input
            name="state"
            label="State"
            defaultValue={vendor?.state}
            placeholder="CA"
          />
          <Input
            name="zip"
            label="ZIP Code"
            defaultValue={vendor?.zip}
            placeholder="94105"
          />
          <Input
            name="country"
            label="Country"
            defaultValue={vendor?.country ?? "US"}
          />
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">
            Payment Details
          </h2>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Select
              name="defaultPaymentMethod"
              label="Default Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: "ACH", label: "ACH Transfer" },
                { value: "CHECK", label: "Check" },
                { value: "WIRE", label: "Wire Transfer" },
              ]}
            />
          </div>
          {needsBankFields && (
            <>
              <div className="col-span-2">
                <Input
                  name="bankName"
                  label="Bank Name"
                  defaultValue={vendor?.bankName}
                  placeholder="Chase Bank"
                />
              </div>
              <Input
                name="bankRoutingNumber"
                label="Routing Number"
                defaultValue={vendor?.bankRoutingNumber}
                placeholder="021000021"
              />
              <Input
                name="bankAccountNumber"
                label="Account Number"
                defaultValue={vendor?.bankAccountNumber}
                placeholder="••••••••"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          {vendor?.id ? "Save Changes" : "Create Vendor"}
        </Button>
      </div>
    </form>
  );
}
