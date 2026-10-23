import { tripNights } from './budget';
import {
  CURRENCIES,
  TRIP_DEALBREAKERS,
  MAX_PRIORITIES,
  PRIORITIES,
  type TripDealbreaker,
  type Priority,
  type TripAnswers,
} from './types';

/**
 * Resort quiz state machine. Pure: the wizard component only renders the
 * current step and dispatches actions. Answers are never cleared by moving
 * backward, and "edit" from results jumps to a step and returns to results
 * on the next valid Continue, so a traveler can revise without restarting.
 */

export type StepId =
  | 'start'
  | 'destination'
  | 'travelers'
  | 'dates'
  | 'airport'
  | 'budget'
  | 'adults-only'
  | 'vibe'
  | 'priorities'
  | 'dealbreakers'
  | 'results';

export interface ResortQuizState {
  step: StepId;
  answers: TripAnswers;
  /** When set, a valid Continue returns here instead of the next step. */
  returnTo: 'results' | null;
}

export type ResortQuizAction =
  | { type: 'CHOOSE_ENTRY'; entry: 'discover' | 'known' }
  | { type: 'SET'; patch: Partial<TripAnswers> }
  | { type: 'SET_CHILD_COUNT'; count: number }
  | { type: 'SET_CHILD_AGE'; index: number; age: number }
  | { type: 'TOGGLE_PRIORITY'; priority: Priority }
  | { type: 'TOGGLE_DEALBREAKER'; dealbreaker: TripDealbreaker }
  | { type: 'NEXT'; today?: string }
  | { type: 'BACK' }
  | { type: 'EDIT'; step: StepId }
  | { type: 'HYDRATE'; state: ResortQuizState }
  | { type: 'RESET'; context?: QuizContext };

export interface QuizContext {
  destination?: string | null;
  resortId?: string | null;
}

export const MAX_ADULTS = 12;
export const MAX_CHILDREN = 8;
export const MAX_ROOMS = 6;
export const MAX_PER_ROOM = 5;
export const MAX_NIGHTS = 30;
export const MAX_NOTES = 600;
export const MIN_BUDGET = 300;
export const MAX_BUDGET = 250_000;

export function initialAnswers(context: QuizContext = {}): TripAnswers {
  return {
    version: 2,
    entry: context.destination ? 'known' : null,
    destination: context.destination ?? null,
    contextResortId: context.resortId ?? null,
    party: null,
    adults: 2,
    childAges: [],
    rooms: 1,
    dates: null,
    airport: null,
    budget: null,
    adultsOnly: null,
    atmosphere: null,
    priorities: [],
    dealbreakers: [],
    notes: '',
  };
}

export function initialQuizState(context: QuizContext = {}): ResortQuizState {
  return { step: 'start', answers: initialAnswers(context), returnTo: null };
}

/** The ordered steps that apply to these answers. */
export function stepOrder(a: TripAnswers): StepId[] {
  const steps: StepId[] = ['start'];
  if (a.entry === 'known') steps.push('destination');
  steps.push('travelers', 'dates', 'airport', 'budget');
  // Anyone traveling with children is matched on age eligibility instead.
  if (a.childAges.length === 0) steps.push('adults-only');
  steps.push('vibe', 'priorities', 'dealbreakers', 'results');
  return steps;
}

/** 1-based question number and total, for the progress bar. */
export function progressFor(state: ResortQuizState): { index: number; total: number } {
  const questions: StepId[] = stepOrder(state.answers).filter((s) => s !== 'start' && s !== 'results');
  return { index: Math.max(1, questions.indexOf(state.step) + 1), total: questions.length };
}

