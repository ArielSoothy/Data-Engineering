import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  LayoutDashboard, Database, Code, Braces, BarChart,
  Cloud, Video, Book, Moon, Sun, Target, GraduationCap,
  Briefcase, Zap, Building2, BookOpen, Timer, Menu, X, RefreshCw, BarChart3
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { SyncModal } from './SyncModal';

interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
}

const TabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, toggleDarkMode } = useAppContext();
  const isOnline = useOnlineStatus();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  // Primary mobile tabs (bottom nav)
  const primaryTabs: TabItem[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} />, path: '/' },
    { id: 'quick-drill', label: 'Drill', icon: <BookOpen size={20} />, path: '/quick-drill' },
    { id: 'adaptive', label: 'Practice', icon: <Zap size={20} />, path: '/adaptive' },
    { id: 'timed-assessment', label: 'Timed', icon: <Timer size={20} />, path: '/timed-assessment' },
  ];

  // All tabs for desktop and More drawer
  const allTabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { id: 'quick-drill', label: 'Quick Drill', icon: <BookOpen size={20} />, path: '/quick-drill' },
    { id: 'sql-basics', label: 'SQL Basics', icon: <Database size={20} />, path: '/sql-basics' },
    { id: 'sql-advanced', label: 'SQL Advanced', icon: <Database size={20} />, path: '/sql-advanced' },
    { id: 'python-basics', label: 'Python Basics', icon: <Code size={20} />, path: '/python-basics' },
    { id: 'python-advanced', label: 'Python Advanced', icon: <Braces size={20} />, path: '/python-advanced' },
    { id: 'adaptive', label: 'Adaptive Practice', icon: <Zap size={20} />, path: '/adaptive' },
    { id: 'timed-assessment', label: 'Timed Assessment', icon: <Timer size={20} />, path: '/timed-assessment' },
    { id: 'daily-assessment', label: 'Daily Assessment', icon: <BarChart3 size={20} />, path: '/daily-assessment' },
    { id: 'trivia', label: 'Trivia', icon: <Target size={20} />, path: '/trivia' },
    { id: 'decomposition', label: 'Product Sense', icon: <BarChart size={20} />, path: '/decomposition' },
    { id: 'tech-stack', label: 'Meta Tech Stack', icon: <Cloud size={20} />, path: '/tech-stack' },
    { id: 'mock-interview', label: 'Mock Interview', icon: <Video size={20} />, path: '/mock-interview' },
    { id: 'my-projects', label: 'My Projects', icon: <Briefcase size={20} />, path: '/my-projects' },
    { id: 'meta-official', label: 'Meta Official', icon: <Building2 size={20} />, path: '/meta-official' },
    { id: 'glossary', label: 'Glossary', icon: <Book size={20} />, path: '/glossary' },
  ];

  // Secondary tabs for More drawer (exclude primary tabs)
  const secondaryTabs = allTabs.filter(t => !primaryTabs.some(p => p.id === t.id));

  const activeTab = allTabs.find(tab => tab.path === location.pathname) || allTabs[0];

  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
    setDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Desktop navigation */}
      <div className="hidden md:flex border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {/* Brand */}
            <div className="flex items-center px-4 py-3 mr-2 shrink-0 gap-2 border-b-2 border-transparent">
              <GraduationCap size={20} className="text-blue-500 dark:text-blue-400" />
              <span className="font-bold text-base tracking-tight text-gray-800 dark:text-gray-100">
                DE Prep
              </span>
            </div>

            {/* Divider */}
            <div className="my-2 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />

            {allTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center px-4 py-3 whitespace-nowrap border-b-2 font-medium text-sm ${
                  activeTab.id === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}

            {/* Sync + Dark mode */}
            <button
              onClick={() => setSyncOpen(true)}
              className="ml-auto flex items-center px-3 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Sync progress"
              title="Sync progress across devices"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={toggleDarkMode}
              className="flex items-center px-3 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {preferences.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {!isOnline && (
              <div className="flex items-center text-xs text-yellow-500 px-2">Offline</div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: More drawer overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl max-h-[70vh] overflow-y-auto pb-safe">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg">All Sections</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => { setDrawerOpen(false); setSyncOpen(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Sync">
                  <RefreshCw size={20} />
                </button>
                <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  {preferences.darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-2">
              {secondaryTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab.id === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 pb-safe">
        <div className="flex items-stretch">
          {primaryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] ${
                activeTab.id === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          ))}
          {/* More button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] ${
              drawerOpen || (!primaryTabs.some(p => p.id === activeTab.id))
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <Menu size={20} />
            <span className="text-[10px] mt-0.5 font-medium">More</span>
          </button>
        </div>
      </div>
      <SyncModal open={syncOpen} onClose={() => setSyncOpen(false)} onSynced={() => window.location.reload()} />
    </div>
  );
};

export default TabNavigation;
