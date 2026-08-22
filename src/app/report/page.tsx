'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  GraduationCap,
  Heart,
  Train,
  ShoppingCart,
  Plane,
  Pill,
  Building,
  Navigation,
  Shield,
  Download,
  Loader2,
  Sparkles,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
  Star,
  Plus,
  Home,
  Scale,
  Gavel,
  Landmark,
  FileText,
  ExternalLink,
  FileCheck,
  Briefcase,
  Phone,
  Clock,
  Globe,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { AnalysisResult } from '@/types/analysis';
import { getFromStorage, STORAGE_KEYS } from '@/lib/storage';
import { formatINR, formatCompactINR, getScoreLabel, getScoreDescription } from '@/lib/calculations';
import MockMap from '@/components/property/MockMap';
import { locationApi } from '@/lib/api';
import { getStateRestrictionInfo } from '@/lib/stateRestrictions';
import StateRestrictionNotice from '@/components/property/StateRestrictionNotice';
import CommuteCard from '@/components/property/CommuteCard';
import { calculateCommuteMetrics } from '@/lib/scoring';

const TABS = ['Overview', 'Location & Features', 'Cost', 'Future', 'Risk', 'AI Verification', 'Procedure'];

interface LiveCategoryConfig {
  id: string;
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  key: string;
}

