'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Bell, LandPlot, Building, Home, Activity, Sparkles, PlusCircle } from 'lucide-react';
import { formatINR } from '@/lib/calculations';
import { Logo } from '@/components/ui/Logo';
import { analysisApi, authApi } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Investor');
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch User Profile
    authApi.getProfile()
      .then((res) => {
        if (res.success && res.data?.name) {
          setUserName(res.data.name.split(' ')[0]);
        }
      })
      .catch(() => {});

    // 2. Fetch live analyses strictly belonging to this authenticated user
    analysisApi.getAnalyses()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const formatted = res.data.slice(0, 5).map((item: any) => ({
            id: item.id,
            name: item.property?.address || 'Analyzed Property',
            price: item.financialSnapshot?.costEstimation?.propertyPrice || item.property?.price || 5000000,
            city: item.locationSnapshot?.city || item.property?.city || 'India',
            type: item.property?.propertyType || 'flat',
            score: item.scores?.overall || 80,
            recommendation: item.decision || 'BUY',
          }));
          setRecentItems(formatted);
        } else {
          setRecentItems([]);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch backend analyses:', err);
        setRecentItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getPropertyIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'land':
      case 'residential_land':
      case 'agricultural_land':
        return <LandPlot className="w-6 h-6" />;
      case 'commercial':
        return <Building className="w-6 h-6" />;
      case 'house':
        return <Home className="w-6 h-6" />;
      default:
        return <Building2 className="w-6 h-6" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-green bg-success-green/10';
    if (score >= 60) return 'text-warning-amber bg-warning-amber/10';
    return 'text-danger-red bg-danger-red/10';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="w-full px-4 pt-6 pb-24 md:pt-10 md:pb-10 max-w-lg md:max-w-4xl mx-auto">
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between mb-8">
        <Logo size="md" />
        <div className="flex items-center space-x-3">
          <button className="relative p-2 text-gray-500 rounded-full bg-white shadow-sm border border-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1.5 w-2 h-2 bg-danger-red rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue font-bold shadow-sm border border-primary-blue/20">
            {userName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-dark-navy dark:text-white mb-1 flex items-center gap-2">
          Hello, {userName} 👋
        </h1>
        <p className="text-gray-500 text-sm md:text-base">Let's evaluate your next high-potential property.</p>
      </div>

      {/* Main Action Banner */}
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-2xl shadow-lg border border-transparent overflow-hidden mb-10 cursor-pointer relative group"
        onClick={() => router.push('/analyze')}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity group-hover:opacity-95"></div>

        {/* Animated glow */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />

        <div className="relative p-6 pl-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full text-white text-xs font-semibold mb-2 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> AI Decision Intelligence
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Analyze a Property</h2>
            <p className="text-blue-100 text-sm max-w-[220px] md:max-w-none">
              Get instant BUY / RENT / WAIT scores, true costs, and legal guidance.
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shrink-0 border border-white/30 group-hover:scale-110 transition-transform">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Recent Analyses Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-dark-navy dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-blue" />
          Your Recent Analyses
        </h3>
        {recentItems.length > 0 && (
          <Link href="/saved" className="text-sm font-medium text-primary-blue hover:underline">
            View All
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400 font-medium animate-pulse">
          Loading your analyses...
        </div>
      ) : recentItems.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3.5">
          {recentItems.map((property, idx) => (
            <motion.div
              key={property.id || idx}
              variants={itemVariants}
              whileHover={{ scale: 1.01, x: 3 }}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center cursor-pointer hover:shadow-md hover:border-blue-100 transition-all group"
              onClick={() => router.push(`/report?id=${property.id}`)}
            >
              <div className="w-13 h-13 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center shrink-0 mr-4 border border-gray-100 dark:border-gray-700 group-hover:bg-blue-50 group-hover:border-blue-100 text-dark-navy dark:text-white transition-colors">
                {getPropertyIcon(property.type)}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-semibold text-dark-navy dark:text-white truncate mb-1 group-hover:text-primary-blue transition-colors text-sm md:text-base">
                  {property.name}
                </h4>
                <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-dark-navy dark:text-white">{formatINR(property.price)}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="truncate">{property.city}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="font-semibold text-primary-blue">{property.recommendation}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreColor(property.score || 80)} shrink-0`}>
                {property.score || 80}/100
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Clean Empty State for Fresh Accounts */
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto mb-3.5 bg-blue-50 dark:bg-blue-900/30 text-primary-blue rounded-2xl flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-dark-navy dark:text-white mb-1">No property analyses yet</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
            You haven't evaluated any properties with this account yet. Start your first analysis to see real-time scores, financial breakdown, and AI due diligence here.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-blue/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Your First Analysis</span>
          </Link>
        </div>
      )}
    </div>
  );
}
