'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Briefcase, DollarSign, LogOut, Check, Loader2 } from 'lucide-react';
import { authApi, locationApi } from '@/lib/api';
import { formatINR } from '@/lib/calculations';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
        checked ? 'bg-primary-blue' : 'bg-gray-300 dark:bg-slate-700'
      }`}
      onClick={onChange}
    >
      <motion.div
        layout
        className="w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [workplaceLocation, setWorkplaceLocation] = useState('');
  const [workSuggestions, setWorkSuggestions] = useState<any[]>([]);

  const [notifs, setNotifs] = useState({
    push: true,
    email: true,
    priceDrop: true,
    newMatches: true,
  });

  useEffect(() => {
    authApi.getProfile()
      .then((res) => {
        if (res.success && res.data) {
          const u = res.data;
          setUser(u);
          setName(u.name || '');
          setPhone(u.phone || '');
          setCurrentCity(u.currentCity || 'Lucknow');
          setCurrentState(u.currentState || 'Uttar Pradesh');
          setMonthlyIncome(u.financialProfile?.monthlyIncome?.toString() || '140000');
          setWorkplaceLocation(u.workplaceLocation || '');
        }
      })
      .catch((err) => {
        console.warn('Profile fetch error:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authApi.updateProfile({
        name,
        phone,
        currentCity,
        currentState,
        monthlyIncome: Number(monthlyIncome) || undefined,
        workplaceLocation,
      });
      if (res.success && res.data) {
        setUser(res.data);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('property_x_token');
      localStorage.removeItem('property_x_user');
      localStorage.removeItem('token');
    }
    router.push('/login');
  };

  const getInitials = (userName: string) => {
    if (!userName) return 'PX';
    return userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 pb-24"
    >
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-black mb-3 shadow-lg shadow-blue-500/20">
          {getInitials(user?.name || 'Investor')}
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-dark-navy dark:text-white mb-0.5">
          {user?.name || 'Property Investor'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{user?.email || 'user@propertyx.ai'}</p>

        {saveSuccess && (
          <div className="mb-4 px-4 py-2 bg-green-50 text-success-green border border-green-200 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Profile updated in database!
          </div>
        )}

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-6 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-dark-navy dark:text-white"
        >
          {isEditing ? 'Cancel Editing' : 'Edit Live Profile'}
        </button>
      </div>

      {/* Edit Profile Form or View Cards */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-dark-navy dark:text-white mb-4">Edit Profile & Financial Capacity</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Full Name <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-dark-navy dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-blue/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-dark-navy dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-blue/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Current City <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-dark-navy dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-blue/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Monthly Income (₹) <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="140000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-dark-navy dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-blue/20 outline-none"
              />
            </div>

            <div className="md:col-span-2 relative">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center justify-between">
                <span>Workplace / Business Location</span>
                <span className="text-[10px] text-emerald-600 font-bold lowercase">Google Maps API</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={workplaceLocation}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWorkplaceLocation(val);
                    if (val.length >= 2) {
                      locationApi.autocomplete(val).then((r) => {
                        if (r.success && r.data) setWorkSuggestions(r.data);
                      });
                    } else {
                      setWorkSuggestions([]);
                    }
                  }}
                  placeholder="e.g. Cyber City Gurugram, BKC Mumbai, Sector 62 Noida"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-dark-navy dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-blue/20 outline-none"
                />
                <MapPin className="w-4 h-4 text-primary-blue absolute left-3 top-3 pointer-events-none" />
              </div>

              {workSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-48 overflow-y-auto">
                  {workSuggestions.map((s: any, idx: number) => (
                    <button
                      key={s.placeId || idx}
                      type="button"
                      onClick={() => {
                        const addr = s.description || s.mainText;
                        setWorkplaceLocation(addr);
                        setWorkSuggestions([]);
                      }}
                      className="w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-blue-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-primary-blue shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-dark-navy dark:text-white truncate">{s.mainText || s.description}</p>
                        {s.secondaryText && <p className="text-[10px] text-gray-500 truncate">{s.secondaryText}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-primary-blue text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <h2 className="text-base font-bold text-dark-navy dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary-blue" />
              Financial Profile
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly Income</span>
                <span className="font-bold text-dark-navy dark:text-white">
                  {formatINR(user?.financialProfile?.monthlyIncome || 140000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="font-semibold text-dark-navy dark:text-white">
                  {[user?.currentCity, user?.currentState].filter(Boolean).join(', ') || 'Lucknow, UP'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Workplace Hub</span>
                <span className="font-semibold text-dark-navy dark:text-white">
                  {user?.workplaceLocation || 'Not configured'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <h2 className="text-base font-bold text-dark-navy dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-blue" />
              Preferences
            </h2>
            <div className="flex flex-wrap gap-2">
              {['Residential Flats', 'Plots & Land', 'Commercial Space'].map((pref) => (
                <span key={pref} className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-primary-blue text-xs font-bold rounded-full border border-blue-100 dark:border-blue-900/40">
                  {pref}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-bold text-dark-navy dark:text-white mb-4">Notification & Intelligence Alerts</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-dark-navy dark:text-white">Push Notifications</h3>
              <p className="text-xs text-gray-500">Instant alerts for property scores & AI insights</p>
            </div>
            <Toggle checked={notifs.push} onChange={() => setNotifs({ ...notifs, push: !notifs.push })} />
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
            <div>
              <h3 className="text-sm font-semibold text-dark-navy dark:text-white">Price & Circle Rate Updates</h3>
              <p className="text-xs text-gray-500">Notifications when circle rates change in your target state</p>
            </div>
            <Toggle checked={notifs.priceDrop} onChange={() => setNotifs({ ...notifs, priceDrop: !notifs.priceDrop })} />
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-red-50 dark:bg-red-950/30 text-danger-red border border-red-200 dark:border-red-900/40 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Property X</span>
        </button>
      </div>
    </motion.div>
  );
}
