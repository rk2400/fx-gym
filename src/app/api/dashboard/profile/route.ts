import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { profileSchema } from '@/lib/validations/profile'

/** Fields on the user record that the profile form may read/write. */
const profileSelect = {
  id: true,
  email: true,
  name: true,
  memberId: true,
  role: true,
  phone: true,
  weightKg: true,
  heightCm: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  address: true,
} as const

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: profileSelect,
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        phone: data.phone || null,
        // Empty string / undefined → null so clearing a field actually clears it
        weightKg:
          data.weightKg === null || data.weightKg === undefined || (data.weightKg as unknown) === ''
            ? null
            : Number(data.weightKg),
        heightCm:
          data.heightCm === null || data.heightCm === undefined || (data.heightCm as unknown) === ''
            ? null
            : Number(data.heightCm),
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        address: data.address || null,
      },
      select: profileSelect,
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}