export type StepErrors = Partial<Record<string, string>>;

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Field-level errors for one step. An empty object means the step is complete. */
export function validateStep(step: StepId, a: TripAnswers, today: string = todayIso()): StepErrors {
  const e: StepErrors = {};
  switch (step) {
    case 'start':
      if (!a.entry) e.entry = 'Choose how you want to start.';
      break;
    case 'destination':
      if (!a.destination) e.destination = 'Pick a destination, or choose "Open to suggestions".';
      break;
    case 'travelers': {
      if (!a.party) e.party = 'Tell us who is traveling.';
      if (!Number.isInteger(a.adults) || a.adults < 1 || a.adults > MAX_ADULTS) {
        e.adults = `Between 1 and ${MAX_ADULTS} adults.`;
      }
      if (a.childAges.length > MAX_CHILDREN) e.children = `Up to ${MAX_CHILDREN} children.`;
      a.childAges.forEach((age, i) => {
        if (!Number.isInteger(age) || age < 0 || age > 17) e[`child-${i}`] = 'Choose an age.';
      });
      if (!Number.isInteger(a.rooms) || a.rooms < 1 || a.rooms > MAX_ROOMS) {
        e.rooms = `Between 1 and ${MAX_ROOMS} rooms.`;
      } else if (a.rooms > a.adults) {
        e.rooms = 'Each room needs at least one adult.';
      } else if ((a.adults + a.childAges.length) / a.rooms > MAX_PER_ROOM) {
        e.rooms = `That is more than ${MAX_PER_ROOM} people per room. Add a room.`;
      }
      if (a.party === 'solo' && (a.adults !== 1 || a.childAges.length > 0)) {
        e.party = 'Solo means one adult. Choose another option for a group.';
      }
      break;
    }
    case 'dates': {
      const d = a.dates;
      if (!d) {
        e.dates = 'Add dates, or choose a flexible month.';
        break;
      }
      if (d.mode === 'exact') {
        if (!isIsoDate(d.checkIn)) e.checkIn = 'Choose a check-in date.';
        if (!isIsoDate(d.checkOut)) e.checkOut = 'Choose a check-out date.';
        if (!e.checkIn && d.checkIn < today) e.checkIn = 'Check-in cannot be in the past.';
        if (!e.checkIn && !e.checkOut) {
          const n = tripNights(d);
          if (!n) e.checkOut = 'Check-out must be after check-in.';
          else if (n > MAX_NIGHTS) e.checkOut = `Trips up to ${MAX_NIGHTS} nights.`;
        }
      } else {
        if (d.month !== null) {
          if (!/^\d{4}-\d{2}$/.test(d.month)) e.month = 'Choose a month.';
          else if (d.month < today.slice(0, 7)) e.month = 'That month has passed.';
        }
        if (!Number.isInteger(d.nights) || d.nights < 1 || d.nights > MAX_NIGHTS) {
          e.nights = `Between 1 and ${MAX_NIGHTS} nights.`;
        }
      }
      break;
    }
    case 'airport':
      if (a.airport !== null && a.airport !== 'skip') {
        const t = a.airport.trim();
        if (t.length < 3 || t.length > 60) e.airport = 'Enter a city or airport code, or skip.';
      }
      break;
    case 'budget': {
      const b = a.budget;
      if (!b) {
        e.budget = 'Enter a budget, or choose "Not sure yet".';
        break;
      }
      if (!CURRENCIES.includes(b.currency)) e.currency = 'Choose a currency.';
      if (b.amount !== null) {
        if (!Number.isFinite(b.amount) || b.amount < MIN_BUDGET || b.amount > MAX_BUDGET) {
          e.amount = `Enter a total between ${MIN_BUDGET.toLocaleString('en-US')} and ${MAX_BUDGET.toLocaleString('en-US')}.`;
        }
        if (b.includesFlights === null) e.includesFlights = 'Does this budget include flights?';
      }
      break;
    }
    case 'adults-only':
      if (!a.adultsOnly) e.adultsOnly = 'Choose one.';
      break;
    case 'vibe':
      if (!a.atmosphere) e.atmosphere = 'Choose the vibe you want, or "Not sure".';
      break;
    case 'priorities':
      if (a.priorities.length === 0) e.priorities = 'Pick at least one priority.';
      if (a.priorities.length > MAX_PRIORITIES) e.priorities = `Pick up to ${MAX_PRIORITIES}.`;
      break;
    case 'dealbreakers':
      if (a.notes.length > MAX_NOTES) e.notes = `Keep notes under ${MAX_NOTES} characters.`;
      break;
    case 'results':
      break;
  }
  return e;
}

/** First step (in order) that is incomplete, or null when everything is valid. */
export function firstIncompleteStep(a: TripAnswers, today?: string): StepId | null {
  for (const s of stepOrder(a)) {
    if (s === 'results') return null;
    if (Object.keys(validateStep(s, a, today)).length > 0) return s;
  }
  return null;
}

