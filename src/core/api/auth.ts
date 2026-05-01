import apiClient from './axios';

export interface LoginPayload {
  email?: string;
  password?: string;
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
};
