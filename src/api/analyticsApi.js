import api from './axiosInstance';

export const fetchFreelancerAnalytics = () => api.get('/analytics/freelancer');
export const fetchAdminAnalytics = () => api.get('/analytics/admin');
export const fetchNotifications = (params) => api.get('/users/notifications', { params });
export const markNotificationsRead = (ids) => api.patch('/users/notifications/read', { ids });
export const updateProfile = (data) => api.patch('/users/profile', data);
export const uploadAvatar = (formData) =>
  api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
