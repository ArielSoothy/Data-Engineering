import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import TabNavigation from './components/TabNavigation';
import { Spinner } from './components/ui';

// Eagerly loaded (always visible)
import Dashboard from './components/tabs/Dashboard';

// Lazy-loaded tabs
const SQLBasics = lazy(() => import('./components/tabs/SQLBasics'));
const SQLAdvanced = lazy(() => import('./components/tabs/SQLAdvanced'));
const PythonBasics = lazy(() => import('./components/tabs/PythonBasics'));
const PythonAdvanced = lazy(() => import('./components/tabs/PythonAdvanced'));
const Trivia = lazy(() => import('./components/tabs/Trivia'));
const Glossary = lazy(() => import('./components/tabs/Glossary'));
const Decomposition = lazy(() => import('./components/tabs/Decomposition'));
const MetaTechStack = lazy(() => import('./components/tabs/MetaTechStack'));
const MockInterview = lazy(() => import('./components/tabs/MockInterview'));
const MyProjects = lazy(() => import('./components/tabs/MyProjects'));
const AdaptivePractice = lazy(() => import('./components/tabs/AdaptivePractice'));
const MetaOfficial = lazy(() => import('./components/tabs/MetaOfficial'));
const QuickDrill = lazy(() => import('./components/tabs/QuickDrill'));
const TimedAssessment = lazy(() => import('./components/tabs/TimedAssessment'));
const DailyAssessment = lazy(() => import('./components/tabs/DailyAssessment'));
const StudyHub = lazy(() => import('./components/study-hub/StudyHub'));
const ApiTest = lazy(() => import('./components/ApiTest').then(m => ({ default: m.ApiTest })));
const ApiDiagnostic = lazy(() => import('./components/ApiDiagnostic').then(m => ({ default: m.ApiDiagnostic })));

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
  return (
    <AppProvider>
      <DarkModeInitializer />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
          <TabNavigation />
          <main className="pb-32 md:pb-8">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sql-basics" element={<SQLBasics />} />
                <Route path="/sql-advanced" element={<SQLAdvanced />} />
                <Route path="/python-basics" element={<PythonBasics />} />
                <Route path="/python-advanced" element={<PythonAdvanced />} />
                <Route path="/trivia" element={<Trivia />} />
                <Route path="/adaptive" element={<AdaptivePractice />} />
                <Route path="/glossary" element={<Glossary />} />
                <Route path="/decomposition" element={<Decomposition />} />
                <Route path="/tech-stack" element={<MetaTechStack />} />
                <Route path="/mock-interview" element={<MockInterview />} />
                <Route path="/my-projects" element={<MyProjects />} />
                <Route path="/meta-official" element={<MetaOfficial />} />
                <Route path="/quick-drill" element={<QuickDrill />} />
                <Route path="/timed-assessment" element={<TimedAssessment />} />
                <Route path="/daily-assessment" element={<DailyAssessment />} />
                <Route path="/study" element={<StudyHub />} />
                <Route path="/api-test" element={<ApiTest />} />
                <Route path="/api-diagnostic" element={<ApiDiagnostic />} />
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
