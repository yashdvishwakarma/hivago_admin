import apiClient from './axios';

export interface AdminStats {
  totalCustomers: number;
  totalRestaurants: number;
  totalRiders: number;
  onlineRiders: number;
  totalOrders: number;
  activeOrders: number;
  todayOrders: number;
  todayRevenue: number;
  todayCommission: number;
  lifetimeRevenue: number;
  lifetimeCommission: number;
  pendingPayoutLedgerEntries: number;
  unpaidPayoutAmount: number;
}

export interface OrderStats {
  total: number;
  active: number;
  today: number;
  last7Days: number;
  last30Days: number;
  pendingPayoutLedgerEntries: number;
  byStatus: Record<string, number>;
}

export interface RevenueStats {
  currency: string;
  todayRevenue: number;
  last7DaysRevenue: number;
  last30DaysRevenue: number;
  lifetimeRevenue: number;
  todayCommission: number;
  last7DaysCommission: number;
  last30DaysCommission: number;
  lifetimeCommission: number;
  pendingPayoutLedgerEntries: number;
  unpaidPayoutAmount: number;
}

export const analyticsService = {
  getAdminStats: async (): Promise<AdminStats> => {
    return apiClient.get('/admins/stats');
  },

  getOrderStats: async (): Promise<OrderStats> => {
    return apiClient.get('/admins/stats/orders');
  },

  getRevenueStats: async (): Promise<RevenueStats> => {
    return apiClient.get('/admins/stats/revenue');
  }
};
