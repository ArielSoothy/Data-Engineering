import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, CheckCircle } from 'lucide-react';
import useQuestions from '../../hooks/useQuestions';

const MetaTechStack = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const {
    data: services,
    loading,
    error,
    getQuestionProgress,
    toggleQuestionCompletion
  } = useQuestions('data-stack');

  const categories = [...new Set(services.map((s: any) => s.category))].sort();

  const filteredServices = services.filter((s: any) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory ? s.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const totalServices = services.length;
  const completedCount = services.filter((s: any) => {
    const progress = getQuestionProgress(s.id);
    return progress && progress.completed;
  }).length;
  const completionPercentage = totalServices > 0
    ? Math.round((completedCount / totalServices) * 100)
    : 0;

  const categoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Query Engine': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-400',
      'Batch Processing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-400',
      'Distributed Processing': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:bg-opacity-30 dark:text-orange-400',
      'Event Streaming': 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400',
      'Transformation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400',
      'Orchestration': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-400',
      'Storage Format': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:bg-opacity-30 dark:text-teal-400',
      'Cloud Data Warehouse': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:bg-opacity-30 dark:text-indigo-400',
      'Stream Processing': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:bg-opacity-30 dark:text-pink-400',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-36 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meta Tech Stack</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Core infrastructure and tools used at Meta for data engineering at petabyte scale.
          Understand each tool's role, when to use it, and key interview talking points.
        </p>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">Reviewed</div>
          <div className="text-sm font-medium">{completedCount}/{totalServices}</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat as string} value={cat as string}>{cat as string}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tech stack...</p>
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service: any) => {
            const progress = getQuestionProgress(service.id);
            const isReviewed = progress?.completed || false;
            const isExpanded = expandedId === service.id;

            return (
              <div
                key={service.id}
                className={`card border ${isReviewed
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(service.category)}`}>
                        {service.category}
                      </span>
                      {isReviewed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400 flex items-center">
                          <CheckCircle size={12} className="mr-1" />
                          Reviewed
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => toggleQuestionCompletion(service.id, !isReviewed)}
                      className={`p-1.5 rounded-full transition-colors ${isReviewed
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 dark:hover:bg-opacity-20'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={isReviewed ? 'Mark as not reviewed' : 'Mark as reviewed'}
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : service.id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {service.keyFeatures && service.keyFeatures.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                          Key Features
                        </h4>
                        <ul className="space-y-1">
                          {service.keyFeatures.map((feature: string, i: number) => (
                            <li key={i} className="flex items-start text-sm">
                              <div className="min-w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 shrink-0"></div>
                              <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.commonUseCases && service.commonUseCases.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                          Common Use Cases
                        </h4>
                        <ul className="space-y-1">
                          {service.commonUseCases.map((useCase: string, i: number) => (
                            <li key={i} className="flex items-start text-sm">
                              <div className="min-w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2 shrink-0"></div>
                              <span className="text-gray-600 dark:text-gray-400">{useCase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.interviewTips && (
                      <div className="bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                        <h4 className="font-semibold text-sm mb-1 text-amber-700 dark:text-amber-300">
                          Interview Tips
                        </h4>
                        <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
                          {service.interviewTips}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredServices.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No tools match your search. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetaTechStack;
