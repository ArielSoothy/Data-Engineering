# META DE PRODUCT ANALYTICS — COMPLETE KNOWLEDGE MAP

**Last updated:** March 27, 2026 (Day 22)
**Screen date:** March 31, 1PM IST (4 days remaining)
**Interviewer:** Emeka Onwukwe
**Role:** Data Engineer, Product Analytics (L5/L6 evaluation)

### INTERVIEWER PROFILE — Emeka Onwukwe
- **Title:** Data Engineer at Meta (since April 2021, 5 years)
- **Location:** Greater London, UK
- **Background:** Electronic & Computer Engineering degree (Nigeria). Career path: banking analytics (GTBank, ARM) → Team Lead at Aiteo Group → SWE at FairMoney → Meta DE.
- **Technical DNA:** SQL Server, PostgreSQL, Oracle, SSIS, PySpark, Pandas, GCP (BigQuery, DataProc). Strong SQL roots from banking/ETL world.
- **Self-describes as:** "Data Ninja." Values "learning and knowledge sharing" and "humane, results-driven leadership."
- **Interview style (inferred):** 500+ screens done. Won't go off-script. Has a scoring rubric. Will be patient if you think out loud. Respects practical data thinking over clever tricks.
- **What he'll appreciate:** Honesty about approach ("I'd start with a CTE"), clear decomposition, mentioning real-world context (ETL migrations, pipeline validation). Won't appreciate charm or BS — he's seen too many candidates.
- **Common ground with Ariel:** Both came from ETL/DWH background. Both know SSIS pain. Both pivoted careers into bigger companies. Both are self-driven learners.
- **From his Medium blog:** Calls himself "a mediocre data engineer." Values authenticity over performance. Philosophical thinker. Writes to "unlock an epiphany for someone." Doesn't care about political correctness — cares about honesty and self-improvement.
- **Strategy:** Be yourself. Be honest when stuck ("I'm not sure about this part, let me think"). Don't perform or try to impress — he'll see through it instantly. Think out loud, show your reasoning, keep working even when it's hard. He respects the journey, not the polish.

---

## PROGRESS TRACKER

| Metric | Count | Target | Pace |
|--------|-------|--------|------|
| Python problems solved (blank screen) | 20 | 50 | 7 medium drills locked (Days 17-22). All patterns covered. |
| SQL problems solved (blank screen) | 12 | 50 | **CRITICAL: 0 new SQL since Day 16. Must drill Days 23-25** |
| SQL Tier 1 skills (must know cold) | 10 of 11 | 11 | Only RIGHT/FULL JOIN missing (low priority) |
| SQL Tier 2 skills (very likely) | 9 of 9 | 9 | ✅ COMPLETE |
| SQL Tier 3 skills (possible) | 4 of 4 | 4 | ✅ COMPLETE |
| StrataScratch Easy | 6 of 23 | 23 | |
| StrataScratch Medium | 4 of 38 | 15-20 | Focus here for volume |
| StrataScratch Hard | 0 of 16 | 5-8 | After mediums |
| Days elapsed | 22 | 27 | — |
| Ready for Meta screen | ~70% | 85%+ | Python patterns DONE. SQL volume is the last gap. |

---

### PYTHON PROBLEMS COMPLETED
1. Even filter (filter list by condition) ✅
2. Frequency counter (count word occurrences in dict) ✅
3. Most common number (freq counter + find-max) ✅
4. Even filter — cold write confirmed ✅
5. Frequency counter — cold write confirmed ✅
6. Most common — cold write confirmed (Day 5, 1 bug: missing colon) ✅
7. count_words (string.split + freq counter) ✅
8. mismatched words — META REAL Q ✅
9. dedup with set+list ✅
10. Biggest spender — dict in list, sum by key + max() ✅ (Day 15, first Python medium)
11. First duplicate — set as memory, "have I seen this?" pattern ✅ (Day 16)
12. Two Sum — return numbers (set version) ✅ (Day 16)
13. Two Sum — return indices (dict + enumerate version) ✅ (Day 16)
14. **Highest paid per dept — two-dict tracker pattern ✅ (Day 17-22, LOCKED after 6+ attempts)**
15. **Customers who bought all — dict of sets + issubset ✅ (Day 18-22, LOCKED)**
16. **Sort by salary — sorted() + key=lambda ✅ (Day 20, LOCKED)**

