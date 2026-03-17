import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type SectionKey = 'triggers' | 'joins' | 'aggregation' | 'dates' | 'windows' | 'nulls' | 'strings' | 'ctes' | 'math' | 'traps' | 'pyStructures' | 'pyPatterns' | 'pyTriggers' | 'pyBuiltins' | 'pyCollections' | 'pyComprehensions' | 'pyTraps' | 'methodology' | 'checklist';

const CheatSheet = () => {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['triggers', 'methodology']));

  const toggle = (key: SectionKey) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    const all: SectionKey[] = ['triggers', 'joins', 'aggregation', 'dates', 'windows', 'nulls', 'strings', 'ctes', 'math', 'traps', 'pyStructures', 'pyPatterns', 'pyTriggers', 'pyBuiltins', 'pyCollections', 'pyComprehensions', 'pyTraps', 'methodology', 'checklist'];
    setOpenSections(new Set(all));
  };

  const collapseAll = () => setOpenSections(new Set());

  const Section = ({ id, title, color = 'blue', children }: { id: SectionKey; title: string; color?: 'blue' | 'green'; children: React.ReactNode }) => {
    const isOpen = openSections.has(id);
    const borderColor = color === 'green' ? 'border-green-500' : 'border-blue-500';
    const bgColor = color === 'green' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20';
    return (
      <div className="mb-3">
        <button
          onClick={() => toggle(id)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border-l-4 ${borderColor} ${bgColor} text-left font-semibold text-sm text-gray-800 dark:text-gray-100 hover:opacity-90 transition-opacity`}
        >
          {title}
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isOpen && <div className="mt-2 px-1">{children}</div>}
      </div>
    );
  };

  const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="bg-blue-600 dark:bg-blue-700 text-white text-left px-3 py-2 font-semibold first:rounded-tl-lg last:rounded-tr-lg">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} hover:bg-blue-50 dark:hover:bg-blue-900/20`}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 align-top">
                  {cell.includes('`') ? (
                    <span dangerouslySetInnerHTML={{ __html: cell.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1 rounded text-xs font-mono">$1</code>') }} />
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const Code = ({ children }: { children: string }) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-xs leading-relaxed font-mono">
      <code>{children}</code>
    </pre>
  );

  const Callout = ({ type = 'info', title, children }: { type?: 'info' | 'danger'; title: string; children: React.ReactNode }) => (
    <div className={`p-3 rounded-lg mb-4 border-l-4 text-sm ${
      type === 'danger'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200'
        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-800 dark:text-amber-200'
    }`}>
      <strong className="block mb-1">{title}</strong>
      {children}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 pb-2 mb-2">
          META DE INTERVIEW — CHEAT SHEET
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">SQL (PostgreSQL) + Python · Review before every session</p>
        <div className="flex gap-2 mt-3">
          <button onClick={expandAll} className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50">
            Expand All
          </button>
          <button onClick={collapseAll} className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
            Collapse All
          </button>
        </div>
      </div>

      <Callout type="info" title="CLAUSE ORDER (burn this in):">
        <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-amber-700 dark:text-amber-300">
          SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT
        </code>
      </Callout>

      {/* ===== SQL ===== */}
      <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 pb-2 mb-4 mt-8">SQL CHEAT SHEET</h2>

      <Section id="triggers" title="Question Triggers → SQL Pattern">
        <Table
          headers={['Question says', 'Pattern']}
          rows={[
            ['"What percentage..."', '`AVG(CASE WHEN ... THEN 1.0 ELSE 0 END) * 100`'],
            ['"Count users who [did something]"', 'CTE → then `COUNT(*)`'],
            ['"For each..."', '`GROUP BY`'],
            ['"Top N per group"', 'CTE + `RANK() OVER (PARTITION BY ... ORDER BY ...)` → `WHERE rnk = 1`'],
            ['"Never / don\'t have"', '`LEFT JOIN ... WHERE right.key IS NULL`'],
            ['"More than N" after grouping', '`HAVING COUNT(*) > N`'],
            ['"In the last N days"', '`WHERE date BETWEEN ... AND ...`'],
            ['"Day over day change"', '`LAG() OVER (ORDER BY date)`'],
            ['"Running total"', '`SUM() OVER (ORDER BY date)`'],
            ['"First/last per user"', 'CTE + `ROW_NUMBER() OVER (...)` → `WHERE rn = 1`'],
            ['"Average of totals"', 'CTE for totals → `SELECT AVG()`'],
            ['"Percentage of total"', '`value * 100.0 / SUM(value) OVER ()`'],
            ['"Same day comparison"', 'Self-join on `user_id AND date`'],
          ]}
        />
      </Section>

      <Section id="joins" title="Join Types">
        <Table
          headers={['Type', 'What', 'When']}
          rows={[
            ['`JOIN` (INNER)', 'Only matching rows', 'Sales with product info'],
            ['`LEFT JOIN`', 'All left + NULLs right', 'Find things that DON\'T exist'],
            ['`RIGHT JOIN`', 'All right + NULLs left', 'Rare — flip LEFT'],
            ['`FULL OUTER`', 'All from both', 'Show everything'],
            ['`CROSS JOIN`', 'Every × every', 'Combinations'],
          ]}
        />
      </Section>

      <Section id="aggregation" title="Aggregation Functions">
        <Table
          headers={['Function', 'Does', 'Gotcha']}
          rows={[
            ['`COUNT(*)`', 'All rows', 'Includes NULLs'],
            ['`COUNT(col)`', 'Non-NULL values', 'Skips NULLs'],
            ['`COUNT(DISTINCT col)`', 'Unique values', '"How many different..."'],
            ['`SUM()`', 'Adds values', 'NULL + 5 = NULL'],
            ['`AVG()`', 'Average', 'Same NULL trap'],
            ['`MIN()` / `MAX()`', 'Smallest / largest', 'Works on dates'],
          ]}
        />
      </Section>

      <Section id="dates" title="Date Functions (PostgreSQL)">
        <Table
          headers={['Function', 'Result', 'Example']}
          rows={[
            ['`EXTRACT(MONTH FROM date)`', '1-12', '→ 8 for August'],
            ['`EXTRACT(YEAR FROM date)`', 'Year', '→ 2021'],
            ['`DATE_TRUNC(\'month\', date)`', 'First of month', '→ \'2021-08-01\''],
            ['`date - INTERVAL \'30 days\'`', 'Date math', 'Subtract days'],
            ['`CURRENT_DATE`', 'Today', '"Last N days"'],
            ['`BETWEEN \'...\' AND \'...\'`', 'Range inclusive', 'Date ranges'],
          ]}
        />
      </Section>

      <Section id="windows" title="Window Functions">
        <Table
          headers={['Function', 'What', 'Template']}
          rows={[
            ['`RANK()`', 'Rank, gaps (1,1,3)', '`RANK() OVER (PARTITION BY grp ORDER BY val DESC)`'],
            ['`DENSE_RANK()`', 'No gaps (1,1,2)', 'Same syntax'],
            ['`ROW_NUMBER()`', 'Unique (1,2,3)', '"First per user"'],
            ['`LAG(col, 1)`', 'Previous row', '`LAG(revenue) OVER (ORDER BY date)`'],
            ['`LEAD(col, 1)`', 'Next row', 'Same but forward'],
            ['`SUM() OVER ()`', 'Total all rows', 'For % of total'],
            ['`SUM() OVER (ORDER BY date)`', 'Running total', 'Cumulative'],
          ]}
        />
      </Section>

      <Section id="nulls" title="NULL Handling">
        <Table
          headers={['Function', 'What']}
          rows={[
            ['`COALESCE(a, b)`', 'First non-NULL → `COALESCE(revenue, 0)`'],
            ['`NULLIF(a, b)`', 'NULL if equal → prevents divide by zero'],
            ['`IS NULL`', 'NEVER use `= NULL`'],
            ['NULL + 5', '= NULL — always COALESCE before math'],
          ]}
        />
      </Section>

      <Section id="strings" title="String Functions">
        <Table
          headers={['Function', 'What']}
          rows={[
            ['`LIKE \'%text%\'`', 'Contains (case sensitive)'],
            ['`ILIKE`', 'Case insensitive (PG only)'],
            ['`CONCAT(a, \' \', b)`', 'Join strings'],
            ['`LENGTH(col)`', 'Character count'],
            ['`UPPER()` / `LOWER()`', 'Change case'],
            ['`SUBSTRING(col, start, len)`', 'Extract part'],
            ['`REPLACE(col, old, new)`', 'Replace text'],
          ]}
        />
      </Section>

      <Section id="ctes" title="CTE Patterns">
        <Table
          headers={['Pattern', 'When']}
          rows={[
            ['`WITH a AS (...) SELECT FROM a`', 'One prep step'],
            ['`WITH a AS (...), b AS (...) SELECT`', 'Two steps — ONE with, comma separated'],
            ['CTE + `WHERE rnk = 1`', 'Top N per group'],
            ['CTE + `COUNT(*)`', 'Count things matching grouped condition'],
            ['CTE + subquery in WHERE', 'Aggregate of aggregates'],
          ]}
        />
      </Section>

      <Section id="math" title="Math Formulas">
        <Table
          headers={['Formula', 'SQL']}
          rows={[
            ['Percentage', '`AVG(CASE WHEN ... THEN 1.0 ELSE 0 END) * 100`'],
            ['Percentage change', '`(new - old) * 100.0 / old`'],
            ['Ratio', '`COUNT(*) * 1.0 / COUNT(DISTINCT user_id)`'],
            ['% of total', '`value * 100.0 / SUM(value) OVER ()`'],
            ['Safe division', '`value / NULLIF(denominator, 0)`'],
          ]}
        />

        <Callout type="info" title="WHY AVG OF 1s AND 0s = PERCENTAGE">
          <p className="mb-2">CASE WHEN stamps every row: 1 (yes) or 0 (no). With only 1s and 0s:</p>
          <ul className="list-disc list-inside mb-2 space-y-0.5">
            <li>SUM = how many are 1 (match the condition)</li>
            <li>COUNT = total rows</li>
            <li>AVG = SUM / COUNT = fraction that are 1 = <strong>THE PERCENTAGE</strong></li>
          </ul>
          <p>Example: 5 orders, 3 had promotions → stamps: [1, 1, 1, 0, 0] → AVG = 3/5 = 0.6 → × 100 = <strong>60%</strong></p>
        </Callout>

        <Table
          headers={['Way', 'Code', 'How']}
          rows={[
            ['AVG way', '`AVG(CASE WHEN x THEN 1.0 ELSE 0 END) * 100`', 'AVG does division for you'],
            ['SUM/COUNT way', '`SUM(CASE WHEN x THEN 1 ELSE 0 END) * 100.0 / COUNT(*)`', 'You divide yourself'],
          ]}
        />
      </Section>

      <Section id="traps" title="SQL Syntax Traps">
        <Callout type="danger" title="SYNTAX TRAPS">
          <ul className="space-y-1.5 list-disc list-inside">
            <li><code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">IS NULL</code> never <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">= NULL</code></li>
            <li>HAVING: can't use alias in PostgreSQL — repeat the aggregation</li>
            <li>Integer division: use <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">1.0</code> or <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">100.0</code> for decimals</li>
            <li>ORDER BY defaults ASC — write DESC for top N</li>
            <li>LEFT JOIN: start FROM the table you want ALL rows from</li>
            <li><code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">COUNT(CASE WHEN x THEN 1 ELSE 0)</code> counts ALL rows — use SUM instead</li>
            <li>SELECT must match GROUP BY — every non-agg column</li>
            <li>Two CTEs: ONE with, comma separated. NOT two WITH keywords</li>
          </ul>
        </Callout>
      </Section>

      {/* ===== PYTHON ===== */}
      <h2 className="text-xl font-bold text-green-600 dark:text-green-400 border-b-2 border-green-500 pb-2 mb-4 mt-8">PYTHON CHEAT SHEET</h2>

      <Section id="pyStructures" title="Data Structures" color="green">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Lists (ordered, mutable)</h3>
        <Code>{`nums = [1, 2, 3]
nums.append(4)          # → [1,2,3,4]
nums.pop()              # remove last → 4
nums.sort()             # in-place sort
sorted(nums)            # new sorted list
nums[::-1]              # reversed copy
len(nums)               # length
nums[1:3]               # slice → index 1,2
3 in nums               # → True/False`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Dictionaries (key-value)</h3>
        <Code>{`d = {}
d['key'] = 'value'       # set
d.get('key', 0)          # get with default
d.items()                # (key, value) pairs
d.keys() / d.values()
'key' in d               # check exists
del d['key']             # remove`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Sets (unique, O(1) lookup)</h3>
        <Code>{`s = set([1,2,2,3])       # → {1,2,3}
s.add(4)                 # add
3 in s                   # O(1) check
s1 & s2                  # intersection
s1 | s2                  # union
s1 - s2                  # difference`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Strings (immutable)</h3>
        <Code>{`s.split()                # → ['hello', 'world']
' '.join(list)           # → 'hello world'
s.strip()                # remove whitespace
s.lower() / s.upper()
s.replace('old', 'new')
s[::-1]                  # reverse
len(s)                   # length`}</Code>
      </Section>

      <Section id="pyPatterns" title="Core Patterns" color="green">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Filter</h3>
        <Code>{`def filter_items(items):
    result = []
    for item in items:
        if condition:
            result.append(item)
    return result`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Frequency counter</h3>
        <Code>{`def count_freq(items):
    freq = {}
    for item in items:
        freq[item] = freq.get(item, 0) + 1
    return freq`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Find max from dict</h3>
        <Code>{`best = None
best_count = 0
for key, val in freq.items():
    if val > best_count:
        best = key
        best_count = val`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Dedup preserving order</h3>
        <Code>{`def dedup(items):
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result`}</Code>
      </Section>

      <Section id="pyTriggers" title="Question Triggers → Python Pattern" color="green">
        <Table
          headers={['Question says', 'Pattern']}
          rows={[
            ['"Filter / find items that..."', 'for → if → append'],
            ['"Count frequency"', 'Dict counter or `Counter()`'],
            ['"Most common"', 'Freq dict → find max'],
            ['"Remove duplicates"', 'Set + list for order'],
            ['"Words that don\'t match"', '`set(a) - set(b)`'],
            ['"Check if exists"', '`in set` for O(1)'],
            ['"Group items by..."', '`defaultdict(list)`'],
            ['"Sort by custom rule"', '`sorted(list, key=lambda x: x[\'field\'])`'],
            ['"Reverse string"', '`s[::-1]`'],
            ['"Average of list"', '`sum(list) / len(list)`'],
          ]}
        />
      </Section>

      <Section id="pyBuiltins" title="Useful Built-ins" color="green">
        <Table
          headers={['Function', 'What', 'Example']}
          rows={[
            ['`enumerate(list)`', 'Index + value', '`for i, val in enumerate(nums):`'],
            ['`zip(a, b)`', 'Pair lists', '`for x, y in zip(l1, l2):`'],
            ['`sorted(list, key=...)`', 'Sort with rule', '`sorted(d, key=d.get)`'],
            ['`sum(list)`', 'Total', '`sum([1,2,3]) → 6`'],
            ['`max(d, key=d.get)`', 'Key with highest val', ''],
          ]}
        />
      </Section>

      <Section id="pyCollections" title="Collections Module" color="green">
        <Code>{`from collections import Counter
c = Counter(['a','b','a','c','a'])   # → {'a':3, 'b':1, 'c':1}
c.most_common(2)                     # → [('a',3), ('b',1)]

from collections import defaultdict
d = defaultdict(list)
d['key'].append('val')               # auto-creates empty list
d = defaultdict(int)
d['key'] += 1                        # starts at 0`}</Code>
      </Section>

      <Section id="pyComprehensions" title="Comprehensions" color="green">
        <Code>{`# Filter in one line
evens = [x for x in nums if x % 2 == 0]

# Transform
squares = [x**2 for x in nums]

# Flatten nested list
flat = [item for sub in nested for item in sub]`}</Code>
      </Section>

      <Section id="pyTraps" title="Python Syntax Traps" color="green">
        <Callout type="danger" title="PYTHON SYNTAX TRAPS">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Every <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">def</code>, <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">for</code>, <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">if</code>, <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">elif</code>, <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">else</code> ends with <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">:</code></li>
            <li><code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">=</code> assigns, <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">==</code> compares</li>
            <li><code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">[]</code> = list, <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">{'{}'}</code> = dict or set</li>
            <li><code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">append</code> not <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">appen</code> — double p</li>
            <li><code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">+=</code> not <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">=+</code></li>
            <li><code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">None</code> not <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">null</code>, use <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">is None</code> not <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">== None</code></li>
            <li><code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">not in</code> not <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">!in</code></li>
            <li><code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">7 / 2 = 3.5</code> but <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">7 // 2 = 3</code></li>
          </ul>
        </Callout>
      </Section>

      {/* ===== INTERVIEW ===== */}
      <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 pb-2 mb-4 mt-8">INTERVIEW METHODOLOGY</h2>

      <Section id="methodology" title="Talk Through Every Problem">
        <Table
          headers={['Step', 'Say out loud']}
          rows={[
            ['1', '"Let me make sure I understand — we need..."'],
            ['2', '"My approach: first X, then Y"'],
            ['3', 'Write it'],
            ['4', '"Let me check edge cases — empty input? NULLs? Ties?"'],
            ['5', 'Run it (don\'t manually debug)'],
            ['6', '"I could optimize by..." (only if asked)'],
          ]}
        />
        <Callout type="info" title="META SAYS:">
          <p>You CAN ask for syntax help. Typos don't matter. Think out loud. Get it correct first, optimize later. Listen for hints — they WANT to help.</p>
        </Callout>
      </Section>

      <Section id="checklist" title="Pre-Submit Checklist">
        <Table
          headers={['Check', 'Common miss']}
          rows={[
            ['Column aliases match expected?', 'They give exact names'],
            ['DESC for top N?', 'ORDER BY defaults ASC'],
            ['NULLs handled?', 'LEFT JOINs create them'],
            ['Integer division?', 'Add 1.0 or 100.0'],
            ['GROUP BY matches SELECT?', 'Non-agg columns must match'],
            ['HAVING repeats agg?', 'No alias in PG'],
            ['Date inclusive/exclusive?', '"Up to and including" = <='],
            ['DISTINCT needed?', 'JOINs create dupes'],
          ]}
        />
      </Section>
    </div>
  );
};

export default CheatSheet;
