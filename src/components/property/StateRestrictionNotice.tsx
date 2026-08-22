'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Scale,
  Building,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { StateRestrictionInfo } from '@/lib/stateRestrictions';
import Link from 'next/link';

interface StateRestrictionNoticeProps {
  info: StateRestrictionInfo;
  variant?: 'banner' | 'modal' | 'card' | 'inline';
  onAcknowledge?: () => void;
  showAcknowledgeButton?: boolean;
  className?: string;
}

export default function StateRestrictionNotice({
  info,
  variant = 'card',
  onAcknowledge,
  showAcknowledgeButton = false,
  className = '',
}: StateRestrictionNoticeProps) {
  const [isExpanded, setIsExpanded] = useState(variant === 'card' || variant === 'modal');

  const isProhibited = info.category === 'STRICTLY_PROHIBITED';
  const isPartial = info.category === 'PARTIAL_ZONAL';
  const isConditional = info.category === 'ALLOWED_CONDITIONAL';

  const themeStyles = isProhibited
    ? {
        border: 'border-red-300 dark:border-red-800/80',
        bg: 'bg-red-50/90 dark:bg-red-950/40',
        badgeBg: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200',
        titleColor: 'text-red-900 dark:text-red-200',
        textColor: 'text-red-800 dark:text-red-300',
        accentIcon: XCircle,
        iconColor: 'text-red-600 dark:text-red-400',
        ring: 'ring-red-200 dark:ring-red-900',
      }
    : isPartial
    ? {
        border: 'border-amber-300 dark:border-amber-800/80',
        bg: 'bg-amber-50/90 dark:bg-amber-950/40',
        badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
        titleColor: 'text-amber-950 dark:text-amber-200',
        textColor: 'text-amber-800 dark:text-amber-300',
        accentIcon: AlertTriangle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        ring: 'ring-amber-200 dark:ring-amber-900',
      }
    : {
        border: 'border-blue-300 dark:border-blue-800/80',
        bg: 'bg-blue-50/90 dark:bg-blue-950/40',
        badgeBg: 'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200',
        titleColor: 'text-blue-950 dark:text-blue-200',
        textColor: 'text-blue-800 dark:text-blue-300',
        accentIcon: CheckCircle2,
        iconColor: 'text-blue-600 dark:text-blue-400',
        ring: 'ring-blue-200 dark:ring-blue-900',
      };

  const Icon = themeStyles.accentIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${themeStyles.border} ${themeStyles.bg} ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-2.5 rounded-xl bg-white dark:bg-gray-900 shrink-0 shadow-xs border ${themeStyles.border}`}>
          <Icon className={`w-5 h-5 ${themeStyles.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${themeStyles.badgeBg}`}>
              {info.badgeLabel}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              State: {info.stateName}
            </span>
          </div>

          <h4 className={`text-sm sm:text-base font-bold leading-snug mb-1.5 ${themeStyles.titleColor}`}>
            {info.headline}
          </h4>

          <p className={`text-xs sm:text-sm leading-relaxed ${themeStyles.textColor}`}>
            {info.summary}
          </p>

          {/* Quick status tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/80 dark:bg-gray-900/80 p-2 rounded-lg border border-gray-200 dark:border-gray-800">
              <Building className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span>Flats / Homes:</span>
              <span className={info.canOutsidersBuyFlats ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {info.canOutsidersBuyFlats ? (isPartial ? 'Zonal / Valley Allowed' : 'Permitted (Municipal)') : 'Strictly Prohibited'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/80 dark:bg-gray-900/80 p-2 rounded-lg border border-gray-200 dark:border-gray-800">
              <Scale className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span>Agricultural Land:</span>
              <span className="text-rose-600 dark:text-rose-400">
                Prohibited for Outsiders
              </span>
            </div>
          </div>

          {/* Collapsible Deep Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 space-y-2.5 text-xs sm:text-sm"
              >
                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">Legal Authority & Basis: </span>
                  <span className="text-gray-600 dark:text-gray-400">{info.legalBasis}</span>
                </div>

                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">Permitted Buying Scope: </span>
                  <span className="text-gray-600 dark:text-gray-400">{info.permittedDetails}</span>
                </div>

                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">Prohibited Scope: </span>
                  <span className="text-gray-600 dark:text-gray-400">{info.prohibitedDetails}</span>
                </div>

                <div className="bg-white/90 dark:bg-gray-900/90 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-primary-blue" />
                    Essential Buyer Checklist:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {info.keyChecklist.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs italic text-gray-600 dark:text-gray-400">
                  💡 <span className="font-medium">Advice:</span> {info.actionAdvice}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-dark-navy dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Hide Details</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>View Legal Rules & Checklist</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {showAcknowledgeButton && (
              <button
                type="button"
                onClick={onAcknowledge}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-dark-navy text-white hover:bg-slate-800 transition-colors"
              >
                I Understand
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
