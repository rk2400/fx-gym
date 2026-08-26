import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return null
  return session
}

const packSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().trim().max(500).optional().nullable(),
  price: z.coerce.number().min(0, 'Price cannot be negative').max(10_000_000),
  duration: z.coerce.number().int().min(1, 'Duration must be at least 1 day').max(3650),
  features: z.array(z.string().trim().min(1)).default([]),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
})

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const packs = await prisma.pricingPack.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { memberships: true } } },
    })
    return NextResponse.json(packs)
  } catch (error) {
    console.error('Admin pricing GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing plans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const parsed = packSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const data = parsed.data
    let slug = slugify(data.name)
    const existing = await prisma.pricingPack.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now().toString(36)}`

    const pack = await prisma.pricingPack.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        price: data.price,
        duration: data.duration,
        features: data.features,
        isPopular: data.isPopular,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'PRICING_PLAN_CREATED',
        entity: 'PricingPack',
        entityId: pack.id,
        newData: { name: pack.name, price: pack.price, duration: pack.duration },
      },
    })

    return NextResponse.json(pack, { status: 201 })
  } catch (error) {
    console.error('Admin pricing POST error:', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const schema = packSchema.extend({ id: z.string().min(1) })
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { id, ...data } = parsed.data
    const existing = await prisma.pricingPack.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const pack = await prisma.pricingPack.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        duration: data.duration,
        features: data.features,
        isPopular: data.isPopular,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'PRICING_PLAN_UPDATED',
        entity: 'PricingPack',
        entityId: id,
        newData: { name: pack.name, price: pack.price, duration: pack.duration, isActive: pack.isActive },
      },
    })

    return NextResponse.json(pack)
  } catch (error) {
    console.error('Admin pricing PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

/** Soft-delete: deactivate so historical memberships keep their reference. */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Plan id is required' }, { status: 400 })

    const activeMembers = await prisma.membership.count({
      where: { pricingPackId: id, status: 'ACTIVE' },
    })
    if (activeMembers > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${activeMembers} active member(s) are on this plan. Deactivate it instead.` },
        { status: 400 }
      )
    }

    const pack = await prisma.pricingPack.update({
      where: { id },
      data: { isActive: false },
    })

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'PRICING_PLAN_DEACTIVATED',
        entity: 'PricingPack',
        entityId: id,
        newData: { name: pack.name },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin pricing DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}
