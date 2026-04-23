export function SkeletonCard() {
  return (
    <div className="bg-card border border-line rounded-card p-5 space-y-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 skeleton-pulse" />
        <div className="h-5 w-16 skeleton-pulse rounded-pill" />
      </div>
      <div className="h-5 w-3/4 skeleton-pulse" />
      <div className="space-y-2">
        <div className="h-3 w-full skeleton-pulse" />
        <div className="h-3 w-2/3 skeleton-pulse" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 skeleton-pulse rounded-full" />
          <div className="h-3 w-20 skeleton-pulse" />
        </div>
        <div className="h-3 w-16 skeleton-pulse" />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return <div className={`${width} ${height} skeleton-pulse`} />;
}

/*
  SkeletonDashboard — full-page skeleton including greeting, stats, filters, and task cards.
  Mirrors the exact Dashboard layout so the transition from loading → loaded is seamless.
*/
export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* ─── Greeting Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="space-y-2.5">
          {/* "Good morning, Alice" */}
          <div className="h-9 w-72 skeleton-pulse rounded-lg" />
          {/* "1 pending · 0 in progress · 0 completed" */}
          <div className="h-4 w-56 skeleton-pulse rounded" />
        </div>
        {/* New Task button placeholder */}
        <div className="h-10 w-32 skeleton-pulse rounded-btn" />
      </div>

      {/* ─── Stats Card ─── */}
      <div className="bg-card border border-line rounded-card shadow-card p-5
        flex flex-wrap items-center gap-6">
        {/* Completion ring */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 skeleton-pulse rounded-full" />
          <div className="space-y-1.5">
            <div className="h-3 w-10 skeleton-pulse rounded" />
            <div className="h-4 w-8 skeleton-pulse rounded" />
          </div>
        </div>

        <div className="hidden sm:block w-px h-9 bg-line" />

        {/* Status badges */}
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-5 w-20 skeleton-pulse rounded-pill" />
              <div className="h-4 w-4 skeleton-pulse rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Filter Tabs ─── */}
      <div className="flex items-center gap-1.5">
        {[80, 56, 96, 56, 72, 72].map((w, i) => (
          <div
            key={i}
            className="skeleton-pulse rounded-btn py-2"
            style={{ width: w, height: 34 }}
          />
        ))}
      </div>

      {/* ─── Task Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
