import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { StatCard, GlassCard, Button } from '../components/ui';
import { ShoppingCart, TrendingUp, Award, Target, Clock, Zap, Plus, Bell, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate } from '../hooks/useNavigation';

const LEVEL_CONFIG: Record<string, { name: string; color: string }> = {
  basic: { name: 'Basico', color: 'text-gray-400' },
  pro: { name: 'Pro', color: 'text-blue-400' },
  micro_brand: { name: 'Micro Marca', color: 'text-nexus-gold' },
  distributor: { name: 'Distribuidor', color: 'text-nexus-accent' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  production: 'Produccion',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  confirmed: 'Confirmado',
  finished: 'Terminado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500/20 text-gray-300',
  confirmed: 'bg-blue-500/20 text-blue-300',
  production: 'bg-yellow-500/20 text-yellow-300',
  finished: 'bg-purple-500/20 text-purple-300',
  shipped: 'bg-cyan-500/20 text-cyan-300',
  delivered: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
};

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-white/[0.05] rounded w-3/4 mb-2" />
    <div className="h-8 bg-white/[0.05] rounded w-1/2 mb-2" />
    <div className="h-3 bg-white/[0.05] rounded w-2/3" />
  </div>
);

export const ResellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, resellerStats, notifications, loading, markNotificationRead } = useData();
  const navigate = useNavigate();

  const activeOrders = orders.filter(o =>
    ['pending', 'confirmed', 'production', 'finished'].includes(o.status)
  ).length;

  const currentLevel = resellerStats?.currentLevel || user?.level || 'basic';
  const levelInfo = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG.basic;

  const monthlyProgress = resellerStats?.monthlyGoal
    ? Math.round((resellerStats.monthlyProgress / resellerStats.monthlyGoal) * 100)
    : 0;

  const recentOrders = orders.slice(0, 5);

  const dailyEarnings = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const earnings = orders
      .filter(o => {
        const oDate = o.created_at.split('T')[0];
        return oDate === dateStr && o.status !== 'cancelled';
      })
      .reduce((sum, o) => sum + Number(o.reseller_profit), 0);
    return {
      date: date.toLocaleDateString('es-PA', { month: 'short', day: 'numeric' }),
      earnings,
    };
  });

  const recentNotifications = notifications.slice(0, 5);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Bienvenido, {user?.first_name}
            </h1>
            <p className="text-gray-400">Resumen de tu actividad y metas</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => navigate('/reseller/new-order')}
          >
            Nuevo Pedido
          </Button>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <GlassCard key={i}><Skeleton /></GlassCard>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={item}>
              <StatCard
                label="Pedidos Activos"
                value={activeOrders}
                icon={<ShoppingCart className="w-6 h-6 text-nexus-gold" />}
                subtext="En proceso"
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                label="Ganancias Totales"
                value={`$${(resellerStats?.totalEarnings || 0).toLocaleString()}`}
                icon={<TrendingUp className="w-6 h-6 text-nexus-accent" />}
                subtext="Desde inicio"
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                label="Nivel Actual"
                value={levelInfo.name.toUpperCase()}
                icon={<Award className="w-6 h-6 text-nexus-gold" />}
                subtext={`${resellerStats?.salesCount || 0} ventas`}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                label="Meta Mensual"
                value={`${Math.min(monthlyProgress, 100)}%`}
                icon={<Target className="w-6 h-6 text-green-400" />}
                subtext={`$${resellerStats?.monthlyProgress || 0} / $${resellerStats?.monthlyGoal || 0}`}
              />
            </motion.div>
          </motion.div>
        )}

        {/* XP Bar */}
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-nexus-accent" />
                  <span className="text-white font-semibold">Nivel {levelInfo.name}</span>
                </div>
                <span className="text-nexus-accent font-mono font-bold">{resellerStats?.xp || 0} XP</span>
              </div>
              <div className="w-full h-3 bg-white/[0.1] rounded-full overflow-hidden border border-white/[0.05]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(monthlyProgress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-nexus-accent to-nexus-gold rounded-full"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {monthlyProgress < 100
                  ? `Faltan $${((resellerStats?.monthlyGoal || 0) - (resellerStats?.monthlyProgress || 0)).toLocaleString()} para tu meta mensual`
                  : 'Meta mensual alcanzada'
                }
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* Recent Orders + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-nexus-gold" />
                Pedidos Recientes
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} />)}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] hover:border-white/[0.1] transition-colors cursor-pointer"
                      onClick={() => navigate('/reseller/orders')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{order.order_number}</p>
                          <p className="text-xs text-gray-400 mt-1">{order.customer_name}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                          <span className="text-sm font-bold text-nexus-gold">${Number(order.reseller_profit).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No tienes pedidos aun</p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Monthly Earnings Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-nexus-accent" />
                Ganancias Mensuales
              </h3>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-pulse w-full h-[250px] bg-white/[0.03] rounded" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(5, 8, 18, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#d4af37"
                      dot={false}
                      strokeWidth={2}
                      name="Ganancias"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-nexus-gold" />
              Actividad Reciente
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} />)}
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      notif.read
                        ? 'bg-white/[0.01] border-white/[0.05]'
                        : 'bg-white/[0.03] border-nexus-gold/20'
                    }`}
                    onClick={() => { if (!notif.read) markNotificationRead(notif.id); }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{notif.title}</p>
                        <p className="text-xs text-gray-400 mt-1 truncate">{notif.message}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(notif.created_at).toLocaleDateString('es-PA', { month: 'short', day: 'numeric' })}
                        </p>
                        {!notif.read && (
                          <span className="inline-block w-2 h-2 rounded-full bg-nexus-gold mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Sin notificaciones recientes</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};
