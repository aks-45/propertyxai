'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  const baseStyles = 'bg-white dark:bg-gray-800 rounded-card shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300';
  const hoverStyles = hoverable ? 'hover:shadow-lg dark:hover:shadow-black/50 hover:-translate-y-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue' : '';
  const classes = `${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={classes}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
