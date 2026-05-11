import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { authService, type LoginPayload } from '@/core/api/auth';
import { Button } from '@/components/ui/Button';

// Assets
import HLogo from '@/assets/H_logo.svg';
import LoginIllustration from '@/assets/login_illustration.svg';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      console.log('Login Response:', data); // Helps with debugging
      
      const rawData = data as any;
      
      // The API returns accessToken, adminId, name, role
      const token = rawData?.accessToken;

      if (!token) {
        toast.error('Login succeeded but no token was returned from server.');
        return;
      }

      // Map the returned data to our User object structure
      const user = {
        id: rawData.adminId || '1',
        name: rawData.name || 'Admin',
        email: email,
        role: rawData.role || 'Admin'
      };

      // Default to 1 hour if backend doesn't provide expiresAt
      const defaultExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const refreshToken = rawData?.refreshToken || '';
      const expiresAt = rawData.accessTokenExpiresAt || defaultExpiresAt;

      login(token, refreshToken, user, expiresAt, rememberMe);
      toast.success('Successfully logged in!');
      navigate('/');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      loginSchema.parse({ email, password });
      loginMutation.mutate({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = (err as any).errors[0].message;
        setErrorMsg(msg);
        toast.error(msg);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Container */}
      <div className="max-w-6xl w-full flex items-center justify-between gap-12 lg:gap-20">
        
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative">
          <img 
            src={LoginIllustration} 
            alt="Login Illustration" 
            className="w-full max-w-[600px] object-contain drop-shadow-sm" 
          />
        </div>

        {/* Right Side - Form Card */}
        <div className="flex-1 w-full max-w-md mx-auto relative z-10">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 sm:p-12 w-full">
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center mb-8">
              <img src={HLogo} alt="Hivago Logo" className="w-16 h-16 mb-4 object-contain" />
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">Hivago</h1>
              <p className="text-sm text-gray-500 mt-1">Admin Operations Panel</p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium text-center">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-[18px] w-[18px] text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl border-0 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all sm:text-sm placeholder:text-gray-400"
                    placeholder="admin@hivago.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl border-0 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all sm:text-sm placeholder:text-gray-400 tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between mt-2">
                <a href="#" className="text-[13px] font-medium text-[#d72b1f] hover:text-[#b91d13] transition-colors">
                  Forgot password?
                </a>
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/50 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-[13px] font-medium text-gray-700 cursor-pointer">
                    Remember me
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full py-6 text-[15px] font-semibold rounded-xl bg-[#d72b1f] hover:bg-[#b91d13] text-white shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
                isLoading={loginMutation.isPending}
              >
                Sign In
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
