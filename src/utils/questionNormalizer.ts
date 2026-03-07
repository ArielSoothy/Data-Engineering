import type { UnifiedQuestion, QuestionSource, Subject, Difficulty } from '../types/studyHub';
import type { CategoryProgress } from '../context/AppContext';

// --- Raw JSON shapes ---

interface RawStandardQuestion {
  id: number;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeEstimate: number;
  answer: string;
  pseudoCode?: string;
  aiApproach?: string;
}

interface RawMetaQuestion {
  id: number;
  question: string;
  category: 'sql' | 'python';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeEstimate: number;
  hints?: string[];
  answer: string;
  pseudoCode?: string;
  explanation?: string;
  tags?: string[];
}

interface RawDrillCard {
  id: number;
  cat: string;
  topic: string;
  q: string;
  a: string;
  difficulty: number;
}

// --- Source configs ---

interface SourceConfig {
  source: QuestionSource;
  subject: Subject;
  progressKey: keyof CategoryProgress;
  filePath: string;
}

export const SOURCE_CONFIGS: SourceConfig[] = [
  { source: 'sqlBasics',      subject: 'sql',    progressKey: 'sqlBasics',      filePath: '/data/sql-basics.json' },
  { source: 'sqlAdvanced',    subject: 'sql',    progressKey: 'sqlAdvanced',    filePath: '/data/sql-advanced.json' },
  { source: 'pythonBasics',   subject: 'python', progressKey: 'pythonBasics',   filePath: '/data/python-basics.json' },
  { source: 'pythonAdvanced', subject: 'python', progressKey: 'pythonAdvanced', filePath: '/data/python-advanced.json' },
  { source: 'metaOfficial',   subject: 'sql',    progressKey: 'metaOfficial',   filePath: '/data/meta-official.json' },
  { source: 'quickDrill',     subject: 'sql',    progressKey: 'sqlBasics',      filePath: '/data/quick-drill-cards.json' },
];

// --- Normalizers ---

function normalizeStandard(
  questions: RawStandardQuestion[],
  source: QuestionSource,
  subject: Subject,
  progressKey: keyof CategoryProgress,
): UnifiedQuestion[] {
  return questions.map(q => ({
    uid: `${source}:${q.id}`,
    sourceId: q.id,
    source,
    question: q.question,
    answer: q.answer,
    subject,
    difficulty: q.difficulty,
    timeEstimate: q.timeEstimate,
    pseudoCode: q.pseudoCode,
    progressKey,
    progressId: q.id,
  }));
}

function normalizeMeta(questions: RawMetaQuestion[]): UnifiedQuestion[] {
  return questions.map(q => ({
    uid: `metaOfficial:${q.id}`,
    sourceId: q.id,
    source: 'metaOfficial' as QuestionSource,
    question: q.question,
    answer: q.answer,
    subject: q.category as Subject,
    difficulty: q.difficulty,
    timeEstimate: q.timeEstimate,
    pseudoCode: q.pseudoCode,
    topic: q.tags?.[0],
    tags: q.tags,
    hints: q.hints,
    progressKey: 'metaOfficial',
    progressId: q.id,
  }));
}

const DRILL_DIFF_MAP: Record<number, Difficulty> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

function normalizeDrill(cards: RawDrillCard[]): UnifiedQuestion[] {
  return cards.map(c => ({
    uid: `quickDrill:${c.id}`,
    sourceId: c.id,
    source: 'quickDrill' as QuestionSource,
    question: c.q,
    answer: c.a,
    subject: (c.cat.toLowerCase() === 'python' ? 'python' : 'sql') as Subject,
    difficulty: DRILL_DIFF_MAP[c.difficulty] || 'Medium',
    timeEstimate: 2,
    topic: c.topic,
    // Quick Drill uses its own progress system, not AppContext
    progressKey: 'sqlBasics', // placeholder — actual progress is in quick_drill_progress
    progressId: c.id,
  }));
}

// --- Main normalize function ---

export async function fetchAndNormalize(config: SourceConfig): Promise<UnifiedQuestion[]> {
  const res = await fetch(`.${config.filePath}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${config.filePath}`);
  const json = await res.json();

  if (config.source === 'quickDrill') {
    return normalizeDrill(json as RawDrillCard[]);
  }

  if (config.source === 'metaOfficial') {
    const questions = json.questions || json;
    return normalizeMeta(questions as RawMetaQuestion[]);
  }

  // Standard question files (sql-basics, sql-advanced, python-basics, python-advanced)
  const questions = json.questions || json;
  return normalizeStandard(
    questions as RawStandardQuestion[],
    config.source,
    config.subject,
    config.progressKey,
  );
}

export async function fetchAllQuestions(): Promise<UnifiedQuestion[]> {
  const results = await Promise.all(
    SOURCE_CONFIGS.map(config =>
      fetchAndNormalize(config).catch(err => {
        console.warn(`[StudyHub] Failed to load ${config.source}:`, err);
        return [] as UnifiedQuestion[];
      })
    )
  );
  return results.flat();
}
