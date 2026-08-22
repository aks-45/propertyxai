'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Navigation, Sparkles } from 'lucide-react';
import { CommuteAnalysis } from '@/types/analysis';

interface CommuteCardProps {
  commute?: CommuteAnalysis;
  variant?: 'card' | 'banner' | 'compact';
}

export default function CommuteCard({ commute }: CommuteCardProps) {
  if (!commute || commute.rating === 'NOT_SPECIFIED' || !commute.workLocation) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4.5 border border-dashed border-gray-200 dark:border-gray-700 text-center">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-primary-blue mx-auto flex items-center justify-center mb-2">
          <Briefcase className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-dark-navy dark:text-white">Work Location Commute Neutral</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
          No workplace location specified. Scoring evaluated on general micro-market connectivity.
        </p>
      </div>
    );
  }

  const isExcessive = commute.rating === 'EXCESSIVE';
  const isStretched = commute.rating === 'STRETCHED';
  const isExcellent = commute.rating === 'EXCELLENT';

  let headerBg = 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50';
  let badgeBg = 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300';
  let iconColor = 'text-primary-blue';
  let badgeLabel = 'Manageable Commute';

  if (isExcessive) {
    headerBg = 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50';
    badgeBg = 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300';
    iconColor = 'text-danger-red';
    badgeLabel = '🔴 Excessive Distance (>30 km / 70+ mins)';
  } else if (isStretched) {
    headerBg = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50';
    badgeBg = 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300';
    iconColor = 'text-warning-amber';
    badgeLabel = '🟡 Stretched Commute (18-30 km)';
  } else if (isExcellent) {
    headerBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50';
    badgeBg = 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300';
    iconColor = 'text-success-green';
    badgeLabel = '🟢 Optimal Office Proximity (<8 km)';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border shadow-xs transition-all ${headerBg}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs ${iconColor} shrink-0`}>
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-dark-navy dark:text-white">
                Workplace Commute Analysis
              </h3>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeBg}`}>
                {badgeLabel}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Office: <strong className="text-dark-navy dark:text-white">{commute.workLocation}</strong></span>
            </p>
          </div>
        </div>

        {/* Score Impact Pill */}
        <div className="shrink-0 text-right">
          {commute.scorePenalty < 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              {commute.scorePenalty} pts Connectivity
            </span>
          ) : commute.scoreBonus > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              +{commute.scoreBonus} pts Proximity Bonus
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              Neutral Impact
            </span>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
        <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">One-Way Distance</span>
          <span className="text-base font-black text-dark-navy dark:text-white mt-0.5 block">
            {commute.distanceText || `${commute.distanceKm} km`}
          </span>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Est. Drive / Transit</span>
          <span className={`text-base font-black mt-0.5 block ${isExcessive ? 'text-red-600' : isStretched ? 'text-amber-600' : 'text-emerald-600'}`}>
            {commute.durationText || `${commute.durationMins} mins`}
          </span>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Annual Transit Time</span>
          <span className="text-base font-black text-dark-navy dark:text-white mt-0.5 block">
            ~{commute.annualCommuteHours} hrs/yr
          </span>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Est. Travel Cost</span>
          <span className="text-base font-black text-dark-navy dark:text-white mt-0.5 block">
            ₹{commute.monthlyTravelCostEst.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-500">/mo</span>
          </span>
        </div>
      </div>

      {/* Summary Narrative */}
      <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium mt-2">
        {commute.summary}
      </p>

      {/* Actionable Commute Suggestions & AI Advice */}
      {commute.suggestions && commute.suggestions.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-dark-navy dark:text-white mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-blue" />
            <span>Commute Suggestions & Decision Recommendations</span>
          </div>
          <ul className="space-y-1.5">
            {commute.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-blue shrink-0 mt-1.5" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
