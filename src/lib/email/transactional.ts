import sgMail from '@sendgrid/mail';

/**
 * Transactional email through the existing SendGrid account. Returns
 * 'skipped' (not an error) when SendGrid is not configured in this
 * environment, so callers can record what happened without failing.
 */
export type SendResult = 'sent' | 'failed' | 'skipped';

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'hello@vacationpro.co';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'VacationPro';

let configured = false;
function ready(): boolean {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return false;
  if (!configured) {
    sgMail.setApiKey(key);
    configured = true;
  }
  return true;
}

export async function sendTransactional(msg: { to: string; subject: string; html: string; text: string; replyTo?: string }): Promise<SendResult> {
  if (!ready()) return 'skipped';
  try {
    await sgMail.send({
      to: msg.to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      replyTo: msg.replyTo,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      // Transactional: do not rewrite links for click tracking.
      trackingSettings: { clickTracking: { enable: false, enableText: false } },
    });
    return 'sent';
  } catch (err) {
    console.error('sendTransactional failed:', err instanceof Error ? err.message : err);
    return 'failed';
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function simpleEmailHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;">
<tr><td style="padding:28px 28px 8px;"><p style="margin:0;font-size:20px;font-weight:800;">Vacation<span style="color:#007b41;">Pro</span></p></td></tr>
<tr><td style="padding:8px 28px 28px;font-size:16px;line-height:1.55;">
<h1 style="font-size:22px;line-height:1.3;margin:12px 0 16px;">${escapeHtml(title)}</h1>
${bodyHtml}
</td></tr></table>
<p style="font-size:12px;color:#6b7280;margin:16px 0 0;">VacationPro · vacationpro.co</p>
</td></tr></table></body></html>`;
}
