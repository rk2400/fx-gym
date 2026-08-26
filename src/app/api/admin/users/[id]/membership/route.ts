import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return null
  return session
}

/** GET – current membership + history for a user. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const memberships = await prisma.membership.findMany({
      where: { userId: id },
      include: { pricingPack: true },
      orderBy: { startDate: 'desc' },
    })

    const current =
      memberships.find((m) => m.status === 'ACTIVE') ??
      memberships.find((m) => m.status === 'PENDING') ??
      null

    return NextResponse.json({ current, history: memberships })
  } catch (error) {
    console.error('Admin user membership GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 })
  }
}

/**
 * PUT – assign/change the user's membership plan.
 * Cancels any ACTIVE/PENDING membership and starts a new one today,
 * with endDate = startDate + pack duration.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: userId } = await params
    const body = await request.json().catch(() => null)
    const pricingPackId: string | undefined = body?.pricingPackId

    if (!pricingPackId) {
      return NextResponse.json({ error: 'pricingPackId is required' }, { status: 400 })
    }

    const pack = await prisma.pricingPack.findUnique({ where: { id: pricingPackId } })
    if (!pack || !pack.isActive) {
      return NextResponse.json({ error: 'Selected plan is not valid' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + pack.duration * 24 * 60 * 60 * 1000)

    const result = await prisma.$transaction(async (tx) => {
      // Cancel any current active/pending membership so only one is live at a time
      await tx.membership.updateMany({
        where: { userId, status: { in: ['ACTIVE', 'PENDING'] } },
        data: { status: 'CANCELLED', endDate: startDate },
      })

      const membership = await tx.membership.create({
        data: {
          userId,
          pricingPackId: pack.id,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
        include: { pricingPack: true },
      })

      // Reactivate account if it was pending activation
      if (!user.isActive) {
        await tx.user.update({ where: { id: userId }, data: { isActive: true } })
      }

      return membership
    })

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'MEMBERSHIP_ASSIGNED',
        entity: 'Membership',
        entityId: result.id,
        newData: {
          targetUser: user.email,
          plan: pack.name,
          price: Number(pack.price),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
    })

    return NextResponse.json({
      success: true,
      membership: {
        id: result.id,
        planName: result.pricingPack.name,
        price: Number(result.pricingPack.price),
        durationDays: result.pricingPack.duration,
        startDate: result.startDate.toISOString(),
        endDate: result.endDate.toISOString(),
        status: result.status,
      },
    })
  } catch (error) {
    console.error('Admin user membership PUT error:', error)
    return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 })
  }
}