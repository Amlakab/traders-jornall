'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { TimeScopeSelector, TimeScopeState } from '@/components/TimeScopeSelector';
import { FilterPreset } from '@/types';
import { Filter, Bookmark, Save, Trash2, X, RefreshCw } from 'lucide-react';

export interface FilterState {
  timeScope: TimeScopeState;
  pair?: string;
  session?: string;
  direction?: string;
  result?: string;
  strategyType?: string;
  setupType?: string;
  hasScreenshots?: string; // 'all' | 'true' | 'false'
  search?: string;
}

interface AdvancedFilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const { success, error } = useToast();
  const { t } = useLanguage();
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Dynamic dropdown options for strategyType and setupType
  const [strategyOptions, setStrategyOptions] = useState<string[]>([
    'ICT', 'SMC', 'Price Action', 'News', 'Breakout', 'Trend Following'
  ]);
  const [setupOptions, setSetupOptions] = useState<string[]>([
    'A+', 'A', 'B+', 'B', 'C'
  ]);

  const fetchPresets = async () => {
    try {
      const res = await api.get('/presets');
      if (res.data.success) {
        setPresets(res.data.data);
      }
    } catch {}
  };

  const fetchFilterOptions = async () => {
    try {
      const [stratRes, setupRes] = await Promise.allSettled([
        api.get('/options?field=strategyType'),
        api.get('/options?field=setupType'),
      ]);

      if (stratRes.status === 'fulfilled' && stratRes.value.data.success) {
        const values = stratRes.value.data.data.map((o: any) => o.value);
        if (values.length > 0) {
          setStrategyOptions(Array.from(new Set([...values, 'ICT', 'SMC', 'Price Action', 'News'])));
        }
      }

      if (setupRes.status === 'fulfilled' && setupRes.value.data.success) {
        const values = setupRes.value.data.data.map((o: any) => o.value);
        if (values.length > 0) {
          setSetupOptions(Array.from(new Set([...values, 'A+', 'A', 'B+', 'B', 'C'])));
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchPresets();
    fetchFilterOptions();
  }, []);

  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;

    try {
      setIsSavingPreset(true);
      const res = await api.post('/presets', {
        name: presetName.trim(),
        filters,
      });

      if (res.data.success) {
        success(`Filter preset "${presetName}" saved!`);
        setPresetName('');
        fetchPresets();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save preset');
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    if (preset.filters) {
      onChange(preset.filters as FilterState);
      success(`Applied preset: ${preset.name}`);
    }
  };

  const handleDeletePreset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/presets/${id}`);
      setPresets((prev) => prev.filter((p) => p._id !== id));
      success('Preset removed');
    } catch {
      error('Failed to delete preset');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-sm p-4 space-y-4 shadow-sm transition-colors">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Filters & Scopes</h3>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {/* Presets Quick Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <div
              key={p._id}
              onClick={() => handleApplyPreset(p)}
              className="group flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-blue-500/50 cursor-pointer transition-all"
            >
              <Bookmark className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              <span>{p.name}</span>
              <button
                type="button"
                onClick={(e) => handleDeletePreset(p._id, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-rose-500 dark:hover:text-rose-400 ml-1 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {t('btn.reset_all')}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          {/* Time Scope Bar */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Time Scope
            </label>
            <TimeScopeSelector
              value={filters.timeScope}
              onChange={(timeScope) => onChange({ ...filters, timeScope })}
            />
          </div>

          {/* Granular Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
            {/* Direction */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('field.direction')}
              </label>
              <select
                value={filters.direction || ''}
                onChange={(e) => onChange({ ...filters, direction: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Directions</option>
                <option value="Buy">Buy (Long)</option>
                <option value="Sell">Sell (Short)</option>
              </select>
            </div>

            {/* Outcome / Result */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('field.result')}
              </label>
              <select
                value={filters.result || ''}
                onChange={(e) => onChange({ ...filters, result: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Results</option>
                <option value="Win">Win</option>
                <option value="Loss">Loss</option>
                <option value="Break-even">Break-even</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            {/* Strategy Type */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('field.strategy_type')}
              </label>
              <select
                value={filters.strategyType || ''}
                onChange={(e) => onChange({ ...filters, strategyType: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Strategies</option>
                {strategyOptions.map((strat) => (
                  <option key={strat} value={strat}>
                    {strat}
                  </option>
                ))}
              </select>
            </div>

            {/* Setup Type */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('field.setup_type')}
              </label>
              <select
                value={filters.setupType || ''}
                onChange={(e) => onChange({ ...filters, setupType: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Setups</option>
                {setupOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('field.session')}
              </label>
              <select
                value={filters.session || ''}
                onChange={(e) => onChange({ ...filters, session: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Sessions</option>
                <option value="London">London</option>
                <option value="New York">New York</option>
                <option value="Asian">Asian</option>
                <option value="Overlap">Overlap</option>
              </select>
            </div>

            {/* Screenshots */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Screenshots
              </label>
              <select
                value={filters.hasScreenshots || ''}
                onChange={(e) => onChange({ ...filters, hasScreenshots: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Trades</option>
                <option value="true">Has Screenshots</option>
                <option value="false">Missing Screenshots</option>
              </select>
            </div>

            {/* Pair / Asset */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('field.pair')}
              </label>
              <input
                type="text"
                placeholder="e.g. XAU/USD, EUR"
                value={filters.pair || ''}
                onChange={(e) => onChange({ ...filters, pair: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save Preset Input Form */}
          <form onSubmit={handleSavePreset} className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">Save active filters as preset:</span>
            <input
              type="text"
              placeholder="e.g. ICT London Gold Scalps"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSavingPreset || !presetName.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Preset
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
