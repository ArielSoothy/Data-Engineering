# META DE INTERVIEW — CHEAT SHEET v2
## SQL (PostgreSQL) + Python — Print this. Review before every session.

---

# SQL CHEAT SHEET

## THE 30-SECOND PRE-WRITING ROUTINE

Before you type anything at the screen:

1. **Read schema** (10 sec) — how many tables? What columns? Dates? Categories? Two columns same entity?
2. **Read question** (10 sec) — find the trigger words
3. **Say out loud** (10 sec) — "I need [what] from [which tables] using [tool]"

Then write.

---

## STEP 1: READ THE SCHEMA FIRST

| You see in schema | Flag it |
|-------------------|---------|
| One table only | Self-join, window function, or simple GROUP BY territory |
| Two tables sharing a key (user_id in both) | JOIN territory |
| Two+ tables in a chain (categories → products → orders) | Multi-JOIN chain territory |
| Date/timestamp column | Window functions likely needed |
| Two columns holding same entity (sender_id, receiver_id) | UNION ALL likely needed |
| One column with categories/types (device, brand, status) | GROUP BY + HAVING or PIVOT likely |

---

## STEP 2: QUESTION TRIGGERS → SQL PATTERN

| Question says | Pattern |
|--------------|---------|
| "What percentage..." | `AVG(CASE WHEN ... THEN 1.0 ELSE 0 END) * 100` |
| "Count users who [did something]" | CTE → then `COUNT(*)` |
| "For each..." | `GROUP BY` |
| "Top N" | `ORDER BY DESC` + `LIMIT` |
| "Top N per group" | CTE + `RANK() OVER (PARTITION BY ... ORDER BY ...)` → `WHERE rnk <= N` |
| "Top N including ties" | `RANK()` or `DENSE_RANK()` |
| "First / last / earliest / latest per..." | CTE + `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)` → `WHERE rn = 1` |
| "Never / don't have / missing / zero" | `LEFT JOIN ... WHERE right.key IS NULL` or `NOT EXISTS` |
| "Both X and Y" (across different rows) | `WHERE col IN (...) GROUP BY ... HAVING COUNT(DISTINCT col) = N` |
| "More than N" after grouping | `HAVING COUNT(*) > N` |
| "In the last N days" | `WHERE date >= CURRENT_DATE - INTERVAL 'N days'` |
| "Day over day change" / "compared to previous" | `LAG() OVER (ORDER BY date)` |
| "Growth rate" / "month over month" | LAG + `(new - old) * 100.0 / old` |
| "Running total" / "cumulative" | `SUM() OVER (ORDER BY date)` |
| "Percentage of total" | `value * 100.0 / SUM(value) OVER ()` |
| "Average of totals" | CTE for totals → `SELECT AVG()` |
| "Show X and Y side by side" (from same table) | Self-join |
| "Find pairs" | Self-join with `a.id < b.id` |
| "Compare first vs second" with actual values | ROW_NUMBER + self-join |
| "Total across two roles" (sent+received) | UNION ALL to flatten → GROUP BY |
| "Contains / mentions / keyword" | `ILIKE '%word%'` (PG) or `LIKE '%word%'` |
| "Breakdown by type as columns" | `SUM(CASE WHEN col = 'X' THEN 1 ELSE 0 END)` pivot |
| "Some have no..." / "missing" / "optional" | `COALESCE(column, 0)` |
| "Rate / ratio / per" (possible zero denominator) | `column / NULLIF(denominator, 0)` |
| "Unique / different" | `DISTINCT` or `COUNT(DISTINCT)` |
| "Same day comparison" | Self-join on `user_id AND date` |

---

## STEP 3: COMBINE SCHEMA + QUESTION

