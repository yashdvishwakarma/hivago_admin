import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '@/core/api/adminUsers';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddAdminModal({ isOpen, onClose, onSuccess }: AddAdminModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Support' as 'Support' | 'CityAdmin',
    password: '',
  });

  const mutation = useMutation({
    mutationFn: adminUserService.createAdminUser,
    onSuccess: () => {
      toast.success('Admin user created successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      onSuccess?.();
      onClose();
      setFormData({ name: '', email: '', role: 'Support', password: '' });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create admin user');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">Add New Admin User</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form id="add-admin-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-900">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-900">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
                placeholder="admin@hivago.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-900">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors appearance-none"
                required
              >
                <option value="Support">Support</option>
                <option value="CityAdmin">City Admin</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-900">Temporary Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors rounded-lg"
          >
            Cancel
          </button>
          <Button 
            type="submit" 
            form="add-admin-form"
            className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium px-6 py-2.5 rounded-lg shadow-sm"
            isLoading={mutation.isPending}
          >
            Create Admin
          </Button>
        </div>

      </div>
    </div>
  );
}
