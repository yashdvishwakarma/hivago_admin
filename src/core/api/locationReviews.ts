import apiClient from './axios';

export const RestaurantLocationStatus = {
  Verified: 1,
  Drifted: 2,
  UnderReview: 3,
  Corrected: 4,
} as const;
export type RestaurantLocationStatusType = typeof RestaurantLocationStatus[keyof typeof RestaurantLocationStatus];

export const RestaurantLocationReviewStatus = {
  Pending: 1,
  Approved: 2,
  Rejected: 3,
  AutoApplied: 4,
} as const;
export type RestaurantLocationReviewStatusType = typeof RestaurantLocationReviewStatus[keyof typeof RestaurantLocationReviewStatus];

export interface LocationReviewItem {
  id: string;
  restaurantId: string;
  restaurantName?: string | null;
  currentLatitude: number;
  currentLongitude: number;
  suggestedLatitude: number;
  suggestedLongitude: number;
  averageDriftMeters: number;
  sampleSize: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'AutoApplied' | string;
  detectedAt: string;
}

export interface LocationReviewsResponse {
  items: LocationReviewItem[];
  page: number;
  pageSize: number;
  totalCount?: number;
}

export interface GetLocationReviewsParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

// Initial mock findings for local UI testing when backend branch is unmerged (404 fallback)
let mockFindingsStore: LocationReviewItem[] = [
  {
    id: 'rev-001-delhi-darbar',
    restaurantId: 'rest-delhi-darbar',
    restaurantName: 'Delhi Darbar',
    currentLatitude: 28.6142,
    currentLongitude: 77.2090,
    suggestedLatitude: 28.6098,
    suggestedLongitude: 77.2141,
    averageDriftMeters: 92.4,
    sampleSize: 10,
    status: 'Pending',
    detectedAt: '2026-09-08T13:36:13Z',
  },
  {
    id: 'rev-002-royal-tandoori',
    restaurantId: 'rest-royal-tandoori',
    restaurantName: 'Royal Tandoori & Sweets',
    currentLatitude: 28.6280,
    currentLongitude: 77.2185,
    suggestedLatitude: 28.6292,
    suggestedLongitude: 77.2199,
    averageDriftMeters: 145.8,
    sampleSize: 10,
    status: 'Pending',
    detectedAt: '2026-09-09T09:15:22Z',
  },
  {
    id: 'rev-003-deleted-rest',
    restaurantId: 'rest-deleted-999',
    restaurantName: null, // Tests deleted restaurant QA checklist item
    currentLatitude: 28.5355,
    currentLongitude: 77.3910,
    suggestedLatitude: 28.5368,
    suggestedLongitude: 77.3925,
    averageDriftMeters: 112.0,
    sampleSize: 10,
    status: 'Pending',
    detectedAt: '2026-09-09T11:40:00Z',
  },
  {
    id: 'rev-004-[#d72b1f]b',
    restaurantId: 'rest-[#d72b1f]b',
    restaurantName: 'Kebab Junction',
    currentLatitude: 28.7041,
    currentLongitude: 77.1025,
    suggestedLatitude: 28.7042,
    suggestedLongitude: 77.1026,
    averageDriftMeters: 81.2,
    sampleSize: 10,
    status: 'Approved',
    detectedAt: '2026-09-07T16:20:00Z',
  },
];

export const locationReviewsApi = {
  getReviews: async (params: GetLocationReviewsParams = {}): Promise<LocationReviewsResponse> => {
    const { status = 'Pending', page = 1, pageSize = 20 } = params;

    try {
      const response: any = await apiClient.get('/admins/restaurant-location-reviews', {
        params: { status, page, pageSize },
      });
      
      const data = response?.data || response;
      return {
        items: Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [],
        page: data?.page || page,
        pageSize: data?.pageSize || pageSize,
        totalCount: data?.totalCount ?? data?.total ?? (Array.isArray(data?.items) ? data.items.length : 0),
      };
    } catch (err: any) {
      // If backend endpoint is not yet reachable or returns 404 (unmerged backend branch), return local mock store for QA testing
      if (err?.response?.status === 404 || err?.code === 'ERR_NETWORK' || !err?.response) {
        let filtered = mockFindingsStore;
        if (status && status !== 'All') {
          filtered = mockFindingsStore.filter((item) => item.status === status);
        }
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);

        return {
          items,
          page,
          pageSize,
          totalCount: filtered.length,
        };
      }
      throw err;
    }
  },

  approveReview: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/admins/restaurant-location-reviews/${id}/approve`);
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.code === 'ERR_NETWORK' || !err?.response) {
        // Fallback for mock QA testing
        const item = mockFindingsStore.find((r) => r.id === id);
        if (item) {
          if (item.status !== 'Pending') {
            const customErr: any = new Error('Finding is no longer pending — already reviewed.');
            customErr.response = { status: 400, data: { message: 'Finding is no longer pending — already reviewed.' } };
            throw customErr;
          }
          item.status = 'Approved';
        }
        return;
      }
      throw err;
    }
  },

  rejectReview: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/admins/restaurant-location-reviews/${id}/reject`);
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.code === 'ERR_NETWORK' || !err?.response) {
        // Fallback for mock QA testing
        const item = mockFindingsStore.find((r) => r.id === id);
        if (item) {
          if (item.status !== 'Pending') {
            const customErr: any = new Error('Finding is no longer pending — already reviewed.');
            customErr.response = { status: 400, data: { message: 'Finding is no longer pending — already reviewed.' } };
            throw customErr;
          }
          item.status = 'Rejected';
        }
        return;
      }
      throw err;
    }
  },
};
