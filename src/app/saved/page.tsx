'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, FileText, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatINR, getScoreColor } from '@/lib/calculations';
import { analysisApi } from '@/lib/api';
import Link from 'next/link';

export default function SavedReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch live analyses from PostgreSQL database
    analysisApi.getAnalyses()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const formatted = res.data.map((item: any) => ({
            id: item.id,
            propertyId: item.propertyId,
            propertyName: item.property?.address || 'Analyzed Property',
            location: [item.property?.city, item.property?.state].filter(Boolean).join(', ') || 'India',
            price: item.financialSnapshot?.costEstimation?.propertyPrice || item.property?.price || 5000000,
            score: item.scores?.overall || 80,
            recommendation: item.decision || 'BUY',
            savedAt: item.createdAt,
            confidence: item.confidence || 75,
          }));
          setReports(formatted);
        }
      })
      .catch((err) => {
        console.warn('Error fetching live analyses:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center text-gray-500">
        <Loader2 className="w-8 h-8 text-primary-blue animate-spin mb-3" />
        <p className="font-semibold text-sm">Fetching your saved property intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-navy dark:text-white">Analysis History & Saved Reports</h1>
        <span className="text-xs font-bold text-primary-blue bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40">
          {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mb-4 text-primary-blue">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-dark-navy dark:text-white mb-2">No Property Analyses Yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs text-sm">
            Analyze any residential, land, or commercial property to see your complete intelligence reports here.
          </p>
          <Link
            href="/analyze"
            className="bg-primary-blue text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-md shadow-primary-blue/20"
          >
            <Sparkles className="w-4 h-4" /> Start New Analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => router.push(`/results?id=${report.id}`)}
              className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-base md:text-lg text-dark-navy dark:text-white group-hover:text-primary-blue transition-colors">
                    {report.propertyName}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5">{report.location}</p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    report.recommendation === 'BUY'
                      ? 'bg-success-green/10 text-success-green'
                      : report.recommendation === 'RENT'
                      ? 'bg-primary-blue/10 text-primary-blue'
                      : 'bg-warning-amber/10 text-warning-amber'
                  }`}
                >
                  {report.recommendation} ({report.confidence}% Conf.)
                </span>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">Price</p>
                  <p className="font-bold text-dark-navy dark:text-white text-sm md:text-base">
                    {formatINR(report.price)}
                  </p>
                </div>

                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">Intelligence Score</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${getScoreColor(report.score).replace('text-', 'bg-')}`} />
                    <span className="font-bold text-dark-navy dark:text-white text-sm md:text-base">
                      {report.score}/100
                    </span>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">Date</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {report.savedAt ? getRelativeTime(report.savedAt) : 'Recently'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
