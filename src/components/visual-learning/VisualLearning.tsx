import { useState, useMemo } from 'react';
import { Eye, Code2, Database, Brain, GitBranch, Wrench, AlertTriangle, Scale } from 'lucide-react';
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
          {/* Question prompt */}
          {selectedConfig?.question && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10 p-4">
              <div className="flex items-start gap-3">
                <span className="text-indigo-400 text-lg mt-0.5">?</span>
                <div>
                  <span className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">Question</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">
                    {selectedConfig.question}
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* 4-Step Thinking Framework */}
          {selectedConfig && selectedConfig.thinking && (
            <div className="rounded-2xl border border-gray-700/50 overflow-hidden bg-gradient-to-b from-[#0d1117] to-[#161b22]">
              <div className="px-5 py-3 border-b border-gray-700/50">
                <span className="text-sm font-semibold text-gray-300 tracking-wide">How to Think About This</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-gray-700/40">
                {/* Step 1: Logic */}
                <div className="p-4 group">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain size={13} className="text-rose-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-rose-400/70 uppercase tracking-widest font-semibold">Step 1</span>
                      <span className="text-xs text-rose-300 font-semibold ml-2">Logic</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-300 leading-relaxed pl-8">
                    {selectedConfig.thinking.logic}
                  </p>
                </div>

                {/* Step 2: Decomposition */}
                <div className="p-4 border-t md:border-t-0 border-gray-700/40 group">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <GitBranch size={13} className="text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-400/70 uppercase tracking-widest font-semibold">Step 2</span>
                      <span className="text-xs text-amber-300 font-semibold ml-2">Decompose</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-300 leading-relaxed pl-8">
                    {selectedConfig.thinking.decomposition}
                  </p>
                </div>

                {/* Step 3: Translation */}
                <div className="p-4 border-t md:border-t-0 border-gray-700/40 group">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Wrench size={13} className="text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-400/70 uppercase tracking-widest font-semibold">Step 3</span>
                      <span className="text-xs text-cyan-300 font-semibold ml-2">Translate</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-300 leading-relaxed pl-8 font-mono">
                    {selectedConfig.thinking.translation}
                  </p>
                </div>
                {/* Edge Cases & Trade-offs row */}
                {(selectedConfig.thinking.edgeCases || selectedConfig.thinking.tradeOffs) && (
                  <>
                    {selectedConfig.thinking.edgeCases && (
                      <div className="p-4 border-t border-gray-700/40 group">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={13} className="text-orange-400" />
                          </div>
                          <div>
                            <span className="text-[10px] text-orange-400/70 uppercase tracking-widest font-semibold">Watch out</span>
                            <span className="text-xs text-orange-300 font-semibold ml-2">Edge Cases</span>
                          </div>
                        </div>
                        <p className="text-[13px] text-gray-300 leading-relaxed pl-8">
                          {selectedConfig.thinking.edgeCases}
                        </p>
                      </div>
                    )}
                    {selectedConfig.thinking.tradeOffs && (
                      <div className="p-4 border-t md:border-t-0 border-gray-700/40 group">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <Scale size={13} className="text-violet-400" />
                          </div>
                          <div>
                            <span className="text-[10px] text-violet-400/70 uppercase tracking-widest font-semibold">Why this way</span>
                            <span className="text-xs text-violet-300 font-semibold ml-2">Trade-offs</span>
                          </div>
                        </div>
                        <p className="text-[13px] text-gray-300 leading-relaxed pl-8">
                          {selectedConfig.thinking.tradeOffs}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Pseudo code + Solution code */}
          {selectedConfig && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pseudo code */}
              <div className="rounded-xl border border-gray-700 overflow-hidden">
                <div className="px-4 py-2 bg-[#161b22] border-b border-gray-700 flex items-center gap-2">
                  <Eye size={14} className="text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Pseudo Code</span>
                </div>
                <pre className="bg-gray-900 text-amber-200/80 p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                  {selectedConfig.pseudoCode}
                </pre>
              </div>

              {/* Solution */}
              <div className="rounded-xl border border-gray-700 overflow-hidden">
                <div className="px-4 py-2 bg-[#161b22] border-b border-gray-700 flex items-center gap-2">
                  <Code2 size={14} className="text-green-400" />
                  <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Solution</span>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 text-sm font-mono overflow-x-auto">
                  {selectedConfig.solutionCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
