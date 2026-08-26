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

        // Fire and forget — log the result but don't block the response
    emailService
      .sendEmail({
                to: adminAddress,
        subject: emailContent.subject,
        html: emailContent.html,
        replyTo: validatedData.email,
      })
      .then((sent) => {
        if (!sent) console.error('Failed to send contact notification email')
      })

    // Confirmation receipt to the visitor (mirrors the two-email pattern)
            const confirmationContent = getContactConfirmationEmail({
      name: validatedData.name,
      email: validatedData.email,
      message: validatedData.message,
    })
                // Send confirmation to the submitter
    emailService
      .sendEmail({
        to: validatedData.email,
        subject: confirmationContent.subject,
        html: confirmationContent.html,
      })
      .then((sent) => {
        if (!sent) console.error('Failed to send contact confirmation email')
      })

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