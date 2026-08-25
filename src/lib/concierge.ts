/**
 * Concierge planning fee switch.
 *
 * Set CONCIERGE_FEE to a number (e.g. 99) to charge a planning fee through
 * Stripe after intake, or null to run the concierge in free mode (intake only,
 * no checkout step). Free mode is on as of 2026-08-25 to test demand for
 * package planning; every touchpoint (landing page, form, links page, advisor
 * CTAs) reads from here so the fee comes back with a one-line change.
 */
export const CONCIERGE_FEE: number | null = null;

export const CONCIERGE_FEE_ENABLED = CONCIERGE_FEE !== null;

/** "$99" when a fee is set, "Free" otherwise. */
export const CONCIERGE_PRICE_LABEL = CONCIERGE_FEE_ENABLED ? `$${CONCIERGE_FEE}` : 'Free';

/** Short line for CTAs on guides and blog posts. */
export const CONCIERGE_CTA_NOTE = CONCIERGE_FEE_ENABLED
  ? `Starts with a $${CONCIERGE_FEE} planning fee. Proposal within 24 hours.`
  : 'Free planning for a limited time. Proposal within 24 hours.';

/** Meta description for the concierge landing page. */
export const CONCIERGE_META_DESCRIPTION = CONCIERGE_FEE_ENABLED
  ? `Hire a travel advisor to plan a custom vacation for $${CONCIERGE_FEE}, research and advisor time included.`
  : 'Hire a travel advisor to plan a custom vacation, free for a limited time. Research and advisor time included.';
