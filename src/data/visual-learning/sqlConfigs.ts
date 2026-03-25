import type { VisualConfig, AnimStep } from '../../components/visual-learning/types';

/* ── Helpers ── */

function step(
  id: string,
  label: string,
  dataState: Record<string, unknown>,
  highlights: AnimStep['highlights'] = [],
  description?: string,
): AnimStep {
  return { id, label, highlights, dataState, ...(description ? { description } : {}) };
}

/* ========================================================================
   Config 1: INNER JOIN  (sql-basics:8)
   ======================================================================== */

const innerJoinConfig: VisualConfig = {
  questionId: 'sql-basics:8',
  template: 'table-join',
  title: 'INNER JOIN',
  subtitle: 'Match rows from two tables by a shared column',
  category: 'sql',
  thinking: {
    logic: 'Combine data from two tables where they share a matching key.',
    decomposition: 'For each row in table A, find the matching row in table B. Only keep rows that match in BOTH tables.',
    translation: 'INNER JOIN ... ON a.key = b.key. Only matched rows survive.',
  },
  pseudoCode: `1. Take two tables (employees, departments)
2. For each row in left table:
   a. Look for a matching row in right table (same department_id)
   b. If match found → combine both rows into result
   c. If no match → skip (row is excluded)
3. Only matched rows appear in output`,
  solutionCode: `SELECT e.first_name, e.last_name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;`,
  inputs: [],
  generateSteps: (): AnimStep[] => {
    const leftTable = {
      columns: ['id', 'name', 'dept_id'],
      rows: [
        [1, 'John', 1],
        [2, 'Alice', 1],
        [3, 'Bob', 2],
        [4, 'Carol', 3],
      ],
    };
    const rightTable = {
      columns: ['dept_id', 'name'],
      rows: [
        [1, 'Engineering'],
        [2, 'Sales'],
        [3, 'Marketing'],
        [4, 'HR'],
      ],
    };
    const base = {
      leftTable,
      rightTable,
      joinColumn: 'dept_id',
      joinType: 'inner',
      resultRows: [] as (string | number | null)[][],
      dimmedLeftRows: [] as number[],
      nullRows: [] as number[],
    };

    return [
      step('ij-1', 'Show employees and departments tables', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
      }),
      // John (dept_id=1)
      step('ij-2', 'Scan employee John (dept_id=1)', {
        ...base,
        currentLeftRow: 0,
        matchingRightRows: [],
        scanningRight: true,
      }, [{ elementId: 'left-row-0', action: 'highlight', color: 'blue' }]),
      step('ij-3', 'Match found: Engineering (dept_id=1)', {
        ...base,
        currentLeftRow: 0,
        matchingRightRows: [0],
        scanningRight: false,
      }, [{ elementId: 'right-row-0', action: 'match', color: 'blue' }]),
      step('ij-4', 'Add John + Engineering to result', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering']],
        dimmedLeftRows: [0],
      }),
      // Alice (dept_id=1)
      step('ij-5', 'Scan employee Alice (dept_id=1)', {
        ...base,
        currentLeftRow: 1,
        matchingRightRows: [],
        scanningRight: true,
        resultRows: [['John', 1, 'Engineering']],
        dimmedLeftRows: [0],
      }, [{ elementId: 'left-row-1', action: 'highlight', color: 'blue' }]),
      step('ij-6', 'Match found: Engineering (dept_id=1)', {
        ...base,
        currentLeftRow: 1,
        matchingRightRows: [0],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering']],
        dimmedLeftRows: [0],
      }, [{ elementId: 'right-row-0', action: 'match', color: 'blue' }]),
      step('ij-7', 'Add Alice + Engineering to result', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering']],
        dimmedLeftRows: [0, 1],
      }),
      // Bob (dept_id=2)
      step('ij-8', 'Scan employee Bob (dept_id=2)', {
        ...base,
        currentLeftRow: 2,
        matchingRightRows: [],
        scanningRight: true,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering']],
        dimmedLeftRows: [0, 1],
      }, [{ elementId: 'left-row-2', action: 'highlight', color: 'green' }]),
      step('ij-9', 'Match found: Sales (dept_id=2)', {
        ...base,
        currentLeftRow: 2,
        matchingRightRows: [1],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering']],
        dimmedLeftRows: [0, 1],
      }, [{ elementId: 'right-row-1', action: 'match', color: 'green' }]),
      step('ij-10', 'Add Bob + Sales to result', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering'], ['Bob', 2, 'Sales']],
        dimmedLeftRows: [0, 1, 2],
      }),
      // Carol (dept_id=3)
      step('ij-11', 'Scan employee Carol (dept_id=3)', {
        ...base,
        currentLeftRow: 3,
        matchingRightRows: [],
        scanningRight: true,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering'], ['Bob', 2, 'Sales']],
        dimmedLeftRows: [0, 1, 2],
      }, [{ elementId: 'left-row-3', action: 'highlight', color: 'amber' }]),
      step('ij-12', 'Match found: Marketing (dept_id=3)', {
        ...base,
        currentLeftRow: 3,
        matchingRightRows: [2],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering'], ['Bob', 2, 'Sales']],
        dimmedLeftRows: [0, 1, 2],
      }, [{ elementId: 'right-row-2', action: 'match', color: 'amber' }]),
      step('ij-13', 'INNER JOIN complete: 4 matched rows', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
        resultRows: [
          ['John', 1, 'Engineering'],
          ['Alice', 1, 'Engineering'],
          ['Bob', 2, 'Sales'],
          ['Carol', 3, 'Marketing'],
        ],
        dimmedLeftRows: [0, 1, 2, 3],
      }, [], 'All employees matched a department. HR (dept_id=4) has no employees, so it does not appear.'),
    ];
  },
};

