export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gym-bg" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-gym-border border-t-gym-primary" />
        <p className="text-sm font-medium text-gym-text-muted">Loading FX Gym…</p>
      </div>
    </div>
  )
}
