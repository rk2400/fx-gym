import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailTemplateResult {
  subject: string;
  html: string;
  text?: string;
}

interface Transporter extends nodemailer.Transporter {}

const REQUIRED_SMTP_VARS = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'] as const;

function missingSmtpVars(): string[] {
  return REQUIRED_SMTP_VARS.filter((v) => !process.env[v]);
}

/**
 * Lazily created + cached. Resolved at SEND TIME against the live process.env
 * so it can never go stale from module-init timing (e.g. evaluated during
 * `next build` before the deploy environment injects variables).
 */
let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const missing = missingSmtpVars();
  if (missing.length > 0) {
    console.warn(
      `📧 [MOCK EMAIL MODE] SMTP not configured — missing env var(s): ${missing.join(', ')}. ` +
        `Set them (e.g. EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=587, EMAIL_USER=..., EMAIL_PASS=...) to enable real sending in ANY environment.`
    );
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure:
        process.env.EMAIL_SECURE === 'true' ||
        Number(process.env.EMAIL_PORT || 587) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return cachedTransporter;
}

// Startup visibility: show WHICH vars this process actually received (values never logged).
(function reportSmtpStatus() {
  const status = REQUIRED_SMTP_VARS.map((v) => `${v}:${process.env[v] ? '✓' : '✗'}`).join(' ');
  console.log(`📧 SMTP status → ${status} | port=${process.env.EMAIL_PORT ?? '587(default)'}`);
})();

export const emailService = {
  async sendEmail({
    to,
    subject,
    html,
    replyTo,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
    text?: string;
  }): Promise<boolean> {
    const transporter = getTransporter();
    if (!transporter) {
      // Same behaviour as the reference: unconfigured SMTP logs instead of sending.
      console.log('📧 [MOCK EMAIL]');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Body:', html);
      return true;
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
        replyTo,
      });
      return true;
    } catch (error) {
      console.error('📧 Email send error:', error);
      return false;
    }
  },

  async sendOTP(
    email: string,
    code: string,
    subject = 'Your FX Gym Login OTP'
  ): Promise<boolean> {
    const digits = code.split('');
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%); border-radius: 16px; padding: 40px; color: #f0f0f5; text-align: center;">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 32px;">🔐</span>
            </div>
            <h1 style="color: #f0f0f5; margin: 0 0 16px;">${subject}</h1>
            <p style="color: #888899; margin: 0 0 24px;">Enter this code to continue:</p>
            <div style="display: inline-flex; gap: 8px; justify-content: center; margin-bottom: 24px;">
              ${digits
                .map(
                  (d) =>
                    `<span style="width: 48px; height: 56px; background: #0a0a0f; border: 2px solid #00ff88; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #00ff88; font-family: monospace;">${d}</span>`
                )
                .join('')}
            </div>
            <p style="color: #ffaa00; font-size: 13px; margin: 0;">Code expires in 15 minutes</p>
            <p style="color: #555566; font-size: 12px; margin: 24px 0 0;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `;
    return this.sendEmail({ to: email, subject, html });
  },
};

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateMemberId(): string {
  const prefix = 'FXG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export interface WelcomeMembershipInfo {
  planName: string;
  price: number;
  durationDays: number;
  startDate: Date;
  endDate: Date;
}

export interface ContactNotificationData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactConfirmationData {
  name: string;
  email: string;
  message: string;
}

function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getContactNotificationEmail(data: ContactNotificationData): EmailTemplateResult {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">FX Gym - Contact Form</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">New Contact Form Submission</h2>
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0; line-height: 1.4;"><strong style="display: inline-block; min-width: 80px;">Name:</strong> ${escapeHtml(data.name)}</p>
          <p style="margin: 10px 0; line-height: 1.4;"><strong style="display: inline-block; min-width: 80px;">Email:</strong> <a href="mailto:${data.email}" style="color: #f97316;">${escapeHtml(data.email)}</a></p>
          <p style="margin: 10px 0; line-height: 1.4;"><strong style="display: inline-block; min-width: 80px;">Phone:</strong> ${escapeHtml(data.phone)}</p>
          <p style="margin: 10px 0; line-height: 1.4;"><strong style="display: inline-block; min-width: 80px;">Subject:</strong> ${escapeHtml(data.subject)}</p>
        </div>
        <div style="margin: 20px 0; padding: 15px; background: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px;">
          <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
          <p style="margin: 0; white-space: pre-wrap; color: #333; line-height: 1.4;">${escapeHtml(data.message)}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; margin: 0;">You can reply directly to this email to respond to ${escapeHtml(data.name)}.</p>
        </div>
      </div>
    </div>
  `;

  return {
    subject: `New Contact Form Submission from ${data.name}`,
    html,
  };
}

export function getContactConfirmationEmail(data: ContactConfirmationData): EmailTemplateResult {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">FX Gym</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Thank you for contacting us!</h2>
        <p style="line-height: 1.4;">Hi ${escapeHtml(data.name)},</p>
        <p style="line-height: 1.4;">We've received your message and will get back to you as soon as possible.</p>
        <div style="margin: 20px 0; padding: 15px; background: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px;">
          <p style="margin: 0; white-space: pre-wrap; color: #333; line-height: 1.4;">${escapeHtml(data.message)}</p>
        </div>
        <p style="line-height: 1.4;">Our team typically responds within 24-48 hours during business days.</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px; line-height: 1.4;">If you have any urgent questions, please call us.</p>
      </div>
    </div>
  `;

  return {
    subject: `We've Received Your Message - FX Gym`,
    html,
  };
}

