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

// Map non-canonical topic names (from quick-drill-cards.json etc.) to canonical names
const TOPIC_ALIAS_MAP: Record<string, Topic> = {
  // SQL aliases
  'Joins': 'JOINs',
  'JOIN': 'JOINs',
  'join': 'JOINs',
  'LEFT JOIN': 'JOINs',
  'self-join': 'JOINs',
  'Aggregation': 'Aggregation/GROUP BY',
  'GROUP BY': 'Aggregation/GROUP BY',
  'sum': 'Aggregation/GROUP BY',
  'AVG': 'Aggregation/GROUP BY',
  'Window': 'Window Functions',
  'window functions': 'Window Functions',
  'CTE': 'CTEs/Subqueries',
  'Subqueries': 'CTEs/Subqueries',
  'NULL': 'NULL Handling',
  'UNION': 'UNION/Set Ops',
  'CASE': 'SELECT/WHERE',
  'LIKE': 'SELECT/WHERE',
  'SUBSTRING': 'SELECT/WHERE',
  'SELECT/WHERE': 'SELECT/WHERE',
  'Data Engineering': 'Data Engineering Patterns',
  // Python aliases
  'Syntax Rules': 'Syntax',
  'Lists': 'Lists/Comprehensions',
  'Dicts': 'Dicts/Counters',
  'dict': 'Dicts/Counters',
  'Counter': 'Dicts/Counters',
  'Loops': 'Loops/Control Flow',
  'pandas': 'Pandas',
  'Patterns': 'Data Structures',
  'Basics': 'Syntax',
  'Modulo': 'Syntax',
  'Types': 'Syntax',
  'Edge Cases': 'Data Structures',
  'set': 'Sets',
  'string': 'Strings',
  'sorting': 'Sorting',
};

/** Normalize a raw topic string to its canonical name */
export function canonicalizeTopic(raw: string | undefined): string {
  if (!raw) return 'Other';
  // Direct match to canonical
  if ((ALL_TOPICS as readonly string[]).includes(raw)) return raw;
  // Alias lookup
  return TOPIC_ALIAS_MAP[raw] ?? raw;
}
