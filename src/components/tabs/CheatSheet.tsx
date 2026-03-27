import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type SectionKey =
  | 'schemaRead'
  | 'questionShape'
  | 'metaShapes'
  | 'schemaCombo'
  | 'joinTree'
  | 'windows'
  | 'rowCompare'
  | 'unionDecision'
  | 'aggregation'
  | 'dates'
  | 'strings'
  | 'nulls'
  | 'ctes'
  | 'selfJoin'
  | 'math'
  | 'traps'
  | 'clauseOrder'
  | 'existsPattern'
  | 'typeCasting'
  | 'sqlChecklist'
  | 'pyPatterns'
  | 'pyGotchas'
  | 'pyChecklist';

const CheatSheet = () => {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(
    new Set(['questionShape', 'metaShapes'])
  );

  const toggle = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allKeys: SectionKey[] = [
    'schemaRead',
    'questionShape',
    'metaShapes',
    'schemaCombo',
    'joinTree',
    'windows',
    'rowCompare',
    'unionDecision',
    'aggregation',
    'dates',
    'strings',
    'nulls',
    'ctes',
    'selfJoin',
    'math',
    'traps',
    'clauseOrder',
    'existsPattern',
    'typeCasting',
    'sqlChecklist',
    'pyPatterns',
    'pyGotchas',
    'pyChecklist',
  ];

  const expandAll = () => setOpenSections(new Set(allKeys));
  const collapseAll = () => setOpenSections(new Set());

  /* ── Shared Components ── */

  const CollapsibleSection = ({
    id,
    title,
    color = 'blue',
    children,
  }: {
    id: SectionKey;
    title: string;
    color?: 'blue' | 'green' | 'purple';
    children: React.ReactNode;
  }) => {
    const isOpen = openSections.has(id);
    const colors = {
      blue: { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      green: { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
      purple: { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    };
    const { border, bg } = colors[color];
    return (
      <div className="mb-3">
        <button
          onClick={() => toggle(id)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border-l-4 ${border} ${bg} text-left font-semibold text-sm text-gray-800 dark:text-gray-100 hover:opacity-90 transition-opacity`}
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
              <th
                key={i}
                className="bg-blue-600 dark:bg-blue-700 text-white text-left px-3 py-2 font-semibold first:rounded-tl-lg last:rounded-tr-lg"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} hover:bg-blue-50 dark:hover:bg-blue-900/20`}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 align-top"
                >
                  {cell.includes('`') ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: cell.replace(
                          /`([^`]+)`/g,
                          '<code class="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1 rounded text-xs font-mono">$1</code>'
                        ),
                      }}
                    />
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const GreenTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="bg-green-600 dark:bg-green-700 text-white text-left px-3 py-2 font-semibold first:rounded-tl-lg last:rounded-tr-lg"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} hover:bg-green-50 dark:hover:bg-green-900/20`}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 align-top"
                >
                  {cell.includes('`') ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: cell.replace(
                          /`([^`]+)`/g,
                          '<code class="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1 rounded text-xs font-mono">$1</code>'
                        ),
                      }}
                    />
                  ) : (
                    cell
                  )}
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

  const Callout = ({
    type = 'info',
    title,
    children,
  }: {
    type?: 'info' | 'danger';
    title: string;
    children: React.ReactNode;
  }) => (
    <div
      className={`p-3 rounded-lg mb-4 border-l-4 text-sm ${
        type === 'danger'
          ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200'
          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-800 dark:text-amber-200'
      }`}
    >
      <strong className="block mb-1">{title}</strong>
      {children}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 pb-2 mb-2">
          META DE INTERVIEW — CHEAT SHEET
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          SQL (PostgreSQL) + Python — Review before every session
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={expandAll}
            className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          30-SECOND PRE-WRITING ROUTINE — always visible, not collapsible
         ══════════════════════════════════════════════════════════════ */}
      <div className="mb-6 p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
        <h3 className="font-bold text-blue-700 dark:text-blue-300 text-sm mb-3">
          30-SECOND PRE-WRITING ROUTINE
        </h3>
        <ol className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
          <li>
            <strong className="text-blue-600 dark:text-blue-400">1. Read the schema (10s)</strong>{' '}
            — How many tables? What columns? Dates? Categories? Two columns same entity (sender_id,
            receiver_id)?
          </li>
          <li>
            <strong className="text-blue-600 dark:text-blue-400">2. Read the question (10s)</strong>{' '}
            — Find the trigger words (percentage, never, top N, first per, day over day)
          </li>
          <li>
            <strong className="text-blue-600 dark:text-blue-400">3. Say out loud (10s)</strong> —
            &quot;I need <em>[what]</em> from <em>[which tables]</em> using <em>[tool]</em>&quot;
          </li>
        </ol>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">Then write.</p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SQL CHEAT SHEET
         ══════════════════════════════════════════════════════════════ */}
      <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 pb-2 mb-4 mt-8">
        SQL CHEAT SHEET
      </h2>

      {/* ── Step 1: Read the Schema ── */}
      <CollapsibleSection id="schemaRead" title="Step 1: Read the Schema First">
        <Table
          headers={['You see in schema', 'Flag it']}
          rows={[
            ['One table only', 'Self-join, window function, or simple GROUP BY territory'],
            ['Two tables sharing a key (`user_id` in both)', 'JOIN territory'],
            ['Two+ tables in a chain (categories -> products -> orders)', 'Multi-JOIN chain territory'],
            ['Date/timestamp column', 'Window functions likely needed'],
            ['Two columns same entity (`sender_id`, `receiver_id`)', 'UNION ALL likely needed'],
            ['One column with categories/types (device, brand, status)', 'GROUP BY + HAVING or PIVOT likely'],
          ]}
        />
      </CollapsibleSection>

      {/* ── Step 2: Question Shape -> Pattern ── */}
      <CollapsibleSection id="questionShape" title="Step 2: Question Triggers -> SQL Pattern">
        <Table
          headers={['Question says', 'Pattern']}
          rows={[
            ['"What percentage..."', '`AVG(CASE WHEN ... THEN 1.0 ELSE 0 END) * 100`'],
            ['"Count users who [did something]"', 'CTE -> then `COUNT(*)`'],
            ['"For each..."', '`GROUP BY`'],
            ['"Top N"', '`ORDER BY DESC` + `LIMIT`'],
            ['"Top N per group"', 'CTE + `RANK() OVER (PARTITION BY ... ORDER BY ...)` -> `WHERE rnk <= N`'],
            ['"Top N including ties"', '`RANK()` or `DENSE_RANK()`'],
            ['"First / last / earliest / latest per..."', 'CTE + `ROW_NUMBER() OVER (...)` -> `WHERE rn = 1`'],
            ['"Never / don\'t have / missing / zero"', '`LEFT JOIN ... WHERE right.key IS NULL` or `NOT EXISTS`'],
            ['"Both X and Y" (across different rows)', '`WHERE col IN (...) GROUP BY ... HAVING COUNT(DISTINCT col) = N`'],
            ['"More than N" after grouping', '`HAVING COUNT(*) > N`'],
            ['"In the last N days"', '`WHERE date >= CURRENT_DATE - INTERVAL \'N days\'`'],
            ['"Day over day change" / "compared to previous"', '`LAG() OVER (ORDER BY date)`'],
            ['"Growth rate" / "month over month"', 'LAG + `(new - old) * 100.0 / old`'],
            ['"Running total" / "cumulative"', '`SUM() OVER (ORDER BY date)`'],
            ['"Percentage of total"', '`value * 100.0 / SUM(value) OVER ()`'],
            ['"Average of totals"', 'CTE for totals -> `SELECT AVG()`'],
            ['"Show X and Y side by side" (same table)', 'Self-join'],
            ['"Find pairs"', 'Self-join with `a.id < b.id`'],
            ['"Compare first vs second" with actual values', 'ROW_NUMBER + self-join'],
            ['"Total across two roles" (sent+received)', 'UNION ALL to flatten -> GROUP BY'],
            ['"Contains / mentions / keyword"', '`ILIKE \'%word%\'` (PG) or `LIKE \'%word%\'`'],
            ['"Breakdown by type as columns"', '`SUM(CASE WHEN col = \'X\' THEN 1 ELSE 0 END)` pivot'],
            ['"Some have no..." / "missing" / "optional"', '`COALESCE(column, 0)`'],
            ['"Rate / ratio / per" (possible zero denominator)', '`column / NULLIF(denominator, 0)`'],
            ['"Unique / different"', '`DISTINCT` or `COUNT(DISTINCT)`'],
            ['"Same day comparison"', 'Self-join on `user_id AND date`'],
          ]}
        />

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 mt-4">
          Example: &quot;What % of users are active?&quot;
        </h3>
        <Code>{`SELECT
  AVG(CASE WHEN status = 'active' THEN 1.0 ELSE 0 END) * 100 AS pct_active
FROM users;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: &quot;Top 3 products per category by revenue&quot;
        </h3>
        <Code>{`WITH ranked AS (
  SELECT *, RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk
  FROM products
)
SELECT * FROM ranked WHERE rnk <= 3;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: &quot;Products never sold&quot;
        </h3>
        <Code>{`SELECT p.name
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
WHERE s.product_id IS NULL;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: &quot;Revenue change month over month&quot;
        </h3>
        <Code>{`SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
  revenue - LAG(revenue) OVER (ORDER BY month) AS change
FROM monthly_rev;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: &quot;Users who logged in from mobile AND web&quot;
        </h3>
        <Code>{`SELECT user_id
FROM logins
WHERE device IN ('mobile', 'web')
GROUP BY user_id
HAVING COUNT(DISTINCT device) = 2;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: &quot;Each user&apos;s first purchase&quot;
        </h3>
        <Code>{`WITH first_purchase AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY purchase_date) AS rn
  FROM orders
)
SELECT * FROM first_purchase WHERE rn = 1;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: &quot;Total messages sent + received per user&quot;
        </h3>
        <Code>{`WITH all_messages AS (
  SELECT sender_id AS user_id, 'sent' AS direction FROM messages
  UNION ALL
  SELECT receiver_id AS user_id, 'received' AS direction FROM messages
)
SELECT user_id, COUNT(*) AS total_messages
FROM all_messages
GROUP BY user_id;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: &quot;Users with more than 5 orders in Q1&quot;
        </h3>
        <Code>{`WITH q1_orders AS (
  SELECT user_id, COUNT(*) AS order_count
  FROM orders
  WHERE order_date >= '2025-01-01' AND order_date < '2025-04-01'
  GROUP BY user_id
)
SELECT user_id, order_count
FROM q1_orders
WHERE order_count > 5;`}</Code>
      </CollapsibleSection>

      {/* ── Meta Question Shapes ── */}
      <CollapsibleSection id="metaShapes" title="Meta Question Shapes (ranked by likelihood)">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Very Likely (expect 1-2 of these)
        </h3>
        <Table
          headers={['Shape', 'Example', 'Tools']}
          rows={[
            ['Percentage of something', '"What % of users are active?"', 'AVG(CASE WHEN) or COUNT/COUNT'],
            ['Top N per group', '"Top 3 products per category by revenue"', 'CTE + RANK + WHERE rnk <= 3'],
            ['Never / missing', '"Products never sold" / "Users who never posted"', 'LEFT JOIN + IS NULL'],
            ['Aggregation + filter', '"Users with more than 5 orders in Q1"', 'WHERE date + GROUP BY + HAVING'],
            ['Time comparison', '"Revenue change month over month"', 'LAG'],
          ]}
        />
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 mt-2">
          Likely (expect 0-1)
        </h3>
        <Table
          headers={['Shape', 'Example', 'Tools']}
          rows={[
            ['Both X and Y', '"Users who logged in from mobile AND web"', 'COUNT(DISTINCT) + HAVING'],
            ['First / last per group', '"Each user\'s first purchase"', 'ROW_NUMBER = 1'],
            ['Flatten two roles', '"Total messages sent + received per user"', 'UNION ALL + GROUP BY'],
            ['Conditional columns', '"Show mobile logins vs web logins per user"', 'SUM(CASE WHEN) pivot'],
          ]}
        />
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 mt-2">
          Possible (know it, less likely)
        </h3>
        <Table
          headers={['Shape', 'Example', 'Tools']}
          rows={[
            ['Side by side comparison', '"Show first and second purchase price"', 'ROW_NUMBER + self-join'],
            ['Pairs', '"Users in same group"', 'Self-join with <'],
            ['Text matching', '"Posts mentioning \'nba\'"', 'ILIKE'],
            ['Safe division', '"Conversion rate per page"', 'NULLIF'],
          ]}
        />
      </CollapsibleSection>

      {/* ── Step 3: Combine Schema + Question ── */}
      <CollapsibleSection id="schemaCombo" title="Step 3: Combine Schema + Question">
        <Table
          headers={['Schema', 'Question', 'Tool']}
          rows={[
            ['One table, category column (device/brand)', '"Users who did both X and Y"', 'COUNT(DISTINCT) + HAVING'],
            ['One table, category column', '"Show X count and Y count as columns"', 'SUM(CASE WHEN) pivot'],
            ['One table, date column', '"Compare to previous period"', 'LAG'],
            ['One table, date column', '"First event per user"', 'ROW_NUMBER = 1'],
            ['One table, date column', '"Show first AND second event values"', 'ROW_NUMBER + self-join'],
            ['One table, no date', '"Find pairs who share something"', 'Self-join with <'],
            ['Two columns same entity (sender/receiver)', '"Total per person across both roles"', 'UNION ALL + GROUP BY'],
            ['Two columns same entity', '"Show sent AND received side by side"', 'Subquery join'],
            ['Two tables with shared key', '"Find what\'s in A but not B"', 'LEFT JOIN + IS NULL'],
            ['Two tables with shared key', '"Combine info from both"', 'INNER JOIN'],
            ['Chain of tables (A -> B -> C)', '"Percentage of A that never appears in C"', 'Multi LEFT JOIN + AVG CASE'],
          ]}
        />
      </CollapsibleSection>

      {/* ── JOIN Decision Tree ── */}
      <CollapsibleSection id="joinTree" title="JOIN Decision Tree">
        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              &quot;Need data from BOTH tables?&quot; &rarr; <span className="text-blue-600 dark:text-blue-400">INNER JOIN</span>
            </p>
            <Code>{`SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;`}</Code>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              &quot;Need ALL from left, even no match?&quot; &rarr; <span className="text-blue-600 dark:text-blue-400">LEFT JOIN</span>
            </p>
            <Code>{`SELECT u.name, COALESCE(o.total, 0) AS total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;`}</Code>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              &quot;Finding what&apos;s MISSING?&quot; &rarr; <span className="text-blue-600 dark:text-blue-400">LEFT JOIN + WHERE IS NULL</span>
            </p>
            <Code>{`SELECT p.name
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
WHERE s.product_id IS NULL;`}</Code>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              &quot;Same table, compare rows?&quot; &rarr; <span className="text-blue-600 dark:text-blue-400">Self-join with a.id &lt; b.id</span>
            </p>
            <Code>{`SELECT a.name AS emp1, b.name AS emp2
FROM employees a
JOIN employees b ON a.dept_id = b.dept_id AND a.id < b.id;`}</Code>
          </div>
        </div>
        <Table
          headers={['Type', 'What it does', 'When']}
          rows={[
            ['`JOIN` (INNER)', 'Only matching rows', '"Show sales with product info"'],
            ['`LEFT JOIN`', 'All left + NULLs if no right match', '"Find things that DON\'T exist"'],
            ['`RIGHT JOIN`', 'All right + NULLs if no left match', 'Rare — flip your LEFT JOIN'],
            ['`FULL OUTER JOIN`', 'All from both, NULLs where no match', '"Show everything"'],
            ['`CROSS JOIN`', 'Every row x every row', 'Generating combinations'],
          ]}
        />
      </CollapsibleSection>

      {/* ── Window Functions ── */}
      <CollapsibleSection id="windows" title="Window Functions">
        <Callout type="info" title="FORMULA">
          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-amber-700 dark:text-amber-300">
            FUNCTION() OVER (PARTITION BY [walls] ORDER BY [sort inside walls])
          </code>
          <p className="mt-1 text-xs">
            = &quot;Do [this math] separately for each [group], sorted by [this].&quot;
          </p>
        </Callout>

        <Table
          headers={['Function', 'When to use', 'Example']}
          rows={[
            ['`RANK()`', '"Top N per group" — gaps for ties (1,1,3)', '`RANK() OVER (PARTITION BY dept ORDER BY salary DESC)`'],
            ['`DENSE_RANK()`', '"Top N including ties" — no gaps (1,1,2)', '`DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)`'],
            ['`ROW_NUMBER()`', '"First per group" — always unique (1,2,3)', '`ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at)`'],
            ['`LAG(col)`', '"Previous row\'s value"', '`LAG(revenue) OVER (ORDER BY date)`'],
            ['`LEAD(col)`', '"Next row\'s value"', '`LEAD(revenue) OVER (ORDER BY date)`'],
            ['`SUM() OVER ()`', '"Percentage of total" — no collapse', '`revenue * 100.0 / SUM(revenue) OVER ()`'],
            ['`SUM() OVER (ORDER BY)`', '"Running total"', '`SUM(revenue) OVER (ORDER BY date)`'],
            ['`SUM() OVER (PARTITION BY)`', '"Group total without GROUP BY" — keeps rows', '`SUM(revenue) OVER (PARTITION BY dept)`'],
          ]}
        />

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          <strong>PARTITION BY</strong> = &quot;draw walls between groups, restart the count/rank inside each wall.&quot;
          Without PARTITION BY = one big window across all rows.
        </p>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 mt-3">
          Example: Top 3 earners per department
        </h3>
        <Code>{`WITH ranked AS (
  SELECT
    name, dept, salary,
    RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT name, dept, salary
FROM ranked
WHERE rnk <= 3;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: Month-over-month growth rate
        </h3>
        <Code>{`SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev,
  (revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0
    / LAG(revenue) OVER (ORDER BY month) AS growth_pct
FROM monthly_rev;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: Each product&apos;s % of total revenue
        </h3>
        <Code>{`SELECT
  product_name,
  revenue,
  revenue * 100.0 / SUM(revenue) OVER () AS pct_of_total
FROM products;`}</Code>

        <Callout type="danger" title="CRITICAL: Window + Filter = CTE">
          <p>
            Window functions go in a CTE when you need to filter on the result (e.g., WHERE rn = 1).
            You cannot filter window results in the same query. Can&apos;t reference alias in same SELECT
            — repeat the expression or wrap in CTE.
          </p>
        </Callout>
      </CollapsibleSection>

      {/* ── When Comparing Rows in Same Table ── */}
      <CollapsibleSection id="rowCompare" title="Comparing Rows in Same Table — Tool Decision">
        <Table
          headers={['Ask yourself', 'If yes, use']}
          rows={[
            ['"Do I just need WHO meets multiple conditions?"', 'COUNT(DISTINCT) + HAVING'],
            ['"Am I comparing to the previous/next row in sequence?"', 'LAG / LEAD'],
            ['"Do I need the first/last/Nth row per group?"', 'ROW_NUMBER'],
            ['"Do I need data from two specific rows SIDE BY SIDE?"', 'Self-join'],
          ]}
        />

        <Table
          headers={['Need', 'Tool']}
          rows={[
            ['Just WHO meets both conditions', 'COUNT(DISTINCT) + HAVING (simpler)'],
            ['Columns from BOTH matched rows side by side', 'Self-join (only option)'],
            ['Quick overlap between two sets', 'INTERSECT (fastest to write)'],
          ]}
        />
      </CollapsibleSection>

      {/* ── UNION vs UNION ALL ── */}
      <CollapsibleSection id="unionDecision" title="UNION vs UNION ALL">
        <Table
          headers={['Ask yourself', 'Answer', 'Use']}
          rows={[
            ['Will I aggregate (COUNT/SUM) after combining?', 'Yes', 'UNION ALL — never lose data'],
            ['Would losing duplicate rows lose real data?', 'Yes', 'UNION ALL'],
            ['Do I just want a unique list?', 'Yes', 'UNION'],
          ]}
        />
        <Callout type="info" title="RULE">
          <p>
            <strong>UNION</strong> = stack + dedup. <strong>UNION ALL</strong> = stack + keep everything.
            Both require same number of columns and matching types.
          </p>
        </Callout>
      </CollapsibleSection>

      {/* ── Aggregation Functions ── */}
      <CollapsibleSection id="aggregation" title="Aggregation Functions">
        <Table
          headers={['Function', 'Does', 'Gotcha']}
          rows={[
            ['`COUNT(*)`', 'Counts all rows', 'Includes NULLs'],
            ['`COUNT(col)`', 'Counts non-NULL', 'Skips NULLs'],
            ['`COUNT(DISTINCT col)`', 'Unique values', '"How many different..."'],
            ['`SUM()`', 'Adds values', 'NULL + 5 = NULL -> COALESCE'],
            ['`AVG()`', 'Average', 'Same NULL trap'],
            ['`MIN()` / `MAX()`', 'Smallest / largest', 'Works on dates too'],
          ]}
        />
        <Callout type="danger" title="COUNT() never returns NULL">
          <p>COUNT() returns 0, never NULL. Don&apos;t use IS NULL on COUNT results — use = 0.</p>
        </Callout>
      </CollapsibleSection>

      {/* ── Date Functions ── */}
      <CollapsibleSection id="dates" title="Date Functions (PostgreSQL)">
        <Table
          headers={['Function', 'Result', 'Example']}
          rows={[
            ['`EXTRACT(MONTH FROM date)`', '1-12', '`EXTRACT(MONTH FROM \'2021-08-15\') -> 8`'],
            ['`EXTRACT(YEAR FROM date)`', 'Year', '-> 2021'],
            ['`EXTRACT(DAY FROM date)`', 'Day of month', '-> 15'],
            ['`DATE_TRUNC(\'month\', date)`', 'First of month', '-> \'2021-08-01\''],
            ['`date - INTERVAL \'30 days\'`', 'Subtract time', 'Date math'],
            ['`CURRENT_DATE`', 'Today', '"Last N days" questions'],
            ['`BETWEEN \'...\' AND \'...\'`', 'Range inclusive', 'Date ranges'],
          ]}
        />
      </CollapsibleSection>

      {/* ── String Functions ── */}
      <CollapsibleSection id="strings" title="String Functions">
        <Table
          headers={['Function', 'What it does']}
          rows={[
            ['`LIKE \'%text%\'`', 'Contains (case sensitive)'],
            ['`ILIKE \'%text%\'`', 'Case insensitive (PG only)'],
            ['`CONCAT(a, \' \', b)`', 'Join strings'],
            ['`LENGTH(col)`', 'Character count'],
            ['`UPPER()` / `LOWER()`', 'Change case'],
            ['`SUBSTRING(col, start, len)`', 'Extract part'],
            ['`REPLACE(col, old, new)`', 'Replace text'],
            ['`TRIM()`', 'Remove whitespace'],
          ]}
        />
        <Callout type="info" title="LIKE patterns">
          <p>
            <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">%text%</code> = contains,{' '}
            <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">text%</code> = starts with,{' '}
            <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">%text</code> = ends with.
            Use ILIKE when question says &quot;containing&quot; without specifying case.
          </p>
        </Callout>
      </CollapsibleSection>

      {/* ── NULL Handling ── */}
      <CollapsibleSection id="nulls" title="NULL Handling">
        <div className="space-y-2 mb-4">
          <div className="p-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Rule 1: LEFT JOIN + math = COALESCE first
            </p>
            <Code>{`-- Every LEFT JOIN: COALESCE right-table columns before math
SELECT u.name, COALESCE(SUM(o.amount), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.name;`}</Code>
          </div>
          <div className="p-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Rule 2: Division might be zero = NULLIF
            </p>
            <Code>{`-- Prevents divide-by-zero error
SELECT revenue / NULLIF(total_orders, 0) AS avg_order_value
FROM departments;`}</Code>
          </div>
          <div className="p-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Rule 3: Never <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">= NULL</code>, always <code className="text-xs font-mono bg-green-100 dark:bg-green-900/40 px-1 rounded">IS NULL</code>
            </p>
            <Code>{`-- WRONG: WHERE status = NULL    (always returns false)
-- RIGHT: WHERE status IS NULL
-- RIGHT: WHERE status IS NOT NULL`}</Code>
          </div>
        </div>
        <Table
          headers={['Function', 'Direction', 'Use']}
          rows={[
            ['`COALESCE(a, b)`', 'NULL -> value', '"Replace NULL with something" -> `COALESCE(revenue, 0)`'],
            ['`NULLIF(a, b)`', 'value -> NULL', '"Make something into NULL" -> prevents divide by zero'],
            ['`IS NULL` / `IS NOT NULL`', 'Check', 'NEVER use `= NULL`'],
          ]}
        />
        <Table
          headers={['Trigger', 'Tool']}
          rows={[
            ['LEFT JOIN + any math on right table', 'COALESCE right columns'],
            ['"missing" / "optional" / "some have no..."', '`COALESCE(column, 0)`'],
            ['Division where denominator might be zero', '`column / NULLIF(denominator, 0)`'],
            ['NULL + 5 = NULL', 'Always COALESCE before math'],
          ]}
        />
      </CollapsibleSection>

      {/* ── CTE Patterns ── */}
      <CollapsibleSection id="ctes" title="CTE Patterns">
        <Table
          headers={['Pattern', 'When']}
          rows={[
            ['`WITH a AS (...) SELECT FROM a`', 'One prep step'],
            ['`WITH a AS (...), b AS (...) SELECT`', 'Two steps — ONE WITH, comma separated'],
            ['CTE + `WHERE rnk = 1`', 'Top N per group (filter window result)'],
            ['CTE + `COUNT(*)`', 'Count things matching grouped condition'],
            ['CTE + subquery in WHERE', 'Compare to aggregate of aggregates'],
          ]}
        />
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Two-CTE example:
        </h3>
        <Code>{`WITH user_totals AS (
  SELECT user_id, SUM(amount) AS total
  FROM orders
  GROUP BY user_id
),
avg_total AS (
  SELECT AVG(total) AS avg_val FROM user_totals
)
SELECT u.user_id, u.total
FROM user_totals u, avg_total a
WHERE u.total > a.avg_val;`}</Code>
      </CollapsibleSection>

      {/* ── Self-Join Patterns ── */}
      <CollapsibleSection id="selfJoin" title="Self-Join Patterns">
        <Table
          headers={['Condition in ON clause', 'Purpose']}
          rows={[
            ['`a.date = b.date`', '"Same day" — things that happened simultaneously'],
            ['`a.date < b.date`', '"Pairs" or "A then B" — prevents dupes and self-matches'],
            ['`a.id <> b.id`', '"Different rows" — excludes self-match, keeps both directions'],
          ]}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <strong>Self-join = same table x same table.</strong> Rows x rows per match. <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;</code> controls the explosion.
        </p>
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: Employees in same department (pairs)
        </h3>
        <Code>{`SELECT a.name AS emp1, b.name AS emp2, a.dept
FROM employees a
JOIN employees b ON a.dept = b.dept AND a.id < b.id;`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Example: Compare first and second purchase price
        </h3>
        <Code>{`WITH numbered AS (
  SELECT user_id, amount,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date) AS rn
  FROM orders
)
SELECT a.user_id, a.amount AS first_amount, b.amount AS second_amount
FROM numbered a
JOIN numbered b ON a.user_id = b.user_id
WHERE a.rn = 1 AND b.rn = 2;`}</Code>
      </CollapsibleSection>

      {/* ── EXISTS / NOT EXISTS ── */}
      <CollapsibleSection id="existsPattern" title="EXISTS / NOT EXISTS">
        <Code>{`-- Users who have ordered
SELECT user_id FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id);

-- Users who NEVER ordered
SELECT user_id FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id);`}</Code>
        <Callout type="info" title="TWO WAYS TO SAY 'NEVER'">
          <p>
            Alternative to LEFT JOIN + IS NULL. If you solve with one and the interviewer asks for another
            way, switch to the other.
          </p>
        </Callout>
      </CollapsibleSection>

      {/* ── Math Formulas ── */}
      <CollapsibleSection id="math" title="Math Formulas">
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
          <p className="mb-2">
            CASE WHEN stamps every row: 1 (yes) or 0 (no). With only 1s and 0s:
          </p>
          <ul className="list-disc list-inside mb-2 space-y-0.5">
            <li>SUM = how many are 1 (match the condition)</li>
            <li>COUNT = total rows</li>
            <li>AVG = SUM / COUNT = fraction that are 1 = <strong>THE PERCENTAGE</strong></li>
          </ul>
          <p>
            Example: 5 orders, 3 had promotions &rarr; stamps: [1, 1, 1, 0, 0] &rarr; AVG = 3/5 = 0.6
            &rarr; x 100 = <strong>60%</strong>
          </p>
        </Callout>

        <Table
          headers={['Way', 'Code', 'How']}
          rows={[
            ['AVG way', '`AVG(CASE WHEN x THEN 1.0 ELSE 0 END) * 100`', 'AVG does division for you'],
            ['SUM/COUNT way', '`SUM(CASE WHEN x THEN 1 ELSE 0 END) * 100.0 / COUNT(*)`', 'You divide yourself'],
          ]}
        />
      </CollapsibleSection>

      {/* ── Syntax Traps ── */}
      <CollapsibleSection id="traps" title="SQL Syntax Traps">
        <Callout type="danger" title="GOTCHAS THAT COST YOU TIME">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>
              HAVING can&apos;t use alias in PostgreSQL — repeat the aggregation
            </li>
            <li>
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">
                COUNT(CASE WHEN x THEN 1 ELSE 0)
              </code>{' '}
              counts ALL rows — use SUM instead
            </li>
            <li>
              Integer division: use{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">1.0</code> or{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">100.0</code>{' '}
              for decimals
            </li>
            <li>
              Two CTEs:{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">
                WITH a AS (...), b AS (...)
              </code>{' '}
              — ONE WITH keyword, comma separated
            </li>
            <li>
              COUNT() returns 0 not NULL — use{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">= 0</code>{' '}
              not{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">IS NULL</code>
            </li>
            <li>
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">IS NULL</code>{' '}
              never{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">= NULL</code>
            </li>
            <li>ORDER BY defaults ASC — write DESC for top N</li>
            <li>
              LEFT JOIN: start FROM the table you want ALL rows from
            </li>
            <li>
              SELECT must match GROUP BY — every non-agg column in SELECT must be in GROUP BY
            </li>
            <li>
              Can&apos;t reference alias in same SELECT — repeat the expression or use CTE
            </li>
            <li>
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">
                COUNT(DISTINCT col)
              </code>{' '}
              — DISTINCT is keyword, no parentheses around it
            </li>
          </ul>
        </Callout>
      </CollapsibleSection>

      {/* ── Clause Order ── */}
      <CollapsibleSection id="clauseOrder" title="Clause Order + Type Casting">
        <Callout type="info" title="CLAUSE ORDER (burn this in)">
          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-amber-700 dark:text-amber-300">
            SELECT &rarr; FROM &rarr; JOIN &rarr; WHERE &rarr; GROUP BY &rarr; HAVING &rarr; ORDER BY &rarr; LIMIT
          </code>
        </Callout>
        <Table
          headers={['Syntax', 'Example']}
          rows={[
            ['`::type`', "`'5'::integer`, `column::text`, `'2021-01-01'::date`"],
            ['`CAST(x AS type)`', '`CAST(\'5\' AS integer)` — ANSI standard'],
          ]}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Main use: fix integer division. Add <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">1.0</code> or{' '}
          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">::numeric</code> when percentages show 0.
        </p>
      </CollapsibleSection>

      {/* ── Common Tricky Patterns ── */}
      <CollapsibleSection id="typeCasting" title="Common Tricky Patterns">
        <Table
          headers={['Situation', 'Solution']}
          rows={[
            ['Deduplicate', '`ROW_NUMBER() OVER (PARTITION BY key ORDER BY date DESC) = 1`'],
            ['Pivot rows -> columns', '`SUM(CASE WHEN cat = \'X\' THEN val END) AS x_total`'],
            ['NULL in math', '`COALESCE(column, 0)`'],
            ['Combine queries', '`UNION` (dedup) or `UNION ALL` (keep dupes)'],
            ['Entity in two columns (sender/receiver)', '`UNION ALL` to flatten into one column first'],
            ['"Both X and Y" across rows', '`WHERE IN + GROUP BY + HAVING COUNT(DISTINCT) = N`'],
          ]}
        />
      </CollapsibleSection>

      {/* ── SQL Pre-Submit Checklist ── */}
      <CollapsibleSection id="sqlChecklist" title="SQL Pre-Submit Checklist">
        <div className="space-y-1.5 text-sm text-gray-800 dark:text-gray-200 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>Column aliases match expected output?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>DESC for top N?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>NULLs handled? (LEFT JOINs introduce them — COALESCE before math)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>Integer division? (add 1.0 or 100.0)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>GROUP BY matches SELECT?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>HAVING repeats aggregation? (no alias in PG)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>Date inclusive/exclusive?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>DISTINCT needed? (JOINs create dupes)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>COUNT = 0 not IS NULL?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">&#9744;</span>
            <span>Window function results filtered in CTE, not same query?</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* ══════════════════════════════════════════════════════════════
          PYTHON CHEAT SHEET
         ══════════════════════════════════════════════════════════════ */}
      <h2 className="text-xl font-bold text-green-600 dark:text-green-400 border-b-2 border-green-500 pb-2 mb-4 mt-8">
        PYTHON CHEAT SHEET
      </h2>

      {/* ── Pattern -> Code Template ── */}
      <CollapsibleSection id="pyPatterns" title="Pattern -> Code Template" color="green">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Two-dict tracker — &quot;Highest/best per group&quot;
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic">
          Meta example: &quot;Find the highest-paid employee in each department&quot;
        </p>
        <Code>{`def best_per_group(employees):
    best = {}       # group -> best value
    best_who = {}   # group -> who has it
    for emp in employees:
        dept = emp['dept']
        sal = emp['salary']
        if dept not in best or sal > best[dept]:
            best[dept] = sal
            best_who[dept] = emp['name']
    return best_who`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Dict of sets + issubset — &quot;Bought all&quot;, &quot;completed all&quot;
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic">
          Meta example: &quot;Users who purchased every product in a category&quot;
        </p>
        <Code>{`def bought_all(purchases, required_items):
    required = set(required_items)
    user_items = {}  # user_id -> set of items
    for p in purchases:
        uid = p['user_id']
        if uid not in user_items:
            user_items[uid] = set()
        user_items[uid].add(p['item'])
    return [uid for uid, items in user_items.items()
            if required.issubset(items)]`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          sorted + key=lambda — &quot;Sort by&quot;, &quot;order by&quot;
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic">
          Meta example: &quot;Sort products by rating descending, then by name&quot;
        </p>
        <Code>{`# Single key
sorted(products, key=lambda x: x['rating'], reverse=True)

# Multiple keys (sort by rating DESC then name ASC)
sorted(products, key=lambda x: (-x['rating'], x['name']))`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Dict as lookup (JOIN) — &quot;Combine two data sources&quot;
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic">
          Meta example: &quot;Match orders with product names&quot;
        </p>
        <Code>{`def join_data(orders, products):
    # Build lookup: product_id -> product_name
    prod_lookup = {p['id']: p['name'] for p in products}
    result = []
    for o in orders:
        name = prod_lookup.get(o['product_id'], 'Unknown')
        result.append({'order_id': o['id'], 'product': name})
    return result`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          split + filter — &quot;Parse strings&quot;, &quot;extract from text&quot;
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic">
          Meta example: &quot;Extract domain from email addresses&quot;
        </p>
        <Code>{`def extract_domains(emails):
    domains = {}
    for email in emails:
        domain = email.split('@')[1]
        domains[domain] = domains.get(domain, 0) + 1
    return domains`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Two-dict accumulation — &quot;Average per group&quot;
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic">
          Meta example: &quot;Average order value per customer&quot;
        </p>
        <Code>{`def avg_per_group(orders):
    totals = {}
    counts = {}
    for o in orders:
        uid = o['user_id']
        totals[uid] = totals.get(uid, 0) + o['amount']
        counts[uid] = counts.get(uid, 0) + 1
    return {uid: totals[uid] / counts[uid] for uid in totals}`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Forward fill — &quot;Replace None/missing&quot;
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic">
          Meta example: &quot;Fill missing sensor readings with last known value&quot;
        </p>
        <Code>{`def forward_fill(data, field):
    last_val = None
    for row in data:
        if row[field] is not None:
            last_val = row[field]
        else:
            row[field] = last_val
    return data`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Frequency counter — &quot;Most common&quot;, &quot;count occurrences&quot;
        </h3>
        <Code>{`def count_freq(items):
    freq = {}
    for item in items:
        freq[item] = freq.get(item, 0) + 1
    return freq

# Find the max
best = max(freq, key=freq.get)`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Filter pattern — &quot;Find items that...&quot;
        </h3>
        <Code>{`def filter_items(items, threshold):
    result = []
    for item in items:
        if item['value'] > threshold:
            result.append(item)
    return result`}</Code>

        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
          Dedup preserving order
        </h3>
        <Code>{`def dedup(items):
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result`}</Code>

        <GreenTable
          headers={['Trigger', 'Pattern']}
          rows={[
            ['"Filter / find items that..."', 'for -> if -> append'],
            ['"Count frequency"', 'Dict counter or `Counter()`'],
            ['"Most common"', 'Freq dict -> find max'],
            ['"Remove duplicates"', 'Set + list for order'],
            ['"Words that don\'t match"', '`set(a) - set(b)`'],
            ['"Check if exists"', '`in set` for O(1)'],
            ['"Group items by..."', '`defaultdict(list)`'],
            ['"Sort by custom rule"', '`sorted(list, key=lambda x: x[\'field\'])`'],
            ['"Reverse string"', '`s[::-1]`'],
            ['"Average of list"', '`sum(list) / len(list)`'],
          ]}
        />
      </CollapsibleSection>

      {/* ── Python Gotchas ── */}
      <CollapsibleSection id="pyGotchas" title="Common Gotchas" color="green">
        <Callout type="danger" title="MISTAKES THAT LOSE POINTS">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>
              Indentation after{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">for</code>/{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">if</code>/{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">def</code>{' '}
              — NEXT line must be indented
            </li>
            <li>
              Dict keys need quotes:{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">emp[&apos;salary&apos;]</code>{' '}
              not{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">emp[salary]</code>
            </li>
            <li>
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">not in</code>{' '}
              not{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">!in</code>{' '}
              for &quot;doesn&apos;t exist&quot; check
            </li>
            <li>
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">is None</code>{' '}
              not{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">== None</code>
            </li>
            <li>
              Create container before using:{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">
                if key not in d: d[key] = set()
              </code>
            </li>
            <li>
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">return result</code>{' '}
              not{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">return results</code>{' '}
              — match your variable name
            </li>
            <li>
              Every{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">def</code>,{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">for</code>,{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">if</code>,{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">elif</code>,{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">else</code>{' '}
              ends with{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">:</code>
            </li>
            <li>
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">=</code> assigns,{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">==</code> compares
            </li>
            <li>
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">+=</code> not{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">=+</code>
            </li>
            <li>
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">7 / 2 = 3.5</code>{' '}
              but{' '}
              <code className="text-xs font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">7 // 2 = 3</code>{' '}
              — know which division you want
            </li>
            <li>
              Using current loop variable, not one from a previous loop
            </li>
          </ul>
        </Callout>
      </CollapsibleSection>

      {/* ── Pre-Submit Checklist (combined) ── */}
      <CollapsibleSection id="pyChecklist" title="Python Pre-Submit Checklist" color="green">
        <div className="space-y-1.5 text-sm text-gray-800 dark:text-gray-200 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">&#9744;</span>
            <span>Indentation correct? (4 spaces after every colon)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">&#9744;</span>
            <span>Colons after def/for/if?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">&#9744;</span>
            <span>Using current loop variable (not one from previous loop)?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">&#9744;</span>
            <span>Dict keys in quotes?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">&#9744;</span>
            <span>Returning the right variable?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">&#9744;</span>
            <span>Container created before use (dict/set/list)?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">&#9744;</span>
            <span>Edge case: empty input handled?</span>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default CheatSheet;
