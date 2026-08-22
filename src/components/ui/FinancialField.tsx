'use client';

import React from 'react';
import { FinancialFieldStatus } from '@/types/property';
import { motion, AnimatePresence } from 'framer-motion';

interface FinancialFieldProps {
  label: string;
  status: FinancialFieldStatus;
  amount?: number;
  onStatusChange: (status: FinancialFieldStatus) => void;
  onAmountChange: (amount: number) => void;
}

export function FinancialField({
  label,
  status,
  amount,
  onStatusChange,
  onAmountChange
}: FinancialFieldProps) {
  return (
    <div className="mb-4 bg-white dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
      <label className="block text-sm font-bold text-dark-navy dark:text-gray-200 mb-3">{label}</label>
      
      {/* Segmented Control */}
      <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-3">
        {(['amount', 'none'] as FinancialFieldStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              status === s
                ? 'bg-white dark:bg-gray-700 text-primary-blue dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {s === 'amount' ? 'Amount' : 'None'}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <AnimatePresence>
        {status === 'amount' && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="relative overflow-hidden"
          >
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Approx. Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">₹</span>
              </div>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={amount || ''}
                onChange={(e) => onAmountChange(Math.max(0, Number(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-dark-navy dark:text-white font-medium focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
