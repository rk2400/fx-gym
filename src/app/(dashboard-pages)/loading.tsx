export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gym-bg" role="status" aria-label="Loading dashboard">
      <div className="lg:pl-64">
        <header className="flex h-16 items-center border-b border-gym-border bg-gym-surface px-6 lg:px-8">
          <div className="h-5 w-40 animate-pulse rounded bg-gym-surface" />
        </header>
        <main className="p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-pulse space-y-6">
            <div className="h-9 w-64 max-w-full rounded-lg bg-gym-surface" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl border border-gym-border bg-gym-surface" />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-72 rounded-2xl border border-gym-border bg-gym-surface" />
              <div className="h-72 rounded-2xl border border-gym-border bg-gym-surface" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
