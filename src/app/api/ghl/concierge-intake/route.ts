import { NextRequest, NextResponse } from 'next/server';
import { contacts, opportunities, GHLError } from '@/lib/ghl';
import { CONCIERGE_FEE_ENABLED } from '@/lib/concierge';

// ─── GHL Pipeline & Stage IDs ────────────────────────────────
const PIPELINE_ID = 'p9PU7opJfYkgYvL8mHhU';
const NEW_LEAD_STAGE_ID = 'cee31e33-19cc-4310-8d86-4ea743c3f5f6';

// ─── GHL Custom Field IDs ────────────────────────────────────
// Attribution / source-tracking fields shared with claim-offer:
const CF_SOURCE_PAGE_URL = process.env.GHL_CF_SOURCE_PAGE_URL || '';
const CF_REFERRER_URL = process.env.GHL_CF_REFERRER_URL || '';
const CF_UTM_SOURCE = process.env.GHL_CF_UTM_SOURCE || '';
const CF_UTM_MEDIUM = process.env.GHL_CF_UTM_MEDIUM || '';
const CF_UTM_CAMPAIGN = process.env.GHL_CF_UTM_CAMPAIGN || '';

// Concierge-specific custom fields.
// Add the GHL custom field IDs once you create them in GHL
// (Settings → Custom Fields). Leave blank and the value is
// stored in the notes block instead.
const CF_CONCIERGE_TRAVEL_DATES = process.env.GHL_CF_CONCIERGE_TRAVEL_DATES || '';
const CF_CONCIERGE_DESTINATION = process.env.GHL_CF_CONCIERGE_DESTINATION || '';
const CF_CONCIERGE_TRIP_TYPE = process.env.GHL_CF_CONCIERGE_TRIP_TYPE || '';
const CF_CONCIERGE_PARTY_ADULTS = process.env.GHL_CF_CONCIERGE_PARTY_ADULTS || '';
const CF_CONCIERGE_PARTY_CHILDREN = process.env.GHL_CF_CONCIERGE_PARTY_CHILDREN || '';
const CF_CONCIERGE_BUDGET_RANGE = process.env.GHL_CF_CONCIERGE_BUDGET_RANGE || '';
const CF_CONCIERGE_PRIORITIES = process.env.GHL_CF_CONCIERGE_PRIORITIES || '';
const CF_CONCIERGE_NOTES = process.env.GHL_CF_CONCIERGE_NOTES || '';
const CF_CONCIERGE_DEPARTURE_AIRPORT = process.env.GHL_CF_CONCIERGE_DEPARTURE_AIRPORT || '';

interface ConciergeIntakeRequest {
  // Section 1: Trip basics
  travelDates: string;
  adults: number;
  children: number;
  destination: string;
  departureAirport?: string;
  tripType: string;
  budgetPerPerson: string;
  // Section 2: What matters most (comma-separated string)
  priorities: string;
  specialRequests?: string;
  // Section 3: Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source?: string;
  // Attribution
  sourcePageUrl?: string;
  referrerUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function validateRequest(body: Partial<ConciergeIntakeRequest>): string | null {
  if (!body.firstName?.trim()) return 'First name is required';
  if (!body.lastName?.trim()) return 'Last name is required';
  if (!body.email?.trim()) return 'Email is required';
  if (!body.phone?.trim()) return 'Phone is required';
  if (!body.travelDates?.trim()) return 'Travel dates are required';
  if (!body.adults || body.adults < 1) return 'At least 1 adult is required';
  if (!body.destination) return 'Destination is required';
  if (!body.tripType) return 'Trip type is required';
  if (!body.budgetPerPerson) return 'Budget per person is required';
  if (!body.priorities?.trim()) return 'At least one priority is required';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) return 'Invalid email address';

  const digits = body.phone.replace(/\D/g, '');
  if (digits.length < 10) return 'Phone number must be at least 10 digits';

  return null;
}

/**
 * Builds a structured notes block summarizing the concierge intake.
 * Stored on the GHL contact so all context is visible in the CRM
 * even before custom fields are configured.
 */
function buildNotesBlock(body: ConciergeIntakeRequest): string {
  const utmLine = [body.utmSource, body.utmMedium, body.utmCampaign]
    .filter(Boolean)
    .join(' / ') || '(none)';

  return [
    '=== VacationPro Concierge Intake ===',
    `Submitted: ${new Date().toISOString()}`,
    `Travel dates: ${body.travelDates}`,
    `Party: ${body.adults} adults, ${body.children ?? 0} children`,
    `Destination: ${body.destination}`,
    `Home airport: ${body.departureAirport?.trim() || '(not provided)'}`,
    `Trip type: ${body.tripType}`,
    `Budget per person: ${body.budgetPerPerson}`,
    `Priorities: ${body.priorities}`,
    `Special requests: ${body.specialRequests?.trim() || '(none)'}`,
    `Source: ${body.source || '(unknown)'}`,
    `UTM source/medium/campaign: ${utmLine}`,
  ].join('\n');
}

/**
 * Converts a source label to a lowercase, hyphenated slug
 * suitable for a GHL tag. E.g. "Beacons / Deal PDF" -> "beacons-deal-pdf"
 */
