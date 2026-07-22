import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  expiresAt: string | null;
  rememberMe: boolean;
  login: (token: string, refreshToken: string, user: User, expiresAt?: string | null, rememberMe?: boolean) => void;
  logout: () => void;
  extendSession: (newExpiresAt: string, newToken?: string, newRefreshToken?: string) => void;
}

const STORAGE_NAME = 'hivago-auth-storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      expiresAt: null,
      rememberMe: true,
      login: (token, refreshToken, user, expiresAt = null, rememberMe = true) => 
        set({ token, refreshToken, user, isAuthenticated: true, expiresAt, rememberMe }),
      logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false, expiresAt: null }),
      extendSession: (newExpiresAt, newToken, newRefreshToken) => 
        set((state) => ({ 
          expiresAt: newExpiresAt, 
          token: newToken || state.token,
          refreshToken: newRefreshToken || state.refreshToken
        })),
    }),
    {
      name: STORAGE_NAME,
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          return localStorage.getItem(name) || sessionStorage.getItem(name);
        },
        setItem: (name, value) => {
          try {
            const parsed = JSON.parse(value);
            const rememberMe = parsed.state?.rememberMe;
            if (rememberMe) {
              localStorage.setItem(name, value);
              sessionStorage.removeItem(name);
            } else {
              sessionStorage.setItem(name, value);
              localStorage.removeItem(name);
            }
          } catch (e) {
            sessionStorage.setItem(name, value);
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        },
      })),
    }
  )
);
