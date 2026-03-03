import { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setLoading } from './store/slices/authSlice';
import { setNotifications } from './store/slices/notificationSlice';
import { getMe } from './api/authApi';
import { fetchNotifications } from './api/analyticsApi';
import { selectIsAuthenticated, selectIsLoading } from './store/slices/authSlice';
import { useSocket } from './hooks/useSocket';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Loader from './components/ui/Loader';
import { clsx } from 'clsx';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/shared/Dashboard';
import BrowseJobs from './pages/freelancer/BrowseJobs';
import PostJob from './pages/client/PostJob';
import MyJobs from './pages/client/MyJobs';
import FundEscrow from './pages/client/FundEscrow';
import Earnings from './pages/freelancer/Earnings';
import StripeOnboarding from './pages/freelancer/StripeOnboarding';
import Subscription from './pages/shared/Subscription';
import JobDetail from './pages/shared/JobDetail';
import Contracts from './pages/shared/Contracts';
import ContractDetail from './pages/shared/ContractDetail';
import Profile from './pages/shared/Profile';
import PaymentHistory from './pages/shared/PaymentHistory';

// ── App shell with sidebar/navbar ─────────────────────────────────────────────
function AppShell() {
  useSocket(); // Connect socket.io globally
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main
        className={clsx(
          'pt-16 transition-all duration-300',
          sidebarOpen ? 'pl-60' : 'pl-0 lg:pl-16'
        )}
      >
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

// ── Auth guard ─────────────────────────────────────────────────────────────────
function RequireAuth({ roles }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector((s) => s.auth.user);

  if (isLoading) return <Loader text="Authenticating..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// ── Root App ───────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();

  // Restore session on mount (silent refresh via httpOnly cookie)
  useEffect(() => {
    const controller = new AbortController();

    const restoreSession = async () => {
      try {
        const res = await getMe({ signal: controller.signal });
        dispatch(setCredentials({ user: res.data.data.user, accessToken: null }));

        // Load notifications
        const notifRes = await fetchNotifications({ page: 1, limit: 20 });
        dispatch(setNotifications(notifRes.data.data));
      } catch (err) {
        // Ignore cancellation from StrictMode double-mount cleanup
        if (err?.code === 'ERR_CANCELED') return;
        dispatch(setLoading(false));
      }
    };
    restoreSession();
    return () => controller.abort(); // cancels in-flight request on StrictMode cleanup
  }, [dispatch]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes inside AppShell */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment/history" element={<PaymentHistory />} />
            {/* Job detail — accessible to both client and freelancer */}
            <Route path="/jobs/:id" element={<JobDetail />} />

            {/* Freelancer routes */}
            <Route element={<RequireAuth roles={['freelancer']} />}>
              <Route path="/jobs" element={<BrowseJobs />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/stripe/onboard" element={<StripeOnboarding />} />
              <Route path="/stripe/return" element={<StripeOnboarding />} />
            </Route>

            {/* Client routes */}
            <Route element={<RequireAuth roles={['client']} />}>
              <Route path="/jobs/post" element={<PostJob />} />
              <Route path="/jobs/my" element={<MyJobs />} />
              <Route path="/fund/:milestoneId" element={<FundEscrow />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
