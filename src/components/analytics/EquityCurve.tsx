'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';

interface EquityDataPoint {
  index: number;
  tradeNumber: number;
  date: string;
  pair: string;
  pnl: number;
  cumulativePnl: number;
  drawdown: number;
  drawdownPct: number;
}

interface EquityCurveProps {
  data: EquityDataPoint[];
}

export const EquityCurve: React.FC<EquityCurveProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'equity' | 'drawdown'>('equity');

  if (!data || data.length === 0) {
    return (
      <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900/40 flex items-center justify-center text-slate-500 text-sm">
        No trades logged for this time scope to generate equity curve.
      </div>
    );
  }

  // Prepend baseline starting at 0
  const chartData = [
    {
      tradeNumber: 0,
      label: 'Start',
      cumulativePnl: 0,
      drawdown: 0,
    },
    ...data.map((d) => ({
      ...d,
      label: `#${d.tradeNumber} ${d.pair}`,
    })),
  ];

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200">
            {viewMode === 'equity' ? 'Cumulative Equity Curve ($)' : 'Account Drawdown Chart ($)'}
          </h3>
          <p className="text-xs text-slate-500">
            {viewMode === 'equity' ? 'P/L trajectory over closed trades' : 'Capital drawdown from equity high-water mark'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('equity')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'equity' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Equity
          </button>
          <button
            type="button"
            onClick={() => setViewMode('drawdown')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'drawdown' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Drawdown
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-200">{pt.label}</p>
                      {pt.date && <p className="text-slate-400">{formatDate(pt.date)}</p>}
                      {pt.pnl !== undefined && (
                        <p className="text-slate-300">
                          Trade P/L: <span className={pt.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {formatCurrency(pt.pnl)}
                          </span>
                        </p>
                      )}
                      <p className="text-blue-400 font-bold">
                        Cumulative Equity: {formatCurrency(pt.cumulativePnl)}
                      </p>
                      {pt.drawdown > 0 && (
                        <p className="text-rose-400 font-medium">
                          Drawdown: -{formatCurrency(pt.drawdown)} ({pt.drawdownPct}%)
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {viewMode === 'equity' ? (
              <Area
                type="monotone"
                dataKey="cumulativePnl"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#equityGrad)"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#drawdownGrad)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
