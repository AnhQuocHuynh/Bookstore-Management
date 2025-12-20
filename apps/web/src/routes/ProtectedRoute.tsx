import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * ProtectedRoute Component
 *
 * Logic:
 * 1. If no accessToken -> Redirect to /auth/login
 * 2. If accessToken exists but no currentStore -> Redirect to /auth/select-store
 * 3. If both exist -> Render <Outlet />
 */
export const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentStore = useAuthStore((state) => state.currentStore);

  // No token - redirect to login
  if (!accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  // Has token but no store - redirect to select store
  if (!currentStore) {
    return <Navigate to="/auth/select-store" replace />;
  }

  // Both token and store exist - allow access
  return <Outlet />;
};