export function resortQuizReducer(state: ResortQuizState, action: ResortQuizAction): ResortQuizState {
  const a = state.answers;
  switch (action.type) {
    case 'CHOOSE_ENTRY': {
      const destination =
        action.entry === 'discover' ? 'open' : a.destination === 'open' ? null : a.destination;
      return { ...state, answers: { ...a, entry: action.entry, destination } };
    }

    case 'SET': {
      const next = { ...a, ...action.patch };
      if (next.party === 'solo') {
        next.adults = 1;
        next.childAges = [];
        next.rooms = 1;
      }
      return { ...state, answers: next };
    }

    case 'SET_CHILD_COUNT': {
      const count = Math.max(0, Math.min(MAX_CHILDREN, Math.floor(action.count)));
      // Keep ages already entered; new slots start unset (-1) so validation
      // asks for them instead of silently assuming an age.
      const childAges = Array.from({ length: count }, (_, i) => a.childAges[i] ?? -1);
      // Adults-only no longer applies with children; drop a stale "yes".
      const adultsOnly = count > 0 && a.adultsOnly === 'yes' ? null : a.adultsOnly;
      return { ...state, answers: { ...a, childAges, adultsOnly } };
    }

    case 'SET_CHILD_AGE': {
      if (action.index < 0 || action.index >= a.childAges.length) return state;
      const childAges = a.childAges.map((v, i) => (i === action.index ? action.age : v));
      return { ...state, answers: { ...a, childAges } };
    }

    case 'TOGGLE_PRIORITY': {
      const has = a.priorities.includes(action.priority);
      if (!has && a.priorities.length >= MAX_PRIORITIES) return state;
      const priorities = has
        ? a.priorities.filter((p) => p !== action.priority)
        : [...a.priorities, action.priority];
      return { ...state, answers: { ...a, priorities } };
    }

    case 'TOGGLE_DEALBREAKER': {
      const has = a.dealbreakers.includes(action.dealbreaker);
      const dealbreakers = has
        ? a.dealbreakers.filter((d) => d !== action.dealbreaker)
        : [...a.dealbreakers, action.dealbreaker];
      return { ...state, answers: { ...a, dealbreakers } };
    }

    case 'NEXT': {
      if (Object.keys(validateStep(state.step, a, action.today)).length > 0) return state;
      const order = stepOrder(a);
      if (state.returnTo === 'results') {
        // Only return once every step is still valid (an edit can open a new
        // step, e.g. removing children re-enables the adults-only question).
        const missing = firstIncompleteStep(a, action.today);
        if (missing) return { ...state, step: missing };
        return { ...state, step: 'results', returnTo: null };
      }
      const i = order.indexOf(state.step);
      return { ...state, step: order[Math.min(i + 1, order.length - 1)] };
    }

    case 'BACK': {
      if (state.returnTo === 'results') return { ...state, step: 'results', returnTo: null };
      const order = stepOrder(a);
      const i = order.indexOf(state.step);
      return { ...state, step: order[Math.max(i - 1, 0)] };
    }

    case 'EDIT':
      if (!stepOrder(a).includes(action.step)) return state;
      return { ...state, step: action.step, returnTo: action.step === 'results' ? null : 'results' };

    case 'HYDRATE':
      return action.state;

    case 'RESET':
      return initialQuizState(action.context);

    default:
      return state;
  }
}

export const RESORT_QUIZ_STORAGE_KEY = 'vacationpro.resortquiz.v2';

/** Shape guard for state read back from localStorage. */
export function isResortQuizState(v: unknown): v is ResortQuizState {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  const a = s.answers as Record<string, unknown> | undefined;
  if (typeof s.step !== 'string' || !a || typeof a !== 'object') return false;
  if (a.version !== 2) return false;
  if (!Array.isArray(a.childAges) || !Array.isArray(a.priorities) || !Array.isArray(a.dealbreakers)) return false;
  if (typeof a.adults !== 'number' || typeof a.rooms !== 'number' || typeof a.notes !== 'string') return false;
  if (!(a.priorities as unknown[]).every((p) => PRIORITIES.includes(p as Priority))) return false;
  if (!(a.dealbreakers as unknown[]).every((d) => TRIP_DEALBREAKERS.includes(d as TripDealbreaker))) return false;
  const steps: StepId[] = ['start', 'destination', 'travelers', 'dates', 'airport', 'budget', 'adults-only', 'vibe', 'priorities', 'dealbreakers', 'results'];
  return steps.includes(s.step as StepId);
}

export function serializeQuiz(state: ResortQuizState): string {
  return JSON.stringify(state);
}

export function deserializeQuiz(raw: string | null): ResortQuizState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isResortQuizState(parsed)) return null;
    return { ...parsed, returnTo: parsed.returnTo === 'results' ? 'results' : null };
  } catch {
    return null;
  }
}
