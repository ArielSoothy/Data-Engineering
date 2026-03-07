import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';
import useQuestions from '../../hooks/useQuestions';

const Decomposition = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const {
    data: scenarios,
    loading,
    error,
    getQuestionProgress,
    toggleQuestionCompletion
  } = useQuestions('decomposition-scenarios');

  const totalScenarios = scenarios.length;
  const completedCount = scenarios.filter(s => {
    const progress = getQuestionProgress(s.id);
    return progress && progress.completed;
  }).length;
  const completionPercentage = totalScenarios > 0
    ? Math.round((completedCount / totalScenarios) * 100)
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
        <h1 className="text-2xl font-bold mb-2">Product Sense & Data Modeling</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Meta-focused product sense, metric design, and data modeling scenarios. Practice defining
          north star metrics, investigating metric changes, and designing star schemas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">Completion</div>
            <div className="text-sm font-medium">{completedCount}/{totalScenarios}</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-yellow-500 h-2.5 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="card flex items-center">
          <Clock size={20} className="mr-3 text-yellow-500" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Total Time</div>
            <div className="text-lg font-bold">
              {scenarios.reduce((total, s) => {
                const progress = getQuestionProgress(s.id);
                return total + (progress && progress.completed ? 0 : (s.timeEstimate || 25));
              }, 0)} minutes remaining
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-yellow-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading scenarios...</p>
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scenarios.map(scenario => {
            const progress = getQuestionProgress(scenario.id);
            const isCompleted = progress?.completed || false;
            const isExpanded = expandedId === scenario.id;

            return (
              <div
                key={scenario.id}
                className={`card border ${isCompleted
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-500 dark:text-gray-400">
                        #{scenario.id}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor(scenario.difficulty)}`}>
                        {scenario.difficulty}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {scenario.timeEstimate} min
                      </span>
                      {isCompleted && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400 flex items-center">
                          <CheckCircle size={12} className="mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{scenario.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{scenario.description}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => toggleQuestionCompletion(scenario.id, !isCompleted)}
                      className={`p-1.5 rounded-full transition-colors ${isCompleted
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 dark:hover:bg-opacity-20'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : scenario.id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {scenario.systemComponents && scenario.systemComponents.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                          System Components
                        </h4>
                        <ul className="space-y-1">
                          {scenario.systemComponents.map((component: string, i: number) => (
                            <li key={i} className="flex items-start text-sm">
                              <div className="min-w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2 shrink-0"></div>
                              <span className="text-gray-600 dark:text-gray-400">{component}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {scenario.keyConsiderations && scenario.keyConsiderations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                          Key Considerations
                        </h4>
                        <ul className="space-y-1">
                          {scenario.keyConsiderations.map((consideration: string, i: number) => (
                            <li key={i} className="flex items-start text-sm">
                              <div className="min-w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 shrink-0"></div>
                              <span className="text-gray-600 dark:text-gray-400">{consideration}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {scenario.solutionApproach && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                          Solution Approach
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {scenario.solutionApproach}
                        </p>
                      </div>
                    )}

                    {scenario.pseudoCode && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                          Reference Code / Query
                        </h4>
                        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 text-xs p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                          {scenario.pseudoCode}
                        </pre>
                      </div>
                    )}

                    {scenario.aiApproach && (
                      <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                        <h4 className="font-semibold text-sm mb-1 text-blue-700 dark:text-blue-300">
                          Engineering Insight
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                          {scenario.aiApproach}
                        </p>
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
};

export default Decomposition;
