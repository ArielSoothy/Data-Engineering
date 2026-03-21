import { motion, AnimatePresence } from 'framer-motion';
import type { AnimStep } from '../types';

interface Props {
  steps: AnimStep[];
  currentStep: number;
  template: 'array-to-dict' | 'array-to-set' | 'array-grouping';
}

/* ────────────── Color helpers ────────────── */

const VAR_COLORS: Record<string, string> = {
  nums: 'text-sky-400',
  target: 'text-orange-400',
  seen: 'text-amber-400',
  i: 'text-emerald-400',
  num: 'text-pink-400',
  diff: 'text-violet-400',
  result: 'text-green-400',
  s: 'text-sky-400',
  t: 'text-orange-400',
  count: 'text-amber-400',
  c: 'text-pink-400',
  strs: 'text-sky-400',
  groups: 'text-amber-400',
  key: 'text-violet-400',
  k: 'text-orange-400',
  freq: 'text-amber-400',
};

const GROUP_BG = [
  'rgba(99,102,241,0.15)',  // indigo
  'rgba(16,185,129,0.15)',  // emerald
  'rgba(245,158,11,0.15)',  // amber
  'rgba(244,63,94,0.15)',   // rose
  'rgba(139,92,246,0.15)',  // violet
];
const GROUP_BORDER = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

/* ────────────── Value renderer ────────────── */

