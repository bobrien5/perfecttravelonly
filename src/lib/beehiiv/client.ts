const API_BASE = 'https://api.beehiiv.com/v2';

function getConfig() {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    throw new Error('Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID');
  }
  return { apiKey, publicationId };
}

export interface BeehiivSubscription {
  id: string;
  email: string;
  status: 'active' | 'inactive' | 'pending' | 'validating' | 'invalid';
  created: number;
  subscription_tier?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referring_site?: string;
  custom_fields?: Array<{ name: string; value: string }>;
}

export interface CreateSubscriptionInput {
  email: string;
  firstName?: string;
  reactivateExisting?: boolean;
  sendWelcomeEmail?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referringSite?: string;
  customFields?: Array<{ name: string; value: string }>;
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<BeehiivSubscription> {
  const { apiKey, publicationId } = getConfig();

  const customFields: Array<{ name: string; value: string }> = [
    ...(input.customFields ?? []),
  ];
  if (input.firstName) {
    customFields.push({ name: 'First Name', value: input.firstName });
  }

  const body: Record<string, unknown> = {
    email: input.email.toLowerCase().trim(),
    reactivate_existing: input.reactivateExisting ?? true,
    send_welcome_email: input.sendWelcomeEmail ?? false,
  };
  if (input.utmSource) body.utm_source = input.utmSource;
  if (input.utmMedium) body.utm_medium = input.utmMedium;
  if (input.utmCampaign) body.utm_campaign = input.utmCampaign;
  if (input.referringSite) body.referring_site = input.referringSite;
  if (customFields.length) body.custom_fields = customFields;

  const res = await fetch(
    `${API_BASE}/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Beehiiv createSubscription failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as { data: BeehiivSubscription };
  return json.data;
}

export async function getSubscription(
  email: string
): Promise<BeehiivSubscription | null> {
  const { apiKey, publicationId } = getConfig();
  const res = await fetch(
    `${API_BASE}/publications/${publicationId}/subscriptions/by_email/${encodeURIComponent(
      email.toLowerCase().trim()
    )}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Beehiiv getSubscription failed (${res.status}): ${text}`);
  }
  const { data } = (await res.json()) as { data: BeehiivSubscription };
  return data;
}

export async function deleteSubscription(email: string): Promise<void> {
  const { apiKey, publicationId } = getConfig();

  const sub = await getSubscription(email);
  if (!sub) return;

  const res = await fetch(
    `${API_BASE}/publications/${publicationId}/subscriptions/${sub.id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Beehiiv deleteSubscription failed (${res.status}): ${text}`);
  }
}