| Schema | Question | Tool |
|--------|----------|------|
| One table, category column (device/brand) | "Users who did both X and Y" | COUNT(DISTINCT) + HAVING |
| One table, category column | "Show X count and Y count as columns" | SUM(CASE WHEN) pivot |
| One table, date column | "Compare to previous period" | LAG |
| One table, date column | "First event per user" | ROW_NUMBER = 1 |
| One table, date column | "Show first AND second event values" | ROW_NUMBER + self-join |
| One table, no date | "Find pairs who share something" | Self-join with < |
| Two columns same entity (sender/receiver) | "Total per person across both roles" | UNION ALL + GROUP BY |
| Two columns same entity | "Show sent AND received side by side" | Subquery join |
| Two tables with shared key | "Find what's in A but not B" | LEFT JOIN + IS NULL |
| Two tables with shared key | "Combine info from both" | INNER JOIN |
| Chain of tables (A → B → C) | "Percentage of A that never appears in C" | Multi LEFT JOIN + AVG CASE |

---

## META QUESTION SHAPES (ranked by likelihood)

### VERY LIKELY (expect 1-2 of these)

| Shape | Example | Tools |
|-------|---------|-------|
| Percentage of something | "What % of users are active?" | AVG(CASE WHEN) or COUNT/COUNT |
| Top N per group | "Top 3 products per category by revenue" | CTE + RANK + WHERE rnk <= 3 |
| Never/missing | "Products never sold" / "Users who never posted" | LEFT JOIN + IS NULL |
| Aggregation + filter | "Users with more than 5 orders in Q1" | WHERE date + GROUP BY + HAVING |
| Time comparison | "Revenue change month over month" | LAG |

### LIKELY (expect 0-1)

| Shape | Example | Tools |
|-------|---------|-------|
| Both X and Y | "Users who logged in from mobile AND web" | COUNT(DISTINCT) + HAVING |
| First/last per group | "Each user's first purchase" | ROW_NUMBER = 1 |
| Flatten two roles | "Total messages sent + received per user" | UNION ALL + GROUP BY |
| Conditional columns | "Show mobile logins vs web logins per user" | SUM(CASE WHEN) pivot |

### POSSIBLE (know it, less likely)

| Shape | Example | Tools |
|-------|---------|-------|
| Side by side comparison | "Show first and second purchase price" | ROW_NUMBER + self-join |
| Pairs | "Users in same group" | Self-join with < |
| Text matching | "Posts mentioning 'nba'" | ILIKE |
| Safe division | "Conversion rate per page" | NULLIF |

---

## WHEN COMPARING ROWS IN THE SAME TABLE — TOOL DECISION

| Ask yourself | If yes → |
|-------------|----------|
| "Do I just need WHO meets multiple conditions?" | COUNT(DISTINCT) + HAVING |
| "Am I comparing to the previous/next row in sequence?" | LAG / LEAD |
| "Do I need the first/last/Nth row per group?" | ROW_NUMBER |
| "Do I need data from two specific rows SIDE BY SIDE?" | Self-join |

---

## UNION vs UNION ALL DECISION

| Ask yourself | Answer | Use |
|-------------|--------|-----|
| Will I aggregate (COUNT/SUM) after combining? | Yes | UNION ALL — never lose data |
| Would losing duplicate rows lose real data? | Yes | UNION ALL |
| Do I just want a unique list? | Yes | UNION |

**UNION** = stack + dedup. **UNION ALL** = stack + keep everything.
Both require same number of columns and matching types.

---

## COALESCE RULE

**LEFT JOIN + math on right table = COALESCE before calculating.**

Every time you write a LEFT JOIN, ask: "Am I doing math on the right table's columns?"
If yes → `COALESCE(right_table.column, 0)` before any math.

---

## CLAUSE ORDER (burn this in)
```
SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT
```

---

## JOIN TYPES

| Type | What it does | When |
|------|-------------|------|
| JOIN (INNER) | Only matching rows | "Show sales with product info" |
| LEFT JOIN | All left + NULLs if no right match | "Find things that DON'T exist" |
| RIGHT JOIN | All right + NULLs if no left match | Rare — flip your LEFT JOIN |
| FULL OUTER JOIN | All from both, NULLs where no match | "Show everything" |
| CROSS JOIN | Every row × every row | Generating combinations |

---

## AGGREGATION FUNCTIONS

| Function | Does | Gotcha |
|----------|------|--------|
| COUNT(*) | Counts all rows | Includes NULLs |
| COUNT(column) | Counts non-NULL | Skips NULLs |
| COUNT(DISTINCT col) | Unique values | "How many different..." |
| SUM() | Adds values | NULL + 5 = NULL → COALESCE |
| AVG() | Average | Same NULL trap |
| MIN() / MAX() | Smallest / largest | Works on dates too |

