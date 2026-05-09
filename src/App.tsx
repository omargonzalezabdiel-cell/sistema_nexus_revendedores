import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { setLocation, useLocation } from './hooks/useNavigation';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResellerDashboardPage } from './pages/ResellerdashboardPage';
import { ResellerOrdersPage } from './pages/ResellerOrdersPage';
import { NewOrderPage } from './pages/NewOrderPage';
import { EarningsPage } from './pages/EarningsPage';
import { RewardsPage } from './pages/RewardsPage';
import { ResellerAnalyticsPage } from './pages/ResellerAnalyticsPage';
import { ResellerRankingPage } from './pages/ResellerRankingPage';
import { ResellerPromotionsPage } from './pages/ResellerPromotionsPage';
import { ResellerProfilePage } from './pages/ResellerProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminCostsPage } from './pages/AdminCostsPage';
import { AdminResellersPage } from './pages/AdminResellersPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminProductionPage } from './pages/AdminProductionPage';
import { AdminFinancesPage } from './pages/AdminFinancesPage';
import { AdminNotificationsPage } from './pages/AdminNotificationsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { GlassCard, Button } from './components/ui';
import { Clock, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

function PendingApprovalScreen() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-nexus-darker flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <GlassCard>
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Cuenta Pendiente</h2>
            <p className="text-gray-400">
              Tu cuenta esta pendiente de aprobacion. Un administrador debe aprobar tu cuenta antes de que puedas acceder al sistema.
            </p>
            <Button
              variant="outline"
              size="lg"
              icon={<LogOut className="w-4 h-4" />}
              onClick={async () => { await logout(); setLocation('/login'); }}
              className="w-full"
            >
              Cerrar Sesion
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-nexus-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-nexus-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando NEXUS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (location === '/register') {
      return <RegisterPage />;
    }
    return <LoginPage />;
  }

  // Resellers who are not approved see pending screen
  if (user?.role === 'reseller' && !user.approved) {
    return <PendingApprovalScreen />;
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const initialLocation = isAdmin ? '/admin/dashboard' : '/reseller/dashboard';

  const isOnWrongRoleRoute = isAdmin
    ? location.startsWith('/reseller/')
    : location.startsWith('/admin/');

  if (isOnWrongRoleRoute) {
    setLocation(initialLocation);
  }

  const currentLocation = isOnWrongRoleRoute ? initialLocation : location;

  const adminPages: Record<string, React.ReactNode> = {
    '/admin/dashboard': <AdminDashboardPage />,
    '/admin/orders': <AdminOrdersPage />,
    '/admin/users': <AdminUsersPage />,
    '/admin/costs': <AdminCostsPage />,
    '/admin/production': <AdminProductionPage />,
    '/admin/resellers': <AdminResellersPage />,
    '/admin/finances': <AdminFinancesPage />,
    '/admin/analytics': <AdminAnalyticsPage />,
    '/admin/notifications': <AdminNotificationsPage />,
    '/admin/settings': <AdminSettingsPage />,
  };

  const resellerPages: Record<string, React.ReactNode> = {
    '/reseller/dashboard': <ResellerDashboardPage />,
    '/reseller/orders': <ResellerOrdersPage />,
    '/reseller/new-order': <NewOrderPage />,
    '/reseller/earnings': <EarningsPage />,
    '/reseller/rewards': <RewardsPage />,
    '/reseller/analytics': <ResellerAnalyticsPage />,
    '/reseller/ranking': <ResellerRankingPage />,
    '/reseller/promotions': <ResellerPromotionsPage />,
    '/reseller/profile': <ResellerProfilePage />,
  };

  const pages = isAdmin ? adminPages : resellerPages;

  if (!pages[currentLocation]) {
    setLocation(initialLocation);
    return pages[initialLocation] || <ResellerDashboardPage />;
  }

  return pages[currentLocation];
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
