// Format time helpers
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Difficulty level helpers
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-600 dark:text-green-400';
    case 'Medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'Hard':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export const getDifficultyBgColor = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30';
    case 'Medium':
      return 'bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30';
    case 'Hard':
      return 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30';
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
};

// Timer helpers
export const getTimeLeftPercent = (
  startTime: Date, 
  durationMinutes: number
): number => {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();
  const totalMs = endTime.getTime() - startTime.getTime();
  const elapsedMs = now.getTime() - startTime.getTime();
  
  if (elapsedMs >= totalMs) return 0;
  
  return Math.round(((totalMs - elapsedMs) / totalMs) * 100);
};

// Date handling for timeline
export const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Generate PDF helpers
export const downloadAsFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Local storage helpers
export const saveToLocalStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error retrieving from localStorage:', error);
    return defaultValue;
  }
};