/* ========================================================================
   Config 2: LEFT JOIN  (sql-basics:7)
   ======================================================================== */

const leftJoinConfig: VisualConfig = {
  questionId: 'sql-basics:7',
  template: 'table-join',
  title: 'LEFT JOIN',
  subtitle: 'Keep all left rows, NULL when no match on the right',
  category: 'sql',
  thinking: {
    logic: 'Get all rows from the left table, even if they have no match on the right.',
    decomposition: 'Keep every left row. If match exists → combine. If no match → fill right columns with NULL.',
    translation: 'LEFT JOIN ... ON. Trigger: "never", "missing", "don\'t have". Filter NULLs with WHERE right.col IS NULL.',
  },
  pseudoCode: `1. Take two tables (employees, departments)
2. For each row in LEFT table:
   a. Look for a matching row in right table
   b. If match found → combine both rows
   c. If NO match → keep left row, fill right columns with NULL
3. ALL left rows appear in output (matched or not)
Use for: "find things that DON'T exist" → WHERE right.col IS NULL`,
  solutionCode: `SELECT e.first_name, e.last_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;`,
  inputs: [],
  generateSteps: (): AnimStep[] => {
    const leftTable = {
      columns: ['id', 'name', 'dept_id'],
      rows: [
        [1, 'John', 1],
        [2, 'Alice', 1],
        [3, 'Bob', 2],
        [4, 'Carol', 3],
        [5, 'Eve', 5],
      ],
    };
    const rightTable = {
      columns: ['dept_id', 'name'],
      rows: [
        [1, 'Engineering'],
        [2, 'Sales'],
        [3, 'Marketing'],
        [4, 'HR'],
      ],
    };
    const base = {
      leftTable,
      rightTable,
      joinColumn: 'dept_id',
      joinType: 'left',
      resultRows: [] as (string | number | null)[][],
      dimmedLeftRows: [] as number[],
      nullRows: [] as number[],
    };

    return [
      step('lj-1', 'Show employees and departments tables', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
      }),
      // John
      step('lj-2', 'Scan employee John (dept_id=1)', {
        ...base,
        currentLeftRow: 0,
        matchingRightRows: [],
        scanningRight: true,
      }, [{ elementId: 'left-row-0', action: 'highlight', color: 'blue' }]),
      step('lj-3', 'Match found: Engineering', {
        ...base,
        currentLeftRow: 0,
        matchingRightRows: [0],
        scanningRight: false,
      }, [{ elementId: 'right-row-0', action: 'match', color: 'blue' }]),
      step('lj-4', 'Add John + Engineering to result', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering']],
        dimmedLeftRows: [0],
      }),
      // Alice
      step('lj-5', 'Scan Alice (dept_id=1) — match Engineering', {
        ...base,
        currentLeftRow: 1,
        matchingRightRows: [0],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering']],
        dimmedLeftRows: [0],
      }, [{ elementId: 'left-row-1', action: 'highlight', color: 'blue' }]),
      step('lj-6', 'Add Alice + Engineering to result', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering']],
        dimmedLeftRows: [0, 1],
      }),
      // Bob
      step('lj-7', 'Scan Bob (dept_id=2) — match Sales', {
        ...base,
        currentLeftRow: 2,
        matchingRightRows: [1],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering']],
        dimmedLeftRows: [0, 1],
      }, [{ elementId: 'left-row-2', action: 'highlight', color: 'green' }]),
      step('lj-8', 'Add Bob + Sales to result', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering'], ['Bob', 2, 'Sales']],
        dimmedLeftRows: [0, 1, 2],
      }),
      // Carol
      step('lj-9', 'Scan Carol (dept_id=3) — match Marketing', {
        ...base,
        currentLeftRow: 3,
        matchingRightRows: [2],
        scanningRight: false,
        resultRows: [['John', 1, 'Engineering'], ['Alice', 1, 'Engineering'], ['Bob', 2, 'Sales']],
        dimmedLeftRows: [0, 1, 2],
      }, [{ elementId: 'left-row-3', action: 'highlight', color: 'amber' }]),
      step('lj-10', 'Add Carol + Marketing to result', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
        resultRows: [
          ['John', 1, 'Engineering'],
          ['Alice', 1, 'Engineering'],
          ['Bob', 2, 'Sales'],
          ['Carol', 3, 'Marketing'],
        ],
        dimmedLeftRows: [0, 1, 2, 3],
      }),
      // Eve — no match
      step('lj-11', 'Scan Eve (dept_id=5) — scanning right table...', {
        ...base,
        currentLeftRow: 4,
        matchingRightRows: [],
        scanningRight: true,
        resultRows: [
          ['John', 1, 'Engineering'],
          ['Alice', 1, 'Engineering'],
          ['Bob', 2, 'Sales'],
          ['Carol', 3, 'Marketing'],
        ],
        dimmedLeftRows: [0, 1, 2, 3],
      }, [{ elementId: 'left-row-4', action: 'highlight', color: 'purple' }]),
      step('lj-12', 'No match for Eve — add with NULL (LEFT JOIN keeps row)', {
        ...base,
        currentLeftRow: -1,
        matchingRightRows: [],
        scanningRight: false,
        resultRows: [
          ['John', 1, 'Engineering'],
          ['Alice', 1, 'Engineering'],
          ['Bob', 2, 'Sales'],
          ['Carol', 3, 'Marketing'],
          ['Eve', 5, null],
        ],
        dimmedLeftRows: [0, 1, 2, 3, 4],
        nullRows: [4],
      }, [], 'LEFT JOIN keeps all left rows. Unmatched rows get NULL for right-side columns.'),
    ];
  },
};

