import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService, getRoleChangeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        memberId: true,
        emailVerified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        assignedTrainerId: true,
        assignedTrainer: {
          select: { id: true, name: true, email: true }
        },
        memberships: {
          include: { pricingPack: true }
        },
        checkins: {
          orderBy: { checkedIn: 'desc' },
          take: 10
        },
        _count: {
          select: { memberships: true, checkins: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Admin user GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { role, isActive, assignedTrainerId, name } = body

    // Prevent admin from demoting themselves
    if (id === (session.user as any).id && role && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Cannot change your own admin role' }, { status: 400 })
    }

    const currentUser = await prisma.user.findUnique({ where: { id } })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (role) updateData.role = role
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (assignedTrainerId !== undefined) updateData.assignedTrainerId = assignedTrainerId || null
    if (name) updateData.name = name

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        memberId: true,
        isActive: true,
        assignedTrainerId: true,
      }
    })

    // Send notification if role changed
    if (role && role !== currentUser.role) {
      const emailContent = getRoleChangeEmail(
        currentUser.memberId || '',
        currentUser.name || '',
        currentUser.role,
        role
      )
      await emailService.sendEmail({
        to: currentUser.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: (session.user as any).id,
          action: 'ROLE_CHANGED',
          entity: 'User',
          entityId: id,
          oldData: { role: currentUser.role },
          newData: { role },
        }
      })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Admin user PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Prevent admin from deleting themselves
    if (id === (session.user as any).id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'USER_DELETED',
        entity: 'User',
        entityId: id,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin user DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}