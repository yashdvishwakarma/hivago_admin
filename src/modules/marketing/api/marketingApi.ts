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
    const response = await apiClient.get<PaginatedResp<WaitlistEntry>>('/admin/waitlist', { params });
    return response as unknown as PaginatedResp<WaitlistEntry>;
  },

  getRestaurantLeads: async (params: { search?: string; city?: string; dailyOrders?: number; page: number; pageSize: number }): Promise<PaginatedResp<RestaurantLeadEntry>> => {
    const response = await apiClient.get<PaginatedResp<RestaurantLeadEntry>>('/admin/restaurant-leads', { params });
    return response as unknown as PaginatedResp<RestaurantLeadEntry>;
  },

  exportWaitlist: () => apiClient.get('/admin/waitlist/export', { responseType: 'blob' }),

  exportRestaurantLeads: () => apiClient.get('/admin/restaurant-leads/export', { responseType: 'blob' }),
};
