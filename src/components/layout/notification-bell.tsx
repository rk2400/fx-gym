'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { BellRing } from 'lucide-react'

/**
 * Header bell with a live unread badge. Polls quietly every 60s and also
 * refreshes instantly when a real-time 'app:notifications-changed' event is
 * dispatched (e.g. after marking items read on the notifications page).
 */
export function NotificationBell() {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/notifications')
      if (res.ok) {
        const data = await res.json()
        setCount(data.unreadCount ?? 0)
      }
    } catch {
      // Offline / error — keep whatever count we have
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    const handler = () => refresh()
    window.addEventListener('app:notifications-changed', handler)
    return () => {
      clearInterval(id)
      window.removeEventListener('app:notifications-changed', handler)
    }
  }, [refresh])

  return (
    <Link
      href="/dashboard/notifications"
      aria-label={`Notifications${count > 0 ? `: ${count} unread` : ''}`}
      title="Notifications"
      className="relative p-2 rounded-lg text-gym-text-muted hover:text-gym-text hover:bg-gym-bg transition-colors"
    >
      <BellRing className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gym-accent text-gym-bg text-[10px] font-bold flex items-center justify-center leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}