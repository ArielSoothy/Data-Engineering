import type { LucideIcon } from 'lucide-react';
import {
  Clock,
  Database,
  Code2,
  MessageSquare,
  AlertTriangle,
  Shield,
  Users,
  Search,
  Mic,
  ArrowRight,
} from 'lucide-react';

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs leading-relaxed font-mono mt-2">
    <code>{children}</code>
  </pre>
);

const SectionHeader = ({
  icon: Icon,
  number,
  title,
  color = 'blue',
}: {
  icon: LucideIcon;
  number: number;
  title: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo';
}) => {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400 border-blue-500',
    green: 'text-green-600 dark:text-green-400 border-green-500',
    amber: 'text-amber-600 dark:text-amber-400 border-amber-500',
    red: 'text-red-600 dark:text-red-400 border-red-500',
    purple: 'text-purple-600 dark:text-purple-400 border-purple-500',
    indigo: 'text-indigo-600 dark:text-indigo-400 border-indigo-500',
  };
  return (
    <div className={`flex items-center gap-3 border-b-2 pb-3 mb-6 mt-10 first:mt-0 ${colors[color]}`}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
        <Icon size={18} className={colors[color].split(' ')[0]} />
      </div>
      <h2 className={`text-xl font-bold ${colors[color].split(' ').slice(0, 2).join(' ')}`}>
        {number}. {title}
      </h2>
    </div>
  );
};

const PatternCard = ({
  number,
  name,
  trigger,
  tool,
  color = 'blue',
}: {
  number: number;
  name: string;
  trigger: string;
  tool: string;
  color?: 'blue' | 'green';
}) => {
  const borderColor = color === 'green' ? 'border-l-green-500' : 'border-l-blue-500';
  const numBg = color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
  return (
    <div className={`bg-white dark:bg-gray-800/95 rounded-xl border border-gray-100 dark:border-gray-700/60 border-l-4 ${borderColor} p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${numBg}`}>
          {number}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1.5">{name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="font-medium text-gray-600 dark:text-gray-300">Trigger:</span> {trigger}
          </p>
          <CodeBlock>{tool}</CodeBlock>
        </div>
      </div>
    </div>
  );
};

const PythonPatternCard = ({
  number,
  name,
  when,
  how,
}: {
  number: number;
  name: string;
  when: string;
  how: string;
}) => (
  <div className="bg-white dark:bg-gray-800/95 rounded-xl border border-gray-100 dark:border-gray-700/60 border-l-4 border-l-green-500 p-4 shadow-sm">
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        {number}
      </span>
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1.5">{name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-medium text-gray-600 dark:text-gray-300">When:</span> {when}
        </p>
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          <ArrowRight size={12} className="inline mr-1 text-green-500" />
          {how}
        </p>
      </div>
    </div>
  </div>
);

const ScriptItem = ({ text, note }: { text: string; note: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
    <Mic size={16} className="flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 italic">"{text}"</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">({note})</p>
    </div>
  </div>
);

const BugItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40">
    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 border-red-400 dark:border-red-500" />
    <p className="text-sm text-gray-800 dark:text-gray-200">{text}</p>
  </div>
);

const EdgeCaseItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/40">
    <Shield size={16} className="flex-shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
    <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{text}"</p>
  </div>
);

const BehavioralCard = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <div className="bg-white dark:bg-gray-800/95 rounded-xl border border-gray-100 dark:border-gray-700/60 p-4 shadow-sm">
    <h3 className="font-semibold text-purple-600 dark:text-purple-400 text-sm mb-2">{question}</h3>
    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{answer}"</p>
  </div>
);

