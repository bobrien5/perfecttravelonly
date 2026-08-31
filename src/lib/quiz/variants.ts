import { Dealbreaker, Party, QuizAnswers, ResortStyle, Vibe } from '@/lib/match/types';

export interface VibeTile { vibe: Vibe; emoji: string; label: string; }
export interface DealbreakerTile { db: Dealbreaker; label: string; }
export interface StyleTile { style: ResortStyle | 'nopref'; emoji: string; label: string; }

const VIBE_LABELS: Record<Vibe, { emoji: string; label: string }> = {
  beach: { emoji: '🏝️', label: 'Amazing beach' },
  pool: { emoji: '🍹', label: 'Lively pool' },
  luxury: { emoji: '✨', label: 'Luxury' },
  value: { emoji: '💰', label: 'Great value' },
  food: { emoji: '🍴', label: 'Great food' },
  nightlife: { emoji: '🥂', label: 'Nightlife' },
  romantic: { emoji: '❤️', label: 'Romantic' },
  snorkeling: { emoji: '🤿', label: 'Snorkeling' },
  nature: { emoji: '🌿', label: 'Nature' },
  relaxing: { emoji: '🧘', label: 'Relaxing' },
  entertainment: { emoji: '🎶', label: 'Entertainment' },
  explore: { emoji: '🏙️', label: 'Things to explore nearby' },
  kids: { emoji: '👨‍👩‍👧', label: 'Great for kids' },
  kidsclub: { emoji: '🧒', label: 'Kids club' },
  waterpark: { emoji: '💦', label: 'Water park' },
  easytravel: { emoji: '🛫', label: 'Easy travel' },
  familysuites: { emoji: '🛏️', label: 'Family suites' },
  privatepools: { emoji: '🏊', label: 'Private pools' },
  seclusion: { emoji: '🌙', label: 'Seclusion' },
};

function tile(vibe: Vibe): VibeTile {
  return { vibe, ...VIBE_LABELS[vibe] };
}

// Base 12 tiles shared by couple/solo/friends.
const BASE_VIBES: Vibe[] = [
  'beach', 'pool', 'luxury', 'value', 'food', 'nightlife', 'romantic',
  'snorkeling', 'nature', 'relaxing', 'entertainment', 'explore',
];

export function vibeTilesFor(party: Party): VibeTile[] {
  let order: Vibe[];

  switch (party) {
    case 'family': {
      const rest = BASE_VIBES.filter((v) => v !== 'romantic' && v !== 'nightlife');
      order = ['kids', ...rest, 'kidsclub', 'waterpark', 'easytravel', 'familysuites'];
      break;
    }
    case 'honeymoon': {
      const pinned: Vibe[] = ['romantic', 'privatepools', 'beach', 'luxury', 'seclusion'];
      const rest = BASE_VIBES.filter((v) => !pinned.includes(v));
      order = [...pinned, ...rest];
      break;
    }
    case 'friends': {
      const pinned: Vibe[] = ['nightlife', 'pool', 'entertainment', 'value'];
      const rest = BASE_VIBES.filter((v) => !pinned.includes(v));
      order = [...pinned, ...rest];
      break;
    }
    case 'solo': {
      const pinned: Vibe[] = ['relaxing', 'nature', 'snorkeling', 'easytravel'];
      const rest = BASE_VIBES.filter((v) => !pinned.includes(v));
      order = [...pinned, ...rest];
      break;
    }
    case 'celebration': {
      const pinned: Vibe[] = ['nightlife', 'entertainment', 'food', 'pool'];
      const rest = BASE_VIBES.filter((v) => !pinned.includes(v));
      order = [...pinned, ...rest];
      break;
    }
    case 'couple':
    default:
      order = BASE_VIBES;
      break;
  }

  return order.map(tile);
}

