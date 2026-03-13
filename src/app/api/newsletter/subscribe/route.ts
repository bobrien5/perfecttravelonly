import { NextRequest, NextResponse } from 'next/server';

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

interface SubscribeRequest {
  email: string;
  firstName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referringSite?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error('Missing Beehiiv environment variables');
      return NextResponse.json(
        { error: 'Newsletter service not configured' },
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

    // Build custom fields array
    const customFields: { name: string; value: string }[] = [];
    if (body.firstName) {
      customFields.push({ name: 'First Name', value: body.firstName });
    }

    // Call Beehiiv API v2
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email.toLowerCase().trim(),
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: body.utmSource || 'vacationpro',
          utm_medium: body.utmMedium || 'website',
          utm_campaign: body.utmCampaign || 'deal_alerts',
          referring_site: body.referringSite || 'https://vacationpro.co',
          custom_fields: customFields.length > 0 ? customFields : undefined,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Beehiiv API error:', response.status, errorData);

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again in a moment.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        message: "You're subscribed! Check your inbox for a welcome email.",
        subscriptionId: data.data?.id,
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
