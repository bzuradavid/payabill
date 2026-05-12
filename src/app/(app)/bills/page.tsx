export const dynamic = "force-dynamic";

import Link from "next/link";
import { type BillStatus } from "../../../../generated/prisma";
import { getServices } from "~/server/container";
import { Button } from "~/components/ui/Button";
import { BillStatusBadge } from "~/components/bills/BillStatusBadge";
import { EmptyState } from "~/components/ui/EmptyState";
import { formatCurrency, formatDate, getDueDateLabel, isOverdue } from "~/lib/utils";
import { cn } from "~/lib/utils";
import { BillsFilterBar } from "./BillsFilterBar";

const STATUS_TABS: { label: string; value: BillStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Paid", value: "PAID" },
];

interface BillsPageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function BillsPage({ searchParams }: BillsPageProps) {
  const params = await searchParams;
  const activeStatus = (params.status as BillStatus | "ALL") ?? "ALL";
  const search = params.q ?? "";

  const { billService } = await getServices();
  const bills = await billService.list({
    statuses:
      activeStatus === "ALL"
        ? undefined
        : [activeStatus],
    search: search ? search : undefined,
    sortBy: "dueDate",
    sortDir: "asc",
  });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a174f]">Bills</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {bills.length} bill{bills.length !== 1 ? "s" : ""}
            {activeStatus !== "ALL" ? ` · ${activeStatus.toLowerCase().replace("_", " ")}` : ""}
          </p>
        </div>
        <Link href="/bills/new">
          <Button size="md">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Bill
          </Button>
        </Link>
      </div>

      {/* Filter bar (client component for search input) */}
      <BillsFilterBar tabs={STATUS_TABS} activeStatus={activeStatus} search={search} />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#ecebff] bg-white shadow-lg shadow-[#d3d1ff]/40">
        {bills.length === 0 ? (
          <EmptyState
            title="No bills found"
            description={
              search
                ? `No bills matching "${search}"`
                : "Get started by creating your first bill."
            }
            action={
              !search && (
                <Link href="/bills/new">
                  <Button variant="primary" size="sm">New Bill</Button>
                </Link>
              )
            }
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ecebff] bg-brand-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Invoice Date</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => {
                const overdue = isOverdue(bill.dueDate, bill.status);
                return (
                  <tr
                    key={bill.id}
                    className={cn(
                      "border-b border-[#ecebff] last:border-0 transition-colors hover:bg-brand-50",
                      overdue && "bg-red-50/40 hover:bg-red-50",
                    )}
                  >
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      <Link
                        href={`/bills/${bill.id}`}
                        className="hover:text-[#312D97]"
                      >
                        {bill.vendor.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {bill.invoiceNumber ?? (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {formatDate(bill.invoiceDate)}
                    </td>
                    <td
                      className={cn(
                        "px-6 py-3.5",
                        overdue
                          ? "font-medium text-red-600"
                          : "text-slate-500",
                      )}
                    >
                      {getDueDateLabel(bill.dueDate, bill.status)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-900">
                      {formatCurrency(bill.totalAmount)}
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
      </div>
    </div>
  );
}
