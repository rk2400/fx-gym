import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateMemberId, generateOTP, emailService, getWelcomeEmail } from '@/lib/email'
import { normalizeIndianPhone } from '@/lib/validations/profile'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    } else if (status === 'unverified') {
      where.emailVerified = null
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
            where: { status: 'ACTIVE' },
            orderBy: { startDate: 'desc' },
            take: 1,
            select: {
              id: true,
              startDate: true,
              endDate: true,
              pricingPack: { select: { id: true, name: true, price: true } },
            },
          },
          _count: {
            select: { memberships: true, checkins: true }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)

    // Validate input server-side
    const bodySchema = z.object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters'),
      email: z.string().trim().email('Invalid email address'),
      role: z.enum(['MEMBER', 'TRAINER', 'ADMIN']).default('MEMBER'),
      membershipId: z.string().optional().nullable(),
      assignedTrainerId: z.string().optional().nullable(),
      // Optional profile details (same fields as the user profile page)
      // Indian phone numbers only — stored as bare 10 digits like the profile page.
      phone: z
        .string()
        .trim()
        .optional()
        .nullable()
        .transform((val) => (val ? normalizeIndianPhone(val) || null : null))
        .refine((val) => val == null || /^\d{10}$/.test(val), 'Enter a valid 10-digit phone number'),
      weightKg: z.coerce.number().positive().max(500).optional().nullable(),
      heightCm: z.coerce.number().positive().max(300).optional().nullable(),
      emergencyContactName: z.string().trim().max(100).optional().nullable(),
      emergencyContactPhone: z
        .string()
        .trim()
        .optional()
        .nullable()
        .transform((val) => (val ? normalizeIndianPhone(val) || null : null))
        .refine((val) => val == null || /^\d{10}$/.test(val), 'Enter a valid 10-digit emergency contact phone number'),
      address: z.string().trim().max(500).optional().nullable(),
    })

    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, email, role, membershipId, assignedTrainerId, phone, weightKg, heightCm, emergencyContactName, emergencyContactPhone, address } = parsed.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    // If a trainer is being assigned, make sure they really are an active TRAINER
    if (assignedTrainerId) {
      const trainer = await prisma.user.findUnique({ where: { id: assignedTrainerId } })
      if (!trainer || trainer.role !== 'TRAINER' || !trainer.isActive) {
        return NextResponse.json({ error: 'Selected trainer is not valid' }, { status: 400 })
      }
    }

    // Generate credentials
    // 6-digit starter password – emailed to the user, changed after first login
    const tempPassword = generateOTP()
    const memberId = generateMemberId()

    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'MEMBER',
        memberId,
        isActive: false,
        emailVerified: null,
        assignedTrainerId: assignedTrainerId || null,
        phone: phone || null,
        weightKg:
          weightKg === null || weightKg === undefined || (weightKg as unknown) === '' ? null : Number(weightKg),
        heightCm:
          heightCm === null || heightCm === undefined || (heightCm as unknown) === '' ? null : Number(heightCm),
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        address: address || null,
      }
    })

    // If a membership pack was selected, enroll the user right away
    // (admin enrollment implies payment handled offline)
    let membershipInfo: {
      planName: string
      price: number
      durationDays: number
      startDate: Date
      endDate: Date
    } | null = null

    if (membershipId) {
      const pricingPack = await prisma.pricingPack.findUnique({
        where: { id: membershipId }
      })
      
      if (pricingPack) {
        const startDate = new Date()
        const endDate = new Date(Date.now() + pricingPack.duration * 24 * 60 * 60 * 1000)

        await prisma.membership.create({
          data: {
            userId: user.id,
            pricingPackId: pricingPack.id,
            startDate,
            endDate,
            status: 'ACTIVE',
          }
        })

        membershipInfo = {
          planName: pricingPack.name,
          price: Number(pricingPack.price),
          durationDays: pricingPack.duration,
          startDate,
          endDate,
        }
      }
    }

    // Send welcome email: login credentials + verification OTP (+ membership details)
    const emailContent = getWelcomeEmail(memberId, name, email, tempPassword, membershipInfo)
    const emailDelivery = await emailService.sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: user.id,
        newData: { name, email, role, memberId },
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: user.memberId,
      },
      credentials: {
        // Shown to the admin once so they can be shared securely as a fallback.
        memberId,
        tempPassword,
      },
      emailSent: emailDelivery,
    }, { status: 201 })
  } catch (error) {
    console.error('Admin users POST error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}