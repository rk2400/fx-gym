import nodemailer, { type Transporter } from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  /** Set in test mode – opens the exact message in a browser (ethereal.email) */
  previewUrl?: string
  error?: string
}

let cachedTransport: Transporter | null = null
let testAccountCreds: { user: string; pass: string } | null = null

/**
 * Sends an email.
 *
 * Transport selection (most preferred first):
 *   1. EMAIL_RESEND_KEY  → Resend REST API (HTTPS 443, works on Vercel serverless)
 *   2. EMAIL_BREVO_KEY   → Brevo (Sendinblue) REST API (HTTPS 443, works on Vercel serverless)
 *   3. SMTP (EMAIL_SERVER_HOST/USER/PASSWORD) → Gmail app-password, SES, Mailgun, etc.
 *      NOTE: plain SMTP (esp. smtp.gmail.com:587) is blocked on Vercel serverless –
 *      "Greeting never received / ETIMEDOUT CONN". Configure Resend or Brevo for prod.
 *   4. Ethereal test account – dev only, never throws.
 *
 * Never throws – callers receive { success, ... } and can react accordingly.
 */
async function sendViaHttp(options: EmailOptions): Promise<EmailResult | null> {
  const from = process.env.EMAIL_FROM || 'FX Gym <no-reply@fxgym.com>'

  // 1) Resend
  const resendKey = process.env.EMAIL_RESEND_KEY
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      })
      if (!res.ok) {
        return {
          success: false,
          error: `Resend API error ${res.status}: ${(await res.text()).slice(0, 300)}`,
        }
      }
      const data = (await res.json()) as { id?: string }
      return { success: true, messageId: data.id }
    } catch (error) {
      return {
        success: false,
        error:
          'Resend request failed: ' +
          (error instanceof Error ? error.message : 'unknown error'),
      }
    }
  }

  // 2) Brevo
  const brevoKey = process.env.EMAIL_BREVO_KEY
  if (brevoKey) {
    try {
      const [fromEmail, fromName] = /^([^<]+)\s*<\s*([^>]+)\s*>$/.test(from)
        ? [(/^([^<]+)\s*<\s*([^>]+)\s*>$/.exec(from) as RegExpExecArray)[2], (/^([^<]+)\s*<\s*([^>]+)\s*>$/.exec(from) as RegExpExecArray)[1]]
        : [from, 'FX Gym']
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: fromEmail.trim(), name: fromName.trim() },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
        }),
      })
      if (!res.ok) {
        return {
          success: false,
          error: `Brevo API error ${res.status}: ${(await res.text()).slice(0, 300)}`,
        }
      }
      const data = (await res.json()) as { messageId?: string }
      return { success: true, messageId: data.messageId }
    } catch (error) {
      return {
        success: false,
        error:
          'Brevo request failed: ' +
          (error instanceof Error ? error.message : 'unknown error'),
      }
    }
  }

  return null // no HTTP provider configured
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const host = process.env.EMAIL_SERVER_HOST
  const port = Number(process.env.EMAIL_SERVER_PORT || 587)
  const user = process.env.EMAIL_SERVER_USER
  const pass = process.env.EMAIL_SERVER_PASSWORD
  const from = process.env.EMAIL_FROM || 'FX Gym <no-reply@fxgym.com>'
  // Only Vercel actually blocks outbound SMTP (serverless). Render and other
  // always-on hosts run NODE_ENV=production too but ARE NOT serverless, so
  // SMTP must keep working for them.
  const isVercel = process.env.VERCEL === '1'

  try {
    // Try HTTP API providers first – they work on Vercel serverless.
    const httpResult = await sendViaHttp(options)
    if (httpResult) {
      console.log(
        `📧 HTTP email ${httpResult.success ? 'sent' : 'FAILED'} to ${options.to}` +
          (httpResult.success && httpResult.messageId ? ` (${httpResult.messageId})` : '') +
          (httpResult.success && httpResult.previewUrl ? ` – preview: ${httpResult.previewUrl}` : '') +
          (httpResult.error ? ` → ${httpResult.error}` : '')
      )
      return httpResult
    }

    // Only Vercel has no SMTP fallback (port-587 is blocked in serverless).
    // On Render/other always-on hosts, fall through to SMTP below which works.
    if (isVercel) {
      const err =
        'No HTTP email provider configured for Vercel. Set EMAIL_RESEND_KEY or EMAIL_BREVO_KEY in Vercel.'
      console.error('📧 Email send FAILED:', err)
      return { success: false, error: err }
    }

    if (!host || !user || !pass) {
      // No SMTP config either – zero-config dev/test mode (Ethereal)
      if (!testAccountCreds) {
        const account = await nodemailer.createTestAccount()
        testAccountCreds = { user: account.user, pass: account.pass }
        console.log('📧 [SMTP TEST MODE] Ethereal account created:', account.user)
      }
      if (!cachedTransport) {
        cachedTransport = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccountCreds.user, pass: testAccountCreds.pass },
        })
      }
    } else if (!cachedTransport) {
      // Real SMTP configuration
      cachedTransport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
    }
    const transporter = cachedTransport as Transporter

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log(`📧 Email sent to ${options.to} (${info.messageId})`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('📧 Email send FAILED:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error',
    }
  }
}

