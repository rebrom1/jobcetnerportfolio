import axios from 'axios';
import { API_CONFIG } from '../config';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API Services
export const jobsAPI = {
  getAll: (params = {}) => apiClient.get(API_CONFIG.ENDPOINTS.JOBS, { params }),
  getById: (id) => apiClient.get(`${API_CONFIG.ENDPOINTS.JOBS}/${id}`),
  search: (query) => apiClient.get(`${API_CONFIG.ENDPOINTS.JOBS}/search`, { params: { q: query } }),
  apply: (jobId, applicationData) => apiClient.post(`${API_CONFIG.ENDPOINTS.JOBS}/${jobId}/apply`, applicationData),
};

export const statsAPI = {
  getCurrent: () => apiClient.get(API_CONFIG.ENDPOINTS.STATS),
  getHistorical: (period) => apiClient.get(`${API_CONFIG.ENDPOINTS.STATS}/historical`, { params: { period } }),
};

export const consultationsAPI = {
  getAvailableSlots: (date) => apiClient.get(`${API_CONFIG.ENDPOINTS.CONSULTATIONS}/slots`, { params: { date } }),
  book: (slotData) => apiClient.post(`${API_CONFIG.ENDPOINTS.CONSULTATIONS}/book`, slotData),
  getMyConsultations: () => apiClient.get(`${API_CONFIG.ENDPOINTS.CONSULTATIONS}/my`),
};

export const coursesAPI = {
  getAll: (category) => apiClient.get(API_CONFIG.ENDPOINTS.COURSES, { params: { category } }),
  getById: (id) => apiClient.get(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`),
  enroll: (courseId) => apiClient.post(`${API_CONFIG.ENDPOINTS.COURSES}/${courseId}/enroll`),
};

export const leadsAPI = {
  create: (leadData) => apiClient.post(API_CONFIG.ENDPOINTS.LEADS, leadData),
  trackEvent: (eventData) => apiClient.post(`${API_CONFIG.ENDPOINTS.LEADS}/track`, eventData),
};

export default apiClient;