### PYTHON PATTERNS LOCKED
- `def → [] → for → if → append → return` (filter pattern)
- `def → {} → for → if not in: =1, else: +=1 → return` (frequency counter)
- Find-max: `best=None, best_count=0, for k,v in d.items(): if v > best_count: update`
- Find-max shortcut: `max(d, key=d.get)`
- Modulo: `num % 2 == 0` for even check
- `.items()` for dict key+value iteration
- No `else` needed when just skipping
- Dedup: set for tracking seen + list for preserving order
- `len()` for comparison
- `.split()` for string → list (must capture: `words = s.split()`)
- `set` for O(1) lookup
- **NEW: Dict in list** — `for order in orders:` then `order['key']` to read
- **NEW: Sum by key** — freq counter but `+= amount` instead of `+= 1`
- **NEW: Set as memory** — "have I seen this before?" → check then add
- **NEW: Complement check** — `diff = target - num`, `if diff in seen`
- **NEW: Dict as memory with position** — `seen[num] = i` for index tracking
- **NEW: enumerate** — `for i, num in enumerate(list):` for index + value
- **NEW: Two-dict tracker** — `top_name[dept]` + `top_salary[dept]`, check gatekeeper, update both together
- **NEW: Dict of sets + issubset** — `bought[name] = set()`, `.add()`, `required.issubset(bought[cust])`
- **NEW: sorted + key=lambda** — `sorted(list, key=lambda x: x['field'], reverse=True)` for custom sorting
- **NEW: "not in" + create pattern** — `if name not in dict: dict[name] = set()` then `dict[name].add()`
- **NEW: .items() unpacking** — `for cust, prods in bought.items():` loop key+value together

### PYTHON SKILLS LEARNED (not yet drilled with problems)
- `zip(a, b)` — pair two lists
- `Counter` from collections — one-line freq counter
- `defaultdict(int)` / `defaultdict(list)` — no KeyError on first access
- List comprehensions — `[x for x in nums if condition]`

### PYTHON DRILLS ALL LOCKED (Day 22)
- **Problem 1: Highest paid per dept** — two-dict tracker ✅
- **Problem 2: Customers who bought all** — dict of sets + issubset ✅
- **Problem 3: Sort by salary** — sorted + key=lambda ✅
- **Problem 4: Merge employee data** — lookup dict (Python JOIN) ✅
- **Problem 5: Parse log entries** — filter + split or 'in' check ✅
- **Problem 6: High paying departments** — two-dict accumulation + filter + sort ✅
- **Problem 7: Forward fill** — single tracker variable for None handling ✅
- **All patterns covered for Meta screen difficulty (35-50)**

### PYTHON RECURRING BUGS (updating)
- **#1 BUG: Indentation after for/if** — appeared in EVERY session Days 17-22. Must indent immediately after `:`.
- Missing colon on `def`/`for`/`if` line (~30% slip, improving)
- Wrong variable from wrong loop — using `name` from loop 1 inside loop 2 (should use `cust`)
- Dict keys need quotes: `d['key']` not `d[key]`
- `not in` forgotten — writing `in` instead of `not in` (critical for gatekeeper check)
- `return results` vs `return result` — extra 's' typo
- `append()` not `append[]` (improving)
- `issubset` direction — `required.issubset(their_set)` not the other way

### PYTHON DIFFICULTY RATINGS

| Rating | Level | Where Ariel is |
|--------|-------|----------------|
| 5-15 | Easy | ✅ Locked |
| 25-30 | Easy-medium | ✅ Just locked (biggest spender, Two Sum) |
| 35-50 | Medium (META SCREEN LEVEL) | Next — need 3-5 more problems |
| 55+ | Hard | Not needed for screen |

---

### SQL PROBLEMS COMPLETED
1. Meta grocery store: pct of product categories never sold — LEFT JOIN direction fix ✅
2. StrataScratch 2004: Comments per user in 30 days — date filtering ✅
3. StrataScratch 2006: Users Activity Per Month — EXTRACT ✅
4. StrataScratch 2061: Users with Many Searches — CTE + COUNT ✅
5. StrataScratch 2062: Questions in Second Quarter — EXTRACT(QUARTER) ✅
6. Meta official Q1: Low Fat and Recyclable — AVG CASE % trick ✅
7. StrataScratch 2069: Sales with Valid Promotion — LEFT JOIN + AVG CASE ✅
8. StrataScratch 2005: Share of Active Users — AVG CASE, first medium, zero corrections ✅
9. StrataScratch 2070: Top Three Classes — RANK() OVER, first window function ✅
10. **StrataScratch 2122: Products Never Sold — double LEFT JOIN chain + CTE + AVG CASE ✅ (Day 13, medium)**
11. **StrataScratch 2071: Both Brands — COUNT(DISTINCT) + HAVING ✅ (Day 13, medium)**
12. **COALESCE revenue problem — SUM with COALESCE inside expression ✅ (Day 14)**

