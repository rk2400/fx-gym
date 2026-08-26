export default function PublicLoading() {
  return (
    <div
      className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-16 sm:px-6 lg:px-8"
      role="status"
      aria-label="Loading page"
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto h-12 w-96 max-w-full rounded-lg bg-gym-surface" />
        <div className="mx-auto h-5 w-[28rem] max-w-full rounded bg-gym-surface" />
        <div className="mx-auto flex justify-center gap-4 pt-2">
          <div className="h-11 w-40 rounded-lg bg-gym-primary/20" />
          <div className="h-11 w-40 rounded-lg bg-gym-surface" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 rounded-2xl border border-gym-border bg-gym-surface" />
        ))}
      </div>
    </div>
  )
}
