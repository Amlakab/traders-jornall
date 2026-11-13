'use client';

import React, { useState } from 'react';
import { Upload, X, Eye, Columns, ZoomIn, ZoomOut } from 'lucide-react';
import { TradeScreenshots } from '@/types';

interface ScreenshotUploaderProps {
  screenshots: TradeScreenshots;
  onChange: (val: TradeScreenshots) => void;
  onFileUpload?: (files: { before?: File; atEntry?: File; after?: File; extras?: File[] }) => void;
  readOnly?: boolean;
}

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  screenshots,
  onChange,
  onFileUpload,
  readOnly = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const slots = [
    { key: 'before' as const, label: 'Before Entry' },
    { key: 'atEntry' as const, label: 'At Entry' },
    { key: 'after' as const, label: 'After / Exit' },
  ];

  const handleSlotUpload = (key: 'before' | 'atEntry' | 'after', file: File) => {
    // Generate object URL for immediate local preview
    const previewUrl = URL.createObjectURL(file);
    onChange({
      ...screenshots,
      [key]: previewUrl,
    });
    if (onFileUpload) {
      onFileUpload({ [key]: file });
    }
  };

  const handleExtrasUpload = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    onChange({
      ...screenshots,
      extras: [...(screenshots.extras || []), ...newUrls],
    });
    if (onFileUpload) {
      onFileUpload({ extras: newFiles });
    }
  };

  const removeSlot = (key: 'before' | 'atEntry' | 'after') => {
    onChange({
      ...screenshots,
      [key]: undefined,
    });
  };

  const removeExtra = (index: number) => {
    const updated = [...(screenshots.extras || [])];
    updated.splice(index, 1);
    onChange({
      ...screenshots,
      extras: updated,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Trade Screenshots & Charts
        </label>
        {screenshots.before && screenshots.after && (
          <button
            type="button"
            onClick={() => setIsSideBySide(true)}
            className="px-2.5 py-1 text-xs font-medium text-blue-400 bg-blue-950/40 border border-blue-800 rounded-lg hover:bg-blue-900/40 flex items-center gap-1.5 transition-colors"
          >
            <Columns className="w-3.5 h-3.5" />
            Compare Before vs After
          </button>
        )}
      </div>

      {/* 3 Main Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {slots.map(({ key, label }) => {
          const imgUrl = screenshots[key];
          return (
            <div
              key={key}
              className="relative aspect-video rounded-xl border border-dashed border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all overflow-hidden flex flex-col items-center justify-center p-2 group"
            >
              {imgUrl ? (
                <>
                  <img
                    src={imgUrl}
                    alt={label}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg transition-colors"
                      title="Inspect Screenshot"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeSlot(key)}
                        className="p-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950/80 text-slate-300">
                    {label}
                  </span>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-slate-200">
                  <Upload className="w-6 h-6 mb-1 text-slate-500" />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-[10px] text-slate-600">PNG, JPG up to 5MB</span>
                  {!readOnly && (
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSlotUpload(key, file);
                      }}
                    />
                  )}
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Extras Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Additional Chart Confirmations ({screenshots.extras?.length || 0})</span>
          {!readOnly && (
            <label className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              Upload Extra Screenshots
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleExtrasUpload(e.target.files);
                }}
              />
            </label>
          )}
        </div>

        {screenshots.extras && screenshots.extras.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {screenshots.extras.map((url, idx) => (
              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 group">
                <img src={url} alt={`Extra ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setSelectedImage(url)}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-white rounded"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeExtra(idx)}
                      className="p-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Single Image Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setZoomLevel(1);
              }}
              className="p-2 bg-rose-900/80 hover:bg-rose-800 text-white rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-auto max-w-5xl max-h-[85vh] flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Inspected Screenshot"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-w-full max-h-[80vh] object-contain rounded-xl transition-transform"
            />
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Lightbox */}
      {isSideBySide && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Columns className="w-5 h-5 text-blue-400" />
              Side-by-Side Comparison: Before vs After
            </h3>
            <button
              type="button"
              onClick={() => setIsSideBySide(false)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
            <div className="flex flex-col bg-slate-900/60 rounded-xl p-3 border border-slate-800 overflow-hidden">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Before Entry</span>
              <div className="flex-1 overflow-auto flex items-center justify-center">
                <img
                  src={screenshots.before}
                  alt="Before Entry"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
            <div className="flex flex-col bg-slate-900/60 rounded-xl p-3 border border-slate-800 overflow-hidden">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">After / Result</span>
              <div className="flex-1 overflow-auto flex items-center justify-center">
                <img
                  src={screenshots.after}
                  alt="After / Result"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
