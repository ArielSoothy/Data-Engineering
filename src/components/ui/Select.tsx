import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export const Select = ({
  value,
  onChange,
  options,
  icon,
  placeholder,
  className = '',
}: SelectProps) => {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        className={[
          'pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md',
          'bg-white dark:bg-gray-800 appearance-none text-sm text-gray-900 dark:text-white',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400',
          icon ? 'pl-8' : 'pl-3',
        ].join(' ')}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
