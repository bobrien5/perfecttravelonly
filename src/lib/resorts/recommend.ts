import 'server-only';
import { isResortQuizState, matchResorts, type Recommendation, type TripAnswers } from '@vacationpro/engine';
import { ACTIVE_RESORTS, ageLabel, destinationName, getResortRecord } from './catalog';

/** What the browser receives: full records only for the picks, a light list for the rest. */
export interface RecommendationPayload {
  recommendations: Recommendation[];
  others: { id: string; name: string; destination: string; destinationName: string; age: string }[];
  eligibleCount: number;
  limitations: string[];
  context: { id: string; name: string; note: string } | null;
}

export function parseAnswers(answers: unknown): TripAnswers | null {
  return isResortQuizState({ step: 'results', answers, returnTo: null }) ? (answers as TripAnswers) : null;
}

export function recommendFor(answers: TripAnswers): RecommendationPayload {
  const result = matchResorts(answers, ACTIVE_RESORTS);
  const recIds = new Set(result.recommendations.map((r) => r.resort.id));
  const ctxId = answers.contextResortId ?? null;
  const others = result.rankedIds
    .filter((id) => !recIds.has(id))
    .slice(0, 8)
    .map((id) => getResortRecord(id)!)
    .map((r) => ({ id: r.id, name: r.name, destination: r.destination, destinationName: destinationName(r.destination), age: ageLabel(r) }));

  let context: RecommendationPayload['context'] = null;
  if (ctxId) {
    const r = getResortRecord(ctxId);
    if (r) {
      const excluded = result.excluded.find((e) => e.resort.id === ctxId);
      const rank = result.rankedIds.indexOf(ctxId);
      const note =
        r.status !== 'active'
          ? `: not currently offered. ${r.hiddenReason ?? ''}`
          : excluded
            ? `: not a match for this trip. ${excluded.reason}`
            : recIds.has(ctxId)
              ? ' made your top picks below.'
              : rank >= 0
                ? ` is an eligible option, ranked number ${rank + 1} of ${result.rankedIds.length} for your priorities.`
                : '.';
      context = { id: r.id, name: r.name, note };
      if (rank >= 0 && !recIds.has(ctxId) && !others.some((o) => o.id === ctxId)) {
        others.unshift({ id: r.id, name: r.name, destination: r.destination, destinationName: destinationName(r.destination), age: ageLabel(r) });
      }
    }
  }

  return {
    recommendations: result.recommendations,
    others,
    eligibleCount: result.rankedIds.length,
    limitations: result.limitations,
    context,
  };
}
