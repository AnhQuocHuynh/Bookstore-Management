import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Create axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach Bearer token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        const token = authData?.state?.accessToken;

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error reading auth token:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth storage
      localStorage.removeItem("auth-storage");

      // Redirect to login
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
