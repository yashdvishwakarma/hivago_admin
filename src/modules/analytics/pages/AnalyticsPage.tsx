import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { analyticsService } from '@/core/api/analytics';
import { KPICards } from '../components/KPICards';
import { GMVChart } from '../components/GMVChart';
import { OrdersFunnel } from '../components/OrdersFunnel';
import { RevenueByRestaurantTable } from '../components/RevenueByRestaurantTable';
import { RiderPayoutSummary } from '../components/RiderPayoutSummary';
import { RefundsBreakdownTable } from '../components/RefundsBreakdownTable';

export default function AnalyticsPage() {
  const { data: adminStats, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ['adminStatsAnalytics'],
    queryFn: analyticsService.getAdminStats
  });

  const { data: orderStats, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orderStats'],
    queryFn: analyticsService.getOrderStats
  });

  const { data: revenueStats, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['revenueStats'],
    queryFn: analyticsService.getRevenueStats
  });

  if (isLoadingAdmin || isLoadingOrders || isLoadingRevenue) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
      {adminStats && revenueStats && (
        <KPICards adminStats={adminStats} revenueStats={revenueStats} />
      )}

      {/* GMV Chart */}
      {revenueStats && (
        <GMVChart revenueStats={revenueStats} />
      )}

      {/* Orders Funnel */}
      {orderStats && (
        <OrdersFunnel orderStats={orderStats} />
      )}

      {/* Revenue Table */}
      <RevenueByRestaurantTable />

      {/* Rider Payout Summary */}
      <RiderPayoutSummary />

      {/* Refunds Breakdown Table */}
      <RefundsBreakdownTable />
    </div>
  );
}
