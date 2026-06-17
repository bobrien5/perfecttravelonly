import { NextRequest, NextResponse } from 'next/server';

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
const BEEHIIV_BASE = 'https://api.beehiiv.com/v2';

interface SubscribeRequest {
  email: string;
  firstName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referringSite?: string;
}

interface BeehiivCreateSubscriptionPayload {
  email: string;
  reactivate_existing: boolean;
  send_welcome_email: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referring_site?: string;
  custom_fields?: { name: string; value: string }[];
}

interface BeehiivResponse {
  data?: {
    id: string;
    email: string;
    status: string;
    created: number;
  };
  errors?: { message: string }[];
}

export async function POST(req: NextRequest) {
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    return NextResponse.json(
      { error: 'Newsletter is not configured. Please try again later.' },
      { status: 500 }
    );
  }

  let body: SubscribeRequest;
  try {
    body = (await req.json()) as SubscribeRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = body.email?.toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  const customFields: { name: string; value: string }[] = [];
  if (body.firstName?.trim()) {
    customFields.push({ name: 'First Name', value: body.firstName.trim() });
  }

  const payload: BeehiivCreateSubscriptionPayload = {
    email,
    reactivate_existing: true,
    send_welcome_email: true,
    utm_source: body.utmSource || 'vacationpro',
    utm_medium: body.utmMedium || 'website',
    utm_campaign: body.utmCampaign || 'deal_alerts',
    referring_site: body.referringSite,
    custom_fields: customFields.length ? customFields : undefined,
  };

  try {
    const res = await fetch(
      `${BEEHIIV_BASE}/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = (await res.json()) as BeehiivResponse;

    if (!res.ok) {
      const message =
        data.errors?.[0]?.message ||
        'We could not save your email. Please try again.';
      // Surface 400/422 from Beehiiv as a user-friendly client error,
      // log unexpected 5xx for debugging.
      const status = res.status >= 500 ? 502 : res.status;
      if (res.status >= 500) {
        console.error('Beehiiv subscription error', res.status, data);
      }
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      {
        success: true,
        message: "You're subscribed! Check your inbox for the next issue.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Beehiiv subscription network error:', err);
    return NextResponse.json(
      { error: 'Could not reach the newsletter service. Please try again.' },
      { status: 502 }
    );
  }
}
