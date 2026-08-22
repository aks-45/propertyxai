'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertTriangle, Home } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';
import { SavedReport } from '@/types/user';

export default function RecommendationPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const data = getFromStorage<AnalysisResult>(STORAGE_KEYS.CURRENT_ANALYSIS);
    if (!data) {
      router.push('/dashboard');
      return;
    }
    setAnalysis(data);
  }, [router]);

  if (!analysis) return null;

  const handleSaveReport = () => {
    const report: SavedReport = {
      id: `sr_${Date.now()}`,
      analysisId: analysis.id,
      propertyName: analysis.propertyInput.location || 'Analyzed Property',
      location: analysis.propertyInput.locationDetails?.address || analysis.propertyInput.location,
      price: analysis.propertyInput.price,
      score: analysis.scores.overall,
      recommendation: analysis.recommendation,
      savedAt: new Date().toISOString(),
    };
    const existing = getFromStorage<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS) || [];
    saveToStorage(STORAGE_KEYS.SAVED_REPORTS, [report, ...existing]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const action = analysis.recommendation;
  
  const borderColorClass = 
    action === 'BUY' ? 'border-success-green' : 
    action === 'RENT' ? 'border-primary-blue' : 
    'border-warning-amber';

  const textColorClass = 
    action === 'BUY' ? 'text-success-green' : 
    action === 'RENT' ? 'text-primary-blue' : 
    'text-warning-amber';

  const actionLabel = action === 'BUY' ? 'Buy' : action === 'RENT' ? 'Rent' : 'Wait before buying';

  return (
    <div className="min-h-screen bg-light-blue-gray dark:bg-dark-navy pb-24">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] shadow-sm sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 mr-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft className="w-6 h-6 text-dark-navy dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-dark-navy dark:text-white">Our Recommendation</h1>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-dark-navy dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold"
        >
          <Home className="w-4 h-4 text-primary-blue" />
          <span>Home</span>
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm overflow-hidden border-t-8 ${borderColorClass} border-x border-b border-gray-100 dark:border-gray-800`}
        >
          <div className="p-6 text-center">
            <h2 className={`text-3xl font-black mb-3 ${textColorClass}`}>
              {actionLabel} this Property
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              This is a good time to {action.toLowerCase()}. The property has high potential and the price is justified for this location.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-bold text-dark-navy dark:text-white mb-4 ml-2">Why we recommend this?</h3>
          <div className="space-y-3">
            {(analysis.reasonsForRecommendation.length > 0 
              ? analysis.reasonsForRecommendation 
              : ['Strong location score', 'Good future appreciation', 'All essential amenities nearby', 'Good for end-use and investment']
            ).map((reason, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className="bg-white dark:bg-[#1E293B] p-4 rounded-xl flex items-center shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <CheckCircle2 className="w-5 h-5 text-success-green mr-3 shrink-0" />
                <span className="text-dark-navy dark:text-white text-sm font-medium">{reason}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {analysis.potentialRisks && analysis.potentialRisks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-bold text-dark-navy dark:text-white mb-4 ml-2 mt-6">Potential Risks</h3>
            <div className="space-y-3">
              {analysis.potentialRisks.map((risk, idx) => (
                <div key={idx} className="bg-white dark:bg-[#1E293B] p-4 rounded-xl flex items-start shadow-sm border-l-4 border-warning-amber border-y border-r border-gray-100 dark:border-gray-800">
                  <AlertTriangle className="w-5 h-5 text-warning-amber mr-3 shrink-0 mt-0.5" />
                  <span className="text-dark-navy dark:text-white text-sm">{risk}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-6 space-y-3"
        >
          <button 
            onClick={() => router.push('/report/purchase-guide')}
            className="w-full bg-primary-blue text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>Government & Purchase Guide →</span>
          </button>

          <button 
            onClick={() => router.push('/report/break-decision')}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-dark-navy dark:text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Break My Decision (AI)
          </button>

          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-dark-navy dark:text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
          >
            <Home className="w-5 h-5 text-primary-blue" />
            <span>Back to Home</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
