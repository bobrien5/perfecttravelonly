import sgClient from '@sendgrid/client';

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) sgClient.setApiKey(apiKey);

/**
 * Add a contact to the SendGrid "welcome_series" list.
 *
 * The SendGrid Automation configured in the dashboard is triggered by
 * "contact added to list" for SENDGRID_WELCOME_LIST_ID. Adding a contact
 * here enrolls them in the 5-email welcome series.
 */
export async function enrollInWelcome(email: string, firstName?: string): Promise<void> {
  const listId = process.env.SENDGRID_WELCOME_LIST_ID;
  if (!listId) {
    throw new Error('Missing SENDGRID_WELCOME_LIST_ID');
  }

  await sgClient.request({
    url: '/v3/marketing/contacts',
    method: 'PUT',
    body: {
      list_ids: [listId],
      contacts: [
        {
          email: email.toLowerCase().trim(),
          ...(firstName ? { first_name: firstName } : {}),
        },
      ],
    },
  });
}

/**
 * Look up a SendGrid contact by email and delete it entirely.
 * Removes them from all lists and from the global contacts DB.
 * No-op if the contact doesn't exist.
 */
export async function removeFromSendGrid(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();

  const [, searchBody] = await sgClient.request({
    url: '/v3/marketing/contacts/search',
    method: 'POST',
    body: { query: `email = '${normalized.replace(/'/g, "''")}'` },
  });

  const result = (searchBody as { result?: Array<{ id: string }> }).result;
  if (!result || result.length === 0) return;

  const ids = result.map((r) => r.id).join(',');
  await sgClient.request({
    url: `/v3/marketing/contacts?ids=${ids}`,
    method: 'DELETE',
  });
}
