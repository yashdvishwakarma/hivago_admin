import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

export const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import toast from 'react-hot-toast';

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Only auto-logout if it's a 401 and NOT from the login endpoint
    const isLoginRequest = error.config?.url?.includes('/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      toast.error('Session expired. Please log in again.');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // Extract API validation errors and format them into the message property
    // so all components automatically show them in their existing toast handlers.
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle standard ASP.NET validation dictionary: { "Email": ["Required"] }
      if (data.errors && typeof data.errors === 'object') {
        const errorMessages = Object.values(data.errors).flat().filter(Boolean);
        if (errorMessages.length > 0) {
          data.message = errorMessages.join(' • ');
        }
      } 
      // Handle custom details array: [{ field: "email", message: "Required" }]
      else if (Array.isArray(data.details) && data.details.length > 0) {
        const errorMessages = data.details.map((d: any) => d.message).filter(Boolean);
        if (errorMessages.length > 0) {
          data.message = errorMessages.join(' • ');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
