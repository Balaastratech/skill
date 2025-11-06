import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE || '/api/';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    // SECURITY NOTE: Storing tokens in localStorage has XSS risks.
    // For production, consider using httpOnly cookies or a more secure approach.
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token refresh and global errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the access token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
const response = await axios.post(`${BASE_URL.replace(/\/$/, '')}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        
        // Store new access token
        localStorage.setItem('accessToken', access);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other error statuses
    if (error.response?.status === 403) {
      console.error('Permission denied');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