function toSourceSlug(source: string): string {
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * POST /api/ghl/concierge-intake
 *
 * Full concierge lead capture flow:
 * 1. Upsert contact in GHL with trip context in notes + optional custom fields
 * 2. Add a contact note via the Notes API so the intake block appears in activity
 * 3. Create opportunity in Marketing Pipeline → New Lead stage
 */
export async function POST(request: NextRequest) {
  try {
    const body: ConciergeIntakeRequest = await request.json();

    // Validate
    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Build tags
    const sourceSlug = body.source ? toSourceSlug(body.source) : 'unknown';
    const tags = [
      CONCIERGE_FEE_ENABLED ? 'concierge-pending-payment' : 'concierge-free-intake',
      'concierge-vip',
      'vacationpro',
      `concierge-source-${sourceSlug}`,
    ];

    // Build custom fields
    const customFields: Array<{ id: string; field_value: string }> = [];

    if (CF_CONCIERGE_TRAVEL_DATES && body.travelDates) {
      customFields.push({ id: CF_CONCIERGE_TRAVEL_DATES, field_value: body.travelDates });
    }
    if (CF_CONCIERGE_DESTINATION && body.destination) {
      customFields.push({ id: CF_CONCIERGE_DESTINATION, field_value: body.destination });
    }
    if (CF_CONCIERGE_DEPARTURE_AIRPORT && body.departureAirport) {
      customFields.push({ id: CF_CONCIERGE_DEPARTURE_AIRPORT, field_value: body.departureAirport });
    }
    if (CF_CONCIERGE_TRIP_TYPE && body.tripType) {
      customFields.push({ id: CF_CONCIERGE_TRIP_TYPE, field_value: body.tripType });
    }
    if (CF_CONCIERGE_PARTY_ADULTS) {
      customFields.push({
        id: CF_CONCIERGE_PARTY_ADULTS,
        field_value: String(body.adults),
      });
    }
    if (CF_CONCIERGE_PARTY_CHILDREN) {
      customFields.push({
        id: CF_CONCIERGE_PARTY_CHILDREN,
        field_value: String(body.children ?? 0),
      });
    }
    if (CF_CONCIERGE_BUDGET_RANGE && body.budgetPerPerson) {
      customFields.push({ id: CF_CONCIERGE_BUDGET_RANGE, field_value: body.budgetPerPerson });
    }
    if (CF_CONCIERGE_PRIORITIES && body.priorities) {
      customFields.push({ id: CF_CONCIERGE_PRIORITIES, field_value: body.priorities });
    }
    if (CF_CONCIERGE_NOTES) {
      customFields.push({ id: CF_CONCIERGE_NOTES, field_value: buildNotesBlock(body) });
    }

    // Attribution fields
    if (CF_SOURCE_PAGE_URL && body.sourcePageUrl) {
      customFields.push({ id: CF_SOURCE_PAGE_URL, field_value: body.sourcePageUrl });
    }
    if (CF_REFERRER_URL && body.referrerUrl) {
      customFields.push({ id: CF_REFERRER_URL, field_value: body.referrerUrl });
    }
    if (CF_UTM_SOURCE && body.utmSource) {
      customFields.push({ id: CF_UTM_SOURCE, field_value: body.utmSource });
    }
    if (CF_UTM_MEDIUM && body.utmMedium) {
      customFields.push({ id: CF_UTM_MEDIUM, field_value: body.utmMedium });
    }
    if (CF_UTM_CAMPAIGN && body.utmCampaign) {
      customFields.push({ id: CF_UTM_CAMPAIGN, field_value: body.utmCampaign });
    }

    // Step 1: Upsert contact
    const contactResult = await contacts.upsert({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      source: 'VacationPro - Concierge Planning',
      tags,
      customFields,
    });

    const contactId = contactResult.contact.id;

    // Step 2: Add structured note to contact activity
    // Uses the GHL Notes API (separate from custom fields).
    // Non-fatal if it fails — the data is already on the contact.
    try {
      const locationId = process.env.GHL_LOCATION_ID || '';
      const token = process.env.GHL_API_TOKEN || '';
      if (locationId && token) {
        await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Version: '2021-07-28',
          },
          body: JSON.stringify({
            userId: contactId,
            body: buildNotesBlock(body),
          }),
        });
      }
    } catch (noteErr) {
      console.error('Failed to create contact note (non-fatal):', noteErr);
    }

    // Step 3: Create opportunity in the pipeline
    let opportunityId: string | null = null;
    try {
      const oppResult = await opportunities.create({
        pipelineId: PIPELINE_ID,
        pipelineStageId: NEW_LEAD_STAGE_ID,
        contactId,
        name: `Concierge - ${body.destination} - ${body.firstName} ${body.lastName}`,
        source: 'VacationPro - Concierge Planning',
        status: 'open',
      });
      opportunityId = oppResult.opportunity.id;
    } catch (oppErr) {
      // Contact was captured even if opportunity creation fails
      console.error('Failed to create opportunity (non-fatal):', oppErr);
    }

    return NextResponse.json(
      {
        success: true,
        contactId,
        opportunityId,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof GHLError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('Concierge intake error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
