import { useState, useCallback } from 'react';
import { Zap, Eye, EyeOff, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button, Card, Badge, Spinner } from '../../ui';
import { generateAdaptiveQuestion, generateFeedback, getLastUsedModel, getLastUsedProvider } from '../../../services/aiService';
import type { AdaptiveQuestion } from '../../../services/aiService';
import type { StudyHubFilters } from '../../../types/studyHub';
import { getFromLocalStorage, saveToLocalStorage } from '../../../utils/helpers';

interface Props {
  filters: StudyHubFilters;
}

interface LevelState {
  level: 1 | 2 | 3;
  correct: number;
  total: number;
}

interface AdaptiveState {
  sql: LevelState;
  python: LevelState;
}

const LEVEL_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const;
const STORAGE_KEY = 'study_hub_adaptive_state';
const ANSWERED_KEY = 'study_hub_adaptive_answered';

function loadState(): AdaptiveState {
  return getFromLocalStorage<AdaptiveState>(STORAGE_KEY, {
    sql: { level: 1, correct: 0, total: 0 },
    python: { level: 1, correct: 0, total: 0 },
  });
}

export default function AdaptiveModeView({ filters }: Props) {
  const subject = filters.subject === 'all' ? 'sql' : filters.subject;

  const [state, setState] = useState<AdaptiveState>(loadState);
  const [currentQ, setCurrentQ] = useState<AdaptiveQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackModel, setFeedbackModel] = useState<string | null>(null);
  const [answered, setAnswered] = useState<string[]>(() =>
    getFromLocalStorage<string[]>(ANSWERED_KEY, []),
  );

  const subjectState = state[subject];

  const generateQuestion = useCallback(async () => {
    setLoading(true);
    setCurrentQ(null);
    setHintsRevealed(0);
    setShowAnswer(false);
    setUserAnswer('');
    setFeedback('');
    setFeedbackModel(null);
    try {
      const q = await generateAdaptiveQuestion(subject, subjectState.level, answered.slice(-30));
      setCurrentQ(q);
    } catch (e) {
      console.error('Failed to generate adaptive question:', e);
    } finally {
      setLoading(false);
    }
  }, [subject, subjectState.level, answered]);

  const markResult = useCallback(
    (correct: boolean) => {
      if (!currentQ) return;
      setState(prev => {
        const s = { ...prev[subject] };
        s.total += 1;
        if (correct) s.correct += 1;
        // Advance: 5 questions per level, 4+ correct → advance
        if (s.total >= 5) {
          if (s.correct >= 4 && s.level < 3) {
            s.level = (s.level + 1) as 1 | 2 | 3;
          }
          s.correct = 0;
          s.total = 0;
        }
        const next = { ...prev, [subject]: s };
        saveToLocalStorage(STORAGE_KEY, next);
        return next;
      });
      // Track answered questions
      const newAnswered = [...answered, currentQ.question].slice(-50);
      setAnswered(newAnswered);
      saveToLocalStorage(ANSWERED_KEY, newAnswered);
      // Auto-generate next
      setCurrentQ(null);
    },
    [currentQ, subject, answered],
  );

  const checkAnswer = useCallback(async () => {
    if (!currentQ || !userAnswer.trim()) return;
    setFeedbackLoading(true);
    try {
      const result = await generateFeedback(currentQ.question, userAnswer, currentQ.answer, currentQ.pseudoCode);
      setFeedback(result);
      setFeedbackModel(getLastUsedModel() || getLastUsedProvider());
    } catch {
      setFeedback('Failed to get feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  }, [currentQ, userAnswer]);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Level info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {subject.toUpperCase()} &middot; {LEVEL_LABELS[subjectState.level]}
          </span>
          <Badge
            label={`${subjectState.correct}/${Math.max(5 - subjectState.total, 0) + subjectState.correct} to advance`}
            color="blue"
            size="sm"
          />
        </div>
        <div className="flex gap-1">
          {([1, 2, 3] as const).map(l => (
            <div
              key={l}
              className={`w-6 h-1.5 rounded-full ${
                l <= subjectState.level
                  ? 'bg-blue-500 dark:bg-blue-400'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Generate button or question */}
      {!currentQ && !loading && (
        <Card padding="lg" className="text-center">
          <Zap size={40} className="mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Adaptive Practice</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            AI generates {LEVEL_LABELS[subjectState.level].toLowerCase()}-level {subject.toUpperCase()} questions.
            Answer 4/5 correctly to advance.
          </p>
          <Button variant="primary" size="lg" onClick={generateQuestion}>
            Generate Question
          </Button>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="md" />
          <span className="text-sm text-gray-400">Generating question...</span>
        </div>
      )}

      {currentQ && (
        <>
          {/* Question */}
          <Card padding="lg">
            <Badge label={LEVEL_LABELS[subjectState.level]} variant="difficulty" difficulty={LEVEL_LABELS[subjectState.level]} size="sm" className="mb-2" />
            <p className="text-gray-800 dark:text-gray-200 font-medium">{currentQ.question}</p>
          </Card>

          {/* Hints */}
          {currentQ.hints.length > 0 && (
            <div className="flex gap-2">
              {currentQ.hints.map((_hint, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  onClick={() => setHintsRevealed(Math.max(hintsRevealed, i + 1))}
                  disabled={i < hintsRevealed}
                  className={i < hintsRevealed ? 'opacity-100' : ''}
                >
                  Hint {i + 1}
                </Button>
              ))}
            </div>
          )}
          {hintsRevealed > 0 && (
            <div className="space-y-1">
              {currentQ.hints.slice(0, hintsRevealed).map((hint, i) => (
                <p key={i} className="text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2">
                  {hint}
                </p>
              ))}
            </div>
          )}

          {/* User answer */}
          <div>
            <textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Write your answer..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
            />
            <div className="flex gap-2 mt-2">
              <Button variant="primary" size="sm" onClick={checkAnswer} disabled={!userAnswer.trim() || feedbackLoading} loading={feedbackLoading}>
                Check
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAnswer(a => !a)} icon={showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}>
                {showAnswer ? 'Hide' : 'Show Answer'}
              </Button>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <Card padding="md" className="!bg-blue-50 dark:!bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">AI Feedback</span>
                {feedbackModel && <Badge label={`via ${feedbackModel}`} color="blue" size="sm" className="ml-auto" />}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{feedback}</p>
            </Card>
          )}

          {/* Answer */}
          {showAnswer && (
            <Card padding="md" className="!bg-green-50 dark:!bg-green-950/30 border border-green-200 dark:border-green-800">
              <p className="text-[10px] font-bold tracking-widest text-green-500 uppercase mb-1">Answer</p>
              <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">{currentQ.answer}</p>
              {currentQ.pseudoCode && (
                <pre className="mt-2 text-xs text-green-700 dark:text-green-300 whitespace-pre-wrap font-mono bg-green-100/50 dark:bg-green-900/20 rounded p-2">
                  {currentQ.pseudoCode}
                </pre>
              )}
            </Card>
          )}

          {/* Self-assess */}
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="primary" size="lg" onClick={() => markResult(true)} icon={<ThumbsUp size={16} />} className="!bg-green-600 hover:!bg-green-700">
              Got it
            </Button>
            <Button variant="danger" size="lg" onClick={() => markResult(false)} icon={<ThumbsDown size={16} />}>
              Missed it
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
