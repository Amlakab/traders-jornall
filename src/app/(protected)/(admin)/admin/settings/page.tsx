'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { DropdownOption } from '@/types';
import { Settings, Plus, Trash2, ShieldCheck } from 'lucide-react';

export default function AdminGlobalSettingsPage() {
  const { success, error } = useToast();

  const [selectedField, setSelectedField] = useState('strategyType');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [loading, setLoading] = useState(false);

  const availableFields = [
    { id: 'strategyType', label: 'Strategy Types (ICT, SMC, Price Action...)' },
    { id: 'setupType', label: 'Setup Types (A+, A, B+, B, C...)' },
    { id: 'pair', label: 'Pairs / Assets' },
    { id: 'session', label: 'Sessions' },
    { id: 'direction', label: 'Directions' },
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
      error('Failed to load global options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [selectedField]);

  const handleAddGlobalOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionValue.trim()) return;

    try {
      const res = await api.post('/options', {
        field: selectedField,
        value: newOptionValue.trim(),
        isSystem: true,
      });

      if (res.data.success) {
        success(`Added global system option "${newOptionValue.trim()}"`);
        setNewOptionValue('');
        fetchOptions();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to add global option');
    }
  };

  const handleDeleteOption = async (id: string) => {
    try {
      await api.delete(`/options/${id}`);
      setOptions((prev) => prev.filter((o) => o._id !== id));
      success('System option removed');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete system option');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Global Dropdown Options Management</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> System Level
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Define global default dropdown choices available across all trader accounts
        </p>
      </div>

      {/* Field Selector pills */}
      <div className="flex flex-wrap gap-1.5">
        {availableFields.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedField(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedField === f.id
                ? 'bg-purple-50 dark:bg-slate-800 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-500/40'
                : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add Global Option Form */}
      <form onSubmit={handleAddGlobalOption} className="flex items-center gap-2">
        <input
          type="text"
          value={newOptionValue}
          onChange={(e) => setNewOptionValue(e.target.value)}
          placeholder={`Add global system option to ${selectedField}...`}
          className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={!newOptionValue.trim()}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          Add System Option
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
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                  Global System Default
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  User Specific
                </span>
              )}
            </div>

            <button
              onClick={() => handleDeleteOption(opt._id)}
              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
              title="Delete option"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
