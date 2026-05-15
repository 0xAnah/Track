import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const AUTH_PATHS = ['/auth/login/', '/auth/refresh/', '/auth/signup/'];

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401s (token expiration)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest = AUTH_PATHS.some((path) => requestUrl.includes(path));

    if (isAuthRequest) {
      return Promise.reject(error);
    }
    
    // If error is 401 (Unauthorized) and we haven't already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          return Promise.reject(error);
        }
        
        // Attempt to refresh the token
        const res = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const newAccessToken = res.data.access;
        localStorage.setItem('access_token', newAccessToken);
        
        // Optionally update refresh token if the server returns a new one
        if (res.data.refresh) {
          localStorage.setItem('refresh_token', res.data.refresh);
        }
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, user must log in again
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.assign('/login');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
