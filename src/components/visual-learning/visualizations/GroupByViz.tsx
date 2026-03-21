import { motion, AnimatePresence } from 'framer-motion';
import type { AnimStep } from '../types';

interface Props {
  steps: AnimStep[];
  currentStep: number;
  template: 'table-groupby' | 'table-casewhen' | 'table-window';
}

const GROUP_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' },
  { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-700', text: 'text-green-700 dark:text-green-300', badge: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' },
  { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200' },
  { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200' },
  { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-200' },
];

interface TableData {
  columns: string[];
  rows: (string | number | null)[][];
}

interface GroupData {
  rows: (string | number | null)[][];
  color: string;
}

interface ConditionData {
  when: string;
  then: string;
  color: string;
}

export default function GroupByViz({ steps, currentStep, template }: Props) {
  const step = steps[currentStep];
  if (!step) return null;

  if (template === 'table-groupby') return <GroupByView ds={step.dataState} />;
  if (template === 'table-casewhen') return <CaseWhenView ds={step.dataState} />;
  return <WindowView ds={step.dataState} />;
}

/* ========================================================================
   GROUP BY visualization
   ======================================================================== */

function GroupByView({ ds }: { ds: Record<string, unknown> }) {
  const table = ds.table as TableData;
  const groupColumn = ds.groupColumn as string;
  const groups = (ds.groups as Record<string, GroupData>) ?? {};
  const currentRow = (ds.currentRow as number) ?? -1;
  const aggregates = (ds.aggregates as Record<string, { count: number; sum: number; avg: number }>) ?? {};
  const havingFilter = (ds.havingFilter as string) ?? '';
  const filteredGroups = (ds.filteredGroups as string[]) ?? [];
  const phase = (ds.phase as string) ?? 'coloring';

  const groupColIdx = table.columns.indexOf(groupColumn);
  const groupKeys = Object.keys(groups);
  const colorMapByGroup = new Map<string, number>();
  groupKeys.forEach((key, i) => colorMapByGroup.set(key, i));

  const showGroups = phase === 'grouping' || phase === 'aggregating' || phase === 'filtering';
  const showAggregates = phase === 'aggregating' || phase === 'filtering';

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Original table */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Original Table
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-750">
                    {table.columns.map(col => (
                      <th
                        key={col}
                        className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                          col === groupColumn
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIdx) => {
                    const groupVal = groupColIdx >= 0 ? String(row[groupColIdx]) : '';
                    const colorIdx = colorMapByGroup.get(groupVal) ?? 0;
                    const gc = GROUP_COLORS[colorIdx % GROUP_COLORS.length];
                    const colored = phase !== 'coloring' || rowIdx <= currentRow;
                    const isActive = rowIdx === currentRow && phase === 'coloring';

                    return (
                      <motion.tr
                        key={rowIdx}
                        layout
                        className={`border-t border-gray-100 dark:border-gray-700/50 transition-all duration-300 ${
                          colored && groupKeys.length > 0 ? gc.bg : ''
                        } ${isActive ? 'ring-1 ring-inset ring-indigo-400' : ''}`}
                      >
                        {row.map((cell, colIdx) => (
                          <td key={colIdx} className="px-3 py-2 text-gray-800 dark:text-gray-200">
                            {cell === null ? '—' : String(cell)}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Grouped view */}
        {showGroups && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 min-w-0 space-y-3"
          >
            <div className="px-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Grouped by {groupColumn}
              </h4>
            </div>
            <AnimatePresence>
              {groupKeys.map((key, gIdx) => {
                const gc = GROUP_COLORS[gIdx % GROUP_COLORS.length];
                const group = groups[key];
                const agg = aggregates[key];
                const passesHaving = filteredGroups.length === 0 || filteredGroups.includes(key);
                const isFiltered = phase === 'filtering' && !passesHaving;

                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isFiltered ? 0.3 : 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`rounded-lg border ${gc.border} ${gc.bg} p-3 ${
                      isFiltered ? 'line-through decoration-red-400 decoration-2' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${gc.badge.split(' ')[0]}`} />
                      <span className={`text-sm font-semibold ${gc.text}`}>
                        {groupColumn} = {key}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({group.rows.length} row{group.rows.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    {/* Row names */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {group.rows.map((r, ri) => (
                        <span
                          key={ri}
                          className={`px-2 py-0.5 rounded text-xs ${gc.badge}`}
                        >
                          {r[0] != null ? String(r[0]) : `row ${ri + 1}`}
                        </span>
                      ))}
                    </div>
                    {/* Aggregates */}
                    {showAggregates && agg && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 mt-1"
                      >
                        <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                          COUNT: {agg.count}
                        </span>
                        {agg.avg > 0 && (
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                            AVG: {Number(agg.avg.toFixed(1))}
                          </span>
                        )}
                      </motion.div>
                    )}
                    {isFiltered && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium"
                      >
                        Filtered out by HAVING {havingFilter}
                      </motion.p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================
   CASE WHEN visualization
   ======================================================================== */

function CaseWhenView({ ds }: { ds: Record<string, unknown> }) {
  const table = ds.table as TableData;
  const currentRow = (ds.currentRow as number) ?? -1;
  const conditions = (ds.conditions as ConditionData[]) ?? [];
  const results = (ds.results as (string | null)[]) ?? [];
  const evaluating = (ds.evaluating as string) ?? '';

  const CASE_COLORS: Record<string, { bg: string; text: string }> = {
    green: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300' },
    red: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
  };

  return (
    <div className="space-y-4">
      {/* Evaluating condition */}
      {evaluating && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2 px-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700"
        >
          <span className="text-sm font-mono text-indigo-700 dark:text-indigo-300">{evaluating}</span>
        </motion.div>
      )}

      {/* Condition legend */}
      <div className="flex flex-wrap gap-2 justify-center">
        {conditions.map((cond, i) => {
          const cc = CASE_COLORS[cond.color] ?? CASE_COLORS.blue;
          return (
            <span key={i} className={`px-2 py-1 rounded text-xs font-mono ${cc.bg} ${cc.text}`}>
              WHEN {cond.when} THEN &apos;{cond.then}&apos;
            </span>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750">
                {table.columns.map(col => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {col}
                  </th>
                ))}
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  category
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIdx) => {
                const isActive = rowIdx === currentRow;
                const result = results[rowIdx] ?? null;
                const matchedCond = result
                  ? conditions.find(c => c.then === result)
                  : null;
                const cc = matchedCond
                  ? CASE_COLORS[matchedCond.color] ?? CASE_COLORS.blue
                  : null;

                return (
                  <motion.tr
                    key={rowIdx}
                    layout
                    className={`border-t border-gray-100 dark:border-gray-700/50 transition-all duration-300 ${
                      isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-inset ring-indigo-400' : ''
                    }`}
                    animate={isActive ? { scale: [1, 1.01, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="px-3 py-2 text-gray-800 dark:text-gray-200">
                        {cell === null ? '—' : String(cell)}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      {result !== null ? (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-mono ${
                            cc ? `${cc.bg} ${cc.text}` : 'text-gray-400'
                          }`}
                        >
                          {result}
                        </motion.span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs italic">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   WINDOW (LAG / LEAD) visualization
   ======================================================================== */

function WindowView({ ds }: { ds: Record<string, unknown> }) {
  const table = ds.table as TableData;
  const currentRow = (ds.currentRow as number) ?? -1;
  const windowColumn = ds.windowColumn as string;
  const newColumn = (ds.newColumn as string) ?? 'prev_value';
  const computedValues = (ds.computedValues as (number | null)[]) ?? [];
  const arrowFrom = (ds.arrowFrom as number) ?? -1;
  const arrowTo = (ds.arrowTo as number) ?? -1;
  const changeValues = (ds.changeValues as (number | null)[]) ?? [];

  const windowColIdx = table.columns.indexOf(windowColumn);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750">
                {table.columns.map(col => (
                  <th
                    key={col}
                    className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                      col === windowColumn
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {col}
                  </th>
                ))}
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {newColumn}
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  change
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIdx) => {
                const isActive = rowIdx === currentRow;
                const isArrowSource = rowIdx === arrowFrom;
                const isArrowTarget = rowIdx === arrowTo;
                const computed = computedValues[rowIdx] ?? null;
                const change = changeValues[rowIdx] ?? null;

                return (
                  <motion.tr
                    key={rowIdx}
                    layout
                    className={`border-t border-gray-100 dark:border-gray-700/50 transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-inset ring-blue-400'
                        : isArrowSource
                        ? 'bg-amber-50/50 dark:bg-amber-900/10'
                        : ''
                    }`}
                  >
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="px-3 py-2 relative">
                        <span className={`${
                          colIdx === windowColIdx && isArrowSource
                            ? 'font-semibold text-amber-700 dark:text-amber-300'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {cell === null ? '—' : String(cell)}
                        </span>
                      </td>
                    ))}
                    {/* prev value column */}
                    <td className="px-3 py-2">
                      {computed !== null ? (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="inline-flex items-center gap-1"
                        >
                          {isArrowTarget && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-amber-500 text-xs"
                            >
                              &larr;
                            </motion.span>
                          )}
                          <span className="font-mono text-amber-700 dark:text-amber-300">
                            {computed}
                          </span>
                        </motion.span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 italic text-xs">
                          {rowIdx === 0 ? 'NULL' : '—'}
                        </span>
                      )}
                    </td>
                    {/* change column */}
                    <td className="px-3 py-2">
                      {change !== null ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.3 }}
                          className={`font-mono text-sm font-semibold ${
                            change > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : change < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {change > 0 ? '+' : ''}{change}
                        </motion.span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 italic text-xs">
                          {rowIdx === 0 ? 'NULL' : '—'}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
