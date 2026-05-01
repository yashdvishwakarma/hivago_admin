import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminLayout } from './layouts/AdminLayout';
import { useAuthStore } from './store/authStore';

// Lazy loading pages
const DashboardPage = lazy(() => import('./modules/dashboard/pages/DashboardPage'));
const OrdersPage = lazy(() => import('./modules/orders/pages/OrdersPage'));
const MenuPage = lazy(() => import('./modules/menu/pages/MenuPage'));
const RestaurantsPage = lazy(() => import('./modules/restaurants/pages/RestaurantsPage'));
const PayoutsPage = lazy(() => import('./modules/payouts/pages/PayoutsPage'));
const SettingsPage = lazy(() => import('./modules/settings/pages/SettingsPage'));
const LoginPage = lazy(() => import('./modules/auth/pages/LoginPage'));

function Loader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Suspense fallback={<Loader />}>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Protected Admin Layout Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="payouts" element={<PayoutsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Default fallback inside layout */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
