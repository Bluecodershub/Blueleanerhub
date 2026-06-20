export function PageLoading() {
  return (
    <div className="app-page-frame min-h-[50vh] space-y-6" aria-label="Loading page">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
        <div className="h-8 w-72 max-w-full animate-pulse rounded bg-secondary" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 animate-pulse rounded-[8px] border border-border bg-card" />
        <div className="h-40 animate-pulse rounded-[8px] border border-border bg-card" />
        <div className="h-40 animate-pulse rounded-[8px] border border-border bg-card" />
      </div>
    </div>
  )
}