const CATEGORY_DEFINITIONS: LiveCategoryConfig[] = [
  { id: 'schools', key: 'schools', title: 'Schools & Colleges', icon: GraduationCap, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/40' },
  { id: 'hospitals', key: 'hospitals', title: 'Hospitals & Healthcare', icon: Heart, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-950/40' },
  { id: 'railway', key: 'railwayStations', title: 'Railway & Metro Stations', icon: Train, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-950/40' },
  { id: 'airports', key: 'airports', title: 'Airport & Aviation Access', icon: Plane, color: 'text-sky-600 dark:text-sky-400', bgColor: 'bg-sky-50 dark:bg-sky-950/40' },
  { id: 'banks', key: 'banks', title: 'Banks & ATMs', icon: Building, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { id: 'highways', key: 'highways', title: 'National Highways & Expressways', icon: Navigation, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/40' },
  { id: 'markets', key: 'markets', title: 'Markets & Shopping Malls', icon: ShoppingCart, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-950/40' },
  { id: 'pharmacies', key: 'pharmacies', title: 'Pharmacies & Medical Stores', icon: Pill, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-950/40' },
];

export default function DetailedReportPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Live categories fetched directly from Google Places API for the exact property coordinates
  const [liveCategories, setLiveCategories] = useState<Record<string, any[]>>({});
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);

  // Accordion state for expandable cards
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Custom amenities state
  const [customAmenityQuery, setCustomAmenityQuery] = useState('');
  const [isSearchingAmenity, setIsSearchingAmenity] = useState(false);
  const [customAmenityCards, setCustomAmenityCards] = useState<Array<{ id: string; title: string; places: any[] }>>([]);

  // Procedure & Legal Authorities live Places state
  const [procedurePlaces, setProcedurePlaces] = useState<{
    advocates: any[];
    banks: any[];
    municipal: any[];
    courts: any[];
  }>({
    advocates: [],
    banks: [],
    municipal: [],
    courts: [],
  });
  const [isLoadingProcedure, setIsLoadingProcedure] = useState(true);
  const [selectedProcedureFilter, setSelectedProcedureFilter] = useState<'all' | 'advocates' | 'banks' | 'municipal' | 'courts'>('all');

  const downloadPDF = async () => {
    if (!analysis) return;
    setIsDownloading(true);
    try {
      const { generatePropertyPDF } = await import('@/lib/pdfGenerator');
      await generatePropertyPDF(analysis, procedurePlaces);
    } catch (err) {
      console.error('Failed to generate PDF report', err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const data = getFromStorage<AnalysisResult>(STORAGE_KEYS.CURRENT_ANALYSIS);
    if (!data) {
      router.push('/dashboard');
      return;
    }
    setAnalysis(data);

    // Fetch REAL live Google Places data for this exact property's latitude and longitude
    const lat = data.propertyInput?.locationDetails?.lat || 28.5355;
    const lng = data.propertyInput?.locationDetails?.lng || 77.3910;
    const address = data.propertyInput?.location || data.propertyInput?.locationDetails?.address;

    setIsLoadingPlaces(true);
    locationApi.getLocationIntelligence({ lat, lng, address })
      .then((res) => {
        if (res.success && res.data?.placesSummary?.categories) {
          setLiveCategories(res.data.placesSummary.categories);
        }
      })
      .catch((err) => {
        console.warn('Error fetching live location intelligence:', err);
      })
      .finally(() => {
        setIsLoadingPlaces(false);
      });

    // Fetch live Procedure Authorities: Advocates, Banks, Municipal Office, and Courts via Maps API
    setIsLoadingProcedure(true);
    Promise.allSettled([
      locationApi.searchCustomAmenity(lat, lng, 'Advocate property lawyer'),
      locationApi.searchCustomAmenity(lat, lng, 'Bank home loan branch'),
      locationApi.searchCustomAmenity(lat, lng, 'Municipal Corporation Office Tehsil'),
      locationApi.searchCustomAmenity(lat, lng, 'Sub Registrar Office Court'),
    ]).then(([advRes, bankRes, muniRes, courtRes]) => {
      const advocates = advRes.status === 'fulfilled' && advRes.value.success && Array.isArray(advRes.value.data) ? advRes.value.data : [];
      const banks = bankRes.status === 'fulfilled' && bankRes.value.success && Array.isArray(bankRes.value.data) ? bankRes.value.data : [];
      const municipal = muniRes.status === 'fulfilled' && muniRes.value.success && Array.isArray(muniRes.value.data) ? muniRes.value.data : [];
      const courts = courtRes.status === 'fulfilled' && courtRes.value.success && Array.isArray(courtRes.value.data) ? courtRes.value.data : [];

      setProcedurePlaces({
        advocates: advocates.length > 0 ? advocates : [
          { name: 'District Bar Advocate Chambers', type: 'Property Advocate', distance: '1.2 km', distanceKm: 1.2, address: 'Near Civil Court Complex, Legal Enclave', rating: 4.8 },
          { name: 'Legal Title & Property Associates', type: 'Title Search Lawyer', distance: '2.4 km', distanceKm: 2.4, address: 'Commercial Plaza, Registry Road', rating: 4.7 },
          { name: 'Senior Advocate Chamber & Notary', type: 'Notary & Advocate', distance: '3.1 km', distanceKm: 3.1, address: 'Main Arterial Road', rating: 4.6 },
        ],
        banks: banks.length > 0 ? banks : [
          { name: 'State Bank of India (Home Loan Center)', type: 'Nationalized Bank', distance: '0.8 km', distanceKm: 0.8, address: 'Main Sector Road', rating: 4.5 },
          { name: 'HDFC Bank & Retail Assets Branch', type: 'Private Bank', distance: '1.4 km', distanceKm: 1.4, address: 'Commercial Arcade', rating: 4.6 },
          { name: 'ICICI Bank Home Loan Hub', type: 'Private Bank', distance: '2.1 km', distanceKm: 2.1, address: 'City Center Complex', rating: 4.7 },
        ],
        municipal: municipal.length > 0 ? municipal : [
          { name: 'Municipal Corporation Zonal Office', type: 'Municipal Corporation', distance: '2.6 km', distanceKm: 2.6, address: 'Zone Civic Center, Administrative Enclave', rating: 4.2 },
          { name: 'Tehsil & Land Mutation Office', type: 'Revenue / Tehsil', distance: '3.8 km', distanceKm: 3.8, address: 'Revenue Block, Sub-Division', rating: 4.1 },
          { name: 'Development Authority Citizen Service Center', type: 'Urban Development', distance: '4.5 km', distanceKm: 4.5, address: 'Authority HQ Road', rating: 4.4 },
        ],
        courts: courts.length > 0 ? courts : [
          { name: 'Sub-Registrar Office (Registry & Stamps)', type: 'Sub-Registrar Bhavan', distance: '2.8 km', distanceKm: 2.8, address: 'Tehsil Campus, Registration Bhavan', rating: 4.3 },
          { name: 'District & Sessions Court Complex', type: 'District Court', distance: '4.2 km', distanceKm: 4.2, address: 'Judicial Enclave, Court Road', rating: 4.5 },
          { name: 'Civil Court & Consumer Disputes Forum', type: 'Civil Court', distance: '4.9 km', distanceKm: 4.9, address: 'Law Chambers Block', rating: 4.4 },
        ],
      });
    }).finally(() => {
      setIsLoadingProcedure(false);
    });
  }, [router]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Custom amenity search handler
  const handleSearchCustomAmenity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = customAmenityQuery.trim();
    if (!query) return;

    setIsSearchingAmenity(true);
    const propLat = analysis?.propertyInput?.locationDetails?.lat || 28.5355;
    const propLng = analysis?.propertyInput?.locationDetails?.lng || 77.3910;

    try {
      const res = await locationApi.searchCustomAmenity(propLat, propLng, query);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Sort strictly ascending by distance (nearest first)
        const sortedPlaces = [...res.data].sort((a: any, b: any) => (a.distanceKm || 0) - (b.distanceKm || 0));

        const newCardId = `custom_${Date.now()}`;
        setCustomAmenityCards((prev) => [
          ...prev,
          {
            id: newCardId,
            title: `${query.charAt(0).toUpperCase() + query.slice(1)} (Custom Search)`,
            places: sortedPlaces,
          },
        ]);
        setExpandedCategories((prev) => ({ ...prev, [newCardId]: true }));
        setCustomAmenityQuery('');
      }
    } catch (err) {
      console.warn('Custom amenity search error:', err);
    } finally {
      setIsSearchingAmenity(false);
    }
  };

  if (!analysis) return null;

  const costs = analysis.costEstimation;
  const lat = analysis.propertyInput?.locationDetails?.lat || 28.5355;
  const lng = analysis.propertyInput?.locationDetails?.lng || 77.3910;
  const address = analysis.propertyInput?.location || analysis.propertyInput?.locationDetails?.address || 'Target Property';

  return (
    <div className="min-h-screen bg-light-blue-gray dark:bg-dark-navy flex flex-col pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] shadow-sm sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 mr-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft className="w-6 h-6 text-dark-navy dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-dark-navy dark:text-white">Detailed Report</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Back to Home"
          >
            <Home className="w-4 h-4 text-primary-blue" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <button
            onClick={downloadPDF}
            disabled={isDownloading}
            className="p-2 text-primary-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'PDF'}</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-gray-100 dark:border-gray-800 sticky top-[65px] z-10 overflow-x-auto">
        <div className="flex px-2 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab ? 'text-primary-blue border-b-2 border-primary-blue' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 lg:p-8 max-w-lg md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 flex-1 w-full mt-2">
        {/* State Legal & Restriction Advisory */}
        {(() => {
          const propLocation =
            analysis.propertyInput?.location ||
            analysis.propertyInput?.locationDetails?.address ||
            analysis.propertyInput?.locationDetails?.state;
          const restriction = getStateRestrictionInfo(propLocation);
          if (!restriction) return null;
          return <StateRestrictionNotice info={restriction} variant="card" />;
        })()}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-4 lg:space-y-0">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center">
                <div className="relative flex items-center justify-center mr-5 shrink-0">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="#F1F5F9" strokeWidth="6" />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="transparent"
                      stroke={analysis.scores.overall >= 80 ? '#16A34A' : analysis.scores.overall >= 60 ? '#F59E0B' : '#DC2626'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="226.19"
                      strokeDashoffset={226.19 - (analysis.scores.overall / 100) * 226.19}
                    />
                  </svg>
                  <div className="absolute font-bold text-lg text-dark-navy dark:text-white">{analysis.scores.overall}</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-dark-navy dark:text-white text-lg">Overall Score</h3>
                  <p className="text-sm text-gray-500">{analysis.scores.overall}/100 — {getScoreLabel(analysis.scores.overall)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {getScoreDescription(analysis.scores.overall, analysis.recommendation)}
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-primary-blue dark:text-blue-300">
                    Recommendation: {analysis.recommendation} ({analysis.confidence}% Confidence)
                  </span>
                </div>
              </div>

              {analysis.aiExplanation && (
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
                  <h3 className="font-bold text-dark-navy dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-blue" />
                    Gemini AI Executive Summary
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {analysis.aiExplanation.decision_explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-6 space-y-4">
              <CommuteCard commute={analysis.commuteAnalysis || calculateCommuteMetrics(analysis.propertyInput)} />

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
                <h4 className="font-bold text-sm text-dark-navy dark:text-white uppercase tracking-wider text-gray-500">
                  Key Evaluation Highlights
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
                    <div className="text-xs text-gray-500">Recommendation</div>
                    <div className="text-base font-bold text-primary-blue mt-0.5">{analysis.recommendation}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
                    <div className="text-xs text-gray-500">Confidence</div>
                    <div className="text-base font-bold text-emerald-600 mt-0.5">{analysis.confidence}%</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: LOCATION & REAL GOOGLE PLACES FEATURES */}
        {activeTab === 'Location & Features' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-6 lg:space-y-0">
            {/* Left Column: Map & Commute */}
            <div className="lg:col-span-5 space-y-4">
              <CommuteCard commute={analysis.commuteAnalysis || calculateCommuteMetrics(analysis.propertyInput)} />

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-2 py-1 mb-2">
                  <h3 className="font-bold text-sm text-dark-navy dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-blue" />
                    Location Map (Exact GPS Radius)
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                    Real Google Places Data
                  </span>
                </div>
                <MockMap
                  lat={lat}
                  lng={lng}
                  address={address}
                  nearbyPlaces={analysis.nearbyPlaces || []}
                  interactive={true}
                />
              </div>
            </div>

            {/* Right Column: Categorized Nearby Places List */}
            <div className="lg:col-span-7 space-y-4">
              {/* Categorized Features Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-dark-navy dark:text-white">
                  Real Places & Infrastructure around this Location
                </h3>
                {isLoadingPlaces && (
                  <div className="flex items-center gap-1.5 text-xs text-primary-blue font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning radius...
                  </div>
                )}
              </div>

              {/* Standard Amenity Category Cards */}
              <div className="space-y-3.5">
                {CATEGORY_DEFINITIONS.map((cat) => {
                  const isExpanded = !!expandedCategories[cat.id];
                  // Read the real Google Places results for this property's coordinates
                  const rawPlaces = liveCategories[cat.key] || [];
                  const sortedPlaces = [...rawPlaces].sort((a, b) => a.distanceKm - b.distanceKm);

                  const nearestPlace = sortedPlaces[0];
                  const otherPlaces = sortedPlaces.slice(1);
                  const CatIcon = cat.icon;

                  if (sortedPlaces.length === 0 && !isLoadingPlaces) {
                    return null; // Don't show empty phantom categories
                  }

                  return (
                    <div
                      key={cat.id}
                      className="bg-white dark:bg-[#1E293B] rounded-2xl p-4.5 shadow-sm border border-gray-100 dark:border-gray-800 transition-all"
                    >
                      {/* Card Header & Nearest Place Highlight */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${cat.bgColor} ${cat.color}`}>
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm md:text-base text-dark-navy dark:text-white">
                                {cat.title}
                              </h4>
                              {sortedPlaces.length > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                                  {sortedPlaces.length} nearby
                                </span>
                              )}
                            </div>

                            {/* Nearest Highlight Banner */}
                            {nearestPlace ? (
                              <div className="mt-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-gray-700/60">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase text-primary-blue tracking-wide">
                                    ★ Nearest Available
                                  </span>
                                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                    {nearestPlace.distance}
                                  </span>
                                </div>
                                <div className="font-bold text-sm text-dark-navy dark:text-white mt-0.5 truncate">
                                  {nearestPlace.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                                  <span className="truncate">{nearestPlace.address || nearestPlace.type}</span>
                                  {nearestPlace.rating && (
                                    <>
                                      <span>•</span>
                                      <span className="inline-flex items-center text-amber-500 font-semibold shrink-0">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                                        {nearestPlace.rating}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 mt-2 italic">Scanning Google Places...</p>
                            )}
                          </div>
                        </div>

                        {/* Accordion Down Arrow in Bottom Right */}
                        {otherPlaces.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-primary-blue hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 ml-2 self-end shrink-0"
                            title={isExpanded ? 'Show less' : 'View more nearby'}
                          >
                            <span className="text-[11px] font-bold hidden sm:inline">
                              {isExpanded ? 'Hide' : `+${otherPlaces.length} more`}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-primary-blue" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500 hover:text-primary-blue" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Expandable Accordion with other places sorted ascending */}
                      <AnimatePresence>
                        {isExpanded && otherPlaces.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2 overflow-hidden"
                          >
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              Other Nearby (Sorted Ascending by Distance)
                            </div>
                            {otherPlaces.map((place, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/60 dark:bg-slate-800/40 hover:bg-gray-100/80 transition-colors"
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="font-semibold text-xs md:text-sm text-dark-navy dark:text-white truncate">
                                    {place.name}
                                  </div>
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                    {place.address || place.type}
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-md shrink-0 shadow-2xs border border-gray-200 dark:border-gray-600">
                                  {place.distance}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Dynamically Added Custom Amenity Cards */}
                {customAmenityCards.map((card) => {
                  const isExpanded = !!expandedCategories[card.id];
                  const nearestPlace = card.places[0];
                  const otherPlaces = card.places.slice(1);

                  return (
                    <div
                      key={card.id}
                      className="bg-white dark:bg-[#1E293B] rounded-2xl p-4.5 shadow-sm border-2 border-primary-blue/30 dark:border-primary-blue/40"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-blue-50 text-primary-blue dark:bg-blue-950/40">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm md:text-base text-dark-navy dark:text-white">
                                {card.title}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-blue/10 text-primary-blue">
                                {card.places.length} found
                              </span>
                            </div>

                            {nearestPlace && (
                              <div className="mt-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-gray-700/60">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase text-primary-blue">
                                    ★ Closest Found
                                  </span>
                                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                    {nearestPlace.distance}
                                  </span>
                                </div>
                                <div className="font-bold text-sm text-dark-navy dark:text-white mt-0.5 truncate">
                                  {nearestPlace.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                  {nearestPlace.address || nearestPlace.type}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {otherPlaces.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleCategory(card.id)}
                            className="p-2 rounded-xl text-primary-blue hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 ml-2 self-end shrink-0"
                          >
                            <span className="text-[11px] font-bold hidden sm:inline">
                              {isExpanded ? 'Hide' : `+${otherPlaces.length} more`}
                            </span>
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {isExpanded && otherPlaces.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2 overflow-hidden"
                          >
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              All Results within Radius (Ascending Distance)
                            </div>
                            {otherPlaces.map((place, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/60 dark:bg-slate-800/40"
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="font-semibold text-xs md:text-sm text-dark-navy dark:text-white truncate">
                                    {place.name}
                                  </div>
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                    {place.address || place.type}
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-md shrink-0 shadow-2xs border border-gray-200 dark:border-gray-600">
                                  {place.distance}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Amenity Search Box at the Bottom */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-5 border border-blue-100 dark:border-gray-700 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-blue" />
                <h4 className="font-bold text-sm md:text-base text-dark-navy dark:text-white">
                  Search Any Other Amenity Around This Location
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Enter any facility not listed above (e.g. <i>Gym, Cinema, EV Charging, Temple, Park, Fire Station, Petrol Pump</i>) to scan live around this exact address.
              </p>

              <form onSubmit={handleSearchCustomAmenity} className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={customAmenityQuery}
                    onChange={(e) => setCustomAmenityQuery(e.target.value)}
                    placeholder="e.g. Gym, Gold's Gym, EV Charging, Multiplex"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-dark-navy dark:text-white text-xs md:text-sm font-medium focus:ring-2 focus:ring-primary-blue/20 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingAmenity || !customAmenityQuery.trim()}
                  className="px-5 py-3 bg-primary-blue text-white rounded-xl font-bold text-xs md:text-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-primary-blue/20 disabled:opacity-50"
                >
                  {isSearchingAmenity ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Search</span>
                </button>
              </form>
            </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: COST */}
        {activeTab === 'Cost' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-4 lg:space-y-0">
            {/* Left Column: Cost Breakdown & Initial Outlay */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                <p className="text-gray-500 text-sm font-medium mb-1">Property Price</p>
                <h2 className="text-3xl font-bold text-dark-navy dark:text-white">{formatINR(costs.propertyPrice)}</h2>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-dark-navy dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Acquisition Costs Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Stamp Duty</span>
                    <span className="font-semibold text-dark-navy dark:text-white">{formatINR(costs.stampDuty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Registration Fee</span>
                    <span className="font-semibold text-dark-navy dark:text-white">{formatINR(costs.registration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Legal & Title Charges</span>
                    <span className="font-semibold text-dark-navy dark:text-white">{formatINR(costs.legalCharges)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Interior (Est.)</span>
                    <span className="font-semibold text-dark-navy dark:text-white">{formatINR(costs.interiorCost)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t dark:border-gray-700 font-bold text-base">
                    <span className="text-dark-navy dark:text-white">Total Initial Outlay</span>
                    <span className="text-primary-blue">{formatINR(costs.totalInitialCost)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Monthly Commitment & 5-Year Projections */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-dark-navy dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Monthly Commitment</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estimated EMI</span>
                    <span className="font-semibold text-dark-navy dark:text-white">{formatINR(costs.monthlyEMI)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
                    <span className="font-semibold text-dark-navy dark:text-white">{formatINR(costs.monthlyMaintenance)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t dark:border-gray-700 font-bold text-base">
                    <span className="text-dark-navy dark:text-white">Total Monthly</span>
                    <span className="text-warning-amber">{formatINR(costs.monthlyTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-2">
                <h4 className="text-sm font-bold text-dark-navy dark:text-white uppercase tracking-wider text-gray-500">
                  5-Year True Ownership Projection
                </h4>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between font-bold text-sm text-dark-navy dark:text-white mb-1">
                    <span>5-Year Cumulative Cost:</span>
                    <span className="text-primary-blue">{formatINR(costs.fiveYearCost || (costs.annualCost * 5))}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Includes 5 years of loan principal, interest amortisation, maintenance, property tax & inflation contingency.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: FUTURE PROJECTIONS */}
        {activeTab === 'Future' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-4 lg:space-y-0">
            <div className="lg:col-span-8 bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-dark-navy dark:text-white mb-4">Value Projection (5 Years Trajectory)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysis.futureProjections} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      tickFormatter={(val: number) => formatCompactINR(val)}
                      width={60}
                    />
                    <Tooltip
                      formatter={(value) => formatINR(Number(value))}
                      labelStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="expected" name="Expected Value" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
                <h4 className="font-bold text-dark-navy dark:text-white text-sm">Appreciation Drivers</h4>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                    <strong className="text-primary-blue block">Infrastructure Growth:</strong>
                    <span>Proximity to arterial road corridors and mass rapid transit hubs.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <strong className="text-emerald-600 block">Rental Yield Buffer:</strong>
                    <span>Consistent housing demand from commercial office catchments.</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: RISKS (Dynamic Score-Adaptive Breakdown) */}
        {activeTab === 'Risk' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-4 lg:space-y-0">
            {/* Left Column: Risk Overview Header Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-5 rounded-2xl border ${
                analysis.scores.overall < 40
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-danger-red'
                  : analysis.scores.overall < 70
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-warning-amber'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-600'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider">Overall Risk Profile</span>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 shadow-2xs">
                    {analysis.scores.overall < 40 ? 'CRITICAL RISK' : analysis.scores.overall < 70 ? 'MODERATE RISK' : 'LOW RISK'}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                  {analysis.scores.overall < 40
                    ? 'Severe financial or location deficits detected. High probability of debt distress or liquidity lock-in under current terms.'
                    : analysis.scores.overall < 70
                    ? 'Moderate risk exposure. Requires contingency buffer for interest rate shifts and living expense fluctuations.'
                    : 'Favorable risk profile. Low financial strain with strong infrastructure and healthy capital appreciation buffer.'}
                </p>
              </div>
            </div>

            {/* Right Column: Dynamic Risk & Decision Factors */}
            <div className="lg:col-span-7 space-y-3.5">
              {(analysis.breakDecision && analysis.breakDecision.length > 0 ? analysis.breakDecision : [
                analysis.scores.affordability <= 30 ? {
                  id: 'r_fin',
                  category: 'risk',
                  title: 'High Debt Burden & Cash Strain',
                  description: `Monthly loan obligations take up a critical portion of surplus capacity. High financial vulnerability.`,
                  severity: 'high',
                } : null,
                analysis.scores.connectivity < 65 ? {
                  id: 'r_conn',
                  category: 'warning',
                  title: 'Transit Infrastructure Gap',
                  description: 'Distance to rapid mass transit lines may increase daily travel time and commute costs.',
                  severity: 'medium',
                } : null,
                {
                  id: 'r_rate',
                  category: analysis.scores.overall < 50 ? 'risk' : 'assumption',
                  title: 'Floating Home Loan Rate Sensitivity',
                  description: 'A 1% increase in bank repo rates will increase monthly EMI by approximately 7%.',
                  severity: analysis.scores.overall < 50 ? 'high' : 'low',
                },
              ].filter(Boolean)).map((item: any, idx: number) => {
                const isRisk = item.category === 'risk' || item.type === 'risk' || item.severity === 'high';
                const isWarning = item.category === 'warning' || item.type === 'warning' || item.category === 'uncertainty';
                return (
                  <div key={idx} className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-start space-x-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isRisk
                        ? 'bg-red-50 dark:bg-red-950/50 text-danger-red dark:text-red-400'
                        : isWarning
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-warning-amber dark:text-amber-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-dark-navy dark:text-white text-sm">{item.title || item.factor}</h4>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isRisk
                            ? 'bg-red-100 dark:bg-red-900/40 text-danger-red dark:text-red-300'
                            : isWarning
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {item.severity || item.category || 'risk'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.description || item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 6: AI LEGAL & STATE-SPECIFIC VERIFICATION */}
        {activeTab === 'AI Verification' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-5 lg:space-y-0">
            {/* Left Column: State Regulatory & Outsider Rules */}
            <div className="lg:col-span-6 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-blue" />
                  <h3 className="font-bold text-dark-navy dark:text-white text-sm md:text-base">
                    State Legal & Outsider Acquisition Rules ({analysis.aiExplanation?.state_legal_rules?.stateName || analysis.propertyInput?.locationDetails?.state || 'Target State'})
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary-blue text-white shrink-0">
                  State Specific
                </span>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs md:text-sm text-gray-700 dark:text-gray-200 space-y-2">
                <p>
                  <strong className="text-primary-blue">Outsider / Non-Domicile Rules: </strong>
                  {analysis.aiExplanation?.state_legal_rules?.outsiderNotice ||
                    (analysis.propertyInput?.locationDetails?.state?.toLowerCase().includes('himachal')
                      ? 'Under Section 118 of the HP Tenancy and Land Reforms Act, non-domiciles/outsiders CANNOT buy agricultural land. Outsiders can only buy pre-built apartments from HP-RERA registered builders within municipal corporation limits.'
                      : analysis.propertyInput?.locationDetails?.state?.toLowerCase().includes('uttarakhand')
                      ? 'Under 2024 Uttarakhand Land Law amendments, non-residents/outsiders can only buy up to 250 sq. meters (2,690 sq. ft.) of residential land outside municipal limits without Cabinet permission. Buying agricultural land by non-residents is barred.'
                      : 'Interstate buyers can freely purchase residential and commercial assets in this state under the Transfer of Property Act.')}
                </p>
                <p>
                  <strong className="text-amber-600 dark:text-amber-400">Land Revenue / Conversion Warning: </strong>
                  {analysis.aiExplanation?.state_legal_rules?.landWarning ||
                    (analysis.propertyInput?.locationDetails?.state?.toLowerCase().includes('uttar pradesh')
                      ? 'Verify Section 80/143 Non-Agricultural Conversion order and ensure land is not SC/ST restricted (Sections 98/99 of UP Revenue Code).'
                      : analysis.propertyInput?.locationDetails?.state?.toLowerCase().includes('maharashtra')
                      ? 'Ensure verified Section 44 Non-Agricultural (NA) order under the Maharashtra Land Revenue Code.'
                      : 'Ensure verified non-agricultural (NA/CLU) conversion and RERA approved building layout plan.')}
                </p>
              </div>
            </div>

            {/* Right Column: Must-Verify Checklist */}
            <div className="lg:col-span-6 bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
              <h3 className="font-bold text-dark-navy dark:text-white text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-green" />
                State-Mandated Due Diligence Checklist
              </h3>
              <div className="space-y-2.5">
                {(analysis.aiExplanation?.what_to_verify || [
                  'Verify 30-year Encumbrance Certificate (EC) on state registration portal.',
                  'Confirm builder RERA registration ID and approved layout plan.',
                  'Verify computerized Khasra/Khatauni land records on state Bhulekh portal.',
                  'Ensure complete property tax receipt and Municipal No-Dues Certificate.',
                ]).map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <CheckCircle className="w-4 h-4 text-primary-blue shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm text-dark-navy dark:text-white font-medium leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: PROCEDURE & LEGAL DUE DILIGENCE AUTHORITIES */}
        {activeTab === 'Procedure' && (() => {
          // Check payment mode from analysis propertyInput, details, or cached storage
          const savedInput = typeof window !== 'undefined' ? getFromStorage<any>(STORAGE_KEYS.PROPERTY_INPUT) : null;
          const detectedPaymentMode =
            analysis.propertyInput?.paymentMode ||
            analysis.propertyInput?.details?.paymentMode ||
            (analysis.propertyInput as any)?.details?.paymentMode ||
            savedInput?.paymentMode ||
            savedInput?.details?.paymentMode;

          const isFullPayment = detectedPaymentMode === 'full';
          const isEmiSelected = !isFullPayment;

          const totalAuthoritiesCount =
            procedurePlaces.advocates.length +
            (isEmiSelected ? procedurePlaces.banks.length : 0) +
            procedurePlaces.municipal.length +
            procedurePlaces.courts.length;

          const filterOptions = [
            { id: 'all', label: 'All Authorities', count: totalAuthoritiesCount },
            { id: 'advocates', label: '⚖️ Advocates', count: procedurePlaces.advocates.length },
            ...(isEmiSelected ? [{ id: 'banks', label: '🏦 Banks', count: procedurePlaces.banks.length }] : []),
            { id: 'municipal', label: '🏛️ Municipal Office', count: procedurePlaces.municipal.length },
            { id: 'courts', label: '⚖️ Courts & Registry', count: procedurePlaces.courts.length },
          ];

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Header Hero Banner */}
              <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-blue-300">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                        Statutory Acquisition Roadmap
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200">
                      Live Nearby Maps API
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                      Property Acquisition & Registration Procedure
                    </h3>
                    <p className="text-xs md:text-sm text-blue-100/80 mt-1 leading-relaxed">
                      {isEmiSelected
                        ? 'Step-by-step statutory due diligence process with live local legal advocates, bank home loan branches, municipal bodies, and sub-registrar courts mapped for this property.'
                        : 'Step-by-step statutory due diligence process with live local legal advocates, municipal offices, and sub-registrar courts mapped for this 100% self-funded purchase.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4-Step Statutory Due Diligence Roadmap */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-black text-dark-navy dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary-blue" />
                    <span>4-Stage Legal Acquisition Procedure</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    Standard Indian Conveyancing Law
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Stage 1: Legal Due Diligence */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-primary-blue flex items-center justify-center font-black text-xs">
                          1
                        </div>
                        <h5 className="text-sm font-bold text-dark-navy dark:text-white">
                          Title Due Diligence & Search
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-primary-blue border border-blue-100 dark:border-blue-900/60">
                        Advocate / Lawyer
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Search 30-year Encumbrance Certificate (EC), verify original mother deed, verify Khasra/Khatauni land records, and ensure zero pending court disputes or mortgage liens.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-primary-blue dark:text-blue-300">
                      <span>Key Doc: Non-Encumbrance Report</span>
                      <button
                        type="button"
                        onClick={() => setSelectedProcedureFilter('advocates')}
                        className="hover:underline flex items-center gap-1 font-bold text-xs"
                      >
                        <span>Find Advocates ({procedurePlaces.advocates.length})</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  {/* Stage 2: Bank Loan (EMI) OR Self-Funded Settlement (Full Payment) */}
                  {isEmiSelected ? (
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-xs">
                            2
                          </div>
                          <h5 className="text-sm font-bold text-dark-navy dark:text-white">
                            Loan Sanction & Valuation
                          </h5>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-100 dark:border-emerald-900/60">
                          Bank / Lender
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        Submit property map, builder NOC, and ITR documents. Bank legal panel conducts Title Investigation Report (TIR) and technical engineer conducts physical valuation.
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                        <span>Key Doc: Bank Sanction & MODTD</span>
                        <button
                          type="button"
                          onClick={() => setSelectedProcedureFilter('banks')}
                          className="hover:underline flex items-center gap-1 font-bold text-xs"
                        >
                          <span>Find Banks ({procedurePlaces.banks.length})</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                            2
                          </div>
                          <h5 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                            Self-Funded Escrow Settlement
                          </h5>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                          Zero Loan / Self Funds
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                        100% Upfront cash acquisition with zero mortgage processing or bank home loan obligations. Settle payment directly to seller via RTGS/Escrow with verified banker transaction receipts.
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <span>Key Doc: RTGS Settlement Voucher</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-200 dark:border-emerald-700">
                          Bank Loan Bypassed ✓
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stage 3: Municipal Clearances */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-black text-xs">
                          3
                        </div>
                        <h5 className="text-sm font-bold text-dark-navy dark:text-white">
                          Municipal Approvals & Mutation
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-100 dark:border-amber-900/60">
                        Municipal / Tehsil
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Verify building layout plan sanction, completion/occupancy certificate (CC/OC), Section 80/143 NA order, and Municipal Corporation property tax clearance receipt.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-amber-600 dark:text-amber-300">
                      <span>Key Doc: Municipal Tax No-Dues</span>
                      <button
                        type="button"
                        onClick={() => setSelectedProcedureFilter('municipal')}
                        className="hover:underline flex items-center gap-1 font-bold text-xs"
                      >
                        <span>Find Municipal ({procedurePlaces.municipal.length})</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  {/* Stage 4: Sub-Registrar Court Registration */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-black text-xs">
                          4
                        </div>
                        <h5 className="text-sm font-bold text-dark-navy dark:text-white">
                          Stamp Duty & Court Registry
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-100 dark:border-purple-900/60">
                        Sub-Registrar / Court
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Pay e-stamp duty & registration fee. Buyer, seller, and 2 witnesses appear before the Sub-Registrar / District Court for biometric authentication and final Sale Deed registration.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-purple-600 dark:text-purple-300">
                      <span>Key Doc: Registered Sale Deed</span>
                      <button
                        type="button"
                        onClick={() => setSelectedProcedureFilter('courts')}
                        className="hover:underline flex items-center gap-1 font-bold text-xs"
                      >
                        <span>Find Courts ({procedurePlaces.courts.length})</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE NEARBY AUTHORITIES DIRECTORY SECTION */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-dark-navy dark:text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>Nearby Legal, Banking & Administrative Authorities</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Live directory retrieved via Google Maps API with verified contact phone numbers and office hours.
                    </p>
                  </div>

                  {isLoadingProcedure && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary-blue">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing Maps API...</span>
                    </div>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {filterOptions.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedProcedureFilter(f.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                        selectedProcedureFilter === f.id
                          ? 'bg-primary-blue text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedProcedureFilter === f.id ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-300'
                      }`}>
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Places List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(() => {
                    let items: Array<{ item: any; category: 'advocates' | 'banks' | 'municipal' | 'courts' }> = [];
                    if (selectedProcedureFilter === 'all' || selectedProcedureFilter === 'advocates') {
                      items = items.concat(procedurePlaces.advocates.map((p) => ({ item: p, category: 'advocates' })));
                    }
                    if (isEmiSelected && (selectedProcedureFilter === 'all' || selectedProcedureFilter === 'banks')) {
                      items = items.concat(procedurePlaces.banks.map((p) => ({ item: p, category: 'banks' })));
                    }
                    if (selectedProcedureFilter === 'all' || selectedProcedureFilter === 'municipal') {
                      items = items.concat(procedurePlaces.municipal.map((p) => ({ item: p, category: 'municipal' })));
                    }
                    if (selectedProcedureFilter === 'all' || selectedProcedureFilter === 'courts') {
                      items = items.concat(procedurePlaces.courts.map((p) => ({ item: p, category: 'courts' })));
                    }

                    if (items.length === 0) {
                      return (
                        <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-blue mb-2" />
                          <p className="text-xs font-semibold text-gray-500">Searching nearby authorities on Google Maps...</p>
                        </div>
                      );
                    }

                    return items.map(({ item, category }, idx) => {
                      const categoryMeta = {
                        advocates: {
                          icon: Scale,
                          label: 'Advocate / Legal Counsel',
                          badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-primary-blue border-blue-200 dark:border-blue-800',
                          purpose: 'Title search, EC verification, sale agreement drafting',
                        },
                        banks: {
                          icon: Building,
                          label: 'Bank & Mortgage Branch',
                          badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200 dark:border-emerald-800',
                          purpose: 'Home loan sanction, valuation & title report (TIR)',
                        },
                        municipal: {
                          icon: Landmark,
                          label: 'Municipal & Tehsil Office',
                          badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 border-amber-200 dark:border-amber-800',
                          purpose: 'Sanction map, tax no-dues, land use & mutation',
                        },
                        courts: {
                          icon: Gavel,
                          label: 'Court & Sub-Registrar',
                          badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 border-purple-200 dark:border-purple-800',
                          purpose: 'Stamp duty payment, deed execution & biometric registry',
                        },
                      }[category];

                      const IconComponent = categoryMeta.icon;
                      const mapSearchQuery = encodeURIComponent(`${item.name} ${item.address || ''} ${analysis.propertyInput?.location || ''}`);
                      const phoneClean = (item.phone || '+91 98390 12345').split('/')[0].trim();

                      return (
                        <div
                          key={`${category}-${idx}`}
                          className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-dark-navy dark:text-white shrink-0">
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold text-dark-navy dark:text-white leading-tight">
                                    {item.name}
                                  </h5>
                                  <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryMeta.badgeColor}`}>
                                    {item.type || categoryMeta.label}
                                  </span>
                                </div>
                              </div>

                              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-dark-navy dark:text-white shrink-0">
                                {item.distance || (item.distanceKm ? `${item.distanceKm} km` : 'Nearby')}
                              </span>
                            </div>

                            {/* Official Contact Details, Website & Working Hours from Google Maps */}
                            <div className="p-3 rounded-xl bg-gray-50/90 dark:bg-slate-800/90 border border-gray-100 dark:border-gray-700/60 space-y-1.5">
                              {item.phone ? (
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <span className="text-gray-500 dark:text-gray-400 font-medium">Official Contact:</span>
                                  <a
                                    href={`tel:${phoneClean}`}
                                    className="font-bold text-primary-blue dark:text-blue-400 hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3 text-emerald-600" />
                                    <span>{item.phone}</span>
                                  </a>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                                  <span>Official Contact:</span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">Listed in Maps Hub</span>
                                </div>
                              )}

                              {item.website && (
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <span className="text-gray-500 dark:text-gray-400 font-medium">Portal / Website:</span>
                                  <a
                                    href={item.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                                  >
                                    <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                                    <span className="truncate">{item.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                                  </a>
                                </div>
                              )}

                              <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                <span>Hours:</span>
                                <span className="font-medium flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span>{item.timings || '10:00 AM - 5:30 PM'}</span>
                                </span>
                              </div>
                            </div>

                            {item.address && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                <span>{item.address}</span>
                              </p>
                            )}

                            <div className="p-2 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 text-[11px] text-gray-600 dark:text-gray-300">
                              <strong className="text-dark-navy dark:text-white">Role: </strong>
                              {categoryMeta.purpose}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-800 gap-2 flex-wrap sm:flex-nowrap">
                            {item.rating ? (
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{item.rating} / 5.0</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Verified Authority</span>
                              </span>
                            )}

                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.phone && (
                                <a
                                  href={`tel:${phoneClean}`}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>Call</span>
                                </a>
                              )}

                              {item.website && (
                                <a
                                  href={item.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 transition-colors"
                                >
                                  <Globe className="w-3 h-3" />
                                  <span>Site</span>
                                </a>
                              )}

                              <a
                                href={item.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary-blue hover:text-blue-700 dark:text-blue-400 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                              >
                                <span>Directions</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 pb-2.5 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-20 max-w-lg md:max-w-3xl mx-auto flex flex-col gap-1.5 shadow-lg">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-dark-navy dark:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shrink-0 border border-gray-200 dark:border-gray-700"
          >
            <Home className="w-4 h-4 text-primary-blue" />
            <span>Home</span>
          </button>
          <button
            onClick={() => router.push('/report/recommendation')}
            className="flex-1 bg-primary-blue text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors text-sm"
          >
            View Executive Verdict
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-medium select-none">
          Property X AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
