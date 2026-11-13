'use client';

import React from 'react';
import { AnalyticsKPIs } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Percent,
  Clock,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

interface KpiCardsProps {
  kpis: AnalyticsKPIs;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  const { t } = useLanguage();

  const cards = [
    {
      title: t('kpi.net_pnl'),
      value: formatCurrency(kpis.netPnl),
      subtext: `Gross: ${formatCurrency(kpis.grossProfit)} | Loss: ${formatCurrency(kpis.grossLoss)}`,
      icon: kpis.netPnl >= 0 ? TrendingUp : TrendingDown,
      color: kpis.netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
      bgColor: kpis.netPnl >= 0
        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40'
        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40',
    },
    {
      title: t('kpi.win_rate'),
      value: `${kpis.winRate}%`,
      subtext: `${kpis.wins}W / ${kpis.losses}L / ${kpis.breakEvens}BE (${kpis.totalTrades} Total)`,
      icon: Percent,
      color: kpis.winRate >= 50 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40',
    },
    {
      title: t('kpi.profit_factor'),
      value: kpis.profitFactor >= 999 ? '∞' : kpis.profitFactor.toFixed(2),
      subtext: `Expectancy: ${formatCurrency(kpis.expectancy)}`,
      icon: Target,
      color: kpis.profitFactor >= 1.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800',
    },
    {
      title: t('kpi.avg_rr'),
      value: `1 : ${kpis.avgRR.toFixed(2)}`,
      subtext: `Avg Win: ${formatCurrency(kpis.avgWin)} | Avg Loss: ${formatCurrency(kpis.avgLoss)}`,
      icon: Zap,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40',
    },
    {
      title: t('kpi.streaks'),
      value: `${kpis.maxConsecutiveWins}W / ${kpis.maxConsecutiveLosses}L`,
      subtext: `Max Win: ${formatCurrency(kpis.largestWin)} | Max Loss: ${formatCurrency(kpis.largestLoss)}`,
      icon: Flame,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
    },
    {
      title: t('kpi.top_edge'),
      value: `${kpis.bestSession} / ${kpis.bestPair}`,
      subtext: `Best Setup: ${kpis.bestSetup} (${kpis.bestDayOfWeek})`,
      icon: Award,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border backdrop-blur-sm transition-all hover:border-slate-400 dark:hover:border-slate-700 shadow-xs ${c.bgColor}`}
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate mr-1">
                {c.title}
              </span>
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${c.color}`} />
            </div>
            <div className={`text-lg sm:text-2xl font-extrabold tracking-tight ${c.color}`}>
              {c.value}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 truncate">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
