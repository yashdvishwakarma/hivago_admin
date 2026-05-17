import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, User, Loader2 } from 'lucide-react';
import { AddAdminModal } from './AddAdminModal';
import { adminUserService } from '@/core/api/adminUsers';

export function AdminUsersSettings() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminUserService.getAdminUsers({ pageSize: 100 }),
  });

  const adminUsers = data?.admins || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Admin Users</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage administrative access</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Admin Users List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Loading admin users...</p>
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-500">No admin users found.</p>
          </div>
        ) : (
          adminUsers.map((admin: any) => (
            <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-[14px] font-bold">
                  {getInitials(admin.name)}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">{admin.name}</h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[13px] font-bold text-gray-900">{admin.role}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{admin.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddAdminModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
