import { Webhook, type WebhookRequiredHeaders } from 'svix';

export interface BeehiivWebhookHeaders {
  'svix-id'?: string | null;
  'svix-timestamp'?: string | null;
  'svix-signature'?: string | null;
}

/**
 * Verifies an incoming Beehiiv webhook using Svix signatures.
 * Throws on invalid signature or missing headers.
 * Returns the parsed event payload when valid.
 */
export function verifyBeehiivWebhook(
  rawBody: string,
  headers: BeehiivWebhookHeaders
): unknown {
  const secret = process.env.BEEHIIV_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Missing BEEHIIV_WEBHOOK_SECRET');
  }

  const id = headers['svix-id'];
  const timestamp = headers['svix-timestamp'];
  const signature = headers['svix-signature'];

  if (!id || !timestamp || !signature) {
    throw new Error('Missing Svix headers (id/timestamp/signature)');
  }

  const svixHeaders: WebhookRequiredHeaders = {
    'svix-id': id,
    'svix-timestamp': timestamp,
    'svix-signature': signature,
  };

  const wh = new Webhook(secret);
  return wh.verify(rawBody, svixHeaders);
}
