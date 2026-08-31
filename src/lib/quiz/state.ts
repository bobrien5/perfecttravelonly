import { Dealbreaker, Party, QuizAnswers, ResortStyle, Vibe } from '@/lib/match/types';
import { dealbreakersFor, stylesFor, vibeTilesFor } from '@/lib/quiz/variants';

export interface QuizState {
  step: number; // 0 = welcome, 1..8 = questions, 9 = matches
  answers: QuizAnswers;
}

export type QuizAction =
  | { type: 'SET_PARTY'; party: Party }
  | { type: 'SET_KIDS'; count?: QuizAnswers['kidsCount']; ages?: QuizAnswers['kidsAges'] }
  | { type: 'SET_ORIGIN'; origin: QuizAnswers['origin'] }
  | { type: 'SET_DATES'; dates: QuizAnswers['dates'] }
  | { type: 'SET_BUDGET'; budget: QuizAnswers['budget'] }
  | { type: 'TOGGLE_VIBE'; vibe: Vibe }
  | { type: 'TOGGLE_STYLE'; style: ResortStyle | 'nopref' }
  | { type: 'TOGGLE_DEALBREAKER'; db: Dealbreaker }
  | { type: 'CLEAR_DEALBREAKERS' }
  | { type: 'SET_SLIDERS'; pace: number; exploration: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SET_PATH'; path: 'discover' | 'known'; destinationSlug?: string }
  | { type: 'SET_OCCASION'; occasion?: string }
  | { type: 'HYDRATE'; state: QuizState };

const MAX_VIBES = 5;
const STORAGE_KEY = 'vacationpro.quiz.v1';

export function initialAnswers(): QuizAnswers {
  return {
    path: 'discover',
    party: null,
    origin: null,
    dates: null,
    budget: null,
    vibes: [],
    styles: [],
    dealbreakers: [],
    pace: 50,
    exploration: 50,
  };
}

function pruneForParty(answers: QuizAnswers, party: Party): QuizAnswers {
  const allowedVibes = new Set(vibeTilesFor(party).map((t) => t.vibe));
  const allowedStyles = new Set(stylesFor(party).map((t) => t.style));
  const allowedDealbreakers = new Set(dealbreakersFor(party).map((t) => t.db));

  return {
    ...answers,
    party,
    vibes: answers.vibes.filter((v) => allowedVibes.has(v)),
    styles: answers.styles.filter((s) => s === 'nopref' || allowedStyles.has(s)),
    dealbreakers: answers.dealbreakers.filter((d) => allowedDealbreakers.has(d)),
  };
}

function isScreenComplete(step: number, answers: QuizAnswers): boolean {
  if (answers.path === 'known') {
    // Known-path screen order (1..4): 1 destination, 2 dates, 3 party, 4 vibes.
    // Required: destination, party, vibes. Skippable: dates (consistent with discover path).
    switch (step) {
      case 1:
        return answers.destinationSlug != null;
      case 3:
        return answers.party !== null;
      case 4:
        return answers.vibes.length > 0;
      default:
        return true;
    }
  }

  // Required: party, budget, vibes, styles. Skippable: origin, dates, dealbreakers, sliders.
  // Screen order (1..8) maps to: 1 party, 2 origin, 3 dates, 4 budget, 5 vibes, 6 styles, 7 dealbreakers, 8 sliders.
  switch (step) {
    case 1:
      return answers.party !== null;
    case 4:
      return answers.budget !== null;
    case 5:
      return answers.vibes.length > 0;
    case 6:
      return answers.styles.length > 0;
    default:
      return true;
  }
}

const KNOWN_PATH_MAX_STEP = 4;
const DISCOVER_PATH_MAX_STEP = 9;

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  const { step, answers } = state;

  switch (action.type) {
    case 'SET_PARTY':
      return { ...state, answers: pruneForParty(answers, action.party) };

    case 'SET_KIDS':
      return {
        ...state,
        answers: { ...answers, kidsCount: action.count, kidsAges: action.ages },
      };

    case 'SET_ORIGIN':
      return { ...state, answers: { ...answers, origin: action.origin } };

    case 'SET_DATES':
      return { ...state, answers: { ...answers, dates: action.dates } };

    case 'SET_BUDGET':
      return { ...state, answers: { ...answers, budget: action.budget } };

    case 'TOGGLE_VIBE': {
      const has = answers.vibes.includes(action.vibe);
      let vibes: Vibe[];
      if (has) {
        vibes = answers.vibes.filter((v) => v !== action.vibe);
      } else if (answers.vibes.length >= MAX_VIBES) {
        vibes = answers.vibes; // capped, ignore 6th+ tap
      } else {
        vibes = [...answers.vibes, action.vibe];
      }
      return { ...state, answers: { ...answers, vibes } };
    }

    case 'TOGGLE_STYLE': {
      const { style } = action;
      const has = answers.styles.includes(style);
      let styles: (ResortStyle | 'nopref')[];

      if (style === 'nopref') {
        styles = has ? [] : ['nopref'];
      } else if (has) {
        styles = answers.styles.filter((s) => s !== style);
      } else {
        // Selecting a real style clears 'nopref' (mutual exclusion).
        styles = [...answers.styles.filter((s) => s !== 'nopref'), style];
      }

      return { ...state, answers: { ...answers, styles } };
    }

    case 'TOGGLE_DEALBREAKER': {
      const has = answers.dealbreakers.includes(action.db);
      const dealbreakers = has
        ? answers.dealbreakers.filter((d) => d !== action.db)
        : [...answers.dealbreakers, action.db];
      return { ...state, answers: { ...answers, dealbreakers } };
    }

    case 'CLEAR_DEALBREAKERS':
      return { ...state, answers: { ...answers, dealbreakers: [] } };

    case 'SET_SLIDERS':
      return { ...state, answers: { ...answers, pace: action.pace, exploration: action.exploration } };

    case 'NEXT': {
      if (!isScreenComplete(step, answers)) return state;
      const maxStep = answers.path === 'known' ? KNOWN_PATH_MAX_STEP : DISCOVER_PATH_MAX_STEP;
      return { ...state, step: Math.min(step + 1, maxStep) };
    }

    case 'BACK':
      return { ...state, step: Math.max(step - 1, 0) };

    case 'SET_PATH':
      return {
        ...state,
        answers: {
          ...answers,
          path: action.path,
          // Discover path never carries a chosen destination; always clear it
          // (even if a stale one lingers from a prior known-path detour) so
          // NEXT's step cap and isScreenComplete cannot mistake this for the
          // known-path sequence.
          destinationSlug: action.path === 'discover' ? undefined : action.destinationSlug,
        },
      };

    case 'SET_OCCASION':
      return { ...state, answers: { ...answers, occasion: action.occasion } };

    case 'HYDRATE':
      return action.state;

    default:
      return state;
  }
}

export function saveQuiz(state: QuizState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private browsing, quota, etc.), so no-op.
  }
}

export function loadQuiz(): QuizState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuizState;
  } catch {
    return null;
  }
}
