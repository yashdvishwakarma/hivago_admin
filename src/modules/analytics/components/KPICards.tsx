import { IndianRupee, TrendingUp, Bike, Receipt } from 'lucide-react';
import { cn } from '@/utils/cn';

import type { AdminStats, RevenueStats } from '@/core/api/analytics';

interface KPICardsProps {
  adminStats: AdminStats;
  revenueStats: RevenueStats;
}

export function KPICards({ adminStats, revenueStats }: KPICardsProps) {
  // Use todayRevenue as GMV, lifetimeCommission or todayCommission for Platform Revenue, etc.
  const kpiData = [
    {
      title: 'GMV (Today)',
      value: `₹${revenueStats.todayRevenue.toLocaleString()}`,
      change: '+12.5%', // Mocking change for now as API doesn't provide previous period
      isPositive: true,
      icon: IndianRupee,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50',
    },
    {
      title: 'Platform Revenue (Total)',
      value: `₹${revenueStats.lifetimeRevenue.toLocaleString()}`,
      change: '+14.1%',
      isPositive: true,
      icon: TrendingUp,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50',
    },
    {
      title: 'Pending Payouts',
      value: `₹${revenueStats.unpaidPayoutAmount.toLocaleString()}`,
      change: 'Active',
      isPositive: true,
      icon: Receipt,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Total Refunds Issued',
      value: `₹0`, // API doesn't expose refunds explicitly
      change: '-5.2%',
      isPositive: false,
      icon: Receipt,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
    },
    {
      title: 'Total Active Orders',
      value: `${adminStats.activeOrders.toLocaleString()}`,
      change: `Out of ${adminStats.todayOrders} today`,
      isPositive: true,
      icon: Bike,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50',
    },
  ];
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
