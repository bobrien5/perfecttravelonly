import { NextRequest, NextResponse } from 'next/server';

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

interface ManyChatRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  subscriber_id?: string;
  page_url?: string;
  comment_keyword?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error('Missing Beehiiv config');
      return NextResponse.json({ error: 'Newsletter service not configured' }, { status: 500 });
    }

    const body: ManyChatRequest = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    const customFields: Array<{ name: string; value: string }> = [];
    if (body.first_name) customFields.push({ name: 'First Name', value: body.first_name });
    if (body.last_name) customFields.push({ name: 'Last Name', value: body.last_name });
    if (body.subscriber_id) customFields.push({ name: 'ManyChat Subscriber ID', value: body.subscriber_id });

    const payload: Record<string, unknown> = {
      email,
      reactivate_existing: true,
      send_welcome_email: true,
      utm_source: 'manychat',
      utm_medium: 'instagram',
      utm_campaign: body.comment_keyword || 'deals-comment',
      referring_site: body.page_url || 'manychat-deals-comment',
    };
    if (customFields.length > 0) payload.custom_fields = customFields;

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('Beehiiv subscribe failed', { status: res.status, data });
      return NextResponse.json(
        { error: 'Subscribe failed', details: data },
        { status: res.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        subscriber_id: data?.data?.id,
        status: data?.data?.status,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('ManyChat subscribe error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/manychat/subscribe',
    method: 'POST',
    expects: ['email (required)', 'first_name', 'last_name', 'subscriber_id', 'page_url', 'comment_keyword'],
  });
}
