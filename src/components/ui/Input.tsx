import React from 'react';

interface InputProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  maxLength?: number;
  className?: string;
}

export const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error,
  maxLength,
  className = '',
}: InputProps) => {
  return (
    <div className={className}>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={[
            'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
            icon ? 'pl-10' : '',
            error
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
