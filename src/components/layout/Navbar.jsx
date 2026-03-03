import { Bell, Menu, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../ui/Badge';

export default function Navbar() {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const unreadCount = useSelector((s) => s.notifications.unreadCount);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 fixed top-0 left-0 right-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <Menu size={20} />
        </button>
        <Link to="/dashboard" className="text-xl font-bold tracking-tight">
          <span className="gradient-text">Pay</span><span className="text-gray-900">Lance</span>
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <Link to="/notifications" className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-gray-100">
          <Link to="/profile" className="flex items-center gap-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 group">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center shadow-sm">
                <User size={14} className="text-white" />
              </div>
            )}
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
              <Badge status={user?.role} className="text-xs" />
            </div>
          </Link>
          <button onClick={logout} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Logout">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
