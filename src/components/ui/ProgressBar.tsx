'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showLabel = false,
  color = 'bg-primary-blue',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-end mb-1">
          <span className="text-sm font-medium text-dark-navy">{clampedProgress}%</span>
        </div>
      )}
      <div className="w-full bg-light-blue-gray rounded-full h-1.5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
