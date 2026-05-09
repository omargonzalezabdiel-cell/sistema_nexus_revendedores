import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Bell, LogOut, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { notifications } = useData();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-nexus-dark/50 border-b border-white/[0.05]">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <img src="/mi_logo.png" alt="NEXUS" className="h-10 w-auto" />
          <h1 className="text-2xl font-bold text-nexus-gold hidden sm:block">NEXUS</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-nexus-gold text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-nexus-dark border border-white/[0.1] rounded-xl shadow-premium"
                >
                  <div className="p-4 border-b border-white/[0.05]">
                    <h3 className="font-semibold text-white">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-3 border-b border-white/[0.05] hover:bg-white/[0.02] cursor-pointer transition-colors">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400 text-sm">Sin notificaciones</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 border-l border-white/[0.1] pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <Button variant="danger" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          <button onClick={onMenuToggle} className="md:hidden p-2">
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </nav>
  );
};
