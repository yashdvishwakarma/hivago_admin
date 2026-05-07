import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAdminSignalR } from '@/core/hooks/useAdminSignalR';

export function AdminLayout() {
  useAdminSignalR();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f8fafc]">
      {/* TopNav - Full Width */}
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col bg-white">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
