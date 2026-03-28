export interface WriteQuestion {
  id: number;
  category: 'sql' | 'python';
  topic: string;
  difficulty: 1 | 2 | 3;
  question: string;
  answer: string;
  hint?: string;
  tags: string[];
}

export const writeQuestions: WriteQuestion[] = [
  // ═══════════════════════════════════════
  // SQL — BASICS (difficulty 1)
  // ═══════════════════════════════════════
  {
    id: 1, category: 'sql', topic: 'Basics', difficulty: 1,
    question: 'Write the SQL clause order (the order clauses must appear in a query).',
    answer: 'SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT',
    tags: ['clause-order'],
  },
  {
    id: 2, category: 'sql', topic: 'Basics', difficulty: 1,
    question: 'Write a query to count the number of unique users in a table called user_actions.',
    answer: 'SELECT COUNT(DISTINCT user_id) AS unique_users\nFROM user_actions;',
    tags: ['COUNT', 'DISTINCT'],
  },
  {
    id: 3, category: 'sql', topic: 'Basics', difficulty: 1,
    question: 'Write a query to find the top 5 products by revenue from a table called sales (columns: product_id, revenue).',
    answer: 'SELECT product_id, SUM(revenue) AS total_revenue\nFROM sales\nGROUP BY product_id\nORDER BY total_revenue DESC\nLIMIT 5;',
    tags: ['GROUP BY', 'ORDER BY', 'LIMIT'],
  },
  {
    id: 4, category: 'sql', topic: 'Basics', difficulty: 1,
    question: 'Write a WHERE clause to filter rows from the last 7 days. Table has a column called action_date.',
    answer: "WHERE action_date >= CURRENT_DATE - INTERVAL '7 days'",
    tags: ['WHERE', 'date', 'INTERVAL'],
  },
  {
    id: 5, category: 'sql', topic: 'Basics', difficulty: 1,
    question: 'What is the difference between COUNT(*) and COUNT(column_name)?',
    answer: 'COUNT(*) counts ALL rows, including NULLs.\nCOUNT(column_name) counts only NON-NULL values in that column.\n\nExample: if 10 rows but 2 have NULL email:\nCOUNT(*) = 10\nCOUNT(email) = 8',
    tags: ['COUNT', 'NULL'],
  },

  // ═══════════════════════════════════════
  // SQL — JOINs (difficulty 1-2)
  // ═══════════════════════════════════════
  {
    id: 6, category: 'sql', topic: 'JOINs', difficulty: 1,
    question: 'Write an INNER JOIN between employees (id, name, dept_id) and departments (id, dept_name). Show employee name and department name.',
    answer: 'SELECT e.name, d.dept_name\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.id;',
    tags: ['INNER JOIN'],
  },
  {
    id: 7, category: 'sql', topic: 'JOINs', difficulty: 2,
    question: 'Write a query to find products that were NEVER sold. Tables: products (id, name) and sales (id, product_id, amount).',
    answer: 'SELECT p.name\nFROM products p\nLEFT JOIN sales s ON p.id = s.product_id\nWHERE s.product_id IS NULL;',
    hint: 'LEFT JOIN keeps all left rows. NULLs on the right mean no match.',
    tags: ['LEFT JOIN', 'IS NULL', 'never'],
  },
  {
    id: 8, category: 'sql', topic: 'JOINs', difficulty: 2,
    question: 'When do you use INNER JOIN vs LEFT JOIN? Give one example for each.',
    answer: 'INNER JOIN: when you need data from BOTH tables.\nExample: "Show sales with product info" — only rows that match.\n\nLEFT JOIN: when you need ALL from one table, even without matches.\nExample: "Find products never sold" — LEFT JOIN + WHERE IS NULL.',
    tags: ['INNER JOIN', 'LEFT JOIN'],
  },
  {
    id: 9, category: 'sql', topic: 'JOINs', difficulty: 2,
    question: 'Write a self-join to find pairs of employees in the same department. Table: employees (id, name, dept_id).',
    answer: 'SELECT a.name AS emp1, b.name AS emp2\nFROM employees a\nJOIN employees b\n  ON a.dept_id = b.dept_id\n  AND a.id < b.id;\n\n-- a.id < b.id prevents:\n-- 1. Pairing with yourself (Alice, Alice)\n-- 2. Duplicate pairs (Alice,Bob AND Bob,Alice)',
    tags: ['self-join'],
  },

  // ═══════════════════════════════════════
  // SQL — AGGREGATION (difficulty 1-2)
  // ═══════════════════════════════════════
  {
    id: 10, category: 'sql', topic: 'Aggregation', difficulty: 2,
    question: 'Write the AVG CASE percentage trick: what percentage of users have status = "active"? Table: users (id, status).',
    answer: "SELECT\n  AVG(CASE WHEN status = 'active' THEN 1.0 ELSE 0 END) * 100\n    AS pct_active\nFROM users;\n\n-- WHY this works:\n-- Each row becomes 1.0 (active) or 0 (not active)\n-- AVG of 1s and 0s = fraction of actives\n-- × 100 = percentage\n-- Use 1.0 not 1 to avoid integer division",
    tags: ['AVG', 'CASE WHEN', 'percentage'],
  },
  {
    id: 11, category: 'sql', topic: 'Aggregation', difficulty: 1,
    question: 'Write a query to find departments with more than 3 employees. Table: employees (id, name, dept_id).',
    answer: 'SELECT dept_id, COUNT(*) AS emp_count\nFROM employees\nGROUP BY dept_id\nHAVING COUNT(*) > 3;\n\n-- HAVING not WHERE because we filter\n-- AFTER grouping (on the aggregate).\n-- PostgreSQL: can\'t use alias in HAVING.',
    tags: ['GROUP BY', 'HAVING'],
  },
  {
    id: 12, category: 'sql', topic: 'Aggregation', difficulty: 2,
    question: 'Write SUM(CASE WHEN) to pivot: show count of mobile logins vs web logins as separate columns. Table: logins (user_id, device).',
    answer: "SELECT\n  SUM(CASE WHEN device = 'mobile' THEN 1 ELSE 0 END) AS mobile_count,\n  SUM(CASE WHEN device = 'web' THEN 1 ELSE 0 END) AS web_count\nFROM logins;\n\n-- This \"pivots\" rows into columns.\n-- Use SUM not COUNT — COUNT(CASE WHEN) counts\n-- ALL rows because 0 is not NULL.",
    tags: ['SUM', 'CASE WHEN', 'pivot'],
  },
  {
    id: 13, category: 'sql', topic: 'Aggregation', difficulty: 2,
    question: 'Write COUNT DISTINCT + HAVING to find users who logged in from BOTH mobile AND web. Table: logins (user_id, device).',
    answer: "SELECT user_id\nFROM logins\nWHERE device IN ('mobile', 'web')\nGROUP BY user_id\nHAVING COUNT(DISTINCT device) = 2;\n\n-- COUNT(DISTINCT device) = 2 means they\n-- used BOTH devices, not just one.",
    tags: ['COUNT DISTINCT', 'HAVING', 'both'],
  },

  // ═══════════════════════════════════════
  // SQL — WINDOW FUNCTIONS (difficulty 2)
  // ═══════════════════════════════════════
  {
    id: 14, category: 'sql', topic: 'Window Functions', difficulty: 2,
    question: 'Write a query to find the top 3 earners per department. Table: employees (id, name, salary, dept_id).',
    answer: 'WITH ranked AS (\n  SELECT name, salary, dept_id,\n    RANK() OVER (\n      PARTITION BY dept_id\n      ORDER BY salary DESC\n    ) AS rnk\n  FROM employees\n)\nSELECT * FROM ranked WHERE rnk <= 3;\n\n-- PARTITION BY = restart ranking per dept\n-- Must use CTE because can\'t WHERE on\n-- window function in same query',
    tags: ['RANK', 'PARTITION BY', 'CTE', 'top-N'],
  },
  {
    id: 15, category: 'sql', topic: 'Window Functions', difficulty: 2,
    question: 'Write ROW_NUMBER() to find each user\'s FIRST purchase. Table: orders (id, user_id, product, order_date).',
    answer: 'WITH first_orders AS (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY user_id\n    ORDER BY order_date\n  ) AS rn\n  FROM orders\n)\nSELECT * FROM first_orders WHERE rn = 1;\n\n-- ROW_NUMBER: always unique (1,2,3)\n-- WHERE rn = 1 = first per user',
    tags: ['ROW_NUMBER', 'first-per-group'],
  },
  {
    id: 16, category: 'sql', topic: 'Window Functions', difficulty: 2,
    question: 'Write LAG() to show month-over-month revenue change. Table: monthly_revenue (month, revenue).',
    answer: 'SELECT\n  month,\n  revenue,\n  LAG(revenue) OVER (ORDER BY month) AS prev_revenue,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly_revenue;\n\n-- LAG = previous row\'s value\n-- First row: LAG = NULL (no previous)\n-- Growth % = (new - old) * 100.0 / old',
    tags: ['LAG', 'growth', 'MoM'],
  },
  {
    id: 17, category: 'sql', topic: 'Window Functions', difficulty: 2,
    question: 'What does PARTITION BY do? Explain in one sentence, then give an example.',
    answer: 'PARTITION BY draws walls between groups and restarts\nthe window function inside each wall.\n\nWithout PARTITION BY:\n  RANK() OVER (ORDER BY salary DESC)\n  → ranks ALL employees together (1 big group)\n\nWith PARTITION BY:\n  RANK() OVER (PARTITION BY dept ORDER BY salary DESC)\n  → ranks separately within each department',
    tags: ['PARTITION BY', 'concept'],
  },
  {
    id: 18, category: 'sql', topic: 'Window Functions', difficulty: 2,
    question: 'Write SUM() OVER () to calculate each product\'s percentage of total revenue. Table: sales (product, revenue).',
    answer: 'SELECT\n  product,\n  revenue,\n  revenue * 100.0 / SUM(revenue) OVER () AS pct_of_total\nFROM sales;\n\n-- SUM(revenue) OVER () = total across ALL rows\n-- No PARTITION BY = one big window\n-- No GROUP BY needed — keeps individual rows',
    tags: ['SUM OVER', 'percentage-of-total'],
  },
  {
    id: 19, category: 'sql', topic: 'Window Functions', difficulty: 2,
    question: 'Why must window functions go in a CTE when you need to filter on them?',
    answer: 'Window functions run AFTER WHERE/HAVING in SQL\'s\nexecution order. So you can\'t do:\n\n  WHERE RANK() OVER (...) <= 3  -- ERROR\n\nYou must wrap in a CTE first:\n\n  WITH ranked AS (\n    SELECT *, RANK() OVER (...) AS rnk\n    FROM table\n  )\n  SELECT * FROM ranked WHERE rnk <= 3;',
    tags: ['CTE', 'window', 'concept'],
  },

  // ═══════════════════════════════════════
  // SQL — CTEs & NULL (difficulty 2)
  // ═══════════════════════════════════════
  {
    id: 20, category: 'sql', topic: 'CTEs', difficulty: 2,
    question: 'Write two CTEs: first find total orders per user, then find the average of those totals.',
    answer: 'WITH user_totals AS (\n  SELECT user_id, COUNT(*) AS order_count\n  FROM orders\n  GROUP BY user_id\n),\navg_orders AS (\n  SELECT AVG(order_count) AS avg_count\n  FROM user_totals\n)\nSELECT * FROM avg_orders;\n\n-- Two CTEs: ONE WITH keyword, comma separated\n-- NOT: WITH a AS (...) WITH b AS (...)',
    tags: ['CTE', 'two-CTEs'],
  },
  {
    id: 21, category: 'sql', topic: 'NULL Handling', difficulty: 1,
    question: 'Write COALESCE to handle NULL revenue after a LEFT JOIN.',
    answer: 'SELECT\n  p.name,\n  COALESCE(SUM(s.revenue), 0) AS total_revenue\nFROM products p\nLEFT JOIN sales s ON p.id = s.product_id\nGROUP BY p.name;\n\n-- RULE: LEFT JOIN + math = COALESCE first\n-- SUM(NULL) = NULL, not 0\n-- COALESCE(NULL, 0) = 0',
    tags: ['COALESCE', 'NULL', 'LEFT JOIN'],
  },
  {
    id: 22, category: 'sql', topic: 'NULL Handling', difficulty: 1,
    question: 'Write NULLIF to prevent divide-by-zero.',
    answer: 'SELECT\n  conversions * 100.0 / NULLIF(clicks, 0) AS rate\nFROM campaigns;\n\n-- NULLIF(clicks, 0): if clicks = 0, returns NULL\n-- Dividing by NULL = NULL (no error)\n-- Without NULLIF: divide by zero = crash',
    tags: ['NULLIF', 'divide-by-zero'],
  },

  // ═══════════════════════════════════════
  // SQL — UNION & DATES (difficulty 1-2)
  // ═══════════════════════════════════════
  {
    id: 23, category: 'sql', topic: 'UNION', difficulty: 2,
    question: 'Write UNION ALL to count total messages (sent + received) per user. Table: messages (sender_id, receiver_id).',
    answer: 'WITH all_users AS (\n  SELECT sender_id AS user_id FROM messages\n  UNION ALL\n  SELECT receiver_id AS user_id FROM messages\n)\nSELECT user_id, COUNT(*) AS total_messages\nFROM all_users\nGROUP BY user_id;\n\n-- UNION ALL keeps duplicates (for counting)\n-- Flattens two columns into one',
    tags: ['UNION ALL', 'flatten'],
  },
  {
    id: 24, category: 'sql', topic: 'UNION', difficulty: 1,
    question: 'UNION vs UNION ALL — when do you use each?',
    answer: 'UNION = stack + remove duplicates\nUNION ALL = stack + keep everything\n\nUse UNION ALL when:\n- You will aggregate after (COUNT/SUM)\n- Duplicate rows are real data\n\nUse UNION when:\n- You just want a unique list\n\nBoth require same columns and matching types.',
    tags: ['UNION', 'UNION ALL', 'concept'],
  },
  {
    id: 25, category: 'sql', topic: 'Dates', difficulty: 1,
    question: 'Write EXTRACT to get month and year. Also write DATE_TRUNC.',
    answer: "-- EXTRACT: pull out a part\nSELECT EXTRACT(MONTH FROM order_date) AS month,\n       EXTRACT(YEAR FROM order_date) AS year\nFROM orders;\n\n-- DATE_TRUNC: round down to first of period\nSELECT DATE_TRUNC('month', order_date) AS month_start\nFROM orders;\n-- '2026-03-15' → '2026-03-01'",
    tags: ['EXTRACT', 'DATE_TRUNC'],
  },

  // ═══════════════════════════════════════
  // SQL — META SHAPES & TRAPS (difficulty 2-3)
  // ═══════════════════════════════════════
  {
    id: 26, category: 'sql', topic: 'Meta Shapes', difficulty: 3,
    question: 'Write a full query: "What percentage of products are BOTH low fat AND recyclable?" Table: products (id, low_fats ENUM(Y,N), recyclable ENUM(Y,N)).',
    answer: "SELECT\n  AVG(CASE\n    WHEN low_fats = 'Y' AND recyclable = 'Y'\n    THEN 1.0 ELSE 0\n  END) * 100 AS pct_both\nFROM products;",
    tags: ['AVG CASE', 'percentage', 'Meta'],
  },
  {
    id: 27, category: 'sql', topic: 'Meta Shapes', difficulty: 3,
    question: 'Write a full query: "Find users who were active in BOTH January AND February 2026." Table: user_actions (user_id, action_date).',
    answer: "SELECT user_id\nFROM user_actions\nWHERE action_date >= '2026-01-01'\n  AND action_date < '2026-03-01'\nGROUP BY user_id\nHAVING COUNT(DISTINCT DATE_TRUNC('month', action_date)) = 2;",
    tags: ['retention', 'HAVING', 'Meta'],
  },
  {
    id: 28, category: 'sql', topic: 'Traps', difficulty: 1,
    question: 'What\'s wrong with: HAVING cnt > 3 (where cnt is an alias for COUNT(*))?',
    answer: 'PostgreSQL can\'t use alias in HAVING.\nMust repeat the aggregation:\n\nHAVING COUNT(*) > 3  -- correct\nHAVING cnt > 3       -- ERROR in PostgreSQL',
    tags: ['HAVING', 'alias', 'trap'],
  },
  {
    id: 29, category: 'sql', topic: 'Traps', difficulty: 1,
    question: 'What\'s wrong with: COUNT(CASE WHEN status = \'active\' THEN 1 ELSE 0 END)?',
    answer: 'COUNT counts ALL non-NULL values.\n0 is not NULL, so it counts EVERYTHING.\n\nFix: use SUM instead:\nSUM(CASE WHEN status = \'active\' THEN 1 ELSE 0 END)\n\nOr drop the ELSE:\nCOUNT(CASE WHEN status = \'active\' THEN 1 END)',
    tags: ['COUNT', 'SUM', 'CASE WHEN', 'trap'],
  },

  // ═══════════════════════════════════════
  // PYTHON — DICT BASICS (difficulty 1)
  // ═══════════════════════════════════════
  {
    id: 40, category: 'python', topic: 'Dict Basics', difficulty: 1,
    question: 'Create an empty dict, add 3 keys, then loop through keys and values.',
    answer: "d = {}\nd['name'] = 'Alice'\nd['dept'] = 'Engineering'\nd['salary'] = 95000\n\nfor key, value in d.items():\n    print(key, value)\n# name Alice\n# dept Engineering\n# salary 95000",
    tags: ['dict', 'items'],
  },
  {
    id: 41, category: 'python', topic: 'Dict Basics', difficulty: 1,
    question: 'Check if a key exists in a dict. Show two ways.',
    answer: "d = {'name': 'Alice', 'salary': 95000}\n\n# Way 1: \"in\" operator\nif 'name' in d:\n    print('exists')\n\n# Way 2: .get() with default\nsalary = d.get('salary', 0)  # returns 95000\nbonus = d.get('bonus', 0)    # returns 0 (key missing)",
    tags: ['dict', 'in', 'get'],
  },
  {
    id: 42, category: 'python', topic: 'Dict Basics', difficulty: 1,
    question: 'Write a frequency counter: count how many times each word appears in a list.',
    answer: "words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']\n\ncount = {}\nfor word in words:\n    if word not in count:\n        count[word] = 0\n    count[word] += 1\n\n# count = {'apple': 3, 'banana': 2, 'cherry': 1}",
    tags: ['dict', 'frequency', 'counter'],
  },
  {
    id: 43, category: 'python', topic: 'Dict Basics', difficulty: 1,
    question: 'What happens when you assign to an existing dict key? Duplicate or overwrite?',
    answer: "It OVERWRITES. Dict keys are unique.\n\nd = {}\nd['Engineering'] = 'Alice'    # creates key\nd['Marketing'] = 'Bob'        # creates another key\nd['Engineering'] = 'Charlie'  # OVERWRITES Alice\n\nprint(d)\n# {'Engineering': 'Charlie', 'Marketing': 'Bob'}",
    tags: ['dict', 'overwrite', 'concept'],
  },

  // ═══════════════════════════════════════
  // PYTHON — SET BASICS (difficulty 1)
  // ═══════════════════════════════════════
  {
    id: 44, category: 'python', topic: 'Set Basics', difficulty: 1,
    question: 'Create a set from a list. What happens to duplicates?',
    answer: 'nums = [1, 2, 3, 2, 1, 4]\nunique = set(nums)\nprint(unique)  # {1, 2, 3, 4}\n\n# Duplicates automatically removed.\n# Sets only store unique values.\n# Order is NOT guaranteed.',
    tags: ['set', 'duplicates'],
  },
  {
    id: 45, category: 'python', topic: 'Set Basics', difficulty: 1,
    question: 'When do you use a set vs a dict vs a list?',
    answer: "LIST: ordered, duplicates OK\n  employees = ['Alice', 'Bob', 'Alice']\n\nSET: unique items, O(1) lookup, no order\n  seen = {'Alice', 'Bob'}  # fast \"is X here?\"\n\nDICT: key-value pairs, O(1) lookup by key\n  salary = {'Alice': 95000}  # fast \"what's Alice's salary?\"\n\nNeed order? → list\nNeed uniqueness? → set\nNeed lookup by name? → dict",
    tags: ['set', 'dict', 'list', 'concept'],
  },

  // ═══════════════════════════════════════
  // PYTHON — LOOP PATTERNS (difficulty 1)
  // ═══════════════════════════════════════
  {
    id: 46, category: 'python', topic: 'Loop Patterns', difficulty: 1,
    question: 'Write a for loop through a list of dicts. Print each employee\'s name.',
    answer: "employees = [\n    {'name': 'Alice', 'salary': 95000},\n    {'name': 'Bob', 'salary': 72000},\n]\n\nfor emp in employees:\n    print(emp['name'])\n# Alice\n# Bob\n\n# emp is ONE dict per iteration\n# emp['name'] reads the 'name' key",
    tags: ['for', 'dict', 'loop'],
  },
  {
    id: 47, category: 'python', topic: 'Loop Patterns', difficulty: 1,
    question: 'Write the filter pattern: keep only employees with salary > 80000. Return names.',
    answer: "result = []\nfor emp in employees:\n    if emp['salary'] > 80000:\n        result.append(emp['name'])\n# result = ['Alice', 'Charlie']",
    tags: ['filter', 'append', 'if'],
  },
  {
    id: 48, category: 'python', topic: 'Loop Patterns', difficulty: 1,
    question: 'Write enumerate() to print index and value.',
    answer: "names = ['Alice', 'Bob', 'Charlie']\n\nfor i, name in enumerate(names):\n    print(i, name)\n# 0 Alice\n# 1 Bob\n# 2 Charlie\n\n# enumerate gives (index, value) pairs",
    tags: ['enumerate', 'index'],
  },

  // ═══════════════════════════════════════
  // PYTHON — DICT PATTERNS (difficulty 2)
  // ═══════════════════════════════════════
  {
    id: 50, category: 'python', topic: 'Dict Patterns', difficulty: 2,
    question: 'Write the two-dict tracker pattern: find the highest-paid employee per department.',
    answer: "def highest_paid(employees):\n    top_name = {}      # answer dict: dept → name\n    top_salary = {}    # gatekeeper: dept → salary\n    for emp in employees:\n        dept = emp['department']\n        if dept not in top_salary or emp['salary'] > top_salary[dept]:\n            top_name[dept] = emp['name']\n            top_salary[dept] = emp['salary']\n    return top_name",
    tags: ['two-dict', 'tracker', 'highest'],
  },
  {
    id: 51, category: 'python', topic: 'Dict Patterns', difficulty: 2,
    question: 'Write the "create container before using" pattern: group products per customer into sets.',
    answer: "bought = {}\nfor order in orders:\n    cust = order['customer']\n    if cust not in bought:       # first time?\n        bought[cust] = set()     # create empty set\n    bought[cust].add(order['product'])\n\n# Must create set() BEFORE .add()\n# Otherwise: KeyError",
    tags: ['dict', 'set', 'create-before-use'],
  },
  {
    id: 52, category: 'python', topic: 'Dict Patterns', difficulty: 2,
    question: 'Write a dict as lookup table: build salary_map from a list, then look up Alice\'s salary.',
    answer: "salaries = [\n    {'name': 'Alice', 'salary': 95000},\n    {'name': 'Bob', 'salary': 72000},\n]\n\nsalary_map = {}\nfor s in salaries:\n    salary_map[s['name']] = s['salary']\n# salary_map = {'Alice': 95000, 'Bob': 72000}\n\nalice_salary = salary_map['Alice']  # 95000\n# This is a Python JOIN — same as SQL JOIN",
    tags: ['dict', 'lookup', 'JOIN'],
  },
  {
    id: 53, category: 'python', topic: 'Dict Patterns', difficulty: 2,
    question: 'Write two-dict accumulation: total salary and count per department.',
    answer: "dept_totals = {}\ndept_counts = {}\nfor emp in employees:\n    dept = emp['department']\n    if dept not in dept_totals:\n        dept_totals[dept] = 0\n        dept_counts[dept] = 0\n    dept_totals[dept] += emp['salary']\n    dept_counts[dept] += 1\n\nfor dept in dept_totals:\n    avg = dept_totals[dept] // dept_counts[dept]\n    print(dept, avg)",
    tags: ['two-dict', 'accumulation', 'average'],
  },
  {
    id: 54, category: 'python', topic: 'Dict Patterns', difficulty: 1,
    question: 'Why use a dict instead of a list for lookups? What is O(1)?',
    answer: "O(1) = constant time. Same speed regardless of size.\n\nDict: d['Alice'] → instant (O(1))\n  10 items → instant\n  10 million → still instant\n\nList: 'Alice' in my_list → scans one by one (O(n))\n  10 items → checks up to 10\n  10 million → checks up to 10 million\n\nDict uses a hash table — like a book index.",
    tags: ['O(1)', 'dict', 'performance'],
  },

  // ═══════════════════════════════════════
  // PYTHON — SET PATTERNS (difficulty 2)
  // ═══════════════════════════════════════
  {
    id: 55, category: 'python', topic: 'Set Patterns', difficulty: 2,
    question: 'Write issubset to check if a customer bought all required products.',
    answer: "required = set(['laptop', 'phone'])\n\nalice_bought = {'laptop', 'phone', 'tablet'}\nrequired.issubset(alice_bought)  # True\n# \"Is everything I NEED inside what she HAS?\"\n\nbob_bought = {'phone'}\nrequired.issubset(bob_bought)    # False\n# Bob is missing 'laptop'",
    tags: ['issubset', 'set'],
  },

  // ═══════════════════════════════════════
  // PYTHON — SORTING (difficulty 2)
  // ═══════════════════════════════════════
  {
    id: 56, category: 'python', topic: 'Sorting', difficulty: 2,
    question: 'Write sorted() with key=lambda to sort employees by salary, highest first. Return just names.',
    answer: "sorted_emps = sorted(employees,\n    key=lambda x: x['salary'],\n    reverse=True)\n\nresult = []\nfor emp in sorted_emps:\n    result.append(emp['name'])\n# result = ['Charlie', 'Alice', 'Bob']",
    tags: ['sorted', 'lambda', 'reverse'],
  },
  {
    id: 57, category: 'python', topic: 'Sorting', difficulty: 1,
    question: 'Explain key=lambda x: x[\'salary\'] — what does each word mean?',
    answer: "key=        \"sort by this rule\"\nlambda      \"mini function, no name needed\"\nx           \"for each item, call it x\"\n:           \"here's what to do with it\"\nx['salary'] \"pull out the salary value\"\n\nFull meaning: \"for each item, grab its salary,\nand sort by that.\"",
    tags: ['lambda', 'concept'],
  },

  // ═══════════════════════════════════════
  // PYTHON — STRING PARSING (difficulty 2)
  // ═══════════════════════════════════════
  {
    id: 58, category: 'python', topic: 'String Parsing', difficulty: 2,
    question: 'Write split(\' \', 2) to parse a log line. What does the 2 do?',
    answer: "log = \"2026-03-15 ERROR: Connection timeout\"\n\nparts = log.split(' ', 2)\n# parts[0] = \"2026-03-15\"         (date)\n# parts[1] = \"ERROR:\"             (level)\n# parts[2] = \"Connection timeout\"  (message)\n\n# The 2 means: split at most 2 times\n# = maximum 3 pieces\n# Without it: \"Connection timeout\" splits into two",
    tags: ['split', 'parse', 'limit'],
  },
  {
    id: 59, category: 'python', topic: 'String Parsing', difficulty: 2,
    question: 'Write a function to extract only ERROR messages from log strings.',
    answer: "def get_errors(logs):\n    result = []\n    for log in logs:\n        parts = log.split(' ', 2)\n        level = parts[1].replace(':', '')\n        if level == 'ERROR':\n            result.append(parts[2])\n    return result\n\n# Input:  [\"2026-03-15 ERROR: Disk full\"]\n# Output: [\"Disk full\"]",
    tags: ['split', 'filter', 'replace'],
  },

  // ═══════════════════════════════════════
  // PYTHON — NONE HANDLING (difficulty 1-2)
  // ═══════════════════════════════════════
  {
    id: 60, category: 'python', topic: 'None Handling', difficulty: 2,
    question: 'Write forward fill: replace None with the last known value.',
    answer: "def forward_fill(arr):\n    last_val = None\n    for i in range(len(arr)):\n        if arr[i] is not None:\n            last_val = arr[i]   # update memory\n        else:\n            arr[i] = last_val   # fill the gap\n    return arr\n\n# Input:  [1, None, None, 4, None, 6]\n# Output: [1, 1,    1,    4, 4,    6]",
    tags: ['None', 'forward-fill'],
  },
  {
    id: 61, category: 'python', topic: 'None Handling', difficulty: 1,
    question: 'is None vs == None — which is correct and why?',
    answer: "Always use \"is None\" and \"is not None\".\n\nif value is None:     # correct\nif value == None:     # works but bad practice\n\n\"is\" checks identity (is it THE None object?)\n\"==\" checks equality (can be overridden)\n\"is\" is faster and more reliable for None.",
    tags: ['None', 'is', 'concept'],
  },
  {
    id: 62, category: 'python', topic: 'None Handling', difficulty: 1,
    question: 'Write .get() with a default value to safely read from a dict.',
    answer: "emp = {'name': 'Alice', 'salary': 95000}\n\n# Normal: emp['bonus'] → KeyError!\n# Safe:   emp.get('bonus', 0) → returns 0\n\nbonus = emp.get('bonus', 0)    # 0 (missing)\nname = emp.get('name', 'N/A')  # 'Alice' (exists)\n\n# .get(key, default) = give me the value,\n# or this default if key doesn't exist",
    tags: ['get', 'default', 'safe'],
  },

  // ═══════════════════════════════════════
  // PYTHON — COMBINED (difficulty 3)
  // ═══════════════════════════════════════
  {
    id: 65, category: 'python', topic: 'Combined', difficulty: 3,
    question: 'Write a full function: merge two lists of dicts by name (Python JOIN).',
    answer: "def merge_data(names_depts, salaries):\n    # Build lookup from salaries\n    salary_map = {}\n    for s in salaries:\n        salary_map[s['name']] = s['salary']\n\n    # Merge\n    result = []\n    for emp in names_depts:\n        merged = {\n            'name': emp['name'],\n            'department': emp['department'],\n            'salary': salary_map[emp['name']]\n        }\n        result.append(merged)\n    return result",
    tags: ['merge', 'lookup', 'combined'],
  },
  {
    id: 66, category: 'python', topic: 'Combined', difficulty: 3,
    question: 'Write a full function: departments where avg salary > 80000, sorted descending.',
    answer: "def high_paying_depts(employees):\n    dept_totals = {}\n    dept_counts = {}\n    for emp in employees:\n        dept = emp['department']\n        if dept not in dept_totals:\n            dept_totals[dept] = 0\n            dept_counts[dept] = 0\n        dept_totals[dept] += emp['salary']\n        dept_counts[dept] += 1\n    result = []\n    for dept in dept_totals:\n        avg = dept_totals[dept] // dept_counts[dept]\n        if avg > 80000:\n            result.append({'department': dept, 'avg_salary': avg})\n    return sorted(result, key=lambda x: x['avg_salary'], reverse=True)",
    tags: ['accumulation', 'filter', 'sorted', 'combined'],
  },
  {
    id: 67, category: 'python', topic: 'Combined', difficulty: 3,
    question: 'Write a full function: customers who bought ALL required products.',
    answer: "def bought_all(orders, products):\n    required = set(products)\n    bought = {}\n    for order in orders:\n        cust = order['customer']\n        if cust not in bought:\n            bought[cust] = set()\n        bought[cust].add(order['product'])\n    result = []\n    for cust, prods in bought.items():\n        if required.issubset(prods):\n            result.append(cust)\n    return result",
    tags: ['issubset', 'dict-of-sets', 'combined'],
  },

  // ═══════════════════════════════════════
  // PYTHON — CONCEPTS (difficulty 1)
  // ═══════════════════════════════════════
  {
    id: 70, category: 'python', topic: 'Concepts', difficulty: 1,
    question: 'What is O(1)? Give two examples.',
    answer: "O(1) = constant time — same speed regardless of data size.\n\nExamples:\n1. Dict lookup: d['Alice'] → instant\n2. Set membership: 'Alice' in my_set → instant\n\nNOT O(1):\n- List search: 'Alice' in my_list → O(n)\n  Checks each item one by one",
    tags: ['O(1)', 'concept'],
  },
  {
    id: 71, category: 'python', topic: 'Concepts', difficulty: 1,
    question: 'What is a function? Explain def, parentheses, and return.',
    answer: "def = \"define\" — create a new function\n() = parentheses — the inputs it expects\n: = \"here's what it does\"\nreturn = what the machine spits out\n\ndef add(a, b):     # build machine called \"add\"\n    return a + b   # takes a,b, returns sum\n\nresult = add(3, 5) # use it → result = 8",
    tags: ['function', 'def', 'concept'],
  },
  {
    id: 72, category: 'python', topic: 'Concepts', difficulty: 1,
    question: 'What does reverse=True do in sorted()? What\'s the default?',
    answer: "reverse=True = DESCENDING (highest first)\nreverse=False = ASCENDING (lowest first) — DEFAULT\n\nsorted([3, 1, 2])               # [1, 2, 3]\nsorted([3, 1, 2], reverse=True) # [3, 2, 1]\n\nFor \"top N\": always reverse=True\nFor \"first/earliest\": leave default",
    tags: ['sorted', 'reverse', 'concept'],
  },
];
