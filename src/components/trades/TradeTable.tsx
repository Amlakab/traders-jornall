'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { Trade } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Download,
  Trash2,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  filterParams?: Record<string, any>;
  readOnly?: boolean;
}

export const TradeTable: React.FC<TradeTableProps> = ({
  trades,
  pagination,
  onPageChange,
  onRefresh,
  filterParams = {},
  readOnly = false,
}) => {
  const router = useRouter();
  const { success, error } = useToast();
  const { t } = useLanguage();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  // Column toggles (without status)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    tradeNumber: true,
    date: true,
    closedTime: true,
    pair: true,
    direction: true,
    strategyType: true,
    setupType: true,
    entry: true,
    rr: true,
    result: true,
    pnl: true,
    pnlPercent: true,
    riskPercent: true,
    screenshots: true,
  });

  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === trades.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(trades.map((t) => t._id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} trade(s)?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/trades/${id}`)));
      success(`Successfully deleted ${selectedIds.length} trade(s)`);
      setSelectedIds([]);
      onRefresh();
    } catch {
      error('Failed to perform bulk delete');
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      setExporting(true);
      const query = new URLSearchParams({
        ...filterParams,
        format,
      });

      const response = await api.get(`/trades/export?${query.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type:
          format === 'csv'
            ? 'text/csv'
            : format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `trades-export-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success(`Export complete (${format.toUpperCase()})`);
    } catch {
      error('Failed to download export file');
    } finally {
      setExporting(false);
    }
  };

  const getResultBadge = (result: string = 'Win') => {
    const res = result.toLowerCase();
    if (res === 'win') {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    }
    if (res === 'loss') {
      return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
    }
    if (res === 'break-even' || res === 'breakeven') {
      return 'bg-slate-800 text-slate-300 border-slate-700';
    }
    return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && !readOnly && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('btn.delete')} ({selectedIds.length})
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Columns
            </button>

            {showColumnMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-40 space-y-1">
                {Object.keys(visibleColumns).map((col) => (
                  <label
                    key={col}
                    className="flex items-center gap-2 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={() =>
                        setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }))
                      }
                      className="rounded border-slate-700 bg-slate-950 text-blue-600"
                    />
                    <span className="capitalize">{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Exports */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Export:</span>
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport('csv')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            {t('btn.export_csv')}
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport('xlsx')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            {t('btn.export_excel')}
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport('pdf')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            {t('btn.export_pdf')}
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 select-none">
              <tr>
                {!readOnly && (
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={trades.length > 0 && selectedIds.length === trades.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 bg-slate-950 text-blue-600"
                    />
                  </th>
                )}
                {visibleColumns.tradeNumber && <th className="px-4 py-3">#</th>}
                {visibleColumns.date && <th className="px-4 py-3">{t('field.date')}</th>}
                {visibleColumns.closedTime && <th className="px-4 py-3">{t('field.closed_time')}</th>}
                {visibleColumns.pair && <th className="px-4 py-3">{t('field.pair')}</th>}
                {visibleColumns.direction && <th className="px-4 py-3">{t('field.direction')}</th>}
                {visibleColumns.strategyType && <th className="px-4 py-3">{t('field.strategy_type')}</th>}
                {visibleColumns.setupType && <th className="px-4 py-3">{t('field.setup_type')}</th>}
                {visibleColumns.entry && <th className="px-4 py-3">Entry / SL / TP</th>}
                {visibleColumns.rr && <th className="px-4 py-3">R:R</th>}
                {visibleColumns.riskPercent && <th className="px-4 py-3">{t('field.risk_percent')}</th>}
                {visibleColumns.result && <th className="px-4 py-3">{t('field.result')}</th>}
                {visibleColumns.pnl && <th className="px-4 py-3">{t('field.net_pnl')}</th>}
                {visibleColumns.pnlPercent && <th className="px-4 py-3">{t('field.pnl_percent')}</th>}
                {visibleColumns.screenshots && <th className="px-4 py-3 text-center">Charts</th>}
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-12 text-center text-slate-500">
                    No trades match the current filter selection.
                  </td>
                </tr>
              ) : (
                trades.map((t) => {
                  const isSelected = selectedIds.includes(t._id);
                  const pnlVal = t.pnl?.value ?? 0;
                  const pnlPct = t.pnlPercent?.value ?? 0;
                  const riskPct = t.riskPercent?.value ?? 0;
                  const hasCharts = !!(t.screenshots?.before || t.screenshots?.atEntry || t.screenshots?.after || t.screenshots?.extras?.length);

                  return (
                    <tr
                      key={t._id}
                      onClick={() => router.push(`/trades/${t._id}`)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      {!readOnly && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelectOne(t._id, e as any)}
                            className="rounded border-slate-700 bg-slate-950 text-blue-600"
                          />
                        </td>
                      )}
                      {visibleColumns.tradeNumber && (
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">
                          #{t.tradeNumber.toString().padStart(3, '0')}
                        </td>
                      )}
                      {visibleColumns.date && (
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                          {formatDate(t.date)}
                        </td>
                      )}
                      {visibleColumns.closedTime && (
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                          {t.closedTime ? new Date(t.closedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                      )}
                      {visibleColumns.pair && (
                        <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                          {t.pair}
                        </td>
                      )}
                      {visibleColumns.direction && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              t.direction?.toLowerCase() === 'buy'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {t.direction}
                          </span>
                        </td>
                      )}
                      {visibleColumns.strategyType && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/50">
                            {t.strategyType || 'Price Action'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.setupType && (
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-amber-400">
                          {t.setupType || 'A'}
                        </td>
                      )}
                      {visibleColumns.entry && (
                        <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">
                          <span className="text-slate-200">{t.entry}</span>
                          <span className="text-slate-600"> / </span>
                          <span className="text-rose-400">{t.sl}</span>
                          <span className="text-slate-600"> / </span>
                          <span className="text-emerald-400">{t.tp}</span>
                        </td>
                      )}
                      {visibleColumns.rr && (
                        <td className="px-4 py-3 font-mono font-semibold text-slate-300">
                          1:{t.rr?.value ?? 0}
                        </td>
                      )}
                      {visibleColumns.riskPercent && (
                        <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                          {riskPct}%
                        </td>
                      )}
                      {visibleColumns.result && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getResultBadge(
                              t.result
                            )}`}
                          >
                            {t.result || 'Win'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.pnl && (
                        <td
                          className={`px-4 py-3 font-mono font-bold whitespace-nowrap ${
                            pnlVal > 0
                              ? 'text-emerald-400'
                              : pnlVal < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {formatCurrency(pnlVal)}
                        </td>
                      )}
                      {visibleColumns.pnlPercent && (
                        <td
                          className={`px-4 py-3 font-mono font-bold whitespace-nowrap ${
                            pnlPct > 0
                              ? 'text-emerald-400'
                              : pnlPct < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {pnlPct > 0 ? `+${pnlPct}%` : `${pnlPct}%`}
                        </td>
                      )}
                      {visibleColumns.screenshots && (
                        <td className="px-4 py-3 text-center">
                          {hasCharts ? (
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title="Has charts attached" />
                          ) : (
                            <span className="inline-block w-2 h-2 rounded-full bg-slate-700" title="No charts" />
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/trades/${t._id}`);
                          }}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {trades.length} of {pagination.total} trades (Page {pagination.page} of {pagination.totalPages || 1})
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-300">{pagination.page}</span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
