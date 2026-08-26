import { redirect } from 'next/navigation'

// Self-registration was removed – accounts are created by the gym admin only.
// Anyone landing on the old /register URL is sent to sign-in instead.
export const dynamic = 'force-dynamic'

export default function RegisterRedirectPage() {
  redirect('/login')
}