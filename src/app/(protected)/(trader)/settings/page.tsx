'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { DropdownOption, FilterPreset } from '@/types';
import { Settings, Plus, Trash2, Bookmark, Check, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { success, error } = useToast();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'options' | 'presets'>('options');
  const [selectedField, setSelectedField] = useState('strategyType');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [loading, setLoading] = useState(false);

  const availableFields = [
    { id: 'strategyType', label: 'Strategy Types (ICT, SMC, Price Action...)' },
    { id: 'setupType', label: 'Setup Types (A+, A, B+, B, C...)' },
    { id: 'pair', label: 'Pairs / Assets' },
    { id: 'session', label: 'Trading Sessions' },
    { id: 'direction', label: 'Trade Directions' },
    { id: 'entryTF', label: 'Entry Timeframes' },
    { id: 'analysisTF', label: 'Analysis Timeframes' },
    { id: 'marketStructure', label: 'Market Structures' },
    { id: 'htfDirection', label: 'HTF Biases' },
    { id: 'entryLocation', label: 'Entry Locations' },
    { id: 'liquidityTaken', label: 'Liquidity Taken' },
    { id: 'volumeCondition', label: 'Volume Conditions' },
    { id: 'confirmations', label: 'Confirmations' },
    { id: 'followedStrategy', label: 'Strategies' },
    { id: 'result', label: 'Results' },
    { id: 'executionQuality', label: 'Execution Qualities' },
    { id: 'exitReason', label: 'Exit Reasons' },
    { id: 'emotion', label: 'Emotions' },
    { id: 'tags', label: 'Tags' },
  ];

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/options?field=${selectedField}`);
      if (res.data.success) {
        setOptions(res.data.data);
      }
    } catch {
      error('Failed to load dropdown options');
    } finally {
      setLoading(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await api.get('/presets');
      if (res.data.success) {
        setPresets(res.data.data);
      }
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'options') {
      fetchOptions();
    } else {
      fetchPresets();
    }
  }, [activeTab, selectedField]);

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionValue.trim()) return;

    try {
      const res = await api.post('/options', {
        field: selectedField,
        value: newOptionValue.trim(),
      });
      if (res.data.success) {
        success(`Added "${newOptionValue.trim()}" to ${selectedField}`);
        setNewOptionValue('');
        fetchOptions();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to add option');
    }
  };

  const handleDeleteOption = async (id: string) => {
    try {
      await api.delete(`/options/${id}`);
      setOptions((prev) => prev.filter((o) => o._id !== id));
      success('Option deleted');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete option');
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await api.delete(`/presets/${id}`);
      setPresets((prev) => prev.filter((p) => p._id !== id));
      success('Filter preset deleted');
    } catch {
      error('Failed to delete preset');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {t('nav.settings')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal custom dropdown options, strategies, setups, vocabulary, and saved filter presets
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('options')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'options'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          Custom Dropdown Options
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'presets'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          Saved Filter Presets
        </button>
      </div>

      {activeTab === 'options' ? (
        <div className="space-y-5">
          {/* Field Selector pills */}
          <div className="flex flex-wrap gap-1.5">
            {availableFields.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedField(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedField === f.id
                    ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-400 dark:border-blue-500/40'
                    : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Add Option Form */}
          <form onSubmit={handleAddOption} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              placeholder={`Add new custom option to ${selectedField}...`}
              className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newOptionValue.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </form>

          {/* Options List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
            {options.map((opt) => (
              <div
                key={opt._id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{opt.value}</span>
                  {opt.isSystem ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      System Default
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                      Custom User Option
                    </span>
                  )}
                </div>

                {!opt.isSystem && (
                  <button
                    onClick={() => handleDeleteOption(opt._id)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                    title="Delete option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {presets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No saved filter presets yet. You can save presets directly from the Trade Log filter panel.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((p) => (
                <div
                  key={p._id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Saved: {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePreset(p._id)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                    title="Delete preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
