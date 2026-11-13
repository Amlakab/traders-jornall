'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { DynamicSelect } from '@/components/DynamicSelect';
import { HybridNumberField } from '@/components/HybridNumberField';
import { AutoSummaryBox } from '@/components/AutoSummaryBox';
import { ScreenshotUploader } from '@/components/ScreenshotUploader';
import { Trade } from '@/types';
import {
  ChevronDown,
  ChevronUp,
  Save,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
  Brain,
  Camera,
  CheckCircle,
  Percent,
} from 'lucide-react';

interface TradeFormProps {
  initialTrade?: Partial<Trade>;
  isEditing?: boolean;
  onSuccess?: (trade: Trade) => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ initialTrade, isEditing = false, onSuccess }) => {
  const router = useRouter();
  const { success, error, toast } = useToast();
  const { t } = useLanguage();

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    sectionB: false,
    sectionC: false,
    sectionD: false,
    sectionE: false,
    sectionF: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const defaultTradeData = {
    date: new Date().toISOString().split('T')[0],
    entryTime: new Date().toISOString().substring(0, 16),
    closedTime: new Date().toISOString().substring(0, 16),
    exitPrice: 0,
    pair: 'EUR/USD',
    session: 'London',
    direction: 'Buy',
    strategyType: 'Price Action',
    setupType: 'A+',
    accountBalance: 10000,
    entryTF: '5M',
    analysisTF: ['15M', '1H'],
    entry: 1.0850,
    sl: 1.0820,
    tp: 1.0920,
    lot: 1,

    // Hybrid auto fields
    risk: { value: 300, isManual: false },
    riskPercent: { value: 3, isManual: false },
    reward: { value: 700, isManual: false },
    rewardPercent: { value: 7, isManual: false },
    rr: { value: 2.33, isManual: false },
    pnl: { value: 700, isManual: false },
    pnlPercent: { value: 7, isManual: false },
    pnlPips: { value: 70, isManual: false },
    duration: { value: 120, isManual: false },
    sessionAuto: { value: 'London', isManual: false },
    confirmationScore: { value: 50, isManual: false },

    // Section B
    marketStructure: 'Uptrend',
    htfDirection: 'Bullish',
    srZone: 'Key Support',
    entryLocation: 'At Support',
    liquidityTaken: 'Yes',
    volumeCondition: 'High',
    biasNotes: '',

    // Section C
    confirmations: ['Bullish/Bearish engulfing', 'Strong candle close', 'Liquidity sweep'],
    followedStrategy: 'Yes',

    // Section D
    result: 'Win',
    executionQuality: 'Good',
    exitReason: 'TP hit',

    // Section E
    psychology: {
      patient: 'Yes',
      followedPlan: 'Yes',
      fomo: 'No',
      movedSL: 'No',
      revenge: 'No',
      emotion: 'Confident',
      rating: 5,
    },
    lesson: '',

    // Section F
    screenshots: {
      before: '',
      atEntry: '',
      after: '',
      extras: [],
    },
    notes: '',
    tags: ['DayTrade'],

    tradeSummary: {
      text: '',
      isManual: false,
    },
  };

  const [formData, setFormData] = useState<any>(() => {
    if (initialTrade) {
      return {
        ...defaultTradeData,
        ...initialTrade,
        date: initialTrade.date ? new Date(initialTrade.date).toISOString().split('T')[0] : defaultTradeData.date,
        entryTime: initialTrade.entryTime ? new Date(initialTrade.entryTime).toISOString().substring(0, 16) : defaultTradeData.entryTime,
        closedTime: initialTrade.closedTime
          ? new Date(initialTrade.closedTime).toISOString().substring(0, 16)
          : initialTrade.exitTime
          ? new Date(initialTrade.exitTime).toISOString().substring(0, 16)
          : defaultTradeData.closedTime,
      };
    }
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem('trade_draft');
      if (draft) {
        try {
          return JSON.parse(draft);
        } catch {}
      }
    }
    return defaultTradeData;
  });

  const [screenshotFiles, setScreenshotFiles] = useState<{
    before?: File;
    atEntry?: File;
    after?: File;
    extras?: File[];
  }>({});

  const [submitting, setSubmitting] = useState(false);
  const [regeneratingSummary, setRegeneratingSummary] = useState(false);

  // Auto-save draft
  useEffect(() => {
    if (!isEditing && typeof window !== 'undefined') {
      localStorage.setItem('trade_draft', JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  // Recalculate auto fields on price/balance/lot changes
  useEffect(() => {
    const lot = formData.lot || 1;
    const entry = formData.entry || 0;
    const sl = formData.sl || 0;
    const tp = formData.tp || 0;
    const balance = formData.accountBalance && formData.accountBalance > 0 ? formData.accountBalance : 10000;
    const isSell = formData.direction?.toLowerCase() === 'sell';
    const isJPY = formData.pair?.includes('JPY');
    const isGold = formData.pair?.includes('XAU');
    const contractSize = isJPY ? 1000 : isGold ? 100 : 100000;
    const pipSize = isJPY ? 0.01 : isGold ? 0.1 : 0.0001;

    // Risk $ & Risk %
    let currentRisk = formData.risk?.value;
    if (!formData.risk?.isManual && entry && sl) {
      currentRisk = Math.round(Math.abs(entry - sl) * contractSize * lot * 100) / 100;
      setFormData((prev: any) => ({ ...prev, risk: { value: currentRisk, isManual: false } }));
    }
    if (!formData.riskPercent?.isManual && currentRisk !== undefined && balance > 0) {
      const riskPct = Math.round((currentRisk / balance) * 10000) / 100;
      setFormData((prev: any) => ({ ...prev, riskPercent: { value: riskPct, isManual: false } }));
    }

    // Reward $ & Reward %
    let currentReward = formData.reward?.value;
    if (!formData.reward?.isManual && entry && tp) {
      currentReward = Math.round(Math.abs(tp - entry) * contractSize * lot * 100) / 100;
      setFormData((prev: any) => ({ ...prev, reward: { value: currentReward, isManual: false } }));
    }
    if (!formData.rewardPercent?.isManual && currentReward !== undefined && balance > 0) {
      const rewardPct = Math.round((currentReward / balance) * 10000) / 100;
      setFormData((prev: any) => ({ ...prev, rewardPercent: { value: rewardPct, isManual: false } }));
    }

    // RR
    if (!formData.rr?.isManual && currentRisk > 0 && currentReward > 0) {
      const rrVal = Math.round((currentReward / currentRisk) * 100) / 100;
      setFormData((prev: any) => ({ ...prev, rr: { value: rrVal, isManual: false } }));
    }

    // PnL $ & PnL %
    let exitP = formData.exitPrice;
    if (!exitP) {
      if (formData.result === 'Win') exitP = tp;
      else if (formData.result === 'Loss') exitP = sl;
      else if (formData.result === 'Break-even') exitP = entry;
    }
    if (exitP && entry) {
      const diff = (exitP - entry) * (isSell ? -1 : 1);
      const pnlVal = Math.round(diff * contractSize * lot * 100) / 100;
      const pnlPct = Math.round((pnlVal / balance) * 10000) / 100;
      const pipsVal = Math.round((diff / pipSize) * 10) / 10;

      if (!formData.pnl?.isManual) {
        setFormData((prev: any) => ({ ...prev, pnl: { value: pnlVal, isManual: false } }));
      }
      if (!formData.pnlPercent?.isManual) {
        setFormData((prev: any) => ({ ...prev, pnlPercent: { value: pnlPct, isManual: false } }));
      }
      if (!formData.pnlPips?.isManual) {
        setFormData((prev: any) => ({ ...prev, pnlPips: { value: pipsVal, isManual: false } }));
      }
    }

    // Duration between entry and closedTime
    if (!formData.duration?.isManual && formData.entryTime && formData.closedTime) {
      const start = new Date(formData.entryTime).getTime();
      const end = new Date(formData.closedTime).getTime();
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        const durMins = Math.round((end - start) / (1000 * 60));
        setFormData((prev: any) => ({ ...prev, duration: { value: durMins, isManual: false } }));
      }
    }
  }, [
    formData.pair,
    formData.direction,
    formData.entry,
    formData.sl,
    formData.tp,
    formData.lot,
    formData.accountBalance,
    formData.exitPrice,
    formData.result,
    formData.entryTime,
    formData.closedTime,
  ]);

  // Handle Ctrl+S / Cmd+S save event
  useEffect(() => {
    const handleSaveShortcut = () => {
      handleSubmit();
    };
    window.addEventListener('trade-form-save-shortcut', handleSaveShortcut);
    return () => window.removeEventListener('trade-form-save-shortcut', handleSaveShortcut);
  }, [formData]);

  const handleRegenerateSummary = () => {
    setRegeneratingSummary(true);
    const num = formData.tradeNumber || 1;
    const dir = formData.direction?.toUpperCase() || 'TRADE';
    const pair = formData.pair || 'the asset';
    const sess = formData.session ? ` during the ${formData.session} session` : '';
    const date = formData.date ? ` on ${formData.date}` : '';
    const tf = formData.entryTF ? ` on the ${formData.entryTF} entry timeframe` : '';
    const strat = formData.strategyType ? ` using a ${formData.strategyType} framework` : '';
    const setup = formData.setupType ? ` (${formData.setupType} setup)` : '';

    let text = `Trade #${num.toString().padStart(3, '0')} was a ${dir} on ${pair} taken${sess}${date}${tf}${strat}${setup}.`;
    if (formData.marketStructure) {
      text += ` Market structure was ${formData.marketStructure.toLowerCase()} with a ${formData.htfDirection?.toLowerCase()} HTF bias;`;
    }
    if (formData.entryLocation) {
      text += ` entry was taken at ${formData.entryLocation.toLowerCase()}`;
    }
    if (formData.liquidityTaken === 'Yes') {
      text += ` after a liquidity sweep`;
    }
    if (formData.confirmations && formData.confirmations.length > 0) {
      text += `, confirmed by ${formData.confirmations.join(', ').toLowerCase()}.`;
    } else {
      text += `.`;
    }

    const riskVal = formData.risk?.value || 0;
    const riskPct = formData.riskPercent?.value || 0;
    const rewardVal = formData.reward?.value || 0;
    const rewardPct = formData.rewardPercent?.value || 0;
    text += ` Risk was $${riskVal} (${riskPct}%) for a $${rewardVal} (${rewardPct}%) reward (1:${formData.rr?.value || 0}).`;

    if (formData.result) {
      const pnlSign = (formData.pnl?.value || 0) >= 0 ? '+' : '';
      text += ` The trade closed as a ${formData.result} with ${pnlSign}$${formData.pnl?.value || 0} (${pnlSign}${formData.pnlPercent?.value || 0}%) P/L, execution rated ${formData.executionQuality || 'Normal'}.`;
    }
    if (formData.psychology) {
      text += ` Psychologically, the trader was patient (${formData.psychology.patient}), avoided FOMO (${formData.psychology.fomo === 'No' ? 'Yes' : 'No'}), and rated confidence ${formData.psychology.rating}/5.`;
    }
    if (formData.lesson) {
      text += ` Lesson learned: ${formData.lesson}`;
    }

    setFormData((prev: any) => ({
      ...prev,
      tradeSummary: {
        text,
        isManual: false,
      },
    }));
    setRegeneratingSummary(false);
    toast('Summary refreshed based on trade sections', 'info');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.pair || !formData.entry || !formData.sl || !formData.tp) {
      error('Please complete all required fields (Pair, Entry, SL, TP)');
      return;
    }

    try {
      setSubmitting(true);
      let tradeId = initialTrade?._id;
      let returnedTrade = null;

      if (isEditing && tradeId) {
        const res = await api.patch(`/trades/${tradeId}`, formData);
        if (!res.data.success) throw new Error(res.data.message);
        returnedTrade = res.data.data;
        success('Trade updated successfully!');
      } else {
        const res = await api.post('/trades', formData);
        if (!res.data.success) throw new Error(res.data.message);
        tradeId = res.data.data._id;
        returnedTrade = res.data.data;
        localStorage.removeItem('trade_draft');
        success('Trade saved to your journal!');
      }

      // If screenshot files were selected, upload multipart
      if (
        tradeId &&
        (screenshotFiles.before || screenshotFiles.atEntry || screenshotFiles.after || screenshotFiles.extras?.length)
      ) {
        const uploadData = new FormData();
        if (screenshotFiles.before) uploadData.append('before', screenshotFiles.before);
        if (screenshotFiles.atEntry) uploadData.append('atEntry', screenshotFiles.atEntry);
        if (screenshotFiles.after) uploadData.append('after', screenshotFiles.after);
        if (screenshotFiles.extras) {
          screenshotFiles.extras.forEach((f) => uploadData.append('extras', f));
        }

        const uploadRes = await api.post(`/trades/${tradeId}/screenshots`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.data) {
          returnedTrade = uploadRes.data.data;
        }
      }

      if (isEditing && onSuccess && returnedTrade) {
        onSuccess(returnedTrade);
      } else {
        router.push(`/trades/${tradeId}`);
        router.refresh();
      }
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Failed to save trade');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Action Bar (Naturally scrollable with the page, fully responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center dark:text-blue-400 font-bold shrink-0">
            {isEditing ? `#${formData.tradeNumber || '---'}` : '+'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditing ? `Edit Trade #${formData.tradeNumber || ''}` : t('btn.record_trade')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('section.basic')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-center"
          >
            {t('btn.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : isEditing ? t('btn.update_trade') : t('btn.save_trade')}</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-blue-700 rounded border border-blue-500">
              Ctrl+S
            </kbd>
          </button>
        </div>
      </div>

      {/* Auto Summary Box */}
      <AutoSummaryBox
        summary={formData.tradeSummary}
        onChange={(summary) => setFormData((prev: any) => ({ ...prev, tradeSummary: summary }))}
        onRegenerate={handleRegenerateSummary}
        isRegenerating={regeneratingSummary}
      />

      {/* SECTION A — Basic Trade Information, Strategy, Setup & Hybrid Metrics */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-5 transition-colors">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {t('section.basic')}
          </h3>
        </div>

        {/* Row 1: Dates and Times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('field.date')} *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('field.entry_time')}
            </label>
            <input
              type="datetime-local"
              value={formData.entryTime}
              onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('field.closed_time')} *
            </label>
            <input
              type="datetime-local"
              value={formData.closedTime}
              onChange={(e) => setFormData({ ...formData, closedTime: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Row 2: Strategy Type, Setup Type, Account Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
          <DynamicSelect
            field="strategyType"
            label={t('field.strategy_type')}
            value={formData.strategyType}
            onChange={(val) => setFormData({ ...formData, strategyType: val })}
            required
          />

          <DynamicSelect
            field="setupType"
            label={t('field.setup_type')}
            value={formData.setupType}
            onChange={(val) => setFormData({ ...formData, setupType: val })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('field.account_balance')} ($) *
            </label>
            <input
              type="number"
              step="any"
              value={formData.accountBalance}
              onChange={(e) => setFormData({ ...formData, accountBalance: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
          </div>
        </div>

        {/* Row 3: Asset, Session, Direction, Timeframes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800/60">
          <DynamicSelect
            field="pair"
            label={t('field.pair')}
            value={formData.pair}
            onChange={(val) => setFormData({ ...formData, pair: val })}
            required
          />

          <DynamicSelect
            field="session"
            label={t('field.session')}
            value={formData.session}
            onChange={(val) => setFormData({ ...formData, session: val })}
            required
          />

          <DynamicSelect
            field="direction"
            label={t('field.direction')}
            value={formData.direction}
            onChange={(val) => setFormData({ ...formData, direction: val })}
            required
          />

          <DynamicSelect
            field="entryTF"
            label={t('field.entry_tf')}
            value={formData.entryTF}
            onChange={(val) => setFormData({ ...formData, entryTF: val })}
            required
          />
        </div>

        {/* Row 4: Prices, Lot Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800/60">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('field.entry_price')} *
            </label>
            <input
              type="number"
              step="any"
              value={formData.entry}
              onChange={(e) => setFormData({ ...formData, entry: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('field.sl')} *
            </label>
            <input
              type="number"
              step="any"
              value={formData.sl}
              onChange={(e) => setFormData({ ...formData, sl: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('field.tp')} *
            </label>
            <input
              type="number"
              step="any"
              value={formData.tp}
              onChange={(e) => setFormData({ ...formData, tp: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('field.lots')} *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.lot}
              onChange={(e) => setFormData({ ...formData, lot: parseFloat(e.target.value) || 1 })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
          </div>
        </div>

        {/* Hybrid Auto Fields with Dollar and Percentage Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-3 border-t border-slate-800/60 bg-slate-950/40 p-3.5 rounded-xl">
          <HybridNumberField
            label={t('field.risk_dollars')}
            field={formData.risk}
            prefix="$"
            onChange={(val) => setFormData({ ...formData, risk: val })}
          />
          <HybridNumberField
            label={t('field.risk_percent')}
            field={formData.riskPercent}
            suffix="%"
            onChange={(val) => setFormData({ ...formData, riskPercent: val })}
          />
          <HybridNumberField
            label={t('field.reward_dollars')}
            field={formData.reward}
            prefix="$"
            onChange={(val) => setFormData({ ...formData, reward: val })}
          />
          <HybridNumberField
            label={t('field.reward_percent')}
            field={formData.rewardPercent}
            suffix="%"
            onChange={(val) => setFormData({ ...formData, rewardPercent: val })}
          />
          <HybridNumberField
            label={t('field.rr')}
            field={formData.rr}
            prefix="1:"
            onChange={(val) => setFormData({ ...formData, rr: val })}
          />
          <HybridNumberField
            label={t('field.net_pnl')}
            field={formData.pnl}
            prefix="$"
            onChange={(val) => setFormData({ ...formData, pnl: val })}
          />
          <HybridNumberField
            label={t('field.pnl_percent')}
            field={formData.pnlPercent}
            suffix="%"
            onChange={(val) => setFormData({ ...formData, pnlPercent: val })}
          />
        </div>
      </div>

      {/* SECTION B — Market Analysis */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('sectionB')}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('section.market')}
              </h3>
            </div>
          </div>
          {collapsedSections.sectionB ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
        </button>

        {!collapsedSections.sectionB && (
          <div className="p-6 pt-0 space-y-4 border-t border-slate-800/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              <DynamicSelect
                field="marketStructure"
                label={t('field.market_structure')}
                value={formData.marketStructure}
                onChange={(val) => setFormData({ ...formData, marketStructure: val })}
              />

              <DynamicSelect
                field="htfDirection"
                label={t('field.htf_bias')}
                value={formData.htfDirection}
                onChange={(val) => setFormData({ ...formData, htfDirection: val })}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t('field.sr_zone')}
                </label>
                <input
                  type="text"
                  value={formData.srZone}
                  onChange={(e) => setFormData({ ...formData, srZone: e.target.value })}
                  placeholder="e.g. 4H Orderblock, Daily S/R"
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <DynamicSelect
                field="entryLocation"
                label={t('field.entry_location')}
                value={formData.entryLocation}
                onChange={(val) => setFormData({ ...formData, entryLocation: val })}
              />

              <DynamicSelect
                field="liquidityTaken"
                label={t('field.liquidity_sweep')}
                value={formData.liquidityTaken}
                onChange={(val) => setFormData({ ...formData, liquidityTaken: val })}
              />

              <DynamicSelect
                field="volumeCondition"
                label={t('field.volume_condition')}
                value={formData.volumeCondition}
                onChange={(val) => setFormData({ ...formData, volumeCondition: val })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Technical Observations & Bias Notes
              </label>
              <textarea
                rows={2}
                value={formData.biasNotes}
                onChange={(e) => setFormData({ ...formData, biasNotes: e.target.value })}
                placeholder="Key technical narrative before entering..."
                className="w-full p-3 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION C — Entry Confirmations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('sectionC')}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('section.confirmations')}
              </h3>
            </div>
          </div>
          {collapsedSections.sectionC ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
        </button>

        {!collapsedSections.sectionC && (
          <div className="p-6 pt-0 space-y-4 border-t border-slate-800/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <DynamicSelect
                field="confirmations"
                label={t('field.confirmations')}
                multiple
                value={formData.confirmations}
                onChange={(val) => setFormData({ ...formData, confirmations: val })}
              />

              <DynamicSelect
                field="followedStrategy"
                label="Followed Rules & Model?"
                value={formData.followedStrategy}
                onChange={(val) => setFormData({ ...formData, followedStrategy: val })}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION D — Outcome & Execution Quality */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('sectionD')}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('section.results')}
              </h3>
            </div>
          </div>
          {collapsedSections.sectionD ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
        </button>

        {!collapsedSections.sectionD && (
          <div className="p-6 pt-0 space-y-4 border-t border-slate-800/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <DynamicSelect
                field="result"
                label={t('field.result')}
                value={formData.result}
                onChange={(val) => setFormData({ ...formData, result: val })}
              />

              <DynamicSelect
                field="executionQuality"
                label={t('field.execution_quality')}
                value={formData.executionQuality}
                onChange={(val) => setFormData({ ...formData, executionQuality: val })}
              />

              <DynamicSelect
                field="exitReason"
                label={t('field.exit_reason')}
                value={formData.exitReason}
                onChange={(val) => setFormData({ ...formData, exitReason: val })}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Exit Price
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.exitPrice || ''}
                  onChange={(e) => setFormData({ ...formData, exitPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="Exit price"
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION E — Trader Psychology */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('sectionE')}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-pink-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('section.psychology')}
              </h3>
            </div>
          </div>
          {collapsedSections.sectionE ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
        </button>

        {!collapsedSections.sectionE && (
          <div className="p-6 pt-0 space-y-4 border-t border-slate-800/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              <DynamicSelect
                field="patient"
                label="Was Patient?"
                value={formData.psychology?.patient}
                onChange={(val) => setFormData({
                  ...formData,
                  psychology: { ...formData.psychology, patient: val },
                })}
              />

              <DynamicSelect
                field="followedPlan"
                label="Followed Plan?"
                value={formData.psychology?.followedPlan}
                onChange={(val) => setFormData({
                  ...formData,
                  psychology: { ...formData.psychology, followedPlan: val },
                })}
              />

              <DynamicSelect
                field="fomo"
                label="Felt FOMO?"
                value={formData.psychology?.fomo}
                onChange={(val) => setFormData({
                  ...formData,
                  psychology: { ...formData.psychology, fomo: val },
                })}
              />

              <DynamicSelect
                field="movedSL"
                label="Moved Stop Loss?"
                value={formData.psychology?.movedSL}
                onChange={(val) => setFormData({
                  ...formData,
                  psychology: { ...formData.psychology, movedSL: val },
                })}
              />

              <DynamicSelect
                field="revenge"
                label="Revenge Trading?"
                value={formData.psychology?.revenge}
                onChange={(val) => setFormData({
                  ...formData,
                  psychology: { ...formData.psychology, revenge: val },
                })}
              />

              <DynamicSelect
                field="emotion"
                label={t('field.emotion')}
                value={formData.psychology?.emotion}
                onChange={(val) => setFormData({
                  ...formData,
                  psychology: { ...formData.psychology, emotion: val },
                })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t('field.rating')} (1 - 5)
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      psychology: { ...formData.psychology, rating: star },
                    })}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      formData.psychology?.rating >= star
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 hover:text-white'
                    }`}
                  >
                    {star}★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t('field.lesson')}
              </label>
              <textarea
                rows={2}
                value={formData.lesson}
                onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
                placeholder="What did this trade teach you for the future?"
                className="w-full p-3 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION F — Media, Screenshots & Notes */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('sectionF')}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('section.media')}
              </h3>
            </div>
          </div>
          {collapsedSections.sectionF ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
        </button>

        {!collapsedSections.sectionF && (
          <div className="p-6 pt-0 space-y-5 border-t border-slate-800/60">
            <div className="pt-4">
              <ScreenshotUploader
                screenshots={formData.screenshots}
                onChange={(shots) => setFormData({ ...formData, screenshots: shots })}
                onFileUpload={(files) => setScreenshotFiles((prev) => ({ ...prev, ...files }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t('field.notes')}
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="General notes, news events, broker spreads..."
                  className="w-full p-3 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <DynamicSelect
                field="tags"
                label={t('field.tags')}
                multiple
                value={formData.tags}
                onChange={(val) => setFormData({ ...formData, tags: val })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          {t('btn.cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-blue-500/25 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? 'Saving...' : isEditing ? t('btn.update_trade') : t('btn.record_trade')}</span>
        </button>
      </div>
    </form>
  );
};
