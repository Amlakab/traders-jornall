'use client';

import React, { useState } from 'react';
import { Sparkles, RotateCcw, Check, Pencil } from 'lucide-react';

interface AutoSummaryBoxProps {
  summary: { text: string; isManual: boolean };
  onChange: (val: { text: string; isManual: boolean }) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export const AutoSummaryBox: React.FC<AutoSummaryBoxProps> = ({
  summary,
  onChange,
  onRegenerate,
  isRegenerating = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      text: e.target.value,
      isManual: true,
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Auto-Generated Trade Summary
          </h3>
          {summary.isManual ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Edited
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Auto
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800 rounded-lg hover:bg-emerald-900/40 flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Done Editing
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-400" />
              Edit Narrative
            </button>
          )}

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="px-2.5 py-1 text-xs font-semibold text-blue-400 bg-blue-950/40 border border-blue-800/80 rounded-lg hover:bg-blue-900/40 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
      </div>

      {isEditing ? (
        <textarea
          rows={4}
          value={summary.text || ''}
          onChange={handleTextChange}
          placeholder="Detailed narrative summary of this trade..."
          className="w-full p-3 text-sm bg-slate-950 border border-blue-500/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
        />
      ) : (
        <p className="text-sm text-slate-300 leading-relaxed italic bg-slate-950/50 p-3.5 rounded-lg border border-slate-800/60">
          {summary.text || 'Trade summary will be generated automatically as you fill out Sections A–E.'}
        </p>
      )}
    </div>
  );
};
