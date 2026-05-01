import { Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import hivago_logo from '../assets/hivago_logo.svg'

export function TopNav() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-16 shrink-0 items-center justify-between bg-[#d72b1f] px-6 shadow-md z-50 relative">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        {/* If there's a white version of H_logo we would use it here. Let's just use text if logo isn't transparent white. */}
        {/* For now, just a clean white text representation since H_logo might be red. */}
        <img src={hivago_logo} alt="" />
      </div>

      <div className="flex items-center gap-x-6">
        <button type="button" className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors relative">
          <span className="sr-only">View notifications</span>
          <Bell className="h-[20px] w-[20px]" aria-hidden="true" />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-orange-400 border border-[#d72b1f]"></span>
        </button>

        <button 
          onClick={handleLogout}
          type="button" 
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center"
        >
          <span className="sr-only">Log out</span>
          <LogOut className="h-[20px] w-[20px]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
