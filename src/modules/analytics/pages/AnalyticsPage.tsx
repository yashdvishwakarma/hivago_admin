import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { KPICards } from '../components/KPICards';
import { GMVChart } from '../components/GMVChart';
import { OrdersFunnel } from '../components/OrdersFunnel';
import { RevenueByRestaurantTable } from '../components/RevenueByRestaurantTable';
import { RiderPayoutSummary } from '../components/RiderPayoutSummary';
import { RefundsBreakdownTable } from '../components/RefundsBreakdownTable';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Money Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Financial insights and performance metrics</p>
        </div>
        <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>This Week</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* KPI Cards Row */}
      <KPICards />

      {/* GMV Chart */}
      <GMVChart />

      {/* Orders Funnel */}
      <OrdersFunnel />

      {/* Revenue Table */}
      <RevenueByRestaurantTable />

      {/* Rider Payout Summary */}
      <RiderPayoutSummary />

      {/* Refunds Breakdown Table */}
      <RefundsBreakdownTable />
    </div>
  );
}
