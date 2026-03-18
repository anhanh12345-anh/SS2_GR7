import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
};

export const categoryAPI = {
  getAll: (params) => API.get('/categories', { params }),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

export const transactionAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
  getStats: (params) => API.get('/transactions/stats', { params }),
  getDashboard: () => API.get('/transactions/dashboard'),
};

export const budgetAPI = {
  getAll: (params) => API.get('/budgets', { params }),
  create: (data) => API.post('/budgets', data),
  update: (id, data) => API.put(`/budgets/${id}`, data),
  delete: (id) => API.delete(`/budgets/${id}`),
};

export const reportAPI = {
  getReport: (params) => API.get('/reports', { params }),
  exportExcel: (params) => API.get('/reports/export/excel', { params, responseType: 'blob' }),
  exportPDF: (params) => API.get('/reports/export/pdf', { params, responseType: 'blob' }),
};

export const reminderAPI = {
  getAll: () => API.get('/reminders'),
  create: (data) => API.post('/reminders', data),
  update: (id, data) => API.put(`/reminders/${id}`, data),
  delete: (id) => API.delete(`/reminders/${id}`),
};

export default API;
