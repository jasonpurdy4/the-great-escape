// API Client for backend calls
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      // Token expired - clear and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ============================================================================
// PAYMENT ENDPOINTS
// ============================================================================

export const createPayPalOrder = async (orderData) => {
  const response = await api.post('/payments/create-order', orderData);
  return response.data;
};

export const capturePayPalOrder = async (orderId) => {
  const response = await api.post('/payments/capture-order', { orderId });
  return response.data;
};

export const purchaseWithBalance = async (purchaseData) => {
  const response = await api.post('/payments/purchase-with-balance', purchaseData);
  return response.data;
};

// ============================================================================
// POOL & ENTRY ENDPOINTS
// ============================================================================

export const getPools = async () => {
  const response = await api.get('/pools');
  return response.data;
};

export const getPool = async (poolId) => {
  const response = await api.get(`/pools/${poolId}`);
  return response.data;
};

export const getUserEntries = async () => {
  const response = await api.get('/users/me/entries');
  return response.data;
};

export const getUserTransactions = async () => {
  const response = await api.get('/users/me/transactions');
  return response.data;
};

// ============================================================================
// FOOTBALL DATA ENDPOINTS (existing)
// ============================================================================

export const getMatches = async (matchday) => {
  const url = matchday ? `/matches?matchday=${matchday}` : '/matches';
  const response = await axios.get(`${API_URL}${url}`);
  return response.data;
};

export const getTeams = async () => {
  const response = await axios.get(`${API_URL}/api/teams`);
  return response.data;
};

export const getCurrentMatchday = async () => {
  const response = await axios.get(`${API_URL}/api/current-matchday`);
  return response.data;
};

// ============================================================================
// REFERRAL ENDPOINTS (to be implemented)
// ============================================================================

export const getReferralCode = async () => {
  const response = await api.get('/referrals/my-code');
  return response.data;
};

export const getReferralStats = async () => {
  const response = await api.get('/referrals/stats');
  return response.data;
};

export default api;
