import { useState } from 'react';
import { UserPlus, User } from 'lucide-react';
import { AddAdminModal } from './AddAdminModal';

interface AdminUser {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function AdminUsersSettings() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Mock data matching the design
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: '1',
      initials: 'AU',
      name: 'Admin User',
      email: 'admin@hivago.com',
      role: 'Super Admin',
      status: 'Active',
    },
    {
      id: '2',
      initials: 'SS',
      name: 'Support Staff',
      email: 'support@hivago.com',
      role: 'Support',
      status: 'Active',
    },
    {
      id: '3',
      initials: 'OM',
      name: 'Operations Manager',
      email: 'ops@hivago.com',
      role: 'Operator',
      status: 'Active',
    },
  ]);

  const handleAddAdmin = (newAdmin: AdminUser) => {
    setAdminUsers([...adminUsers, newAdmin]);
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
        {adminUsers.map((admin) => (
          <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-[14px] font-bold">
                {admin.initials}
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-gray-900">{admin.name}</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">{admin.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[13px] font-bold text-gray-900">{admin.role}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{admin.status}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-900 transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddAdminModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddAdmin}
      />
    </div>
  );
}
