import QuizWizard from './QuizWizard';
import ResortQuiz from './resort/ResortQuiz';
import { getResortRecord, normalizeDestination } from '@/lib/resorts/catalog';

interface QuizPageProps {
  searchParams: Promise<{ claim?: string; destination?: string; resort?: string }>;
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const params = await searchParams;

  // /quiz?claim=1 is where Trip Hub sign-in links land (sent by the previous
  // quiz's save flow). The legacy wizard owns that claim, so existing links
  // keep working.
  if (params.claim === '1') return <QuizWizard />;

  // Only pass context we recognize: a known destination slug or resort id.
  const resort = params.resort ? getResortRecord(params.resort) : null;
  const destination = normalizeDestination(params.destination) ?? resort?.destination ?? null;
  return <ResortQuiz context={{ destination, resortId: resort?.id ?? null }} />;
}
