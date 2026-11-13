'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { AnalyticsKPIs } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, TrendingUp, TrendingDown, ShieldAlert, Award, Brain } from 'lucide-react';

interface WeeklyReportData {
  period: string;
  narrative: string;
  currentKPIs: AnalyticsKPIs;
  previousKPIs: AnalyticsKPIs;
  delta: {
    netPnlDelta: number;
    winRateDelta: number;
    tradesDelta: number;
  };
  flagsCount: Record<string, number>;
  mostFrequentFlag: string;
}

interface WeeklyReviewNarrativeProps {
  report: WeeklyReportData;
}

export const WeeklyReviewNarrative: React.FC<WeeklyReviewNarrativeProps> = ({ report }) => {
  const { currentKPIs, delta, flagsCount } = report;
  const { t } = useLanguage();

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-950 space-y-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/20 dark:border-blue-500/30 dark:text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {report.period === 'month' ? 'Monthly' : 'Weekly'} Performance Review Card
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comprehensive breakdown of discipline, risk, and strategy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net Momentum:</span>
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
              delta.netPnlDelta >= 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {delta.netPnlDelta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {delta.netPnlDelta >= 0 ? '+' : ''}
            {formatCurrency(delta.netPnlDelta)} vs prior period
          </span>
        </div>
      </div>

      {/* Narrative Box */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic">
          "{report.narrative}"
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs">
          <Award className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('kpi.top_edge')}
            </h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {currentKPIs.bestSession} • {currentKPIs.bestPair}
            </p>
            <p className="text-xs text-slate-500">Highest statistical edge and win rate</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs">
          <Brain className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Psychological Friction
            </h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
              {report.mostFrequentFlag || 'None'}
            </p>
            <p className="text-xs text-slate-500">
              FOMO ({flagsCount.fomo || 0}), Revenge ({flagsCount.revenge || 0}), Moved SL ({flagsCount.movedSL || 0})
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('field.execution_quality')}
            </h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {currentKPIs.winRate}% Win Rate ({currentKPIs.profitFactor.toFixed(2)} PF)
            </p>
            <p className="text-xs text-slate-500">Avg R:R 1:{currentKPIs.avgRR.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
