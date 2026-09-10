import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  locationReviewsApi, 
  type GetLocationReviewsParams, 
  type LocationReviewsResponse 
} from '@/core/api/locationReviews';

export const LOCATION_REVIEWS_QUERY_KEY = ['locationReviews'];
export const PENDING_LOCATION_REVIEWS_COUNT_KEY = ['locationReviews', 'pendingCount'];

export function useLocationReviews(params: GetLocationReviewsParams = {}) {
  return useQuery<LocationReviewsResponse>({
    queryKey: [...LOCATION_REVIEWS_QUERY_KEY, params],
    queryFn: () => locationReviewsApi.getReviews(params),
    staleTime: 10000,
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403/404
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function usePendingLocationReviewsCount() {
  return useQuery<number>({
    queryKey: PENDING_LOCATION_REVIEWS_COUNT_KEY,
    queryFn: async () => {
      try {
        const res = await locationReviewsApi.getReviews({ status: 'Pending', page: 1, pageSize: 1 });
        return res.totalCount ?? res.items.length;
      } catch (err) {
        return 0;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => locationReviewsApi.approveReview(id),
    onSuccess: () => {
      toast.success('Suggested pin approved and updated successfully');
      queryClient.invalidateQueries({ queryKey: LOCATION_REVIEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;

      if (status === 400) {
        toast.error(message || 'Finding is no longer pending — already reviewed.');
      } else if (status === 404) {
        toast.error(message || 'Finding or restaurant not found.');
      } else if (status === 401 || status === 403) {
        toast.error('Unauthorized action.');
      } else {
        toast.error(message || 'Failed to approve pin location.');
      }
      queryClient.invalidateQueries({ queryKey: LOCATION_REVIEWS_QUERY_KEY });
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => locationReviewsApi.rejectReview(id),
    onSuccess: () => {
      toast.success('Finding rejected — restaurant pin remains unchanged.');
      queryClient.invalidateQueries({ queryKey: LOCATION_REVIEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;

      if (status === 400) {
        toast.error(message || 'Finding is no longer pending — already reviewed.');
      } else if (status === 404) {
        toast.error(message || 'Finding or restaurant not found.');
      } else if (status === 401 || status === 403) {
        toast.error('Unauthorized action.');
      } else {
        toast.error(message || 'Failed to reject finding.');
      }
      queryClient.invalidateQueries({ queryKey: LOCATION_REVIEWS_QUERY_KEY });
    },
  });
}
