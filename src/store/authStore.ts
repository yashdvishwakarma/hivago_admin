import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  expiresAt: string | null;
  login: (token: string, user: User, expiresAt?: string | null) => void;
  logout: () => void;
  extendSession: (newExpiresAt: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      expiresAt: null,
      login: (token, user, expiresAt = null) => set({ token, user, isAuthenticated: true, expiresAt }),
      logout: () => set({ token: null, user: null, isAuthenticated: false, expiresAt: null }),
      extendSession: (newExpiresAt) => set({ expiresAt: newExpiresAt }),
    }),
    {
      name: 'hivago-auth-storage',
    }
  )
);
