'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';

export default function Template({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show round loading animation for exactly 1 second on every page switch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col relative min-h-full">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="page-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md"
          >
            {/* Round Circular Theme Spinner */}
            <div className="relative flex items-center justify-center mb-5">
              {/* Outer rotating glowing gradient circle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="w-20 h-20 rounded-full border-4 border-transparent border-t-primary-blue border-r-primary-blue/40 border-b-blue-400/20 shadow-lg shadow-primary-blue/20"
              />

              {/* Inner reverse rotating circle */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                className="absolute w-14 h-14 rounded-full border-3 border-transparent border-t-indigo-500 border-l-indigo-300/30"
              />

              {/* Center Theme Icon */}
              <div className="absolute flex items-center justify-center">
                <Logo size="sm" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="flex items-center gap-1.5 text-center">
              <span className="text-sm font-bold text-dark-navy dark:text-white tracking-wider uppercase">
                Loading
              </span>
              <span className="flex space-x-1">
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                  className="w-1.5 h-1.5 rounded-full bg-primary-blue inline-block"
                />
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-primary-blue inline-block"
                />
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-primary-blue inline-block"
                />
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-1.5">
              Property X AI Intelligence
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="w-full flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
