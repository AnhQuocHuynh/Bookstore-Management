import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";

// Placeholder pages - will be replaced with actual feature pages
const DashboardPage = () => <div className="p-6">Dashboard Page</div>;
const ProductsPage = () => <div className="p-6">Products Page</div>;
const InventoryPage = () => <div className="p-6">Inventory Page</div>;
const StaffPage = () => <div className="p-6">Staff Page</div>;
const SuppliersPage = () => <div className="p-6">Suppliers Page</div>;
const LoginPage = () => <div className="p-6">Login Page</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
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
            path="/inventory"
            element={
              <MainLayout>
                <InventoryPage />
              </MainLayout>
            }
          />
          <Route
            path="/staff"
            element={
              <MainLayout>
                <StaffPage />
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

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
