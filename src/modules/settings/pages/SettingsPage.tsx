import { useState } from 'react';
import { ProfileSettings } from '../components/ProfileSettings';
import { SecuritySettings } from '../components/SecuritySettings';
import { AdminUsersSettings } from '../components/AdminUsersSettings';
import { cn } from '@/utils/cn';

type Tab = 'profile' | 'security' | 'admin-users';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'admin-users', label: 'Admin Users' },
  ];

  return (
    <div className="w-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-[14px] text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'py-4 text-sm font-semibold transition-all relative',
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-900 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'admin-users' && <AdminUsersSettings />}
        </div>
      </div>
    </div>
  );
}
