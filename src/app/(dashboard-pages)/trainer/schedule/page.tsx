import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Schedule' }

export default function TrainerSchedulePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="heading-2 text-gym-text">Schedule</h1>
      <p className="text-gym-text-muted mt-2">Session scheduling is coming soon.</p>
    </div>
  )
}
