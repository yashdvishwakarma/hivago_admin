import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminLayout } from './layouts/AdminLayout';
import { useAuthStore } from './store/authStore';
import { SessionWarningModal } from './components/SessionWarningModal';

// Lazy loading pages
const DashboardPage = lazy(() => import('./modules/dashboard/pages/DashboardPage'));
const OrdersPage = lazy(() => import('./modules/orders/pages/OrdersPage'));
const MenuPage = lazy(() => import('./modules/menu/pages/MenuPage'));
const RestaurantsPage = lazy(() => import('./modules/restaurants/pages/RestaurantsPage'));
const RidersPage = lazy(() => import('./modules/riders/pages/RidersPage'));
const PayoutsPage = lazy(() => import('./modules/payouts/pages/PayoutsPage'));
const AnalyticsPage = lazy(() => import('./modules/analytics/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./modules/settings/pages/SettingsPage'));
const OwnersPage = lazy(() => import('./modules/owners/pages/OwnersPage'));
const AdminMarketingPage = lazy(() => import('./modules/marketing/pages/AdminMarketingPage'));
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

import { AuthInitializer } from './components/AuthInitializer';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <AuthInitializer>
      <Suspense fallback={<Loader />}>
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        <SessionWarningModal />
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
          <Route path="owners" element={<OwnersPage />} />
          <Route path="riders" element={<RidersPage />} />
          <Route path="payouts" element={<PayoutsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="marketing" element={<AdminMarketingPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Default fallback inside layout */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
    </AuthInitializer>
  );
}

export default App;
