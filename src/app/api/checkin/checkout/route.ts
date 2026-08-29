import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Find active check-in
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const checkin = await prisma.checkin.findFirst({
      where: {
        userId,
        checkedIn: {
          gte: today,
          lt: tomorrow
        },
        checkedOut: null
      }
    })

    if (!checkin) {
      return NextResponse.json({ error: 'No active check-in found' }, { status: 400 })
    }

    // Always use server time for the check-out timestamp. The client previously sent a
    // locale-formatted string (e.g. "7:15 PM") which `new Date()` cannot reliably parse,
    // producing InvalidDate -> Prisma 500 on every check-out.
    const checkOutDate = new Date()
    if (checkOutDate <= checkin.checkedIn) {
      return NextResponse.json({ error: 'Invalid check-out time' }, { status: 400 })
    }

    // Calculate duration in minutes
    const duration = Math.max(1, Math.round((checkOutDate.getTime() - checkin.checkedIn.getTime()) / (1000 * 60)))

    const updatedCheckin = await prisma.checkin.update({
      where: { id: checkin.id },
      data: {
        checkedOut: checkOutDate,
      }
    })

    return NextResponse.json({
      id: updatedCheckin.id,
      date: formatDate(updatedCheckin.checkedIn),
      checkIn: updatedCheckin.checkedIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      checkOut: updatedCheckin.checkedOut?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || null,
      duration,
      type: updatedCheckin.type || 'other',
    })
  } catch (error) {
    console.error('Check-out error:', error)
    return NextResponse.json({ error: 'Failed to check out' }, { status: 500 })
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}