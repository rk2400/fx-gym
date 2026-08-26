import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Progress Tracking' }

export default function TrainerProgressPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="heading-2 text-gym-text">Progress Tracking</h1>
      <p className="text-gym-text-muted mt-2">Client progress tracking is coming soon.</p>
    </div>
  )
}
