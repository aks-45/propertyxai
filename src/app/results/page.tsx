'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, animate } from 'framer-motion';
import { ArrowLeft, Download, Loader2, Home } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';
import { getFromStorage, STORAGE_KEYS } from '@/lib/storage';
import { formatINR, getScoreLabel, getScoreColor, getScoreDescription } from '@/lib/calculations';
import { analysisApi } from '@/lib/api';
import { getStateRestrictionInfo } from '@/lib/stateRestrictions';
import StateRestrictionNotice from '@/components/property/StateRestrictionNotice';
import CommuteCard from '@/components/property/CommuteCard';
import { calculateCommuteMetrics } from '@/lib/scoring';

export default function ResultsPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const motionScore = useMotionValue(0);

  const downloadPDF = async () => {
    if (!analysis) return;
    setIsDownloading(true);
    try {
      const { generatePropertyPDF } = await import('@/lib/pdfGenerator');
      await generatePropertyPDF(analysis);
    } catch (err) {
      console.error('Failed to generate PDF report', err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
      analysisApi.getAnalysisById(id)
        .then((res) => {
          if (res.success && res.data) {
            const serverAnalysis = res.data;
            const formatted: AnalysisResult = {
              id: serverAnalysis.id,
              propertyId: serverAnalysis.propertyId,
              propertyInput: serverAnalysis.propertyInput || {
                type: serverAnalysis.property?.propertyType || 'flat',
                location: serverAnalysis.property?.address || 'Unknown',
                locationDetails: serverAnalysis.locationSnapshot || {},
                price: serverAnalysis.property?.price || 5000000,
                area: serverAnalysis.property?.area || 1000,
                areaUnit: 'sqft',
                purpose: 'live',
              },
              scores: serverAnalysis.scores,
              recommendation: serverAnalysis.decision,
              confidence: serverAnalysis.confidence,
              costEstimation: serverAnalysis.financialSnapshot?.costEstimation || {
                propertyPrice: serverAnalysis.property?.price || 5000000,
                stampDuty: 300000,
                registration: 50000,
                legalCharges: 25000,
                interiorCost: 500000,
                totalInitialCost: 5875000,
                monthlyEMI: 35000,
                monthlyMaintenance: 3500,
                monthlyTotal: 38500,
                annualCost: 462000,
                fiveYearCost: 2310000,
              },
              futureProjections: serverAnalysis.financialSnapshot?.futureProjections || [
                { year: 2026, expected: 5000000 },
                { year: 2027, expected: 5300000 },
                { year: 2028, expected: 5600000 },
                { year: 2029, expected: 5950000 },
                { year: 2030, expected: 6350000 },
              ],
              risks: [],
              breakDecision: [],
              nearbyPlaces: serverAnalysis.locationSnapshot?.nearbyPlaces || [],
              reasonsForRecommendation: [],
              potentialRisks: [],
              aiExplanation: serverAnalysis.aiExplanation,
              createdAt: serverAnalysis.createdAt,
            };
            setAnalysis(formatted);
            return;
          }
        })
        .catch(() => {});
    }

    const data = getFromStorage<AnalysisResult>(STORAGE_KEYS.CURRENT_ANALYSIS);
    if (!data) {
      router.push('/dashboard');
    } else {
      setTimeout(() => setAnalysis(data), 0);
    }
  }, [router]);
  useEffect(() => {
    let animation: any;
    if (analysis) {
      animation = animate(motionScore, analysis.scores.overall, {
        duration: 1.5,
        ease: "easeOut",
      });
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [analysis, motionScore]);

  // Handle setting display score without calling state in animation loop
  useEffect(() => {
    return motionScore.on("change", (latest) => {
      setDisplayScore(Math.round(latest));
    });
  }, [motionScore]);

  if (!analysis) return null;

  const scoreColor = getScoreColor(analysis.scores.overall);
  const scoreLabel = getScoreLabel(analysis.scores.overall);
  const strokeDashoffset = 502.65 - (displayScore / 100) * 502.65;

  const monthlyTotal = analysis.costEstimation.monthlyTotal;
  const propertyPrice = analysis.costEstimation.propertyPrice;
  const futureValue = analysis.futureProjections[analysis.futureProjections.length - 1].expected;

  return (
    <div className="min-h-screen bg-light-blue-gray dark:bg-dark-navy pb-20">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] shadow-sm sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 mr-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft className="w-6 h-6 text-dark-navy dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-dark-navy dark:text-white">Property Score</h1>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-dark-navy dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold"
        >
          <Home className="w-4 h-4 text-primary-blue" />
          <span>Back to Home</span>
        </button>
      </header>

      <main id="results-content" className="p-4 lg:p-8 max-w-lg lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6">
        {/* State Legal & Restriction Advisory */}
        {(() => {
          const propLocation =
            analysis.propertyInput?.location ||
            analysis.propertyInput?.locationDetails?.address ||
            analysis.propertyInput?.locationDetails?.state;
          const restriction = getStateRestrictionInfo(propLocation);
          if (!restriction) return null;
          return <StateRestrictionNotice info={restriction} variant="card" />;
        })()}

        {/* 2-Column Split on Desktop */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start space-y-6 lg:space-y-0">
          {/* Left Column: Score Gauge & Recommendation Verdict */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col items-center text-center border border-gray-100 dark:border-gray-800"
            >
              <div className="relative flex items-center justify-center mb-4">
                <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
                  <circle
                    cx="90"
                    cy="90"
                    r="80"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="12"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r="80"
                    fill="transparent"
                    stroke={analysis.scores.overall >= 80 ? '#16A34A' : analysis.scores.overall >= 60 ? '#F59E0B' : '#DC2626'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="502.65"
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="absolute flex items-baseline">
                  <span className="text-5xl font-bold text-dark-navy dark:text-white">{displayScore}</span>
                  <span className="text-xl text-gray-500 font-medium">/100</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-dark-navy dark:text-white mb-2">{scoreLabel}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                {getScoreDescription(analysis.scores.overall, analysis.recommendation)}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                {(['BUY', 'RENT', 'WAIT'] as const).map((action) => {
                  const isRecommended = action === analysis.recommendation;
                  return (
                    <div key={action} className={`flex-1 text-center ${isRecommended ? '' : 'opacity-40'}`}>
                      <h3 className={`text-xl font-bold ${isRecommended && action === 'BUY' ? 'text-success-green' : isRecommended && action === 'RENT' ? 'text-primary-blue' : isRecommended ? 'text-warning-amber' : 'text-dark-navy dark:text-white'}`}>
                        {action}
                      </h3>
                    </div>
                  );
                })}
              </div>
              <div className="text-center">
                <span className="bg-light-blue-gray dark:bg-slate-800 text-dark-navy dark:text-white px-4 py-2 rounded-full font-medium text-sm inline-block">
                  Confidence Score {analysis.confidence}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Commute, Financial Highlights & Actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Workplace Commute Analysis */}
            <CommuteCard commute={analysis.commuteAnalysis || calculateCommuteMetrics(analysis.propertyInput)} />

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3"
            >
              <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Est. Monthly</span>
                <span className="text-lg font-bold text-dark-navy dark:text-white">{formatINR(monthlyTotal)}</span>
              </div>
              <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Est. Property</span>
                <span className="text-lg font-bold text-dark-navy dark:text-white">{formatINR(propertyPrice)}</span>
              </div>
              <div className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Est. Future Value</span>
                <span className="text-lg font-bold text-success-green">{formatINR(futureValue)}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-2 space-y-3"
            >
              <button 
                onClick={() => router.push('/report')}
                className="w-full bg-primary-blue text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-blue/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                View Full Detailed Report →
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={downloadPDF}
                  disabled={isDownloading}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-dark-navy dark:text-white font-bold py-3.5 rounded-xl shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50 cursor-pointer"
                >
                  {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  <span>{isDownloading ? 'Generating...' : 'Download PDF Report'}</span>
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-dark-navy dark:text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 cursor-pointer"
                >
                  <Home className="w-5 h-5 text-primary-blue" />
                  <span>Dashboard</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
