/**
 * Concierge planning fee switch.
 *
 * Pricing decided 2026-10-14: concierge planning is FREE for Vacation Vault
 * members and costs CONCIERGE_FEE for everyone else.
 *
 * The fee is deliberately higher than a full year of the Vault ($59), so the
 * cheapest route to a custom trip plan is to join. The fee's job is to make
 * that argument and to qualify the lead, not to be the revenue: the revenue is
 * the booking commission that follows. Before this, non-members were blocked
 * from concierge entirely, which threw the lead away.
 *
 * Set CONCIERGE_FEE back to null to run free for everyone again. Every
 * touchpoint (landing page, form, intake route, advisor CTAs) reads from here.
 */
export const CONCIERGE_FEE: number | null = 99;

export const CONCIERGE_FEE_ENABLED = CONCIERGE_FEE !== null;

/**
 * What a non-member is asked to do.
 *
 * 'join' (current): they cannot buy concierge on its own, they join the Vault.
 * 'pay': they pay CONCIERGE_FEE for this trip only.
 *
 * 'join' is deliberate while brief volume is the bottleneck. A booking is worth
 * ~$450 in commission against a $99 fee, so anything that suppresses brief
 * volume costs more than the fee earns. A Vault signup is also recurring, which
 * is what the income-replacement plan actually needs, where $99 once is not.
 *
 * Flip to 'pay' when inbound briefs exceed what one advisor can service: the fee
 * then works as a qualifier rather than a tax on the funnel.
 */
export type ConciergeNonMemberPath = 'join' | 'pay';
export const CONCIERGE_NON_MEMBER_PATH: ConciergeNonMemberPath = 'join';

/**
 * True when a non-member is allowed to buy concierge outright.
 *
 * The comparison goes through a parameter rather than reading the const
 * directly, because TypeScript narrows a `const` to its literal type and would
 * otherwise flag the 'pay' branch as unreachable.
 */
function nonMembersPay(path: ConciergeNonMemberPath): boolean {
  return path === 'pay' && CONCIERGE_FEE_ENABLED;
}
export const CONCIERGE_NON_MEMBERS_PAY = nonMembersPay(CONCIERGE_NON_MEMBER_PATH);

/** Can this visitor submit a brief at all? */
export function conciergeIsOpenTo(isMember: boolean): boolean {
  return isMember || CONCIERGE_NON_MEMBERS_PAY;
}

/** What this visitor pays. Members never pay a planning fee. */
export function conciergeFeeFor(isMember: boolean): number | null {
  if (isMember) return null;
  return CONCIERGE_NON_MEMBERS_PAY ? CONCIERGE_FEE : null;
}

/** True when this visitor must pay before the plan gets built. */
export function conciergeRequiresPayment(isMember: boolean): boolean {
  return !isMember && CONCIERGE_NON_MEMBERS_PAY;
}

/** Headline price and its subline, for the concierge tier card. */
export function conciergePrice(isMember: boolean): { label: string; note: string } {
  if (isMember) return { label: 'Free', note: 'included with your membership' };
  if (CONCIERGE_NON_MEMBERS_PAY) {
    return { label: `$${CONCIERGE_FEE}`, note: 'research + advisor time' };
  }
  return { label: '$5.99', note: 'a month, included with the Vault' };
}

/** "$99" for non-members who can pay, "Free" for members. */
export function conciergePriceLabel(isMember: boolean): string {
  return conciergePrice(isMember).label;
}

/**
 * Label for contexts that cannot know membership, such as statically
 * rendered blog CTAs.
 */
export const CONCIERGE_PRICE_LABEL = CONCIERGE_FEE_ENABLED ? `$${CONCIERGE_FEE}` : 'Free';

/** Short line for CTAs on guides and blog posts, where membership is unknown. */
export const CONCIERGE_CTA_NOTE = CONCIERGE_NON_MEMBERS_PAY
  ? `Free for Vacation Vault members, $${CONCIERGE_FEE} for everyone else. Proposal within 24 hours.`
  : 'Included with Vacation Vault membership, $5.99 a month. Proposal within 24 hours.';

/** Meta description for the concierge landing page. */
export const CONCIERGE_META_DESCRIPTION = CONCIERGE_NON_MEMBERS_PAY
  ? `Hire a licensed travel advisor to plan a custom vacation. Free for Vacation Vault members, $${CONCIERGE_FEE} for everyone else.`
  : 'Hire a licensed travel advisor to plan your custom vacation, included with Vacation Vault membership at $5.99 a month.';
