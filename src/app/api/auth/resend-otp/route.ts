import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService, generateOTP } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    
    // Don't reveal if user exists
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const otpCode = generateOTP()
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpires,
      }
    })

    // Create OTP token record
    await prisma.oTPToken.create({
      data: {
        email,
        code: otpCode,
        type: type || 'EMAIL_VERIFICATION',
        expiresAt: otpExpires,
      }
    })

        // Send verification OTP
    await emailService.sendOTP(email, otpCode, 'Your FX Gym Verification Code')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}