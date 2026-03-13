// Topic mappings for questions that don't have a topic field in their JSON.
// Quick-drill-cards already have `topic` — those are mapped in the normalizer.
// Meta Official uses `tags[0]` — fallback here if missing.

import type { QuestionSource } from '../types/studyHub';

type TopicMap = Record<number, string>;

const sqlBasics: TopicMap = {
  1: 'SELECT/WHERE', 2: 'UNION/Set Ops', 3: 'CTEs/Subqueries', 4: 'JOINs', 5: 'Indexes',
  6: 'Window Functions', 7: 'JOINs', 8: 'JOINs', 9: 'Aggregation/GROUP BY', 10: 'Window Functions',
  11: 'Aggregation/GROUP BY', 12: 'JOINs', 13: 'Window Functions', 14: 'Aggregation/GROUP BY',
  15: 'Aggregation/GROUP BY', 16: 'Aggregation/GROUP BY', 17: 'Aggregation/GROUP BY',
  18: 'Aggregation/GROUP BY', 19: 'Window Functions', 20: 'Window Functions',
  21: 'Aggregation/GROUP BY', 22: 'NULL Handling', 23: 'NULL Handling',
  24: 'CTEs/Subqueries', 25: 'CTEs/Subqueries', 26: 'CTEs/Subqueries',
  27: 'CTEs/Subqueries', 28: 'CTEs/Subqueries', 29: 'CTEs/Subqueries', 30: 'CTEs/Subqueries',
  31: 'Indexes', 32: 'Indexes', 33: 'PostgreSQL', 34: 'PostgreSQL',
  35: 'Data Engineering Patterns', 36: 'Data Engineering Patterns',
  37: 'Data Engineering Patterns', 38: 'Data Engineering Patterns',
  39: 'Data Engineering Patterns', 40: 'PostgreSQL',
};

const sqlAdvanced: TopicMap = {
  1: 'Window Functions', 2: 'Window Functions', 3: 'Window Functions', 4: 'Window Functions',
  5: 'Data Engineering Patterns', 6: 'Window Functions', 7: 'Window Functions',
  8: 'Window Functions', 9: 'Window Functions', 10: 'Window Functions',
  11: 'Window Functions', 12: 'Window Functions', 13: 'Data Engineering Patterns',
  14: 'Data Engineering Patterns', 15: 'Window Functions', 16: 'Data Engineering Patterns',
  17: 'Data Engineering Patterns', 18: 'Data Engineering Patterns',
  19: 'CTEs/Subqueries', 20: 'Data Engineering Patterns',
  21: 'Aggregation/GROUP BY', 22: 'Window Functions', 23: 'Data Engineering Patterns',
  24: 'Window Functions', 25: 'Window Functions', 26: 'Window Functions',
  27: 'Data Engineering Patterns', 28: 'Data Engineering Patterns',
  29: 'Data Engineering Patterns', 30: 'JOINs',
  500: 'Data Engineering Patterns', 501: 'Data Engineering Patterns',
  502: 'Aggregation/GROUP BY', 503: 'Data Engineering Patterns',
  504: 'Data Engineering Patterns', 505: 'Data Engineering Patterns',
  506: 'JOINs', 507: 'Window Functions', 508: 'Data Engineering Patterns',
  509: 'CTEs/Subqueries', 510: 'Data Engineering Patterns',
  511: 'Window Functions', 512: 'Data Engineering Patterns',
  513: 'PostgreSQL', 514: 'JOINs', 515: 'Window Functions',
  516: 'Data Engineering Patterns', 517: 'CTEs/Subqueries',
  518: 'Data Engineering Patterns', 519: 'Data Engineering Patterns',
  520: 'Window Functions', 521: 'Data Engineering Patterns',
  522: 'Data Engineering Patterns', 523: 'Aggregation/GROUP BY',
  524: 'Data Engineering Patterns',
};

const pythonBasics: TopicMap = {
  1: 'Data Structures', 2: 'Data Structures', 3: 'Syntax', 4: 'Lists/Comprehensions',
  5: 'Data Structures', 6: 'Pandas', 7: 'Pandas', 8: 'Pandas', 9: 'Pandas', 10: 'Pandas',
  11: 'Pandas', 12: 'Pandas', 13: 'Pandas', 14: 'Pandas', 15: 'Pandas',
  16: 'Lists/Comprehensions', 17: 'Dicts/Counters', 18: 'Sets', 19: 'Strings', 20: 'Dicts/Counters',
};

const pythonAdvanced: TopicMap = {
  1: 'Pandas', 2: 'Pandas', 3: 'Data Structures', 4: 'Loops/Control Flow',
  5: 'Data Structures', 6: 'Functions', 7: 'Functions', 8: 'Pandas',
  9: 'Strings', 10: 'Functions', 11: 'Functions', 12: 'Loops/Control Flow',
  13: 'Lists/Comprehensions', 14: 'Data Structures', 15: 'Loops/Control Flow',
  16: 'Functions', 17: 'Functions', 18: 'Data Structures',
  19: 'Pandas', 20: 'Pandas', 21: 'Pandas', 22: 'Pandas', 23: 'Pandas',
  500: 'Pandas', 501: 'Pandas', 502: 'Pandas', 503: 'Loops/Control Flow',
  504: 'Lists/Comprehensions', 505: 'Dicts/Counters', 506: 'Strings',
  507: 'Pandas', 508: 'Functions', 509: 'Sorting', 510: 'Pandas',
  511: 'Dicts/Counters', 512: 'Pandas', 513: 'Data Structures',
  514: 'Functions', 515: 'Lists/Comprehensions', 516: 'Sorting',
  517: 'Lists/Comprehensions', 518: 'Lists/Comprehensions', 519: 'Dicts/Counters',
};

const metaOfficial: TopicMap = {
  1: 'Aggregation/GROUP BY', 2: 'Aggregation/GROUP BY', 3: 'Window Functions',
  4: 'JOINs', 5: 'CTEs/Subqueries', 6: 'Aggregation/GROUP BY', 7: 'Window Functions',
  8: 'Strings', 9: 'Strings', 10: 'Dicts/Counters', 11: 'Dicts/Counters',
  12: 'Loops/Control Flow', 13: 'Sorting', 14: 'Functions', 15: 'Dicts/Counters',
  16: 'Aggregation/GROUP BY', 17: 'Aggregation/GROUP BY', 18: 'Data Engineering Patterns',
  19: 'Aggregation/GROUP BY', 20: 'Aggregation/GROUP BY',
};

const ALL_MAPPINGS: Partial<Record<QuestionSource, TopicMap>> = {
  sqlBasics,
  sqlAdvanced,
  pythonBasics,
  pythonAdvanced,
  metaOfficial,
};

/** Look up the topic for a given source + question id */
export function getTopicForQuestion(source: QuestionSource, id: number): string | undefined {
  return ALL_MAPPINGS[source]?.[id];
}
