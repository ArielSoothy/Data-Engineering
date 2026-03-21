import { motion, AnimatePresence } from 'framer-motion';
import type { AnimStep } from '../types';

interface Props {
  steps: AnimStep[];
  currentStep: number;
  template: 'table-join';
}

const BADGE_COLORS: Record<number, { bg: string; text: string; ring: string }> = {
  0: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', ring: 'ring-blue-400' },
  1: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', ring: 'ring-green-400' },
  2: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-400' },
  3: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', ring: 'ring-purple-400' },
  4: { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300', ring: 'ring-rose-400' },
};

function getBadgeColor(value: unknown, colorMap: Map<unknown, number>): typeof BADGE_COLORS[0] {
  if (!colorMap.has(value)) {
    colorMap.set(value, colorMap.size);
  }
  const idx = colorMap.get(value)!;
  return BADGE_COLORS[idx % Object.keys(BADGE_COLORS).length];
}

interface TableData {
  columns: string[];
  rows: (string | number | null)[][];
}

export default function JoinViz({ steps, currentStep }: Props) {
  const step = steps[currentStep];
  if (!step) return null;

  const ds = step.dataState;
  const leftTable = ds.leftTable as TableData;
  const rightTable = ds.rightTable as TableData;
  const joinColumn = ds.joinColumn as string;
  const joinType = ds.joinType as 'inner' | 'left';
  const currentLeftRow = (ds.currentLeftRow as number) ?? -1;
  const matchingRightRows = (ds.matchingRightRows as number[]) ?? [];
  const resultRows = (ds.resultRows as (string | number | null)[][]) ?? [];
  const dimmedLeftRows = (ds.dimmedLeftRows as number[]) ?? [];
  const nullRows = (ds.nullRows as number[]) ?? [];
  const scanningRight = (ds.scanningRight as boolean) ?? false;

  const colorMap = new Map<unknown, number>();
  // Pre-populate color map with unique join column values from left table
  const joinColIdxLeft = leftTable.columns.indexOf(joinColumn);
  const joinColIdxRight = rightTable.columns.indexOf(joinColumn);
  if (joinColIdxLeft >= 0) {
    leftTable.rows.forEach(row => getBadgeColor(row[joinColIdxLeft], colorMap));
  }

  // Build result columns
  const resultColumns = leftTable.columns
    .filter(c => c !== joinColumn)
    .concat([joinColumn])
    .concat(rightTable.columns.filter(c => c !== joinColumn));

  return (
    <div className="space-y-4">
      {/* Source tables */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left table */}
        <div className="flex-1 min-w-0">
          <DataTable
            title="Left Table"
            table={leftTable}
            joinColumn={joinColumn}
            joinColIdx={joinColIdxLeft}
            colorMap={colorMap}
            activeRow={currentLeftRow}
            matchedRows={[]}
            dimmedRows={dimmedLeftRows}
            scanning={false}
          />
        </div>

        {/* Right table */}
        <div className="flex-1 min-w-0">
          <DataTable
            title="Right Table"
            table={rightTable}
            joinColumn={joinColumn}
            joinColIdx={joinColIdxRight}
            colorMap={colorMap}
            activeRow={-1}
            matchedRows={matchingRightRows}
            dimmedRows={[]}
            scanning={scanningRight}
          />
        </div>
      </div>

      {/* Join type indicator */}
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
          {joinType === 'inner' ? 'INNER' : 'LEFT'} JOIN ON {joinColumn}
        </span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Result table */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
        <div className="px-3 py-2 border-b border-indigo-200 dark:border-indigo-700">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Result ({resultRows.length} row{resultRows.length !== 1 ? 's' : ''})
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-100/60 dark:bg-indigo-900/40">
                {resultColumns.map(col => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {resultRows.map((row, rowIdx) => {
                  const isNull = nullRows.includes(rowIdx);
                  return (
                    <motion.tr
                      key={`result-${rowIdx}`}
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="border-t border-indigo-100 dark:border-indigo-800/50"
                    >
                      {row.map((cell, colIdx) => (
                        <td
                          key={colIdx}
                          className={`px-3 py-2 ${
                            cell === null
                              ? 'text-gray-400 dark:text-gray-500 italic border-dashed border border-gray-300 dark:border-gray-600'
                              : 'text-gray-800 dark:text-gray-200'
                          } ${isNull && cell === null ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                        >
                          {cell === null ? 'NULL' : String(cell)}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {resultRows.length === 0 && (
                <tr>
                  <td
                    colSpan={resultColumns.length}
                    className="px-3 py-6 text-center text-gray-400 dark:text-gray-500 text-xs italic"
                  >
                    Result rows will appear here...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Data table sub-component ── */

interface DataTableProps {
  title: string;
  table: TableData;
  joinColumn: string;
  joinColIdx: number;
  colorMap: Map<unknown, number>;
  activeRow: number;
  matchedRows: number[];
  dimmedRows: number[];
  scanning: boolean;
}

function DataTable({
  title,
  table,
  joinColumn,
  joinColIdx,
  colorMap,
  activeRow,
  matchedRows,
  dimmedRows,
  scanning,
}: DataTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </h4>
        {scanning && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-amber-600 dark:text-amber-400 font-medium"
          >
            Scanning...
          </motion.span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-750">
              {table.columns.map(col => (
                <th
                  key={col}
                  className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                    col === joinColumn
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {col}
                  {col === joinColumn && (
                    <span className="ml-1 text-[10px] normal-case font-normal">(key)</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIdx) => {
              const isActive = rowIdx === activeRow;
              const isMatched = matchedRows.includes(rowIdx);
              const isDimmed = dimmedRows.includes(rowIdx);

              let rowClass = 'border-t border-gray-100 dark:border-gray-700/50 transition-all duration-300';
              if (isActive) {
                rowClass += ' bg-blue-50 dark:bg-blue-900/30 ring-1 ring-inset ring-blue-400';
              } else if (isMatched) {
                rowClass += ' bg-green-50 dark:bg-green-900/30 ring-1 ring-inset ring-green-400';
              }
              if (isDimmed && !isActive && !isMatched) {
                rowClass += ' opacity-40';
              }

              return (
                <motion.tr
                  key={rowIdx}
                  layout
                  className={rowClass}
                  animate={
                    isActive
                      ? { scale: [1, 1.01, 1] }
                      : isMatched
                      ? { scale: [1, 1.01, 1] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  {row.map((cell, colIdx) => {
                    const isJoinCol = colIdx === joinColIdx;
                    return (
                      <td key={colIdx} className="px-3 py-2">
                        {isJoinCol && cell !== null ? (
                          <JoinBadge value={cell} colorMap={colorMap} pulse={isActive || isMatched} />
                        ) : (
                          <span className="text-gray-800 dark:text-gray-200">
                            {cell === null ? '—' : String(cell)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Join badge sub-component ── */

interface JoinBadgeProps {
  value: string | number;
  colorMap: Map<unknown, number>;
  pulse: boolean;
}

function JoinBadge({ value, colorMap, pulse }: JoinBadgeProps) {
  const color = getBadgeColor(value, colorMap);
  return (
    <motion.span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono ${color.bg} ${color.text}`}
      animate={pulse ? { scale: [1, 1.15, 1] } : {}}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {String(value)}
    </motion.span>
  );
}
