// import React from 'react';
import { cn } from '@/utils/cn';

import type { OrderStats } from '@/core/api/analytics';

interface OrdersFunnelProps {
  orderStats: OrderStats;
}

export function OrdersFunnel({ orderStats }: OrdersFunnelProps) {
  const { total, byStatus } = orderStats;

  // Assuming `byStatus` contains stages like Confirmed, Preparing, ReadyForPickup, Cancelled, Delivered (though not in the current mock output). 
  // We map the funnel accordingly.
  const confirmed = byStatus['Confirmed'] || 0;
  const preparing = byStatus['Preparing'] || 0;
  const ready = byStatus['ReadyForPickup'] || 0;
  const cancelled = byStatus['Cancelled'] || 0;
  
  // Safe calculation to avoid division by zero
  const getPercent = (count: number) => total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;

  const funnelData = [
    { stage: 'Total Orders', count: total, percent: 100, color: 'bg-indigo-400' },
    { stage: 'Confirmed', count: confirmed, percent: getPercent(confirmed), color: 'bg-green-600' },
    { stage: 'Preparing', count: preparing, percent: getPercent(preparing), color: 'bg-orange-500' },
    { stage: 'Ready For Pickup', count: ready, percent: getPercent(ready), color: 'bg-emerald-500' },
    { stage: 'Cancelled', count: cancelled, percent: getPercent(cancelled), color: 'bg-red-500' },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">Orders Funnel</h3>
      <div className="space-y-4">
        {funnelData.map((item, idx) => (
          <div key={idx} className="relative">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-gray-700">{item.stage}</span>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
                <span className="text-xs text-gray-400 w-8 text-right">{item.percent}%</span>
              </div>
            </div>
            <div className="h-6 w-full bg-gray-100 rounded-md overflow-hidden relative">
              <div 
                className={cn("h-full transition-all duration-500 rounded-md flex items-center px-2", item.color)}
                style={{ width: `${item.percent}%` }}
              >
                <span className="text-[10px] font-bold text-white/90">{item.percent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
