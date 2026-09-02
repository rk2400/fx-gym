import { PageSkeleton } from '@/components/ui/page-loading'

export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageSkeleton />
    </div>
  )
}