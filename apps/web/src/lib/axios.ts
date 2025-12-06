import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/useAuthStore";

// Determine base URL based on environment
// In dev mode, use relative path to leverage Vite proxy
// In production, use full API URL from env
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // Development: Use proxy (relative path)
    return "/api";
  }
  // Production: Use full URL from env
  return import.meta.env.VITE_API_URL || "http://localhost:3000/api";
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth state
      useAuthStore.getState().logout();
      
      // Redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

