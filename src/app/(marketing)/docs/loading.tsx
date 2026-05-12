import { Skeleton } from "~/components/ui/Skeleton";

export default function DocsLoading() {
  return (
    <div className="flex min-h-full">
      {/* Sticky TOC */}
      <aside className="hidden w-52 flex-shrink-0 xl:block">
        <div className="sticky top-0 overflow-y-auto py-10 pl-8 pr-4">
          <Skeleton className="mb-4 h-3 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-32" />
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <article className="min-w-0 flex-1 px-8 py-10 xl:pr-16">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-3 flex items-center gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-64" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-3/4 max-w-md" />
          </div>
        </div>

        {/* Body sections */}
        {Array.from({ length: 3 }).map((_, sectionIdx) => (
          <div key={sectionIdx} className="mt-12 first:mt-0">
            <Skeleton className="h-6 w-48" />
            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-100">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <Skeleton className="h-3 w-24" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 border-b border-slate-50 px-4 py-3 last:border-0"
                >
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3.5 w-40" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </article>
    </div>
  );
}
