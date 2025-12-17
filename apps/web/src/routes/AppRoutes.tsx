import LoginPage from "@/features/auth/pages/LoginPage";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { DashboardPage } from "../features/dashboard/components/DashboardPage";
import { ProductsPage } from "../features/products/components/ProductsPage";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { TokenProtectedRoute } from "./TokenProtectedRoute";

// Auth pages (placeholder)
const RegisterPage = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold mb-4">Đăng ký</h1>
    <p>Trang đăng ký đang được phát triển...</p>
  </div>
);

// Select Store Page (Semi-protected: requires token but no store)
const SelectStorePage = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold mb-4">Chọn cửa hàng</h1>
    <p>Trang chọn cửa hàng đang được phát triển...</p>
  </div>
);

// Placeholder pages
const SalesPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Bán hàng</h1>
    <p>Trang bán hàng đang được phát triển...</p>
  </div>
);

const InventoryPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Kho hàng</h1>
    <p>Trang kho hàng đang được phát triển...</p>
  </div>
);

const EmployeesPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Nhân viên</h1>
    <p>Trang nhân viên đang được phát triển...</p>
  </div>
);

const ReportsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Báo cáo</h1>
    <p>Trang báo cáo đang được phát triển...</p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route
          path="/auth"
          element={
            <AuthLayout>
              <Outlet />
            </AuthLayout>
          }
        >
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Forgot Password - Public route (no auth required) */}
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Semi-Protected: Select Store (Requires Token, but NO Store yet) */}
      <Route element={<TokenProtectedRoute />}>
        <Route
          path="/auth/select-store"
          element={
            <AuthLayout>
              <SelectStorePage />
            </AuthLayout>
          }
        />
      </Route>

      {/* Fully Protected: App Routes (Requires Token + Store) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Route>

      {/* 404 - Redirect to login */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};
