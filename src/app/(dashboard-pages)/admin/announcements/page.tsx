'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Megaphone,
  Loader2,
  Send,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Link as LinkIcon,
  Eraser,
  Eye,
  BellRing,
  Users,
  MailCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface AnnouncementItem {
  id: string
  title: string
  content: string
  createdAt: string
  createdBy: { name: string | null; email: string }
  totalRecipients: number
  unread: number
  emailed: number
}

// ---------------------------------------------------------------------------
// RichTextEditor — lightweight toolbar built on the contentEditable API.
// Bold / italic / underline / strikethrough, headings, lists, quotes and
// links, with the resulting HTML stored for both the app and the email.
// ---------------------------------------------------------------------------
function exec(command: string, value?: string) {
  document.execCommand(command, false, value)
}

interface ToolbarBtn {
  label: string
  icon: React.ReactNode
  action: () => void
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null)

  // Sync from outside (e.g. clearing after a successful send).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value
    }
  }, [value])

  const addLink = () => {
    const url = window.prompt('Link URL', 'https://')
    if (url) exec('createLink', url)
  }

  const toolbar: ToolbarBtn[] = [
    { label: 'Bold', icon: <Bold className="h-4 w-4" />, action: () => exec('bold') },
    { label: 'Italic', icon: <Italic className="h-4 w-4" />, action: () => exec('italic') },
    { label: 'Underline', icon: <Underline className="h-4 w-4" />, action: () => exec('underline') },
    { label: 'Strikethrough', icon: <Strikethrough className="h-4 w-4" />, action: () => exec('strikeThrough') },
    { label: 'Heading', icon: <Heading2 className="h-4 w-4" />, action: () => exec('formatBlock', 'h2') },
    { label: 'Bullet list', icon: <List className="h-4 w-4" />, action: () => exec('insertUnorderedList') },
    { label: 'Numbered list', icon: <ListOrdered className="h-4 w-4" />, action: () => exec('insertOrderedList') },
    { label: 'Blockquote', icon: <Quote className="h-4 w-4" />, action: () => exec('formatBlock', 'blockquote') },
    { label: 'Insert link', icon: <LinkIcon className="h-4 w-4" />, action: addLink },
    { label: 'Clear formatting', icon: <Eraser className="h-4 w-4" />, action: () => {
      exec('removeFormat')
      if (ref.current) document.execCommand('formatBlock', false, 'div')
    } },
  ]

  return (
    <div className="rounded-xl border border-gym-border overflow-hidden focus-within:border-gym-primary/60 transition-colors">
      <div className="flex flex-wrap items-center gap-1 border-b border-gym-border bg-gym-bg/60 p-1.5">
        {toolbar.map((btn) => (
          <button
            key={btn.label}
            type="button"
            title={btn.label}
            aria-label={btn.label}
            className="p-1.5 rounded-md text-gym-text-muted hover:text-gym-text hover:bg-gym-surface transition-colors"
            onMouseDown={(e) => e.preventDefault()}
            onClick={btn.action}
          >
            {btn.icon}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Announcement body"
        data-placeholder="Write your announcement… Use the toolbar to format text, add bullet points, quotes and links."
        className="announcement-body min-h-[220px] max-h-[420px] overflow-y-auto px-4 py-3 text-sm text-gym-text outline-none"
        onInput={() => {
          if (ref.current) onChange(ref.current.innerHTML)
        }}
        onBlur={() => {
          if (ref.current) onChange(ref.current.innerHTML)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab') e.preventDefault()
        }}
      />
    </div>
  )
}

function stripHtmlForPreview(html: string): string {
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
export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/announcements')
      const data = await res.json()
      if (res.ok) setAnnouncements(data)
      else toast.error(data.error || 'Failed to load announcements')
    } catch {
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const canSend = title.trim().length >= 3 && stripHtmlForPreview(content).length >= 1

  const handleSend = async () => {
    if (!title.trim()) return toast.error('Give the announcement a title')
    if (stripHtmlForPreview(content).length < 1) return toast.error('Write something in the announcement body')
    setSending(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send announcement')
      setTitle('')
      setContent('')
      setShowPreview(false)
      toast.success(
        data.emailFailures > 0
          ? `Announcement sent to ${data.recipients} members (${data.emailFailures} emails failed)`
          : `Announcement sent to ${data.recipients} active members`
      )
      fetchAnnouncements()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send announcement')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="heading-2 text-gym-text flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-gym-primary" aria-hidden="true" />
              Announcements
            </h1>
            <p className="text-gym-text-muted mt-1">
              Broadcast a notice to every active member — it appears in their notification centre and lands in their inbox.
            </p>
          </div>
        </div>
      </motion.div>
{/* Composer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-gym-surface border-gym-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-gym-primary" aria-hidden="true" />
              New Announcement
            </CardTitle>
            <CardDescription>
              Notifies all <span className="text-gym-primary font-medium">active members</span> in-app and by email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                placeholder="e.g. Festive Offer: 20% off Annual Plans"
                value={title}
                maxLength={200}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Announcement body</Label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview((v) => !v)}
                disabled={!canSend}
              >
                <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {showPreview ? 'Hide' : 'Preview'}
              </Button>
              <Button type="button" onClick={handleSend} disabled={sending || !canSend} className="min-w-[180px]">
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Broadcasting…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                    Send to All Members
                  </>
                )}
              </Button>
            </div>

            {showPreview && canSend && (
              <div className="rounded-xl border border-gym-border bg-gym-bg/60 p-4">
                <p className="text-xs uppercase tracking-wide text-gym-text-muted mb-3 flex items-center gap-1.5">
                  <MailCheck className="h-4 w-4 text-gym-primary" aria-hidden="true" />
                  Email preview
                </p>
                <div className="rounded-lg bg-gradient-to-br from-[#0a0a0f] to-[#12121a] px-5 py-6 text-[#f0f0f5] max-w-xl mx-auto">
                  <p className="text-center text-[11px] uppercase tracking-widest text-[#888899]">FX Gym Announcement</p>
                  <h3 className="text-center text-lg font-bold mt-1 mb-4" style={{ lineHeight: 1.3 }}>
                    {title}
                  </h3>
                  <div className="rounded-md bg-white/5 border border-white/10 p-4 text-sm text-[#e8e8ee]">
                    <div
                      className="announcement-preview"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
{/* History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gym-primary" aria-hidden="true" />
              Sent Announcements
            </CardTitle>
            <CardDescription>Recent broadcasts and how many members have seen them.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gym-primary" aria-hidden="true" />
              </div>
            ) : announcements.length === 0 ? (
              <p className="py-10 text-center text-gym-text-muted text-sm">
                No announcements yet — the first one will show up here.
              </p>
            ) : (
              <ul className="divide-y divide-gym-border">
                {announcements.map((a) => (
                  <li key={a.id} className="py-4">
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <BellRing className="h-4 w-4 text-gym-primary shrink-0" aria-hidden="true" />
                          <span className="font-medium text-gym-text">{a.title}</span>
                          <Badge variant="secondary">{a.totalRecipients} recipients</Badge>
                          {a.unread > 0 && <Badge variant="warning">{a.unread} unread</Badge>}
                        </div>
                        <span className="text-xs text-gym-text-muted">
                          {formatDate(a.createdAt)} · {a.createdBy.name || a.createdBy.email}
                        </span>
                      </div>
                    </button>
                    {expandedId === a.id && (
                      <div className="mt-3 rounded-lg border border-gym-border bg-gym-bg/50 p-4">
                        <div className="flex items-center gap-4 mb-3 text-xs text-gym-text-muted">
                          <span className="inline-flex items-center gap-1">
                            <MailCheck className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />
                            {a.emailed} emailed
                          </span>
                          <span>{a.totalRecipients - a.unread} read</span>
                        </div>
                        <div
                          className="announcement-preview text-sm text-gym-text"
                          dangerouslySetInnerHTML={{ __html: a.content }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Shared styles for rich-text output (composer preview + history + user app) */}
      <style>{`
        .announcement-body:empty::before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }
        .announcement-preview p { margin: 0 0 0.6em; }
        .announcement-preview h2 { font-size: 1.15rem; font-weight: 700; margin: 0.8em 0 0.4em; }
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