const ScreenDayPrep = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Screen Day Quick Reference
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Your go-to cheat sheet for the Meta DE technical screen. Read this 10 minutes before.
        </p>
      </div>

      {/* Section 1: Before You Write */}
      <SectionHeader icon={Clock} number={1} title="Before You Write (30-Second Routine)" color="blue" />
      <div className="grid gap-3 mb-8">
        {[
          { step: 1, time: '10 sec', icon: Database, label: 'Read the schema', detail: 'How many tables? What columns? Dates? Categories?' },
          { step: 2, time: '10 sec', icon: Search, label: 'Read the question', detail: 'Find the trigger words' },
          { step: 3, time: '10 sec', icon: MessageSquare, label: 'Say out loud', detail: '"I need [what] from [which tables] using [tool]"' },
        ].map(({ step, time, icon: StepIcon, label, detail }) => (
          <div
            key={step}
            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/95 rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-sm"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <StepIcon size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  Step {step}: {label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                  {time}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section 2: Top 5 SQL Question Shapes */}
      <SectionHeader icon={Database} number={2} title="Top 5 SQL Question Shapes" color="blue" />
      <div className="grid gap-3 mb-8">
        <PatternCard
          number={1}
          name="Percentage of something"
          trigger={'"what percentage", "rate", "share"'}
          tool={'AVG(CASE WHEN condition\n    THEN 1.0 ELSE 0 END) * 100'}
        />
        <PatternCard
          number={2}
          name="Top N per group"
          trigger={'"top 3 per", "highest in each"'}
          tool={'WITH ranked AS (\n  SELECT *,\n    RANK() OVER (\n      PARTITION BY group_col\n      ORDER BY val DESC\n    ) AS rnk\n  FROM table\n)\nSELECT * FROM ranked WHERE rnk <= N'}
        />
        <PatternCard
          number={3}
          name='Never / missing'
          trigger={'"never", "don\'t have", "missing"'}
          tool={'SELECT a.*\nFROM left_table a\nLEFT JOIN right_table b\n  ON a.key = b.key\nWHERE b.key IS NULL'}
        />
        <PatternCard
          number={4}
          name="Time comparison"
          trigger={'"day over day", "month over month", "growth"'}
          tool={'SELECT *,\n  LAG(value) OVER (ORDER BY date) AS prev_val,\n  value - LAG(value) OVER (ORDER BY date) AS change\nFROM table'}
        />
        <PatternCard
          number={5}
          name="Both X and Y"
          trigger={'"users who did both", "bought both"'}
          tool={'SELECT user_id\nFROM table\nWHERE col IN (\'X\', \'Y\')\nGROUP BY user_id\nHAVING COUNT(DISTINCT col) = 2'}
        />
      </div>

      {/* Section 3: Top 5 Python Patterns */}
      <SectionHeader icon={Code2} number={3} title="Top 5 Python Patterns" color="green" />
      <div className="grid gap-3 mb-8">
        <PythonPatternCard
          number={1}
          name="Two-dict tracker"
          when="find best/highest per group"
          how="Two dicts: one for answer, one for comparison. Check the gatekeeper, update both."
        />
        <PythonPatternCard
          number={2}
          name="Dict of sets + issubset"
          when={'"bought all", "completed all"'}
          how="Group items per key into sets. Compare with required.issubset(their_set)."
        />
        <PythonPatternCard
          number={3}
          name="sorted + key=lambda"
          when={'"sort by", "order by", "rank"'}
          how="sorted(list, key=lambda x: x['field'], reverse=True)"
        />
        <PythonPatternCard
          number={4}
          name="Dict as lookup"
          when="combining two data sources"
          how="Build map from one list, look up values while looping the other."
        />
        <PythonPatternCard
          number={5}
          name="Forward fill"
          when="None/missing values"
          how="Track last_val. If real value, update it. If None, replace with last_val."
        />
      </div>

      {/* Section 4: When You're Stuck */}
      <SectionHeader icon={MessageSquare} number={4} title="When You're Stuck (Scripts)" color="amber" />
      <div className="grid gap-3 mb-8">
        <ScriptItem
          text="Let me think about the edge cases first."
          note="buys 30 seconds"
        />
        <ScriptItem
          text="I'd approach this with a CTE — let me set up the structure."
          note="shows you know the tool"
        />
        <ScriptItem
          text="Can I clarify — are we looking for [X] or [Y]?"
          note="shows you read carefully"
        />
        <ScriptItem
          text="Let me walk through my thinking out loud..."
          note="Emeka WANTS to hear this"
        />
        <ScriptItem
          text="I know there might be a more efficient way, but let me get the correct logic first."
          note="correctness > optimization"
        />
      </div>

      {/* Section 5: My Recurring Bugs */}
      <SectionHeader icon={AlertTriangle} number={5} title="My Recurring Bugs (Checklist)" color="red" />
      <div className="grid gap-3 mb-8">
        <BugItem text={`Indentation — after for/if/def, NEXT character is indent`} />
        <BugItem text={`Missing colon — def, for, if, else ALL end with :`} />
        <BugItem text={`Wrong variable — using name from loop 1 inside loop 2 (use the current loop variable)`} />
        <BugItem text={`Missing quotes on dict keys — emp['salary'] not emp[salary]`} />
        <BugItem text={`not in not in — "if it DOESN'T exist" = not in`} />
        <BugItem text={`append() not append[] — parentheses, not brackets`} />
        <BugItem text={`return result not return results — match your variable name exactly`} />
      </div>

      {/* Section 6: Edge Cases to Say Out Loud */}
      <SectionHeader icon={Shield} number={6} title="Edge Cases to Say Out Loud" color="indigo" />
      <div className="grid gap-3 mb-8">
        <EdgeCaseItem text="What if the list is empty? I'll return an empty dict/list." />
        <EdgeCaseItem text="What if there are duplicates? My set handles that automatically." />
        <EdgeCaseItem text="What if the key doesn't exist? I check with 'not in' first." />
        <EdgeCaseItem text="NULL/None: I'd use COALESCE in SQL or 'is None' check in Python." />
      </div>

      {/* Section 7: Behavioral Quick Answers */}
      <SectionHeader icon={Users} number={7} title="Behavioral Quick Answers" color="purple" />
      <div className="grid gap-4 mb-8">
        <BehavioralCard
          question="Why Meta?"
          answer="Meta's data scale is unmatched. I want to work where data engineering decisions impact billions of users."
        />
        <BehavioralCard
          question="Tell me about a challenging project"
          answer="I built a unified data system at PayScale Inc — consolidating 14 sub-companies into Snowflake with a medallion architecture. The challenge was mapping different schemas to one canonical model."
        />
        <BehavioralCard
          question="How do you handle disagreements?"
          answer="I present data. At PayScale Inc I had a case where the team wanted to keep SSIS packages — I built a comparison dashboard that showed the dbt approach was faster and more maintainable. The data spoke for itself."
        />
      </div>
    </div>
  );
};

export default ScreenDayPrep;
