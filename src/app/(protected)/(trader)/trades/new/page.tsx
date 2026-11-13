'use client';

import React from 'react';
import { TradeForm } from '@/components/trades/TradeForm';

export default function NewTradePage() {
  return (
    <div className="space-y-6">
      <TradeForm isEditing={false} />
    </div>
  );
}
