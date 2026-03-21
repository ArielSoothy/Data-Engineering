import { motion, AnimatePresence } from 'framer-motion';
import type { AnimStep } from '../types';

interface Props {
  steps: AnimStep[];
  currentStep: number;
  template: 'array-to-dict' | 'array-to-set' | 'array-grouping';
}

const GROUP_COLORS = [
  'indigo-400',
  'emerald-400',
  'amber-400',
  'rose-400',
  'purple-400',
];

function getCellStyle(
  index: number,
  currentIndex: number,
  processedIndices: number[],
  matchIndices: number[],
  foundMatch: boolean
): string {
  if (foundMatch && matchIndices.includes(index)) {
    return 'bg-green-100 dark:bg-green-900 border-green-500 ring-2 ring-green-400 scale-110 shadow-lg';
  }
  if (index === currentIndex) {
    return 'bg-blue-100 dark:bg-blue-900 border-blue-500 scale-110 shadow-lg';
  }
  if (processedIndices.includes(index)) {
    return 'bg-gray-200 dark:bg-gray-600 border-gray-400 opacity-60';
  }
  return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
      {children}
    </h3>
  );
}

/* ---------- Array-to-Dict ---------- */
function ArrayToDictView({ step }: { step: AnimStep }) {
  const ds = step.dataState;
  const array = (ds.array ?? []) as (string | number)[];
  const currentIndex = (ds.currentIndex ?? -1) as number;
  const processedIndices = (ds.processedIndices ?? []) as number[];
  const dict = (ds.dict ?? {}) as Record<string, number>;
  const computation = (ds.computation ?? '') as string;
  const checkResult = (ds.checkResult ?? '') as string;
  const result = ds.result as unknown;
  const hasResult = result !== undefined;
  const foundMatch = (ds.foundMatch ?? false) as boolean;
  const matchIndices = (ds.matchIndices ?? []) as number[];

  return (
    <div className="space-y-4">
      {/* Input Array */}
      <div>
        <SectionHeader>Input Array</SectionHeader>
        <div className="relative flex flex-wrap gap-2 sm:gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {array.map((val, i) => (
            <div key={i} className="relative flex flex-col items-center">
              <motion.div
                layout
                animate={{
                  scale: i === currentIndex && !foundMatch ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg border-2 text-sm sm:text-base font-semibold transition-colors ${getCellStyle(
                  i,
                  currentIndex,
                  processedIndices,
                  matchIndices,
                  foundMatch
                )}`}
              >
                {val}
              </motion.div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {i}
              </span>
              {/* Pointer triangle */}
              <AnimatePresence>
                {i === currentIndex && !foundMatch && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute -bottom-3 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-blue-500"
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Computation */}
      <AnimatePresence mode="wait">
        {(computation || checkResult) && (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1"
          >
            {computation && (
              <p className="text-xs sm:text-sm font-mono text-blue-800 dark:text-blue-200">
                {computation}
              </p>
            )}
            {checkResult && (
              <p className="text-xs sm:text-sm font-mono text-blue-600 dark:text-blue-300">
                {checkResult}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dictionary */}
      <div>
        <SectionHeader>Dictionary (seen)</SectionHeader>
        <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[48px]">
          <AnimatePresence>
            {Object.entries(dict).map(([key, val]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 border-l-4 border-l-amber-500"
              >
                <span className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {key}
                </span>
                <span className="text-xs text-gray-400">:</span>
                <span className="text-xs sm:text-sm font-mono text-gray-700 dark:text-gray-300">
                  {val}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {Object.keys(dict).length === 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              empty
            </span>
          )}
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {hasResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-green-50 dark:bg-green-950 rounded-xl border border-green-300 dark:border-green-700"
          >
            <SectionHeader>Result</SectionHeader>
            <p className="text-sm sm:text-base font-mono font-bold text-green-700 dark:text-green-300">
              {JSON.stringify(result)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Array-to-Set ---------- */
function ArrayToSetView({ step }: { step: AnimStep }) {
  const ds = step.dataState;
  const array = (ds.array ?? []) as (string | number)[];
  const currentIndex = (ds.currentIndex ?? -1) as number;
  const processedIndices = (ds.processedIndices ?? []) as number[];
  const seen = (ds.set ?? []) as (string | number)[];
  const computation = (ds.computation ?? '') as string;
  const checkResult = (ds.checkResult ?? '') as string;
  const result = ds.result as unknown;
  const hasResult = result !== undefined;
  const foundMatch = (ds.foundMatch ?? false) as boolean;
  const matchIndices = (ds.matchIndices ?? []) as number[];
  const isTruthy = result === true || result === 'True';

  return (
    <div className="space-y-4">
      {/* Input Array */}
      <div>
        <SectionHeader>Input Array</SectionHeader>
        <div className="relative flex flex-wrap gap-2 sm:gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {array.map((val, i) => (
            <div key={i} className="relative flex flex-col items-center">
              <motion.div
                layout
                animate={{
                  scale: i === currentIndex && !foundMatch ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg border-2 text-sm sm:text-base font-semibold transition-colors ${getCellStyle(
                  i,
                  currentIndex,
                  processedIndices,
                  matchIndices,
                  foundMatch
                )}`}
              >
                {val}
              </motion.div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {i}
              </span>
              <AnimatePresence>
                {i === currentIndex && !foundMatch && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute -bottom-3 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-blue-500"
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Computation */}
      <AnimatePresence mode="wait">
        {(computation || checkResult) && (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1"
          >
            {computation && (
              <p className="text-xs sm:text-sm font-mono text-blue-800 dark:text-blue-200">
                {computation}
              </p>
            )}
            {checkResult && (
              <p className="text-xs sm:text-sm font-mono text-blue-600 dark:text-blue-300">
                {checkResult}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Set */}
      <div>
        <SectionHeader>Set (seen)</SectionHeader>
        <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[48px]">
          <AnimatePresence>
            {seen.map((val) => (
              <motion.div
                key={String(val)}
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-200"
              >
                {val}
              </motion.div>
            ))}
          </AnimatePresence>
          {seen.length === 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              empty
            </span>
          )}
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {hasResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-xl border ${
              isTruthy
                ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
            }`}
          >
            <SectionHeader>Result</SectionHeader>
            <p
              className={`text-sm sm:text-base font-mono font-bold ${
                isTruthy
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {String(result)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Array-Grouping ---------- */
function ArrayGroupingView({ step }: { step: AnimStep }) {
  const ds = step.dataState;
  const array = (ds.array ?? []) as string[];
  const currentIndex = (ds.currentIndex ?? -1) as number;
  const processedIndices = (ds.processedIndices ?? []) as number[];
  const groups = (ds.groups ?? {}) as Record<string, string[]>;
  const computation = (ds.computation ?? '') as string;
  const checkResult = (ds.checkResult ?? '') as string;
  const foundMatch = (ds.foundMatch ?? false) as boolean;
  const matchIndices = (ds.matchIndices ?? []) as number[];

  const groupKeys = Object.keys(groups);

  return (
    <div className="space-y-4">
      {/* Input Array */}
      <div>
        <SectionHeader>Input Array</SectionHeader>
        <div className="relative flex flex-wrap gap-2 sm:gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {array.map((val, i) => (
            <div key={i} className="relative flex flex-col items-center">
              <motion.div
                layout
                animate={{
                  scale: i === currentIndex && !foundMatch ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`px-2 h-10 sm:h-12 flex items-center justify-center rounded-lg border-2 text-sm sm:text-base font-semibold transition-colors ${getCellStyle(
                  i,
                  currentIndex,
                  processedIndices,
                  matchIndices,
                  foundMatch
                )}`}
              >
                {val}
              </motion.div>
              <AnimatePresence>
                {i === currentIndex && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute -bottom-3 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-blue-500"
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Computation */}
      <AnimatePresence mode="wait">
        {(computation || checkResult) && (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1"
          >
            {computation && (
              <p className="text-xs sm:text-sm font-mono text-blue-800 dark:text-blue-200">
                {computation}
              </p>
            )}
            {checkResult && (
              <p className="text-xs sm:text-sm font-mono text-blue-600 dark:text-blue-300">
                {checkResult}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups */}
      <div>
        <SectionHeader>Groups</SectionHeader>
        <div className="flex flex-wrap gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[60px]">
          <AnimatePresence>
            {groupKeys.map((key, gi) => {
              const color = GROUP_COLORS[gi % GROUP_COLORS.length];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 border-${color} bg-${color}/10 min-w-[70px]`}
                  style={{
                    borderColor: `var(--group-${gi})`,
                  }}
                >
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 font-semibold">
                    {key}
                  </span>
                  <div className="flex flex-col gap-1">
                    <AnimatePresence>
                      {groups[key].map((item) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -20, scale: 0.8 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                          }}
                          className={`px-2 py-1 rounded-md text-xs sm:text-sm font-medium text-center bg-${color}/20 text-gray-800 dark:text-gray-200`}
                          style={{
                            backgroundColor: getGroupBg(gi),
                          }}
                        >
                          {item}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {groupKeys.length === 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              no groups yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function getGroupBg(index: number): string {
  const bgs = [
    'rgba(129,140,248,0.15)', // indigo
    'rgba(52,211,153,0.15)', // emerald
    'rgba(251,191,36,0.15)', // amber
    'rgba(251,113,133,0.15)', // rose
    'rgba(167,139,250,0.15)', // purple
  ];
  return bgs[index % bgs.length];
}

function getGroupBorder(index: number): string {
  const borders = [
    '#818cf8', // indigo-400
    '#34d399', // emerald-400
    '#fbbf24', // amber-400
    '#fb7185', // rose-400
    '#a78bfa', // purple-400
  ];
  return borders[index % borders.length];
}

/* ---------- Main Component ---------- */
export default function HashMapViz({ steps, currentStep, template }: Props) {
  const step = steps[currentStep];
  if (!step) return null;

  // Inject CSS variables for group colors
  const groupStyle: React.CSSProperties = {};
  for (let i = 0; i < GROUP_COLORS.length; i++) {
    (groupStyle as Record<string, string>)[`--group-${i}`] = getGroupBorder(i);
  }

  return (
    <div className="w-full" style={groupStyle}>
      {template === 'array-to-dict' && <ArrayToDictView step={step} />}
      {template === 'array-to-set' && <ArrayToSetView step={step} />}
      {template === 'array-grouping' && <ArrayGroupingView step={step} />}
    </div>
  );
}
