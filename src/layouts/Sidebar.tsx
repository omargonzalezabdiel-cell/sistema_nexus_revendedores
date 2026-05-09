import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from '../hooks/useNavigation';
import {
  LayoutDashboard, ShoppingCart, BarChart3, Users, Settings,
  Award, TrendingUp, FileText, LogOut, X, Factory,
  DollarSign, Bell, Trophy, Megaphone, User
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const adminMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Pedidos', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Produccion', icon: Factory, path: '/admin/production' },
    { label: 'Usuarios', icon: Users, path: '/admin/users' },
    { label: 'Revendedores', icon: Award, path: '/admin/resellers' },
    { label: 'Costos', icon: TrendingUp, path: '/admin/costs' },
    { label: 'Finanzas', icon: DollarSign, path: '/admin/finances' },
    { label: 'Analiticas', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Notificaciones', icon: Bell, path: '/admin/notifications' },
    { label: 'Configuracion', icon: Settings, path: '/admin/settings' },
  ];

  const resellerMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/reseller/dashboard' },
    { label: 'Nuevo Pedido', icon: ShoppingCart, path: '/reseller/new-order' },
    { label: 'Mis Pedidos', icon: FileText, path: '/reseller/orders' },
    { label: 'Ganancias', icon: TrendingUp, path: '/reseller/earnings' },
    { label: 'Recompensas', icon: Trophy, path: '/reseller/rewards' },
    { label: 'Ranking', icon: Award, path: '/reseller/ranking' },
    { label: 'Analiticas', icon: BarChart3, path: '/reseller/analytics' },
    { label: 'Promociones', icon: Megaphone, path: '/reseller/promotions' },
    { label: 'Perfil', icon: User, path: '/reseller/profile' },
  ];

  const menuItems = user?.role === 'admin' || user?.role === 'super_admin'
    ? adminMenuItems
    : resellerMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: isOpen ? 0 : -100, opacity: isOpen ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed md:static top-0 left-0 h-screen w-64
          backdrop-blur-xl bg-nexus-darker border-r border-white/[0.05]
          z-40 flex flex-col transition-transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-nexus-gold">NEXUS</h2>
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Administrador' : 'Revendedor'}
          </p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((menuItem) => {
            const isActive = location === menuItem.path;
            const Icon = menuItem.icon;

            return (
              <motion.button
                key={menuItem.path}
                whileHover={{ x: 4 }}
                onClick={() => {
                  navigate(menuItem.path);
                  onClose?.();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1
                  transition-all duration-200
                  ${isActive
                    ? 'bg-nexus-gold/20 text-nexus-gold border border-nexus-gold/30'
                    : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{menuItem.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.05]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Cerrar Sesion</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};
