import { NextRequest, NextResponse } from 'next/server';
import sgClient from '@sendgrid/client';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'hello@vacationpro.co';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'VacationPro';

sgClient.setApiKey(SENDGRID_API_KEY);
sgMail.setApiKey(SENDGRID_API_KEY);

interface SubscribeRequest {
  email: string;
  firstName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referringSite?: string;
}

// Add or update contact in SendGrid
async function upsertContact(email: string, firstName?: string, utmCampaign?: string) {
  const contactData: Record<string, unknown> = {
    email: email.toLowerCase().trim(),
    custom_fields: {
      // e1_T = UTM campaign for segmentation
      e1_T: utmCampaign || 'deal_alerts',
      // e2_T = signup date for welcome sequence scheduling
      e2_T: new Date().toISOString().split('T')[0],
      // e3_T = welcome sequence step (1 = welcome sent)
      w3_T: '1',
    },
  };

  if (firstName) {
    contactData.first_name = firstName;
  }

  const request = {
    url: '/v3/marketing/contacts' as const,
    method: 'PUT' as const,
    body: {
      contacts: [contactData],
    },
  };

  await sgClient.request(request);
}

// Send welcome email (Email 1 of the sequence)
async function sendWelcomeEmail(email: string, firstName?: string) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';

  const msg = {
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: "You're in! Here's what to expect from VacationPro 🌴",
    html: getWelcomeEmailHtml(greeting),
  };

  await sgMail.send(msg);
}

function getWelcomeEmailHtml(greeting: string): string {
  const SITE = 'https://www.vacationpro.co';
  const yr = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VacationPro</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#009b51 0%,#007b41 100%);padding:24px 32px;text-align:center;">
              <a href="${SITE}" style="text-decoration:none;">
                <img src="${SITE}/logo.svg" alt="VacationPro" width="44" height="44" style="display:inline-block;vertical-align:middle;margin-right:10px;border-radius:50%;background-color:#ffffff;" />
                <span style="color:#ffffff;font-size:24px;font-weight:700;vertical-align:middle;">Vacation<span style="color:#a6f4c8;">Pro</span></span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#111827;font-size:22px;margin:0 0 16px;font-weight:700;">${greeting}, welcome aboard! 🎉</h2>

              <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 16px;">
                You just joined thousands of travelers who never overpay for vacation. Here's what you can expect from us:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
                    <strong style="color:#009b51;">🔔 Deal Alerts</strong>
                    <p style="color:#6b7280;font-size:14px;margin:4px 0 0;">We'll send you the best vacation packages as soon as they drop — before they sell out.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
                    <strong style="color:#009b51;">💰 Real Savings</strong>
                    <p style="color:#6b7280;font-size:14px;margin:4px 0 0;">Every deal is vetted by our team. We show you the real price, the original price, and exactly what's included.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <strong style="color:#009b51;">📍 Curated Destinations</strong>
                    <p style="color:#6b7280;font-size:14px;margin:4px 0 0;">From Cancun to Cabo, Punta Cana to Maui — we cover the destinations travelers love most.</p>
                  </td>
                </tr>
              </table>

              <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Ready to see what's available right now?
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${SITE}/deals/all-inclusive" style="display:inline-block;background-color:#4ac850;color:#ffffff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
                      Browse Today's Deals →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:24px 0 0;text-align:center;">
                We'll never spam you. Expect 1–2 emails per week with our best finds. Unsubscribe anytime.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">
                © ${yr} VacationPro · <a href="${SITE}" style="color:#009b51;text-decoration:none;">vacationpro.co</a>
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                <a href="<%asm_group_unsubscribe_raw_url%>" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a> · <a href="${SITE}/legal/privacy" style="color:#9ca3af;text-decoration:underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    if (!SENDGRID_API_KEY) {
      console.error('Missing SendGrid API key');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const body: SubscribeRequest = await request.json();

    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    // Add contact to SendGrid Marketing Contacts
    await upsertContact(body.email, body.firstName, body.utmCampaign);

    // Send welcome email immediately
    await sendWelcomeEmail(body.email, body.firstName);

    return NextResponse.json(
      {
        success: true,
        message: "You're subscribed! Check your inbox for a welcome email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