**CRITICAL:** COUNT() returns 0, never NULL. Don't use IS NULL on COUNT results — use = 0.

---

## DATE FUNCTIONS (PostgreSQL)

| Function | Result | Example |
|----------|--------|---------|
| `EXTRACT(MONTH FROM date)` | 1-12 | `EXTRACT(MONTH FROM '2021-08-15') → 8` |
| `EXTRACT(YEAR FROM date)` | Year | `→ 2021` |
| `EXTRACT(DAY FROM date)` | Day of month | `→ 15` |
| `DATE_TRUNC('month', date)` | First of month | `→ '2021-08-01'` |
| `date - INTERVAL '30 days'` | Subtract time | Date math |
| `CURRENT_DATE` | Today | "Last N days" questions |
| `BETWEEN '...' AND '...'` | Range inclusive | Date ranges |

---

## WINDOW FUNCTIONS

**Read like English:** `FUNCTION() OVER (PARTITION BY [walls] ORDER BY [sort inside walls])`
= "Do [this math] separately for each [group], sorted by [this]."

| Function | What it does | Template |
|----------|-------------|----------|
| `RANK()` | Rank, gaps for ties (1,1,3) | `RANK() OVER (PARTITION BY group ORDER BY val DESC)` |
| `DENSE_RANK()` | Rank, no gaps (1,1,2) | Same syntax |
| `ROW_NUMBER()` | Unique per row (1,2,3) | "First per user" pattern |
| `LAG(col, 1)` | Previous row's value | `LAG(revenue) OVER (ORDER BY date)` |
| `LEAD(col, 1)` | Next row's value | Same but forward |
| `SUM() OVER ()` | Total across ALL rows | For % of total |
| `SUM() OVER (ORDER BY date)` | Running total | Cumulative |
| `SUM() OVER (PARTITION BY grp)` | Total per group, keeps rows | Group total without GROUP BY |

**PARTITION BY** = "draw walls between groups, restart the count/rank inside each wall."
Without PARTITION BY = one big window across all rows.

**Window functions go in a CTE** when you need to filter on the result (e.g., WHERE rn = 1).
Can't use alias in same SELECT — repeat the expression or wrap in CTE.

---

## STRING FUNCTIONS

| Function | What it does |
|----------|-------------|
| `LIKE '%text%'` | Contains (case sensitive) |
| `ILIKE '%text%'` | Case insensitive (PG only) |
| `CONCAT(a, ' ', b)` | Join strings |
| `LENGTH(col)` | Character count |
| `UPPER() / LOWER()` | Change case |
| `SUBSTRING(col, start, len)` | Extract part |
| `REPLACE(col, old, new)` | Replace text |
| `TRIM()` | Remove whitespace |

**LIKE patterns:** `%text%` = contains, `text%` = starts with, `%text` = ends with.
Use `ILIKE` when question says "containing" without specifying case.

---

## NULL HANDLING

| Function | What it does |
|----------|-------------|
| `COALESCE(a, b)` | First non-NULL → `COALESCE(revenue, 0)` |
| `NULLIF(a, b)` | NULL if equal → prevents divide by zero |
| `IS NULL` | NEVER use `= NULL` |
| `IS NOT NULL` | Check exists |
| NULL + 5 = NULL | Always COALESCE before math |

**COALESCE direction:** NULL → value. "Replace NULL with something."
**NULLIF direction:** value → NULL. "Make something into NULL."

| Trigger | Tool |
|---------|------|
| LEFT JOIN + any math on right table | COALESCE right columns |
| "missing" / "optional" / "some have no..." | COALESCE(column, 0) |
| Division where denominator might be zero | column / NULLIF(denominator, 0) |

---

## TYPE CASTING

| Syntax | Example |
|--------|---------|
| `::type` | `'5'::integer`, `column::text`, `'2021-01-01'::date` |
| `CAST(x AS type)` | `CAST('5' AS integer)` — ANSI standard |

Main use: fix integer division. Add `1.0` or `::numeric` when percentages show 0.

---

