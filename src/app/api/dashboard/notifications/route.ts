import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const [receipts, unreadCount] = await Promise.all([
      prisma.announcementRecipient.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          announcement: {
            select: {
              id: true,
              title: true,
              content: true,
              createdAt: true,
              createdBy: { select: { name: true } },
            },
          },
        },
      }),
      prisma.announcementRecipient.count({ where: { userId: user.id, readAt: null } }),
    ])

    return NextResponse.json({
      unreadCount,
      notifications: receipts.map((r) => ({
        id: r.id,
        announcementId: r.announcement.id,
        title: r.announcement.title,
        content: r.announcement.content,
        createdAt: r.announcement.createdAt,
        author: r.announcement.createdBy.name,
        readAt: r.readAt,
      })),
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const { id, all } = body as { id?: string; all?: boolean }

    if (all) {
      await prisma.announcementRecipient.updateMany({
        where: { userId: user.id, readAt: null },
        data: { readAt: new Date() },
      })
    } else if (id) {
      await prisma.announcementRecipient.updateMany({
        where: { id, userId: user.id, readAt: null },
        data: { readAt: new Date() },
      })
    } else {
      return NextResponse.json({ error: 'Missing id or all flag' }, { status: 400 })
    }

    const unreadCount = await prisma.announcementRecipient.count({
      where: { userId: user.id, readAt: null },
    })
    return NextResponse.json({ success: true, unreadCount })
  } catch (error) {
    console.error('Notifications POST error:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}