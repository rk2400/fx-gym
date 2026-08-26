import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="heading-2 text-gym-text">Settings</h1>
      <p className="text-gym-text-muted mt-2">Gym and site settings are coming soon.</p>
    </div>
  )
}
