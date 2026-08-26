import { redirect } from 'next/navigation'

// `/trainer` is an alias – the trainer's home is the clients list.
// force-dynamic so the redirect happens as a real HTTP 307 on every request,
// including direct address-bar visits to /trainer (static prerender would
// defer the redirect to client-side hydration instead).
export const dynamic = 'force-dynamic'

export default function TrainerIndexPage() {
  redirect('/trainer/clients')
}