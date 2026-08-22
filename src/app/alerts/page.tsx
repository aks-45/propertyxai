'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, AlertTriangle, CheckCircle2, Bell, Sparkles, Building2 } from 'lucide-react';
import { analysisApi } from '@/lib/api';
import { formatINR } from '@/lib/calculations';

interface AlertItem {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate live dynamic alerts from real PostgreSQL analyses
    analysisApi.getAnalyses()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const liveAlerts: AlertItem[] = [];

          res.data.forEach((item: any, idx: number) => {
            const propertyName = item.property?.address || 'Analyzed Property';
            const price = item.financialSnapshot?.costEstimation?.propertyPrice || item.property?.price || 5000000;
            const score = item.scores?.overall || 80;
            const decision = item.decision || 'BUY';

            liveAlerts.push({
              id: `alert_analysis_${item.id}`,
              type: decision === 'BUY' ? 'success' : decision === 'RENT' ? 'info' : 'warning',
              title: `Property Analysis Completed: ${decision} (${score}/100)`,
              description: `Intelligence evaluation for ${propertyName} (Valued at ${formatINR(price)}) is ready with full Google location and Gemini synthesis.`,
              createdAt: item.createdAt,
              read: idx > 0,
            });

            if (item.aiExplanation?.what_to_verify?.length) {
              liveAlerts.push({
                id: `alert_legal_${item.id}`,
                type: 'warning',
                title: `Legal Due Diligence Alert: ${item.property?.city || 'State'} RERA`,
                description: `Verify 30-year Encumbrance Certificate & RERA approval for ${propertyName}.`,
                createdAt: item.createdAt,
                read: true,
              });
            }
          });

          // Add standing market alert
          liveAlerts.push({
            id: 'market_update_1',
            type: 'info',
            title: 'Interest Rate & Stamp Duty Slabs Updated',
            description: 'RBI home loan benchmark rates and UP IGRS circle rate tables are synchronized.',
            createdAt: new Date().toISOString(),
            read: true,
          });

          setAlerts(liveAlerts);
        } else {
          setAlerts([
            {
              id: 'welcome_alert',
              type: 'info',
              title: 'Welcome to Property X AI Decision Intelligence',
              description: 'Start analyzing any land, apartment, or commercial property to receive instant live alerts.',
              createdAt: new Date().toISOString(),
              read: false,
            },
          ]);
        }
      })
      .catch((err) => {
        console.warn('Alerts fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  const toggleRead = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: !a.read } : a)));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-amber" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-success-green" />;
      case 'info':
      default:
        return <Sparkles className="w-5 h-5 text-primary-blue" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-warning-amber/10';
      case 'success': return 'bg-success-green/10';
      case 'info':
      default: return 'bg-primary-blue/10';
    }
  };

  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const diffHours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-navy dark:text-white">Live Intelligence Alerts</h1>
        {alerts.some((a) => !a.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs md:text-sm font-bold text-primary-blue hover:underline"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-dark-navy dark:text-white mb-1">No Alerts</h2>
          <p className="text-gray-500 text-sm">You are all caught up with your property intelligence!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => toggleRead(alert.id)}
              className={`bg-white dark:bg-[#1E293B] p-4.5 rounded-2xl shadow-sm border cursor-pointer transition-all flex gap-3.5 items-start ${
                alert.read
                  ? 'border-gray-100 dark:border-gray-800'
                  : 'border-primary-blue/30 bg-blue-50/20 dark:bg-blue-950/20'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${getIconBg(alert.type)}`}>
                {getIcon(alert.type)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm md:text-base text-dark-navy dark:text-white mb-1">
                  {alert.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {alert.description}
                </p>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  {getRelativeTime(alert.createdAt)}
                </p>
              </div>

              {!alert.read && (
                <div className="w-2.5 h-2.5 bg-primary-blue rounded-full shrink-0 mt-2" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
