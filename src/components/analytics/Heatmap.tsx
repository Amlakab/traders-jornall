'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface HeatmapCell {
  count: number;
  netPnl: number;
  winRate: number;
  wins: number;
}

interface HeatmapProps {
  matrix: Record<string, Record<string, HeatmapCell>>;
}

export const Heatmap: React.FC<HeatmapProps> = ({ matrix }) => {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const SESSIONS = ['London', 'New York', 'Asian', 'Overlap'];

  if (!matrix || Object.keys(matrix).length === 0) {
    return (
      <div className="h-48 rounded-2xl border border-slate-800 bg-slate-900/40 flex items-center justify-center text-slate-500 text-sm">
        No matrix data available.
      </div>
    );
  }

  const getCellBg = (cell?: HeatmapCell) => {
    if (!cell || cell.count === 0) return 'bg-slate-900/40 border-slate-800/60 text-slate-600';
    if (cell.netPnl > 0) {
      if (cell.winRate >= 70) return 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300';
      return 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400';
    }
    if (cell.netPnl < 0) {
      return 'bg-rose-950/50 border-rose-800/50 text-rose-300';
    }
    return 'bg-slate-800/40 border-slate-700/40 text-slate-300';
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-200">
          Trading Edge Heatmap (Day × Session)
        </h3>
        <p className="text-xs text-slate-500">
          Identify your sweet-spot combinations of market session and trading day
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2.5 text-left text-slate-400 font-semibold uppercase tracking-wider">
                Day
              </th>
              {SESSIONS.map((s) => (
                <th key={s} className="p-2.5 text-slate-300 font-bold uppercase tracking-wider">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day} className="border-t border-slate-800/60">
                <td className="p-2.5 text-left font-bold text-slate-300">{day}</td>
                {SESSIONS.map((session) => {
                  const cell = matrix[day]?.[session];
                  const hasData = cell && cell.count > 0;
                  return (
                    <td key={session} className="p-2">
                      <div
                        className={`p-3 rounded-xl border transition-all ${getCellBg(cell)}`}
                      >
                        {hasData ? (
                          <div className="space-y-0.5">
                            <p className="text-sm font-extrabold">
                              {formatCurrency(cell.netPnl)}
                            </p>
                            <p className="text-[10px] opacity-80">
                              {cell.count} trades ({cell.winRate}% WR)
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
