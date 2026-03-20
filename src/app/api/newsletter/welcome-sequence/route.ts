import { NextRequest, NextResponse } from 'next/server';
import sgClient from '@sendgrid/client';
import sgMail from '@sendgrid/mail';
import { sendSequenceEmail } from '@/lib/email/welcome-sequence';
import { getFeaturedDeals } from '@/sanity/lib/fetch';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const CRON_SECRET = process.env.SANITY_REVALIDATE_SECRET; // reuse existing secret

sgClient.setApiKey(SENDGRID_API_KEY);
sgMail.setApiKey(SENDGRID_API_KEY);

// Welcome sequence schedule (days after signup):
// Email 1: Day 0 (sent immediately on subscribe)
// Email 2: Day 3 (best deals)
// Email 3: Day 7 (destinations + social proof)
// Email 4: Day 14 (final CTA + timeshare intro)

const SEQUENCE_DAYS = [0, 3, 7, 14];

// Called by Vercel Cron daily to process welcome sequence
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get featured deals for email content
    const deals = await getFeaturedDeals();

    // Search for contacts that need sequence emails
    // We use custom fields to track sequence progress:
    // e2_T = signup_date (ISO string)
    // e3_T = welcome_step (1, 2, 3, 4 = completed)

    const results = {
      processed: 0,
      sent: 0,
      errors: 0,
    };

    // Search contacts who haven't completed the sequence
    for (const step of [2, 3, 4] as const) {
      const daysSinceSignup = SEQUENCE_DAYS[step - 1];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSinceSignup);

      try {
        // Search for contacts who signed up before the cutoff and are on the previous step
        const previousStep = step - 1;
        const searchRequest = {
          url: '/v3/marketing/contacts/search' as const,
          method: 'POST' as const,
          body: {
            query: `e3_T = '${previousStep}' AND e2_T <= '${cutoffDate.toISOString().split('T')[0]}'`,
          },
        };

        const [, searchBody] = await sgClient.request(searchRequest);
        const contacts = (searchBody as { result?: Array<{ email: string; first_name?: string; id: string }> })?.result || [];

        for (const contact of contacts) {
          try {
            await sendSequenceEmail(step, contact.email, contact.first_name, deals);

            // Update contact's welcome_step
            const updateRequest = {
              url: '/v3/marketing/contacts' as const,
              method: 'PUT' as const,
              body: {
                contacts: [{
                  email: contact.email,
                  custom_fields: {
                    e3_T: String(step),
                  },
                }],
              },
            };
            await sgClient.request(updateRequest);

            results.sent++;
          } catch (err) {
            console.error(`Failed to send email ${step} to ${contact.email}:`, err);
            results.errors++;
          }
          results.processed++;
        }
      } catch (err) {
        console.error(`Failed to search for step ${step}:`, err);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Processed ${results.processed} contacts, sent ${results.sent} emails, ${results.errors} errors`,
    });
  } catch (error) {
    console.error('Welcome sequence cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process welcome sequence' },
      { status: 500 }
    );
  }
}

// Manual trigger: POST to send a specific email to a specific contact (for testing)
export async function POST(request: NextRequest) {
  try {
    const { email, firstName, emailNumber } = await request.json();

    if (!email || !emailNumber || ![2, 3, 4].includes(emailNumber)) {
      return NextResponse.json(
        { error: 'email and emailNumber (2, 3, or 4) are required' },
        { status: 400 }
      );
    }

    const deals = await getFeaturedDeals();
    await sendSequenceEmail(emailNumber as 2 | 3 | 4, email, firstName, deals);

    return NextResponse.json({ success: true, message: `Email ${emailNumber} sent to ${email}` });
  } catch (error) {
    console.error('Manual sequence send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
