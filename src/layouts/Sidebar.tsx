import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Store, 
  Bike, 
  Wallet, 
  LineChart, 
  Settings,
  Users,
  LogOut
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Restaurants', href: '/restaurants', icon: Store },
  { name: 'Owners', href: '/owners', icon: Users },
  { name: 'Riders', href: '/riders', icon: Bike },
  { name: 'Payouts', href: '/payouts', icon: Wallet },
  { name: 'Money Analytics', href: '/analytics', icon: LineChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white relative">
      <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-[#fff5f5] text-[#d72b1f]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all mb-1'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-[#d72b1f]' : 'text-gray-500 group-hover:text-gray-900',
                    'mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group"
        >
          <LogOut className="mr-3 h-[18px] w-[18px] flex-shrink-0 text-gray-500 group-hover:text-gray-900 transition-colors" />
          Logout
        </button>
      </div>
    </div>
  );
}
