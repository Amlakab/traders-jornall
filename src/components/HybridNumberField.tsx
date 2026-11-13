'use client';

import React, { useState } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';
import { HybridNumber } from '@/types';

interface HybridNumberFieldProps {
  label: string;
  field: HybridNumber;
  onChange: (val: HybridNumber) => void;
  onResetToAuto?: () => void;
  prefix?: string;
  suffix?: string;
  step?: string;
  helperText?: string;
}

export const HybridNumberField: React.FC<HybridNumberFieldProps> = ({
  label,
  field,
  onChange,
  onResetToAuto,
  prefix,
  suffix,
  step = 'any',
  helperText,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    onChange({
      value: isNaN(num) ? 0 : num,
      isManual: true, // Marking as manual user edit
    });
  };

  const handleReset = () => {
    if (onResetToAuto) {
      onResetToAuto();
    } else {
      onChange({
        value: field.value,
        isManual: false,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          {field.isManual ? (
            <>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Edited
              </span>
              <button
                type="button"
                onClick={handleReset}
                title="Reset to auto calculation"
                className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Auto
            </span>
          )}
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit value manually"
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-lg">
        {prefix && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm text-slate-500 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          step={step}
          value={field.value !== undefined ? field.value : 0}
          onChange={handleValueChange}
          onFocus={() => setIsEditing(true)}
          className={`w-full py-2 text-sm bg-slate-900/90 border rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            prefix ? 'pl-8' : 'pl-3'
          } ${suffix ? 'pr-8' : 'pr-3'} ${
            field.isManual
              ? 'border-amber-500/40 focus:border-amber-500'
              : 'border-slate-800 focus:border-blue-500'
          }`}
        />
        {suffix && (
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-500 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
};
