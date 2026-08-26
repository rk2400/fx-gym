import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, newPassword } = body

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Email, code, and new password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!user.otpCode || user.otpCode !== code) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return NextResponse.json({ error: 'Code has expired' }, { status: 400 })
    }

    // Verify OTP token exists and is valid
    const otpToken = await prisma.oTPToken.findFirst({
      where: {
        email,
        code,
        type: 'PASSWORD_RESET',
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    })

    if (!otpToken) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user and mark OTP as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          otpCode: null,
          otpExpires: null,
        }
      }),
      prisma.oTPToken.update({
        where: { id: otpToken.id },
        data: { usedAt: new Date() }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
}