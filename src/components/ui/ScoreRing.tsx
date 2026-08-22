'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  label,
  showLabel = true,
  animated = true,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  const clampedScore = Math.min(100, Math.max(0, score));

  useEffect(() => {
    if (animated) {
      let startTimestamp: number;
      const duration = 1000;
      let frame: number;
      
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setDisplayScore(Math.floor(progress * clampedScore));
        if (progress < 1) {
          frame = window.requestAnimationFrame(step);
        }
      };
      frame = window.requestAnimationFrame(step);
      return () => { if (frame) window.cancelAnimationFrame(frame); };
    } else {
      setTimeout(() => setDisplayScore(clampedScore), 0);
    }
  }, [clampedScore, animated]);

  let color = 'text-danger-red';
  let strokeColor = 'stroke-danger-red';
  if (clampedScore >= 80) {
    color = 'text-success-green';
    strokeColor = 'stroke-success-green';
  } else if (clampedScore >= 60) {
    color = 'text-warning-amber';
    strokeColor = 'stroke-warning-amber';
  }

  const sizes = {
    sm: { radius: 36, stroke: 8, svgSize: 80, fontSize: 'text-xl' },
    md: { radius: 55, stroke: 10, svgSize: 120, fontSize: 'text-3xl' },
    lg: { radius: 84, stroke: 12, svgSize: 180, fontSize: 'text-5xl' },
  };

  const s = sizes[size];
  const center = s.svgSize / 2;
  const circumference = 2 * Math.PI * s.radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: s.svgSize, height: s.svgSize }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${s.svgSize} ${s.svgSize}`}>
          <circle
            cx={center}
            cy={center}
            r={s.radius}
            fill="transparent"
            className="stroke-light-blue-gray"
            strokeWidth={s.stroke}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={s.radius}
            fill="transparent"
            className={strokeColor}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: animated ? circumference : strokeDashoffset }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${color} ${s.fontSize}`}>
            {displayScore}
          </span>
          <span className="text-gray-400 text-xs font-medium -mt-1">/ 100</span>
        </div>
      </div>
      {showLabel && label && (
        <span className="mt-3 font-medium text-dark-navy text-sm">{label}</span>
      )}
    </div>
  );
};
