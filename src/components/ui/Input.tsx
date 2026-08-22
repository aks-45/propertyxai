'use client';

import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  className = '',
  required,
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className="mb-1.5 text-sm font-medium text-dark-navy dark:text-gray-200">
          {label} {required && <span className="text-danger-red">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <input
          className={`
            w-full bg-white dark:bg-gray-800 border outline-none
            text-dark-navy dark:text-white rounded-input h-10 px-3
            transition-all duration-300 focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-primary-blue/50 focus:border-primary-blue dark:focus:border-primary-blue
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger-red dark:border-danger-red focus:border-danger-red focus:ring-danger-red/30' : 'border-gray-300 dark:border-gray-700'}
          `}
          {...props}
        />
      </div>
      {error && <span className="mt-1 text-sm text-danger-red">{error}</span>}
    </div>
  );
};
