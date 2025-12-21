import LoginPage from "@/features/auth/pages/LoginPage";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { DashboardPage } from "../features/dashboard/components/DashboardPage";
import { ProductsPage } from "../features/products/components/ProductsPage";
import { EmployeesPage } from "../features/employees/components/EmployeesPage";
import { SuppliersPage } from "../features/suppliers/components/SuppliersPage";

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

const PartnersPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Đối tác</h1>
    <p>Trang đối tác đang được phát triển...</p>
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
        />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          }
        />
        <Route
          path="/products"
          element={
            <MainLayout>
              <ProductsPage />
            </MainLayout>
          }
        />
        <Route
          path="/sales"
          element={
            <MainLayout>
              <SalesPage />
            </MainLayout>
          }
        />
        <Route
          path="/inventory"
          element={
            <MainLayout>
              <InventoryPage />
            </MainLayout>
          }
        />
        <Route
          path="/partners"
          element={
            <MainLayout>
              <PartnersPage />
            </MainLayout>
          }
        />
        <Route
          path="/employees"
          element={
            <MainLayout>
              <EmployeesPage />
            </MainLayout>
          }
        />
        <Route
          path="/suppliers"
          element={
            <MainLayout>
              <SuppliersPage />
            </MainLayout>
          }
        />
      </Route>

      {/* 404 - Redirect to login */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};
