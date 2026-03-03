import axios from 'axios';
import { store } from '../store';
import { updateAccessToken, logout } from '../store/slices/authSlice';

const BACKEND_URL = 'https://paylance-backend.vercel.app/api/v1';
const BASE_URL = import.meta.env.VITE_API_URL || BACKEND_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends httpOnly cookie (refresh token)
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent token refresh on 401
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Never retry refresh on auth endpoints themselves — prevents infinite loop
    const isAuthEndpoint = original.url?.includes('/auth/');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        store.dispatch(updateAccessToken(newToken));
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
