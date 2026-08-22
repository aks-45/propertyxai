'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, MapPin, Loader2 } from 'lucide-react';
import MockMap from '@/components/property/MockMap';
import { saveToStorage, getFromStorage, STORAGE_KEYS } from '@/lib/storage';
import { locationApi } from '@/lib/api';
import { getStateRestrictionInfo } from '@/lib/stateRestrictions';
import StateRestrictionNotice from '@/components/property/StateRestrictionNotice';

export default function AnalyzeStep2() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [coords, setCoords] = useState({ lat: 28.5355, lng: 77.3910 });
  const [displayAddress, setDisplayAddress] = useState('Sector 62, Noida, Uttar Pradesh');

  useEffect(() => {
    const saved = getFromStorage<any>(STORAGE_KEYS.PROPERTY_INPUT);
    if (saved) {
      setFormData(saved);
      const initialAddress = saved.locationQuery || saved.location?.address;
      if (initialAddress) {
        setSearchQuery(initialAddress);
        setDisplayAddress(initialAddress);
      }
      if (saved.location?.lat && saved.location?.lng) {
        setCoords({ lat: saved.location.lat, lng: saved.location.lng });
      } else if (initialAddress) {
        locationApi.geocode(initialAddress).then((res) => {
          if (res.success && res.data) {
            setCoords({ lat: res.data.lat, lng: res.data.lng });
            setDisplayAddress(res.data.formattedAddress || initialAddress);
            setFormData((prev: any) => ({
              ...prev,
              location: {
                address: res.data.formattedAddress || initialAddress,
                lat: res.data.lat,
                lng: res.data.lng,
                city: res.data.city,
                state: res.data.state,
              },
            }));
          }
        });
      }
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await locationApi.geocode(searchQuery);
      if (res.success && res.data) {
        const { lat, lng, formattedAddress, city, state } = res.data;
        setCoords({ lat, lng });
        setDisplayAddress(formattedAddress || searchQuery);
        setFormData((prev: any) => ({
          ...prev,
          locationQuery: formattedAddress || searchQuery,
          location: {
            address: formattedAddress || searchQuery,
            lat,
            lng,
            city,
            state,
          },
        }));
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    setFormData((prev: any) => ({
      ...prev,
      location: {
        ...(prev?.location || {}),
        address: displayAddress,
        lat,
        lng,
      },
    }));
  };

  const handleNext = () => {
    const updatedData = {
      ...formData,
      locationQuery: displayAddress,
      location: {
        ...(formData?.location || {}),
        address: displayAddress,
        lat: coords.lat,
        lng: coords.lng,
        city: formData?.location?.city || 'Noida',
        state: formData?.location?.state || 'Uttar Pradesh',
      },
    };
    saveToStorage(STORAGE_KEYS.PROPERTY_INPUT, updatedData);
    router.push('/analyze/details');
  };

  return (
    <div className="min-h-screen bg-white md:bg-light-blue-gray dark:bg-dark-navy flex flex-col">
      <div className="w-full max-w-lg lg:max-w-6xl xl:max-w-7xl mx-auto bg-white dark:bg-[#1E293B] min-h-screen md:min-h-fit md:my-8 md:rounded-3xl md:shadow-xl md:overflow-hidden flex flex-col relative border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center px-4 lg:px-8 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E293B] sticky top-0 z-20">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-dark-navy dark:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center lg:text-left lg:pl-4 pr-8 lg:pr-0">
            <h1 className="text-lg lg:text-xl font-bold text-dark-navy dark:text-white">Select Exact Location</h1>
          </div>
          <span className="hidden lg:inline-flex text-xs font-bold px-3 py-1 rounded-full bg-primary-blue/10 text-primary-blue">
            Step 2 of 3: Map Pin
          </span>
        </div>

        {/* Progress */}
        <div className="px-6 lg:px-8 py-4 bg-gray-50/70 dark:bg-slate-800/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Step 2 of 3: Geo-Coordinate Mapping</span>
            <span className="text-sm font-bold text-primary-blue">66%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '33%' }}
              animate={{ width: '66%' }}
              className="h-full bg-primary-blue rounded-full"
            />
          </div>
        </div>

        {/* Content - 2-Column Split on Desktop */}
        <div className="flex-1 px-6 lg:px-8 py-6 lg:grid lg:grid-cols-12 lg:gap-8 overflow-y-auto">
          {/* Left Column: Address Controls & Restriction Warnings */}
          <div className="lg:col-span-5 space-y-5">
            <form onSubmit={handleSearch}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 text-primary-blue animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => handleSearch()}
                  placeholder="Search specific address or locality in India"
                  className="w-full pl-11 pr-20 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-dark-navy dark:text-white font-medium focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none transition-all text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary-blue text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Search
                </button>
              </motion.div>
            </form>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-white dark:bg-slate-700 p-2 rounded-xl shadow-xs shrink-0">
                  <MapPin className="w-5 h-5 text-primary-blue" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Pinpoint Coordinate Address</h3>
                  <p className="font-bold text-sm text-dark-navy dark:text-white leading-snug">{displayAddress}</p>
                  <p className="text-xs text-primary-blue dark:text-blue-300 mt-1 font-mono font-bold">
                    {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                  </p>
                </div>
              </div>
            </motion.div>

            {/* State Restriction Notice */}
            {(() => {
              const restriction = getStateRestrictionInfo(
                displayAddress || formData.locationQuery || formData.location?.state || formData.location?.address
              );
              if (!restriction) return null;
              return (
                <div className="pt-1">
                  <StateRestrictionNotice info={restriction} variant="card" />
                </div>
              );
            })()}

            <div className="hidden lg:block p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <strong className="text-primary-blue dark:text-blue-300 block font-bold">Interactive Geo-Pinning:</strong>
              <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                You can click or drag directly on the map to pinpoint the exact building tower, plot boundary, or entrance gate for accurate distance metrics.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Map */}
          <div className="lg:col-span-7 mt-4 lg:mt-0">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="h-full">
              <MockMap
                lat={coords.lat}
                lng={coords.lng}
                address={displayAddress}
                onLocationSelect={handleLocationSelect}
                interactive={true}
              />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 lg:px-8 pb-3 bg-white dark:bg-[#1E293B] border-t border-gray-100 dark:border-gray-800 pb-safe flex flex-col gap-2">
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl font-bold text-base bg-primary-blue text-white shadow-lg shadow-primary-blue/30 hover:bg-blue-700 transition-all cursor-pointer"
          >
            Confirm Location & Continue →
          </button>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-medium select-none">
            Property X AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
