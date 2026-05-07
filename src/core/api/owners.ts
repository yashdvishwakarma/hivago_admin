import apiClient from './axios';

export interface AdminOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  panNumber?: string;
  gstNumber?: string;
  isActive: boolean;
  outletCount: number;
  createdAt: string;
}

export interface OwnersResponse {
  owners: AdminOwner[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateOwnerPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  panNumber?: string;
  gstNumber?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankAccountName?: string;
}

export const ownerService = {
  getOwners: async (params?: { isActive?: boolean; search?: string; page?: number; pageSize?: number }): Promise<OwnersResponse> => {
    const response = await apiClient.get('/admins/owners', { params });
    return response as unknown as OwnersResponse;
  },
  
  createOwner: async (payload: CreateOwnerPayload): Promise<any> => {
    const response = await apiClient.post('/admin/owners', payload);
    return response;
  }
};
