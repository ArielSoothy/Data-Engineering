import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = ({
  title,
  subtitle,
  headerAction,
  padding = 'md',
  hover = false,
  onClick,
  className = '',
  children,
}: CardProps) => {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={[
        'bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900',
        'border border-gray-200 dark:border-gray-700',
        paddingClasses[padding],
        hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '',
        onClick ? 'text-left w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </Tag>
  );
};
