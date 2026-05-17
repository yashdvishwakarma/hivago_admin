import apiClient from './axios';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Support' | 'CityAdmin' | 'SuperAdmin';
  isActive: boolean;
  createdAt: string;
}

export interface CreateAdminUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'Support' | 'CityAdmin';
}

export interface AdminUsersFilter {
  role?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const adminUserService = {
  getAdminUsers: async (params: AdminUsersFilter = {}): Promise<{ admins: AdminUser[], totalCount: number }> => {
    const response = await apiClient.get('/admin/users', { params });
    return response as any;
  },

  createAdminUser: async (data: CreateAdminUserRequest): Promise<AdminUser> => {
    const response = await apiClient.post('/admin/users', data);
    return response as any;
  },

  getProfile: async (): Promise<AdminUser> => {
    const response = await apiClient.get('/admin/profile');
    return response as any;
  },
};
