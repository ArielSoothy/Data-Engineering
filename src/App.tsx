import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import TabNavigation from './components/TabNavigation';
import UserGate from './components/UserGate';
import { Spinner } from './components/ui';
import { getUserCode } from './services/progressSync';

// Eagerly loaded (always visible)
import Dashboard from './components/tabs/Dashboard';

// Lazy-loaded tabs (12 routes)
const Glossary = lazy(() => import('./components/tabs/Glossary'));
const Decomposition = lazy(() => import('./components/tabs/Decomposition'));
const MetaTechStack = lazy(() => import('./components/tabs/MetaTechStack'));
const MyProjects = lazy(() => import('./components/tabs/MyProjects'));
const QuickMode = lazy(() => import('./components/quick-mode/QuickMode'));
const DeepMode = lazy(() => import('./components/deep-mode/DeepMode'));
const CheatSheet = lazy(() => import('./components/tabs/CheatSheet'));
const LeetCodePractice = lazy(() => import('./components/tabs/LeetCodePractice'));
const VisualLearning = lazy(() => import('./components/visual-learning/VisualLearning'));
const ScreenDayPrep = lazy(() => import('./components/tabs/ScreenDayPrep'));
const CoderPad = lazy(() => import('./components/tabs/CoderPad'));

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

const PageLoader = () => (
  <div className="flex items-center justify-center py-24">
    <Spinner size="lg" />
  </div>
);

function App() {
  const [hasUser, setHasUser] = useState(() => !!getUserCode());

  if (!hasUser) {
    return <UserGate onReady={() => setHasUser(true)} />;
  }

  return (
    <AppProvider>
      <DarkModeInitializer />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
          <TabNavigation />
          <main className="pb-20 md:pb-8">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/quick" element={<QuickMode />} />
                <Route path="/deep" element={<DeepMode />} />
                <Route path="/cheat-sheet" element={<CheatSheet />} />
                <Route path="/my-projects" element={<MyProjects />} />
                <Route path="/decomposition" element={<Decomposition />} />
                <Route path="/tech-stack" element={<MetaTechStack />} />
                <Route path="/glossary" element={<Glossary />} />
                <Route path="/code-practice" element={<LeetCodePractice />} />
                <Route path="/visual" element={<VisualLearning />} />
                <Route path="/coderpad" element={<CoderPad />} />
                <Route path="/screen-prep" element={<ScreenDayPrep />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
