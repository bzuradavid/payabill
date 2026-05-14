export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getServices } from "~/server/container";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";
import { BillStatusBadge } from "~/components/bills/BillStatusBadge";
import { formatCurrency, formatDate } from "~/lib/utils";
import { BillActions } from "./BillActions";
import { BillStatusTimeline } from "~/components/bills/BillStatusTimeline";

interface BillDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;
  const { billService, ctx } = await getServices();
  const bill = await billService.getById(id);
  if (!bill) notFound();

  const totalAmount = bill.totalAmount;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/bills" className="hover:text-slate-900">
          Bills
        </Link>
        <span>/</span>
        <span className="text-slate-900">
          {bill.invoiceNumber ?? bill.vendor.name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900">
              {bill.vendor.name}
            </h1>
            <BillStatusBadge status={bill.status} />
          </div>
          {bill.invoiceNumber && (
            <p className="mt-0.5 text-sm text-slate-500">
              Invoice #{bill.invoiceNumber}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {formatCurrency(totalAmount)}
          </p>
          <p className="text-sm text-slate-400">Total amount</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: details + line items */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Rejection reason banner */}
          {bill.status === "REJECTED" && bill.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-800">
                Rejection reason
              </p>
              <p className="mt-0.5 text-sm text-red-700">
                {bill.rejectionReason}
              </p>
            </div>
          )}

          {/* Line items */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">
                Line Items
              </h2>
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(totalAmount)}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-right">Qty</th>
                    <th className="px-6 py-3 text-right">Unit Price</th>
                    <th className="px-6 py-3">GL Account</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.lineItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-6 py-3 text-slate-900">
                        {item.description}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-500">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {item.glAccount ? (
                          <span className="text-xs">
                            {item.glAccount.code} · {item.glAccount.name}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td
                      colSpan={4}
                      className="px-6 py-3 text-right text-sm font-semibold text-slate-700"
                    >
                      Total
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">
                      {formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          {bill.payments.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-900">
                  Payment History
                </h2>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      <th className="px-6 py-3">Method</th>
                      <th className="px-6 py-3">Scheduled</th>
                      <th className="px-6 py-3">Processed</th>
                      <th className="px-6 py-3">Reference</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-6 py-3 font-medium text-slate-700">
                          {payment.method}
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {payment.scheduledDate
                            ? formatDate(payment.scheduledDate)
                            : "—"}
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {payment.processedDate
                            ? formatDate(payment.processedDate)
                            : "—"}
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-slate-500">
                          {payment.reference ?? "—"}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={
                              payment.status === "COMPLETED"
                                ? "text-emerald-600"
                                : payment.status === "FAILED"
                                  ? "text-red-600"
                                  : "text-amber-600"
                            }
                          >
                            {payment.status.charAt(0) +
                              payment.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-slate-900">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: metadata + actions */}
        <div className="flex flex-col gap-4">
          {/* Actions */}
          <BillActions
            bill={{ id: bill.id, status: bill.status, createdById: bill.createdById }}
            role={ctx.role}
            userId={ctx.userId}
          />

          {/* Vendor link is manager-only */}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">Details</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Vendor" value={bill.vendor.name} />
              <Row
                label="Invoice Date"
                value={formatDate(bill.invoiceDate)}
              />
              <Row label="Due Date" value={formatDate(bill.dueDate)} />
              <Row
                label="Payment Method"
                value={bill.paymentMethod ?? "—"}
              />
              {bill.memo && <Row label="Memo" value={bill.memo} />}
              <hr className="border-slate-100" />
              <Row label="Created" value={formatDate(bill.createdAt)} />
              {bill.submittedAt && (
                <Row label="Submitted" value={formatDate(bill.submittedAt)} />
              )}
              {bill.approvedAt && (
                <Row label="Approved" value={formatDate(bill.approvedAt)} />
              )}
              {bill.paidAt && (
                <Row label="Paid" value={formatDate(bill.paidAt)} />
              )}
            </CardContent>
          </Card>

          {/* Vendor card */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">Vendor</h2>
              {ctx.role === "MANAGER" && (
                <Link
                  href={`/vendors/${bill.vendor.id}`}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View
                </Link>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">{bill.vendor.name}</p>
              {bill.vendor.email && (
                <p className="text-slate-500">{bill.vendor.email}</p>
              )}
              {bill.vendor.phone && (
                <p className="text-slate-500">{bill.vendor.phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Status history */}
          {bill.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-900">History</h2>
              </CardHeader>
              <CardContent>
                <BillStatusTimeline history={bill.statusHistory} />
              </CardContent>
            </Card>
          )}
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
