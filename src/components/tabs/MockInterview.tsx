import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Video, CheckCircle, MessageSquare } from 'lucide-react';
import useQuestions from '../../hooks/useQuestions';

const MockInterview = () => {
  const [expandedInterviewId, setExpandedInterviewId] = useState<number | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const {
    data: interviews,
    loading,
    error,
    getQuestionProgress,
    toggleQuestionCompletion
  } = useQuestions('mock-interviews');

  const totalInterviews = interviews.length;
  const completedCount = interviews.filter((interview: any) => {
    const progress = getQuestionProgress(interview.id);
    return progress && progress.completed;
  }).length;
  const completionPercentage = totalInterviews > 0
    ? Math.round((completedCount / totalInterviews) * 100)
    : 0;

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-400';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-36 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Mock Interview</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Simulated Meta Senior Data Engineer (E5/E6) interview rounds covering SQL, data modeling,
          pipeline design, product sense, and behavioral questions. Each round is 45 minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">Rounds Completed</div>
            <div className="text-sm font-medium">{completedCount}/{totalInterviews}</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="card flex items-center">
          <Video size={20} className="mr-3 text-red-500" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Practice Time</div>
            <div className="text-lg font-bold">
              {interviews.reduce((total: number, i: any) => total + (i.duration || 45), 0)} minutes
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-red-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading interviews...</p>
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {interviews.map((interview: any) => {
            const progress = getQuestionProgress(interview.id);
            const isCompleted = progress?.completed || false;
            const isExpanded = expandedInterviewId === interview.id;

            return (
              <div
                key={interview.id}
                className={`card border ${isCompleted
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-500 dark:text-gray-400">
                        Round {interview.id}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {interview.duration} min
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <MessageSquare size={12} className="mr-1" />
                        {interview.questions?.length || 0} questions
                      </span>
                      {isCompleted && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400 flex items-center">
                          <CheckCircle size={12} className="mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{interview.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => toggleQuestionCompletion(interview.id, !isCompleted)}
                      className={`p-1.5 rounded-full transition-colors ${isCompleted
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 dark:hover:bg-opacity-20'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => setExpandedInterviewId(isExpanded ? null : interview.id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {isExpanded && interview.questions && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {interview.questions.map((question: any, qIdx: number) => {
                      const qKey = `${interview.id}-${question.id}`;
                      const qExpanded = expandedQuestionId === qKey;

                      return (
                        <div
                          key={question.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <button
                            className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                            onClick={() => setExpandedQuestionId(qExpanded ? null : qKey)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Q{qIdx + 1}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor(question.difficulty)}`}>
                                    {question.difficulty}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {question.category}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  {question.question}
                                </p>
                              </div>
                              <div className="shrink-0">
                                {qExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                              </div>
                            </div>
                          </button>

                          {qExpanded && (
                            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 space-y-3 pt-3">
                              <div>
                                <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                                  Expected Answer
                                </h5>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {question.expectedAnswer}
                                </p>
                              </div>

                              {question.followUpQuestions && question.followUpQuestions.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                                    Follow-up Questions
                                  </h5>
                                  <ul className="space-y-1">
                                    {question.followUpQuestions.map((followUp: string, fIdx: number) => (
                                      <li key={fIdx} className="flex items-start text-sm">
                                        <div className="min-w-2 h-2 bg-red-400 rounded-full mt-1.5 mr-2 shrink-0"></div>
                                        <span className="text-gray-600 dark:text-gray-400 italic">{followUp}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MockInterview;
