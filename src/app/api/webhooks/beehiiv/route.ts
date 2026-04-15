import { NextRequest, NextResponse } from 'next/server';
import { verifyBeehiivWebhook } from '@/lib/beehiiv/webhook';
import { enrollInWelcome, removeFromSendGrid } from '@/lib/email/sequences';

interface BeehiivCustomField {
  name: string;
  value: string;
}

interface BeehiivEvent {
  type: string;
  data: {
    id: string;
    email: string;
    status?: string;
    custom_fields?: BeehiivCustomField[];
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let event: BeehiivEvent;
  try {
    event = verifyBeehiivWebhook(rawBody, {
      'svix-id': request.headers.get('svix-id'),
      'svix-timestamp': request.headers.get('svix-timestamp'),
      'svix-signature': request.headers.get('svix-signature'),
    }) as BeehiivEvent;
  } catch (err) {
    console.error('[beehiiv webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const firstName = event.data.custom_fields?.find((f) => f.name === 'First Name')?.value;

    switch (event.type) {
      case 'subscription.created':
        await enrollInWelcome(event.data.email, firstName);
        console.log(`[beehiiv webhook] enrolled ${event.data.email} in welcome`);
        break;
      case 'subscription.deleted':
        await removeFromSendGrid(event.data.email);
        console.log(`[beehiiv webhook] removed ${event.data.email} from SendGrid`);
        break;
      default:
        console.log(`[beehiiv webhook] ignored event type: ${event.type}`);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[beehiiv webhook] handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
