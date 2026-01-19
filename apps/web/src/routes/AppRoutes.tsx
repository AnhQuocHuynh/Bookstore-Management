import React from "react";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { EmployeeListPage } from "../features/employees/pages/EmployeeListPage";
import { EmployeeSchedulePage } from "../features/employees/pages/EmployeeSchedulePage";
import { ProductsPage } from "../features/products/components/ProductsPage";
import { SuppliersPage } from "../features/suppliers/components/SuppliersPage";
import { InventoryPage } from "../features/inventory/components/InventoryPage";
import { UsersPage } from "../features/users/components/UsersPage";
import { UserEditPage } from "../features/users/components/UserEditPage";
import { CreateSalesPage } from "../features/sales/components/pages/CreateSalesPage";
import { SalesListPage } from "../features/sales/components/pages/SalesListPage";

import SelectStorePage from "@/features/auth/pages/SelectStorePage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";
import VerifyEmailSuccessPage from "@/features/auth/pages/VerifyEmailSuccessPage";
import { CustomerPage } from "@/features/customers/components/CustomerPage";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { TokenProtectedRoute } from "./TokenProtectedRoute";
import { CategoriesPage } from "@/features/categories/components/CategoriesPage";
import { PublishersPage } from "@/features/publishers/components/PublishersPage";
import { AuthorsPage } from "@/features/authors/components/AuthorsPage";
import { CreatePurchaseOrderPage } from "@/features/purchase-orders/components/CreatePurchaseOrderPage";
import { PurchaseOrderListPage } from "@/features/purchase-orders/components/PurchaseOrderListPage";
import { DisplayPage } from "@/features/display/components/DisplayPage";
import { ShelvesView } from "@/features/display/components/ShelvesView";
import { DisplayProductsView } from "@/features/display/components/DisplayProductsView";
import { DisplayLogsView } from "@/features/display/components/DisplayLogsView";
import { RevenueReportView } from "@/features/reports/components/RevenueReportView";
import { StockReportView } from "@/features/reports/components/StockReportView";
import { EmployeeReportView } from "@/features/reports/components/EmployeeReportView";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { ReturnOrderListPage } from "@/features/return-orders/components";
import { CreateReturnOrderPage } from "@/features/return-orders/components/CreateReturnOrderPage";
import { EditReturnOrderPage } from "@/features/return-orders/components/EditReturnOrderPage";
import { useAuthStore } from "@/stores/useAuthStore";
import { InventoryLogsPage } from "@/features/inventory/components/InventoryLogsPage";

// Select Store Page (Semi-protected: requires token but no store)
// const SelectStorePage = () => (
//   <div className="text-center">
//     <h1 className="text-2xl font-bold mb-4">Chọn cửa hàng</h1>
//     <p>Trang chọn cửa hàng đang được phát triển...</p>
//   </div>
// );

// Placeholder pages
const SalesPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Bán hàng</h1>
    <p>Trang bán hàng đang được phát triển...</p>
  </div>
);

const RequireRoles = ({ roles, children }: { roles: Array<"OWNER" | "EMPLOYEE" | "ADMIN">; children: React.ReactElement }) => {
  const userRole = (useAuthStore((s) => s.user?.role) as "OWNER" | "EMPLOYEE" | "ADMIN" | undefined) || "EMPLOYEE";
  if (!roles.includes(userRole)) return <Navigate to="/dashboard" replace />;
  return children;
};

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
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route
            path="verify-email/success"
            element={<VerifyEmailSuccessPage />}
          />
        </Route>
      </Route>

      {/* Forgot Password - Public route (no auth required) */}
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Semi-Protected: Select Store (Requires Token, but NO Store yet) */}
      <Route element={<TokenProtectedRoute />}>
        <Route path="/select-store" element={<SelectStorePage />} />
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
          path="/dashboard/products"
          element={
            <MainLayout>
              <ProductsPage />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/products/inventories"
          element={
            <MainLayout>
              <InventoryPage />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/products/return-orders/list"
          element={
            <MainLayout>
              <ReturnOrderListPage />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/products/return-orders/create"
          element={
            <RequireRoles roles={["EMPLOYEE"]}>
              <MainLayout>
                <CreateReturnOrderPage />
              </MainLayout>
            </RequireRoles>
          }
        />
        <Route
          path="/dashboard/products/return-orders/edit/:orderId"
          element={
            <RequireRoles roles={["EMPLOYEE"]}>
              <MainLayout>
                <EditReturnOrderPage />
              </MainLayout>
            </RequireRoles>
          }
        />
        <Route
          path="/sales/create"
          element={
            <RequireRoles roles={["EMPLOYEE"]}>
              <MainLayout>
                <CreateSalesPage />
              </MainLayout>
            </RequireRoles>
          }
        />
        <Route
          path="/sales/list"
          element={
            <MainLayout>
              <SalesListPage />
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
          path="/dashboard/customers"
          element={
            <MainLayout>
              <CustomerPage />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/categories"
          element={
            <MainLayout>
              <CategoriesPage />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/authors"
          element={
            <MainLayout>
              <AuthorsPage />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/publishers"
          element={
            <MainLayout>
              <PublishersPage />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/employees/list"
          element={
            <RequireRoles roles={["OWNER"]}>
              <MainLayout>
                <EmployeeListPage />
              </MainLayout>
            </RequireRoles>
          }
        />
        <Route
          path="/dashboard/employees/schedule"
          element={
            <RequireRoles roles={["OWNER"]}>
              <MainLayout>
                <EmployeeSchedulePage />
              </MainLayout>
            </RequireRoles>
          }
        />
        <Route
          path="/dashboard/suppliers"
          element={
            <MainLayout>
              <SuppliersPage />
            </MainLayout>
          }
        />
        <Route
          path="/users"
          element={
            <MainLayout>
              <UsersPage />
            </MainLayout>
          }
        />
        <Route
          path="/users/edit"
          element={
            <MainLayout>
              <UserEditPage />
            </MainLayout>
          }
        />
        <Route
          path="/reports/revenue" element={
            <MainLayout>
              <RevenueReportView />
            </MainLayout>} />

        <Route
          path="/reports/stocks"
          element={
            <MainLayout>
              <StockReportView />
            </MainLayout>
          }
        />

        <Route
          path="/reports/employees"
          element={
            <RequireRoles roles={["OWNER"]}>
              <MainLayout>
                <EmployeeReportView />
              </MainLayout>
            </RequireRoles>
          }
        />

        <Route
          path="/inventory/logs"
          element={
            <RequireRoles roles={["OWNER"]}>
              <MainLayout>
                <InventoryLogsPage />
              </MainLayout>
            </RequireRoles>
          }
        />

        <Route
          path="/settings"
          element={
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          }
        />

      </Route>




      <Route path="/purchase-orders/create"
        element={
          <RequireRoles roles={["EMPLOYEE"]}>
            <MainLayout>
              <CreatePurchaseOrderPage />
            </MainLayout>
          </RequireRoles>
        }
      />
      <Route path="purchase-orders/list" element={<MainLayout><PurchaseOrderListPage /></MainLayout>} />

      <Route path="dashboard/products/display/list" element={<MainLayout><ShelvesView /></MainLayout>} />

      <Route path="dashboard/products/display/filter" element={<MainLayout><DisplayProductsView /></MainLayout>} />

      <Route path="dashboard/products/display/history" element={<MainLayout><DisplayLogsView /></MainLayout>} />


      {/* 404 - Redirect to login */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />


    </Routes>
  );
};
