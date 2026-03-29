import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor: attach accessToken
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (expired accessToken)
    // Don't try to refresh if it's the login route
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/login')) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { withCredentials: true });
        const { accessToken } = res.data.data ? res.data.data : res.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return apiClient(originalRequest);
      } catch (err) {
        // If refresh fails, logout
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    // Handle rate limit
    if (error.response?.status === 429) {
      // In a real app we'd use a toast. For now:
      console.error('Too many requests, slow down');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
