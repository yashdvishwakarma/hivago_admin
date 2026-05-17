import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '@/core/api/adminUsers';
import { Button } from '@/components/ui/Button';
import { Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProfileSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: adminUserService.getProfile,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        role: profile.role,
        isActive: profile.isActive
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming there might be an update API in the future, for now we just show a success toast
    // as per the user's request to "show" the details.
    toast.success('Profile view is read-only as per system policy');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm">Loading profile...</p>
      </div>
    );
  }

  // Get initials for avatar
  const initials = formData.name
    ? formData.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';

  return (
    <div className="max-w-xl">
      {/* Avatar Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg">
          {initials}
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-gray-900">{formData.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[13px] text-gray-500">{formData.email}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
              <Shield className="w-3 h-3" />
              {formData.role}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5 opacity-80 cursor-not-allowed">
          <label className="text-[13px] font-semibold text-gray-900">Admin Name</label>
          <input
            name="name"
            value={formData.name}
            readOnly
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-[14px] text-gray-600 cursor-not-allowed focus:outline-none"
          />
        </div>

        <div className="space-y-1.5 opacity-80 cursor-not-allowed">
          <label className="text-[13px] font-semibold text-gray-900">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-[14px] text-gray-600 cursor-not-allowed focus:outline-none"
          />
        </div>

        <div className="space-y-1.5 opacity-80 cursor-not-allowed">
          <label className="text-[13px] font-semibold text-gray-900">Assigned Role</label>
          <input
            value={formData.role}
            readOnly
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-[14px] text-gray-600 cursor-not-allowed focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <p className="text-[11px] text-gray-400 italic">
            * Profile details are managed by the System Administrator and are currently read-only.
          </p>
        </div>
      </form>
    </div>
  );
}
