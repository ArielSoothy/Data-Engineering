import { useState, useMemo } from 'react';
import { Rating } from 'ts-fsrs';
import { Card, Badge, Button } from '../ui';
import { useSpacedRepetition, buildSpacedDeck } from '../../hooks/useSpacedRepetition';
import type { UnifiedQuestion } from '../../types/studyHub';

interface Props {
  questions: UnifiedQuestion[];
}

export default function QuickSpaced({ questions }: Props) {
  const { fsrsCards, gradeCard } = useSpacedRepetition();
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const { deck, stats } = useMemo(
    () => buildSpacedDeck(questions, fsrsCards),
    [questions, fsrsCards],
  );

  const current = deck[index];

  const advance = () => {
    setShowAnswer(false);
    // Move to next card; wrap if at end
    if (index < deck.length - 1) {
      setIndex(i => i + 1);
    } else {
      setIndex(0); // restart deck
    }
  };

  const handleGrade = (grade: typeof Rating.Again | typeof Rating.Hard | typeof Rating.Good | typeof Rating.Easy) => {
    if (!current) return;
    gradeCard(current.uid, grade);
    advance();
  };

  if (deck.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-500">
        No cards available. Try adjusting your filters.
      </div>
    );
  }

  // Difficulty badge color
  const diffColor = current?.difficulty === 'Easy' ? 'success' : current?.difficulty === 'Hard' ? 'danger' : 'warning';

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center gap-3 mb-4 text-sm">
        <span className="font-mono text-gray-500 dark:text-gray-400">{index + 1} / {deck.length}</span>
        <Badge variant="info">{stats.due} due</Badge>
        <Badge variant="success">{stats.new} new</Badge>
        <span className="text-gray-400 dark:text-gray-500">{stats.upcoming} upcoming</span>
      </div>

      {/* Card */}
      {current && (
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant={diffColor}>{current.difficulty}</Badge>
            {current.topic && <Badge variant="info">{current.topic}</Badge>}
            <span className="text-xs text-gray-400">{current.subject.toUpperCase()}</span>
          </div>

          <p className="text-gray-900 dark:text-white font-medium text-base mb-4">
            {current.question}
          </p>

          {showAnswer ? (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                  {current.answer}
                </pre>
              </div>

              {/* FSRS rating buttons */}
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleGrade(Rating.Again)}
                  className="!text-xs"
                >
                  Again
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleGrade(Rating.Hard)}
                  className="!text-xs"
                >
                  Hard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleGrade(Rating.Good)}
                  className="!text-xs"
                >
                  Good
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGrade(Rating.Easy)}
                  className="!text-xs !bg-emerald-100 dark:!bg-emerald-900/30 !text-emerald-700 dark:!text-emerald-400"
                >
                  Easy
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowAnswer(true)}
              className="w-full"
            >
              Show Answer
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
