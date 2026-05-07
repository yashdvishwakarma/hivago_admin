import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { authService, type ChangePasswordPayload } from '@/core/api/auth';
import { useAuthStore } from '@/store/authStore';

export function SecuritySettings() {
  const { logout } = useAuthStore();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
    onSuccess: () => {
      toast.success('Password changed successfully! You will be logged out in 3 seconds.', {
        duration: 3000,
      });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        logout();
      }, 3000);
    },
    onError: (error: any) => {
      const data = error?.response?.data;
      const msg = data?.message || data?.title || (typeof data === 'string' ? data : 'Failed to change password.');
      toast.error(msg);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    mutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmNewPassword: formData.confirmPassword
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h2 className="text-[16px] font-bold text-gray-900">Change Password</h2>
        <p className="text-[13px] text-gray-500 mt-1">Update your password to keep your account secure</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-900">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-900">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-900">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
            required
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            isLoading={mutation.isPending}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium px-6 py-2.5 rounded-lg shadow-sm"
          >
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
}
