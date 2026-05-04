// import React from 'react';
import { cn } from '@/utils/cn';

const funnelData = [
  { stage: 'Orders Placed', count: 1523, percent: 100, color: 'bg-indigo-400' },
  { stage: 'Payment Success', count: 1487, percent: 97.6, color: 'bg-green-600' },
  { stage: 'Restaurant Confirmed', count: 1432, percent: 94, color: 'bg-orange-500' },
  { stage: 'Delivered', count: 1247, percent: 81.9, color: 'bg-emerald-500' },
  { stage: 'Cancelled', count: 185, percent: 12.2, color: 'bg-red-500' },
  { stage: 'Failed', count: 55, percent: 3.6, color: 'bg-gray-400' },
  { stage: 'Refunded', count: 36, percent: 2.4, color: 'bg-emerald-300' },
];

export function OrdersFunnel() {
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
