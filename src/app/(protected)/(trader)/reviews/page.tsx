'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { WeeklyReviewNarrative } from '@/components/analytics/WeeklyReviewNarrative';
import { useLanguage } from '@/context/LanguageContext';
import { Trade } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Loader2, Calendar, ListFilter, ArrowRight, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export default function WeeklyReviewsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // View All Trades toggle and state
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [periodTrades, setPeriodTrades] = useState<Trade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/report?period=${period}`);
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load review report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodTrades = async () => {
    try {
      setLoadingTrades(true);
      const res = await api.get(`/trades?scope=${period}&limit=100`);
      if (res.data.success) {
        setPeriodTrades(res.data.data.trades);
      }
    } catch (err) {
      console.error('Failed to load period trades:', err);
    } finally {
      setLoadingTrades(false);
    }
  };

  useEffect(() => {
    fetchReport();
    if (showAllTrades) {
      fetchPeriodTrades();
    }
  }, [period]);

  const handleToggleViewAll = () => {
    const nextState = !showAllTrades;
    setShowAllTrades(nextState);
    if (nextState && periodTrades.length === 0) {
      fetchPeriodTrades();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t('nav.reviews')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Synthesized assessment of your trading routine, discipline, and execution quality
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View All Trades Button */}
          <button
            type="button"
            onClick={handleToggleViewAll}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-sm ${
              showAllTrades
                ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('btn.view_all_trades')}</span>
            {showAllTrades ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Scope Toggle: Week vs Month */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                period === 'week'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly Review
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                period === 'month'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Review
            </button>
          </div>
        </div>
      </div>

      {/* Main Review Card */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Generating report card...</p>
        </div>
      ) : report ? (
        <WeeklyReviewNarrative report={report} />
      ) : (
        <div className="text-center py-16 text-slate-500 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          No sufficient data to generate review for this period.
        </div>
      )}

      {/* Period Trades "View All" Accordion / Panel */}
      {showAllTrades && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-sm space-y-4 shadow-sm transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                All Trades in Active {period === 'week' ? 'Week' : 'Month'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {periodTrades.length} trades
              </span>
            </div>

            <button
              onClick={() => router.push(`/trades`)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open in Full Trade Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadingTrades ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <p className="text-xs text-slate-500 font-mono">Loading period trades...</p>
            </div>
          ) : periodTrades.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No trades recorded for this {period === 'week' ? 'week' : 'month'}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Asset & Dir</th>
                    <th className="py-2.5 px-3">Strategy</th>
                    <th className="py-2.5 px-3">Setup</th>
                    <th className="py-2.5 px-3">Result</th>
                    <th className="py-2.5 px-3 text-right">R:R</th>
                    <th className="py-2.5 px-3 text-right">Net P/L</th>
                    <th className="py-2.5 px-3 text-right">P/L (%)</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {periodTrades.map((t) => {
                    const pnl = t.pnl?.value ?? 0;
                    const pnlPct = t.pnlPercent?.value ?? 0;
                    return (
                      <tr
                        key={t._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          #{t.tradeNumber.toString().padStart(3, '0')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {formatDateTime(t.entryTime || t.date)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                              t.direction?.toLowerCase() === 'buy'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                            }`}
                          >
                            {t.direction} {t.pair}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                          {t.strategyType || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {t.setupType ? (
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-bold">
                              {t.setupType}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                              t.result?.toLowerCase() === 'win'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : t.result?.toLowerCase() === 'loss'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {t.result || 'Break-even'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">
                          1:{t.rr?.value ?? 0}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-bold ${
                            pnl > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : pnl < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {formatCurrency(pnl)}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-bold ${
                            pnlPct > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : pnlPct < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {pnlPct >= 0 ? '+' : ''}
                          {pnlPct}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => router.push(`/trades/${t._id}`)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                            title="View trade detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
