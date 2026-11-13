'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { Trade } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { TradeForm } from '@/components/trades/TradeForm';
import { ScreenshotUploader } from '@/components/ScreenshotUploader';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Sparkles,
  Clock,
  Layers,
  CheckCircle,
  TrendingUp,
  Brain,
  Camera,
  Loader2,
  Tag,
  Shield,
  Target,
  DollarSign,
} from 'lucide-react';

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const { t } = useLanguage();
  const id = params?.id as string;

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchTrade = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trades/${id}`);
      if (res.data.success) {
        setTrade(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load trade detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTrade();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this trade from your journal?')) return;
    try {
      await api.delete(`/trades/${id}`);
      success('Trade deleted successfully');
      router.push('/trades');
    } catch {
      error('Failed to delete trade');
    }
  };

  const handleRegenerateSummary = async () => {
    try {
      setRegenerating(true);
      const res = await api.post(`/trades/${id}/regenerate-summary`);
      if (res.data.success) {
        setTrade((prev) => (prev ? { ...prev, tradeSummary: res.data.data } : null));
        success('Trade summary regenerated and saved!');
      }
    } catch {
      error('Failed to regenerate summary');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-500 font-mono">Loading trade analysis...</p>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-500 dark:text-slate-400">Trade not found or access denied.</p>
        <button
          onClick={() => router.push('/trades')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Trade Log
        </button>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setIsEditMode(false)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Edit Mode</span>
        </button>
        <TradeForm initialTrade={trade} isEditing={true} />
      </div>
    );
  }

  const pnlVal = trade.pnl?.value ?? 0;
  const pnlPct = trade.pnlPercent?.value ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/trades')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
            title="Back to trades"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                Trade #{trade.tradeNumber.toString().padStart(3, '0')}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase ${
                  trade.direction?.toLowerCase() === 'buy'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                }`}
              >
                {trade.direction} {trade.pair}
              </span>
              {trade.strategyType && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                  {trade.strategyType}
                </span>
              )}
              {trade.setupType && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                  Setup: {trade.setupType}
                </span>
              )}
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                  trade.result?.toLowerCase() === 'win'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                    : trade.result?.toLowerCase() === 'loss'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {trade.result || 'Break-even'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Entered: {formatDateTime(trade.entryTime || trade.date)}
              {trade.closedTime && ` • Closed: ${formatDateTime(trade.closedTime)}`} • {trade.session} Session
            </p>
          </div>
        </div>

        {/* PnL and Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right pr-3 border-r border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Net Realized P/L
            </span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span
                className={`text-xl font-extrabold font-mono ${
                  pnlVal > 0 ? 'text-emerald-600 dark:text-emerald-400' : pnlVal < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {formatCurrency(pnlVal)}
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  pnlPct > 0 ? 'text-emerald-600 dark:text-emerald-400' : pnlPct < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                }`}
              >
                ({pnlPct >= 0 ? '+' : ''}{pnlPct}%)
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditMode(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>{t('btn.edit')}</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800/60 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-300 rounded-xl transition-colors"
            title="Delete trade"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auto Summary Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t('section.summary')}
            </h3>
            {trade.tradeSummary?.isManual && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Custom Edited
              </span>
            )}
          </div>

          <button
            onClick={handleRegenerateSummary}
            disabled={regenerating}
            className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            {t('btn.regenerate')}
          </button>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-serif italic bg-white dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
          "{trade.tradeSummary?.text || 'No summary generated yet.'}"
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Section A: Execution Details */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
              {t('section.basic')}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">{t('field.strategy_type')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{trade.strategyType || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.setup_type')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{trade.setupType || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.account_balance')}</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {trade.accountBalance ? `$${trade.accountBalance.toLocaleString()}` : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.closed_time')}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {trade.closedTime ? formatDateTime(trade.closedTime) : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.entry_tf')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.entryTF}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.analysis_tf')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.analysisTF?.join(', ') || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.entry_price')}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{trade.entry}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.sl')} / {t('field.tp')}</span>
              <span className="font-mono font-semibold text-rose-600 dark:text-rose-300">{trade.sl}</span> /{' '}
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-300">{trade.tp}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.risk_dollars')} & (%)</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">
                ${trade.risk?.value ?? 0} <span className="text-rose-500 font-semibold">({trade.riskPercent?.value ?? 0}%)</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.reward_dollars')} & (%)</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">
                ${trade.reward?.value ?? 0} <span className="text-emerald-500 font-semibold">({trade.rewardPercent?.value ?? 0}%)</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.rr')}</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">1 : {trade.rr?.value ?? 0}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.duration')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.duration?.value ?? 0} min</span>
            </div>
            <div>
              <span className="text-slate-500 block">Confirmation Score</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{trade.confirmationScore?.value ?? 0}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.pnl_pips')}</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{trade.pnlPips?.value ?? 0} pips</span>
            </div>
          </div>
        </div>

        {/* Section B: Market Structure */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Layers className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
              {t('section.market')}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">{t('field.market_structure')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.marketStructure || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.htf_bias')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.htfDirection || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.sr_zone')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.srZone || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.entry_location')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.entryLocation || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.liquidity_sweep')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.liquidityTaken || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.volume_condition')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.volumeCondition || '—'}</span>
            </div>
          </div>
          {trade.biasNotes && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs">
              <span className="text-slate-500 block mb-0.5">Bias Notes:</span>
              <p className="text-slate-700 dark:text-slate-300 italic">{trade.biasNotes}</p>
            </div>
          )}
        </div>

        {/* Section C: Confirmations & Setup */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
              {t('section.confirmations')}
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Followed Strategy Model</span>
              <span className="font-bold text-slate-900 dark:text-white">{trade.followedStrategy || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">{t('field.confirmations')} ({trade.confirmations?.length || 0})</span>
              <div className="flex flex-wrap gap-1.5">
                {trade.confirmations && trade.confirmations.length > 0 ? (
                  trade.confirmations.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50"
                    >
                      ✓ {c}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">None specified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section E: Psychology & Discipline */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Brain className="w-4 h-4 text-pink-500 dark:text-pink-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
              {t('section.psychology')}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Was Patient?</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.psychology?.patient || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Followed Plan?</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.psychology?.followedPlan || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Avoided FOMO?</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {trade.psychology?.fomo === 'No' ? 'Yes (Disciplined)' : trade.psychology?.fomo || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.emotion')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{trade.psychology?.emotion || 'Neutral'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('field.rating')}</span>
              <span className="font-bold text-amber-500 dark:text-amber-400">{trade.psychology?.rating || 3} / 5 ★</span>
            </div>
          </div>
          {trade.lesson && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs">
              <span className="text-slate-500 block mb-0.5">{t('field.lesson')}:</span>
              <p className="text-slate-800 dark:text-slate-200 italic font-medium">{trade.lesson}</p>
            </div>
          )}
        </div>
      </div>

      {/* Section F: Visual Screenshots & Charts */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-sm space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <Camera className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
            {t('section.media')}
          </h4>
        </div>

        <ScreenshotUploader
          screenshots={trade.screenshots || { extras: [] }}
          onChange={() => {}}
          readOnly={true}
        />

        {/* Tags & Additional Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/60 text-xs">
          {trade.notes && (
            <div>
              <span className="text-slate-500 block mb-1 font-semibold uppercase tracking-wider">
                {t('field.notes')}
              </span>
              <p className="text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {trade.notes}
              </p>
            </div>
          )}

          {trade.tags && trade.tags.length > 0 && (
            <div>
              <span className="text-slate-500 block mb-1 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {t('field.tags')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {trade.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
