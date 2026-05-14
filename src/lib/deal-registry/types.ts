export interface DealKeyword {
  id: string;
  keyword: string;
  dealSlug: string;
  dealTitle: string;
  destination: string;
  price: number;
  landingPath: string;
  dmCopy: string;
  status: 'active' | 'paused' | 'expired';
  expiresAt: string | null;
  createdAt: string;
}

export interface DealEntryInput {
  keyword: string;
  dealSlug: string;
  dealTitle: string;
  destination: string;
  price: number;
  landingPath: string;
  dmCopy: string;
  expiresAt?: string | null;
}
