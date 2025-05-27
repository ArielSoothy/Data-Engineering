import { useState, useEffect } from 'react';
import { Book, Search, ChevronDown, ChevronUp, ExternalLink, HelpCircle, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

interface Term {
  definition: string;
  example: string;
  when_to_use?: string;
}

interface GlossarySection {
  title: string;
  description: string;
  terms: Record<string, Term>;
}

interface GlossaryData {
  junior: GlossarySection;
  mid: GlossarySection;
  senior: GlossarySection;
  mstic: GlossarySection;
  tools: GlossarySection;
}

const Glossary = () => {
  const [glossaryData, setGlossaryData] = useState<GlossaryData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<string>('junior');
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  
  // Trivia state
  const [showTrivia, setShowTrivia] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{
    term: string;
    definition: string;
    options: string[];
    correctAnswer: number;
    section: string;
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const loadGlossaryData = async () => {
      try {
        const response = await fetch('/data/data-engineering-glossary.json');
        const data = await response.json();
        setGlossaryData(data);
      } catch (error) {
        console.error('Error loading glossary data:', error);
      }
    };

    loadGlossaryData();
  }, []);

  const toggleTerm = (termKey: string) => {
    const newExpanded = new Set(expandedTerms);
    if (newExpanded.has(termKey)) {
      newExpanded.delete(termKey);
    } else {
      newExpanded.add(termKey);
    }
    setExpandedTerms(newExpanded);
  };

  // Trivia helper functions
  const getAllTerms = () => {
    if (!glossaryData) return [];
    const allTerms: Array<{ term: string; definition: string; section: string }> = [];
    
    Object.entries(glossaryData).forEach(([sectionKey, section]) => {
      Object.entries(section.terms).forEach(([termKey, termData]) => {
        allTerms.push({
          term: termKey,
          definition: (termData as Term).definition,
          section: sectionKey
        });
      });
    });
    
    return allTerms;
  };

  const generateTriviaQuestion = () => {
    const allTerms = getAllTerms();
    if (allTerms.length < 4) return null;
    
    // Pick a random term for the question
    const randomIndex = Math.floor(Math.random() * allTerms.length);
    const correctTerm = allTerms[randomIndex];
    
    // Generate 3 wrong answers from other terms
    const wrongAnswers = allTerms
      .filter((_, index) => index !== randomIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(term => term.term);
    
    // Combine and shuffle all options
    const allOptions = [correctTerm.term, ...wrongAnswers];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    const correctAnswer = shuffledOptions.indexOf(correctTerm.term);
    
    return {
      term: correctTerm.term,
      definition: correctTerm.definition,
      options: shuffledOptions,
      correctAnswer,
      section: correctTerm.section
    };
  };

  const startNewQuestion = () => {
    const question = generateTriviaQuestion();
    if (question) {
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === currentQuestion?.correctAnswer;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const resetTrivia = () => {
    setScore({ correct: 0, total: 0 });
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const filterTerms = (terms: Record<string, Term>) => {
    if (!searchTerm) return terms;
    
    const filtered: Record<string, Term> = {};
    Object.entries(terms).forEach(([key, term]) => {
      if (
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.example.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        filtered[key] = term;
      }
    });
    return filtered;
  };

  const sections = [
    { key: 'junior', label: 'Junior Level', icon: '🌱' },
    { key: 'mid', label: 'Mid Level', icon: '🚀' },
    { key: 'senior', label: 'Senior Level', icon: '⭐' },
    { key: 'mstic', label: 'MSTIC Team', icon: '🛡️' },
    { key: 'tools', label: 'Essential Tools', icon: '🔧' },
    { key: 'trivia', label: 'Trivia', icon: '🧠' }
  ];

  if (!glossaryData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentSection = activeSection === 'trivia' ? null : glossaryData[activeSection as keyof GlossaryData];
  const filteredTerms = currentSection ? filterTerms(currentSection.terms) : {};

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Book className="text-blue-600 dark:text-blue-400" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Data Engineering Glossary
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Comprehensive glossary of data engineering terms organized by experience level
        </p>
      </div>

      {/* Section Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeSection === section.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span className="font-medium">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'trivia' ? (
        /* Trivia Section */
        <div className="space-y-6">
          {/* Trivia Header */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  🧠 Data Engineering Trivia
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Test your knowledge with questions from all glossary sections
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {score.total > 0 ? `${score.correct}/${score.total}` : '0/0'}
                </div>
                <div className="text-xs text-gray-400">
                  {score.total > 0 ? `${Math.round((score.correct / score.total) * 100)}%` : '0%'}
                </div>
              </div>
            </div>
          </div>

          {/* Trivia Controls */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={startNewQuestion}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <HelpCircle size={20} />
              New Question
            </button>
            <button
              onClick={resetTrivia}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={20} />
              Reset Score
            </button>
          </div>

          {/* Question Display */}
          {currentQuestion && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                  {currentQuestion.section} Level
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  What term matches this definition?
                </h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{currentQuestion.definition}"
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  let buttonClass = "w-full p-4 text-left border rounded-lg transition-all ";
                  
                  if (selectedAnswer === null) {
                    buttonClass += "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20";
                  } else if (index === currentQuestion.correctAnswer) {
                    buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200";
                  } else if (index === selectedAnswer) {
                    buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200";
                  } else {
                    buttonClass += "border-gray-300 dark:border-gray-600 opacity-50";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {selectedAnswer !== null && (
                          <span>
                            {index === currentQuestion.correctAnswer ? (
                              <CheckCircle className="text-green-500" size={20} />
                            ) : index === selectedAnswer ? (
                              <XCircle className="text-red-500" size={20} />
                            ) : null}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className="mt-6 p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                      <>
                        <CheckCircle className="text-green-500" size={20} />
                        <span className="font-semibold text-green-800 dark:text-green-200">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-500" size={20} />
                        <span className="font-semibold text-red-800 dark:text-red-200">Incorrect</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    The correct answer is <strong>{currentQuestion.term}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {!currentQuestion && (
            <div className="text-center py-12">
              <HelpCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                Ready to test your knowledge?
              </p>
              <button
                onClick={startNewQuestion}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Trivia
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Glossary Section */
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search terms, definitions, or examples..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Current Section Header */}
          {currentSection && (
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {currentSection.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentSection.description}
              </p>
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(filteredTerms).length} terms
                {searchTerm && ` (filtered from ${Object.keys(currentSection.terms).length})`}
              </div>
            </div>
          )}

          {/* Terms List */}
          <div className="space-y-4">
            {Object.keys(filteredTerms).length === 0 ? (
              <div className="text-center py-12">
                <Book className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No terms found matching "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              Object.entries(filteredTerms).map(([termKey, term]) => {
                const isExpanded = expandedTerms.has(termKey);
                
                return (
                  <div
                    key={termKey}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleTerm(termKey)}
                      className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {termKey}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {(term as Term).definition}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="text-gray-400 flex-shrink-0 ml-4" size={24} />
                        ) : (
                          <ChevronDown className="text-gray-400 flex-shrink-0 ml-4" size={24} />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="pt-4 space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Example
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded italic">
                              {(term as Term).example}
                            </p>
                          </div>
                          
                          {(term as Term).when_to_use && (
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                When to Use
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                {(term as Term).when_to_use}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Learning Path Recommendation
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Start with Junior terms, progress through Mid and Senior levels, then explore specialized MSTIC and Tools sections. Test your knowledge with Trivia!
            </p>
          </div>
          <ExternalLink className="text-gray-400" size={20} />
        </div>
      </div>
    </div>
  );
};

export default Glossary;
