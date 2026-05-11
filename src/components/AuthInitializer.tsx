import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/core/api/auth';
import toast from 'react-hot-toast';

export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { token, refreshToken, expiresAt, login, logout, extendSession, isAuthenticated } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isAuthenticated || !refreshToken) {
        setIsInitializing(false);
        return;
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const buffer = 5 * 60 * 1000;
      const expiryTime = expiresAt ? new Date(expiresAt).getTime() : 0;
      const now = Date.now();

      if (expiryTime - now < buffer) {
        console.log('[Auth] Token expired or expiring soon, attempting refresh...');
        try {
          const response = await authService.refresh(refreshToken);
          extendSession(response.accessTokenExpiresAt, response.accessToken);
          console.log('[Auth] Token refreshed successfully on mount.');
        } catch (error) {
          console.error('[Auth] Failed to refresh token on mount:', error);
          // If refresh fails, we might want to logout, but maybe only if it's a 401
          // For now, let's just log it. The interceptor will handle 401s on subsequent requests.
        }
      }

      setIsInitializing(false);
    };

    initializeAuth();
  }, [isAuthenticated, refreshToken, expiresAt, extendSession]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Restoring session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
