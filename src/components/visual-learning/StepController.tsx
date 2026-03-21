import { SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward } from 'lucide-react';

interface StepControllerProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  stepLabel: string;
  onPlay: () => void;
  onPause: () => void;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  onSetSpeed: (speed: number) => void;
  onGoToStep: (step: number) => void;
}

const SPEEDS = [0.5, 1, 2, 3];

export default function StepController({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  stepLabel,
  onTogglePlay,
  onStepForward,
  onStepBack,
  onGoToStart,
  onGoToEnd,
  onSetSpeed,
  onGoToStep,
}: StepControllerProps) {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {/* Step label */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 min-h-[20px]">
          {stepLabel}
        </p>
      </div>

      {/* Progress bar (clickable) */}
      <div className="relative group">
        <div
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            onGoToStep(Math.round(pct * (totalSteps - 1)));
          }}
        >
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="absolute inset-0 flex items-center justify-between px-0" style={{ pointerEvents: 'none' }}>
          {totalSteps <= 20 && Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i <= currentStep ? 'bg-indigo-400' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-between">
        {/* Left: step counter */}
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-20">
          {currentStep + 1} / {totalSteps}
        </span>

        {/* Center: transport buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onGoToStart}
            disabled={currentStep === 0}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            title="Go to start (Home)"
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={onStepBack}
            disabled={currentStep === 0}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            title="Step back (←)"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onTogglePlay}
            className="p-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-sm"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={onStepForward}
            disabled={currentStep >= totalSteps - 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            title="Step forward (→)"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={onGoToEnd}
            disabled={currentStep >= totalSteps - 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            title="Go to end (End)"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Right: speed selector */}
        <div className="flex items-center gap-1 w-20 justify-end">
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-1.5 py-0.5 text-xs rounded-md transition-colors ${
                speed === s
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
