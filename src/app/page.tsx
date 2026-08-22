'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  TrendingUp,
  MapPin,
  Calculator,
  Home,
  Shield,
  BarChart3,
  CheckCircle2,
  Zap,
  Sparkles,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

const workSteps = [
  {
    icon: MapPin,
    title: '1. Enter Any Location',
    desc: 'Type your target town, society, or landmark (or use browser GPS).',
  },
  {
    icon: Zap,
    title: '2. Deterministic AI Scoring',
    desc: 'Evaluates strict financial limits, commute matrix, and local amenities.',
  },
  {
    icon: BarChart3,
    title: '3. Actionable Report',
    desc: 'Receive transparent 5-year costs, risk breakdowns, and legal checklists.',
  },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // If user is already signed in, navigate directly to app dashboard
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('property_x_token') || localStorage.getItem('token');
      if (token) {
        router.replace('/dashboard');
      }
    }
  }, [router]);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-navy text-dark-navy dark:text-white transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER (Fully Mobile Optimized & Aligned) */}
      <header className="px-4 py-3 sm:px-8 md:px-16 lg:px-24 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0 group">
          <Logo size="md" className="group-hover:scale-105 transition-transform" />
        </Link>

        {/* Header Action Links */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/login"
            className="px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-primary-blue transition-colors flex items-center gap-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 shrink-0"
          >
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/analyze"
            className="px-3 sm:px-5 py-2 bg-primary-blue hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-primary-blue/20 transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="inline sm:hidden">Analyze</span>
            <span className="hidden sm:inline">Analyze Property</span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="px-6 pt-12 pb-16 md:px-16 lg:px-24 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-primary-blue dark:text-blue-300 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Real Estate Decision Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark-navy dark:text-white leading-[1.15] tracking-tight">
              Know Before You Buy. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                Make Confident Property Decisions.
              </span>
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Combine your true financial capacity, strict mathematical affordability, Google spatial radius data, and Gemini AI due diligence before investing in any property.
            </p>

            {/* Primary CTA Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/analyze"
                className="w-full sm:w-auto px-8 py-4 bg-primary-blue hover:bg-blue-700 text-white rounded-2xl text-base font-bold shadow-xl shadow-primary-blue/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 text-center"
              >
                <span>Start Free Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-dark-navy dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-bold shadow-sm transition-all flex items-center justify-center gap-2 text-center"
              >
                <BarChart3 className="w-5 h-5 text-primary-blue" />
                <span>Explore Live Dashboard</span>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-green" /> 100% Real Google Maps Data
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-green" /> Strict Anti-Insolvency Scoring
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-green" /> State RERA Portals
              </span>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="flex-1 w-full max-w-lg">
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary-blue">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-dark-navy dark:text-white">Sample Property Evaluation</h3>
                    <p className="text-xs text-gray-400">Gomti Nagar Extension, Lucknow</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-success-green/10 text-success-green text-xs font-black rounded-full">
                  BUY (82/100)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-2xl">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">Affordability</span>
                  <div className="text-base font-black text-dark-navy dark:text-white mt-0.5">85 / 100</div>
                  <div className="text-[11px] text-success-green font-semibold">Safe EMI to Income</div>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-2xl">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">5-Yr Appreciation</span>
                  <div className="text-base font-black text-dark-navy dark:text-white mt-0.5">+28.4%</div>
                  <div className="text-[11px] text-primary-blue font-semibold">High Growth Zone</div>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs text-gray-600 dark:text-gray-300">
                <span className="font-bold text-primary-blue">Gemini Intelligence:</span> Clear 30-year title with 4 hospitals and 6 schools within a 3.5 km radius.
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Ready to analyze your property?</span>
                <Link
                  href="/analyze"
                  className="text-xs font-bold text-primary-blue hover:underline flex items-center gap-1"
                >
                  Start Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-16 md:px-16 lg:px-24 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-dark-navy dark:text-white mb-2">
              How Property X Works
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-12">
              Three simple steps to comprehensive property clarity.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {workSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-6 bg-gray-50 dark:bg-slate-800/60 rounded-3xl border border-gray-100 dark:border-gray-700/60 text-center"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-primary-blue rounded-2xl flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-dark-navy dark:text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom CTA Banner */}
            <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold mb-1">Ready to make a smarter property decision?</h3>
                <p className="text-blue-100 text-xs md:text-sm">Get your complete intelligence report in under 60 seconds.</p>
              </div>
              <Link
                href="/analyze"
                className="px-6 py-3.5 bg-white text-primary-blue hover:bg-blue-50 rounded-xl font-bold text-sm shadow-md shrink-0 transition-colors"
              >
                Analyze Property
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="px-6 py-6 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400 bg-white dark:bg-[#1E293B]">
        Property X AI • Decision Intelligence for Indian Real Estate
      </footer>
    </div>
  );
}
