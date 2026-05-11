import apiClient from './axios';

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export interface LoginResponse {
  adminId: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    // The exact structure might vary based on the backend, 
    // but typically it's an object with token and user.
    // If the backend just returns the token, we handle it accordingly.
    const response = await apiClient.post<{ data: LoginResponse }>('/admins/login', payload);
    // Depending on standard axios response mapping, it returns response.data already due to interceptor.
    return response as unknown as LoginResponse; 
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<any> => {
    const response = await apiClient.put('/admin/profile/password', payload);
    return response;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', { refreshToken });
    return response as unknown as LoginResponse;
  },
};
