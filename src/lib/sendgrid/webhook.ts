import { EventWebhook, EventWebhookHeader } from '@sendgrid/eventwebhook';

/**
 * Verify a SendGrid signed event webhook.
 * Returns true on valid signature, false otherwise.
 * Throws if SENDGRID_WEBHOOK_PUBLIC_KEY is not configured.
 */
export function verifySendgridWebhook(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
  if (!publicKey) throw new Error('Missing SENDGRID_WEBHOOK_PUBLIC_KEY');
  if (!signature || !timestamp) return false;

  const ew = new EventWebhook();
  const ecdsaPublicKey = ew.convertPublicKeyToECDSA(publicKey);
  return ew.verifySignature(ecdsaPublicKey, rawBody, signature, timestamp);
}

export const SG_SIGNATURE_HEADER = EventWebhookHeader.SIGNATURE().toLowerCase();
export const SG_TIMESTAMP_HEADER = EventWebhookHeader.TIMESTAMP().toLowerCase();