### SQL KEY LEARNINGS
- **Clause order: SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT**
- PostgreSQL: can't use alias in HAVING, must repeat the aggregation
- Can't reference alias in same SELECT — repeat expression or use CTE
- ORDER BY defaults to ASC — always write DESC explicitly for top N
- COUNT(*) counts all rows, COUNT(column) skips NULLs
- **COUNT() returns 0, never NULL — use = 0 not IS NULL**
- COUNT(CASE WHEN) counts ALL rows (0 is not NULL) — use SUM(CASE WHEN) or drop ELSE
- 1.0 not 1 in CASE WHEN for decimal math in percentage trick
- Table aliases (s, p, o) go right after table name in FROM/JOIN
- NULL: never use = NULL, always IS NULL
- LEFT JOIN direction: start FROM the table you want ALL rows from
- **LEFT JOIN + math on right table = COALESCE before calculating**
- Multiple CTEs: comma separated, WITH a AS (...), b AS (...)
- AVG CASE trigger: see "what percentage" → AVG(CASE WHEN ... THEN 1.0 ELSE 0 END) * 100
- WHY AVG CASE = %: AVG of 1s and 0s = fraction of 1s
- Percentage change formula: (new - old) / old * 100
- SUM(x) OVER () = total across all rows without collapsing
- EXTRACT(MONTH/YEAR/QUARTER FROM date) for date parts
- BETWEEN for date ranges, INTERVAL for date math
- "Count things that [condition]" = always 2 passes (CTE + COUNT)
- "Top N include ties" = RANK() OVER. "Just top N" = LIMIT.
- RANK goes in a CTE after GROUP BY — can't combine in one pass
- JOIN type: "top/best/most" = regular JOIN. "Never/missing/zero" = LEFT JOIN
- JOINs work the same inside CTEs, subqueries, or main query
- **"Both X and Y" across rows = WHERE IN + GROUP BY + HAVING COUNT(DISTINCT) = N**
- **DISTINCT goes INSIDE COUNT: COUNT(DISTINCT col) — keyword not function**
- **PARTITION BY = walls between groups, restart count inside each wall**
- **Window function formula: FUNCTION() OVER (PARTITION BY [walls] ORDER BY [sort inside walls])**
- **LAG = previous row's value. LEAD = next row's value. First row LAG = NULL automatically.**
- **UNION = stack + dedup. UNION ALL = stack + keep everything.**
- **Entity in two columns (sender/receiver) → UNION ALL to flatten, then GROUP BY**
- **Self-join: same table joined to itself. Use a.date < b.date to prevent dupes and self-matches.**
- **Self-join = rows × rows per user. The < controls the explosion.**

### SQL WEAK SPOTS (updated)
- **Primary gap: VOLUME on mediums.** Skills are covered. Need 10-15 more medium problem SHAPES.
- Speed: need to get medium questions under 8 min
- Self-join: concept understood, only 0 problems solved with it
- Python: biggest gap is now here, not SQL

### STRATASCRATCH META PROGRESS (80 total questions)

**Easy (23 total):**
- ✅ 2004, 2006, 2061, 2062, 2067, 2069
- ⬜ 2129, 2156, 9765, 9766, 9767, 9768, 9769, 9770, 9771, 9774, 9780, 9787, 9788, 10061, 10087, 10091, 10539, 10561
- Done: 6/23

**Medium (38 total) — THIS IS THE SCREEN DIFFICULTY:**
- ✅ 2005, 2070, 2071, 2122
- ⬜ 2068, 2081, 2084, 2086, 2097, 2119, 2121, 2124, 2149, 2150, 2158
- ⬜ 9773, 9777, 9779, 9781, 9782, 9789, 9792, 10065, 10085, 10088, 10134, 10285, 10288, 10291, 10295, 10296, 10352, 10364, 10538, 10556, 10562, 10567
- Done: 4/38

**Hard (16 total):**
- ⬜ 2007, 2053, 2073, 2120, 2123, 2131, 2165, 9776, 9784, 9790, 9791, 9793, 10062, 10284, 10297, 10350
- Done: 0/16 — exposure only, do 5-8

