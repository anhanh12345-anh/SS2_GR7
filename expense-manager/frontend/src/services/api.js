import axios from 'axios';

// ====================
// AXIOS INSTANCE
// ====================
const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// ====================
// REQUEST INTERCEPTOR
// ====================
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ====================
// RESPONSE INTERCEPTOR
// ====================
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

// ====================
// AUTH API
// ====================
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
};

// ====================
// CATEGORY API
// ====================
export const categoryAPI = {
  getAll: (params) => API.get('/categories', { params }),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// ====================
// TRANSACTION API
// ====================
export const transactionAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
  getStats: (params) => API.get('/transactions/stats', { params }),
  getDashboard: () => API.get('/transactions/dashboard'),
};

// ====================
// BUDGET API
// ====================
export const budgetAPI = {
  getAll: (params) => API.get('/budgets', { params }),
  create: (data) => API.post('/budgets', data),
  update: (id, data) => API.put(`/budgets/${id}`, data),
  delete: (id) => API.delete(`/budgets/${id}`),
};

// ====================
// REPORT API
// ====================
export const reportAPI = {
  getReport: (params) => API.get('/reports', { params }),

  exportExcel: (params) =>
    API.get('/reports/export/excel', {
      params,
      responseType: 'blob',
    }),

  exportPDF: (params) =>
    API.get('/reports/export/pdf', {
      params,
      responseType: 'blob',
    }),
};

// ====================
// REMINDER API
// ====================
export const reminderAPI = {
  getAll: (params) => API.get('/reminders', { params }),

  create: (data) => API.post('/reminders', data),

  update: (id, data) => API.put(`/reminders/${id}`, data),

  delete: (id) => API.delete(`/reminders/${id}`),

  // ✅ NEW
  markAsRead: (id) => API.put(`/reminders/${id}/read`),
};

// ====================
// 💸 DEBT API (NEW)
// ====================
export const debtAPI = {
  // 📋 Lấy danh sách (filter: type, status...)
  getAll: (params) => API.get('/debts', { params }),

  // 🔍 Chi tiết
  getById: (id) => API.get(`/debts/${id}`),

  // ➕ Tạo khoản nợ
  create: (data) => API.post('/debts', data),

  // ✏️ Cập nhật
  update: (id, data) => API.put(`/debts/${id}`, data),

  // ❌ Xoá
  delete: (id) => API.delete(`/debts/${id}`),

  // 💸 Trả nợ
  repay: (id, data) => API.post(`/debts/${id}/repay`, data),

  // 📈 Thống kê (optional backend)
  getStats: () => API.get('/debts/stats'),
};

// ====================
// EXPORT DEFAULT
// ====================
export default API;