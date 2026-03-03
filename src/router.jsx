import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, selectIsLoading } from './store/slices/authSlice';
import Loader from './components/ui/Loader';

// Lazy imports for code splitting
import { lazy, Suspense } from 'react';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/shared/Dashboard'));
const BrowseJobs = lazy(() => import('./pages/freelancer/BrowseJobs'));
const PostJob = lazy(() => import('./pages/client/PostJob'));
const FundEscrow = lazy(() => import('./pages/client/FundEscrow'));
const Earnings = lazy(() => import('./pages/freelancer/Earnings'));
const StripeOnboarding = lazy(() => import('./pages/freelancer/StripeOnboarding'));
const Subscription = lazy(() => import('./pages/shared/Subscription'));

// Protected route wrapper component (used inside AppShell)
export function ProtectedRoute({ children, roles }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectCurrentUser);

  if (isLoading) return <Loader text="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;

  return children;
}

export const routes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/dashboard', requiresAuth: true, element: <Dashboard /> },
  { path: '/jobs', requiresAuth: true, roles: ['freelancer'], element: <BrowseJobs /> },
  { path: '/jobs/post', requiresAuth: true, roles: ['client'], element: <PostJob /> },
  { path: '/fund/:milestoneId', requiresAuth: true, roles: ['client'], element: <FundEscrow /> },
  { path: '/earnings', requiresAuth: true, roles: ['freelancer'], element: <Earnings /> },
  { path: '/stripe/onboard', requiresAuth: true, roles: ['freelancer'], element: <StripeOnboarding /> },
  { path: '/stripe/return', requiresAuth: true, element: <StripeOnboarding /> },
  { path: '/subscription', requiresAuth: true, element: <Subscription /> },
];
