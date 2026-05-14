export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServices } from "~/server/container";
import { requireManagerContext } from "~/server/get-user";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { EmptyState } from "~/components/ui/EmptyState";
import { formatCurrency } from "~/lib/utils";
import { Pagination } from "~/components/ui/Pagination";

const DEFAULT_PAGE_SIZE = 20;

interface VendorsPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  await requireManagerContext();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = Math.max(1, parseInt(params.pageSize ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE);

  const { vendorService } = await getServices();
  const { data: vendors, total, totalPages } = await vendorService.list({ page, pageSize });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a174f]">Vendors</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {total} vendor{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/vendors/new">
          <Button size="md">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Vendor
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#ecebff] bg-white shadow-lg shadow-[#d3d1ff]/40">
        {vendors.length === 0 ? (
          <EmptyState
            title="No vendors yet"
            description="Add your first vendor to start tracking bills."
            action={
              <Link href="/vendors/new">
                <Button variant="primary" size="sm">New Vendor</Button>
              </Link>
            }
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ecebff] bg-brand-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Vendor</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Payment Method</th>
                    <th className="px-6 py-3 text-right">Active Bills</th>
                    <th className="px-6 py-3 text-right">Total Paid</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="border-b border-[#ecebff] last:border-0 transition-colors hover:bg-brand-50"
                    >
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="font-medium text-[#1a174f] hover:text-[#312D97]"
                        >
                          {vendor.name}
                        </Link>
                        {vendor.website && (
                          <p className="text-xs text-slate-400">
                            {vendor.website.replace(/^https?:\/\//, "")}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {vendor.email ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {vendor.defaultPaymentMethod}
                      </td>
                      <td className="px-6 py-3.5 text-right text-slate-900">
                        {vendor.activeBillCount}
                      </td>
                      <td className="px-6 py-3.5 text-right font-medium text-slate-900">
                        {formatCurrency(vendor.totalPaid)}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={vendor.status === "ACTIVE" ? "emerald" : "gray"}
                        >
                          {vendor.status === "ACTIVE" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              basePath="/vendors"
              defaultPageSize={DEFAULT_PAGE_SIZE}
            />
          </>
        )}
      </div>
    </div>
  );
}
