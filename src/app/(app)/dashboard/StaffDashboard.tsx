import Link from "next/link";

import { BillStatusBadge } from "~/components/bills/BillStatusBadge";
import { Button } from "~/components/ui/Button";
import { Card, CardContent, CardHeader } from "~/components/ui/Card";
import { cn, formatCurrency, getDueDateLabel, isOverdue } from "~/lib/utils";
import { type BillService } from "~/server/services/BillService";

export async function StaffDashboard({
  billService,
  userName,
}: {
  billService: BillService;
  userName: string | null;
}) {
  const myBills = await billService.list({
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const firstName = userName?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a174f]">
            Hi {firstName}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Submit bills for approval and track their status here.
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

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold text-[#1a174f]">My Bills</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Only the bills you&apos;ve submitted are shown here.
            </p>
          </div>
          <Link
            href="/bills"
            className="text-sm font-semibold text-[#10A6CC] hover:text-[#0d8faf]"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {myBills.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              You haven&apos;t submitted any bills yet.{" "}
              <Link
                href="/bills/new"
                className="text-[#312D97] hover:underline"
              >
                Submit your first bill
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ecebff] bg-brand-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3">Vendor</th>
                    <th className="px-6 py-3">Invoice #</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myBills.map((bill) => {
                    const overdue = isOverdue(bill.dueDate, bill.status);
                    return (
                      <tr
                        key={bill.id}
                        className="border-b border-[#ecebff] transition-colors last:border-0 hover:bg-brand-50"
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
