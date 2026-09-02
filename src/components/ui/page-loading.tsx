import { Skeleton } from '@/components/ui/skeleton'

/** Centered spinner fallback for route-level + async loading states. */
export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gym-primary border-t-transparent" />
      <p className="text-sm text-gym-text-muted">{label}</p>
    </div>
  )
}

/** Skeleton layout used by `loading.tsx` boundaries so navigation never appears frozen. */
export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  )
}