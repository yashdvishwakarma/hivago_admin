import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { restaurantService, type SearchPlacesResponse } from '@/core/api/restaurants';
import { useDebounce } from '@/hooks/useDebounce';

export function useGooglePlaceSearch(rawQuery: string) {
  const debouncedQuery = useDebounce(rawQuery.trim(), 400);
  const isEnabled = debouncedQuery.length >= 2;

  const queryResult = useQuery<SearchPlacesResponse>({
    queryKey: ['google-places-search', debouncedQuery],
    queryFn: () => restaurantService.searchGooglePlaces(debouncedQuery),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  useEffect(() => {
    if (queryResult.error) {
      const errorObj = queryResult.error as any;
      const msg = errorObj?.response?.data?.message || errorObj?.message || 'Failed to search Google Places.';
      toast.error(msg);
    }
  }, [queryResult.error]);

  return {
    ...queryResult,
    debouncedQuery,
    isEnabled,
  };
}
