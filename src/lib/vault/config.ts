/**
 * Vacation Vault sales switch. Brendan decided on 2026-10-27 to stop selling
 * the Vault: resort matching, booking links and quotes are free for everyone,
 * so there is nothing left worth charging for.
 *
 * Closing sales does NOT touch existing members. Their subscriptions, access,
 * Stripe webhook handling and the billing portal keep working unchanged.
 * Ending existing subscriptions is a separate decision made in Stripe.
 */
export const VAULT_ACCEPTING_NEW_MEMBERS = false;
