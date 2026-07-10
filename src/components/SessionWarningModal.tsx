import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/core/api/auth';
import toast from 'react-hot-toast';

export function SessionWarningModal() {
  const { isAuthenticated, refreshToken, expiresAt, logout, extendSession } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Constants
  const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiry

  const handleStaySignedIn = useCallback(async () => {
    if (!refreshToken || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log('[Auth] Auto-attempting to refresh session...');
      const response = await authService.refresh(refreshToken);
      extendSession(response.accessTokenExpiresAt, response.accessToken);
    } catch (error) {
      console.error('[Auth] Failed to refresh session:', error);
      toast.error('Failed to extend session. Please log in again.');
      logout();
      window.location.href = '/login';
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshToken, extendSession, logout, isRefreshing]);

  useEffect(() => {
    if (!isAuthenticated || !expiresAt) {
      return;
    }

    const checkExpiration = async () => {
      const expTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const remaining = expTime - now;

      if (remaining <= 0) {
        console.log('[Auth] Session expired, logging out...');
        logout();
        window.location.href = '/login';
      } else if (remaining <= WARNING_THRESHOLD_MS) {
        if (refreshToken) {
          handleStaySignedIn();
        }
      }
    };

    const interval = setInterval(checkExpiration, 10000); // Check every 10 seconds
    checkExpiration();

    return () => clearInterval(interval);
  }, [isAuthenticated, expiresAt, refreshToken, logout, handleStaySignedIn]);

  return null;
}
