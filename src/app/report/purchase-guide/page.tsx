'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Landmark,
  CheckCircle2,
  HelpCircle,
  Download,
  Loader2,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Home
} from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';
import { PurchaseGuideData, ChecklistDocument, ProcedureStep } from '@/types/guide';
import { getFromStorage, STORAGE_KEYS } from '@/lib/storage';
import { generatePurchaseGuide } from '@/lib/purchaseGuideGenerator';

export default function PurchaseGuidePage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [guideData, setGuideData] = useState<PurchaseGuideData | null>(null);
  const [activeChecklistTab, setActiveChecklistTab] = useState<'all' | 'buyer' | 'title' | 'building' | 'land'>('all');
  const [expandedStep, setExpandedStep] = useState<string | null>('01');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const data = getFromStorage<AnalysisResult>(STORAGE_KEYS.CURRENT_ANALYSIS);
    if (!data) {
      router.push('/dashboard');
      return;
    }
    setAnalysis(data);

    // Generate baseline local guide
    const initialGuide = generatePurchaseGuide(data);
    setGuideData(initialGuide);

    // Query live backend government API for up-to-date portals and state-specific regulations
    const stateName = data.propertyInput?.locationDetails?.state || 'Uttar Pradesh';
    const city = data.propertyInput?.locationDetails?.city || 'Lucknow';
    const propertyType = data.propertyInput?.type || 'flat';
    const purchasePurpose = data.propertyInput?.purpose || 'live';

    import('@/lib/api').then(({ governmentApi }) => {
      governmentApi.getGuide({
        propertyState: stateName,
        propertyCity: city,
        buyerState: stateName,
        propertyType,
        purchasePurpose,
      }).then((res) => {
        if (res.success && res.data) {
          setGuideData(prev => ({
            ...prev,
            ...res.data,
            scenario: res.data.scenario || prev?.scenario,
            stateRules: res.data.stateRules || prev?.stateRules,
            checklist: res.data.checklist || prev?.checklist,
            officialPortals: res.data.officialPortals || prev?.officialPortals,
          }));
        }
      }).catch((err) => {
        console.warn('Live government guide API error, using integrated data:', err);
      });
    });
  }, [router]);

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

  if (!analysis || !guideData) return null;

  const { scenario, stateRules, checklist, timeline, officialPortals, disclaimer } = guideData;

  const filteredChecklist = activeChecklistTab === 'all'
    ? checklist
    : checklist.filter(item => item.category === activeChecklistTab);

  const getStatusBadge = (status: ChecklistDocument['status'], label: string) => {
    switch (status) {
      case 'required':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" />
            {label}
          </span>
        );
      case 'may-apply':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <AlertTriangle className="w-3 h-3" />
            {label}
          </span>
        );
      case 'verify':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            <HelpCircle className="w-3 h-3" />
            {label}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-navy text-slate-900 dark:text-slate-100 flex flex-col pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Government & Purchase Guide
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              State Legal & Registration Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Back to Home"
          >
            <Home className="w-4 h-4 text-primary-blue" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <button
            onClick={downloadPDF}
            disabled={isDownloading}
            className="p-2 text-primary-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold focus:outline-none disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'PDF Report'}</span>
          </button>
        </div>
      </header>

      {/* Main Single Column Container */}
      <main className="w-full max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Scenario Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/70 shadow-sm"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-blue/10 dark:bg-primary-blue/20 text-primary-blue rounded-xl">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400 block">
                  Purchase Scenario
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {scenario.propertyTypeLabel}
                </span>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-full">
              {scenario.purchasePurpose}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                Buyer State
              </span>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {scenario.buyerState}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                Property State
              </span>
              <div className="font-bold text-primary-blue dark:text-blue-400 text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-blue" />
                {scenario.propertyState}
              </div>
            </div>
          </div>

          {/* Interstate Purchase Indicator */}
          {scenario.isInterstate ? (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                  ⚠️ Interstate Property Purchase Detected
                </h2>
                <p className="text-[12px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  {scenario.interstateMessage}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Intra-state purchase within {scenario.propertyState}. Standard state registration procedures apply.
              </p>
            </div>
          )}
        </motion.div>

        {/* Agricultural Land Warning (if applicable) */}
        {scenario.isAgriculturalOrLand && scenario.agriculturalWarning && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 shadow-sm flex items-start gap-3.5"
          >
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950 dark:text-amber-200 mb-1">
                Agricultural Land Verification Notice
              </h2>
              <p className="text-xs text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                {scenario.agriculturalWarning}
              </p>
            </div>
          </motion.div>
        )}

        {/* State-Specific Legal Highlights Card */}
        {stateRules.specialNotes && stateRules.specialNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-blue dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {stateRules.stateName} State Rules & Intelligence
              </h2>
            </div>

            <div className="space-y-2.5 pt-1">
              {stateRules.specialNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-blue dark:bg-blue-400 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step-by-Step Purchase Procedure Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-blue dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                10-Step Purchase Procedure
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Chronological Flow
            </span>
          </div>

          <div className="space-y-3">
            {timeline.map((step, idx) => {
              const isExpanded = expandedStep === step.stepNumber;
              return (
                <div
                  key={step.stepNumber}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/70 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 focus:outline-none hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/20 text-primary-blue dark:text-blue-400 font-black text-xs shrink-0">
                        {step.stepNumber}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {step.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {step.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-1 text-slate-400 mt-1 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 space-y-3"
                      >
                        <div className="space-y-1.5 pt-2">
                          {step.details.map((detail, dIdx) => (
                            <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                              <p className="leading-relaxed">{detail}</p>
                            </div>
                          ))}
                        </div>

                        {step.keyDocuments && step.keyDocuments.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                              Key Verification Documents
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {step.keyDocuments.map((doc, docIdx) => (
                                <span
                                  key={docIdx}
                                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                >
                                  {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Personalized Government & Legal Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 pt-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-blue dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Personalized Legal Checklist
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {filteredChecklist.length} Items
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'buyer', label: 'Buyer Docs' },
              { id: 'title', label: 'Title & EC' },
              ...(scenario.propertyType !== 'land' ? [{ id: 'building', label: 'Building & RERA' }] : []),
              ...(scenario.isAgriculturalOrLand ? [{ id: 'land', label: 'Land & RoR' }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChecklistTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeChecklistTab === tab.id
                    ? 'bg-primary-blue text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Document Items List */}
          <div className="space-y-3">
            {filteredChecklist.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {doc.name}
                  </h3>
                  {getStatusBadge(doc.status, doc.statusLabel)}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {doc.description}
                </p>

                {doc.authorityOrSource && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Issuing / Verifying Body: <strong className="text-slate-600 dark:text-slate-400 font-medium">{doc.authorityOrSource}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Official Government Portals Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4 pt-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-blue dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Official Government Sources
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Verified Portals
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {officialPortals.map((portal, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/70 shadow-sm flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      {portal.category}
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                      {portal.domain}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {portal.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-primary-blue hover:text-white dark:hover:bg-primary-blue text-primary-blue dark:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 group"
                >
                  <span>{portal.actionLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Legal Disclaimer Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex items-start gap-2.5"
        >
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>{disclaimer}</p>
        </motion.div>
      </main>

      {/* Floating Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 flex gap-2.5 max-w-lg mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-3.5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <Home className="w-4 h-4 text-primary-blue" />
          <span>Home</span>
        </button>

        <button
          onClick={() => router.push('/report/recommendation')}
          className="flex-1 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
        >
          Verdict
        </button>

        <button
          onClick={downloadPDF}
          disabled={isDownloading}
          className="flex-1 py-3.5 rounded-xl bg-primary-blue text-white font-bold text-sm shadow-md shadow-primary-blue/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>{isDownloading ? '...' : 'Save PDF'}</span>
        </button>
      </div>
    </div>
  );
}
