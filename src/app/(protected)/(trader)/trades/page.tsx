'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TradeTable } from '@/components/trades/TradeTable';
import { AdvancedFilterPanel, FilterState } from '@/components/trades/AdvancedFilterPanel';
import { Trade } from '@/types';
import { PlusCircle, Search, Loader2 } from 'lucide-react';

export default function TradesLogPage() {
  const router = useRouter();

  const [filters, setFilters] = useState<FilterState>({
    timeScope: { scope: 'all' },
    hasScreenshots: 'all',
  });

  const [search, setSearch] = useState('');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      params.append('sortBy', 'date');
      params.append('sortOrder', 'desc');

      if (filters.timeScope.scope) params.append('scope', filters.timeScope.scope);
      if (filters.timeScope.date) params.append('date', filters.timeScope.date);
      if (filters.timeScope.week) params.append('week', filters.timeScope.week);
      if (filters.timeScope.month) params.append('month', filters.timeScope.month);
      if (filters.timeScope.year) params.append('year', filters.timeScope.year);
      if (filters.timeScope.from) params.append('from', filters.timeScope.from);
      if (filters.timeScope.to) params.append('to', filters.timeScope.to);

      if (filters.pair) params.append('pair', filters.pair);
      if (filters.session) params.append('session', filters.session);
      if (filters.direction) params.append('direction', filters.direction);
      if (filters.strategyType) params.append('strategyType', filters.strategyType);
      if (filters.setupType) params.append('setupType', filters.setupType);
      if (filters.result) params.append('result', filters.result);
      if (filters.hasScreenshots && filters.hasScreenshots !== 'all') {
        params.append('hasScreenshots', filters.hasScreenshots);
      }
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/trades?${params.toString()}`);
      if (res.data.success) {
        setTrades(res.data.data.trades);
        setPagination((prev) => ({
          ...prev,
          total: res.data.data.pagination.total,
          totalPages: res.data.data.pagination.totalPages,
        }));
      }
    } catch (err) {
      console.error('Failed to load trades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [filters, pagination.page, search]);

  const handleResetFilters = () => {
    setFilters({
      timeScope: { scope: 'all' },
      hasScreenshots: 'all',
    });
    setSearch('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Trading Journal Log</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit, filter, and inspect your full trade history
          </p>
        </div>

        <button
          onClick={() => router.push('/trades/new')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record New Trade</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trades by asset, notes, narrative tags, or summary..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
        />
      </div>

      {/* Advanced Filters */}
      <AdvancedFilterPanel
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Trades Table */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500">Querying scoped trades...</p>
        </div>
      ) : (
        <TradeTable
          trades={trades}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onRefresh={fetchTrades}
          filterParams={{
            ...filters,
            search,
          }}
        />
      )}
    </div>
  );
}
