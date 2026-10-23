/**
 * Newsletter signup through the existing Beehiiv publication. Only call this
 * when the visitor ticked the separate marketing consent box; transactional
 * requests (quotes, results emails) never subscribe anyone on their own.
 */
export async function subscribeWithConsent(email: string, utm: { source: string; medium: string; campaign: string }): Promise<'sent' | 'failed' | 'skipped'> {
  const key = process.env.BEEHIIV_API_KEY;
  const pub = process.env.BEEHIIV_PUBLICATION_ID;
  if (!key || !pub) return 'skipped';
  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${pub}/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: utm.source,
        utm_medium: utm.medium,
        utm_campaign: utm.campaign,
      }),
    });
    return res.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}
