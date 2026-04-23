import axios from 'axios';

let apiUrl = 'http://localhost:5001/api';
if (import.meta.env.VITE_API_URL) {
  let envUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ''); // Remove any trailing slash
  apiUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
}

const API = axios.create({
  // Safely constructed API URL
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT to every request automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors globally (token expired / invalid)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
