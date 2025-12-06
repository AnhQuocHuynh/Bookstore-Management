import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { DashboardPage } from "../features/dashboard/components/DashboardPage";
import { ProductsPage } from "../features/products/components/ProductsPage";

// Auth pages (placeholder)
const LoginPage = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>
    <p>Trang đăng nhập đang được phát triển...</p>
  </div>
);

const RegisterPage = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold mb-4">Đăng ký</h1>
    <p>Trang đăng ký đang được phát triển...</p>
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

const EmployeesPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Nhân viên</h1>
    <p>Trang nhân viên đang được phát triển...</p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route
          path="/auth/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/auth/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />
      </Route>

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route
          path="/"
          element={
            <MainLayout>
              <Navigate to="/dashboard" replace />
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
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

