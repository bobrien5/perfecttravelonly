/**
 * One-shot migration: pull every SendGrid Marketing contact and create a
 * matching Beehiiv subscription.
 *
 * Usage:
 *   set -a; source .env.local; set +a
 *   npx tsx scripts/migrate-sendgrid-to-beehiiv.ts
 */
import sgClient from '@sendgrid/client';
import { createSubscription } from '../src/lib/beehiiv/client';

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) throw new Error('Missing SENDGRID_API_KEY');
sgClient.setApiKey(apiKey);

interface SgContact {
  id: string;
  email: string;
  first_name?: string;
  custom_fields?: Record<string, string>;
}

async function listAllContacts(): Promise<SgContact[]> {
  // Small list (expected ~14). Search with a match-anything query.
  const [, body] = await sgClient.request({
    url: '/v3/marketing/contacts/search',
    method: 'POST',
    body: {
      query: "email LIKE '%@%'",
    },
  });
  const data = body as { result: SgContact[] };
  return data.result ?? [];
}

async function main() {
  const contacts = await listAllContacts();
  console.log(`Found ${contacts.length} SendGrid contacts.`);

  let migrated = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const c of contacts) {
    try {
      await createSubscription({
        email: c.email,
        firstName: c.first_name,
        utmSource: 'migration',
        utmCampaign: 'sendgrid_to_beehiiv_2026_04',
        reactivateExisting: true,
        sendWelcomeEmail: false,
      });
      migrated++;
      console.log(`✓ ${c.email}`);
    } catch (err) {
      failed++;
      errors.push({ email: c.email, error: String(err) });
      console.error(`✗ ${c.email}: ${err}`);
    }
  }

  console.log(`\nSummary: ${migrated} migrated, ${failed} failed.`);
  if (errors.length) {
    console.error('\nErrors:', JSON.stringify(errors, null, 2));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Migration crashed:', err);
  process.exit(1);
});
