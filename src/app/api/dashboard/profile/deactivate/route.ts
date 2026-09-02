import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Deactivates the signed-in user's account. Because every session re-checks
 * `isActive` (see src/lib/auth.ts jwt callback), the current session and any
 * other open sessions on other devices are invalidated right away.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ACCOUNT_DEACTIVATED_BY_USER',
        entity: 'User',
        entityId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deactivation error:', error)
    return NextResponse.json({ error: 'Failed to deactivate account' }, { status: 500 })
  }
}