export interface WelcomeMembershipInfo {
  planName: string;
  price: number;
  durationDays: number;
  startDate: Date;
  endDate: Date;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function getWelcomeEmail(
  memberId: string,
  name: string,
  email: string,
  tempPassword: string,
  membershipInfo: WelcomeMembershipInfo | null
): EmailTemplateResult {
  const digits = tempPassword.split('');
  const passwordBoxes = digits
    .map(
      (d) =>
        `<span style="width: 40px; height: 50px; background: #0a0a0f; border: 2px solid #00ff88; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #00ff88; font-family: monospace; margin: 0 3px;">${d}</span>`
    )
    .join('');

  const membershipHtml = membershipInfo
    ? `
      <div style="background: #f0fdf4; border-left: 4px solid #00ff88; border-radius: 4px; padding: 15px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px; color: #111;">Your Membership</h3>
        <table style="width: 100%; font-size: 14px; color: #333;">
          <tr><td style="padding: 4px 0;">Plan</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">${escapeHtml(membershipInfo.planName)}</td></tr>
          <tr><td style="padding: 4px 0;">Price</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${membershipInfo.price.toFixed(2)}</td></tr>
          <tr><td style="padding: 4px 0;">Duration</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">${membershipInfo.durationDays} days</td></tr>
          <tr><td style="padding: 4px 0;">Valid</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">${formatDate(membershipInfo.startDate)} – ${formatDate(membershipInfo.endDate)}</td></tr>
        </table>
      </div>
    `
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%); border-radius: 16px; padding: 40px; color: #f0f0f5; text-align: center;">
          <div style="margin-bottom: 24px;"><span style="font-size: 32px;">💪</span></div>
          <h1 style="color: #f0f0f5; margin: 0 0 16px;">Welcome to FX Gym, ${escapeHtml(name)}!</h1>
          <p style="color: #888899; margin: 0 0 24px;">Your account has been created. Here are your login credentials:</p>
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #888899; font-size: 13px; margin: 0 0 6px;">Member ID</p>
            <p style="color: #ffaa00; font-size: 20px; font-weight: 700; margin: 0 0 18px; letter-spacing: 1px;">${escapeHtml(memberId)}</p>
            <p style="color: #888899; font-size: 13px; margin: 0 0 6px;">Login Email</p>
            <p style="color: #f0f0f5; font-size: 16px; margin: 0 0 18px;">${escapeHtml(email)}</p>
            <p style="color: #888899; font-size: 13px; margin: 0 0 10px;">Starter Password (also works as your verification OTP)</p>
            <div>${passwordBoxes}</div>
          </div>
          ${membershipHtml}
          <p style="color: #555566; font-size: 12px; margin: 24px 0 0;">Log in with this password and change it after your first sign-in.</p>
        </div>
      </body>
    </html>
  `;

  const text = [
    `Welcome to FX Gym, ${name}!`,
    ``,
    `Member ID: ${memberId}`,
    `Login Email: ${email}`,
    `Starter Password: ${tempPassword} (also works as verification OTP)`,
    ...(membershipInfo
      ? [
          ``,
          `Membership: ${membershipInfo.planName}`,
          `Price: ₹${membershipInfo.price.toFixed(2)} (${membershipInfo.durationDays} days)`,
          `Valid: ${formatDate(membershipInfo.startDate)} - ${formatDate(membershipInfo.endDate)}`,
        ]
      : []),
    ``,
    `Change this password after your first sign-in.`,
  ].join('\n');

  return { subject: 'Welcome to FX Gym - Your Login Credentials', html, text };
}

export function getRoleChangeEmail(
  memberId: string,
  name: string,
  oldRole: string,
  newRole: string
): EmailTemplateResult {
  const displayName = (r: string) => r.charAt(0) + r.slice(1).toLowerCase();
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%); border-radius: 16px; padding: 40px; color: #f0f0f5; text-align: center;">
          <div style="margin-bottom: 24px;"><span style="font-size: 32px;">🛡️</span></div>
          <h1 style="color: #f0f0f5; margin: 0 0 16px;">Account Role Updated</h1>
          <p style="color: #888899; margin: 0 0 24px;">Hi ${escapeHtml(name)}, your role at FX Gym has changed:</p>
          <p style="font-size: 20px; margin: 0;">
            <strong style="color: #888899;">${displayName(escapeHtml(oldRole))}</strong>
            <span style="color: #00ff88; font-weight: 700;"> &nbsp;→&nbsp; </span>
            <strong style="color: #00ff88;">${displayName(escapeHtml(newRole))}</strong>
          </p>
          <p style="color: #555566; font-size: 12px; margin: 24px 0 0;">Member ID: ${escapeHtml(memberId)}</p>
        </div>
      </body>
    </html>
  `;
  const text = `Hi ${name}, your FX Gym account role changed from ${oldRole} to ${newRole}. Member ID: ${memberId}`;
  return { subject: 'Your FX Gym Role Has Been Updated', html, text };
}
