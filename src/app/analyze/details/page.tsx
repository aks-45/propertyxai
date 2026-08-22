'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  MapPin,
  Loader2,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Building2,
  Home,
  LandPlot,
  Building,
  TrendingUp,
  Key,
  Users,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { saveToStorage, getFromStorage, STORAGE_KEYS } from '@/lib/storage';
import { locationApi } from '@/lib/api';
import { FinancialField } from '@/components/ui/FinancialField';
import { FinancialItem } from '@/types/property';

const EXPENDITURE_CATEGORIES = [
  { id: 'commute', label: 'Commute / Transportation' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'healthcare', label: 'Healthcare / Medical' },
  { id: 'education', label: 'Education' },
  { id: 'rent', label: 'Current Housing / Rent' },
  { id: 'emis', label: 'Existing EMIs / Loans' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'other_expenses', label: 'Other Expenses' },
];

const SAVINGS_CATEGORIES = [
  { id: 'emergency_fund', label: 'General Savings / Emergency Fund' },
  { id: 'stocks', label: 'Stocks / Mutual Funds' },
  { id: 'gold', label: 'Gold' },
  { id: 'fd_rd', label: 'FD / RD / Bank Deposit' },
  { id: 'other_savings', label: 'Other Savings / Investments' },
];

export default function PropertyDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    type: 'flat',
    purpose: 'live',
  });
  
  const [details, setDetails] = useState({
    bhkConfig: '',
    age: '',
    floor: '',
    constructionStatus: '',
    zoningOrFitout: '',
    amenities: [] as string[],
    timeline: '',
    paymentMode: 'emi', // 'emi' | 'full'
    income: '',
    familySize: '',
    workLocation: '',
    investmentHorizon: '',
    targetReturn: '',
    targetRent: '',
    rentFrequency: 'monthly',
    tenantProfile: '',
    businessType: '',
    staffSize: '',
  });

  // Workplace / Business location state & Google Maps autocomplete
  const [workLocationQuery, setWorkLocationQuery] = useState('');
  const [workSuggestions, setWorkSuggestions] = useState<any[]>([]);
  const [isSearchingWork, setIsSearchingWork] = useState(false);
  const [showWorkDropdown, setShowWorkDropdown] = useState(false);
  const [workLocationDetails, setWorkLocationDetails] = useState<{
    address: string;
    lat?: number;
    lng?: number;
    city?: string;
    state?: string;
  } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const workInputRef = useRef<HTMLDivElement | null>(null);

  const [expenditures, setExpenditures] = useState<Record<string, FinancialItem>>({});
  const [savings, setSavings] = useState<Record<string, FinancialItem>>({});
  const [showSavings, setShowSavings] = useState(false);

  // Financial & Amenities validation error state
  const [incomeError, setIncomeError] = useState('');
  const [amenitiesError, setAmenitiesError] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const incomeInputRef = useRef<HTMLInputElement | null>(null);
  const amenitiesRef = useRef<HTMLDivElement | null>(null);

  const propertyType: 'flat' | 'house' | 'land' | 'commercial' = formData.type || 'flat';
  const purchasePurpose: 'live' | 'investment' | 'rent' | 'business' = formData.purpose || 'live';

  useEffect(() => {
    const saved = getFromStorage<Record<string, any>>(STORAGE_KEYS.PROPERTY_INPUT);
    if (saved) {
      setFormData(saved);
      if (saved.details) {
        setDetails(saved.details);
        if (saved.details.income) {
          setDetails((prev) => ({ ...prev, income: saved.details.income }));
        }
        if (saved.details.workLocation) {
          setWorkLocationQuery(saved.details.workLocation);
        }
      }
      if (saved.workLocation) {
        setWorkLocationQuery(saved.workLocation);
      }
      if (saved.workLocationDetails) {
        setWorkLocationDetails(saved.workLocationDetails);
      }
      if (saved.expenditures) setExpenditures(saved.expenditures);
      if (saved.savings) setSavings(saved.savings);
      if (saved.showSavings !== undefined) setShowSavings(saved.showSavings);
    }
  }, []);

  // Close workplace dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workInputRef.current && !workInputRef.current.contains(event.target as Node)) {
        setShowWorkDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Workplace Autocomplete search query
  const handleWorkLocationChange = (val: string) => {
    setWorkLocationQuery(val);
    setDetails((prev) => ({ ...prev, workLocation: val }));

    if (!val.trim() || val.trim().length < 2) {
      setWorkSuggestions([]);
      setShowWorkDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearchingWork(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await locationApi.autocomplete(val);
        if (res.success && res.data && res.data.length > 0) {
          setWorkSuggestions(res.data);
          setShowWorkDropdown(true);
        } else {
          setWorkSuggestions([]);
        }
      } catch (err) {
        console.warn('Workplace autocomplete error:', err);
      } finally {
        setIsSearchingWork(false);
      }
    }, 150);
  };

  // User selects an address suggestion from workplace dropdown
  const handleSelectWorkSuggestion = async (suggestion: any) => {
    setShowWorkDropdown(false);
    const address = suggestion.description || suggestion.mainText;
    setWorkLocationQuery(address);
    setDetails((prev) => ({ ...prev, workLocation: address }));

    const resolved = {
      address,
      lat: suggestion.lat || 28.5355,
      lng: suggestion.lng || 77.3910,
      city: suggestion.city || 'India',
      state: suggestion.state || 'Uttar Pradesh',
    };
    setWorkLocationDetails(resolved);

    try {
      const geo = await locationApi.geocode(address);
      if (geo.success && geo.data) {
        setWorkLocationDetails({
          address: geo.data.formattedAddress || address,
          lat: geo.data.lat,
          lng: geo.data.lng,
          city: geo.data.city,
          state: geo.data.state,
        });
      }
    } catch {
      // Keep resolved
    }
  };

  // Select Quick Chip for Workplace
  const handleQuickChipSelect = async (chip: string) => {
    const text = chip === 'Remote / WFH' ? 'Remote / Work From Home' : chip;
    setWorkLocationQuery(text);
    setDetails((prev) => ({ ...prev, workLocation: text }));
    setShowWorkDropdown(false);

    if (chip !== 'Remote / WFH') {
      try {
        const geo = await locationApi.geocode(text);
        if (geo.success && geo.data) {
          setWorkLocationDetails({
            address: geo.data.formattedAddress || text,
            lat: geo.data.lat,
            lng: geo.data.lng,
            city: geo.data.city,
            state: geo.data.state,
          });
        }
      } catch {
        // Keep text
      }
    } else {
      setWorkLocationDetails({
        address: 'Remote / Work From Home',
        lat: 0,
        lng: 0,
        city: 'Remote',
        state: 'Remote',
      });
    }
  };

  const numIncome = Math.max(0, Number(details.income) || 0);
  const numExpenses = Object.values(expenditures).reduce((acc, item) => {
    return item.status === 'amount' ? acc + (item.amount || 0) : acc;
  }, 0);
  const availableIncome = Math.max(0, numIncome - numExpenses);
  const hasExpenseWarning = numExpenses > numIncome && numIncome > 0;

  const handleAnalyze = () => {
    setHasAttemptedSubmit(true);

    const isEmiRequired = purchasePurpose === 'rent' || details.paymentMode !== 'full';

    // Mandatory Financial Profile Check (only if Bank Loan/EMI is chosen or for Rental properties)
    if (isEmiRequired && (!details.income || numIncome <= 0)) {
      setIncomeError('Monthly Salary / Income is compulsory for loan evaluation. Please enter your income.');
      if (incomeInputRef.current) {
        incomeInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        incomeInputRef.current.focus();
      }
      return;
    }

    setIncomeError('');

    // Mandatory Amenities Check
    if (!details.amenities || details.amenities.length === 0) {
      setAmenitiesError('Please select at least one property amenity or feature (Compulsory).');
      if (amenitiesRef.current) {
        amenitiesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setAmenitiesError('');

    const finalData = { 
      ...formData, 
      details,
      paymentMode: details.paymentMode || 'emi',
      expenditures,
      savings,
      showFinancial: true,
      showSavings,
      workLocation: workLocationQuery || details.workLocation,
      workLocationDetails: workLocationDetails || {
        address: workLocationQuery || details.workLocation,
      },
      familySize: details.familySize,
      monthlySalary: numIncome,
      monthlyExpenses: numExpenses,
      availableIncome: availableIncome,
    };
    
    saveToStorage(STORAGE_KEYS.PROPERTY_INPUT, finalData);
    router.push('/analyze/analyzing');
  };

  const toggleAmenity = (am: string) => {
    setAmenitiesError('');
    setDetails((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(am) 
        ? prev.amenities.filter((a) => a !== am)
        : [...prev.amenities, am],
    }));
  };

  // --- DYNAMIC FIELD DEFINITIONS BASED ON STEP 1 ---

  // 1. BHK / Unit Configuration Options based on Property Type
  const unitConfigsByType: Record<string, string[]> = {
    flat: ['1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Studio / 1 RK', 'Penthouse'],
    house: ['2 BHK Independent', '3 BHK Villa', '4 BHK Duplex', '5+ BHK Bungalow', 'Row House'],
    land: ['Residential Plot', 'Commercial Plot', 'Gated Township Plot', 'Corner Plot', 'Agricultural / Farm Land'],
    commercial: ['Commercial Office Space', 'High Street Retail Shop', 'Showroom', 'Warehouse / Godown', 'Co-working Floor'],
  };

  // 2. Floor / Level Options based on Property Type
  const floorOptionsByType: Record<string, { label: string; options: string[] }> = {
    flat: {
      label: 'Floor / Level',
      options: ['Ground Floor', '1st – 4th Floor (Low Rise)', '5th – 12th Floor (Mid Rise)', '13th – 25th Floor (High Rise)', 'Penthouse / Top Floor'],
    },
    house: {
      label: 'Floors / Structure',
      options: ['Ground Floor Only', 'G + 1 (2 Floors)', 'G + 2 (3 Floors)', 'G + 3 Multi-Storey'],
    },
    land: {
      label: 'Road Width & Boundary',
      options: ['30 ft Road (Standard)', '40 ft Wide Road', '60 ft+ Arterial Sector Road', 'Gated Boundary Wall Done'],
    },
    commercial: {
      label: 'Floor Level & Access',
      options: ['Ground Floor (Prime Retail)', '1st – 3rd Floor Office', '4th+ Floor Corporate Office', 'Dedicated Commercial Building'],
    },
  };

  // 3. Construction Status / Age / Fit-out based on Property Type (Removed for land)
  const statusOptionsByType: Record<string, { label: string; options: string[] }> = {
    flat: {
      label: 'Construction & Possession Status',
      options: ['Ready to Move', 'Under Construction (Within 1 Yr)', 'Under Construction (1-3 Yrs)', 'Newly Launched'],
    },
    house: {
      label: 'Property Age & Condition',
      options: ['Brand New / Newly Built', '1 – 5 Years Old', '5 – 10 Years Old', '10+ Years (Renovation Needed)'],
    },
    commercial: {
      label: 'Commercial Fit-out Status',
      options: ['Bare Shell (Raw)', 'Warm Shell (Base Fit-outs)', 'Fully Furnished & Fitted', 'Pre-Leased with Active Tenant'],
    },
  };

  // 4. Amenities specifically tailored to Property Type
  const amenitiesByType: Record<string, string[]> = {
    flat: [
      '100% Power Backup',
      'High-Speed Lifts',
      '24/7 Security & CCTV',
      'Covered Car Parking',
      'Club House & Gym',
      'Swimming Pool',
      'EV Charging Point',
      'Piped Gas (PNG)',
      'Gated Community',
      'Children Play Area',
    ],
    house: [
      'Private Lawn / Garden',
      'Private Rooftop Terrace',
      'Covered Car Porch',
      'Borewell / Dual Water',
      'Solar Rooftop System',
      'Servant Room & Bath',
      'Gated Security Gate',
      'Corner Plot Advantage',
      'Rainwater Harvesting',
    ],
    land: [
      'Clear Freehold Title',
      'RERA Approved Layout',
      '30ft+ Asphalt Road Access',
      'Electricity Transformer Ready',
      'Municipal Water Supply Line',
      'Sewage Pipeline Connected',
      'Gated Boundary Wall Built',
      'Park / Green Belt Facing',
      'East / North Vastu Facing',
    ],
    commercial: [
      'High Street Road Frontage',
      'Central Air Conditioning',
      '100% DG Power Backup',
      'Multi-Level Customer Parking',
      'High-Speed Passenger Lifts',
      'Fire Safety NOC Approved',
      '24/7 Building Security',
      'Loading / Unloading Bay',
      'Grade-A Certified Complex',
    ],
  };

  const currentUnitConfigs = unitConfigsByType[propertyType] || unitConfigsByType.flat;
  const currentFloorConfig = floorOptionsByType[propertyType] || floorOptionsByType.flat;
  const currentStatusConfig = statusOptionsByType[propertyType] || null;
  const currentAmenities = amenitiesByType[propertyType] || amenitiesByType.flat;

  return (
    <div className="min-h-screen bg-white md:bg-light-blue-gray dark:bg-dark-navy flex flex-col py-0 md:py-8">
      <div className="w-full max-w-xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-white dark:bg-[#1E293B] min-h-screen md:min-h-fit md:rounded-3xl md:shadow-xl md:overflow-hidden flex flex-col relative border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center px-6 lg:px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-dark-navy/95 backdrop-blur-md sticky top-0 z-20">
          <button onClick={() => router.back()} className="p-2.5 -ml-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-dark-navy dark:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center lg:text-left lg:pl-4 pr-8 lg:pr-0">
            <h1 className="text-lg md:text-xl font-bold text-dark-navy dark:text-white tracking-tight">Step 3: Tailored Details & Budget</h1>
          </div>
          <span className="hidden lg:inline-flex text-xs font-bold px-3 py-1 rounded-full bg-primary-blue/10 text-primary-blue">
            Step 3 of 3: Specifications & Financing
          </span>
        </div>

        {/* Progress */}
        <div className="px-6 sm:px-8 lg:px-8 py-4 bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800/60">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">Step 3 of 3: Deep Customization</span>
            <span className="text-xs sm:text-sm font-bold text-primary-blue dark:text-blue-400">100%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '66%' }}
              animate={{ width: '100%' }}
              className="h-full bg-primary-blue rounded-full"
            />
          </div>
        </div>

        {/* Content with Generous Spacing */}
        <div className="flex-1 px-6 sm:px-8 lg:px-8 py-8 space-y-8 overflow-y-auto pb-16">
          
          {/* Active Context Banner from Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-800/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/20 flex items-center justify-center text-primary-blue shadow-inner">
                {propertyType === 'flat' && <Building2 className="w-5 h-5" />}
                {propertyType === 'house' && <Home className="w-5 h-5" />}
                {propertyType === 'land' && <LandPlot className="w-5 h-5" />}
                {propertyType === 'commercial' && <Building className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-0.5">
                  Form Tailored For
                </span>
                <span className="text-sm font-black text-dark-navy dark:text-white capitalize">
                  {propertyType} • Purpose: {purchasePurpose}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-primary-blue dark:text-blue-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-2xs border border-blue-100 dark:border-slate-700 flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5" /> Smart Fields
            </span>
          </motion.div>

          {/* 2-Column Split on Desktop */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start space-y-8 lg:space-y-0">
            {/* Left Column: Property Specs & Amenities */}
            <div className="lg:col-span-6 space-y-8">
              {/* DYNAMIC SECTION 1: UNIT CONFIGURATION */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5">
            <label className="block text-sm font-bold text-dark-navy dark:text-gray-200">
              {propertyType === 'flat' && 'Apartment Configuration (BHK)'}
              {propertyType === 'house' && 'House / Villa Layout'}
              {propertyType === 'land' && 'Plot Category & Zoning'}
              {propertyType === 'commercial' && 'Commercial Property Type'}
              <span className="text-rose-500 font-bold ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {currentUnitConfigs.map((cfg) => {
                const isSelected = details.bhkConfig === cfg;
                return (
                  <button
                    key={cfg}
                    type="button"
                    onClick={() => setDetails({ ...details, bhkConfig: cfg })}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary-blue/10 border-primary-blue text-primary-blue dark:bg-primary-blue/20 dark:text-blue-300 shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate">{cfg}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-blue shrink-0 ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* DYNAMIC SECTION 2: STATUS & LEVEL */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`grid grid-cols-1 ${currentStatusConfig ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4`}>
            {currentStatusConfig && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-dark-navy dark:text-gray-200">
                  {currentStatusConfig.label} <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <select
                  value={details.constructionStatus}
                  onChange={(e) => setDetails({ ...details, constructionStatus: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-dark-navy dark:text-white font-medium focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none text-sm transition-all"
                >
                  <option value="" disabled>Select status</option>
                  {currentStatusConfig.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-dark-navy dark:text-gray-200">
                {currentFloorConfig.label}
              </label>
              <select
                value={details.floor}
                onChange={(e) => setDetails({ ...details, floor: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-dark-navy dark:text-white font-medium focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none text-sm transition-all"
              >
                <option value="" disabled>Select option</option>
                {currentFloorConfig.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* DYNAMIC SECTION 3: PURPOSE-SPECIFIC REQUIREMENTS */}

          {purchasePurpose === 'live' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-blue" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-dark-navy dark:text-white">
                  Living & Family Requirements
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">Family Members</label>
                  <select
                    value={details.familySize}
                    onChange={(e) => setDetails({ ...details, familySize: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-dark-navy dark:text-white outline-none"
                  >
                    <option value="">Select size</option>
                    <option value="1-2">1 – 2 Members</option>
                    <option value="3-4">3 – 4 Members (Standard Family)</option>
                    <option value="5+">5+ Members (Joint Family)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">Target Move Timeline</label>
                  <select
                    value={details.timeline}
                    onChange={(e) => setDetails({ ...details, timeline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-dark-navy dark:text-white outline-none"
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (0-3 Months)</option>
                    <option value="within-6-months">Within 6 Months</option>
                    <option value="6-12-months">6 – 12 Months</option>
                    <option value="1-2-years">1 – 2 Years</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {purchasePurpose === 'investment' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Investment & Growth Strategy
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">Investment Horizon</label>
                  <select
                    value={details.investmentHorizon}
                    onChange={(e) => setDetails({ ...details, investmentHorizon: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-dark-navy dark:text-white outline-none"
                  >
                    <option value="">Select horizon</option>
                    <option value="1-3">1 – 3 Years (Short-term Capitalize)</option>
                    <option value="3-5">3 – 5 Years (Medium Growth)</option>
                    <option value="5-10">5 – 10+ Years (Long-term Wealth)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">Expected Annual Return</label>
                  <select
                    value={details.targetReturn}
                    onChange={(e) => setDetails({ ...details, targetReturn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-dark-navy dark:text-white outline-none"
                  >
                    <option value="">Select target</option>
                    <option value="10-12">10% – 12% CAGR</option>
                    <option value="12-15">12% – 15% CAGR (High Growth)</option>
                    <option value="15+">15%+ CAGR (High Risk/Emerging)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {purchasePurpose === 'rent' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3.5 p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Rental Payment Frequency
                </h3>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">
                  Rent Frequency <span className="text-rose-500 font-bold ml-0.5">*</span>
                </label>
                <select
                  value={details.rentFrequency || 'monthly'}
                  onChange={(e) => setDetails({ ...details, rentFrequency: e.target.value })}
                  className="w-full px-3.5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-dark-navy dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi_annually">Semi-Annually</option>
                  <option value="yearly">Yearly (Lease)</option>
                </select>
              </div>
            </motion.div>
          )}

          {purchasePurpose === 'business' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                  Business Operations & Industry
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">Business Industry</label>
                  <select
                    value={details.businessType}
                    onChange={(e) => setDetails({ ...details, businessType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-dark-navy dark:text-white outline-none"
                  >
                    <option value="">Select industry</option>
                    <option value="it">IT / Software / Consulting</option>
                    <option value="retail">Retail / Store / Showroom</option>
                    <option value="healthcare">Clinic / Diagnostic Center</option>
                    <option value="cafe">Cafe / Restaurant / Food</option>
                    <option value="warehouse">Warehouse / Logistics</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">Staff / Employee Count</label>
                  <select
                    value={details.staffSize}
                    onChange={(e) => setDetails({ ...details, staffSize: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-dark-navy dark:text-white outline-none"
                  >
                    <option value="">Select count</option>
                    <option value="1-5">1 – 5 Staff</option>
                    <option value="6-20">6 – 20 Staff</option>
                    <option value="21-50">21 – 50 Staff</option>
                    <option value="50+">50+ Employees</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* DYNAMIC SECTION 4: TAILORED AMENITIES */}
          <motion.div
            ref={amenitiesRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`space-y-3 p-4 rounded-2xl transition-all ${
              amenitiesError && hasAttemptedSubmit
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800/80 shadow-xs'
                : 'bg-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-dark-navy dark:text-gray-200">
                {propertyType === 'flat' && 'Apartment & Society Amenities'}
                {propertyType === 'house' && 'Villa & Independent House Features'}
                {propertyType === 'land' && 'Plot Infrastructure & Legal Approvals'}
                {propertyType === 'commercial' && 'Commercial Building & High-Street Amenities'}
                <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <span className="text-[11px] text-gray-400 font-normal">Select applicable</span>
            </div>
            {amenitiesError && hasAttemptedSubmit && (
              <p className="text-xs font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{amenitiesError}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-2.5">
              {currentAmenities.map((am) => {
                const isSelected = details.amenities.includes(am);
                return (
                  <button
                    key={am}
                    type="button"
                    onClick={() => toggleAmenity(am)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                      isSelected 
                        ? 'bg-primary-blue/10 border-primary-blue text-primary-blue dark:bg-primary-blue/20 dark:text-blue-400 shadow-xs font-bold' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {am}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* WORKPLACE / BUSINESS LOCATION (GOOGLE MAPS AUTOCOMPLETE API) - HIDDEN FOR INVESTMENT, OPTIONAL FOR BUSINESS/RENT, MANDATORY FOR LIVE */}
          {purchasePurpose !== 'investment' && (
            <motion.div
              ref={workInputRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3.5 relative"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-dark-navy dark:text-gray-200 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-primary-blue" />
                    {purchasePurpose === 'business' && (
                      <span>Daily Commute Distance / Residence Base (Optional)</span>
                    )}
                    {purchasePurpose === 'rent' && (
                      <span>Primary Residence / Management Base (Optional)</span>
                    )}
                    {purchasePurpose === 'live' && (
                      <>
                        <span>Workplace / Office Commute Location</span>
                        <span className="text-rose-500 font-bold ml-0.5">*</span>
                      </>
                    )}
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Maps API Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {purchasePurpose === 'business' &&
                    'Optional: Enter your home address if you plan to commute to this business location daily. Leave blank if this is an independently operated branch or managed store.'}
                  {purchasePurpose === 'rent' &&
                    'Optional: Enter your residential address to evaluate travel distance for tenant visits and property maintenance.'}
                  {purchasePurpose === 'live' &&
                    'Type your office or commercial destination. We calculate real-time transit distance and descore travel fatigue exceeding 30 km.'}
                </p>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    {isSearchingWork ? (
                      <Loader2 className="w-4 h-4 text-primary-blue animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4 text-primary-blue" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={
                      purchasePurpose === 'business' || purchasePurpose === 'rent'
                        ? 'Search home / residence base (optional)...'
                        : 'Search office address (e.g. Cyber City Gurugram, BKC Mumbai, Sector 62 Noida)...'
                    }
                    value={workLocationQuery}
                    onChange={(e) => handleWorkLocationChange(e.target.value)}
                    onFocus={() => {
                      if (workSuggestions.length > 0) setShowWorkDropdown(true);
                    }}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-dark-navy dark:text-white font-medium focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none transition-all placeholder:text-gray-400 text-sm shadow-xs"
                  />

                  {/* Google Maps Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showWorkDropdown && workSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-30 w-full mt-2 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-60 overflow-y-auto"
                      >
                        <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          <span>Google Places Address Suggestions</span>
                          <span className="text-primary-blue text-[10px]">Select Address</span>
                        </div>
                        {workSuggestions.map((s, idx) => (
                          <button
                            key={s.placeId || idx}
                            type="button"
                            onClick={() => handleSelectWorkSuggestion(s)}
                            className="w-full px-4 py-3 text-left flex items-start gap-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                          >
                            <MapPin className="w-4 h-4 text-primary-blue shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-dark-navy dark:text-white truncate">
                                {s.mainText || s.description}
                              </p>
                              {s.secondaryText && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                  {s.secondaryText}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Suggestion Location Chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Cyber City Gurugram', 'BKC Mumbai', 'Electronic City Bengaluru', 'Sector 62 Noida', 'Hazratganj Lucknow', 'Remote / WFH'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleQuickChipSelect(chip)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-blue/10 hover:text-primary-blue dark:hover:text-blue-300 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Payment Mode & Financial Profile */}
        <div className="lg:col-span-6 space-y-8">
          {/* PAYMENT & FINANCING MODE (HIDDEN FOR RENTALS) */}
          {purchasePurpose !== 'rent' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="space-y-3"
            >
              <label className="block text-sm font-bold text-dark-navy dark:text-gray-200">
                Payment & Financing Mode <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setDetails({ ...details, paymentMode: 'emi' })}
                  className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-3.5 ${
                    details.paymentMode !== 'full'
                      ? 'bg-primary-blue/10 border-primary-blue shadow-xs text-dark-navy dark:text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      details.paymentMode !== 'full'
                        ? 'bg-primary-blue text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-dark-navy dark:text-white">Bank Loan / EMI</span>
                      {details.paymentMode !== 'full' && (
                        <CheckCircle2 className="w-4 h-4 text-primary-blue shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      Finance with 80% bank home loan & monthly installments.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDetails({ ...details, paymentMode: 'full' })}
                  className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-3.5 ${
                    details.paymentMode === 'full'
                      ? 'bg-primary-blue/10 border-primary-blue shadow-xs text-dark-navy dark:text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      details.paymentMode === 'full'
                        ? 'bg-primary-blue text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-dark-navy dark:text-white">Full Upfront Payment</span>
                      {details.paymentMode === 'full' && (
                        <CheckCircle2 className="w-4 h-4 text-primary-blue shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      100% self-funded purchase via savings (Zero Loan / Zero EMI).
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* COMPULSORY FINANCIAL PROFILE & BUDGET (SHOWN FOR BANK LOAN/EMI & RENTALS, HIDDEN FOR FULL PAYMENT) */}
          {(purchasePurpose === 'rent' || details.paymentMode !== 'full') ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`p-6 sm:p-7 rounded-2xl border transition-all space-y-6 ${
                incomeError && hasAttemptedSubmit
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-400 dark:border-rose-700 shadow-sm'
                  : 'bg-blue-50/30 dark:bg-slate-800/60 border-blue-100 dark:border-gray-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-blue/10 flex items-center justify-center text-primary-blue shadow-inner">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-dark-navy dark:text-white">
                        Financial Profile & Budget
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        Compulsory *
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Mandatory to calculate strict loan EMI burden, available surplus, and financial viability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Income Error Banner if attempted submit without income */}
              {incomeError && hasAttemptedSubmit && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{incomeError}</span>
                </motion.div>
              )}

              {/* Monthly Salary / Income (MANDATORY) */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-dark-navy dark:text-gray-200">
                    Monthly Take-Home Salary / Income <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold text-base">₹</span>
                    </div>
                    <input
                      ref={incomeInputRef}
                      type="number"
                      min="1"
                      placeholder="E.g. 120000 (Monthly take-home)"
                      value={details.income}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDetails({ ...details, income: val });
                        if (val && Number(val) > 0) setIncomeError('');
                      }}
                      className={`w-full pl-9 pr-4 py-3.5 bg-white dark:bg-gray-800 border rounded-xl text-dark-navy dark:text-white font-bold text-base focus:ring-2 outline-none transition-all ${
                        incomeError && hasAttemptedSubmit
                          ? 'border-rose-500 focus:ring-rose-200 dark:border-rose-600'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-primary-blue/20 focus:border-primary-blue'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Enter your monthly in-hand disposable salary or household earnings.
                  </p>
                </div>

                {/* Monthly Expenditures Breakdown */}
                <div className="space-y-3.5 pt-3">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <h4 className="text-xs font-bold text-dark-navy dark:text-white uppercase tracking-wider">
                      Monthly Expenses Breakdown
                    </h4>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      Total: ₹{numExpenses.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <div className="space-y-3">
                    {EXPENDITURE_CATEGORIES.map((cat) => (
                      <FinancialField
                        key={cat.id}
                        label={cat.label}
                        status={expenditures[cat.id]?.status || 'none'}
                        amount={expenditures[cat.id]?.amount}
                        onStatusChange={(status) => setExpenditures((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], status } }))}
                        onAmountChange={(amount) => setExpenditures((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], amount } }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Monthly Surplus Display */}
              {numIncome > 0 && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-blue-100 dark:border-slate-700 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-primary-blue uppercase tracking-wider block mb-0.5">
                      Calculated Monthly Savings Buffer
                    </span>
                    <span className="text-xs text-gray-500">
                      ₹{numIncome.toLocaleString('en-IN')} income - ₹{numExpenses.toLocaleString('en-IN')} expenses
                    </span>
                  </div>
                  <span className="text-lg font-black text-primary-blue dark:text-blue-400">
                    ₹{availableIncome.toLocaleString('en-IN')} / mo
                  </span>
                </div>
              )}

              {/* Warning if Expenses > Income */}
              {hasExpenseWarning && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                  <span className="font-bold">⚠️ Caution: </span>
                  Monthly expenses exceed monthly salary. Affordability score will reflect negative surplus.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3.5 shadow-xs"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                  Full Upfront Payment Selected (Zero Loan / Zero EMI)
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Financial debt & EMI budgeting inputs are not required. Property X AI will evaluate this asset with zero mortgage liabilities, pristine 100% upfront affordability scoring, and zero recurring loan default risks.
                </p>
              </div>
            </motion.div>
          )}

          {/* Existing Savings & Investments (Optional Asset Backing) */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-dark-navy dark:text-white">Existing Savings & Investments</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Optional: Down payment capital assets</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSavings(!showSavings)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showSavings ? 'bg-primary-blue' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showSavings ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {showSavings && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3.5 pt-1">
                {SAVINGS_CATEGORIES.map((cat) => (
                  <FinancialField
                    key={cat.id}
                    label={cat.label}
                    status={savings[cat.id]?.status || 'none'}
                    amount={savings[cat.id]?.amount}
                    onStatusChange={(status) => setSavings((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], status } }))}
                    onAmountChange={(amount) => setSavings((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], amount } }))}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>

            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:p-5 pb-3 bg-white dark:bg-dark-navy border-t border-gray-100 dark:border-gray-800 sticky bottom-0 z-20 shadow-lg flex flex-col gap-2">
          <button
            type="button"
            onClick={handleAnalyze}
            className="w-full py-3.5 rounded-xl font-bold text-base bg-primary-blue text-white shadow-lg shadow-primary-blue/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>Analyze Property</span>
          </button>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-medium select-none">
            Property X AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
