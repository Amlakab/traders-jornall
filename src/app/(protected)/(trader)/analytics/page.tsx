'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { KpiCards } from '@/components/analytics/KpiCards';
import { EquityCurve } from '@/components/analytics/EquityCurve';
import { BreakdownChart } from '@/components/analytics/BreakdownChart';
import { Heatmap } from '@/components/analytics/Heatmap';
import { ComparisonView } from '@/components/analytics/ComparisonView';
import { TimeScopeSelector, TimeScopeState } from '@/components/TimeScopeSelector';
import { AnalyticsKPIs } from '@/types';
import { Loader2, ArrowLeftRight, BarChart2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [timeScope, setTimeScope] = useState<TimeScopeState>({
    scope: 'all',
  });

  const [activeGroup, setActiveGroup] = useState<string>('session');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  // Single period state
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [equityData, setEquityData] = useState<any[]>([]);
  const [breakdownData, setBreakdownData] = useState<any[]>([]);
  const [heatmapMatrix, setHeatmapMatrix] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Compare mode state
  const [compareData, setCompareData] = useState<any>(null);
  const [periodA, setPeriodA] = useState<string>('month');
  const [periodB, setPeriodB] = useState<string>('all');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      if (isCompareMode) {
        const res = await api.get(`/analytics/compare?scopeA=${periodA}&scopeB=${periodB}`);
        if (res.data.success) {
          setCompareData({
            periodA: { label: periodA.toUpperCase(), kpi: res.data.data.periodA.kpi },
            periodB: { label: periodB.toUpperCase(), kpi: res.data.data.periodB.kpi },
            delta: res.data.data.delta,
          });
        }
      } else {
        const params = new URLSearchParams();
        if (timeScope.scope) params.append('scope', timeScope.scope);
        if (timeScope.date) params.append('date', timeScope.date);
        if (timeScope.week) params.append('week', timeScope.week);
        if (timeScope.month) params.append('month', timeScope.month);
        if (timeScope.year) params.append('year', timeScope.year);
        if (timeScope.from) params.append('from', timeScope.from);
        if (timeScope.to) params.append('to', timeScope.to);

        const [kpiRes, curveRes, breakRes, heatRes] = await Promise.all([
          api.get(`/analytics/summary?${params.toString()}`),
          api.get(`/analytics/equity-curve?${params.toString()}`),
          api.get(`/analytics/breakdown?groupBy=${activeGroup}&${params.toString()}`),
          api.get(`/analytics/heatmap?${params.toString()}`),
        ]);

        if (kpiRes.data.success) setKpis(kpiRes.data.data);
        if (curveRes.data.success) setEquityData(curveRes.data.data);
        if (breakRes.data.success) setBreakdownData(breakRes.data.data);
        if (heatRes.data.success) setHeatmapMatrix(heatRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeScope, activeGroup, isCompareMode, periodA, periodB]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Performance Analytics & Edge Audit</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Statistical breakdown of profit factor, win rates, sessions, and discipline
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 border transition-all ${
              isCompareMode
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{isCompareMode ? 'Standard Analytics' : 'Period Comparison'}</span>
          </button>
        </div>
      </div>

      {!isCompareMode && (
        <div className="flex justify-end">
          <TimeScopeSelector value={timeScope} onChange={setTimeScope} />
        </div>
      )}

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Aggregating dataset...</p>
        </div>
      ) : isCompareMode ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Period A (Current):</span>
              <select
                value={periodA}
                onChange={(e) => setPeriodA(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="today">Today</option>
                <option value="week">Current Week</option>
                <option value="month">Current Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Period B (Baseline):</span>
              <select
                value={periodB}
                onChange={(e) => setPeriodB(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          {compareData && <ComparisonView data={compareData} />}
        </div>
      ) : (
        <>
          {kpis && <KpiCards kpis={kpis} />}

          <EquityCurve data={equityData} />

          <BreakdownChart
            data={breakdownData}
            title="Segmented Breakdown"
            activeGroup={activeGroup}
            onGroupByChange={setActiveGroup}
          />

          <Heatmap matrix={heatmapMatrix} />
        </>
      )}
    </div>
  );
}
