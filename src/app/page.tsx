export const dynamic = "force-dynamic";

import Link from "next/link";
import { billService } from "~/server/container";
import { StatCard } from "~/components/ui/StatCard";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";
import { BillStatusBadge } from "~/components/bills/BillStatusBadge";
import { Button } from "~/components/ui/Button";
import { formatCurrency, getDueDateLabel, isOverdue } from "~/lib/utils";
import { cn } from "~/lib/utils";

export default async function DashboardPage() {
  const [stats, recentBills] = await Promise.all([
    billService.getDashboardStats(),
    billService.getRecentBills(8),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a174f]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Overview of your accounts payable
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

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Outstanding"
          value={formatCurrency(stats.totalPayable)}
          sub="Across all active bills"
        />
        <StatCard
          label="Due This Week"
          value={formatCurrency(stats.dueSoonAmount)}
          sub={`${stats.dueSoonCount} bill${stats.dueSoonCount !== 1 ? "s" : ""}`}
          accent="amber"
        />
        <StatCard
          label="Overdue"
          value={formatCurrency(stats.overdueAmount)}
          sub={`${stats.overdueCount} bill${stats.overdueCount !== 1 ? "s" : ""}`}
          accent="red"
        />
        <StatCard
          label="Paid This Month"
          value={formatCurrency(stats.paidThisMonthAmount)}
          sub={`${stats.paidThisMonthCount} bill${stats.paidThisMonthCount !== 1 ? "s" : ""} processed`}
          accent="emerald"
        />
      </div>

      {/* Recent bills */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[#1a174f]">Recent Bills</h2>
          <Link
            href="/bills"
            className="text-sm font-semibold text-[#10A6CC] hover:text-[#0d8faf]"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentBills.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No bills yet.{" "}
              <Link href="/bills/new" className="text-[#312D97] hover:underline">
                Create your first bill
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ecebff] bg-brand-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Vendor</th>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((bill) => {
                  const overdue = isOverdue(bill.dueDate, bill.status);
                  return (
                    <tr
                      key={bill.id}
                      className="border-b border-[#ecebff] last:border-0 transition-colors hover:bg-brand-50"
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
        </CardContent>
      </Card>
    </div>
  );
}