/* ========================================================================
   Config 3: GROUP BY + HAVING  (sql-basics:16)
   ======================================================================== */

const groupByConfig: VisualConfig = {
  questionId: 'sql-basics:16',
  template: 'table-groupby',
  title: 'GROUP BY + HAVING',
  subtitle: 'Group rows and filter groups by aggregate condition',
  category: 'sql',
  thinking: {
    logic: 'Count employees per department, but only show departments with more than 1.',
    decomposition: 'Group rows by department. Count each group. Filter: only keep groups where count > 1.',
    translation: 'GROUP BY column. COUNT(*). HAVING COUNT(*) > 1. (HAVING = WHERE for groups.)',
  },
  pseudoCode: `1. Look at all rows in the table
2. GROUP BY: put rows with same department_id together
3. COUNT(*): count how many rows in each group
4. HAVING: only keep groups where count > 1
   (HAVING = WHERE but for groups)
5. Return department_id and count for surviving groups`,
  solutionCode: `SELECT department_id, COUNT(*) AS emp_count
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 1;`,
  inputs: [],
  generateSteps: (): AnimStep[] => {
    const table = {
      columns: ['name', 'dept_id', 'salary'],
      rows: [
        ['John', 1, 95000],
        ['Alice', 1, 102000],
        ['Bob', 2, 85000],
        ['Carol', 3, 78000],
        ['Dave', 1, 88000],
        ['Frank', 2, 91000],
      ] as (string | number)[][],
    };

    const groups: Record<string, { rows: (string | number)[][]; color: string }> = {
      '1': { rows: [['John', 1, 95000], ['Alice', 1, 102000], ['Dave', 1, 88000]], color: 'blue' },
      '2': { rows: [['Bob', 2, 85000], ['Frank', 2, 91000]], color: 'green' },
      '3': { rows: [['Carol', 3, 78000]], color: 'amber' },
    };

    const aggregates: Record<string, { count: number; sum: number; avg: number }> = {
      '1': { count: 3, sum: 285000, avg: 95000 },
      '2': { count: 2, sum: 176000, avg: 88000 },
      '3': { count: 1, sum: 78000, avg: 78000 },
    };

    const base = {
      table,
      groupColumn: 'dept_id',
      havingFilter: 'COUNT(*) > 1',
    };

    return [
      step('gb-1', 'Show flat employee table', {
        ...base,
        groups: {},
        currentRow: -1,
        aggregates: {},
        filteredGroups: [],
        phase: 'coloring',
      }),
      step('gb-2', 'Color rows by dept_id', {
        ...base,
        groups,
        currentRow: 5,
        aggregates: {},
        filteredGroups: [],
        phase: 'coloring',
      }, [{ elementId: 'group-col', action: 'highlight', color: 'indigo' }]),
      step('gb-3', 'Group rows with same dept_id together', {
        ...base,
        groups,
        currentRow: -1,
        aggregates: {},
        filteredGroups: [],
        phase: 'grouping',
      }),
      step('gb-4', 'Calculate COUNT(*) for each group', {
        ...base,
        groups,
        currentRow: -1,
        aggregates,
        filteredGroups: [],
        phase: 'aggregating',
      }),
      step('gb-5', 'Apply HAVING COUNT(*) > 1 — filter out small groups', {
        ...base,
        groups,
        currentRow: -1,
        aggregates,
        filteredGroups: ['1', '2'],
        phase: 'filtering',
      }, [], 'dept_id=3 has only 1 row, so it is excluded by the HAVING clause.'),
      step('gb-6', 'Result: 2 groups with more than 1 employee', {
        ...base,
        groups,
        currentRow: -1,
        aggregates,
        filteredGroups: ['1', '2'],
        phase: 'filtering',
      }),
    ];
  },
};