const DEALBREAKER_LABELS: Record<Dealbreaker, string> = {
  tooquiet: 'Too quiet',
  party: 'Party resort',
  kids: 'Lots of kids',
  longtransfer: 'Long airport transfer',
  seaweed: 'Seaweed-prone beach',
  mega: 'Mega resort',
  remote: 'Remote destination',
  connection: 'Connecting flight',
  cruise: 'Cruise crowds',
  touristy: 'Very touristy',
};

const BASE_DEALBREAKERS: Dealbreaker[] = [
  'tooquiet', 'party', 'kids', 'longtransfer', 'seaweed',
  'mega', 'remote', 'connection', 'cruise', 'touristy',
];

export function dealbreakersFor(party: Party): DealbreakerTile[] {
  let order: Dealbreaker[] = BASE_DEALBREAKERS;

  if (party === 'family') {
    // Hide "lots of kids" as a dealbreaker for families; lead with
    // "party resort" then "long airport transfer".
    const rest = BASE_DEALBREAKERS.filter(
      (db) => db !== 'kids' && db !== 'party' && db !== 'longtransfer'
    );
    order = ['party', 'longtransfer', ...rest];
  } else if (party === 'honeymoon') {
    // Lead with "lots of kids" then "party resort".
    const rest = BASE_DEALBREAKERS.filter((db) => db !== 'kids' && db !== 'party');
    order = ['kids', 'party', ...rest];
  } else if (party === 'friends' || party === 'celebration') {
    // Lead with "too quiet".
    const rest = BASE_DEALBREAKERS.filter((db) => db !== 'tooquiet');
    order = ['tooquiet', ...rest];
  }

  return order.map((db) => ({ db, label: DEALBREAKER_LABELS[db] }));
}

const STYLE_LABELS: Record<ResortStyle, { emoji: string; label: string }> = {
  allinclusive: { emoji: '🌴', label: 'All-inclusive' },
  luxuryresort: { emoji: '🏨', label: 'Luxury resort' },
  boutique: { emoji: '🏡', label: 'Boutique hotel' },
  beachfront: { emoji: '🌊', label: 'Beachfront' },
  adultsonly: { emoji: '🍸', label: 'Adults-only' },
  familyresort: { emoji: '👨‍👩‍👧‍👦', label: 'Family resort' },
  nearnightlife: { emoji: '🏙️', label: 'Near restaurants and nightlife' },
};

const BASE_STYLES: ResortStyle[] = [
  'allinclusive', 'luxuryresort', 'boutique', 'beachfront',
  'adultsonly', 'familyresort', 'nearnightlife',
];

export function stylesFor(party: Party): StyleTile[] {
  let order = BASE_STYLES;

  if (party === 'family') {
    const rest = BASE_STYLES.filter((s) => s !== 'adultsonly' && s !== 'familyresort');
    order = ['familyresort', ...rest];
  } else if (party === 'honeymoon') {
    order = BASE_STYLES.filter((s) => s !== 'familyresort');
  }

  return order.map((style) => ({ style, ...STYLE_LABELS[style] }));
}

function nightsFromDates(dates: QuizAnswers['dates']): number {
  if (dates && 'start' in dates && 'end' in dates) {
    const start = new Date(`${dates.start}T00:00:00Z`);
    const end = new Date(`${dates.end}T00:00:00Z`);
    const diffMs = end.getTime() - start.getTime();
    const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (Number.isFinite(nights) && nights > 0) return nights;
  }
  return 5;
}

export function travelerLabel(answers: QuizAnswers): string {
  const nights = nightsFromDates(answers.dates);
  const party = answers.party;

  let travelers: string;
  if (party === 'couple' || party === 'honeymoon') {
    travelers = '2 travelers';
  } else if (party === 'solo') {
    travelers = '1 traveler';
  } else if (party === 'family') {
    const kidsCount = answers.kidsCount === '3+' ? 3 : answers.kidsCount ? Number(answers.kidsCount) : 0;
    const total = 2 + kidsCount;
    travelers = `${total} travelers`;
  } else {
    // friends, celebration
    travelers = 'per person';
  }

  return `${travelers} · ${nights} nights`;
}
