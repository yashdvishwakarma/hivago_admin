import apiClient from './axios';

export interface AdminRider {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber?: string;
  kycStatus: 'Pending' | 'Verified' | 'Rejected';
  isActive: boolean;
  isOnline: boolean;
}

export interface CreateRiderPayload {
  phone: string;
  name: string;
  vehicleType: string;
  vehicleNumber: string;
}

export interface RidersResponse {
  riders: AdminRider[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface KycDocument {
  id: string;
  documentType: string;
  publicUrl: string;
  isVerified: boolean;
  uploadedAt: string;
  verifiedAt: string | null;
}

export const riderService = {
  getRiders: async (params?: {
    search?: string;
    isOnline?: boolean;
    kycStatus?: string;
    page?: number;
    pageSize?: number;
  }): Promise<RidersResponse> => {
    const response = await apiClient.get('/admins/riders', { params });
    return response as unknown as RidersResponse;
  },

  getKycDocuments: async (riderId: string): Promise<KycDocument[]> => {
    const response = await apiClient.get(`/riders/${riderId}/kyc-documents`);
    const raw = response as unknown;
    // API may return a raw array or wrap it: { documents: [] } / { data: [] }
    if (Array.isArray(raw)) return raw;
    if (Array.isArray((raw as any)?.documents)) return (raw as any).documents;
    if (Array.isArray((raw as any)?.data)) return (raw as any).data;
    return [];
  },

  // PATCH-only — only called when admin approves/rejects

  updateKycStatus: async (
    riderId: string,
    status: 'Verified' | 'Rejected'
  ): Promise<any> => {
    const response = await apiClient.patch(`/riders/${riderId}/kyc-status`, {
      newKycStatus: status,
    });
    return response;
  },

  createRider: async (payload: CreateRiderPayload): Promise<AdminRider> => {
    const response = await apiClient.post('/admins/riders', payload);
    return response as unknown as AdminRider;
  },
};
