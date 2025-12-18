import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * TokenProtectedRoute Component
 *
 * Logic:
 * - Only requires accessToken (no store needed)
 * - If no accessToken -> Redirect to /auth/login
 * - If accessToken exists -> Render <Outlet />
 *
 * Used for routes like /auth/select-store that need authentication
 * but don't require a store to be selected yet.
 */
export const TokenProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  // No token - redirect to login
  if (!accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  // Has token - allow access
  return <Outlet />;
};
