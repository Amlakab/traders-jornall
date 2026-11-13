'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Check, Loader2, X } from 'lucide-react';

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
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [savingCustom, setSavingCustom] = useState(false);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/options?field=${field}`);
      if (res.data.success) {
        const optionValues = res.data.data.map((o: any) => o.value);
        // Deduplicate
        const uniqueValues = Array.from(new Set(optionValues)) as string[];
        setOptions(uniqueValues);
      }
    } catch (err) {
      console.error(`Failed to load options for field ${field}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [field]);

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
    if (!customValue.trim()) return;

    try {
      setSavingCustom(true);
      const res = await api.post('/options', {
        field,
        value: customValue.trim(),
      });

      if (res.data.success) {
        const newValue = res.data.data.value;
        if (!options.includes(newValue)) {
          setOptions((prev) => [...prev, newValue]);
        }

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
      }
    } catch (err) {
      console.error('Failed to create custom option:', err);
    } finally {
      setSavingCustom(false);
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label} {required && <span className="text-rose-400">*</span>}
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
            className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-blue-500 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="relative">
          <select
            value={multiple ? '' : (value as string) || ''}
            onChange={handleSelectChange}
            disabled={loading}
            className={`w-full px-3 py-2 text-sm bg-slate-900/80 border rounded-lg text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              error ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <option value="" disabled>
              {loading ? 'Loading...' : placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="__add_other__" className="font-semibold text-blue-400 bg-slate-900">
              + Other (Add Custom...)
            </option>
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Multiple Selection Badges */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/80 text-blue-300 border border-blue-800/60"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemoveItem(item)}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
};
