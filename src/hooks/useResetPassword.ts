import { useMutation } from '@tanstack/react-query';
import apiClient from '@/core/api/axios';

export interface ResetPasswordResponse {
  ownerId?: string;
  restaurantId?: string;
  temporaryPassword: string;
}

export function useResetPassword(entity: 'owners' | 'restaurants') {
  return useMutation<ResetPasswordResponse, any, string>({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/admin/${entity}/${id}/reset-password`);
      return ((response as any)?.data || response) as ResetPasswordResponse;
    },
  });
}
