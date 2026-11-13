'use client';

import React from 'react';
import { AnalyticsKPIs } from '@/types';
import { formatCurrency } from '@/lib/utils';
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
  const cards = [
    {
      title: 'Net Profit / Loss',
      value: formatCurrency(kpis.netPnl),
      subtext: `Gross: ${formatCurrency(kpis.grossProfit)} | Loss: ${formatCurrency(kpis.grossLoss)}`,
      icon: kpis.netPnl >= 0 ? TrendingUp : TrendingDown,
      color: kpis.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400',
      bgColor: kpis.netPnl >= 0 ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-rose-950/30 border-rose-800/40',
    },
    {
      title: 'Win Rate',
      value: `${kpis.winRate}%`,
      subtext: `${kpis.wins}W / ${kpis.losses}L / ${kpis.breakEvens}BE (${kpis.totalTrades} Total)`,
      icon: Percent,
      color: kpis.winRate >= 50 ? 'text-blue-400' : 'text-amber-400',
      bgColor: 'bg-blue-950/20 border-blue-900/40',
    },
    {
      title: 'Profit Factor',
      value: kpis.profitFactor >= 999 ? '∞' : kpis.profitFactor.toFixed(2),
      subtext: `Expectancy: ${formatCurrency(kpis.expectancy)}`,
      icon: Target,
      color: kpis.profitFactor >= 1.5 ? 'text-emerald-400' : 'text-slate-300',
      bgColor: 'bg-slate-900/60 border-slate-800',
    },
    {
      title: 'Average Risk:Reward',
      value: `1 : ${kpis.avgRR.toFixed(2)}`,
      subtext: `Avg Win: ${formatCurrency(kpis.avgWin)} | Avg Loss: ${formatCurrency(kpis.avgLoss)}`,
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/20 border-purple-900/40',
    },
    {
      title: 'Streaks & Records',
      value: `${kpis.maxConsecutiveWins}W / ${kpis.maxConsecutiveLosses}L`,
      subtext: `Max Win: ${formatCurrency(kpis.largestWin)} | Max Loss: ${formatCurrency(kpis.largestLoss)}`,
      icon: Flame,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/20 border-amber-900/40',
    },
    {
      title: 'Top Edge Alignment',
      value: `${kpis.bestSession} / ${kpis.bestPair}`,
      subtext: `Best Setup: ${kpis.bestSetup} (${kpis.bestDayOfWeek})`,
      icon: Award,
      color: 'text-blue-400',
      bgColor: 'bg-slate-900/60 border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl border backdrop-blur-sm transition-all hover:border-slate-700 ${c.bgColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {c.title}
              </span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className={`text-2xl font-extrabold tracking-tight ${c.color}`}>
              {c.value}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
