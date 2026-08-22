'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  fullWidth = false,
  loading = false,
  icon,
  disabled,
  onClick,
  type = 'button',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-button overflow-hidden relative';
  
  const variants = {
    primary: 'bg-primary-blue text-white shadow-md hover:shadow-lg hover:shadow-primary-blue/30 hover:-translate-y-0.5',
    secondary: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark-navy dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5',
    danger: 'bg-danger-red text-white shadow-md hover:shadow-lg hover:shadow-danger-red/30 hover:-translate-y-0.5',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:text-primary-blue dark:hover:text-blue-400 hover:bg-primary-blue/10 dark:hover:bg-primary-blue/20',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 h-8',
    md: 'text-base px-5 py-2 h-10',
    lg: 'text-lg px-8 py-3 h-12',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
};
