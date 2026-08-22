'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, User, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleMode = (targetSignUp: boolean) => {
    if (isSignUp === targetSignUp || isSwitching) return;
    setError('');
    setIsSwitching(true);

    // 1-second round theme loading delay in between Sign In and Sign Up
    setTimeout(() => {
      setIsSignUp(targetSignUp);
      setIsSwitching(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const regRes = await authApi.register({
          name: name.trim() || 'Property Investor',
          email: email.trim().toLowerCase(),
          password,
        });

        if (regRes.success && regRes.data?.token) {
          localStorage.removeItem('property_x_property_input');
          localStorage.removeItem('property_x_current_analysis');
          localStorage.removeItem('property_x_user_profile');
          localStorage.setItem('property_x_token', regRes.data.token);
          localStorage.setItem('property_x_user', JSON.stringify(regRes.data.user));
          router.push('/dashboard');
        } else {
          setError(regRes.error?.message || 'Failed to create account. Please try again.');
        }
      } else {
        const loginRes = await authApi.login(email.trim().toLowerCase(), password);
        if (loginRes.success && loginRes.data?.token) {
          localStorage.removeItem('property_x_property_input');
          localStorage.removeItem('property_x_current_analysis');
          localStorage.removeItem('property_x_user_profile');
          localStorage.setItem('property_x_token', loginRes.data.token);
          localStorage.setItem('property_x_user', JSON.stringify(loginRes.data.user));
          router.push('/dashboard');
        } else {
          setError(loginRes.error?.message || 'Invalid email or password. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      const serverMsg = err.response?.data?.error?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.response?.status === 400) {
        setError(isSignUp ? 'An account with this email already exists.' : 'Invalid login request.');
      } else {
        setError('Unable to connect to server. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-navy flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 relative min-h-[480px] flex flex-col justify-between overflow-hidden">
        {/* Logo */}
        <div>
          <div className="flex justify-center items-center mb-5">
            <Link href="/" className="flex items-center justify-center">
              <Logo size="lg" />
            </Link>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-6 relative">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`flex-1 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 relative z-10 ${
                !isSignUp ? 'text-primary-blue dark:text-white shadow-sm bg-white dark:bg-[#1E293B]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`flex-1 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 relative z-10 ${
                isSignUp ? 'text-primary-blue dark:text-white shadow-sm bg-white dark:bg-[#1E293B]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Dynamic Area: 2-Second Round Loading Transition or Form */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isSwitching ? (
              <motion.div
                key="mode-loader"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                {/* Round Circular Theme Spinner */}
                <div className="relative flex items-center justify-center mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary-blue border-r-primary-blue/40 border-b-blue-400/20 shadow-lg shadow-primary-blue/20"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                    className="absolute w-11 h-11 rounded-full border-3 border-transparent border-t-indigo-500 border-l-indigo-300/30"
                  />
                  <div className="absolute flex items-center justify-center">
                    <Logo size="xs" />
                  </div>
                </div>

                {/* Loading Text */}
                <div className="flex items-center gap-1.5 text-center">
                  <span className="text-xs font-bold text-dark-navy dark:text-white tracking-wider uppercase">
                    Loading
                  </span>
                  <span className="flex space-x-1">
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary-blue inline-block"
                    />
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary-blue inline-block"
                    />
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary-blue inline-block"
                    />
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium mt-1">
                  Switching to {isSignUp ? 'Sign In' : 'Sign Up'}...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={isSignUp ? 'signup-form' : 'signin-form'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {/* Header */}
                <div className="text-center mb-5">
                  <h1 className="text-xl md:text-2xl font-bold text-dark-navy dark:text-white mb-1">
                    {isSignUp ? 'Create Your Account' : 'Welcome Back'}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {isSignUp
                      ? 'Join Property X AI Decision Intelligence Platform'
                      : 'Sign in to access your properties & analyses'}
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-danger-red dark:text-red-400 flex items-start gap-2.5 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-snug">{error}</div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {isSignUp && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Full Name <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError('');
                          }}
                          className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800 text-xs md:text-sm font-medium"
                          placeholder="e.g. Arun Sharma"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                      Email Address <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800 text-xs md:text-sm font-medium"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                      Password <span className="text-rose-500 font-bold ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError('');
                        }}
                        className="block w-full pl-9 pr-9 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800 text-xs md:text-sm font-medium"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-blue/30 text-xs md:text-sm font-bold text-white bg-primary-blue hover:bg-blue-700 focus:outline-none transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                        </div>
                      ) : (
                        <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Toggle Prompt */}
        <div className="text-center text-xs border-t border-gray-100 dark:border-gray-800 pt-3 mt-4">
          <p className="text-gray-500 dark:text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => handleToggleMode(!isSignUp)}
              className="font-bold text-primary-blue hover:underline ml-1"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
