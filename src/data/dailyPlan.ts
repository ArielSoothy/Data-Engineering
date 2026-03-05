export interface DailyTask {
  id: string;
  label: string;
  route?: string; // navigate to this route
  mobile?: boolean; // suitable for mobile/commute
  extra?: boolean; // bonus task
}

export interface DayPlan {
  day: number; // 1-26
  phase: string;
  title: string;
  tasks: DailyTask[];
}

export const STUDY_PHASES = [
  { name: 'Foundation', days: '1-5', color: 'blue' },
  { name: 'Depth', days: '6-12', color: 'purple' },
  { name: 'Mastery', days: '13-18', color: 'yellow' },
  { name: 'Integration', days: '19-24', color: 'red' },
  { name: 'Review', days: '25-26', color: 'green' },
] as const;

function getPhase(day: number): string {
  if (day <= 5) return 'Foundation';
  if (day <= 12) return 'Depth';
  if (day <= 18) return 'Mastery';
  if (day <= 24) return 'Integration';
  return 'Review';
}

const PLAN: DayPlan[] = [
  // === FOUNDATION (Days 1-5): SQL basics + Python syntax, heavy Quick Drill ===
  {
    day: 1, phase: 'Foundation', title: 'SQL Fundamentals & Quick Drill Setup',
    tasks: [
      { id: 'd1-sql', label: 'SQL Basics: Questions 1-10', route: '/sql-basics' },
      { id: 'd1-drill-sql', label: 'Quick Drill: SQL flashcards (all easy)', route: '/quick-drill', mobile: true },
      { id: 'd1-drill-py', label: 'Quick Drill: Python syntax cards', route: '/quick-drill', mobile: true },
      { id: 'd1-glossary', label: 'Browse DE Glossary (10 min)', route: '/glossary', extra: true },
    ]
  },
  {
    day: 2, phase: 'Foundation', title: 'SQL Filtering & Aggregation',
    tasks: [
      { id: 'd2-sql', label: 'SQL Basics: Questions 11-20', route: '/sql-basics' },
      { id: 'd2-drill', label: 'Quick Drill: SQL quiz mode', route: '/quick-drill', mobile: true },
      { id: 'd2-py', label: 'Python Basics: Questions 1-5', route: '/python-basics' },
      { id: 'd2-drill2', label: 'Quick Drill: Review weak cards', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 3, phase: 'Foundation', title: 'JOINs & Python Loops',
    tasks: [
      { id: 'd3-sql', label: 'SQL Basics: Questions 21-30 (JOINs)', route: '/sql-basics' },
      { id: 'd3-py', label: 'Python Basics: Questions 6-10', route: '/python-basics' },
      { id: 'd3-drill', label: 'Quick Drill: Mixed flashcards', route: '/quick-drill', mobile: true },
      { id: 'd3-trivia', label: 'Endless Trivia: 10 min warm-up', route: '/trivia', extra: true },
    ]
  },
  {
    day: 4, phase: 'Foundation', title: 'Subqueries & Python Dicts',
    tasks: [
      { id: 'd4-sql', label: 'SQL Basics: Questions 31-40', route: '/sql-basics' },
      { id: 'd4-py', label: 'Python Basics: Questions 11-15 (dicts)', route: '/python-basics' },
      { id: 'd4-drill', label: 'Quick Drill: Quiz mode (easy+medium)', route: '/quick-drill', mobile: true },
      { id: 'd4-py2', label: 'Python Basics: Review weak areas', route: '/python-basics', extra: true },
    ]
  },
  {
    day: 5, phase: 'Foundation', title: 'Foundation Review',
    tasks: [
      { id: 'd5-review', label: 'Quick Drill: Full review (all categories)', route: '/quick-drill' },
      { id: 'd5-py', label: 'Python Basics: Finish remaining', route: '/python-basics' },
      { id: 'd5-drill', label: 'Quick Drill: Quiz mode weak cards', route: '/quick-drill', mobile: true },
      { id: 'd5-trivia', label: 'Trivia: Test foundation knowledge', route: '/trivia', extra: true },
    ]
  },

  // === DEPTH (Days 6-12): SQL Advanced, Python patterns, start Adaptive ===
  {
    day: 6, phase: 'Depth', title: 'Window Functions Deep Dive',
    tasks: [
      { id: 'd6-sql', label: 'SQL Advanced: Window functions (5 questions)', route: '/sql-advanced' },
      { id: 'd6-drill', label: 'Quick Drill: Window function cards', route: '/quick-drill', mobile: true },
      { id: 'd6-py', label: 'Python Advanced: Questions 1-5', route: '/python-advanced' },
      { id: 'd6-adaptive', label: 'Adaptive Practice: 1 SQL round', route: '/adaptive', extra: true },
    ]
  },
  {
    day: 7, phase: 'Depth', title: 'CTEs & Python Patterns',
    tasks: [
      { id: 'd7-sql', label: 'SQL Advanced: CTEs & recursive queries', route: '/sql-advanced' },
      { id: 'd7-py', label: 'Python Advanced: Questions 6-10', route: '/python-advanced' },
      { id: 'd7-drill', label: 'Quick Drill: Medium difficulty', route: '/quick-drill', mobile: true },
      { id: 'd7-decomp', label: 'Decomposition: Scenario 1', route: '/decomposition', extra: true },
    ]
  },
  {
    day: 8, phase: 'Depth', title: 'Sessionization & Retention',
    tasks: [
      { id: 'd8-sql', label: 'SQL Advanced: Sessionization queries', route: '/sql-advanced' },
      { id: 'd8-sql2', label: 'SQL Advanced: Retention queries', route: '/sql-advanced' },
      { id: 'd8-drill', label: 'Quick Drill: SQL hard cards', route: '/quick-drill', mobile: true },
      { id: 'd8-py', label: 'Python Advanced: pandas basics', route: '/python-advanced', extra: true },
    ]
  },
  {
    day: 9, phase: 'Depth', title: 'Metrics & Aggregation Patterns',
    tasks: [
      { id: 'd9-sql', label: 'SQL Advanced: DAU/WAU/MAU metrics', route: '/sql-advanced' },
      { id: 'd9-py', label: 'Python Advanced: Questions 11-15', route: '/python-advanced' },
      { id: 'd9-adaptive', label: 'Adaptive Practice: Mixed round', route: '/adaptive' },
      { id: 'd9-drill', label: 'Quick Drill: Review all weak', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 10, phase: 'Depth', title: 'PostgreSQL Specifics',
    tasks: [
      { id: 'd10-sql', label: 'SQL Advanced: PostgreSQL functions', route: '/sql-advanced' },
      { id: 'd10-py', label: 'Python Advanced: Finish remaining', route: '/python-advanced' },
      { id: 'd10-drill', label: 'Quick Drill: PostgreSQL cards', route: '/quick-drill', mobile: true },
      { id: 'd10-decomp', label: 'Decomposition: Scenario 2-3', route: '/decomposition', extra: true },
    ]
  },
  {
    day: 11, phase: 'Depth', title: 'Complex Queries & Algorithm Patterns',
    tasks: [
      { id: 'd11-sql', label: 'SQL Advanced: Complex joins & subqueries', route: '/sql-advanced' },
      { id: 'd11-py', label: 'Python Advanced: Algorithm patterns', route: '/python-advanced' },
      { id: 'd11-adaptive', label: 'Adaptive Practice: 2 rounds', route: '/adaptive' },
      { id: 'd11-drill', label: 'Quick Drill: Hard mode quiz', route: '/quick-drill', mobile: true, extra: true },
    ]
  },
  {
    day: 12, phase: 'Depth', title: 'Depth Review',
    tasks: [
      { id: 'd12-review', label: 'Quick Drill: Full hard review', route: '/quick-drill' },
      { id: 'd12-adaptive', label: 'Adaptive Practice: Timed round', route: '/adaptive' },
      { id: 'd12-drill', label: 'Quick Drill: Weak cards focus', route: '/quick-drill', mobile: true },
      { id: 'd12-trivia', label: 'Trivia: 15 min challenge', route: '/trivia', extra: true },
    ]
  },

  // === MASTERY (Days 13-18): Mixed timed practice, mock interviews ===
  {
    day: 13, phase: 'Mastery', title: 'Timed SQL Practice',
    tasks: [
      { id: 'd13-timed', label: 'Timed Assessment: SQL only (25 min)', route: '/timed-assessment' },
      { id: 'd13-review', label: 'Review timed assessment weak spots', route: '/sql-advanced' },
      { id: 'd13-drill', label: 'Quick Drill: Spaced review', route: '/quick-drill', mobile: true },
      { id: 'd13-adaptive', label: 'Adaptive: Hard SQL', route: '/adaptive', extra: true },
    ]
  },
  {
    day: 14, phase: 'Mastery', title: 'Timed Python Practice',
    tasks: [
      { id: 'd14-timed', label: 'Timed Assessment: Python only (25 min)', route: '/timed-assessment' },
      { id: 'd14-review', label: 'Review weak Python patterns', route: '/python-advanced' },
      { id: 'd14-drill', label: 'Quick Drill: Python quiz mode', route: '/quick-drill', mobile: true },
      { id: 'd14-mock', label: 'Mock Interview: Practice #1', route: '/mock-interview', extra: true },
    ]
  },
  {
    day: 15, phase: 'Mastery', title: 'First Full Mock',
    tasks: [
      { id: 'd15-mock', label: 'Timed Assessment: Full 50-min mock', route: '/timed-assessment' },
      { id: 'd15-review', label: 'Analyze mock results & weak areas', route: '/' },
      { id: 'd15-drill', label: 'Quick Drill: Target weak topics', route: '/quick-drill', mobile: true },
      { id: 'd15-decomp', label: 'Decomposition: Scenario 4', route: '/decomposition', extra: true },
    ]
  },
  {
    day: 16, phase: 'Mastery', title: 'Pattern Recognition',
    tasks: [
      { id: 'd16-meta', label: 'Meta Official: Practice questions', route: '/meta-official' },
      { id: 'd16-adaptive', label: 'Adaptive Practice: Hard mixed', route: '/adaptive' },
      { id: 'd16-drill', label: 'Quick Drill: Hard quiz mode', route: '/quick-drill', mobile: true },
      { id: 'd16-mock', label: 'Mock Interview: Practice #2', route: '/mock-interview', extra: true },
    ]
  },
  {
    day: 17, phase: 'Mastery', title: 'Verbal Explanation Practice',
    tasks: [
      { id: 'd17-mock', label: 'Mock Interview: Full verbal practice', route: '/mock-interview' },
      { id: 'd17-adaptive', label: 'Adaptive: Explain your approach', route: '/adaptive' },
      { id: 'd17-drill', label: 'Quick Drill: Spaced review', route: '/quick-drill', mobile: true },
      { id: 'd17-tech', label: 'Meta Tech Stack: Review', route: '/tech-stack', extra: true },
    ]
  },
  {
    day: 18, phase: 'Mastery', title: 'Mastery Review',
    tasks: [
      { id: 'd18-timed', label: 'Timed Assessment: Full mock #2', route: '/timed-assessment' },
      { id: 'd18-drill', label: 'Quick Drill: All weak cards', route: '/quick-drill' },
      { id: 'd18-review', label: 'Quick Drill: Review on commute', route: '/quick-drill', mobile: true },
      { id: 'd18-decomp', label: 'Decomposition: Scenario 5', route: '/decomposition', extra: true },
    ]
  },

  // === INTEGRATION (Days 19-24): Full timed mocks, review weak areas ===
  {
    day: 19, phase: 'Integration', title: 'Full Mock + SQL Focus',
    tasks: [
      { id: 'd19-timed', label: 'Timed Assessment: Full 50-min mock', route: '/timed-assessment' },
      { id: 'd19-sql', label: 'SQL Advanced: Review hardest questions', route: '/sql-advanced' },
      { id: 'd19-drill', label: 'Quick Drill: SQL weak cards', route: '/quick-drill', mobile: true },
      { id: 'd19-adaptive', label: 'Adaptive: Hard SQL only', route: '/adaptive', extra: true },
    ]
  },
  {
    day: 20, phase: 'Integration', title: 'Full Mock + Python Focus',
    tasks: [
      { id: 'd20-timed', label: 'Timed Assessment: Full 50-min mock', route: '/timed-assessment' },
      { id: 'd20-py', label: 'Python Advanced: Review hardest', route: '/python-advanced' },
      { id: 'd20-drill', label: 'Quick Drill: Python weak cards', route: '/quick-drill', mobile: true },
      { id: 'd20-adaptive', label: 'Adaptive: Hard Python only', route: '/adaptive', extra: true },
    ]
  },
  {
    day: 21, phase: 'Integration', title: 'Speed Drill',
    tasks: [
      { id: 'd21-timed', label: 'Timed Assessment: Quick mode (3+3)', route: '/timed-assessment' },
      { id: 'd21-timed2', label: 'Timed Assessment: Quick mode again', route: '/timed-assessment' },
      { id: 'd21-drill', label: 'Quick Drill: Speed quiz all categories', route: '/quick-drill', mobile: true },
      { id: 'd21-meta', label: 'Meta Official: Timed practice', route: '/meta-official', extra: true },
    ]
  },
  {
    day: 22, phase: 'Integration', title: 'Weak Spot Elimination',
    tasks: [
      { id: 'd22-weak', label: 'Review Dashboard weak spots', route: '/' },
      { id: 'd22-adaptive', label: 'Adaptive: Target weak areas', route: '/adaptive' },
      { id: 'd22-drill', label: 'Quick Drill: Only wrong cards', route: '/quick-drill', mobile: true },
      { id: 'd22-mock', label: 'Mock Interview: Final practice', route: '/mock-interview', extra: true },
    ]
  },
  {
    day: 23, phase: 'Integration', title: 'Final Full Mock',
    tasks: [
      { id: 'd23-timed', label: 'Timed Assessment: Full 50-min mock', route: '/timed-assessment' },
      { id: 'd23-review', label: 'Detailed review of all mock results', route: '/' },
      { id: 'd23-drill', label: 'Quick Drill: Confidence review', route: '/quick-drill', mobile: true },
      { id: 'd23-tech', label: 'Meta Tech Stack: Final review', route: '/tech-stack', extra: true },
    ]
  },
  {
    day: 24, phase: 'Integration', title: 'Integration Wrap-Up',
    tasks: [
      { id: 'd24-adaptive', label: 'Adaptive: Final hard round', route: '/adaptive' },
      { id: 'd24-drill', label: 'Quick Drill: All mastered review', route: '/quick-drill' },
      { id: 'd24-drill2', label: 'Quick Drill: Light review', route: '/quick-drill', mobile: true },
      { id: 'd24-meta', label: 'Meta Official: Final pass', route: '/meta-official', extra: true },
    ]
  },

  // === REVIEW (Days 25-26): Light review, confidence building ===
  {
    day: 25, phase: 'Review', title: 'Light Review & Confidence',
    tasks: [
      { id: 'd25-drill', label: 'Quick Drill: Light flashcard review', route: '/quick-drill' },
      { id: 'd25-patterns', label: 'Review: Key SQL patterns cheat sheet', route: '/quick-drill', mobile: true },
      { id: 'd25-py', label: 'Review: Key Python patterns', route: '/quick-drill', mobile: true },
      { id: 'd25-rest', label: 'Rest & relax - you are ready!', extra: true },
    ]
  },
  {
    day: 26, phase: 'Review', title: 'Interview Day Prep',
    tasks: [
      { id: 'd26-warmup', label: 'Quick Drill: 10-min warm-up only', route: '/quick-drill' },
      { id: 'd26-review', label: 'Skim top 5 weak cards', route: '/quick-drill', mobile: true },
      { id: 'd26-confidence', label: 'Deep breaths. You got this.' },
    ]
  },
];

// Validate that all days have the right phase
PLAN.forEach(p => { p.phase = getPhase(p.day); });

export const dailyPlan = PLAN;