function RenderValue({ value, compact }: { value: unknown; compact?: boolean }) {
  if (value === null || value === undefined) return <span className="text-gray-500">None</span>;

  // Dict / object
  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-gray-500">{'{}'}</span>;

    // Grouped lists (array-grouping)
    const isGrouped = entries.some(([, v]) => Array.isArray(v));
    if (isGrouped) {
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          <AnimatePresence>
            {entries.map(([k, v], gi) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                layout
                className="rounded-lg p-2 min-w-[60px]"
                style={{
                  background: GROUP_BG[gi % GROUP_BG.length],
                  border: `2px solid ${GROUP_BORDER[gi % GROUP_BORDER.length]}`,
                }}
              >
                <div className="text-[10px] font-mono text-gray-400 mb-1">"{k}"</div>
                <AnimatePresence>
                  {(v as string[]).map((item) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs font-mono text-gray-200 py-0.5"
                    >
                      "{item}"
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      );
    }

    // Regular dict
    return (
      <span className="inline-flex flex-wrap items-center gap-0.5">
        <span className="text-yellow-300">{'{'}</span>
        <AnimatePresence>
          {entries.map(([k, v], idx) => (
            <motion.span
              key={k}
              initial={{ opacity: 0, scale: 0.5, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="inline-flex items-center"
            >
              {idx > 0 && <span className="text-gray-500 mr-1">,</span>}
              <span className="text-cyan-300">{k}</span>
              <span className="text-gray-500">:</span>
              <span className="text-orange-300 ml-0.5">{String(v)}</span>
            </motion.span>
          ))}
        </AnimatePresence>
        <span className="text-yellow-300">{'}'}</span>
      </span>
    );
  }

  // Array / set
  if (Array.isArray(value)) {
    if (compact && value.length > 8) {
      return <span className="text-cyan-300">[{value.slice(0, 6).join(', ')}, ...{value.length} items]</span>;
    }
    return (
      <span className="text-cyan-300">
        [{value.map((v, i) => (
          <span key={i}>
            {i > 0 && <span className="text-gray-500">, </span>}
            {typeof v === 'string' ? `"${v}"` : String(v)}
          </span>
        ))}]
      </span>
    );
  }

  if (typeof value === 'boolean') return <span className="text-orange-300">{String(value)}</span>;
  if (typeof value === 'number') return <span className="text-green-300">{value}</span>;
  if (typeof value === 'string') return <span className="text-green-300">"{value}"</span>;
  return <span>{String(value)}</span>;
}

/* ────────────── Code Panel with line highlight ────────────── */

function CodePanel({
  code,
  activeLine,
  annotation,
}: {
  code: string;
  activeLine: number;
  annotation?: string;
}) {
  const lines = code.split('\n');

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 bg-[#0d1117]">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-gray-700">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs text-gray-500 font-mono">solution.py</span>
      </div>

      {/* Code lines */}
      <div className="py-2 text-[13px] leading-6 font-mono overflow-x-auto">
        {lines.map((line, i) => {
          const isActive = i === activeLine;
          return (
            <div
              key={i}
              className={`flex transition-colors duration-300 ${
                isActive
                  ? 'bg-yellow-500/15 border-l-2 border-yellow-400'
                  : 'border-l-2 border-transparent'
              }`}
            >
              {/* Line number */}
              <span className={`w-10 text-right pr-3 select-none flex-shrink-0 ${
                isActive ? 'text-yellow-400' : 'text-gray-600'
              }`}>
                {i + 1}
              </span>
              {/* Execution arrow */}
              <span className="w-5 flex-shrink-0 text-center">
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-yellow-400 text-xs"
                  >
                    ▶
                  </motion.span>
                )}
              </span>
              {/* Code text */}
              <span className={`pr-4 whitespace-pre ${
                isActive ? 'text-gray-100' : 'text-gray-400'
              }`}>
                {line || ' '}
              </span>
            </div>
          );
        })}
      </div>

      {/* Annotation bar */}
      <AnimatePresence mode="wait">
        {annotation && (
          <motion.div
            key={annotation}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-700 px-4 py-2 bg-[#161b22]"
          >
            <p className="text-xs text-blue-300 font-mono">
              💡 {annotation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────────── Variables Panel ────────────── */

function VariablesPanel({
  variables,
  changedVars,
}: {
  variables: Record<string, unknown>;
  changedVars: string[];
}) {
  return (
    <div className="rounded-xl border border-gray-700 bg-[#0d1117] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-[#161b22] border-b border-gray-700">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Variables</span>
      </div>

      {/* Variable list */}
      <div className="p-3 space-y-2 text-[13px] font-mono">
        <AnimatePresence>
          {Object.entries(variables).map(([name, value]) => {
            const justChanged = changedVars.includes(name);
            const colorClass = VAR_COLORS[name] || 'text-gray-300';
            const isComplex = typeof value === 'object' && value !== null;

            return (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: justChanged ? [1, 1.03, 1] : 1,
                }}
                transition={{
                  layout: { type: 'spring', stiffness: 300, damping: 25 },
                  scale: { duration: 0.4 },
                }}
                className={`rounded-lg px-3 py-2 transition-colors duration-300 ${
                  justChanged
                    ? 'bg-yellow-500/10 ring-1 ring-yellow-500/40'
                    : 'bg-gray-800/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`${colorClass} font-semibold flex-shrink-0`}>{name}</span>
                  <span className="text-gray-500">=</span>
                  <div className={`${isComplex ? 'flex-1 min-w-0' : ''}`}>
                    <RenderValue value={value} compact />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {Object.keys(variables).length === 0 && (
          <div className="text-gray-600 italic text-xs py-4 text-center">
            No variables yet
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────── Input Array visual (compact) ────────────── */

function ArrayVisual({
  array,
  currentIndex,
  matchIndices,
  foundMatch,
  processedIndices,
}: {
  array: (string | number)[];
  currentIndex: number;
  matchIndices: number[];
  foundMatch: boolean;
  processedIndices: number[];
}) {
  return (
    <div className="rounded-xl border border-gray-700 bg-[#0d1117] overflow-hidden">
      <div className="px-4 py-2 bg-[#161b22] border-b border-gray-700">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Memory</span>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5 items-end">
          {array.map((val, i) => {
            let bg = 'bg-gray-800 border-gray-600';
            let textColor = 'text-gray-300';
            let scale = 1;
            let glow = '';

            if (foundMatch && matchIndices.includes(i)) {
              bg = 'bg-green-900/60 border-green-400';
              textColor = 'text-green-300';
              scale = 1.1;
              glow = 'shadow-[0_0_12px_rgba(34,197,94,0.4)]';
            } else if (i === currentIndex) {
              bg = 'bg-blue-900/60 border-blue-400';
              textColor = 'text-blue-200';
              scale = 1.08;
              glow = 'shadow-[0_0_8px_rgba(59,130,246,0.3)]';
            } else if (processedIndices.includes(i)) {
              bg = 'bg-gray-800/40 border-gray-700';
              textColor = 'text-gray-600';
            }

            return (
              <motion.div
                key={i}
                animate={{ scale }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`flex flex-col items-center ${glow}`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 text-sm font-bold ${bg} ${textColor}`}>
                  {typeof val === 'string' ? `"${val}"` : val}
                </div>
                <span className={`text-[9px] mt-0.5 ${
                  i === currentIndex ? 'text-blue-400 font-bold' : 'text-gray-600'
                }`}>
                  [{i}]
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ────────────── Result banner ────────────── */

function ResultBanner({ result }: { result: unknown }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="rounded-xl border border-green-500/50 bg-green-500/10 px-4 py-3 flex items-center gap-3"
    >
      <span className="text-green-400 text-lg">✓</span>
      <div>
        <div className="text-xs text-green-400/70 uppercase tracking-wider font-semibold">Return</div>
        <div className="text-green-300 font-mono font-bold">
          <RenderValue value={result} />
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════ */

export default function HashMapViz({ steps, currentStep, template }: Props) {
  const step = steps[currentStep];
  if (!step) return null;

  const ds = step.dataState;
  const activeLine = (ds.activeLine ?? -1) as number;
  const code = (ds.code ?? '') as string;
  const annotation = (ds.annotation ?? '') as string;
  const changedVars = (ds.changedVars ?? []) as string[];
  const result = ds.result;
  const hasResult = result !== undefined;

  // Build variables object for display
  const variables: Record<string, unknown> = {};
  const varNames = (ds.visibleVars ?? []) as string[];
  for (const name of varNames) {
    if (ds[name] !== undefined) {
      variables[name] = ds[name];
    }
  }

  // Array visual data
  const array = (ds.array ?? []) as (string | number)[];
  const currentIndex = (ds.currentIndex ?? -1) as number;
  const matchIndices = (ds.matchIndices ?? []) as number[];
  const foundMatch = (ds.foundMatch ?? false) as boolean;
  const processedIndices = (ds.processedIndices ?? []) as number[];
  const showArrayVisual = array.length > 0 && currentIndex >= -1;

  // Decide layout based on template
  const isGrouping = template === 'array-grouping';

  return (
    <div className="space-y-4">
      {/* Code + Variables — side by side on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Code panel */}
        <div className="flex-1 min-w-0">
          <CodePanel code={code} activeLine={activeLine} annotation={annotation} />
        </div>

        {/* Variables panel */}
        <div className="lg:w-80 flex-shrink-0">
          <VariablesPanel variables={variables} changedVars={changedVars} />
        </div>
      </div>

      {/* Memory visualization */}
      {showArrayVisual && !isGrouping && (
        <ArrayVisual
          array={array}
          currentIndex={currentIndex}
          matchIndices={matchIndices}
          foundMatch={foundMatch}
          processedIndices={processedIndices}
        />
      )}

      {/* Result */}
      <AnimatePresence>
        {hasResult && <ResultBanner result={result} />}
      </AnimatePresence>
    </div>
  );
}
