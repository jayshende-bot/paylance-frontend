import api from './axiosInstance';

export const fetchContracts = () => api.get('/contracts');
export const fetchContract = (id) => api.get(`/contracts/${id}`);
