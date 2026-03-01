interface ProgressBarProps {
  value: number; // 0-100
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const colorClasses: Record<NonNullable<ProgressBarProps['color']>, string> = {
  blue: 'bg-blue-600 dark:bg-blue-500',
  green: 'bg-green-500 dark:bg-green-400',
  yellow: 'bg-yellow-500 dark:bg-yellow-400',
  red: 'bg-red-500 dark:bg-red-400',
  purple: 'bg-purple-500 dark:bg-purple-400',
};

const sizeClasses: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar = ({
  value,
  color = 'blue',
  size = 'md',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
          )}
          {showLabel && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{clamped}%</span>
          )}
        </div>
      )}
      <div className={['w-full bg-gray-200 dark:bg-gray-700 rounded-full', sizeClasses[size]].join(' ')}>
        <div
          className={['rounded-full transition-all duration-300', colorClasses[color], sizeClasses[size]].join(' ')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
