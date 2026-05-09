import React from 'react';
import { useAuth } from '../context/AuthContext';
import { setLocation } from '../hooks/useNavigation';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, Button } from './ui';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'reseller' | 'any';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  if (requiredRole !== 'any' && user?.role !== requiredRole) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassCard className="max-w-md">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-red-500/20">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Acceso Denegado</h2>
              <p className="text-gray-400">
                No tienes permiso para acceder a esta página.
              </p>
              <p className="text-sm text-gray-500">
                Se requiere rol: <span className="font-semibold text-white capitalize">{requiredRole}</span>
              </p>
              <Button
                variant="primary"
                size="md"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setLocation(user?.role === 'admin' ? '/admin/dashboard' : '/reseller/dashboard')}
              >
                Volver al Dashboard
              </Button>
            </div>
          </GlassCard>
        </div>
      </MainLayout>
    );
  }

  return <>{children}</>;
};
