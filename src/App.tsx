import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import TabNavigation from './components/TabNavigation';
import Dashboard from './components/tabs/Dashboard';
import SQLBasics from './components/tabs/SQLBasics';
import SQLAdvanced from './components/tabs/SQLAdvanced';
import PythonBasics from './components/tabs/PythonBasics';
import PythonAdvanced from './components/tabs/PythonAdvanced';
import Trivia from './components/tabs/Trivia';
import Glossary from './components/tabs/Glossary';
import { ApiTest } from './components/ApiTest';
import { ApiDiagnostic } from './components/ApiDiagnostic';

// Apply dark mode on initial load
const DarkModeInitializer = () => {
  const { preferences } = useAppContext();
  
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.darkMode]);
  
  return null;
};

// Determine if we're in production GitHub Pages or local development
const isGitHubPages = window.location.hostname.includes('github.io');

function App() {
  const Router = isGitHubPages ? HashRouter : BrowserRouter;
  
  return (
    <AppProvider>
      <DarkModeInitializer />
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
          <TabNavigation />
          <main className="pb-32 md:pb-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sql-basics" element={<SQLBasics />} />
              <Route path="/sql-advanced" element={<SQLAdvanced />} />
              <Route path="/python-basics" element={<PythonBasics />} />
              <Route path="/python-advanced" element={<PythonAdvanced />} />
              <Route path="/trivia" element={<Trivia />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/api-test" element={<ApiTest />} />
              <Route path="/api-diagnostic" element={<ApiDiagnostic />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