/* ========================================================================
   Config 4: CASE WHEN  (sql-basics:41)
   ======================================================================== */

const caseWhenConfig: VisualConfig = {
  questionId: 'sql-basics:41',
  template: 'table-casewhen',
  title: 'CASE WHEN',
  subtitle: 'Categorize rows based on conditions',
  category: 'sql',
  thinking: {
    logic: 'Count how many users are active, inactive, and pending — as separate columns.',
    decomposition: 'For each row, check status. Assign 1 to the matching category column. COUNT each category.',
    translation: 'COUNT(CASE WHEN status = X THEN 1 END) for each category. Pivot: rows → columns.',
  },
  pseudoCode: `1. For each row, check the status column
2. CASE WHEN status = 'active' → count as 1 for active_count
   CASE WHEN status = 'inactive' → count as 1 for inactive_count
   CASE WHEN status = 'pending' → count as 1 for pending_count
3. COUNT adds up the 1s per category
4. Result: one row with three columns (pivot)
Think of it as: rows → columns transformation`,
  solutionCode: `SELECT
  COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_count,
  COUNT(CASE WHEN status = 'inactive' THEN 1 END) AS inactive_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count
FROM users;`,
  inputs: [],
  generateSteps: (): AnimStep[] => {
    const table = {
      columns: ['user_id', 'name', 'status'],
      rows: [
        [1, 'Anna', 'active'],
        [2, 'Ben', 'inactive'],
        [3, 'Chloe', 'active'],
        [4, 'Dan', 'pending'],
        [5, 'Emma', 'active'],
        [6, 'Fred', 'inactive'],
      ] as (string | number)[][],
    };

    const conditions = [
      { when: "status = 'active'", then: 'active_count', color: 'green' },
      { when: "status = 'inactive'", then: 'inactive_count', color: 'red' },
      { when: "status = 'pending'", then: 'pending_count', color: 'yellow' },
    ];

    const base = { table, conditions };

    return [
      step('cw-1', 'Show users table — evaluate each row with CASE', {
        ...base,
        currentRow: -1,
        results: [null, null, null, null, null, null],
        evaluating: '',
      }),
      step('cw-2', "Evaluate Anna: status = 'active'? Yes", {
        ...base,
        currentRow: 0,
        results: ['active_count', null, null, null, null, null],
        evaluating: "CASE WHEN status = 'active' THEN 1 END",
      }, [{ elementId: 'row-0', action: 'highlight', color: 'green' }]),
      step('cw-3', "Evaluate Ben: status = 'inactive'? Yes", {
        ...base,
        currentRow: 1,
        results: ['active_count', 'inactive_count', null, null, null, null],
        evaluating: "CASE WHEN status = 'inactive' THEN 1 END",
      }, [{ elementId: 'row-1', action: 'highlight', color: 'red' }]),
      step('cw-4', "Evaluate Chloe: status = 'active'? Yes", {
        ...base,
        currentRow: 2,
        results: ['active_count', 'inactive_count', 'active_count', null, null, null],
        evaluating: "CASE WHEN status = 'active' THEN 1 END",
      }, [{ elementId: 'row-2', action: 'highlight', color: 'green' }]),
      step('cw-5', "Evaluate Dan: status = 'pending'? Yes", {
        ...base,
        currentRow: 3,
        results: ['active_count', 'inactive_count', 'active_count', 'pending_count', null, null],
        evaluating: "CASE WHEN status = 'pending' THEN 1 END",
      }, [{ elementId: 'row-3', action: 'highlight', color: 'yellow' }]),
      step('cw-6', 'Evaluate Emma and Fred', {
        ...base,
        currentRow: 5,
        results: ['active_count', 'inactive_count', 'active_count', 'pending_count', 'active_count', 'inactive_count'],
        evaluating: '',
      }),
      step('cw-7', 'Final counts: active=3, inactive=2, pending=1', {
        ...base,
        currentRow: -1,
        results: ['active_count', 'inactive_count', 'active_count', 'pending_count', 'active_count', 'inactive_count'],
        evaluating: '',
      }, [], 'CASE WHEN categorizes each row. COUNT aggregates the non-NULL results per category.'),
    ];
  },
};

