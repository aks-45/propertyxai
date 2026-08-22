'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Sparkles, BarChart3, Home, Wallet, Shield } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const slides = [
  {
    id: 'slide-1',
    title: 'Make Smarter Property Decisions',
    description: 'We analyze multiple factors to help you understand the right property at the right price.',
    visual: (
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="relative z-10"
        >
          <Logo size="xl" />
        </motion.div>
        <MapPin className="w-10 h-10 text-success-green absolute -top-2 right-4 z-20 drop-shadow-md" />
        <Sparkles className="w-8 h-8 text-warning-amber absolute bottom-4 left-4 z-20" />
      </div>
    )
  },
  {
    id: 'slide-2',
    title: 'Real Insights. Real Advantage.',
    description: 'Understand location scores, future value, estimated costs, risks, amenities and more.',
    visual: (
      <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center bg-blue-50 rounded-2xl border border-blue-100 shadow-inner relative overflow-hidden">
        <BarChart3 className="w-16 h-16 text-primary-blue mb-4" />
        <div className="flex gap-2 items-end h-16">
          <motion.div initial={{ height: "20%" }} animate={{ height: "60%" }} className="w-4 bg-blue-300 rounded-t" />
          <motion.div initial={{ height: "20%" }} animate={{ height: "80%" }} className="w-4 bg-primary-blue rounded-t" />
          <motion.div initial={{ height: "20%" }} animate={{ height: "40%" }} className="w-4 bg-blue-400 rounded-t" />
          <motion.div initial={{ height: "20%" }} animate={{ height: "100%" }} className="w-4 bg-success-green rounded-t" />
        </div>
      </div>
    )
  },
  {
    id: 'slide-3',
    title: 'Buy / Rent / Wait',
    description: 'Our system helps you compare your options based on your goals and property intelligence.',
    visual: (
      <div className="w-full max-w-[240px] mx-auto space-y-3">
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg"><Home className="w-5 h-5 text-primary-blue" /></div>
          <span className="font-semibold text-gray-700">Buy Now</span>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg"><Wallet className="w-5 h-5 text-success-green" /></div>
          <span className="font-semibold text-gray-700">Rent Instead</span>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg"><Shield className="w-5 h-5 text-warning-amber" /></div>
          <span className="font-semibold text-gray-700">Wait & Save</span>
        </motion.div>
      </div>
    )
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/login');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-light-blue-gray flex flex-col relative overflow-hidden">
      {/* Skip Button */}
      <button 
        onClick={() => router.push('/login')}
        className="absolute top-6 right-6 text-gray-500 font-medium hover:text-gray-900 z-50"
      >
        Skip
      </button>

      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md mx-auto px-6 py-12 relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="w-full flex flex-col items-center text-center absolute top-1/2 -translate-y-1/2"
          >
            {/* Visual */}
            <div className="h-64 flex items-center justify-center w-full mb-8">
              {slides[currentIndex].visual}
            </div>

            {/* Content */}
            <h2 className="text-2xl md:text-3xl font-bold text-dark-navy mb-4">
              {slides[currentIndex].title}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {slides[currentIndex].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="absolute bottom-28 flex gap-2 justify-center z-10 w-full">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-primary-blue' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="absolute bottom-8 w-full max-w-md px-6 flex gap-4 z-10">
          {currentIndex > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 px-6 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-6 rounded-xl font-semibold bg-primary-blue text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
