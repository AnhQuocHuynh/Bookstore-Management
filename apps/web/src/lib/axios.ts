import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Get base URL for API calls
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // Development: Use proxy (relative path)
    // Backend has prefix /api/v1, so we use /api/v1
    return "/api/v1";
  }
  // Production: Use full URL from env
  return import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach Bearer token and BookStore ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        const token = authData?.state?.accessToken;
        const currentStore = authData?.state?.currentStore;

        // Attach Bearer token for authentication
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Attach BookStore ID for multi-tenant context
        // IMPORTANT: Backend currently reads bookStoreId from JWT token payload.
        // This header is sent as a defensive measure for potential future backend support.
        // For store switching to work, user must re-authenticate to get a new JWT with the new bookStoreId.
        if (currentStore?.id && config.headers) {
          config.headers["X-BookStore-Id"] = currentStore.id;
        }
      }
    } catch (error) {
      console.error("Error reading auth token:", error);
    }

    // Debug: log Return Order-related requests
    try {
      const url = config.url || "";
      const method = (config.method || "").toUpperCase();
      if (url.includes("/return-orders") && ["POST", "PATCH", "DELETE"].includes(method)) {
        console.log("[axios][ReturnOrders] Request", {
          method,
          url: `${config.baseURL || ""}${url}`,
          data: config.data,
          headers: config.headers,
        });
      }
    } catch (logErr) {
      console.warn("[axios] Debug logging failed:", logErr);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
  (response) => {
    try {
      const url = response.config?.url || "";
      const method = (response.config?.method || "").toUpperCase();
      if (url.includes("/return-orders") && ["POST", "PATCH", "DELETE"].includes(method)) {
        console.log("[axios][ReturnOrders] Response", {
          method,
          url: `${response.config?.baseURL || ""}${url}`,
          status: response.status,
          data: response.data,
        });
      }
    } catch (logErr) {
      console.warn("[axios] Debug response logging failed:", logErr);
    }
    return response;
  },
  (error: AxiosError) => {
    try {
      const url = error.config?.url || "";
      const method = (error.config?.method || "").toUpperCase();
      if (url.includes("/return-orders") && ["POST", "PATCH", "DELETE"].includes(method)) {
        console.error("[axios][ReturnOrders] Error Response", {
          method,
          url: `${error.config?.baseURL || ""}${url}`,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
    } catch (logErr) {
      console.warn("[axios] Debug error response logging failed:", logErr);
    }
    if (error.response?.status === 401) {
      if (
        window.location.pathname !== "/auth/login" &&
        window.location.pathname !== "/select-store"
      ) {
        localStorage.removeItem("auth-storage");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
