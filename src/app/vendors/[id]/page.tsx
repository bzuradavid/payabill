export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { vendorService } from "~/server/container";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";
import { BillStatusBadge } from "~/components/bills/BillStatusBadge";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { formatCurrency, getDueDateLabel, isOverdue } from "~/lib/utils";
import { cn } from "~/lib/utils";

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  const { id } = await params;
  const vendor = await vendorService.getById(id);
  if (!vendor) notFound();

  const totalPaid = vendor.bills
    .filter((b) => b.status === "PAID")
    .reduce(
      (sum, b) => sum + b.lineItems.reduce((s, li) => s + li.amount, 0),
      0,
    );

  const activeBills = vendor.bills.filter(
    (b) => !["VOID", "REJECTED"].includes(b.status),
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/vendors" className="hover:text-slate-900">
          Vendors
        </Link>
        <span>/</span>
        <span className="text-slate-900">{vendor.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900">
              {vendor.name}
            </h1>
            <Badge variant={vendor.status === "ACTIVE" ? "emerald" : "gray"}>
              {vendor.status === "ACTIVE" ? "Active" : "Inactive"}
            </Badge>
          </div>
          {vendor.email && (
            <p className="mt-0.5 text-sm text-slate-500">{vendor.email}</p>
          )}
        </div>
        <Link href={`/vendors/${vendor.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit Vendor
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bills list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">
                Bills
              </h2>
              <Link href={`/bills/new`}>
                <Button variant="secondary" size="sm">
                  New Bill
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {activeBills.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No bills for this vendor.
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.bills.map((bill) => {
                      const totalAmount = bill.lineItems.reduce(
                        (s, li) => s + li.amount,
                        0,
                      );
                      const overdue = isOverdue(bill.dueDate, bill.status);
                      return (
                        <tr
                          key={bill.id}
                          className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50"
                        >
                          <td className="px-6 py-3.5 font-medium text-slate-900">
                            <Link
                              href={`/bills/${bill.id}`}
                              className="hover:text-indigo-600"
                            >
                              {bill.invoiceNumber ?? (
                                <span className="text-slate-400 italic">Draft</span>
                              )}
                            </Link>
                          </td>
                          <td
                            className={cn(
                              "px-6 py-3.5 text-sm",
                              overdue
                                ? "font-medium text-red-600"
                                : "text-slate-500",
                            )}
                          >
                            {getDueDateLabel(bill.dueDate, bill.status)}
                          </td>
                          <td className="px-6 py-3.5 text-right font-medium text-slate-900">
                            {formatCurrency(totalAmount)}
                          </td>
                          <td className="px-6 py-3.5">
                            <BillStatusBadge status={bill.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: vendor details */}
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-xs text-slate-500">Total Paid</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-xs text-slate-500">Active Bills</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {activeBills.filter((b) => b.status !== "PAID").length}
              </p>
            </div>
          </div>

          {/* Contact */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">
                Contact
              </h2>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {vendor.email && <Row label="Email" value={vendor.email} />}
              {vendor.phone && <Row label="Phone" value={vendor.phone} />}
              {vendor.website && (
                <Row
                  label="Website"
                  value={vendor.website.replace(/^https?:\/\//, "")}
                />
              )}
              {vendor.taxId && <Row label="Tax ID" value={vendor.taxId} />}
              {vendor.addressLine1 && (
                <Row
                  label="Address"
                  value={[
                    vendor.addressLine1,
                    vendor.city,
                    vendor.state,
                    vendor.zip,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">
                Payment Info
              </h2>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row
                label="Method"
                value={vendor.defaultPaymentMethod}
              />
              {vendor.bankName && (
                <Row label="Bank" value={vendor.bankName} />
              )}
              {vendor.bankRoutingNumber && (
                <Row label="Routing #" value={vendor.bankRoutingNumber} />
              )}
              {vendor.bankAccountNumber && (
                <Row
                  label="Account #"
                  value={vendor.bankAccountNumber}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}
