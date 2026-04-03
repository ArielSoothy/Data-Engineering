import { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';
import { Button } from './ui';
import { setUserCode, pullProgress, pushProgress } from '../services/progressSync';

interface Props {
  onReady: () => void;
}

export default function UserGate({ onReady }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = code.trim().toLowerCase();
    if (trimmed.length < 3) {
      setError('Code must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');
    setUserCode(trimmed);

    try {
      const restored = await pullProgress();
      if (!restored) {
        // New user — push empty state so they exist in Supabase
        await pushProgress();
      }
    } catch {
      // Offline is fine — localStorage still works
    }

    onReady();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <User size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to DE Prep</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter a unique code to track your progress. Use the same code on any device to sync.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. ariel, john_doe, study2026"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            maxLength={30}
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            loading={loading}
            disabled={code.trim().length < 3}
            icon={<ArrowRight size={18} />}
          >
            Start Studying
          </Button>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Your progress syncs automatically across devices using this code.
          </p>
        </div>
      </div>
    </div>
  );
}
