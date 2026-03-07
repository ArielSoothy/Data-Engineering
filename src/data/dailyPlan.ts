export interface DailyTask {
  id: string;
  label: string;
  route?: string; // navigate to this route
  mobile?: boolean; // suitable for mobile/commute
  extra?: boolean; // bonus task
  speedTarget?: string; // e.g. "Solve 5 SQL in 25 min"
}

export interface DayPlan {
  day: number; // 1-24
  phase: string;
  title: string;
  tasks: DailyTask[];
}

export const STUDY_PHASES = [
  { name: 'Foundation', days: '1-7', color: 'blue' },
  { name: 'Speed Building', days: '8-14', color: 'purple' },
  { name: 'Full Simulation', days: '15-21', color: 'yellow' },
  { name: 'Final Push', days: '22-24', color: 'red' },
] as const;

function getPhase(day: number): string {
  if (day <= 7) return 'Foundation';
  if (day <= 14) return 'Speed Building';
  if (day <= 21) return 'Full Simulation';
  return 'Final Push';
}

const PLAN: DayPlan[] = [
  // ============================================================
  // WEEK 1 — FOUNDATION (Days 1-7, Mar 8-14)
  // SQL Basics + Python Basics + Quick Drill
  // ============================================================
  {
    day: 1, phase: 'Foundation', title: 'SQL Fundamentals Kickoff',
    tasks: [
      { id: 'd1-sql', label: 'SQL Basics: Questions 1-15 (SELECT, WHERE, ORDER BY)', route: '/sql-basics', speedTarget: 'Solve 15 SQL basics in 30 min' },
      { id: 'd1-drill-sql', label: 'Quick Drill: Easy SQL flashcards', route: '/quick-drill', mobile: true },
      { id: 'd1-glossary', label: 'Browse DE Glossary — learn key terms (10 min)', route: '/glossary' },
      { id: 'd1-drill-py', label: 'Quick Drill: Python syntax cards on commute', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 2, phase: 'Foundation', title: 'SQL Filtering & Aggregation',
    tasks: [
      { id: 'd2-sql', label: 'SQL Basics: Questions 16-30 (GROUP BY, HAVING, aggregates)', route: '/sql-basics', speedTarget: 'Solve 15 SQL in 25 min' },
      { id: 'd2-drill', label: 'Quick Drill: SQL quiz mode (easy)', route: '/quick-drill', mobile: true },
      { id: 'd2-py', label: 'Python Basics: Questions 1-5 (variables, loops)', route: '/python-basics' },
      { id: 'd2-drill2', label: 'Quick Drill: Review weak SQL cards', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 3, phase: 'Foundation', title: 'JOINs & Subqueries',
    tasks: [
      { id: 'd3-sql', label: 'SQL Basics: Questions 31-40 (JOINs, subqueries)', route: '/sql-basics', speedTarget: 'Solve 10 JOIN queries in 25 min' },
      { id: 'd3-py', label: 'Python Basics: Questions 6-10 (strings, lists)', route: '/python-basics' },
      { id: 'd3-drill', label: 'Quick Drill: Mixed SQL + Python flashcards', route: '/quick-drill', mobile: true },
      { id: 'd3-trivia', label: 'Endless Trivia: 10 min warm-up', route: '/trivia', extra: true },
    ]
  },
  {
    day: 4, phase: 'Foundation', title: 'Python Core — Dicts & Functions',
    tasks: [
      { id: 'd4-py', label: 'Python Basics: Questions 11-20 (dicts, functions, comprehensions)', route: '/python-basics', speedTarget: 'Solve 10 Python in 20 min' },
      { id: 'd4-drill', label: 'Quick Drill: Easy Python flashcards', route: '/quick-drill', mobile: true },
      { id: 'd4-sql-review', label: 'SQL Basics: Re-do any wrong answers from Days 1-3', route: '/sql-basics' },
      { id: 'd4-drill2', label: 'Quick Drill: Quiz mode (easy+medium)', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 5, phase: 'Foundation', title: 'Python Finish + SQL Review',
    tasks: [
      { id: 'd5-py', label: 'Python Basics: Finish remaining questions', route: '/python-basics', speedTarget: 'Complete all Python basics' },
      { id: 'd5-drill', label: 'Quick Drill: Full review all easy cards', route: '/quick-drill' },
      { id: 'd5-sql-review', label: 'SQL Basics: Speed-review 10 hardest questions', route: '/sql-basics' },
      { id: 'd5-trivia', label: 'Trivia: Test foundation knowledge', route: '/trivia', extra: true },
    ]
  },
  {
    day: 6, phase: 'Foundation', title: 'Window Functions Introduction',
    tasks: [
      { id: 'd6-sql', label: 'SQL Advanced: Window functions intro (ROW_NUMBER, RANK)', route: '/sql-advanced', speedTarget: 'Solve 5 window function Qs in 25 min' },
      { id: 'd6-drill', label: 'Quick Drill: Window function cards', route: '/quick-drill', mobile: true },
      { id: 'd6-py-review', label: 'Python Basics: Review weak areas', route: '/python-basics' },
      { id: 'd6-adaptive', label: 'Adaptive Practice: 1 SQL round', route: '/adaptive', extra: true },
    ]
  },
  {
    day: 7, phase: 'Foundation', title: 'Foundation Wrap-Up & Review',
    tasks: [
      { id: 'd7-sql', label: 'SQL Advanced: CTEs & basic recursive queries', route: '/sql-advanced', speedTarget: 'Solve 5 CTE queries in 25 min' },
      { id: 'd7-drill', label: 'Quick Drill: Full review (all categories, medium)', route: '/quick-drill' },
      { id: 'd7-py', label: 'Python Basics: Speed-run all wrong answers', route: '/python-basics', mobile: true },
      { id: 'd7-decomp', label: 'Decomposition: Scenario 1', route: '/decomposition', extra: true },
    ]
  },

  // ============================================================
  // WEEK 2 — SPEED BUILDING (Days 8-14, Mar 15-21)
  // SQL Advanced + Python Advanced + Adaptive + First Mock
  // ============================================================
  {
    day: 8, phase: 'Speed Building', title: 'JOINs, CTEs & GROUP BY Mastery',
    tasks: [
      { id: 'd8-sql', label: 'SQL Advanced: Complex JOINs & multi-table CTEs', route: '/sql-advanced', speedTarget: 'Solve 5 complex JOINs in 20 min' },
      { id: 'd8-sql2', label: 'SQL Advanced: GROUP BY / HAVING edge cases', route: '/sql-advanced' },
      { id: 'd8-adaptive', label: 'Adaptive Practice: SQL round (medium)', route: '/adaptive' },
      { id: 'd8-drill', label: 'Quick Drill: SQL hard cards', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 9, phase: 'Speed Building', title: 'Advanced JOINs & Sessionization',
    tasks: [
      { id: 'd9-sql', label: 'SQL Advanced: Self-joins, anti-joins, sessionization', route: '/sql-advanced', speedTarget: 'Solve 5 advanced queries in 25 min' },
      { id: 'd9-adaptive', label: 'Adaptive Practice: Mixed SQL round', route: '/adaptive' },
      { id: 'd9-drill', label: 'Quick Drill: Medium difficulty quiz', route: '/quick-drill', mobile: true },
      { id: 'd9-decomp', label: 'Decomposition: Scenario 2', route: '/decomposition', extra: true },
    ]
  },
  {
    day: 10, phase: 'Speed Building', title: 'Window Functions Deep Dive',
    tasks: [
      { id: 'd10-sql', label: 'SQL Advanced: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD', route: '/sql-advanced', speedTarget: 'Solve 5 window Qs in 20 min' },
      { id: 'd10-sql2', label: 'SQL Advanced: Running totals, moving averages', route: '/sql-advanced' },
      { id: 'd10-drill', label: 'Quick Drill: Window function + CTE cards', route: '/quick-drill', mobile: true },
      { id: 'd10-adaptive', label: 'Adaptive: Hard SQL only', route: '/adaptive', extra: true },
    ]
  },
  {
    day: 11, phase: 'Speed Building', title: 'Timed SQL Speed Drill',
    tasks: [
      { id: 'd11-sql', label: 'SQL Advanced: DAU/WAU/MAU metrics + retention', route: '/sql-advanced', speedTarget: 'Solve 5 metric queries in 25 min' },
      { id: 'd11-timed', label: 'Timed Assessment: SQL only (25 min)', route: '/timed-assessment' },
      { id: 'd11-review', label: 'Review timed assessment mistakes', route: '/sql-advanced' },
      { id: 'd11-drill', label: 'Quick Drill: SQL weak cards', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 12, phase: 'Speed Building', title: 'Python Advanced — Collections & Counting',
    tasks: [
      { id: 'd12-py', label: 'Python Advanced: Frequency counting, Counter, defaultdict', route: '/python-advanced', speedTarget: 'Solve 5 Python in 20 min' },
      { id: 'd12-py2', label: 'Python Advanced: Deduplication & set operations', route: '/python-advanced' },
      { id: 'd12-adaptive', label: 'Adaptive Practice: Python round', route: '/adaptive' },
      { id: 'd12-drill', label: 'Quick Drill: Python hard cards', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 13, phase: 'Speed Building', title: 'Python Advanced — Sorting & Algorithms',
    tasks: [
      { id: 'd13-py', label: 'Python Advanced: Sorting, lambda, key functions', route: '/python-advanced', speedTarget: 'Solve 5 Python in 20 min' },
      { id: 'd13-py2', label: 'Python Advanced: Algorithm patterns (sliding window, two pointer)', route: '/python-advanced' },
      { id: 'd13-adaptive', label: 'Adaptive Practice: Hard Python', route: '/adaptive' },
      { id: 'd13-drill', label: 'Quick Drill: Mixed hard quiz', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 14, phase: 'Speed Building', title: 'First Full Mock (25+25)',
    tasks: [
      { id: 'd14-timed', label: 'Timed Assessment: Full 50-min mock (25 SQL + 25 Python)', route: '/timed-assessment', speedTarget: 'Complete full mock under 50 min' },
      { id: 'd14-review', label: 'Analyze mock results — identify top 5 weak patterns', route: '/' },
      { id: 'd14-drill', label: 'Quick Drill: Target weak topics from mock', route: '/quick-drill', mobile: true },
      { id: 'd14-adaptive', label: 'Adaptive: Hard round on weakest area', route: '/adaptive', extra: true },
    ]
  },

  // ============================================================
  // WEEK 3 — FULL SIMULATION (Days 15-21, Mar 22-28)
  // Meta Official Qs + Speed Drills + Multiple Full Mocks
  // ============================================================
  {
    day: 15, phase: 'Full Simulation', title: 'Meta Official SQL — Bookstore Schema',
    tasks: [
      { id: 'd15-meta', label: 'Meta Official: SQL practice questions (bookstore schema)', route: '/meta-official', speedTarget: 'Solve each Meta Q in under 5 min' },
      { id: 'd15-timed', label: 'Timed Assessment: SQL quick mode (3 questions)', route: '/timed-assessment' },
      { id: 'd15-drill', label: 'Quick Drill: Speed quiz — SQL hard cards', route: '/quick-drill', mobile: true },
      { id: 'd15-adaptive', label: 'Adaptive: Meta-style SQL patterns', route: '/adaptive', extra: true },
    ]
  },
  {
    day: 16, phase: 'Full Simulation', title: 'Meta Official SQL — Speed Run',
    tasks: [
      { id: 'd16-meta', label: 'Meta Official: Remaining SQL questions', route: '/meta-official', speedTarget: 'All Meta SQL under 5 min each' },
      { id: 'd16-sql', label: 'SQL Advanced: Review hardest window + CTE questions', route: '/sql-advanced' },
      { id: 'd16-drill', label: 'Quick Drill: PostgreSQL-specific cards', route: '/quick-drill', mobile: true },
      { id: 'd16-decomp', label: 'Decomposition: Scenario 3', route: '/decomposition', extra: true },
    ]
  },
  {
    day: 17, phase: 'Full Simulation', title: 'Meta Official Python Questions',
    tasks: [
      { id: 'd17-meta', label: 'Meta Official: Python practice questions', route: '/meta-official', speedTarget: 'Solve each Meta Q in under 5 min' },
      { id: 'd17-py', label: 'Python Advanced: Review hardest patterns', route: '/python-advanced' },
      { id: 'd17-drill', label: 'Quick Drill: Python speed quiz', route: '/quick-drill', mobile: true },
      { id: 'd17-mock', label: 'Mock Interview: Verbal explanation practice', route: '/mock-interview', extra: true },
    ]
  },
  {
    day: 18, phase: 'Full Simulation', title: 'Meta Official Python — Speed Run',
    tasks: [
      { id: 'd18-meta', label: 'Meta Official: Remaining Python questions', route: '/meta-official', speedTarget: 'All Meta Python under 5 min each' },
      { id: 'd18-adaptive', label: 'Adaptive Practice: Hard mixed round', route: '/adaptive' },
      { id: 'd18-drill', label: 'Quick Drill: All weak cards review', route: '/quick-drill', mobile: true },
      { id: 'd18-tech', label: 'Meta Tech Stack: Review', route: '/tech-stack', extra: true },
    ]
  },
  {
    day: 19, phase: 'Full Simulation', title: 'Full Mock #2 + SQL Review',
    tasks: [
      { id: 'd19-timed', label: 'Timed Assessment: Full 50-min mock (25+25)', route: '/timed-assessment', speedTarget: 'Beat Day 14 mock score' },
      { id: 'd19-sql', label: 'SQL Advanced: Drill top 5 weakest question types', route: '/sql-advanced' },
      { id: 'd19-drill', label: 'Quick Drill: SQL weak cards only', route: '/quick-drill', mobile: true },
      { id: 'd19-adaptive', label: 'Adaptive: Hard SQL only', route: '/adaptive', extra: true },
    ]
  },
  {
    day: 20, phase: 'Full Simulation', title: 'Full Mock #3 + Python Review',
    tasks: [
      { id: 'd20-timed', label: 'Timed Assessment: Full 50-min mock (25+25)', route: '/timed-assessment', speedTarget: 'Target 80%+ accuracy under time' },
      { id: 'd20-py', label: 'Python Advanced: Drill top 5 weakest patterns', route: '/python-advanced' },
      { id: 'd20-drill', label: 'Quick Drill: Python weak cards only', route: '/quick-drill', mobile: true },
      { id: 'd20-adaptive', label: 'Adaptive: Hard Python only', route: '/adaptive', extra: true },
    ]
  },
  {
    day: 21, phase: 'Full Simulation', title: 'Full Mock #4 + Adaptive Weak Spots',
    tasks: [
      { id: 'd21-timed', label: 'Timed Assessment: Full 50-min mock (25+25)', route: '/timed-assessment', speedTarget: 'Fastest clean mock yet' },
      { id: 'd21-adaptive', label: 'Adaptive Practice: Target weakest areas from mock', route: '/adaptive' },
      { id: 'd21-drill', label: 'Quick Drill: Speed quiz all categories', route: '/quick-drill', mobile: true },
      { id: 'd21-mock', label: 'Mock Interview: Full verbal practice', route: '/mock-interview', extra: true },
    ]
  },

  // ============================================================
  // FINAL PUSH (Days 22-24, Mar 29-31)
  // Light review, confidence, screen day
  // ============================================================
  {
    day: 22, phase: 'Final Push', title: 'Light Review + Full Mock Simulation',
    tasks: [
      { id: 'd22-timed', label: 'Timed Assessment: Final full mock (relaxed pace)', route: '/timed-assessment', speedTarget: 'Confidence run — aim for 85%+' },
      { id: 'd22-meta', label: 'Meta Official: Quick pass on any unseen questions', route: '/meta-official' },
      { id: 'd22-drill', label: 'Quick Drill: Light flashcard review on commute', route: '/quick-drill', mobile: true },
      { id: 'd22-decomp', label: 'Decomposition: Quick scenario review', route: '/decomposition', extra: true },
    ]
  },
  {
    day: 23, phase: 'Final Push', title: 'Weak Spots Only + Flashcard Review',
    tasks: [
      { id: 'd23-weak', label: 'Review Dashboard: Focus on lowest-scoring areas only', route: '/' },
      { id: 'd23-adaptive', label: 'Adaptive Practice: 1 round on weakest topic', route: '/adaptive' },
      { id: 'd23-drill', label: 'Quick Drill: Confidence review — all mastered cards', route: '/quick-drill', mobile: true },
      { id: 'd23-tech', label: 'Meta Tech Stack: Final skim', route: '/tech-stack', extra: true },
    ]
  },
  {
    day: 24, phase: 'Final Push', title: 'Screen Day — Warm Up & Rest',
    tasks: [
      { id: 'd24-warmup', label: 'Quick Drill: 10-min warm-up only (2 SQL + 2 Python)', route: '/quick-drill', speedTarget: '4 problems in 10 min max' },
      { id: 'd24-skim', label: 'Skim top 5 weak cards one last time', route: '/quick-drill', mobile: true },
      { id: 'd24-rest', label: 'Rest, hydrate, deep breaths. You are ready.' },
    ]
  },
];

// Validate that all days have the right phase
PLAN.forEach(p => { p.phase = getPhase(p.day); });

export const dailyPlan = PLAN;
