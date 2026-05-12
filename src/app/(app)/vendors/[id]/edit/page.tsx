export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getServices } from "~/server/container";
import { requireManagerContext } from "~/server/get-user";
import { VendorForm } from "../../VendorForm";

interface EditVendorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVendorPage({ params }: EditVendorPageProps) {
  await requireManagerContext();
  const { id } = await params;
  const { vendorService } = await getServices();
  const vendor = await vendorService.getById(id);
  if (!vendor) notFound();

  const n2u = <T,>(v: T | null): T | undefined => v ?? undefined;

  const vendorData = {
    id: vendor.id,
    name: vendor.name,
    email: n2u(vendor.email),
    phone: n2u(vendor.phone),
    website: n2u(vendor.website),
    addressLine1: n2u(vendor.addressLine1),
    addressLine2: n2u(vendor.addressLine2),
    city: n2u(vendor.city),
    state: n2u(vendor.state),
    zip: n2u(vendor.zip),
    country: vendor.country,
    defaultPaymentMethod: vendor.defaultPaymentMethod,
    bankName: n2u(vendor.bankName),
    bankRoutingNumber: n2u(vendor.bankRoutingNumber),
    bankAccountNumber: n2u(vendor.bankAccountNumber),
    taxId: n2u(vendor.taxId),
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Edit {vendor.name}
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Update vendor information and payment details
        </p>
      </div>
      <VendorForm vendor={vendorData} />
    </div>
  );
}
