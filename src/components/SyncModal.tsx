import { useState } from 'react';
import { RefreshCw, Copy, Check, X, Cloud, CloudOff } from 'lucide-react';
import { Button } from './ui';
import { pullProgress, pushProgress } from '../services/progressSync';

interface SyncModalProps {
  open: boolean;
  onClose: () => void;
  onSynced: () => void;
}

export const SyncModal = ({ open, onClose, onSynced }: SyncModalProps) => {
  const existing = localStorage.getItem('de_prep_device_id');
  const [code, setCode] = useState(existing ?? '');
  const [status, setStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleSync = async () => {
    const trimmed = code.trim().toLowerCase();
    if (trimmed.length < 3) return;
    setStatus('syncing');
    localStorage.setItem('de_prep_device_id', trimmed);
    try {
      const restored = await pullProgress();
      if (!restored) {
        // No cloud data yet — push current local data
        await pushProgress();
      }
      setStatus('done');
      onSynced();
    } catch {
      setStatus('error');
    }
  };

  const handleCopy = () => {
    if (existing) {
      navigator.clipboard.writeText(existing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Cloud size={24} className="text-blue-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sync Progress</h2>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter a sync code to share progress across devices. Use the same code on any browser to keep your data in sync.
        </p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value); setStatus('idle'); }}
              placeholder="e.g. ariel123"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              maxLength={30}
            />
            {existing && (
              <button onClick={handleCopy} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Copy code">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
              </button>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleSync}
            loading={status === 'syncing'}
            disabled={code.trim().length < 3}
            icon={<RefreshCw size={16} />}
          >
            {existing ? 'Sync Now' : 'Connect'}
          </Button>

          {status === 'done' && (
            <p className="text-sm text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-1.5">
              <Check size={14} /> Synced successfully
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-500 text-center flex items-center justify-center gap-1.5">
              <CloudOff size={14} /> Sync failed — check your connection
            </p>
          )}
        </div>

        {existing && (
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
            Current code: <span className="font-mono font-medium">{existing}</span>
          </p>
        )}
      </div>
    </div>
  );
};
