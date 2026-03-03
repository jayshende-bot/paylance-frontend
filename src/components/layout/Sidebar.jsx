import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Briefcase, FileText, DollarSign,
  CreditCard, BarChart2, Settings, Shield, PlusCircle, Search,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { clsx } from 'clsx';

const clientNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs/post', icon: PlusCircle, label: 'Post a Job' },
  { to: '/jobs/my', icon: Briefcase, label: 'My Jobs' },
  { to: '/contracts', icon: FileText, label: 'Contracts' },
  { to: '/payment/history', icon: DollarSign, label: 'Payments' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

const freelancerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Search, label: 'Browse Jobs' },
  { to: '/contracts', icon: FileText, label: 'My Contracts' },
  { to: '/earnings', icon: BarChart2, label: 'Earnings' },
  { to: '/stripe/onboard', icon: CreditCard, label: 'Stripe Setup' },
  { to: '/subscription', icon: Shield, label: 'Go Pro' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

const adminNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin', icon: Shield, label: 'Admin Panel' },
  { to: '/admin/disputes', icon: FileText, label: 'Disputes' },
];

export default function Sidebar() {
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);
  const { user, isClient, isFreelancer, isAdmin } = useAuth();

  const nav = isAdmin ? adminNav : isClient ? clientNav : freelancerNav;

  return (
    <aside
      className={clsx(
        'fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-30',
        'transition-all duration-300 overflow-hidden',
        sidebarOpen ? 'w-60' : 'w-0 lg:w-16'
      )}
    >
      <nav className="p-3 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-sm shadow-primary-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            )}
          >
            <Icon size={17} className="flex-shrink-0" />
            <span className={clsx('transition-opacity', sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden')}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Pro badge */}
      {isFreelancer && user?.subscriptionStatus === 'pro' && sidebarOpen && (
        <div className="absolute bottom-4 left-3 right-3">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl p-3 text-sm text-center font-semibold shadow-md">
            ⭐ Pro Member
          </div>
        </div>
      )}
    </aside>
  );
}
