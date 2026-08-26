import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/validations/contact'
import { emailService, getContactNotificationEmail, getContactConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    const message = await prisma.contactMessage.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message,
      },
    })

    // Send a notification email to the admin
    const adminEmail = process.env.EMAIL_FROM || 'admin@fxgym.com'
    // Extract bare email address if EMAIL_FROM is in "Name <email>" format
    const adminMatch = adminEmail.match(/<([^>]+)>/)
    const adminAddress = adminMatch ? adminMatch[1] : adminEmail
    const emailContent = getContactNotificationEmail({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone ?? 'Not provided',
      subject: validatedData.subject,
      message: validatedData.message,
    })
    const confirmationContent = getContactConfirmationEmail({
      name: validatedData.name,
      email: validatedData.email,
      message: validatedData.message,
    })

    // Concurrent AND awaited: serverless platforms freeze the process right
    // after the response is returned, killing unawaited SMTP sockets. Previous
    // fire-and-forget version meant these two emails NEVER completed on Vercel.
    const [notifyResult, confirmResult] = await Promise.allSettled([
      emailService.sendEmail({
        to: adminAddress,
        subject: emailContent.subject,
        html: emailContent.html,
        replyTo: validatedData.email,
      }),
      emailService.sendEmail({
        to: validatedData.email,
        subject: confirmationContent.subject,
        html: confirmationContent.html,
      }),
    ])

    if (notifyResult.status === 'rejected') {
      console.error('Contact notification email threw:', notifyResult.reason)
    } else if (!notifyResult.value) {
      console.error('Failed to send contact notification email')
    }
    if (confirmResult.status === 'rejected') {
      console.error('Contact confirmation email threw:', confirmResult.reason)
    } else if (!confirmResult.value) {
      console.error('Failed to send contact confirmation email')
    }
    return NextResponse.json({ success: true, id: message.id }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Contact GET API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}