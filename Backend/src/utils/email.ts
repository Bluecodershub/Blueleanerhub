/**
 * Email utility — sends transactional emails via SendGrid REST API.
 * Zero extra dependencies: uses Node 18+ native fetch.
 *
 * Set SENDGRID_API_KEY (or RESEND_API_KEY as fallback) in the environment.
 * If neither key is set the email is only logged (safe for local dev).
 */

import logger from './logger';
import { config } from '../config';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ─── SendGrid ──────────────────────────────────────────────────────────────

async function sendViaSendGrid(payload: EmailPayload): Promise<void> {
  const apiKey = config.email.sendgridApiKey;
  if (!apiKey) throw new Error('SENDGRID_API_KEY not set');

  const body = {
    personalizations: [{ to: [{ email: payload.to }] }],
    from: { email: config.email.from },
    subject: payload.subject,
    content: [
      { type: 'text/html', value: payload.html },
      ...(payload.text ? [{ type: 'text/plain', value: payload.text }] : []),
    ],
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`SendGrid error ${res.status}: ${detail}`);
  }
}

// ─── Resend (fallback) ─────────────────────────────────────────────────────

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.email.from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend error ${res.status}: ${detail}`);
  }
}

// ─── Public send function ──────────────────────────────────────────────────

export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    if (config.email.sendgridApiKey) {
      await sendViaSendGrid(payload);
      logger.info(`Email sent via SendGrid to ${payload.to}: ${payload.subject}`);
    } else if (process.env.RESEND_API_KEY) {
      await sendViaResend(payload);
      logger.info(`Email sent via Resend to ${payload.to}: ${payload.subject}`);
    } else {
      // Dev fallback — log the email content so it can be copy-pasted
      logger.warn(`[EMAIL NOT SENT — no provider configured] To: ${payload.to} | Subject: ${payload.subject}`);
      if (config.nodeEnv !== 'production') {
        logger.info(`Email body preview:\n${payload.text ?? payload.html.replace(/<[^>]+>/g, '')}`);
      }
    }
  } catch (err) {
    // Never crash the request if email fails — just log and continue
    logger.error(`Failed to send email to ${payload.to}: ${(err as Error).message}`);
  }
}

// ─── Password reset email template ────────────────────────────────────────

export function buildPasswordResetEmail(email: string, resetUrl: string): EmailPayload {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:32px 40px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px;">BlueLearnerHub</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Reset Your Password</p>
      </div>
      <!-- Body -->
      <div style="padding:40px;">
        <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Hi there,<br><br>
          We received a request to reset the password for your account (<strong style="color:#e5e7eb;">${email}</strong>).
          Click the button below to set a new password. This link expires in <strong style="color:#e5e7eb;">1 hour</strong>.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
            Reset Password
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">
          If you didn't request this, you can safely ignore this email — your password won't change.
          <br><br>
          Or copy this link into your browser:<br>
          <a href="${resetUrl}" style="color:#3b82f6;word-break:break-all;">${resetUrl}</a>
        </p>
      </div>
      <!-- Footer -->
      <div style="border-top:1px solid #1f2937;padding:20px 40px;text-align:center;">
        <p style="color:#4b5563;font-size:12px;margin:0;">
          © ${new Date().getFullYear()} BlueLearnerHub · You're receiving this because you requested a password reset.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `Reset your BlueLearnerHub password\n\nVisit this link to reset your password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;

  return { to: email, subject: 'Reset your BlueLearnerHub password', html, text };
}