/* ========================================================================
   Config 5: LAG  (sql-basics:43)
   ======================================================================== */

const lagConfig: VisualConfig = {
  questionId: 'sql-basics:43',
  template: 'table-window',
  title: 'LAG — Day-Over-Day Change',
  subtitle: 'Access previous row values with window functions',
  category: 'sql',
  thinking: {
    logic: 'Show each day\'s revenue alongside the previous day\'s, and the difference.',
    decomposition: 'Order by date. For each row, look at the previous row\'s revenue. Subtract to get change.',
    translation: 'LAG(revenue) OVER (ORDER BY date). Subtract: revenue - LAG(revenue). First row = NULL (no previous).',
  },
  pseudoCode: `1. Order all rows by date
2. For each row, LAG looks at the PREVIOUS row's revenue
   - First row has no previous → NULL
3. Subtract: current revenue - previous revenue = change
4. Result: each row shows today's revenue, yesterday's, and the difference
Trigger: "day over day", "compared to previous", "growth"`,
  solutionCode: `SELECT
  report_date, revenue,
  LAG(revenue) OVER (ORDER BY report_date) AS prev_revenue,
  revenue - LAG(revenue) OVER (ORDER BY report_date) AS change
FROM daily_revenue;`,
  inputs: [],
  generateSteps: (): AnimStep[] => {
    const table = {
      columns: ['report_date', 'revenue'],
      rows: [
        ['2024-03-01', 1200],
        ['2024-03-02', 1450],
        ['2024-03-03', 1100],
        ['2024-03-04', 1600],
        ['2024-03-05', 1550],
      ] as (string | number)[][],
    };

    const base = {
      table,
      windowColumn: 'revenue',
      newColumn: 'prev_revenue',
    };

    return [
      step('lag-1', 'Show daily revenue table ordered by date', {
        ...base,
        currentRow: -1,
        computedValues: [null, null, null, null, null],
        arrowFrom: -1,
        arrowTo: -1,
        changeValues: [null, null, null, null, null],
      }),
      step('lag-2', 'Row 1 (Mar 01): No previous row — LAG returns NULL', {
        ...base,
        currentRow: 0,
        computedValues: [null, null, null, null, null],
        arrowFrom: -1,
        arrowTo: -1,
        changeValues: [null, null, null, null, null],
      }, [{ elementId: 'row-0', action: 'highlight' }],
        'LAG looks at the previous row. The first row has no predecessor.'),
      step('lag-3', 'Row 2 (Mar 02): LAG pulls 1200 from row above', {
        ...base,
        currentRow: 1,
        computedValues: [null, 1200, null, null, null],
        arrowFrom: 0,
        arrowTo: 1,
        changeValues: [null, 250, null, null, null],
      }, [
        { elementId: 'row-0', action: 'dim' },
        { elementId: 'row-1', action: 'highlight', color: 'blue' },
      ]),
      step('lag-4', 'Row 3 (Mar 03): LAG pulls 1450, change = -350', {
        ...base,
        currentRow: 2,
        computedValues: [null, 1200, 1450, null, null],
        arrowFrom: 1,
        arrowTo: 2,
        changeValues: [null, 250, -350, null, null],
      }, [{ elementId: 'row-2', action: 'highlight', color: 'blue' }]),
      step('lag-5', 'Row 4 (Mar 04): LAG pulls 1100, change = +500', {
        ...base,
        currentRow: 3,
        computedValues: [null, 1200, 1450, 1100, null],
        arrowFrom: 2,
        arrowTo: 3,
        changeValues: [null, 250, -350, 500, null],
      }, [{ elementId: 'row-3', action: 'highlight', color: 'blue' }]),
      step('lag-6', 'Row 5 (Mar 05): LAG pulls 1600, change = -50', {
        ...base,
        currentRow: 4,
        computedValues: [null, 1200, 1450, 1100, 1600],
        arrowFrom: 3,
        arrowTo: 4,
        changeValues: [null, 250, -350, 500, -50],
      }, [{ elementId: 'row-4', action: 'highlight', color: 'blue' }]),
      step('lag-7', 'LAG complete — every row now has its day-over-day change', {
        ...base,
        currentRow: -1,
        computedValues: [null, 1200, 1450, 1100, 1600],
        arrowFrom: -1,
        arrowTo: -1,
        changeValues: [null, 250, -350, 500, -50],
      }, [], 'LAG(col) OVER (ORDER BY ...) accesses the previous row without a self-join.'),
    ];
  },
};

/* ── Export all SQL configs ── */

export const sqlVisualConfigs: VisualConfig[] = [
  innerJoinConfig,
  leftJoinConfig,
  groupByConfig,
  caseWhenConfig,
  lagConfig,
];