## EXISTS / NOT EXISTS

```sql
-- Users who have ordered
SELECT user_id FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id)

-- Users who NEVER ordered
SELECT user_id FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id)
```

Alternative to LEFT JOIN + IS NULL. If you solve with one and Emeka asks for another way, switch to the other.

---

## CTE PATTERNS

| Pattern | When |
|---------|------|
| `WITH a AS (...) SELECT FROM a` | One prep step |
| `WITH a AS (...), b AS (...) SELECT` | Two steps — ONE with, comma separated |
| CTE + `WHERE rnk = 1` | Top N per group |
| CTE + `COUNT(*)` | Count things matching grouped condition |
| CTE + subquery in WHERE | Compare to aggregate of aggregates |

---

## SELF-JOIN PATTERNS

| Condition in ON clause | Purpose |
|----------------------|---------|
| `a.date = b.date` | "Same day" — things that happened simultaneously |
| `a.date < b.date` | "Pairs" or "A then B" — prevents dupes and self-matches |
| `a.id <> b.id` | "Different rows" — excludes self-match, keeps both directions |

**Self-join = same table × same table.** Rows × rows per match. `<` controls the explosion.

| Need | Tool |
|------|------|
| Just WHO meets both conditions | COUNT(DISTINCT) + HAVING (simpler) |
| Columns from BOTH matched rows side by side | Self-join (only option) |
| Quick overlap between two sets | INTERSECT (fastest to write) |

---

## COMMON TRICKY PATTERNS

| Situation | Solution |
|-----------|----------|
| Deduplicate | `ROW_NUMBER() OVER (PARTITION BY key ORDER BY date DESC) = 1` |
| Pivot rows → columns | `SUM(CASE WHEN cat = 'X' THEN val END) AS x_total` |
| NULL in math | `COALESCE(column, 0)` |
| Combine queries | `UNION` (dedup) or `UNION ALL` (keep dupes) |
| Entity in two columns (sender/receiver) | `UNION ALL` to flatten into one column first |
| "Both X and Y" across rows | `WHERE IN + GROUP BY + HAVING COUNT(DISTINCT) = N` |

---

## SYNTAX TRAPS

| Trap | Remember |
|------|----------|
| NULL comparison | `IS NULL` never `= NULL` |
| HAVING with alias | Can't in PostgreSQL — repeat the aggregation |
| Integer division | Use `1.0` or `100.0` for decimals |
| ORDER BY direction | Defaults ASC — write DESC for top N |
| LEFT JOIN direction | FROM the table you want ALL rows from |
| COUNT(CASE WHEN x THEN 1 ELSE 0) | Counts ALL rows — use SUM instead |
| SELECT must match GROUP BY | Non-agg column in SELECT → must be in GROUP BY |
| Two CTEs | One WITH, comma separated. NOT two WITH keywords |
| COUNT() never returns NULL | Returns 0. Use `= 0` not `IS NULL` |
| Can't reference alias in same SELECT | Repeat the expression or use CTE |
| DISTINCT inside COUNT | `COUNT(DISTINCT col)` — DISTINCT is keyword, no parentheses |

---

## MATH FORMULAS

| Formula | SQL |
|---------|-----|
| Percentage | `AVG(CASE WHEN ... THEN 1.0 ELSE 0 END) * 100` |
| Percentage change | `(new - old) * 100.0 / old` |
| Ratio | `COUNT(*) * 1.0 / COUNT(DISTINCT user_id)` |
| Percentage of total | `value * 100.0 / SUM(value) OVER ()` |
| Safe division | `value / NULLIF(denominator, 0)` |

---

## PRE-SUBMIT CHECKLIST

- [ ] Column aliases match expected output?
- [ ] DESC for top N?
- [ ] NULLs handled? (LEFT JOINs introduce them — COALESCE before math)
- [ ] Integer division? (add 1.0 or 100.0)
- [ ] GROUP BY matches SELECT?
- [ ] HAVING repeats aggregation? (no alias in PG)
- [ ] Date inclusive/exclusive?
- [ ] DISTINCT needed? (JOINs create dupes)
- [ ] COUNT = 0 not IS NULL?
- [ ] Window function results filtered in CTE, not same query?

---