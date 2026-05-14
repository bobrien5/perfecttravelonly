import type { DealKeyword } from '@/lib/deal-registry/types';

export type ResolveResponse =
  | { found: true; keyword: string; dealTitle: string; dmText: string; landingUrl: string }
  | { found: false; keyword: string };

export function buildResolveResponse(
  deal: DealKeyword | null,
  siteUrl: string,
  rawKeyword = ''
): ResolveResponse {
  if (!deal) return { found: false, keyword: rawKeyword };
  return {
    found: true,
    keyword: deal.keyword,
    dealTitle: deal.dealTitle,
    dmText: deal.dmCopy,
    landingUrl: `${siteUrl}${deal.landingPath}`,
  };
}
