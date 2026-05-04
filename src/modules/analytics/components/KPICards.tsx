import React from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Bike, Receipt } from 'lucide-react';
import { cn } from '@/utils/cn';

const kpiData = [
  {
    title: 'GMV (Total Sales)',
    value: '₹4,54,027',
    change: '+12.5%',
    isPositive: true,
    icon: IndianRupee,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-50',
  },
  {
    title: 'Platform Revenue',
    value: '₹60,813',
    change: '+14.1%',
    isPositive: true,
    icon: TrendingUp,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-50',
  },
  {
    title: 'Delivery Fees Collected',
    value: '₹24,011',
    change: '+6.3%',
    isPositive: true,
    icon: Bike,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  {
    title: 'Total Refunds Issued',
    value: '₹12,450',
    change: '-5.2%',
    isPositive: false,
    icon: Receipt,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
  },
  {
    title: 'Net Revenue',
    value: '₹72,374',
    change: '+18.7%',
    isPositive: true,
    icon: TrendingUp,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
  },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpiData.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-4", kpi.iconBg)}>
              <Icon className={cn("h-4 w-4", kpi.iconColor)} />
            </div>
            <p className="text-sm text-gray-500 mb-1 font-medium">{kpi.title}</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{kpi.value}</h3>
            <div className="flex items-center text-xs mt-auto">
              <span className={cn("font-medium", kpi.isPositive ? "text-green-600" : "text-red-600")}>
                {kpi.isPositive ? '↑' : '↓'} {kpi.change}
              </span>
              <span className="text-gray-400 ml-1">vs previous</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
