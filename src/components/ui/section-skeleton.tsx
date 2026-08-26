/**
 * Neutral skeleton shown while a lazily-loaded (next/dynamic) section
 * is being fetched. Pure markup – safe for SSR and adds no JS weight.
 */
export function SectionSkeleton() {
  return (
    <section className="section-sm border-y border-gym-border" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-9 w-72 max-w-full rounded-lg bg-gym-surface" />
            <div className="mx-auto h-4 w-96 max-w-full rounded bg-gym-surface" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-4 rounded-2xl border border-gym-border bg-gym-surface p-6">
                <div className="h-10 w-10 rounded-xl bg-gym-bg" />
                <div className="h-4 w-3/4 rounded bg-gym-bg" />
                <div className="h-3 w-full rounded bg-gym-bg" />
                <div className="h-3 w-5/6 rounded bg-gym-bg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
