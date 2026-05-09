import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard } from '../components/ui';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { analyticsService } from '../services/analytics';

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

const LEVEL_COLORS: Record<string, string> = {
  basic: 'bg-gray-500/20 text-gray-300',
  pro: 'bg-blue-500/20 text-blue-300',
  micro_brand: 'bg-nexus-gold/20 text-nexus-gold',
  distributor: 'bg-purple-500/20 text-purple-300',
};

const LEVEL_LABELS: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
  micro_brand: 'Micro Brand',
  distributor: 'Distributor',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const chartTooltipStyle = {
  backgroundColor: 'rgba(10, 14, 39, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
};

export const AdminAnalyticsPage: React.FC = () => {
  const { orders, loading } = useData();

  const [productMetrics, setProductMetrics] = useState<{ name: string; count: number; earnings: number }[]>([]);
  const [ranking, setRanking] = useState<{ rank: number; id: string; first_name: string; last_name: string; company_name: string; level: string; sales_count: number; xp: number }[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<{ date: string; total_orders: number; total_revenue: number; total_nexus_profit: number; total_reseller_profit: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, r, d] = await Promise.all([
          analyticsService.getProductMetrics(),
          analyticsService.getRanking(),
          analyticsService.getDailyMetrics(30),
        ]);
        setProductMetrics(p);
        setRanking(r);
        setDailyMetrics(d);
      } catch (err) {
        console.error('Error loading analytics:', err);
      }
    };
    load();
  }, []);

  // Status distribution from orders
  const statusStats = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    fill: STATUS_COLORS[status] || '#6b7280',
  }));

  // Monthly revenue chart from daily metrics
  const monthlyChartData = dailyMetrics.map((d) => ({
    date: d.date.slice(5),
    revenue: Number(d.total_revenue),
    nexus_profit: Number(d.total_nexus_profit),
    reseller_profit: Number(d.total_reseller_profit),
  }));

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="h-10 bg-white/[0.03] rounded w-80 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-white/[0.03] rounded-2xl animate-pulse" />
            <div className="h-80 bg-white/[0.03] rounded-2xl animate-pulse" />
          </div>
          <div className="h-80 bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Analiticas Avanzadas</h1>
          <p className="text-gray-400">Analisis completo del rendimiento de la plataforma</p>
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Bar Chart */}
          <motion.div variants={item}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Tipo de Productos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" fill="#d4af37" radius={[8, 8, 0, 0]} name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Status Pie Chart */}
          <motion.div variants={item}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Distribucion de Estados</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Revenue vs Costs Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Ingresos y Ganancias (30 dias)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#d4af37" dot={false} strokeWidth={2} name="Ingresos" />
                <Line type="monotone" dataKey="nexus_profit" stroke="#00d4ff" dot={false} strokeWidth={2} name="Ganancia NEXUS" />
                <Line type="monotone" dataKey="reseller_profit" stroke="#a855f7" dot={false} strokeWidth={2} name="Ganancia Revendedores" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Products Table + Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Resumen de Productos</h3>
              <div className="space-y-3">
                {productMetrics.length > 0 ? productMetrics.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.count} unidades</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-nexus-gold">${product.earnings.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Ingresos</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">Sin datos de productos</p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Ranking */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Ranking de Revendedores</h3>
              <div className="space-y-3">
                {ranking.length > 0 ? ranking.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-nexus-gold/10 flex items-center justify-center border border-nexus-gold/20">
                        <span className="text-xs font-bold text-nexus-gold">#{r.rank}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {r.company_name || `${r.first_name} ${r.last_name}`}
                        </p>
                        <p className="text-xs text-gray-500">{r.sales_count} ventas</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${LEVEL_COLORS[r.level] || LEVEL_COLORS.basic}`}>
                      {LEVEL_LABELS[r.level] || r.level}
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">Sin datos de ranking</p>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};
