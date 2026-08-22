'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  MapPin,
  LandPlot,
  Building2,
  Home,
  Building,
  TrendingUp,
  Briefcase,
  Key,
  Navigation,
  Loader2,
  Search,
  School,
} from 'lucide-react';
import { saveToStorage, getFromStorage, STORAGE_KEYS } from '@/lib/storage';
import { locationApi } from '@/lib/api';
import { getStateRestrictionInfo } from '@/lib/stateRestrictions';
import StateRestrictionNotice from '@/components/property/StateRestrictionNotice';

export default function AnalyzeStep1() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    type: 'flat',
    locationQuery: '',
    location: null as any,
    price: '',
    area: '',
    purpose: 'live',
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getFromStorage<any>(STORAGE_KEYS.PROPERTY_INPUT);
    if (saved) {
      setFormData((prev) => ({ ...prev, ...saved }));
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live autocomplete suggestions
  const handleQueryChange = (query: string) => {
    setFormData((prev) => ({
      ...prev,
      locationQuery: query,
      location: null, // Reset location object so handleNext forces a fresh geocode
    }));
    setShowDropdown(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await locationApi.autocomplete(query);
        if (res.success && res.data && res.data.length > 0) {
          setSuggestions(res.data);
        }
      } catch (err) {
        console.warn('Autocomplete error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);
  };

  // User selects an address suggestion from dropdown
  const handleSelectSuggestion = async (suggestion: any) => {
    setShowDropdown(false);
    const address = suggestion.description || suggestion.mainText;

    // Immediately set with any coordinates if available
    setFormData((prev) => ({
      ...prev,
      locationQuery: address,
      location: {
        address,
        lat: suggestion.lat || 26.2267,
        lng: suggestion.lng || 79.8381,
        city: suggestion.city || 'India',
        state: suggestion.state || 'Uttar Pradesh',
      },
    }));

    // Geocode to get exact coordinates for that specific place
    try {
      const geo = await locationApi.geocode(address);
      if (geo.success && geo.data) {
        setFormData((prev) => ({
          ...prev,
          location: {
            address: geo.data.formattedAddress || address,
            lat: geo.data.lat,
            lng: geo.data.lng,
            city: geo.data.city,
            state: geo.data.state,
          },
        }));
      }
    } catch {
      // Retain
    }
  };

  // Ask for browser GPS location permission
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Requesting location permission...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocationStatus('Fetching address for your coordinates...');

        try {
          const rev = await locationApi.reverseGeocode(lat, lng);
          if (rev.success && rev.data) {
            const resolvedAddress = rev.data.formattedAddress || `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            setFormData((prev) => ({
              ...prev,
              locationQuery: resolvedAddress,
              location: {
                address: resolvedAddress,
                lat: rev.data.lat,
                lng: rev.data.lng,
                city: rev.data.city,
                state: rev.data.state,
              },
            }));
            setLocationStatus('✓ Location detected!');
            setTimeout(() => setLocationStatus(null), 3000);
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
          const fallback = `Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
          setFormData((prev) => ({
            ...prev,
            locationQuery: fallback,
            location: { address: fallback, lat, lng, city: 'Current Location', state: 'India' },
          }));
          setLocationStatus(null);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location access denied. Please type your town or locality name.');
        } else {
          setLocationStatus('Unable to retrieve GPS. Please type location below.');
        }
        setTimeout(() => setLocationStatus(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Geocode the entered text and proceed
  const handleNext = async () => {
    if (!formData.locationQuery?.trim()) return;

    setIsSubmitting(true);
    let finalLocation = formData.location;

    // Always geocode the entered text to ensure exact coordinates of the entered town/locality
    try {
      const geo = await locationApi.geocode(formData.locationQuery.trim());
      if (geo.success && geo.data) {
        finalLocation = {
          address: geo.data.formattedAddress || formData.locationQuery,
          lat: geo.data.lat,
          lng: geo.data.lng,
          city: geo.data.city || 'India',
          state: geo.data.state || 'Uttar Pradesh',
        };
      }
    } catch (err) {
      console.warn('Geocoding on submit fallback:', err);
    }

    // If geocoding fails, build fallback
    if (!finalLocation) {
      finalLocation = {
        address: formData.locationQuery,
        city: 'India',
        state: 'Uttar Pradesh',
        lat: 26.2267,
        lng: 79.8381,
      };
    }

    saveToStorage(STORAGE_KEYS.PROPERTY_INPUT, {
      ...formData,
      location: finalLocation,
    });

    setIsSubmitting(false);
    router.push('/analyze/location');
  };

  const isFormValid =
    formData.type &&
    formData.locationQuery &&
    formData.locationQuery.trim().length > 0 &&
    formData.price &&
    formData.area &&
    formData.purpose;

  const propertyTypes = [
    { id: 'flat', label: 'Flat', icon: Building2 },
    { id: 'house', label: 'House', icon: Home },
    { id: 'land', label: 'Land', icon: LandPlot },
    { id: 'commercial', label: 'Commercial', icon: Building },
  ];

  const purposes = [
    { id: 'live', label: 'Live', icon: Home },
    { id: 'investment', label: 'Investment', icon: TrendingUp },
    { id: 'rent', label: 'Rental', icon: Key },
    { id: 'business', label: 'Business', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-white md:bg-light-blue-gray dark:bg-dark-navy flex flex-col">
      <div className="w-full max-w-lg lg:max-w-6xl xl:max-w-7xl mx-auto bg-white dark:bg-[#1E293B] min-h-screen md:min-h-fit md:my-8 md:rounded-3xl md:shadow-xl md:overflow-hidden flex flex-col relative border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center px-4 lg:px-8 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E293B] sticky top-0 z-20">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-dark-navy dark:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center lg:text-left lg:pl-4 pr-8 lg:pr-0">
            <h1 className="text-lg lg:text-xl font-bold text-dark-navy dark:text-white">Tell us about the Property</h1>
          </div>
          <span className="hidden lg:inline-flex text-xs font-bold px-3 py-1 rounded-full bg-primary-blue/10 text-primary-blue">
            Step 1 of 3: Core Specs
          </span>
        </div>

        {/* Progress Bar */}
        <div className="px-6 lg:px-8 py-4 bg-gray-50/70 dark:bg-slate-800/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Step 1 of 3: Core Specifications</span>
            <span className="text-sm font-bold text-primary-blue">33%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '33%' }}
              className="h-full bg-primary-blue rounded-full"
            />
          </div>
        </div>

        {/* Form Content - 2-Column Split on Desktop */}
        <div className="flex-1 px-6 lg:px-8 py-6 lg:grid lg:grid-cols-12 lg:gap-8 overflow-y-visible">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Property Type */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <label className="block text-sm font-bold text-dark-navy dark:text-white mb-2.5">
                Property Type <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {propertyTypes.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: pt.id })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      formData.type === pt.id
                        ? 'bg-primary-blue text-white border-primary-blue shadow-md'
                        : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <pt.icon className="w-5 h-5 mb-1.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{pt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* 2. Location Search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
              ref={dropdownRef}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-dark-navy dark:text-white">
                  Property Location <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-blue hover:text-blue-700 dark:text-blue-400 p-1 rounded transition-colors disabled:opacity-50"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  <span>{isLocating ? 'Detecting...' : 'Current Location'}</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 text-primary-blue animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Enter any town, city, or locality (e.g. Pukhrayan, Kanpur)"
                  value={formData.locationQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowDropdown(true);
                  }}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-dark-navy dark:text-white font-medium focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none transition-all placeholder:text-gray-400 placeholder:font-normal text-sm"
                />
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showDropdown && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-50 w-full mt-1.5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800"
                  >
                    {suggestions.map((sug: any, idx: number) => (
                      <button
                        key={sug.placeId || idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(sug)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50/70 dark:hover:bg-slate-800 transition-colors flex items-start gap-3"
                      >
                        <MapPin className="w-4 h-4 text-primary-blue shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-dark-navy dark:text-white truncate">
                            {sug.mainText || sug.description}
                          </div>
                          {sug.secondaryText && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {sug.secondaryText}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 3. Expected Price & Built-up Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label className="block text-sm font-bold text-dark-navy dark:text-white mb-2">
                  Expected Price (Lakhs) <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 75"
                    className="w-full px-4 py-3.5 pl-9 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-dark-navy dark:text-white font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-primary-blue"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-bold uppercase">Lakhs</span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <label className="block text-sm font-bold text-dark-navy dark:text-white mb-2">
                  Built-up Area (sq.ft) <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. 1450"
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-dark-navy dark:text-white font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-primary-blue"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-bold uppercase">sq.ft</span>
                </div>
              </motion.div>
            </div>

            {/* 4. Purchase Purpose */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <label className="block text-sm font-bold text-dark-navy dark:text-white mb-2.5">
                Purchase Purpose <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {purposes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, purpose: p.id })}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                      formData.purpose === p.id
                        ? 'bg-primary-blue/10 dark:bg-blue-900/30 border-primary-blue text-primary-blue shadow-xs font-bold'
                        : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <p.icon className={`w-4 h-4 ${formData.purpose === p.id ? 'text-primary-blue' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold">{p.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Live Desktop Preview Panel */}
          {(() => {
            const parsedPrice = parseFloat(formData.price || '0') * 100000;
            const parsedArea = parseFloat(formData.area || '0');
            const ratePerSqft = parsedArea > 0 ? Math.round(parsedPrice / parsedArea) : 0;

            return (
              <div className="hidden lg:flex lg:col-span-5 flex-col space-y-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl space-y-5 border border-blue-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Live Property Snapshot</span>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 capitalize">
                      {formData.type || 'Property'}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-blue-200/80 font-medium">Estimated Value</div>
                    <div className="text-2xl xl:text-3xl font-black text-white mt-0.5">
                      {formData.price ? `₹ ${formData.price} Lakhs` : '₹ — Lakhs'}
                    </div>
                    {ratePerSqft > 0 && (
                      <div className="text-xs font-semibold text-emerald-400 mt-1">
                        ≈ ₹{ratePerSqft.toLocaleString('en-IN')} per sq.ft
                      </div>
                    )}
                  </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-blue-100/90">
                  <span>Location:</span>
                  <span className="font-bold text-white truncate max-w-[180px]">{formData.locationQuery || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between text-blue-100/90">
                  <span>Built-up Area:</span>
                  <span className="font-bold text-white">{formData.area ? `${formData.area} sq.ft` : '—'}</span>
                </div>
                <div className="flex items-center justify-between text-blue-100/90">
                  <span>Purchase Intent:</span>
                  <span className="font-bold text-blue-300 capitalize">{formData.purpose || 'Live'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs text-blue-200 space-y-1">
                <strong className="text-white block">AI Evaluation Engine:</strong>
                <p className="text-[11px] leading-relaxed text-blue-200/90">
                  In Step 2 & 3, we will verify title risk, Google Maps live commute radius, and your personalized financial feasibility.
                </p>
              </div>
            </div>
          </div>
        );
      })()}
        </div>

        {/* Footer Next Button */}
        <div className="p-4 sm:p-5 lg:px-8 pb-3 bg-white dark:bg-[#1E293B] border-t border-gray-100 dark:border-gray-800 pb-safe flex flex-col gap-2">
          <button
            onClick={handleNext}
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              isFormValid && !isSubmitting
                ? 'bg-primary-blue text-white shadow-lg shadow-primary-blue/30 hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Confirm & Proceed to Map →</span>
            )}
          </button>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-medium select-none">
            Property X AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
