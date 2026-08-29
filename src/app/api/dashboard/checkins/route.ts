import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { autoCloseStaleSessions } from '@/lib/checkin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Lazy auto-close: forgotten open sessions are capped at 60 minutes so
    // history and streak calculations always see final, truthful entries.
    await autoCloseStaleSessions(userId)

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const checkins = await prisma.checkin.findMany({
      where: { userId },
      orderBy: { checkedIn: 'desc' },
      take: limit,
    })

    // Superset shape that serves BOTH consumers:
    // - check-in page uses: date / checkIn / checkOut (calendar & history list)
    // - member dashboard uses: checkedIn / checkedOut / duration (recent activity)
    return NextResponse.json(checkins.map(c => ({
      id: c.id,
      date: c.checkedIn.toISOString().split('T')[0],
      checkIn: c.checkedIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      checkOut: c.checkedOut?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || null,
      checkedIn: c.checkedIn.toISOString(),
      checkedOut: c.checkedOut?.toISOString() || null,
      type: c.type ?? 'strength',
      duration: c.checkedOut
        ? Math.round((c.checkedOut.getTime() - c.checkedIn.getTime()) / (1000 * 60))
        : 0,
    })))
  } catch (error) {
    console.error('Dashboard checkins GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch checkins' }, { status: 500 })
  }
}