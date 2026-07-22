import apiClient from '@/core/api/axios';

export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string | null;
  createdAt: string;
};

export type RestaurantLeadEntry = {
  id: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  city: string;
  dailyOrders: number;
  source: string | null;
  createdAt: string;
};

export type PaginatedResp<T> = {
  entries: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export const marketingApi = {
  getWaitlist: async (params: { search?: string; page: number; pageSize: number }): Promise<PaginatedResp<WaitlistEntry>> => {
    const response = await (apiClient.get('/admin/waitlist', { params }) as any);
    return {
      entries: response?.entries || response?.waitlist || response?.items || [],
      totalCount: response?.totalCount || 0,
      page: response?.page || 1,
      pageSize: response?.pageSize || 20
    };
  },

  getRestaurantLeads: async (params: { search?: string; city?: string; dailyOrders?: number; page: number; pageSize: number }): Promise<PaginatedResp<RestaurantLeadEntry>> => {
    const response = await (apiClient.get('/admin/restaurant-leads', { params }) as any);
    return {
      entries: response?.leads || response?.entries || response?.items || [],
      totalCount: response?.totalCount || 0,
      page: response?.page || 1,
      pageSize: response?.pageSize || 20
    };
  },

  exportWaitlist: () => apiClient.get('/admin/waitlist/export', { responseType: 'blob' }),
  exportRestaurantLeads: () => apiClient.get('/admin/restaurant-leads/export', { responseType: 'blob' }),
};
