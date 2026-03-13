import { useNavigate } from 'react-router-dom';
import { Timer, BarChart3, Clock, Target } from 'lucide-react';
import { Card, Button } from '../ui';

export default function PracticeHub() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Target size={24} className="text-purple-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Practice</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Timed Mock */}
        <Card padding="lg" className="hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800 transition-all cursor-pointer" onClick={() => navigate('/practice/timed')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Timer size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Timed Mock</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">60-min full simulation</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            50 questions, 25 min SQL + 25 min Python. Mirrors Meta's actual interview format with real-time timer and scoring.
          </p>
          <Button variant="primary" size="sm" className="w-full" icon={<Timer size={14} />}>
            Start Mock Interview
          </Button>
        </Card>

        {/* Daily Assessment */}
        <Card padding="lg" className="hover:ring-2 hover:ring-green-200 dark:hover:ring-green-800 transition-all cursor-pointer" onClick={() => navigate('/practice/daily')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
              <BarChart3 size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Daily Assessment</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">7-question readiness check</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Quick daily quiz tied to your 24-day study plan. Tracks your skill breakdown and identifies weak areas.
          </p>
          <Button variant="primary" size="sm" className="w-full" icon={<BarChart3 size={14} />}>
            Start Daily Quiz
          </Button>
        </Card>
      </div>

      {/* Quick tips */}
      <Card padding="md" className="mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={16} className="text-amber-500" />
          <p className="font-bold text-sm text-gray-900 dark:text-white">Interview Tips</p>
        </div>
        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 list-disc list-inside">
          <li>Meta DE screen: 25 min SQL (PostgreSQL) + 25 min Python + 10 min product sense</li>
          <li>SQL: Focus on window functions, CTEs, and aggregation patterns</li>
          <li>Python: Pandas is heavily tested — know groupby, merge, and pivot operations</li>
          <li>Time management: Don't spend &gt;5 min on any single question</li>
        </ul>
      </Card>
    </div>
  );
}
