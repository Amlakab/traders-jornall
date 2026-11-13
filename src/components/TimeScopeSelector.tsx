'use client';

import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

export interface TimeScopeState {
  scope: 'all' | 'today' | 'day' | 'week' | 'month' | 'year' | 'range';
  date?: string;
  week?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}

interface TimeScopeSelectorProps {
  value: TimeScopeState;
  onChange: (val: TimeScopeState) => void;
}

export const TimeScopeSelector: React.FC<TimeScopeSelectorProps> = ({ value, onChange }) => {
  const scopes: Array<{ id: TimeScopeState['scope']; label: string }> = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'day', label: 'Specific Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
    { id: 'range', label: 'Custom Range' },
  ];

  const handleScopeChange = (newScope: TimeScopeState['scope']) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const monthStr = todayStr.substring(0, 7);
    const yearStr = todayStr.substring(0, 4);

    onChange({
      ...value,
      scope: newScope,
      date: value.date || todayStr,
      month: value.month || monthStr,
      year: value.year || yearStr,
      week: value.week || `${yearStr}-W46`,
      from: value.from || todayStr,
      to: value.to || todayStr,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl">
      <div className="flex items-center gap-1 overflow-x-auto">
        {scopes.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleScopeChange(s.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              value.scope === s.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Dynamic secondary input based on selected scope */}
      <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
        {value.scope === 'day' && (
          <input
            type="date"
            value={value.date || ''}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}

        {value.scope === 'week' && (
          <input
            type="week"
            value={value.week || ''}
            onChange={(e) => onChange({ ...value, week: e.target.value })}
            className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}

        {value.scope === 'month' && (
          <input
            type="month"
            value={value.month || ''}
            onChange={(e) => onChange({ ...value, month: e.target.value })}
            className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}

        {value.scope === 'year' && (
          <input
            type="number"
            min="2020"
            max="2035"
            value={value.year || '2026'}
            onChange={(e) => onChange({ ...value, year: e.target.value })}
            className="w-20 px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}

        {value.scope === 'range' && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={value.from || ''}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
              className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-500">to</span>
            <input
              type="date"
              value={value.to || ''}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
              className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
