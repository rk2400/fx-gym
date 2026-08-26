import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendEmail } from '@/lib/email'

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

    // Send OTP email
    const subject = 'Your FX Gym Verification Code'
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%); border-radius: 16px; padding: 40px; color: #f0f0f5; text-align: center;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 32px;">💪</span>
          </div>
          <h1 style="color: #f0f0f5; margin: 0 0 16px;">Verification Code</h1>
          <p style="color: #888899; margin: 0 0 24px;">Enter this code to verify your email:</p>
          <div style="display: inline-flex; gap: 8px; justify-content: center; margin-bottom: 24px;">
            ${otpCode.split('').map(digit => `<span style="width: 48px; height: 56px; background: #0a0a0f; border: 2px solid #00d4ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #00d4ff; font-family: monospace;">${digit}</span>`).join('')}
          </div>
          <p style="color: #ffaa00; font-size: 13px; margin: 0;">Code expires in 15 minutes</p>
        </div>
      </body>
      </html>
    `

    await sendEmail({ to: email, subject, html })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}