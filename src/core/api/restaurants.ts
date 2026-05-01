import apiClient from './axios';

export interface AdminRestaurant {
  id: string;
  rstCode: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  isAcceptingOrders: boolean;
  commissionPercentage: number;
  commissionFlatFee: number;
  ownerId: string | null;
  totalOrderCount: number;
  operatingHoursSummary: string;
  createdAt: string;
  // Kept for modal compatibility
  addressLine?: string;
  avgPrepTimeMins?: number;
  cuisineTypes?: string[];
  isPureVeg?: boolean;
  isVeganFriendly?: boolean;
  hasJainOptions?: boolean;
  minOrderAmount?: number;
}

export interface RestaurantsResponse {
  restaurants: AdminRestaurant[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateRestaurantPayload {
  name: string;
  phone: string;
  email: string;
  password?: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  commissionPercentage?: number;
  avgPrepTimeMins?: number;
  cuisineTypes?: string[];
  isPureVeg?: boolean;
  isVeganFriendly?: boolean;
  hasJainOptions?: boolean;
  minOrderAmount?: number;
  fssaiNumber?: string;
}

export const restaurantService = {
  getRestaurants: async (params?: { isActive?: boolean; search?: string; page?: number; pageSize?: number }): Promise<RestaurantsResponse> => {
    const response = await apiClient.get('/admins/restaurants', { params });
    return response as unknown as RestaurantsResponse;
  },

  createRestaurant: async (payload: CreateRestaurantPayload): Promise<any> => {
    const response = await apiClient.post('/admins/restaurants', payload);
    return response;
  },
  
  updateRestaurant: async (id: string, payload: Partial<CreateRestaurantPayload>): Promise<any> => {
    const response = await apiClient.put(`/admins/restaurants/${id}`, payload);
    return response;
  },
  
  toggleStatus: async (restaurantId: string, activate: boolean): Promise<any> => {
    const response = await apiClient.put(`/admins/restaurants/${restaurantId}/status`, {
      isActive: activate
    });
    return response;
  }
};