**Priority: VOLUME on mediums. 2-3 per day minimum.**

---

## GATE 1: TECHNICAL SCREEN (1 hour)

Format: 25min SQL + 25min Python on CoderPad. Schema provided. Code doesn't need to compile perfectly — logical correctness and clarity matter. You CAN ask for syntax help. Typos don't matter.

---

### SQL (25 min — expect 3-5 questions, ~5-7 min each)

**Dialect:** PostgreSQL
**Schema:** Business/e-commerce style (star schema — fact table + dimension tables)

#### TIER 1: MUST KNOW COLD (will appear guaranteed)

| Skill | Status |
|-------|--------|
| JOINs (INNER, LEFT) | ✅ Locked |
| RIGHT/FULL OUTER JOIN | ⬜ Low priority — flip LEFT JOIN |
| GROUP BY + aggregations | ✅ Locked |
| HAVING | ✅ Locked |
| WHERE vs HAVING | ✅ Locked |
| DISTINCT / COUNT(DISTINCT) | ✅ Locked (Both Brands problem, Day 13) |
| ORDER BY + LIMIT | ✅ Locked |
| COALESCE / NULLIF | ✅ Locked (Day 14) |
| CASE WHEN | ✅ Locked — AVG CASE % trick solid |
| Aliases | ✅ Locked |
| Date functions | ✅ EXTRACT, INTERVAL, BETWEEN locked |

**10/11 locked. Only RIGHT/FULL OUTER missing — low priority, just flip LEFT JOIN.**

#### TIER 2: VERY LIKELY (1-2 questions will require these)

| Skill | Status |
|-------|--------|
| Window functions — ROW_NUMBER | ✅ Locked (Day 14) — first order per customer |
| Window functions — RANK / DENSE_RANK | ✅ RANK locked Day 9, DENSE_RANK Day 14 |
| Window functions — LAG / LEAD | ✅ Locked (Day 14) — month over month |
| Window functions — SUM() OVER | ✅ Locked |
| Subqueries (in WHERE, FROM) | ✅ Locked |
| CTEs (WITH clause) | ✅ Locked |
| Self-joins | ✅ Concept + syntax learned (Day 14), 0 problems solved |
| UNION / UNION ALL | ✅ Locked (Day 14) |
| EXISTS / NOT EXISTS | ✅ Learned (Day 14) — alternative to LEFT JOIN + IS NULL |

**9/9 complete.**

#### TIER 3: POSSIBLE (quick patterns)

| Skill | Status |
|-------|--------|
| EXISTS / NOT EXISTS | ✅ Learned |
| CASE WHEN pivot (rows → columns) | ✅ Learned — SUM(CASE WHEN) per value |
| String functions (LIKE, ILIKE) | ✅ Learned |
| Type casting (::type, CAST) | ✅ Learned |

**4/4 complete.**

---

### Python (25 min — expect 2-3 questions)

**Rules:** Pure Python. No pandas, no frameworks. Lists, dicts, sets, strings, objects.

#### PATTERNS LOCKED

| Pattern | Rating | Status |
|---------|--------|--------|
| Filter (for → if → append) | 5 | ✅ |
| Frequency counter (dict) | 10 | ✅ |
| Most common (freq + find max) | 15 | ✅ |
| Dedup with set | 15 | ✅ |
| Count words (split + freq) | 12 | ✅ |
| Set difference | 10 | ✅ |
| Sum by key (dict in list) | 25 | ✅ |
| First duplicate (set as memory) | 28 | ✅ |
| Two Sum — return numbers | 30 | ✅ |
| Two Sum — return indices | 32 | ✅ |

#### PATTERNS NEEDED (not yet drilled with problems)

| Pattern | Rating | Priority |
|---------|--------|----------|
| Grouping with defaultdict(list) | 30 | High — Meta loves grouping |
| Sorting with lambda | 28 | Medium |
| Nested dict manipulation | 35 | High |
| String parsing with conditions | 35 | High |
| Edge case handling (empty, None) | 25 | Medium — discipline not skill |

#### META SCREEN PYTHON DIFFICULTY RANGE

| Question | Expected difficulty | Ariel's current |
|----------|-------------------|----------------|
| Question 1 (warm-up) | 20-30 | ✅ Can handle |
| Question 2 (main) | 35-50 | ⬜ Need 3-5 more problems at this level |
| Question 3 (if time) | 40-55 | ⬜ Stretch goal |

---

## KEY TOOLS & FILES

