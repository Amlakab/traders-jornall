'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { KpiCards } from '@/components/analytics/KpiCards';
import { EquityCurve } from '@/components/analytics/EquityCurve';
import { TimeScopeSelector, TimeScopeState } from '@/components/TimeScopeSelector';
import { TradeTable } from '@/components/trades/TradeTable';
import { AnalyticsKPIs, Trade } from '@/types';
import { PlusCircle, Loader2, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [timeScope, setTimeScope] = useState<TimeScopeState>({
    scope: 'all',
  });

  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [equityData, setEquityData] = useState<any[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (timeScope.scope) params.append('scope', timeScope.scope);
      if (timeScope.date) params.append('date', timeScope.date);
      if (timeScope.week) params.append('week', timeScope.week);
      if (timeScope.month) params.append('month', timeScope.month);
      if (timeScope.year) params.append('year', timeScope.year);
      if (timeScope.from) params.append('from', timeScope.from);
      if (timeScope.to) params.append('to', timeScope.to);

      const [kpiRes, curveRes, tradesRes] = await Promise.all([
        api.get(`/analytics/summary?${params.toString()}`),
        api.get(`/analytics/equity-curve?${params.toString()}`),
        api.get(`/trades?${params.toString()}&limit=5&sortBy=date&sortOrder=desc`),
      ]);

      if (kpiRes.data.success) setKpis(kpiRes.data.data);
      if (curveRes.data.success) setEquityData(curveRes.data.data);
      if (tradesRes.data.success) setRecentTrades(tradesRes.data.data.trades);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeScope]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-blue-950/40 dark:via-slate-900/60 dark:to-purple-950/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Trader'}!
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Review your edge, manage risk, and log disciplined market executions.
          </p>
        </div>

        <button
          onClick={() => router.push('/trades/new')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('header.log_trade')}</span>
        </button>
      </div>

      {/* Time Scope Filter */}
      <div className="flex justify-end">
        <TimeScopeSelector value={timeScope} onChange={setTimeScope} />
      </div>

      {loading && !kpis ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500">Calculating trading statistics...</p>
        </div>
      ) : (
        <>
          {kpis && <KpiCards kpis={kpis} />}

          {/* Equity Trajectory */}
          <EquityCurve data={equityData} />

          {/* Recent Trades Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Journal Entries</h3>
                <p className="text-xs text-slate-500">Latest executed setups in this period</p>
              </div>

              <button
                onClick={() => router.push('/trades')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>View Full Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <TradeTable
              trades={recentTrades}
              pagination={{
                total: recentTrades.length,
                page: 1,
                limit: 5,
                totalPages: 1,
              }}
              onPageChange={() => {}}
              onRefresh={fetchDashboardData}
            />
          </div>
        </>
      )}
    </div>
  );
}
