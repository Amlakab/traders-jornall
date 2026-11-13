'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { AnalyticsKPIs } from '@/types';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface PeriodComparisonData {
  periodA: { label: string; kpi: AnalyticsKPIs };
  periodB: { label: string; kpi: AnalyticsKPIs };
  delta: {
    netPnlDelta: number;
    winRateDelta: number;
    tradesDelta: number;
    profitFactorDelta: number;
    avgRRDelta: number;
  };
}

interface ComparisonViewProps {
  data: PeriodComparisonData;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ data }) => {
  const { periodA, periodB, delta } = data;

  const rows = [
    {
      label: 'Total Trades',
      valA: periodA.kpi.totalTrades,
      valB: periodB.kpi.totalTrades,
      delta: delta.tradesDelta,
      format: (v: number) => v.toString(),
    },
    {
      label: 'Win Rate',
      valA: periodA.kpi.winRate,
      valB: periodB.kpi.winRate,
      delta: delta.winRateDelta,
      format: (v: number) => `${v}%`,
    },
    {
      label: 'Net P/L',
      valA: periodA.kpi.netPnl,
      valB: periodB.kpi.netPnl,
      delta: delta.netPnlDelta,
      format: (v: number) => formatCurrency(v),
    },
    {
      label: 'Profit Factor',
      valA: periodA.kpi.profitFactor,
      valB: periodB.kpi.profitFactor,
      delta: delta.profitFactorDelta,
      format: (v: number) => (v >= 999 ? '∞' : v.toFixed(2)),
    },
    {
      label: 'Average R:R',
      valA: periodA.kpi.avgRR,
      valB: periodB.kpi.avgRR,
      delta: delta.avgRRDelta,
      format: (v: number) => `1 : ${v.toFixed(2)}`,
    },
    {
      label: 'Expectancy',
      valA: periodA.kpi.expectancy,
      valB: periodB.kpi.expectancy,
      delta: periodA.kpi.expectancy - periodB.kpi.expectancy,
      format: (v: number) => formatCurrency(v),
    },
  ];

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-200">
          Period Performance Comparison & Variance
        </h3>
        <p className="text-xs text-slate-500">
          Comparing {periodA.label} vs {periodB.label}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3 text-blue-400">{periodA.label} (Current)</th>
              <th className="px-4 py-3 text-slate-400">{periodB.label} (Baseline)</th>
              <th className="px-4 py-3 text-right">Variance / Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {rows.map((r, i) => {
              const isPositive = r.delta > 0;
              const isNegative = r.delta < 0;

              return (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-300">{r.label}</td>
                  <td className="px-4 py-3 font-bold text-white">{r.format(r.valA)}</td>
                  <td className="px-4 py-3 text-slate-400">{r.format(r.valB)}</td>
                  <td className="px-4 py-3 text-right font-bold">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                        isPositive
                          ? 'text-emerald-400 bg-emerald-950/50'
                          : isNegative
                          ? 'text-rose-400 bg-rose-950/50'
                          : 'text-slate-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : isNegative ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      {isPositive ? '+' : ''}
                      {typeof r.delta === 'number' ? r.delta.toFixed(2) : r.delta}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
