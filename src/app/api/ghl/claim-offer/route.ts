import { NextRequest, NextResponse } from 'next/server';
import { contacts, opportunities, GHLError } from '@/lib/ghl';

// ─── GHL Pipeline & Stage IDs ────────────────────────────────
const PIPELINE_ID = 'p9PU7opJfYkgYvL8mHhU';
const NEW_LEAD_STAGE_ID = 'cee31e33-19cc-4310-8d86-4ea743c3f5f6';

// ─── GHL Custom Field IDs ────────────────────────────────────
// These map to the custom fields in the GHL sub-account.
// Existing fields from the "Marketing Form - Claim Offer":
const CF_AGE_RANGE = 'HOpwlwfhgkXu2OfXCWIt';
const CF_DESTINATION = 'wOKgs75uBGMUWHZwihEM';
// Attribution / source-tracking fields — paste the IDs from GHL after
// creating these custom fields in the sub-account (Settings → Custom Fields).
// If left empty, the corresponding value is silently skipped.
const CF_SOURCE_PAGE_URL = process.env.GHL_CF_SOURCE_PAGE_URL || '';
const CF_REFERRER_URL = process.env.GHL_CF_REFERRER_URL || '';
const CF_UTM_SOURCE = process.env.GHL_CF_UTM_SOURCE || '';
const CF_UTM_MEDIUM = process.env.GHL_CF_UTM_MEDIUM || '';
const CF_UTM_CAMPAIGN = process.env.GHL_CF_UTM_CAMPAIGN || '';

interface ClaimOfferRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ageRange: string;
  maritalStatus: string;
  householdIncome: string;
  ownOrRent: string;
  dealTitle: string;
  dealDestination: string;
  sourcePageUrl?: string;
  referrerUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function validateRequest(body: Partial<ClaimOfferRequest>): string | null {
  if (!body.firstName?.trim()) return 'First name is required';
  if (!body.lastName?.trim()) return 'Last name is required';
  if (!body.email?.trim()) return 'Email is required';
  if (!body.phone?.trim()) return 'Phone is required';
  if (!body.ageRange) return 'Age range is required';
  if (!body.maritalStatus) return 'Marital status is required';
  if (!body.householdIncome) return 'Household income is required';
  if (!body.ownOrRent) return 'Own or rent is required';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) return 'Invalid email address';

  const digits = body.phone.replace(/\D/g, '');
  if (digits.length < 10) return 'Phone number must be at least 10 digits';

  return null;
}

/**
 * POST /api/ghl/claim-offer
 *
 * Full lead capture flow:
 * 1. Upsert contact in GHL with qualification data
 * 2. Create opportunity in Marketing Pipeline → New Lead
 */
export async function POST(request: NextRequest) {
  try {
    const body: ClaimOfferRequest = await request.json();

    // Validate
    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Step 1: Upsert contact
    const customFields: Array<{ id: string; field_value: string }> = [
      { id: CF_AGE_RANGE, field_value: body.ageRange },
      { id: CF_DESTINATION, field_value: body.dealDestination },
    ];
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

    const contactResult = await contacts.upsert({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      source: 'VacationPro - Claim Offer',
      tags: ['claim-offer', 'timeshare-lead', 'vacationpro'],
      customFields,
    });

    const contactId = contactResult.contact.id;

    // Step 2: Create opportunity in the pipeline
    let opportunityId: string | null = null;
    try {
      const oppResult = await opportunities.create({
        pipelineId: PIPELINE_ID,
        pipelineStageId: NEW_LEAD_STAGE_ID,
        contactId,
        name: `Claim Offer - ${body.dealTitle} - ${body.firstName} ${body.lastName}`,
        source: 'VacationPro - Claim Offer',
        status: 'open',
      });
      opportunityId = oppResult.opportunity.id;
    } catch (oppErr) {
      // Contact was captured even if opportunity creation fails
      console.error('Failed to create opportunity:', oppErr);
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
    console.error('Claim offer error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
