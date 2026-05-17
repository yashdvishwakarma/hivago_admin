import apiClient from './axios';

export type PayoutStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'OnHold';

export interface PayoutSummary {
  pendingCount: number;
  totalPendingAmount: number;
  failedAmount: number;
  onHoldCount: number;
  onHoldAmount: number;
  platformProfit: number;
  nextAutoRunAtUtc: string;
  lastAutoRun: {
    atUtc: string;
    restaurantCount: number;
    totalAmount: number;
    totalPaid: number;
  } | null;
}

export interface RestaurantPayoutItem {
  payoutId: string;
  ownerId: string;
  displayName: string;
  orderCount: number;
  gmv: number;
  netPayable: number;
  status: PayoutStatus;
  statusNote: string | null;
  cycleStart: string;
  cycleEnd: string;
  createdAtUtc: string;
  paidAtUtc: string | null;
  transactionReference: string | null;
}

export interface RestaurantPayoutsPagedResult {
  items: RestaurantPayoutItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface PayoutFilter {
  from?: string;
  to?: string;
  ownerId?: string;
  status?: PayoutStatus | '';
  page?: number;
  pageSize?: number;
}

export const payoutService = {
  getRestaurantPayoutSummary: async (): Promise<PayoutSummary> => {
    const response = await apiClient.get('/admin/payouts/restaurant/summary');
    return response as any;
  },

  getRestaurantPayouts: async (params: PayoutFilter = {}): Promise<RestaurantPayoutsPagedResult> => {
    const response = await apiClient.get('/admin/payouts/restaurant', { params });
    return response as any;
  },

  payNow: async (payoutId: string): Promise<{ transactionReference: string; status: PayoutStatus }> => {
    const response = await apiClient.post(`/admin/payouts/restaurant/${payoutId}/pay-now`);
    return response as any;
  },

  holdPayout: async (payoutId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/admin/payouts/restaurant/${payoutId}/hold`, { reason });
  },

  releaseHold: async (payoutId: string): Promise<void> => {
    await apiClient.post(`/admin/payouts/restaurant/${payoutId}/release-hold`);
  },

  retryPayout: async (payoutId: string): Promise<void> => {
    await apiClient.post(`/admin/payouts/restaurant/${payoutId}/retry`);
  },
};
