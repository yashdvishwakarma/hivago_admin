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
  acceptsPickup: boolean;
  // Kept for modal compatibility
  addressLine?: string;
  avgPrepTimeMins?: number;
  cuisineTypes?: string[];
  isPureVeg?: boolean;
  isVeganFriendly?: boolean;
  hasJainOptions?: boolean;
  minOrderAmount?: number;
  fssaiNumber?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string | null;
  googlePlaceName?: string | null;
  googlePlaceAddress?: string | null;
}

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  isLinked?: boolean;
  linkedRestaurantId?: string | null;
  linkedRestaurantName?: string | null;
}

export interface SearchPlacesResponse {
  suggestions: PlaceSuggestion[];
}

export interface RestaurantsResponse {
  restaurants: AdminRestaurant[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateRestaurantPayload {
  ownerId: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  addressLine: string;
  latitude: number;
  longitude: number;
}

export const restaurantService = {
  getRestaurants: async (params?: { isActive?: boolean; search?: string; page?: number; pageSize?: number }): Promise<RestaurantsResponse> => {
    const response = await apiClient.get('/admins/restaurants', { params });
    return response as unknown as RestaurantsResponse;
  },
  
  getRestaurantById: async (id: string): Promise<AdminRestaurant> => {
    const response = await apiClient.get(`/admins/restaurants/${id}`);
    return response as unknown as AdminRestaurant;
  },

  createRestaurant: async (payload: CreateRestaurantPayload): Promise<any> => {
    const response = await apiClient.post('/admin/restaurants', payload);
    return response;
  },
  
  updateRestaurant: async (id: string, payload: Partial<AdminRestaurant> & { fssaiNumber?: string; googlePlaceId?: string | null }): Promise<any> => {
    const response = await apiClient.put(`/admins/restaurants/${id}`, payload);
    return response;
  },
  
  toggleStatus: async (restaurantId: string, activate: boolean): Promise<any> => {
    const response = await apiClient.put(`/admins/restaurants/${restaurantId}/status`, {
      isActive: activate
    });
    return response;
  },

  searchGooglePlaces: async (query: string): Promise<SearchPlacesResponse> => {
    const response = await apiClient.get('/admins/places/search', { params: { query } });
    return response as unknown as SearchPlacesResponse;
  },

  linkGooglePlace: async (restaurantId: string, googlePlaceId: string | null): Promise<any> => {
    const response = await apiClient.put(`/admins/restaurants/${restaurantId}`, { googlePlaceId });
    return response;
  }
};
