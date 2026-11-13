'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export interface BreakdownItem {
  group: string;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
  avgRR: number;
  netPnl: number;
  expectancy: number;
}

interface BreakdownChartProps {
  data: BreakdownItem[];
  title: string;
  onGroupByChange?: (group: string) => void;
  activeGroup?: string;
}

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  data,
  title,
  onGroupByChange,
  activeGroup = 'session',
}) => {
  const [metric, setMetric] = useState<'netPnl' | 'winRate'>('netPnl');

  const groups = [
    { id: 'strategyType', label: 'Strategy' },
    { id: 'setupType', label: 'Setup' },
    { id: 'session', label: 'Session' },
    { id: 'pair', label: 'Pair' },
    { id: 'emotion', label: 'Emotion' },
    { id: 'day', label: 'Day of Week' },
  ];

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-sm space-y-4 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h3>
          <p className="text-xs text-slate-500">Segment trade performance by category</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onGroupByChange && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onGroupByChange(g.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeGroup === g.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMetric('netPnl')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                metric === 'netPnl' ? 'bg-slate-700 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Net P/L ($)
            </button>
            <button
              type="button"
              onClick={() => setMetric('winRate')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                metric === 'winRate' ? 'bg-slate-700 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Win Rate (%)
            </button>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No segment data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="group"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => (metric === 'netPnl' ? `$${v}` : `${v}%`)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as BreakdownItem;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-200">{item.group}</p>
                        <p className="text-slate-300">
                          Trades: {item.count} ({item.wins}W / {item.losses}L)
                        </p>
                        <p className="text-blue-400">Win Rate: {item.winRate}%</p>
                        <p className={item.netPnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          Net P/L: {formatCurrency(item.netPnl)}
                        </p>
                        <p className="text-slate-400">Avg R:R: 1:{item.avgRR}</p>
                        <p className="text-purple-400">Expectancy: {formatCurrency(item.expectancy)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey={metric} radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => {
                  let barColor = '#3b82f6';
                  if (metric === 'netPnl') {
                    barColor = entry.netPnl >= 0 ? '#10b981' : '#ef4444';
                  } else {
                    barColor = entry.winRate >= 50 ? '#3b82f6' : '#f59e0b';
                  }
                  return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Breakdown Table */}
      {data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Trades</th>
                <th className="px-4 py-2.5">Win Rate</th>
                <th className="px-4 py-2.5">Avg R:R</th>
                <th className="px-4 py-2.5">Net P/L</th>
                <th className="px-4 py-2.5">Expectancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {data.map((row) => (
                <tr key={row.group} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{row.group}</td>
                  <td className="px-4 py-2.5">{row.count} ({row.wins}W / {row.losses}L)</td>
                  <td className="px-4 py-2.5 font-semibold text-blue-400">{row.winRate}%</td>
                  <td className="px-4 py-2.5">1 : {row.avgRR}</td>
                  <td className={`px-4 py-2.5 font-bold ${row.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(row.netPnl)}
                  </td>
                  <td className="px-4 py-2.5 text-purple-300">{formatCurrency(row.expectancy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
