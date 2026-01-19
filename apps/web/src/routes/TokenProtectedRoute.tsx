// src/routes/TokenProtectedRoute.tsx
import { useEffect } from "react";
import { Navigate, Outlet, useNavigationType } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export const TokenProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentStore = useAuthStore((state) => state.currentStore);
  const logout = useAuthStore((state) => state.logout);
  const navigationType = useNavigationType(); 
  // Nếu không có token nào -> Về login
  if (!accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  useEffect(() => {
    if (currentStore && navigationType === "POP") logout();
  }, [currentStore, navigationType, logout]);

  if (currentStore) {
    if (navigationType === "POP") return <Navigate to="/auth/login" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
