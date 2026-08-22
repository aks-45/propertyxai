'use client';

import React, { SelectHTMLAttributes } from 'react';

export interface Option {
  value: string | number;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  label?: string;
  options: Option[];
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  required,
  placeholder,
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className="mb-1.5 text-sm font-medium text-dark-navy dark:text-gray-200">
          {label} {required && <span className="text-danger-red">*</span>}
        </label>
      )}
      <select
        className={`
          w-full bg-white dark:bg-gray-800 border outline-none
          text-dark-navy dark:text-white rounded-input h-10 px-3 appearance-none
          transition-all duration-300 focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-primary-blue/50 focus:border-primary-blue dark:focus:border-primary-blue
          ${error ? 'border-danger-red dark:border-danger-red focus:border-danger-red focus:ring-danger-red/30' : 'border-gray-300 dark:border-gray-700'}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 text-sm text-danger-red">{error}</span>}
    </div>
  );
};
