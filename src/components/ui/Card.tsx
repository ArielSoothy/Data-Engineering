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
        'bg-white dark:bg-gray-800/95 rounded-2xl shadow-sm',
        'border border-gray-100 dark:border-gray-700/60',
        paddingClasses[padding],
        hover ? 'hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer' : '',
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
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
