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

export interface RiderPayoutItem {
  payoutId: string;
  riderId: string;
  displayName: string;
  deliveryCount: number;
  earnings: number;
  incentives: number;
  finalPayout: number;
  status: PayoutStatus;
  statusNote: string | null;
  cycleStart: string;
  cycleEnd: string;
  createdAtUtc: string;
  paidAtUtc: string | null;
  transactionReference: string | null;
}

export interface RiderPayoutsPagedResult {
  items: RiderPayoutItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface RiderPayoutSummary {
  pendingCount: number;
  totalPendingAmount: number;
  failedAmount: number;
  onHoldCount: number;
  onHoldAmount: number;
  subsidyImpact?: number;
  totalEarnings?: number;
  nextAutoRunAtUtc: string;
  lastAutoRun: {
    atUtc: string;
    riderCount: number;
    totalAmount: number;
    totalPaid: number;
  } | null;
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

  getRiderPayoutSummary: async (): Promise<RiderPayoutSummary> => {
    const response = await apiClient.get('/admin/payouts/rider/summary');
    return response as any;
  },

  getRiderPayouts: async (params: PayoutFilter = {}): Promise<RiderPayoutsPagedResult> => {
    const response = await apiClient.get('/admin/payouts/rider', { params });
    return response as any;
  },

  payRiderNow: async (payoutId: string): Promise<{ transactionReference: string; status: PayoutStatus }> => {
    const response = await apiClient.post(`/admin/payouts/rider/${payoutId}/pay-now`);
    return response as any;
  },

  holdRiderPayout: async (payoutId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/admin/payouts/rider/${payoutId}/hold`, { reason });
  },

  releaseRiderHold: async (payoutId: string): Promise<void> => {
    await apiClient.post(`/admin/payouts/rider/${payoutId}/release-hold`);
  },

  retryRiderPayout: async (payoutId: string): Promise<void> => {
    await apiClient.post(`/admin/payouts/rider/${payoutId}/retry`);
  },
};
