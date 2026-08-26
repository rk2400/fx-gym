import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics' }

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="heading-2 text-gym-text">Analytics</h1>
      <p className="text-gym-text-muted mt-2">
        Check-in trends, revenue and retention analytics are coming soon.
      </p>
    </div>
  )
}
