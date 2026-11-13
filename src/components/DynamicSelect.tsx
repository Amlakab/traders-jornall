'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Plus, Check, Loader2, X } from 'lucide-react';

const BUILTIN_OPTIONS: Record<string, string[]> = {
  strategyType: ['Price Action', 'ICT', 'SMC', 'News Trading', 'Wyckoff', 'Order Flow', 'Trend Following', 'Breakout'],
  setupType: ['A+', 'A', 'B+', 'B', 'C'],
  direction: ['Buy', 'Sell'],
  session: ['London', 'New York', 'Asian', 'Overlap'],
  entryTF: ['1M', '3M', '5M', '15M', '30M', '1H', '4H', 'Daily'],
  analysisTF: ['15M', '1H', '4H', 'Daily', 'Weekly'],
  marketStructure: ['Uptrend', 'Downtrend', 'Consolidation / Range', 'Expanding', 'Compression'],
  htfDirection: ['Bullish', 'Bearish', 'Neutral / Choppy'],
  entryLocation: ['At Support', 'At Resistance', 'Equilibrium (EQ)', 'Discount Zone', 'Premium Zone', 'FVG (Fair Value Gap)', 'Orderblock (OB)'],
  liquidityTaken: ['Yes', 'No', 'Partial Sweep'],
  volumeCondition: ['High / Climax', 'Normal / Average', 'Low / Dry', 'Divergent'],
  result: ['Win', 'Loss', 'Break-even', 'Partial'],
  executionQuality: ['A+ (Flawless)', 'Good', 'Average', 'Bad / Chased', 'Impulsive'],
  exitReason: ['TP Hit', 'SL Hit', 'Manual Exit', 'Trailing Stop', 'News Invalidation', 'Market Close'],
  followedStrategy: ['Yes', 'Partially', 'No'],
  patient: ['Yes', 'No', 'Somewhat'],
  followedPlan: ['Yes', 'Partially', 'No'],
  fomo: ['No', 'Yes', 'Slightly'],
  movedSL: ['No', 'Yes', 'To Break-even'],
  revenge: ['No', 'Yes'],
  emotion: ['Confident', 'Disciplined', 'Neutral', 'Anxious', 'Greedy', 'Fearful', 'Excited'],
  pair: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'US30', 'NAS100', 'BTC/USD', 'AUD/USD', 'USD/CAD'],
};

interface DynamicSelectProps {
  field: string;
  label?: string;
  value: string | string[];
  onChange: (val: any) => void;
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const DynamicSelect: React.FC<DynamicSelectProps> = ({
  field,
  label,
  value,
  onChange,
  multiple = false,
  placeholder = 'Select option...',
  required = false,
  error,
}) => {
  const initialBuiltins = BUILTIN_OPTIONS[field] || [];
  const [options, setOptions] = useState<string[]>(initialBuiltins);
  const [loading, setLoading] = useState(false);
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [savingCustom, setSavingCustom] = useState(false);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/options?field=${field}`);
      if (res.data.success && Array.isArray(res.data.data)) {
        const dbValues = res.data.data.map((o: any) => o.value);
        const builtins = BUILTIN_OPTIONS[field] || [];
        const currentVals = Array.isArray(value) ? value : value ? [value] : [];
        const unique = Array.from(new Set([...builtins, ...dbValues, ...currentVals].filter(Boolean))) as string[];
        setOptions(unique);
      }
    } catch (err) {
      console.warn(`Could not load server options for ${field}, using built-ins.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [field]);

  // Compute full options list ensuring current value is always included
  const displayOptions = useMemo(() => {
    const builtins = BUILTIN_OPTIONS[field] || [];
    const currentVals = Array.isArray(value) ? value : value ? [value] : [];
    const list = Array.from(new Set([...builtins, ...options, ...currentVals].filter(Boolean))) as string[];
    return list;
  }, [options, value, field]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__add_other__') {
      setIsAddingOther(true);
      return;
    }

    if (multiple) {
      const currentList = Array.isArray(value) ? value : [];
      if (!currentList.includes(selected)) {
        onChange([...currentList, selected]);
      }
    } else {
      onChange(selected);
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((item) => item !== itemToRemove));
    }
  };

  const handleSaveCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customValue.trim();
    if (!trimmed) return;

    try {
      setSavingCustom(true);
      const res = await api.post('/options', {
        field,
        value: trimmed,
      });

      const newValue = res.data?.data?.value || trimmed;

      setOptions((prev) => Array.from(new Set([...prev, newValue])));

      if (multiple) {
        const currentList = Array.isArray(value) ? value : [];
        if (!currentList.includes(newValue)) {
          onChange([...currentList, newValue]);
        }
      } else {
        onChange(newValue);
      }

      setCustomValue('');
      setIsAddingOther(false);
    } catch (err) {
      // Even if network fails, add to local options and select it
      setOptions((prev) => Array.from(new Set([...prev, trimmed])));
      if (multiple) {
        const currentList = Array.isArray(value) ? value : [];
        if (!currentList.includes(trimmed)) {
          onChange([...currentList, trimmed]);
        }
      } else {
        onChange(trimmed);
      }
      setCustomValue('');
      setIsAddingOther(false);
    } finally {
      setSavingCustom(false);
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
        </label>
      )}

      {isAddingOther ? (
        <form onSubmit={handleSaveCustom} className="flex items-center gap-1.5">
          <input
            type="text"
            autoFocus
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={`Enter custom ${label || field}...`}
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-blue-500 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={savingCustom || !customValue.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            {savingCustom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingOther(false);
              setCustomValue('');
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="relative">
          <select
            value={multiple ? '' : (value as string) || ''}
            onChange={handleSelectChange}
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            <option value="" disabled>
              {loading && displayOptions.length === 0 ? 'Loading...' : placeholder}
            </option>
            {displayOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="__add_other__" className="font-semibold text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-900">
              + Other (Add Custom...)
            </option>
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}

      {/* Multiple Selection Badges */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemoveItem(item)}
                className="hover:text-blue-900 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{error}</p>}
    </div>
  );
};