export function generateMemberId(): string {
  const prefix = 'FXG'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export interface WelcomeMembershipInfo {
  planName: string
  price: number
  durationDays: number
  startDate: Date
  endDate: Date
}

export function getWelcomeEmail(
  memberId: string,
  name: string,
  email: string,
  password: string,
  membership?: WelcomeMembershipInfo | null
): { subject: string; html: string; text: string } {
  const subject = `Welcome to FX Gym! Your Member ID: ${memberId}`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px 16px;">
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px 28px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-flex; align-items-center; gap: 12px; padding: 12px 24px; background: rgba(0, 255, 136, 0.1); border-radius: 50px; margin-bottom: 20px;">
            <span style="font-size: 24px;">💪</span>
            <span style="font-weight: 700; color: #00ff88; font-size: 18px;">FX GYM</span>
          </div>
          <h1 style="color: #111827; margin: 0 0 8px; font-size: 26px;">Welcome to FX Gym, ${name}!</h1>
          <p style="color: #6b7280; margin: 0; font-size: 15px;">Your fitness journey starts now</p>
        </div>

        <!-- Member ID Card -->
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="color: #065f46; margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Your Member ID</p>
          <p style="font-family: 'Courier New', monospace; font-size: 26px; font-weight: 700; color: #059669; margin: 0; letter-spacing: 2px;">${memberId}</p>
        </div>

        <!-- Login Credentials -->
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #111827; margin: 0 0 14px; font-size: 17px;">Login Credentials</h3>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #ffffff; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Email</span>
              <span style="color: #111827; font-weight: 600; font-size: 14px;">${email}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #ffffff;">
              <span style="color: #6b7280; font-size: 14px;">Password</span>
              <span style="color: #059669; font-weight: 700; font-size: 16px; font-family: 'Courier New', monospace; letter-spacing: 1px;">${password}</span>
            </div>
          </div>
          <p style="color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin: 14px 0 0;">
            For security, please change this password after your first login.
          </p>
        </div>

        <!-- Membership Details -->
        ${membership ? `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #111827; margin: 0 0 14px; font-size: 17px;">Membership Details</h3>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #ffffff; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Plan</span>
              <span style="color: #059669; font-weight: 700; font-size: 14px;">${membership.planName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #ffffff; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Price</span>
              <span style="color: #111827; font-weight: 600; font-size: 14px;">$${membership.price.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #ffffff; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Duration</span>
              <span style="color: #111827; font-weight: 600; font-size: 14px;">${membership.durationDays} days</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #ffffff;">
              <span style="color: #6b7280; font-size: 14px;">Valid Until</span>
              <span style="color: #111827; font-weight: 600; font-size: 14px;">${membership.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Next Steps -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #111827; margin: 0 0 14px; font-size: 17px;">Next Steps</h3>
          <ol style="color: #374151; padding-left: 20px; margin: 0;">
            <li style="margin-bottom: 8px;">Go to <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="color: #059669; font-weight: 600;">FX Gym Login</a></li>
            <li style="margin-bottom: 8px;">Sign in with your email and the password above</li>
            <li>Your account is activated automatically on first login</li>
          </ol>
        </div>

        <!-- Features -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
          <h3 style="color: #111827; margin: 0 0 14px; font-size: 17px;">What You Get Access To</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            ${[
              '💪 24/7 Gym Access',
              '🏃 50+ Weekly Classes',
              '📊 Progress Tracking',
              '🎯 Personalized Programs',
              '🧘 Recovery Zone',
              '👥 Community Events',
            ].map(feature => `<div style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; color: #374151;">${feature}</div>`).join('')}
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 6px;">Need help? Reply to this email or contact us at support@fxgym.com</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">FX Gym · Transform Your Body, Elevate Your Mind · fxgym.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Welcome to FX Gym, ${name}!

Your Member ID: ${memberId}

Login Credentials:
Email: ${email}
Password: ${password}

${membership ? `Membership Details:
Plan: ${membership.planName}
Price: $${membership.price.toFixed(2)}
Duration: ${membership.durationDays} days
Valid Until: ${membership.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

` : ''}Next Steps:
1. Go to ${process.env.NEXT_PUBLIC_APP_URL}/login
2. Sign in with your email and the password above
3. Your account activates automatically on first login

What You Get Access To:
- 24/7 Gym Access
- 50+ Weekly Classes
- Progress Tracking
- Personalized Programs
- Recovery Zone
- Community Events

Need help? Contact us at support@fxgym.com

FX Gym - Transform Your Body, Elevate Your Mind
  `

  return { subject, html, text }
}

export function getRoleChangeEmail(memberId: string, name: string, oldRole: string, newRole: string): { subject: string; html: string; text: string } {
  const roleLabels: Record<string, string> = {
    MEMBER: 'Member',
    TRAINER: 'Trainer',
    ADMIN: 'Administrator',
  }

  const subject = `Your FX Gym Role Has Been Updated`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%); border-radius: 16px; padding: 40px; color: #f0f0f5;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 24px;">💪</span>
          <span style="font-weight: 700; color: #00ff88; font-size: 18px;">FX GYM</span>
        </div>
        <h2 style="color: #f0f0f5; text-align: center;">Role Updated</h2>
        <p style="color: #888899; text-align: center;">Hi ${name}, your role has been changed.</p>
        <div style="background: rgba(0, 255, 136, 0.05); border: 2px solid #00ff88; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="color: #888899; margin: 0 0 8px; font-size: 14px;">Member ID: ${memberId}</p>
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;">
            <span style="padding: 8px 16px; background: #1e1e2e; border-radius: 8px; color: #f0f0f5;">${roleLabels[oldRole] || oldRole}</span>
            <span style="color: #00ff88;">→</span>
            <span style="padding: 8px 16px; background: #00ff88; border-radius: 8px; color: #0a0a0f; font-weight: 600;">${roleLabels[newRole] || newRole}</span>
          </div>
        </div>
        <p style="color: #888899; text-align: center; font-size: 14px;">Your dashboard and permissions have been updated accordingly.</p>
      </div>
    </body>
    </html>
  `

    return { subject, html, text: `Your role has been changed from ${oldRole} to ${newRole}.` }
}

export function getContactNotificationEmail(
  contactData: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
  }
): { subject: string; html: string; text: string } {
  const { name, email, phone, subject: contactSubject, message } = contactData

  const subject = `[FX Gym] New Contact Form Submission: ${contactSubject}`

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 700px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%); border-radius: 16px; padding: 40px; color: #f0f0f5;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 24px;">💪</span>
          <span style="font-weight: 700; color: #00ff88; font-size: 20px;">FX GYM</span>
        </div>
        <h1 style="color: #f0f0f5; margin-bottom: 24px;">📩 New Contact Form Submission</h1>

        <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #1e1e2e; color: #888899;">Sender Name</td>
              <td style="padding: 8px 0 8px 16px; border-bottom: 1px solid #1e1e2e; color: #f0f0f5;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #1e1e2e; color: #888899;">Sender Email</td>
              <td style="padding: 8px 0 8px 16px; border-bottom: 1px solid #1e1e2e; color: #f0f0f5;">${email}</td>
            </tr>
            ${phone ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #1e1e2e; color: #888899;">Phone Number</td>
              <td style="padding: 8px 0 8px 16px; border-bottom: 1px solid #1e1e2e; color: #f0f0f5;">${phone}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #1e1e2e; color: #888899;">Subject</td>
              <td style="padding: 8px 0 8px 16px; border-bottom: 1px solid #1e1e2e; color: #f0f0f5;">${contactSubject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #1e1e2e; color: #888899; vertical-align: top;">Message</td>
              <td style="padding: 8px 0 8px 16px; color: #f0f0f5; white-space: pre-wrap;">${message.replace(/\n/g, '<br/>')}</td>
            </tr>
          </table>
        </div>

        <p style="color: #888899; font-size: 13px; text-align: center; margin-top: 24px;">
          This message was submitted via the FX Gym website contact form.
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
New Contact Form Submission - FX Gym

Sender: ${name}
Email: ${email}
${phone ? `Phone: ${phone}
` : ''}Subject: ${contactSubject}

Message:
${message}

---
This message was submitted via the FX Gym website contact form.
`
  return { subject, html, text }
}