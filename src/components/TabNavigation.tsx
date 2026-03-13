import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  LayoutDashboard, BarChart, Cloud,
  Video, Book, Moon, Sun, GraduationCap,
  Briefcase, Menu, X,
  Zap, Code2, Target
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

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

  // Primary tabs (mobile bottom nav + desktop top bar)
  const primaryTabs: TabItem[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} />, path: '/' },
    { id: 'quick', label: 'Quick', icon: <Zap size={20} />, path: '/quick' },
    { id: 'deep', label: 'Deep', icon: <Code2 size={20} />, path: '/deep' },
    { id: 'practice', label: 'Practice', icon: <Target size={20} />, path: '/practice' },
  ];

  // All tabs for desktop and More drawer
  const allTabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { id: 'quick', label: 'Quick Mode', icon: <Zap size={20} />, path: '/quick' },
    { id: 'deep', label: 'Deep Mode', icon: <Code2 size={20} />, path: '/deep' },
    { id: 'practice', label: 'Practice', icon: <Target size={20} />, path: '/practice' },
    { id: 'decomposition', label: 'Product Sense', icon: <BarChart size={20} />, path: '/decomposition' },
    { id: 'tech-stack', label: 'Meta Tech Stack', icon: <Cloud size={20} />, path: '/tech-stack' },
    { id: 'mock-interview', label: 'Mock Interview', icon: <Video size={20} />, path: '/mock-interview' },
    { id: 'my-projects', label: 'My Projects', icon: <Briefcase size={20} />, path: '/my-projects' },
    { id: 'glossary', label: 'Glossary', icon: <Book size={20} />, path: '/glossary' },
  ];

  // Secondary tabs for More drawer (exclude primary tabs)
  const secondaryTabs = allTabs.filter(t => !primaryTabs.some(p => p.id === t.id));

  const activeTab = allTabs.find(tab => tab.path === location.pathname)
    || allTabs.find(tab => tab.path !== '/' && location.pathname.startsWith(tab.path))
    || allTabs[0];

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

            {primaryTabs.map((tab) => (
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

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className={`flex items-center px-4 py-3 whitespace-nowrap border-b-2 font-medium text-sm ${
                  drawerOpen || !primaryTabs.some(p => p.id === activeTab.id)
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2"><Menu size={20} /></span>
                More
              </button>
              {drawerOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-1">
                  {secondaryTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        activeTab.id === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="ml-auto flex items-center px-3 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
    </div>
  );
};

export default TabNavigation;
