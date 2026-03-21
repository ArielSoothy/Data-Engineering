import { useState, useMemo } from 'react';
import { Eye, Code2, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { allVisualConfigs } from '../../data/visual-learning';
import type { AnimStep } from './types';
import { useStepAnimation } from './useStepAnimation';
import StepController from './StepController';
import HashMapViz from './visualizations/HashMapViz';
import JoinViz from './visualizations/JoinViz';
import GroupByViz from './visualizations/GroupByViz';

type Category = 'all' | 'python' | 'sql';

export default function VisualLearning() {
  const [category, setCategory] = useState<Category>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [inputOverrides, setInputOverrides] = useState<Record<string, unknown>>({});

  // Filter configs by category
  const filteredConfigs = useMemo(() => {
    if (category === 'all') return allVisualConfigs;
    return allVisualConfigs.filter(c => c.category === category);
  }, [category]);

  // Selected config
  const selectedConfig = useMemo(() => {
    if (selectedId) return allVisualConfigs.find(c => c.questionId === selectedId) ?? null;
    return filteredConfigs[0] ?? null;
  }, [selectedId, filteredConfigs]);

  // Build current inputs from config defaults + overrides
  const currentInputs = useMemo<Record<string, unknown>>(() => {
    if (!selectedConfig) return {};
    const inputs: Record<string, unknown> = {};
    for (const field of selectedConfig.inputs) {
      inputs[field.key] = inputOverrides[field.key] ?? field.defaultValue;
    }
    return inputs;
  }, [selectedConfig, inputOverrides]);

  // Generate steps from inputs
  const steps = useMemo<AnimStep[]>(() => {
    if (!selectedConfig) return [];
    try {
      return selectedConfig.generateSteps(currentInputs);
    } catch {
      return [{ id: 'error', label: 'Error generating steps', highlights: [], dataState: {} }];
    }
  }, [selectedConfig, currentInputs]);

  // Step animation controller
  const anim = useStepAnimation({ totalSteps: steps.length });

  const currentStepData = steps[anim.currentStep] ?? null;

  // Handle input changes
  const handleInputChange = (key: string, rawValue: string) => {
    const field = selectedConfig?.inputs.find(f => f.key === key);
    if (!field) return;

    let parsed: unknown = rawValue;
    if (field.type === 'number') {
      const n = Number(rawValue);
      if (!isNaN(n)) parsed = n;
    } else if (field.type === 'array') {
      try {
        parsed = JSON.parse(rawValue);
      } catch {
        return; // Don't update on invalid JSON
      }
    }
    setInputOverrides(prev => ({ ...prev, [key]: parsed }));
  };

  // Reset inputs when question changes
  const handleSelectQuestion = (id: string) => {
    setSelectedId(id);
    setInputOverrides({});
    setShowCode(false);
  };

  // Render the appropriate visualization component
  const renderVisualization = () => {
    if (!selectedConfig || steps.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <Eye size={48} className="mx-auto mb-3 opacity-50" />
            <p>Select a question to visualize</p>
          </div>
        </div>
      );
    }

    const template = selectedConfig.template;

    if (template === 'array-to-dict' || template === 'array-to-set' || template === 'array-grouping') {
      return <HashMapViz steps={steps} currentStep={anim.currentStep} template={template} />;
    }

    if (template === 'table-join') {
      return <JoinViz steps={steps} currentStep={anim.currentStep} template={template} />;
    }

    if (template === 'table-groupby' || template === 'table-casewhen' || template === 'table-window') {
      return <GroupByViz steps={steps} currentStep={anim.currentStep} template={template} />;
    }

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Eye size={28} className="text-indigo-500" />
          Visual Learning
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Watch algorithms and SQL queries execute step by step
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5">
        {(['all', 'python', 'sql'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setSelectedId(null); setInputOverrides({}); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat === 'all' ? 'All' : cat === 'python' ? '🐍 Python' : '🗄️ SQL'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Question list (sidebar on desktop, horizontal scroll on mobile) */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto">
            {filteredConfigs.map(config => {
              const isActive = (selectedConfig?.questionId === config.questionId);
              return (
                <button
                  key={config.questionId}
                  onClick={() => handleSelectQuestion(config.questionId)}
                  className={`flex-shrink-0 lg:flex-shrink text-left px-4 py-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {config.category === 'python'
                      ? <Code2 size={14} className="text-amber-500 flex-shrink-0" />
                      : <Database size={14} className="text-blue-500 flex-shrink-0" />
                    }
                    <span className={`text-sm font-medium whitespace-nowrap lg:whitespace-normal ${
                      isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {config.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden lg:block">
                    {config.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main visualization area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Editable inputs */}
          {selectedConfig && selectedConfig.inputs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap gap-4">
                {selectedConfig.inputs.filter(f => f.editable).map(field => (
                  <div key={field.key} className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={
                        field.type === 'array'
                          ? JSON.stringify(currentInputs[field.key])
                          : String(currentInputs[field.key] ?? '')
                      }
                      onChange={e => handleInputChange(field.key, e.target.value)}
                      className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visualization canvas */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 min-h-[300px]">
            {renderVisualization()}
          </div>

          {/* Step controller */}
          {selectedConfig && steps.length > 0 && (
            <StepController
              currentStep={anim.currentStep}
              totalSteps={steps.length}
              isPlaying={anim.isPlaying}
              speed={anim.speed}
              stepLabel={currentStepData?.label ?? ''}
              onPlay={anim.play}
              onPause={anim.pause}
              onTogglePlay={anim.togglePlay}
              onStepForward={anim.stepForward}
              onStepBack={anim.stepBack}
              onGoToStart={anim.goToStart}
              onGoToEnd={anim.goToEnd}
              onSetSpeed={anim.setSpeed}
              onGoToStep={anim.goToStep}
            />
          )}

          {/* Solution code (collapsible) */}
          {selectedConfig && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <span className="font-medium">Solution Code</span>
              {showCode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          {showCode && selectedConfig && (
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm font-mono overflow-x-auto border border-gray-700">
              {selectedConfig.solutionCode}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
