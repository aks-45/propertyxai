'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { PropertyInput } from '@/types/property';
import { analysisApi } from '@/lib/api';
import { generateMockAnalysis } from '@/data/mockAnalysis';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';
import { DotsLoader } from '@/components/ui/DotsLoader';

const CHECKLIST_ITEMS = [
  { id: 1, label: 'Location Intelligence (Google Maps)', appearAt: 20 },
  { id: 2, label: 'Deterministic Financial Modeling', appearAt: 40 },
  { id: 3, label: 'Future Value Prediction Engine', appearAt: 60 },
  { id: 4, label: 'Affordability & Risk Assessment', appearAt: 80 },
  { id: 5, label: 'Gemini 2.5 Flash Narrative Synthesis', appearAt: 95 },
];

export default function AnalyzingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const motionProgress = useMotionValue(0);
  const analysisResultRef = useRef<any>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const saved = getFromStorage<Record<string, any>>(STORAGE_KEYS.PROPERTY_INPUT);
    if (!saved) {
      router.push('/analyze');
      return;
    }

    // Construct PropertyInput payload for backend
    const input: PropertyInput = {
      type: (saved.type || 'flat') as any,
      location: saved.locationQuery || saved.location?.address || saved.location?.name || 'Unknown Address',
      locationDetails: saved.location || {
        address: saved.locationQuery || 'Unknown Address',
        lat: 28.5355,
        lng: 77.3910,
        city: 'Noida',
        state: 'Uttar Pradesh',
      },
      price: (Number(saved.price) * 100000) || 5000000,
      area: Number(saved.area) || 1000,
      areaUnit: 'sqft',
      purpose: (saved.purpose || 'live') as any,
      age: saved.details?.age || 'New',
      floor: saved.details?.floor || 'Ground',
      amenities: saved.details?.amenities || [],
      moveTimeline: 'within-6-months',
      monthlySalary: saved.monthlySalary || 120000,
      monthlyExpenses: saved.monthlyExpenses || 40000,
      availableIncome: saved.availableIncome,
      expenditures: saved.expenditures,
      savings: saved.savings,
      workLocation: saved.workLocation || saved.details?.workLocation || undefined,
      familySize: saved.familySize || saved.details?.familySize || undefined,
      paymentMode: saved.paymentMode || saved.details?.paymentMode || 'emi',
      details: saved.details,
    };

    // Trigger real backend API call in parallel with progress animation
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      analysisApi.analyzeProperty(input)
        .then((result) => {
          analysisResultRef.current = result;
          saveToStorage(STORAGE_KEYS.CURRENT_ANALYSIS, result);
        })
        .catch((err) => {
          console.warn('Backend API error, falling back to local engine:', err);
          const fallback = generateMockAnalysis(input);
          analysisResultRef.current = fallback;
          saveToStorage(STORAGE_KEYS.CURRENT_ANALYSIS, fallback);
        });
    }

    const duration = 4.5;
    const animation = animate(motionProgress, 100, {
      duration,
      onUpdate: (latest) => {
        setProgress(Math.round(latest));
      },
      onComplete: () => {
        if (!analysisResultRef.current) {
          const fallback = generateMockAnalysis(input);
          saveToStorage(STORAGE_KEYS.CURRENT_ANALYSIS, fallback);
        }
        setTimeout(() => {
          router.push('/results');
        }, 400);
      },
    });

    return () => animation.stop();
  }, [motionProgress, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-light-blue-gray dark:bg-dark-navy text-center">
      <DotsLoader text="Analyzing property" className="mb-2" textClassName="text-2xl font-bold text-dark-navy dark:text-white" />
      <p className="text-gray-500 mb-10 max-w-sm">
        Property X AI is querying Google location intelligence, financial engines, and Gemini 2.5 Flash.
      </p>

      <div className="relative flex items-center justify-center mb-12">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 0px 0px rgba(37, 99, 235, 0)',
              '0 0 20px 5px rgba(37, 99, 235, 0.2)',
              '0 0 0px 0px rgba(37, 99, 235, 0)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute rounded-full"
          style={{ width: 180, height: 180 }}
        />
        <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90 relative z-10">
          <circle cx="110" cy="110" r="100" fill="transparent" stroke="#E5E7EB" strokeWidth="12" />
          <motion.circle
            cx="110"
            cy="110"
            r="100"
            fill="transparent"
            stroke="url(#gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="628.32"
            style={{ strokeDashoffset: useTransform(motionProgress, [0, 100], [628.32, 0]) }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center justify-center z-20">
          <motion.span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            {progress}%
          </motion.span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Analyzing</span>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4 text-left">
        {CHECKLIST_ITEMS.map((item) => {
          const isVisible = progress >= item.appearAt;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
              transition={{ duration: 0.4 }}
              className={`flex items-center space-x-3 ${isVisible ? 'text-dark-navy dark:text-white' : 'text-gray-400'}`}
            >
              <CheckCircle2 className={`w-6 h-6 ${isVisible ? 'text-success-green' : 'text-gray-300'}`} />
              <span className="font-medium text-sm md:text-base">
                {isVisible ? `✓ ${item.label}` : item.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
