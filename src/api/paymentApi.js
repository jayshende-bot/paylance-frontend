import api from './axiosInstance';

export const fundEscrow = (milestoneId) => api.post('/payment/fund-escrow', { milestoneId });
export const releaseMilestone = (milestoneId) => api.post(`/payment/release/${milestoneId}`);
export const refundMilestone = (milestoneId) => api.post(`/payment/refund/${milestoneId}`);
export const fetchPaymentHistory = (params) => api.get('/payment/history', { params });

// Stripe Connect
export const getOnboardingLink = () => api.post('/connect/onboard');
export const getConnectStatus = () => api.get('/connect/status');
export const getDashboardLink = () => api.get('/connect/dashboard');
export const triggerPayout = (amount) => api.post('/connect/payout', { amount });

// Subscriptions
export const createSubscription = () => api.post('/subscriptions/create');
export const cancelSubscription = () => api.delete('/subscriptions/cancel');
export const getSubscriptionStatus = () => api.get('/subscriptions/status');

// Milestones
export const createMilestone = (data) => api.post('/milestones', data);
export const fetchMilestones = (contractId) => api.get(`/milestones/contract/${contractId}`);
export const submitMilestone = (milestoneId, data) => api.post(`/milestones/${milestoneId}/submit`, data);
export const disputeMilestone = (milestoneId) => api.patch(`/milestones/${milestoneId}/dispute`);
