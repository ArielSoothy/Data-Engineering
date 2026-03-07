import { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart3, Brain, Target, Zap, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '../ui';
import { useAppContext } from '../../context/AppContext';
import { CATEGORY_TOTALS, INTERVIEW_DATE } from '../../config';
import { generateFeedback } from '../../services/aiService';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SkillBreakdown {
  name: string;
  score: number; // 0-100
  attempted: number;
  total: number;
}

interface ReadinessReport {
  overall: number;
  sql: number;
  python: number;
  sqlSkills: SkillBreakdown[];
  pythonSkills: SkillBreakdown[];
  weakAreas: string[];
  strengths: string[];
  daysRemaining: number;
  pace: 'ahead' | 'on_track' | 'behind';
  recommendation: string;
}

interface QuizQuestion {
  id: number;
  category: 'sql' | 'python';
  question: string;
  difficulty: string;
}

interface QuizAnswer {
  questionId: number;
  answer: string;
  timeSpent: number;
}

interface AssessmentHistory {
  date: string;
  overall: number;
  sql: number;
  python: number;
}

type AssessmentPhase = 'overview' | 'quiz' | 'grading' | 'report';

const HISTORY_KEY = 'daily_assessment_history';
const QUIZ_TIME_LIMIT = 120; // 2 min per question

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDaysRemaining(): number {
  const now = new Date();
  const diff = INTERVIEW_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getProgressData(): { category: string; completed: number; total: number }[] {
  const progress = JSON.parse(localStorage.getItem('msInterviewProgress') || '{}');
  return Object.entries(CATEGORY_TOTALS).map(([key, total]) => {
    const items = progress[key] || [];
    const completed = Array.isArray(items) ? items.filter((q: { completed?: boolean }) => q.completed).length : 0;
    return { category: key, completed, total };
  });
}

function calculateReadiness(): ReadinessReport {
  const data = getProgressData();
  const daysRemaining = getDaysRemaining();

  // SQL score
  const sqlBasics = data.find(d => d.category === 'sqlBasics');
  const sqlAdvanced = data.find(d => d.category === 'sqlAdvanced');
  const metaOfficial = data.find(d => d.category === 'metaOfficial');

  const sqlBasicsPct = sqlBasics ? (sqlBasics.completed / Math.max(sqlBasics.total, 1)) * 100 : 0;
  const sqlAdvancedPct = sqlAdvanced ? (sqlAdvanced.completed / Math.max(sqlAdvanced.total, 1)) * 100 : 0;
  const metaOfficialPct = metaOfficial ? (metaOfficial.completed / Math.max(metaOfficial.total, 1)) * 100 : 0;
  const sqlScore = Math.round(sqlBasicsPct * 0.3 + sqlAdvancedPct * 0.4 + metaOfficialPct * 0.3);

  // Python score
  const pyBasics = data.find(d => d.category === 'pythonBasics');
  const pyAdvanced = data.find(d => d.category === 'pythonAdvanced');
  const pyBasicsPct = pyBasics ? (pyBasics.completed / Math.max(pyBasics.total, 1)) * 100 : 0;
  const pyAdvancedPct = pyAdvanced ? (pyAdvanced.completed / Math.max(pyAdvanced.total, 1)) * 100 : 0;
  const pythonScore = Math.round(pyBasicsPct * 0.4 + pyAdvancedPct * 0.6);

  // Overall: SQL 50%, Python 30%, completion 20%
  const totalCompleted = data.reduce((s, d) => s + d.completed, 0);
  const totalQuestions = data.reduce((s, d) => s + d.total, 0);
  const completionPct = totalQuestions > 0 ? (totalCompleted / totalQuestions) * 100 : 0;
  const overall = Math.round(sqlScore * 0.5 + pythonScore * 0.3 + completionPct * 0.2);

  // Skills breakdown
  const sqlSkills: SkillBreakdown[] = [
    { name: 'SQL Basics', score: Math.round(sqlBasicsPct), attempted: sqlBasics?.completed || 0, total: sqlBasics?.total || 0 },
    { name: 'SQL Advanced', score: Math.round(sqlAdvancedPct), attempted: sqlAdvanced?.completed || 0, total: sqlAdvanced?.total || 0 },
    { name: 'Meta Official (SQL)', score: Math.round(metaOfficialPct), attempted: metaOfficial?.completed || 0, total: metaOfficial?.total || 0 },
  ];

  const pythonSkills: SkillBreakdown[] = [
    { name: 'Python Basics', score: Math.round(pyBasicsPct), attempted: pyBasics?.completed || 0, total: pyBasics?.total || 0 },
    { name: 'Python Advanced', score: Math.round(pyAdvancedPct), attempted: pyAdvanced?.completed || 0, total: pyAdvanced?.total || 0 },
  ];

  // Identify weak areas and strengths
  const allSkills = [...sqlSkills, ...pythonSkills];
  const weakAreas = allSkills.filter(s => s.score < 50).map(s => `${s.name} (${s.score}%)`);
  const strengths = allSkills.filter(s => s.score >= 70).map(s => `${s.name} (${s.score}%)`);

  // Pace calculation
  const totalDays = 24;
  const daysPassed = totalDays - daysRemaining;
  const expectedPct = daysPassed > 0 ? (daysPassed / totalDays) * 100 : 0;
  const pace = overall >= expectedPct + 10 ? 'ahead' : overall >= expectedPct - 10 ? 'on_track' : 'behind';

  // Recommendation
  const lowestSkill = allSkills.reduce((min, s) => s.score < min.score ? s : min, allSkills[0]);
  const recommendation = lowestSkill
    ? `Focus on ${lowestSkill.name} — currently at ${lowestSkill.score}% (${lowestSkill.attempted}/${lowestSkill.total} completed)`
    : 'Keep up the practice!';

  return { overall, sql: sqlScore, python: pythonScore, sqlSkills, pythonSkills, weakAreas, strengths, daysRemaining, pace, recommendation };
}

function getAssessmentHistory(): AssessmentHistory[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAssessmentHistory(entry: AssessmentHistory) {
  const history = getAssessmentHistory();
  // Replace today's entry if exists
  const today = entry.date;
  const filtered = history.filter(h => h.date !== today);
  filtered.push(entry);
  // Keep last 30 days
  const sorted = filtered.sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sorted));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const DailyAssessment = () => {
  const { getCategoryProgress } = useAppContext();
  const [phase, setPhase] = useState<AssessmentPhase>('overview');
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizTimer, setQuizTimer] = useState(QUIZ_TIME_LIMIT);
  const [aiGrading, setAiGrading] = useState('');
  const [, setQuizStartTime] = useState(Date.now());
  const history = useMemo(() => getAssessmentHistory(), []);

  // Generate report on mount
  useEffect(() => {
    setReport(calculateReadiness());
  }, [getCategoryProgress]);

  // Quiz timer
  useEffect(() => {
    if (phase !== 'quiz') return;
    const interval = setInterval(() => {
      setQuizTimer(prev => {
        if (prev <= 1) {
          // Auto-submit on timeout
          handleQuizNext(true);
          return QUIZ_TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, quizIndex]);

  const generateQuiz = useCallback(async () => {
    setPhase('quiz');
    setQuizIndex(0);
    setQuizAnswer('');
    setQuizAnswers([]);
    setQuizTimer(QUIZ_TIME_LIMIT);
    setQuizStartTime(Date.now());

    // Generate 5 quick assessment questions via AI
    try {
      const weakAreas = report?.weakAreas.join(', ') || 'general SQL and Python';
      const prompt = `Generate exactly 5 quick interview assessment questions for a Meta Data Engineer candidate.
Focus on weak areas: ${weakAreas}.
Format: 3 SQL questions + 2 Python questions.
Each question should be answerable in under 2 minutes.
Return ONLY a JSON array with objects: {"id": number, "category": "sql"|"python", "question": "...", "difficulty": "Easy"|"Medium"|"Hard"}
No markdown, no explanation, just the JSON array.`;

      const response = await generateFeedback(prompt, 'Generate quiz questions', 'Return JSON array only');
      try {
        // Extract JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0]) as QuizQuestion[];
          setQuizQuestions(questions.slice(0, 5));
          return;
        }
      } catch {
        // Parse failed, use fallback
      }
    } catch {
      // AI failed, use fallback
    }

    // Fallback questions if AI fails
    setQuizQuestions([
      { id: 1, category: 'sql', question: 'Write a query to find the second highest salary from an employees table.', difficulty: 'Medium' },
      { id: 2, category: 'sql', question: 'What is the difference between WHERE and HAVING? Give an example of each.', difficulty: 'Easy' },
      { id: 3, category: 'sql', question: 'Write a query using LAG() to find day-over-day revenue change from a sales table.', difficulty: 'Medium' },
      { id: 4, category: 'python', question: 'Write a function to find the most frequent element in a list. Handle ties by returning the first one found.', difficulty: 'Easy' },
      { id: 5, category: 'python', question: 'Write a function that takes a list of intervals [(start, end)] and returns the maximum number of overlapping intervals.', difficulty: 'Medium' },
    ]);
  }, [report]);

  const handleQuizNext = useCallback((timedOut = false) => {
    const timeSpent = QUIZ_TIME_LIMIT - quizTimer;
    const answer: QuizAnswer = {
      questionId: quizQuestions[quizIndex]?.id || 0,
      answer: timedOut ? '(timed out)' : quizAnswer,
      timeSpent,
    };

    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);

    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex(quizIndex + 1);
      setQuizAnswer('');
      setQuizTimer(QUIZ_TIME_LIMIT);
      setQuizStartTime(Date.now());
    } else {
      // Quiz complete — grade with AI
      gradeQuiz(newAnswers);
    }
  }, [quizIndex, quizQuestions, quizAnswer, quizAnswers, quizTimer]);

  const gradeQuiz = useCallback(async (answers: QuizAnswer[]) => {
    setPhase('grading');

    const questionsWithAnswers = quizQuestions.map((q, i) => ({
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      userAnswer: answers[i]?.answer || '(no answer)',
      timeSpent: answers[i]?.timeSpent || 0,
    }));

    try {
      const prompt = `Grade these Meta Data Engineer interview assessment answers. Be concise.
For each answer, give: score (0-10), brief feedback (1 sentence).
Then give an overall assessment with:
- Overall score out of 50
- Key strength (1 sentence)
- Key weakness to work on (1 sentence)
- One specific drill recommendation

Questions and answers:
${questionsWithAnswers.map((qa, i) => `Q${i + 1} (${qa.category}, ${qa.difficulty}): ${qa.question}\nAnswer (${qa.timeSpent}s): ${qa.userAnswer}`).join('\n\n')}`;

      const grading = await generateFeedback(prompt, 'Grade these answers', 'Provide scores and feedback');
      setAiGrading(grading);
    } catch {
      setAiGrading('AI grading unavailable. Review your answers manually against the question requirements.');
    }

    // Save to history
    if (report) {
      saveAssessmentHistory({
        date: new Date().toISOString().split('T')[0],
        overall: report.overall,
        sql: report.sql,
        python: report.python,
      });
    }

    setPhase('report');
  }, [quizQuestions, report]);

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600" />
        <p className="mt-2 text-gray-500">Calculating readiness...</p>
      </div>
    );
  }

  /* ========================== OVERVIEW ========================== */
  if (phase === 'overview') {
    const paceColors = { ahead: 'text-green-600 dark:text-green-400', on_track: 'text-blue-600 dark:text-blue-400', behind: 'text-red-600 dark:text-red-400' };
    const paceLabels = { ahead: 'Ahead of schedule', on_track: 'On track', behind: 'Behind schedule' };
    const readinessColor = report.overall >= 70 ? 'green' : report.overall >= 40 ? 'yellow' : 'red';

    return (
      <div className="container mx-auto px-4 py-8 pb-36 md:pb-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Daily Assessment</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {report.daysRemaining} days until Meta screen &mdash;{' '}
            <span className={paceColors[report.pace]}>{paceLabels[report.pace]}</span>
          </p>
        </div>

        {/* Overall Readiness */}
        <Card className="mb-6">
          <div className="text-center mb-4">
            <div className={`text-5xl font-bold mb-1 ${
              readinessColor === 'green' ? 'text-green-600 dark:text-green-400' :
              readinessColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {report.overall}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Overall Readiness</div>
          </div>
          <ProgressBar value={report.overall} color={readinessColor as 'green' | 'yellow' | 'red'} size="lg" className="mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{report.sql}%</div>
              <div className="text-xs text-green-600 dark:text-green-500">SQL Readiness</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{report.python}%</div>
              <div className="text-xs text-purple-600 dark:text-purple-500">Python Readiness</div>
            </div>
          </div>
        </Card>

        {/* Skills Breakdown */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card title="SQL Skills">
            <div className="space-y-3">
              {report.sqlSkills.map(skill => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{skill.attempted}/{skill.total}</span>
                  </div>
                  <ProgressBar value={skill.score} color={skill.score >= 70 ? 'green' : skill.score >= 40 ? 'yellow' : 'red'} size="sm" />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Python Skills">
            <div className="space-y-3">
              {report.pythonSkills.map(skill => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{skill.attempted}/{skill.total}</span>
                  </div>
                  <ProgressBar value={skill.score} color={skill.score >= 70 ? 'green' : skill.score >= 40 ? 'yellow' : 'red'} size="sm" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Weak Areas & Strengths */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {report.weakAreas.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-red-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Weak Areas</h3>
              </div>
              <ul className="space-y-1">
                {report.weakAreas.map((area, i) => (
                  <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> {area}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {report.strengths.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-green-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Strengths</h3>
              </div>
              <ul className="space-y-1">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Recommendation */}
        <Card className="mb-6 border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <Target size={20} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Today's Focus</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{report.recommendation}</p>
            </div>
          </div>
        </Card>

        {/* Trend */}
        {history.length > 1 && (
          <Card className="mb-6" title="Readiness Trend">
            <div className="flex items-end gap-1 h-24">
              {history.slice(-14).map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${
                      h.overall >= 70 ? 'bg-green-500' : h.overall >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${Math.max(h.overall, 5)}%` }}
                    title={`${h.date}: ${h.overall}%`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{history[Math.max(0, history.length - 14)]?.date}</span>
              <span>{history[history.length - 1]?.date}</span>
            </div>
          </Card>
        )}

        {/* Start Quiz */}
        <Button variant="primary" size="lg" className="w-full" onClick={generateQuiz} icon={<Brain size={20} />}>
          Start Speed Quiz (5 questions, 2 min each)
        </Button>
      </div>
    );
  }

  /* ========================== QUIZ ========================== */
  if (phase === 'quiz' && quizQuestions.length > 0) {
    const q = quizQuestions[quizIndex];
    const timerPct = (quizTimer / QUIZ_TIME_LIMIT) * 100;
    const timerColor = quizTimer > 60 ? 'bg-green-500' : quizTimer > 30 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div className="container mx-auto px-4 py-4 pb-36 md:pb-8 max-w-3xl">
        {/* Timer & progress */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 pb-3 pt-1 -mx-4 px-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge label={q?.category.toUpperCase()} color={q?.category === 'sql' ? 'green' : 'purple'} size="sm" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Question {quizIndex + 1} of {quizQuestions.length}
              </span>
            </div>
            <span className={`text-xl font-mono font-bold ${quizTimer <= 30 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
              {formatTimer(quizTimer)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerPct}%` }} />
          </div>
        </div>

        {q && (
          <Card className="mb-6">
            <div className="flex items-start justify-between gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{q.question}</h2>
              <Badge variant="difficulty" difficulty={q.difficulty as 'Easy' | 'Medium' | 'Hard'} label={q.difficulty} />
            </div>
            <textarea
              className="w-full h-40 p-4 font-mono text-sm bg-gray-900 text-green-400 dark:bg-gray-950 dark:text-green-300 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder={`Write your ${q.category.toUpperCase()} answer...`}
              value={quizAnswer}
              onChange={e => setQuizAnswer(e.target.value)}
              spellCheck={false}
              autoFocus
            />
            <div className="flex justify-end mt-4">
              <Button variant="primary" size="md" icon={<ArrowRight size={16} />} iconPosition="right" onClick={() => handleQuizNext(false)}>
                {quizIndex + 1 < quizQuestions.length ? 'Next' : 'Finish Quiz'}
              </Button>
            </div>
          </Card>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {quizQuestions.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${
              i < quizAnswers.length ? 'bg-blue-500' : i === quizIndex ? 'bg-blue-300 ring-2 ring-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
          ))}
        </div>
      </div>
    );
  }

  /* ========================== GRADING ========================== */
  if (phase === 'grading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI is grading your answers...</h2>
        <p className="text-gray-500 dark:text-gray-400">Analyzing responses and generating feedback</p>
      </div>
    );
  }

  /* ========================== REPORT ========================== */
  if (phase === 'report') {
    return (
      <div className="container mx-auto px-4 py-8 pb-36 md:pb-8 max-w-3xl">
        <div className="text-center mb-8">
          <BarChart3 size={40} className="mx-auto text-blue-500 mb-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Assessment Report</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString()} &mdash; {report.daysRemaining} days to screen
          </p>
        </div>

        {/* Readiness Summary */}
        <Card className="mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{report.overall}%</div>
              <div className="text-xs text-gray-500">Overall</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{report.sql}%</div>
              <div className="text-xs text-gray-500">SQL</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{report.python}%</div>
              <div className="text-xs text-gray-500">Python</div>
            </div>
          </div>
        </Card>

        {/* AI Grading */}
        {aiGrading && (
          <Card className="mb-6" title="AI Feedback">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">{aiGrading}</pre>
            </div>
          </Card>
        )}

        {/* Quiz Answers Review */}
        <Card className="mb-6" title="Your Answers">
          <div className="space-y-4">
            {quizQuestions.map((q, i) => {
              const ans = quizAnswers[i];
              return (
                <div key={q.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Q{i + 1}: {q.question.slice(0, 100)}{q.question.length > 100 ? '...' : ''}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">{ans?.timeSpent || 0}s</span>
                  </div>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 whitespace-pre-wrap font-mono">
                    {ans?.answer || '(no answer)'}
                  </pre>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" size="lg" className="flex-1" icon={<RotateCcw size={18} />} onClick={() => { setReport(calculateReadiness()); setPhase('overview'); }}>
            Back to Overview
          </Button>
          <Button variant="secondary" size="lg" className="flex-1" icon={<Zap size={18} />} onClick={generateQuiz}>
            Retake Quiz
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default DailyAssessment;
