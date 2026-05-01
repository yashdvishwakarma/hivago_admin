import apiClient from './axios';

export interface AdminStats {
  activeOrders: number;
  ordersToday: number;
  ridersOnline: number;
  pendingKyc: number;
  activeRestaurants: number;
}

export interface EscalatedOrder {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO string
  totalAmount: number;
  delayMinutes: number;
  status: string;
  tags: string[];
  customerName: string;
  totalItems: number;
  restaurantName: string;
  riderName?: string;
}

export const dashboardService = {
  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response;
  },

  getAlerts: async (limit = 50): Promise<any[]> => {
    const response = await apiClient.get('/admin/alerts', {
      params: { limit },
    });
    return (response as any) || [];
  },

  getLiveOrders: async (limit = 200): Promise<any[]> => {
    const response = await apiClient.get('/admin/orders/live', {
      params: { limit },
    });
    return (response as any) || [];
  },
};
