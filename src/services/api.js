import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://military-asset-management-system-nandan.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getTabStorageKeys = () => {
  let tabId = sessionStorage.getItem('tabId');
  if (!tabId) {
    const keys = Object.keys(localStorage);
    const tabKeys = keys.filter(k => k.startsWith('token_tab_'));
    if (tabKeys.length > 0) {
      tabId = tabKeys[tabKeys.length - 1].replace('token_', '');
    } else {
      tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    sessionStorage.setItem('tabId', tabId);
  }
  return {
    token: `token_${tabId}`,
    user: `user_${tabId}`,
  };
};

api.interceptors.request.use(
  (config) => {
    const storageKeys = getTabStorageKeys();
    const token = localStorage.getItem(storageKeys.token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isSilentRequest = error.config?.silent === true;
      
      if (!isSilentRequest) {
        if (!window.location.pathname.includes('/login')) {
          const storageKeys = getTabStorageKeys();
          localStorage.removeItem(storageKeys.token);
          localStorage.removeItem(storageKeys.user);
          window.dispatchEvent(new Event('auth-change'));
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/user/auth', data),
  register: (data) => api.post('/user/auth', data),
  getMe: () => api.get('/auth/me'),
};

export const basesAPI = {
  getAll: () => api.get('/bases'),
  getById: (id) => api.get(`/bases/${id}`),
  create: (data) => api.post('/bases', data),
  update: (id, data) => api.put(`/bases/${id}`, data),
  delete: (id) => api.delete(`/bases/${id}`),
};

export const dashboardAPI = {
  getMetrics: (filters, config = {}) => api.get('/dashboard', { params: filters, ...config }),
};

export const purchasesAPI = {
  getAll: (filters) => api.get('/purchases', { params: filters }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
};

export const transfersAPI = {
  getAll: (filters) => api.get('/transfers', { params: filters }),
  getById: (id) => api.get(`/transfers/${id}`),
  create: (data) => api.post('/transfers', data),
  approve: (id) => api.patch(`/transfers/${id}/approve`),
  complete: (id) => api.patch(`/transfers/${id}/complete`),
};

export const assignmentsAPI = {
  getAll: (filters) => api.get('/assignments', { params: filters }),
  create: (data) => api.post('/assignments', data),
  return: (id) => api.patch(`/assignments/${id}/return`),
};

export const expendituresAPI = {
  getAll: (filters) => api.get('/expenditures', { params: filters }),
  create: (data) => api.post('/expenditures', data),
};

export const assetsAPI = {
  getAll: (filters) => api.get('/assets', { params: filters }),
};

export default api;

