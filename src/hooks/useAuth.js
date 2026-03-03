import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { selectCurrentUser, selectIsAuthenticated, selectAccessToken, logout } from '../store/slices/authSlice';
import { logoutUser } from '../api/authApi';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {}
    dispatch(logout());
    toast.success('Logged out successfully');
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    accessToken,
    isClient: user?.role === 'client',
    isFreelancer: user?.role === 'freelancer',
    isAdmin: user?.role === 'admin',
    isPro: user?.subscriptionStatus === 'pro',
    logout: handleLogout,
  };
};
