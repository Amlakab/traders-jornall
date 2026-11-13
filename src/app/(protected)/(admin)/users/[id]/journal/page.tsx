'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TradeTable } from '@/components/trades/TradeTable';
import { KpiCards } from '@/components/analytics/KpiCards';
import { User, Trade, AnalyticsKPIs } from '@/types';
import { ArrowLeft, Loader2, ShieldCheck, Mail, Calendar } from 'lucide-react';

export default function AdminTraderJournalViewPage() {
  const params = useParams();
  const router = useRouter();
  const { error } = useToast();
  const id = params?.id as string;

  const [trader, setTrader] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTraderJournal = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users/${id}/journal`);
      if (res.data.success) {
        setTrader(res.data.data.trader);
        setTrades(res.data.data.trades);
        setKpis(res.data.data.kpis);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch trader journal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTraderJournal();
  }, [id]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-500 font-mono">Loading trader journal view...</p>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="text-center py-16 text-slate-500">
        Trader profile not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/users')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">{trader.name}’s Journal</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Read-Only Mode
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                {trader.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                Joined {new Date(trader.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trader Analytics Overview */}
      {kpis && <KpiCards kpis={kpis} />}

      {/* Trades Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Trader Execution History ({trades.length} Records)
        </h3>
        <TradeTable
          trades={trades}
          pagination={{
            total: trades.length,
            page: 1,
            limit: 50,
            totalPages: 1,
          }}
          onPageChange={() => {}}
          onRefresh={fetchTraderJournal}
          readOnly={true}
        />
      </div>
    </div>
  );
}
