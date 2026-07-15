import apiClient from './axios';

export type OrderStatus = 'all' | 'active' | 'escalated' | 'failed' | 'Preparing' | 'ReadyForPickup' | 'Cancelled' | 'Delivered' | 'Ready' | 'Preparing';

export interface Order {
  orderId: string;
  orderNumber: string;
  customerName: string;
  restaurantName: string;
  riderName: string | null;
  status: string;
  paymentStatus: string;
  fulfillmentType: string;
  isEscalated: boolean;
  itemCount: number;
  total: number;
  currency: string;
  createdAt: string; // ISO string
  latitude?: number;
  longitude?: number;
}

export interface OrderStats {
  all: number;
  active: number;
  escalated: number;
  failed: number;
}

export interface OrdersResponse {
  items: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
  counts: OrderStats;
}

export interface GetOrdersParams {
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export const ordersService = {
  getOrders: async (params: GetOrdersParams): Promise<OrdersResponse> => {
    const response = await apiClient.get('/admin/orders', { params });
    return response as unknown as OrdersResponse;
  },

  getOrderDetails: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/admin/orders/${orderId}`);
    return response as unknown as Order;
  },

  exportOrders: async (params: GetOrdersParams): Promise<Blob> => {
    const response = await apiClient.get('/admin/orders/export', {
      params,
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },

  getOrderStats: async (): Promise<OrderStats> => {
    const response = await apiClient.get('/admins/stats/orders');
    return response as unknown as OrderStats;
  },

  assignRider: async (orderId: string, riderId: string): Promise<any> => {
    const response = await apiClient.post(`/admin/orders/${orderId}/assign-rider`, { riderId });
    return response;
  },

  cancelOrder: async (orderId: string, payload: { reason: string; notes?: string; forceCancel?: boolean }): Promise<any> => {
    const response = await apiClient.post(`/admin/orders/${orderId}/cancel`, {
      reason: payload.reason,
      notes: payload.notes || '',
      forceCancel: payload.forceCancel ?? true,
    });
    return response;
  },

  refundOrder: async (orderId: string, payload?: { amount?: number }): Promise<any> => {
    const response = await apiClient.post(`/admin/orders/${orderId}/refund`, {
      amount: payload?.amount ?? null,
      forceRefund: true,
    });
    return response;
  },

  escalateOrder: async (orderId: string, reason?: string): Promise<any> => {
    const response = await apiClient.post(`/admin/orders/${orderId}/escalate`, { reason: reason || '' });
    return response;
  },
};
