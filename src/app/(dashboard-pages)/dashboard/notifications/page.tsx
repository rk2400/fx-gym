'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BellRing, Loader2, MailOpen, CheckCheck, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface NotificationItem {
  id: string
  announcementId: string
  title: string
  content: string
  createdAt: string
  author: string | null
  readAt: string | null
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h1|h2|h3|blockquote|tr)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/notifications')
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch {
      // Silent — the bell badge will just not show a count
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markRead = async (id: string) => {
    setBusy(true)
    try {
      const res = await fetch('/api/dashboard/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)))
      setUnreadCount(data.unreadCount)
      window.dispatchEvent(new Event('app:notifications-changed'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update notification')
    } finally {
      setBusy(false)
    }
  }

  const markAllRead = async () => {
    if (unreadCount === 0) return
    setBusy(true)
    try {
      const res = await fetch('/api/dashboard/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })))
      setUnreadCount(data.unreadCount)
      window.dispatchEvent(new Event('app:notifications-changed'))
      toast.success('All notifications marked as read')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update notifications')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="heading-2 text-gym-text flex items-center gap-2">
              <BellRing className="h-6 w-6 text-gym-primary" aria-hidden="true" />
              Notifications
            </h1>
            <p className="text-gym-text-muted mt-1">Announcements and messages from FX Gym.</p>
          </div>
          <Button variant="outline" onClick={markAllRead} disabled={busy || unreadCount === 0}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
            Mark all read
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MailOpen className="h-5 w-5 text-gym-primary" aria-hidden="true" />
              Inbox
              {unreadCount > 0 && <Badge variant="warning">{unreadCount} unread</Badge>}
            </CardTitle>
            <CardDescription>{notifications.length} notification(s) total</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-gym-primary" aria-hidden="true" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-3 p-3 rounded-full bg-gym-bg w-fit">
                  <BellRing className="h-6 w-6 text-gym-text-muted" aria-hidden="true" />
                </div>
                <p className="text-sm text-gym-text-muted">No notifications yet. You&apos;re all caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gym-border">
                {notifications.map((n) => (
                  <li key={n.id} className={n.readAt ? 'opacity-70' : 'bg-gym-primary/[0.03]'}>
                    <button
                      className="w-full text-left px-5 py-4 flex items-start justify-between gap-3"
                      onClick={() => {
                        setExpandedId(expandedId === n.id ? null : n.id)
                        if (!n.readAt) markRead(n.id)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                            n.readAt ? 'bg-gym-bg' : 'bg-gym-primary/15'
                          }`}
                        >
                          <Megaphone
                            className={`h-4 w-4 ${n.readAt ? 'text-gym-text-muted' : 'text-gym-primary'}`}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gym-text text-sm">{n.title}</p>
                          <p className="text-xs text-gym-text-muted mt-0.5 line-clamp-2">{stripHtml(n.content)}</p>
                          <p className="text-xs text-gym-text-muted mt-1">
                            {formatDate(n.createdAt)}
                            {n.author ? ` · ${n.author}` : ''}
                          </p>
                        </div>
                      </div>
                      {!n.readAt && (
                        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gym-primary shrink-0" aria-label="Unread" />
                      )}
                    </button>
                    {expandedId === n.id && (
                      <div className="px-5 pb-5 -mt-1">
                        <div className="rounded-xl border border-gym-border bg-gym-bg/60 p-4">
                          <div
                            className="announcement-preview text-sm text-gym-text"
                            dangerouslySetInnerHTML={{ __html: n.content }}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <style>{`
        .announcement-preview p { margin: 0 0 0.6em; }
        .announcement-preview h2 { font-size: 1.1rem; font-weight: 700; margin: 0.8em 0 0.4em; }
        .announcement-preview h1, .announcement-preview h3 { font-weight: 700; margin: 0.8em 0 0.4em; }
        .announcement-preview ul, .announcement-preview ol { margin: 0.4em 0; padding-left: 1.4em; }
        .announcement-preview ul { list-style: disc; }
        .announcement-preview ol { list-style: decimal; }
        .announcement-preview blockquote {
          margin: 0.6em 0; padding: 0.4em 1em; border-left: 3px solid #00ff88;
          background: rgba(0,255,136,0.06); border-radius: 6px;
        }
        .announcement-preview a { color: #00b368; text-decoration: underline; }
      `}</style>
    </div>
  )
}