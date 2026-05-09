import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, StatCard, Button } from '../components/ui';
import { TrendingUp, Zap, AlertCircle, Users, Package, ArrowRight } from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { analyticsService } from '../services/analytics';
import { useNavigate } from '../hooks/useNavigation';

const STATUS_COLORS: Record<string, string> = {
  pending: '#ef4444',
  confirmed: '#f59e0b',
  production: '#eab308',
  finished: '#a855f7',
  shipped: '#3b82f6',
  delivered: '#10b981',
  cancelled: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  production: 'Produccion',
  finished: 'Terminado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const Skeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/[0.1] p-6">
    <div className="h-4 bg-white/[0.06] rounded w-1/2 mb-3" />
    <div className="h-8 bg-white/[0.06] rounded w-3/4 mb-2" />
    <div className="h-3 bg-white/[0.06] rounded w-1/3" />
  </div>
);

export const AdminDashboardPage: React.FC = () => {
  const { orders, loading } = useData();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<{
    totalRevenue: number;
    totalNexusProfit: number;
    totalResellerProfit: number;
    activeOrders: number;
    totalOrders: number;
    resellerCount: number;
  } | null>(null);

  const [dailyMetrics, setDailyMetrics] = useState<
    { date: string; total_revenue: number; total_nexus_profit: number }[]
  >([]);
  const [ranking, setRanking] = useState<
    { rank: number; id: string; first_name: string; last_name: string; company_name: string; level: string; sales_count: number }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, d, r] = await Promise.all([
          analyticsService.getAdminMetrics(),
          analyticsService.getDailyMetrics(30),
          analyticsService.getRanking(),
        ]);
        setMetrics(m);
        setDailyMetrics(d);
        setRanking(r.slice(0, 5));
      } catch (err) {
        console.error('Error loading admin metrics:', err);
      }
    };
    load();
  }, []);

  const ordersByStatus = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    fill: STATUS_COLORS[status] || '#6b7280',
  }));

  const chartData = dailyMetrics.map((d) => ({
    date: d.date.slice(5),
    revenue: Number(d.total_revenue),
    profit: Number(d.total_nexus_profit),
  }));

  const recentOrders = orders.slice(0, 8);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="h-10 bg-white/[0.03] rounded w-80 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 animate-pulse rounded-2xl bg-white/[0.03]" />
            <div className="h-80 animate-pulse rounded-2xl bg-white/[0.03]" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Panel Administrativo</h1>
          <p className="text-gray-400">Resumen global de operaciones y control de plataforma</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={item}>
            <StatCard
              label="Ingresos Totales"
              value={`$${(metrics?.totalRevenue || 0).toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6 text-nexus-gold" />}
              subtext="Todos los pedidos"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Ganancia NEXUS"
              value={`$${(metrics?.totalNexusProfit || 0).toLocaleString()}`}
              icon={<Zap className="w-6 h-6 text-nexus-accent" />}
              subtext="Beneficio neto"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Pedidos Activos"
              value={metrics?.activeOrders || 0}
              icon={<AlertCircle className="w-6 h-6 text-orange-400" />}
              subtext="Requieren atencion"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Revendedores"
              value={metrics?.resellerCount || 0}
              icon={<Users className="w-6 h-6 text-blue-400" />}
              subtext="Total en plataforma"
            />
          </motion.div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Ingresos vs Ganancia (30 dias)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 14, 39, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#d4af37" dot={false} strokeWidth={2} name="Ingresos" />
                  <Line type="monotone" dataKey="profit" stroke="#00d4ff" dot={false} strokeWidth={2} name="Ganancia NEXUS" />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Distribucion de Pedidos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 14, 39, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </div>

        {/* Top 5 Resellers + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-nexus-gold" />
                  Top 5 Revendedores
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/resellers')}>
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {ranking.length > 0 ? ranking.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-nexus-gold/20 flex items-center justify-center border border-nexus-gold/30">
                        <span className="font-bold text-nexus-gold">#{r.rank}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {r.company_name || `${r.first_name} ${r.last_name}`}
                        </p>
                        <p className="text-sm text-gray-400">{r.sales_count} ventas</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      r.level === 'basic' ? 'bg-gray-500/20 text-gray-300' :
                      r.level === 'pro' ? 'bg-blue-500/20 text-blue-300' :
                      r.level === 'micro_brand' ? 'bg-nexus-gold/20 text-nexus-gold' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {r.level.toUpperCase()}
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">Sin datos de ranking</p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-nexus-accent" />
                  Pedidos Recientes
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {order.customer_name} - {order.product_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm font-bold text-white">${Number(order.total_price).toLocaleString()}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">Sin pedidos recientes</p>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-red-500/20 text-red-300',
    confirmed: 'bg-amber-500/20 text-amber-300',
    production: 'bg-yellow-500/20 text-yellow-300',
    finished: 'bg-purple-500/20 text-purple-300',
    shipped: 'bg-cyan-500/20 text-cyan-300',
    delivered: 'bg-green-500/20 text-green-300',
    cancelled: 'bg-gray-500/20 text-gray-300',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-300';
}
