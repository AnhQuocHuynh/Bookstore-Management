// src/routes/TokenProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export const TokenProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  // Nếu không có token nào -> Về login
  if (!accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};