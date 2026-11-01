import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for centralized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: clear token if invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: () => api.post('/auth/resend-otp'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Subjects endpoints
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Concepts endpoints
export const conceptsAPI = {
  getAll: (params) => api.get('/concepts', { params }),
  getById: (id) => api.get(`/concepts/${id}`),
  create: (data) => api.post('/concepts', data),
  update: (id, data) => api.put(`/concepts/${id}`, data),
  delete: (id) => api.delete(`/concepts/${id}`),
};

// Graphs endpoints
export const graphsAPI = {
  getAll: (params) => api.get('/graphs', { params }),
  getById: (id) => api.get(`/graphs/${id}`),
  create: (data) => api.post('/graphs', data),
  update: (id, data) => api.put(`/graphs/${id}`, data),
  delete: (id) => api.delete(`/graphs/${id}`),
  getTopicsMap: () => api.get('/graphs/meta/topics'),
  generateForTopic: (data) => api.post('/graphs/generate-for-topic', data),
};

// AI Engine endpoints
export const aiAPI = {
  extractText: (data) => api.post('/ai/extract-text', data),
  extractFile: (formData) => api.post('/ai/extract-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  saveGeneratedGraph: (data) => api.post('/ai/save-generated-graph', data),
  tutorChat: (data) => api.post('/ai/tutor-chat', data),
  getConversations: () => api.get('/ai/conversations'),
  deleteConversation: (id) => api.delete(`/ai/conversations/${id}`),
};

// Quiz endpoints
export const quizAPI = {
  generate: (data) => api.post('/quizzes/generate', data),
  getAll: (params) => api.get('/quizzes', { params }),
  getById: (id) => api.get(`/quizzes/${id}`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  getHistory: () => api.get('/quizzes/attempts/history'),
};

// Revision endpoints
export const revisionAPI = {
  getQueue: () => api.get('/revisions/queue'),
  getStats: () => api.get('/revisions/stats'),
  submitFeedback: (conceptId, rating) => api.post(`/revisions/${conceptId}/review`, { rating }),
};

// Learning Paths endpoints
export const pathsAPI = {
  getAll: () => api.get('/paths'),
  getById: (id) => api.get(`/paths/${id}`),
  create: (data) => api.post('/paths', data),
  toggleConcept: (id, data) => api.put(`/paths/${id}/toggle-concept`, data),
};

// Resource Library endpoints
export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  upload: (formData) => api.post('/resources/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  createManual: (data) => api.post('/resources/manual', data),
  attachToConcept: (id, conceptId) => api.put(`/resources/${id}/attach`, { conceptId }),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Analytics endpoints
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

// Gamification endpoints
export const gamificationAPI = {
  getAchievements: () => api.get('/gamification/achievements'),
};

// Notifications endpoints
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export default api;
