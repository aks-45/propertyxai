'use client';

import React, { useState, useEffect } from 'react';

interface DotsLoaderProps {
  text?: string;
  className?: string;
  textClassName?: string;
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({
  text = 'Analyzing property',
  className = '',
  textClassName = 'text-lg font-bold text-dark-navy dark:text-white',
}) => {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '.';
        if (prev === '..') return '...';
        return '..';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <span className={textClassName}>{text}</span>
      <span className={`${textClassName} inline-block w-6 text-left`}>{dots}</span>
    </div>
  );
};
