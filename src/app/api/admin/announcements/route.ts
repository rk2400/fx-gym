import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { emailService, getAnnouncementEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return null
  return session
}

const announcementSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().trim().min(1, 'Announcement body cannot be empty').max(100_000),
})

/**
 * Lightweight scrub: announcements may include rich-text tags from the editor,
 * but nothing that could run scripts or break out of the HTML email envelope.
 */
function sanitizeContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<link[\s\S]*?\/?>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .trim()
}

// Fan emails out in small concurrent batches so one slow SMTP connection can't
// stall the whole broadcast for a large member list.
async function sendAnnouncementEmails(recipients: { userId: string; email: string }[], title: string, contentHtml: string) {
  const results: { ok: boolean; email: string }[] = []
  const BATCH = 8
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH)
    const sent = await Promise.all(
      batch.map(async (r) => {
        const t = getAnnouncementEmail({
          title,
          contentHtml,
          recipientName: null,
        })
        const ok = await emailService.sendEmail({
          to: r.email,
          subject: `📣 ${title}`,
          html: t.html,
          text: t.text as string,
        })
        return { email: r.email, ok }
      })
    )
    results.push(...sent)
  }
  return results
}
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        createdBy: { select: { name: true, email: true } },
        _count: { select: { recipients: true } },
      },
    })

    // Per-announcement read stats (recipients are fan-out records; count unread)
    const stats = await Promise.all(
      announcements.map(async (a) => {
        const [unread, emailed] = await Promise.all([
          prisma.announcementRecipient.count({ where: { announcementId: a.id, readAt: null } }),
          prisma.announcementRecipient.count({ where: { announcementId: a.id, emailSentAt: { not: null } } }),
        ])
        return { id: a.id, unread, emailed }
      })
    )

    return NextResponse.json(
      announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        createdAt: a.createdAt,
        createdBy: a.createdBy,
        totalRecipients: a._count.recipients,
        unread: stats.find((s) => s.id === a.id)?.unread ?? 0,
        emailed: stats.find((s) => s.id === a.id)?.emailed ?? 0,
      }))
    )
  } catch (error) {
    console.error('Admin announcements GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const parsed = announcementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const title = parsed.data.title.trim()
    const content = sanitizeContent(parsed.data.content)

    // All active accounts (members + trainers) are notified. Deactivated accounts
    // are skipped so we don't email people who can't sign in.
    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true },
    })

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        createdById: (session.user as any).id,
        recipients: {
          create: activeUsers.map((u) => ({ userId: u.id })),
        },
      },
    })

    // Ship the emails, then stamp emailSentAt for the recipients that went out.
    const emailResults = await sendAnnouncementEmails(
      activeUsers.map((u) => ({ userId: u.id, email: u.email })),
      title,
      content
    )

    const sentIds = new Set(emailResults.filter((r) => r.ok).map((r) => r.email))
    const sentRecipientIds = activeUsers.filter((u) => sentIds.has(u.email)).map((u) => u.id)
    if (sentRecipientIds.length > 0) {
      await prisma.announcementRecipient.updateMany({
        where: { announcementId: announcement.id, userId: { in: sentRecipientIds } },
        data: { emailSentAt: new Date() },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'ANNOUNCEMENT_CREATED',
        entity: 'Announcement',
        entityId: announcement.id,
        newData: { title, recipients: activeUsers.length },
      },
    })

    const failed = emailResults.filter((r) => !r.ok).length
    return NextResponse.json(
      {
        success: true,
        announcement,
        recipients: activeUsers.length,
        emailsSent: emailResults.length - failed,
        emailFailures: failed,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin announcements POST error:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}