- **Cheat Sheet v2:** META_CHEAT_SHEET_v2.md / .html (updated Day 14 with schema reading guide, triggers, Meta shapes)
- **Conviction Moments:** META_PREP_CONVICTION_MOMENTS.md
- **Drill prompt:** META_DRILL_SESSION_START.md

---

## PRIORITY SEQUENCE (Updated)

### Phase 1: Days 17-26 (Now → March 30)
**SQL:** Volume on mediums. 2-3 per day. Tools are covered — need problem SHAPES.
**Python:** Push from rating 30 → 40. Grouping, string parsing, nested dicts. 1-2 problems per day.
**Schedule:** Morning = SQL mediums. Evening = Python mediums.

### Phase 2: Days 27-28 (March 29-30) — VACATION
Full-day drilling marathon. Pure repetition + timed mock simulations.
- AM: Timed SQL (3 questions in 25 min)
- PM: Timed Python (2-3 questions in 25 min)
- Evening: Cold rewrites of everything

### Phase 3: Day 29 (March 31) — SCREEN DAY
Light review in morning. Screen at 1PM IST. No new material.

---

## RULES (from documented lessons)

1. **Blank screen only** — no AI, no Copilot during drills
2. **3-4 focused hours/day max**, split into 2 sessions with break
3. **Morning = hard new problems. Evening = rewrites + lower energy work**
4. **Stop signal:** making new mistakes that weren't there before = fatigue, stop
5. **Overnight sleep consolidates patterns** — proved multiple times
6. **Do NOT build tools, dashboards, or prep systems.** Just drill.
7. **WHOLE-PART-WHOLE METHOD:**
   - Step 1: Real question
   - Step 2: Talk through it out loud (decompose BEFORE writing)
   - Step 3: Hit a wall → that wall becomes the mini-drill
   - Step 4: Write the full answer
   - Step 5: Correction table — my code / fix / why
   - Step 6: Rewrite from logic (not memory)
8. **When hitting a wall:** STOP hinting, show full example first, then ask to write it back
9. **New rule (Day 13):** Every new problem starts with decomposition. Read schema → trigger words → say approach out loud → then write.
10. **Repetition sessions saved for Days 27-28.** Daily problems naturally rep old patterns.
11. **4-Step Framework (Day 17+):** Logic → Decompose → Translate → Write. Do steps 1-3 in English BEFORE writing code.
12. **Abandon memory, use logic.** If you can rebuild from understanding, you'll never freeze. Memory is a bonus, logic is the safety net.
13. **ZPD Rule (Vygotsky):** Only learn ONE step beyond current understanding. Two steps ahead = noise. Ask "back up" when lost.
14. **Etymology helps:** Understanding WHY things are named (def = define, lambda = anonymous function from math) builds stronger memory than rote.
15. **Panic voice is real.** It disguises as "let me learn one more thing first." Recognize it and start writing.

---

## CLAUDE CODE SESSION CONTEXT (for continuing on another machine)

### How to Resume
Start a new Claude Code conversation in this project directory and say:
"Read meta_knowledge_map.md and meta_cheat_sheet.md. I'm Ariel, prepping for Meta DE screen March 31. We're drilling Python problems 4-7 (merge data, parse logs, high paying depts, forward fill) then SQL. Teach with etymology, one concept at a time (ZPD), and always explain the WHY. Use the 4-step framework: Logic → Decompose → Translate → Write."

### Session Progress (Days 17-22)
- Built 18 visual learning drills on website (13 Python + 5 SQL) with live values, pseudo code, edge cases, trade-offs
- Added Screen Day Prep page at /screen-prep with Q&A scripts, SQL shapes, Python patterns, behavioral answers
- Locked Python problems 1-3 through blank-screen drilling
- Deep understanding sessions on: dicts, sets, O(1) lookups, function parameters, tuples, issubset direction
- **NOT DONE YET:** Problems 4-7 (seen solutions, not written cold), SQL drilling (0 new problems since Day 16)

### Learning Preferences (for any AI tutor)
- Explain etymology/naming origins of new keywords (builds confidence for non-CS background)
- ONE new concept per problem — never two at once
- Show the full question every time (don't say "scroll up")
- Let me ask "why" questions before writing — it's not procrastination, it's understanding
- When I'm stuck: show full solution first, then ask me to rewrite from logic
- Track recurring bugs explicitly in a table after each attempt
- The 4-step framework reduces panic: Logic → Decompose → Translate → Write