// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentStore = useAuthStore((state) => state.currentStore);

  if (!accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  // Có token mà chưa có store -> Về trang chọn store
  if (!currentStore) {
    return <Navigate to="/select-store" replace />;
  }

  return <Outlet />;
};
