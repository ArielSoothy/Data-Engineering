import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, BarChart2, Award, ChevronRight,
  Database, Code, BarChart, Video, CheckCircle, Braces
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatTime } from '../../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    progress, 
    getTotalProgress, 
    getCategoryProgress,
    getEstimatedTimeRemaining 
  } = useAppContext();
  
  const [currentDate] = useState(new Date());
  const [interviewDate] = useState(new Date(2023, 11, 17)); // Dec 17, 2023
  const [daysRemaining, setDaysRemaining] = useState(0);
  
  // Calculate days remaining until interview
  useEffect(() => {
    const diffTime = interviewDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysRemaining(diffDays);
  }, [currentDate, interviewDate]);
  
  // Define the study plan timeline
  const timeline = [
    {
      day: 'Friday Evening',
      date: 'Dec 13',
      title: 'Foundation',
      hours: 4,
      focus: ['SQL Basics (Questions 1-20)'],
      goal: 'Core SQL understanding',
      sections: ['sql-basics'],
      completed: getCategoryProgress('sqlBasics') >= 50 // 20/40 = 50%
    },
    {
      day: 'Saturday',
      date: 'Dec 14',
      title: 'SQL Mastery',
      hours: 8,
      focus: [
        'SQL Basics (Questions 21-40)',
        'SQL Advanced (Questions 1-15)',
        'Start Python Basics'
      ],
      goal: 'SQL confidence + Python foundation',
      sections: ['sql-basics', 'sql-advanced', 'python-basics'],
      completed: 
        getCategoryProgress('sqlBasics') === 100 && 
        getCategoryProgress('sqlAdvanced') >= 75 && // 15/20 = 75%
        getCategoryProgress('pythonBasics') >= 20 // Some progress
    },
    {
      day: 'Sunday',
      date: 'Dec 15',
      title: 'Python + Problem Solving',
      hours: 8,
      focus: [
        'Python Basics (Questions 1-25)',
        'Python Advanced (Questions 1-15)',
        'Problem Decomposition (5 scenarios)'
      ],
      goal: 'Python competency + system thinking',
      sections: ['python-basics', 'python-advanced', 'decomposition'],
      completed: 
        getCategoryProgress('pythonBasics') === 100 &&
        getCategoryProgress('pythonAdvanced') === 100 &&
        getCategoryProgress('decompositionScenarios') >= 50 // 5/10 = 50%
    },
    {
      day: 'Monday',
      date: 'Dec 16',
      title: 'Integration + Practice',
      hours: 6,
      focus: [
        'Azure Services quick reference',
        'Mock Interview simulator',
        'Practice verbal explanations'
      ],
      goal: 'Interview readiness',
      sections: ['azure-services', 'mock-interview'],
      completed: 
        getCategoryProgress('decompositionScenarios') === 100 &&
        getCategoryProgress('mockInterviews') >= 60 // 3/5 = 60%
    },
    {
      day: 'Tuesday Morning',
      date: 'Dec 17',
      title: 'Final Prep',
      hours: 2,
      focus: [
        'Review weak areas',
        'Confidence building',
        'Relaxation before interview'
      ],
      goal: 'Confidence and readiness',
      sections: [],
      completed: getTotalProgress() === 100
    }
  ];
  
  // Calculate current timeline day
  const getCurrentTimelineDay = () => {
    if (daysRemaining > 4) return -1; // Not started yet
    if (daysRemaining <= 0) return 4; // Final day or past
    return 4 - daysRemaining;
  };
  
  const currentTimelineDay = getCurrentTimelineDay();
  
  // Progress summary by category
  const categories = [
    { 
      id: 'sqlBasics', 
      name: 'SQL Basics', 
      icon: <Database size={20} />, 
      count: 40,
      path: '/sql-basics',
      color: 'bg-blue-500'
    },
    { 
      id: 'sqlAdvanced', 
      name: 'SQL Advanced', 
      icon: <Database size={20} />, 
      count: 20,
      path: '/sql-advanced',
      color: 'bg-indigo-500'
    },
    { 
      id: 'pythonBasics', 
      name: 'Python Basics', 
      icon: <Code size={20} />, 
      count: 25,
      path: '/python-basics',
      color: 'bg-green-500'
    },
    { 
      id: 'pythonAdvanced', 
      name: 'Python Advanced', 
      icon: <Braces size={20} />, 
      count: 15,
      path: '/python-advanced',
      color: 'bg-emerald-500'
    },
    { 
      id: 'decompositionScenarios', 
      name: 'Problem Decomposition', 
      icon: <BarChart size={20} />, 
      count: 10,
      path: '/decomposition',
      color: 'bg-yellow-500'
    },
    { 
      id: 'mockInterviews', 
      name: 'Mock Interviews', 
      icon: <Video size={20} />, 
      count: 5,
      path: '/mock-interview',
      color: 'bg-red-500'
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8 pb-36 md:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Progress Overview */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Study Progress</h2>
              <div className="flex items-center">
                <Clock size={18} className="mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {daysRemaining > 0 
                    ? `${daysRemaining} days until interview` 
                    : 'Interview day!'}
                </span>
              </div>
            </div>
            
            {/* Overall progress */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Overall Progress
                  </span>
                  <div className="text-2xl font-bold">{getTotalProgress()}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Time Remaining
                  </div>
                  <div className="text-lg font-semibold">
                    {formatTime(getEstimatedTimeRemaining())}
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500"
                  style={{ width: `${getTotalProgress()}%` }}
                ></div>
              </div>
            </div>
            
            {/* Category progress */}
            <div className="space-y-4">
              {categories.map((category) => {
                const progressPercent = getCategoryProgress(category.id as keyof typeof progress);
                const completedCount = Math.round((progressPercent / 100) * category.count);
                
                return (
                  <div key={category.id} className="group">
                    <button 
                      onClick={() => navigate(category.path)}
                      className="w-full flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-md mr-3 ${category.color} bg-opacity-20 dark:bg-opacity-10`}>
                          {category.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {completedCount} of {category.count} complete
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">{progressPercent}%</span>
                        <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    </button>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
                      <div 
                        className={`${category.color} h-1.5 rounded-full`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 mr-4">
                <BarChart2 size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                <div className="text-xl font-bold">
                  {getTotalProgress()}% Done
                </div>
              </div>
            </div>
            
            <div className="card flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900 dark:bg-opacity-30 mr-4">
                <Clock size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Study Time</div>
                <div className="text-xl font-bold">
                  {formatTime(28 * 60 - getEstimatedTimeRemaining())}
                </div>
              </div>
            </div>
            
            <div className="card flex items-center">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900 dark:bg-opacity-30 mr-4">
                <Award size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Interview Readiness</div>
                <div className="text-xl font-bold">
                  {getTotalProgress() < 25 ? 'Getting Started' : 
                   getTotalProgress() < 50 ? 'In Progress' :
                   getTotalProgress() < 75 ? 'Almost Ready' : 
                   getTotalProgress() < 100 ? 'Well Prepared' : 'Fully Ready'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Timeline */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center mb-4">
              <Calendar size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold">Study Timeline</h2>
            </div>
            
            <div className="space-y-6">
              {timeline.map((day, index) => (
                <div 
                  key={day.day}
                  className={`relative pl-8 ${
                    index < timeline.length - 1 ? 'pb-6 border-l-2' : ''
                  } ${
                    index < currentTimelineDay 
                      ? 'border-blue-500 dark:border-blue-400' 
                      : index === currentTimelineDay
                        ? 'border-blue-500 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Timeline dot */}
                  <div 
                    className={`absolute left-0 w-4 h-4 rounded-full transform -translate-x-2 ${
                      index < currentTimelineDay
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : index === currentTimelineDay
                          ? 'bg-blue-500 dark:bg-blue-400 ring-4 ring-blue-100 dark:ring-blue-900'
                          : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    {day.completed && (
                      <CheckCircle size={16} className="text-white absolute -left-0 -top-0" />
                    )}
                  </div>
                  
                  {/* Day content */}
                  <div className={`${
                    index === currentTimelineDay 
                      ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  } border rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{day.day}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{day.date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        day.completed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400'
                          : index === currentTimelineDay
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {day.completed 
                          ? 'Completed' 
                          : index === currentTimelineDay 
                            ? 'Today' 
                            : `${day.hours}h`}
                      </span>
                    </div>
                    
                    <h4 className="font-medium mb-1">{day.title}</h4>
                    
                    <ul className="text-sm space-y-1 mb-2">
                      {day.focus.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <div className="min-w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 mr-2"></div>
                          <span className="text-gray-600 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <strong>Goal:</strong> {day.goal}
                    </div>
                    
                    {index === currentTimelineDay && day.sections.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap gap-2">
                          {day.sections.map(section => (
                            <button
                              key={section}
                              onClick={() => navigate(`/${section}`)}
                              className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                              Start {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
