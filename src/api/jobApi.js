import api from './axiosInstance';

export const fetchJobs = (params) => api.get('/jobs', { params });
export const fetchJob = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.patch(`/jobs/${id}`, data);
export const fetchMyJobs = () => api.get('/jobs/my');
export const submitProposal = (jobId, data) => api.post(`/jobs/${jobId}/proposals`, data);
export const acceptProposal = (jobId, proposalId) =>
  api.patch(`/jobs/${jobId}/proposals/${proposalId}/accept`);
