import { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getActiveProvider,
  setActiveProvider,
  getProviderApiKey,
  setProviderApiKey,
  type AIProvider
} from '../services/aiService';
import { Button, Badge } from './ui';

const SAVE_NOTIFICATION_TIMEOUT_MS = 2500;

interface ProviderMeta {
  label: string;
  badge: string;
  badgeColor: 'green' | 'yellow' | 'gray';
  keyPlaceholder: string;
  keyLink?: string;
  keyLinkLabel?: string;
  description: string;
}

const PROVIDER_META: Record<AIProvider, ProviderMeta> = {
  groq: {
    label: 'Groq',
    badge: 'Free',
    badgeColor: 'green',
    keyPlaceholder: 'gsk_...',
    keyLink: 'https://console.groq.com/keys',
    keyLinkLabel: 'Get free key at console.groq.com',
    description: 'Llama 3.3 70B — fast, free tier, great for practice'
  },
  gemini: {
    label: 'Gemini',
    badge: 'Free',
    badgeColor: 'green',
    keyPlaceholder: 'AIza...',
    keyLink: 'https://aistudio.google.com/app/apikey',
    keyLinkLabel: 'Get free key at aistudio.google.com',
    description: 'Gemini 2.5 Flash — Google\'s latest, free tier'
  },
  claude: {
    label: 'Claude',
    badge: 'Paid',
    badgeColor: 'yellow',
    keyPlaceholder: 'sk-ant-...',
    description: 'Claude Haiku — Anthropic, requires paid API key'
  }
};

const PROVIDERS: AIProvider[] = ['groq', 'gemini', 'claude'];

export const AISettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(getActiveProvider());
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [configuredMap, setConfiguredMap] = useState<Record<AIProvider, boolean>>(() => ({
    groq: !!getProviderApiKey('groq'),
    claude: !!getProviderApiKey('claude'),
    gemini: !!getProviderApiKey('gemini'),
  }));

  // Load the key for the currently selected provider whenever it changes
  useEffect(() => {
    const existing = getProviderApiKey(selectedProvider);
    setApiKey(existing ?? '');
    setShowKey(false);
    setSaved(false);
  }, [selectedProvider]);

  const handleSave = () => {
    setActiveProvider(selectedProvider);
    if (apiKey.trim()) {
      setProviderApiKey(selectedProvider, apiKey.trim());
    }
    setConfiguredMap(prev => ({ ...prev, [selectedProvider]: !!apiKey.trim() }));
    setSaved(true);
    setTimeout(() => setSaved(false), SAVE_NOTIFICATION_TIMEOUT_MS);
  };

  const currentProvider = getActiveProvider();
  const currentKey = getProviderApiKey(currentProvider);
  const isConfigured = !!currentKey;
  const selectedMeta = PROVIDER_META[selectedProvider];

  return (
    <div className="card">
      {/* Header — always visible */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full justify-between px-0 py-0 hover:bg-transparent dark:hover:bg-transparent rounded-none"
        aria-expanded={isOpen}
        icon={isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        iconPosition="right"
      >
        <div className="flex items-center gap-3">
          <div className="text-base font-semibold">AI Settings</div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {PROVIDER_META[currentProvider].label}
            {' '}
            <span className={isConfigured
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-500 dark:text-red-400'
            }>
              {isConfigured ? '(key set)' : '(no key — mock mode)'}
            </span>
          </span>
        </div>
      </Button>

      {/* Collapsible body */}
      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Provider selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map(p => {
                const meta = PROVIDER_META[p];
                const configured = configuredMap[p];
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedProvider(p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      selectedProvider === p
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="font-medium">{meta.label}</span>
                    <Badge
                      label={meta.badge}
                      variant="custom"
                      color={meta.badgeColor}
                      size="sm"
                    />
                    <span className={configured ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}>
                      {configured ? '✓' : '✗'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {selectedMeta.description}
            </p>
          </div>

          {/* API key input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedMeta.label} API Key
              </label>
              {selectedMeta.keyLink && (
                <a
                  href={selectedMeta.keyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedMeta.keyLinkLabel}
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={selectedMeta.keyPlaceholder}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(prev => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-transparent dark:hover:bg-transparent border-none"
                aria-label={showKey ? 'Hide key' : 'Show key'}
                icon={showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              />
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Stored only in your browser's localStorage — never sent anywhere except the provider's API.
            </p>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              icon={<Save size={15} />}
              iconPosition="left"
            >
              Save Settings
            </Button>
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Saved! Active on next request.
              </span>
            )}
          </div>

          {/* Quick guide */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md p-3 space-y-1">
            <div className="font-medium text-gray-600 dark:text-gray-300 mb-1">No key? No problem.</div>
            <div>The app works in mock feedback mode when no key is set — useful for testing UI without API costs.</div>
            <div className="mt-1">Groq and Gemini both have generous free tiers. Groq is the default and recommended starting point.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISettings;
