'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, Info, HelpCircle, Home } from 'lucide-react';
import { AnalysisResult, BreakDecisionItem } from '@/types/analysis';
import { getFromStorage, STORAGE_KEYS } from '@/lib/storage';
import { DotsLoader } from '@/components/ui/DotsLoader';

export default function BreakDecisionPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const data = getFromStorage<AnalysisResult>(STORAGE_KEYS.CURRENT_ANALYSIS);
    if (!data) {
      router.push('/dashboard');
      return;
    }
    setAnalysis(data);

    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  if (!analysis) return null;

  const renderSection = (title: string, category: string, items: BreakDecisionItem[]) => {
    const categoryItems = items.filter(item => item.category === category);
    if (categoryItems.length === 0) return null;

    let icon, headerBg, textColor, dotColorMap;
    switch (category) {
      case 'good':
        icon = <CheckCircle2 className="w-5 h-5 text-success-green mr-2" />;
        headerBg = 'bg-green-50 border-green-200';
        textColor = 'text-success-green';
        dotColorMap = { low: 'bg-green-400', medium: 'bg-green-500', high: 'bg-green-600' };
        break;
      case 'warning':
        icon = <AlertTriangle className="w-5 h-5 text-warning-amber mr-2" />;
        headerBg = 'bg-amber-50 border-amber-200';
        textColor = 'text-warning-amber';
        dotColorMap = { low: 'bg-amber-400', medium: 'bg-amber-500', high: 'bg-amber-600' };
        break;
      case 'risk':
        icon = <AlertCircle className="w-5 h-5 text-danger-red mr-2" />;
        headerBg = 'bg-red-50 border-red-200';
        textColor = 'text-danger-red';
        dotColorMap = { low: 'bg-red-400', medium: 'bg-red-500', high: 'bg-red-600' };
        break;
      case 'assumption':
        icon = <Info className="w-5 h-5 text-primary-blue mr-2" />;
        headerBg = 'bg-blue-50 border-blue-200';
        textColor = 'text-primary-blue';
        dotColorMap = { low: 'bg-blue-400', medium: 'bg-blue-500', high: 'bg-blue-600' };
        break;
      case 'uncertainty':
      default:
        icon = <HelpCircle className="w-5 h-5 text-gray-500 mr-2" />;
        headerBg = 'bg-gray-100 border-gray-200';
        textColor = 'text-gray-700';
        dotColorMap = { low: 'bg-gray-400', medium: 'bg-gray-500', high: 'bg-gray-600' };
        break;
    }

    return (
      <div className="mb-6">
        <div className={`flex items-center p-3 rounded-t-xl border-x border-t ${headerBg}`}>
          {icon}
          <h3 className={`font-bold ${textColor}`}>{title}</h3>
        </div>
        <div className="bg-white border-x border-b border-gray-200 rounded-b-xl divide-y divide-gray-100">
          {categoryItems.map((item, idx) => (
            <div key={idx} className="p-4 flex items-start">
              <div className="mr-3 mt-1.5 flex flex-col items-center">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColorMap[item.severity as keyof typeof dotColorMap] || 'bg-gray-400'}`}></span>
              </div>
              <div>
                <p className="text-dark-navy text-sm font-medium leading-relaxed">{item.title}</p>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mt-1 inline-block">
                  {item.severity} severity
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light-blue-gray pb-24">
      <header className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 mr-2">
            <ArrowLeft className="w-6 h-6 text-dark-navy" />
          </button>
          <h1 className="text-xl font-bold text-dark-navy">Break My Decision</h1>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-dark-navy hover:bg-gray-200 transition-colors text-xs font-bold"
        >
          <Home className="w-4 h-4 text-primary-blue" />
          <span>Home</span>
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <DotsLoader text="Analyzing property" className="mb-3" textClassName="text-xl font-bold text-dark-navy dark:text-white" />
              <p className="text-sm text-gray-500 text-center px-4">Looking for hidden costs, risks, and validating assumptions.</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {renderSection('What Looks Good', 'good', analysis.breakDecision)}
              {renderSection('What Could Go Wrong', 'warning', analysis.breakDecision)}
              {renderSection('Hidden Costs', 'risk', analysis.breakDecision)}
              {renderSection('Assumptions Made', 'assumption', analysis.breakDecision)}
              {renderSection('Uncertainties', 'uncertainty', analysis.breakDecision)}

              <div className="mt-8 bg-white p-4 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Legend</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Fact</div>
                  <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-primary-blue mr-2"></div> Estimate / Assumption</div>
                  <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-warning-amber mr-2"></div> Warning</div>
                  <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-danger-red mr-2"></div> Risk</div>
                </div>
              </div>

              <div className="mt-6 pt-2 space-y-3">
                <button
                  onClick={() => router.push('/report/purchase-guide')}
                  className="w-full bg-primary-blue text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <span>Government & Purchase Guide →</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-white border border-gray-200 text-dark-navy font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm hover:bg-gray-50 shadow-xs"
                >
                  <Home className="w-5 h-5 text-primary-blue" />
                  <span>Back to Home</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
