import { contacts } from '@/lib/ghl';
import { escapeHtml, sendTransactional, simpleEmailHtml, type SendResult } from '@/lib/email/transactional';
import { subscribeWithConsent } from '@/lib/newsletter/beehiiv';
import { destinationName, getResortRecord } from '@/lib/resorts/catalog';
import { QUOTE_RESPONSE_COPY } from './config';
import type { NotificationResult } from './store';
import type { QuoteInput } from './validate';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vacationpro.co';

function tripLines(q: QuoteInput, reference: string): [string, string][] {
  const resort = q.selectedResortId ? getResortRecord(q.selectedResortId)?.name ?? q.selectedResortId : null;
  const alts = q.alternativeResortIds.map((id) => getResortRecord(id)?.name ?? id).join(', ');
  const dates = q.dates
    ? q.dates.mode === 'exact'
      ? `${q.dates.checkIn} to ${q.dates.checkOut}`
      : `${q.dates.month ?? 'Month flexible'}, ${q.dates.nights} nights`
    : '';
  const kids = q.childAges.length ? `, ${q.childAges.length} children (ages ${q.childAges.join(', ')})` : '';
  const budget = q.budgetAmount !== null ? `${q.budgetAmount.toLocaleString('en-US')} ${q.budgetCurrency ?? 'USD'} (flights included: ${q.budgetIncludesFlights ?? 'not said'})` : 'Not given';
  const lines: [string, string][] = [
    ['Reference', reference],
    ['Resort', resort ?? 'Not chosen yet'],
  ];
  if (alts) lines.push(['Also considering', alts]);
  lines.push(
    ['Destination', q.destination ? destinationName(q.destination) : 'Not chosen'],
    ['Dates', [dates, q.datesNote].filter(Boolean).join('. ') || 'Not given'],
    ['Travelers', `${q.adults} adults${kids}, ${q.rooms} room${q.rooms === 1 ? '' : 's'}`],
    ['Departure airport', q.departureAirport ?? 'Not decided'],
    ['Budget', budget],
    ['Trip type', q.tripScope === 'hotel-only' ? 'Hotel only' : q.tripScope === 'flight-and-hotel' ? 'Flight and hotel' : 'Not sure yet'],
    ['Booking timeframe', q.bookingTimeframe.replace(/-/g, ' ')],
  );
  if (q.priorities.length) lines.push(['Priorities', q.priorities.join(', ')]);
  return lines;
}

function table(lines: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px;">${lines
    .map(([k, v]) => `<tr><td style="padding:6px 8px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap;">${escapeHtml(k)}</td><td style="padding:6px 0;">${escapeHtml(v)}</td></tr>`)
    .join('')}</table>`;
}

export async function sendQuoteNotifications(q: QuoteInput, stored: { id: string; reference: string }): Promise<NotificationResult> {
  const errors: string[] = [];
  const lines = tripLines(q, stored.reference);

  const travelerHtml = simpleEmailHtml(
    `Thanks, ${q.firstName}. Your quote request is in.`,
    `<p style="margin:0 0 16px;">${escapeHtml(QUOTE_RESPONSE_COPY)}</p>
     <p style="margin:0 0 16px;">This request does not reserve a room or complete a booking. Rates, availability and any extras depend on the actual quote.</p>
     ${table(lines)}
     <p style="margin:20px 0 0;">Need to add something? Reply to this email and include your reference.</p>`,
  );
  const travelerText = [
    `Thanks, ${q.firstName}. Your quote request is in.`,
    QUOTE_RESPONSE_COPY,
    'This request does not reserve a room or complete a booking. Rates, availability and any extras depend on the actual quote.',
    '',
    ...lines.map(([k, v]) => `${k}: ${v}`),
  ].join('\n');

  const travelerEmail: SendResult = await sendTransactional({
    to: q.email,
    subject: `Your VacationPro quote request (${stored.reference})`,
    html: travelerHtml,
    text: travelerText,
    replyTo: process.env.ADVISOR_NOTIFICATION_EMAIL || undefined,
  });
  if (travelerEmail === 'failed') errors.push('traveler email failed');

  let advisorEmail: SendResult = 'skipped';
  const advisorTo = process.env.ADVISOR_NOTIFICATION_EMAIL;
  if (advisorTo) {
    const contact: [string, string][] = [
      ['Name', [q.firstName, q.lastName].filter(Boolean).join(' ')],
      ['Email', q.email],
      ['Phone', q.phone ?? 'Not given'],
      ['Prefers', q.contactPreference],
      ['Source', q.source ?? 'direct'],
    ];
    advisorEmail = await sendTransactional({
      to: advisorTo,
      subject: `New quote request ${stored.reference}: ${lines[1][1]}`,
      html: simpleEmailHtml(
        `New quote request ${stored.reference}`,
        `${table([...contact, ...lines.slice(1)])}
         ${q.notes ? `<p style="margin:16px 0 0;"><strong>Notes:</strong> ${escapeHtml(q.notes)}</p>` : ''}
         <p style="margin:20px 0 0;"><a href="${SITE_URL}/admin/quotes/${stored.id}" style="color:#007b41;font-weight:700;">Open in admin</a></p>`,
      ),
      text: [...contact, ...lines.slice(1)].map(([k, v]) => `${k}: ${v}`).join('\n') + (q.notes ? `\nNotes: ${q.notes}` : ''),
      replyTo: q.email,
    });
    if (advisorEmail === 'failed') errors.push('advisor email failed');
  }

  // Existing CRM. Best effort: the database row is the system of record.
  let crm: NotificationResult['crm'] = 'skipped';
  if (process.env.GHL_API_TOKEN && process.env.GHL_LOCATION_ID) {
    try {
      const tags = ['vacationpro', 'quote-request'];
      if (q.selectedResortId) tags.push(`quote-resort-${q.selectedResortId}`);
      if (q.marketingConsent) tags.push('marketing-consent');
      await contacts.upsert({
        firstName: q.firstName,
        lastName: q.lastName ?? undefined,
        email: q.email,
        phone: q.phone ?? undefined,
        source: 'VacationPro - Quote Request',
        tags,
      });
      crm = 'sent';
    } catch (err) {
      crm = 'failed';
      errors.push(`crm: ${err instanceof Error ? err.message : 'error'}`);
    }
  }

  if (q.marketingConsent) {
    const nl = await subscribeWithConsent(q.email, { source: 'vacationpro', medium: 'quote', campaign: 'quote-request' });
    if (nl === 'failed') errors.push('newsletter signup failed');
  }

  return { travelerEmail, advisorEmail, crm, errors: errors.length ? errors : undefined, at: new Date().toISOString() };
}
