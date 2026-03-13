// Canonical topic taxonomy for DE Prep questions

export const SQL_TOPICS = [
  'SELECT/WHERE',
  'JOINs',
  'Aggregation/GROUP BY',
  'Window Functions',
  'CTEs/Subqueries',
  'NULL Handling',
  'UNION/Set Ops',
  'Indexes',
  'PostgreSQL',
  'Data Engineering Patterns',
] as const;

export const PYTHON_TOPICS = [
  'Syntax',
  'Loops/Control Flow',
  'Functions',
  'Data Structures',
  'Dicts/Counters',
  'Lists/Comprehensions',
  'Sets',
  'Strings',
  'Sorting',
  'Pandas',
  'Classes/OOP',
] as const;

export type SQLTopic = typeof SQL_TOPICS[number];
export type PythonTopic = typeof PYTHON_TOPICS[number];
export type Topic = SQLTopic | PythonTopic;

export const ALL_TOPICS: readonly Topic[] = [...SQL_TOPICS, ...PYTHON_TOPICS];

export function getTopicsForSubject(subject: 'sql' | 'python'): readonly string[] {
  return subject === 'sql' ? SQL_TOPICS : PYTHON_TOPICS;
}
