import { useNavigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { 
  LayoutDashboard, Database, Code, Braces, BarChart, 
  Cloud, Video, Moon, Sun
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

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
  
  // Define the tabs with their icons and paths
  const tabs: TabItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      path: '/' 
    },
    { 
      id: 'sql-basics', 
      label: 'SQL Basics', 
      icon: <Database size={20} />, 
      path: '/sql-basics' 
    },
    { 
      id: 'sql-advanced', 
      label: 'SQL Advanced', 
      icon: <Database size={20} />, 
      path: '/sql-advanced' 
    },
    { 
      id: 'python-basics', 
      label: 'Python Basics', 
      icon: <Code size={20} />, 
      path: '/python-basics' 
    },
    { 
      id: 'python-advanced', 
      label: 'Python Advanced', 
      icon: <Braces size={20} />, 
      path: '/python-advanced' 
    },
    { 
      id: 'decomposition', 
      label: 'Problem Decomposition', 
      icon: <BarChart size={20} />, 
      path: '/decomposition' 
    },
    { 
      id: 'azure-services', 
      label: 'Azure Services', 
      icon: <Cloud size={20} />, 
      path: '/azure-services' 
    },
    { 
      id: 'mock-interview', 
      label: 'Mock Interview', 
      icon: <Video size={20} />, 
      path: '/mock-interview' 
    }
  ];
  
  // Find the active tab based on the current location
  const activeTab = tabs.find(tab => tab.path === location.pathname) || tabs[0];
  
  // Handle tab click
  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Desktop navigation */}
      <div className="hidden md:flex border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
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
            
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-auto flex items-center px-4 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {preferences.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
        <div className="grid grid-cols-4 gap-1">
          {tabs.slice(0, 4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center justify-center py-2 ${
                activeTab.id === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {tab.icon}
              <span className="text-xs mt-1">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
        
        {/* Second row for mobile */}
        <div className="grid grid-cols-4 gap-1 border-t border-gray-200 dark:border-gray-700">
          {tabs.slice(4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center justify-center py-2 ${
                activeTab.id === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {tab.icon}
              <span className="text-xs mt-1">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
          
          {/* Dark mode toggle for mobile */}
          <button
            onClick={toggleDarkMode}
            className="flex flex-col items-center justify-center py-2 text-gray-500 dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {preferences.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-xs mt-1">Theme</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
