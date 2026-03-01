interface BadgeProps {
  label: string;
  variant?: 'difficulty' | 'custom';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

const difficultyClasses: Record<NonNullable<BadgeProps['difficulty']>, string> = {
  Easy: 'bg-green-100 text-green-600 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400',
  Medium: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-400',
  Hard: 'bg-red-100 text-red-600 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400',
};

const colorClasses: Record<NonNullable<BadgeProps['color']>, string> = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-400',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:bg-opacity-30 dark:text-gray-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-400',
};

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
};

export const Badge = ({
  label,
  variant = 'custom',
  difficulty,
  color = 'gray',
  size = 'md',
  className = '',
}: BadgeProps) => {
  let colorStyle: string;

  if (variant === 'difficulty' && difficulty) {
    colorStyle = difficultyClasses[difficulty];
  } else {
    colorStyle = colorClasses[color];
  }

  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        colorStyle,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </span>
  );
};
