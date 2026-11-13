'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { KpiCards } from '@/components/analytics/KpiCards';
import { EquityCurve } from '@/components/analytics/EquityCurve';
import { BreakdownChart } from '@/components/analytics/BreakdownChart';
import { formatCurrency } from '@/lib/utils';
import { Users, BookOpen, TrendingUp, Percent, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-500 font-mono">Aggregating system-wide metrics...</p>
      </div>
    );
  }

  const { overview, kpis, equityCurve, sessionBreakdown, pairBreakdown } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">System-Wide Platform Analytics</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Admin Scope
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Holistic performance metrics, risk, and volume across all registered traders
        </p>
      </div>

      {/* Platform Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
            <Users className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
            Traders
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {overview?.totalTraders || 0}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
            {overview?.activeTraders || 0} Active
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
            <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
            Trades Logged
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {overview?.totalTradesLogged || 0}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">All market sessions</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            System Net P/L
          </span>
          <div
            className={`text-xl sm:text-2xl font-extrabold ${
              overview?.systemNetPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(overview?.systemNetPnl || 0)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Combined equity</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
            <Percent className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            Win Rate
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {overview?.systemWinRate || 0}%
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Platform avg</p>
        </div>
      </div>

      {/* Aggregate KPIs */}
      {kpis && <KpiCards kpis={kpis} />}

      {/* Global Equity Curve */}
      {equityCurve && <EquityCurve data={equityCurve} />}

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sessionBreakdown && (
          <BreakdownChart data={sessionBreakdown} title="Global P/L by Trading Session" />
        )}
        {pairBreakdown && (
          <BreakdownChart data={pairBreakdown} title="Global P/L by Asset / Pair" />
        )}
      </div>
    </div>
  );
}
