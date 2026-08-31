export type Party = 'couple' | 'family' | 'friends' | 'solo' | 'honeymoon' | 'celebration';
export type Season = 'next3' | 'winter' | 'spring' | 'summer' | 'fall' | 'anytime';

export type Vibe =
  | 'beach' | 'pool' | 'luxury' | 'value' | 'food' | 'nightlife' | 'romantic'
  | 'snorkeling' | 'nature' | 'relaxing' | 'entertainment' | 'explore'
  | 'kids' | 'kidsclub' | 'waterpark' | 'easytravel' | 'familysuites'
  | 'privatepools' | 'seclusion';

export const ALL_VIBES: Vibe[] = [
  'beach', 'pool', 'luxury', 'value', 'food', 'nightlife', 'romantic',
  'snorkeling', 'nature', 'relaxing', 'entertainment', 'explore',
  'kids', 'kidsclub', 'waterpark', 'easytravel', 'familysuites',
  'privatepools', 'seclusion',
];

export type ResortStyle =
  | 'allinclusive' | 'luxuryresort' | 'boutique' | 'beachfront'
  | 'adultsonly' | 'familyresort' | 'nearnightlife';

export type Dealbreaker =
  | 'tooquiet' | 'party' | 'kids' | 'longtransfer' | 'seaweed'
  | 'mega' | 'remote' | 'connection' | 'cruise' | 'touristy';

export const ALL_DEALBREAKERS: Dealbreaker[] = [
  'tooquiet', 'party', 'kids', 'longtransfer', 'seaweed',
  'mega', 'remote', 'connection', 'cruise', 'touristy',
];

export interface BudgetBand { band: 1 | 2 | 3 | 4 | 5; label: string; }
export const BUDGET_BANDS: BudgetBand[] = [
  { band: 1, label: 'Under $2,500' },
  { band: 2, label: '$2,500-$4,000' },
  { band: 3, label: '$4,000-$6,000' },
  { band: 4, label: '$6,000-$10,000' },
  { band: 5, label: '$10,000+' },
];

export interface QuizAnswers {
  path: 'discover' | 'known';
  party: Party | null;
  kidsCount?: '1' | '2' | '3+';
  kidsAges?: ('under5' | '5-12' | 'teens')[];
  occasion?: string;
  origin: { code: string; label: string } | 'flexible' | null;
  dates: { start: string; end: string } | { season: Season } | null;
  budget: { band: 1 | 2 | 3 | 4 | 5; includesFlights: boolean } | null;
  vibes: Vibe[];
  styles: (ResortStyle | 'nopref')[];
  dealbreakers: Dealbreaker[];
  pace: number;        // 0 relaxed .. 100 packed, default 50
  exploration: number; // 0 resort .. 100 explore, default 50
  destinationSlug?: string; // Path B only
}

export interface DestinationProfile {
  slug: string;
  name: string;
  country: string;
  flag: string; // emoji
  blurb: string; // one sentence, used on match cards
  vibes: Partial<Record<Vibe, 0 | 1 | 2 | 3>>; // strength of fit
  styles: ResortStyle[];
  budgetBands: (1 | 2 | 3 | 4 | 5)[]; // bands where a good trip is realistic
  hurricaneMonths: number[]; // 1-12, elevated risk
  bestMonths: number[];      // 1-12
  flags: Partial<Record<'seaweed' | 'party' | 'remote' | 'mega' | 'touristy' | 'cruise' | 'longtransfer' | 'quiet', boolean>>;
  nonstopEastCoast: boolean;
  typicalFlightHours: number; // from US east coast
  priceTier: 1 | 2 | 3; // $, $$, $$$
}

export interface MatchReason { text: string; source: keyof QuizAnswers; }
export interface Match {
  profile: DestinationProfile;
  pct: number; // 40-99
  reasons: MatchReason[]; // 3 to 5, each traceable to an answer
}
