import { NextRequest, NextResponse } from 'next/server';
import { createSubscription } from '@/lib/beehiiv/client';

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
    const body: SubscribeRequest = await request.json();

    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    await createSubscription({
      email: body.email,
      firstName: body.firstName,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign ?? 'deal_alerts',
      referringSite: body.referringSite,
      reactivateExisting: true,
      sendWelcomeEmail: false,
    });

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
