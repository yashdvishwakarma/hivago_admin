import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Clock, LogOut } from 'lucide-react';
import { authService } from '@/core/api/auth';
import toast from 'react-hot-toast';

export function SessionWarningModal() {
  const { isAuthenticated, refreshToken, expiresAt, rememberMe, logout, extendSession } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Constants
  const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiry

  const handleStaySignedIn = useCallback(async (isAuto = false) => {
    if (!refreshToken || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log(`[Auth] ${isAuto ? 'Auto-' : ''}Attempting to refresh session...`);
      const response = await authService.refresh(refreshToken);
      extendSession(response.accessTokenExpiresAt, response.accessToken);
      setShowWarning(false);
      if (!isAuto) {
        toast.success('Session extended successfully');
      }
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
      setShowWarning(false);
      return;
    }

    const checkExpiration = async () => {
      const expTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const remaining = expTime - now;

      if (remaining <= 0) {
        console.log('[Auth] Session expired, logging out...');
        logout();
        setShowWarning(false);
        window.location.href = '/login';
      } else if (remaining <= WARNING_THRESHOLD_MS) {
        if (rememberMe) {
          handleStaySignedIn(true);
        } else {
          setShowWarning(true);
          setTimeLeft(Math.ceil(remaining / 1000));
        }
      } else {
        setShowWarning(false);
      }
    };

    const interval = setInterval(checkExpiration, 1000);
    checkExpiration();

    return () => clearInterval(interval);
  }, [isAuthenticated, expiresAt, rememberMe, logout, handleStaySignedIn]);

  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden flex flex-col transform scale-100 transition-transform">
        <div className="p-6 pb-2 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-5 border border-orange-100">
            <Clock className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2 tracking-tight">Session Expiring Soon</h2>
          <p className="text-[14px] text-gray-500 leading-relaxed px-2">
            For your security, you will be automatically logged out in <span className="font-bold text-[#d72b1f]">{minutes}:{seconds.toString().padStart(2, '0')}</span>. Do you want to stay signed in?
          </p>
        </div>

        <div className="p-6 pt-5 flex flex-col gap-2.5">
          <button
            onClick={() => handleStaySignedIn(false)}
            disabled={isRefreshing}
            className="w-full py-2.5 bg-[#d72b1f] hover:bg-[#b91d13] text-white text-[14px] font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? 'Refreshing...' : 'Stay Signed In'}
          </button>
          <button
            onClick={logout}
            className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[14px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
