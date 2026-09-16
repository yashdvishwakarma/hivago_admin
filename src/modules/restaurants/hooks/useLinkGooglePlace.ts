import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { restaurantService } from '@/core/api/restaurants';

export function useLinkGooglePlace(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (googlePlaceId: string | null) =>
      restaurantService.linkGooglePlace(restaurantId, googlePlaceId),
    onSuccess: (_, googlePlaceId) => {
      if (googlePlaceId) {
        toast.success('Google Place linked successfully!');
      } else {
        toast.success('Google Place unlinked successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update Google Place link. Please try again.';
      toast.error(msg);
    },
  });
}
